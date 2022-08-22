import { call, put, select } from 'redux-saga/effects'
import {
  SAT_CARD_ACCOUNT,
} from '../actions/satCardAccount'
import { createWatcher } from '../utils/utilities'

import { updateAccountShells } from '../actions/accounts'
import { AccountsState } from '../reducers/accounts'
import dbManager from '../../storage/realm/dbManager'
import { updateWalletImageHealth } from '../actions/BHR'
import AccountOperations from '../../bitcoin/utilities/accounts/AccountOperations'
import AccountShell from '../../common/data/models/AccountShell'
import { Account, Accounts, AccountType, ActiveAddressAssigneeType } from '../../bitcoin/utilities/Interface'


function* satCardAccountWorker( { payload }: { payload: { accountId: string, privKey: string, address: string, selectedAccount: AccountShell } } ) {
  const accountsState: AccountsState = yield select( state => state.accounts )
  const accounts: Accounts = accountsState.accounts
  console.log( 'associateAccount accountsState' +  JSON.stringify( accountsState ) )

  let associateAccount: Account

  if( payload.accountId ){
    associateAccount = accounts[ payload.accountId ]
  } else {
    for( const accountId in accounts ){
      const account = accounts[ accountId ]
      if( account.type === AccountType.CHECKING_ACCOUNT && account.instanceNum === 0 ){
        associateAccount = account
        break
      }
    }
  }
  AccountOperations.importAddress( associateAccount, payload.privKey, payload.address, {
    type: ActiveAddressAssigneeType.GIFT,
    senderInfo: {
      name: 'Satscard'
    }
  } )

  yield put( updateAccountShells( {
    accounts: {
      [ associateAccount.id ]: associateAccount
    }
  } ) )
  yield call( dbManager.updateAccount, associateAccount.id, associateAccount )
  yield put( updateWalletImageHealth( {
    updateAccounts: true,
    accountIds:[ payload.selectedAccount.id ],
  } ) )

}

export const satCardAcountWatcher = createWatcher(
  satCardAccountWorker,
  SAT_CARD_ACCOUNT,
)
