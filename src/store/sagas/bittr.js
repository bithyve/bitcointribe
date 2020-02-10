import { all, take, takeLatest, put, call } from 'redux-saga/effects'
import * as types from '../actions/bittr'

import {
  createUserSuccess,
  createUserFail,
  sendEmailSuccess,
  sendEmailFail,
  sendSmsSuccess,
  sendSmsFail,
  verifyEmailSuccess,
  verifyEmailFail,
  verifyXpubSuccess,
  verifyXpubFail
} from '../actions/bittr'
import {
  createService,
  sendEmailService,
  smsService,
  verifyEmailService,
  xpubService
} from '../../services/bittr'

export function* createUserSaga({ params }) {
  // yield take(types.CREATE_USER_REQUEST);
  const result = yield call(createService, params)
  if (!result || !result.data) {
    yield put(createUserFail())
  } else {
    yield put(createUserSuccess(result.data))
  }
}

export function* sendEmailSaga({ params }) {
  // yield take(types.SEND_EMAIL_REQUEST);
  const result = yield call(sendEmailService, params)
  console.log('Email result', result)
  if (!result) {
    yield put(sendEmailFail())
  } else {
    yield put(sendEmailSuccess(result.data))
  }
}

export function* sendSmsSaga({ params }) {
  // yield take(types.SEND_SMS_REQUEST);
  const result = yield call(smsService, params)
  console.log('SMS result', result)
  if (!result) {
    yield put(sendSmsFail())
  } else {
    yield put(sendSmsSuccess(result.data))
  }
}

export function* verifyEmailSaga({ params }) {
  // yield take(types.VERIFY_EMAIL_REQUEST);
  const result = yield call(verifyEmailService, params)
  console.log('Email token result', result)
  if (!result) {
    yield put(verifyEmailFail())
  } else {
    yield put(verifyEmailSuccess(result.data))
  }
}

export function* verifyXpubSaga({ params }) {
  // yield take(types.VERIFY_XPUB_REQUEST);
  const result = yield call(xpubService, params)
  console.log('XPUB RESULT', result)
  if (!result) {
    yield put(verifyXpubFail())
  } else {
    yield put(verifyXpubSuccess(result.data))
  }
}

export default function* rootSaga() {
  yield all([
    takeLatest(types.CREATE_USER_REQUEST, createUserSaga),
    takeLatest(types.SEND_EMAIL_REQUEST, sendEmailSaga),
    takeLatest(types.VERIFY_EMAIL_REQUEST, verifyEmailSaga),
    takeLatest(types.SEND_SMS_REQUEST, sendSmsSaga),
    takeLatest(types.VERIFY_XPUB_REQUEST, verifyXpubSaga)
  ])
}
