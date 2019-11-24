import {
  HEALTH_CHECK_INITIALIZED,
  S3_LOADING,
  MNEMONIC_RECOVERED
} from "../actions/sss";
import S3Service from "../../bitcoin/services/sss/S3Service";
import { SERVICES_ENRICHED } from "../actions/storage";
import { S3_SERVICE } from "../../common/constants/serviceTypes";

const initialState: {
  service: S3Service;
  loading: {
    hcInit: Boolean;
    uploadMetaShare: Boolean;
    downloadMetaShare: Boolean;
    updateMSharesHealth: Boolean;
    checkMSharesHealth: Boolean;
    uploadRequestedShare: Boolean;
    updateDynamicNonPMDD: Boolean;
    downloadDynamicNonPMDD: Boolean;
  };
  mnemonic: String;
} = {
  service: null,
  loading: {
    hcInit: false,
    uploadMetaShare: false,
    downloadMetaShare: false,
    updateMSharesHealth: false,
    checkMSharesHealth: false,
    uploadRequestedShare: false,
    updateDynamicNonPMDD: false,
    downloadDynamicNonPMDD: false
  },
  mnemonic: ""
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

    case MNEMONIC_RECOVERED:
      return {
        ...state,
        mnemonic: action.payload.mnemonic
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
          [action.payload.beingLoaded]: !state.loading[
            action.payload.beingLoaded
          ]
        }
      };
  }
  return state;
};
