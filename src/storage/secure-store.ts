import * as SecureStore from 'expo-secure-store';
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage';
import Config from 'react-native-config';

export const store = async (hash, enc_key) => {
  try {
    if (await RNSecureStorage.exists(Config.ENC_KEY_STORAGE_IDENTIFIER)) {
      console.log('Old key identified, removing...');
      await RNSecureStorage.remove(Config.ENC_KEY_STORAGE_IDENTIFIER);
    }

    await RNSecureStorage.set(
      Config.ENC_KEY_STORAGE_IDENTIFIER,
      JSON.stringify({ hash, enc_key }),
      { accessible: ACCESSIBLE.WHEN_UNLOCKED },
    );
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

export const fetch = async (hash_current) => {
  try {
    let hash: any, enc_key: any;

    const value = await SecureStore.getItemAsync(
      Config.ENC_KEY_STORAGE_IDENTIFIER,
    );

    if (value) {
      ({ hash, enc_key } = JSON.parse(value));
      if (await RNSecureStorage.exists(Config.ENC_KEY_STORAGE_IDENTIFIER)) {
        console.log('upgrading storage to new version...');
        await RNSecureStorage.remove(Config.ENC_KEY_STORAGE_IDENTIFIER);
      }

      await RNSecureStorage.set(
        Config.ENC_KEY_STORAGE_IDENTIFIER,
        JSON.stringify({ hash, enc_key }),
        { accessible: ACCESSIBLE.WHEN_UNLOCKED },
      );

      await SecureStore.deleteItemAsync(Config.ENC_KEY_STORAGE_IDENTIFIER);
      if (hash_current !== hash) {
        throw new Error('Incorrect passcode, legacy');
      } else return enc_key;
    }

    let RNValue;
    if (await RNSecureStorage.exists(Config.ENC_KEY_STORAGE_IDENTIFIER)) {
      RNValue = await RNSecureStorage.get(Config.ENC_KEY_STORAGE_IDENTIFIER);
    }

    if (!value && !RNValue) {
      throw new Error('Identifier missing');
    }

    if (RNValue) {
      ({ hash, enc_key } = JSON.parse(RNValue));

      if (hash_current !== hash) {
        throw new Error('Incorrect Passcode, upgraded');
      }
    }
    return enc_key;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const remove = async (key) => {
  try {
    console.log('trying to remove');
    await SecureStore.deleteItemAsync(key);

    if (await RNSecureStorage.exists(key)) {
      await RNSecureStorage.remove(key);
    }
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};
