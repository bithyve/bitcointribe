import {
    SECUREACCOUNT_SETUP,
    HEALTH_CHECK,
    ACTIVATED,
    SECURE_ADDR_FETCHED,
    SECURE_BALANCE_FETCHED,
    SECURE_TRANSACTIONS_FETCHED,
  } from "../actions/secureAccount";
  import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";

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
    service: SecureAccount;
    receivingAddress: String;
    balances: {
    balance: Number;
    unconfirmedBalance: Number;
  };
  transactions: any;
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
    service: null,
    receivingAddress: "",
    balances: {
    balance: 0,
    unconfirmedBalance: 0
  },
  transactions: {},
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
      case SECURE_ADDR_FETCHED:
          return {         
            ...state,
            receivingAddress: action.payload.address,
          };
    
      case SECURE_BALANCE_FETCHED:
          return {
            ...state,
            balances: action.payload.balances,
          };
    
      case SECURE_TRANSACTIONS_FETCHED:
          return {
            ...state,
            transactions: action.payload.transactions,      
          };
        };
    return state;
  };