import { call, put } from 'redux-saga/effects'
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
import { ActiveAddressAssigneeType } from '../../bitcoin/utilities/Interface'


function* satCardAccountWorker( { payload }: { payload: { accountState: AccountsState, privKey: string, address: string, selectedAccount: AccountShell } } ) {
  AccountOperations.importAddress( payload.accountState.accounts[ payload.selectedAccount.id ], payload.privKey, payload.address, {
    type: ActiveAddressAssigneeType.GIFT,
    // id: gift.id,
    senderInfo: {
      name: 'Satscard'
    }
  } )

  yield put( updateAccountShells( {
    accounts: {
      [ payload.accountState.accounts[ payload.selectedAccount.id ].id ]: payload.accountState.accounts[ payload.selectedAccount.id ]
    }
  } ) )
  yield call( dbManager.updateAccount, payload.accountState.accounts[ payload.selectedAccount.id ].id, payload.accountState.accounts[ payload.selectedAccount.id ] )
  yield put( updateWalletImageHealth( {
    updateAccounts: true,
    accountIds:[ payload.selectedAccount.id ],
    // updateGifts: true,
    // giftIds: [ gift.id ]
  } ) )

}

export const satCardAcountWatcher = createWatcher(
  satCardAccountWorker,
  SAT_CARD_ACCOUNT,
)
