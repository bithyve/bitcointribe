// types and action creators: dispatched by components and sagas

export const INIT_HEALTH_CHECK = "INIT_HEALTH_CHECK";
export const PREPARE_MSHARES = "PREPARE_MSHARES";
export const UPLOAD_ENC_MSHARES = "UPLOAD_ENC_MSHARES";
export const UPLOAD_REQUESTED_SHARE = "UPLOAD_REQUESTED_SHARE";
export const DOWNLOAD_MSHARE = "DOWNLOAD_MSHARE";
export const UPDATE_MSHARES_HEALTH = "UPDATE_MSHARES_HEALTH";
export const CHECK_MSHARES_HEALTH = "CHECK_MSHARES_HEALTH";
export const S3_LOADING = "S3_LOADING";

export const initHealthCheck = () => {
  return { type: INIT_HEALTH_CHECK };
};

export const prepareMShares = () => {
  return { type: PREPARE_MSHARES };
};

export const uploadEncMShares = (shareIndex: 0 | 1 | 2) => {
  return { type: UPLOAD_ENC_MSHARES, payload: { shareIndex } };
};

export const uploadRequestedShare = (tag, encryptedKey, otp) => {
  return { type: UPLOAD_REQUESTED_SHARE, payload: { tag, encryptedKey, otp } };
};

export const downloadMShare = (otp, encryptedKey, downloadType?) => {
  return {
    type: DOWNLOAD_MSHARE,
    payload: { otp, encryptedKey, downloadType }
  };
};

export const updateMSharesHealth = () => {
  return { type: UPDATE_MSHARES_HEALTH };
};

export const checkMSharesHealth = () => {
  return { type: CHECK_MSHARES_HEALTH };
};

export const switchS3Loader = beingLoaded => {
  return { type: S3_LOADING, payload: { beingLoaded } };
};

// types and action creators (saga): dispatched by saga workers
export const HEALTH_CHECK_INITIALIZED = "HEALTH_CHECK_INITIALIZED";

export const healthCheckInitialized = () => {
  return { type: HEALTH_CHECK_INITIALIZED };
};
