import { HEALTH_CHECK_INITIALIZED, S3_LOADING } from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";
import { SERVICES_ENRICHED } from "../actions/storage";
import { S3_SERVICE } from "../../common/constants/serviceTypes";

const initialState: {
  service: S3Service;
  loading: {
    hcInit: Boolean;
  };
} = {
  service: null,
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

    case SERVICES_ENRICHED:
      return {
        ...state,
        service: action.payload.services[S3_SERVICE]
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
