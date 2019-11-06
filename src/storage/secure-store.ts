import * as SecureStore from 'expo-secure-store';

export const store = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

export const fetch = async key => {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (!value) {
      throw new Error('Nothing exist against the provided key');
    }
    return value;
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
