import {
  HEALTH_CHECK_INITIALIZED,
  HEALTH_CHECK_INITIALIZE,
  HEALTH_UPDATE,
  GET_HEALTH_OBJECT,
  ERROR_SENDING,
  S3_LOADING_STATUS,
  INIT_LOADING_STATUS,
  UPDATE_MSHARE_LOADING_STATUS,
  MSHARES,
  UPDATE_EFCHANNEL_LOADING_STATUS
} from '../actions/health';

const initialState: {
  loading: {
    levelHealthCheck: Boolean;
    checkMSharesHealth: Boolean;
    initLoader: Boolean;
    updateMSharesHealth: Boolean;
    updateEFChannelStatus: Boolean
  };
  errorSending: Boolean;
  currentLevel: Number;
  levelHealth: {
    levelInfo: {
      shareType: string;
      updatedAt: string;
      status: string;
      shareId: string;
      reshareVersion?: number;
      guardian?: string;
    };
  }[];
  shares: any;
} = {
  loading: {
    levelHealthCheck: false,
    checkMSharesHealth: false,
    initLoader: false,
    updateMSharesHealth: false,
    updateEFChannelStatus: false
  },
  currentLevel: 0,
  levelHealth: [],
  errorSending: false,
  shares: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case HEALTH_CHECK_INITIALIZED:
      return {
        ...state,
        loading: {
          ...state.loading,
          levelHealthCheck: false,
        },
      };
    
    case HEALTH_CHECK_INITIALIZE:
        return {
          ...state,
          loading: {
            ...state.loading,
            levelHealthCheck: true,
          },
        };
    
    case HEALTH_UPDATE: 
        return {
        ...state,
        levelHealth: action.payload.health,
        currentLevel: action.payload.currentLevel
      };

      case GET_HEALTH_OBJECT: 
        return {
        ...state,
        levelHealth: action.payload.health,
      };

      case ERROR_SENDING:
        return {
          ...state,
          errorSending: action.payload.isFailed,
        };
      
      case S3_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            checkMSharesHealth: action.payload.beingLoaded,
          },
        };
      
      case INIT_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            initLoader: action.payload.beingLoaded,
          },
        };

      case UPDATE_MSHARE_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            updateMSharesHealth: action.payload.beingLoaded,
          },
        };

        
      case MSHARES: 
        return {
        ...state,
        shares: action.payload.shares,
      };

      case UPDATE_EFCHANNEL_LOADING_STATUS:
        return {
          ...state,
          loading: {
            ...state.loading,
            updateEFChannelStatus: action.payload.beingLoaded,
          },
        };

      
  }
  return state;
};
