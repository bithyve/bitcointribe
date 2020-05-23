import { all, take, takeLatest, put, call } from 'redux-saga/effects'

import {
  createUserSuccess,
  createUserFail,
  sendEmailSuccess,
  sendEmailFail,
  CREATE_USER_REQUEST,
} from '../actions/bittr'
import {
  createService,
  sendEmailService,
} from '../../services/api'
import { createWatcher } from '../utils/utilities'

export function* createUserWorker({ payload }) {
  const result = yield call(createService, payload.data)
  if (result && result.data && result.data) {
    yield put(createUserSuccess(result.data))
  }
  else {
    yield put(createUserFail())
  }
}
export const createUserWatcher = createWatcher(createUserWorker, CREATE_USER_REQUEST);

function* sendEmailWorker({ payload }) {
  const result = yield call(sendEmailService, payload.data)
  console.log('Email result', result)
  if (!result) {
    yield put(sendEmailFail())
  } else {
    yield put(sendEmailSuccess(result.data))
  }
}
