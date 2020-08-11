import axios, { AxiosResponse, AxiosInstance } from 'axios';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import coinselect from 'coinselect';
import crypto from 'crypto';
import config from '../../HexaConfig';
import {
  Transactions,
  DerivativeAccount,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
} from '../Interface';
import Bitcoin from './Bitcoin';
import {
  FAST_BITCOINS,
  TRUSTED_CONTACTS,
} from '../../../common/constants/serviceTypes';
import { SIGNING_AXIOS } from '../../../services/api';

const { SIGNING_SERVER, HEXA_ID, REQUEST_TIMEOUT } = config;
const bitcoinAxios = axios.create({ timeout: REQUEST_TIMEOUT });

export default class SecureHDWallet extends Bitcoin {
  public twoFASetup: {
    qrData: string;
    secret: string;
  };
  public secondaryMnemonic: string;
  public secondaryXpriv: string;
  public xpubs: {
    primary: string;
    secondary: string;
    bh: string;
  };
  public balances: { balance: number; unconfirmedBalance: number } = {
    balance: 0,
    unconfirmedBalance: 0,
  };
  public receivingAddress: string;
  public transactions: Transactions = {
    totalTransactions: 0,
    confirmedTransactions: 0,
    unconfirmedTransactions: 0,
    transactionDetails: [],
  };
  private confirmedUTXOs: Array<{
    txId: string;
    vout: number;
    value: number;
    address: string;
    status?: any;
  }>;
  public derivativeAccounts: DerivativeAccounts = config.DERIVATIVE_ACC;
  public newTransactions: Array<TransactionDetails> = [];

  private lastBalTxSync: number = 0;

  private primaryMnemonic: string;
  private walletID: string;
  private usedAddresses: string[];
  private nextFreeAddressIndex: number;
  private nextFreeChangeAddressIndex: number;
  private primaryXpriv: string;
  private multiSigCache;
  private signingEssentialsCache;
  private gapLimit: number;
  private derivativeGapLimit: number;

  private cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  } = {
    algorithm: 'aes-192-cbc',
    salt: 'bithyeSalt', // NOTE: The salt should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
    keyLength: 24,
    iv: Buffer.alloc(16, 0),
  };

  constructor(
    primaryMnemonic: string,
    stateVars?: {
      secondaryMnemonic: string;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
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
      confirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      twoFASetup: {
        qrData: string;
        secret: string;
      };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
    },
    network?: bitcoinJS.Network,
  ) {
    super(network);
    this.primaryMnemonic = primaryMnemonic;
    const { walletId } = this.getWalletId();
    this.walletID = walletId;
    this.initializeStateVars(stateVars);
  }

  public initializeStateVars = (stateVars) => {
    this.secondaryMnemonic =
      stateVars && stateVars.secondaryMnemonic
        ? stateVars.secondaryMnemonic
        : null;
    this.usedAddresses =
      stateVars && stateVars.usedAddresses ? stateVars.usedAddresses : [];
    this.nextFreeAddressIndex =
      stateVars && stateVars.nextFreeAddressIndex
        ? stateVars.nextFreeAddressIndex
        : 0;
    this.nextFreeChangeAddressIndex =
      stateVars && stateVars.nextFreeChangeAddressIndex
        ? stateVars.nextFreeChangeAddressIndex
        : 0;
    this.multiSigCache =
      stateVars && stateVars.multiSigCache ? stateVars.multiSigCache : {};
    this.signingEssentialsCache =
      stateVars && stateVars.signingEssentialsCache
        ? stateVars.signingEssentialsCache
        : {};
    this.gapLimit =
      stateVars && stateVars.gapLimit ? stateVars.gapLimit : config.GAP_LIMIT;
    this.derivativeGapLimit = this.gapLimit / 2;
    this.primaryXpriv =
      stateVars && stateVars.primaryXpriv ? stateVars.primaryXpriv : undefined;
    this.secondaryXpriv =
      stateVars && stateVars.secondaryXpriv
        ? stateVars.secondaryXpriv
        : undefined;
    this.xpubs = stateVars && stateVars.xpubs ? stateVars.xpubs : undefined;
    this.balances =
      stateVars && stateVars.balances ? stateVars.balances : this.balances;
    this.receivingAddress =
      stateVars && stateVars.receivingAddress
        ? stateVars.receivingAddress
        : this.getInitialReceivingAddress();
    this.transactions =
      stateVars && stateVars.transactions
        ? stateVars.transactions
        : this.transactions;
    this.confirmedUTXOs =
      stateVars && stateVars.confirmedUTXOs
        ? stateVars.confirmedUTXOs
        : this.confirmedUTXOs;
    this.twoFASetup =
      stateVars && stateVars.twoFASetup ? stateVars.twoFASetup : undefined;
    this.derivativeAccounts =
      stateVars && stateVars.derivativeAccounts
        ? stateVars.derivativeAccounts
        : this.derivativeAccounts;
    this.lastBalTxSync =
      stateVars && stateVars.lastBalTxSync
        ? stateVars.lastBalTxSync
        : this.lastBalTxSync;
    this.newTransactions =
      stateVars && stateVars.newTransactions
        ? stateVars.newTransactions
        : this.newTransactions;
  };

  public importBHXpub = async (
    token: number,
  ): Promise<{
    bhXpub: string;
  }> => {
    const { walletId } = this.getWalletId();

    let res: AxiosResponse;
    try {
      res = await SIGNING_AXIOS.post('importBHXpub', {
        HEXA_ID,
        token,
        walletID: walletId,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
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

  public getInitialReceivingAddress = (): string => {
    if (this.xpubs) return this.createSecureMultiSig(0).address;
  };

  public getSecondaryID = (
    secondaryMnemonic: string,
  ): { secondaryID: string } => {
    if (!secondaryMnemonic) {
      throw new Error(
        'SecondaryID generation failed; missing secondary mnemonic',
      );
    }
    const hash = crypto.createHash('sha256');
    const seed = bip39.mnemonicToSeedSync(secondaryMnemonic);
    hash.update(seed);
    return { secondaryID: hash.digest('hex') };
  };

  public removeSecondaryMnemonic = () => {
    this.secondaryMnemonic = null;
    return { removed: !Boolean(this.secondaryMnemonic) };
  };

  public removeTwoFADetails = () => {
    this.twoFASetup = null;
    return { removed: !Boolean(this.twoFASetup) };
  };

  public isSecondaryMnemonic = (secondaryMnemonic: string) => {
    const path = this.derivePath(this.xpubs.bh);
    const currentXpub = this.getRecoverableXKey(secondaryMnemonic, path);
    if (currentXpub !== this.xpubs.secondary) {
      return false;
    }
    return true;
  };

  public restoreSecondaryMnemonic = (
    secondaryMnemonic: string,
  ): {
    restored: boolean;
  } => {
    const path = this.derivePath(this.xpubs.bh);
    const currentXpub = this.getRecoverableXKey(secondaryMnemonic, path);
    if (currentXpub !== this.xpubs.secondary) {
      return { restored: false };
    }
    this.secondaryMnemonic = secondaryMnemonic;
    return { restored: true };
  };

  public getSecondaryXpub = (): { secondaryXpub: string } => {
    return { secondaryXpub: this.xpubs.secondary };
  };

  public getAccountId = (): { accountId: string } => {
    const mutliSig = this.createSecureMultiSig(0);
    const { address } = mutliSig; // getting the first receiving address
    return {
      accountId: crypto.createHash('sha256').update(address).digest('hex'),
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
      res = await SIGNING_AXIOS.post('checkSecureHealth', {
        HEXA_ID,
        chunk,
        pos,
        walletID: walletId,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    return { isValid: res.data.isValid };
  };

  // public fetchBalance = async (options?: {
  //   restore?;
  // }): Promise<{
  //   balance: number;
  //   unconfirmedBalance: number;
  // }> => {
  //   try {
  //     if (options && options.restore) {
  //       if (!(await this.isWalletEmpty())) {
  //         console.log('Executing consumed binary search');
  //         this.nextFreeChildIndex = await this.binarySearchIterationForConsumedAddresses(
  //           config.BSI.INIT_INDEX,
  //         );
  //       }
  //     }

  //     await this.gapLimitCatchUp();

  //     this.consumedAddresses = [];
  //     // generating all consumed addresses:
  //     for (let itr = 0; itr < this.nextFreeChildIndex + this.gapLimit; itr++) {
  //       const multiSig = this.createSecureMultiSig(itr);
  //       this.consumedAddresses.push(multiSig.address);
  //     }

  //     const { balance, unconfirmedBalance } = await this.getBalanceByAddresses(
  //       this.consumedAddresses,
  //     );

  //     return (this.balances = { balance, unconfirmedBalance });
  //   } catch (err) {
  //     throw new Error(`Unable to get balance: ${err.message}`);
  //   }
  // };

  // public fetchTransactions = async (): Promise<{
  //   transactions: {
  //     totalTransactions: number;
  //     confirmedTransactions: number;
  //     unconfirmedTransactions: number;
  //     transactionDetails: Array<{
  //       txid: string;
  //       status: string;
  //       confirmations: number;
  //       fee: string;
  //       date: string;
  //       transactionType: string;
  //       amount: number;
  //       accountType: string;
  //       recipientAddresses?: string[];
  //       senderAddresses?: string[];
  //     }>;
  //   };
  // }> => {
  //   if (this.consumedAddresses.length === 0) {
  //     // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
  //     await this.fetchBalance();
  //   }

  //   const { transactions } = await this.fetchTransactionsByAddresses(
  //     this.consumedAddresses,
  //     'Savings Account',
  //   );
  //   this.transactions = transactions;
  //   return { transactions };
  // };

  public setNewTransactions = (transactions: Transactions) => {
    // delta transactions setter
    const lastSyncTime = this.lastBalTxSync;
    let latestSyncTime = this.lastBalTxSync;
    this.newTransactions = []; // delta transactions
    for (const tx of transactions.transactionDetails) {
      if (tx.status === 'Confirmed' && tx.transactionType === 'Received') {
        if (tx.blockTime > lastSyncTime) {
          this.newTransactions.push(tx);
        }
        if (tx.blockTime > latestSyncTime) {
          latestSyncTime = tx.blockTime;
        }
      }
    }
    this.lastBalTxSync = latestSyncTime;
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
        console.log('Executing internal binary search');
        this.nextFreeChangeAddressIndex = await this.binarySearchIterationForInternalAddress(
          config.BSI.INIT_INDEX,
        );
        console.log('Executing external binary search');
        this.nextFreeAddressIndex = await this.binarySearchIterationForExternalAddress(
          config.BSI.INIT_INDEX,
        );
      }
    }

    // await this.gapLimitCatchUp();

    // this.consumedAddresses = [];
    // // generating all consumed addresses:
    // for (let itr = 0; itr < this.nextFreeChildIndex + this.gapLimit; itr++) {
    //   const multiSig = this.createSecureMultiSig(itr);
    //   this.consumedAddresses.push(multiSig.address);
    // }

    const externalAddresses = [];
    for (let itr = 0; itr < this.nextFreeAddressIndex + this.gapLimit; itr++) {
      externalAddresses.push(this.createSecureMultiSig(itr).address);
    }

    const internalAddresses = [];
    for (
      let itr = 0;
      itr < this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      internalAddresses.push(this.createSecureMultiSig(itr, true).address);
    }

    this.usedAddresses = [...externalAddresses, ...internalAddresses];

    const batchedDerivativeAddresses = [];

    for (const dAccountType of Object.keys(config.DERIVATIVE_ACC)) {
      if (dAccountType === TRUSTED_CONTACTS) continue;
      const derivativeAccount = this.derivativeAccounts[dAccountType];
      if (derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          const derivativeInstance = derivativeAccount[accountNumber];
          if (
            derivativeInstance.usedAddresses &&
            derivativeInstance.usedAddresses.length
          ) {
            batchedDerivativeAddresses.push(
              ...derivativeInstance.usedAddresses,
            );
          }
        }
      }
    }

    const ownedAddresses = [
      ...this.usedAddresses,
      ...batchedDerivativeAddresses,
    ]; // owned addresses are used for apt tx categorization and transfer amount calculation

    const {
      UTXOs,
      balances,
      transactions,
      nextFreeAddressIndex,
    } = await this.fetchBalanceTransactionsByAddresses(
      externalAddresses,
      internalAddresses,
      ownedAddresses,
      this.nextFreeAddressIndex - 1,
      'Savings Account',
    );

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
    this.confirmedUTXOs = confirmedUTXOs;
    this.nextFreeAddressIndex = nextFreeAddressIndex;
    this.receivingAddress = this.createSecureMultiSig(
      this.nextFreeAddressIndex,
    ).address;

    this.setNewTransactions(transactions);

    this.balances = balances;
    this.transactions = transactions;
    return { balances, transactions };
  };

  // public getReceivingAddress = async (): Promise<{ address: string }> => {
  //   try {
  //     //   // looking for free external address
  //     //   let freeAddress = '';
  //     //   let itr;
  //     //   for (itr = 0; itr < this.gapLimit + 1; itr++) {
  //     //     if (this.nextFreeAddressIndex + itr < 0) {
  //     //       continue;
  //     //     }
  //     //     const { address } = this.createSecureMultiSig(
  //     //       this.nextFreeAddressIndex + itr,
  //     //     );

  //     //     const txCounts = await this.getTxCounts([address]);
  //     //     if (txCounts[address] === 0) {
  //     //       // free address found
  //     //       freeAddress = address;
  //     //       this.nextFreeAddressIndex += itr;
  //     //       break;
  //     //     }
  //     //   }

  //     //   if (!freeAddress) {
  //     //     // giving up as we could find a free address in the above cycle

  //     //     console.log(
  //     //       'Failed to find a free address in the above cycle, using the next address without checking',
  //     //     );
  //     //     const multiSig = this.createSecureMultiSig(
  //     //       this.nextFreeAddressIndex + itr,
  //     //     );
  //     //     freeAddress = multiSig.address; // not checking this one, it might be free
  //     //     this.nextFreeAddressIndex += itr + 1;
  //     //   }

  //     //   this.receivingAddress = freeAddress;

  //     this.receivingAddress = this.createSecureMultiSig(
  //       this.nextFreeAddressIndex,
  //     ).address;
  //     return { address: this.receivingAddress };
  //   } catch (err) {
  //     throw new Error(`Unable to generate receiving address: ${err.message}`);
  //   }
  // };

  public getDerivativeAccReceivingAddress = async (
    accountType: string,
    accountNumber: number = 1,
  ): Promise<{ address: string }> => {
    // generates receiving address for derivative accounts
    if (!this.derivativeAccounts[accountType])
      throw new Error(`${accountType} does not exists`);

    if (!this.derivativeAccounts[accountType][accountNumber]) {
      this.generateDerivativeXpub(accountType, accountNumber);
    }

    try {
      // looking for free external address
      let freeAddress = '';
      let itr;

      const { nextFreeAddressIndex } = this.derivativeAccounts[accountType][
        accountNumber
      ];
      if (nextFreeAddressIndex !== 0 && !nextFreeAddressIndex)
        this.derivativeAccounts[accountType][
          accountNumber
        ].nextFreeAddressIndex = 0;

      for (itr = 0; itr < this.derivativeGapLimit + 1; itr++) {
        if (
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex +
            itr <
          0
        ) {
          continue;
        }

        const { address } = this.createSecureMultiSig(
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex + itr,
          false,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        );

        const txCounts = await this.getTxCounts([address]);
        if (txCounts[address] === 0) {
          // free address found
          freeAddress = address;
          this.derivativeAccounts[accountType][
            accountNumber
          ].nextFreeAddressIndex += itr;
          break;
        }
      }

      if (!freeAddress) {
        // giving up as we could find a free address in the above cycle

        console.log(
          'Failed to find a free address in the above cycle, using the next address without checking',
        );
        const multiSig = this.createSecureMultiSig(
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex + itr,
          false,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        );
        freeAddress = multiSig.address; // not checking this one, it might be free
        this.derivativeAccounts[accountType][
          accountNumber
        ].nextFreeAddressIndex += itr + 1;
      }

      this.derivativeAccounts[accountType][
        accountNumber
      ].receivingAddress = freeAddress;
      return { address: freeAddress };
    } catch (err) {
      throw new Error(`Unable to generate receiving address: ${err.message}`);
    }
  };

  public fetchDerivativeAccBalanceTxs = async (
    accountType: string,
    accountNumber: number = 1,
  ): Promise<{
    balances: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions: Transactions;
  }> => {
    if (!this.derivativeAccounts[accountType])
      throw new Error(`${accountType} does not exists`);

    if (!this.derivativeAccounts[accountType][accountNumber]) {
      this.generateDerivativeXpub(accountType, accountNumber);
    }

    // await this.derivativeAccGapLimitCatchup(accountType, accountNumber);

    let { nextFreeAddressIndex } = this.derivativeAccounts[accountType][
      accountNumber
    ];
    // supports upgrading from a previous version containing TC (where nextFreeAddressIndex is undefined)
    if (nextFreeAddressIndex !== 0 && !nextFreeAddressIndex)
      nextFreeAddressIndex = 0;

    const externalAddresses = [];
    for (let itr = 0; itr < nextFreeAddressIndex + this.gapLimit; itr++) {
      externalAddresses.push(
        this.createSecureMultiSig(
          itr,
          false,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        ).address,
      );
    }

    this.derivativeAccounts[accountType][
      accountNumber
    ].usedAddresses = externalAddresses;

    const res = await this.fetchBalanceTransactionsByAddresses(
      externalAddresses,
      [],
      externalAddresses,
      this.derivativeAccounts[accountType][accountNumber].nextFreeAddressIndex -
        1,
      accountType === FAST_BITCOINS ? FAST_BITCOINS : accountType,
    );

    const { balances, transactions, UTXOs } = res;

    const confirmedUTXOs = [];
    for (const utxo of UTXOs) {
      if (utxo.status) {
        if (utxo.status.confirmed) confirmedUTXOs.push(utxo);
      } else {
        // utxo's from fallback won't contain status var (defaulting them as confirmed)
        confirmedUTXOs.push(utxo);
      }
    }
    this.confirmedUTXOs.push(...confirmedUTXOs); // pushing confirmed derivative utxos to the pre-existing utxo pool from parent acc

    const lastSyncTime =
      this.derivativeAccounts[accountType][accountNumber].lastBalTxSync || 0;
    let latestSyncTime =
      this.derivativeAccounts[accountType][accountNumber].lastBalTxSync || 0;
    const newTransactions: Array<TransactionDetails> = []; // delta transactions
    for (const tx of transactions.transactionDetails) {
      if (tx.status === 'Confirmed' && tx.transactionType === 'Received') {
        if (tx.blockTime > lastSyncTime) {
          newTransactions.push(tx);
        }
        if (tx.blockTime > latestSyncTime) {
          latestSyncTime = tx.blockTime;
        }
      }
    }

    this.derivativeAccounts[accountType][
      accountNumber
    ].lastBalTxSync = latestSyncTime;
    this.derivativeAccounts[accountType][
      accountNumber
    ].newTransactions = newTransactions;
    this.derivativeAccounts[accountType][accountNumber].balances = balances;
    this.derivativeAccounts[accountType][
      accountNumber
    ].transactions = transactions;
    this.derivativeAccounts[accountType][accountNumber].nextFreeAddressIndex =
      res.nextFreeAddressIndex;
    this.derivativeAccounts[accountType][
      accountNumber
    ].receivingAddress = this.createSecureMultiSig(
      res.nextFreeAddressIndex,
      false,
      this.derivativeAccounts[accountType][accountNumber].xpub,
    ).address;

    return { balances, transactions };
  };

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
  ): Promise<{
    synched: boolean;
  }> => {
    const batchedDerivativeAddresses = [];

    for (const dAccountType of accountTypes) {
      if (dAccountType === TRUSTED_CONTACTS) continue;

      const derivativeAccounts = this.derivativeAccounts[dAccountType];

      if (!derivativeAccounts.instance.using) continue;
      for (
        let accountNumber = 1;
        accountNumber <= derivativeAccounts.instance.using;
        accountNumber++
      ) {
        // await this.derivativeAccGapLimitCatchup(dAccountType, accountNumber);
        let { nextFreeAddressIndex } = this.derivativeAccounts[dAccountType][
          accountNumber
        ];
        // supports upgrading from a previous version containing TC (where nextFreeAddressIndex is undefined)
        if (nextFreeAddressIndex !== 0 && !nextFreeAddressIndex)
          nextFreeAddressIndex = 0;

        const consumedAddresses = [];
        for (
          let itr = 0;
          itr < nextFreeAddressIndex + this.derivativeGapLimit;
          itr++
        ) {
          consumedAddresses.push(
            this.createSecureMultiSig(
              itr,
              false,
              this.derivativeAccounts[dAccountType][accountNumber].xpub,
            ).address,
          );
        }

        this.derivativeAccounts[dAccountType][accountNumber][
          'usedAddresses'
        ] = consumedAddresses;
        console.log({ derivativeAccUsedAddresses: consumedAddresses });
        batchedDerivativeAddresses.push(...consumedAddresses);
      }
    }

    if (!batchedDerivativeAddresses.length) return;

    let res: AxiosResponse;
    try {
      if (this.network === bitcoinJS.networks.testnet) {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.MULTIUTXOTXN,
          {
            addresses: batchedDerivativeAddresses,
          },
        );
      } else {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.MULTIUTXOTXN,
          {
            addresses: batchedDerivativeAddresses,
          },
        );
      }

      let { Utxos, Txs } = res.data;

      Utxos = Utxos.filter(
        (addressSpecificUTXOs) => !!addressSpecificUTXOs.length,
      );

      Txs = Txs.filter(
        (addressSpecificTxs) => !!addressSpecificTxs.TotalTransactions,
      );

      const UTXOs = [];
      const addressesInfo = Txs;
      console.log({ addressesInfo });

      for (const dAccountType of accountTypes) {
        if (dAccountType === TRUSTED_CONTACTS) continue;

        const derivativeAccounts = this.derivativeAccounts[dAccountType];

        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccounts.instance.using;
          accountNumber++
        ) {
          const balances = {
            balance: 0,
            unconfirmedBalance: 0,
          };

          const addressInUse = derivativeAccounts[accountNumber].usedAddresses;
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
                // else if (changeAddresses && changeAddresses.includes(Address))
                //   balances.balance += value;
                else balances.unconfirmedBalance += value;
              }
            }
          }

          const transactions: Transactions = {
            totalTransactions: 0,
            confirmedTransactions: 0,
            unconfirmedTransactions: 0,
            transactionDetails: [],
          };

          let lastUsedAddressIndex =
            derivativeAccounts[accountNumber].nextFreeAddressIndex - 1;
          const txMap = new Map();
          for (const addressInfo of addressesInfo) {
            if (!addressInUse.includes(addressInfo.Address)) continue;
            if (addressInfo.TotalTransactions === 0) continue;

            transactions.totalTransactions += addressInfo.TotalTransactions;
            transactions.confirmedTransactions +=
              addressInfo.ConfirmedTransactions;
            transactions.unconfirmedTransactions +=
              addressInfo.UnconfirmedTransactions;

            addressInfo.Transactions.forEach((tx) => {
              if (!txMap.has(tx.txid)) {
                // check for duplicate tx (fetched against sending and then again for change address)
                txMap.set(tx.txid, true);
                this.categorizeTx(
                  tx,
                  derivativeAccounts[accountNumber].usedAddresses,
                  dAccountType,
                );

                const transaction = {
                  txid: tx.txid,
                  confirmations: tx.NumberofConfirmations,
                  status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                  fee: tx.fee,
                  date: tx.Status.block_time
                    ? new Date(tx.Status.block_time * 1000).toUTCString()
                    : new Date(Date.now()).toUTCString(),
                  transactionType: tx.transactionType,
                  amount:
                    tx.transactionType === 'Sent'
                      ? tx.amount + tx.fee
                      : tx.amount,
                  accountType: tx.accountType,
                  recipientAddresses: tx.recipientAddresses,
                  senderAddresses: tx.senderAddresses,
                  blockTime: tx.Status.block_time, // only available when tx is confirmed
                };

                // // update balance based on tx
                // if (transaction.status === 'Confirmed') {
                //   if (transaction.transactionType === 'Received') {
                //     balances.balance += transaction.amount;
                //   } else {
                //     const debited = transaction.amount + transaction.fee;
                //     balances.balance -= debited;
                //   }
                // } else {
                //   if (transaction.transactionType === 'Received') {
                //     balances.unconfirmedBalance += transaction.amount;
                //   } else {
                //     const debited = transaction.amount + transaction.fee;
                //     balances.unconfirmedBalance -= debited;
                //   }
                // }

                // over-ride sent transaction's accountType variable for derivative accounts
                // covers situations when a complete UTXO is spent from the dAccount without a change being sent to the parent account
                if (transaction.transactionType === 'Sent')
                  transaction.accountType = 'Savings Account';

                transactions.transactionDetails.push(transaction);
              }
            });

            const addressIndex = addressInUse.indexOf(addressInfo.Address);
            if (addressIndex > -1) {
              lastUsedAddressIndex =
                addressIndex > lastUsedAddressIndex
                  ? addressIndex
                  : lastUsedAddressIndex;
            }
          }

          const lastSyncTime =
            this.derivativeAccounts[dAccountType][accountNumber]
              .lastBalTxSync || 0;
          let latestSyncTime =
            this.derivativeAccounts[dAccountType][accountNumber]
              .lastBalTxSync || 0;
          const newTransactions: Array<TransactionDetails> = []; // delta transactions
          for (const tx of transactions.transactionDetails) {
            if (
              tx.status === 'Confirmed' &&
              tx.transactionType === 'Received'
            ) {
              if (tx.blockTime > lastSyncTime) {
                newTransactions.push(tx);
              }
              if (tx.blockTime > latestSyncTime) {
                latestSyncTime = tx.blockTime;
              }
            }
          }

          this.derivativeAccounts[dAccountType][
            accountNumber
          ].lastBalTxSync = latestSyncTime;
          this.derivativeAccounts[dAccountType][
            accountNumber
          ].newTransactions = newTransactions;
          this.derivativeAccounts[dAccountType][
            accountNumber
          ].balances = balances;
          this.derivativeAccounts[dAccountType][
            accountNumber
          ].transactions = transactions;
          this.derivativeAccounts[dAccountType][
            accountNumber
          ].nextFreeAddressIndex = lastUsedAddressIndex + 1;
          this.derivativeAccounts[dAccountType][
            accountNumber
          ].receivingAddress = this.createSecureMultiSig(
            lastUsedAddressIndex + 1,
            false,
            this.derivativeAccounts[dAccountType][accountNumber].xpub,
          ).address;
        }
        //  Derivative accounts will not have change addresses(will use Regular's change chain)
      }

      const confirmedUTXOs = [];
      for (const utxo of UTXOs) {
        if (utxo.status) {
          if (utxo.status.confirmed) confirmedUTXOs.push(utxo);
        } else {
          // utxo's from fallback won't contain status var (defaulting them as confirmed)
          confirmedUTXOs.push(utxo);
        }
      }
      this.confirmedUTXOs.push(...confirmedUTXOs);

      return { synched: true };
    } catch (err) {
      console.log(
        `An error occured while fetching balance-txnn via Esplora: ${err.response.data.err}`,
      );
      throw new Error('Fetching balance-txn by addresses failed');
    }
  };

  public setupSecureAccount = async (): Promise<{
    setupData: {
      qrData: string;
      secret: string;
      bhXpub: string;
    };
  }> => {
    // invoked once per wallet (during initial setup)
    let res: AxiosResponse;
    this.secondaryMnemonic = bip39.generateMnemonic(256);
    const { secondaryID } = this.getSecondaryID(this.secondaryMnemonic);
    try {
      res = await SIGNING_AXIOS.post('setupSecureAccount', {
        HEXA_ID,
        walletID: this.walletID,
        secondaryID,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    console.log({ res });
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
    secondaryMnemonic: string,
  ): Promise<{
    qrData: any;
    secret: any;
  }> => {
    const path = this.derivePath(this.xpubs.bh);
    const currentXpub = this.getRecoverableXKey(secondaryMnemonic, path);
    if (currentXpub !== this.xpubs.secondary) {
      throw new Error('Invaild secondary mnemonic');
    }

    let res: AxiosResponse;
    const { secondaryID } = this.getSecondaryID(secondaryMnemonic);
    try {
      res = await SIGNING_AXIOS.post('resetTwoFA', {
        HEXA_ID,
        walletID: this.walletID,
        secondaryID,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    const { qrData, secret } = res.data;
    this.twoFASetup = { qrData, secret };
    return this.twoFASetup;
  };

  public isActive = async (): Promise<{ isActive: boolean }> => {
    let res: AxiosResponse;
    try {
      res = await SIGNING_AXIOS.post('isSecureActive', {
        HEXA_ID,
        walletID: this.walletID,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    return res.data;
  };

  private getChangeAddress = async (): Promise<{ address: string }> => {
    try {
      // looking for free internal address
      let freeAddress = '';
      let itr;
      for (itr = 0; itr < this.gapLimit; itr++) {
        if (this.nextFreeChangeAddressIndex + itr < 0) {
          continue;
        }
        const address = this.createSecureMultiSig(
          this.nextFreeChangeAddressIndex + itr,
          true,
        ).address;

        const txCounts = await this.getTxCounts([address]); // ensuring availability

        if (txCounts[address] === 0) {
          // free address found
          freeAddress = address;
          this.nextFreeChangeAddressIndex += itr;
          break;
        }
      }

      if (!freeAddress) {
        console.log(
          'Failed to find a free address in the change address cycle, using the next address without checking',
        );
        // giving up as we could find a free address in the above cycle
        freeAddress = this.createSecureMultiSig(
          this.nextFreeChangeAddressIndex + itr,
          true,
        ).address; // not checking this one, it might be free
        this.nextFreeChangeAddressIndex += itr + 1;
      }

      return { address: freeAddress };
    } catch (err) {
      throw new Error(`Change address generation failed: ${err.message}`);
    }
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
        const { address } = await this.getChangeAddress();
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

  // public createHDTransaction = async (
  //   recipients: {
  //     address: string;
  //     amount: number;
  //   }[],
  //   txnPriority: string,
  //   averageTxFees?: any,
  //   nSequence?: number,
  // ): Promise<
  //   | {
  //       fee: number;
  //       balance: number;
  //       inputs?: undefined;
  //       txb?: undefined;
  //       estimatedBlocks?: undefined;
  //     }
  //   | {
  //       inputs: Array<{
  //         txId: string;
  //         vout: number;
  //         value: number;
  //         address: string;
  //       }>;
  //       txb: bitcoinJS.TransactionBuilder;
  //       fee: number;
  //       balance: number;
  //       estimatedBlocks: number;
  //     }
  // > => {
  //   try {
  //     const inputUTXOs = await this.fetchUtxo();
  //     console.log('Input UTXOs:', inputUTXOs);

  //     const outputUTXOs = [];
  //     for (const recipient of recipients) {
  //       outputUTXOs.push({
  //         address: recipient.address,
  //         value: recipient.amount,
  //       });
  //     }
  //     console.log('Output UTXOs:', outputUTXOs);
  //     // const txnFee = await this.feeRatesPerByte(txnPriority);

  //     let feePerByte, estimatedBlocks;
  //     if (averageTxFees) {
  //       feePerByte = averageTxFees[txnPriority].feePerByte;
  //       estimatedBlocks = averageTxFees[txnPriority].estimatedBlocks;
  //     } else {
  //       const averageTxFees = await this.averageTransactionFee();
  //       feePerByte = averageTxFees[txnPriority].feePerByte;
  //       estimatedBlocks = averageTxFees[txnPriority].estimatedBlocks;
  //     }

  //     let balance: number = 0;
  //     inputUTXOs.forEach((utxo) => {
  //       balance += utxo.value;
  //     });
  //     const { inputs, outputs, fee } = coinselect(
  //       inputUTXOs,
  //       outputUTXOs,
  //       feePerByte,
  //     );
  //     console.log('-------Transaction--------');
  //     console.log('\tFee', fee);
  //     console.log('\tInputs:', inputs);
  //     console.log('\tOutputs:', outputs);

  //     if (!inputs) {
  //       // insufficient input utxos to compensate for output utxos + fee
  //       return { fee, balance };
  //     }

  //     const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
  //       this.network,
  //     );

  //     inputs.forEach((input) =>
  //       txb.addInput(input.txId, input.vout, nSequence),
  //     );

  //     const sortedOuts = await this.sortOutputs(outputs);
  //     sortedOuts.forEach((output) => {
  //       console.log('Adding Output:', output);
  //       txb.addOutput(output.address, output.value);
  //     });

  //     return {
  //       inputs,
  //       txb,
  //       fee,
  //       balance,
  //       estimatedBlocks,
  //     };
  //   } catch (err) {
  //     throw new Error(`Transaction creation failed: ${err.message}`);
  //   }
  // };

  public calculateSendMaxFee = (
    numberOfRecipients,
    averageTxFees,
  ): { fee: number } => {
    const inputUTXOs = this.confirmedUTXOs;
    const outputUTXOs = [];
    for (let index = 0; index < numberOfRecipients; index++) {
      // using random outputs for send all fee calculation
      outputUTXOs.push({
        address: bitcoinJS.payments.p2sh({
          redeem: bitcoinJS.payments.p2wpkh({
            pubkey: bitcoinJS.ECPair.makeRandom().publicKey,
            network: this.network,
          }),
          network: this.network,
        }).address,
        value: Math.floor(this.balances.balance / numberOfRecipients),
      });
    }
    const { fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      averageTxFees['medium'].feePerByte,
    );
    console.log({ inputUTXOs, outputUTXOs, fee });

    return { fee };
  };

  public transactionPrerequisites = async (
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees?: any,
  ): Promise<
    | {
        fee: number;
        balance: number;
        txPrerequisites?: undefined;
      }
    | {
        txPrerequisites: TransactionPrerequisite;
        fee?: undefined;
        balance?: undefined;
      }
  > => {
    const inputUTXOs = this.confirmedUTXOs; // confirmed + unconfirmed UTXOs
    console.log('Input UTXOs:', inputUTXOs);

    const outputUTXOs = [];
    for (const recipient of recipients) {
      outputUTXOs.push({
        address: recipient.address,
        value: recipient.amount,
      });
    }
    console.log('Output UTXOs:', outputUTXOs);
    let balance: number = 0;
    inputUTXOs.forEach((utxo) => {
      balance += utxo.value;
    });

    const defaultTxPriority = 'low'; // doing  base calculation with low fee
    let feePerByte, estimatedBlocks;
    console.log({ averageTxFees });
    if (averageTxFees) {
      feePerByte = averageTxFees[defaultTxPriority].feePerByte;
      estimatedBlocks = averageTxFees[defaultTxPriority].estimatedBlocks;
    } else {
      const averageTxFees = await this.averageTransactionFee();
      feePerByte = averageTxFees[defaultTxPriority].feePerByte;
      estimatedBlocks = averageTxFees[defaultTxPriority].estimatedBlocks;
    }

    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      feePerByte,
    );

    console.log('-------Transaction--------');
    console.log('\tDynamic Fee', fee);
    console.log('\tInputs:', inputs);
    console.log('\tOutputs:', outputs);

    if (!inputs) {
      // insufficient input utxos to compensate for output utxos + fee
      return { fee, balance };
    }

    let netAmount = 0;
    recipients.forEach((recipient) => {
      netAmount += recipient.amount;
    });

    const txPrerequisites: TransactionPrerequisite = {};
    for (const priority of Object.keys(averageTxFees)) {
      const debitedAmount = netAmount + fee;
      if (debitedAmount <= balance) {
        let netFeeByPriority;
        let estimatedBlocks;
        if (debitedAmount === balance) {
          // fee defaults across priority
          netFeeByPriority = Math.round(
            (fee / feePerByte) * averageTxFees[defaultTxPriority].feePerByte,
          );
          estimatedBlocks = averageTxFees[defaultTxPriority].estimatedBlocks;
        } else {
          netFeeByPriority = Math.round(
            (fee / feePerByte) * averageTxFees[priority].feePerByte,
          );
          estimatedBlocks = averageTxFees[priority].estimatedBlocks;
        }

        txPrerequisites[priority] = {
          inputs,
          outputs,
          fee: netFeeByPriority,
          estimatedBlocks,
        };
      } else {
        const netFeeByPriority = Math.round(
          (fee / feePerByte) * averageTxFees[priority].feePerByte,
        );
        const estimatedBlocks = averageTxFees[priority].estimatedBlocks;

        txPrerequisites[priority] = {
          inputs: null, // if null >> insufficient balance to pay with fee corresponding to this tx priority
          outputs,
          fee: netFeeByPriority,
          estimatedBlocks,
        };
      }
    }

    console.log({ txPrerequisites });
    return { txPrerequisites };
  };

  public createHDTransaction = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    nSequence?: number,
  ): Promise<{
    txb: bitcoinJS.TransactionBuilder;
  }> => {
    try {
      const { inputs, outputs, fee } = txPrerequisites[txnPriority];
      console.log({ inputs, outputs, fee });

      const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      );
      console.log({ txb });

      inputs.forEach((input) =>
        txb.addInput(input.txId, input.vout, nSequence),
      );

      // adjusting fee according to selected priority
      const defaultTxPriority = 'low'; // default deducted fee
      outputs.forEach((output) => {
        if (!output.address) {
          output.value =
            output.value + txPrerequisites[defaultTxPriority].fee - fee;
        }
      });
      console.log({ outputs });

      const sortedOuts = await this.sortOutputs(outputs);
      sortedOuts.forEach((output) => {
        console.log('Adding Output:', output);
        txb.addOutput(output.address, output.value);
      });

      return {
        txb,
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
      inputs.forEach((input) => {
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
        res = await SIGNING_AXIOS.post('secureHDTransaction', {
          HEXA_ID,
          walletID: this.walletID,
          token,
          txHex,
          childIndexArray,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }

      console.log(
        '---- Transaction Signed by BH Server (2nd sig for 2/3 MultiSig)----',
      );

      console.log({ txHex: res.data.txHex });
      console.log('------ Broadcasting Transaction --------');

      const { txid } = await this.broadcastTransaction(res.data.txHex);
      console.log({ txid });

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
      inputs.forEach((input) => {
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
      const primaryPath = `${config.DPATH_PURPOSE}'/0'/1'`;
      const primaryXpub = this.getRecoverableXKey(
        this.primaryMnemonic,
        primaryPath,
      );
      this.primaryXpriv = this.getRecoverableXKey(
        this.primaryMnemonic,
        primaryPath,
        true,
      );

      if (!secondaryXpub) {
        if (!this.secondaryMnemonic)
          throw new Error(
            'SecondaryXpub required; secondary mnemonic missing ',
          );
        const path = this.derivePath(bhXpub);
        secondaryXpub = this.getRecoverableXKey(this.secondaryMnemonic, path);
      }

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

  public rederivePrimaryXKeys = (): boolean => {
    const primaryPath = `${config.DPATH_PURPOSE}'/0'/1'`;
    const primaryXpub = this.getRecoverableXKey(
      this.primaryMnemonic,
      primaryPath,
    );
    this.primaryXpriv = this.getRecoverableXKey(
      this.primaryMnemonic,
      primaryPath,
      true,
    );
    this.xpubs.primary = primaryXpub;
    return true;
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

  public removeSecondaryXpriv = () => {
    this.secondaryXpriv = null;
  };

  private getSigningEssentials = (address: string) => {
    if (!this.secondaryXpriv) {
      // refresh if secondaryXpriv is present: sweeping
      if (this.signingEssentialsCache[address]) {
        return this.signingEssentialsCache[address];
      } // cache hit
    }

    for (
      let itr = 0;
      itr <= this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      const internal = true;
      const multiSig = this.createSecureMultiSig(itr, internal);
      if (multiSig.address === address) {
        return (this.signingEssentialsCache[address] = {
          multiSig,
          primaryPriv: this.derivePrimaryChildXKey(
            this.primaryXpriv,
            itr,
            internal,
          ),
          secondaryPriv: this.secondaryXpriv
            ? this.deriveChildXKey(this.secondaryXpriv, itr)
            : null,
          childIndex: itr,
        });
      }
    }

    for (let itr = 0; itr <= this.nextFreeAddressIndex + this.gapLimit; itr++) {
      const multiSig = this.createSecureMultiSig(itr);
      if (multiSig.address === address) {
        return (this.signingEssentialsCache[address] = {
          multiSig,
          primaryPriv: this.derivePrimaryChildXKey(this.primaryXpriv, itr),
          secondaryPriv: this.secondaryXpriv
            ? this.deriveChildXKey(this.secondaryXpriv, itr)
            : null,
          childIndex: itr,
        });
      }
    }

    for (const dAccountType of Object.keys(config.DERIVATIVE_ACC)) {
      if (dAccountType === TRUSTED_CONTACTS) continue;
      const derivativeAccount = this.derivativeAccounts[dAccountType];
      if (derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          const derivativeInstance = derivativeAccount[accountNumber];
          if (
            derivativeInstance.usedAddresses &&
            derivativeInstance.usedAddresses.length
          ) {
            for (
              let itr = 0;
              itr <=
              derivativeInstance.nextFreeAddressIndex + this.derivativeGapLimit;
              itr++
            ) {
              const multiSig = this.createSecureMultiSig(
                itr,
                false,
                derivativeInstance.xpub,
              );
              const possibleAddress = multiSig.address;
              if (possibleAddress === address) {
                return (this.signingEssentialsCache[address] = {
                  multiSig,
                  primaryPriv: this.deriveDerivativeChildXKey(
                    derivativeInstance.xpriv,
                    itr,
                  ),
                  secondaryPriv: this.secondaryXpriv
                    ? this.deriveChildXKey(this.secondaryXpriv, itr)
                    : null,
                  childIndex: itr,
                });
              }
            }
          }
        }
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
      if (this.usedAddresses.length === 0) {
        // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
        await this.fetchBalanceTransaction();
      }

      const batchedDerivativeAddresses = [];

      for (const dAccountType of Object.keys(config.DERIVATIVE_ACC)) {
        if (dAccountType === TRUSTED_CONTACTS) continue; // TC not supported
        const derivativeAccount = this.derivativeAccounts[dAccountType];
        if (derivativeAccount.instance.using) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[accountNumber];
            if (
              derivativeInstance.usedAddresses &&
              derivativeInstance.usedAddresses.length
            ) {
              batchedDerivativeAddresses.push(
                ...derivativeInstance.usedAddresses,
              );
            }
          }
        }
      }

      const ownedAddresses = [
        ...this.usedAddresses,
        ...batchedDerivativeAddresses,
      ];
      const { UTXOs } = await this.multiFetchUnspentOutputs(ownedAddresses);

      const changeAddresses = [];
      for (
        let itr = 0;
        itr < this.nextFreeChangeAddressIndex + this.gapLimit;
        itr++
      ) {
        changeAddresses.push(this.createSecureMultiSig(itr, true).address);
      }
      const confirmedUTXOs = [];
      for (const utxo of UTXOs) {
        if (utxo.status) {
          if (utxo.status.confirmed) confirmedUTXOs.push(utxo);
          else {
            if (changeAddresses.includes(utxo.address)) {
              // defaulting utxo's on the change branch to confirmed
              confirmedUTXOs.push(utxo);
            }
          }
        } else {
          // utxo's from fallback won't contain status var (defaulting them as confirmed)
          confirmedUTXOs.push(utxo);
        }
      }

      return confirmedUTXOs;
    } catch (err) {
      throw new Error(`Fetch UTXOs failed: ${err.message}`);
    }
  };

  private gapLimitCatchUp = async () => {
    // scanning future addresses in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
    let tryAgain = false;

    const externalAddress = this.createSecureMultiSig(
      this.nextFreeAddressIndex + this.gapLimit - 1,
    ).address;

    const internalAddress = this.createSecureMultiSig(
      this.nextFreeChangeAddressIndex + this.gapLimit - 1,
      true,
    ).address;

    const txCounts = await this.getTxCounts([externalAddress, internalAddress]);

    if (txCounts[externalAddress] > 0) {
      this.nextFreeAddressIndex += this.gapLimit;
      tryAgain = true;
    }

    if (txCounts[internalAddress] > 0) {
      this.nextFreeChangeAddressIndex += this.gapLimit;
      tryAgain = true;
    }

    if (tryAgain) {
      return this.gapLimitCatchUp();
    }
  };

  private isWalletEmpty = async (): Promise<boolean> => {
    if (
      this.nextFreeChangeAddressIndex === 0 &&
      this.nextFreeAddressIndex === 0
    ) {
      // assuming that this is freshly created wallet, with no funds and default internal variables
      let emptyWallet = false;
      const initialExternalAddress = this.createSecureMultiSig(0).address;
      const initialInternalAddress = this.createSecureMultiSig(0).address;

      const txCounts = await this.getTxCounts([
        initialExternalAddress,
        initialInternalAddress,
      ]);

      if (
        txCounts[initialExternalAddress] === 0 &&
        txCounts[initialInternalAddress] === 0
      ) {
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

  private binarySearchIterationForInternalAddress = async (
    index: number,
    maxUsedIndex: number = config.BSI.MAXUSEDINDEX,
    minUnusedIndex: number = config.BSI.MINUNUSEDINDEX,
    depth: number = config.BSI.DEPTH.INIT,
  ): Promise<number> => {
    console.log({ index, depth });
    if (depth >= config.BSI.DEPTH.LIMIT) {
      return maxUsedIndex + 1;
    } // fail

    const indexAddress = this.createSecureMultiSig(index, true).address;
    const adjacentAddress = this.createSecureMultiSig(index + 1, true).address;
    const txCounts = await this.getTxCounts([indexAddress, adjacentAddress]);

    if (txCounts[indexAddress] === 0) {
      if (index === 0) {
        return 0;
      }
      minUnusedIndex = Math.min(minUnusedIndex, index); // set
      index = Math.floor((index - maxUsedIndex) / 2 + maxUsedIndex);
    } else {
      maxUsedIndex = Math.max(maxUsedIndex, index); // set
      if (txCounts[adjacentAddress] === 0) {
        return index + 1;
      } // thats our next free address

      index = Math.round((minUnusedIndex - index) / 2 + index);
    }

    return this.binarySearchIterationForInternalAddress(
      index,
      maxUsedIndex,
      minUnusedIndex,
      depth + 1,
    );
  };

  private binarySearchIterationForExternalAddress = async (
    index: number,
    maxUsedIndex: number = config.BSI.MAXUSEDINDEX,
    minUnusedIndex: number = config.BSI.MINUNUSEDINDEX,
    depth: number = config.BSI.DEPTH.INIT,
  ): Promise<number> => {
    console.log({ index, depth });

    if (depth >= config.BSI.DEPTH.LIMIT) {
      return maxUsedIndex + 1;
    } // fail

    const indexAddress = this.createSecureMultiSig(index).address;
    const adjacentAddress = this.createSecureMultiSig(index + 1).address;
    const txCounts = await this.getTxCounts([indexAddress, adjacentAddress]);

    if (txCounts[indexAddress] === 0) {
      if (index === 0) {
        return 0;
      }
      minUnusedIndex = Math.min(minUnusedIndex, index); // set
      index = Math.floor((index - maxUsedIndex) / 2 + maxUsedIndex);
    } else {
      maxUsedIndex = Math.max(maxUsedIndex, index); // set
      if (txCounts[adjacentAddress] === 0) {
        return index + 1;
      } // thats our next free address

      index = Math.round((minUnusedIndex - index) / 2 + index);
    }

    return this.binarySearchIterationForExternalAddress(
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

  private derivePrimaryChildXKey = (
    extendedKey: string,
    childIndex: number,
    internal: boolean = false,
  ): string => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    const childXKey = xKey.derive(internal ? 1 : 0).derive(childIndex);
    return childXKey.toBase58();
  };

  private deriveChildXKey = (
    extendedKey: string,
    childIndex: number,
  ): string => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    const childXKey = xKey.derive(childIndex);
    return childXKey.toBase58();
  };

  private deriveDerivativeChildXKey = (
    extendedKey: string, // account xpub
    childIndex: number,
  ): string => {
    const xKey = bip32.fromBase58(extendedKey, this.network);
    const childXKey = xKey.derive(0).derive(childIndex); // deriving on external chain
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
    internal: boolean = false,
    derivativeXpub?: string,
  ): {
    scripts: {
      redeem: string;
      witness: string;
    };
    address: string;
  } => {
    // if (!derivativeXpub && this.multiSigCache[childIndex]) {
    //   return this.multiSigCache[childIndex];
    // } // cache hit

    // console.log(`creating multiSig against index: ${childIndex}`);

    let childPrimaryPub;
    if (!derivativeXpub)
      childPrimaryPub = this.getPub(
        this.derivePrimaryChildXKey(this.xpubs.primary, childIndex, internal),
      );
    else
      childPrimaryPub = this.getPub(
        this.deriveDerivativeChildXKey(derivativeXpub, childIndex),
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

    const construct = {
      scripts: {
        redeem: multiSig.p2sh.redeem.output.toString('hex'),
        witness: multiSig.p2wsh.redeem.output.toString('hex'),
      },
      address: multiSig.address,
    };
    // if (!derivativeXpub) {
    //   this.multiSigCache[childIndex] = construct;
    // }
    return construct;
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

  private derivativeAccGapLimitCatchup = async (accountType, accountNumber) => {
    // scanning future addresses in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
    let tryAgain = false;
    const { nextFreeAddressIndex } = this.derivativeAccounts[accountType][
      accountNumber
    ];
    if (nextFreeAddressIndex !== 0 && !nextFreeAddressIndex)
      this.derivativeAccounts[accountType][
        accountNumber
      ].nextFreeAddressIndex = 0;

    const multiSig = this.createSecureMultiSig(
      this.derivativeAccounts[accountType][accountNumber].nextFreeAddressIndex +
        this.derivativeGapLimit -
        1,
      false,
      this.derivativeAccounts[accountType][accountNumber].xpub,
    );

    const txCounts = await this.getTxCounts([multiSig.address]);

    if (txCounts[multiSig.address] > 0) {
      this.derivativeAccounts[accountType][
        accountNumber
      ].nextFreeAddressIndex += this.derivativeGapLimit;
      tryAgain = true;
    }

    if (tryAgain) {
      return this.derivativeAccGapLimitCatchup(accountType, accountNumber);
    }
  };

  private generateDerivativeXpub = (
    accountType: string,
    accountNumber: number = 1,
  ) => {
    if (accountType === TRUSTED_CONTACTS)
      throw new Error(
        `Secure a/c doesn't support account-type: ${accountType} yet`,
      );

    if (!this.derivativeAccounts[accountType])
      throw new Error('Unsupported dervative account');
    if (accountNumber > this.derivativeAccounts[accountType].instance.max)
      throw Error(
        `Cannot create more than ${this.derivativeAccounts[accountType].instance.max} ${accountType} derivative accounts`,
      );
    if (this.derivativeAccounts[accountType][accountNumber]) {
      return this.derivativeAccounts[accountType][accountNumber]['xpub'];
    } else {
      const seed = bip39.mnemonicToSeedSync(this.primaryMnemonic);
      const root = bip32.fromSeed(seed, this.network);
      const path = `m/${config.DPATH_PURPOSE}'/${
        this.network === bitcoinJS.networks.bitcoin ? 0 : 1
      }'/${this.derivativeAccounts[accountType]['series'] + accountNumber}'`;
      console.log({ path });
      const xpriv = root.derivePath(path).toBase58();
      const xpub = root.derivePath(path).neutered().toBase58();
      const ypub = this.xpubToYpub(xpub, null, this.network);
      this.derivativeAccounts[accountType][accountNumber] = {
        xpub,
        xpriv,
        ypub,
        nextFreeAddressIndex: 0,
      };
      this.derivativeAccounts[accountType].instance.using++;

      this.derivativeAccounts[accountType][
        accountNumber
      ].receivingAddress = this.createSecureMultiSig(
        0,
        false,
        this.derivativeAccounts[accountType][accountNumber].xpub,
      ).address;
      return xpub;
    }
  };
}
