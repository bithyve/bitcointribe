import {
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAIL,
  CLEAR_USER_REQUEST,
  SEND_EMAIL_REQUEST,
  SEND_EMAIL_SUCCESS,
  SEND_EMAIL_FAIL,
  SEND_SMS_REQUEST,
  SEND_SMS_SUCCESS,
  SEND_SMS_FAIL,
  VERIFY_EMAIL_REQUEST,
  VERIFY_EMAIL_SUCCESS,
  VERIFY_EMAIL_FAIL,
  VERIFY_XPUB_REQUEST,
  VERIFY_XPUB_SUCCESS,
  VERIFY_XPUB_FAIL,
  SENT_EMAIL_REQUEST,
  SENT_SMS_REQUEST,
  VERIFIED_EMAIL
} from '../actions/bittr'

const INITIAL_STATE = {
  state: 0,
  userDetails: null,
  emailSent: null,
  emailSentDetails: null,
  smsSent: null,
  smsSentDetails: null,
  emailVerified: null,
  emailVerifiedDetails: null,
  xpubVerified: null,
  xpubDetails: null,
  xpubVerifyRequest: null,
  loading: false,
}

const reducer = (state = INITIAL_STATE, action) => {
  const { payload } = action
  switch (action.type) {
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        userDetails: payload.data,
        createUserRequest: false
      }
    case CREATE_USER_FAIL:
      return {
        ...state,
        userDetails: false,
        createUserRequest: false
      }

    case CREATE_USER_REQUEST:
      return {
        ...state,
        createUserRequest: true
      }
    case CLEAR_USER_REQUEST:
      return {
        ...state,
        userDetails: false,
        createUserRequest: false
      }

    case SEND_EMAIL_SUCCESS:
      return {
        ...state,
        loading : true,
        emailSent: payload.emailSent,
        emailSentDetails: payload.emailSentDetails,
        sendEmailRequest: false
      }
    case SEND_EMAIL_FAIL:
      return { ...state, loading : false, emailSent: false, sendEmailRequest: false }
    
    case SENT_EMAIL_REQUEST:
      return { ...state, loading : false, emailSent: false, emailSentDetails: null, sendEmailRequest: false }
    
    case SEND_SMS_SUCCESS:
      return {
        ...state,
        smsSent: payload.smsSent,
        smsSentDetails: payload.smsSentDetails,
        sendSmsRequest: false
      }
    case SEND_SMS_FAIL:
      return { ...state, smsSent: payload.smsSent, sendSmsRequest: false }
      case SENT_SMS_REQUEST:
      return { ...state, smsSent: false, sendSmsRequest: false }
    case SEND_SMS_REQUEST:
      return {
        ...state,
        sendSmsRequest: true
      }
    case VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        emailVerifiedDetails: payload.emailVerifiedDetails,
        emailVerified: payload.emailVerified,
        emailVerifyRequest: false
      }
    case VERIFY_EMAIL_FAIL:
      return {
        ...state,
        emailVerified: payload.emailVerified,
        emailVerifyRequest: false
      }
      case VERIFIED_EMAIL:
        return {
          ...state,
          emailVerifiedDetails: null,
          emailVerified: false,
          emailVerifyRequest: false
        } 
    case VERIFY_EMAIL_REQUEST:
      return {
        ...state,
        emailVerifyRequest: true
      }
    case VERIFY_XPUB_SUCCESS:
      return {
        ...state,
        xpubVerified: payload.xpubVerified,
        xpubDetails: payload.xpubDetails,
        xpubVerifyRequest: false
      }
    case VERIFY_XPUB_FAIL:
      return {
        ...state,
        xpubVerified: payload.xpubVerified,
        xpubVerifyRequest: false
      }
    case VERIFY_XPUB_REQUEST:
      return {
        ...state,
        xpubVerifyRequest: true
      }
    default:
      return state
  }
}

export default reducer
