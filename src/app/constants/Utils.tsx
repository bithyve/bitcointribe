import moment from "moment";
import ConnectivityTracker from "react-native-connectivity-tracker";
let CryptoJS = require("crypto-js");

//TODO: Date Format

const getUnixTimeDate = date => {
  const dateTime = new Date(date).getTime();
  const lastUpdateDate = Math.floor(dateTime / 1000);
  return lastUpdateDate;
};

const getUnixToDateFormat = unixDate => {
  return moment.unix(unixDate).format("DD-MM-YYYY HH:mm:ss");
};
const getUnixToNormaDateFormat = unixDate => {
  return moment.unix(unixDate).format("DD-MM-YYYY");
};

//TODO: Network check
let isNetwork;
const onConnectivityChange = (isConnected, timestamp, connectionInfo) => {
  console.log("connection state change");
  isNetwork = isConnected;
};

ConnectivityTracker.init({
  onConnectivityChange,
  attachConnectionInfo: false,
  onError: msg => console.log(msg)
  // verifyServersAreUp: () => store.dispatch(checkOurServersAreUp()),
});

const getNetwork = value => {
  return isNetwork;
};
  
const encrypt = (data: any, password: string) => {
  let ciphertext = CryptoJS.AES.encrypt(data, password);
  return ciphertext.toString();   
};

const encryptAgain = (data: any, password: string) => {
  let ciphertext = CryptoJS.AES.encrypt(data, password, {
    mode: CryptoJS.mode.ECB
  });
  console.log({ ciphertext });
  return ciphertext.toString();
};

const decrypt = (data: any, password: string) => {
  let bytes = CryptoJS.AES.decrypt(data, password);
  let str = false;
  try {
    str = bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {}
  return str;
};

module.exports = {
  getUnixTimeDate,
  getUnixToDateFormat,
  getUnixToNormaDateFormat,
  getNetwork,
  encrypt,
  encryptAgain,
  decrypt
};
