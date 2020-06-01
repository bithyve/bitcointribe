import {
  HEALTH_CHECK_INITIALIZED,
  S3_LOADING,
  MNEMONIC_RECOVERED,
  REQUESTED_SHARE_UPLOADED,
  RESET_REQUESTED_SHARE_UPLOADS,
  DOWNLOADED_MSHARE,
  OVERALL_HEALTH_CALCULATED,
  CHECKED_PDF_HEALTH,
  PDF_HEALTH_CHECK_FAILED,
  UNABLE_RECOVER_SHARE_FROM_QR,
  WALLET_RECOVERY_FAILED,
  ERROR_SENDING,
  UPLOAD_SUCCEFULLY,
  ERROR_RECEIVING,
  WALLET_IMAGE_CHECKED,
  GENERATE_PERSONAL_COPY,
  SHARE_PERSONAL_COPY,
  PERSONAL_COPY_SHARED,
  PERSONAL_COPY_GENERATED,
} from '../actions/sss';
import S3Service from '../../bitcoin/services/sss/S3Service';
import { SERVICES_ENRICHED } from '../actions/storage';
import { S3_SERVICE } from '../../common/constants/serviceTypes';

const initialState: {
  service: S3Service;
  serviceEnriched: Boolean;
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
    pdfHealthChecked: Boolean;
  };
  mnemonic: String;
  personalCopyIndex: Number;
  personalCopyGenerated: { copy1: Boolean; copy2: Boolean };
  personalCopyShared: { copy1: Boolean; copy2: Boolean };
  requestedShareUpload: {
    [tag: string]: { status: Boolean; err?: String };
  };
  downloadedMShare: {
    [otp: string]: { status: Boolean; err?: String };
  };
  overallHealth: {
    overallStatus: string;
    qaStatus: string;
    sharesInfo: { shareId: string; shareStage: string }[];
  };
  pdfHealthCheckFailed: Boolean;
  unableRecoverShareFromQR: Boolean;
  walletRecoveryFailed: Boolean;
  walletImageChecked: Boolean;
  errorSending: Boolean;
  uploadSuccessfully: Boolean;
  errorReceiving: Boolean;
} = {
  service: null,
  serviceEnriched: false,
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
    pdfHealthChecked: false,
  },
  mnemonic: '',
  personalCopyIndex: 0,
  personalCopyGenerated: { copy1: null, copy2: null },
  personalCopyShared: { copy1: null, copy2: null },
  requestedShareUpload: {},
  downloadedMShare: {},
  overallHealth: null,
  pdfHealthCheckFailed: false,
  unableRecoverShareFromQR: false,
  walletRecoveryFailed: false,
  walletImageChecked: false,
  errorSending: false,
  uploadSuccessfully: false,
  errorReceiving: false,
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
        serviceEnriched: true,
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

    case GENERATE_PERSONAL_COPY:
      return {
        ...state,
        personalCopyGenerated: {
          ...state.personalCopyGenerated,
          [action.payload.shareIndex === 3 ? 'copy1' : 'copy2']: null,
        },
      };

    case PERSONAL_COPY_GENERATED:
      return {
        ...state,
        personalCopyGenerated: {
          ...state.personalCopyGenerated,
          ...action.payload.generated,
        },
      };

    case SHARE_PERSONAL_COPY:
      return {
        ...state,
        personalCopyShared: {
          ...state.personalCopyShared,
          [action.payload.selectedPersonalCopy.type]: null,
        },
      };

    case PERSONAL_COPY_SHARED:
      return {
        ...state,
        personalCopyShared: {
          ...state.personalCopyShared,
          ...action.payload.shared,
        },
      };

    case OVERALL_HEALTH_CALCULATED:
      return {
        ...state,
        overallHealth: action.payload.overallHealth,
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

    case CHECKED_PDF_HEALTH:
      return {
        ...state,
        loading: {
          ...state.loading,
          pdfHealthChecked: action.payload.pdfHealthChecked,
        },
        //personalCopyIndex: action.payload.index
      };

    case PDF_HEALTH_CHECK_FAILED:
      return {
        ...state,
        pdfHealthCheckFailed: action.payload.failed,
      };

    case UNABLE_RECOVER_SHARE_FROM_QR:
      return {
        ...state,
        unableRecoverShareFromQR: action.payload.isFailed,
      };

    case WALLET_RECOVERY_FAILED:
      return {
        ...state,
        walletRecoveryFailed: action.payload.isFailed,
      };

    case WALLET_IMAGE_CHECKED:
      return {
        ...state,
        walletImageChecked: action.payload.checked,
      };

    case ERROR_SENDING:
      return {
        ...state,
        errorSending: action.payload.isFailed,
      };
    case UPLOAD_SUCCEFULLY:
      return {
        ...state,
        uploadSuccessfully: action.payload.isUploaded,
      };
    case ERROR_RECEIVING:
      return {
        ...state,
        errorReceiving: action.payload.isFailed,
      };
  }
  return state;
};
