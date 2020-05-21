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
  verifyXpubFail,
  SEND_EMAIL_REQUEST,
  CREATE_USER_REQUEST,
  SEND_SMS_REQUEST,
  VERIFY_EMAIL_REQUEST,
  VERIFY_XPUB_REQUEST
} from '../actions/bittr'
import {
  createService,
  sendEmailService,
  smsService,
  verifyEmailService,
  xpubService
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
export const sendEmailWatcher = createWatcher(sendEmailWorker, SEND_EMAIL_REQUEST);


export function* sendSmsWorker({ payload }) {
  // yield take(types.SEND_SMS_REQUEST);
  const result = yield call(smsService, payload.data)
  console.log('SMS result', result)
  if (!result) {
    yield put(sendSmsFail())
  } else {
    yield put(sendSmsSuccess(result.data))
  }
}
export const sendSmsWatcher = createWatcher(sendSmsWorker, SEND_SMS_REQUEST);

export function* verifyEmailWorker({ payload }) {
  // yield take(types.VERIFY_EMAIL_REQUEST);
  const result = yield call(verifyEmailService, payload.data)
  console.log('Email token result', result)
  if (!result) {
    yield put(verifyEmailFail())
  } else {
    yield put(verifyEmailSuccess(result.data))
  }
}
export const verifyEmailWatcher = createWatcher(verifyEmailWorker, VERIFY_EMAIL_REQUEST);

export function* verifyXpubWorker({ payload }) {
  // yield take(types.VERIFY_XPUB_REQUEST);
  const result = yield call(xpubService, payload.data)
  console.log('XPUB RESULT', result)
  if (!result) {
    yield put(verifyXpubFail())
  } else {
    yield put(verifyXpubSuccess(result.data))
  }
}
export const verifyXpubWatcher = createWatcher(verifyXpubWorker, VERIFY_XPUB_REQUEST);
