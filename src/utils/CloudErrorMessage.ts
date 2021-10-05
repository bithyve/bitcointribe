export const getiCloudErrorMessage = ( errorCode ) => {
  switch ( `${errorCode}` ) {
      case '36': //An error that occurs when the user's iCloud account is temporarily unavailable.
        return '36'
      case '25': //An error that occurs when saving a record exceeds the user's storage quota.
        return '25'
      case '21': //An error that occurs when the change token expires.
        return '21'
      case '19': //An error that occurs when the server rejects the request because of a unique constraint violation.
        return '19'
      case '18': //An error that occurs when the current app version is older than the oldest allowed version.
        return '18'
      case '27': //An error that occurs when a request's size exceeds the limit.
        return '27'
      case '4': //An error that occurs when a network is available, but CloudKit is inaccessible.
        return '4'
      case '3': //An error that occurs when the network is unavailable.
        return '3'
      case '7': //An error that occurs when CloudKit rate-limits requests.
        return '7'
      case '9': //An error that occurs when the user is unauthenticated.
        return '9'
      default:
        //We encountered a non-standard error. Please try again after sometime or contact us with (${errorCode}) Error Code.
        return 'default'
  }
}

export const getGoogleDriveErrorMessage = ( errorCode ) => {
  switch ( `${errorCode}` ) {
      case '17': //API_NOT_CONNECTED
        return '17'
      case '16': //CANCELED
        return 'Errorconnecting'
      case '20': //CONNECTION_SUSPENDED_DURING_CALL
        return 'Errorconnecting'
      case '10': //DEVELOPER_ERROR
        return '10'
      case '13': //ERROR
        return '13'
      case '8': //INTERNAL_ERROR
        return '8'
      case '14': //INTERRUPTED
        return 'Errorconnecting'
      case '5': //INVALID_ACCOUNT
        return '5'
      case '7': //NETWORK_ERROR
        return '7'
      case '22': //RECONNECTION_TIMED_OUT
        return 'unabletoreconnect'
      case '21': //RECONNECTION_TIMED_OUT_DURING_UPDATE
        return 'unabletoreconnect'
      case '19': //REMOTE_EXCEPTION
        return '19'
      case '3': //SERVICE_DISABLED
        return '3'
      case '2': //SERVICE_VERSION_UPDATE_REQUIRED
        return '2'
      case '4': //SIGN_IN_REQUIRED
        return '4'
      case '15': //SIGN_IN_REQUIRED
        return '15'
      //
      case '30': //SIGN_IN_FAILED
        return '30'
      case '33':
      case '31': //ERROR_IN_UPLOADING_DATA
        return 'errorinuploadingdata'
      case '34': //ERROR_IN_READING_DATA
        return 'Error in reading data. Please re-try again.'
      case '12501':
        return '12501'
      default:
        return 'default'
  }
}
