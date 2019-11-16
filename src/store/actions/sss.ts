// types and action creators: dispatched by components and sagas

export const INIT_HEALTH_CHECK = "INIT_HEALTH_CHECK";
export const PREPARE_MSHARES = "PREPARE_MSHARES";
export const S3_LOADING = "S3_LOADING";

export const initHealthCheck = () => {
  return { type: INIT_HEALTH_CHECK };
};

export const prepareMShares = () => {
  return { type: PREPARE_MSHARES };
};

export const switchS3Loader = beingLoaded => {
  return { type: S3_LOADING, payload: { beingLoaded } };
};

// types and action creators (saga): dispatched by saga workers
export const HEALTH_CHECK_INITIALIZED = "HEALTH_CHECK_INITIALIZED";

export const healthCheckInitialized = () => {
  return { type: HEALTH_CHECK_INITIALIZED };
};
