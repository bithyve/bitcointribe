export const getiCloudErrorMessage = ( errorCode ) => {
  switch ( `${errorCode}` ) {
      case '36': //An error that occurs when the user's iCloud account is temporarily unavailable.
        return 'iCloud account is temporarily unavailable, please try after sometime.'
      case '25': //An error that occurs when saving a record exceeds the user's storage quota.
        return 'Storage quota exceeded. Consider deleting a few files or upgrading your plan.'
      case '21': //An error that occurs when the change token expires.
        return 'Please check authentication with iCloud in settings and try again.'
      case '19': //An error that occurs when the server rejects the request because of a unique constraint violation.
        return 'We were unable to reach iCloud server. Please try again after sometime.'
      case '18': //An error that occurs when the current app version is older than the oldest allowed version.
        return 'Seems you are using an older version of Hexa. Please update your app and try again.'
      case '27': //An error that occurs when a request's size exceeds the limit.
        return 'Your request data size was beyond the limits specified by iCloud. Please try after sometime.'
      case '4': //An error that occurs when a network is available, but CloudKit is inaccessible.
        return 'iCloud is currently inaccessible. Please try again in sometime.'
      case '3': //An error that occurs when the network is unavailable.
        return 'Network error, please check your internet connection.'
      case '7': //An error that occurs when CloudKit rate-limits requests.
        return 'You may have pressed requested too many times. Please try after sometime.'
      case '9': //An error that occurs when the user is unauthenticated.
        return ' You are not logged-in into your iCloud account. Please log in from your Phone Settings.'
      default:
        return `We encountered a non-standard error. Please try again after sometime or contact us with (${errorCode}) Error Code.`
  }
}

export const getGoogleDriveErrorMessage = ( errorCode ) => {
  switch ( `${errorCode}` ) {
      case '17': //API_NOT_CONNECTED
        return 'Failed to connect to your Google Drive. Please try after sometime.'
      case '16': //CANCELED
        return 'Error connecting with server. Please try again after sometime.'
      case '20': //CONNECTION_SUSPENDED_DURING_CALL
        return 'Error connecting with server. Please try again after sometime.'
      case '10': //DEVELOPER_ERROR
        return 'Technical error occurred. This cannot be rectified at your end. Please contact our support.'
      case '13': //ERROR
        return `We encountered a non-standard error. Please try again after sometime or contact us with (${errorCode}) Error Code.`
      case '8': //INTERNAL_ERROR
        return 'Google Drive is temporarily unavailable. Please try again'
      case '14': //INTERRUPTED
        return 'Error connecting with server. Please try again after sometime.'
      case '5': //INVALID_ACCOUNT
        return 'Incorrect account name. Please use the account name you used originally while setting up the wallet.'
      case '7': //NETWORK_ERROR
        return 'A network error occurred. Please check your connection and try again.'
      case '22': //RECONNECTION_TIMED_OUT
        return 'Unable to re-connect with Google Drive right now. Please try again after sometime.'
      case '21': //RECONNECTION_TIMED_OUT_DURING_UPDATE
        return 'Unable to re-connect with Google Drive right now. Please try again after sometime.'
      case '19': //REMOTE_EXCEPTION
        return 'Unable to connect with Google Drive right now. Please try again after sometime.'
      case '3': //SERVICE_DISABLED
        return 'Google Play services is disabled on your phone. Please enable them from Phone Settings.'
      case '2': //SERVICE_VERSION_UPDATE_REQUIRED
        return 'The installed version of Google Play services is out of date. Please update it from Play store.'
      case '4': //SIGN_IN_REQUIRED
        return 'You are not logged-in into your Google Drive account. Please log in from your Phone Settings.'
      case '15': //SIGN_IN_REQUIRED
        return 'Request timed out. Please try again.'
      //
      case '30': //SIGN_IN_FAILED
        return 'Please check authentication with your google account in settings and try again.'
      case '33':
      case '31': //ERROR_IN_UPLOADING_DATA
        return 'Error in uploading data. Please re-try again.'
      case '34': //ERROR_IN_READING_DATA
        return 'Error in reading data. Please re-try again.'
      case '12501':
        return 'We recommend signing in as it easily allows you to backup your wallet on your personal cloud.'
      default:
        return `We encountered a non-standard error. Please try again after sometime or contact us with (${errorCode}) Error Code.`
  }
}
