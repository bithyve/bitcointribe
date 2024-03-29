import { NativeModules, Platform } from 'react-native'
import moment from 'moment'

const GoogleDrive = NativeModules.GoogleDrive
const iCloud = NativeModules.iCloud
export default class CloudBackup {

  public dataObject;
  public callBack;
  public share;
  public recoveryCallback;
  public isNotReading = true;
  public googlePermissionCall = false;

  constructor( stateVars?: {
    dataObject?: any;
    share?: any;
    recoveryCallback?: any;
    googlePermissionCall?: any;
  } ) {
    const { recoveryCallback, share, dataObject, googlePermissionCall } = stateVars
    if ( dataObject ) this.dataObject = dataObject
    if ( share ) this.share = share
    if ( recoveryCallback ) this.recoveryCallback = recoveryCallback
    if ( googlePermissionCall ) this.googlePermissionCall = googlePermissionCall
  }


  public CheckCloudDataBackup = ( recoveryCallback1 ) => {
    try {
      this.recoveryCallback = recoveryCallback1
      if ( Platform.OS == 'ios' ) {
        // console.log(iCloud.startBackup("sfsfsdfsdfsf"));
        iCloud.downloadBackup().then( ( backedJson ) => {
          //console.log('BackedUp JSON: DONE', backedJson);
          if ( backedJson ) this.recoveryCallback( backedJson )
          else this.recoveryCallback( null )
        } )
      } else {
        console.log( 'isNotReading CheckCloudDataBackup', this.isNotReading )
        const checkDataIsBackedup = true
        return this.GoogleDriveLogin( {
          checkDataIsBackedup
        } )
      }
    } catch ( error ) {
      throw new Error( error )
    }
  };

  public CloudDataBackup = async( data, share? ) : Promise<any> => {
    //console.log('share inside cloud', share);
    try{
      this.dataObject = data
      this.share = share ? share : {
      }

      console.log( 'CloudDataBackup STARTED' )
      if ( Platform.OS == 'ios' ) {
        return iCloud.downloadBackup().then( async ( backedJson ) => {
        // console.log('BackedUp JSON: DONE', backedJson);
          if ( backedJson ) {
            return await this.updateData( {
              result1: backedJson,
              googleData: '',
              share: this.share,
            } )
          } else {
            console.log( 'createFile' )
            return await this.createFile( {
            } )
          }
        } )
      } else {
        console.log( 'isNotReading CloudDataBackup', this.isNotReading )
        return await this.GoogleDriveLogin( {
          share: this.share
        } )
      }
    } catch( error ){
      console.log( 'CloudDataBackup error', error )
      throw new Error( error )
    }
  };

  public GoogleDriveLogin = async ( params: {
    checkDataIsBackedup?: boolean;
    share?: any;
    googlePermissionCall? : any,
  } ) : Promise<any> => {
    try {
      const { checkDataIsBackedup, share, googlePermissionCall } = params
      const result = await this.GoogleLogin( params )
      console.log( 'RESULT', result )
      // await GoogleDrive.login( async ( err, data ) => {
      //   const result = err || data
      //   console.log( 'googlePermissionCall######### GoogleDriveLogin', googlePermissionCall )
      //   if ( !googlePermissionCall ){
      //     if ( result.eventName == 'onLogin' ) {
      //       return await this.checkFileIsAvailable( {
      //         checkDataIsBackedup: checkDataIsBackedup,
      //         share,
      //       } )
      //     } else{
      //       console.log( 'GOOGLE SetupFail else', result )
      //       throw new Error( 'Google LoginFail' )
      //     }
      //   }
      //   else{
      //     console.log( 'GOOGLE ReSULT GoogleDriveLogin', result )
      //     if ( result.eventName === 'onLogin' ) {
      //       return 'LoginSuccess'
      //     } else{
      //       console.log( 'GOOGLE SetupFail else', result )
      //       throw new Error( 'Google LoginFail' )
      //     }
      //   }
      // } )


    } catch ( error ) {
      throw new Error( error )
    }
  };

  public GoogleLogin = async ( params: {
    checkDataIsBackedup?: boolean;
    share?: any;
    googlePermissionCall? : any,
  } ) : Promise<any> => {
    try {
      const { checkDataIsBackedup, share, googlePermissionCall } = params
      GoogleDrive.setup()
        .then( async() => {
          await GoogleDrive.login( async ( err, data ) => {
            const result = err || data
            console.log( 'googlePermissionCall######### GoogleDriveLogin', googlePermissionCall )
            if ( !googlePermissionCall ){
              if ( result.eventName == 'onLogin' ) {
                return await this.checkFileIsAvailable( {
                  checkDataIsBackedup: checkDataIsBackedup,
                  share,
                } )
              } else{
                console.log( 'GOOGLE SetupFail else', result )
                throw new Error( 'Google LoginFail' )
              }
            }
            else{
              console.log( 'GOOGLE ReSULT GoogleDriveLogin', result )
              if ( result.eventName === 'onLogin' ) {
                return 'LoginSuccess'
              } else{
                console.log( 'GOOGLE SetupFail else', result )
                throw new Error( 'Google LoginFail' )
              }
            }
          } )

        } )

        .catch( ( err ) => {
          console.log( 'GOOGLE SetupFail', err )
          throw new Error( err )
        } )
    } catch ( error ) {
      throw new Error( error )
    }
  };

  public checkFileIsAvailable = async ( params: {
    checkDataIsBackedup?: boolean;
    share?: any;
  } ) : Promise<any> => {
    /**
     * TODO: Check if file exist if not then create new file having name HexaWalletBackup.json
     * If file exist then call
     */
    try {
      const { checkDataIsBackedup, share } = params
      const metaData = {
        name: 'HexaWalletBackup.json',
        description: 'Backup data for my app',
        mimeType: 'application/json',
      }
      GoogleDrive.checkIfFileExist(
        JSON.stringify( metaData ),
        async ( err, data ) => {
          // console.log('err, data', data, err);
          const result = err || data
          if( !result ) return null
          if ( !checkDataIsBackedup ) {
            if ( result && result.eventName == 'listEmpty' ) {
              console.log( 'createFile' )
              return await this.createFile( {
                share
              } )
            } else if ( result.eventName == 'failure' ) {
              console.log( 'FAILURE' )
              throw new Error( result.eventName )
            } else if( result.eventName === 'UseUserRecoverableAuthIOException' )
            {
              console.log( 'UseUserRecoverableAuthIOException Failure' )
              return await this.checkFileIsAvailable( {
                share: share
              } )
            } else {
              console.log(
                'readFile isNotReading checkFileIsAvailable if' )
              return await this.readFile( {
                result, share
              } )
            }
          } else {
            console.log(
              'isNotReading checkFileIsAvailable else' )
            return await this.readFile( {
              result, checkDataIsBackedup, share
            } )
          }
        },
      )
    } catch ( error ) {
      throw new Error( error )
    }
    return null
  };

  public createFile = async( params: { share?: any } ) : Promise<any> => {
    try {
      const { share } = params
      const WalletData = []
      const { data } = this.dataObject.regularAccount.getWalletId()
      const tempData = {
        levelStatus: this.dataObject.levelStatus,
        walletName: this.dataObject.walletName,
        questionId: this.dataObject.questionId,
        question: this.dataObject.question,
        walletId: data.walletId,
        data: this.dataObject.encryptedCloudDataJson,
        seed: this.dataObject.seed,
        shares: this.dataObject.shares,
        keeperData: this.dataObject.keeperData,
        dateTime: moment( new Date() ),
      }
      WalletData.push( tempData )

      if ( Platform.OS === 'ios' ) {
        return iCloud.startBackup( JSON.stringify( WalletData ) ).then( ( result ) => {
          console.log( 'iCloudStatus', result )
          if( result ) return 'iCloudSuccess'
          else throw new Error( 'iCLoud failure' )
        } ).catch( ( err ) => {
          console.log( 'iCloudStatus err', err )
          throw new Error( err )
        } )
        // this.callBack( share )
      } else {
        const metaData = {
          name: 'HexaWalletBackup.json',
          description: 'Backup data for my app',
          mimeType: 'application/json',
          data: JSON.stringify( WalletData ),
        }

        GoogleDrive.uploadFile( JSON.stringify( metaData ), async ( data, err ) => {
          // console.log('DATA', data, err);
          const result = err || data
          if ( result && result.eventName == 'successFullyUpload' ) {
            return result.eventName
            // this.callBack( share )
          } else if ( result && result.eventName === 'UseUserRecoverableAuthIOException' ) {
            return await this.checkFileIsAvailable( {
              share: this.share
            } )
          }
        } )
      }
    } catch ( error ) {
      throw new Error( error )
    }
    return null
  };

  public readFile = async ( params: {
    result: any;
    checkDataIsBackedup?: any;
    share?: any;
  } ) : Promise<any>  => {
    const { result, checkDataIsBackedup, share } = params
    const metaData = {
      id: result.id
    }
    console.log( 'isNotReading readFile', this.isNotReading )
    try {
      if ( this.isNotReading ) {
        this.isNotReading = false
        GoogleDrive.readFile( JSON.stringify( metaData ), async( data1, err ) => {
          const result1 = err || data1.data
          if ( checkDataIsBackedup ) {
            this.recoveryCallback( result1 )
          } else {
            return await this.updateData( {
              result1, googleData: result, share
            } )
          }
          if ( result1 ) this.isNotReading = true
        } )
      }
    } catch ( error ) {
      console.log( 'error', error )
      throw new Error( error )
    }
  };

  public updateData = async ( params: {
    result1: any;
    googleData: any;
    share?: any;
  } ) : Promise<any> => {
    try {
      const { result1, googleData, share } = params
      console.log( 'updateData share', share )
      const { data } = this.dataObject.regularAccount.getWalletId()
      let arr = []
      const newArray = []
      if ( result1 ) {
        arr = JSON.parse( result1 )
        if ( arr && arr.length ) {
          for ( let i = 0; i < arr.length; i++ ) {
            newArray.push( arr[ i ] )
          }
        }
        const index = newArray.findIndex( ( x ) => x.walletId == data.walletId )
        console.log( 'sdgsdg', index )
        if ( index === -1 ) {
          const tempData = {
            levelStatus: this.dataObject.levelStatus,
            walletName: this.dataObject.walletName,
            questionId: this.dataObject.questionId,
            question: this.dataObject.question,
            walletId: data.walletId,
            data: this.dataObject.encryptedCloudDataJson,
            seed: this.dataObject.seed,
            shares: this.dataObject.shares,
            keeperData: this.dataObject.keeperData,
            dateTime: moment( new Date() ),
          }
          newArray.push( tempData )
        } else {
          newArray[ index ].questionId = this.dataObject.questionId,
          newArray[ index ].question = this.dataObject.question,
          newArray[ index ].levelStatus = this.dataObject.levelStatus
          newArray[ index ].data = this.dataObject.encryptedCloudDataJson
          newArray[ index ].shares = this.dataObject.shares ? this.dataObject.shares : newArray[ index ].shares
          newArray[ index ].seed = this.dataObject.seed
          newArray[ index ].keeperData = this.dataObject.keeperData
          newArray[ index ].dateTime = moment( new Date() )
        }
        console.log( 'ARR', newArray )
        if ( Platform.OS == 'ios' ) {
          if( newArray.length ) {
            return iCloud.startBackup( JSON.stringify( newArray ) ).then( ( result ) => {
              if( result ) return 'iCloudSuccess'
              else throw new Error( 'iCLoud failure' )
            } ).catch( ( err ) => {
              throw new Error( err )
            } )

          }
          // console.log('Platform.OS share', share)
        } else {
          const metaData = {
            name: googleData.name,
            mimeType: googleData.mimeType,
            data: JSON.stringify( newArray ),
            id: googleData.id,
          }
          return await this.UpdateFile( {
            metaData, share
          } )
        }
      }

    } catch ( error ) {
      throw new Error( error )
    }
  };


  public UpdateFile = ( params: { metaData: any; share?: any } ) : Promise<any> => {
    const { metaData, share } = params
    try {
      GoogleDrive.updateFile( JSON.stringify( metaData ), ( data, err ) => {
        const result = err || data
        if ( result.eventName == 'successFullyUpdate' ) {
          return 'successFullyUpdate'
          //this.callBack( share )
        }
        else if( result.eventName == 'failure' ){
          throw new Error( result.eventName )
        }
        console.log( 'GoogleDrive.updateFile', result )
      } )
    } catch ( error ) {
      console.log( 'error', error )
      throw new Error( error )
    }
    return null
  };


  //   public static returnPromise = ( promise ) : Promise<any> => {

//     promise.then( ( result ) => {
//       console.log( 'return promise success', result )
//       return result
//     } ).catch( ( err ) => {
//       console.log( 'return promise error', err )
//       throw new Error( err )
//     } )
//     return null
//   }
}

