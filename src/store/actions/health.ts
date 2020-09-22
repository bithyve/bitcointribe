// types and action creators: dispatched by components and sagas

  export const INIT_HEALTH_SETUP = 'INIT_HEALTH_SETUP';
  export const HEALTH_UPDATE = 'HEALTH_UPDATE';
  export const HEALTH_CHECK_INITIALIZED = 'HEALTH_CHECK_INITIALIZED';
  export const HEALTH_CHECK_INITIALIZE = 'HEALTH_CHECK_INITIALIZE';

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

