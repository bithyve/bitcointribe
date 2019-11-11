import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";

export interface Database {
  walletName?: String;
  securityAns?: String;
  accounts?: {
    regularAccount: string;
    testAccount: string;
    secureAccount: string;
    s3Service: string;
  };
}

export interface Services {
  regularAccount?: RegularAccount;
  testAccount?: TestAccount;
  secureAccount?: SecureAccount;
  s3Service?: S3Service;
}
