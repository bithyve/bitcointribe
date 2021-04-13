import ip, { chain } from 'icepick'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { CLEAR_CLOUD_CACHE, CLOUD_BACKUP_STATUS, DATA_BACKUP_STATUS, GOOGLE_LOGIN_FAILURE, GOOGLE_LOGIN_SUCCESS, IS_CLOUD_BACKUP_SUCCESS, IS_CLOUD_BACKUP_UPDATED, IS_FILE_READING, SET_CLOUD_DATA_RECOVERY } from '../actions/cloud'

const initialState = ip.freeze( {

  isGoogleLoginSuccess: false,
  isFileReading: false,
  cloudData: null,
  isCloudBackupUpdated: false,
  isCloudBackupSuccess: false,
  cloudBackupStatus: CloudBackupStatus.PENDING,

} )

export default ( state = initialState, { type, payload } ) => {
  switch ( type ) {
      case GOOGLE_LOGIN_SUCCESS:
        return {
          ...state,
          isGoogleLoginSuccess: payload.isGoogleLoginSuccess,
        }

      case GOOGLE_LOGIN_FAILURE:
        return {
          ...state,
          isGoogleLoginFailure: payload.isGoogleLoginFailure,
        }

      case IS_FILE_READING:
        return {
          ...state,
          isFileReading: payload.isFileReading,
        }

      case SET_CLOUD_DATA_RECOVERY:
        return {
          ...state,
          cloudData: payload.cloudData,
        }

      case IS_CLOUD_BACKUP_UPDATED:
        return {
          ...state,
          isCloudBackupUpdated: payload.isCloudBackupUpdated,
        }

      case IS_CLOUD_BACKUP_SUCCESS:
        return {
          ...state,
          isCloudBackupSuccess: payload.isCloudBackupSuccess,
        }

      case CLEAR_CLOUD_CACHE:
        return {
          ...initialState,
        }

      case CLOUD_BACKUP_STATUS:
        return {
          ...state,
          cloudBackupStatus: payload.cloudBackupStatus,
        }

      default:
        return state
  }
}

