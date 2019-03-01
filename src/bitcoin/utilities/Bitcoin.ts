import axios, { AxiosResponse } from "axios";
import bip32 from "bip32";
import bip39 from "bip39";
import bip65 from "bip65";
import Client from "bitcoin-core";
import bitcoinJS, {
  ECPair,
  Network,
  Transaction,
  TransactionBuilder
} from "bitcoinjs-lib";
import coinselect from "coinselect";
import request from "superagent";
import config from "../Config";

const { TESTNET, MAINNET } = config.API_URLS;

export default class Bitcoin {
  public network: Network;
  public client: Client;
  constructor() {
    this.network = config.NETWORK;
    this.client = new Client({
      network: "testnet",
      username: "parsh",
      password: "6fAFgA77liXshpoMQKx4RrsLKcCClTo33MUBQ27rsuo=",
      // host: "0b4f4482.ngrok.io",
      port: 18332
    });
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

    let res: AxiosResponse;
    if (this.network === bitcoinJS.networks.testnet) {
      try {
        res = await axios.get(`${TESTNET.BALANCE_CHECK}${address}`);
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
        res = await axios.get(`${MAINNET.BALANCE_CHECK}${address}`);
      } catch (err) {
        console.log("Error:", err.response.data);
        return {
          statusCode: err.response.status,
          errorMessage: err.response.data
        };
      }
    }

    const { final_balance, total_received } = res.data[address];
    return {
      statusCode: res.status,
      final_balance,
      total_received
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

  public fundTestNetAddress = async (
    address: string,
    amount: number
  ): Promise<any> =>
    request // blockcypher faucet doesn't seems to work (insufficient balance in faucet)
      .post(`${TESTNET.FUND.URL}${TESTNET.FUND.TOKEN}`)
      .send({ address, amount })
      .end((err, res) => {
        if (err) {
          console.log(err);
        }
        console.log(res);
      });

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
        `${TESTNET.UNSPENT_OUTPUTS}${address}`
      );
      data = res.data;
    } else {
      const res: AxiosResponse = await axios.get(
        `${MAINNET.UNSPENT_OUTPUTS}${address}`
      );
      data = res.data;
    }

    let { unspent_outputs } = data;
    if (unspent_outputs.length === 0) {
      throw new Error("No UTXO found for the supplied address");
    }

    unspent_outputs = unspent_outputs.map(unspent => ({
      txId: unspent.tx_hash_big_endian,
      vout: unspent.tx_output_n,
      value: unspent.value
    }));
    return unspent_outputs;
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

  public createTransaction = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    nSequence?: number
  ): Promise<{ inputs: object[]; txb: TransactionBuilder }> => {
    const inputUTXOs = await this.fetchUnspentOutputs(senderAddress);
    const outputUTXOs = [{ address: recipientAddress, value: amount }];
    const chainInfo = await this.fetchChainInfo();

    const highFeePerByte: number = chainInfo.high_fee_per_kb / 1000;
    console.log("Fee rate:", highFeePerByte);
    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      Math.round(highFeePerByte)
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
      txb
    };
  };

  public createPartialTransaction = async (
    multiSigAddress: string
  ): Promise<any> => {
    const inputs = await this.fetchUnspentOutputs(multiSigAddress);
    const chainInfo = await this.fetchChainInfo();

    const highFeePerByte: number = chainInfo.high_fee_per_kb / 1000;
    console.log("Fee rate:", highFeePerByte);

    const txb: TransactionBuilder = new bitcoinJS.TransactionBuilder(
      this.network
    );

    inputs.forEach(input => txb.addInput(input.txId, input.vout));

    return {
      inputs,
      txb
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
    let res: AxiosResponse;
    try {
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
  };

  public broadcastLocally = async (txHex: string): Promise<any> => {
    // to send txn via cli: (while bitcoind --testnet is running) bitcoin-cli --testnet sendrawtransaction <txHex>

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

  public fromOutputScript = (output, network) => {
    try {
      return bitcoinJS.payments.p2pkh({ output, network }).address;
    } catch (e) {}
    try {
      return bitcoinJS.payments.p2sh({ output, network }).address;
    } catch (e) {}

    try {
      return bitcoinJS.payments.p2wpkh({ output, network }).address;
    } catch (e) {}
    try {
      return bitcoinJS.payments.p2wsh({ output, network }).address;
    } catch (e) {}

    throw new Error(output + " has no matching Address");
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

class SmokeTest {
  public bitcoin: Bitcoin;
  constructor() {
    this.bitcoin = new Bitcoin();
  }

  public testnetTxn = async (): Promise<void> => {
    const privateKey = this.bitcoin.generateTestnetKeys(this.bitcoin.rng1);
    const keyPair = this.bitcoin.getKeyPair(privateKey);
    const p2sh = this.bitcoin.getP2SH(keyPair);
    console.log({ privateKey, keyPair, p2sh });

    // checking available funds against the given address
    const balance = await this.bitcoin.checkBalance(p2sh.address);
    console.log("Balance:", balance);

    // const outputUTXOs = [{ address: getAddress(generateTestnetKeys(), multiSig.network), value: 3e4 }];
    const txnObj = await this.bitcoin.createTransaction(
      p2sh.address,
      this.bitcoin.getAddress(
        this.bitcoin.getKeyPair(
          this.bitcoin.generateTestnetKeys(this.bitcoin.rng2)
        )
      ),
      3e4
    );
    console.log("Transaction Object:", txnObj);

    const txb = this.bitcoin.signTransaction(
      txnObj.inputs,
      txnObj.txb,
      [keyPair],
      p2sh.redeem.output
    );

    const txn = txb.build();
    console.log(txn);
    const txHex = txn.toHex();
    console.log("Transaction Hex", txHex);
    const res = await this.bitcoin.broadcastTransaction(txHex);
    console.log(res);
  };

  public testnetMSigAssets = async () => {
    const privateKeys = [
      this.bitcoin.generateTestnetKeys(this.bitcoin.rng1),
      this.bitcoin.generateTestnetKeys(this.bitcoin.rng2)
    ];
    const keyPairs = privateKeys.map(privateKey =>
      this.bitcoin.getKeyPair(privateKey)
    );
    // console.log({ privateKeys, keyPairs });
    const pubKeys = keyPairs.map(keyPair => keyPair.publicKey);
    const multiSig = this.bitcoin.generateMultiSig(keyPairs.length, pubKeys);

    // Using same testnet addresses to derive a deterministic multisig address
    // which is explicitly funded
    console.log("MultiSig Address", multiSig.address);

    // checking for funds in the multiSig
    const balance = await this.bitcoin.checkBalance(multiSig.address);
    console.log("MultiSig Balance:", balance);

    // await fundTestNetAddress(multiSig.address, 1e5); (api not working at this moment)
    // fetchUnspentOutputs(multiSig.network, multiSig.address).then(console.log);

    // const outputUTXOs = [{ address: getAddress(generateTestnetKeys(), multiSig.network), value: 3e4 }];
    const txnObj = await this.bitcoin.createTransaction(
      multiSig.address,
      this.bitcoin.getAddress(
        this.bitcoin.getKeyPair(
          this.bitcoin.generateTestnetKeys(this.bitcoin.rng1)
        )
      ),
      4e3
    );
    console.log("Transaction Object:", txnObj);
    return { txnObj, keyPairs, multiSig };
  };

  public testingMultiSigTransaction = async (): Promise<void> => {
    const { txnObj, keyPairs, multiSig } = await this.testnetMSigAssets();

    const txb = this.bitcoin.signTransaction(
      txnObj.inputs,
      txnObj.txb,
      keyPairs,
      multiSig.p2sh.redeem.output,
      multiSig.p2wsh.redeem.output
    );

    const txHex = txb.build().toHex();
    console.log("Transaction Hex", txHex);
    const res = await this.bitcoin.broadcastTransaction(txHex);
    console.log(res);
    // decodeTransaction(txnHash);
  };

  // testnetTxn();
  // testnetMultiSigTxn();

  public testingTimelocks = async (numberOfBlocks: number) => {
    const privateKey = this.bitcoin.generateTestnetKeys(this.bitcoin.rng1);

    const keyPair = this.bitcoin.getKeyPair(privateKey);

    const { address, lockTime } = await this.bitcoin.createTLC(
      keyPair,
      null,
      numberOfBlocks
    );
    return { address, lockTime, privateKey };
  };

  public transferFromTLC = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    lockTime: number,
    privateKey: string
  ) => {
    const { final_balance } = await this.bitcoin.checkBalance(senderAddress);
    const { height } = await this.bitcoin.fetchChainInfo();
    console.log({ height, lockTime, balance: final_balance });

    if (final_balance < amount + 1000) {
      console.log(
        "Not enough balance to accomodate for the transfer amount and mining fee"
      );
      return;
    }
    if (height < lockTime) {
      // considering that we are only using block height based timelocks
      console.log(
        `${lockTime - height} block(s) remaining for the UTXO to be spendable`
      );
      return;
    }

    const { txb, inputs } = await this.bitcoin.createTransaction(
      senderAddress,
      recipientAddress,
      amount,
      0xfffffffe
    );
    console.log("---- Transaction Created ----");

    const keyPair1 = this.bitcoin.getKeyPair(privateKey);

    txb.setLockTime(lockTime);
    const tx = txb.buildIncomplete();
    const redeemScript = this.bitcoin.cltvCheckSigOutput(keyPair1, lockTime);

    console.log({ redeemScript: redeemScript.toString("hex") });
    const hashType = bitcoinJS.Transaction.SIGHASH_ALL;
    const signatureHash = tx.hashForSignature(0, redeemScript, hashType);

    const unlockingScript = bitcoinJS.script.compile([
      bitcoinJS.script.signature.encode(keyPair1.sign(signatureHash), hashType)
    ]);

    const redeemScriptSig = bitcoinJS.payments.p2sh({
      redeem: {
        input: unlockingScript,
        output: redeemScript,
        network: this.bitcoin.network
      },
      network: this.bitcoin.network
    }).input;
    tx.setInputScript(0, redeemScriptSig);

    console.log("---- Transaction Signed ----");
    console.log(tx);
    const txHex = tx.toHex();
    console.log({ txHex });
    const res = await this.bitcoin.broadcastTransaction(txHex);
    console.log("---- Transaction Broadcasted ----");
    return res;
  };

  public testingPartialTxn = async () => {
    const privateKeys = [
      this.bitcoin.generateTestnetKeys(this.bitcoin.rng1),
      this.bitcoin.generateTestnetKeys(this.bitcoin.rng2)
    ];
    const keyPairs = privateKeys.map(privateKey =>
      this.bitcoin.getKeyPair(privateKey)
    );
    // console.log({ privateKeys, keyPairs });
    const pubKeys = keyPairs.map(keyPair => keyPair.publicKey);
    const multiSig = this.bitcoin.generateMultiSig(keyPairs.length, pubKeys);

    // Using same testnet addresses to derive a deterministic multisig address
    // which is explicitly funded
    console.log("MultiSig Address", multiSig.address);

    // checking for funds in the multiSig
    const balance = await this.bitcoin.checkBalance(multiSig.address);
    console.log("MultiSig Balance:", balance);

    const { inputs, txb } = await this.bitcoin.createPartialTransaction(
      multiSig.address
    );
    console.log("------------------");
    console.log("Unsigned Partial Txn:", txb.buildIncomplete());
    const tx = this.bitcoin.signPartialTxn(
      inputs,
      txb,
      keyPairs,
      multiSig.p2sh.redeem.output,
      multiSig.p2wsh.redeem.output
    );

    console.log("Signed Partial Txn:", tx.toHex());
  };

  public recoverableMultiSigs = (pointer: number) => {
    if (this.bitcoin.network === bitcoinJS.networks.bitcoin) {
      const mnemonic1 =
        "discover scorpion response syrup rough swear pass skirt slot peanut physical juice end olympic thunder section grow wide vicious pear venture close orient royal";

      const mnemonic2 =
        "laugh world burst auction pride miracle muscle reflect truth steak opera bulb again    trend soccer field sign fiber dream muffin sun wine sell knife";

      const gaXpub = bip32.fromBase58(
        "xpub7ByyA3Xt3nTXUtx9WQskXSiemfjFCP7o1JyBf8fHpmvqPzFuLeYCAVxEWTAaBkUECRftmM21eKGwsHjKdf1du4vwLoYBgkpCrEwPhsPCAbR"
      );

      const seed1 = bip39.mnemonicToSeed(mnemonic1);
      const root1 = bip32.fromSeed(seed1);

      const seed2 = bip39.mnemonicToSeed(mnemonic2);
      const root2 = bip32.fromSeed(seed2);

      const path = config.WALLET_XPUB_PATH + pointer;

      const childXpriv1 = root1.derivePath(path);
      const childXpriv2 = root2.derivePath(path);
      const gachildXpub = gaXpub.derivePath("m/" + pointer);

      const childPub1 = childXpriv1.publicKey.toString("hex");
      const childPub2 = childXpriv2.publicKey.toString("hex");
      const gaChildPub = gachildXpub.publicKey.toString("hex");

      const pubs = [gaChildPub, childPub1, childPub2];
      console.log({ gaChildPub, childPub1, childPub2 });

      const bitcoin = new Bitcoin();
      const multiSig = bitcoin.generateMultiSig(2, pubs);
      console.log({ multiSigAddress: multiSig.address });
    } else {
      // const wallet1 = await this.bitcoin.createHDWallet();
      // const mnemonic1 = wallet1.mnemonic;
      const primaryMnemonic =
        "much false truck sniff extend infant pony venture path imitate tongue pluck";
      // const wallet2 = await this.bitcoin.createHDWallet();
      // const mnemonic2 = wallet2.mnemonic;
      const secondaryMnemonic =
        "frost drive safe pause come apology jungle fortune myself stable talent country";
      // const bhWallet = await this.bitcoin.createHDWallet();
      // const mnemonicBH = bhWallet.mnemonic;
      const bhMnemonic =
        "aware illness leaf birth raise puzzle start search vivid nephew accuse tank";

      const primarySeed = bip39.mnemonicToSeed(primaryMnemonic);
      const primaryRoot = bip32.fromSeed(primarySeed, this.bitcoin.network);

      const secondarySeed = bip39.mnemonicToSeed(secondaryMnemonic);
      const secondaryRoot = bip32.fromSeed(secondarySeed, this.bitcoin.network);

      const path = config.WALLET_XPUB_PATH + pointer;

      const primaryChildXpriv = primaryRoot.derivePath(path);
      const secondaryChildXpriv = secondaryRoot.derivePath(path);

      const bhSeed = bip39.mnemonicToSeed(bhMnemonic);
      const bhRoot = bip32.fromSeed(bhSeed, this.bitcoin.network);
      // const childBHXPub = bhRoot.derivePath(config.BH_XPUB_PATH);
      const xpubBH = bhRoot.neutered();
      xpubBH.index = 1;
      console.log({ xpubBH: xpubBH.toBase58() });
      // const xpubBH = bip32.fromBase58(
      //   "tpubD6NzVbkrYhZ4a8d969JrFHNcDMHyTnpbnfTzs5CVoFsiK6E7tgPjTrnTCuV1nM5eQsWWSYZnszsbQki3yvr8D9DkHeGnnA4SUkuNjoBWJNC",
      // ); // this is the master XPub
      const childXpubBH = xpubBH.derivePath("m/" + pointer);
      const correspondingXpriv = bhRoot.derivePath("m/" + pointer);

      const primaryChildPub = primaryChildXpriv.publicKey.toString("hex");
      const secondaryChildPub = secondaryChildXpriv.publicKey.toString("hex");
      const childPubBH = childXpubBH.publicKey.toString("hex");

      const pubs = [childPubBH, primaryChildPub, secondaryChildPub];
      console.log({ childPubBH, primaryChildPub, secondaryChildPub });

      const bitcoin = new Bitcoin();
      const multiSig = bitcoin.generateMultiSig(2, pubs);
      console.log({ multiSigAddress: multiSig.address });
      return {
        multiSig,
        primaryChildXpriv,
        bhXpriv: correspondingXpriv,
        secondaryChildXpriv
      };
    }
  };
  public testingCollabTxn = async () => {
    // none of the present api's, as can be seen from the error thrown below,
    // seems to work therefore we'll be using our own testnet to broadcast the raw txn.

    const { txnObj, keyPairs, multiSig } = await this.testnetMSigAssets();

    const txb = this.bitcoin.signTransaction(
      txnObj.inputs,
      txnObj.txb,
      [keyPairs[0]],
      multiSig.p2sh.redeem.output,
      multiSig.p2wsh.redeem.output
    );

    const txHex = txb.buildIncomplete().toHex();
    console.log("Transaction Hex", txHex);

    const regenTx: Transaction = bitcoinJS.Transaction.fromHex(txHex);
    console.log({ regenTx });
    const regenIns = regenTx.ins;
    console.log("Ins:", regenIns);

    const regenTxb: TransactionBuilder = bitcoinJS.TransactionBuilder.fromTransaction(
      regenTx,
      this.bitcoin.network
    );
    console.log({ regenTxb });
    // console.log({ bhRoot });
    // regenTxb.sign(
    //   0,
    //   keyPairs[1],
    //   multiSig.p2sh.redeem.output,
    //   null,
    //   3e3,
    //   multiSig.p2wsh.redeem.output,
    // );

    const regenSignTx = this.bitcoin.signTransaction(
      txnObj.inputs,
      regenTxb,
      [keyPairs[1]],
      multiSig.p2sh.redeem.output,
      multiSig.p2wsh.redeem.output
    );

    console.log("---- Transaction Signed by User (2 for 2/3 Sigs)----");
    const reHex = regenSignTx.build().toHex();
    console.log(reHex);

    // broadcasting via smartbit api due to issues in blocypher
    await this.bitcoin.broadcastTransaction(txHex);
  };

  public testingServerless2FACollabTxn = async () => {
    const { multiSig, primaryChildXpriv, bhXpriv } = this.recoverableMultiSigs(
      0
    );
    const senderAddress = multiSig.address;
    console.log({ senderAddress });
    const recipientAddress = "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL";
    const amount = 5000;

    const balance = await this.bitcoin.checkBalance(senderAddress);
    console.log({ balance });
    if (parseInt(balance.final_balance, 10) <= amount) {
      // logic for fee inclusion can also be accomodated
      throw new Error("Insufficient balance");
    }

    const { inputs, txb } = await this.bitcoin.createTransaction(
      senderAddress,
      recipientAddress,
      amount
    );

    console.log("---- Transaction Created ----");

    const signedTxb = this.bitcoin.signTransaction(
      inputs,
      txb,
      [primaryChildXpriv],
      multiSig.p2sh.redeem.output,
      multiSig.p2wsh.redeem.output
    );
    console.log("---- Transaction Signed by User (1 for 2/3 MultiSig)----");
    const txHex = signedTxb.buildIncomplete().toHex();
    console.log(txHex);

    // reconstructing and signing the transaction from the txHex (executed @Server)
    const regenTx: Transaction = bitcoinJS.Transaction.fromHex(txHex);
    console.log({ regenTx });
    const regenIns = regenTx.ins;
    console.log("Ins:", regenIns);

    const recoveredInputs = [];
    await Promise.all(
      regenIns.map(async inp => {
        const txId = inp.hash
          .toString("hex")
          .match(/.{2}/g)
          .reverse()
          .join("");
        const vout = inp.index;
        console.log(txId);
        const data = await this.bitcoin.fetchTransactionDetails(txId);
        const value = data.outputs[vout].value;
        recoveredInputs.push({ txId, vout, value });
      })
    );

    const recoveredScripts = {
      p2sh: regenTx.ins[0].script.slice(1), // slicing because the first element of the buffer isn't actually a part of the redeem script
      p2wsh: regenTx.ins[0].witness[4]
    };

    console.log({ recoveredScripts });
    const regenTxb: TransactionBuilder = bitcoinJS.TransactionBuilder.fromTransaction(
      regenTx,
      this.bitcoin.network
    );
    console.log({ regenTxb });

    const regenSignTx = this.bitcoin.signTransaction(
      recoveredInputs,
      regenTxb,
      [bhXpriv],
      recoveredScripts.p2sh,
      recoveredScripts.p2wsh
    );
    console.log("---- Transaction Signed by User (2 for 2/3 MultiSig)----");
    const reHex = regenSignTx.build().toHex();
    console.log(reHex);

    // this.bitcoin.broadcastLocally(reHex).then(console.log);
    const res = await this.bitcoin.broadcastTransaction(reHex); // broadcasting api functional
    console.log(res);
  };
}

////////// SMOKE TEST ZONE /////////////////

// const bitcoin = new Bitcoin();
// bitcoin.fetchUnspentOutputs('15QcWutP4pY527grztH7ispWqDsC6p6CeP').then(console.log);

// bitcoin.fundTestNetAddress(bitcoin.getAddress(bitcoin.getKeyPair(bitcoin.generateTestnetKeys())), 3000);

// bitcoin
//   .fetchAddressInfo("2NFb3TpSctXBdax6pJaPaAuJG9tKzuihCrz")
//   .then(console.log);

// bitcoin.checkBalance('2NFb3TpSctXBdax6pJaPaAuJG9tKzuihCrz').then(console.log);

// bitcoin.fetchChainInfo().then(console.log);

// const smokeTest = new SmokeTest();
// smokeTest.testnetTxn();
// smokeTest.testnetMultiSigTxn();

// const smokeTest = new SmokeTest();
// // // smokeTest.testingCollabTxn();
// smokeTest.testingServerless2FACollabTxn();

// const smokeTest = new SmokeTest();
// smokeTest.testingTimelocks(parseInt(process.argv[2], 10)).then(console.log);

// const transferDetails = {
//   senderAddress: "2NF1MwdvMXsEJVhStqeCLuQrGQwJjeZGJum",
//   recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
//   amount: 6000,
//   lockTime: 1454597,
//   privateKey1: "cRgnQe9MUu1JznntrLaoQpB476M8PURvXVQB5R2eqms5GBJesMcu",
// };
// smokeTest
//   .transferFromTLC(
//     transferDetails.senderAddress,
//     transferDetails.recipientAddress,
//     transferDetails.amount,
//     transferDetails.lockTime,
//     transferDetails.privateKey1,
//   )
//   .then(console.log);
