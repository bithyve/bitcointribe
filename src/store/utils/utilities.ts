import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import S3Service from '../../bitcoin/services/sss/S3Service';
import TestAccount from '../../bitcoin/services/accounts/TestAccount';
import { take, fork } from 'redux-saga/effects';
import { AsyncStorage, Alert } from 'react-native';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';

export const serviceGenerator = async (
  securityAns: string,
  mnemonic?: string,
  metaShares?: any,
): Promise<{
  regularAcc: RegularAccount;
  testAcc: TestAccount;
  secureAcc: SecureAccount;
  s3Service: S3Service;
  trustedContacts: TrustedContactsService;
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

  // Share generation/restoration
  const s3Service = new S3Service(primaryMnemonic);
  if (metaShares) {
    res = s3Service.restoreMetaShares(metaShares);
    if (res.status !== 200) throw new Error('Share restoration failed');
  } else {
    res = s3Service.generateShares(securityAns);
    if (res.status !== 200) throw new Error('Share generation failed');
  }

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
    res = s3Service.decryptStaticNonPMDD(
      metaShares[Object.keys(metaShares)[0]].encryptedStaticNonPMDD,
    );
    if (res.status !== 200) throw new Error('Failed to decrypt StaticNPMDD');
    secondaryXpub = res.data.decryptedStaticNonPMDD.secondaryXpub;
    bhXpub = res.data.decryptedStaticNonPMDD.bhXpub;
  }

  // Secure account setup
  const secureAcc = new SecureAccount(primaryMnemonic);
  if (!metaShares) {
    console.log('New setup: secure account');
    res = await secureAcc.setupSecureAccount(); // executed once (during initial wallet creation)
  } else {
    if (!secondaryXpub)
      throw new Error('Failed to extract secondary Xpub from metaShare ');
    console.log('Importing secure account');
    res = await secureAcc.importSecureAccount(secondaryXpub, bhXpub);
  } // restoring
  if (res.status !== 200) {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log({ res });
    throw new Error('Secure account setup/import failed');
  }

  // Trusted Contacts Service
  const trustedContacts = new TrustedContactsService();

  return {
    regularAcc,
    testAcc,
    secureAcc,
    s3Service,
    trustedContacts,
  };
};

export const createWatcher = (worker, type) => {
  return function* () {
    while (true) {
      const action = yield take(type);
      yield fork(worker, action);
    }
  };
};

export const requestTimedout = () => {
  console.log(
    'Request Timeout!',
    'Unable to get a response from server. Please, try again shortly',
  );
  // Alert.alert( // retired timeout alert
  //   'Request Timeout!',
  //   'Unable to get a response from server. Please, try again shortly.',
  // );
};
