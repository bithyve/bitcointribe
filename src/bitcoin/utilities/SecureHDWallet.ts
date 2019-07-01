import { AxiosResponse } from "axios";
import bip32 from "bip32";
import bip39 from "bip39";
import bitcoinJS, { Network, TransactionBuilder } from "bitcoinjs-lib";
import coinselect from "coinselect";
import crypto from "crypto";
import config from "../Config";
import Bitcoin from "./Bitcoin";

const { BH_AXIOS } = config;

export default class SecureHDWallet extends Bitcoin {
  public primaryMnemonic: string;
  public secondaryMnemonic: string;
  public walletID: string;
  public xpubs: {
    primary: string;
    secondary: string;
    bh: string;
  };
  public network: Network;
  public consumedAddresses: string[];
  public nextFreeChildIndex: number;
  public primaryXpriv: string;
  public multiSigCache;
  public signingEssentialsCache;

  private cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  };

  constructor(
    primaryMnemonic: string,
    stateVars?: {
      secondaryMnemonic: string;
      consumedAddresses: string[];
      nextFreeChildIndex: number;
      multiSigCache: {};
      signingEssentialsCache: {};
      primaryXpriv: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
    },
  ) {
    super();
    this.primaryMnemonic = primaryMnemonic;
    const { walletId } = this.getWalletId();
    this.walletID = walletId;
    this.network = config.NETWORK;
    this.secondaryMnemonic = stateVars
      ? stateVars.secondaryMnemonic
      : bip39.generateMnemonic(256);
    this.consumedAddresses = stateVars ? stateVars.consumedAddresses : [];
    this.nextFreeChildIndex = stateVars ? stateVars.nextFreeChildIndex : 0;
    this.multiSigCache = stateVars ? stateVars.multiSigCache : {};
    this.signingEssentialsCache = stateVars
      ? stateVars.signingEssentialsCache
      : {};

    this.primaryXpriv = stateVars ? stateVars.primaryXpriv : undefined;
    this.xpubs = stateVars ? stateVars.xpubs : undefined;
    this.cipherSpec = {
      algorithm: "aes-192-cbc",
      salt: "bithyeSalt", // NOTE: The salt should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
      keyLength: 24,
      iv: Buffer.alloc(16, 0),
    };
  }

  public deriveChildXKey = (
    extendedKey: string,
    childIndex: number,
  ): string => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    const childXKey = xKey.derive(childIndex);
    return childXKey.toBase58();
  }

  public validateXpub = async (xpub: string) => {
    try {
      bip32.fromBase58(xpub, this.network);
      return true;
    } catch (err) {
      return false;
    }
  }

  public importBHXpub = async (
    token: number,
  ): Promise<{
    bhXpub: any;
  }> => {
    const { walletId } = this.getWalletId();

    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("importBHXpub", {
        token,
        walletID: walletId,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    return {
      bhXpub: res.data.bhXpub,
    };
  }

  public getPub = (extendedKey: string): string => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    return xKey.publicKey.toString("hex");
  }

  public getWalletId = (): { walletId: string } => {
    const hash = crypto.createHash("sha512");
    const seed = bip39.mnemonicToSeed(this.primaryMnemonic);
    hash.update(seed);
    return { walletId: hash.digest("hex") };
  }

  public getSecondaryMnemonic = (): { secondaryMnemonic: string } => {
    return { secondaryMnemonic: this.secondaryMnemonic };
  }

  public getSecondaryXpub = (): { secondaryXpub: string } => {
    return { secondaryXpub: this.xpubs.secondary };
  }

  public getRecoverableXKey = (
    mnemonic: string,
    path: string,
    priv?: boolean,
  ): string => {
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

  public getAccountId = (): { accountId: string } => {
    const mutliSig = this.createSecureMultiSig(0);
    const { address } = mutliSig; // getting the first receiving address
    return {
      accountId: crypto
        .createHash("sha256")
        .update(address)
        .digest("hex"),
    };
  }

  public decryptSecondaryXpub = (encryptedSecXpub: string) => {
    const key = this.generateKey(
      bip39.mnemonicToSeed(this.primaryMnemonic).toString("hex"),
    );
    const decipher = crypto.createDecipheriv(
      this.cipherSpec.algorithm,
      key,
      this.cipherSpec.iv,
    );
    let decrypted = decipher.update(encryptedSecXpub, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const secondaryXpub = decrypted;
    if (this.validateXpub(secondaryXpub)) {
      return { secondaryXpub };
    } else {
      throw new Error("Secondary Xpub is either tampered or is invalid");
    }
  }

  public checkHealth = async (
    chunk: string,
    pos: number,
  ): Promise<{ isValid: boolean }> => {
    if (chunk.length !== config.SCHUNK_SIZE) {
      throw new Error("Invalid number of characters");
    }

    const { walletId } = this.getWalletId();
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("checkSecureHealth", {
        chunk,
        pos,
        walletID: walletId,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    return { isValid: res.data.isValid };
  }

  public binarySearchIterationForConsumedAddresses = async (
    index: number,
    maxUsedIndex: number = 0,
    minUnusedIndex: number = 100500100,
    depth: number = 0,
  ) => {
    console.log({ depth });
    if (depth >= 20) {
      return maxUsedIndex + 1;
    } // fail

    const multiSig = this.createSecureMultiSig(index);
    const txs = await this.fetchTransactionsByAddresses([multiSig.address]);

    console.log(txs);
    if (txs.transactions.totalTransactions === 0) {
      console.log({ index });
      if (index === 0) {
        return 0;
      }
      minUnusedIndex = Math.min(minUnusedIndex, index); // set
      index = Math.floor((index - maxUsedIndex) / 2 + maxUsedIndex);
    } else {
      maxUsedIndex = Math.max(maxUsedIndex, index); // set
      const nextMultiSig = this.createSecureMultiSig(index + 1);
      const txs2 = await this.fetchTransactionsByAddresses([
        nextMultiSig.address,
      ]);
      if (txs2.transactions.totalTransactions === 0) {
        return index + 1;
      } // thats our next free address

      index = Math.round((minUnusedIndex - index) / 2 + index);
    }

    return this.binarySearchIterationForConsumedAddresses(
      index,
      maxUsedIndex,
      minUnusedIndex,
      depth + 1,
    );
  }

  public fetchBalance = async (): Promise<{
    balance: number;
    unconfirmedBalance: number;
  }> => {
    try {
      console.log("Executing consumed binary search");
      this.nextFreeChildIndex = await this.binarySearchIterationForConsumedAddresses(
        100,
      );

      this.consumedAddresses = [];
      // generating all consumed addresses:
      for (let itr = 0; itr < this.nextFreeChildIndex; itr++) {
        const multiSig = this.createSecureMultiSig(itr);
        this.consumedAddresses.push(multiSig.address);
      }

      console.log(this.consumedAddresses);
      const { balance, unconfirmedBalance } = await this.getBalanceByAddresses(
        this.consumedAddresses,
      );
      return { balance, unconfirmedBalance };
    } catch (err) {
      throw new Error(`Unable to get balance: ${err.message}`);
    }
  }

  public fetchTransactions = async (): Promise<{
    transactions: {
      totalTransactions: number;
      confirmedTransactions: number;
      unconfirmedTransactions: number;
      transactionDetails: any[];
      address: string;
    };
  }> => {
    if (this.consumedAddresses.length === 0) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    return await this.fetchTransactionsByAddresses(this.consumedAddresses);
  }

  public fetchUtxo = async (): Promise<
    Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>
  > => {
    if (this.consumedAddresses.length === 0) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    const { UTXOs } = await this.multiFetchUnspentOutputs(
      this.consumedAddresses,
    );
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

  public getReceivingAddress = async (): Promise<{ address: string }> => {
    try {
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

        const txs = await this.fetchTransactionsByAddresses([address]);
        const { totalTransactions } = txs.transactions;

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
        const multiSig = this.createSecureMultiSig(
          this.nextFreeChildIndex + itr,
        );
        freeAddress = multiSig.address; // not checking this one, it might be free
        this.nextFreeChildIndex += itr + 1;
      }
      return { address: freeAddress };
    } catch (err) {
      throw new Error(`Unable to generate receiving address: ${err.message}`);
    }
  }

  public derivePath = (bhXpub: string): string => {
    const bhxpub = bip32.fromBase58(bhXpub, this.network);
    let path;
    if (bhxpub.index === 0) {
      path = config.SECURE_DERIVATION_BRANCH;
    } else {
      path = config.SECURE_WALLET_XPUB_PATH + config.SECURE_DERIVATION_BRANCH;
    }
    return path;
  }

  public prepareSecureAccount = (
    bhXpub: string,
    secondaryXpub?: string,
  ): { prepared: boolean } => {
    try {
      const path = this.derivePath(bhXpub);
      const primaryXpub = this.getRecoverableXKey(this.primaryMnemonic, path);

      if (!secondaryXpub) {
        secondaryXpub = this.getRecoverableXKey(this.secondaryMnemonic, path);
      }

      this.primaryXpriv = this.getRecoverableXKey(
        this.primaryMnemonic,
        path,
        true,
      );

      this.xpubs = {
        primary: primaryXpub,
        secondary: secondaryXpub,
        bh: bhXpub,
      };

      return {
        prepared: true,
      };
    } catch (err) {
      return {
        prepared: false,
      };
    }
  }

  public createSecureMultiSig = (
    childIndex: number,
  ): {
    scripts: {
      redeem: string;
      witness: string;
    };
    address: string;
  } => {
    if (this.multiSigCache[childIndex]) {
      return this.multiSigCache[childIndex];
    } // cache hit

    console.log(`creating multiSig against index: ${childIndex}`);

    const childPrimaryPub = this.getPub(
      this.deriveChildXKey(this.xpubs.primary, childIndex),
    );
    const childRecoveryPub = this.getPub(
      this.deriveChildXKey(this.xpubs.secondary, childIndex),
    );
    const childBHPub = this.getPub(
      this.deriveChildXKey(this.xpubs.bh, childIndex),
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

  public setupSecureAccount = async (): Promise<{
    setupData: {
      qrData: string;
      secret: string;
      bhXpub: string;
      xIndex: number;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.get("setup2FA");
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const setupData = res.data;
    const { prepared } = this.prepareSecureAccount(res.data.bhXpub);
    if (prepared) {
      return { setupData };
    } else {
      throw new Error("Something went wrong; unable to setup secure account");
    }
  }

  public validateSecureAccountSetup = async (
    token: number,
    secret: string,
    xIndex: number,
  ): Promise<{
    setupSuccessful: boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("validate2FASetup", {
        token,
        secret,
        xIndex,
        walletID: this.walletID,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    const { setupSuccessful } = res.data;
    return {
      setupSuccessful,
    };
  }

  public isActive = async (): Promise<{ isActive: boolean }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post("isSecureActive", {
        walletID: this.walletID,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }
    return res.data;
  }

  public sortOutputs = async (
    outputs: Array<{
      address: string;
      value: number;
    }>,
  ): Promise<
    Array<{
      address: string;
      value: number;
    }>
  > => {
    for (const output of outputs) {
      if (!output.address) {
        const { address } = await this.getReceivingAddress();
        output.address = address;
        console.log(`adding the change address: ${output.address}`);
      }
    }

    console.log({ unsortedOutputs: outputs });
    outputs.sort((out1, out2) => {
      if (out1.address < out2.address) {
        return -1;
      }
      if (out1.address > out2.address) {
        return 1;
      }
      return 0;
    });
    console.log({ sortedOutputs: outputs });

    return outputs;
  }

  public createSecureHDTransaction = async (
    recipientAddress: string,
    amount: number,
    txnPriority?: string,
    nSequence?: number,
  ): Promise<
    | {
        fee: number;
        inputs?: undefined;
        txb?: undefined;
      }
    | {
        inputs: Array<{
          txId: string;
          vout: number;
          value: number;
          address: string;
        }>;
        txb: bitcoinJS.TransactionBuilder;
        fee: number;
      }
  > => {
    try {
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

      if (!inputs) {
        // insufficient input utxos to compensate for output utxos + fee
        return { fee };
      }

      const txb: TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      );

      inputs.forEach((input) => txb.addInput(input.txId, input.vout, nSequence));
      const sortedOuts = await this.sortOutputs(outputs);
      sortedOuts.forEach((output) => {
        console.log("Adding Output:", output);
        txb.addOutput(output.address, output.value);
      });

      return {
        inputs,
        txb,
        fee,
      };
    } catch (err) {
      throw new Error(`Transaction creation failed: ${err.message}`);
    }
  }

  public signHDTransaction = (
    inputs: any,
    txb: TransactionBuilder,
  ): {
    signedTxb: TransactionBuilder;
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>;
  } => {
    try {
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
    } catch (err) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  }

  public txnCreationAndInitialSigning = async (
    recipientAddress: string,
    amount: number,
  ): Promise<{
    txHex: string;
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>;
  }> => {
    try {
      if (this.isValidAddress(recipientAddress)) {
        amount = amount * 1e8; // converting into sats
        const { balance } = await this.fetchBalance();

        console.log("---- Creating Transaction ----");
        const { inputs, txb, fee } = await this.createSecureHDTransaction(
          recipientAddress,
          amount,
        );

        console.log("---- Transaction Created ----");

        if (balance < amount + fee) {
          throw new Error(
            "Insufficient balance to compensate for transfer amount and the txn fee",
          );
        }

        const { signedTxb, childIndexArray } = await this.signHDTransaction(
          inputs,
          txb,
        );

        const txHex = signedTxb.buildIncomplete().toHex();

        console.log(
          "---- Transaction signed by the user (1st sig for 2/3 MultiSig)----",
        );

        return { txHex, childIndexArray };
      } else {
        throw new Error("Recipient address is wrong");
      }
    } catch (err) {
      throw new Error(`Unable to transfer: ${err.message}`);
    }
  }

  public serverSigningAndBroadcast = async (
    token: number,
    txHex: string,
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>,
  ): Promise<{
    txid: string;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await BH_AXIOS.post("secureHDTransaction", {
          walletID: this.walletID,
          token,
          txHex,
          childIndexArray,
        });
      } catch (err) {
        throw new Error(err.response.data.err);
      }

      console.log(
        "---- Transaction Signed by BH Server (2nd sig for 2/3 MultiSig)----",
      );

      console.log({ txHex: res.data.txHex });
      console.log("------ Broadcasting Transaction --------");

      const { txid } = await this.broadcastTransaction(res.data.txHex);
      return { txid };
    } catch (err) {
      throw new Error(`Unable to transfer: ${err.message}`);
    }
  }

  private generateKey = (psuedoKey: string): string => {
    const hashRounds = 5048;
    let key = psuedoKey;
    for (let itr = 0; itr < hashRounds; itr++) {
      const hash = crypto.createHash("sha512");
      key = hash.update(key).digest("hex");
    }
    return key.slice(key.length - this.cipherSpec.keyLength);
  }
}
