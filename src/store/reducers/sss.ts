import { HEALTH_CHECK_INITIALIZED, S3_LOADING } from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";

const initialState: {
  loading: {
    hcInit: Boolean;
  };
} = {
  loading: {
    hcInit: false
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case HEALTH_CHECK_INITIALIZED:
      return {
        ...state,
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
