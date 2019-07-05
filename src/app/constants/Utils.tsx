import moment from "moment";
import ConnectivityTracker from "react-native-connectivity-tracker";
let CryptoJS = require( "crypto-js" );
import DeviceInfo from "react-native-device-info";
import bip39 from "bip39";
import Singleton from "HexaWallet/src/app/constants/Singleton";
//TODO: Date Format

const getUnixTimeDate = date => {
  const dateTime = new Date( date ).getTime();
  const lastUpdateDate = Math.floor( dateTime / 1000 );
  return lastUpdateDate;
};

const getUnixToDateFormat = unixDate => {
  return moment.unix( unixDate ).format( "DD-MM-YYYY HH:mm:ss" );
};
const getUnixToNormaDateFormat = unixDate => {
  return moment.unix( unixDate ).format( "DD-MM-YYYY" );

};

const getUnixToDateFormat1 = () => {
  return moment().format( 'hh:mm a , DD MMM YYYY' );
}

const getUnixToDateFormat2 = () => {
  return moment().format( 'DD MMM YYYY , hh:mm a' );
}

//TODO: Network check
let isNetwork;
const onConnectivityChange = ( isConnected, timestamp, connectionInfo ) => {
  console.log( "connection state change" );
  isNetwork = isConnected;
};

ConnectivityTracker.init( {
  onConnectivityChange,
  attachConnectionInfo: false,
  onError: msg => console.log( msg )
  // verifyServersAreUp: () => store.dispatch(checkOurServersAreUp()),
} );

const getNetwork = value => {
  return isNetwork;
};

const encrypt = ( data: any, password: string ) => {
  let ciphertext = CryptoJS.AES.encrypt( data, password );
  return ciphertext.toString();
};

const encryptAgain = ( data: any, password: string ) => {
  let ciphertext = CryptoJS.AES.encrypt( data, password, {
    mode: CryptoJS.mode.ECB
  } );
  console.log( { ciphertext } );
  return ciphertext.toString();
};

const decrypt = ( data: any, password: string ) => {
  let bytes = CryptoJS.AES.decrypt( data, password );
  let str = false;
  try {
    str = bytes.toString( CryptoJS.enc.Utf8 );
  } catch ( e ) { }
  return str;
};

//TODO: for sorting date wise transaction data
const sortFunction = ( a: any, b: any ) => {
  var dateA = new Date( a.received ).getTime();
  var dateB = new Date( b.received ).getTime();
  return dateA < dateB ? 1 : -1;
};

//TODO: func two date diff days count
const date_diff_indays = ( date1: any, date2: any ) => {
  try {
    let dt1 = new Date( date1 );
    let dt2 = new Date( date2 );
    return Math.floor(
      ( Date.UTC( dt2.getFullYear(), dt2.getMonth(), dt2.getDate() ) -
        Date.UTC( dt1.getFullYear(), dt1.getMonth(), dt1.getDate() ) ) /
      ( 1000 * 60 * 60 * 24 )
    );
  } catch ( error ) {
    console.log( error );
  }
};

const getRandomBetweenNumber = ( min: number, max: number ) => {
  let arr_Number = [];
  for ( let i = 0; i < 3; i++ ) {
    let value = min + Math.floor( Math.random() * ( max - min ) )
    if ( arr_Number.indexOf( value ) !== -1 ) {
      arr_Number.push( min + Math.floor( Math.random() * ( max - min ) ) );
    } else {
      arr_Number.push( value )
    }
  }
  return arr_Number;
}

const getDeviceModel = () => {
  let model = DeviceInfo.getModel();
  let modelName;
  if ( model == "iPhone 6s" || model == "iPhone 6" ) {
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


const getStatusBarHeight = () => {
  let model = DeviceInfo.getModel();
  let height;
  if (
    model == "iPhone XS" ||
    model == "iPhone XS Max" ||
    model == "iPhone XR" ||
    model == "iPhone X"
  ) {
    height = 44;
  }
  else {
    height = 20;
  }
  return height;
}


const getIphoneSize = () => {
  let model = DeviceInfo.getModel();
  var iphoneSeries = "IPhone X";
  if (
    model == "iPhone XS" ||
    model == "iPhone XS Max" ||
    model == "iPhone XR" ||
    model == "iPhone X"
  ) {
    iphoneSeries = "iphone X";
  }
  else {
    iphoneSeries = "!iphone X"
  }
  return iphoneSeries;
}


const getMnemonic = () => {
  let mnemonic = bip39.generateMnemonic();
  return mnemonic.split( " " );
}

const isJson = ( str: string ) => {
  try {
    JSON.parse( str );
  } catch ( e ) {
    return false;
  }
  return true;
}

//Get and Set WalletDetails
const getWalletDetails = () => {
  let commonData = Singleton.getInstance();
  return commonData.getWalletDetails();
}
const setWalletDetails = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setWalletDetails( value );
  return true;
}
//Get and Set SetupWallet
const getSetupWallet = () => {
  let commonData = Singleton.getInstance();
  return commonData.getSetupWallet();
}


const setSetupWallet = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setSetupWallet( value );
  return true;
}

//TODO: Singleton  Set and Get RootViewController
const getRootViewController = () => {
  let commonData = Singleton.getInstance();
  return commonData.getRootViewController();
}
const setRootViewController = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setRootViewController( value );
  return true;
}

//TODO: Singleton Set and Get DeepLinkingUrl
const getDeepLinkingUrl = () => {
  let commonData = Singleton.getInstance();
  return commonData.getDeepLinkingUrl();
}
const setDeepLinkingUrl = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setDeepLinkingUrl( value );
  return true;
}

//TODO: Singleton Set and Get DeepLinkingType
const getDeepLinkingType = () => {
  let commonData = Singleton.getInstance();
  return commonData.getDeepLinkingType();
}
const setDeepLinkingType = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setDeepLinkingType( value );
  return true;
}

//TODO: Singleton SSS Details Get and Set Values
const getSSSDetails = () => {
  let commonData = Singleton.getInstance();
  return commonData.getSSSDetails();
}
const setSSSDetails = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setSSSDetails( value );
  return true;
}
//TODO: Singleton SSS Details RecordIDWise Get and Set Values
const getSSSDetailsRecordIDWise = () => {
  let commonData = Singleton.getInstance();
  return commonData.getSSSDetailsRecordIDWise();
}
const setSSSDetailsRecordIDWise = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setSSSDetailsRecordIDWise( value );
  return true;
}

//TODO: Singleton App Health Status
const getAppHealthStatus = () => {
  let commonData = Singleton.getInstance();
  return commonData.getAppHealthStatus();
}
const setAppHealthStatus = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setAppHealthStatus( value );
  return true;
}

//TODO: Singleton Bitcoin Class


const getRegularAccountObject = () => {
  let commonData = Singleton.getInstance();
  return commonData.getRegularAccountObject();
}

const setRegularAccountObject = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setRegularAccountObject( value );
  return true;
}

const getSecureAccountObject = () => {
  let commonData = Singleton.getInstance();
  return commonData.getSecureAccountObject();
}
const setSecureAccountObject = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setSecureAccountObject( value );
  return true;
}

const getS3ServiceObject = () => {
  let commonData = Singleton.getInstance();
  return commonData.getS3ServiceObject();
}
const setS3ServiceObject = ( value: any ) => {
  let commonData = Singleton.getInstance();
  commonData.setS3ServiceObject( value );
  return true;
}


module.exports = {
  getUnixTimeDate,
  getUnixToDateFormat,
  getUnixToNormaDateFormat,
  getUnixToDateFormat1,
  getUnixToDateFormat2,
  getNetwork,
  encrypt,
  encryptAgain,
  decrypt,
  sortFunction,
  date_diff_indays,
  getRandomBetweenNumber,
  getDeviceModel,
  getStatusBarHeight,
  getIphoneSize,
  isJson,

  //Singleton          
  getMnemonic,
  getWalletDetails,
  setWalletDetails,
  getSetupWallet,
  setSetupWallet,
  getRootViewController,
  setRootViewController,
  getDeepLinkingUrl,
  setDeepLinkingUrl,
  getDeepLinkingType,
  setDeepLinkingType,

  //Singleton SSS Details
  getSSSDetails,
  setSSSDetails,
  getSSSDetailsRecordIDWise,
  setSSSDetailsRecordIDWise,

  //Singleton App Health Status
  getAppHealthStatus,
  setAppHealthStatus,

  //Singleton Bitcoin Class
  getRegularAccountObject,
  setRegularAccountObject,
  getSecureAccountObject,
  setSecureAccountObject,
  getS3ServiceObject,
  setS3ServiceObject
};   
