import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { CLEAR_CLOUD_CACHE, SET_CLOUD_ERROR_MESSAGE, CLOUD_BACKUP_HISTORY, CLOUD_BACKUP_STATUS, GOOGLE_LOGIN_FAILURE, GOOGLE_LOGIN_SUCCESS, IS_CLOUD_BACKUP_SUCCESS, IS_CLOUD_BACKUP_UPDATED, IS_FILE_READING, SET_CLOUD_DATA_RECOVERY } from '../actions/cloud'

interface historyObj {
  title: string,
  confirmed: number,
  date: number,
}

const initialState: {

  isGoogleLoginSuccess: boolean;
  isFileReading: boolean;
  cloudData: any;
  isCloudBackupUpdated: boolean;
  isCloudBackupSuccess: boolean;
  cloudBackupStatus: CloudBackupStatus,
  cloudBackupHistory: historyObj[],
  cloudErrorMessage: string
} = {
  isGoogleLoginSuccess: false,
  isFileReading: false,
  cloudData: null,
  isCloudBackupUpdated: false,
  isCloudBackupSuccess: false,
  cloudBackupStatus: CloudBackupStatus.PENDING,
  cloudBackupHistory: [],
  cloudErrorMessage: '',
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case GOOGLE_LOGIN_SUCCESS:
        return {
          ...state,
          isGoogleLoginSuccess: action.payload.isGoogleLoginSuccess,
        }

      case GOOGLE_LOGIN_FAILURE:
        return {
          ...state,
          isGoogleLoginFailure: action.payload.isGoogleLoginFailure,
        }

      case SET_CLOUD_ERROR_MESSAGE:
        return {
          ...state,
          cloudErrorMessage: action.payload.message,
        }

      case IS_FILE_READING:
        return {
          ...state,
          isFileReading: action.payload.isFileReading,
        }

      case SET_CLOUD_DATA_RECOVERY:
        return {
          ...state,
          cloudData: action.payload.cloudData,
        }

      case IS_CLOUD_BACKUP_UPDATED:
        return {
          ...state,
          isCloudBackupUpdated: action.payload.isCloudBackupUpdated,
        }

      case IS_CLOUD_BACKUP_SUCCESS:
        return {
          ...state,
          isCloudBackupSuccess: action.payload.isCloudBackupSuccess,
        }

      case CLEAR_CLOUD_CACHE:
        return {
          ...initialState,
        }

      case CLOUD_BACKUP_STATUS:
        return {
          ...state,
          cloudBackupStatus: action.payload.cloudBackupStatus,
        }

      case CLOUD_BACKUP_HISTORY:
        return {
          ...state,
          cloudBackupHistory: action.payload.cloudBackupHistory,
        }
      default:
        return state
  }
}

