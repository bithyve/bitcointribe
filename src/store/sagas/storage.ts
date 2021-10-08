import { put, select } from 'redux-saga/effects'
import { Wallet } from '../../bitcoin/utilities/Interface'
import { updateWallet, UPDATE_USER_NAME } from '../actions/storage'
import { createWatcher } from '../utils/utilities'

function* updateUserNameWorker( { payload }: { payload: { userName: string }} ) {
  const { userName } = payload
  const wallet: Wallet = yield select( ( state ) => state.storage.wallet )
  wallet.userName = userName
  yield put( updateWallet( wallet ) )
}

export const updateUserNameWatcher = createWatcher(
  updateUserNameWorker,
  UPDATE_USER_NAME,
)
