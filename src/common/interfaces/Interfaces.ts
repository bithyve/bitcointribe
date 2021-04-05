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
  PK_SHARE?: MetaShare
}

export interface ServicesJSON {
  REGULAR_ACCOUNT: string;
  TEST_ACCOUNT: string;
  SECURE_ACCOUNT: string;
  S3_SERVICE: string;
  TRUSTED_CONTACTS: string;
  KEEPERS_INFO?: string;
}

export interface Database {
  WALLET_SETUP?: {
    walletName: string;
    security: { question: string; answer: string };
  };
  DECENTRALIZED_BACKUP: DecentralizedBackup;
  SERVICES?: ServicesJSON;
  VERSION?: String;
}
