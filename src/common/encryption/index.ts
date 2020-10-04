import cryptoJS from "crypto-js";
import { getRandomBytesAsync } from "expo-random";

export const encrypt = (data, key) => {
  const ciphertext = cryptoJS.AES.encrypt(JSON.stringify(data), key);
  return ciphertext.toString();
};

export const decrypt = (ciphertext, key) => {
  try{
    var bytes = cryptoJS.AES.decrypt(ciphertext.toString(), key);
    var decryptedData = JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
    return decryptedData;
  } catch(e){
    return null;
  }
  
};

export const decrypt1 = (ciphertext, key) => {
  const info2 = cryptoJS.AES.decrypt(ciphertext, key).toString(cryptoJS.enc.Utf8);
  return info2;
}
export const hash = data => cryptoJS.SHA512(data).toString();

export const generateKey = async () => {
  const randomBytes = await getRandomBytesAsync(16);
  return hash(randomBytes.toString());
};
