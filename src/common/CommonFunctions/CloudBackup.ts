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
  public googleCloudLoginCallback;

  constructor(stateVars?: {
    dataObject?: any;
    callBack?: any;
    share?: any;
    recoveryCallback?: any;
    googlePermissionCall?: any;
    googleCloudLoginCallback?: any;
  }) {
    let { recoveryCallback, share, callBack, dataObject, googlePermissionCall, googleCloudLoginCallback } = stateVars;
    if (dataObject) this.dataObject = dataObject;
    if (callBack) this.callBack = callBack;
    if (share) this.share = share;
    if (recoveryCallback) this.recoveryCallback = recoveryCallback;
    if (googlePermissionCall) this.googlePermissionCall = googlePermissionCall;
    if (googleCloudLoginCallback) this.googleCloudLoginCallback = googleCloudLoginCallback;
  }

  // check storage permission
  public checkPermission = async () => {
    try {
      const userResponse = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      console.log("userResponse",userResponse);
      return userResponse;
    } catch (err) {
      throw new Error( err )
      console.log(err);
    }
  };

  public CheckCloudDataBackup = (recoveryCallback1) => {
    try {
      this.recoveryCallback = recoveryCallback1;
      if (Platform.OS == 'ios') {
        // console.log(iCloud.startBackup("sfsfsdfsdfsf"));
        iCloud.downloadBackup().then((backedJson) => {
          //console.log('BackedUp JSON: DONE', backedJson);
          if (backedJson) this.recoveryCallback(backedJson);
          else this.recoveryCallback(null);
        });
      } else {
        console.log('isNotReading', this.isNotReading);
        let checkDataIsBackedup = true;
        this.GoogleDriveLogin({ checkDataIsBackedup });
      }
    } catch (error) {
      throw new Error( error )
    }
  };

  public CloudDataBackup = (data, callback, share?) => {
    //console.log('share inside cloud', share);
    try{
    this.dataObject = data;
    this.callBack = callback;
    this.share = share ? share : {};
    if (Platform.OS == 'ios') {
      iCloud.downloadBackup().then((backedJson) => {
        console.log('BackedUp JSON: DONE', backedJson);
        if (backedJson) {
          this.updateData({
            result1: backedJson,
            googleData: '',
            share: this.share,
          });
        } else {
          console.log('createFile');
          this.createFile({});
        }
      });
    } else {
      console.log('isNotReading', this.isNotReading);
      this.GoogleDriveLogin({ share: this.share });
    }
  } catch(error){
    console.log("CloudDataBackup error", error);
    throw new Error( error )
  }
  };

  public GoogleDriveLogin = (params: {
    checkDataIsBackedup?: boolean;
    share?: any;
    googlePermissionCall? : any,
    googleCloudLoginCallback? : any,
  }) => {
    try {
    let { checkDataIsBackedup, share, googlePermissionCall, googleCloudLoginCallback } = params;
    this.googleCloudLoginCallback = googleCloudLoginCallback;
    GoogleDrive.setup()
      .then(() => {
        GoogleDrive.login(async (err, data) => {
          if (!googlePermissionCall)
          this.handleLogin({ err, data, checkDataIsBackedup, share });
          else{
            const result = err || data;
            console.log('GOOGLE ReSULT', data);
            console.log('Error', err);
            if (result.eventName == 'onLogin') {
              this.googleCloudLoginCallback('success');
          }
          }
        });
      })
      .catch((err) => {
        console.log('GOOGLE SetupFail', err);
        throw new Error( err )
      });
    } catch (error) {
      throw new Error( error )
    }
  };

  public handleLogin = async (params: {
    err: any;
    data: any;
    checkDataIsBackedup?: boolean;
    share?: any;
  }) => {
    try {
      console.log('isNotReading handleLogin', this.isNotReading);
      let { err, data, checkDataIsBackedup, share } = params;
      const result = err || data;
      console.log('handleLogin err', err);
      console.log('GOOGLE ReSULT', data);
      if (result.eventName == 'onLogin') {
        this.checkFileIsAvailable({
          checkDataIsBackedup: params.checkDataIsBackedup,
          share,
        });
      }
    } catch (error) {
      throw new Error( error )
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
    try {
      console.log('isNotReading checkFileIsAvailable', this.isNotReading);
      let { checkDataIsBackedup, share } = params;
      const metaData = {
        name: 'HexaWalletBackup.json',
        description: 'Backup data for my app',
        mimeType: 'application/json',
      };
      console.log('checkFileIsAvailable err', share);
      await GoogleDrive.checkIfFileExist(
        JSON.stringify(metaData),
        (err, data) => {
          // console.log('err, data', data, err);
          const result = err || data;
          console.log('checkFileIsAvailable', result);
          if (!checkDataIsBackedup) {
            if (result && result.eventName == 'listEmpty') {
              console.log('createFile');
              this.createFile({ share });
            } else if (result.eventName == 'failure') {
              console.log('FAILURE');
            } else if(result.eventName === 'UseUserRecoverableAuthIOException')
            {
              this.checkFileIsAvailable({ share: this.share });
            // console.log('UseUserRecoverableAuthIOException Failure');
            } else {
              console.log(
                'readFile isNotReading checkFileIsAvailable if',
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
    } catch (error) {
      throw new Error( error )
    }
  };

  public createFile = (params: { share?: any }) => {
    try {
      let { share } = params;
      let WalletData = [];
      const { data } = this.dataObject.regularAccount.getWalletId();
      let tempData = {
        levelStatus: this.dataObject.levelStatus,
        walletName: this.dataObject.walletName,
        questionId: this.dataObject.questionId,
        question: this.dataObject.question,
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

          GoogleDrive.uploadFile(JSON.stringify(metaData), (data, err) => {
            console.log('DATA', data, err);
            const result = err || data;
            if (result && result.eventName == 'successFullyUpload') {
              this.callBack(share);
            } else if (result && result.eventName === 'UseUserRecoverableAuthIOException') {
              this.checkFileIsAvailable({ share: this.share });
            } 
          });
          // uploadFile(JSON.stringify(content))
      
      }
    } catch (error) {
      throw new Error( error )
    }
  };

  public UpdateFile = (params: { metaData: any; share?: any }) => {
    let { metaData, share } = params;
    try {
      GoogleDrive.updateFile(JSON.stringify(metaData), (data, err) => {
        console.log('DATA updateFile', data);
        console.log('ERROR updateFile', err);
        const result = err || data;
        if (result.eventName == 'successFullyUpdate') {
          this.callBack(share);
        }
        console.log('GoogleDrive.updateFile', result);
      });
    } catch (error) {
      console.log('error', error);
      throw new Error( error )
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
          console.log('isNotReading readFile data1', data1);
          console.log('isNotReading readFile err', err);
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
      console.log('error', error);
      throw new Error( error )
    }
  };

  public updateData = (params: {
    result1: any;
    googleData: any;
    share?: any;
  }) => {
    try {
      let { result1, googleData, share } = params;
      console.log('updateData share', share);
      const { data } = this.dataObject.regularAccount.getWalletId();
      var arr = [];
      var newArray = [];
      if (result1) {
        arr = JSON.parse(result1);
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
            questionId: this.dataObject.questionId,
            question: this.dataObject.question,
            walletId: data.walletId,
            data: this.dataObject.encryptedCloudDataJson,
            shares: this.dataObject.shares,
            keeperData: this.dataObject.keeperData,
            dateTime: moment(new Date()),
          };
          newArray.push(tempData);
        } else {
          newArray[index].questionId = this.dataObject.questionId,
          newArray[index].question = this.dataObject.question,
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
        // console.log('Platform.OS share', share)
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
    } catch (error) {
      throw new Error( error )
    }
  };
}
