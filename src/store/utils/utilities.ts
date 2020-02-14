import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import S3Service from '../../bitcoin/services/sss/S3Service';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import { take, fork } from 'redux-saga/effects';
import { AsyncStorage } from 'react-native';

export const serviceGenerator = async (
  securityAns: string,
  mnemonic?: string,
  metaShares?: any,
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
  if (res.status !== 200) throw new Error('Regular account gen failed');
  primaryMnemonic = res.data.mnemonic;
  console.log({ primaryMnemonic });
  // Test account
  const testAcc = new TestAccount(primaryMnemonic);
  console.log({ testAcc });

  // Share generation
  const s3Service = new S3Service(primaryMnemonic);
  res = s3Service.generateShares(securityAns); // TODO: Generates new shares, swap with a mech that re-stores the shares used for wallet restoration
  if (res.status !== 200) throw new Error('Share generation failed');

  // share history initialization
  const createdAt = Date.now();
  const shareHistory = [
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
  ];
  await AsyncStorage.setItem('shareHistory', JSON.stringify(shareHistory));

  let secondaryXpub = '';
  let bhXpub = '';
  if (metaShares) {
    res = s3Service.decryptStaticNonPMDD(metaShares[0].encryptedStaticNonPMDD);
    if (res.status !== 200) throw new Error('Failed to decrypt StaticNPMDD');
    secondaryXpub = res.data.decryptedStaticNonPMDD.secondaryXpub;
    bhXpub = res.data.decryptedStaticNonPMDD.bhXpub;
  }

  // Secure account
  const secureAcc = new SecureAccount(primaryMnemonic);
  if (!secondaryXpub) res = await secureAcc.setupSecureAccount();
  else res = await secureAcc.importSecureAccount(secondaryXpub, bhXpub); // restoring
  if (res.status !== 200) throw new Error('Secure account setup/import failed');

  return {
    regularAcc,
    testAcc,
    secureAcc,
    s3Service,
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
