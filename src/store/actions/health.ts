// types and action creators: dispatched by components and sagas

import { share } from "secrets.js-grempe";
import { EphemeralDataElements } from "../../bitcoin/utilities/Interface";

export const INIT_HEALTH_SETUP = 'INIT_HEALTH_SETUP';
export const HEALTH_UPDATE = 'HEALTH_UPDATE';
export const HEALTH_CHECK_INITIALIZED = 'HEALTH_CHECK_INITIALIZED';
export const HEALTH_CHECK_INITIALIZE = 'HEALTH_CHECK_INITIALIZE';
export const INIT_HEALTH_CHECK = 'INIT_HEALTH_CHECK';
export const S3_LOADING_STATUS = 'S3_LOADING_STATUS';
export const INIT_LOADING_STATUS = 'INIT_LOADING_STATUS';
export const PREPARE_MSHARES = 'PREPARE_MSHARES';
export const UPDATE_HEALTH = 'UPDATE_HEALTH';
export const GET_HEALTH_OBJECT = 'GET_HEALTH_OBJECT';
export const CHECK_SHARES_HEALTH = 'CHECK_SHARES_HEALTH';
export const ERROR_SENDING = 'ERROR_SENDING';
export const UPDATE_SHARES_HEALTH = 'UPDATE_SHARES_HEALTH';
export const UPDATE_MSHARE_LOADING_STATUS = 'UPDATE_MSHARE_LOADING_STATUS';
export const GENERATE_META_SHARE = 'GENERATE_META_SHARE';
export const MSHARES = 'MSHARES';
export const CREATE_N_UPLOAD_ON_EF_CHANNEL = 'CREATE_N_UPLOAD_ON_EF_CHANNEL';
export const UPDATE_EFCHANNEL_LOADING_STATUS = 'UPDATE_EFCHANNEL_LOADING_STATUS';
export const IS_LEVEL_TWO_METASHARE = 'IS_LEVEL_TWO_METASHARE';  
export const IS_LEVEL_THREE_METASHARE = 'IS_LEVEL_THREE_METASHARE';
export const INIT_LEVEL_TWO = 'INIT_LEVEL_TWO';
export const IS_LEVEL2_INITIALIZED = 'IS_LEVEL2_INITIALIZED';
export const IS_LEVEL3_INITIALIZED = 'IS_LEVEL3_INITIALIZED';
export const KEEPER_INFO = 'KEEPER_INFO';
export const RECOVER_WALLET_USING_ICLOUD = 'RECOVER_WALLET_USING_ICLOUD';
export const WALLET_RECOVERY_FAILED_HEALTH = 'WALLET_RECOVERY_FAILED_HEALTH';
export const WALLET_IMAGE_HEALTH_CHECKED = 'WALLET_IMAGE_HEALTH_CHECKED';
export const DOWNLOAD_SHARES = "DOWNLOAD_SHARED";
export const DOWNLOAD_MSHARE_HEALTH = "DOWNLOAD_MSHARE_HEALTH";
export const SHARE_RECEIVED = "SHARE_RECEIVED";
export const DOWNLOADED_MSHARE_HEALTH = "DOWNLOADED_MSHARE_HEALTH";
export const ERROR_RECEIVING_HEALTH = "ERROR_RECEIVING_HEALTH";
export const FETCH_WALLET_IMAGE_HEALTH = "FETCH_WALLET_IMAGE_HEALTH";
export const RECOVER_WALLET_HEALTH = "RECOVER_WALLET_HEALTH";
export const CLOUD_MSHARE = "CLOUD_MSHARE";
export const S3_LOADING_KEEPER = "S3_LOADING_KEEPER";
export const UPLOAD_ENC_MSHARE_KEEPER = "UPLOAD_ENC_MSHARE_KEEPER";
export const SEND_APPROVAL_REQUEST = 'SEND_APPROVAL_REQUEST';
export const UPLOAD_SECONDARY_SHARE = 'UPLOAD_SECONDARY_SHARE';
export const GENERATE_PDF = "GENERATE_PDF";
export const PDF_GENERATED = "PDF_GENERATED";

export const initHealthCheck = () => {
  return { type: INIT_HEALTH_CHECK };
};

export const initializeHealthSetup = () => {
  return { type: INIT_HEALTH_SETUP };
};

export const updateHealth = (health, currentLevel) => {
  return { type: HEALTH_UPDATE, payload: { health, currentLevel } };
};

export const healthInitialize = () => {
  return { type: HEALTH_CHECK_INITIALIZE };
};

export const recoverWalletUsingIcloud = (icloudData) => {
  return { type: RECOVER_WALLET_USING_ICLOUD, payload: { icloudData } };
};

export const healthInitialized = () => {
  return { type: HEALTH_CHECK_INITIALIZED };
};

export const switchS3LoadingStatus = (beingLoaded) => {
  return { type: S3_LOADING_STATUS, payload: { beingLoaded } };
};

export const walletRecoveryFailed = (isFailed) => {
  return { type: WALLET_RECOVERY_FAILED_HEALTH, payload: { isFailed } };
};

export const initLoader = (beingLoaded) => {
  return { type: INIT_LOADING_STATUS, payload: { beingLoaded } };
};

export const healthCheckInitialized = () => {
  return { type: HEALTH_CHECK_INITIALIZED };
};

export const prepareMShares = () => {
  return { type: PREPARE_MSHARES };
};

export const getHealth = () => {
  return { type: GET_HEALTH_OBJECT };
};

export const checkMSharesHealth = () => {
  return { type: CHECK_SHARES_HEALTH };
};

export const ErrorSending = (isFailed) => {
  return { type: ERROR_SENDING, payload: { isFailed } };
};

export const updateMSharesHealth = (shares) => {
  return { type: UPDATE_SHARES_HEALTH, payload: { shares } };
};

export const walletImageChecked = (checked) => {
  return { type: WALLET_IMAGE_HEALTH_CHECKED, payload: { checked } };
};

export const updateMSharesLoader = (beingLoaded) => {
  return { type: UPDATE_MSHARE_LOADING_STATUS, payload: { beingLoaded } };
};

export const generateMetaShare = (level) => {
  return { type: GENERATE_META_SHARE, payload: { level } };
};

export const sharesGenerated = (shares) => {
  return { type: MSHARES, payload: { shares } };
};

export const downloadShares = (encryptedKey) => {
  return { type: DOWNLOAD_SHARES, payload: { encryptedKey } };
};

export const shareReceived = (metaShare) => {
  return { type: SHARE_RECEIVED, payload: { metaShare } };
};

export const createAndUploadOnEFChannel = (
  scannedData,
  featuresList,
  isPrimaryKeeper,
  selectedShareId,
  share,
  type,
  isReshare,
  level
) => {
  return {
    type: CREATE_N_UPLOAD_ON_EF_CHANNEL,
    payload: { scannedData, featuresList, isPrimaryKeeper, selectedShareId, share, type, isReshare, level },
  };
};

export const updateEFChannelLoader = (beingLoaded) => {
  return { type: UPDATE_EFCHANNEL_LOADING_STATUS, payload: { beingLoaded } };
};

export const updateLevelTwoMetaShareStatus = (beingLoaded) => {
  return { type: IS_LEVEL_TWO_METASHARE, payload: { beingLoaded } };
};

export const updateLevelThreeMetaShareStatus = (beingLoaded) => {
  return { type: IS_LEVEL_THREE_METASHARE, payload: { beingLoaded } };
};

export const initLevelTwo = (level) => {
  return { type: INIT_LEVEL_TWO, payload: { level } };
};

export const isLevel2InitializedStatus = () => {
  return { type: IS_LEVEL2_INITIALIZED };
};

export const isLevel3InitializedStatus = () => {
  return { type: IS_LEVEL3_INITIALIZED };
};

export const updatedKeeperInfo = (info) =>{
  return { type: KEEPER_INFO, payload: { info } };
}

export const downloadMShare = (
  payload: {
    encryptedKey: string;
    otp: string;
    downloadType?: string;
    replaceIndex?: string;
    walletName?: string;
  }
) => {
  let { otp, encryptedKey, downloadType, replaceIndex, walletName } = payload;
  return {
    type: DOWNLOAD_MSHARE_HEALTH,
    payload: { otp, encryptedKey, downloadType, replaceIndex, walletName },
  };
};

export const downloadedMShare = (otp, status, err?) => {
  return { type: DOWNLOADED_MSHARE_HEALTH, payload: { otp, status, err } };
};

export const ErrorReceiving = (isFailed) => {
  return { type: ERROR_RECEIVING_HEALTH, payload: { isFailed } };
};

export const recoverWallet = (level?) => {
  return { type: RECOVER_WALLET_HEALTH, payload: {level} };
};

export const fetchWalletImage = () => {
  return { type: FETCH_WALLET_IMAGE_HEALTH };
};

export const updateCloudMShare = (metaShare, replaceIndex?) => {
  return { type: CLOUD_MSHARE, payload: { metaShare, replaceIndex } };
};

export const switchS3LoaderKeeper = (beingLoaded) => {
  // console.log("Called s3 Loading", new Date())
  return { type: S3_LOADING_KEEPER, payload: { beingLoaded } };
};

export const uploadEncMShareKeeper = (
  shareId: string,
  contactInfo: { contactName: string; info: string },
  data: EphemeralDataElements,
  changingGuardian?: boolean,
  previousGuardianName?: string,
) => {
  return {
    type: UPLOAD_ENC_MSHARE_KEEPER,
    payload: {
      shareId,
      contactInfo,
      data,
      changingGuardian,
      previousGuardianName,
    },
  };
};

export const sendApprovalRequest = (shareID, PkShareId) => {
  return { type: SEND_APPROVAL_REQUEST, payload: { shareID, PkShareId } };
};

export const uploadSecondaryShare = () => {
  return { type: UPLOAD_SECONDARY_SHARE };
}

export const generatePDF = () => {
  return {
    type: GENERATE_PDF
  };
};

export const pdfGenerated = (generated: Boolean) => {
  return {
    type: PDF_GENERATED,
    payload: { generated },
  };
};