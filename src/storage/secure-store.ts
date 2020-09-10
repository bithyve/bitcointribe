import RNSecureStorage, { ACCESSIBLE } from "rn-secure-storage";
import Config from "react-native-config";

export const store = async (hash, enc_key) => {
  try {
    try {
      if (await RNSecureStorage.get(Config.ENC_KEY_STORAGE_IDENTIFIER)) {
        console.log('Old key identified, removing...');
        await RNSecureStorage.remove(Config.ENC_KEY_STORAGE_IDENTIFIER);
      }
    } catch (err) {
      console.log("Error while fetching ", err);
    }
    await RNSecureStorage.set(
      Config.ENC_KEY_STORAGE_IDENTIFIER,
      JSON.stringify({ hash, enc_key }),
      {accessible: ACCESSIBLE.WHEN_UNLOCKED}
    );
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

export const fetch = async hash_current => {
  try {
    const value = await RNSecureStorage.get(Config.ENC_KEY_STORAGE_IDENTIFIER);
    if (!value) {
      throw new Error('Identifier missing');
    }

    const { hash, enc_key } = JSON.parse(value);
    if (hash_current !== hash) {
      throw new Error('Nothing exist against the provided key');
    }
    return enc_key;
  } catch (err) {
    console.log('Secure storage fetch error ', err);
    throw err;
  }
};

export const remove = async key => {
  try {
    await RNSecureStorage.remove(key);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};
