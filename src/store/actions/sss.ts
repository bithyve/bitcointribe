// types and action creators: dispatched by components and sagas

import { EphemeralData, WalletImage } from '../../bitcoin/utilities/Interface';

export const INIT_HEALTH_CHECK = 'INIT_HEALTH_CHECK';
export const PREPARE_MSHARES = 'PREPARE_MSHARES';
export const UPLOAD_ENC_MSHARE = 'UPLOAD_ENC_MSHARES';
export const UPLOAD_REQUESTED_SHARE = 'UPLOAD_REQUESTED_SHARE';
export const DOWNLOAD_MSHARE = 'DOWNLOAD_MSHARE';
export const GENERATE_PERSONAL_COPIES = 'GENERATE_PERSONAL_COPIES';
export const UPDATE_MSHARES_HEALTH = 'UPDATE_MSHARES_HEALTH';
export const CHECK_MSHARES_HEALTH = 'CHECK_MSHARES_HEALTH';
export const REQUEST_SHARE = 'REQUEST_SHARE';
export const UPDATE_DYNAMINC_NONPMDD = 'UPDATE_DYNAMINC_NONPMDD';
export const DOWNLOAD_DYNAMIC_NONPMDD = 'DOWNLOAD_DYNAMIC_NONPMDD';
export const RESTORE_DYNAMIC_NONPMDD = 'RESTORE_DYNAMIC_NONPMDD';
export const RECOVER_MNEMONIC = 'RECOVER_MNEMONIC';
export const RECOVER_WALLET = 'RECOVER_WALLET';
export const RESET_REQUESTED_SHARE_UPLOADS = 'RESET_REQUESTED_SHARE_UPLOADS';
export const OVERALL_HEALTH = 'OVERALL_HEALTH';
export const CHECK_PDF_HEALTH = 'CHECK_PDF_HEALTH';
export const RESTORE_SHARE_FROM_QR = 'RESTORE_SHARE_FROM_QR';
export const UPDATE_WALLET_IMAGE = 'UPDATE_WALLET_IMAGE';
export const FETCH_WALLET_IMAGE = 'FETCH_WALLET_IMAGE';
export const ERROR_SENDING = 'ERROR_SENDING';
export const ERROR_RECEIVING = 'ERROR_RECEIVING';

export const initHealthCheck = () => {
  return { type: INIT_HEALTH_CHECK };
};

export const prepareMShares = () => {
  return { type: PREPARE_MSHARES };
};

export const uploadEncMShare = (
  shareIndex: number,
  contactName: string,
  data: EphemeralData,
  changingGuardian?: boolean,
) => {
  return {
    type: UPLOAD_ENC_MSHARE,
    payload: {
      shareIndex,
      contactName,
      data,
      changingGuardian,
    },
  };
};

export const uploadRequestedShare = (tag, encryptedKey, otp?) => {
  return { type: UPLOAD_REQUESTED_SHARE, payload: { tag, encryptedKey, otp } };
};

export const downloadMShare = (encryptedKey, otp?, downloadType?) => {
  return {
    type: DOWNLOAD_MSHARE,
    payload: { otp, encryptedKey, downloadType },
  };
};

export const generatePersonalCopies = () => {
  return {
    type: GENERATE_PERSONAL_COPIES,
  };
};

export const updateMSharesHealth = (DECENTRALIZED_BACKUP?) => {
  return { type: UPDATE_MSHARES_HEALTH, payload: { DECENTRALIZED_BACKUP } };
};

export const checkMSharesHealth = () => {
  return { type: CHECK_MSHARES_HEALTH };
};

export const checkPDFHealth = (scannedQR, index) => {
  return { type: CHECK_PDF_HEALTH, payload: { scannedQR, index } };
};

export const calculateOverallHealth = (s3Service?) => {
  return { type: OVERALL_HEALTH, payload: { s3Service } };
};

export const requestShare = (shareIndex) => {
  return { type: REQUEST_SHARE, payload: { shareIndex } };
};

export const updateDynamicNonPMDD = () => {
  return { type: UPDATE_DYNAMINC_NONPMDD };
};

export const downloadDynamicNonPMDD = (walletId) => {
  return { type: DOWNLOAD_DYNAMIC_NONPMDD, payload: { walletId } };
};

export const restoreDynamicNonPMDD = () => {
  return { type: RESTORE_DYNAMIC_NONPMDD };
};

export const recoverMmnemonic = (metaShares, securityAns) => {
  return { type: RECOVER_MNEMONIC, payload: { metaShares, securityAns } };
};

export const recoverWallet = () => {
  return { type: RECOVER_WALLET };
};

export const resetRequestedShareUpload = () => {
  return { type: RESET_REQUESTED_SHARE_UPLOADS };
};

export const updateWalletImage = () => {
  return { type: UPDATE_WALLET_IMAGE };
};

export const fetchWalletImage = () => {
  return { type: FETCH_WALLET_IMAGE };
};

// types and action creators (saga): dispatched by saga workers
export const HEALTH_CHECK_INITIALIZED = 'HEALTH_CHECK_INITIALIZED';
export const REQUESTED_SHARE_UPLOADED = 'REQUESTED_SHARE_UPLOADED';
export const MNEMONIC_RECOVERED = 'MNEMONIC_RECOVERED';
export const S3_LOADING = 'S3_LOADING';
export const DOWNLOADED_MSHARE = 'DOWNLOADED_MSHARE';
export const OVERALL_HEALTH_CALCULATED = 'OVERALL_HEALTH_CALCULATED';
export const UPDATE_SHARE_HISTORY = 'UPDATE_SHARE_HISTORY';
export const CHECKED_PDF_HEALTH = 'CHECKED_PDF_HEALTH';
export const QR_CHECKED = 'QR_CHECKED';
export const UNABLE_RECOVER_SHARE_FROM_QR = 'UNABLE_RECOVER_SHARE_FROM_QR';
export const WALLET_RECOVERY_FAILED = 'WALLET_RECOVERY_FAILED';
export const UPLOAD_SUCCEFULLY = 'UPLOAD_SUCCEFULLY';
export const WALLET_IMAGE_CHECKED = 'WALLET_IMAGE_CHECKED';

export const healthCheckInitialized = () => {
  return { type: HEALTH_CHECK_INITIALIZED };
};

export const requestedShareUploaded = (tag, status, err?) => {
  return { type: REQUESTED_SHARE_UPLOADED, payload: { tag, status, err } };
};

export const mnemonicRecovered = (mnemonic) => {
  return { type: MNEMONIC_RECOVERED, payload: { mnemonic } };
};

export const switchS3Loader = (beingLoaded) => {
  return { type: S3_LOADING, payload: { beingLoaded } };
};

export const downloadedMShare = (otp, status, err?) => {
  return { type: DOWNLOADED_MSHARE, payload: { otp, status, err } };
};

export const updateShareHistory = (overallHealth) => {
  return { type: UPDATE_SHARE_HISTORY, payload: { overallHealth } };
};

export const overallHealthCalculated = (overallHealth) => {
  return { type: OVERALL_HEALTH_CALCULATED, payload: { overallHealth } };
};

export const restoreShareFromQR = (qrArray) => {
  return { type: RESTORE_SHARE_FROM_QR, payload: { qrArray } };
};

export const pdfHealthChecked = (pdfHealthChecked) => {
  return { type: CHECKED_PDF_HEALTH, payload: { pdfHealthChecked } };
};

export const QRChecked = (isFailed) => {
  return { type: QR_CHECKED, payload: { isFailed } };
};

export const UnableRecoverShareFromQR = (isFailed) => {
  return { type: UNABLE_RECOVER_SHARE_FROM_QR, payload: { isFailed } };
};

export const walletRecoveryFailed = (isFailed) => {
  return { type: WALLET_RECOVERY_FAILED, payload: { isFailed } };
};

export const walletImageChecked = (checked) => {
  return { type: WALLET_IMAGE_CHECKED, payload: { checked } };
};

export const ErrorSending = (isFailed) => {
  return { type: ERROR_SENDING, payload: { isFailed } };
};

export const UploadSuccessfully = (isUploaded) => {
  return { type: UPLOAD_SUCCEFULLY, payload: { isUploaded } };
};

export const ErrorReceiving = (isFailed) => {
  return { type: ERROR_RECEIVING, payload: { isFailed } };
};
