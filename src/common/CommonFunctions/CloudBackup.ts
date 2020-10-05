import moment from 'moment';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const GoogleDrive = NativeModules.GoogleDrive;
const iCloud = NativeModules.iCloud;
let dataObject;
let callBack;
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
      console.log('BackedUp JSON: ', backedJson);
      if(backedJson)
      recoveryCallback(backedJson);
      else
      recoveryCallback(null);
    });
  } else {
    let checkDataIsBackedup = true;
    GoogleDriveLogin(checkDataIsBackedup);
  }
}

export const CloudDataBackup = (data, callback) => {
  dataObject = data;
  callBack = callback;
  if (Platform.OS == 'ios') {
    // console.log(iCloud.startBackup("sfsfsdfsdfsf"));
    iCloud.downloadBackup().then((backedJson) => {
      console.log('BackedUp JSON: ', backedJson);
      if (backedJson) {
        updateData(backedJson, '');
      } else {
        createFile();
      }
    });
  } else {
    GoogleDriveLogin();
  }
};

export const GoogleDriveLogin = (checkDataIsBackedup?) => {
  GoogleDrive.setup()
    .then(() => {
      GoogleDrive.login((err, data) => {
        handleLogin(err, data, checkDataIsBackedup);
      });
    })
    .catch((err) => {
      // console.log('GOOGLE SetupFail', err);
    });
};

export const handleLogin = async (e, data, checkDataIsBackedup?) => {
  const result = e || data;
  console.log('GOOGLE ReSULT', data);
  // console.log('Error', e);
  if (result.eventName == 'onLogin') {
    if (!(await checkPermission())) {
      throw new Error('Storage Permission Denied');
    }
    //this.createFile();
    checkFileIsAvailable(checkDataIsBackedup);
  }
};

export const checkFileIsAvailable = async (checkDataIsBackedup?) => {
  /**
   * TODO: Check if file exist if not then create new file having name HexaWalletBackup.json
   * If file exist then call readFile
   */
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
        createFile();
      } else if (result.eventName == 'failure') {
        console.log('FAILURE');
      } else {
        readFile(result);
      }
    } else{
      readFile(result, checkDataIsBackedup);
    }
    
  });
};

export const createFile = () => {
  let WalletData = [];
  const { data } = dataObject.regularAccount.getWalletId();
  let tempData = {
    walletName: dataObject.walletName,
    walletId: data.walletId,
    data: dataObject.encryptedCloudDataJson,
    dateTime: new Date(),
    shares: dataObject.shares,
  };
  WalletData.push(tempData);

  if (Platform.OS === 'ios') {
    iCloud.startBackup(JSON.stringify(WalletData));
    callBack();
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
          callBack();
          //dataObject.onPressSetStatus();
        }
      });
      // uploadFile(JSON.stringify(content))
    } catch (error) {
      //console.log('error', error);
    }
  }
};

export const UpdateFile = (metaData) => {
  try {
    GoogleDrive.updateFile(JSON.stringify(metaData), (data, err) => {
      // console.log('DATA updateFile', data);
      // console.log('ERROR updateFile', err);
      const result = err || data;
      if (result.eventName == 'successFullyUpdate') {
        callBack();
      }
      console.log('GoogleDrive.updateFile', result);
    });
  } catch (error) {
    console.log('error', error);
  }
};

export const readFile = (result, checkDataIsBackedup?) => {
  const metaData = {
    id: result.id,
  };
  try {
    GoogleDrive.readFile(JSON.stringify(metaData), (data1, err) => {
      const result1 = err || data1.data;
      if(checkDataIsBackedup){
        recoveryCallback(result1);
      }else{
        updateData(result1, result);
      }
      
    });
  } catch (error) {
    //console.log('error', error);
  }
};

export const updateData = (result1, googleData) => {
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
        walletName: dataObject.walletName,
        walletId: data.walletId,
        data: dataObject.encryptedCloudDataJson,
        dateTime: moment(new Date()),
        shares: dataObject.shares,
      };
      newArray.push(tempData);
    } else {
      newArray[index].data = dataObject.encryptedCloudDataJson;
      newArray[index].shares = dataObject.shares;
      newArray[index].dateTime = moment(new Date());
    }
    console.log('ARR', newArray);
  }
  if (Platform.OS == 'ios') {
    iCloud.startBackup(JSON.stringify(newArray));
    callBack();
  } else {
    const metaData = {
      name: googleData.name,
      mimeType: googleData.mimeType,
      data: JSON.stringify(newArray),
      id: googleData.id,
    };
    UpdateFile(metaData);
  }
};
