import cryptoJS from 'crypto-js';
import { getRandomBytesAsync } from 'expo-random';

export const encrypt = (data, key) => {
  const ciphertext = cryptoJS.AES.encrypt(JSON.stringify(data), key);
  return ciphertext.toString();
};

export const decrypt = (ciphertext, key) => {
  var bytes = cryptoJS.AES.decrypt(ciphertext.toString(), key);
  var decryptedData = JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
  return decryptedData;
};

export const hash = data => cryptoJS.SHA512(data).toString();

export const generateKey = async () => {
  const randomBytes = await getRandomBytesAsync(16);
  return hash(randomBytes.toString());
};
