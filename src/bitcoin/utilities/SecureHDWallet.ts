import axios from "axios";
import bip32 from "bip32";
import bip39 from "bip39";
import bitcoinJS, { TransactionBuilder } from "bitcoinjs-lib";
import coinselect from "coinselect";
import crypto from "crypto";
import config from "../Config";
import Bitcoin from "./Bitcoin";

export default class SecureHDWallet extends Bitcoin {
  public primaryMnemonic: string;
  public recoveryMnemonic: string;
  public walletID: string;
  public xpubs;
  public path: string;
  public network;
  public consumedAddresses: string[];
  public nextFreeChildIndex: number;
  public primaryXpriv: string;
  public bhXpub: string;
  public multiSigCache;
  public signingEssentialsCache;

  constructor(primaryMnemonic: string) {
    super();
    this.primaryMnemonic = primaryMnemonic;
    this.recoveryMnemonic = bip39.generateMnemonic();
    this.network = config.NETWORK;
    this.xpubs = {};
    this.consumedAddresses = [];
    this.nextFreeChildIndex = 0;
    this.multiSigCache = {};
    this.signingEssentialsCache = {};
  }

  public deriveChildXKey = (extendedKey: string, childIndex: number) => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    const childXKey = xKey.derive(childIndex);
    return childXKey.toBase58();
  }

  public getPub = (extendedKey: string) => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    return xKey.publicKey.toString("hex");
  }

  public getRecoveryMnemonic = () => this.recoveryMnemonic;

  public getRecoverableXKey = (
    mnemonic: string,
    path: string,
    priv?: boolean,
  ) => {
    const seed = bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed, this.network);
    if (!priv) {
      const xpub = root
        .derivePath("m/" + path)
        .neutered()
        .toBase58();
      return xpub;
    } else {
      const xpriv = root.derivePath("m/" + path).toBase58();
      return xpriv;
    }
  }

  public fetchBalance = async () => {
    try {
      const binarySearchIterationForConsumedAddresses = async (
        index,
        maxUsedIndex = 0,
        minUnusedIndex = 100500100,
        depth = 0,
      ) => {
        console.log({ depth });
        if (depth >= 20) {
          return maxUsedIndex + 1;
        } // fail

        const multiSig = this.createSecureMultiSig(index);
        const txs = await this.fetchTransactionsByAddress(multiSig.address);

        console.log(txs);
        if (txs.totalTransactions === 0) {
          console.log({ index });
          if (index === 0) {
            return 0;
          }
          minUnusedIndex = Math.min(minUnusedIndex, index); // set
          index = Math.floor((index - maxUsedIndex) / 2 + maxUsedIndex);
        } else {
          maxUsedIndex = Math.max(maxUsedIndex, index); // set
          const nextMultiSig = this.createSecureMultiSig(index + 1);
          const txs2 = await this.fetchTransactionsByAddress(
            nextMultiSig.address,
          );
          if (txs2.totalTransactions === 0) {
            return index + 1;
          } // thats our next free address

          index = Math.round((minUnusedIndex - index) / 2 + index);
        }

        return binarySearchIterationForConsumedAddresses(
          index,
          maxUsedIndex,
          minUnusedIndex,
          depth + 1,
        );
      };

      console.log("Executing consumed binary search");
      this.nextFreeChildIndex = await binarySearchIterationForConsumedAddresses(
        100,
      );
      console.log(this.nextFreeChildIndex);
      this.consumedAddresses = [];

      // generating all consumed addresses:
      for (let itr = 0; itr < this.nextFreeChildIndex; itr++) {
        const multiSig = this.createSecureMultiSig(itr);
        this.consumedAddresses.push(multiSig.address);
      }

      console.log(this.consumedAddresses);
      const res = await this.getBalanceByAddresses(this.consumedAddresses);
      return res;
    } catch (err) {
      console.warn(err);
    }
  }

  public fetchTransactions = async () => {
    if (this.consumedAddresses.length === 0) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    const transactions = {
      status: 200, // mocking for now
      totalTransactions: 0,
      confirmedTransactions: 0,
      unconfirmedTransactions: 0,
      transactionDetails: [],
    };
    for (const address of this.consumedAddresses) {
      console.log(`Fetching transactions corresponding to ${address}`);
      const txns = await this.fetchTransactionsByAddress(address);
      transactions.totalTransactions += txns.totalTransactions;
      transactions.confirmedTransactions += txns.confirmedTransactions;
      transactions.unconfirmedTransactions += txns.unconfirmedTransactions;
      transactions.transactionDetails.push(...txns.transactionDetails);
    }

    return transactions;
  }

  public fetchUtxo = async () => {
    if (this.consumedAddresses.length === 0) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    const UTXOs = await this.multiFetchUnspentOutputs(this.consumedAddresses);
    return UTXOs;
  }

  public getSigningEssentials = (address: string) => {
    if (this.signingEssentialsCache[address]) {
      return this.signingEssentialsCache[address];
    } // cache hit

    for (let itr = 0; itr <= this.nextFreeChildIndex + 3; itr++) {
      const multiSig = this.createSecureMultiSig(itr);

      if (multiSig.address === address) {
        return (this.signingEssentialsCache[address] = {
          multiSig,
          keyPair: bip32.fromBase58(
            this.deriveChildXKey(this.primaryXpriv, itr),
            this.network,
          ),
          childIndex: itr,
        });
      }
    }

    throw new Error("Could not find WIF for " + address);
  }

  public getReceivingAddress = async () => {
    // looking for free external address
    let freeAddress = "";
    let itr;
    for (itr = 0; itr < Math.max(5, this.consumedAddresses.length); itr++) {
      if (this.nextFreeChildIndex + itr < 0) {
        continue;
      }
      const { address } = this.createSecureMultiSig(
        this.nextFreeChildIndex + itr,
      );

      const { totalTransactions } = await this.fetchTransactionsByAddress(
        address,
      );
      if (totalTransactions === 0) {
        // free address found
        freeAddress = address;
        this.nextFreeChildIndex += itr;
        break;
      }
    }

    if (!freeAddress) {
      // giving up as we could find a free address in the above cycle

      console.log(
        "Failed to find a free address in the above cycle, using the next address without checking",
      );
      const multiSig = this.createSecureMultiSig(this.nextFreeChildIndex + itr);
      freeAddress = multiSig.address; // not checking this one, it might be free
      this.nextFreeChildIndex += itr + 1;
    }
    return freeAddress;
  }

  public generateSecureAccAssets = async () => {
    const primaryXpub = this.getRecoverableXKey(
      this.primaryMnemonic,
      this.path,
    );
    const recoveryXpub = this.getRecoverableXKey(
      this.recoveryMnemonic,
      this.path,
    );

    this.primaryXpriv = this.getRecoverableXKey(
      this.primaryMnemonic,
      this.path,
      true,
    );

    this.xpubs = {
      primary: primaryXpub,
      recovery: recoveryXpub,
    };
    const hash = crypto.createHash("sha512");
    const seed = bip39.mnemonicToSeed(this.primaryMnemonic);
    hash.update(seed);
    this.walletID = hash.digest("hex");
  }

  public createSecureMultiSig = (childIndex) => {
    if (this.multiSigCache[childIndex]) {
      return this.multiSigCache[childIndex];
    } // cache hit

    console.log(`creating multiSig against index: ${childIndex}`);
    const childPrimaryPub = this.getPub(
      this.deriveChildXKey(this.xpubs.primary, childIndex),
    );
    const childRecoveryPub = this.getPub(
      this.deriveChildXKey(this.xpubs.recovery, childIndex),
    );
    // console.log({ bhXpub: this.bhXpub });
    const childBHPub = this.getPub(
      this.deriveChildXKey(this.bhXpub, childIndex),
    );

    // public keys should be aligned in the following way: [bhPub, primaryPub, recoveryPub]
    // for generating ga_recovery based recoverable multiSigs
    const pubs = [childBHPub, childPrimaryPub, childRecoveryPub];
    // console.log({ pubs });
    const multiSig = this.generateMultiSig(2, pubs);

    return (this.multiSigCache[childIndex] = {
      scripts: {
        redeem: multiSig.p2sh.redeem.output.toString("hex"),
        witness: multiSig.p2wsh.redeem.output.toString("hex"),
      },
      address: multiSig.address,
    });
  }

  public setupSecureAccount = async () => {
    let res;
    try {
      res = await axios.get(config.SERVER + "/setup2FA");
    } catch (err) {
      console.log("An error occured:", err);
      return {
        status: err.response.status,
        errorMessage: err.response.data,
      };
    }
    this.bhXpub = res.data.bhXpub;
    const bhxpub = bip32.fromBase58(this.bhXpub, this.network);
    if (bhxpub.index === 0) {
      this.path = config.DERIVATION_BRANCH;
    } else {
      this.path = config.WALLET_XPUB_PATH + config.DERIVATION_BRANCH;
    }
    await this.generateSecureAccAssets();

    return {
      status: res.status,
      data: { setupData: res.data },
    };
  }

  public validateSecureAccountSetup = async (token: number, secret: string) => {
    try {
      const res = await axios.post(config.SERVER + "/validate2FASetup", {
        token,
        secret,
        walletID: this.walletID,
      });
      return { status: res.status, data: res.data };
    } catch (err) {
      console.log("Error:", err.response.data);
      return {
        status: err.response.status,
        errorMessage: err.response.data,
      };
    }
  }

  public createSecureHDTransaction = async (
    recipientAddress: string,
    amount: number,
    nSequence?: number,
    txnPriority?: string,
  ): Promise<{ inputs: object[]; txb: TransactionBuilder; fee: number }> => {
    const inputUTXOs = await this.fetchUtxo();
    console.log("Input UTXOs:", inputUTXOs);
    const outputUTXOs = [{ address: recipientAddress, value: amount }];
    console.log("Output UTXOs:", outputUTXOs);
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

    for (const output of outputs) {
      if (!output.address) {
        output.address = await this.getReceivingAddress();
        console.log(`adding the change address: ${output.address}`);
      }
      console.log("Added Output:", output);
      txb.addOutput(output.address, output.value);
    }

    return {
      inputs,
      txb,
      fee,
    };
  }

  public signHDTransaction = (inputs: any, txb: TransactionBuilder): any => {
    console.log("------ Transaction Signing ----------");
    let vin = 0;
    const childIndexArray = [];
    inputs.forEach((input) => {
      console.log("Signing Input:", input);
      const { multiSig, keyPair, childIndex } = this.getSigningEssentials(
        input.address,
      );
      txb.sign(
        vin,
        keyPair,
        Buffer.from(multiSig.scripts.redeem, "hex"),
        null,
        input.value,
        Buffer.from(multiSig.scripts.witness, "hex"),
      );
      childIndexArray.push({
        childIndex,
        inputIdentifier: { txId: input.txId, vout: input.vout },
      });
      vin += 1;
    });

    return { signedTxb: txb, childIndexArray };
  }
}

const smokeRunner = async () => {
  const dummyMnemonic =
    "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
  const dummyBHXpub =
    "tpubDFe4ZoKYAQhR7JQq8s1AKqDeoGWE2Aovf2b4pqEE5Mt2HyqYMkq8AzHYU8zosVeSEf7EJtNGuTkDVqVrT8YjizbuvRttJMS6uRKabEA358d";
  const dummySecret = "JVSE63CKNZHHKUKHKRAVSVRSIIVUK6DX";
  const dummyRecoveryXpub =
    "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
  const transfer = {
    recipientAddress: "2NAwqcZHo2DW9c8Qs9Jxaat3jHW3aqsBpFs",
    amount: 9004007,
  };
  const secureWallet = new SecureHDWallet(dummyMnemonic);
  await secureWallet.setupSecureAccount();
  secureWallet.xpubs.recovery = dummyRecoveryXpub;
  secureWallet.bhXpub = dummyBHXpub;

  //   const balance = await secureWallet.fetchBalance(); // updates the consumed address list
  //   console.log(balance);
  //   const address = await secureWallet.getReceivingAddress();
  //   console.log({ address });
  //   return;

  const { inputs, txb } = await secureWallet.createSecureHDTransaction(
    transfer.recipientAddress,
    transfer.amount,
  );

  const { signedTxb, childIndexArray } = await secureWallet.signHDTransaction(
    inputs,
    txb,
  );
  const txHex = signedTxb.buildIncomplete().toHex();
  console.log({ txHex });

  console.log({ childIndexArray });
  console.log("Sending transaction to BH_Server for signing");
  const res = await axios.post(config.SERVER + "/secureHDTransaction", {
    walletID: this.walletID,
    txHex,
    childIndexArray,
  });

  console.log("Transaction Signed by BH Server");
  console.log({ txHex: res.data.txHex });

  console.log("------ Broadcasting Transaction --------");
  // const txHash = await this.bitcoin.broadcastLocally(data.txHex); // TODO: If API falls; globally expose the tesnet RPC (via ngRox maybe)
  const bRes = await secureWallet.broadcastTransaction(res.data.txHex);
  console.log(bRes);
};
