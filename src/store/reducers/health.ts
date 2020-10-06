import {
  HEALTH_CHECK_INITIALIZED,
  HEALTH_CHECK_INITIALIZE,
  HEALTH_UPDATE,
  GET_HEALTH_OBJECT,
} from '../actions/health';

const initialState: {
  loading: {
    levelHealthCheck: Boolean;
  };
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
} = {
  loading: {
    levelHealthCheck: false,
  },
  levelHealth: [],
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
      };

      case GET_HEALTH_OBJECT: 
        return {
        ...state,
        levelHealth: action.payload.health,
      };
  }
  return state;
};
