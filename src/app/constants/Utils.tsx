import moment from "moment";
import ConnectivityTracker from "react-native-connectivity-tracker";
let CryptoJS = require("crypto-js");
import DeviceInfo from "react-native-device-info";

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

//TODO: for sorting date wise transaction data
const sortFunction = (a: any, b: any) => {
  var dateA = new Date(a.received).getTime();
  var dateB = new Date(b.received).getTime();
  return dateA < dateB ? 1 : -1;
};

//TODO: func two date diff days count
const date_diff_indays = (date1: any, date2: any) => {
  try {
    let dt1 = new Date(date1);
    let dt2 = new Date(date2);
    return Math.floor(
      (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
        Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
        (1000 * 60 * 60 * 24)
    );
  } catch (error) {
    console.log(error);
  }
};

const getDeviceModel = () => {
  let model = DeviceInfo.getModel();
  let modelName;
  if (model == "iPhone 6s" || model == "iPhone 6") {
    modelName = "Iphone6";
  } else if (
    model == "iPhone XS" ||
    model == "iPhone XS Max" ||
    model == "iPhone XR" ||
    model == "iPhone X"
  ) {
    modelName = "IphoneX";
  }
  return modelName;
};

module.exports = {
  getUnixTimeDate,
  getUnixToDateFormat,
  getUnixToNormaDateFormat,
  getNetwork,
  encrypt,
  encryptAgain,
  decrypt,
  sortFunction,
  date_diff_indays,
  getDeviceModel
};
