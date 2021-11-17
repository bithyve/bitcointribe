// types and action creators: dispatched by components and sagas

import { share } from 'secrets.js-grempe'
import S3Service from '../../bitcoin/services/sss/S3Service'
import { EphemeralDataElements, WalletImage } from '../../bitcoin/utilities/Interface'
import { MetaShare } from '../../bitcoin/utilities/Interface'

export const INIT_HEALTH_SETUP = 'INIT_HEALTH_SETUP'
export const HEALTH_UPDATE = 'HEALTH_UPDATE'
export const HEALTH_CHECK_INITIALIZED_KEEPER = 'HEALTH_CHECK_INITIALIZED_KEEPER'
export const HEALTH_CHECK_INITIALIZE = 'HEALTH_CHECK_INITIALIZE'
export const INIT_HEALTH_CHECK = 'INIT_HEALTH_CHECK'
export const S3_LOADING_STATUS = 'S3_LOADING_STATUS'
export const INIT_LOADING_STATUS = 'INIT_LOADING_STATUS'
export const PREPARE_MSHARES = 'PREPARE_MSHARES'
export const UPDATE_HEALTH = 'UPDATE_HEALTH'
export const GET_HEALTH_OBJECT = 'GET_HEALTH_OBJECT'
export const CHECK_SHARES_HEALTH = 'CHECK_SHARES_HEALTH'
export const ERROR_SENDING = 'ERROR_SENDING'
export const UPDATE_SHARES_HEALTH = 'UPDATE_SHARES_HEALTH'
export const UPDATE_MSHARE_LOADING_STATUS = 'UPDATE_MSHARE_LOADING_STATUS'
export const GENERATE_META_SHARE = 'GENERATE_META_SHARE'
export const MSHARES = 'MSHARES'
export const CREATE_N_UPLOAD_ON_EF_CHANNEL = 'CREATE_N_UPLOAD_ON_EF_CHANNEL'
export const UPDATE_EFCHANNEL_LOADING_STATUS = 'UPDATE_EFCHANNEL_LOADING_STATUS'
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
export const DOWNLOAD_SHARES = 'DOWNLOAD_SHARED'
export const DOWNLOAD_MSHARE_HEALTH = 'DOWNLOAD_MSHARE_HEALTH'
export const SHARE_RECEIVED = 'SHARE_RECEIVED'
export const DOWNLOADED_MSHARE_HEALTH = 'DOWNLOADED_MSHARE_HEALTH'
export const ERROR_RECEIVING_HEALTH = 'ERROR_RECEIVING_HEALTH'
export const FETCH_WALLET_IMAGE_HEALTH = 'FETCH_WALLET_IMAGE_HEALTH'
export const RECOVER_WALLET_HEALTH = 'RECOVER_WALLET_HEALTH'
export const CLOUD_MSHARE = 'CLOUD_MSHARE'
export const S3_LOADING_KEEPER = 'S3_LOADING_KEEPER'
export const UPLOAD_ENC_MSHARE_KEEPER = 'UPLOAD_ENC_MSHARE_KEEPER'
export const SEND_APPROVAL_REQUEST = 'SEND_APPROVAL_REQUEST'
export const UPLOAD_SECONDARY_SHARE = 'UPLOAD_SECONDARY_SHARE'
export const GENERATE_PDF = 'GENERATE_PDF'
export const PDF_GENERATED = 'PDF_GENERATED'
export const ON_APPROVAL_STATUS_CHANGE = 'ON_APPROVAL_STATUS_CHANGE'
export const UPLOAD_PDF_SHARE = 'UPLOAD_PDF_SHARE'
export const RECOVER_MNEMONIC_HEALTH = 'RECOVER_MNEMONIC_HEALTH'
export const MNEMONIC_RECOVERED_HEALTH = 'MNEMONIC_RECOVERED_HEALTH'
export const DOWNLOAD_SM_SHARES = 'DOWNLOAD_SM_SHARES'
export const DOWNLOADED_SM_SHARES = 'DOWNLOADED_SM_SHARES'
export const REMOVE_SN = 'REMOVE_SN'
export const RESHARE_WITH_SAME_KEEPER = 'RESHARE_WITH_SAME_KEEPER'
export const AUTO_SHARE_CONTACT = 'AUTO_SHARE_CONTACT'
export const AUTO_DOWNLOAD_SHARE_CONTACT = 'AUTO_DOWNLOAD_SHARE_CONTACT'
export const GET_PDF_DATA = 'GET_PDF_DATA'
export const SET_PDF_INFO = 'SET_PDF_INFO'
export const SHARE_PDF = 'SHARE_PDF'
export const CONFIRM_PDF_SHARED = 'CONFIRM_PDF_SHARED'
export const DOWNLOAD_PDFSHARE_HEALTH = 'DOWNLOAD_PDFSHARE_HEALTH'
export const DOWNLOADED_PDFSHARE_HEALTH = 'DOWNLOADED_PDFSHARE_HEALTH'
export const UPLOAD_SM_SHARE = 'UPLOAD_SM_SHARE'
export const UPDATE_WALLET_IMAGE_HEALTH = 'UPDATE_WALLET_IMAGE_HEALTH'
export const EMPTY_SHARE_TRANSFER_DETAILS = 'EMPTY_SHARE_TRANSFER_DETAILS'
export const REMOVE_UNWANTED_UNDER_CUSTODY = 'REMOVE_UNWANTED_UNDER_CUSTODY'
export const UPLOAD_SM_SHARE_FOR_PK = 'UPLOAD_SM_SHARE_FOR_PK'
export const GENERATE_SM_META_SHARE = 'GENERATE_SM_META_SHARE'
export const SM_META_SHARE_GENERATE = 'SM_META_SHARE_GENERATE'
export const UPLOAD_SMSHARE_KEEPER = 'UPLOAD_SMSHARE_KEEPER'
export const UPLOAD_REQUESTED_SMSHARE = 'UPLOAD_REQUESTED_SMSHARE'
export const UPLOAD_SUCCESSFULLY_SM = 'UPLOAD_SUCCESSFULLY_SM'
export const DELETE_SM_AND_SMSHARES = 'DELETE_SM_AND_SMSHARES'
export const UPDATE_KEEPERINFO_TO_TC = 'UPDATE_KEEPERINFO_TO_TC'
export const UPDATE_KEEPERINFO_UNDER_CUSTODY = 'UPDATE_KEEPERINFO_UNDER_CUSTODY'
export const AUTO_SHARE_LEVEL2_KEEPER = 'AUTO_SHARE_LEVEL2_KEEPER'
export const DOWNLOAD_SMSHARE_FOR_APPROVAL = 'DOWNLOAD_SMSHARE_FOR_APPROVAL'
export const INIT_NEW_BHR = 'INIT_NEW_BHR'
export const UPDATE_LEVEL_DATA = 'UPDATE_LEVEL_DATA'
export const KEEPER_PROCESS_STATUS = 'KEEPER_PROCESS_STATUS'
export const PDF_SUCCESSFULLY_CREATED = 'PDF_SUCCESSFULLY_CREATED'
export const SET_LEVEL_TO_NOT_SETUP = 'SET_LEVEL_TO_NOT_SETUP'
export const IS_LEVEL_TO_NOT_SETUP = 'IS_LEVEL_TO_NOT_SETUP'
export const SET_HEALTH_STATUS = 'SET_HEALTH_STATUS'

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

export const updateHealth = ( health, currentLevel ) => {
  return {
    type: HEALTH_UPDATE, payload: {
      health, currentLevel
    }
  }
}

export const healthInitialize = () => {
  return {
    type: HEALTH_CHECK_INITIALIZE
  }
}

export const recoverWalletUsingIcloud = ( icloudData ) => {
  return {
    type: RECOVER_WALLET_USING_ICLOUD, payload: {
      icloudData
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

export const initLoader = ( beingLoaded ) => {
  return {
    type: INIT_LOADING_STATUS, payload: {
      beingLoaded
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

export const getHealth = () => {
  return {
    type: GET_HEALTH_OBJECT
  }
}

export const checkMSharesHealth = () => {
  return {
    type: CHECK_SHARES_HEALTH
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

export const updateWalletImageHealth = () => {
  return {
    type: UPDATE_WALLET_IMAGE_HEALTH
  }
}

export const walletImageChecked = ( checked ) => {
  return {
    type: WALLET_IMAGE_HEALTH_CHECKED, payload: {
      checked
    }
  }
}

export const updateMSharesLoader = ( beingLoaded ) => {
  return {
    type: UPDATE_MSHARE_LOADING_STATUS, payload: {
      beingLoaded
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

export const sharesGenerated = ( shares ) => {
  return {
    type: MSHARES, payload: {
      shares
    }
  }
}

export const downloadShares = ( encryptedKey ) => {
  return {
    type: DOWNLOAD_SHARES, payload: {
      encryptedKey
    }
  }
}

export const shareReceived = ( metaShare ) => {
  return {
    type: SHARE_RECEIVED, payload: {
      metaShare
    }
  }
}

export const createAndUploadOnEFChannel = (
  scannedData,
  featuresList,
  isPrimaryKeeper,
  selectedShareId,
  share,
  type,
  isReshare,
  level,
  isChange?
) => {
  return {
    type: CREATE_N_UPLOAD_ON_EF_CHANNEL,
    payload: {
      scannedData, featuresList, isPrimaryKeeper, selectedShareId, share, type, isReshare, level, isChange
    },
  }
}

export const updateEFChannelLoader = ( beingLoaded ) => {
  return {
    type: UPDATE_EFCHANNEL_LOADING_STATUS, payload: {
      beingLoaded
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

export const downloadMShare = (
  payload: {
    encryptedKey: string;
    otp?: string;
    downloadType?: string;
    replaceIndex?: any;
    walletName?: string;
  }
) => {
  const { otp, encryptedKey, downloadType, replaceIndex, walletName } = payload
  return {
    type: DOWNLOAD_MSHARE_HEALTH,
    payload: {
      otp, encryptedKey, downloadType, replaceIndex, walletName
    },
  }
}

export const downloadPdfShare = (
  payload: {
    encryptedKey: string;
    otp: string;
    downloadType?: string;
    replaceIndex?: string;
  }
) => {
  const { otp, encryptedKey, downloadType, replaceIndex } = payload
  console.log( 'INSIDE action', otp, encryptedKey, downloadType, replaceIndex )
  return {
    type: DOWNLOAD_PDFSHARE_HEALTH,
    payload: {
      otp, encryptedKey, downloadType, replaceIndex
    },
  }
}

export const downloadedPdfShare = ( otp, status, err? ) => {
  return {
    type: DOWNLOADED_PDFSHARE_HEALTH, payload: {
      otp, status, err
    }
  }
}

export const downloadedMShare = ( otp, status, err? ) => {
  return {
    type: DOWNLOADED_MSHARE_HEALTH, payload: {
      otp, status, err
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

export const recoverWallet = ( level?, keeperData?, decryptedCloudDataJson? ) => {
  return {
    type: RECOVER_WALLET_HEALTH, payload: {
      level, keeperData, decryptedCloudDataJson
    }
  }
}

export const fetchWalletImage = (  s3Service: S3Service, WI?: WalletImage ) => {
  return {
    type: FETCH_WALLET_IMAGE_HEALTH, payload: {
      s3Service, WI
    }
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

export const uploadEncMShareKeeper = (
  index: number,
  shareId: string,
  contactInfo: { contactName: string; info: string },
  data: EphemeralDataElements,
  changingGuardian?: boolean,
  previousGuardianName?: string,
) => {
  console.log( 'uploadEncMShareKeeper' )
  return {
    type: UPLOAD_ENC_MSHARE_KEEPER,
    payload: {
      index,
      shareId,
      contactInfo,
      data,
      changingGuardian,
      previousGuardianName,
    },
  }
}

export const sendApprovalRequest = ( shareID, PkShareId, notificationType ) => {
  return {
    type: SEND_APPROVAL_REQUEST, payload: {
      shareID, PkShareId, notificationType
    }
  }
}

export const uploadSecondaryShare = () => {
  return {
    type: UPLOAD_SECONDARY_SHARE
  }
}

export const generatePDF = () => {
  return {
    type: GENERATE_PDF
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

export const onApprovalStatusChange = ( payload: {
  status: boolean;
  initiatedAt: any;
  shareId: string;
  secondaryShare?: MetaShare
  transferDetails?: {key: string; otp: string};
} ) => {
  const { status, initiatedAt, shareId, secondaryShare, transferDetails } = payload
  return {
    type: ON_APPROVAL_STATUS_CHANGE, payload: {
      status, initiatedAt, shareId, secondaryShare, transferDetails
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

export const downloadSMShard = ( encryptedKey: string,
  otp?: string ) => {
  return {
    type: DOWNLOAD_SM_SHARES,
    payload: {
      encryptedKey, otp
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

export const recoverMmnemonic = ( metaShares, securityAns ) => {
  return {
    type: RECOVER_MNEMONIC_HEALTH, payload: {
      metaShares, securityAns
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
export const reShareWithSameKeeper = (
  deviceLevelInfo,
) => {
  return {
    type: RESHARE_WITH_SAME_KEEPER,
    payload: {
      deviceLevelInfo
    },
  }
}

export const autoShareContact = (
  contactLevelInfo,
) => {
  return {
    type: AUTO_SHARE_CONTACT,
    payload: {
      contactLevelInfo
    },
  }
}

export const autoShareToLevel2Keepers = (
  levelHealth
) => {
  return {
    type: AUTO_SHARE_LEVEL2_KEEPER,
    payload: {
      levelHealth
    },
  }
}

export const autoDownloadShareContact = (
  shareId,
  walletId
) => {
  return {
    type: AUTO_DOWNLOAD_SHARE_CONTACT,
    payload: {
      shareId, walletId
    },
  }
}


export const getPDFData = ( shareId, isReShare ) => {
  return {
    type: GET_PDF_DATA,
    payload: {
      shareId,
      isReShare
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

export const removeUnwantedUnderCustodyShares = () => {
  return {
    type: REMOVE_UNWANTED_UNDER_CUSTODY
  }
}

export const uploadSecondaryShareForPK = ( tag, encryptedKey, otp? ) => {
  return {
    type: UPLOAD_SM_SHARE_FOR_PK, payload: {
      tag, encryptedKey, otp
    }
  }
}

export const generateSMMetaShares = ( SM? ) => {
  return {
    type: GENERATE_SM_META_SHARE,
    payload: {
      SM
    }
  }
}

export const isSmMetaSharesCreated = () => {
  return {
    type: SM_META_SHARE_GENERATE
  }
}

export const uploadSMShareKeeper = (
  index: number,
) => {
  return {
    type: UPLOAD_SMSHARE_KEEPER,
    payload: {
      index,
    },
  }
}

export const uploadRequestedSMShare = ( tag, encryptedKey, otp? ) => {
  return {
    type: UPLOAD_REQUESTED_SMSHARE, payload: {
      tag, encryptedKey, otp
    }
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

export const updateKeeperInfoToTrustedChannel = () => {
  return {
    type: UPDATE_KEEPERINFO_TO_TC
  }
}

export const updateKeeperInfoToUnderCustody = ( walletName, walletId ) => {
  return {
    type: UPDATE_KEEPERINFO_UNDER_CUSTODY, payload: {
      walletName, walletId
    }
  }
}

export const downloadSmShareForApproval = ( qrData ) =>{
  return {
    type: DOWNLOAD_SMSHARE_FOR_APPROVAL, payload: {
      qrData
    }
  }
}

export const updateCloudPermission = ( cloudPermissionGranted ) => {
  return {
    type: UPDATE_CLOUD_PERMISSION, payload: {
      cloudPermissionGranted
    }
  }
}

export const updateLevelData = ( levelData ) =>{
  return {
    type: UPDATE_LEVEL_DATA, payload: {
      levelData
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
