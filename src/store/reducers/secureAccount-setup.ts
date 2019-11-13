import {
    SECUREACCOUNT_SETUP,
  } from "../actions/secureAccount-setup";

  const SECUREACCOUNT_VARS: {
    setupData: {
        qrData: string;
        secret: string;
        bhXpub: string;
    };
  } = {
    setupData: {
        qrData: "",
        secret: "",
        bhXpub:""

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
    }
    return state;
  };