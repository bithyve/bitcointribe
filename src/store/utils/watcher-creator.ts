import { take, fork } from 'redux-saga/effects';
import bip39 from 'react-native-bip39';

export const createWatcher = (worker, type) => {
  return function*() {
    while (true) {
      const action = yield take(type);
      yield fork(worker, action);
    }
  };
};

export const createMnemonic = async () => {
  try {
    const mnemonic = await bip39.generateMnemonic(256);
    return mnemonic;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};
