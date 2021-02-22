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
} from '../../bitcoin/utilities/Interface'
import {
  DONATION_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
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
    let derivativeAccounts
    switch ( sourceKind ) {
        case SourceAccountKind.REGULAR_ACCOUNT:
          derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
          break

        case SourceAccountKind.SECURE_ACCOUNT:
          derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
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
        const { donee, subject, description } = derivativeAccount[
          accountNumber
        ]
        const accShell = new AccountShell( {
          primarySubAccount: new DonationSubAccountInfo( {
            id: derivativeId,
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
      instanceNumber: 0, // default instances(0)
    } ),
    unit: BitcoinUnit.TSATS,
    displayOrder: 1,
  } )
  const defaultCheckingShell = new AccountShell( {
    primarySubAccount: new CheckingSubAccountInfo( {
      id: regularAcc.getAccountId(),
      instanceNumber: 0,
    } ),
    unit: BitcoinUnit.SATS,
    displayOrder: 2,
  } )
  const defaultSavingsShell = new AccountShell( {
    primarySubAccount: new SavingsSubAccountInfo( {
      id: secureAcc.getAccountId(),
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
    let accountName = ''
    let accountDescription = ''
    let balances: Balances = {
      confirmed: 0,
      unconfirmed: 0,
    }
    let transactions: TransactionDescribing[] = []

    switch ( shell.primarySubAccount.kind ) {
        case SubAccountKind.TEST_ACCOUNT:
          accountName = testAcc.hdWallet.accountName
          accountDescription = testAcc.hdWallet.accountDescription
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
          let derivativeAccounts
          switch ( sourceKind ) {
              case SourceAccountKind.REGULAR_ACCOUNT:
                derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
                break

              case SourceAccountKind.SECURE_ACCOUNT:
                derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
                break
          }
          const donationAccounts: DonationDerivativeAccount =
          derivativeAccounts[ DerivativeAccountTypes.DONATION_ACCOUNT ]
          const donationInstance = donationAccounts[ instanceNumber ]

          if ( donationInstance && donationInstance.balances ) {
            accountName = donationInstance.subject
            accountDescription = donationInstance.description
            balances = {
              confirmed: donationInstance.balances.balance,
              unconfirmed: donationInstance.balances.unconfirmedBalance,
            }
            transactions = donationInstance.transactions.transactionDetails
          }
          break

        case SubAccountKind.SERVICE:
          switch ( ( shell.primarySubAccount as ExternalServiceSubAccountDescribing ).serviceAccountKind ) {
              case ServiceAccountKind.WYRE:
                const { sourceKind, instanceNumber } = shell.primarySubAccount
                let derivativeAccounts
                switch ( sourceKind ) {
                    case SourceAccountKind.REGULAR_ACCOUNT:
                      derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
                      break

                    case SourceAccountKind.SECURE_ACCOUNT:
                      derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
                      break
                }
                const wyreAccounts: WyreDerivativeAccount =
              derivativeAccounts[ DerivativeAccountTypes.WYRE ]
                const wyreInstance: WyreDerivativeAccountElements = wyreAccounts[ instanceNumber ]

                if ( wyreInstance && wyreInstance.balances ) {
                  accountName = wyreInstance.accountName
                  accountDescription = wyreInstance.accountDescription
                  balances = {
                    confirmed: wyreInstance.balances.balance,
                    unconfirmed: wyreInstance.balances.unconfirmedBalance,
                  }
                  transactions = wyreInstance.transactions.transactionDetails
                }
                break
              case ServiceAccountKind.RAMP:
                //const { sourceKind, instanceNumber } = shell.primarySubAccount
                const rampSourceKind = shell.primarySubAccount.sourceKind
                const rampInstanceNumber = shell.primarySubAccount.instanceNumber

                let rampDerivativeAccounts
                switch ( rampSourceKind ) {
                    case SourceAccountKind.REGULAR_ACCOUNT:
                      rampDerivativeAccounts = regularAcc.hdWallet.derivativeAccounts
                      break

                    case SourceAccountKind.SECURE_ACCOUNT:
                      rampDerivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
                      break
                }
                const rampAccounts: RampDerivativeAccount =
                rampDerivativeAccounts[ DerivativeAccountTypes.RAMP ]
                const rampInstance: RampDerivativeAccountElements = rampAccounts[ rampInstanceNumber ]

                if ( rampInstance && rampInstance.balances ) {
                  accountName = rampInstance.accountName
                  accountDescription = rampInstance.accountDescription
                  balances = {
                    confirmed: rampInstance.balances.balance,
                    unconfirmed: rampInstance.balances.unconfirmedBalance,
                  }
                  transactions = rampInstance.transactions.transactionDetails
                }
                break
          }
          break
    }

    AccountShell.updatePrimarySubAccountDetails(
      shell,
      accountName,
      accountDescription,
      balances,
      transactions,
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
    let derivativeAccounts
    switch ( shell.primarySubAccount.kind ) {
        case SubAccountKind.REGULAR_ACCOUNT:
          if ( !shell.primarySubAccount.instanceNumber )
          // to default checking account
            derivativeAccounts = regularAcc.hdWallet.derivativeAccounts
          break

        case SubAccountKind.SECURE_ACCOUNT:
          if ( !shell.primarySubAccount.instanceNumber )
          // to default savings account
            derivativeAccounts = secureAcc.secureHDWallet.derivativeAccounts
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

          if ( shell.secondarySubAccounts[ derivativeId ] ) {
            AccountShell.updateSecondarySubAccountBalanceTx(
              shell,
              derivativeId,
              dervBalances,
              dervTransactions,
            )
          } else {
            let secondarySubAccount: SubAccountDescribing
            switch ( dAccountType ) {
                case DerivativeAccountTypes.TRUSTED_CONTACTS:
                  secondarySubAccount = new TrustedContactsSubAccountInfo( {
                    id: derivativeId,
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
