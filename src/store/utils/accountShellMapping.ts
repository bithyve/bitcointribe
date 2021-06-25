import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'
import {
  Accounts,
  AccountType,
  MultiSigAccount,
  Account,
} from '../../bitcoin/utilities/Interface'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import AccountShell from '../../common/data/models/AccountShell'
import CheckingSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import SavingsSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import TestSubAccountInfo from '../../common/data/models/SubAccountInfo/HexaSubAccounts/TestSubAccountInfo'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'

export const initAccountShells = ( accounts: Accounts ) => {
  // adding default account shells
  const accountShells: AccountShell[] = []
  let displayOrderIndex = 1

  Object.values( accounts ).forEach( ( account: Account | MultiSigAccount )=> {
    let SubAccountConstructor
    switch( account.type ){
        case AccountType.TEST_ACCOUNT:
          SubAccountConstructor = TestSubAccountInfo
          break

        case AccountType.CHECKING_ACCOUNT:
          SubAccountConstructor = CheckingSubAccountInfo
          break

        case AccountType.SAVINGS_ACCOUNT:
          SubAccountConstructor = SavingsSubAccountInfo
          break
    }

    accountShells.push(
      new AccountShell( {
        primarySubAccount: new SubAccountConstructor( {
          id: account.id,
          xPub: ( account as MultiSigAccount ).is2FA? null: Bitcoin.generateYpub( account.xpub, AccountUtilities.getNetworkByType( account.networkType ) ),
          instanceNumber: account.instanceNum,
          customDisplayName: account.accountName,
          customDescription: account.accountDescription
        } ),
        unit: AccountType.TEST_ACCOUNT? BitcoinUnit.TSATS: BitcoinUnit.SATS,
        displayOrder: displayOrderIndex,
      } )
    )

    displayOrderIndex++
  } )

  return accountShells
}

const updatePrimarySubAccounts = (
  accounts: Accounts,
  accountShells: AccountShell[],
): AccountShell[] =>  accountShells.map( ( shell )=>{
  console.log( {
    shell, accounts
  } )
  const account = accounts[ shell.primarySubAccount.id ]
  console.log( {
    account
  } )
  const accountDetails = {
    accountName: account.accountName,
    accountDescription: account.accountDescription,
    accountXpub: account.xpub
  }
  AccountShell.updatePrimarySubAccountDetails(
    shell,
    account.balances,
    account.transactions,
    accountDetails
  )
  return shell
} )

export const updateShells = (
  accounts: Accounts,
  accountShells: AccountShell[],
): AccountShell[] => {
  if ( !accountShells.length ) return initAccountShells( accounts ) // init out-of-the-box account shells
  else return updatePrimarySubAccounts( accounts, accountShells )  // update primary sub-accounts
}
