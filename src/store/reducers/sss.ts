import {
  HEALTH_CHECK_INITIALIZED,
  S3_LOADING,
  MNEMONIC_RECOVERED,
  REQUESTED_SHARE_UPLOADED,
  RESET_REQUESTED_SHARE_UPLOADS,
  DOWNLOADED_MSHARE,
} from '../actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import { SERVICES_ENRICHED } from '../actions/storage';
import { S3_SERVICE } from '../../common/constants/serviceTypes';

const initialState: {
  service: S3Service;
  loading: {
    hcInit: Boolean;
    uploadMetaShare: Boolean;
    downloadMetaShare: Boolean;
    generatePDF: Boolean;
    updateMSharesHealth: Boolean;
    checkMSharesHealth: Boolean;
    uploadRequestedShare: Boolean;
    updateDynamicNonPMDD: Boolean;
    downloadDynamicNonPMDD: Boolean;
    restoreDynamicNonPMDD: Boolean;
    restoreWallet: Boolean;
  };
  mnemonic: String;
  requestedShareUpload: {
    [tag: string]: { status: Boolean; err?: String };
  };
  downloadedMShare: {
    [otp: string]: { status: Boolean; err?: String };
  };
} = {
  service: null,
  loading: {
    hcInit: false,
    uploadMetaShare: false,
    downloadMetaShare: false,
    generatePDF: false,
    updateMSharesHealth: false,
    checkMSharesHealth: false,
    uploadRequestedShare: false,
    updateDynamicNonPMDD: false,
    downloadDynamicNonPMDD: false,
    restoreDynamicNonPMDD: false,
    restoreWallet: false,
  },
  mnemonic: '',
  requestedShareUpload: {},
  downloadedMShare: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case HEALTH_CHECK_INITIALIZED:
      return {
        ...state,
        loading: {
          ...state.loading,
          hcInit: false,
        },
      };

    case MNEMONIC_RECOVERED:
      return {
        ...state,
        mnemonic: action.payload.mnemonic,
      };

    case SERVICES_ENRICHED:
      return {
        ...state,
        service: action.payload.services[S3_SERVICE],
      };

    case REQUESTED_SHARE_UPLOADED:
      return {
        ...state,
        requestedShareUpload: {
          ...state.requestedShareUpload,
          [action.payload.tag]: {
            status: action.payload.status,
            err: action.payload.err,
          },
        },
      };

    case RESET_REQUESTED_SHARE_UPLOADS:
      return {
        ...state,
        requestedShareUpload: initialState.requestedShareUpload,
      };

    case DOWNLOADED_MSHARE:
      return {
        ...state,
        downloadedMShare: {
          ...state.downloadedMShare,
          [action.payload.otp]: {
            status: action.payload.status,
            err: action.payload.err,
          },
        },
      };

    case S3_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.beingLoaded]: !state.loading[
            action.payload.beingLoaded
          ],
        },
      };
  }
  return state;
};
