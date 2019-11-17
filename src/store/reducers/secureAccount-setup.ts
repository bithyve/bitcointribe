import {
    SECUREACCOUNT_SETUP,
    HEALTH_CHECK,
    ACTIVATED,
  } from "../actions/secureAccount-setup";
  
  const SECUREACCOUNT_VARS: {
    setupData: {
        qrData: string;
        secret: string;
        bhXpub: string;
    };
    data: {
      isValid: boolean;
    };
    saStatus:{
      isActive: boolean;
    };
  } = {
    setupData: {
        qrData: "",
        secret: "",
        bhXpub:""
    },
    data: {
      isValid: false
    },
    saStatus:{isActive: false
    },
  };
  
  const initialState = {
    SECUREACCOUNT_VARS  
  };

  export default (state = initialState, action) => {

    switch (action.type) {
      case SECUREACCOUNT_SETUP:
        return {
          ...state,
          setupData: action.payload.setupData,
        };
      case HEALTH_CHECK:
        return {
          ...state, 
          data: action.payload.data,
        };
      case ACTIVATED:
        return {
          ...state,
          saStatus:action.payload.saStatus,
        };
      
    }
    return state;
  };