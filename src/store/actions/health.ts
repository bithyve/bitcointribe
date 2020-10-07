// types and action creators: dispatched by components and sagas

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

  export const switchS3LoadingStatus = (beingLoaded) => {
    console.log('testing3')
    // console.log("Called s3 Loading", new Date())
    return { type: S3_LOADING_STATUS, payload: { beingLoaded } };
  };

  export const initLoader = (beingLoaded) => {
    // console.log("Called s3 Loading", new Date())
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
  }

  export const checkMSharesHealth = () => {
    console.log('testing1')
    return { type: CHECK_SHARES_HEALTH };
  };

  export const ErrorSending = (isFailed) => {
    return { type: ERROR_SENDING, payload: { isFailed } };
  };

  export const updateMSharesHealth = (shares) => {
    console.log('updateMSharesHealth shares', shares)
    return { type: UPDATE_SHARES_HEALTH, payload: { shares } };
  };
  
  export const updateMSharesLoader = (beingLoaded) => {
    // console.log("Called s3 Loading", new Date())
    return { type: UPDATE_MSHARE_LOADING_STATUS, payload: { beingLoaded } };
  };