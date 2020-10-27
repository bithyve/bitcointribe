import moment from 'moment';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const GoogleDrive = NativeModules.GoogleDrive;
const iCloud = NativeModules.iCloud;
let dataObject;
let callBack;
let share;
let recoveryCallback;
// check storage permission
export const checkPermission = async () => {
  try {
    const userResponse = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);
    return userResponse;
  } catch (err) {
    // console.log(err);
  }
  return null;
};

export const CheckCloudDataBackup = (recoveryCallback1) =>{
  recoveryCallback = recoveryCallback1;
  if (Platform.OS == 'ios') {
    // console.log(iCloud.startBackup("sfsfsdfsdfsf"));
    iCloud.downloadBackup().then((backedJson) => {
       console.log('BackedUp JSON: DONE');
      if(backedJson)
      recoveryCallback(backedJson);
      else
      recoveryCallback(null);
    });
  } else {
    let checkDataIsBackedup = true;
    GoogleDriveLogin({checkDataIsBackedup});
  }
}

export const CloudDataBackup = (data, callback, share?) => {
  dataObject = data;
  callBack = callback;
  share = share ? share : {};
  if (Platform.OS == 'ios') {
    iCloud.downloadBackup().then((backedJson) => {
       console.log('BackedUp JSON: DONE', backedJson);
      if (backedJson) {
        updateData({result1: backedJson, googleData: '', share});
      } else {
        createFile({});
      }
    });
  } else {
    GoogleDriveLogin({share});
  }
};

export const GoogleDriveLogin = (params: {checkDataIsBackedup?: boolean, share?: any}) => {
  let { checkDataIsBackedup, share } = params;
  GoogleDrive.setup()
    .then(() => {
      GoogleDrive.login((err, data) => {
        handleLogin({err, data, checkDataIsBackedup, share});
      });
    })
    .catch((err) => {
      // console.log('GOOGLE SetupFail', err);
    });
};

export const handleLogin = async (params : {err: any; data: any; checkDataIsBackedup?: boolean; share?: any;}) => {
  let {err, data, checkDataIsBackedup, share} = params;
  const result = err || data;
  console.log('GOOGLE ReSULT', data);
  // console.log('Error', e);
  if (result.eventName == 'onLogin') {
    if (!(await checkPermission())) {
      throw new Error('Storage Permission Denied');
    }
    //this.createFile();
    checkFileIsAvailable({checkDataIsBackedup: params.checkDataIsBackedup, share});
  }
};

export const checkFileIsAvailable = async (params: {checkDataIsBackedup?: boolean, share?: any}) => {
  /**
   * TODO: Check if file exist if not then create new file having name HexaWalletBackup.json
   * If file exist then call 
   */
  let { checkDataIsBackedup, share } = params;
  const metaData = {
    name: 'HexaWalletBackup.json',
    description: 'Backup data for my app',
    mimeType: 'application/json',
  };
  await GoogleDrive.checkIfFileExist(JSON.stringify(metaData), (err, data) => {
    // console.log('err, data', data, err);
    const result = err || data;
    // console.log('checkFileIsAvailable', result);
    if(!checkDataIsBackedup){
      if (result && result.eventName == 'listEmpty') {
        createFile({share});
      } else if (result.eventName == 'failure') {
        console.log('FAILURE');
      } else {
        readFile({result, share});
      }
    } else{
      readFile({result, checkDataIsBackedup, share});
    }
  });
};

export const createFile = (params:{share?: any}) => {
  let { share } = params;
  let WalletData = [];
  const { data } = dataObject.regularAccount.getWalletId();
  let tempData = {
    levelStatus: dataObject.levelStatus,
    walletName: dataObject.walletName,
    walletId: data.walletId,
    data: dataObject.encryptedCloudDataJson,
    shares: dataObject.shares,
    keeperData: dataObject.keeperData,
    dateTime: moment(new Date()),
  };
  WalletData.push(tempData);

  if (Platform.OS === 'ios') {
    iCloud.startBackup(JSON.stringify(WalletData));
    callBack(share);
  } else {
    const metaData = {
      name: 'HexaWalletBackup.json',
      description: 'Backup data for my app',
      mimeType: 'application/json',
      data: JSON.stringify(WalletData),
    };

    try {
      GoogleDrive.uploadFile(JSON.stringify(metaData), (data, err) => {
        // console.log('DATA', data);
        const result = err || data;
        if (result.eventName == 'successFullyUpload') {
          callBack(share);
          //dataObject.onPressSetStatus();
        }
      });
      // uploadFile(JSON.stringify(content))
    } catch (error) {
      //console.log('error', error);
    }
  }
};

export const UpdateFile = (params : {metaData: any, share?: any}) => {
  let { metaData, share } = params;
  try {
    GoogleDrive.updateFile(JSON.stringify(metaData), (data, err) => {
      // console.log('DATA updateFile', data);
      // console.log('ERROR updateFile', err);
      const result = err || data;
      if (result.eventName == 'successFullyUpdate') {
        callBack(share);
      }
      console.log('GoogleDrive.updateFile', result);
    });
  } catch (error) {
    console.log('error', error);
  }
};

export const readFile = (params: {result: any, checkDataIsBackedup?: any, share?: any}) => {
  let { result, checkDataIsBackedup, share } = params;
  const metaData = {
    id: result.id,
  };
  try {
    GoogleDrive.readFile(JSON.stringify(metaData), (data1, err) => {
      const result1 = err || data1.data;
      if(checkDataIsBackedup){
        recoveryCallback(result1);
      }else{
        updateData({result1, googleData: result, share});
      }
      
    });
  } catch (error) {
    //console.log('error', error);
  }
};

export const updateData = (params: {result1: any, googleData: any, share?: any}) => {
  let {result1, googleData, share} = params;
  const { data } = dataObject.regularAccount.getWalletId();
  var arr = [];
  var newArray = [];
  if (result1) {
    try {
      arr = JSON.parse(result1);
    } catch (error) {
      console.log('ERROR', error);
    }
    if (arr && arr.length) {
      for (var i = 0; i < arr.length; i++) {
        newArray.push(arr[i]);
      }
    }
    var index = newArray.findIndex((x) => x.walletId == data.walletId);
    //console.log('sdgsdg', index);
    if (index === -1) {
      let tempData = {
        levelStatus: dataObject.levelStatus,
        walletName: dataObject.walletName,
        walletId: data.walletId,
        data: dataObject.encryptedCloudDataJson,
        shares: dataObject.shares,
        keeperData: dataObject.keeperData,
        dateTime: moment(new Date()),
      };
      newArray.push(tempData);
    } else {
      newArray[index].levelStatus = dataObject.levelStatus;
      newArray[index].data = dataObject.encryptedCloudDataJson;
      newArray[index].shares = dataObject.shares;
      newArray[index].keeperData = dataObject.keeperData
      newArray[index].dateTime = moment(new Date());
    }
    console.log('ARR', newArray);
  }
  if (Platform.OS == 'ios') {
    iCloud.startBackup(JSON.stringify(newArray));
    callBack(share);
  } else {
    const metaData = {
      name: googleData.name,
      mimeType: googleData.mimeType,
      data: JSON.stringify(newArray),
      id: googleData.id,
    };
    UpdateFile({metaData, share});
  }
};
