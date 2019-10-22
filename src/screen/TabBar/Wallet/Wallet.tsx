import React from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  Animated,
  AsyncStorage,
  Alert,
  RefreshControl,
  NativeModules,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from "react-native";
import {
  Container,
  Content,
  Text
} from "native-base";
import { RkCard } from "react-native-ui-kitten";
import DropdownAlert from "react-native-dropdownalert";
import { SvgIcon } from "hexaComponent/Icons";
import Permissions from 'react-native-permissions';


import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

var RNFS = require( 'react-native-fs' );
import QRCode from 'react-native-qrcode-svg';



import { FloatingAction } from "react-native-floating-action";

//Custome Compontes   
import { StatusBar } from "hexaComponent/StatusBar";
import { ImageSVG } from "hexaComponent/ImageSVG";

//TODO: Custome Models
import {
  ModelAcceptOrRejectSecret, ModelBackupShareAssociateContact,
  ModelBackupAssociateOpenContactList, ModelBackupYourWallet,
  ModelSelfShareAcceptAndReject, ModelHelperScreen, ModelBottomAddTestCoinsAndAccounts
} from "hexaComponent/Model";



//TODO: Custome View    
import { ViewErrorMessage, ViewShieldIcons } from "hexaComponent/View";

//TODO: Custome Alert 
import { AlertSimple } from "hexaComponent/Alert";;
let alert = new AlertSimple();


//TODO: Custome Pages
import { ModelLoader, ModelLoaderPdfFileCreate } from "hexaComponent/Loader";


//TODO: Custome StyleSheet Files       
import FontFamily from "hexaComponent/Styles/FontFamily";

//TODO: Custome object
import {
  colors,
  svgIcon,
  localDB,
  delayTime,
  asyncStorageKeys
} from "hexaConstants";
var dbOpration = require( "hexaDBOpration" );
var utils = require( "hexaUtils" );
import { renderIf } from "hexaValidation";


//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );


const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);
function wp( percentage: number ) {
  const value = ( percentage * viewportWidth ) / 100;
  return Math.round( value );
}


//TODO: Bitcoin files
var bitcoinClassState = require( "hexaClassState" );
import { S3Service } from "hexaBitcoin";

//TODO: Common Funciton  
var comAppHealth = require( "hexaCommonAppHealth" );





class Wallet extends React.Component {
  constructor ( props: any ) {
    super( props );
    this.state = {
      arr_accounts: [],
      arr_SSSDetails: [],
      walletDetails: [],
      //Shiled Icons
      shiledIconPer: 1,
      scrollY: new Animated.Value( 0 ),
      //custome comp
      arr_CustShiledIcon: [],
      //Model    
      arr_ModelBackupShareAssociateContact: [],
      arr_ModelBackupAssociateOpenContactList: [],
      arr_ModelAcceptOrRejectSecret: [],
      arr_ModelBackupYourWallet: [],
      arr_ModelSelfShareAcceptAndReject: [],
      arrModelBottomAddTestCoinsAndAccounts: [],
      arrModelHelperScreen: [],
      //Error Message
      arrErrorMessage: [],
      //DeepLinking Param   
      deepLinkingUrl: "",
      deepLinkingUrlType: "",
      flag_FabActive: false,
      //flag   
      flag_refreshing: false,
      flag_Loading: false,
      flag_LoadingPdfFile: false,
      //Loading Flags
      flag_Offline: false,
      flag_GetBal: false,
      flag_PdfFileCreate: false,
      //flags
      flag_ReloadAccounts: false,
      flag_Fabactive: false,
      flag_focusedStatusBar: true
    };
    isNetwork = utils.getNetwork();
  }





  //TODO: Page Life Cycle
  componentWillMount() {
    try {
      this.willFocusSubscription = this.props.navigation.addListener(
        "willFocus",
        () => {
          this.connnection_FetchData();
          this.getDeepLinkingData();
        }
      );
      //TODO: Animation 
      this.changeAnimaiton();
    }
    catch ( error ) {
      Alert.alert( error )
    }
  }


  componentDidMount() {
    try {
      const { navigation } = this.props;
      navigation.addListener( 'willFocus', () =>
        this.setState( { flag_focusedStatusBar: true } )
      );
      navigation.addListener( 'willBlur', () =>
        this.setState( { flag_focusedStatusBar: false } )
      );
    } catch ( error ) {
      Alert.alert( error )
    }
  }




  changeAnimaiton() {
    try {
      this.startHeaderHeight = 200;
      this.endHeaderHeight = 100;
      this.animatedHeaderHeight = this.state.scrollY.interpolate( {
        inputRange: [ 0, 100 ],
        outputRange: [ this.startHeaderHeight, this.endHeaderHeight ],
        extrapolate: "clamp"
      } );
      this.animatedMarginTopScrolling = this.animatedHeaderHeight.interpolate( {
        inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
        outputRange: [ 10, -35 ],
        extrapolate: "clamp"
      } );
      this.animatedAppTextSize = this.animatedHeaderHeight.interpolate( {
        inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
        outputRange: [ 18, 24 ],
        extrapolate: "clamp"
      } );
      this.animatedTextOpacity = this.animatedHeaderHeight.interpolate( {
        inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
        outputRange: [ 0, 1 ],
        extrapolate: "clamp"
      } );
      this.animatedShieldViewFlex = this.animatedHeaderHeight.interpolate( {
        inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
        outputRange: [ 2, 2 ],
        extrapolate: "clamp"
      } );
      this.animatedShieldIconSize = this.animatedHeaderHeight.interpolate( {
        inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
        outputRange: [ 50, 70 ],
        extrapolate: "clamp"
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  asyncTask = async () => {
    try {
      let resultWallet = await utils.getWalletDetails();
      let resSSSDetails = await utils.getSSSDetails();
      let backupInfo = JSON.parse( resultWallet.backupInfo );
      if ( backupInfo[ 0 ].backupType == "new" ) {
        if ( resSSSDetails.length == 0 ) {
          this.setState( {
            flag_LoadingPdfFile: true
          } );
          this.generateSSSDetails();
        } else {
          this.setState( {
            flag_Loading: true,
            flag_PdfFileCreate: false
          } )
        }
      }
      else {
        this.setState( {
          flag_Loading: false,
          flag_GetBal: true,
          flag_ReloadAccounts: false,
          arrErrorMessage: [ {
            type: "asyncTask",
            data: [ {
              message: "Fetching your regular account balance",
              bgColor: "#262A2E",
              color: "#ffffff",
            } ]
          } ]
        } );
        this.getBalAndHealth();
        this.setState( {
          flag_PdfFileCreate: false
        } )
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  componentWillUnmount() {
    try {
      this.willFocusSubscription.remove();
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //TODO: func connnection_FetchData   
  connnection_FetchData = async () => {
    try {
      let value = await AsyncStorage.getItem( asyncStorageKeys.flagHelperWalletScreen );
      let status = JSON.parse( value );
      console.log( { status } );
      if ( !status ) {
        this.setState( {
          arrModelHelperScreen: [ {
            modalVisible: true,
            images: [ "helper1", "helper2", "helper3" ]
          } ]
        } );
      }
      //Singleton Flag value change       
      await utils.setFlagQRCodeScreen( true );
      var resultWallet = await comFunDBRead.readTblWallet();
      console.log( { resultWallet } );
      var resAccount = await comFunDBRead.readTblAccount();
      let temp = [];
      for ( let i = 0; i < resAccount.length; i++ ) {
        let dataAccount = resAccount[ i ];
        let additionalInfo = JSON.parse( dataAccount.additionalInfo );
        //console.log( { additionalInfo } );
        let setupData = additionalInfo != "" ? additionalInfo[ 0 ] : "";
        //console.log( { setupData } );    
        let data = {};
        data.id = dataAccount.id;
        data.accountName = dataAccount.accountName;
        data.accountType = dataAccount.accountType;
        data.address = dataAccount.address;
        data.balance = dataAccount.balance;
        data.dateCreated = dataAccount.dateCreated;
        data.lastUpdated = dataAccount.lastUpdated;
        data.unit = dataAccount.unit;
        data.indicator = false;
        data.setupData = setupData;
        if ( data.accountType == "Regular Account" )
          data.svgIcon = Platform.OS == "ios" ? "dailyAccountSVG" : "dailyAccountPNG"
        else
          data.svgIcon = Platform.OS == "ios" ? "secureAccountSVG" : "secureAccountPNG"
        temp.push( data )
      }
      this.setState( {
        walletDetails: resultWallet,
        arr_accounts: temp,
        flag_Loading: false
      } );
      this.setHealthCheakIcon();
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //TODO: func get Deeplinking data 
  getDeepLinkingData() {
    try {
      let urlScript = utils.getDeepLinkingUrl();
      let urlType = utils.getDeepLinkingType();
      console.log( { urlType } );
      if ( urlType != "" ) {
        if ( urlType == "SSS Recovery SMS/EMAIL" || urlType == "SSS Recovery QR" ) {
          console.log( 'email' );
          this.setState( {
            deepLinkingUrl: urlScript,
            deepLinkingUrlType: urlType,
            arr_ModelAcceptOrRejectSecret: [
              {
                modalVisible: true,
                walletName: urlScript.wn
              }
            ]
          } )
        } else {
          this.setState( {
            deepLinkingUrl: urlScript,
            deepLinkingUrlType: urlType,
            arr_ModelSelfShareAcceptAndReject: [
              {
                modalVisible: true,
                walletName: urlScript.wn
              }
            ]
          } )
        }
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //TODO: click_SkipAssociateContact
  click_SkipAssociateContact = async () => {
    try {
      let deepLinkingUrlType = utils.getDeepLinkingType();
      if ( deepLinkingUrlType == "SSS Recovery QR" ) {
        this.setState( {
          flag_Loading: true
        } );
        let flag_Loading = true;
        const dateTime = Date.now();
        let urlScriptDetails = utils.getDeepLinkingUrl();
        //console.log( { urlScriptDetails } );  
        let urlScript = {};
        urlScript.walletName = urlScriptDetails.wn;
        urlScript.data = urlScriptDetails.data
        let walletDetails = utils.getWalletDetails();
        const sss = await bitcoinClassState.getS3ServiceClassState();
        let resDownlaodShare = await S3Service.downloadShare( urlScriptDetails.data );
        console.log( { resDownlaodShare } );
        if ( resDownlaodShare.status == 200 ) {
          let regularAccount = await bitcoinClassState.getRegularClassState();
          var resGetWalletId = await regularAccount.getWalletId();
          if ( resGetWalletId.status == 200 ) {
            await bitcoinClassState.setRegularClassState( regularAccount );
            resGetWalletId = resGetWalletId.data;
          } else {
            alert.simpleOkAction( "Oops", resGetWalletId.err, this.click_StopLoader );
          }
          let resTrustedParty = await comFunDBRead.readTblTrustedPartySSSDetails();
          let arr_DecrShare = [];
          for ( let i = 0; i < resTrustedParty.length; i++ ) {
            arr_DecrShare.push( JSON.parse( resTrustedParty[ i ].decrShare ) );
          }
          let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownlaodShare.data.encryptedMetaShare, urlScriptDetails.data, resGetWalletId.walletId, arr_DecrShare );
          if ( resDecryptEncMetaShare.status == 200 ) {
            console.log( { resDecryptEncMetaShare } );
            arr_DecrShare.length != 0 ? arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare ) : arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare );
            const resUpdateHealth = await S3Service.updateHealth( arr_DecrShare );
            if ( resUpdateHealth.status == 200 ) {
              await bitcoinClassState.setS3ServiceClassState( sss );
              const resTrustedParty = await dbOpration.insertTrustedPartyDetailWithoutAssociate(
                localDB.tableName.tblTrustedPartySSSDetails,
                dateTime,
                urlScript,
                resDecryptEncMetaShare.data.decryptedMetaShare,
                resDecryptEncMetaShare.data.decryptedMetaShare.meta,
                resDecryptEncMetaShare.data.decryptedMetaShare.encryptedStaticNonPMDD
              );
              if ( resTrustedParty ) {
                flag_Loading = false;
                utils.setDeepLinkingType( "" );
                utils.setDeepLinkingUrl( "" );
                setTimeout( () => {
                  alert.simpleOkAction( "Success", "Share stored successfully", this.click_StopLoader );
                }, 100 );
              }
            }
          } else {
            flag_Loading = false;
            setTimeout( () => {
              alert.simpleOkAction( "Oops", resDecryptEncMetaShare.err, this.click_StopLoader );
            }, 100 );
          }
        } else {
          flag_Loading = false;
          setTimeout( () => {
            alert.simpleOkAction( "Oops", resDownlaodShare.err, this.click_StopLoader );
          }, 100 );
        }
        this.setState( {
          flag_Loading
        } )
      } else {
        this.props.navigation.push( "OTPBackupShareStoreNavigator" );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }


  storeSelfShare = async () => {
    try {
      this.setState( {
        flag_Loading: true
      } );
      let flag_Loading = true;
      const dateTime = Date.now();
      let urlScriptDetails = utils.getDeepLinkingUrl();
      //console.log( { urlScriptDetails } );  
      let urlScript = {};
      urlScript.walletName = urlScriptDetails.wn;
      urlScript.data = urlScriptDetails.data
      console.log( { urlScript } );
      const sss = await bitcoinClassState.getS3ServiceClassState();
      let resDownlaodShare = await S3Service.downloadShare( urlScriptDetails.data );
      console.log( { resDownlaodShare } );
      if ( resDownlaodShare.status == 200 ) {
        let regularAccount = await bitcoinClassState.getRegularClassState();
        var resGetWalletId = await regularAccount.getWalletId();
        if ( resGetWalletId.status == 200 ) {
          await bitcoinClassState.setRegularClassState( regularAccount );
          resGetWalletId = resGetWalletId.data;
        } else {
          alert.simpleOkAction( "Oops", resGetWalletId.err, this.click_StopLoader );
        }
        let resTrustedParty = await comFunDBRead.readTblTrustedPartySSSDetails();
        let arr_DecrShare = [];
        for ( let i = 0; i < resTrustedParty.length; i++ ) {
          arr_DecrShare.push( JSON.parse( resTrustedParty[ i ].decrShare ) );
        }
        console.log( { readdbshare: arr_DecrShare } );
        let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownlaodShare.data.encryptedMetaShare, urlScriptDetails.data, resGetWalletId.walletId, arr_DecrShare );
        console.log( { resDecryptEncMetaShare } );
        if ( resDecryptEncMetaShare.status == 200 ) {
          console.log( { resDecryptEncMetaShare } );
          arr_DecrShare.length != 0 ? arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare ) : arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare );
          console.log( { appedshare: arr_DecrShare } );
          const resUpdateHealth = await S3Service.updateHealth( arr_DecrShare );
          console.log( { resUpdateHealth } );
          if ( resUpdateHealth.status == 200 ) {
            await bitcoinClassState.setS3ServiceClassState( sss );
            const resTrustedParty = await dbOpration.insertTrustedPartyDetailSelfShare(
              localDB.tableName.tblTrustedPartySSSDetails,
              dateTime,
              urlScript,
              resDecryptEncMetaShare.data.decryptedMetaShare,
              resDecryptEncMetaShare.data.decryptedMetaShare.meta,
              resDecryptEncMetaShare.data.decryptedMetaShare.encryptedStaticNonPMDD
            );
            if ( resTrustedParty ) {
              flag_Loading = false;
              utils.setDeepLinkingType( "" );
              utils.setDeepLinkingUrl( "" );
              setTimeout( () => {
                alert.simpleOkAction( "Success", "Share stored successfully", this.click_StopLoader );
              }, 100 );
            }
          }
        } else {
          flag_Loading = false;
          setTimeout( () => {
            alert.simpleOkAction( "Oops", resDecryptEncMetaShare.err, this.click_StopLoader );
          }, 100 );
        }
      } else {
        flag_Loading = false;
        setTimeout( () => {
          alert.simpleOkAction( "Oops", resDownlaodShare.err, this.click_StopLoader );
        }, 100 );
      }
      this.setState( {
        flag_Loading
      } )
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //async task    
  generateSSSDetails = async () => {
    try {
      const dateTime = Date.now();
      let walletDetails = await utils.getWalletDetails();
      let setUpWalletAnswerDetails = JSON.parse( walletDetails.setUpWalletAnswerDetails );
      let secureAccount = await bitcoinClassState.getSecureClassState();
      let sss = await bitcoinClassState.getS3ServiceClassState();
      var resSetupSecureAccount = await secureAccount.setupSecureAccount();
      if ( resSetupSecureAccount.status == 200 ) {
        resSetupSecureAccount = resSetupSecureAccount.data;
      } else {
        alert.simpleOkAction( "Oops", resSetupSecureAccount.err, this.click_StopLoader );
      }
      var secondaryXpub = await secureAccount.getSecondaryXpub();
      if ( secondaryXpub.status == 200 ) {
        secondaryXpub = secondaryXpub.data.secondaryXpub;
      } else {
        alert.simpleOkAction( "Oops", secondaryXpub.err, this.click_StopLoader );
      }
      var getSecoundMnemonic = await secureAccount.getRecoveryMnemonic();
      if ( getSecoundMnemonic.status == 200 ) {
        await bitcoinClassState.setSecureClassState( secureAccount );
        getSecoundMnemonic = getSecoundMnemonic.data.secondaryMnemonic;
      } else {
        alert.simpleOkAction( "Oops", getSecoundMnemonic.err, this.click_StopLoader );
      }

      //Get Shares                 
      const generateShareRes = await sss.generateShares( setUpWalletAnswerDetails[ 0 ].Answer );

      if ( generateShareRes.status == 200 ) {
        const { encryptedShares } = generateShareRes.data;
        const autoHealthShares = encryptedShares.slice( 0, 3 );

        const resInitializeHealthcheck = await sss.initializeHealthcheck( autoHealthShares );

        if ( resInitializeHealthcheck.status == 200 || resInitializeHealthcheck.status == 400 ) {
          const shareIds = [];
          // console.log( { autoHealthShares } );
          for ( const share of encryptedShares ) {
            shareIds.push( S3Service.getShareId( share ) )
          }
          const socialStaticNonPMDD = { secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub }

          var resEncryptSocialStaticNonPMDD = await sss.encryptStaticNonPMDD( socialStaticNonPMDD );

          if ( resEncryptSocialStaticNonPMDD.status == 200 ) {
            resEncryptSocialStaticNonPMDD = resEncryptSocialStaticNonPMDD.data.encryptedStaticNonPMDD;
            const buddyStaticNonPMDD = { getSecoundMnemonic, twoFASecret: resSetupSecureAccount.setupData.secret, secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub };

            let resEncryptBuddyStaticNonPMDD = await sss.encryptStaticNonPMDD( buddyStaticNonPMDD );
            if ( resEncryptBuddyStaticNonPMDD.status == 200 ) {
              resEncryptBuddyStaticNonPMDD = resEncryptBuddyStaticNonPMDD.data.encryptedStaticNonPMDD;
              let rescreateMetaShare = await sss.createMetaShare( 1, encryptedShares[ 0 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
              let resGenerateEncryptedMetaShare1 = await sss.generateEncryptedMetaShare( rescreateMetaShare.data.metaShare );
              let rescreateMetaShare1 = await sss.createMetaShare( 2, encryptedShares[ 1 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
              let resGenerateEncryptedMetaShare2 = await sss.generateEncryptedMetaShare( rescreateMetaShare1.data.metaShare );
              let rescreateMetaShare2 = await sss.createMetaShare( 3, encryptedShares[ 2 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
              let resGenerateEncryptedMetaShare3 = await sss.generateEncryptedMetaShare( rescreateMetaShare2.data.metaShare );
              //for pdf                      
              let rescreateMetaShare3 = await sss.createMetaShare( 4, encryptedShares[ 3 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );

              if ( rescreateMetaShare3.status == 200 ) {
                var qrcode4share = await sss.createQR( rescreateMetaShare3.data.metaShare, 4 );
                if ( qrcode4share.status == 200 ) {
                  qrcode4share = qrcode4share.data.qrData
                  // console.log( { qrcode4share } );
                  //creating 4th share pdf   
                  let temp = [];
                  temp.push( { arrQRCodeData: qrcode4share, secondaryXpub: secondaryXpub, qrData: resSetupSecureAccount.setupData.qrData, secret: resSetupSecureAccount.setupData.secret, secondaryMnemonic: getSecoundMnemonic, bhXpub: resSetupSecureAccount.setupData.bhXpub } )
                  let resGenerate4thsharepdf = await this.genreatePdf( temp, walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 4", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 4", setUpWalletAnswerDetails[ 0 ].Answer );
                  if ( resGenerate4thsharepdf != "" ) {
                    let rescreateMetaShare4 = await sss.createMetaShare( 5, encryptedShares[ 4 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                    if ( rescreateMetaShare4.status == 200 ) {
                      var qrcode5share = await sss.createQR( rescreateMetaShare4.data.metaShare, 5 );
                      if ( qrcode5share.status == 200 ) {
                        qrcode5share = qrcode5share.data.qrData
                        let temp = [];
                        temp.push( { arrQRCodeData: qrcode5share, secondaryXpub: secondaryXpub, qrData: resSetupSecureAccount.setupData.qrData, secret: resSetupSecureAccount.setupData.secret, secondaryMnemonic: getSecoundMnemonic, bhXpub: resSetupSecureAccount.setupData.bhXpub } )
                        let resGenerate5thsharepdf = await this.genreatePdf( temp, walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 5", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 5", setUpWalletAnswerDetails[ 0 ].Answer ); if ( resGenerate5thsharepdf != "" ) {
                          let keeperInfo = [ { info: null }, { info: null }, { info: rescreateMetaShare2.data }, { info: qrcode4share[ 0 ] }, { info: qrcode5share[ 0 ] } ];
                          let encryptedMetaShare = [ { metaShare: rescreateMetaShare.data.metaShare }, { metaShare: rescreateMetaShare1.data.metaShare }, { metaShare: rescreateMetaShare2.data.metaShare }, { metaShare: resGenerate4thsharepdf }, { metaShare: resGenerate5thsharepdf } ]
                          let arrTypes = [ { type: "Trusted Contacts 1" }, { type: "Trusted Contacts 2" }, { type: "Self Share 1" }, { type: "Self Share 2" }, { type: "Self Share 3" } ];
                          let temp = [ { date: dateTime, share: encryptedShares, shareId: shareIds, keeperInfo: keeperInfo, encryptedMetaShare: encryptedMetaShare, type: arrTypes } ]
                          let resInsertSSSShare = await dbOpration.insertSSSShareDetails(
                            localDB.tableName.tblSSSDetails,
                            temp
                          );
                          if ( resInsertSSSShare ) {
                            await comFunDBRead.readTblSSSDetails();
                            this.setState( {
                              //flag_PdfFileCreate: false,
                              flag_LoadingPdfFile: false,
                            } )
                          }
                        }
                      }
                    } else {
                      alert.simpleOkAction( "Oops", qrcode4share.err, this.click_StopLoader );
                    }
                  }
                }
              } else {
                alert.simpleOkAction( "Oops", qrcode4share.err, this.click_StopLoader );
              }
            } else {
              alert.simpleOkAction( "Oops", resEncryptBuddyStaticNonPMDD.err, this.click_StopLoader );
            }

          } else {
            alert.simpleOkAction( "Oops", resEncryptSocialStaticNonPMDD.err, this.click_StopLoader );
          }
        } else {
          alert.simpleOkAction( "Oops", resEncryptSocialStaticNonPMDD.err, this.click_StopLoader );
        }
      } else {
        alert.simpleOkAction( "Oops", generateShareRes.err, this.click_StopLoader );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }


  //qrstring modify
  getCorrectFormatStirng( share1: string ) {
    try {
      share1 = share1.split( '"' ).join( "Doublequote" );
      share1 = share1.split( '{' ).join( "Leftbrace" );
      share1 = share1.split( '}' ).join( "Rightbrace" );
      share1 = share1.split( '/' ).join( "Slash" );
      share1 = share1.split( ',' ).join( "Comma" );
      share1 = share1.split( ' ' ).join( "Space" );
      return share1;
    } catch ( error ) {
      Alert.alert( error )
    }
  }


  chunkArray( arr: any, n: any ) {
    try {
      var chunkLength = Math.max( arr.length / n, 1 );
      var chunks = [];
      for ( var i = 0; i < n; i++ ) {
        if ( chunkLength * ( i + 1 ) <= arr.length ) chunks.push( arr.slice( chunkLength * i, chunkLength * ( i + 1 ) ) );
      }
      return chunks;
    } catch ( error ) {
      Alert.alert( error )
    }
  }


  genreatePdf = async ( data: any, pdfFileName: string, forShare: string, password: string ) => {
    try {
      return new Promise( async ( resolve, reject ) => {
        data = data[ 0 ];
        let arrQRCodeData = data.arrQRCodeData;
        let secondaryXpub = data.secondaryXpub;
        let qrData = data.qrData;
        let secret2FA = data.secret;
        let secondaryMnemonic = data.secondaryMnemonic;
        let bhXpub = data.bhXpub;
        //qrcode string   
        let qrCode1 = await this.getCorrectFormatStirng( arrQRCodeData[ 0 ] );
        let qrCode2 = await this.getCorrectFormatStirng( arrQRCodeData[ 1 ] );
        let qrCode3 = await this.getCorrectFormatStirng( arrQRCodeData[ 2 ] );
        let qrCode4 = await this.getCorrectFormatStirng( arrQRCodeData[ 3 ] );
        let qrCode5 = await this.getCorrectFormatStirng( arrQRCodeData[ 4 ] );
        let qrCode6 = await this.getCorrectFormatStirng( arrQRCodeData[ 5 ] );
        let qrCode7 = await this.getCorrectFormatStirng( arrQRCodeData[ 6 ] );
        let qrCode8 = await this.getCorrectFormatStirng( arrQRCodeData[ 7 ] );
        //Share 1                         
        // console.log( { arrShare1 } );       
        let arrShare1 = this.chunkArray( arrQRCodeData[ 0 ], 4 );
        let arrShare2 = this.chunkArray( arrQRCodeData[ 1 ], 4 );
        let arrShare3 = this.chunkArray( arrQRCodeData[ 2 ], 4 );
        let arrShare4 = this.chunkArray( arrQRCodeData[ 3 ], 4 );
        let arrShare5 = this.chunkArray( arrQRCodeData[ 4 ], 4 );
        let arrShare6 = this.chunkArray( arrQRCodeData[ 5 ], 4 );
        let arrShare7 = this.chunkArray( arrQRCodeData[ 6 ], 4 );
        let arrShare8 = this.chunkArray( arrQRCodeData[ 7 ], 4 );

        // //Secound Mnemonic
        let arrSecondaryMnemonic = secondaryMnemonic.split( ' ' );
        var firstArrSecondaryMnemonic, secoundArrSecondaryMnemonic, threeSecondaryMnemonic;
        let arrSepArray = this.chunkArray( arrSecondaryMnemonic, 2 );
        firstArrSecondaryMnemonic = arrSepArray[ 0 ].toString();
        firstArrSecondaryMnemonic = firstArrSecondaryMnemonic.split( ',' ).join( ' ' );
        secoundArrSecondaryMnemonic = arrSepArray[ 1 ].toString();
        secoundArrSecondaryMnemonic = secoundArrSecondaryMnemonic.split( ',' ).join( ' ' );

        //bhXpub
        let arrBhXpub = this.chunkArray( bhXpub, 2 );
        let options = {
          padding: 0,
          height: 842,
          width: 595,
          html: "<h1>" + forShare + "</h1>" +
            "<h3 style='text-decoration: underline;'>Part 1<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode1 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare1[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare1[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare1[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare1[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Part 2<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode2 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare2[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare2[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare2[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare2[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Part 3<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode3 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare3[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare3[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare3[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare3[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Part 4<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode4 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare4[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare4[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare4[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare4[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Part 5<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode5 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare5[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare5[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare5[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare5[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Part 6<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode6 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare6[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare6[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare6[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare6[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Part 7<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode7 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare7[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare7[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare7[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare7[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Part 8<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrCode8 + "&amp' style='margin-left:35%'/><br/>" +
            "<p align='center'>" + arrShare8[ 0 ] + "</p>" +
            "<p align='center'>" + arrShare8[ 1 ] + "</p>" +
            "<p align='center'>" + arrShare8[ 2 ] + "</p>" +
            "<p align='center'>" + arrShare8[ 3 ] + "</p>" +
            "<h3 style='text-decoration: underline;'>Secondary Xpub (Encrypted):<h3>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + secondaryXpub + "&amp' style='margin-left:35%'/>" +
            "<p align='center'>Scan the above QR Code using your HEXA wallet in order to restore your Secure Account.</p>" +
            "<p>2FA Secret:<p><br/>" +
            "<img src='https://api.qrserver.com/v1/create-qr-code/?data=" + qrData + "&amp' style='margin-left:35%'/>" +
            "<p align='center'>" + secret2FA + "</p>" +
            "<p>Following assets can be used to recover your funds using the open - sourced ga - recovery tool.</p><br/><br/>" +
            "<p>Secondary Mnemonic:<p>" +
            "<p align='center'>" + firstArrSecondaryMnemonic + "</p>" +
            "<p align='center'>" + secoundArrSecondaryMnemonic + "</p><br/>" +
            "<p>BitHyve Xpub:<p>" +
            "<p align='center'>" + arrBhXpub[ 0 ] + "</p>" +
            "<p align='center'>" + arrBhXpub[ 1 ] + "</p>",
          fileName: pdfFileName,
          directory: 'Documents',
        };
        let file = await RNHTMLtoPDF.convert( options )
        if ( Platform.OS == "ios" ) {
          var PdfPassword = NativeModules.PdfPassword;
          PdfPassword.addEvent( "/" + pdfFileName + ".pdf", password );
        } else {
          this.setPdfAndroidPasswrod( file.filePath, password );
        }
        resolve( file.filePath );
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }


  // async function to call the Java native method
  async setPdfAndroidPasswrod( pdfPath: string, pdffilePassword: string ) {
    try {
      console.log( { pdfPath } );
      // var PdfPassword = NativeModules.PdfPassword;
      // PdfPassword.setPdfPasswrod( pdfPath, pdffilePassword, ( err: any ) => { console.log( err ) }, ( msg: any ) => { console.log( msg ) } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //TODO: Get All Accoun t Bal
  getBalAndHealth = async () => {
    try {
      this.setState( {
        flag_Loading: true,
        flag_GetBal: true,
        flag_ReloadAccounts: false,
        arrErrorMessage: [ {
          type: "asyncTask",
          data: [ {
            message: "Fetching your regular account balance",
            bgColor: "#262A2E",
            color: "#ffffff",
          } ]
        } ]
      }, () => {
        this.connnection_FetchData();
        this.getBalReularAccount();
      } );
      let resTrustedParty = await comFunDBRead.readTblTrustedPartySSSDetails();
      let arr_DecrShare = [];
      for ( let i = 0; i < resTrustedParty.length; i++ ) {
        arr_DecrShare.push( JSON.parse( resTrustedParty[ i ].decrShare ) );
      }
      arr_DecrShare.length != 0 ? this.updateHealth( arr_DecrShare ) : null;
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  getBalReularAccount = async () => {
    try {
      //  let { arr_accounts } = this.state;
      let regularAccount = await bitcoinClassState.getRegularClassState();
      //Get Regular Account Bal
      var getBalR = await regularAccount.getBalance();
      console.log( { getBalR } );
      if ( getBalR.status == 200 ) {
        await bitcoinClassState.setRegularClassState( regularAccount );
        getBalR = getBalR.data;
        await dbOpration.updateAccountBalAccountTypeWise(
          localDB.tableName.tblAccount,
          "Regular Account",
          ( getBalR.balance + getBalR.unconfirmedBalance )
        );
        // arr_accounts[ 0 ].balance = ( ( getBalR.balance + getBalR.unconfirmedBalance ) / 1e8 ).toString();
        // arr_accounts[ 0 ].indicator = false;  
        this.setState( {
          // arr_accounts,
          flag_ReloadAccounts: true,
          arrErrorMessage: [ {
            type: "asyncTask",
            data: [ {
              message: "Fetching your secure account balance",
              bgColor: "#262A2E",
              color: "#ffffff",
            } ]
          } ]
        }, () => {
          this.connnection_FetchData();
          this.getBalSecureAccount();
        } );
      } else {
        alert.simpleOkAction( "Oops", getBalR.err, this.click_StopLoader );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  getBalSecureAccount = async () => {
    try {
      //let { arr_accounts } = this.state;
      let secureAccount = await bitcoinClassState.getSecureClassState();
      //Get Secure Account Bal
      var getBalS = await secureAccount.getBalance();
      console.log( { getBalS } );
      if ( getBalS.status == 200 ) {
        await bitcoinClassState.setSecureClassState( secureAccount );
        getBalS = getBalS.data;
        await dbOpration.updateAccountBalAccountTypeWise(
          localDB.tableName.tblAccount,
          "Secure Account",
          ( getBalS.balance + getBalS.unconfirmedBalance )
        );
        // arr_accounts[ 1 ].balance = ( ( getBalS.balance + getBalS.unconfirmedBalance ) / 1e8 ).toString();
        // arr_accounts[ 1 ].indicator = false;
        this.setState( {
          //   arr_accounts,
          flag_ReloadAccounts: false,
          arrErrorMessage: [ {
            type: "asyncTask",
            data: [ {
              message: "Checking health of your wallet",
              bgColor: "#262A2E",
              color: "#ffffff",
            } ]
          } ]
        }, () => {
          this.connnection_FetchData();
          this.checkHealthStatus();
        } );
      } else {
        alert.simpleOkAction( "Oops", getBalS.err, this.click_StopLoader );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  checkHealthStatus = async () => {
    try {
      let walletDetails = await utils.getWalletDetails();
      let sssDetails = await utils.getSSSDetails();
      let share = {};
      share.trustedContShareId1 = sssDetails[ 0 ].shareId != "" ? sssDetails[ 0 ].shareId : null;
      share.trustedContShareId2 = sssDetails[ 1 ].shareId != "" ? sssDetails[ 1 ].shareId : null;
      share.selfshareShareId1 = sssDetails[ 2 ].shareId != "" ? sssDetails[ 2 ].shareId : null;
      share.selfshareShareDate2 = sssDetails[ 3 ].acceptedDate != "" ? sssDetails[ 3 ].acceptedDate : 0;
      share.selfshareShareShareId2 = sssDetails[ 3 ].shareId != "" ? sssDetails[ 3 ].shareId : null;
      share.selfshareShareDate3 = sssDetails[ 4 ].acceptedDate != "" ? sssDetails[ 4 ].acceptedDate : 0;
      share.selfshareShareId3 = sssDetails[ 4 ].shareId != "" ? sssDetails[ 4 ].shareId : null;
      share.qatime = parseInt( walletDetails.lastUpdated );
      await comAppHealth.checkHealthAllShare( share );
      this.setHealthCheakIcon();
      this.setState( {
        flag_GetBal: false,
        flag_Loading: false,
      } )
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  setHealthCheakIcon = async () => {
    try {
      let walletDetails = await utils.getWalletDetails();
      //TODO: appHealthStatus    
      let appHealth = JSON.parse( walletDetails.appHealthStatus );
      console.log( { appHealth } );
      if ( appHealth.overallStatus == "1" ) {
        this.setState( {
          shiledIconPer: 1,
          arr_CustShiledIcon: [
            {
              "title": "The wallet backup is not secured. Please complete the setup to safeguard against loss of funds",
              "image": "sheild_1",
              "imageHeight": this.animatedShieldIconSize,
              "imageWidth": this.animatedShieldIconSize,
            }
          ]
        } );
      }

      else if ( appHealth.overallStatus == "2" ) {
        this.setState( {
          shiledIconPer: 2,
          arr_CustShiledIcon: [
            {
              "title": "The wallet backup is not secured. Please complete the setup to safeguard against loss of funds",
              "image": "sheild_2",
              "imageHeight": this.animatedShieldIconSize,
              "imageWidth": this.animatedShieldIconSize,
            }
          ]
        } );
      }
      else if ( appHealth.overallStatus == "3" ) {
        this.setState( {
          shiledIconPer: 3,
          arr_CustShiledIcon: [
            {
              "title": "The wallet backup is not secured. Please complete the setup to safeguard against loss of funds",
              "image": "sheild_3",
              "imageHeight": this.animatedShieldIconSize,
              "imageWidth": this.animatedShieldIconSize,
            }
          ]
        } );
      }
      else if ( appHealth.overallStatus == "4" ) {
        this.setState( {
          shiledIconPer: 4,
          arr_CustShiledIcon: [
            {
              "title": "The wallet backup is not secured. Please complete the setup to safeguard against loss of funds",
              "image": "sheild_4",
              "imageHeight": this.animatedShieldIconSize,
              "imageWidth": this.animatedShieldIconSize,
            }
          ]
        } );
      }
      else {
        this.setState( {
          shiledIconPer: 5,
          arr_CustShiledIcon: [
            {
              "title": "Great!! The wallet backup is secure. Keep an eye on the health of the backup here",
              "image": "sheild_5",
              "imageHeight": this.animatedShieldIconSize,
              "imageWidth": this.animatedShieldIconSize,
            }
          ]
        } );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //TODO: upload Health Check
  updateHealth = async ( arr_DecrShare: any ) => {
    try {
      const resUpdateHealth = await S3Service.updateHealth( arr_DecrShare );
      if ( resUpdateHealth.status != 200 ) {
        alert.simpleOkAction( "Oops", resUpdateHealth.err, this.click_StopLoader );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //TODO: getTestcoins
  getTestcoins = async () => {
    try {
      let regularAccount = await bitcoinClassState.getRegularClassState();
      let secureAccount = await bitcoinClassState.getSecureClassState();
      var resCoins = await regularAccount.getTestcoins();
      if ( resCoins.status == 200 ) {
        resCoins = resCoins.data;
      } else {
        alert.simpleOkAction( "Oops", resCoins.err, this.click_StopLoader );
      }
      resCoins = await secureAccount.getTestcoins();
      if ( resCoins.status == 200 ) {
        resCoins = resCoins.data;
        this.getBalAndHealth();
      } else {
        alert.simpleOkAction( "Oops", resCoins.err, this.click_StopLoader );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }



  //TODO: Show account details transaction
  click_AccountDetails = async ( item: any ) => {
    try {
      let { walletDetails } = this.state;
      this.props.navigation.push( "AccountTransactionNavigator", { data: item, walletDetails } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  click_StopLoader = () => {
    try {
      this.setState( {
        flag_Loading: false
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }


  _renderItem( { item, index } ) {
    return (
      <View key={ "card" + index }>
        <TouchableOpacity
          onPress={ () => this.click_AccountDetails( item ) }
          style={ { zIndex: 2 } }
        >
          { renderIf( item.accountType != "Secure Account" )(
            <RkCard
              rkType="shadowed"
              style={ {
                flex: 1,
                margin: 10,
                height: 145,
                borderRadius: 10
              } }
            >
              <View
                rkCardHeader
                style={ {
                  flex: 1,
                  justifyContent: "center",
                  borderBottomColor: "#F5F5F5",
                  borderBottomWidth: 1
                } }
              >
                <ImageSVG source={ svgIcon.walletScreen[ item.svgIcon ] } size={ 50 } />
                <Text
                  style={ [ FontFamily.ffFiraSansMedium, {
                    flex: 2,
                    fontSize: 18,
                    alignSelf: "center",
                    marginLeft: 10
                  } ] }
                >
                  { item.accountName }
                </Text>
                <View style={ { alignSelf: "center", flexDirection: "row" } }>
                  <ActivityIndicator animating={ item.indicator } size="small" color="gray" style={ { marginTop: -25 } } />
                  <SvgIcon name="icon_more" color="gray" size={ 15 } />
                </View>
              </View>
              <View
                rkCardContent
                style={ {
                  flex: 1,
                  flexDirection: "row"
                } }
              >
                <View
                  style={ {
                    flex: 1,
                    justifyContent: "center",
                  } }
                >
                  <SvgIcon name="icon_bitcoin" color="gray" size={ 40 } />
                </View>
                <View style={ { flex: 4 } }>
                  <Text style={ [ FontFamily.ffOpenSansBold, { fontSize: 30 } ] }>
                    { item.balance } <Text note>sats</Text>
                  </Text>
                </View>
              </View>
            </RkCard>
          ) }
          { renderIf( item.accountType == "Secure Account" )(
            <RkCard
              rkType="shadowed"
              style={ {
                flex: 1,
                margin: 10,
                height: 145,
                borderRadius: 10
              } }
            >
              <View
                rkCardHeader
                style={ {
                  flex: 1,
                  borderBottomColor: "#F5F5F5",
                  borderBottomWidth: 1
                } }
              >
                <ImageSVG source={ svgIcon.walletScreen[ item.svgIcon ] } size={ 50 } />
                <Text
                  style={ [ FontFamily.ffFiraSansMedium, {
                    flex: 2,
                    fontSize: 18,
                    alignSelf: "center",
                    marginLeft: 10
                  } ] }
                >
                  { item.accountName }
                </Text>
                <View style={ { alignSelf: "center", flexDirection: "row" } }>
                  <ActivityIndicator animating={ item.indicator } size="small" color="gray" style={ { marginTop: -25 } } />
                  <SvgIcon name="icon_more" color="gray" size={ 15 } />
                </View>
              </View>
              <View
                rkCardContent
                style={ {
                  flex: 1,
                  flexDirection: "row"
                } }
              >
                <View
                  style={ {
                    flex: 1,
                    justifyContent: "center"
                  } }
                >
                  <SvgIcon name="icon_bitcoin" color="gray" size={ 40 } />
                </View>
                <View style={ { flex: 4 } }>
                  <Text style={ [ FontFamily.ffOpenSansBold, { fontSize: 30 } ] }>
                    { item.balance } <Text note>sats</Text>
                  </Text>
                </View>
                <View
                  style={ {
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "flex-end"
                  } }
                >
                  <ImageSVG
                    size={ 30 }
                    source={
                      Platform.OS == "ios" ? svgIcon.walletScreen.secureAccount2FASVG : svgIcon.walletScreen.secureAccount2FAPNG
                    }
                  />
                </View>
              </View>
            </RkCard>
          ) }
        </TouchableOpacity>
      </View>
    );
  }


  reloadStatusBar() {
    return (
      <CustomeStatusBar backgroundColor={ colors.appColor } hidden={ false } barStyle="dark-content" />
    )
  }

  render() {
    //array  
    let { walletDetails, arr_CustShiledIcon, arr_accounts, arrErrorMessage, arrModelBottomAddTestCoinsAndAccounts } = this.state;
    //model array
    let { arr_ModelAcceptOrRejectSecret, arr_ModelBackupShareAssociateContact, arr_ModelBackupAssociateOpenContactList, arr_ModelBackupYourWallet, arr_ModelSelfShareAcceptAndReject, arrModelHelperScreen } = this.state;
    //flag
    let { flag_Loading, flag_refreshing, flag_Offline, flag_GetBal, flag_PdfFileCreate, flag_ReloadAccounts, flag_LoadingPdfFile } = this.state;


    const actions = [
      {
        text: "Test Coins",
        icon: svgIcon.walletScreen.testCoinsPNG,
        name: "bt_language",
        color: colors.appColor,
        position: 1
      },
    ];

    return (
      <Container>
        <SafeAreaView style={ { flex: 0, backgroundColor: colors.appColor } } />
        <Content
          scrollEnabled={ false }
          contentContainerStyle={ styles.container }
        >
          <SafeAreaView style={ { flex: 0, backgroundColor: colors.appColor } } />
          <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
            {/* Top View Animation */ }
            { renderIf( flag_Offline == true || flag_PdfFileCreate == true || flag_GetBal == true )(
              <ViewErrorMessage data={ arrErrorMessage } />
            ) }



            <Text style={ { color: colors.appColor, backgroundColor: colors.appColor } }></Text>
            <Animated.View
              style={ {
                height: this.animatedHeaderHeight,
                backgroundColor: colors.appColor,
                flexDirection: "row",
                zIndex: 0,
              } }
            >
              <Animated.View
                style={ {
                  marginLeft: 20,
                  flex: 4,
                  // marginTop: StatusBar.currentHeight
                } }
              >
                <Animated.Text
                  style={ [ FontFamily.ffFiraSansMedium, {
                    color: "#fff",
                    fontSize: this.animatedAppTextSize,
                    marginTop: 20,
                    marginBottom: 30
                  } ] }
                >

                  { walletDetails.walletType != null ? walletDetails.walletType + " (Testnet)" : "" }
                </Animated.Text>
                <Animated.Text
                  style={ [ FontFamily.ffFiraSansRegular, {
                    color: "#fff",
                    fontSize: 14,
                    opacity: this.animatedTextOpacity
                  } ] }
                >
                  { arr_CustShiledIcon.length != 0 ? arr_CustShiledIcon[ 0 ].title : "" }
                </Animated.Text>
              </Animated.View>

              <Animated.View
                style={ {
                  flex: this.animatedShieldViewFlex,
                  marginRight: 10,
                  alignItems: "flex-end",
                  justifyContent: "center"
                } }
              >
                <ViewShieldIcons data={ arr_CustShiledIcon } click_Image={ () => {
                  let appHealthStatus = walletDetails.appHealthStatus;
                  if ( appHealthStatus != "" ) {
                    let backupType = JSON.parse( walletDetails.appHealthStatus );
                    if ( backupType != "" ) {
                      this.props.navigation.push( "HealthOfTheAppNavigator" );
                    } else {
                      this.setState( {
                        arr_ModelBackupYourWallet: [ {
                          modalVisible: true
                        } ]
                      } )
                    }
                  } else {
                    this.setState( {
                      arr_ModelBackupYourWallet: [ {
                        modalVisible: true
                      } ]
                    } )
                  }
                }
                } />
              </Animated.View>
            </Animated.View>


            {/*  cards */ }
            <Animated.View
              style={ {
                flex: 6,
                marginTop: this.animatedMarginTopScrolling,
                zIndex: 1
              } }
            >
              <ScrollView
                scrollEventThrottle={ 40 }
                contentContainerStyle={ { flex: 0, zIndex: 2 } }
                horizontal={ false }
                pagingEnabled={ false }
                refreshControl={
                  <RefreshControl
                    refreshing={ flag_refreshing }
                    onRefresh={ () => {
                      this.getBalAndHealth()
                    } }
                  />
                }
                onScroll={ Animated.event( [
                  {
                    nativeEvent: { contentOffset: { y: this.state.scrollY } }
                  }
                ] ) }
              >
                <FlatList
                  data={ arr_accounts }
                  extraData={ flag_ReloadAccounts }
                  showsVerticalScrollIndicator={ false }
                  renderItem={ this._renderItem.bind( this ) }
                  keyExtractor={ ( item, index ) => index.toString() }
                />


              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </Content>
        <DropdownAlert ref={ ref => ( this.dropdown = ref ) } />

        <FloatingAction
          actions={ actions }
          color="transparent"
          floatingIcon={ svgIcon.walletScreen.addAccountsPNG }
          iconWidth={ 120 }
          iconHeight={ 120 }
          onPressItem={ ( name: any ) => {
            console.log( 'tab' );
            this.setState( {
              flag_GetBal: true,
              arrErrorMessage: [ {
                type: "asyncTask",
                data: [ {
                  message: "Fetching testcoins for your wallet",
                  bgColor: "#262A2E",
                  color: "#ffffff",
                } ]
              } ]
            }, () => {
              this.getTestcoins()
            } );
          } }
        />
        <ModelAcceptOrRejectSecret
          data={ arr_ModelAcceptOrRejectSecret }
          closeModal={ () => {
            utils.setDeepLinkingType( "" );
            utils.setDeepLinkingUrl( "" );
            this.setState( {
              arr_ModelAcceptOrRejectSecret: [
                {
                  modalVisible: false,
                  walletName: ""
                }
              ]
            } )
          } }
          click_AcceptSecret={ ( wn: string ) => {
            console.log( { wn } );
            this.setState( {
              arr_ModelAcceptOrRejectSecret: [
                {
                  modalVisible: false,
                  walletName: ""
                }
              ],
              arr_ModelBackupShareAssociateContact: [
                {
                  modalVisible: true,
                  walletName: wn
                }
              ]
            } );
          } }
        />
        <ModelSelfShareAcceptAndReject
          data={ arr_ModelSelfShareAcceptAndReject }
          closeModal={ () => {
            utils.setDeepLinkingType( "" );
            utils.setDeepLinkingUrl( "" );
            this.setState( {
              arr_ModelSelfShareAcceptAndReject: [
                {
                  modalVisible: false,
                  walletName: ""
                }
              ]
            } )
          } }
          click_AcceptShare={ ( wn: string ) => {
            this.setState( {
              arr_ModelSelfShareAcceptAndReject: [
                {
                  modalVisible: false,
                  walletName: ""
                }
              ],
            } );
            this.storeSelfShare();
          } }
        />
        <ModelBackupShareAssociateContact
          data={ arr_ModelBackupShareAssociateContact }
          click_AssociateContact={ ( walletName: string ) => {
            Permissions.request( 'contacts' ).then( ( response: any ) => {
              console.log( response );
            } );
            this.setState( {
              arr_ModelBackupShareAssociateContact: [
                {
                  modalVisible: false,
                  walletName: "",
                }
              ],
              arr_ModelBackupAssociateOpenContactList: [
                {
                  modalVisible: true,
                  walletName: walletName,
                }
              ]
            } )
          } }
          click_Skip={ () => {
            this.setState( {
              arr_ModelBackupShareAssociateContact: [
                {
                  modalVisible: false,
                  walletName: "",
                }
              ]
            } );
            this.click_SkipAssociateContact();
          } }
          closeModal={ () => {
            utils.setDeepLinkingType( "" );
            utils.setDeepLinkingUrl( "" );
            this.setState( {
              arr_ModelBackupShareAssociateContact: [
                {
                  modalVisible: false,
                  walletName: "",
                }
              ]
            } )
          } }
        />
        <ModelBackupAssociateOpenContactList
          data={ arr_ModelBackupAssociateOpenContactList }
          click_OpenContact={ () => {
            this.setState( {
              arr_ModelBackupAssociateOpenContactList: [
                {
                  modalVisible: false,
                  walletName: "",
                }
              ]
            } );
            this.props.navigation.push( "BackupTrustedPartrySecretNavigator" );
          } }
          closeModal={ () => {
            utils.setDeepLinkingType( "" );
            utils.setDeepLinkingUrl( "" );
            this.setState( {
              arr_ModelBackupAssociateOpenContactList: [
                {
                  modalVisible: false,
                  walletName: "",
                }
              ]
            } )
          } }
        />
        <ModelBackupYourWallet
          data={ arr_ModelBackupYourWallet }
          click_UseOtherMethod={ () => Alert.alert( "coming soon" ) }
          click_Confirm={ async () => {
            this.setState( {
              arr_ModelBackupYourWallet: [ {
                modalVisible: false,
              } ]
            } )
            this.props.navigation.push( "HealthOfTheAppNavigator" );
          } }
          closeModal={ () => {
            this.setState( {
              arr_ModelBackupYourWallet: [ {
                modalVisible: false,
              } ]
            } )
          } }
        />
        <ModelBottomAddTestCoinsAndAccounts
          data={ arrModelBottomAddTestCoinsAndAccounts }
        />
        <ModelHelperScreen
          data={ arrModelHelperScreen }
          closeModal={ async () => {
            AsyncStorage.setItem(
              asyncStorageKeys.flagHelperWalletScreen,
              JSON.stringify( true )
            );
            this.setState( {
              arrModelHelperScreen: [ {
                modalVisible: false,
                images: [ "helper1" ]
              } ]
            }, () => this.asyncTask() )

          } }
        />
        <ModelLoader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
        <ModelLoaderPdfFileCreate loading={ flag_LoadingPdfFile } color={ colors.appColor } size={ 30 } msg="Creating Wallet backup. This may take a while. Just stick around." />
        <StatusBar backgroundColor={ colors.appColor } hidden={ false } barStyle="dark-content" />
      </Container>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    width: "100%"
  },
  plusButtonBottom: {
    position: "absolute",
    zIndex: 1,
  },
  svgImage: {
    width: "100%",
    height: "100%"
  }
} );

export default Wallet;
