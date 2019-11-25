import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";
import { take, fork } from "redux-saga/effects";

export const serviceGenerator = async (
  securityAns: string,
  mnemonic?: string
): Promise<{
  regularAcc: RegularAccount;
  testAcc: TestAccount;
  secureAcc: SecureAccount;
  s3Service: S3Service;
}> => {
  // Regular account
  let primaryMnemonic = mnemonic ? mnemonic : undefined;
  const regularAcc = new RegularAccount(primaryMnemonic);
  let res;
  res = regularAcc.getMnemonic();
  if (res.status !== 200) throw new Error("Regular account gen failed");
  primaryMnemonic = res.data.mnemonic;

  // Test account
  const testAcc = new TestAccount();

  // Secure account
  const secureAcc = new SecureAccount(primaryMnemonic);
  res = await secureAcc.setupSecureAccount();
  console.log({ res });
  if (res.status !== 200) throw new Error("Secure account setup failed");

  // share generation
  const s3Service = new S3Service(primaryMnemonic);
  res = s3Service.generateShares(securityAns);
  if (res.status !== 200) throw new Error("Share generation failed");

  return {
    regularAcc,
    testAcc,
    secureAcc,
    s3Service
  };
};

export const createWatcher = (worker, type) => {
  return function*() {
    while (true) {
      const action = yield take(type);
      yield fork(worker, action);
    }
  };
};
