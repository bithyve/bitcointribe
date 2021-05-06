
import { put } from "redux-saga/effects";
import { createWatcher } from '../utils/utilities'
import { select } from 'redux-saga/effects'
import {
  GET_METADATA,
  getSplitedMetaData
} from '../actions/restore'

export const getMetaShareWatcher = createWatcher(
  getDownloadDataSaga,
  GET_METADATA
)

export function* getDownloadDataSaga({ payload }) {
  try {
    const { requester } = payload
    const { DECENTRALIZED_BACKUP } = yield select(
      (state) => state.storage.database
    )
    const { UNDER_CUSTODY } = DECENTRALIZED_BACKUP; 
    // get data for perticular requester
    const metaString = JSON.stringify(UNDER_CUSTODY[requester].META_SHARE)

    // split logic, can be improved or changed
    let splits = Math.floor((metaString.length / 300) / 2)
    const slice = Math.trunc(metaString.length / splits)
    const qrData = []
    let start = 0
    let end = slice

    for (let itr = 0; itr < splits; itr++) {
      if (itr !== splits - 1) {
        qrData[itr] = { share: metaString.slice(start, end), index: itr, totalCode: splits, AnimatedQR: true }
      } else {
        qrData[itr] = { share: metaString.slice(start), index: itr, totalCode: splits, AnimatedQR: true }
      }
      start = end
      end = end + slice
    }
    // calling an action to update reducer
    yield put(getSplitedMetaData(qrData))

  } catch (e) {
    // need to handle error condition
    // console.log('in catch>>>>>>> ', e);
    //  yield put({type: "FAILED", message: e.message});
  }
}