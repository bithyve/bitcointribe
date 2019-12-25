// types and action creators: dispatched by components and sagas

export const INIT_HEALTH_CHECK = 'INIT_HEALTH_CHECK';
export const PREPARE_MSHARES = 'PREPARE_MSHARES';
export const UPLOAD_ENC_MSHARE = 'UPLOAD_ENC_MSHARES';
export const UPLOAD_REQUESTED_SHARE = 'UPLOAD_REQUESTED_SHARE';
export const DOWNLOAD_MSHARE = 'DOWNLOAD_MSHARE';
export const GENERATE_PDF = 'GENERATE_PDF';
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

export const initHealthCheck = () => {
  return { type: INIT_HEALTH_CHECK };
};

export const prepareMShares = () => {
  return { type: PREPARE_MSHARES };
};

export const uploadEncMShare = (shareIndex: number) => {
  return { type: UPLOAD_ENC_MSHARE, payload: { shareIndex } };
};

export const uploadRequestedShare = (tag, encryptedKey, otp) => {
  return { type: UPLOAD_REQUESTED_SHARE, payload: { tag, encryptedKey, otp } };
};

export const downloadMShare = (otp, encryptedKey, downloadType?) => {
  return {
    type: DOWNLOAD_MSHARE,
    payload: { otp, encryptedKey, downloadType },
  };
};

export const generatePDF = shareIndex => {
  console.log({ ...shareIndex });

  return {
    type: GENERATE_PDF,
    payload: { ...shareIndex },
  };
};

export const updateMSharesHealth = () => {
  return { type: UPDATE_MSHARES_HEALTH };
};

export const checkMSharesHealth = () => {
  return { type: CHECK_MSHARES_HEALTH };
};

export const overallHealth = s3Service => {
  return { type: OVERALL_HEALTH, payload: { s3Service } };
};

export const requestShare = shareIndex => {
  return { type: REQUEST_SHARE, payload: { shareIndex } };
};

export const updateDynamicNonPMDD = () => {
  return { type: UPDATE_DYNAMINC_NONPMDD };
};

export const downloadDynamicNonPMDD = walletId => {
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

// types and action creators (saga): dispatched by saga workers
export const HEALTH_CHECK_INITIALIZED = 'HEALTH_CHECK_INITIALIZED';
export const REQUESTED_SHARE_UPLOADED = 'REQUESTED_SHARE_UPLOADED';
export const MNEMONIC_RECOVERED = 'MNEMONIC_RECOVERED';
export const S3_LOADING = 'S3_LOADING';
export const DOWNLOADED_MSHARE = 'DOWNLOADED_MSHARE';
export const OVERALL_HEALTH_CALCULATED = 'OVERALL_HEALTH_CALCULATED';

export const healthCheckInitialized = () => {
  return { type: HEALTH_CHECK_INITIALIZED };
};

export const requestedShareUploaded = (tag, status, err?) => {
  return { type: REQUESTED_SHARE_UPLOADED, payload: { tag, status, err } };
};

export const mnemonicRecovered = mnemonic => {
  return { type: MNEMONIC_RECOVERED, payload: { mnemonic } };
};

export const switchS3Loader = beingLoaded => {
  return { type: S3_LOADING, payload: { beingLoaded } };
};

export const downloadedMShare = (otp, status, err?) => {
  return { type: DOWNLOADED_MSHARE, payload: { otp, status, err } };
};

export const overallHealthCalculated = overallHealth => {
  return { type: OVERALL_HEALTH_CALCULATED, payload: { overallHealth } };
};
