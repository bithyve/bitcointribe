import axios, { AxiosResponse } from "axios";
import bip21 from "bip21";
import bip32 from "bip32";
import bip39 from "bip39";
import bip65 from "bip65";
import Client from "bitcoin-core";
import bitcoinJS, {
  ECPair,
  Network,
  Transaction,
  TransactionBuilder,
} from "bitcoinjs-lib";
import coinselect from "coinselect";
import config from "../Config";

const { TESTNET, MAINNET } = config.API_URLS;

export default class Bitcoin {
  public network: Network;
  public client: Client;

  constructor() {
    this.network = config.NETWORK;
    this.client = config.BITCOIN_NODE;
  }

  public getKeyPair = (privateKey: string): ECPair =>
    bitcoinJS.ECPair.fromWIF(privateKey, this.network)

  public utcNow = (): number => Math.floor(Date.now() / 1000);

  public getAddress = (keyPair: ECPair): string =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      }),
      network: this.network,
    }).address

  public generateHDWallet = (
    mnemonic: string,
    passphrase?: string,
  ): {
    mnemonic: string;
    keyPair: ECPair;
    address: string;
    privateKey: string;
  } => {
    // generates a HD-Wallet from the provided mnemonic-passphrase pair

    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Invalid mnemonic");
    }

    const seed: Buffer = passphrase
      ? bip39.mnemonicToSeed(mnemonic, passphrase)
      : bip39.mnemonicToSeed(mnemonic);
    const path: string = "m/44'/0'/0'/0/0";
    const root = bip32.fromSeed(seed, this.network);
    const child1 = root.derivePath(path);

    const privateKey = child1.toWIF();
    const address = this.getAddress(child1);

    console.log(`Mnemonic: ${mnemonic}`);
    console.log(`Address: ${address}`);

    return {
      mnemonic,
      keyPair: child1,
      address,
      privateKey,
    };
  }

  public createHDWallet = (
    passphrase?: string,
  ): {
    mnemonic: string;
    keyPair: bitcoinJS.ECPair;
    address: string;
    privateKey: string;
  } => {
    // creates a new HD Wallet

    const mnemonic = bip39.generateMnemonic(256);
    return this.generateHDWallet(mnemonic, passphrase);
  }

  public getP2SH = (
    keyPair: ECPair,
  ): {
    address: string;
    hash: Buffer;
    output: Buffer;
    redeem: bitcoinJS.payments.Redeem;
    input: Buffer;
    witness: Buffer[];
  } =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network,
      }),
      network: this.network,
    })

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
        res = await axios.get(
          `${TESTNET.BALANCE_CHECK}${address}/balance?token=${config.TOKEN}`,
        );
      } catch (err) {
        console.log("Error:", err.response.data);
        return {
          status: err.response.status,
          errorMessage: err.response.data,
        };
      }
    } else {
      // throttled endPoint (required: full node/corresponding paid service));
      try {
        res = await axios.get(
          `${MAINNET.BALANCE_CHECK}${address}/balance?token=${config.TOKEN}`,
        );
      } catch (err) {
        console.log("Error:", err.response.data);
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
  }

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
  }

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
        res = await axios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.MULTIBALANCE,
          {
            addresses,
          },
        );
      } else {
        res = await axios.post(
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
        `An error occured while fetching balance via Esplora: ${
          err.response.data.err
        }`,
      );
      console.log("Using Blockcypher fallback");
      try {
        const { bal, unconfirmedBal } = await this.blockcypherBalFallback(
          addresses,
        );
        return {
          balance: bal,
          unconfirmedBalance: unconfirmedBal,
        };
      } catch (err) {
        console.log("Blockcypher fallback failed aswell!");
        throw new Error("fetching balance by addresses failed");
      }
    }
  }

  public fetchAddressInfo = async (address: string): Promise<any> => {
    // fetches information corresponding to the  supplied address (including txns)
    if (this.network === bitcoinJS.networks.testnet) {
      return await axios.get(
        `${TESTNET.BASE}/addrs/${address}/full?token=${config.TOKEN}`,
      );
    } else {
      return await axios.get(
        `${MAINNET.BASE}/addrs/${address}/full?token=${config.TOKEN}`,
      );
    }
  }

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
    txs.map((tx) => {
      this.confirmationCat(this.categorizeTx(tx, address));
    });

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
  }

  public fetchTransactionsByAddresses = async (
    addresses: string[],
  ): Promise<{
    transactions: {
      totalTransactions: number;
      confirmedTransactions: number;
      unconfirmedTransactions: number;
      transactionDetails: any[];
      address: string;
    };
  }> => {
    const transactions = {
      totalTransactions: 0,
      confirmedTransactions: 0,
      unconfirmedTransactions: 0,
      transactionDetails: [],
      address: "",
    };
    try {
      let res: AxiosResponse;
      try {
        if (this.network === bitcoinJS.networks.testnet) {
          res = await axios.post(
            config.ESPLORA_API_ENDPOINTS.TESTNET.MULTITXN,
            {
              addresses,
            },
          );
        } else {
          res = await axios.post(
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
      console.log({ addressesInfo });
      for (const addressInfo of addressesInfo) {
        console.log(
          `Appending transactions corresponding to ${addressInfo.Address}`,
        );
        transactions.totalTransactions += addressInfo.TotalTransactions;
        transactions.confirmedTransactions += addressInfo.ConfirmedTransactions;
        transactions.unconfirmedTransactions +=
          addressInfo.UnconfirmedTransactions;
        transactions.address = addressInfo.Address;
        addressInfo.Transactions.map((tx) => {
          this.confirmationCat(this.categorizeTx(tx, addressInfo.Address));
        });
        transactions.transactionDetails.push(...addressInfo.Transactions);
      }

      return { transactions };
    } catch (err) {
      console.log(
        `An error occured while fetching transactions via Esplora Wrapper: ${err}`,
      );
      console.log("Using Blockcypher fallback");

      try {
        for (const address of addresses) {
          console.log(`Fetching transactions corresponding to ${address}`);
          const txns = await this.fetchTransactionsByAddress(address);
          console.log({ txns });
          transactions.totalTransactions += txns.transactions.totalTransactions;
          transactions.confirmedTransactions +=
            txns.transactions.confirmedTransactions;
          transactions.unconfirmedTransactions +=
            txns.transactions.unconfirmedTransactions;
          transactions.address = address;
          transactions.transactionDetails.push(
            ...txns.transactions.transactionDetails,
          );
        }

        return { transactions };
      } catch (err) {
        console.log(
          `An error occured while fetching transactions via Blockcypher fallback as well: ${err}`,
        );
        throw new Error("Transaction fetching failed");
      }
    }
  }

  public fundTestNetAddress = async (address: string) => {
    const funderAddress = "2N6aazKqLgqBRLisjeEU1DoLuieoZbDmiB8";
    const funderPriv = "cSB5QV1Tesqtou1FDZhgfKYiEH4m55H1jT1xM8hu9xKNzWSFFgAR";
    const { balanceData } = await this.getBalance(funderAddress);
    const { final_balance } = balanceData;
    if (final_balance < 7000) {
      throw new Error("Funding address is out of funds");
    }
    const transfer = {
      senderAddress: funderAddress,
      recipientAddress: address,
      amount: 6000,
    };

    const txnObj = await this.createTransaction(
      transfer.senderAddress,
      transfer.recipientAddress,
      transfer.amount,
    );
    console.log("---- Transaction Created ----");

    const keyPair = this.getKeyPair(funderPriv);
    const p2sh = this.getP2SH(keyPair);
    const txb = this.signTransaction(
      txnObj.inputs,
      txnObj.txb,
      [keyPair],
      p2sh.redeem.output,
    );
    console.log("---- Transaction Signed ----");

    const txHex = txb.build().toHex();
    const res = await this.broadcastTransaction(txHex);
    console.log("---- Transaction Broadcasted ----");
    return res;
  }

  public generateMultiSig = (
    required: number,
    pubKeys: any[],
  ): {
    p2wsh: {
      address: string;
      hash: Buffer;
      output: Buffer;
      redeem: bitcoinJS.payments.Redeem;
      input: Buffer;
      witness: Buffer[];
    };
    p2sh: {
      address: string;
      hash: Buffer;
      output: Buffer;
      redeem: bitcoinJS.payments.Redeem;
      input: Buffer;
      witness: Buffer[];
    };
    address: string;
  } => {
    // generic multiSig address generator

    if (required <= 0 || required > pubKeys.length) {
      throw new Error("Inappropriate value for required param");
    }
    // if (!network) network = bitcoinJS.networks.bitcoin;
    const pubkeys = pubKeys.map((hex) => Buffer.from(hex, "hex"));

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
  }

  public fetchChainInfo = async (): Promise<any> => {
    // provides transation fee rate (satoshis/kilobyte)
    // bitcoinfees endpoint: https://bitcoinfees.earn.com/api/v1/fees/recommended (provides time estimates)

    try {
      if (this.network === bitcoinJS.networks.testnet) {
        const { data } = await axios.get(
          `${TESTNET.BASE}?token=${config.TOKEN}`,
        );
        return data;
      } else {
        const { data } = await axios.get(
          `${MAINNET.BASE}?token=${config.TOKEN}`,
        );
        return data;
      }
    } catch (err) {
      throw new Error("Failed to fetch chain info");
    }
  }

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
      const res: AxiosResponse = await axios.get(
        `${TESTNET.UNSPENT_OUTPUTS}${address}?unspentOnly=true&token=${
          config.TOKEN
        }`,
      );
      data = res.data;
    } else {
      const res: AxiosResponse = await axios.get(
        `${MAINNET.UNSPENT_OUTPUTS}${address}?unspentOnly=true&token=${
          config.TOKEN
        }`,
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
  }

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
  }

  public multiFetchUnspentOutputs = async (
    addresses: string[],
  ): Promise<{
    UTXOs: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>;
  }> => {
    try {
      let data;
      if (this.network === bitcoinJS.networks.testnet) {
        const res: AxiosResponse = await axios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.MULTIUTXO,
          { addresses },
        );
        data = res.data;
      } else {
        const res: AxiosResponse = await axios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.MULTIUTXO,
          { addresses },
        );
        data = res.data;
      }

      const UTXOs = [];
      for (const addressSpecificUTXOs of data) {
        for (const utxo of addressSpecificUTXOs) {
          const { txid, vout, value, Address } = utxo;
          UTXOs.push({
            txId: txid,
            vout,
            value,
            address: Address,
          });
        }
      }
      return { UTXOs };
    } catch (err) {
      console.log(`An error occured while connecting to Esplora: ${err}`);
      console.log("Switching to Blockcypher UTXO fallback");

      try {
        const UTXOs = await this.blockcypherUTXOFallback(addresses);
        return { UTXOs };
      } catch (err) {
        console.log(
          `Blockcypher UTXO fallback failed with the following error: ${err}`,
        );
        throw new Error("multi utxo fetch failed");
      }
    }
  }

  public fetchTransactionDetails = async (txID: string): Promise<any> => {
    try {
      let data;
      if (this.network === bitcoinJS.networks.testnet) {
        const res: AxiosResponse = await axios.get(
          config.ESPLORA_API_ENDPOINTS.TESTNET.TXNDETAILS + `/${txID}`,
        );
        data = res.data;
      } else {
        const res: AxiosResponse = await axios.get(
          config.ESPLORA_API_ENDPOINTS.MAINNET.TXNDETAILS + `/${txID}`,
        );
        data = res.data;
      }

      return data;
    } catch (err) {
      console.log(
        `An error occured while fetching transaction details from Esplora: ${err}`,
      );
      console.log("Switching to Blockcypher fallback");
      try {
        if (this.network === bitcoinJS.networks.testnet) {
          const { data } = await axios.get(`${TESTNET.BASE}/txs/${txID}`);
          return data;
        } else {
          const { data } = await axios.get(`${MAINNET.BASE}/txs/${txID}`);
          return data;
        }
      } catch (err) {
        console.log(
          `Blockcypher fetch txn details fallback failed with the following error: ${err}`,
        );
        throw new Error("fetch transaction detaisl failed");
      }
    }
  }

  public feeRatesPerByte = async (txnPriority: string = "high") => {
    try {
      let rates;
      if (this.network === bitcoinJS.networks.testnet) {
        const res: AxiosResponse = await axios.get(
          config.ESPLORA_API_ENDPOINTS.TESTNET.TXN_FEE,
        );
        rates = res.data;
      } else {
        const res: AxiosResponse = await axios.get(
          config.ESPLORA_API_ENDPOINTS.MAINNET.TXN_FEE,
        );
        rates = res.data;
      }
      if (txnPriority === "high") {
        return rates["2"];
      } else if (txnPriority === "medium") {
        return rates["4"];
      } else if (txnPriority === "low") {
        return rates["6"];
      }
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
        if (txnPriority === "high") {
          return Math.round(high_fee_per_kb / 1000);
        } else if (txnPriority === "medium") {
          return Math.round(medium_fee_per_kb / 1000);
        } else if (txnPriority === "low") {
          return Math.round(low_fee_per_kb / 1000);
        }
      } catch (err) {
        throw new Error("Falied to fetch feeRates");
      }
    }
  }

  public isValidAddress = (address: string): boolean => {
    try {
      bitcoinJS.address.toOutputScript(address, this.network);
      return true;
    } catch (err) {
      return false;
    }
  }

  public isPaymentURI = (paymentURI: string): boolean => {
    if (paymentURI.slice(0, 8) === "bitcoin:") {
      return true;
    }
    return false;
  }

  public addressDiff = (
    scannedStr: string,
  ): {
    type: string;
  } => {
    if (this.isPaymentURI(scannedStr)) {
      return { type: "paymentURI" };
    } else if (this.isValidAddress(scannedStr)) {
      return { type: "address" };
    } else {
      throw new Error("Invalid QR: Neither an address nor paymentURI");
    }
  }

  public createTransaction = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    nSequence?: number,
    txnPriority?: string,
  ): Promise<{ inputs: object[]; txb: TransactionBuilder; fee: number }> => {
    console.log({ senderAddress });
    const res = await this.multiFetchUnspentOutputs([senderAddress]);
    const inputUTXOs = res.UTXOs;
    console.log("Fetched the inputs");
    const outputUTXOs = [{ address: recipientAddress, value: amount }];

    const txnFee = await this.feeRatesPerByte(txnPriority);

    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      txnFee,
    );
    console.log("-------Transaction--------");
    console.log("\tFee", fee);
    console.log("\tInputs:", inputs);
    console.log("\tOutputs:", outputs);

    const txb: TransactionBuilder = new bitcoinJS.TransactionBuilder(
      this.network,
    );

    inputs.forEach((input) => txb.addInput(input.txId, input.vout, nSequence));
    outputs.forEach((output) => {
      if (!output.address) {
        output.address = senderAddress;
      }
      console.log("Added Output:", output);
      txb.addOutput(output.address, output.value);
    });

    return {
      inputs,
      txb,
      fee,
    };
  }

  public signTransaction = (
    inputs: any,
    txb: TransactionBuilder,
    keyPairs: ECPair[],
    redeemScript: any,
    witnessScript?: any,
  ): TransactionBuilder => {
    console.log("------ Transaction Signing ----------");
    let vin = 0;
    inputs.forEach((input) => {
      console.log("Signing Input:", input);
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
  }

  public signPartialTxn = (
    inputs: any,
    txb: TransactionBuilder,
    keyPairs: ECPair[],
    redeemScript: any,
    witnessScript?: any,
  ): Transaction => {
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
  }

  public broadcastTransaction = async (
    txHex: string,
  ): Promise<{
    txid: string;
  }> => {
    try {
      let res: AxiosResponse;
      if (this.network === bitcoinJS.networks.testnet) {
        res = await axios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.BROADCAST_TX,
          txHex,
          {
            headers: { "Content-Type": "text/plain" },
          },
        );
      } else {
        res = await axios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX,
          txHex,
          {
            headers: { "Content-Type": "text/plain" },
          },
        );
      }
      return { txid: res.data };
    } catch (err) {
      console.log(
        `An error occured while broadcasting through BitHyve Node. Using the fallback mechanism. ${err}`,
      );
      try {
        let res: AxiosResponse;
        if (this.network === bitcoinJS.networks.testnet) {
          res = await axios.post(TESTNET.BROADCAST, { hex: txHex });
        } else {
          res = await axios.post(MAINNET.BROADCAST, { hex: txHex });
        }

        const { txid } = res.data;
        return {
          txid,
        };
      } catch (err) {
        console.log(err.message);
        throw new Error("Transaction broadcasting failed");
      }
    }
  }

  public estimateSmartFee = async (
    blockNo: number,
  ): Promise<{ feerate: number; blocks: number }> => {
    try {
      const res = await this.client.estimateSmartFee(blockNo);
      return { feerate: res.feerate, blocks: res.blocks };
    } catch (err) {
      throw new Error("Failed to fetch transaction fee");
    }
  }

  public decodeTransaction = async (txHash: string): Promise<void> => {
    if (this.network === bitcoinJS.networks.testnet) {
      const { data } = await axios.post(TESTNET.TX_DECODE, { hex: txHash });
      console.log(JSON.stringify(data, null, 4));
    } else {
      const { data } = await axios.post(MAINNET.TX_DECODE, { hex: txHash });
      console.log(JSON.stringify(data, null, 4));
    }
  }

  public recoverInputsFromTxHex = async (
    txHex: string,
  ): Promise<Array<{ txId: string; vout: number; value: number }>> => {
    const regenTx: Transaction = bitcoinJS.Transaction.fromHex(txHex);
    const recoveredInputs = [];
    await Promise.all(
      regenTx.ins.map(async (inp) => {
        const txId = inp.hash
          .toString("hex")
          .match(/.{2}/g)
          .reverse()
          .join("");
        const vout = inp.index;
        const data = await this.fetchTransactionDetails(txId);
        const value = data.outputs[vout].value;
        recoveredInputs.push({ txId, vout, value });
      }),
    );
    return recoveredInputs;
  }

  public fromOutputScript = (output: Buffer): string => {
    return bitcoinJS.address.fromOutputScript(output, this.network);
  }

  public cltvCheckSigOutput = (keyPair: ECPair, lockTime: number): Buffer => {
    return bitcoinJS.script.compile([
      bitcoinJS.script.number.encode(lockTime),
      bitcoinJS.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoinJS.opcodes.OP_DROP,
      keyPair.publicKey,
      bitcoinJS.opcodes.OP_CHECKSIG,
    ]);
  }

  public createTLC = async (
    keyPair: ECPair,
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
      throw new Error("Please specify time or block height");
    }

    const redeemScript = this.cltvCheckSigOutput(keyPair, lockTime);
    console.log({ redeemScript });

    console.log({ redeemScript: redeemScript.toString("hex") });

    const p2sh = bitcoinJS.payments.p2sh({
      redeem: { output: redeemScript, network: this.network },
      network: this.network,
    });

    return {
      address: p2sh.address,
      lockTime,
    };
  }

  public generatePaymentURI = (
    address: string,
    options?: { amount: number; label?: string; message?: string },
  ): { paymentURI: string } => {
    if (options) {
      return { paymentURI: bip21.encode(address, options) };
    } else {
      return { paymentURI: bip21.encode(address) };
    }
  }

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
  }

  private rng2 = (): Buffer => {
    return Buffer.from("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz2");
  }

  private generateTestnetKeys = (rng?): string => {
    let keyPair: ECPair;
    if (rng) {
      keyPair = bitcoinJS.ECPair.makeRandom({
        network: this.network,
        rng,
      });
    } else {
      // // for generating random testnet addresses
      keyPair = bitcoinJS.ECPair.makeRandom({
        network: this.network,
      });
    }
    const privateKey: string = keyPair.toWIF();
    const address: string = this.getAddress(keyPair);

    console.log(
      `Private Kye[WIF]: ${privateKey} \n Generated Address: ${address} `,
    );
    return privateKey;
  }

  // deterministic RNG (testing only)
  private rng1 = (): Buffer => {
    return Buffer.from("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz1");
  }

  private categorizeTx = (tx: any, walletAddress: string) => {
    const inputs = tx.vin || tx.inputs;
    const outputs = tx.Vout || tx.outputs;

    let sent: boolean = false;
    let totalReceived: number = 0;
    let totalSpent: number = 0;

    inputs.forEach((input) => {
      console.log({ input });
      const addresses = input.addresses
        ? input.addresses
        : [input.prevout.scriptpubkey_address];

      if (addresses) {
        addresses.forEach((address) => {
          if (address === walletAddress) {
            sent = true;
          }
        });
      }
    });

    outputs.forEach((output) => {
      const addresses = output.addresses
        ? output.addresses
        : [output.scriptpubkey_address];

      if (addresses[0] !== walletAddress) {
        totalSpent += output.value;
      } else {
        totalReceived += output.value;
      }
    });

    tx.transactionType = sent ? "Sent" : "Received";
    if (sent) {
      tx.totalSpent = totalSpent;
    } else {
      tx.totalReceived = totalReceived;
    }
    return tx;
  }

  private confirmationCat = async (tx: any) => {
    let confirmationType: string;
    const nConfirmations: number = tx.NumberofConfirmations || tx.confirmations;
    if (nConfirmations === 0) {
      confirmationType = "UNCONFIRMED";
    } else if (nConfirmations > 0 && nConfirmations < 6) {
      confirmationType = "CONFIRMED";
    } else {
      confirmationType = "SUPER CONFIRMED";
    }

    tx.confirmationType = confirmationType;
    return tx;
  }
}
