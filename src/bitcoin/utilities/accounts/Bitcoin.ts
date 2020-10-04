import axios, { AxiosResponse } from 'axios';
import bip21 from 'bip21';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bip65 from 'bip65';
import Client from 'bitcoin-core';
import * as bitcoinJS from 'bitcoinjs-lib';
import config from '../../HexaConfig';
import { Transactions } from '../Interface';
import {
  SUB_PRIMARY_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../../common/constants/serviceTypes';

const { API_URLS, REQUEST_TIMEOUT } = config;
const { TESTNET, MAINNET } = API_URLS;

const bitcoinAxios = axios.create({ timeout: REQUEST_TIMEOUT });
export default class Bitcoin {
  public static networkType = (scannedStr: string) => {
    let address = scannedStr;
    if (scannedStr.slice(0, 8) === 'bitcoin:') {
      address = bip21.decode(scannedStr).address;
    }
    try {
      bitcoinJS.address.toOutputScript(address, bitcoinJS.networks.bitcoin);
      return 'MAINNET';
    } catch (err) {
      try {
        bitcoinJS.address.toOutputScript(address, bitcoinJS.networks.testnet);
        return 'TESTNET';
      } catch (err) {
        return '';
      }
    }
  };

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

  public deriveAddress = (
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

  public getP2SH = (keyPair: bitcoinJS.ECPairInterface): bitcoinJS.Payment =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      }),
      network: this.network,
    });

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
    lastUsedChangeAddressIndex: number,
    accountType: string,
    contactName?: string,
    primaryAccType?: string,
  ): Promise<{
    UTXOs: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
      status?: any;
    }>;
    balances: { balance: number; unconfirmedBalance: number };
    transactions: Transactions;
    nextFreeAddressIndex: number;
    nextFreeChangeAddressIndex: number;
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

      const UTXOs = [];
      for (const addressSpecificUTXOs of Utxos) {
        for (const utxo of addressSpecificUTXOs) {
          const { value, Address, status, vout, txid } = utxo;

          UTXOs.push({
            txId: txid,
            vout,
            value,
            address: Address,
            status,
          });

          if (
            accountType === 'Test Account' &&
            Address === externalAddresses[0]
          ) {
            balances.balance += value; // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            continue;
          }

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
            this.categorizeTx(
              tx,
              ownedAddresses,
              accountType,
              externalAddresses,
            );

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
                amount: tx.sentAmount,
                accountType: tx.accountType,
                primaryAccType,
                recipientAddresses: tx.recipientAddresses,
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
                amount: tx.receivedAmount,
                accountType: tx.accountType,
                primaryAccType,
                senderAddresses: tx.senderAddresses,
                blockTime: tx.Status.block_time, // only available when tx is confirmed
              };
              console.log({ outgoingTx, incomingTx });
              transactions.transactionDetails.push(...[outgoingTx, incomingTx]);
            } else {
              const transaction = {
                txid: tx.txid,
                confirmations:
                  accountType === 'Test Account' &&
                  tx.transactionType === 'Received' &&
                  addressInfo.Address === externalAddresses[0] &&
                  tx.NumberofConfirmations < 1
                    ? '-'
                    : tx.NumberofConfirmations,
                status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                fee: tx.fee,
                date: tx.Status.block_time
                  ? new Date(tx.Status.block_time * 1000).toUTCString()
                  : new Date(Date.now()).toUTCString(),
                transactionType: tx.transactionType,
                amount: tx.amount,
                accountType:
                  tx.accountType === TRUSTED_CONTACTS
                    ? contactName
                        .split(' ')
                        .map(
                          (word) => word[0].toUpperCase() + word.substring(1),
                        )
                        .join(' ')
                    : tx.accountType,
                primaryAccType,
                recipientAddresses: tx.recipientAddresses,
                senderAddresses: tx.senderAddresses,
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

      return {
        UTXOs,
        balances,
        transactions,
        nextFreeAddressIndex: lastUsedAddressIndex + 1,
        nextFreeChangeAddressIndex: lastUsedChangeAddressIndex + 1,
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
    feeRatesByPriority: {
      high: { feePerByte: number; estimatedBlocks: number };
      medium: { feePerByte: number; estimatedBlocks: number };
      low: { feePerByte: number; estimatedBlocks: number };
    };
    rates: any;
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

      // high fee: 30 minutes
      const highFeePerByte =
        rates['2'] - rates['3'] >= 10
          ? 0.4 * rates['2'] + 0.6 * rates['3']
          : rates['3'];

      const high = {
        feePerByte: Math.round(highFeePerByte),
        estimatedBlocks: 3,
      }; // high: within 3 blocks

      // medium fee: 2 hours
      let mediumFeePerByte;
      if (rates['6'] - rates['10'] >= 10) {
        if (rates['10'] - rates['20'] <= 10) {
          mediumFeePerByte = 0.6 * rates['10'] + 0.2 * rates['6'];
        } else {
          mediumFeePerByte =
            0.1 * rates['20'] + 0.5 * rates['10'] + 0.2 * rates['6'];
        }
      } else {
        if (rates['10'] - rates['20'] <= 10) {
          mediumFeePerByte = 0.85 * rates['10'];
        } else {
          mediumFeePerByte = 0.2 * rates['20'] + 0.7 * rates['10'];
        }
      }

      const medium = {
        feePerByte: Math.round(mediumFeePerByte),
        estimatedBlocks: 12,
      }; // medium: within 12 blocks

      //low fee: 6 hours
      const lowFeePerByte = 0.7 * rates['25'] + 0.3 * rates['144'];

      const low = {
        feePerByte: Math.round(lowFeePerByte),
        estimatedBlocks: 36,
      }; // low: within 36 blocks

      const feeRatesByPriority = {
        high,
        medium,
        low,
      };

      return { feeRatesByPriority, rates };
    } catch (err) {
      console.log(`Fee rates fetching failed @Bitcoin core: ${err}`);
      // try {
      //   const chainInfo = await this.fetchChainInfo();
      //   const {
      //     high_fee_per_kb,
      //     medium_fee_per_kb,
      //     low_fee_per_kb,
      //   } = chainInfo;

      //   const high = {
      //     feePerByte: Math.round(high_fee_per_kb / 1000),
      //     estimatedBlocks: 2,
      //   };
      //   const medium = {
      //     feePerByte: Math.round(medium_fee_per_kb / 1000),
      //     estimatedBlocks: 4,
      //   };
      //   const low = {
      //     feePerByte: Math.round(low_fee_per_kb / 1000),
      //     estimatedBlocks: 6,
      //   };

      //   const feeRatesByPriority = {
      //     high,
      //     medium,
      //     low,
      //   };
      //   return feeRatesByPriority;
      // } catch (err) {
      //   throw new Error('Falied to fetch feeRates');
      // }
    }
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

  public fromOutputScript = (output: Buffer): string => {
    return bitcoinJS.address.fromOutputScript(output, this.network);
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
    externalAddresses: string[],
  ) => {
    const inputs = tx.vin || tx.inputs;
    const outputs = tx.Vout || tx.outputs;
    let value: number = 0;
    let amountToSelf = 0;
    const probableRecipientList: string[] = [];
    const probableSenderList: string[] = [];
    const selfRecipientList: string[] = [];
    const selfSenderList: string[] = [];

    inputs.forEach((input) => {
      if (!input.addresses && !input.prevout) {
        // skip it (quirks from blockcypher)
      } else {
        const address = input.addresses
          ? input.addresses[0]
          : input.prevout.scriptpubkey_address;

        if (this.ownedAddress(address, inUseAddresses)) {
          value -= input.prevout ? input.prevout.value : input.output_value;
          selfSenderList.push(address);
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
          if (this.ownedAddress(address, externalAddresses)) {
            amountToSelf += output.value;
            selfRecipientList.push(address);
          }
        } else {
          probableRecipientList.push(address); // could be the change address of the sender (in context of incoming tx)
        }
      }
    });

    if (value > 0) {
      tx.transactionType = 'Received';
      tx.senderAddresses = probableSenderList;
    } else {
      if (value + (tx.fee | tx.fees) === 0) {
        tx.transactionType = 'Self';
        tx.sentAmount = Math.abs(amountToSelf) + (tx.fee | tx.fees);
        tx.receivedAmount = Math.abs(amountToSelf);
        tx.senderAddresses = selfSenderList;
        tx.recipientAddresses = selfRecipientList;
      } else {
        tx.transactionType = 'Sent';
        tx.recipientAddresses = probableRecipientList;
      }
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
