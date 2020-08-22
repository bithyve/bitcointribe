import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import coinselect from 'coinselect';
import crypto from 'crypto';
import config from '../../HexaConfig';
import Bitcoin from './Bitcoin';
import {
  Transactions,
  INotification,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  InputUTXOs,
  OutputUTXOs,
  TrustedContactDerivativeAccount,
  TrustedContactDerivativeAccountElements,
  DerivativeAccount,
} from '../Interface';
import axios, { AxiosResponse, AxiosInstance } from 'axios';
import {
  FAST_BITCOINS,
  TRUSTED_CONTACTS,
  REGULAR_ACCOUNT,
} from '../../../common/constants/serviceTypes';
import { BH_AXIOS } from '../../../services/api';
const { HEXA_ID, REQUEST_TIMEOUT } = config;
const bitcoinAxios = axios.create({ timeout: REQUEST_TIMEOUT });

export default class HDSegwitWallet extends Bitcoin {
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
  public derivativeAccounts:
    | DerivativeAccounts
    | TrustedContactDerivativeAccount = config.DERIVATIVE_ACC;
  public newTransactions: Array<TransactionDetails> = [];
  public trustedContactToDA: { [contactName: string]: number } = {};
  public feeRates: any;

  private mnemonic: string;
  private passphrase: string;
  private purpose: number;
  private derivationPath: string;
  private xpub: string;
  private xpriv: string;
  private usedAddresses: string[];
  private nextFreeAddressIndex: number;
  private nextFreeChangeAddressIndex: number;
  private gapLimit: number;
  private lastBalTxSync: number = 0;
  private derivativeGapLimit: number;
  private confirmedUTXOs: Array<{
    txId: string;
    vout: number;
    value: number;
    address: string;
    status?: any;
  }>;

  constructor(
    mnemonic?: string,
    passphrase?: string,
    dPathPurpose?: number,
    stateVars?: {
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
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
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      trustedContactToDA: { [contactName: string]: number };
      feeRates: any;
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
      : `m/${this.purpose}'/0'/0'`; // helps with separating regular and test acc (even on the testnet)

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
    this.gapLimit =
      stateVars && stateVars.gapLimit ? stateVars.gapLimit : config.GAP_LIMIT;
    this.derivativeGapLimit = this.gapLimit / 2;
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
    this.trustedContactToDA =
      stateVars && stateVars.trustedContactToDA
        ? stateVars.trustedContactToDA
        : this.trustedContactToDA;
    this.feeRates =
      stateVars && stateVars.feeRates ? stateVars.feeRates : this.feeRates;
  };

  public getMnemonic = (): { mnemonic: string } => {
    return { mnemonic: this.mnemonic };
  };

  public getTestXPub = (): string => {
    if (this.isTest) {
      if (this.xpub) {
        return this.xpub;
      }
      const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
      const root = bip32.fromSeed(seed, this.network);
      const child = root.derivePath(this.derivationPath).neutered();
      this.xpub = child.toBase58();

      return this.xpub;
    }
  };

  public getWalletId = (): { walletId: string } => {
    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    return {
      walletId: crypto.createHash('sha256').update(seed).digest('hex'),
    };
  };

  public getAccountId = (): { accountId: string } => {
    const node = bip32.fromBase58(this.getXpub(), this.network);
    const keyPair = node.derive(0).derive(0);
    const address = this.deriveAddress(keyPair, this.purpose); // getting the first receiving address
    return {
      accountId: crypto.createHash('sha256').update(address).digest('hex'),
    };
  };

  public getInitialReceivingAddress = (): string => {
    return this.getAddress(false, 0);
  };

  public getDerivativeAccXpub = (
    accountType: string,
    accountNumber?: number,
    contactName?: string,
  ): string => {
    // generates receiving xpub for derivative accounts
    if (accountType === TRUSTED_CONTACTS) {
      if (!contactName)
        throw new Error(`Required param: contactName for ${accountType}`);

      return this.getTrustedContactDerivativeAccXpub(accountType, contactName);
    }

    const baseXpub = this.generateDerivativeXpub(accountType, accountNumber);
    return baseXpub;
  };

  public getTrustedContactDerivativeAccXpub = (
    accountType: string,
    contactName: string,
  ): string => {
    contactName = contactName.toLowerCase().trim();
    const trustedAccounts: TrustedContactDerivativeAccount = this
      .derivativeAccounts[accountType];
    const inUse = trustedAccounts.instance.using;

    let accountNumber = this.trustedContactToDA[contactName];
    if (accountNumber) {
      return trustedAccounts[accountNumber].xpub;
    }

    // for (let index = 0; index <= inUse; index++) {
    //   if (
    //     trustedAccounts[index] &&
    //     trustedAccounts[index].contactName === contactName
    //   ) {
    //     return trustedAccounts[index].xpub;
    //   }
    // }
    accountNumber = inUse + 1;

    const baseXpub = this.generateDerivativeXpub(
      accountType,
      accountNumber,
      contactName,
    );

    return baseXpub;
  };

  public getDerivativeAccReceivingAddress = async (
    accountType: string,
    accountNumber: number = 1,
    contactName?: string,
  ): Promise<{ address: string }> => {
    if (!this.derivativeAccounts[accountType])
      throw new Error(`${accountType} does not exists`);

    if (accountType === TRUSTED_CONTACTS) {
      if (!contactName)
        throw new Error(`Required param: contactName for ${accountType}`);

      return this.getTrustedContactDerivativeAccReceivingAddress(
        accountType,
        contactName,
      );
    } else if (!this.derivativeAccounts[accountType][accountNumber]) {
      this.generateDerivativeXpub(accountType, accountNumber);
    }

    try {
      let availableAddress = '';
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

        const address = this.getAddress(
          false,
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex + itr,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        );

        const txCounts = await this.getTxCounts([address]);
        if (txCounts[address] === 0) {
          availableAddress = address;
          this.derivativeAccounts[accountType][
            accountNumber
          ].nextFreeAddressIndex += itr;
          break;
        }
      }

      if (!availableAddress) {
        const address = this.getAddress(
          false,
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex + itr,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        );
        availableAddress = address; // defaulting to following address
        this.derivativeAccounts[accountType][
          accountNumber
        ].nextFreeAddressIndex += itr + 1;
      }

      this.derivativeAccounts[accountType][
        accountNumber
      ].receivingAddress = availableAddress;
      return { address: availableAddress };
    } catch (err) {
      throw new Error(`Unable to generate receiving address: ${err.message}`);
    }
  };

  public getTrustedContactDerivativeAccReceivingAddress = async (
    accountType: string,
    contactName: string,
  ) => {
    // provides receiving address from the contact's xpub
    contactName = contactName.toLowerCase().trim();
    const trustedAccounts: TrustedContactDerivativeAccount = this
      .derivativeAccounts[accountType];
    let account: TrustedContactDerivativeAccountElements;

    let accountNumber = this.trustedContactToDA[contactName];
    if (accountNumber) {
      account = trustedAccounts[accountNumber];
    }

    if (!account) {
      throw new Error(
        `No contact derivative account exists for: ${contactName}`,
      );
    } else if (!account.contactDetails) {
      throw new Error(`Contact details (xpub) missing for ${contactName}`);
    }

    try {
      let availableAddress = '';
      let itr;

      const { nextFreeAddressIndex } = account.contactDetails;
      if (nextFreeAddressIndex !== 0 && !nextFreeAddressIndex)
        account.contactDetails.nextFreeAddressIndex = 0;

      for (itr = 0; itr < this.derivativeGapLimit + 1; itr++) {
        if (account.contactDetails.nextFreeAddressIndex + itr < 0) {
          continue;
        }

        const address = this.getAddress(
          false,
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        );

        const txCounts = await this.getTxCounts([address]);
        if (txCounts[address] === 0) {
          availableAddress = address;
          account.contactDetails.nextFreeAddressIndex += itr;
          break;
        }
      }

      if (!availableAddress) {
        const address = this.getAddress(
          false,
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        );
        availableAddress = address;
        account.contactDetails.nextFreeAddressIndex += itr + 1;
      }

      account.contactDetails.receivingAddress = availableAddress;
      return { address: availableAddress };
    } catch (err) {
      throw new Error(`Unable to generate receiving address: ${err.message}`);
    }
  };

  public fetchDerivativeAccBalanceTxs = async (
    accountType: string,
    accountNumber: number = 1,
    contactName?: string,
  ): Promise<{
    balances: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions: Transactions;
  }> => {
    if (!this.derivativeAccounts[accountType])
      throw new Error(`${accountType} does not exists`);

    if (accountType === TRUSTED_CONTACTS) {
      if (!contactName)
        throw new Error(`Required param: contactName for ${accountType}`);

      contactName = contactName.toLowerCase().trim();
      accountNumber = this.trustedContactToDA[contactName];

      if (!accountNumber) {
        throw new Error(
          `No contact derivative account exists for: ${contactName}`,
        );
      }
    } else if (!this.derivativeAccounts[accountType][accountNumber]) {
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
    for (
      let itr = 0;
      itr < nextFreeAddressIndex + this.derivativeGapLimit;
      itr++
    ) {
      externalAddresses.push(
        this.getAddress(
          false,
          itr,
          this.derivativeAccounts[accountType][accountNumber].xpub,
        ),
      );
    }

    this.derivativeAccounts[accountType][accountNumber][
      'usedAddresses'
    ] = externalAddresses;
    console.log({ derivativeAccUsedAddresses: externalAddresses });

    const res = await this.fetchBalanceTransactionsByAddresses(
      externalAddresses,
      [],
      externalAddresses,
      this.derivativeAccounts[accountType][accountNumber].nextFreeAddressIndex -
        1,
      0,
      accountType,
      contactName,
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
    ].receivingAddress = this.getAddress(
      false,
      res.nextFreeAddressIndex,
      this.derivativeAccounts[accountType][accountNumber].xpub,
    );

    return { balances, transactions };
  };

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
  ): Promise<{
    synched: boolean;
  }> => {
    const batchedDerivativeAddresses = [];

    for (const dAccountType of accountTypes) {
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

        const usedAddresses = [];
        for (
          let itr = 0;
          itr < nextFreeAddressIndex + this.derivativeGapLimit;
          itr++
        ) {
          usedAddresses.push(
            this.getAddress(
              false,
              itr,
              this.derivativeAccounts[dAccountType][accountNumber].xpub,
            ),
          );
        }

        this.derivativeAccounts[dAccountType][accountNumber][
          'usedAddresses'
        ] = usedAddresses;
        console.log({ derivativeAccUsedAddresses: usedAddresses });
        batchedDerivativeAddresses.push(...usedAddresses);
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

          const txMap = new Map();

          let lastUsedAddressIndex =
            derivativeAccounts[accountNumber].nextFreeAddressIndex - 1;
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
                  derivativeAccounts[accountNumber].usedAddresses,
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
                  accountType:
                    tx.accountType === TRUSTED_CONTACTS
                      ? derivativeAccounts[accountNumber].contactName
                          .split(' ')
                          .map(
                            (word) => word[0].toUpperCase() + word.substring(1),
                          )
                          .join(' ')
                      : tx.accountType,
                  recipientAddresses: tx.recipientAddresses,
                  senderAddresses: tx.senderAddresses,
                  blockTime: tx.Status.block_time, // only available when tx is confirmed
                };

                // over-ride sent transaction's accountType variable for derivative accounts
                // covers situations when a complete UTXO is spent from the dAccount without a change being sent to the parent account
                if (transaction.transactionType === 'Sent')
                  transaction.accountType = 'Checking Account';

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
          ].receivingAddress = this.getAddress(
            false,
            lastUsedAddressIndex + 1,
            this.derivativeAccounts[dAccountType][accountNumber].xpub,
          );
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
        `An error occurred while fetching balance-txnn via Esplora: ${err.response.data.err}`,
      );
      throw new Error('Fetching balance-txn by addresses failed');
    }
  };

  public deriveReceivingAddress = async (
    xpub: string,
  ): Promise<{ address: string }> => {
    try {
      let availableAddress = '';
      let itr;
      for (itr = 0; itr < this.gapLimit + 1; itr++) {
        const address = this.getAddress(false, itr, xpub);
        const txCounts = await this.getTxCounts([address]); // ensuring availability
        if (txCounts[address] === 0) {
          // free address found
          availableAddress = address;
          break;
        }
      }

      if (!availableAddress) {
        console.log(
          'Failed to find a free address in the external address cycle, using the next address without checking',
        );
        availableAddress = this.getAddress(false, itr);
      }

      return { address: availableAddress };
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
    const recipientAddress = this.getAddress(false, 0);
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
      // this.balances = { balance: amount * 1e8, unconfirmedBalance: 0 }; // assumption: we don't call testFaucet twice (spendable exception: 1st receive test-utxo)
      const {
        UTXOs,
        balances,
        transactions,
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
      } = await this.fetchBalanceTransactionsByAddresses(
        this.usedAddresses,
        [],
        this.usedAddresses,
        this.nextFreeAddressIndex - 1,
        this.nextFreeChangeAddressIndex - 1,
        'Test Account',
      );

      const confirmedUTXOs = [];
      for (const utxo of UTXOs) {
        if (utxo.status) {
          if (this.isTest && utxo.address === this.getAddress(false, 0)) {
            confirmedUTXOs.push(utxo); // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            continue;
          }

          if (utxo.status.confirmed) confirmedUTXOs.push(utxo);
        } else {
          // utxo's from fallback won't contain status var (defaulting them as confirmed)
          confirmedUTXOs.push(utxo);
        }
      }
      this.confirmedUTXOs = confirmedUTXOs;

      this.nextFreeAddressIndex = nextFreeAddressIndex;
      this.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex;
      this.receivingAddress = this.getAddress(false, this.nextFreeAddressIndex);

      this.balances = balances;
      this.transactions = transactions;
    }
    return {
      txid,
      funded,
      balances: this.balances,
      transactions: this.transactions,
    };
  };

  public averageTransactionFee = async () => {
    const averageTxSize = 226; // the average Bitcoin transaction is about 226 bytes in size (1 Inp (148); 2 Out)
    // const inputUTXOSize = 148; // in bytes (in accordance with coinselect lib)

    const { feeRatesByPriority, rates } = await this.feeRatesPerByte();
    this.feeRates = rates;
    console.log({ feeRates: this.feeRates });
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
      // WI helps with restoration
    }

    const externalAddresses = [];
    for (let itr = 0; itr < this.nextFreeAddressIndex + this.gapLimit; itr++) {
      externalAddresses.push(this.getAddress(false, itr));
    }

    const internalAddresses = [];
    for (
      let itr = 0;
      itr < this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      internalAddresses.push(this.getAddress(true, itr));
    }

    this.usedAddresses = [...externalAddresses, ...internalAddresses];

    const batchedDerivativeAddresses = [];
    if (!this.isTest) {
      for (const dAccountType of Object.keys(config.DERIVATIVE_ACC)) {
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
      nextFreeChangeAddressIndex,
    } = await this.fetchBalanceTransactionsByAddresses(
      externalAddresses,
      internalAddresses,
      ownedAddresses,
      this.nextFreeAddressIndex - 1,
      this.nextFreeChangeAddressIndex - 1,
      this.isTest ? 'Test Account' : 'Checking Account',
    );

    const confirmedUTXOs = [];
    for (const utxo of UTXOs) {
      if (utxo.status) {
        if (this.isTest && utxo.address === this.getAddress(false, 0)) {
          confirmedUTXOs.push(utxo); // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
          continue;
        }

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
    this.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex;
    this.receivingAddress = this.getAddress(false, this.nextFreeAddressIndex);

    this.setNewTransactions(transactions);

    this.balances = balances;
    this.transactions = transactions;
    console.log({ balances, transactions });
    return { balances, transactions };
  };

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

  public calculateCustomFee = (
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
  ) => {
    const inputUTXOs = this.confirmedUTXOs;

    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      customTxFeePerByte,
    );

    if (!inputs) return { fee, balance: this.balances.balance };

    return { inputs, outputs, fee, balance: this.balances.balance };
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
    const inputUTXOs = this.confirmedUTXOs;
    console.log('Input UTXOs:', inputUTXOs);
    let confirmedBalance = 0;
    this.confirmedUTXOs.forEach((confirmedUtxo) => {
      confirmedBalance += confirmedUtxo.value;
    });

    const outputUTXOs = [];
    for (const recipient of recipients) {
      outputUTXOs.push({
        address: recipient.address,
        value: recipient.amount,
      });
    }
    console.log('Output UTXOs:', outputUTXOs);

    const defaultTxPriority = 'low'; // doing base calculation with low fee (helps in sending the tx even if higher priority fee isn't possible)
    let defaultFeePerByte, defaultEstimatedBlocks;
    console.log({ averageTxFees });
    if (averageTxFees) {
      defaultFeePerByte = averageTxFees[defaultTxPriority].feePerByte;
      defaultEstimatedBlocks = averageTxFees[defaultTxPriority].estimatedBlocks;
    } else {
      const averageTxFees = await this.averageTransactionFee();
      defaultFeePerByte = averageTxFees[defaultTxPriority].feePerByte;
      defaultEstimatedBlocks = averageTxFees[defaultTxPriority].estimatedBlocks;
    }

    const assets = coinselect(inputUTXOs, outputUTXOs, defaultFeePerByte);
    const defaultPriorityInputs = assets.inputs;
    const defaultPriorityOutputs = assets.outputs;
    const defaultPriorityFee = assets.fee;

    console.log('-------Transaction--------');
    console.log('\tDynamic Fee', defaultPriorityFee);
    console.log('\tInputs:', defaultPriorityInputs);
    console.log('\tOutputs:', defaultPriorityOutputs);

    let netAmount = 0;
    recipients.forEach((recipient) => {
      netAmount += recipient.amount;
    });
    const defaultDebitedAmount = netAmount + defaultPriorityFee;
    if (!defaultPriorityInputs || defaultDebitedAmount > confirmedBalance) {
      // insufficient input utxos to compensate for output utxos + lowest priority fee
      return { fee: defaultPriorityFee, balance: this.balances.balance };
    }

    const txPrerequisites: TransactionPrerequisite = {};
    for (const priority of Object.keys(averageTxFees)) {
      if (
        priority === defaultTxPriority ||
        defaultDebitedAmount === this.balances.balance
      ) {
        txPrerequisites[priority] = {
          inputs: defaultPriorityInputs,
          outputs: defaultPriorityOutputs,
          fee: defaultPriorityFee,
          estimatedBlocks: defaultEstimatedBlocks,
        };
      } else {
        // re-computing inputs with a non-default priority fee
        const { inputs, outputs, fee } = coinselect(
          inputUTXOs,
          outputUTXOs,
          averageTxFees[priority].feePerByte,
        );
        const debitedAmount = netAmount + fee;
        if (!inputs || debitedAmount > this.balances.balance) {
          // to default priorty assets
          txPrerequisites[priority] = {
            inputs: defaultPriorityInputs,
            outputs: defaultPriorityOutputs,
            fee: defaultPriorityFee,
            estimatedBlocks: defaultEstimatedBlocks,
          };
        } else {
          txPrerequisites[priority] = {
            inputs,
            outputs,
            fee,
            estimatedBlocks: averageTxFees[priority].estimatedBlocks,
          };
        }
      }
    }

    console.log({ txPrerequisites });
    return { txPrerequisites };
  };

  public createHDTransaction = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: any,
    nSequence?: number,
  ): Promise<{
    txb: bitcoinJS.TransactionBuilder;
  }> => {
    try {
      let inputs, outputs;
      if (txnPriority === 'custom' && customTxPrerequisites) {
        inputs = customTxPrerequisites.inputs;
        outputs = customTxPrerequisites.outputs;
      } else {
        inputs = txPrerequisites[txnPriority].inputs;
        outputs = txPrerequisites[txnPriority].outputs;
      }
      console.log({ inputs, outputs });
      const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      );

      inputs.forEach((input) =>
        txb.addInput(input.txId, input.vout, nSequence),
      );

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

        const keyPair = this.getKeyPair(
          this.addressToPrivateKey(input.address),
        );
        console.log({ keyPair });
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
        output.address = this.getAddress(true, this.nextFreeChangeAddressIndex);
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

  private getPrivateKey = (
    change: boolean,
    index: number,
    derivativeXpriv?: string,
  ) => {
    const node = bip32.fromBase58(
      derivativeXpriv ? derivativeXpriv : this.getXpriv(),
      this.network,
    );
    return node
      .derive(change ? 1 : 0)
      .derive(index)
      .toWIF();
  };

  private getAddress = (
    internal: boolean,
    index: number,
    derivativeXpub?: string,
  ): string => {
    const node = bip32.fromBase58(
      derivativeXpub ? derivativeXpub : this.getXpub(),
      this.network,
    );
    return this.deriveAddress(
      node.derive(internal ? 1 : 0).derive(index),
      this.purpose,
    );
  };

  private addressToPrivateKey = (address: string): string => {
    for (
      let itr = 0;
      itr <= this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      if (this.getAddress(true, itr) === address) {
        return this.getPrivateKey(true, itr);
      }
    }

    for (let itr = 0; itr <= this.nextFreeAddressIndex + this.gapLimit; itr++) {
      if (this.getAddress(false, itr) === address) {
        return this.getPrivateKey(false, itr);
      }
    }

    if (!this.isTest) {
      // address to WIF for derivative accounts
      for (const dAccountType of Object.keys(config.DERIVATIVE_ACC)) {
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
                derivativeInstance.nextFreeAddressIndex +
                  this.derivativeGapLimit; // would always be greater than
                itr++
              ) {
                if (
                  this.getAddress(false, itr, derivativeInstance.xpub) ===
                  address
                ) {
                  return this.getPrivateKey(
                    false,
                    itr,
                    derivativeInstance.xpriv,
                  );
                }
              }
            }
          }
        }
      }
    }

    throw new Error('Could not find private key for: ' + address);
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

  private getXpriv = () => {
    if (this.xpriv) {
      return this.xpriv;
    }
    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    const root = bip32.fromSeed(seed, this.network);
    const child = root.derivePath(this.derivationPath);
    this.xpriv = child.toBase58();

    return this.xpriv;
  };

  private generateDerivativeXpub = (
    accountType: string,
    accountNumber: number = 1,
    contactName?: string,
  ) => {
    if (!this.derivativeAccounts[accountType])
      throw new Error('Unsupported dervative account');
    if (accountNumber > this.derivativeAccounts[accountType].instance.max)
      throw Error(
        `Cannot create more than ${this.derivativeAccounts[accountType].instance.max} ${accountType} derivative accounts`,
      );
    if (this.derivativeAccounts[accountType][accountNumber]) {
      return this.derivativeAccounts[accountType][accountNumber]['xpub'];
    } else {
      const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
      const root = bip32.fromSeed(seed, this.network);
      const path = `m/${this.purpose}'/${
        this.network === bitcoinJS.networks.bitcoin ? 0 : 1
      }'/${this.derivativeAccounts[accountType]['series'] + accountNumber}'`;
      const xpriv = root.derivePath(path).toBase58();
      const xpub = root.derivePath(path).neutered().toBase58();
      this.derivativeAccounts[accountType][accountNumber] = {
        xpriv,
        xpub,
        nextFreeAddressIndex: 0,
      };
      this.derivativeAccounts[accountType].instance.using++;

      if (contactName) {
        this.derivativeAccounts[accountType][
          accountNumber
        ].contactName = contactName;
        this.trustedContactToDA[contactName] = accountNumber;
      }

      this.derivativeAccounts[accountType][
        accountNumber
      ].receivingAddress = this.getAddress(false, 0, xpub);

      return xpub;
    }
  };
}
