import { TransactionBuilder } from 'bitcoinjs-lib'

// types and action creators: dispatched by components and sagas
export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST'
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS'
export const CREATE_USER_FAIL = 'CREATE_USER_FAIL'
export const CLEAR_USER_REQUEST = 'CLEAR_USER_REQUEST'

export const SEND_EMAIL_REQUEST = 'SEND_EMAIL_REQUEST'
export const SEND_EMAIL_SUCCESS = 'SEND_EMAIL_SUCCESS'
export const SEND_EMAIL_FAIL = 'SEND_EMAIL_FAIL'
export const SENT_EMAIL_REQUEST = 'SENT_EMAIL_REQUEST'

export const VERIFY_EMAIL_REQUEST = 'VERIFY_EMAIL_REQUEST'
export const VERIFY_EMAIL_SUCCESS = 'VERIFY_EMAIL_SUCCESS'
export const VERIFY_EMAIL_FAIL = 'VERIFY_EMAIL_FAIL'
export const VERIFIED_EMAIL = 'VERIFIED_EMAIL'

export const SEND_SMS_REQUEST = 'SEND_SMS_REQUEST'
export const SEND_SMS_SUCCESS = 'SEND_SMS_SUCCESS'
export const SEND_SMS_FAIL = 'SEND_SMS_FAIL'
export const SENT_SMS_REQUEST = 'SENT_SMS_REQUEST'

export const VERIFY_XPUB_REQUEST = 'VERIFY_XPUB_REQUEST'
export const VERIFY_XPUB_SUCCESS = 'VERIFY_XPUB_SUCCESS'
export const VERIFY_XPUB_FAIL = 'VERIFY_XPUB_FAIL'

export const createCustomer = (data) =>{
  return { type: CREATE_USER_REQUEST, payload: { data } };
}

export const ClearUserRequest = () =>{
  return { type: CLEAR_USER_REQUEST };
}

export const sendEmailRequest = data => {
  return { type: SEND_EMAIL_REQUEST, payload: { data } };
};

export const sentEmailRequest = () => {
  return { type: SENT_EMAIL_REQUEST};
};

export const sendSmsRequest = data => {
  return { type: SEND_SMS_REQUEST, payload: { data } };
};

export const sentSmsRequest = () => {
  return { type: SENT_SMS_REQUEST};
};

export const verifyEmailRequest = data => {
  return { type: VERIFY_EMAIL_REQUEST, payload: { data } };
};

export const createUserSuccess = data => {
return {
    type: CREATE_USER_SUCCESS,
    payload: { data }
  }
}

export const createUserFail = () => {
  return { type: CREATE_USER_FAIL }
}

export const sendEmailSuccess = data => {
  return {
    type: SEND_EMAIL_SUCCESS,
    payload: { emailSent: true, emailSentDetails: data }
  }
}

export const sendEmailFail = () => {
  return { type: SEND_EMAIL_FAIL, payload: { emailSent: false } }
}

export const sendSmsSuccess = data => {
  return {
    type: SEND_SMS_SUCCESS,
    payload: { smsSent: true, smsSentDetails: data }
  }
}

export const sendSmsFail = () => {
  return { type: SEND_SMS_FAIL, payload: { smsSent: false } }
}

export const verifyEmailSuccess = data => {
  return {
    type: VERIFY_EMAIL_SUCCESS,
    payload: { emailVerified: true, emailVerifiedDetails: data }
  }
}

export const verifyEmailFail = () => {
  return { type: VERIFY_EMAIL_FAIL, payload: { emailVerified: false } }
}

export const verifiedEmail = () => {
  return { type: VERIFIED_EMAIL, payload: { emailVerified: false } }
}

export const verifyXpubSuccess = data => {
  return {
    type: VERIFY_XPUB_SUCCESS,
    payload: {
      xpubVerified: true,
      xpubDetails: data
    }
  }
}

export const verifyXpubFail = () => {
  return {
    type: VERIFY_XPUB_FAIL,
    payload: {
      xpubVerified: false
    }
  }
}
