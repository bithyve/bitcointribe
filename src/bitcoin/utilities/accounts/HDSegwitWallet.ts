/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import * as bitcoinJS from 'bitcoinjs-lib'
import coinselect from 'coinselect'
import crypto from 'crypto'
import config from '../../HexaConfig'
import Bitcoin from './Bitcoin'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  TrustedContactDerivativeAccount,
  TrustedContactDerivativeAccountElements,
  DonationDerivativeAccount,
  DonationDerivativeAccountElements,
  SubPrimaryDerivativeAccount,
  SubPrimaryDerivativeAccountElements,
} from '../Interface'
import axios, { AxiosResponse } from 'axios'
import {
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
} from '../../../common/constants/serviceTypes'
import { BH_AXIOS } from '../../../services/api'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'


const { HEXA_ID, REQUEST_TIMEOUT } = config
const bitcoinAxios = axios.create( {
  timeout: REQUEST_TIMEOUT 
} )

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
    | TrustedContactDerivativeAccount
    | DonationDerivativeAccount = config.DERIVATIVE_ACC;
  public newTransactions: Array<TransactionDetails> = [];
  public trustedContactToDA: { [contactName: string]: number } = {
  };
  public feeRates: any;

  private mnemonic: string;
  private passphrase: string;
  private purpose: number;
  private derivationPath: string;
  private xpub: string;
  private xpriv: string;
  private nextFreeAddressIndex: number;
  private nextFreeChangeAddressIndex: number;
  private gapLimit: number;
  private lastBalTxSync = 0;
  private derivativeGapLimit: number;
  private confirmedUTXOs: Array<{
    txId: string;
    vout: number;
    value: number;
    address: string;
    status?: any;
  }> = [];

  constructor(
    mnemonic?: string,
    passphrase?: string,
    dPathPurpose?: number,
    stateVars?: {
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
    super( network )
    this.mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic( 256 )
    this.passphrase = passphrase
    this.purpose = dPathPurpose ? dPathPurpose : config.DPATH_PURPOSE
    // this.derivationPath =
    //   this.network === bitcoinJS.networks.bitcoin
    //     ? `m/${this.purpose}'/0'/0'`
    //     : `m/${this.purpose}'/1'/0'`;

    this.derivationPath = this.isTest
      ? `m/${this.purpose}'/1'/0'`
      : `m/${this.purpose}'/0'/0'` // helps with separating regular and test acc (even on the testnet)

    this.initializeStateVars( stateVars )
  }

  public initializeStateVars = ( stateVars ) => {
    this.nextFreeAddressIndex =
      stateVars && stateVars.nextFreeAddressIndex
        ? stateVars.nextFreeAddressIndex
        : 0
    this.nextFreeChangeAddressIndex =
      stateVars && stateVars.nextFreeChangeAddressIndex
        ? stateVars.nextFreeChangeAddressIndex
        : 0
    this.gapLimit = config.GAP_LIMIT
    this.derivativeGapLimit = config.DERIVATIVE_GAP_LIMIT
    this.balances =
      stateVars && stateVars.balances ? stateVars.balances : this.balances
    this.receivingAddress =
      stateVars && stateVars.receivingAddress
        ? stateVars.receivingAddress
        : this.getInitialReceivingAddress()
    this.transactions =
      stateVars && stateVars.transactions
        ? stateVars.transactions
        : this.transactions

    this.confirmedUTXOs =
      stateVars && stateVars.confirmedUTXOs
        ? stateVars.confirmedUTXOs
        : this.confirmedUTXOs
    this.derivativeAccounts =
      stateVars && stateVars.derivativeAccounts
        ? {
          ...config.DERIVATIVE_ACC, ...stateVars.derivativeAccounts 
        }
        : config.DERIVATIVE_ACC
    this.lastBalTxSync =
      stateVars && stateVars.lastBalTxSync
        ? stateVars.lastBalTxSync
        : this.lastBalTxSync
    this.newTransactions =
      stateVars && stateVars.newTransactions
        ? stateVars.newTransactions
        : this.newTransactions
    this.trustedContactToDA =
      stateVars && stateVars.trustedContactToDA
        ? stateVars.trustedContactToDA
        : this.trustedContactToDA
    this.feeRates =
      stateVars && stateVars.feeRates ? stateVars.feeRates : this.feeRates
  };

  public getMnemonic = (): { mnemonic: string } => {
    return {
      mnemonic: this.mnemonic 
    }
  };

  public getTestXPub = (): string => {
    if ( this.isTest ) {
      if ( this.xpub ) {
        return this.xpub
      }
      const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
      const root = bip32.fromSeed( seed, this.network )
      const child = root.derivePath( this.derivationPath ).neutered()
      this.xpub = child.toBase58()

      return this.xpub
    }
  };

  public getWalletId = (): { walletId: string } => {
    const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
    return {
      walletId: crypto.createHash( 'sha256' ).update( seed ).digest( 'hex' ),
    }
  };

  public getAccountId = (): string => {
    const xpub = this.getXpub()
    return crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
  };

  public getInitialReceivingAddress = (): string => {
    return this.getAddress( false, 0 )
  };

  public getReceivingAddress = (
    derivativeAccountType?: string,
    accountNumber?: number,
  ): string => {
    let receivingAddress
    switch ( derivativeAccountType ) {
        case DONATION_ACCOUNT:
          const donationAcc: DonationDerivativeAccountElements = this
            .derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ]
          receivingAddress = donationAcc ? donationAcc.receivingAddress : ''
          break

        case SUB_PRIMARY_ACCOUNT:
          const account = this.derivativeAccounts[ SUB_PRIMARY_ACCOUNT ][
            accountNumber
          ]
          receivingAddress = account ? account.receivingAddress : ''
          break

        default:
          receivingAddress = this.receivingAddress
    }
    return receivingAddress
  };

  public getDerivativeAccXpub = (
    accountType: string,
    accountNumber?: number,
    contactName?: string,
  ): string => {
    // generates receiving xpub for derivative accounts
    if ( accountType === TRUSTED_CONTACTS ) {
      if ( !contactName )
        throw new Error( `Required param: contactName for ${accountType}` )

      return this.getTrustedContactDerivativeAccXpub( accountType, contactName )
    }

    const baseXpub = this.generateDerivativeXpub( accountType, accountNumber )
    return baseXpub
  };

  public getTrustedContactDerivativeAccXpub = (
    accountType: string,
    contactName: string,
  ): string => {
    contactName = contactName.toLowerCase().trim()
    const trustedAccounts: TrustedContactDerivativeAccount = this
      .derivativeAccounts[ accountType ]
    const inUse = trustedAccounts.instance.using

    let accountNumber = this.trustedContactToDA[ contactName ]
    if ( accountNumber ) {
      return trustedAccounts[ accountNumber ].xpub
    }

    // for (let index = 0; index <= inUse; index++) {
    //   if (
    //     trustedAccounts[index] &&
    //     trustedAccounts[index].contactName === contactName
    //   ) {
    //     return trustedAccounts[index].xpub;
    //   }
    // }
    accountNumber = inUse + 1

    const baseXpub = this.generateTrustedDerivativeXpub(
      accountType,
      accountNumber,
      contactName,
    )

    return baseXpub
  };

  public getDerivativeAccReceivingAddress = async (
    accountType: string,
    accountNumber = 1,
    contactName?: string,
    accountName?: string,
  ): Promise<{ address: string }> => {
    // generates receiving address for derivative accounts
    if ( !this.derivativeAccounts[ accountType ] )
      if ( config[ accountType ] )
        this.derivativeAccounts = {
          ...this.derivativeAccounts,
          [ accountType ]: config[ accountType ],
        }
      else throw new Error( `${accountType} does not exists` )

    switch ( accountType ) {
        case TRUSTED_CONTACTS:
          if ( !contactName )
            throw new Error( `Required param: contactName for ${accountType}` )

          return this.getTrustedContactDerivativeAccReceivingAddress(
            accountType,
            contactName,
          )

        case DONATION_ACCOUNT:
          if ( !this.derivativeAccounts[ accountType ][ accountNumber ] )
            throw new Error( `Donation account(${accountNumber}) doesn't exist` )

          break

        default:
          if ( !this.derivativeAccounts[ accountType ][ accountNumber ] )
            this.generateDerivativeXpub( accountType, accountNumber, accountName )
          break
    }

    // receiving address updates during balance sync
    return {
      address: this.derivativeAccounts[ accountType ][ accountNumber ]
        .receivingAddress,
    }
  };

  public getTrustedContactDerivativeAccReceivingAddress = async (
    accountType: string,
    contactName: string,
  ) => {
    // provides receiving address from the contact's xpub
    contactName = contactName.toLowerCase().trim()
    const trustedAccounts: TrustedContactDerivativeAccount = this
      .derivativeAccounts[ accountType ]
    let account: TrustedContactDerivativeAccountElements

    const accountNumber = this.trustedContactToDA[ contactName ]
    if ( accountNumber ) {
      account = trustedAccounts[ accountNumber ]
    }

    if ( !account ) {
      throw new Error(
        `No contact derivative account exists for: ${contactName}`,
      )
    } else if ( !account.contactDetails ) {
      throw new Error( `Contact details (xpub) missing for ${contactName}` )
    }

    try {
      let availableAddress = ''
      let itr

      const { nextFreeAddressIndex } = account.contactDetails
      if ( nextFreeAddressIndex !== 0 && !nextFreeAddressIndex )
        account.contactDetails.nextFreeAddressIndex = 0

      for ( itr = 0; itr < this.derivativeGapLimit + 1; itr++ ) {
        const address = this.getAddress(
          false,
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        )

        const txCounts = await this.getTxCounts( [ address ] )
        if ( txCounts[ address ] === 0 ) {
          availableAddress = address
          account.contactDetails.nextFreeAddressIndex += itr
          break
        }
      }

      if ( !availableAddress )
        account.contactDetails.nextFreeAddressIndex += itr + 1

      account.contactDetails.receivingAddress = availableAddress
        ? availableAddress
        : this.getAddress(
          false,
          account.contactDetails.nextFreeAddressIndex + itr,
          account.contactDetails.xpub,
        )

      return {
        address: account.contactDetails.receivingAddress 
      }
    } catch ( err ) {
      throw new Error( `Unable to generate receiving address: ${err.message}` )
    }
  };

  public fetchDerivativeAccBalanceTxs = async (
    accountType: string,
    accountNumber = 1,
    contactName?: string,
  ): Promise<{
    balances: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions: Transactions;
  }> => {
    if ( !this.derivativeAccounts[ accountType ] )
      throw new Error( `${accountType} does not exists` )

    if ( accountType === TRUSTED_CONTACTS ) {
      if ( !contactName )
        throw new Error( `Required param: contactName for ${accountType}` )

      contactName = contactName.toLowerCase().trim()
      accountNumber = this.trustedContactToDA[ contactName ]

      if ( !accountNumber ) {
        throw new Error(
          `No contact derivative account exists for: ${contactName}`,
        )
      }
    } else if ( !this.derivativeAccounts[ accountType ][ accountNumber ] ) {
      this.generateDerivativeXpub( accountType, accountNumber )
    }

    // await this.derivativeAccGapLimitCatchup(accountType, accountNumber);

    let {
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
    } = this.derivativeAccounts[ accountType ][ accountNumber ]

    // supports upgrading from a previous version containing TC (where nextFreeAddressIndex is undefined)
    if ( nextFreeAddressIndex !== 0 && !nextFreeAddressIndex )
      nextFreeAddressIndex = 0
    if ( nextFreeChangeAddressIndex !== 0 && !nextFreeChangeAddressIndex )
      nextFreeChangeAddressIndex = 0

    const externalAddresses = []
    const internalAddresses = []
    const ownedAddresses = []
    for (
      let itr = 0;
      itr < nextFreeAddressIndex + this.derivativeGapLimit;
      itr++
    ) {
      const address = this.getAddress(
        false,
        itr,
        this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
      )
      externalAddresses.push( address )
      ownedAddresses.push( address )
    }

    for (
      let itr = 0;
      itr < nextFreeChangeAddressIndex + this.derivativeGapLimit;
      itr++
    ) {
      const address = this.getAddress(
        true,
        itr,
        this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
      )
      internalAddresses.push( address )
      ownedAddresses.push( address )
    }

    const usedAddresses = [ ...externalAddresses, ...internalAddresses ]
    this.derivativeAccounts[ accountType ][ accountNumber ][
      'usedAddresses'
    ] = usedAddresses

    // console.log({ derivativeAccUsedAddresses: usedAddresses });

    const externalAddressSet = externalAddresses
    const internalAddressSet = internalAddresses
    const res = await this.fetchBalanceTransactionsByAddresses(
      externalAddressSet,
      internalAddressSet,
      externalAddresses, 
      internalAddresses,
      ownedAddresses,
      this.derivativeAccounts[ accountType ][ accountNumber ].nextFreeAddressIndex -
        1,
      this.derivativeAccounts[ accountType ][ accountNumber ]
        .nextFreeChangeAddressIndex - 1,
      accountType,
      contactName,
      accountType === SUB_PRIMARY_ACCOUNT ? 'Checking Account' : null,
    )

    const { balances, transactions, UTXOs } = res

    const confirmedUTXOs = []
    for ( const utxo of UTXOs ) {
      if ( utxo.status ) {
        if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        else {
          if ( internalAddresses.includes( utxo.address ) ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push( utxo )
          }
        }
      } else {
        // utxo's from fallback won't contain status var (defaulting them as confirmed)
        confirmedUTXOs.push( utxo )
      }
    }

    const lastSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
    let latestSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
    const newTransactions: Array<TransactionDetails> = [] // delta transactions
    for ( const tx of transactions.transactionDetails ) {
      if ( tx.status === 'Confirmed' && tx.transactionType === 'Received' ) {
        if ( tx.blockTime > lastSyncTime ) {
          newTransactions.push( tx )
        }
        if ( tx.blockTime > latestSyncTime ) {
          latestSyncTime = tx.blockTime
        }
      }
    }

    this.derivativeAccounts[ accountType ][ accountNumber ] = {
      ...this.derivativeAccounts[ accountType ][ accountNumber ],
      lastBalTxSync: latestSyncTime,
      newTransactions,
      confirmedUTXOs,
      balances,
      transactions,
      nextFreeAddressIndex: res.nextFreeAddressIndex,
      nextFreeChangeAddressIndex: res.nextFreeChangeAddressIndex,
      receivingAddress: this.getAddress(
        false,
        res.nextFreeAddressIndex,
        this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
      ),
    }

    return {
      balances, transactions 
    }
  };

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
  ): Promise<{
    synched: boolean;
  }> => {
    const accountsToAddressMapping = {
    }
    for ( const dAccountType of accountTypes ) {
      const derivativeAccounts = this.derivativeAccounts[ dAccountType ]

      if ( !derivativeAccounts.instance.using ) continue
      for (
        let accountNumber = 1;
        accountNumber <= derivativeAccounts.instance.using;
        accountNumber++
      ) {
        // await this.derivativeAccGapLimitCatchup(dAccountType, accountNumber);
        let {
          nextFreeAddressIndex,
          nextFreeChangeAddressIndex
        } = this.derivativeAccounts[ dAccountType ][ accountNumber ]

        // supports upgrading from a previous version containing TC (where nextFreeAddressIndex is undefined)
        if ( nextFreeAddressIndex !== 0 && !nextFreeAddressIndex )
          nextFreeAddressIndex = 0
        if ( nextFreeChangeAddressIndex !== 0 && !nextFreeChangeAddressIndex )
          nextFreeChangeAddressIndex = 0

        const externalAddresses = []
        const internalAddresses = []
        for (
          let itr = 0;
          itr < nextFreeAddressIndex + this.derivativeGapLimit;
          itr++
        ) {
          externalAddresses.push(
            this.getAddress(
              false,
              itr,
              this.derivativeAccounts[ dAccountType ][ accountNumber ].xpub,
            ),
          )
        }

        for (
          let itr = 0;
          itr < nextFreeChangeAddressIndex + this.derivativeGapLimit;
          itr++
        ) {
          internalAddresses.push(
            this.getAddress(
              true,
              itr,
              this.derivativeAccounts[ dAccountType ][ accountNumber ].xpub,
            ),
          )
        }

        const usedAddresses = [ ...externalAddresses, ...internalAddresses ]

        this.derivativeAccounts[ dAccountType ][ accountNumber ][
          'usedAddresses'
        ] = usedAddresses // derv used addresses forms a part of ownedAddresses array during primary-acc sync
        // console.log({ derivativeAccUsedAddresses: usedAddresses });

        const  { xpubId } = this.derivativeAccounts[ dAccountType ][ accountNumber ]
        accountsToAddressMapping[ xpubId ] = {
          External: externalAddresses,
          Internal: internalAddresses,
          Owned: [ ...externalAddresses, ...internalAddresses ],
        }
      }
    }

    if ( !Object.keys( accountsToAddressMapping ).length ) return

    let res: AxiosResponse
    try {
      if ( this.network === bitcoinJS.networks.testnet ) {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
          accountsToAddressMapping,
        )
      } else {
        res = await bitcoinAxios.post(
          config.ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
          accountsToAddressMapping,
        )
      }

      const accountsToResponseMapping = res.data
      if ( !Object.keys( accountsToResponseMapping ).length ) return

      for ( const dAccountType of accountTypes ) {
        const derivativeAccounts = this.derivativeAccounts[ dAccountType ]

        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccounts.instance.using;
          accountNumber++
        ) {
          const {
            nextFreeAddressIndex,
            nextFreeChangeAddressIndex,
            xpubId,
          } = derivativeAccounts[ accountNumber ]
          const addressInUse = derivativeAccounts[ accountNumber ].usedAddresses

          if ( !accountsToResponseMapping[ xpubId ] ) continue

          const { Utxos, Txs } = accountsToResponseMapping[ xpubId ]
          if ( !Utxos && !Txs ) continue

          const balances = {
            balance: 0,
            unconfirmedBalance: 0,
          }
          const externalAddresses = []
          const internalAddresses = []
          const ownedAddresses = {
          }

          for (
            let itr = 0;
            itr < nextFreeAddressIndex + this.derivativeGapLimit;
            itr++
          ) {
            const address = this.getAddress(
              false,
              itr,
              this.derivativeAccounts[ dAccountType ][ accountNumber ].xpub,
            )
            externalAddresses.push( address )
            ownedAddresses[ address ] = true
          }

          for (
            let itr = 0;
            itr < nextFreeChangeAddressIndex + this.derivativeGapLimit;
            itr++
          ) {
            const address = this.getAddress(
              true,
              itr,
              this.derivativeAccounts[ dAccountType ][ accountNumber ].xpub,
            )
            internalAddresses.push( address )
            ownedAddresses[ address ] = true
          }

          const UTXOs = []
          if ( Utxos )
            for ( const addressSpecificUTXOs of Utxos ) {
              for ( const utxo of addressSpecificUTXOs ) {
                const { value, Address, status, vout, txid } = utxo

                if ( addressInUse.includes( Address ) ) {
                  UTXOs.push( {
                    txId: txid,
                    vout,
                    value,
                    address: Address,
                    status,
                  } )

                  if ( status.confirmed ) balances.balance += value
                  else if ( internalAddresses.includes( Address ) )
                    balances.balance += value
                  else balances.unconfirmedBalance += value
                }
              }
            }

          const confirmedUTXOs = []

          for ( const utxo of UTXOs ) {
            if ( utxo.status ) {
              if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
              else {
                if ( internalAddresses.includes( utxo.address ) ) {
                  // defaulting utxo's on the change branch to confirmed
                  confirmedUTXOs.push( utxo )
                }
              }
            } else {
              // utxo's from fallback won't contain status var (defaulting them as confirmed)
              confirmedUTXOs.push( utxo )
            }
          }

          const transactions: Transactions = {
            totalTransactions: 0,
            confirmedTransactions: 0,
            unconfirmedTransactions: 0,
            transactionDetails: [],
          }

          const addressesInfo = Txs
          const txMap = new Map()

          let lastUsedAddressIndex = nextFreeAddressIndex - 1
          let lastUsedChangeAddressIndex = nextFreeChangeAddressIndex - 1

          if ( addressesInfo )
            for ( const addressInfo of addressesInfo ) {
              if ( addressInfo.TotalTransactions === 0 ) continue

              transactions.totalTransactions += addressInfo.TotalTransactions
              transactions.confirmedTransactions +=
                addressInfo.ConfirmedTransactions
              transactions.unconfirmedTransactions +=
                addressInfo.UnconfirmedTransactions

              addressInfo.Transactions.forEach( ( tx ) => {
                if ( !txMap.has( tx.txid ) ) {
                  // check for duplicate tx (fetched against sending and then again for change address)
                  txMap.set( tx.txid, true )

                  let accType = dAccountType
                  switch ( accType ) {
                      case TRUSTED_CONTACTS:
                        accType = derivativeAccounts[ accountNumber ].contactName
                          .split( ' ' )
                          .map(
                            ( word ) => word[ 0 ].toUpperCase() + word.substring( 1 ),
                          )
                          .join( ' ' )
                        break

                      case SUB_PRIMARY_ACCOUNT:
                        accType = 'Checking Account'
                        break
                  }

                  const transaction = {
                    txid: tx.txid,
                    confirmations: tx.NumberofConfirmations,
                    status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                    fee: tx.fee,
                    date: tx.Status.block_time
                      ? new Date( tx.Status.block_time * 1000 ).toUTCString()
                      : new Date( Date.now() ).toUTCString(),
                    transactionType: tx.TransactionType,
                    amount:
                      tx.TransactionType === 'Sent'
                        ? tx.Amount + tx.fee
                        : tx.Amount,
                    accountType: accType,
                    recipientAddresses: tx.RecipientAddresses,
                    senderAddresses: tx.SenderAddresses,
                    blockTime: tx.Status.block_time, // only available when tx is confirmed
                    address: addressInfo.Address
                  }

                  // over-ride sent transaction's accountType variable for derivative accounts
                  // covers situations when a complete UTXO is spent from the dAccount without a change being sent to the parent account
                  if ( transaction.transactionType === 'Sent' )
                    transaction.accountType = 'Checking Account'

                  transactions.transactionDetails.push( transaction )
                }
              } )

              const addressIndex = externalAddresses.indexOf(
                addressInfo.Address,
              )
              if ( addressIndex > -1 ) {
                lastUsedAddressIndex =
                  addressIndex > lastUsedAddressIndex
                    ? addressIndex
                    : lastUsedAddressIndex
              } else {
                const changeAddressIndex = internalAddresses.indexOf(
                  addressInfo.Address,
                )
                if ( changeAddressIndex > -1 ) {
                  lastUsedChangeAddressIndex =
                    changeAddressIndex > lastUsedChangeAddressIndex
                      ? changeAddressIndex
                      : lastUsedChangeAddressIndex
                }
              }
            }

          const lastSyncTime =
            this.derivativeAccounts[ dAccountType ][ accountNumber ]
              .lastBalTxSync || 0
          let latestSyncTime =
            this.derivativeAccounts[ dAccountType ][ accountNumber ]
              .lastBalTxSync || 0
          const newTransactions: Array<TransactionDetails> = [] // delta transactions
          for ( const tx of transactions.transactionDetails ) {
            if (
              tx.status === 'Confirmed' &&
              tx.transactionType === 'Received'
            ) {
              if ( tx.blockTime > lastSyncTime ) {
                newTransactions.push( tx )
              }
              if ( tx.blockTime > latestSyncTime ) {
                latestSyncTime = tx.blockTime
              }
            }
          }

          this.derivativeAccounts[ dAccountType ][ accountNumber ] = {
            ...this.derivativeAccounts[ dAccountType ][ accountNumber ],
            lastBalTxSync: latestSyncTime,
            newTransactions,
            confirmedUTXOs,
            balances,
            transactions,
            nextFreeAddressIndex: lastUsedAddressIndex + 1,
            nextFreeChangeAddressIndex: lastUsedChangeAddressIndex + 1,
            receivingAddress: this.getAddress(
              false,
              lastUsedAddressIndex + 1,
              this.derivativeAccounts[ dAccountType ][ accountNumber ].xpub,
            ),
          }
        }
      }

      return {
        synched: true 
      }
    } catch ( err ) {
      // console.log(
      //  `An error occurred while fetching balance-txnn via Esplora: ${err.response.data.err}`,
      //);
      throw new Error( 'Fetching balance-txn by addresses failed' )
    }
  };

  public syncViaXpubAgent = async (
    accountType: string,
    accountNumber: number,
  ): Promise<{
    synched: boolean;
  }> => {
    if (
      !this.derivativeAccounts[ accountType ] ||
      !this.derivativeAccounts[ accountType ][ accountNumber ]
    ) {
      throw new Error( `${accountType}:${accountNumber} does not exists` )
    }

    let accountDetails
    if ( accountType === DONATION_ACCOUNT ) {
      const { id } = this.derivativeAccounts[ accountType ][ accountNumber ]
      if ( id ) accountDetails = {
        donationId: id 
      }
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'fetchXpubInfo', {
        HEXA_ID,
        xpubId: this.derivativeAccounts[ accountType ][ accountNumber ].xpubId,
        accountType,
        accountDetails,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const {
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      utxos,
      balances,
      transactions,
    } = res.data

    const internalAddresses = []
    for (
      let itr = 0;
      itr < nextFreeChangeAddressIndex + this.derivativeGapLimit;
      itr++
    ) {
      internalAddresses.push(
        this.getAddress(
          true,
          itr,
          this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
        ),
      )
    }

    const confirmedUTXOs = []
    for ( const utxo of utxos ) {
      if ( utxo.status ) {
        if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        else {
          if ( internalAddresses.includes( utxo.address ) ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push( utxo )
          }
        }
      } else {
        // utxo's from fallback won't contain status var (defaulting them as confirmed)
        confirmedUTXOs.push( utxo )
      }
    }

    const lastSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
    let latestSyncTime =
      this.derivativeAccounts[ accountType ][ accountNumber ].lastBalTxSync || 0
    const newTransactions: Array<TransactionDetails> = [] // delta transactions
    for ( const tx of transactions.transactionDetails ) {
      if ( tx.status === 'Confirmed' && tx.transactionType === 'Received' ) {
        if ( tx.blockTime > lastSyncTime ) {
          newTransactions.push( tx )
        }
        if ( tx.blockTime > latestSyncTime ) {
          latestSyncTime = tx.blockTime
        }
      }
    }

    this.derivativeAccounts[ accountType ][
      accountNumber
    ].lastBalTxSync = latestSyncTime
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].newTransactions = newTransactions
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].usedAddresses = usedAddresses
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].confirmedUTXOs = confirmedUTXOs
    this.derivativeAccounts[ accountType ][ accountNumber ].balances = balances
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].transactions = transactions
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].nextFreeAddressIndex = nextFreeAddressIndex
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].receivingAddress = this.getAddress(
      false,
      nextFreeAddressIndex,
      this.derivativeAccounts[ accountType ][ accountNumber ].xpub,
    )

    return {
      synched: true 
    }
  };

  public setupDerivativeAccount = (
    accountType: string,
    accountDetails: { accountName?: string; accountDescription?: string },
  ): {
    accountId: string;
    accountNumber: number;
  } => {
    let accountId: string
    let accountNumber: number
    switch ( accountType ) {
        case SUB_PRIMARY_ACCOUNT:
          const subPrimaryAccounts: SubPrimaryDerivativeAccount = this
            .derivativeAccounts[ accountType ]
          const inUse = subPrimaryAccounts.instance.using
          accountNumber = inUse + 1
          this.generateDerivativeXpub( accountType, accountNumber )
          const subPrimInstance: SubPrimaryDerivativeAccountElements = this
            .derivativeAccounts[ accountType ][ accountNumber ]
          const updatedSubPrimInstance = {
            ...subPrimInstance,
            accountName: accountDetails.accountName,
            accountDescription: accountDetails.accountDescription,
          }
          this.derivativeAccounts[ accountType ][
            accountNumber
          ] = updatedSubPrimInstance
          accountId = updatedSubPrimInstance.xpubId
          break
    }

    if ( !accountId ) throw new Error( `Failed to setup ${accountType} account` )
    return {
      accountId, accountNumber 
    }
  };

  public setupDonationAccount = async (
    donee: string,
    subject: string,
    description: string,
    configuration: {
      displayBalance: boolean;
      displayTransactions: boolean;
      displayTxDetails: boolean;
    },
    disableAccount = false,
  ): Promise<{
    setupSuccessful: boolean;
    accountId: string;
    accountNumber: number;
  }> => {
    const accountType = DONATION_ACCOUNT
    let donationAccounts: DonationDerivativeAccount = this.derivativeAccounts[
      accountType
    ]
    if ( !donationAccounts ) {
      this.derivativeAccounts = {
        ...this.derivativeAccounts,
        [ DONATION_ACCOUNT ]: config.DONATION_ACCOUNT,
      }
      donationAccounts = this.derivativeAccounts[ accountType ]
    }

    const inUse = donationAccounts.instance.using
    const accountNumber = inUse + 1

    const xpub = this.generateDerivativeXpub( accountType, accountNumber )
    let xpubId = this.derivativeAccounts[ accountType ][ accountNumber ].xpubId
    if ( !xpubId ) {
      xpubId = crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
      this.derivativeAccounts[ accountType ][ accountNumber ].xpubId = xpubId
    }

    const id = xpubId.slice( 0, 15 )
    this.derivativeAccounts[ accountType ][ accountNumber ] = {
      ...this.derivativeAccounts[ accountType ][ accountNumber ],
      donee,
      id,
      subject,
      description,
      configuration,
      disableAccount,
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'setupDonationAccount', {
        HEXA_ID,
        donationId: id,
        walletID: this.getWalletId().walletId,
        details: {
          donee,
          subject,
          description,
          xpubs: [ xpub ],
          xpubId,
          configuration,
        },
      } )
    } catch ( err ) {
      delete this.derivativeAccounts[ accountType ][ accountNumber ]
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { setupSuccessful } = res.data
    if ( !setupSuccessful ) {
      delete this.derivativeAccounts[ accountType ][ accountNumber ]
      throw new Error( 'Donation account setup failed' )
    }

    return {
      setupSuccessful, accountId: xpubId, accountNumber 
    }
  };

  public updateDonationPreferences = async (
    accountNumber: number,
    preferences: {
      disableAccount?: boolean;
      configuration?: {
        displayBalance: boolean;
        displayTransactions: boolean;
        displayTxDetails: boolean;
      };
      accountDetails?: {
        donee: string;
        subject: string;
        description: string;
      };
    },
  ): Promise<{ updated: boolean }> => {
    const donationAcc: DonationDerivativeAccountElements = this
      .derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ]
    if ( !donationAcc ) {
      throw new Error(
        `Donation account do not exist (instance id:${accountNumber})`,
      )
    }

    let res: AxiosResponse
    try {
      res = await BH_AXIOS.post( 'updatePreferences', {
        HEXA_ID,
        donationId: donationAcc.id,
        walletID: this.getWalletId().walletId,
        preferences,
      } )
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { updated } = res.data
    if ( !updated ) {
      throw new Error( 'Preference updation failed' )
    }

    const { configuration, disableAccount, accountDetails } = preferences
    if ( configuration )
      this.derivativeAccounts[ DONATION_ACCOUNT ][
        accountNumber
      ].configuration = configuration

    if ( disableAccount !== undefined )
      this.derivativeAccounts[ DONATION_ACCOUNT ][
        accountNumber
      ].disableAccount = disableAccount

    if ( accountDetails ) {
      this.derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ].donee =
        accountDetails.donee
      this.derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ].subject =
        accountDetails.subject
      this.derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ].description =
        accountDetails.description
    }

    return {
      updated 
    }
  };

  public deriveReceivingAddress = async (
    xpub: string,
  ): Promise<{ address: string }> => {
    try {
      let availableAddress = ''
      let itr
      for ( itr = 0; itr < this.gapLimit + 1; itr++ ) {
        const address = this.getAddress( false, itr, xpub )
        const txCounts = await this.getTxCounts( [ address ] )
        if ( txCounts[ address ] === 0 ) {
          availableAddress = address
          break
        }
      }

      return {
        address: availableAddress
          ? availableAddress
          : this.getAddress( false, itr ),
      }
    } catch ( err ) {
      throw new Error( `Unable to generate receiving address: ${err.message}` )
    }
  };

  public testnetFaucet = async (): Promise<{
    txid: any;
    funded: any;
    balances: any;
    transactions: any;
  }> => {
    if ( !this.isTest ) {
      throw new Error( 'Can only fund test account' )
    }
    const amount = 10000 / SATOSHIS_IN_BTC
    let res: AxiosResponse
    const recipientAddress = this.getAddress( false, 0 )
    try {
      res = await BH_AXIOS.post( '/testnetFaucet', {
        HEXA_ID,
        recipientAddress,
        amount,
      } )
      // console.log({ res });
    } catch ( err ) {
      if ( err.response ) throw new Error( err.response.data.err )
      if ( err.code ) throw new Error( err.code )
    }

    const { txid, funded } = res.data

    if ( txid ) {
      const externalAddresses = [ recipientAddress ]
      const internalAddresses = []
      const ownedAddresses = [ recipientAddress ]

      const externalAddressSet = externalAddresses
      const internalAddressSet = internalAddresses

      const {
        UTXOs,
        balances,
        transactions,
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
      } = await this.fetchBalanceTransactionsByAddresses(
        externalAddressSet,
        internalAddressSet,
        externalAddresses,
        internalAddresses,
        ownedAddresses,
        this.nextFreeAddressIndex - 1,
        this.nextFreeChangeAddressIndex - 1,
        'Test Account',
      )

      const confirmedUTXOs = []
      for ( const utxo of UTXOs ) {
        if ( utxo.status ) {
          if ( this.isTest && utxo.address === this.getAddress( false, 0 ) ) {
            confirmedUTXOs.push( utxo ) // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            continue
          }

          if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        } else {
          // utxo's from fallback won't contain status var (defaulting them as confirmed)
          confirmedUTXOs.push( utxo )
        }
      }
      this.confirmedUTXOs = confirmedUTXOs

      this.nextFreeAddressIndex = nextFreeAddressIndex
      this.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
      this.receivingAddress = this.getAddress( false, this.nextFreeAddressIndex )

      this.balances = balances
      this.transactions = transactions
    }
    return {
      txid,
      funded,
      balances: this.balances,
      transactions: this.transactions,
    }
  };

  public setNewTransactions = ( transactions: Transactions ) => {
    // delta transactions setter
    const lastSyncTime = this.lastBalTxSync
    let latestSyncTime = this.lastBalTxSync
    this.newTransactions = [] // delta transactions
    for ( const tx of transactions.transactionDetails ) {
      if ( tx.status === 'Confirmed' && tx.transactionType === 'Received' ) {
        if ( tx.blockTime > lastSyncTime ) {
          this.newTransactions.push( tx )
        }
        if ( tx.blockTime > latestSyncTime ) {
          latestSyncTime = tx.blockTime
        }
      }
    }
    this.lastBalTxSync = latestSyncTime
  };

  public fetchBalanceTransaction = async ( hardRefresh?: boolean  ): Promise<{
    balances: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions: Transactions;
  }> => {
    const ownedAddresses = [] // owned address mapping
    // owned addresses are used for apt tx categorization and transfer amount calculation
    console.log( { 
      hardRefresh 
    } )
    let startingExtIndex: number, closingExtIndex: number, startingIntIndex: number, closingIntIndex: number
    if( hardRefresh ){
      const hardGapLimit  = 10
      startingExtIndex = 0
      closingExtIndex = this.nextFreeAddressIndex + hardGapLimit
      startingIntIndex = 0
      closingIntIndex = this.nextFreeChangeAddressIndex + hardGapLimit
    } 
    else {
      const softGapLimit = 5
      startingExtIndex = this.nextFreeAddressIndex - softGapLimit >= 0? this.nextFreeAddressIndex - softGapLimit : 0
      closingExtIndex = this.nextFreeAddressIndex + softGapLimit
      startingIntIndex = this.nextFreeChangeAddressIndex - softGapLimit >= 0? this.nextFreeChangeAddressIndex - softGapLimit : 0
      closingIntIndex = this.nextFreeChangeAddressIndex + softGapLimit
    } 

    const externalAddresses = [] // all external addresses(till closingExtIndex)
    const externalAddressSet = [] // external address range set
    for ( let itr = 0; itr < closingExtIndex; itr++ ) {
      const address = this.getAddress( false, itr )
      externalAddresses.push( address )
      ownedAddresses.push( address )
      if( itr >= startingExtIndex ) externalAddressSet.push( address )
    }
    console.log( { 
      startingExtIndex, closingExtIndex, nextFreeAddressIndex: this.nextFreeAddressIndex
    } )

    const internalAddresses = [] // all internal addresses(till closingIntIndex)
    const internalAddressSet = [] // internal address range set
    for ( let itr = 0; itr < closingIntIndex; itr++ ) {
      const address = this.getAddress( true, itr )
      internalAddresses.push( address )
      ownedAddresses.push( address )
      if( itr >= startingIntIndex ) internalAddressSet.push( address )
    }
    console.log( { 
      startingIntIndex, closingIntIndex, nextFreeChangeAddressIndex: this.nextFreeChangeAddressIndex
    } )

    const batchedDerivativeAddresses = []
    if ( !this.isTest ) {
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.usedAddresses &&
              derivativeInstance.usedAddresses.length
            ) {
              batchedDerivativeAddresses.push(
                ...derivativeInstance.usedAddresses,
              )
              ownedAddresses.push( ...derivativeInstance.usedAddresses )
            }
          }
        }
      }
    }

    const {
      UTXOs,
      balances,
      transactions,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
    } = await this.fetchBalanceTransactionsByAddresses(
      externalAddressSet,
      internalAddressSet,
      externalAddresses,
      internalAddresses,
      ownedAddresses,
      this.nextFreeAddressIndex - 1,
      this.nextFreeChangeAddressIndex - 1,
      this.isTest ? 'Test Account' : 'Checking Account',
    )
    console.log( { 
      nextFreeAddressIndex 
    } )

    const confirmedUTXOs = []
    for ( const utxo of UTXOs ) {
      if ( utxo.status ) {
        if ( this.isTest && utxo.address === this.getAddress( false, 0 ) ) {
          confirmedUTXOs.push( utxo ) // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
          continue
        }

        if ( utxo.status.confirmed ) confirmedUTXOs.push( utxo )
        else {
          if ( internalAddressSet.includes( utxo.address ) ) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push( utxo )
          }
        }
      } else {
        // utxo's from fallback won't contain status var (defaulting them as confirmed)
        confirmedUTXOs.push( utxo )
      }
    }
    this.confirmedUTXOs = confirmedUTXOs
    this.nextFreeAddressIndex = nextFreeAddressIndex
    this.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex
    this.receivingAddress = this.getAddress( false, this.nextFreeAddressIndex )

    this.setNewTransactions( transactions )

    this.balances = balances
    this.transactions = transactions
    // console.log({ balances, transactions });
    return {
      balances, transactions 
    }
  };

  public calculateSendMaxFee = (
    numberOfRecipients,
    averageTxFees,
    derivativeAccountDetails?: { type: string; number: number },
  ): { fee: number } => {
    let inputUTXOs
    if ( derivativeAccountDetails ) {
      const derivativeUtxos = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ].confirmedUTXOs
      inputUTXOs = derivativeUtxos ? derivativeUtxos : []
    } else {
      const derivativeUTXOs = []
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.confirmedUTXOs &&
              derivativeInstance.confirmedUTXOs.length
            )
              derivativeUTXOs.push( ...derivativeInstance.confirmedUTXOs )
          }
        }
      }

      inputUTXOs = [ ...this.confirmedUTXOs, ...derivativeUTXOs ]
    }
    // console.log({ inputUTXOs });

    let confirmedBalance = 0
    inputUTXOs.forEach( ( utxo ) => {
      confirmedBalance += utxo.value
    } )
    const outputUTXOs = []
    for ( let index = 0; index < numberOfRecipients; index++ ) {
      // using random outputs for send all fee calculation
      outputUTXOs.push( {
        address: bitcoinJS.payments.p2sh( {
          redeem: bitcoinJS.payments.p2wpkh( {
            pubkey: bitcoinJS.ECPair.makeRandom().publicKey,
            network: this.network,
          } ),
          network: this.network,
        } ).address,
        value: Math.floor( confirmedBalance / numberOfRecipients ),
      } )
    }
    const { fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      averageTxFees[ 'low' ].feePerByte,
    )
    // console.log({ inputUTXOs, outputUTXOs, fee });

    return {
      fee 
    }
  };

  public calculateCustomFee = (
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
    derivativeAccountDetails?: { type: string; number: number },
  ) => {
    let inputUTXOs
    if ( derivativeAccountDetails ) {
      const derivativeUtxos = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ].confirmedUTXOs
      inputUTXOs = derivativeUtxos ? derivativeUtxos : []
    } else {
      const derivativeUTXOs = []
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.confirmedUTXOs &&
              derivativeInstance.confirmedUTXOs.length
            )
              derivativeUTXOs.push( ...derivativeInstance.confirmedUTXOs )
          }
        }
      }

      inputUTXOs = [ ...this.confirmedUTXOs, ...derivativeUTXOs ]
    }
    // console.log({ inputUTXOs });

    let confirmedBalance = 0
    inputUTXOs.forEach( ( utxo ) => {
      confirmedBalance += utxo.value
    } )
    const { inputs, outputs, fee } = coinselect(
      inputUTXOs,
      outputUTXOs,
      customTxFeePerByte,
    )

    if ( !inputs ) return {
      fee, balance: confirmedBalance 
    }

    return {
      inputs, outputs, fee, balance: confirmedBalance 
    }
  };

  public transactionPrerequisites = async (
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: any,
    derivativeAccountDetails?: { type: string; number: number },
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
    let inputUTXOs
    if ( derivativeAccountDetails ) {
      const derivativeUtxos = this.derivativeAccounts[
        derivativeAccountDetails.type
      ][ derivativeAccountDetails.number ].confirmedUTXOs
      inputUTXOs = derivativeUtxos ? derivativeUtxos : []
    } else {
      const derivativeUTXOs = []
      for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]
            if (
              derivativeInstance.confirmedUTXOs &&
              derivativeInstance.confirmedUTXOs.length
            )
              derivativeUTXOs.push( ...derivativeInstance.confirmedUTXOs )
          }
        }
      }

      inputUTXOs = [ ...this.confirmedUTXOs, ...derivativeUTXOs ]
    }

    // console.log('Input UTXOs:', inputUTXOs);
    let confirmedBalance = 0
    inputUTXOs.forEach( ( utxo ) => {
      confirmedBalance += utxo.value
    } )

    const outputUTXOs = []
    for ( const recipient of recipients ) {
      outputUTXOs.push( {
        address: recipient.address,
        value: recipient.amount,
      } )
    }
    // console.log('Output UTXOs:', outputUTXOs);

    const defaultTxPriority = 'low' // doing base calculation with low fee (helps in sending the tx even if higher priority fee isn't possible)
    // console.log({ averageTxFees });

    const defaultFeePerByte = averageTxFees[ defaultTxPriority ].feePerByte
    const defaultEstimatedBlocks =
      averageTxFees[ defaultTxPriority ].estimatedBlocks

    const assets = coinselect( inputUTXOs, outputUTXOs, defaultFeePerByte )
    const defaultPriorityInputs = assets.inputs
    const defaultPriorityOutputs = assets.outputs
    const defaultPriorityFee = assets.fee

    // console.log('-------Transaction--------');
    // console.log('\tDynamic Fee', defaultPriorityFee);
    // console.log('\tInputs:', defaultPriorityInputs);
    // console.log('\tOutputs:', defaultPriorityOutputs);

    let netAmount = 0
    recipients.forEach( ( recipient ) => {
      netAmount += recipient.amount
    } )
    const defaultDebitedAmount = netAmount + defaultPriorityFee
    if ( !defaultPriorityInputs || defaultDebitedAmount > confirmedBalance ) {
      // insufficient input utxos to compensate for output utxos + lowest priority fee
      return {
        fee: defaultPriorityFee, balance: confirmedBalance 
      }
    }

    const txPrerequisites: TransactionPrerequisite = {
    }
    for ( const priority of [ 'low', 'medium', 'high' ] ) {
      if (
        priority === defaultTxPriority ||
        defaultDebitedAmount === confirmedBalance
      ) {
        txPrerequisites[ priority ] = {
          inputs: defaultPriorityInputs,
          outputs: defaultPriorityOutputs,
          fee: defaultPriorityFee,
          estimatedBlocks: defaultEstimatedBlocks,
        }
      } else {
        // re-computing inputs with a non-default priority fee
        const { inputs, outputs, fee } = coinselect(
          inputUTXOs,
          outputUTXOs,
          averageTxFees[ priority ].feePerByte,
        )
        const debitedAmount = netAmount + fee
        if ( !inputs || debitedAmount > confirmedBalance ) {
          // to previous priority assets
          if ( priority === 'medium' )
            txPrerequisites[ priority ] = txPrerequisites[ 'low' ]
          if ( priority === 'high' )
            txPrerequisites[ priority ] = txPrerequisites[ 'medium' ]
        } else {
          txPrerequisites[ priority ] = {
            inputs,
            outputs,
            fee,
            estimatedBlocks: averageTxFees[ priority ].estimatedBlocks,
          }
        }
      }
    }

    // console.log({ txPrerequisites });
    return {
      txPrerequisites 
    }
  };

  public createHDTransaction = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: any,
    derivativeAccountDetails?: { type: string; number: number },
    nSequence?: number,
  ): Promise<{
    txb: bitcoinJS.TransactionBuilder;
  }> => {
    try {
      let inputs, outputs
      if ( txnPriority === 'custom' && customTxPrerequisites ) {
        inputs = customTxPrerequisites.inputs
        outputs = customTxPrerequisites.outputs
      } else {
        inputs = txPrerequisites[ txnPriority ].inputs
        outputs = txPrerequisites[ txnPriority ].outputs
      }
      // console.log({ inputs, outputs });
      const txb: bitcoinJS.TransactionBuilder = new bitcoinJS.TransactionBuilder(
        this.network,
      )

      for ( const input of inputs ) {
        txb.addInput( input.txId, input.vout, nSequence )
      }

      const sortedOuts = await this.sortOutputs(
        outputs,
        derivativeAccountDetails,
      )

      for ( const output of sortedOuts ) {
        txb.addOutput( output.address, output.value )
      }

      return {
        txb,
      }
    } catch ( err ) {
      throw new Error( `Transaction creation failed: ${err.message}` )
    }
  };

  public signHDTransaction = (
    inputs: any,
    txb: bitcoinJS.TransactionBuilder,
    witnessScript?: any,
  ): bitcoinJS.TransactionBuilder => {
    try {
      // console.log('------ Transaction Signing ----------');
      let vin = 0
      for ( const input of inputs ) {
        const keyPair = this.getKeyPair(
          this.addressToPrivateKey( input.address ),
        )

        txb.sign(
          vin,
          keyPair,
          this.getP2SH( keyPair ).redeem.output,
          null,
          input.value,
          witnessScript,
        )
        vin++
      }

      return txb
    } catch ( err ) {
      throw new Error( `Transaction signing failed: ${err.message}` )
    }
  };

  private sortOutputs = async (
    outputs: Array<{
      address: string;
      value: number;
    }>,
    derivativeAccountDetails?: { type: string; number: number },
  ): Promise<
    Array<{
      address: string;
      value: number;
    }>
  > => {
    for ( const output of outputs ) {
      if ( !output.address ) {
        let changeAddress
        if ( derivativeAccountDetails ) {
          const { xpub, nextFreeChangeAddressIndex } = this.derivativeAccounts[
            derivativeAccountDetails.type
          ][ derivativeAccountDetails.number ]

          changeAddress = this.getAddress(
            true,
            nextFreeChangeAddressIndex,
            xpub,
          )
        } else {
          changeAddress = this.getAddress(
            true,
            this.nextFreeChangeAddressIndex,
          )
        }
        output.address = changeAddress
        // console.log(`adding the change address: ${output.address}`);
      }
    }

    outputs.sort( ( out1, out2 ) => {
      if ( out1.address < out2.address ) {
        return -1
      }
      if ( out1.address > out2.address ) {
        return 1
      }
      return 0
    } )

    return outputs
  };

  private getPrivateKey = (
    change: boolean,
    index: number,
    derivativeXpriv?: string,
  ) => {
    const node = bip32.fromBase58(
      derivativeXpriv ? derivativeXpriv : this.getXpriv(),
      this.network,
    )
    return node
      .derive( change ? 1 : 0 )
      .derive( index )
      .toWIF()
  };

  private getAddress = (
    internal: boolean,
    index: number,
    derivativeXpub?: string,
  ): string => {
    const node = bip32.fromBase58(
      derivativeXpub ? derivativeXpub : this.getXpub(),
      this.network,
    )
    return this.deriveAddress(
      node.derive( internal ? 1 : 0 ).derive( index ),
      this.purpose,
    )
  };

  private addressToPrivateKey = ( address: string ): string => {
    for (
      let itr = 0;
      itr <= this.nextFreeChangeAddressIndex + this.gapLimit;
      itr++
    ) {
      if ( this.getAddress( true, itr ) === address ) {
        return this.getPrivateKey( true, itr )
      }
    }

    for ( let itr = 0; itr <= this.nextFreeAddressIndex + this.gapLimit; itr++ ) {
      if ( this.getAddress( false, itr ) === address ) {
        return this.getPrivateKey( false, itr )
      }
    }

    if ( !this.isTest ) {
      // address to WIF for derivative accounts
      for ( const dAccountType of Object.keys( config.DERIVATIVE_ACC ) ) {
        const derivativeAccount = this.derivativeAccounts[ dAccountType ]
        if ( derivativeAccount.instance.using ) {
          for (
            let accountNumber = 1;
            accountNumber <= derivativeAccount.instance.using;
            accountNumber++
          ) {
            const derivativeInstance = derivativeAccount[ accountNumber ]

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
                  this.getAddress( false, itr, derivativeInstance.xpub ) ===
                  address
                ) {
                  return this.getPrivateKey(
                    false,
                    itr,
                    derivativeInstance.xpriv,
                  )
                }
              }

              for (
                let itr = 0;
                itr <=
                derivativeInstance.nextFreeChangeAddressIndex +
                  this.derivativeGapLimit; // would always be greater than
                itr++
              ) {
                if (
                  this.getAddress( true, itr, derivativeInstance.xpub ) ===
                  address
                ) {
                  return this.getPrivateKey(
                    true,
                    itr,
                    derivativeInstance.xpriv,
                  )
                }
              }
            }
          }
        }
      }
    }

    throw new Error( 'Could not find private key for: ' + address )
  };

  private getXpub = () => {
    if ( this.xpub ) {
      return this.xpub
    }
    const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
    const root = bip32.fromSeed( seed, this.network )
    const child = root.derivePath( this.derivationPath ).neutered()
    this.xpub = child.toBase58()

    return this.xpub
  };

  private getXpriv = () => {
    if ( this.xpriv ) {
      return this.xpriv
    }
    const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
    const root = bip32.fromSeed( seed, this.network )
    const child = root.derivePath( this.derivationPath )
    this.xpriv = child.toBase58()

    return this.xpriv
  };

  private generateTrustedDerivativeXpub = (
    accountType: string,
    accountNumber = 1,
    contactName: string,
  ) => {
    const xpub = this.generateDerivativeXpub( accountType, accountNumber )
    this.derivativeAccounts[ accountType ][
      accountNumber
    ].contactName = contactName
    this.trustedContactToDA[ contactName ] = accountNumber

    return xpub
  };

  private generateDerivativeXpub = (
    accountType: string,
    accountNumber = 1,
    accountName?: string,
  ) => {
    if ( !this.derivativeAccounts[ accountType ] )
      throw new Error( 'Unsupported dervative account' )
    if ( accountNumber > this.derivativeAccounts[ accountType ].instance.max )
      throw Error(
        `Cannot create more than ${this.derivativeAccounts[ accountType ].instance.max} ${accountType} derivative accounts`,
      )
    if ( this.derivativeAccounts[ accountType ][ accountNumber ] ) {
      return this.derivativeAccounts[ accountType ][ accountNumber ][ 'xpub' ]
    } else {
      const seed = bip39.mnemonicToSeedSync( this.mnemonic, this.passphrase )
      const root = bip32.fromSeed( seed, this.network )
      const path = `m/${this.purpose}'/${
        this.network === bitcoinJS.networks.bitcoin ? 0 : 1
      }'/${this.derivativeAccounts[ accountType ][ 'series' ] + accountNumber}'`
      const xpriv = root.derivePath( path ).toBase58()
      const xpub = root.derivePath( path ).neutered().toBase58()
      this.derivativeAccounts[ accountType ][ accountNumber ] = {
        xpriv,
        xpub,
        xpubId: crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' ),
        nextFreeAddressIndex: 0,
        nextFreeChangeAddressIndex: 0,
        accountName,
      }
      this.derivativeAccounts[ accountType ].instance.using++

      this.derivativeAccounts[ accountType ][
        accountNumber
      ].receivingAddress = this.getAddress( false, 0, xpub )

      return xpub
    }
  };
}
