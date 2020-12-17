import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import moment from 'moment';

const GoogleDrive = NativeModules.GoogleDrive;
const iCloud = NativeModules.iCloud;
export default class CloudBackup {
  public dataObject;
  public callBack;
  public share;
  public recoveryCallback;
  public isNotReading = true;
  public googlePermissionCall = false;

  constructor(stateVars?: {
    dataObject?: any;
    callBack?: any;
    share?: any;
    recoveryCallback?: any;
    googlePermissionCall?: any;
  }) {
    let { recoveryCallback, share, callBack, dataObject, googlePermissionCall } = stateVars;
    if (dataObject) this.dataObject = dataObject;
    if (callBack) this.callBack = callBack;
    if (share) this.share = share;
    if (recoveryCallback) this.recoveryCallback = recoveryCallback;
    if (googlePermissionCall) this.googlePermissionCall = googlePermissionCall;

  }

  // check storage permission
  public checkPermission = async () => {
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

  public CheckCloudDataBackup = (recoveryCallback1) => {
    this.recoveryCallback = recoveryCallback1;
    if (Platform.OS == 'ios') {
      // console.log(iCloud.startBackup("sfsfsdfsdfsf"));
      iCloud.downloadBackup().then((backedJson) => {
        console.log('BackedUp JSON: DONE');
        if (backedJson) this.recoveryCallback(backedJson);
        else this.recoveryCallback(null);
      });
    } else {
      console.log('isNotReading', this.isNotReading);
      let checkDataIsBackedup = true;
      this.GoogleDriveLogin({ checkDataIsBackedup });
    }
  };

  public CloudDataBackup = (data, callback, share?) => {
    // console.log('share inside cloud', share);
    this.dataObject = data;
    this.callBack = callback;
    this.share = share ? share : {};
    if (Platform.OS == 'ios') {
      iCloud.downloadBackup().then((backedJson) => {
        // console.log('BackedUp JSON: DONE', backedJson);
        if (backedJson) {
          this.updateData({
            result1: backedJson,
            googleData: '',
            share: this.share,
          });
        } else {
          this.createFile({});
        }
      });
    } else {
      console.log('isNotReading', this.isNotReading);
      this.GoogleDriveLogin({ share: this.share });
    }
  };

  public GoogleDriveLogin = (params: {
    checkDataIsBackedup?: boolean;
    share?: any;
    googlePermissionCall? : any
  }) => {
    let { checkDataIsBackedup, share, googlePermissionCall } = params;
    GoogleDrive.setup()
      .then(() => {
        GoogleDrive.login(async (err, data) => {
          if (!googlePermissionCall)
          this.handleLogin({ err, data, checkDataIsBackedup, share });
          else{
            const result = err || data;
            console.log('GOOGLE ReSULT', data);
            // console.log('Error', e);
            if (result.eventName == 'onLogin') {
              if (!(await this.checkPermission())) {
                throw new Error('Storage Permission Denied');
              }
            }
          }
        });
      })
      .catch((err) => {
        console.log('GOOGLE SetupFail', err);
      });
  };

  public handleLogin = async (params: {
    err: any;
    data: any;
    checkDataIsBackedup?: boolean;
    share?: any;
  }) => {
    console.log('isNotReading handleLogin', this.isNotReading);
    let { err, data, checkDataIsBackedup, share } = params;
    const result = err || data;
    console.log('GOOGLE ReSULT', data);
    // console.log('Error', e);
    if (result.eventName == 'onLogin') {
      if (!(await this.checkPermission())) {
        throw new Error('Storage Permission Denied');
      }
      //this.createFile();
      this.checkFileIsAvailable({
        checkDataIsBackedup: params.checkDataIsBackedup,
        share,
      });
    }
  };

  public checkFileIsAvailable = async (params: {
    checkDataIsBackedup?: boolean;
    share?: any;
  }) => {
    /**
     * TODO: Check if file exist if not then create new file having name HexaWalletBackup.json
     * If file exist then call
     */
    console.log('isNotReading checkFileIsAvailable', this.isNotReading);
    let { checkDataIsBackedup, share } = params;
    const metaData = {
      name: 'HexaWalletBackup.json',
      description: 'Backup data for my app',
      mimeType: 'application/json',
    };
    await GoogleDrive.checkIfFileExist(
      JSON.stringify(metaData),
      (err, data) => {
        // console.log('err, data', data, err);
        const result = err || data;
        // console.log('checkFileIsAvailable', result);
        if (!checkDataIsBackedup) {
          if (result && result.eventName == 'listEmpty') {
            this.createFile({ share });
          } else if (result.eventName == 'failure') {
            console.log('FAILURE');
          } else {
            console.log(
              'isNotReading checkFileIsAvailable if',
              this.isNotReading,
            );
            this.readFile({ result, share });
          }
        } else {
          console.log(
            'isNotReading checkFileIsAvailable else',
            this.isNotReading,
          );
          this.readFile({ result, checkDataIsBackedup, share });
        }
      },
    );
  };

  public createFile = (params: { share?: any }) => {
    let { share } = params;
    let WalletData = [];
    const { data } = this.dataObject.regularAccount.getWalletId();
    let tempData = {
      levelStatus: this.dataObject.levelStatus,
      walletName: this.dataObject.walletName,
      walletId: data.walletId,
      data: this.dataObject.encryptedCloudDataJson,
      shares: this.dataObject.shares,
      keeperData: this.dataObject.keeperData,
      dateTime: moment(new Date()),
    };
    WalletData.push(tempData);

    if (Platform.OS === 'ios') {
      iCloud.startBackup(JSON.stringify(WalletData));
      this.callBack(share);
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
            this.callBack(share);
            //dataObject.onPressSetStatus();
          }
        });
        // uploadFile(JSON.stringify(content))
      } catch (error) {
        //console.log('error', error);
      }
    }
  };

  public UpdateFile = (params: { metaData: any; share?: any }) => {
    let { metaData, share } = params;
    try {
      GoogleDrive.updateFile(JSON.stringify(metaData), (data, err) => {
        // console.log('DATA updateFile', data);
        // console.log('ERROR updateFile', err);
        const result = err || data;
        if (result.eventName == 'successFullyUpdate') {
          this.callBack(share);
        }
        console.log('GoogleDrive.updateFile', result);
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  public readFile = (params: {
    result: any;
    checkDataIsBackedup?: any;
    share?: any;
  }) => {
    let { result, checkDataIsBackedup, share } = params;
    const metaData = { id: result.id };
    console.log('isNotReading readFile', this.isNotReading);
    try {
      if (this.isNotReading) {
        this.isNotReading = false;
        GoogleDrive.readFile(JSON.stringify(metaData), (data1, err) => {
          console.log('isNotReading readFile data1', this.isNotReading, data1);
          console.log('isNotReading readFile err', this.isNotReading, err);
          const result1 = err || data1.data;
          if (checkDataIsBackedup) {
            this.recoveryCallback(result1);
          } else {
            this.updateData({ result1, googleData: result, share });
          }
          if (result1) this.isNotReading = true;
        });
      }
    } catch (error) {
      //console.log('error', error);
    }
  };

  public updateData = (params: {
    result1: any;
    googleData: any;
    share?: any;
  }) => {
    let { result1, googleData, share } = params;
    const { data } = this.dataObject.regularAccount.getWalletId();
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
          levelStatus: this.dataObject.levelStatus,
          walletName: this.dataObject.walletName,
          walletId: data.walletId,
          data: this.dataObject.encryptedCloudDataJson,
          shares: this.dataObject.shares,
          keeperData: this.dataObject.keeperData,
          dateTime: moment(new Date()),
        };
        newArray.push(tempData);
      } else {
        newArray[index].levelStatus = this.dataObject.levelStatus;
        newArray[index].data = this.dataObject.encryptedCloudDataJson;
        newArray[index].shares = this.dataObject.shares ? this.dataObject.shares : newArray[index].shares;
        newArray[index].keeperData = this.dataObject.keeperData;
        newArray[index].dateTime = moment(new Date());
      }
      console.log('ARR', newArray);
    }
    if (Platform.OS == 'ios') {
      iCloud.startBackup(JSON.stringify(newArray));
      this.callBack(share);
    } else {
      console.log("GOOGLEDATA", googleData);
      const metaData = {
        name: googleData.name,
        mimeType: googleData.mimeType,
        data: JSON.stringify(newArray),
        id: googleData.id,
      };
      this.UpdateFile({ metaData, share });
    }
  };
}
