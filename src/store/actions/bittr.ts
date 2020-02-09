import { TransactionBuilder } from 'bitcoinjs-lib'

// types and action creators: dispatched by components and sagas
export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST'
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS'
export const CREATE_USER_FAIL = 'CREATE_USER_FAIL'

export const SEND_EMAIL_REQUEST = 'SEND_EMAIL_REQUEST'
export const SEND_EMAIL_SUCCESS = 'SEND_EMAIL_SUCCESS'
export const SEND_EMAIL_FAIL = 'SEND_EMAIL_FAIL'

export const VERIFY_EMAIL_REQUEST = 'VERIFY_EMAIL_REQUEST'
export const VERIFY_EMAIL_SUCCESS = 'VERIFY_EMAIL_SUCCESS'
export const VERIFY_EMAIL_FAIL = 'VERIFY_EMAIL_FAIL'

export const SEND_SMS_REQUEST = 'SEND_SMS_REQUEST'
export const SEND_SMS_SUCCESS = 'SEND_SMS_SUCCESS'
export const SEND_SMS_FAIL = 'SEND_SMS_FAIL'

export const VERIFY_XPUB_REQUEST = 'VERIFY_XPUB_REQUEST'
export const VERIFY_XPUB_SUCCESS = 'VERIFY_XPUB_SUCCESS'
export const VERIFY_XPUB_FAIL = 'VERIFY_XPUB_FAIL'

export function createUserSuccess(data) {
  return {
    type: CREATE_USER_SUCCESS,
    payload: { userDetails: data }
  }
}

export function createUserFail() {
  return { type: CREATE_USER_FAIL }
}

export function sendEmailSuccess(data) {
  return {
    type: SEND_EMAIL_SUCCESS,
    payload: { emailSent: true, emailSentDetails: data }
  }
}

export function sendEmailFail() {
  return { type: SEND_EMAIL_FAIL, payload: { emailSent: false } }
}

export function sendSmsSuccess(data) {
  return {
    type: SEND_SMS_SUCCESS,
    payload: { smsSent: true, smsSentDetails: data }
  }
}

export function sendSmsFail() {
  return { type: SEND_SMS_FAIL, payload: { smsSent: false } }
}

export function verifyEmailSuccess(data) {
  return {
    type: VERIFY_EMAIL_SUCCESS,
    payload: { emailVerified: true, emailVerifiedDetails: data }
  }
}

export function verifyEmailFail() {
  return { type: VERIFY_EMAIL_FAIL, payload: { emailVerified: false } }
}

export function verifyXpubSuccess(data) {
  return {
    type: VERIFY_XPUB_SUCCESS,
    payload: {
      xpubVerified: true,
      xpubDetails: data
    }
  }
}

export function verifyXpubFail() {
  return {
    type: VERIFY_XPUB_FAIL,
    payload: {
      xpubVerified: false
    }
  }
}
