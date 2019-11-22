import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";
import { MetaShare, DynamicNonPMDD } from "../../bitcoin/utilities/Interface";

export interface Database {
  WALLET_SETUP: { walletName: String; securityAns: String };
  DECENTRALIZED_BACKUP: {
    RECOVERY_SHARES: {
      REQUEST_DETAILS: { tag: string; otp: string; encryptedKey: string };
      META_SHARE?: MetaShare;
      DYNAMIC_NONPMDD?: DynamicNonPMDD;
    }[];
    SHARES_TRANSFER_DETAILS: {};
    SHARES_UNDER_CUSTODY: {};
  };
  SERVICES: {
    REGULAR_ACCOUNT: string;
    TEST_ACCOUNT: string;
    SECURE_ACCOUNT: string;
    S3_SERVICE: string;
  };
}

export interface Services {
  REGULAR_ACCOUNT?: RegularAccount;
  TEST_ACCOUNT?: TestAccount;
  SECURE_ACCOUNT?: SecureAccount;
  S3_SERVICE?: S3Service;
}
