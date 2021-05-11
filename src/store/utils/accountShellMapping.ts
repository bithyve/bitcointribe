import idx from 'idx'
import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import {
  Balances,
  DerivativeAccount,
  DerivativeAccountTypes,
  DonationDerivativeAccount,
  SubPrimaryDerivativeAccount,
  SubPrimaryDerivativeAccountElements,
  WyreDerivativeAccount,
  WyreDerivativeAccountElements,
  RampDerivativeAccount,
  RampDerivativeAccountElements,
  SwanDerivativeAccount,
  SwanDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface'
import {
  DONATION_ACCOUNT,
  RAMP,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
  SWAN,
  TEST_ACCOUNT,
  WYRE,
} from '../../common/constants/wallet-service-types'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import AccountShell from '../../common/data/models/AccountShell'
import CheckingSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import SavingsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import TestSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo'
import TrustedContactsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TrustedContactsSubAccountInfo'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import config from '../../bitcoin/HexaConfig'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import SubAccountDescribing, { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import DonationSubAccountInfo from '../../common/data/models/SubAccountInfo/DonationSubAccountInfo'
import { call } from 'react-native-reanimated'
import useNewAccountChoices from '../../utils/hooks/account-utils/UseNewAccountChoices'
import { AccountsState } from '../reducers/accounts'

const initAccountShells = ( services ) => {
  const testAcc: TestAccount = services[ TEST_ACCOUNT ]
  const regularAcc: RegularAccount = services[ REGULAR_ACCOUNT ]
  const secureAcc: SecureAccount = services[ SECURE_ACCOUNT ]

  const accountShells = []

  // adding ejected accounts to accountShells (aids upgrade from version < 1.4.0)
  for ( const sourceKind of [
    SourceAccountKind.REGULAR_ACCOUNT,
    SourceAccountKind.SECURE_ACCOUNT,
  ] ) {
    let derivativeAccounts, network
    switch ( sourceKind ) {
        case SourceAccountKind.REGULAR_ACCOUNT:
          derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
          network = regularAcc.hdWallet.network
          break

        case SourceAccountKind.SECURE_ACCOUNT:
          derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
          network = secureAcc.secureHDWallet.network
          break
    }

    const derivativeAccount: DonationDerivativeAccount =
      derivativeAccounts[ DONATION_ACCOUNT ]

    if ( derivativeAccount && derivativeAccount.instance.using ) {
      for (
        let accountNumber = 1;
        accountNumber <= derivativeAccount.instance.using;
        accountNumber++
      ) {
        let dervBalances: Balances = {
          confirmed: 0,
          unconfirmed: 0,
        }
        let dervTransactions: TransactionDescribing[] = []

        if ( derivativeAccount[ accountNumber ].balances )
          dervBalances = {
            confirmed: derivativeAccount[ accountNumber ].balances.balance,
            unconfirmed:
              derivativeAccount[ accountNumber ].balances.unconfirmedBalance,
          }

        if ( derivativeAccount[ accountNumber ].transactions )
          dervTransactions =
            derivativeAccount[ accountNumber ].transactions.transactionDetails

        const derivativeId = derivativeAccount[ accountNumber ].xpubId
        const { donee, subject, description, xpub } = derivativeAccount[
          accountNumber
        ]
        const accShell = new AccountShell( {
          primarySubAccount: new DonationSubAccountInfo( {
            id: derivativeId,
            xPub: Bitcoin.generateYpub( xpub, network ),
            instanceNumber: accountNumber,
            balances: dervBalances,
            transactions: dervTransactions,
            doneeName: donee,
            customDisplayName: subject,
            customDescription: description,
            isTFAEnabled:
              sourceKind === SourceAccountKind.REGULAR_ACCOUNT ? false : true,
            causeName: '',
          } ),
          unit: BitcoinUnit.SATS,
          displayOrder: 3,
        } )
        accountShells.push( accShell )
      }
    }
  }

  // adding default account shells
  const defaultTestShell = new AccountShell( {
    primarySubAccount: new TestSubAccountInfo( {
      id: testAcc.getAccountId(),
      xPub: Bitcoin.generateYpub( testAcc.hdWallet.getXpub(), testAcc.hdWallet.network ),
      instanceNumber: 0, // default instances(0)
    } ),
    unit: BitcoinUnit.TSATS,
    displayOrder: 1,
  } )
  const defaultCheckingShell = new AccountShell( {
    primarySubAccount: new CheckingSubAccountInfo( {
      id: regularAcc.getAccountId(),
      xPub: Bitcoin.generateYpub( regularAcc.hdWallet.getXpub(), regularAcc.hdWallet.network ),
      instanceNumber: 0,
    } ),
    unit: BitcoinUnit.SATS,
    displayOrder: 2,
  } )
  const defaultSavingsShell = new AccountShell( {
    primarySubAccount: new SavingsSubAccountInfo( {
      id: secureAcc.getAccountId(),
      xPub: Bitcoin.generateYpub( idx( secureAcc, ( _ ) => _.secureHDWallet.xpubs.secondary ), secureAcc.secureHDWallet.network ),
      instanceNumber: 0,
    } ),
    unit: BitcoinUnit.SATS,
    displayOrder: 3,
  } )
  accountShells.push(
    defaultTestShell,
    defaultCheckingShell,
    defaultSavingsShell,
  )

  return accountShells
}

const updatePrimarySubAccounts = (
  services,
  accountShells: AccountShell[],
): AccountShell[] => {
  const testAcc: TestAccount = services[ TEST_ACCOUNT ]
  const regularAcc: RegularAccount = services[ REGULAR_ACCOUNT ]
  const secureAcc: SecureAccount = services[ SECURE_ACCOUNT ]

  const updatedAccountShells = accountShells.map( ( shell: AccountShell ) => {
    let balances: Balances = {
      confirmed: 0,
      unconfirmed: 0,
    }
    let transactions: TransactionDescribing[] = []
    let accountName = ''
    let accountDescription = ''
    let accountXpub = ''

    switch ( shell.primarySubAccount.kind ) {
        case SubAccountKind.TEST_ACCOUNT:
          accountName = testAcc.hdWallet.accountName
          accountDescription = testAcc.hdWallet.accountDescription
          accountXpub = Bitcoin.generateYpub( testAcc.hdWallet.getXpub(), testAcc.hdWallet.network )
          transactions = testAcc.hdWallet.transactions.transactionDetails
          balances = {
            confirmed: transactions.length
              ? testAcc.hdWallet.balances.balance
              : 10000, // hardcoding initial test balance while testnet faucet dispatches corresponding sats
            unconfirmed: testAcc.hdWallet.balances.unconfirmedBalance,
          }
          break

        case SubAccountKind.REGULAR_ACCOUNT:
          if ( !shell.primarySubAccount.instanceNumber ) {
            accountName = regularAcc.hdWallet.accountName
            accountDescription = regularAcc.hdWallet.accountDescription
            accountXpub = Bitcoin.generateYpub( regularAcc.hdWallet.getXpub(), regularAcc.hdWallet.network )
            balances = {
              confirmed: regularAcc.hdWallet.balances.balance,
              unconfirmed: regularAcc.hdWallet.balances.unconfirmedBalance,
            }
            transactions = regularAcc.hdWallet.transactions.transactionDetails
          } else {
            const subPrimaryAccounts =
            regularAcc.hdWallet.derivativeAccounts[
              DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT
            ]

            const subPrimInstance: SubPrimaryDerivativeAccountElements =
            subPrimaryAccounts[ shell.primarySubAccount.instanceNumber ]

            if ( subPrimInstance && subPrimInstance.balances ) {
              accountName = subPrimInstance.accountName
              accountDescription = subPrimInstance.accountDescription
              accountXpub = Bitcoin.generateYpub( subPrimInstance.xpub, regularAcc.hdWallet.network )
              balances = {
                confirmed: subPrimInstance.balances.balance,
                unconfirmed: subPrimInstance.balances.unconfirmedBalance,
              }
              transactions = subPrimInstance.transactions.transactionDetails
            }
          }

          break

        case SubAccountKind.SECURE_ACCOUNT:
          if ( !shell.primarySubAccount.instanceNumber ) {
            accountName = secureAcc.secureHDWallet.accountName
            accountDescription = secureAcc.secureHDWallet.accountDescription
            accountXpub = Bitcoin.generateYpub( idx( secureAcc, ( _ ) => _.secureHDWallet.xpubs.secondary ), secureAcc.secureHDWallet.network )

            balances = {
              confirmed: secureAcc.secureHDWallet.balances.balance,
              unconfirmed: secureAcc.secureHDWallet.balances.unconfirmedBalance,
            }
            transactions =
            secureAcc.secureHDWallet.transactions.transactionDetails
          } else {
            const subPrimaryAccounts: SubPrimaryDerivativeAccount =
            secureAcc.secureHDWallet.derivativeAccounts[
              DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT
            ]

            const subPrimInstance: SubPrimaryDerivativeAccountElements =
            subPrimaryAccounts[ shell.primarySubAccount.instanceNumber ]

            if ( subPrimInstance && subPrimInstance.balances ) {
              accountName = subPrimInstance.accountName
              accountDescription = subPrimInstance.accountDescription
              accountXpub = Bitcoin.generateYpub( subPrimInstance.xpub, secureAcc.secureHDWallet.network )
              balances = {
                confirmed: subPrimInstance.balances.balance,
                unconfirmed: subPrimInstance.balances.unconfirmedBalance,
              }
              transactions = subPrimInstance.transactions.transactionDetails
            }
          }

          break

        case SubAccountKind.DONATION_ACCOUNT:
          const { sourceKind, instanceNumber } = shell.primarySubAccount
          let derivativeAccounts, network
          switch ( sourceKind ) {
              case SourceAccountKind.REGULAR_ACCOUNT:
                derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
                network = regularAcc.hdWallet.network
                break

              case SourceAccountKind.SECURE_ACCOUNT:
                derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
                network = secureAcc.secureHDWallet.network
                break
          }
          const donationAccounts: DonationDerivativeAccount =
          derivativeAccounts[ DerivativeAccountTypes.DONATION_ACCOUNT ]
          const donationInstance = donationAccounts[ instanceNumber ]

          if ( donationInstance && donationInstance.balances ) {
            accountName = donationInstance.subject
            accountDescription = donationInstance.description
            accountXpub = Bitcoin.generateYpub( donationInstance.xpub, network )

            balances = {
              confirmed: donationInstance.balances.balance,
              unconfirmed: donationInstance.balances.unconfirmedBalance,
            }
            transactions = donationInstance.transactions.transactionDetails
          }
          break

        case SubAccountKind.SERVICE:
          const serviceAccountKind = ( shell.primarySubAccount as ExternalServiceSubAccountDescribing ).serviceAccountKind
          switch ( serviceAccountKind ) {
              case ServiceAccountKind.WYRE:
              case ServiceAccountKind.RAMP:
              case ServiceAccountKind.SWAN:
                const { sourceKind, instanceNumber } = shell.primarySubAccount
                let derivativeAccounts, network

                switch ( sourceKind ) {
                    case SourceAccountKind.REGULAR_ACCOUNT:
                      derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
                      network = regularAcc.hdWallet.network
                      break

                    case SourceAccountKind.SECURE_ACCOUNT:
                      derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
                      network = secureAcc.secureHDWallet.network
                      break
                }
                const dervAccounts: WyreDerivativeAccount | RampDerivativeAccount | SwanDerivativeAccount = derivativeAccounts[ serviceAccountKind ]
                const dervInstance: WyreDerivativeAccountElements | RampDerivativeAccountElements | SwanDerivativeAccountElements = dervAccounts[ instanceNumber ]

                if ( dervInstance && dervInstance.balances ) {
                  accountName = dervInstance.accountName
                  accountDescription = dervInstance.accountDescription
                  accountXpub = Bitcoin.generateYpub( dervInstance.xpub, network )
                  balances = {
                    confirmed: dervInstance.balances.balance,
                    unconfirmed: dervInstance.balances.unconfirmedBalance,
                  }
                  transactions = dervInstance.transactions.transactionDetails
                }
                break
          }
          break
    }

    const accountDetails: {
      accountName?: string,
      accountDescription?: string,
      accountXpub?: string,
     }  = {
       accountName,
       accountDescription,
       accountXpub
     }
    AccountShell.updatePrimarySubAccountDetails(
      shell,
      balances,
      transactions,
      accountDetails
    )

    return shell
  } )

  // TODO: remap primary sub-account shells from backend (ejected derv accounts), aids accountShell recovery during blind-refresh @Adv-Sharing

  return updatedAccountShells
}

const updateSecondarySubAccounts = (
  services,
  accountShells: AccountShell[],
): AccountShell[] => {
  const regularAcc: RegularAccount = services[ REGULAR_ACCOUNT ]
  const secureAcc: SecureAccount = services[ SECURE_ACCOUNT ]

  const updatedAccountShells = accountShells.map( ( shell: AccountShell ) => {
    let derivativeAccounts, network
    switch ( shell.primarySubAccount.kind ) {
        case SubAccountKind.REGULAR_ACCOUNT:
          if ( !shell.primarySubAccount.instanceNumber )
          // to default checking account
            derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
          network = regularAcc.hdWallet.network
          break

        case SubAccountKind.SECURE_ACCOUNT:
          if ( !shell.primarySubAccount.instanceNumber )
          // to default savings account
            derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
          network = secureAcc.secureHDWallet.network
          break
    }

    if ( !derivativeAccounts ) return shell

    for ( const dAccountType of config.DERIVATIVE_ACC_TO_SYNC ) {
      const derivativeAccount: DerivativeAccount =
        derivativeAccounts[ dAccountType ]

      if ( derivativeAccount && derivativeAccount.instance.using ) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          let dervBalances: Balances = {
            confirmed: 0,
            unconfirmed: 0,
          }
          let dervTransactions: TransactionDescribing[] = []

          if ( derivativeAccount[ accountNumber ].balances )
            dervBalances = {
              confirmed: derivativeAccount[ accountNumber ].balances.balance,
              unconfirmed:
                derivativeAccount[ accountNumber ].balances.unconfirmedBalance,
            }

          if ( derivativeAccount[ accountNumber ].transactions )
            dervTransactions =
              derivativeAccount[ accountNumber ].transactions.transactionDetails

          const derivativeId = derivativeAccount[ accountNumber ].xpubId
          const xpub = derivativeAccount[ accountNumber ].xpub
          const ypub = Bitcoin.generateYpub( xpub, network )
          const accountDetails: {
            accountXpub?: string,
          } = {
            accountXpub: ypub
          }

          if ( shell.secondarySubAccounts[ derivativeId ] ) {
            AccountShell.updateSecondarySubAccountBalanceTx(
              shell,
              derivativeId,
              dervBalances,
              dervTransactions,
              accountDetails
            )
          } else {
            let secondarySubAccount: SubAccountDescribing
            switch ( dAccountType ) {
                case DerivativeAccountTypes.TRUSTED_CONTACTS:
                  secondarySubAccount = new TrustedContactsSubAccountInfo( {
                    id: derivativeId,
                    xPub: ypub,
                    instanceNumber: accountNumber,
                    accountShellID: shell.id,
                    balances: dervBalances,
                    transactions: dervTransactions,
                    isTFAEnabled: shell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT? true: false,
                  } )
                  break

                case DerivativeAccountTypes.FAST_BITCOINS:
                  secondarySubAccount = new ExternalServiceSubAccountInfo( {
                    id: derivativeId,
                    xPub: ypub,
                    instanceNumber: accountNumber,
                    accountShellID: shell.id,
                    serviceAccountKind: ServiceAccountKind.FAST_BITCOINS,
                    isTFAEnabled: shell.primarySubAccount.sourceKind === SourceAccountKind.SECURE_ACCOUNT ? true : false,
                    balances: dervBalances,
                    transactions: dervTransactions,
                  } )
                  break
            }

            AccountShell.addSecondarySubAccount(
              shell,
              derivativeId,
              secondarySubAccount,
            )
          }
        }
      }
    }

    return shell
  } )

  return updatedAccountShells
}

export const updateAccountShells = (
  services,
  accountShells: AccountShell[],
): AccountShell[] => {
  // init out-of-the-box account shells
  if ( !accountShells || !accountShells.length ) {
    accountShells = initAccountShells( services )
  }

  // update primary sub-accounts
  let updatedAccountShells = updatePrimarySubAccounts( services, accountShells )

  // insert/update secondary sub-accounts
  updatedAccountShells = updateSecondarySubAccounts(
    services,
    updatedAccountShells,
  )

  return updatedAccountShells
}

export const recreatePrimarySubAccounts = (
  accountsState: AccountsState,
): AccountShell[] => {
  // helps restore front-end data model for ejected-derivative accounts(w/ txsFound) post blind-sync
  let derivativeAccounts, network
  const regularAcc: RegularAccount = accountsState[ REGULAR_ACCOUNT ].service
  const secureAcc: SecureAccount = accountsState[ SECURE_ACCOUNT ].service
  const accountShells: AccountShell[] = accountsState.accountShells

  const newAccountShells: AccountShell[] = []

  for ( const accountKind of [ SourceAccountKind.REGULAR_ACCOUNT, SourceAccountKind.SECURE_ACCOUNT ] ) {
    let isTFAEnabled = false
    switch ( accountKind ) {
        case SourceAccountKind.REGULAR_ACCOUNT:
          derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
          network = regularAcc.hdWallet.network
          break

        case SourceAccountKind.SECURE_ACCOUNT:
          derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
          network = secureAcc.secureHDWallet.network
          isTFAEnabled = true
          break
    }

    if ( !derivativeAccounts ) continue

    for ( const dAccountType of config.EJECTED_ACCOUNTS ) {
      const derivativeAccount: DerivativeAccount =
        derivativeAccounts[ dAccountType ]

      if ( derivativeAccount && derivativeAccount.instance.using ) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          const derivativeId = derivativeAccount[ accountNumber ].xpubId

          let exists = false // front-end data model(SubAccountDescribing) already exists?
          for( const shell of accountShells ){
            if( shell.primarySubAccount.id === derivativeId ) exists = true
          }
          if( exists ) continue
          else {
            // generate preliminary SubAccountDescribing (in sync w/ useNewAccountChoices())
            let subAccountInfo
            switch( dAccountType ){
                case SUB_PRIMARY_ACCOUNT:
                  switch( accountKind ){
                      case SourceAccountKind.REGULAR_ACCOUNT:
                        subAccountInfo = new CheckingSubAccountInfo( {
                          defaultTitle: `Checking Account ${accountNumber}`,
                          defaultDescription: 'User Checking Account',
                        } )
                        break

                      case SourceAccountKind.SECURE_ACCOUNT:
                        subAccountInfo = new SavingsSubAccountInfo( {
                          defaultTitle: `Savings Account ${accountNumber}`,
                          defaultDescription: 'User Savings Account',
                        } )
                        break
                  }
                  break

                case  DONATION_ACCOUNT:
                  subAccountInfo = new DonationSubAccountInfo( {
                    defaultTitle: `Donation Account ${accountNumber}`,
                    defaultDescription: 'Accept donations',
                    doneeName: '',
                    causeName: '',
                    isTFAEnabled,
                  } )
                  break

                case  WYRE:
                  subAccountInfo = new ExternalServiceSubAccountInfo( {
                    instanceNumber: accountNumber,
                    defaultTitle: 'Wyre Account',
                    defaultDescription: 'Buy with ApplePay or Debit card',
                    serviceAccountKind: ServiceAccountKind.WYRE,
                    isTFAEnabled
                  } )
                  break

                case  RAMP:
                  subAccountInfo = new ExternalServiceSubAccountInfo( {
                    instanceNumber: accountNumber,
                    defaultTitle: 'Ramp Account',
                    defaultDescription: 'Buy with Apple Pay, Bank or Card',
                    serviceAccountKind: ServiceAccountKind.RAMP,
                    isTFAEnabled
                  } )
                  break

                case SWAN:
                  subAccountInfo = new ExternalServiceSubAccountInfo( {
                    instanceNumber: accountNumber,
                    defaultTitle: 'Swan Bitcoin',
                    defaultDescription: 'Stack sats with Swan',
                    serviceAccountKind: ServiceAccountKind.SWAN,
                    isTFAEnabled
                  } )
                  break
            }

            if( !subAccountInfo ) continue

            subAccountInfo.id = derivativeId
            subAccountInfo.xPub = Bitcoin.generateYpub( derivativeAccount[ accountNumber ].xpub, network )
            subAccountInfo.instanceNumber = accountNumber


            const newAccountShell = new AccountShell( {
              unit: BitcoinUnit.SATS,
              primarySubAccount: subAccountInfo,
              displayOrder: 1,
            } )

            // saturate w/ balance and transactions
            let dervBalances: Balances = {
              confirmed: 0,
              unconfirmed: 0,
            }
            let dervTransactions: TransactionDescribing[] = []

            if ( derivativeAccount[ accountNumber ].balances )
              dervBalances = {
                confirmed: derivativeAccount[ accountNumber ].balances.balance,
                unconfirmed:
                  derivativeAccount[ accountNumber ].balances.unconfirmedBalance,
              }

            if ( derivativeAccount[ accountNumber ].transactions )
              dervTransactions =
                derivativeAccount[ accountNumber ].transactions.transactionDetails


            AccountShell.updatePrimarySubAccountDetails(
              newAccountShell,
              dervBalances,
              dervTransactions,
            )

            newAccountShells.push( newAccountShell )
          }
        }
      }
    }
  }

  return newAccountShells
}
