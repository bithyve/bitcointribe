import { createAction } from 'redux-actions';
import { UPDATE_APP_PREFERENCE } from '../constants'
import { AsyncStorage } from 'react-native'
import { updateTrustedContactInfoLocally } from '../actions/trustedContacts'

export const CURRENCY_CODE = 'CURRENCY_CODE';
export const CURRENCY_TOGGLE_VALUE = 'CURRENCY_TOGGLE_VALUE';
export const FCM_TOKEN_VALUE = 'FCM_TOKEN_VALUE';
export const SECONDARY_DEVICE_ADDRESS_VALUE = 'SECONDARY_DEVICE_ADDRESS_VALUE';
export const RELEASE_CASES_VALUE = 'RELEASE_CASES_VALUE';
export const TEST_ACCOUNT_HELPER_DONE = 'TEST_ACCOUNT_HELPER_DONE';
export const TRANSACTION_HELPER_DONE = 'TRANSACTION_HELPER_DONE';
export const RECEIVE_HELPER_DONE = 'RECEIVE_HELPER_DONE';
export const SEND_HELPER_DONE = 'SEND_HELPER_DONE';
export const SAVING_WARNING = 'SAVING_WARNING';
export const TWO_FA_SETUP = 'TWO_FA_SETUP';
export const INIT_ASYNC_MIGRATION_REQUEST = 'INIT_ASYNC_MIGRATION_REQUEST';
export const INIT_ASYNC_MIGRATION_SUCCESS = 'INIT_ASYNC_MIGRATION_SUCCESS';
export const INIT_ASYNC_MIGRATION_FAILED = 'INIT_ASYNC_MIGRATION_FAILED';
export const UPDATE_APPLICATION_STATUS = 'UPDATE_APPLICATION_STATUS';
export const UPDATE_LAST_SEEN = 'UPDATE_LAST_SEEN';
export const CARD_DATA = 'CARD_DATA';

export const CLOUD_BACKUP_DATA_STATUS = 'CLOUD_BACKUP_DATA_STATUS';

export const setCurrencyCode = (data) => {
  return {
    type: CURRENCY_CODE,
    payload: { currencyCode: data },
  };
};
export const setCurrencyToggleValue = (data) => {
  return {
    type: CURRENCY_TOGGLE_VALUE,
    payload: { currencyToggleValue: data },
  };
};

export const setFCMToken = (data) => {
  return {
    type: FCM_TOKEN_VALUE,
    payload: { fcmTokenValue: data },
  };
};

export const setSecondaryDeviceAddress = (data) => {
  return {
    type: SECONDARY_DEVICE_ADDRESS_VALUE,
    payload: { secondaryDeviceAddressValue: data },
  };
};

export const setReleaseCases = (data) => {
  return {
    type: RELEASE_CASES_VALUE,
    payload: { releaseCasesValue: data },
  };
};

export const setTestAccountHelperDone = (data) => {
  return {
    type: TEST_ACCOUNT_HELPER_DONE,
    payload: { isTestHelperDoneValue: data },
  };
};

export const setTransactionHelper = (data) => {
  return {
    type: TRANSACTION_HELPER_DONE,
    payload: { isTransactionHelperDoneValue: data },
  };
};

export const setReceiveHelper = (data) => {
  return {
    type: RECEIVE_HELPER_DONE,
    payload: { isReceiveHelperDoneValue: data },
  };
};

export const setSendHelper = (data) => {
  return {
    type: SEND_HELPER_DONE,
    payload: { isSendHelperDoneValue: data },
  };
};

export const setSavingWarning = (data) => {
  return {
    type: SAVING_WARNING,
    payload: { savingWarning: data },
  };
};

export const setTwoFASetup = (data) => {
  return {
    type: TWO_FA_SETUP,
    payload: { isTwoFASetupDone: data },
  };
};

const updatePereferenceRequest = createAction(UPDATE_APP_PREFERENCE);
export const updatePreference = (payload) => dispatch => dispatch(updatePereferenceRequest(payload))



const initAsyncMigrationRequest = createAction(INIT_ASYNC_MIGRATION_REQUEST);
const initAsyncMigrationSuccess = createAction(INIT_ASYNC_MIGRATION_SUCCESS);
const initAsyncMigrationFailed = createAction(INIT_ASYNC_MIGRATION_FAILED);




export const initMigration = () => {
  return async dispatch => {
    dispatch(initAsyncMigrationRequest());
    let data = await AsyncStorage.multiGet(["TrustedContactsInfo", "currencyCode"])
    if (data && data[0] && data[0][1]) {
      let trustedContacts = data[0][1]
      dispatch(updateTrustedContactInfoLocally(JSON.parse(trustedContacts)))
    }
    if (data && data[1]) {
      let currencyCode = JSON.parse(data[1][1]) || 'USD'
      dispatch(updatePreference(
        {
          key: 'currencyCode',
          value: currencyCode,
        }
      ))
    } else {
      let currencyCode = 'USD'
      dispatch(updatePreference(
        {
          key: 'currencyCode',
          value: currencyCode,
        }
      ))
    }

    dispatch(initAsyncMigrationSuccess());
  };
}


export const updateApplicationStatus = (data) => {
  return {
    type: UPDATE_APPLICATION_STATUS,
    payload: { status: data },
  };
};

export const updateLastSeen = (data) => {
  AsyncStorage.setItem("lastSeen", String(new Date()))
  return {
    type: UPDATE_LAST_SEEN,
    payload: { lastSeen: data },
  };
};

export const setCloudBackupStatus = (data) => {
  return {
    type: CLOUD_BACKUP_DATA_STATUS,
    payload: { status: data },
  };
};

export const setCardData = (data) => {
  return {
    type: CARD_DATA,
    payload: { cardData: data },
  };
};