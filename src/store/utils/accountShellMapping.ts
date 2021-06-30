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

export const generateAccountShells = ( accounts: Accounts ) => {
  const accountShells: AccountShell[] = []

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
      } )
    )
  } )
  return accountShells
}

const updatePrimarySubAccounts = (
  accounts: Accounts,
  accountShells: AccountShell[],
): AccountShell[] => {
  accountShells.forEach( ( shell )=>{
    const account = accounts[ shell.primarySubAccount.id ]
    if( !account ) return shell

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
  return accountShells
}

export const updateShells = (
  accounts: Accounts,
  accountShells: AccountShell[],
  newAccounts?: boolean
): AccountShell[] => {
  if ( newAccounts ) return accountShells.concat( generateAccountShells( accounts ) )
  else return updatePrimarySubAccounts( accounts, accountShells )  // update primary sub-accounts
}
