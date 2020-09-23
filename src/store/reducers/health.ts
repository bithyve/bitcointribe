import {
  HEALTH_CHECK_INITIALIZED,
  HEALTH_CHECK_INITIALIZE,
  HEALTH_UPDATE,
} from '../actions/health';

const initialState: {
  loading: {
    levelHealthCheck: Boolean;
  };
  levelHealth: {
    level: number;
    levelStatus: string;
    levelInfo: {
      keeperType: string;
      type: string;
      lastUpdated: string;
      created: string;
      status: string;
      shareId: string;
    }[];
  }[];
} = {
  loading: {
    levelHealthCheck: false,
  },
  levelHealth: null,
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
  }
  return state;
};
