import {
  CURRENCY_CODE,
  CURRENCY_KIND_SET,
  FCM_TOKEN_VALUE,
  SECONDARY_DEVICE_ADDRESS_VALUE,
  RELEASE_CASES_VALUE,
  TEST_ACCOUNT_HELPER_DONE,
  TRANSACTION_HELPER_DONE,
  RECEIVE_HELPER_DONE,
  SAVING_WARNING,
  INIT_ASYNC_MIGRATION_SUCCESS,
  UPDATE_APPLICATION_STATUS,
  UPDATE_LAST_SEEN,
  CARD_DATA,
  IS_BACKUP_PROCESSING,
  INITIAL_KNOW_MORE_SEND_SHEET_SHOWN,
} from '../actions/preferences'
import { UPDATE_APP_PREFERENCE } from '../constants'
import ip, { chain } from 'icepick'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import * as RNLocalize from 'react-native-localize'

const initialState = ip.freeze( {
  hasShownNoInternetWarning: false,
  currencyCode: RNLocalize.getCurrencies()[ 0 ] || 'USD',
  currencyKind: CurrencyKind.BITCOIN,
  fcmTokenValue: '',
  secondaryDeviceAddressValue: '',
  releaseCasesValue: null,
  isTestHelperDoneValue: false,
  isTransactionHelperDoneValue: false,
  isReceiveHelperDoneValue: false,
  savingWarning: false,
  isSendHelperDoneValue: false,
  isTwoFASetupDone: false,
  hasShownInitialKnowMoreSendSheet: false,
  hasCompletedTFASetup: false,
  isContactOpen: false,
  isMigrated: false,
  applicationStatus: null,
  lastSeen: null,
  cardData: null,
  isBackupProcessing: false
} )

export default ( state = initialState, { type, payload } ) => {
  switch ( type ) {
      case UPDATE_APP_PREFERENCE:
        return chain( state ).setIn( [ payload.key ], payload.value ).value()
      case CURRENCY_CODE:
        return {
          ...state,
          currencyCode: payload.currencyCode,
        }

      case CURRENCY_KIND_SET:
        return {
          ...state,
          currencyKind: payload,
        }

      case FCM_TOKEN_VALUE:
        return {
          ...state,
          fcmTokenValue: payload.fcmTokenValue,
        }

      case SECONDARY_DEVICE_ADDRESS_VALUE:
        return {
          ...state,
          secondaryDeviceAddressValue: payload.secondaryDeviceAddressValue,
        }

      case RELEASE_CASES_VALUE:
        return {
          ...state,
          releaseCasesValue: payload.releaseCasesValue,
        }

      case TEST_ACCOUNT_HELPER_DONE:
        return {
          ...state,
          isTestHelperDoneValue: payload.isTestHelperDoneValue,
        }

      case TRANSACTION_HELPER_DONE:
        return {
          ...state,
          isTransactionHelperDoneValue: payload.isTransactionHelperDoneValue,
        }

      case RECEIVE_HELPER_DONE:
        return {
          ...state,
          isReceiveHelperDoneValue: payload.isReceiveHelperDoneValue,
        }

      case INITIAL_KNOW_MORE_SEND_SHEET_SHOWN:
        return {
          ...state,
          hasShownInitialKnowMoreSendSheet: true,
        }

      case SAVING_WARNING:
        return {
          ...state,
          savingWarning: payload.savingWarning,
        }

      case INIT_ASYNC_MIGRATION_SUCCESS:
        return {
          ...state,
          isMigrated: true,
        }

      case UPDATE_APPLICATION_STATUS:
        return {
          ...state,
          applicationStatus: payload.status,
        }

      case UPDATE_LAST_SEEN:
        return Object.assign( {
        }, state, {
          lastSeen: new Date()
        } )

      case CARD_DATA:
        return {
          ...state,
          cardData: payload.cardData,
        }

      default:
        return state
  }
}
