import { AxiosResponse } from 'axios';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import coinselect from 'coinselect';
import crypto from 'crypto';
import config from '../../Config';
import { Transactions } from '../Interface';
import Bitcoin from './Bitcoin';

const { BH_AXIOS, HEXA_ID, API_URLS } = config;

export default class SecureHDWallet extends Bitcoin {
  public twoFASetup: {
    qrData: string;
    secret: string;
  };
  public secondaryMnemonic: string;
  public xpubs: {
    primary: string;
    secondary: string;
    bh: string;
  };
  public balances: { balance: number; unconfirmedBalance: number } = {
    balance: 0,
    unconfirmedBalance: 0,
  };
  public receivingAddress: string = '';
  public transactions: Transactions = {
    totalTransactions: 0,
    confirmedTransactions: 0,
    unconfirmedTransactions: 0,
    transactionDetails: [],
  };

  private primaryMnemonic: string;
  private walletID: string;
  private consumedAddresses: string[];
  private nextFreeChildIndex: number;
  private primaryXpriv: string;
  private secondaryXpriv: string;
  private multiSigCache;
  private signingEssentialsCache;
  private gapLimit: number;
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
      secondaryXpriv?: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      twoFASetup: {
        qrData: string;
        secret: string;
      };
    },
    network?: bitcoinJS.Network,
  ) {
    super(network);
    this.primaryMnemonic = primaryMnemonic;
    const { walletId } = this.getWalletId();
    this.walletID = walletId;
    this.secondaryMnemonic = stateVars
      ? stateVars.secondaryMnemonic
      : bip39.generateMnemonic(256);
    this.consumedAddresses = stateVars ? stateVars.consumedAddresses : [];
    this.nextFreeChildIndex = stateVars ? stateVars.nextFreeChildIndex : 0;
    this.multiSigCache = stateVars ? stateVars.multiSigCache : {};
    this.signingEssentialsCache = stateVars
      ? stateVars.signingEssentialsCache
      : {};
    this.gapLimit = stateVars ? stateVars.gapLimit : config.GAP_LIMIT;

    this.primaryXpriv = stateVars ? stateVars.primaryXpriv : undefined;
    this.secondaryXpriv = stateVars ? stateVars.secondaryXpriv : undefined;
    this.xpubs = stateVars ? stateVars.xpubs : undefined;
    this.cipherSpec = {
      algorithm: 'aes-192-cbc',
      salt: 'bithyeSalt', // NOTE: The salt should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
      keyLength: 24,
      iv: Buffer.alloc(16, 0),
    };
    this.balances = stateVars ? stateVars.balances : this.balances;
    this.receivingAddress = stateVars
      ? stateVars.receivingAddress
      : this.receivingAddress;
    this.transactions = stateVars ? stateVars.transactions : this.transactions;
    this.twoFASetup = stateVars ? stateVars.twoFASetup : undefined;
  }

  public importBHXpub = async (
    token: number,
  ): Promise<{
    bhXpub: string;
  }> => {
    const { walletId } = this.getWalletId();

    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('importBHXpub', {
        HEXA_ID,
        token,
        walletID: walletId,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    return {
      bhXpub: res.data.bhXpub,
    };
  };

  public getWalletId = (): { walletId: string } => {
    const hash = crypto.createHash('sha256');
    const seed = bip39.mnemonicToSeedSync(this.primaryMnemonic);
    hash.update(seed);
    return { walletId: hash.digest('hex') };
  };

  public getSecondaryID = (secondaryMnemonic): { secondaryID: string } => {
    if (!this.secondaryMnemonic) {
      throw new Error(
        'SecondaryID generation failed; missing secondary mnemonic',
      );
    }
    const hash = crypto.createHash('sha256');
    const seed = bip39.mnemonicToSeedSync(secondaryMnemonic);
    hash.update(seed);
    return { secondaryID: hash.digest('hex') };
  };

  public getSecondaryMnemonic = (): { secondaryMnemonic: string } => {
    return { secondaryMnemonic: this.secondaryMnemonic };
  };

  public getSecondaryXpub = (): { secondaryXpub: string } => {
    return { secondaryXpub: this.xpubs.secondary };
  };

  public getAccountId = (): { accountId: string } => {
    const mutliSig = this.createSecureMultiSig(0);
    const { address } = mutliSig; // getting the first receiving address
    return {
      accountId: crypto
        .createHash('sha256')
        .update(address)
        .digest('hex'),
    };
  };

  public decryptSecondaryXpub = (encryptedSecXpub: string) => {
    const key = this.generateKey(
      bip39.mnemonicToSeedSync(this.primaryMnemonic).toString('hex'),
    );
    const decipher = crypto.createDecipheriv(
      this.cipherSpec.algorithm,
      key,
      this.cipherSpec.iv,
    );
    let decrypted = decipher.update(encryptedSecXpub, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const secondaryXpub = decrypted;
    if (this.validateXpub(secondaryXpub)) {
      return { secondaryXpub };
    } else {
      throw new Error('Secondary Xpub is either tampered or is invalid');
    }
  };

  public checkHealth = async (
    chunk: string,
    pos: number,
  ): Promise<{ isValid: boolean }> => {
    if (chunk.length !== config.SCHUNK_SIZE) {
      throw new Error('Invalid number of characters');
    }

    const { walletId } = this.getWalletId();
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('checkSecureHealth', {
        HEXA_ID,
        chunk,
        pos,
        walletID: walletId,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }

    return { isValid: res.data.isValid };
  };

  public fetchBalance = async (options?: {
    restore?;
  }): Promise<{
    balance: number;
    unconfirmedBalance: number;
  }> => {
    try {
      if (options && options.restore) {
        if (!(await this.isWalletEmpty())) {
          console.log('Executing consumed binary search');
          this.nextFreeChildIndex = await this.binarySearchIterationForConsumedAddresses(
            config.BSI.INIT_INDEX,
          );
        }
      }

      await this.gapLimitCatchUp();

      this.consumedAddresses = [];
      // generating all consumed addresses:
      for (let itr = 0; itr < this.nextFreeChildIndex + this.gapLimit; itr++) {
        const multiSig = this.createSecureMultiSig(itr);
        this.consumedAddresses.push(multiSig.address);
      }

      const { balance, unconfirmedBalance } = await this.getBalanceByAddresses(
        this.consumedAddresses,
      );

      return (this.balances = { balance, unconfirmedBalance });
    } catch (err) {
      throw new Error(`Unable to get balance: ${err.message}`);
    }
  };

  public fetchTransactions = async (): Promise<{
    transactions: {
      totalTransactions: number;
      confirmedTransactions: number;
      unconfirmedTransactions: number;
      transactionDetails: Array<{
        txid: string;
        status: string;
        confirmations: number;
        fee: string;
        date: string;
        transactionType: string;
        amount: number;
        accountType: string;
        recipientAddresses?: string[];
        senderAddresses?: string[];
      }>;
    };
  }> => {
    if (this.consumedAddresses.length === 0) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    const { transactions } = await this.fetchTransactionsByAddresses(
      this.consumedAddresses,
      'Savings Account',
    );
    this.transactions = transactions;
    return { transactions };
  };

  public fetchBalanceTransaction = async (options?: {
    restore?;
  }): Promise<{
    balances: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions: Transactions;
  }> => {
    if (options && options.restore) {
      if (!(await this.isWalletEmpty())) {
        console.log('Executing consumed binary search');
        this.nextFreeChildIndex = await this.binarySearchIterationForConsumedAddresses(
          config.BSI.INIT_INDEX,
        );
      }
    }

    await this.gapLimitCatchUp();

    this.consumedAddresses = [];
    // generating all consumed addresses:
    for (let itr = 0; itr < this.nextFreeChildIndex + this.gapLimit; itr++) {
      const multiSig = this.createSecureMultiSig(itr);
      this.consumedAddresses.push(multiSig.address);
    }

    const {
      balances,
      transactions,
    } = await this.fetchBalanceTransactionsByAddresses(
      this.consumedAddresses,
      'Savings Account',
    );
    this.balances = balances;
    this.transactions = transactions;
    return { balances, transactions };
  };

  public getReceivingAddress = async (): Promise<{ address: string }> => {
    try {
      // looking for free external address
      let freeAddress = '';
      let itr;
      for (itr = 0; itr < this.gapLimit + 1; itr++) {
        if (this.nextFreeChildIndex + itr < 0) {
          continue;
        }
        const { address } = this.createSecureMultiSig(
          this.nextFreeChildIndex + itr,
        );

        const txCounts = await this.getTxCounts([address]);
        if (txCounts[address] === 0) {
          // free address found
          freeAddress = address;
          this.nextFreeChildIndex += itr;
          break;
        }
      }

      if (!freeAddress) {
        // giving up as we could find a free address in the above cycle

        console.log(
          'Failed to find a free address in the above cycle, using the next address without checking',
        );
        const multiSig = this.createSecureMultiSig(
          this.nextFreeChildIndex + itr,
        );
        freeAddress = multiSig.address; // not checking this one, it might be free
        this.nextFreeChildIndex += itr + 1;
      }

      this.receivingAddress = freeAddress;
      return { address: freeAddress };
    } catch (err) {
      throw new Error(`Unable to generate receiving address: ${err.message}`);
    }
  };

  public setupSecureAccount = async (): Promise<{
    setupData: {
      qrData: string;
      secret: string;
      bhXpub: string;
    };
  }> => {
    let res: AxiosResponse;
    const { secondaryID } = this.getSecondaryID(this.secondaryMnemonic);

    try {
      res = await BH_AXIOS.post('setupSecureAccount', {
        HEXA_ID,
        walletID: this.walletID,
        secondaryID,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }
    const { setupSuccessful, setupData } = res.data;
    if (!setupSuccessful) {
      throw new Error('Secure account setup failed');
    } else {
      const { prepared } = this.prepareSecureAccount(setupData.bhXpub);
      if (prepared) {
        this.twoFASetup = setupData;
        return { setupData };
      } else {
        throw new Error(
          'Something went wrong; unable to prepare secure account',
        );
      }
    }
  };

  // public resetTwoFA = async (
  //   token: number,
  // ): Promise<{
  //   qrData: any;
  //   secret: any;
  // }> => {
  //   let res: AxiosResponse;
  //   try {
  //     res = await BH_AXIOS.post('resetTwoFA', {
  //       HEXA_ID,
  //       walletID: this.walletID,
  //       token,
  //     });
  //   } catch (err) {
  //     throw new Error(err.response.data.err);
  //   }
  //   const { qrData, secret } = res.data;
  //   return { qrData, secret };
  // };

  public resetTwoFA = async (
    secondaryMnemonic: number,
  ): Promise<{
    qrData: any;
    secret: any;
  }> => {
    let res: AxiosResponse;
    const { secondaryID } = this.getSecondaryID(this.secondaryMnemonic);
    try {
      res = await BH_AXIOS.post('resetTwoFA', {
        HEXA_ID,
        walletID: this.walletID,
        secondaryID,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }
    const { qrData, secret } = res.data;
    this.twoFASetup = { qrData, secret };
    return this.twoFASetup;
  };

  public isActive = async (): Promise<{ isActive: boolean }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('isSecureActive', {
        HEXA_ID,
        walletID: this.walletID,
      });
    } catch (err) {
      throw new Error(err.response.data.err);
    }
    return res.data;
  };

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
  };

  public createHDTransaction = async (
    recipientAddress: string,
    amount: number,
    txnPriority?: string,
    nSequence?: number,
  ): Promise<
    | {
        fee: number;
        balance: number;
        inputs?: undefined;
        txb?: undefined;
        estimatedBlocks?: undefined;
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
        balance: number;
        estimatedBlocks: number;
      }
  > => {
    try {
      const inputUTXOs = await this.fetchUtxo();
      console.log('Input UTXOs:', inputUTXOs);
      const outputUTXOs = [{ address: recipientAddress, value: amount }];
      console.log('Output UTXOs:', outputUTXOs);
      // const txnFee = await this.feeRatesPerByte(txnPriority);

      const {
        averageTxFee,
        feePerByte,
        estimatedBlocks,
      } = await this.averageTransactionFee(txnPriority);
      console.log({ averageTxFee, feePerByte });

      let balance: number = 0;
      inputUTXOs.forEach(utxo => {
        balance += utxo.value;
      });
      const { inputs, outputs, fee } = coinselect(
        inputUTXOs,
        outputUTXOs,
        feePerByte,
      );
      console.log('-------Transaction--------');
      console.log('\tFee', fee);
      console.log('\tInputs:', inputs);
      console.log('\tOutputs:', outputs);

      if (!inputs) {
        // insufficient input utxos to compensate for output utxos + fee
        return { fee: averageTxFee, balance };
      }

      let reestimatedBlocks;
      if (averageTxFee - fee >= 0) reestimatedBlocks = estimatedBlocks;
      else {
        // TODO: clever estimation mech
        reestimatedBlocks = estimatedBlocks + 2; // effective priority: medium
      }

      const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      );

      inputs.forEach(input => txb.addInput(input.txId, input.vout, nSequence));

      outputs.forEach(output => {
        if (!output.address) {
          output.value = output.value + fee - averageTxFee; // applying static fee (averageTxFee)
        }
      });
      const sortedOuts = await this.sortOutputs(outputs);
      sortedOuts.forEach(output => {
        console.log('Adding Output:', output);
        txb.addOutput(output.address, output.value);
      });

      return {
        inputs,
        txb,
        fee: averageTxFee,
        balance,
        estimatedBlocks: reestimatedBlocks,
      };
    } catch (err) {
      throw new Error(`Transaction creation failed: ${err.message}`);
    }
  };

  public signHDTransaction = (
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
  ): {
    signedTxb: bitcoinJS.TransactionBuilder;
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>;
  } => {
    // single signature (via primary mnemonic), to be followed by server signing
    try {
      console.log('------ Transaction Signing ----------');
      let vin = 0;
      const childIndexArray = [];
      inputs.forEach(input => {
        console.log('Signing Input:', input);
        const { multiSig, primaryPriv, childIndex } = this.getSigningEssentials(
          input.address,
        );
        txb.sign(
          vin,
          bip32.fromBase58(primaryPriv, this.network),
          Buffer.from(multiSig.scripts.redeem, 'hex'),
          null,
          input.value,
          Buffer.from(multiSig.scripts.witness, 'hex'),
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
  };

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
        res = await BH_AXIOS.post('secureHDTransaction', {
          HEXA_ID,
          walletID: this.walletID,
          token,
          txHex,
          childIndexArray,
        });
      } catch (err) {
        throw new Error(err.response.data.err);
      }

      console.log(
        '---- Transaction Signed by BH Server (2nd sig for 2/3 MultiSig)----',
      );

      console.log({ txHex: res.data.txHex });
      console.log('------ Broadcasting Transaction --------');

      const { txid } = await this.broadcastTransaction(res.data.txHex);
      return { txid };
    } catch (err) {
      throw new Error(`Unable to transfer: ${err.message}`);
    }
  };

  public dualSignHDTransaction = (
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
  ): {
    signedTxb: bitcoinJS.TransactionBuilder;
  } => {
    // dual signing (via primary and secondary mnemonic), generates a fully-signed broadcastable transaction
    try {
      console.log('------ Transaction Signing ----------');
      let vin = 0;
      inputs.forEach(input => {
        console.log('Signing Input:', input);
        const {
          multiSig,
          primaryPriv,
          secondaryPriv,
        } = this.getSigningEssentials(input.address);

        txb.sign(
          vin,
          bip32.fromBase58(primaryPriv, this.network),
          Buffer.from(multiSig.scripts.redeem, 'hex'),
          null,
          input.value,
          Buffer.from(multiSig.scripts.witness, 'hex'),
        );

        if (!secondaryPriv) {
          throw new Error('Private key from secondary mnemonic is missing');
        }
        txb.sign(
          vin,
          bip32.fromBase58(secondaryPriv, this.network),
          Buffer.from(multiSig.scripts.redeem, 'hex'),
          null,
          input.value,
          Buffer.from(multiSig.scripts.witness, 'hex'),
        );
        vin += 1;
      });

      return { signedTxb: txb };
    } catch (err) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  };

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
  };

  public generateSecondaryXpriv = (secondaryMnemonic: string): Boolean => {
    const path = this.derivePath(this.xpubs.bh);
    const currentXpub = this.getRecoverableXKey(secondaryMnemonic, path);
    if (currentXpub !== this.xpubs.secondary) {
      throw new Error('Invaild secondary mnemonic');
    }

    this.secondaryXpriv = this.getRecoverableXKey(
      secondaryMnemonic,
      path,
      true,
    );
    return true;
  };

  private getSigningEssentials = (address: string) => {
    if (this.signingEssentialsCache[address]) {
      return this.signingEssentialsCache[address];
    } // cache hit

    for (let itr = 0; itr <= this.nextFreeChildIndex + this.gapLimit; itr++) {
      const multiSig = this.createSecureMultiSig(itr);

      if (multiSig.address === address) {
        return (this.signingEssentialsCache[address] = {
          multiSig,
          primaryPriv: this.deriveChildXKey(this.primaryXpriv, itr),
          secondaryPriv: this.secondaryXpriv
            ? this.deriveChildXKey(this.secondaryXpriv, itr)
            : null,
          childIndex: itr,
        });
      }
    }

    throw new Error('Could not find WIF for ' + address);
  };

  private fetchUtxo = async (): Promise<
    Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>
  > => {
    try {
      if (this.consumedAddresses.length === 0) {
        // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
        await this.fetchBalance();
      }

      const { UTXOs } = await this.multiFetchUnspentOutputs(
        this.consumedAddresses,
      );
      return UTXOs;
    } catch (err) {
      throw new Error(`Fetch UTXOs failed: ${err.message}`);
    }
  };

  private gapLimitCatchUp = async () => {
    // scanning future addressess in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
    let tryAgain = false;

    const multiSig = this.createSecureMultiSig(
      this.nextFreeChildIndex + this.gapLimit - 1,
    );

    const txCounts = await this.getTxCounts([multiSig.address]);
    if (txCounts[multiSig.address] > 0) {
      //  someone uses our wallet outside! better catch up
      this.nextFreeChildIndex += this.gapLimit;
      tryAgain = true;
    }

    if (tryAgain) {
      return this.gapLimitCatchUp();
    }
  };

  private isWalletEmpty = async (): Promise<boolean> => {
    if (this.nextFreeChildIndex === 0) {
      // assuming that this is freshly created wallet, with no funds and default internal variables
      let emptyWallet = false;
      const multiSig = this.createSecureMultiSig(0);
      const txCounts = await this.getTxCounts([multiSig.address]);

      if (txCounts[multiSig.address] === 0) {
        emptyWallet = true;
      }
      return emptyWallet;
    } else {
      return false;
    }
  };

  private binarySearchIterationForConsumedAddresses = async (
    index: number,
    maxUsedIndex: number = config.BSI.MAXUSEDINDEX,
    minUnusedIndex: number = config.BSI.MINUNUSEDINDEX,
    depth: number = config.BSI.DEPTH.INIT,
  ) => {
    console.log({ depth });
    if (depth >= config.BSI.DEPTH.LIMIT) {
      return maxUsedIndex + 1;
    } // fail

    const indexMultiSig = this.createSecureMultiSig(index);
    const adjacentMultiSig = this.createSecureMultiSig(index + 1);

    const txCounts = await this.getTxCounts([
      indexMultiSig.address,
      adjacentMultiSig.address,
    ]);

    if (txCounts[indexMultiSig.address] === 0) {
      console.log({ index });
      if (index === 0) {
        return 0;
      }
      minUnusedIndex = Math.min(minUnusedIndex, index); // set
      index = Math.floor((index - maxUsedIndex) / 2 + maxUsedIndex);
    } else {
      maxUsedIndex = Math.max(maxUsedIndex, index); // set
      if (txCounts[adjacentMultiSig.address] === 0) {
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
  };

  private getRecoverableXKey = (
    mnemonic: string,
    path: string,
    priv?: boolean,
  ): string => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, this.network);
    if (!priv) {
      const xpub = root
        .derivePath('m/' + path)
        .neutered()
        .toBase58();
      return xpub;
    } else {
      const xpriv = root.derivePath('m/' + path).toBase58();
      return xpriv;
    }
  };

  private getPub = (extendedKey: string): string => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    return xKey.publicKey.toString('hex');
  };

  private deriveChildXKey = (
    extendedKey: string,
    childIndex: number,
  ): string => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    const childXKey = xKey.derive(childIndex);
    return childXKey.toBase58();
  };

  private validateXpub = async (xpub: string) => {
    try {
      bip32.fromBase58(xpub, this.network);
      return true;
    } catch (err) {
      return false;
    }
  };

  private derivePath = (bhXpub: string): string => {
    const bhxpub = bip32.fromBase58(bhXpub, this.network);
    let path;
    if (bhxpub.index === 0) {
      path = config.SECURE_DERIVATION_BRANCH;
    } else {
      path = config.SECURE_WALLET_XPUB_PATH + config.SECURE_DERIVATION_BRANCH;
    }
    return path;
  };

  private createSecureMultiSig = (
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
        redeem: multiSig.p2sh.redeem.output.toString('hex'),
        witness: multiSig.p2wsh.redeem.output.toString('hex'),
      },
      address: multiSig.address,
    });
  };

  private generateKey = (psuedoKey: string): string => {
    const hashRounds = 5048;
    let key = psuedoKey;
    for (let itr = 0; itr < hashRounds; itr++) {
      const hash = crypto.createHash('sha512');
      key = hash.update(key).digest('hex');
    }
    return key.slice(key.length - this.cipherSpec.keyLength);
  };
}
