import moment from "moment";
import { NativeModules, PermissionsAndroid } from "react-native";

const GoogleDrive = NativeModules.GoogleDrive;
let dataObject;
let callBack;
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

export const GoogleDriveLogin = (data, callback) => {
    dataObject = data;
    callBack = callback;
    GoogleDrive.setup()
      .then(() => {
        GoogleDrive.login((err, data) => {
          handleLogin(err, data);
        });
      })
      .catch((err) => {
       // console.log('GOOGLE SetupFail', err);
      });
  };

  export const handleLogin = async (e, data) => {
    const result = e || data;
   // console.log('GOOGLE ReSULT', data);
   // console.log('Error', e);
    if (result.eventName == 'onLogin') {
      if (!(await checkPermission())) {
        throw new Error('Storage Permission Denied');
      }
      //this.createFile();
      checkFileIsAvailable();
    }
  };

  export const checkFileIsAvailable = async () => {
    /**
     * TODO: Check if file exist if not then create new file having name HexaBackupLatest.db
     * If file exist then call readFile
     */
    const metaData = {
      name: 'HexaBackupLatest.db',
      description: 'Backup data for my app',
      mimeType: 'application/json',
    };
    await GoogleDrive.checkIfFileExist(
      JSON.stringify(metaData),
      (err, data) => {
       // console.log('err, data', data, err);
        const result = err || data;
       // console.log('checkFileIsAvailable', result);
        if (result.eventName == 'listEmpty') {
          createFile();
        } else {
          readFile(result);
        }
      },
    );
  };

  export const createFile = () => {
    let WalletData = [];
    const { data } = dataObject.regularAccount.getWalletId();
    let tempData = {
      walletName: dataObject.walletName,
      walletId: data.walletId,
      data: dataObject.encryptedCloudDataJson,
      dateTime: new Date(),
      shares: dataObject.shares
    };
    WalletData.push(tempData);

    const metaData = {
      name: 'HexaBackupLatest.db',
      description: 'Backup data for my app',
      mimeType: 'application/json',
      data: JSON.stringify(WalletData),
    };

    try {
      GoogleDrive.uploadFile(JSON.stringify(metaData), (data, err) => {
       // console.log('DATA', data);
       const result = err || data;
        if(result.eventName == 'successFullyUpload'){
            callBack();
            //dataObject.onPressSetStatus();
        }
      });
      // uploadFile(JSON.stringify(content))
    } catch (error) {
      //console.log('error', error);
    }
  };

  export const UpdateFile = (metaData) => {
    try {
      GoogleDrive.updateFile(JSON.stringify(metaData), (data, err) => {
       // console.log('DATA updateFile', data);
       // console.log('ERROR updateFile', err);
        const result = err || data;
        if(result.eventName == 'successFullyUpdate'){
            callBack();
        }
       console.log('GoogleDrive.updateFile', result);
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  export const readFile = (result) => {
    const metaData = {
      id: result.id,
    };
    try {
      GoogleDrive.readFile(JSON.stringify(metaData), (data1, err) => {
        const { data } = dataObject.regularAccount.getWalletId();
        const result1 = err || data1;
        var arr = [];
        var newArray = [];
        if (result1.data) {
          arr = JSON.parse(result1.data);
          for (var i = 0; i < arr.length; i++) {
            newArray.push(arr[i]);
          }
          var index = newArray.findIndex((x) => x.walletId == data.walletId);
          //console.log('sdgsdg', index);
          if (index === -1) {
            let tempData = {
              walletName: dataObject.walletName,
              walletId: data.walletId,
              data: dataObject.encryptedCloudDataJson,
              dateTime: moment(new Date()),
              shares: dataObject.shares
            };
            newArray.push(tempData);
          } else {
            newArray[index].data = dataObject.encryptedCloudDataJson;
            newArray[index].shares = dataObject.shares;
            newArray[index].dateTime = moment(new Date());
          }
          //console.log('ARR', newArray);
          const metaData = {
            name: result.name,
            mimeType: result.mimeType,
            data: JSON.stringify(newArray),
            id: result.id,
          };
          UpdateFile(metaData);
        }
      });
    } catch (error) {
      //console.log('error', error);
    }
  };