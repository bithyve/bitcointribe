import { Platform } from 'react-native'
import S3Service from '../../bitcoin/services/sss/S3Service'
import { ChannelAssets, KeeperInfoInterface, LevelData, LevelInfo, MetaShare } from '../../bitcoin/utilities/Interface'
import { S3_SERVICE } from '../../common/constants/wallet-service-types'
import {
  HEALTH_CHECK_INITIALIZED_KEEPER,
  HEALTH_CHECK_INITIALIZE,
  HEALTH_UPDATE,
  GET_HEALTH_OBJECT,
  ERROR_SENDING,
  S3_LOADING_STATUS,
  INIT_LOADING_STATUS,
  UPDATE_MSHARE_LOADING_STATUS,
  MSHARES,
  UPDATE_EFCHANNEL_LOADING_STATUS,
  IS_LEVEL_TWO_METASHARE,
  IS_LEVEL_THREE_METASHARE,
  IS_LEVEL2_INITIALIZED,
  SHARE_RECEIVED,
  DOWNLOADED_MSHARE_HEALTH,
  ERROR_RECEIVING_HEALTH,
  WALLET_RECOVERY_FAILED_HEALTH,
  WALLET_IMAGE_HEALTH_CHECKED,
  S3_LOADING_KEEPER,
  IS_LEVEL3_INITIALIZED,
  PDF_GENERATED,
  ON_APPROVAL_STATUS_CHANGE,
  MNEMONIC_RECOVERED_HEALTH,
  DOWNLOADED_SM_SHARES,
  REMOVE_SN,
  SET_PDF_INFO,
  DOWNLOADED_PDFSHARE_HEALTH,
  PUT_KEEPER_INFO,
  SM_META_SHARE_GENERATE,
  UPLOAD_SUCCESSFULLY_SM,
  UPDATE_CLOUD_PERMISSION,
  INIT_NEW_BHR,
  UPDATE_LEVEL_DATA,
  KEEPER_PROCESS_STATUS,
  PDF_SUCCESSFULLY_CREATED,
  IS_LEVEL_TO_NOT_SETUP,
  SET_CHANNEL_ASSETS,
  APPROVAL_STATUS

} from '../actions/health'
import { SERVICES_ENRICHED } from '../actions/storage'
const obj = {
  shareType: '',
  updatedAt: 0,
  status: 'notSetup',
  shareId: '',
  reshareVersion: 0,
  name: '',
  data: {
  },
  uuid: '',
}
const initialState: {
  mnemonic: string;
  service: S3Service;
  loading: {
    levelHealthCheck: Boolean;
    checkMSharesHealth: Boolean;
    initLoader: Boolean;
    updateMSharesHealth: Boolean;
    updateEFChannelStatus: Boolean;
    uploadMetaShare: Boolean;
    approvalRequest: Boolean;
    reshareWithSameKeeper: Boolean;
    keeperSetupStatus: Boolean;
    autoShareContact: Boolean;
    pdfDataProcess: Boolean;
    pdfShare: Boolean;
    pdfDataConfirm: Boolean;
    uploadRequestedShare: Boolean;
    downloadSmShare: boolean;
    modifyLevelDataStatus: boolean;
  };
  walletRecoveryFailed: Boolean;
  walletImageChecked: Boolean;
  errorSending: Boolean;
  currentLevel: Number;
  isLevelTwoMetaShareCreated: Boolean;
  isLevelThreeMetaShareCreated: Boolean;
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  levelHealth: {
    level: number;
    levelInfo: LevelInfo[];
  }[];
  keeperInfo: KeeperInfoInterface[];
  shares: any;
  metaShare: MetaShare;
  downloadedMShare: {
    [otp: string]: { status: Boolean; err?: String };
  };
  downloadedPdfShare: {
    [otp: string]: { status: Boolean; err?: String };
  };
  errorReceiving: Boolean;
  keeperApproveStatus: {
    status: Boolean;
    initiatedAt: number;
    shareId: string;
    secondaryShare?: MetaShare;
    transferDetails?: {
      key: string;
      otp: string;
    }
  }
  secondaryShareDownloaded: any;
  pdfInfo: {
    filePath: string;
    shareId: string;
    updatedAt: number;
  },
  isSmMetaSharesCreatedFlag: boolean;
  hasSMUploadedSuccessfully: Boolean;
  cloudPermissionGranted: Boolean;
  newBHRFlowStarted: boolean;
  shieldHealth: boolean;
  levelData: LevelData[];
  keeperProcessStatus: string;
  pdfCreatedSuccessfully: boolean;
  isLevelToNotSetupStatus: boolean;
  channelAssets: ChannelAssets;
  approvalStatus: boolean;
} = {
  mnemonic: '',
  service: null,
  loading: {
    levelHealthCheck: false,
    checkMSharesHealth: false,
    initLoader: false,
    updateMSharesHealth: false,
    updateEFChannelStatus: false,
    uploadMetaShare: false,
    approvalRequest: false,
    reshareWithSameKeeper: false,
    keeperSetupStatus: false,
    autoShareContact: false,
    pdfDataProcess: false,
    pdfShare: false,
    pdfDataConfirm: false,
    uploadRequestedShare: false,
    downloadSmShare: false,
    modifyLevelDataStatus: false
  },
  walletRecoveryFailed: false,
  walletImageChecked: false,
  isLevelTwoMetaShareCreated: false,
  isLevelThreeMetaShareCreated: false,
  isLevel2Initialized: false,
  isLevel3Initialized: false,
  currentLevel: 0,
  levelHealth: [],
  errorSending: false,
  shares: null,
  keeperInfo: [],
  metaShare: null,
  downloadedMShare: {
  },
  downloadedPdfShare: {
  },
  errorReceiving: false,
  keeperApproveStatus: {
    status: false,
    initiatedAt: 0,
    shareId: '',
    secondaryShare: null,
    transferDetails: null
  },
  secondaryShareDownloaded: null,
  pdfInfo: {
    filePath: '',
    shareId: '',
    updatedAt: 0
  },
  isSmMetaSharesCreatedFlag: false,
  hasSMUploadedSuccessfully: false,
  cloudPermissionGranted: null,
  newBHRFlowStarted: false,
  shieldHealth: false,
  levelData: [
    {
      levelName: 'Level 1',
      status: 'notSetup',
      keeper1ButtonText: Platform.OS == 'ios' ? 'Backup on iCloud' : 'Backup on Google Drive',
      keeper2ButtonText: 'Security Question',
      keeper1: obj,
      keeper2: obj,
      note:'',
      info:'Automated Cloud Backup',
      id: 1,
    },
    {
      levelName: 'Level 2',
      status: 'notSetup',
      keeper1ButtonText: 'Share Recovery Key 1',
      keeper2ButtonText: 'Share Recovery Key 2',
      keeper1: obj,
      keeper2: obj,
      note:'',
      info:'Double Backup',
      id: 2,
    },
    {
      levelName: 'Level 3',
      status: 'notSetup',
      keeper1ButtonText: 'Share Recovery Key 1',
      keeper2ButtonText: 'Share Recovery Key 2',
      keeper1: obj,
      keeper2: obj,
      note:'',
      info:'Multi Key Backup',
      id: 3,
    },
  ],
  keeperProcessStatus: '',
  pdfCreatedSuccessfully: false,
  isLevelToNotSetupStatus: false,
  channelAssets: {
  },
  approvalStatus: false
}

export default ( state = initialState, action ) => {
  switch ( action.type ) {
      case HEALTH_CHECK_INITIALIZED_KEEPER:
        return {
          ...state,
          loading: {
            ...state.loading,
            levelHealthCheck: false,
          },
        }

      case HEALTH_CHECK_INITIALIZE:
        return {
          ...state,
          loading: {
            ...state.loading,
            levelHealthCheck: true,
          },
        }

      case HEALTH_UPDATE:
        return {
          ...state,
          levelHealth: action.payload.health,
          currentLevel: action.payload.currentLevel,
        }

      case GET_HEALTH_OBJECT:
        return {
          ...state,
          levelHealth: action.payload.health,
        }

      case ERROR_SENDING:
        return {
          ...state,
          errorSending: action.payload.isFailed,
        }

      case S3_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            checkMSharesHealth: action.payload.beingLoaded,
          },
        }

      case INIT_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            initLoader: action.payload.beingLoaded,
          },
        }

      case UPDATE_MSHARE_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            updateMSharesHealth: action.payload.beingLoaded,
          },
        }

      case MSHARES:
        return {
          ...state,
          shares: action.payload.shares,
        }

      case UPDATE_EFCHANNEL_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            updateEFChannelStatus: action.payload.beingLoaded,
          },
        }

      case IS_LEVEL_TWO_METASHARE:
        return {
          ...state,
          isLevelTwoMetaShareCreated: action.payload.beingLoaded,
        }

      case IS_LEVEL_THREE_METASHARE:
        return {
          ...state,
          isLevelThreeMetaShareCreated: action.payload.beingLoaded,
        }

      case PUT_KEEPER_INFO:
        return {
          ...state,
          keeperInfo: action.payload.info,
        }

      case IS_LEVEL2_INITIALIZED:
        return {
          ...state,
          isLevel2Initialized: true,
        }

      case IS_LEVEL3_INITIALIZED:
        return {
          ...state,
          isLevel3Initialized: true,
        }

      case SHARE_RECEIVED:
        return {
          ...state,
          metaShare: action.payload.metaShare,
        }

      case DOWNLOADED_MSHARE_HEALTH:
        return {
          ...state,
          downloadedMShare: {
            ...state.downloadedMShare,
            [ action.payload.otp ]: {
              status: action.payload.status,
              err: action.payload.err,
            },
          },
        }

      case DOWNLOADED_PDFSHARE_HEALTH:
        return {
          ...state,
          downloadedPdfShare: {
            ...state.downloadedPdfShare,
            [ action.payload.otp ]: {
              status: action.payload.status,
              err: action.payload.err,
            },
          },
        }

      case ERROR_RECEIVING_HEALTH:
        return {
          ...state,
          errorReceiving: action.payload.isFailed,
        }

      case SERVICES_ENRICHED:
        return {
          ...state,
          service: action.payload.services[ S3_SERVICE ],
          serviceEnriched: true,
        }

      case WALLET_RECOVERY_FAILED_HEALTH:
        return {
          ...state,
          walletRecoveryFailed: action.payload.isFailed,
        }

      case WALLET_IMAGE_HEALTH_CHECKED:
        return {
          ...state,
          walletImageChecked: action.payload.checked,
        }

      case S3_LOADING_KEEPER:
        return {
          ...state,
          loading: {
            ...state.loading,
            [ action.payload.beingLoaded ]: !state.loading[
              action.payload.beingLoaded
            ],
          },
        }

      case PDF_GENERATED:
        return {
          ...state,
          pdfGenerated: {
            ...action.payload.generated,
          },
        }

      case ON_APPROVAL_STATUS_CHANGE:
        return {
          ...state,
          keeperApproveStatus: {
            status: action.payload.status,
            initiatedAt: action.payload.initiatedAt,
            shareId: action.payload.shareId,
            secondaryShare: action.payload.secondaryShare,
            transferDetails: action.payload.transferDetails,
          },
        }

      case MNEMONIC_RECOVERED_HEALTH:
        return {
          ...state,
          mnemonic: action.payload.mnemonic,
        }

      case REMOVE_SN:
        return {
          ...state,
          mnemonic: '',
        }

      case DOWNLOADED_SM_SHARES:
        return {
          ...state,
          secondaryShareDownloaded: action.payload.metaShare,
        }

      case SET_PDF_INFO:
        console.log( 'action.payload.data', action.payload.data )
        return {
          ...state,
          pdfInfo: action.payload.data,
        }

      case SM_META_SHARE_GENERATE:
        return {
          ...state,
          isSmMetaSharesCreatedFlag: true,
        }

      case UPLOAD_SUCCESSFULLY_SM:
        return {
          ...state,
          hasSMUploadedSuccessfully: action.payload.isUploaded,
        }
      case UPDATE_CLOUD_PERMISSION:
        return {
          ...state,
          cloudPermissionGranted: action.payload.cloudPermissionGranted
        }

      case INIT_NEW_BHR:
        return {
          ...state,
          newBHRFlowStarted: action.payload.newBHRFlowStarted
        }

      case UPDATE_LEVEL_DATA:
        return {
          ...state,
          levelData: action.payload.levelData,
          shieldHealth: action.payload.shieldHealth
        }

      case KEEPER_PROCESS_STATUS:
        return {
          ...state,
          keeperProcessStatus: action.payload.status
        }

      case PDF_SUCCESSFULLY_CREATED:
        return {
          ...state,
          pdfCreatedSuccessfully: action.payload.status
        }

      case IS_LEVEL_TO_NOT_SETUP:
        return {
          ...state,
          isLevelToNotSetupStatus: action.payload.status
        }

      case SET_CHANNEL_ASSETS:
        return {
          ...state,
          channelAssets: action.payload.channelAssets
        }

      case APPROVAL_STATUS:
        return {
          ...state,
          approvalStatus: action.payload.flag
        }

  }
  return state
}
