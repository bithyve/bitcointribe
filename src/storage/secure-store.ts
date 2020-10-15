import * as SecureStore from 'expo-secure-store';
import Config from "react-native-config";

export const store = async (hash, enc_key) => {
  try {
    if (await SecureStore.getItemAsync(Config.ENC_KEY_STORAGE_IDENTIFIER)) {
      console.log('Old key identified, removing...');
      await SecureStore.deleteItemAsync(Config.ENC_KEY_STORAGE_IDENTIFIER);
    }
    await SecureStore.setItemAsync(
      Config.ENC_KEY_STORAGE_IDENTIFIER,
      JSON.stringify({ hash, enc_key }),
    );
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

export const fetch = async hash_current => {
  try {
    const value = await SecureStore.getItemAsync(Config.ENC_KEY_STORAGE_IDENTIFIER);
    if (!value) {
      throw new Error('Identifier missing');
    }

    const { hash, enc_key } = JSON.parse(value);
    if (hash_current !== hash) {
      throw new Error('Nothing exist against the provided key');
    }
    return enc_key;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const remove = async key => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};
