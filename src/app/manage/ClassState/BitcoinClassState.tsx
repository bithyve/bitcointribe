import { AsyncStorage } from 'react-native';
import { asyncStorageKeys } from 'HexaWallet/src/app/constants/Constants';

// TODO: Bitcoin Files
import { S3Service, RegularAccount, SecureAccount } from 'hexaBitcoin';

const utils = require('HexaWallet/src/app/constants/Utils');

const setRegularClassState = async (value: any) => {
  const tvalue = JSON.stringify(value);
  AsyncStorage.setItem(asyncStorageKeys.regularClassObject, tvalue);
};

const getRegularClassState = async () => {
  const regularClassObject = await AsyncStorage.getItem(
    asyncStorageKeys.regularClassObject,
  );
  if (regularClassObject != null) {
    const regularAccount = RegularAccount.fromJSON(regularClassObject);
    await utils.setRegularAccountObject(regularAccount);
    return regularAccount;
  }
  return null;
};

const setSecureClassState = async (value: any) => {
  const tvalue = JSON.stringify(value);
  AsyncStorage.setItem(asyncStorageKeys.secureClassObject, tvalue);
};

const getSecureClassState = async () => {
  const secureClassObject = await AsyncStorage.getItem(
    asyncStorageKeys.secureClassObject,
  );
  if (secureClassObject != null) {
    const secureAccount = SecureAccount.fromJSON(secureClassObject);
    await utils.setSecureAccountObject(secureAccount);
    return secureAccount;
  }
  return null;
};

const setS3ServiceClassState = async (value: any) => {
  const tvalue = JSON.stringify(value);
  AsyncStorage.setItem(asyncStorageKeys.s3ServiceClassObject, tvalue);
};

const getS3ServiceClassState = async () => {
  const setS3ServiceObject = await AsyncStorage.getItem(
    asyncStorageKeys.s3ServiceClassObject,
  );
  if (setS3ServiceObject != null) {
    const s3Service = S3Service.fromJSON(setS3ServiceObject);
    await utils.setS3ServiceObject(s3Service);
    return s3Service;
  }
  return null;
};

module.exports = {
  setRegularClassState,
  getRegularClassState,
  setSecureClassState,
  getSecureClassState,
  setS3ServiceClassState,
  getS3ServiceClassState,
};
