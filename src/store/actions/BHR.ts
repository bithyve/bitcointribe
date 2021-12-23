// types and action creators: dispatched by components and sagas
import { BackupStreamData, cloudDataInterface, LevelHealthInterface, MetaShare, NewWalletImage, PrimaryStreamData, SecondaryStreamData } from '../../bitcoin/utilities/Interface'

export const INIT_HEALTH_SETUP = 'INIT_HEALTH_SETUP'
export const HEALTH_UPDATE = 'HEALTH_UPDATE'
export const HEALTH_CHECK_INITIALIZED_KEEPER = 'HEALTH_CHECK_INITIALIZED_KEEPER'
export const HEALTH_CHECK_INITIALIZE = 'HEALTH_CHECK_INITIALIZE'
export const INIT_HEALTH_CHECK = 'INIT_HEALTH_CHECK'
export const S3_LOADING_STATUS = 'S3_LOADING_STATUS'
export const PREPARE_MSHARES = 'PREPARE_MSHARES'
export const UPDATE_HEALTH = 'UPDATE_HEALTH'
export const ERROR_SENDING = 'ERROR_SENDING'
export const UPDATE_SHARES_HEALTH = 'UPDATE_SHARES_HEALTH'
export const GENERATE_META_SHARE = 'GENERATE_META_SHARE'
export const UPDATE_META_SHARES_KEEPER= 'UPDATE_META_SHARES_KEEPER'
export const UPDATE_OLD_META_SHARES_KEEPER= 'UPDATE_OLD_META_SHARES_KEEPER'
export const MSHARES = 'MSHARES'
export const IS_LEVEL_TWO_METASHARE = 'IS_LEVEL_TWO_METASHARE'
export const IS_LEVEL_THREE_METASHARE = 'IS_LEVEL_THREE_METASHARE'
export const INIT_LEVEL_TWO = 'INIT_LEVEL_TWO'
export const IS_LEVEL2_INITIALIZED = 'IS_LEVEL2_INITIALIZED'
export const IS_LEVEL3_INITIALIZED = 'IS_LEVEL3_INITIALIZED'
export const KEEPER_INFO = 'KEEPER_INFO'
export const PUT_KEEPER_INFO = 'PUT_KEEPER_INFO'
export const UPDATE_CLOUD_PERMISSION = 'UPDATE_CLOUD_PERMISSION'
export const RECOVER_WALLET_USING_ICLOUD = 'RECOVER_WALLET_USING_ICLOUD'
export const WALLET_RECOVERY_FAILED_HEALTH = 'WALLET_RECOVERY_FAILED_HEALTH'
export const WALLET_IMAGE_HEALTH_CHECKED = 'WALLET_IMAGE_HEALTH_CHECKED'
export const ERROR_RECEIVING_HEALTH = 'ERROR_RECEIVING_HEALTH'
export const RECOVER_WALLET_HEALTH = 'RECOVER_WALLET_HEALTH'
export const CLOUD_MSHARE = 'CLOUD_MSHARE'
export const S3_LOADING_KEEPER = 'S3_LOADING_KEEPER'
export const GENERATE_PDF = 'GENERATE_PDF'
export const PDF_GENERATED = 'PDF_GENERATED'
export const UPLOAD_PDF_SHARE = 'UPLOAD_PDF_SHARE'
export const RECOVER_MNEMONIC_HEALTH = 'RECOVER_MNEMONIC_HEALTH'
export const MNEMONIC_RECOVERED_HEALTH = 'MNEMONIC_RECOVERED_HEALTH'
export const DOWNLOADED_SM_SHARES = 'DOWNLOADED_SM_SHARES'
export const REMOVE_SN = 'REMOVE_SN'
export const GET_PDF_DATA = 'GET_PDF_DATA'
export const SET_PDF_INFO = 'SET_PDF_INFO'
export const SHARE_PDF = 'SHARE_PDF'
export const CONFIRM_PDF_SHARED = 'CONFIRM_PDF_SHARED'
export const UPLOAD_SM_SHARE = 'UPLOAD_SM_SHARE'
export const UPDATE_WALLET_IMAGE_HEALTH = 'UPDATE_WALLET_IMAGE_HEALTH'
export const EMPTY_SHARE_TRANSFER_DETAILS = 'EMPTY_SHARE_TRANSFER_DETAILS'
export const SM_META_SHARE_GENERATE = 'SM_META_SHARE_GENERATE'
export const UPLOAD_SUCCESSFULLY_SM = 'UPLOAD_SUCCESSFULLY_SM'
export const DELETE_SM_AND_SMSHARES = 'DELETE_SM_AND_SMSHARES'
export const AUTO_SHARE_LEVEL2_KEEPER = 'AUTO_SHARE_LEVEL2_KEEPER'
export const INIT_NEW_BHR = 'INIT_NEW_BHR'
export const UPDATE_LEVEL_DATA = 'UPDATE_LEVEL_DATA'
export const KEEPER_PROCESS_STATUS = 'KEEPER_PROCESS_STATUS'
export const PDF_SUCCESSFULLY_CREATED = 'PDF_SUCCESSFULLY_CREATED'
export const SET_LEVEL_TO_NOT_SETUP = 'SET_LEVEL_TO_NOT_SETUP'
export const IS_LEVEL_TO_NOT_SETUP = 'IS_LEVEL_TO_NOT_SETUP'
export const SET_HEALTH_STATUS = 'SET_HEALTH_STATUS'
export const MODIFY_LEVELDATA = 'MODIFY_LEVELDATA'
export const SET_CHANNEL_ASSETS = 'SET_CHANNEL_ASSETS'
export const CREATE_CHANNEL_ASSETS = 'CREATE_CHANNEL_ASSETS'
export const APPROVAL_STATUS = 'APPROVAL_STATUS'
export const DOWNLOAD_SM_SHARE = 'DOWNLOAD_SM_SHARE'
export const CREATE_OR_CHANGE_GUARDIAN = 'CREATE_OR_CHANGE_GUARDIAN'
export const DOWNLOADED_BACKUP_DATA = 'DOWNLOADED_BACKUP_DATA'
export const DOWNLOAD_BACKUP_DATA = 'DOWNLOAD_BACKUP_DATA'
export const SETUP_HEALTH_FOR_RESTORE = 'SETUP_HEALTH_FOR_RESTORE'
export const UPDATE_KEEPER_INFO_TO_CHANNEL = 'UPDATE_KEEPER_INFO_TO_CHANNEL'
export const SET_IS_KEEPER_INFO_UPDATED = 'SET_IS_KEEPER_INFO_UPDATED'
export const ACCEPT_EC_REQUEST = 'ACCEPT_EC_REQUEST'
export const SETUP_PASSWORD = 'SETUP_PASSWORD'
export const SETUP_LEVEL_HEALTH = 'SETUP_LEVEL_HEALTH'
export const GENERATE_LEVEL1_SHARES = 'GENERATE_LEVEL1_SHARES'
export const GENERATE_LEVEL2_SHARES = 'GENERATE_LEVEL2_SHARES'
export const RETRIEVE_METASHRES = 'RETRIEVE_METASHRES'
export const SET_SECONDARY_DATA_INFO_STATUS = 'SET_SECONDARY_DATA_INFO_STATUS'
export const REJECTED_EC_REQUEST = 'REJECTED_EC_REQUEST'
export const RECOVER_WALLET_WITHOUT_ICLOUD = 'RECOVER_WALLET_WITHOUT_ICLOUD'
export const PDF_UPGRADE = 'PDF_UPGRADE'

export const initNewBHRFlow = ( newBHRFlowStarted ) => {
  return {
    type: INIT_NEW_BHR, payload: {
      newBHRFlowStarted
    }
  }
}

export const initHealthCheck = () => {
  return {
    type: INIT_HEALTH_CHECK
  }
}

export const initializeHealthSetup = () => {
  return {
    type: INIT_HEALTH_SETUP
  }
}

export const updateHealth = ( health, currentLevel, location ) => {
  return {
    type: HEALTH_UPDATE, payload: {
      health, currentLevel, location
    }
  }
}

export const healthInitialize = () => {
  return {
    type: HEALTH_CHECK_INITIALIZE
  }
}

export const recoverWalletUsingIcloud = ( icloudData, answer, selectedBackup? ) => {
  return {
    type: RECOVER_WALLET_USING_ICLOUD, payload: {
      icloudData, selectedBackup, answer
    }
  }
}

export const healthInitialized = () => {
  return {
    type: HEALTH_CHECK_INITIALIZED_KEEPER
  }
}

export const switchS3LoadingStatus = ( beingLoaded ) => {
  return {
    type: S3_LOADING_STATUS, payload: {
      beingLoaded
    }
  }
}

export const walletRecoveryFailed = ( isFailed ) => {
  return {
    type: WALLET_RECOVERY_FAILED_HEALTH, payload: {
      isFailed
    }
  }
}

export const healthCheckInitialized = () => {
  return {
    type: HEALTH_CHECK_INITIALIZED_KEEPER
  }
}

export const prepareMShares = () => {
  return {
    type: PREPARE_MSHARES
  }
}

export const ErrorSending = ( isFailed ) => {
  return {
    type: ERROR_SENDING, payload: {
      isFailed
    }
  }
}

export const updateMSharesHealth = ( shares, isNeedToUpdateCurrentLevel? ) => {
  return {
    type: UPDATE_SHARES_HEALTH, payload: {
      shares, isNeedToUpdateCurrentLevel
    }
  }
}

export const updateWalletImageHealth = ( payload: {
  updateContacts?: boolean,
  updateVersion?: boolean,
  updateSmShare?: boolean,
  update2fa?: boolean,
  updateAccounts?: boolean,
  accountIds?: string[],
  updateGifts?: boolean,
  giftIds?: string[]
} ) => {
  return {
    type: UPDATE_WALLET_IMAGE_HEALTH,
    payload
  }
}

export const walletImageChecked = ( checked ) => {
  return {
    type: WALLET_IMAGE_HEALTH_CHECKED, payload: {
      checked
    }
  }
}

export const generateMetaShare = ( level, isUpgrade? ) => {
  return {
    type: GENERATE_META_SHARE, payload: {
      level, isUpgrade
    }
  }
}

export const updateMetaSharesKeeper = ( metaSharesKeeper: MetaShare[] ) => {
  return {
    type: UPDATE_META_SHARES_KEEPER,
    payload: {
      metaSharesKeeper
    }
  }
}

export const updateOldMetaSharesKeeper = ( oldMetaSharesKeeper: MetaShare[] ) => {
  return {
    type: UPDATE_OLD_META_SHARES_KEEPER,
    payload: {
      oldMetaSharesKeeper
    }
  }
}

export const sharesGenerated = ( shares ) => {
  return {
    type: MSHARES, payload: {
      shares
    }
  }
}

export const updateLevelTwoMetaShareStatus = ( beingLoaded ) => {
  return {
    type: IS_LEVEL_TWO_METASHARE, payload: {
      beingLoaded
    }
  }
}

export const updateLevelThreeMetaShareStatus = ( beingLoaded ) => {
  return {
    type: IS_LEVEL_THREE_METASHARE, payload: {
      beingLoaded
    }
  }
}

export const initLevelTwo = ( level ) => {
  return {
    type: INIT_LEVEL_TWO, payload: {
      level
    }
  }
}

export const isLevel2InitializedStatus = () => {
  return {
    type: IS_LEVEL2_INITIALIZED
  }
}

export const isLevel3InitializedStatus = () => {
  return {
    type: IS_LEVEL3_INITIALIZED
  }
}

export const updatedKeeperInfo = ( keeperData ) =>{
  return {
    type: KEEPER_INFO, payload: {
      keeperData
    }
  }
}

export const putKeeperInfo = ( info ) =>{
  return {
    type: PUT_KEEPER_INFO, payload: {
      info
    }
  }
}

export const ErrorReceiving = ( isFailed ) => {
  return {
    type: ERROR_RECEIVING_HEALTH, payload: {
      isFailed
    }
  }
}

export const recoverWallet = ( payload: { level: number, answer: string, selectedBackup: cloudDataInterface, image: NewWalletImage, primaryMnemonic?: string, secondaryMnemonics?: string, shares?: {
  primaryData?: PrimaryStreamData;
  backupData?: BackupStreamData;
  secondaryData?: SecondaryStreamData;
}[], isWithoutCloud?: boolean } ) => {
  return {
    type: RECOVER_WALLET_HEALTH, payload: payload
  }
}

export const updateCloudMShare = ( metaShare, replaceIndex? ) => {
  return {
    type: CLOUD_MSHARE, payload: {
      metaShare, replaceIndex
    }
  }
}

export const switchS3LoaderKeeper = ( beingLoaded ) => {
  return {
    type: S3_LOADING_KEEPER, payload: {
      beingLoaded
    }
  }
}

export const pdfGenerated = ( generated: Boolean ) => {
  return {
    type: PDF_GENERATED,
    payload: {
      generated
    },
  }
}

export const uploadPdfShare = (
  selectedShareId,
  isReshare,
) => {
  return {
    type: UPLOAD_PDF_SHARE,
    payload: {
      selectedShareId, isReshare
    },
  }
}

export const secondaryShareDownloaded = ( metaShare ) => {
  return {
    type: DOWNLOADED_SM_SHARES,
    payload: {
      metaShare
    },
  }
}

export const recoverMmnemonic = ( metaShares, securityAns, isPrimary? ) => {
  return {
    type: RECOVER_MNEMONIC_HEALTH, payload: {
      metaShares, securityAns, isPrimary
    }
  }
}


export const removeSecondaryMnemonic = () => {
  return {
    type: REMOVE_SN
  }
}

export const mnemonicRecoveredHealth = ( mnemonic ) => {
  return {
    type: MNEMONIC_RECOVERED_HEALTH, payload: {
      mnemonic
    }
  }
}

export const autoShareToLevel2Keepers = ( ) => {
  return {
    type: AUTO_SHARE_LEVEL2_KEEPER,
  }
}

export const getPDFData = ( shareId, Contact, channelKey, isChange? ) => {
  return {
    type: GET_PDF_DATA,
    payload: {
      shareId,
      Contact,
      channelKey,
      isChange,
    },
  }
}

export const setPDFInfo = ( data ) => {
  return {
    type: SET_PDF_INFO,
    payload: {
      data
    },
  }
}

export const sharePDF = (
  shareVia: string,
  isEmailOtherOptions,
) => {
  return {
    type: SHARE_PDF,
    payload: {
      shareVia, isEmailOtherOptions
    },
  }
}

export const confirmPDFShared = (
  shareId: string,
  scannedData: string
) => {
  return {
    type: CONFIRM_PDF_SHARED,
    payload: {
      shareId,
      scannedData
    },
  }
}

export const uploadSMShare = (
  encryptedKey, otp
) => {
  return {
    type: UPLOAD_SM_SHARE,
    payload: {
      encryptedKey, otp
    },
  }
}

export const emptyShareTransferDetailsForContactChange = ( index ) => {
  return {
    type: EMPTY_SHARE_TRANSFER_DETAILS, payload: {
      index
    }
  }
}

export const isSmMetaSharesCreated = () => {
  return {
    type: SM_META_SHARE_GENERATE
  }
}

export const UploadSMSuccessfully = ( isUploaded ) => {
  return {
    type: UPLOAD_SUCCESSFULLY_SM, payload: {
      isUploaded
    }
  }
}

export const deletePrivateData = () => {
  return {
    type: DELETE_SM_AND_SMSHARES
  }
}

export const updateCloudPermission = ( cloudPermissionGranted ) => {
  return {
    type: UPDATE_CLOUD_PERMISSION, payload: {
      cloudPermissionGranted
    }
  }
}

export const updateLevelData = ( levelData, shieldHealth ) =>{
  return {
    type: UPDATE_LEVEL_DATA, payload: {
      levelData, shieldHealth
    }
  }
}

export const keeperProcessStatus = ( status ) =>{
  return {
    type: KEEPER_PROCESS_STATUS, payload: {
      status
    }
  }
}

export const pdfSuccessfullyCreated = ( status ) =>{
  return {
    type: PDF_SUCCESSFULLY_CREATED, payload: {
      status
    }
  }
}

export const setLevelToNotSetupStatus = ( ) => {
  console.log( 'SET_LEVEL_TO_NOT_SETUP' )
  return {
    type: SET_LEVEL_TO_NOT_SETUP
  }
}

export const setIsLevelToNotSetupStatus = ( status ) =>{
  console.log( 'IS_LEVEL_TO_NOT_SETUP' )
  return {
    type: IS_LEVEL_TO_NOT_SETUP, payload: {
      status
    }
  }
}

export const setHealthStatus = ( ) =>{
  return {
    type: SET_HEALTH_STATUS
  }
}

export const modifyLevelData = ( levelHealth?: LevelHealthInterface[], currentLevel?: number ) =>{
  return {
    type: MODIFY_LEVELDATA, payload: {
      levelHealth, currentLevel
    }
  }
}

export const setChannelAssets = ( channelAssets, secondaryShareDownloaded ) => {
  return {
    type: SET_CHANNEL_ASSETS, payload: {
      channelAssets, secondaryShareDownloaded
    }
  }
}

export const createChannelAssets = ( shareId ) => {
  return {
    type: CREATE_CHANNEL_ASSETS, payload: {
      shareId
    }
  }
}

export const setApprovalStatus = ( flag ) => {
  return {
    type: APPROVAL_STATUS, payload: {
      flag
    }
  }
}

export const downloadSMShare = ( scannedData ) => {
  return {
    type: DOWNLOAD_SM_SHARE, payload: {
      scannedData
    }
  }
}

export const createOrChangeGuardian = ( payload: {channelKey: string, shareId: string, contact: any, index: number, isChange?: boolean, oldChannelKey?: string, existingContact?: boolean, isPrimaryKeeper?: boolean} ) => {
  return {
    type: CREATE_OR_CHANGE_GUARDIAN, payload: payload
  }
}

export const setDownloadedBackupData = ( downloadedBackupData ) => {
  return {
    type: DOWNLOADED_BACKUP_DATA, payload: {
      downloadedBackupData
    }
  }
}

export const downloadBackupData = ( { scannedData, backupData }: { scannedData?: any, backupData?: any } ) => {
  return {
    type: DOWNLOAD_BACKUP_DATA, payload: {
      scannedData, backupData
    }
  }
}

export const setupHealth = ( level ) => {
  return {
    type: SETUP_HEALTH_FOR_RESTORE, payload: {
      level
    }
  }
}

export const updateKeeperInfoToChannel = ( ) => {
  return {
    type: UPDATE_KEEPER_INFO_TO_CHANNEL
  }
}

export const setIsKeeperInfoUpdated = ( payload: {
  isKeeperInfoUpdated2?: boolean;
  isKeeperInfoUpdated3?: boolean;
} ) => {
  return {
    type: SET_IS_KEEPER_INFO_UPDATED, payload
  }
}

export const acceptExistingContactRequest = ( channelKey, contactsSecondaryChannelKey ) => {
  return {
    type: ACCEPT_EC_REQUEST, payload:{
      channelKey, contactsSecondaryChannelKey
    }
  }
}

export const setupPassword = ( security ) => {
  return {
    type: SETUP_PASSWORD, payload:{
      security
    }
  }
}

export const generateLevel1Shares = ( security ) => {
  return {
    type: GENERATE_LEVEL1_SHARES, payload:{
      security
    }
  }
}

export const generateLevel2Shares = ( security ) => {
  return {
    type: GENERATE_LEVEL2_SHARES, payload:{
      security
    }
  }
}

export const retrieveMetaShares = ( shares ) => {
  return {
    type: RETRIEVE_METASHRES, payload: {
      shares
    }
  }
}

export const ON_PRESS_KEEPER = 'ON_PRESS_KEEPER'
export const LEVEL_COMPLETION_ERROR= 'LEVEL_COMPLETION_ERROR'
export const NAVIGATING_HISTORY_PAGE = 'NAVIGATING_HISTORY_PAGE'
export const TYPE_BOTTOMSHEET_OPEN = 'TYPE_BOTTOMSHEET_OPEN'
export const ALLOW_SECURE_ACCOUNT = 'ALLOW_SECURE_ACCOUNT'
export const UPDATE_SECONDARY_SHARD = 'UPDATE_SECONDARY_SHARD'
export const OPEN_CLOSE_APPROVAL = 'OPEN_CLOSE_APPROVAL'
export const GET_APPROVAL_FROM_KEEPER = 'GET_APPROVAL_FROM_KEEPER'
export const CHANGE_QUESTION_ANSWER = 'CHANGE_QUESTION_ANSWER'
export const SET_IS_CURRENT_LEVEL0 = 'SET_IS_CURRENT_LEVEL0'
export const UPGRADE_PDF = 'UPGRADE_PDF'
export const UPGRADE_LEVEL1_KEEPER = 'UPGRADE_LEVEL1_KEEPER'

export const onPressKeeper = ( value, number ) => {
  return {
    type: ON_PRESS_KEEPER,
    payload:{
      value, number
    }
  }
}

export const setLevelCompletionError = ( errorTitle, errorInfo, status ) => {
  return {
    type: LEVEL_COMPLETION_ERROR,
    payload: {
      errorTitle, errorInfo, status
    }
  }
}


export const navigateToHistoryPage = ( navigationObj ) => {
  return {
    type: NAVIGATING_HISTORY_PAGE,
    payload: {
      navigationObj
    }
  }
}


export const setIsKeeperTypeBottomSheetOpen = ( isTypeBottomSheetOpen ) => {
  return {
    type: TYPE_BOTTOMSHEET_OPEN,
    payload: {
      isTypeBottomSheetOpen
    }
  }
}

export const setAllowSecureAccount = ( flag ) => {
  return {
    type: ALLOW_SECURE_ACCOUNT,
    payload: {
      flag
    }
  }
}

export const updateSecondaryShard = ( scannedData ) => {
  return {
    type: UPDATE_SECONDARY_SHARD,
    payload: {
      scannedData
    }
  }
}

export const setOpenToApproval = ( flag, availableKeepers, contactData ) => {
  return {
    type: OPEN_CLOSE_APPROVAL, payload: {
      flag, availableKeepers, contactData
    }
  }
}

export const getApprovalFromKeepers = ( flag, contact ) => {
  return {
    type: GET_APPROVAL_FROM_KEEPER, payload: {
      flag, contact
    }
  }
}

export const setSecondaryDataInfoStatus = ( flag ) =>{
  return {
    type: SET_SECONDARY_DATA_INFO_STATUS, payload: {
      flag
    }
  }
}

export const rejectedExistingContactRequest = ( channelKey ) => {
  return {
    type: REJECTED_EC_REQUEST, payload: {
      channelKey
    }
  }
}

export const changeQuestionAnswer = ( questionId, question, answer ) => {
  return {
    type: CHANGE_QUESTION_ANSWER, payload: {
      questionId, question, answer
    }
  }
}

export const setIsCurrentLevel0 = ( flag ) => {
  return {
    type: SET_IS_CURRENT_LEVEL0, payload: {
      flag
    }
  }
}

export const restoreWithoutUsingIcloud = ( backupData, answer ) => {
  return {
    type: RECOVER_WALLET_WITHOUT_ICLOUD, payload: {
      backupData, answer
    }
  }
}

export const setPdfUpgrade = ( flag ) => {
  return {
    type: PDF_UPGRADE, payload: {
      flag
    }
  }
}

export const upgradePDF = ( ) => {
  return {
    type: UPGRADE_PDF
  }
}

export const upgradeLevelOneKeeper = ( ) => {
  return {
    type: UPGRADE_LEVEL1_KEEPER
  }
}
