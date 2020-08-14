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
  private internalAddresssesCache: {};
  private externalAddressesCache: {};
  private addressToWIFCache: {};
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
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
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
    const address = this.getAddress(keyPair, this.purpose); // getting the first receiving address
    return {
      accountId: crypto.createHash('sha256').update(address).digest('hex'),
    };
  };

  public getInitialReceivingAddress = (): string => {
    return this.getExternalAddressByIndex(0);
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

        const address = this.getExternalAddressByIndex(
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex + itr,
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
          this.derivativeAccounts[accountType][accountNumber]
            .nextFreeAddressIndex + itr,
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
      // looking for free external address
      let freeAddress = '';
      let itr;

      const { nextFreeAddressIndex } = account.contactDetails;
      if (nextFreeAddressIndex !== 0 && !nextFreeAddressIndex)
        account.contactDetails.nextFreeAddressIndex = 0;

      for (itr = 0; itr < this.derivativeGapLimit + 1; itr++) {
        if (account.contactDetails.nextFreeAddressIndex + itr < 0) {
          continue;
        }

        const address = this.getExternalAddressByIndex(
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        );

        const txCounts = await this.getTxCounts([address]);
        if (txCounts[address] === 0) {
          // free address found
          freeAddress = address;
          account.contactDetails.nextFreeAddressIndex += itr;
          break;
        }
      }

      if (!freeAddress) {
        // giving up as we could find a free address in the above cycle

        console.log(
          'Failed to find a free address in the above cycle, using the next address without checking',
        );
        const address = this.getExternalAddressByIndex(
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        );
        freeAddress = address;
        account.contactDetails.nextFreeAddressIndex += itr + 1;
      }

      account.contactDetails.receivingAddress = freeAddress;
      return { address: freeAddress };
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
        this.getExternalAddressByIndex(
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
    ].receivingAddress = this.getExternalAddressByIndex(
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
            this.getExternalAddressByIndex(
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
          ].receivingAddress = this.getExternalAddressByIndex(
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
      // finding free external address
      let freeAddress = '';
      let itr;
      for (itr = 0; itr < this.gapLimit + 1; itr++) {
        const address = this.getExternalAddressByIndex(itr, xpub);
        const txCounts = await this.getTxCounts([address]); // ensuring availability
        if (txCounts[address] === 0) {
          // free address found
          freeAddress = address;
          break;
        }
      }

      if (!freeAddress) {
        console.log(
          'Failed to find a free address in the external address cycle, using the next address without checking',
        );
        // giving up as we couldn't find a free address in the above cycle
        freeAddress = this.getExternalAddressByIndex(itr); // not checking this one, it might be free
      }

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
      // this.balances = { balance: amount * 1e8, unconfirmedBalance: 0 }; // assumption: we don't call testFaucet twice (spendable exception: 1st receive test-utxo)
      const {
        UTXOs,
        balances,
        transactions,
        nextFreeAddressIndex,
      } = await this.fetchBalanceTransactionsByAddresses(
        this.usedAddresses,
        [],
        this.usedAddresses,
        this.nextFreeAddressIndex - 1,
        'Test Account',
      );

      const confirmedUTXOs = [];
      for (const utxo of UTXOs) {
        if (utxo.status) {
          if (
            this.isTest &&
            utxo.address === this.getExternalAddressByIndex(0)
          ) {
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
      this.receivingAddress = this.getExternalAddressByIndex(
        this.nextFreeAddressIndex,
      );

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
    // scanning future addresses in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
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
        this.derivativeGapLimit -
        1,
      this.derivativeAccounts[accountType][accountNumber].xpub,
    );

    const txCounts = await this.getTxCounts([externalAddress]);

    if (txCounts[externalAddress] > 0) {
      this.derivativeAccounts[accountType][
        accountNumber
      ].nextFreeAddressIndex += this.derivativeGapLimit;
      tryAgain = true;
    }

    if (tryAgain) {
      return this.derivativeAccGapLimitCatchup(accountType, accountNumber);
    }
  };

  private gapLimitCatchUp = async () => {
    // scanning future addresses in hierarchy for transactions, in case our 'next free addr' indexes are lagging behind
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
    const externalAddresses = [];
    for (let itr = 0; itr < this.nextFreeAddressIndex + this.gapLimit; itr++) {
      externalAddresses.push(this.getExternalAddressByIndex(itr));
    }

    const internalAddresses = [];
    for (
      let itr = 0;
      itr < this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      internalAddresses.push(this.getInternalAddressByIndex(itr));
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
    } = await this.fetchBalanceTransactionsByAddresses(
      externalAddresses,
      internalAddresses,
      ownedAddresses,
      this.nextFreeAddressIndex - 1,
      this.isTest ? 'Test Account' : 'Checking Account',
    );

    const confirmedUTXOs = [];
    for (const utxo of UTXOs) {
      if (utxo.status) {
        if (this.isTest && utxo.address === this.getExternalAddressByIndex(0)) {
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
    this.receivingAddress = this.getExternalAddressByIndex(
      this.nextFreeAddressIndex,
    );

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
    if (
      !defaultPriorityInputs ||
      defaultDebitedAmount > this.balances.balance
    ) {
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

        const keyPair = this.getKeyPair(this.getWifForAddress(input.address));
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
        await this.fetchBalanceTransaction();
      }

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
      ];
      console.log({ ownedAddresses });
      const { UTXOs } = await this.multiFetchUnspentOutputs(ownedAddresses);

      // if (this.isTest) return UTXOs;
      const changeAddresses = [];
      for (
        let itr = 0;
        itr < this.nextFreeChangeAddressIndex + this.gapLimit;
        itr++
      ) {
        changeAddresses.push(this.getInternalAddressByIndex(itr));
      }
      const confirmedUTXOs = [];
      for (const utxo of UTXOs) {
        if (utxo.status) {
          if (
            this.isTest &&
            utxo.address === this.getExternalAddressByIndex(0)
          ) {
            confirmedUTXOs.push(utxo); // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            continue;
          }

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

  private getWIFbyIndex = (
    change: boolean,
    index: number,
    derivativeXpriv?: string,
  ) => {
    const node = bip32.fromBase58(
      derivativeXpriv ? derivativeXpriv : this.getXpriv(),
      this.network,
    );
    const keyPair = node.derive(change ? 1 : 0).derive(index);
    return keyPair.toWIF();
  };

  private getExternalWIFByIndex = (
    index: number,
    derivativeXpriv?: string,
  ): string => {
    return this.getWIFbyIndex(false, index, derivativeXpriv);
  };

  private getInternalWIFByIndex = (
    index: number,
    derivativeXpriv?: string,
  ): string => {
    return this.getWIFbyIndex(true, index, derivativeXpriv);
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

  private getInternalAddressByIndex = (
    index: number,
    derivativeXpub?: string,
  ): string => {
    if (!derivativeXpub && this.internalAddresssesCache[index]) {
      return this.internalAddresssesCache[index];
    } // cache hit

    const node = bip32.fromBase58(
      derivativeXpub ? derivativeXpub : this.getXpub(),
      this.network,
    );
    const keyPair = node.derive(1).derive(index);
    const address = this.getAddress(keyPair, this.purpose);

    if (!derivativeXpub) {
      this.internalAddresssesCache[index] = address;
    }
    return address;
  };

  private getWifForAddress = (address: string): string => {
    // contains address to WIF mapping (including derivative acc)
    if (this.addressToWIFCache[address]) {
      return this.addressToWIFCache[address];
    } // cache hit

    // fast approach, first lets iterate over all addresses we have in cache
    // for (const index of Object.keys(this.internalAddresssesCache)) {
    //   if (this.getInternalAddressByIndex(parseInt(index, 10)) === address) {
    //     return (this.addressToWIFCache[address] = this.getInternalWIFByIndex(
    //       parseInt(index, 10),
    //     ));
    //   }
    // }

    // for (const index of Object.keys(this.externalAddressesCache)) {
    //   if (this.getExternalAddressByIndex(parseInt(index, 10)) === address) {
    //     return (this.addressToWIFCache[address] = this.getExternalWIFByIndex(
    //       parseInt(index, 10),
    //     ));
    //   }
    // }

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
        return this.getExternalWIFByIndex(itr);
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
                const possibleAddress = this.getExternalAddressByIndex(
                  itr,
                  derivativeInstance.xpub,
                );
                if (possibleAddress === address) {
                  return this.getExternalWIFByIndex(
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
      const ypub = this.xpubToYpub(xpub, null, this.network);
      this.derivativeAccounts[accountType][accountNumber] = {
        xpriv,
        xpub,
        ypub,
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
      ].receivingAddress = this.getExternalAddressByIndex(0, xpub);

      return xpub;
    }
  };
}
