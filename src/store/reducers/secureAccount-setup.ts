import {
    SECUREACCOUNT_SETUP,
    HEALTH_CHECK,
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
  } = {
    setupData: {
        qrData: "",
        secret: "",
        bhXpub:""

    },
    data: {
      isValid: false
  }
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
    }
    return state;
  };