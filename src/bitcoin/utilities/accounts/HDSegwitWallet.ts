import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import coinselect from 'coinselect';
import crypto from 'crypto';
import config from '../../Config';
import Bitcoin from './Bitcoin';
import {
  Transactions,
  INotification,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  InputUTXOs,
  OutputUTXOs,
} from '../Interface';
import axios, { AxiosResponse, AxiosInstance } from 'axios';
import { FAST_BITCOINS } from '../../../common/constants/serviceTypes';
const { RELAY, HEXA_ID, REQUEST_TIMEOUT } = config;

const BH_AXIOS: AxiosInstance = axios.create({
  baseURL: RELAY,
  timeout: REQUEST_TIMEOUT,
});

export default class HDSegwitWallet extends Bitcoin {
  private mnemonic: string;
  private passphrase: string;
  private purpose: number;
  private derivationPath: string;
  private xpub: string;
  private usedAddresses: string[];
  private nextFreeAddressIndex: number;
  private nextFreeChangeAddressIndex: number;
  private gapLimit: number;
  private internalAddresssesCache: {};
  private externalAddressesCache: {};
  private addressToWIFCache: {};
  private lastBalTxSync: number = 0;

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
  public derivativeAccounts: DerivativeAccounts = config.DERIVATIVE_ACC;
  public newTransactions: Array<TransactionDetails> = [];

  constructor(
    mnemonic?: string,
    passphrase?: string,
    dPathPurpose?: number,
    stateVars?: {
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
    },
    network?: bitcoinJS.Network,
  ) {
    super(network);
    this.mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic(256);
    this.passphrase = passphrase;
    this.purpose = dPathPurpose ? dPathPurpose : config.DPATH_PURPOSE;
    // this.derivationPath =
    //   this.network === bitcoinJS.networks.bitcoin
    //     ? `m/${this.purpose}'/0'/0'`
    //     : `m/${this.purpose}'/1'/0'`;

    this.derivationPath = this.isTest
      ? `m/${this.purpose}'/1'/0'`
      : `m/${this.purpose}'/0'/0'`; // helps with seperating regular and test acc (even on the testnet)

    this.initializeStateVars(stateVars);
  }

  public initializeStateVars = (stateVars) => {
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
    this.internalAddresssesCache =
      stateVars && stateVars.internalAddresssesCache
        ? stateVars.internalAddresssesCache
        : {}; // index => address
    this.externalAddressesCache =
      stateVars && stateVars.externalAddressesCache
        ? stateVars.externalAddressesCache
        : {}; // index => address
    this.addressToWIFCache =
      stateVars && stateVars.addressToWIFCache
        ? stateVars.addressToWIFCache
        : {};
    this.gapLimit =
      stateVars && stateVars.gapLimit ? stateVars.gapLimit : config.GAP_LIMIT;
    this.balances =
      stateVars && stateVars.balances ? stateVars.balances : this.balances;
    this.receivingAddress =
      stateVars && stateVars.receivingAddress
        ? stateVars.receivingAddress
        : this.receivingAddress;
    this.transactions =
      stateVars && stateVars.transactions
        ? stateVars.transactions
        : this.transactions;
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

  public getMnemonic = (): { mnemonic: string } => {
    return { mnemonic: this.mnemonic };
  };

  public getWalletId = (): { walletId: string } => {
    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    return {
      walletId: crypto.createHash('sha256').update(seed).digest('hex'),
    };
  };

  public getAccountId = (): { accountId: string } => {
    console.log({ network: this.network });
    const node = bip32.fromBase58(this.getXpub(), this.network);
    const keyPair = node.derive(0).derive(0);
    const address = this.getAddress(keyPair, this.purpose); // getting the first receiving address
    return {
      accountId: crypto.createHash('sha256').update(address).digest('hex'),
    };
  };

  public getDerivativeAccXpub = (
    accountType: string,
    accountNumber?: number,
  ): string => {
    // generates receiving xpub for derivative accounts

    const baseXpub = this.generateDerivativeXpub(accountType, accountNumber);
    // console.log({ baseXpub });
    // const node = bip32.fromBase58(baseXpub, this.network);
    // const address = this.getAddress(node.derive(0).derive(0), this.purpose);
    // console.log({ address });
    return baseXpub;
    // const child = node.derive(0).neutered(); //external chain
    // const receivingXpub = child.toBase58();
    // console.log({ receivingXpub });
    // return receivingXpub;
  };

  public getDerivativeAccReceivingAddress = async (
    accountType: string,
    accountNumber: number = 0,
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

      for (itr = 0; itr < this.gapLimit + 1; itr++) {
        if (
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex +
            itr <
          0
        ) {
          continue;
        }

        const address = this.getExternalAddressByIndex(
          itr,
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
        const address = this.getExternalAddressByIndex(
          itr,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        );
        freeAddress = address; // not checking this one, it might be free
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
    accountNumber: number = 0,
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

    await this.derivativeAccGapLimitCatchup(accountType, accountNumber);

    const { nextFreeAddressIndex } = this.derivativeAccounts[accountType][
      accountNumber
    ];

    const usedAddresses = [];
    for (let itr = 0; itr < nextFreeAddressIndex + this.gapLimit; itr++) {
      usedAddresses.push(
        this.getExternalAddressByIndex(
          itr,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        ),
      );
    }

    this.derivativeAccounts[accountType][accountNumber][
      'usedAddresses'
    ] = usedAddresses;
    console.log({ derivativeAccUsedAddresses: usedAddresses });

    const {
      balances,
      transactions,
    } = await this.fetchBalanceTransactionsByAddresses(
      usedAddresses,
      accountType === FAST_BITCOINS ? FAST_BITCOINS : accountType,
    );

    const lastSyncTime =
      this.derivativeAccounts[accountType][accountNumber].lastBalTxSync || 0;
    let latestSyncTime =
      this.derivativeAccounts[accountType][accountNumber].lastBalTxSync || 0;
    const newTransactions: Array<TransactionDetails> = []; // delta transactions
    for (const tx of transactions.transactionDetails) {
      if (tx.status === 'Confirmed') {
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

    return { balances, transactions };
  };

  public getReceivingAddress = async (): Promise<{ address: string }> => {
    try {
      // finding free external address
      let freeAddress = '';
      let itr;
      for (itr = 0; itr < this.gapLimit + 1; itr++) {
        if (this.nextFreeAddressIndex + itr < 0) {
          continue;
        }
        const address = this.getExternalAddressByIndex(
          this.nextFreeAddressIndex + itr,
        );
        this.externalAddressesCache[this.nextFreeAddressIndex + itr] = address;
        const txCounts = await this.getTxCounts([address]); // ensuring availability
        if (txCounts[address] === 0) {
          // free address found
          freeAddress = address;
          this.nextFreeAddressIndex += itr;
          break;
        }
      }

      if (!freeAddress) {
        console.log(
          'Failed to find a free address in the external address cycle, using the next address without checking',
        );
        // giving up as we could find a free address in the above cycle
        freeAddress = this.getExternalAddressByIndex(
          this.nextFreeAddressIndex + itr,
        ); // not checking this one, it might be free
        this.nextFreeAddressIndex += itr + 1;
      }

      this.receivingAddress = freeAddress;
      return { address: freeAddress };
    } catch (err) {
      throw new Error(`Unable to generate receiving address: ${err.message}`);
    }
  };

  public testnetFaucet = async (): Promise<{
    txid: any;
    funded: any;
    balances: any;
    transactions: any;
  }> => {
    // const amount = Math.trunc(Math.random() * 1e5) / 1e8;
    if (!this.isTest) {
      throw new Error('Can only fund test account');
    }
    const amount = 10000 / 1e8;
    let res: AxiosResponse;
    const recipientAddress = this.getExternalAddressByIndex(0);
    try {
      res = await BH_AXIOS.post('/testnetFaucet', {
        HEXA_ID,
        recipientAddress,
        amount,
      });
      console.log({ res });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { txid, funded } = res.data;

    // const { balance, unconfirmedBalance } = await this.getBalanceByAddresses([
    //   recipientAddress,
    // ]);
    if (txid) {
      this.usedAddresses = [recipientAddress];
      this.balances = { balance: 0, unconfirmedBalance: amount * 1e8 }; // assumption: we don't call testFaucet twice
      const { transactions } = await this.fetchTransactionsByAddresses(
        this.usedAddresses,
        'Test Account',
      );
      this.transactions = transactions;
    }
    return {
      txid,
      funded,
      balances: this.balances,
      transactions: this.transactions,
    };
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

    const indexAddress = this.getInternalAddressByIndex(index);
    const adjacentAddress = this.getInternalAddressByIndex(index + 1);
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

    const indexAddress = this.getExternalAddressByIndex(index);
    const adjacentAddress = this.getExternalAddressByIndex(index + 1);
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

  private derivativeAccGapLimitCatchup = async (accountType, accountNumber) => {
    // scanning future addressess in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
    let tryAgain = false;
    const { nextFreeAddressIndex } = this.derivativeAccounts[accountType][
      accountNumber
    ];
    if (nextFreeAddressIndex !== 0 && !nextFreeAddressIndex)
      this.derivativeAccounts[accountType][
        accountNumber
      ].nextFreeAddressIndex = 0;

    const externalAddress = this.getExternalAddressByIndex(
      this.derivativeAccounts[accountType][accountNumber].nextFreeAddressIndex +
        this.gapLimit -
        1,
      this.derivativeAccounts[accountType][accountNumber].xpub,
    );

    const txCounts = await this.getTxCounts([externalAddress]);

    if (txCounts[externalAddress] > 0) {
      this.derivativeAccounts[accountType][
        accountNumber
      ].nextFreeAddressIndex += this.gapLimit;
      tryAgain = true;
    }

    if (tryAgain) {
      return this.derivativeAccGapLimitCatchup(accountType, accountNumber);
    }
  };

  private gapLimitCatchUp = async () => {
    // scanning future addressess in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
    let tryAgain = false;
    const externalAddress = this.getExternalAddressByIndex(
      this.nextFreeAddressIndex + this.gapLimit - 1,
    );

    const internalAddress = this.getInternalAddressByIndex(
      this.nextFreeChangeAddressIndex + this.gapLimit - 1,
    );

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
      const initialExternalAddress = this.getExternalAddressByIndex(0);
      const initialInternalAddress = this.getInternalAddressByIndex(0);

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

  // public fetchBalance = async (): Promise<{
  //   balance: number;
  //   unconfirmedBalance: number;
  // }> => {
  //   try {
  //     if (!(await this.isWalletEmpty())) {
  //       console.log('Executing internal binary search');
  //       this.nextFreeChangeAddressIndex = await this.binarySearchIterationForInternalAddress(
  //         config.BSI.INIT_INDEX,
  //       );
  //       console.log('Executing external binary search');
  //       this.nextFreeAddressIndex = await this.binarySearchIterationForExternalAddress(
  //         config.BSI.INIT_INDEX,
  //       );
  //     }

  //     await this.gapLimitCatchUp();

  //     this.usedAddresses = [];
  //     // generating all involved addresses (TD: include gap limit?)
  //     for (
  //       let itr = 0;
  //       itr < this.nextFreeAddressIndex + this.gapLimit;
  //       itr++
  //     ) {
  //       this.usedAddresses.push(this.getExternalAddressByIndex(itr));
  //     }
  //     for (
  //       let itr = 0;
  //       itr < this.nextFreeChangeAddressIndex + this.gapLimit;
  //       itr++
  //     ) {
  //       this.usedAddresses.push(this.getInternalAddressByIndex(itr));
  //     }

  //     const { balance, unconfirmedBalance } = await this.getBalanceByAddresses(
  //       this.usedAddresses,
  //     );
  //     return (this.balances = { balance, unconfirmedBalance });
  //   } catch (err) {
  //     throw new Error(`Unable to get balance: ${err.message}`);
  //   }
  // };

  public fetchBalance = async (options?: {
    restore?;
  }): Promise<{
    balance: number;
    unconfirmedBalance: number;
  }> => {
    try {
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

      await this.gapLimitCatchUp();

      this.usedAddresses = [];
      for (
        let itr = 0;
        itr < this.nextFreeAddressIndex + this.gapLimit;
        itr++
      ) {
        this.usedAddresses.push(this.getExternalAddressByIndex(itr));
      }
      for (
        let itr = 0;
        itr < this.nextFreeChangeAddressIndex + this.gapLimit;
        itr++
      ) {
        this.usedAddresses.push(this.getInternalAddressByIndex(itr));
      }

      const { balance, unconfirmedBalance } = await this.getBalanceByAddresses(
        this.usedAddresses,
      );
      return (this.balances = { balance, unconfirmedBalance });
    } catch (err) {
      throw new Error(`Unable to get balance: ${err.message}`);
    }
  };

  public fetchTransactions = async (): Promise<{
    transactions: Transactions;
  }> => {
    if (this.usedAddresses.length === 0) {
      // just for any case, refresh balance (it refreshes internal `this.usedAddresses`)
      await this.fetchBalance();
    }

    const { transactions } = await this.fetchTransactionsByAddresses(
      this.usedAddresses,
      this.isTest ? 'Test Account' : 'Checking Account',
    );
    this.transactions = transactions;
    return { transactions };
  };

  public setNewTransactions = (transactions: Transactions) => {
    // delta transactions setter
    const lastSyncTime = this.lastBalTxSync;
    let latestSyncTime = this.lastBalTxSync;
    this.newTransactions = []; // delta transactions
    for (const tx of transactions.transactionDetails) {
      if (tx.status === 'Confirmed') {
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

    await this.gapLimitCatchUp();

    this.usedAddresses = [];
    for (let itr = 0; itr < this.nextFreeAddressIndex + this.gapLimit; itr++) {
      this.usedAddresses.push(this.getExternalAddressByIndex(itr));
    }
    for (
      let itr = 0;
      itr < this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      this.usedAddresses.push(this.getInternalAddressByIndex(itr));
    }

    const {
      balances,
      transactions,
    } = await this.fetchBalanceTransactionsByAddresses(
      this.usedAddresses,
      this.isTest ? 'Test Account' : 'Checking Account',
    );

    this.setNewTransactions(transactions);

    this.balances = balances;
    this.transactions = transactions;
    return { balances, transactions };
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
  //       estimatedBlocks?: undefined;
  //       inputs?: undefined;
  //       txb?: undefined;
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
  //     const inputUTXOs = await this.fetchUtxo(); // confirmed + unconfirmed UTXOs
  //     console.log('Input UTXOs:', inputUTXOs);

  //     const outputUTXOs = [];
  //     for (const recipient of recipients) {
  //       outputUTXOs.push({
  //         address: recipient.address,
  //         value: recipient.amount,
  //       });
  //     }
  //     console.log('Output UTXOs:', outputUTXOs);
  //     let balance: number = 0;
  //     inputUTXOs.forEach((utxo) => {
  //       balance += utxo.value;
  //     });

  //     let feePerByte, estimatedBlocks;
  //     console.log({ averageTxFees });
  //     if (averageTxFees) {
  //       feePerByte = averageTxFees[txnPriority].feePerByte;
  //       estimatedBlocks = averageTxFees[txnPriority].estimatedBlocks;
  //     } else {
  //       const averageTxFees = await this.averageTransactionFee();
  //       feePerByte = averageTxFees[txnPriority].feePerByte;
  //       estimatedBlocks = averageTxFees[txnPriority].estimatedBlocks;
  //     }

  //     const { inputs, outputs, fee } = coinselect(
  //       inputUTXOs,
  //       outputUTXOs,
  //       feePerByte,
  //     );

  //     console.log('-------Transaction--------');
  //     console.log('\tDynamic Fee', fee);
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
    const inputUTXOs = await this.fetchUtxo(); // confirmed + unconfirmed UTXOs
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
      const netFeeByPriority =
        (fee / feePerByte) * averageTxFees[priority].feePerByte;
      const estimatedBlocks = averageTxFees[priority].estimatedBlocks;

      if (balance > netAmount + fee) {
        txPrerequisites[priority] = {
          inputs,
          outputs,
          fee: netFeeByPriority,
          estimatedBlocks,
        };
      } else {
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

      const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      );

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
    witnessScript?: any,
  ): bitcoinJS.TransactionBuilder => {
    try {
      console.log('------ Transaction Signing ----------');
      let vin = 0;
      inputs.forEach((input) => {
        console.log('Signing Input:', input);

        const keyPair = this.getKeyPair(this.getWifForAddress(input.address));

        txb.sign(
          vin,
          keyPair,
          this.getP2SH(keyPair).redeem.output,
          null,
          input.value,
          witnessScript,
        );
        vin += 1;
      });

      return txb;
    } catch (err) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  };

  // public transfer = async (
  //   recipientAddress: string,
  //   amount: number,
  // ): Promise<{
  //   txid: string;
  // }> => {
  //   try {
  //     if (this.isValidAddress(recipientAddress)) {
  //       amount = amount * 1e8; // converting into sats
  //       const { balance } = await this.fetchBalance();

  //       const recipients = [{ address: recipientAddress, amount }];
  //       const { inputs, txb, fee } = await this.createHDTransaction(
  //         recipients,
  //         'high',
  //       );
  //       console.log('---- Transaction Created ----');

  //       if (balance < amount + fee) {
  //         throw new Error(
  //           'Insufficient balance to compensate for transfer amount and the txn fee',
  //         );
  //       }

  //       const signedTxb = this.signHDTransaction(inputs, txb);
  //       console.log('---- Transaction Signed ----');

  //       const txHex = signedTxb.build().toHex();
  //       const { txid } = await this.broadcastTransaction(txHex);
  //       console.log('---- Transaction Broadcasted ----');

  //       return { txid };
  //     } else {
  //       throw new Error('Recipient address is wrong');
  //     }
  //   } catch (err) {
  //     throw new Error(`Unable to transfer: ${err.message}`);
  //   }
  // };

  public fetchUtxo = async () => {
    try {
      if (this.usedAddresses.length === 0) {
        // refresh balance (it refreshes internal `this.usedAddresses`)
        await this.fetchBalance();
      }

      const { UTXOs } = await this.multiFetchUnspentOutputs(this.usedAddresses);
      return UTXOs;
    } catch (err) {
      throw new Error(`Fetch UTXOs failed: ${err.message}`);
    }
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
        const address = this.getInternalAddressByIndex(
          this.nextFreeChangeAddressIndex + itr,
        );
        this.internalAddresssesCache[
          this.nextFreeChangeAddressIndex + itr
        ] = address; // updating cache just for any case

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
        freeAddress = this.getInternalAddressByIndex(
          this.nextFreeChangeAddressIndex + itr,
        ); // not checking this one, it might be free
        this.nextFreeChangeAddressIndex += itr + 1;
      }

      return { address: freeAddress };
    } catch (err) {
      throw new Error(`Change address generation failed: ${err.message}`);
    }
  };

  private sortOutputs = async (
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

    return outputs;
  };

  private getWIFbyIndex = (change: boolean, index: number) => {
    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    const root = bip32.fromSeed(seed, this.network);
    const path = `${this.derivationPath}/${change ? 1 : 0}/${index}`;
    console.log({ path });

    const child = root.derivePath(path);
    return child.toWIF();
  };

  private getExternalWIFByIndex = (index: number): string => {
    return this.getWIFbyIndex(false, index);
  };

  private getInternalWIFByIndex = (index: number): string => {
    return this.getWIFbyIndex(true, index);
  };

  private getExternalAddressByIndex = (
    index: number,
    derivativeXpub?: string,
  ): string => {
    if (!derivativeXpub && this.externalAddressesCache[index]) {
      return this.externalAddressesCache[index];
    } // cache hit

    const node = bip32.fromBase58(
      derivativeXpub ? derivativeXpub : this.getXpub(),
      this.network,
    );
    const keyPair = node.derive(0).derive(index);

    const address = this.getAddress(keyPair, this.purpose);

    if (!derivativeXpub) {
      this.externalAddressesCache[index] = address;
    }
    return address;
  };

  private getInternalAddressByIndex = (index: number): string => {
    if (this.internalAddresssesCache[index]) {
      return this.internalAddresssesCache[index];
    } // cache hit

    const node = bip32.fromBase58(this.getXpub(), this.network);
    const keyPair = node.derive(1).derive(index);
    const address = this.getAddress(keyPair, this.purpose);
    return (this.internalAddresssesCache[index] = address);
  };

  private getWifForAddress = (address: string): string => {
    console.log({ address });
    if (this.addressToWIFCache[address]) {
      return this.addressToWIFCache[address];
    } // cache hit

    // fast approach, first lets iterate over all addressess we have in cache
    for (const index of Object.keys(this.internalAddresssesCache)) {
      if (this.getInternalAddressByIndex(parseInt(index, 10)) === address) {
        return (this.addressToWIFCache[address] = this.getInternalWIFByIndex(
          parseInt(index, 10),
        ));
      }
    }

    for (const index of Object.keys(this.externalAddressesCache)) {
      if (this.getExternalAddressByIndex(parseInt(index, 10)) === address) {
        console.log('Executing this');
        console.log({ address });
        console.log(this.getExternalWIFByIndex(parseInt(index, 10)));
        return (this.addressToWIFCache[address] = this.getExternalWIFByIndex(
          parseInt(index, 10),
        ));
      }
    }

    // cache miss: lets iterate over all addresses we have up to first unused address index
    for (
      let itr = 0;
      itr <= this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      const possibleAddress = this.getInternalAddressByIndex(itr);
      if (possibleAddress === address) {
        return this.getInternalWIFByIndex(itr);
      }
    }

    for (let itr = 0; itr <= this.nextFreeAddressIndex + this.gapLimit; itr++) {
      const possibleAddress = this.getExternalAddressByIndex(itr);
      if (possibleAddress === address) {
        console.log({
          WIF: this.getExternalWIFByIndex(itr),
        });
        return this.getExternalWIFByIndex(itr);
      }
    }
    throw new Error('Could not find WIF for ' + address);
  };

  private getXpub = () => {
    if (this.xpub) {
      return this.xpub;
    }
    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    const root = bip32.fromSeed(seed, this.network);
    const child = root.derivePath(this.derivationPath).neutered();
    this.xpub = child.toBase58();

    return this.xpub;
  };

  private generateDerivativeXpub = (
    accountType: string,
    accountNumber: number = 0,
  ) => {
    if (!this.derivativeAccounts[accountType])
      throw new Error('Unsupported dervative account');
    if (accountNumber > 9)
      throw Error(
        `Cannot create more than 10 ${accountType} derivative accounts`,
      );
    if (this.derivativeAccounts[accountType][accountNumber]) {
      return this.derivativeAccounts[accountType][accountNumber]['xpub'];
    } else {
      const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
      const root = bip32.fromSeed(seed, this.network);
      const path = `m/${this.purpose}'/${
        this.network === bitcoinJS.networks.bitcoin ? 0 : 1
      }'/${this.derivativeAccounts[accountType]['series'] + accountNumber}'`;
      console.log({ path });
      const child = root.derivePath(path).neutered();
      const xpub = child.toBase58();
      const ypub = this.xpubToYpub(xpub, null, this.network);
      this.derivativeAccounts[accountType][accountNumber] = { xpub, ypub };
      return xpub;
    }
  };
}
