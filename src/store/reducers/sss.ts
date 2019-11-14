import { HEALTH_CHECK_INITIALIZED, S3_LOADING } from "../actions/sss";

const initialState: {
  hcInit: Boolean;
  loading: {
    hcInit: Boolean;
  };
} = {
  hcInit: false,
  loading: {
    hcInit: false
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case HEALTH_CHECK_INITIALIZED:
      return {
        ...state,
        hcInit: action.payload.initialized,
        loading: {
          ...state.loading,
          hcInit: false
        }
      };

    case S3_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          hcInit: !state.loading.hcInit
        }
      };
  }
  return state;
};
