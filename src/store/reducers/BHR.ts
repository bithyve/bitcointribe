import { BackupStreamData, ChannelAssets, KeeperInfoInterface, LevelData, LevelInfo, MetaShare, PrimaryStreamData, SecondaryStreamData } from '../../bitcoin/utilities/Interface'
import { LevelDataVar } from '../../common/CommonVars/commonVars'
import LevelStatus from '../../common/data/enums/LevelStatus'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import {
  HEALTH_CHECK_INITIALIZED_KEEPER,
  HEALTH_CHECK_INITIALIZE,
  HEALTH_UPDATE,
  ERROR_SENDING,
  S3_LOADING_STATUS,
  MSHARES,
  IS_LEVEL_TWO_METASHARE,
  IS_LEVEL_THREE_METASHARE,
  IS_LEVEL2_INITIALIZED,
  ERROR_RECEIVING_HEALTH,
  WALLET_RECOVERY_FAILED_HEALTH,
  WALLET_IMAGE_HEALTH_CHECKED,
  S3_LOADING_KEEPER,
  IS_LEVEL3_INITIALIZED,
  PDF_GENERATED,
  MNEMONIC_RECOVERED_HEALTH,
  DOWNLOADED_SM_SHARES,
  REMOVE_SN,
  SET_PDF_INFO,
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
  APPROVAL_STATUS,
  DOWNLOADED_BACKUP_DATA,
  SET_IS_KEEPER_INFO_UPDATED,
  LEVEL_COMPLETION_ERROR,
  NAVIGATING_HISTORY_PAGE,
  TYPE_BOTTOMSHEET_OPEN,
  ALLOW_SECURE_ACCOUNT,
  OPEN_CLOSE_APPROVAL,
  SET_SECONDARY_DATA_INFO_STATUS,
  UPDATE_META_SHARES_KEEPER,
  UPDATE_OLD_META_SHARES_KEEPER,
  SET_IS_CURRENT_LEVEL0
} from '../actions/BHR'

const initialState: {
  mnemonic: string;
  loading: {
    levelHealthCheck: Boolean;
    checkMSharesHealth: Boolean;
    initLoader: Boolean;
    updateMSharesHealth: Boolean;
    autoShareKeepersData: Boolean;
    pdfDataProcess: Boolean;
    pdfShare: Boolean;
    pdfDataConfirm: Boolean;
    modifyLevelDataStatus: boolean;
    healthExpiryStatus: boolean;
    setToBaseStatus: boolean;
    createChannelAssetsStatus: boolean;
    downloadSMShareLoader: boolean;
    downloadBackupDataStatus: boolean;
    updateKIToChStatus: boolean;
    setupPasswordStatus: boolean;
    updateWIStatus: boolean;
    generateMetaShareStatus: boolean;
    updateSecondaryShardStatus: boolean;
    getSecondaryDataInfoStatus: boolean;
    changeAnswerStatus: boolean;
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
  metaSharesKeeper: MetaShare[];
  oldMetaSharesKeeper: MetaShare[];
  errorReceiving: Boolean;
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
  downloadedBackupData: {
    primaryData?: PrimaryStreamData;
    backupData?: BackupStreamData;
    secondaryData?: SecondaryStreamData;
    isCloud?: boolean;
  }[];
  isKeeperInfoUpdated2: boolean;
  isKeeperInfoUpdated3: boolean;
  navigationObj: any;
  errorTitle: string;
  errorInfo: string;
  status: LevelStatus;
  isTypeBottomSheetOpen: boolean;
  AllowSecureAccount: boolean;
  openApproval: boolean;
  availableKeepers: KeeperInfoInterface[];
  approvalContactData: ContactRecipientDescribing;
  IsCurrentLevel0: boolean;
} = {
  mnemonic: '',
  loading: {
    levelHealthCheck: false,
    checkMSharesHealth: false,
    initLoader: false,
    updateMSharesHealth: false,
    autoShareKeepersData: false,
    pdfDataProcess: false,
    pdfShare: false,
    pdfDataConfirm: false,
    modifyLevelDataStatus: false,
    healthExpiryStatus: false,
    setToBaseStatus: false,
    createChannelAssetsStatus: false,
    downloadSMShareLoader: false,
    downloadBackupDataStatus: false,
    updateKIToChStatus: false,
    setupPasswordStatus: false,
    updateWIStatus: false,
    generateMetaShareStatus: false,
    updateSecondaryShardStatus: false,
    getSecondaryDataInfoStatus: false,
    changeAnswerStatus: false
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
  metaSharesKeeper: [],
  oldMetaSharesKeeper: [],
  errorReceiving: false,
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
  levelData: LevelDataVar,
  keeperProcessStatus: '',
  pdfCreatedSuccessfully: false,
  isLevelToNotSetupStatus: false,
  channelAssets: {
  },
  approvalStatus: false,
  downloadedBackupData: [],
  isKeeperInfoUpdated2: false,
  isKeeperInfoUpdated3: false,
  navigationObj: {
  },
  errorTitle: null,
  errorInfo: null,
  status: LevelStatus.PENDING,
  isTypeBottomSheetOpen: false,
  AllowSecureAccount: false,
  openApproval: false,
  availableKeepers: [],
  approvalContactData: null,
  IsCurrentLevel0: false
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

      case UPDATE_META_SHARES_KEEPER:
        return {
          ...state,
          metaSharesKeeper: action.payload.metaSharesKeeper
        }

      case UPDATE_OLD_META_SHARES_KEEPER:
        return {
          ...state,
          oldMetaSharesKeeper: action.payload.oldMetaSharesKeeper
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

      case MSHARES:
        return {
          ...state,
          shares: action.payload.shares,
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

      case ERROR_RECEIVING_HEALTH:
        return {
          ...state,
          errorReceiving: action.payload.isFailed,
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
          channelAssets: action.payload.channelAssets,
          secondaryShareDownloaded: action.payload.secondaryShareDownloaded
        }

      case APPROVAL_STATUS:
        return {
          ...state,
          approvalStatus: action.payload.flag
        }

      case DOWNLOADED_BACKUP_DATA:
        return {
          ...state,
          downloadedBackupData: action.payload.downloadedBackupData
        }

      case SET_IS_KEEPER_INFO_UPDATED:
        return {
          ...state,
          isKeeperInfoUpdated2: action.payload.isKeeperInfoUpdated2 ? action.payload.isKeeperInfoUpdated2 : state.isKeeperInfoUpdated2,
          isKeeperInfoUpdated3: action.payload.isKeeperInfoUpdated3 ? action.payload.isKeeperInfoUpdated3 : state.isKeeperInfoUpdated3
        }

      case LEVEL_COMPLETION_ERROR:
        return {
          ...state,
          errorTitle: action.payload.errorTitle,
          errorInfo: action.payload.errorInfo,
          status: action.payload.status,
        }

      case NAVIGATING_HISTORY_PAGE:
        return {
          ...state,
          navigationObj: action.payload.navigationObj,
        }

      case TYPE_BOTTOMSHEET_OPEN:
        return {
          ...state,
          isTypeBottomSheetOpen: action.payload.isTypeBottomSheetOpen,
        }

      case ALLOW_SECURE_ACCOUNT:
        return {
          ...state,
          AllowSecureAccount: action.payload.flag,
        }

      case OPEN_CLOSE_APPROVAL:
        return {
          ...state,
          openApproval: action.payload.flag,
          availableKeepers: action.payload.availableKeepers,
          approvalContactData: action.payload.contactData
        }

      case SET_SECONDARY_DATA_INFO_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            getSecondaryDataInfoStatus: action.payload.flag,
          },
        }

      case SET_IS_CURRENT_LEVEL0:
        return {
          ...state,
          IsCurrentLevel0: action.payload.flag,
        }

  }
  return state
}
