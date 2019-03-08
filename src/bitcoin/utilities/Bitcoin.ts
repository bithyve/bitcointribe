import axios, { AxiosResponse } from "axios";
import bip32 from "bip32";
import bip39 from "bip39";
import bip65 from "bip65";
import bitcoinJS, {
  ECPair,
  Network,
  Transaction,
  TransactionBuilder
} from "bitcoinjs-lib";
import coinselect from "coinselect";
import config from "../Config";

const { TESTNET, MAINNET } = config.API_URLS;

export default class Bitcoin {
  public network: Network;
  public client;
  constructor() {
    this.network = config.NETWORK;
    this.client = config.BITCOIN_NODE;
  }

  public getKeyPair = (privateKey: string): ECPair =>
    bitcoinJS.ECPair.fromWIF(privateKey, this.network);

  public utcNow = (): number => Math.floor(Date.now() / 1000);

  public getAddress = (keyPair: ECPair): string =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network
      }),
      network: this.network
    }).address;

  public generateHDWallet = (
    mnemonic: string,
    passphrase?: string
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
      privateKey
    };
  };

  public createHDWallet = async (passphrase?: string) => {
    // creates a new HD Wallet

    const mnemonic = await bip39.generateMnemonic();
    return this.generateHDWallet(mnemonic, passphrase);
  };

  public getP2SH = (keyPair: ECPair) =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network
      }),
      network: this.network
    });

  public checkBalance = async (address: string): Promise<any> => {
    // fetches balance corresponding to the supplied address
    console.log({ address });
    let res: AxiosResponse;
    if (this.network === bitcoinJS.networks.testnet) {
      try {
        res = await axios.get(`${TESTNET.BALANCE_CHECK}${address}/balance`);
        console.log({ res });
      } catch (err) {
        console.log("Error:", err.response.data);
        return {
          statusCode: err.response.status,
          errorMessage: err.response.data
        };
      }
    } else {
      // throttled endPoint (required: full node/corresponding paid service));
      try {
        res = await axios.get(`${MAINNET.BALANCE_CHECK}${address}/balance`);
      } catch (err) {
        console.log("Error:", err.response.data);
        return {
          statusCode: err.response.status,
          errorMessage: err.response.data
        };
      }
    }

    const { final_balance } = res.data;
    return {
      statusCode: res.status,
      final_balance
    };
  };

  // public fetchTransactions = async (
  //   address: string,
  // ): Promise<{
  //   numberOfTransactions: string;
  //   transactions: string[];
  // }> => {
  //   // fetches transactions corresponding to the  supplied address

  //   const txLimit: number = 5; // max:50 (use offset and n_tx to recursively capture all txs, if required)
  //   let res: AxiosResponse;
  //   if (this.network === bitcoinJS.networks.testnet) {
  //     res = await axios.get(
  //       `${TESTNET.TX_FETCH.URL}${address}${TESTNET.TX_FETCH.LIMIT}${txLimit}`,
  //     );
  //   } else {
  //     res = await axios.get(
  //       `${MAINNET.TX_FETCH.URL}${address}${MAINNET.TX_FETCH.LIMIT}${txLimit}`,
  //     );
  //   }
  //   return {
  //     numberOfTransactions: res.data.n_tx,
  //     transactions: res.data.txs,
  //   };
  // }

  public fetchAddressInfo = async (address: string): Promise<any> => {
    // fetches information corresponding to the  supplied address (including txns)
    if (this.network === bitcoinJS.networks.testnet) {
      return await axios.get(
        `${TESTNET.BASE}/addrs/${address}/full?token=${config.TOKEN}`
      );
    } else {
      return await axios.get(
        `${MAINNET.BASE}/addrs/${address}/full?token=${config.TOKEN}`
      );
    }
  };

  public categorizeTx = (tx: any, walletAddress: string) => {
    // only handling for single walletAddress for now
    const { inputs, outputs } = tx;
    let sent: boolean = false;
    let totalReceived: number = 0;
    let totalSpent: number = 0;

    inputs.forEach(input => {
      const { addresses } = input;
      if (addresses) {
        addresses.forEach(address => {
          if (address === walletAddress) {
            sent = true;
          }
        });
      }
    });

    outputs.forEach(output => {
      const { addresses } = output;
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
  };

  public confirmationCat = async (tx: any) => {
    let confirmationType: string;
    const nConfirmations: number = tx.confirmations;
    if (nConfirmations === 0) {
      confirmationType = "UNCONFIRMED";
    } else if (nConfirmations > 0 && nConfirmations < 6) {
      confirmationType = "CONFIRMED";
    } else {
      confirmationType = "SUPER CONFIRMED";
    }

    tx.confirmationType = confirmationType;
    return tx;
  };

  public fetchTransactions = async (address: string): Promise<any> => {
    let res: AxiosResponse;
    try {
      res = await this.fetchAddressInfo(address);
    } catch (err) {
      return {
        statusCode: err.response.status,
        errorMessage: err.response.data
      };
    }

    const { final_n_tx, n_tx, unconfirmed_n_tx, txs } = res.data;
    txs.map(tx => {
      this.confirmationCat(this.categorizeTx(tx, address));
    });

    return {
      statusCode: res.status,
      totalTransactions: final_n_tx,
      confirmedTransactions: n_tx,
      unconfirmedTransactions: unconfirmed_n_tx,
      transactionDetails: txs,
      address
    };
  };

  // deterministic RNG for testing only (aids in generation of exact address)
  public rng1 = (): Buffer => {
    return Buffer.from("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz1");
  };

  public rng2 = (): Buffer => {
    return Buffer.from("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz2");
  };

  public generateTestnetKeys = (rng?): string => {
    let keyPair: ECPair;
    if (rng) {
      keyPair = bitcoinJS.ECPair.makeRandom({
        network: this.network,
        rng
      });
    } else {
      // // for generating random testnet addresses
      keyPair = bitcoinJS.ECPair.makeRandom({
        network: this.network
      });
    }
    const privateKey: string = keyPair.toWIF();
    const address: string = this.getAddress(keyPair);

    console.log(
      `Private Kye[WIF]: ${privateKey} \n Generated Address: ${address} `
    );
    return privateKey;
  };

  public fundTestNetAddress = async (address: string) => {
    const funderAddress = "2N6aazKqLgqBRLisjeEU1DoLuieoZbDmiB8";
    const funderPriv = "cSB5QV1Tesqtou1FDZhgfKYiEH4m55H1jT1xM8hu9xKNzWSFFgAR";
    const { final_balance } = await this.checkBalance(funderAddress);
    if (final_balance < 7000) {
      throw new Error("Funding address is out of funds");
    }
    const transfer = {
      senderAddress: funderAddress,
      recipientAddress: address,
      amount: 6000
    };

    const txnObj = await this.createTransaction(
      transfer.senderAddress,
      transfer.recipientAddress,
      transfer.amount
    );
    console.log("---- Transaction Created ----");

    const keyPair = this.getKeyPair(funderPriv);
    const p2sh = this.getP2SH(keyPair);
    const txb = this.signTransaction(
      txnObj.inputs,
      txnObj.txb,
      [keyPair],
      p2sh.redeem.output
    );
    console.log("---- Transaction Signed ----");

    const txHex = txb.build().toHex();
    const res = await this.broadcastTransaction(txHex);
    console.log("---- Transaction Broadcasted ----");
    return res;
  };

  //  generate2of2MultiSigAddress = (pubKey1, pubKey2) => {
  //   //2-of-2 multiSig address generator

  //   const pubkeys = [pubKey1, pubKey2].map(hex => Buffer.from(hex, 'hex'));
  //   const { address } = bitcoinJS.payments.p2sh({
  //     redeem: bitcoinJS.payments.p2wsh({
  //       redeem: bitcoinJS.payments.p2ms({
  //         m: 2,
  //         pubkeys
  //       })
  //     })
  //   });
  //   return address;
  // };

  public generateMultiSig = (required: number, pubKeys: any[]) => {
    // generic multiSig address generator

    if (required <= 0 || required > pubKeys.length) {
      throw new Error("Inappropriate value for required param");
    }
    // if (!network) network = bitcoinJS.networks.bitcoin;
    const pubkeys = pubKeys.map(hex => Buffer.from(hex, "hex"));

    const p2ms = bitcoinJS.payments.p2ms({
      m: required,
      pubkeys,
      network: this.network
    });
    const p2wsh = bitcoinJS.payments.p2wsh({
      redeem: p2ms,
      network: this.network
    });
    const p2sh = bitcoinJS.payments.p2sh({
      redeem: p2wsh,
      network: this.network
    });

    // const { address } = bitcoinJS.payments.p2sh({
    //   redeem: bitcoinJS.payments.p2wsh({
    //     redeem: bitcoinJS.payments.p2ms({
    //       m: required,
    //       pubkeys,
    //     }),
    //   }),
    // });

    return {
      p2wsh,
      p2sh,
      address: p2sh.address
    };
  };

  public fetchChainInfo = async (): Promise<any> => {
    // provides transation fee rate (satoshis/kilobyte)
    // bitcoinfees endpoint: https://bitcoinfees.earn.com/api/v1/fees/recommended (provides time estimates)

    if (this.network === bitcoinJS.networks.testnet) {
      const { data } = await axios.get(`${TESTNET.BASE}?token=${config.TOKEN}`);
      return data;
    } else {
      const { data } = await axios.get(`${MAINNET.BASE}?token=${config.TOKEN}`);
      return data;
    }
  };

  public fetchUnspentOutputs = async (address: string): Promise<any> => {
    let data;
    if (this.network === bitcoinJS.networks.testnet) {
      const res: AxiosResponse = await axios.get(
        `${TESTNET.UNSPENT_OUTPUTS}${address}?unspentOnly=true`
      );
      data = res.data;
    } else {
      const res: AxiosResponse = await axios.get(
        `${MAINNET.UNSPENT_OUTPUTS}${address}?unspentOnly=true`
      );
      data = res.data;
    }
    console.log(data);
    let unspentOutputs = [];
    if (data.txrefs) {
      unspentOutputs.push(...data.txrefs);
    }
    if (data.unconfirmed_txrefs) {
      unspentOutputs.push(...data.unconfirmed_txrefs);
    }
    console.log({ unspentOutputs });
    if (unspentOutputs.length === 0) {
      throw new Error("No UTXO found for the supplied address");
    }

    unspentOutputs = unspentOutputs.map(unspent => ({
      txId: unspent.tx_hash,
      vout: unspent.tx_output_n,
      value: unspent.value
    }));
    return unspentOutputs;
  };

  public fetchTransactionDetails = async (txHash: string): Promise<any> => {
    if (this.network === bitcoinJS.networks.testnet) {
      const { data } = await axios.get(
        `${TESTNET.BASE}/txs/${txHash}?token=${config.TOKEN}`
      );
      return data;
    } else {
      const { data } = await axios.get(
        `${MAINNET.BASE}/txs/${txHash}?token=${config.TOKEN}`
      );
      return data;
    }
  };

  public feeRatesPerByte = async (txnPriority: string = "high") => {
    const chainInfo = await this.fetchChainInfo();
    const { high_fee_per_kb, medium_fee_per_kb, low_fee_per_kb } = chainInfo;

    if (txnPriority === "high") {
      console.log("Fee Rate: High");
      return Math.round(high_fee_per_kb / 1000);
    } else if (txnPriority === "medium") {
      console.log("Fee Rate: Medium");
      return Math.round(medium_fee_per_kb / 1000);
    } else if (txnPriority === "low") {
      console.log("Fee Rate: Low");
      return Math.round(low_fee_per_kb / 1000);
    }
  };

  public isValidAddress = address => {
    try {
      bitcoinJS.address.toOutputScript(address, this.network);
      return true;
    } catch (e) {
      return false;
    }
  };

  public createTransaction = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    nSequence?: number,
    txnPriority?: string
  ): Promise<{ inputs: object[]; txb: TransactionBuilder; fee: number }> => {
    console.log({ senderAddress });
    const inputUTXOs = await this.fetchUnspentOutputs(senderAddress);
    console.log("Fetched the inputs");
    const outputUTXOs = [{ address: recipientAddress, value: amount }];

    const txnFee = await this.feeRatesPerByte(txnPriority);

    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      txnFee
    );
    console.log("-------Transaction--------");
    console.log("\tFee", fee);
    console.log("\tInputs:", inputs);
    console.log("\tOutputs:", outputs);

    const txb: TransactionBuilder = new bitcoinJS.TransactionBuilder(
      this.network
    );

    inputs.forEach(input => txb.addInput(input.txId, input.vout, nSequence));
    outputs.forEach(output => {
      // Outputs may have been added that needs an
      // output address/script (generating change)
      if (!output.address) {
        output.address = senderAddress;
      }
      console.log("Added Output:", output);
      txb.addOutput(output.address, output.value);
    });

    return {
      inputs,
      txb,
      fee
    };
  };

  public signTransaction = (
    inputs: any,
    txb: TransactionBuilder,
    keyPairs: ECPair[],
    redeemScript: any,
    witnessScript?: any
  ): any => {
    console.log("------ Transaction Signing ----------");
    let vin = 0;
    inputs.forEach(input => {
      console.log("Signing Input:", input);
      keyPairs.forEach(keyPair => {
        txb.sign(
          vin,
          keyPair,
          redeemScript, // multiSig.p2sh.redeem.output
          null,
          input.value,
          witnessScript // multiSig.p2wsh.redeem.output
        );
      });
      vin += 1;
    });

    return txb;
  };

  public signPartialTxn = (
    inputs: any,
    txb: TransactionBuilder,
    keyPairs: ECPair[],
    redeemScript: any,
    witnessScript?: any
  ): any => {
    let vin = 0;
    inputs.forEach(input => {
      keyPairs.forEach(keyPair => {
        txb.sign(
          vin,
          keyPair,
          redeemScript, // multiSig.p2sh.redeem.output
          null,
          input.value,
          witnessScript // multiSig.p2wsh.redeem.output
        );
      });
      vin += 1;
    });

    const txHex = txb.buildIncomplete();
    return txHex;
  };

  public broadcastTransaction = async (txHex: string): Promise<any> => {
    console.log({ txHex });
    try {
      const txid = await this.client.sendRawTransaction(txHex);
      return {
        statusCode: 200,
        data: { txid }
      };
    } catch (err) {
      console.log(
        `An error occured while broadcasting through BitHyve Node. Using the fallback mechanism. ${err}`
      );
      try {
        let res: AxiosResponse;
        if (this.network === bitcoinJS.networks.testnet) {
          res = await axios.post(TESTNET.BROADCAST, { hex: txHex });
        } else {
          res = await axios.post(MAINNET.BROADCAST, { hex: txHex });
        }
        return {
          statusCode: res.status,
          data: res.data
        };
      } catch (err) {
        return {
          statusCode: err.response.status,
          errorMessage: err.response.data.error.message
        };
      }
    }
  };

  public broadcastLocally = async (txHex: string): Promise<any> => {
    try {
      const txHash = await this.client.sendRawTransaction(txHex);
      return txHash;
    } catch (err) {
      console.log("An error occured while broadcasting", err);
    }
  };

  public decodeTransaction = async (txHash: string): Promise<void> => {
    if (this.network === bitcoinJS.networks.testnet) {
      const { data } = await axios.post(TESTNET.TX_DECODE, { hex: txHash });
      console.log(JSON.stringify(data, null, 4));
    } else {
      const { data } = await axios.post(MAINNET.TX_DECODE, { hex: txHash });
      console.log(JSON.stringify(data, null, 4));
    }
  };

  public recoverInputsFromTxHex = async (txHex: string) => {
    const regenTx: Transaction = bitcoinJS.Transaction.fromHex(txHex);
    const recoveredInputs = [];
    await Promise.all(
      regenTx.ins.map(async inp => {
        const txId = inp.hash
          .toString("hex")
          .match(/.{2}/g)
          .reverse()
          .join("");
        const vout = inp.index;
        const data = await this.fetchTransactionDetails(txId);
        const value = data.outputs[vout].value;
        recoveredInputs.push({ txId, vout, value });
      })
    );
    return recoveredInputs;
  };

  public fromOutputScript = output => {
    return bitcoinJS.address.fromOutputScript(output, this.network);
  };

  public cltvCheckSigOutput = (keyPair, lockTime) => {
    return bitcoinJS.script.compile([
      bitcoinJS.script.number.encode(lockTime),
      bitcoinJS.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoinJS.opcodes.OP_DROP,
      keyPair.publicKey,
      bitcoinJS.opcodes.OP_CHECKSIG
    ]);
  };

  public createTLC = async (
    keyPair: ECPair,
    time: number,
    blockHeight: number
  ): Promise<any> => {
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
      network: this.network
    });

    return {
      address: p2sh.address,
      lockTime
    };
  };
}
