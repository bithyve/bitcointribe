import { MetaShare } from '../../bitcoin/utilities/Interface';
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
  UPDATE_EFCHANNEL_LOADING_STATUS,
  IS_LEVEL_TWO_METASHARE,
  IS_LEVEL_THREE_METASHARE,
  KEEPER_INFO,
  IS_LEVEL2_INITIALIZED,
  SHARE_RECEIVED
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
  isLevelTwoMetaShareCreated: Boolean;
  isLevelThreeMetaShareCreated: Boolean;
  isLevel2Initialized: Boolean;
  isLevel3Initialized: Boolean;
  levelHealth: {
    level: number;
    levelInfo: {
      shareType: string;
      updatedAt: string;
      status: string;
      shareId: string;
      reshareVersion?: number;
      guardian?: string;
    }[];
  }[];
  keeperInfo: {
    shareId: string;
    name: string;
    uuid: string;
    publicKey: string;
    ephemeralAddress: string;
    type: string;
    data?: any;
  }[];
  shares: any;
  metaShare: MetaShare;
} = {
  loading: {
    levelHealthCheck: false,
    checkMSharesHealth: false,
    initLoader: false,
    updateMSharesHealth: false,
    updateEFChannelStatus: false
  },
  isLevelTwoMetaShareCreated: false,
  isLevelThreeMetaShareCreated: false,
  isLevel2Initialized: false,
  isLevel3Initialized: false,
  currentLevel: 0,
  levelHealth: [],
  errorSending: false,
  shares: null,
  keeperInfo: [],
  metaShare: null,
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
    
    case IS_LEVEL_TWO_METASHARE:
      return {
        ...state,
        isLevelTwoMetaShareCreated: action.payload.beingLoaded,
      };
  
    case IS_LEVEL_THREE_METASHARE:
      return {
        ...state,
        isLevelThreeMetaShareCreated: action.payload.beingLoaded,
      };

    case KEEPER_INFO:
      return {
        ...state,
        keeperInfo: action.payload.info,
      };

      case IS_LEVEL2_INITIALIZED:
      return {
        ...state,
        isLevel2Initialized: true,
      };

      case SHARE_RECEIVED:
      return {
        ...state,
        metaShare: action.payload.metaShare,
      };
      
      
  }
  return state;
};
