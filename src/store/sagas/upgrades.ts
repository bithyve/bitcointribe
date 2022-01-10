import { AccountType } from '../../bitcoin/utilities/Interface'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import AccountShell from '../../common/data/models/AccountShell'
import { updateAccountSettings } from '../actions/accounts'
import { put, select } from 'redux-saga/effects'

export function* testAccountEnabler( ) {
  const accountShells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells
  )

  let testAccountShell: AccountShell
  accountShells.forEach( shell => {
    if( shell.primarySubAccount.type === AccountType.TEST_ACCOUNT ) testAccountShell = shell
  } )

  if( testAccountShell.primarySubAccount.visibility === AccountVisibility.HIDDEN ){
    const settings = {
      visibility: AccountVisibility.DEFAULT
    }
    yield put( updateAccountSettings( {
      accountShell: testAccountShell, settings
    } ) )
  }
}

export function* accountVisibilityResetter( ) {
  const accountShells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells
  )

  for( const shell of accountShells ){
    if( shell.primarySubAccount.visibility !== AccountVisibility.DEFAULT ){
      const settings = {
        visibility: AccountVisibility.DEFAULT
      }
      yield put( updateAccountSettings( {
        accountShell: shell, settings
      } ) )
    }
  }
}

