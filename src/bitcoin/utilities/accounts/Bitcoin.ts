import axios, { AxiosResponse } from 'axios';
import bip21 from 'bip21';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bip65 from 'bip65';
import Client from 'bitcoin-core';
import * as bitcoinJS from 'bitcoinjs-lib';
import config from '../../HexaConfig';
import { Transactions } from '../Interface';
import bs58check from 'bs58check';
import { TRUSTED_CONTACTS } from '../../../common/constants/serviceTypes';

const { API_URLS, REQUEST_TIMEOUT } = config;
const { TESTNET, MAINNET } = API_URLS;

const bitcoinAxios = axios.create({ timeout: REQUEST_TIMEOUT });
export default class Bitcoin {
  public network: bitcoinJS.Network;
  public client: Client;
  public isTest: boolean = false; // flag for test account
  constructor(network?: bitcoinJS.Network) {
    if (network) this.isTest = true;
    this.network = network ? network : config.NETWORK;
    this.client = config.BITCOIN_NODE;
  }

  public getKeyPair = (privateKey: string): bitcoinJS.ECPairInterface =>
    bitcoinJS.ECPair.fromWIF(privateKey, this.network);

  public utcNow = (): number => Math.floor(Date.now() / 1000);

  public getAddress = (
    keyPair: bip32.BIP32Interface,
    standard: number,
  ): string => {
    if (standard === config.STANDARD.BIP44) {
      return bitcoinJS.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      }).address;
    } else if (standard === config.STANDARD.BIP49) {
      return bitcoinJS.payments.p2sh({
        redeem: bitcoinJS.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network: this.network,
        }),
        network: this.network,
      }).address;
    } else if (standard === config.STANDARD.BIP84) {
      return bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      }).address;
    }
  };

  public xpubToYpub = (xpub?, xpriv?, network = bitcoinJS.networks.bitcoin) => {
    let data = bs58check.decode(xpub || xpriv);
    data = data.slice(4);
    let versionBytes;
    if (network == bitcoinJS.networks.bitcoin) {
      versionBytes = xpub ? '049d7cb2' : '049d7878';
    } else {
      versionBytes = xpub ? '044a5262' : '044a4e28';
    }
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data]);
    return bs58check.encode(data);
  };

  // public getAddress = (keyPair: ECPair): string =>
  //   bitcoinJS.payments.p2pkh({ pubkey: keyPair.publicKey }).address

  public generateHDWallet = (
    mnemonic: string,
    passphrase?: string,
  ): {
    mnemonic: string;
    keyPair: bip32.BIP32Interface;
    address: string;
    privateKey: string;
  } => {
    // generates a HD-Wallet from the provided mnemonic-passphrase pair

    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }

    const seed: Buffer = passphrase
      ? bip39.mnemonicToSeedSync(mnemonic, passphrase)
      : bip39.mnemonicToSeedSync(mnemonic);
    const path: string = "m/44'/1'/0'/0/0";
    const root = bip32.fromSeed(seed, this.network);
    const child1 = root.derivePath(path);

    const privateKey = child1.toWIF();
    const address = this.getAddress(child1, config.STANDARD.BIP49);

    console.log(`Mnemonic: ${mnemonic}`);
    console.log(`Address: ${address}`);

    return {
      mnemonic,
      keyPair: child1,
      address,
      privateKey,
    };
  };

  public createHDWallet = (
    passphrase?: string,
  ): {
    mnemonic: string;
    keyPair: bip32.BIP32Interface;
    address: string;
    privateKey: string;
  } => {
    // creates a new HD Wallet

    const mnemonic = bip39.generateMnemonic(256);
    return this.generateHDWallet(mnemonic, passphrase);
  };

  public getP2SH = (keyPair: bitcoinJS.ECPairInterface): bitcoinJS.Payment =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      }),
      network: this.network,
    });

  public getBalance = async (
    address: string,
  ): Promise<
    | {
        status: number;
        errorMessage: string;
        balanceData?: undefined;
      }
    | {
        status: number;
        balanceData: any;
        errorMessage?: undefined;
      }
  > => {
    // fetches balance corresponding to the supplied address

    let res: AxiosResponse;
    if (this.network === bitcoinJS.networks.testnet) {
      try {
        res = await bitcoinAxios.get(
          `${TESTNET.BALANCE_CHECK}${address}/balance?token=${config.TOKEN}`,
        );
      } catch (err) {
        console.log('Error:', err.response.data);
        return {
          status: err.response.status,
          errorMessage: err.response.data,
        };
      }
    } else {
      // throttled endPoint (required: full node/corresponding paid service));
      try {
        res = await bitcoinAxios.get(
          `${MAINNET.BALANCE_CHECK}${address}/balance?token=${config.TOKEN}`,
        );
      } catch (err) {
        console.log('Error:', err.response.data);
        return {
          status: err.response.status,
          errorMessage: err.response.data,
        };
      }
    }

    return {
      status: res.status,
      balanceData: res.data,
    };
  };

  public blockcypherBalFallback = async (
    addresses: string[],
  ): Promise<{
    bal: number;
    unconfirmedBal: number;
  }> => {
    let bal = 0;
    let unconfirmedBal = 0;
    for (const addr of addresses) {
      const { balanceData } = await this.getBalance(addr);
      bal += balanceData.balance;
      unconfirmedBal += balanceData.unconfirmed_balance;
    }

    return { bal, unconfirmedBal };
  };

  public getBalanceByAddresses = async (
    addresses: string[],
  ): Promise<{
    balance: number;
    unconfirmedBalance: number;
  }> => {
    let res: AxiosResponse;
    try {
      if (this.network === bitcoinJS.networks.testnet) {
        // throw new Error("fabricated error");
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.MULTIBALANCE,
          {
            addresses,
          },
        );
      } else {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.MULTIBALANCE,
          {
            addresses,
          },
        );
      }

      return {
        balance: res.data.Balance,
        unconfirmedBalance: res.data.UnconfirmedBalance,
      };
    } catch (err) {
      console.log(
        `An error occurred while fetching balance via Esplora: ${err.response.data.err}`,
      );
      console.log('Using Blockcypher fallback');
      try {
        const { bal, unconfirmedBal } = await this.blockcypherBalFallback(
          addresses,
        );
        return {
          balance: bal,
          unconfirmedBalance: unconfirmedBal,
        };
      } catch (err) {
        console.log('Blockcypher fallback failed aswell!');
        throw new Error('fetching balance by addresses failed');
      }
    }
  };

  public fetchAddressInfo = async (address: string): Promise<any> => {
    // fetches information corresponding to the  supplied address (including txns)
    if (this.network === bitcoinJS.networks.testnet) {
      return await bitcoinAxios.get(
        `${TESTNET.BASE}/addrs/${address}/full?token=${config.TOKEN}`,
      );
    } else {
      return await bitcoinAxios.get(
        `${MAINNET.BASE}/addrs/${address}/full?token=${config.TOKEN}`,
      );
    }
  };

  public fetchBalanceTransactionsByAddresses = async (
    externalAddresses: string[],
    internalAddresses: string[],
    ownedAddresses: string[],
    lastUsedAddressIndex: number,
    accountType: string,
    contactName?: string,
  ): Promise<{
    balances: { balance: number; unconfirmedBalance: number };
    transactions: Transactions;
    nextFreeAddressIndex: number;
  }> => {
    let res: AxiosResponse;
    try {
      if (this.network === bitcoinJS.networks.testnet) {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.MULTIUTXOTXN,
          {
            addresses: [...externalAddresses, ...internalAddresses],
          },
        );
      } else {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.MULTIUTXOTXN,
          {
            addresses: [...externalAddresses, ...internalAddresses],
          },
        );
      }

      const { Utxos, Txs } = res.data;
      let balances = {
        balance: 0,
        unconfirmedBalance: 0,
      };

      for (const addressSpecificUTXOs of Utxos) {
        for (const utxo of addressSpecificUTXOs) {
          const { value, Address, status } = utxo;
          if (status.confirmed) balances.balance += value;
          else if (
            internalAddresses.length &&
            internalAddresses.includes(Address)
          )
            balances.balance += value;
          else balances.unconfirmedBalance += value;
        }
      }

      const transactions: Transactions = {
        totalTransactions: 0,
        confirmedTransactions: 0,
        unconfirmedTransactions: 0,
        transactionDetails: [],
      };

      const addressesInfo = Txs;
      console.log({ addressesInfo });
      const txMap = new Map();

      for (const addressInfo of addressesInfo) {
        if (addressInfo.TotalTransactions === 0) {
          continue;
        }
        transactions.totalTransactions += addressInfo.TotalTransactions;
        transactions.confirmedTransactions += addressInfo.ConfirmedTransactions;
        transactions.unconfirmedTransactions +=
          addressInfo.UnconfirmedTransactions;

        addressInfo.Transactions.forEach((tx) => {
          if (!txMap.has(tx.txid)) {
            // check for duplicate tx (fetched against sending and  then again for change address)
            txMap.set(tx.txid, true);
            this.categorizeTx(tx, ownedAddresses, accountType);
            const transaction = {
              txid: tx.txid,
              confirmations: tx.NumberofConfirmations,
              status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
              fee: tx.fee,
              date: tx.Status.block_time
                ? new Date(tx.Status.block_time * 1000).toUTCString()
                : new Date(Date.now()).toUTCString(),
              transactionType:
                tx.transactionType === 'Self' ? 'Sent' : tx.transactionType, // injecting sent(1) tx when tx is from and to self
              amount: tx.amount,
              accountType:
                tx.accountType === TRUSTED_CONTACTS
                  ? contactName
                      .split(' ')
                      .map((word) => word[0].toUpperCase() + word.substring(1))
                      .join(' ')
                  : tx.accountType,
              recipientAddresses: tx.recipientAddresses,
              senderAddresses:
                tx.transactionType === 'Self' ? [] : tx.senderAddresses,
              blockTime: tx.Status.block_time, // only available when tx is confirmed
            };

            transactions.transactionDetails.push(transaction);

            // if (tx.transactionType === 'Self') {
            //   // injecting receive(2) tx when tx is from and to self
            //   const txObj2 = {
            //     ...txObj,
            //     transactionType: 'Received',
            //     recipientAddresses: [],
            //     senderAddresses: tx.senderAddresses,
            //   };

            //   transactions.transactionDetails.push(txObj2);
            // }
          }
        });

        const addressIndex = externalAddresses.indexOf(addressInfo.Address);
        if (addressIndex > -1) {
          lastUsedAddressIndex =
            addressIndex > lastUsedAddressIndex
              ? addressIndex
              : lastUsedAddressIndex;
        }
      }

      return {
        balances,
        transactions,
        nextFreeAddressIndex: lastUsedAddressIndex + 1,
      };
    } catch (err) {
      console.log(
        `An error occurred while fetching balance-txnn via Esplora: ${err.response.data.err}`,
      );
      throw new Error('Fetching balance-txn by addresses failed');
    }
  };

  public fetchTransactionsByAddress = async (
    address: string,
  ): Promise<
    | {
        status: number;
        transactions: {
          totalTransactions: number;
          confirmedTransactions: number;
          unconfirmedTransactions: number;
          transactionDetails: any[];
          address: string;
        };
        errorMessage?: undefined;
      }
    | {
        status: number;
        errorMessage: string;
        transactions?: undefined;
      }
  > => {
    let res: AxiosResponse;
    try {
      res = await this.fetchAddressInfo(address);
    } catch (err) {
      return {
        status: err.response.status,
        errorMessage: err.response.data,
      };
    }

    const { final_n_tx, n_tx, unconfirmed_n_tx, txs } = res.data;

    return {
      status: res.status,
      transactions: {
        totalTransactions: final_n_tx,
        confirmedTransactions: n_tx,
        unconfirmedTransactions: unconfirmed_n_tx,
        transactionDetails: txs,
        address,
      },
    };
  };

  public fetchTransactionsByAddresses = async (
    addresses: string[],
    accountType: string,
  ): Promise<{
    transactions: Transactions;
  }> => {
    const transactions: Transactions = {
      totalTransactions: 0,
      confirmedTransactions: 0,
      unconfirmedTransactions: 0,
      transactionDetails: [],
    };
    try {
      let res: AxiosResponse;
      try {
        if (this.network === bitcoinJS.networks.testnet) {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.TESTNET.MULTITXN,
            {
              addresses,
            },
          );
        } else {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.MAINNET.MULTITXN,
            {
              addresses,
            },
          );
        }
      } catch (err) {
        throw new Error(err.response.data.err);
      }

      const addressesInfo = res.data;
      const txMap = new Map();
      for (const addressInfo of addressesInfo) {
        console.log(
          `Appending transactions corresponding to ${addressInfo.Address}`,
        );
        if (addressInfo.TotalTransactions === 0) {
          continue;
        }
        transactions.confirmedTransactions += addressInfo.ConfirmedTransactions;
        transactions.unconfirmedTransactions +=
          addressInfo.UnconfirmedTransactions;

        if (
          addressInfo.ConfirmedTransactions +
            addressInfo.UnconfirmedTransactions >
          addressInfo.totalTransactions
        ) {
          transactions.totalTransactions +=
            addressInfo.ConfirmedTransactions +
            addressInfo.UnconfirmedTransactions;
        } else {
          transactions.totalTransactions += addressInfo.TotalTransactions;
        }

        addressInfo.Transactions.forEach((tx) => {
          if (!txMap.has(tx.txid)) {
            // check for duplicate tx (fetched against sending and  then again for change address)
            txMap.set(tx.txid, true);
            this.categorizeTx(tx, addresses, accountType);
            transactions.transactionDetails.push({
              txid: tx.txid,
              confirmations: tx.NumberofConfirmations,
              status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
              fee: tx.fee,
              date: tx.Status.block_time
                ? new Date(tx.Status.block_time * 1000).toUTCString()
                : new Date(Date.now()).toUTCString(),
              transactionType: tx.transactionType,
              amount: tx.amount,
              accountType: tx.accountType,
              recipientAddresses: tx.recipientAddresses,
              senderAddresses: tx.senderAddresses,
              blockTime: tx.Status.block_time, // only available when tx is confirmed
            });
          }
        });
      }

      return { transactions };
    } catch (err) {
      console.log(
        `An error occurred while fetching transactions via Esplora Wrapper: ${err}`,
      );
      console.log('Using Blockcypher fallback');

      try {
        const txMap = new Map();
        for (const address of addresses) {
          console.log(`Fetching transactions corresponding to ${address}`);
          const txns = await this.fetchTransactionsByAddress(address);

          transactions.totalTransactions += txns.transactions.totalTransactions;
          transactions.confirmedTransactions +=
            txns.transactions.confirmedTransactions;
          transactions.unconfirmedTransactions +=
            txns.transactions.unconfirmedTransactions;

          txns.transactions.transactionDetails.forEach((tx) => {
            if (!txMap.has(tx.hash)) {
              // check for duplicate tx (fetched against sending and  then again for change address)
              txMap.set(tx.hash, true);
              this.categorizeTx(tx, addresses, accountType),
                transactions.transactionDetails.push({
                  txid: tx.hash,
                  confirmations: tx.confirmations,
                  status: tx.confirmations ? 'Confirmed' : 'Unconfirmed',
                  fee: tx.fees,
                  date: new Date(tx.confirmed).toUTCString(),
                  transactionType: tx.transactionType,
                  amount: tx.amount,
                  accountType: tx.accountType,
                  recipientAddresses: tx.recipientAddresses,
                  senderAddresses: tx.senderAddresses,
                });
            }
          });
        }

        return { transactions };
      } catch (err) {
        console.log(
          `An error occurred while fetching transactions via Blockcypher fallback as well: ${err}`,
        );
        throw new Error('Transaction fetching failed');
      }
    }
  };

  public getTxCounts = async (addresses: string[]) => {
    const txCounts = {};
    try {
      let res: AxiosResponse;
      try {
        if (this.network === bitcoinJS.networks.testnet) {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.TESTNET.MULTITXN,
            {
              addresses,
            },
          );
        } else {
          res = await bitcoinAxios.post(
            config.ESPLORA_API_ENDPOINTS.MAINNET.MULTITXN,
            {
              addresses,
            },
          );
        }
      } catch (err) {
        throw new Error(err.response.data.err);
      }

      const addressesInfo = res.data;
      for (const addressInfo of addressesInfo) {
        txCounts[addressInfo.Address] = addressInfo.TotalTransactions;
      }

      return txCounts;
    } catch (err) {
      console.log(
        `An error occurred while fetching transactions via Esplora Wrapper: ${err}`,
      );
      console.log('Using Blockcypher fallback');

      try {
        for (const address of addresses) {
          const txns = await this.fetchTransactionsByAddress(address);
          txCounts[address] = txns.transactions.totalTransactions;
        }
        return txCounts;
      } catch (err) {
        console.log(
          `An error occurred while fetching transactions via Blockcypher fallback as well: ${err}`,
        );
        throw new Error('Transaction fetching failed');
      }
    }
  };

  // public fundTestNetAddress = async (address: string) => {
  //   const funderAddress = '2N6aazKqLgqBRLisjeEU1DoLuieoZbDmiB8';
  //   const funderPriv = 'cSB5QV1Tesqtou1FDZhgfKYiEH4m55H1jT1xM8hu9xKNzWSFFgAR';
  //   const { balanceData } = await this.getBalance(funderAddress);
  //   const { final_balance } = balanceData;
  //   if (final_balance < 7000) {
  //     throw new Error('Funding address is out of funds');
  //   }
  //   const transfer = {
  //     senderAddress: funderAddress,
  //     recipientAddress: address,
  //     amount: 6000,
  //   };

  //   const txnObj = await this.createTransaction(
  //     transfer.senderAddress,
  //     transfer.recipientAddress,
  //     transfer.amount,
  //   );
  //   console.log('---- Transaction Created ----');

  //   const keyPair = this.getKeyPair(funderPriv);
  //   const p2sh = this.getP2SH(keyPair);
  //   const txb = this.signTransaction(
  //     txnObj.inputs,
  //     txnObj.txb,
  //     [keyPair],
  //     p2sh.redeem.output,
  //   );
  //   console.log('---- Transaction Signed ----');

  //   const txHex = txb.build().toHex();
  //   const res = await this.broadcastTransaction(txHex);
  //   console.log('---- Transaction Broadcasted ----');
  //   return res;
  // };

  public generateMultiSig = (
    required: number,
    pubKeys: any[],
  ): {
    p2wsh: bitcoinJS.Payment;
    p2sh: bitcoinJS.Payment;
    address: string;
  } => {
    // generic multiSig address generator

    if (required <= 0 || required > pubKeys.length) {
      throw new Error('Inappropriate value for required param');
    }
    // if (!network) network = bitcoinJS.networks.bitcoin;
    const pubkeys = pubKeys.map((hex) => Buffer.from(hex, 'hex'));

    const p2ms = bitcoinJS.payments.p2ms({
      m: required,
      pubkeys,
      network: this.network,
    });
    const p2wsh = bitcoinJS.payments.p2wsh({
      redeem: p2ms,
      network: this.network,
    });
    const p2sh = bitcoinJS.payments.p2sh({
      redeem: p2wsh,
      network: this.network,
    });

    return {
      p2wsh,
      p2sh,
      address: p2sh.address,
    };
  };

  public fetchChainInfo = async (): Promise<any> => {
    // provides transition fee rate (satoshis/kilobyte)
    // bitcoinfees endpoint: https://bitcoinfees.earn.com/api/v1/fees/recommended (provides time estimates)

    try {
      if (this.network === bitcoinJS.networks.testnet) {
        const { data } = await bitcoinAxios.get(
          `${TESTNET.BASE}?token=${config.TOKEN}`,
        );
        return data;
      } else {
        const { data } = await bitcoinAxios.get(
          `${MAINNET.BASE}?token=${config.TOKEN}`,
        );
        return data;
      }
    } catch (err) {
      throw new Error('Failed to fetch chain info');
    }
  };

  public fetchUnspentOutputs = async (
    address: string,
  ): Promise<
    Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>
  > => {
    let data;
    if (this.network === bitcoinJS.networks.testnet) {
      const res: AxiosResponse = await bitcoinAxios.get(
        `${TESTNET.UNSPENT_OUTPUTS}${address}?unspentOnly=true&token=${config.TOKEN}`,
      );
      data = res.data;
    } else {
      const res: AxiosResponse = await bitcoinAxios.get(
        `${MAINNET.UNSPENT_OUTPUTS}${address}?unspentOnly=true&token=${config.TOKEN}`,
      );
      data = res.data;
    }

    let unspentOutputs = [];
    if (data.txrefs) {
      unspentOutputs.push(...data.txrefs);
    }
    if (data.unconfirmed_txrefs) {
      unspentOutputs.push(...data.unconfirmed_txrefs);
    }
    if (unspentOutputs.length === 0) {
      return [];
    }

    unspentOutputs = unspentOutputs.map((unspent) => ({
      txId: unspent.tx_hash,
      vout: unspent.tx_output_n,
      value: unspent.value,
      address,
    }));
    return unspentOutputs;
  };

  public blockcypherUTXOFallback = async (
    addresses: string[],
  ): Promise<
    Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>
  > => {
    const UTXOs = [];
    // tslint:disable-next-line:forin
    for (const address of addresses) {
      console.log(`Fetching utxos corresponding to ${address}`);
      const utxos = await this.fetchUnspentOutputs(address);
      UTXOs.push(...utxos);
    }
    return UTXOs;
  };

  public multiFetchUnspentOutputs = async (
    addresses: string[],
  ): Promise<{
    UTXOs: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
      status?: any;
    }>;
  }> => {
    try {
      let data;
      if (this.network === bitcoinJS.networks.testnet) {
        const res: AxiosResponse = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.MULTIUTXO,
          { addresses },
        );
        data = res.data;
      } else {
        const res: AxiosResponse = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.MULTIUTXO,
          { addresses },
        );
        data = res.data;
      }
      const UTXOs = [];
      for (const addressSpecificUTXOs of data) {
        for (const utxo of addressSpecificUTXOs) {
          const { txid, vout, value, Address, status } = utxo;
          UTXOs.push({
            txId: txid,
            vout,
            value,
            address: Address,
            status,
          });
        }
      }
      return { UTXOs };
    } catch (err) {
      console.log(`An error occurred while connecting to Esplora: ${err}`);
      console.log('Switching to Blockcypher UTXO fallback');

      try {
        const UTXOs = await this.blockcypherUTXOFallback(addresses);
        return { UTXOs };
      } catch (err) {
        console.log(
          `Blockcypher UTXO fallback failed with the following error: ${err}`,
        );
        throw new Error('multi utxo fetch failed');
      }
    }
  };

  public fetchTransactionDetails = async (txID: string): Promise<any> => {
    try {
      let data;
      if (this.network === bitcoinJS.networks.testnet) {
        const res: AxiosResponse = await bitcoinAxios.get(
          config.ESPLORA_API_ENDPOINTS.TESTNET.TXNDETAILS + `/${txID}`,
        );
        data = res.data;
      } else {
        const res: AxiosResponse = await bitcoinAxios.get(
          config.ESPLORA_API_ENDPOINTS.MAINNET.TXNDETAILS + `/${txID}`,
        );
        data = res.data;
      }

      return data;
    } catch (err) {
      console.log(
        `An error occurred while fetching transaction details from Esplora: ${err}`,
      );
      console.log('Switching to Blockcypher fallback');
      let data;
      try {
        if (this.network === bitcoinJS.networks.testnet) {
          const res = await bitcoinAxios.get(`${TESTNET.BASE}/txs/${txID}`);
          data = res.data;
        } else {
          const res = await bitcoinAxios.get(`${MAINNET.BASE}/txs/${txID}`);
          data = res.data;
        }
        return data;
      } catch (err) {
        console.log(
          `Blockcypher fetch txn details fallback failed with the following error: ${err}`,
        );
        throw new Error('fetch transaction detaisl failed');
      }
    }
  };

  public feeRatesPerByte = async (): Promise<{
    high: { feePerByte: number; estimatedBlocks: number };
    medium: { feePerByte: number; estimatedBlocks: number };
    low: { feePerByte: number; estimatedBlocks: number };
  }> => {
    try {
      let rates;
      if (this.network === bitcoinJS.networks.testnet) {
        const res: AxiosResponse = await bitcoinAxios.get(
          config.ESPLORA_API_ENDPOINTS.TESTNET.TXN_FEE,
        );
        rates = res.data;
      } else {
        const res: AxiosResponse = await bitcoinAxios.get(
          config.ESPLORA_API_ENDPOINTS.MAINNET.TXN_FEE,
        );
        rates = res.data;
      }

      const high = {
        feePerByte: Math.round(rates['2'] + rates['3']) / 2,
        estimatedBlocks: 3,
      }; // high: within 3 blocks

      const medium = {
        feePerByte: Math.round((rates['4'] + rates['5'] + rates['6']) / 3),
        estimatedBlocks: 8,
      }; // medium: within 8 blocks

      const low = {
        feePerByte: Math.round((rates['6'] + rates['10'] + rates['20']) / 3),
        estimatedBlocks: 12,
      }; // low: within 12 blocks

      const feeRatesByPriority = {
        high,
        medium,
        low,
      };

      return feeRatesByPriority;
    } catch (err) {
      console.log(
        `Fee rates fetching failed @Bitcoin core: ${err}, using blockcypher fallback`,
      );
      try {
        const chainInfo = await this.fetchChainInfo();
        const {
          high_fee_per_kb,
          medium_fee_per_kb,
          low_fee_per_kb,
        } = chainInfo;

        const high = {
          feePerByte: Math.round(high_fee_per_kb / 1000),
          estimatedBlocks: 2,
        };
        const medium = {
          feePerByte: Math.round(medium_fee_per_kb / 1000),
          estimatedBlocks: 4,
        };
        const low = {
          feePerByte: Math.round(low_fee_per_kb / 1000),
          estimatedBlocks: 6,
        };

        const feeRatesByPriority = {
          high,
          medium,
          low,
        };
        return feeRatesByPriority;
      } catch (err) {
        throw new Error('Falied to fetch feeRates');
      }
    }
  };

  public averageTransactionFee = async () => {
    const averageTxSize = 226; // the average Bitcoin transaction is about 226 bytes in size (1 Inp (148); 2 Out)
    // const inputUTXOSize = 148; // in bytes (in accordance with coinselect lib)

    const feeRatesByPriority = await this.feeRatesPerByte();

    return {
      high: {
        averageTxFee: Math.round(
          averageTxSize * feeRatesByPriority['high'].feePerByte,
        ),
        feePerByte: feeRatesByPriority['high'].feePerByte,
        estimatedBlocks: feeRatesByPriority['high'].estimatedBlocks,
      },
      medium: {
        averageTxFee: Math.round(
          averageTxSize * feeRatesByPriority['medium'].feePerByte,
        ),
        feePerByte: feeRatesByPriority['medium'].feePerByte,
        estimatedBlocks: feeRatesByPriority['medium'].estimatedBlocks,
      },
      low: {
        averageTxFee: Math.round(
          averageTxSize * feeRatesByPriority['low'].feePerByte,
        ),
        feePerByte: feeRatesByPriority['low'].feePerByte,
        estimatedBlocks: feeRatesByPriority['low'].estimatedBlocks,
      },
    };
  };

  public isValidAddress = (address: string): boolean => {
    try {
      bitcoinJS.address.toOutputScript(address, this.network);
      return true;
    } catch (err) {
      return false;
    }
  };

  public isPaymentURI = (paymentURI: string): boolean => {
    if (paymentURI.slice(0, 8) === 'bitcoin:') {
      return true;
    }
    return false;
  };

  public addressDiff = (
    scannedStr: string,
  ): {
    type: string;
  } => {
    if (this.isPaymentURI(scannedStr)) {
      const { address } = this.decodePaymentURI(scannedStr);
      if (this.isValidAddress(address)) return { type: 'paymentURI' };
    } else if (this.isValidAddress(scannedStr)) {
      return { type: 'address' };
    }
    return { type: null };
  };

  // public createTransaction = async (
  //   senderAddress: string,
  //   recipientAddress: string,
  //   amount: number,
  //   nSequence?: number,
  //   txnPriority?: string,
  // ): Promise<{
  //   inputs: object[];
  //   txb: bitcoinJS.TransactionBuilder;
  //   fee: number;
  // }> => {
  //   console.log({ senderAddress });
  //   const res = await this.multiFetchUnspentOutputs([senderAddress]);
  //   const inputUTXOs = res.UTXOs;
  //   console.log('Fetched the inputs');
  //   const outputUTXOs = [{ address: recipientAddress, value: amount }];

  //   const { feePerByte } = await this.feeRatesPerByte(txnPriority);

  //   const { inputs, outputs, fee } = coinselect(
  //     inputUTXOs,
  //     outputUTXOs,
  //     feePerByte,
  //   );
  //   console.log('-------Transaction--------');
  //   console.log('\tFee', fee);
  //   console.log('\tInputs:', inputs);
  //   console.log('\tOutputs:', outputs);

  //   const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
  //     this.network,
  //   );

  //   inputs.forEach(input => txb.addInput(input.txId, input.vout, nSequence));
  //   outputs.forEach(output => {
  //     if (!output.address) {
  //       output.address = senderAddress;
  //     }
  //     console.log('Added Output:', output);
  //     txb.addOutput(output.address, output.value);
  //   });

  //   return {
  //     inputs,
  //     txb,
  //     fee,
  //   };
  // };

  public signTransaction = (
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
    keyPairs: bitcoinJS.ECPairInterface[],
    redeemScript: any,
    witnessScript?: any,
  ): bitcoinJS.TransactionBuilder => {
    console.log('------ Transaction Signing ----------');
    let vin = 0;
    inputs.forEach((input) => {
      console.log('Signing Input:', input);
      keyPairs.forEach((keyPair) => {
        txb.sign(
          vin,
          keyPair,
          redeemScript, // multiSig.p2sh.redeem.output
          null,
          input.value,
          witnessScript, // multiSig.p2wsh.redeem.output
        );
      });
      vin += 1;
    });

    return txb;
  };

  public signPartialTxn = (
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
    keyPairs: bitcoinJS.ECPairInterface[],
    redeemScript: any,
    witnessScript?: any,
  ): bitcoinJS.Transaction => {
    let vin = 0;
    inputs.forEach((input) => {
      keyPairs.forEach((keyPair) => {
        txb.sign(
          vin,
          keyPair,
          redeemScript, // multiSig.p2sh.redeem.output
          null,
          input.value,
          witnessScript, // multiSig.p2wsh.redeem.output
        );
      });
      vin += 1;
    });

    const txHex = txb.buildIncomplete();
    return txHex;
  };

  public broadcastTransaction = async (
    txHex: string,
  ): Promise<{
    txid: string;
  }> => {
    try {
      let res: AxiosResponse;
      if (this.network === bitcoinJS.networks.testnet) {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.BROADCAST_TX,
          txHex,
          {
            headers: { 'Content-Type': 'text/plain' },
          },
        );
      } else {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX,
          txHex,
          {
            headers: { 'Content-Type': 'text/plain' },
          },
        );
      }
      return { txid: res.data };
    } catch (err) {
      console.log(
        `An error occurred while broadcasting through BitHyve Node. Using the fallback mechanism. ${err}`,
      );
      try {
        let res: AxiosResponse;
        if (this.network === bitcoinJS.networks.testnet) {
          res = await bitcoinAxios.post(TESTNET.BROADCAST, { hex: txHex });
        } else {
          res = await bitcoinAxios.post(MAINNET.BROADCAST, { hex: txHex });
        }

        const { txid } = res.data;
        return {
          txid,
        };
      } catch (err) {
        console.log(err.message);
        throw new Error('Transaction broadcasting failed');
      }
    }
  };

  public estimateSmartFee = async (
    blockNo: number,
  ): Promise<{ feerate: number; blocks: number }> => {
    try {
      const res = await this.client.estimateSmartFee(blockNo);
      return { feerate: res.feerate, blocks: res.blocks };
    } catch (err) {
      throw new Error('Failed to fetch transaction fee');
    }
  };

  public decodeTransaction = async (txHash: string): Promise<void> => {
    if (this.network === bitcoinJS.networks.testnet) {
      const { data } = await bitcoinAxios.post(TESTNET.TX_DECODE, {
        hex: txHash,
      });
      console.log(JSON.stringify(data, null, 4));
    } else {
      const { data } = await bitcoinAxios.post(MAINNET.TX_DECODE, {
        hex: txHash,
      });
      console.log(JSON.stringify(data, null, 4));
    }
  };

  public recoverInputsFromTxHex = async (
    txHex: string,
  ): Promise<Array<{ txId: string; vout: number; value: number }>> => {
    const regenTx: bitcoinJS.Transaction = bitcoinJS.Transaction.fromHex(txHex);
    const recoveredInputs = [];
    await Promise.all(
      regenTx.ins.map(async (inp) => {
        const txId = inp.hash.toString('hex').match(/.{2}/g).reverse().join('');
        const vout = inp.index;
        const data = await this.fetchTransactionDetails(txId);
        const value = data.outputs[vout].value;
        recoveredInputs.push({ txId, vout, value });
      }),
    );
    return recoveredInputs;
  };

  public fromOutputScript = (output: Buffer): string => {
    return bitcoinJS.address.fromOutputScript(output, this.network);
  };

  public cltvCheckSigOutput = (
    keyPair: bitcoinJS.ECPairInterface,
    lockTime: number,
  ): Buffer => {
    return bitcoinJS.script.compile([
      bitcoinJS.script.number.encode(lockTime),
      bitcoinJS.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoinJS.opcodes.OP_DROP,
      keyPair.publicKey,
      bitcoinJS.opcodes.OP_CHECKSIG,
    ]);
  };

  public createTLC = async (
    keyPair: bitcoinJS.ECPairInterface,
    time: number,
    blockHeight: number,
  ): Promise<{
    address: string;
    lockTime: number;
  }> => {
    let lockTime: any;
    if (time && blockHeight) {
      throw new Error("You can't specify time and block height together");
    } else if (time) {
      lockTime = bip65.encode({ utc: this.utcNow() + time }); // time should be specified in seconds (ex: 3600 * 3)
    } else if (blockHeight) {
      const chainInfo = await this.fetchChainInfo();
      lockTime = bip65.encode({ blocks: chainInfo.height + blockHeight });
    } else {
      throw new Error('Please specify time or block height');
    }

    const redeemScript = this.cltvCheckSigOutput(keyPair, lockTime);
    console.log({ redeemScript });

    console.log({ redeemScript: redeemScript.toString('hex') });

    const p2sh = bitcoinJS.payments.p2sh({
      redeem: { output: redeemScript, network: this.network },
      network: this.network,
    });

    return {
      address: p2sh.address,
      lockTime,
    };
  };

  public generatePaymentURI = (
    address: string,
    options?: { amount: number; label?: string; message?: string },
  ): { paymentURI: string } => {
    if (options) {
      return { paymentURI: bip21.encode(address, options) };
    } else {
      return { paymentURI: bip21.encode(address) };
    }
  };

  public decodePaymentURI = (
    paymentURI: string,
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => {
    return bip21.decode(paymentURI);
  };

  public categorizeTx = (
    tx: any,
    inUseAddresses: string[],
    accountType: string,
  ) => {
    const inputs = tx.vin || tx.inputs;
    const outputs = tx.Vout || tx.outputs;
    let value: number = 0;
    const probableRecipientList: string[] = [];
    const probableSenderList: string[] = [];

    inputs.forEach((input) => {
      if (!input.addresses && !input.prevout) {
        // skip it (quirks from blockcypher)
      } else {
        const address = input.addresses
          ? input.addresses[0]
          : input.prevout.scriptpubkey_address;

        if (this.ownedAddress(address, inUseAddresses)) {
          value -= input.prevout ? input.prevout.value : input.output_value;
        } else {
          probableSenderList.push(address);
        }
      }
    });

    outputs.forEach((output) => {
      if (!output.addresses && !output.scriptpubkey_address) {
      } else {
        const address = output.addresses
          ? output.addresses[0]
          : output.scriptpubkey_address;

        if (this.ownedAddress(address, inUseAddresses)) {
          value += output.value;
        } else {
          probableRecipientList.push(address); // could be the change address of the sender (in context of incoming tx)
        }
      }
    });

    // if (value + (tx.fee | tx.fees) === 0) {
    //   // tx from and to self
    //   tx.transactionType = 'Self';
    //   selfAmount += tx.fee ? tx.fee : tx.fees;
    //   tx.amount = Math.abs(selfAmount);
    //   tx.recipientAddresses = probableRecipientList;
    //   tx.senderAddresses = probableSenderList;
    // } else {
    // tx.transactionType = value > 0 ? 'Received' : 'Sent';
    // if (tx.transactionType === 'Sent') {
    //   value += tx.fee ? tx.fee : tx.fees;
    //   tx.recipientAddresses = probableRecipientList;
    // } else {
    //   tx.senderAddresses = probableSenderList;
    // }
    // tx.amount = Math.abs(value);
    // tx.accountType = accountType;
    // return tx;
    // }
    tx.transactionType = value > 0 ? 'Received' : 'Sent';
    if (tx.transactionType === 'Sent') {
      value += tx.fee ? tx.fee : tx.fees;
      tx.recipientAddresses = probableRecipientList;
    } else {
      tx.senderAddresses = probableSenderList;
    }
    tx.amount = Math.abs(value);
    tx.accountType = accountType;
    return tx;
  };

  private ownedAddress = (
    address: string,
    inUseAddresses: string[],
  ): boolean => {
    for (const addr of inUseAddresses) {
      if (address === addr) {
        return true;
      }
    }
    return false;
  };
}
