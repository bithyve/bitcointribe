import { put, select, call } from 'redux-saga/effects'
import { Wallet } from '../../bitcoin/utilities/Interface'
import dbManager from '../../storage/realm/dbManager'
import { updateWalletImageHealth } from '../actions/BHR'
import { updateWallet, UPDATE_USER_NAME } from '../actions/storage'
import { createWatcher } from '../utils/utilities'

function* updateUserNameWorker( { payload }: { payload: { userName: string }} ) {
  const { userName } = payload
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  wallet.userName = userName
  yield put( updateWallet( wallet ) )
  yield call( dbManager.updateWallet, {
    userName
  } )
  yield put( updateWalletImageHealth( {
  } ) )
}

export const updateUserNameWatcher = createWatcher(
  updateUserNameWorker,
  UPDATE_USER_NAME,
)
