import {
  MetaShare,
  EncDynamicNonPMDD,
} from '../../bitcoin/utilities/Interface'

export interface DynamicNonPMDD {
  META_SHARES?: MetaShare[];
}

export interface DecentralizedBackup {
  RECOVERY_SHARES: {
    [SHARE_INDEX: string]: {
      REQUEST_DETAILS?: { TAG: string; KEY: string };
      META_SHARE?: MetaShare;
      ENC_DYNAMIC_NONPMDD?: EncDynamicNonPMDD;
    };
  };
  SHARES_TRANSFER_DETAILS: {
    [SHARE_INDEX: string]: {
      OTP: string;
      ENCRYPTED_KEY: string;
      UPLOADED_AT: number;
    };
  };
  UNDER_CUSTODY: {
    [TAG: string]: {
      META_SHARE: MetaShare;
      ENC_DYNAMIC_NONPMDD: EncDynamicNonPMDD;
      TRANSFER_DETAILS: {
        KEY: string;
        UPLOADED_AT: number;
      };
      SM_TRANSFER_DETAILS?: {
        KEY: string;
        UPLOADED_AT: number;
      }
      SECONDARY_SHARE?: MetaShare;
    };
  };
  DYNAMIC_NONPMDD: DynamicNonPMDD;
  SM_SHARE?: string
}

export interface ServicesJSON {
  S3_SERVICE: string;
}

export interface Database {
  SERVICES?: ServicesJSON;
}

export enum APP_STAGE {
  DEVELOPMENT = 'dev',
  STAGING = 'sta',
  PRODUCTION = 'app'
}
