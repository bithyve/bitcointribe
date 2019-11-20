import {
    SECUREACCOUNT_SETUP,
    HEALTH_CHECK,
    ACTIVATED,
    SECURE_ADDR_FETCHED,
    SECURE_BALANCE_FETCHED,
    SECURE_TRANSACTIONS_FETCHED,
    SECURE_TRANSFER_ST1_EXECUTED,
    SECURE_TRANSFER_ST2_EXECUTED,
    SECURE_TRANSFER_ST3_EXECUTED,
    
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
  transfer: {
    executing1: Boolean;
    executing2: Boolean;
    stage1: any;
    stage2:any;
    txid: String;
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
    service: null,
    receivingAddress: "",
    balances: {
    balance: 0,
    unconfirmedBalance: 0
  },
  transactions: {},
  transfer: {
    executing1: false,
    executing2:false,
    stage1: {},
    stage2:{},
    txid: ""
  },
  };
  
  const initialState = {
    SECUREACCOUNT_VARS  
  };

  export default (state = initialState, action) => {
    const account = action.payload ? action.payload.serviceType : null;
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
      case SECURE_TRANSFER_ST1_EXECUTED:
            return {
              ...state,
              transfer: {
                  ...action.payload.stage1,
                  executing1: true, 
                },
                
            };
      case SECURE_TRANSFER_ST2_EXECUTED:
              return {
                ...state,
                transfer: {
                    ...action.payload.stage2,
                    executing2: true,
                  },
                  
              }; 
      case SECURE_TRANSFER_ST3_EXECUTED:
                return {
                  ...state,
                  transfer: {
                    txid: action.payload.txid,
                    executing1: false,
                    executing2: false,
                    }, 
                    
                };       
    };
      


    return state;
  };