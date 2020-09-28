// types and action creators: dispatched by components and sagas

  export const INIT_HEALTH_SETUP = 'INIT_HEALTH_SETUP';
  export const HEALTH_UPDATE = 'HEALTH_UPDATE';
  export const HEALTH_CHECK_INITIALIZED = 'HEALTH_CHECK_INITIALIZED';
  export const HEALTH_CHECK_INITIALIZE = 'HEALTH_CHECK_INITIALIZE';
  export const INIT_HEALTH_CHECK = 'INIT_HEALTH_CHECK';
  export const S3_LOADING = 'S3_LOADING';
  export const PREPARE_MSHARES = 'PREPARE_MSHARES';

  export const initHealthCheck = () => {
    return { type: INIT_HEALTH_CHECK };
  };
  
  export const initializeHealthSetup = () => {
    return { type: INIT_HEALTH_SETUP };
  };
  
  export const updateHealth = (health) => {
    return { type: HEALTH_UPDATE, payload: { health } };
  }

  export const healthInitialize = () => {
    return { type: HEALTH_CHECK_INITIALIZE };
  }

  export const healthInitialized = () => {
    return { type: HEALTH_CHECK_INITIALIZED };
  }

  export const switchS3Loader = (beingLoaded) => {
    // console.log("Called s3 Loading", new Date())
    return { type: S3_LOADING, payload: { beingLoaded } };
  };

  export const healthCheckInitialized = () => {
    return { type: HEALTH_CHECK_INITIALIZED };
  };

  export const prepareMShares = () => {
    return { type: PREPARE_MSHARES };
  };