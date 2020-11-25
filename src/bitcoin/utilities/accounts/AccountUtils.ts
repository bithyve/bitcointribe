import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import { xAccount, Transactions } from '../Interface';
import * as bitcoinJS from 'bitcoinjs-lib';
import config from '../../HexaConfig';
import axios, { AxiosResponse } from 'axios';
import { acc } from 'react-native-reanimated';

const deriveAddress = (
  keyPair: bip32.BIP32Interface,
  standard: number,
  network: bitcoinJS.Network,
): string => {
  if (standard === config.STANDARD.BIP44) {
    return bitcoinJS.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: network,
    }).address;
  } else if (standard === config.STANDARD.BIP49) {
    return bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }),
      network,
    }).address;
  } else if (standard === config.STANDARD.BIP84) {
    return bitcoinJS.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    }).address;
  }
};

export const getAddress = (
  internal: boolean,
  index: number,
  xpub: string,
  network?: bitcoinJS.Network,
): string => {
  const nw = network ? network : bitcoinJS.networks.bitcoin;
  const node = bip32.fromBase58(xpub, nw);
  return deriveAddress(
    node.derive(internal ? 1 : 0).derive(index),
    config.DPATH_PURPOSE,
    nw,
  );
};

export const generateExtendedKeys = (
  mnemonic,
  network,
  derivationPath,
  passphrase?,
): { xpriv: string; xpub: string } => {
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const root = bip32.fromSeed(seed, network);

  const xpriv_child = root.derivePath(derivationPath);
  const xpriv = xpriv_child.toBase58();

  const xpub_child = root.derivePath(derivationPath).neutered();
  const xpub = xpub_child.toBase58();

  return { xpriv, xpub };
};

export const syncBalanceUtxoTx = async (
  accounts: xAccount[],
  network: bitcoinJS.Network,
): Promise<xAccount[]> => {
  const accountsToAddressMapping = {};
  for (const account of accounts) {
    // await this.derivativeAccGapLimitCatchup(dAccountType, accountNumber);
    let {
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      accountId,
      gapLimit,
      primary_xpub,
    } = account;

    const externalAddresses = [];
    const internalAddresses = [];
    for (let itr = 0; itr < nextFreeAddressIndex + gapLimit; itr++) {
      externalAddresses.push(getAddress(false, itr, primary_xpub));
    }

    for (let itr = 0; itr < nextFreeChangeAddressIndex + gapLimit; itr++) {
      internalAddresses.push(getAddress(true, itr, primary_xpub));
    }

    accountsToAddressMapping[accountId] = {
      External: externalAddresses,
      Internal: internalAddresses,
    };
  }

  if (!Object.keys(accountsToAddressMapping).length) return;

  try {
    let res: AxiosResponse;
    if (network === bitcoinJS.networks.testnet) {
      res = await axios.post(
        config.ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
        accountsToAddressMapping,
      );
    } else {
      res = await axios.post(
        config.ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
        accountsToAddressMapping,
      );
    }

    let accountsToResponseMapping = res.data;
    if (!Object.keys(accountsToResponseMapping).length) return;

    for (let account of accounts) {
      const {
        accountId,
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
        accountInfo,
      } = account;

      const { accountType } = accountInfo;

      if (!accountsToResponseMapping[accountId]) continue;

      const { Utxos, Txs } = accountsToResponseMapping[accountId];
      if (!Utxos && !Txs) continue;

      const balances = {
        balance: 0,
        unconfirmedBalance: 0,
      };
      const externalAddresses = accountsToAddressMapping[accountId].External;
      const internalAddresses = accountsToAddressMapping[accountId].Internal;
      const addressInUse = [...externalAddresses, internalAddresses];
      const UTXOs = [];

      if (Utxos)
        for (const addressSpecificUTXOs of Utxos) {
          for (const utxo of addressSpecificUTXOs) {
            const { value, Address, status, vout, txid } = utxo;

            if (addressInUse.includes(Address)) {
              UTXOs.push({
                txId: txid,
                vout,
                value,
                address: Address,
                status,
              });

              if (status.confirmed) balances.balance += value;
              else if (internalAddresses.includes(Address))
                balances.balance += value;
              else balances.unconfirmedBalance += value;
            }
          }
        }

      const confirmedUTXOs = [];

      for (const utxo of UTXOs) {
        if (utxo.status) {
          if (utxo.status.confirmed) confirmedUTXOs.push(utxo);
          else {
            if (internalAddresses.includes(utxo.address)) {
              // defaulting utxo's on the change branch to confirmed
              confirmedUTXOs.push(utxo);
            }
          }
        } else {
          // utxo's from fallback won't contain status var (defaulting them as confirmed)
          confirmedUTXOs.push(utxo);
        }
      }

      const transactions: Transactions = {
        totalTransactions: 0,
        confirmedTransactions: 0,
        unconfirmedTransactions: 0,
        transactionDetails: [],
      };

      const addressesInfo = Txs;
      const txMap = new Map();

      let lastUsedAddressIndex = nextFreeAddressIndex - 1;
      let lastUsedChangeAddressIndex = nextFreeChangeAddressIndex - 1;

      if (addressesInfo)
        for (const addressInfo of addressesInfo) {
          if (addressInfo.TotalTransactions === 0) continue;

          transactions.totalTransactions += addressInfo.TotalTransactions;
          transactions.confirmedTransactions +=
            addressInfo.ConfirmedTransactions;
          transactions.unconfirmedTransactions +=
            addressInfo.UnconfirmedTransactions;

          addressInfo.Transactions.forEach((tx) => {
            if (!txMap.has(tx.txid)) {
              // check for duplicate tx (fetched against sending and  then again for change address)
              txMap.set(tx.txid, true);

              if (tx.transactionType === 'Self') {
                const outgoingTx = {
                  txid: tx.txid,
                  confirmations: tx.NumberofConfirmations,
                  status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                  fee: tx.fee,
                  date: tx.Status.block_time
                    ? new Date(tx.Status.block_time * 1000).toUTCString()
                    : new Date(Date.now()).toUTCString(),
                  transactionType: 'Sent',
                  amount: tx.SentAmount,
                  accountType,
                  recipientAddresses: tx.RecipientAddresses,
                  blockTime: tx.Status.block_time, // only available when tx is confirmed
                };

                const incomingTx = {
                  txid: tx.txid,
                  confirmations: tx.NumberofConfirmations,
                  status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                  fee: tx.fee,
                  date: tx.Status.block_time
                    ? new Date(tx.Status.block_time * 1000).toUTCString()
                    : new Date(Date.now()).toUTCString(),
                  transactionType: 'Received',
                  amount: tx.ReceivedAmount,
                  accountType,
                  senderAddresses: tx.SenderAddresses,
                  blockTime: tx.Status.block_time, // only available when tx is confirmed
                };
                // console.log({ outgoingTx, incomingTx });
                transactions.transactionDetails.push(
                  ...[outgoingTx, incomingTx],
                );
              } else {
                const transaction = {
                  txid: tx.txid,
                  confirmations:
                    accountType === 'Test Account' &&
                    tx.TransactionType === 'Received' &&
                    addressInfo.Address === externalAddresses[0] &&
                    tx.NumberofConfirmations < 1
                      ? '-'
                      : tx.NumberofConfirmations,
                  status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                  fee: tx.fee,
                  date: tx.Status.block_time
                    ? new Date(tx.Status.block_time * 1000).toUTCString()
                    : new Date(Date.now()).toUTCString(),
                  transactionType: tx.TransactionType,
                  amount: tx.Amount,
                  accountType,
                  recipientAddresses: tx.RecipientAddresses,
                  senderAddresses: tx.SenderAddresses,
                  blockTime: tx.Status.block_time, // only available when tx is confirmed
                };

                transactions.transactionDetails.push(transaction);
              }
            }
          });

          const addressIndex = externalAddresses.indexOf(addressInfo.Address);
          if (addressIndex > -1) {
            lastUsedAddressIndex =
              addressIndex > lastUsedAddressIndex
                ? addressIndex
                : lastUsedAddressIndex;
          } else {
            const changeAddressIndex = internalAddresses.indexOf(
              addressInfo.Address,
            );
            if (changeAddressIndex > -1) {
              lastUsedChangeAddressIndex =
                changeAddressIndex > lastUsedChangeAddressIndex
                  ? changeAddressIndex
                  : lastUsedChangeAddressIndex;
            }
          }
        }

      account = {
        ...account,
        confirmedUTXOs,
        balances,
        transactions,
        nextFreeAddressIndex: lastUsedAddressIndex + 1,
        nextFreeChangeAddressIndex: lastUsedChangeAddressIndex + 1,
        receivingAddress: getAddress(
          false,
          lastUsedAddressIndex + 1,
          account.primary_xpub,
        ),
      };
    }

    return accounts;
  } catch (err) {
    throw new Error('Fetching balance-utxo-txn failed');
  }
};
