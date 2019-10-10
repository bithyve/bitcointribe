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
      //pdf
      qrcodeImageString1: "hexa",
      qrcodeImageString2: "hexa",
      qrcodeImageString3: "hexa",
      qrcodeImageString4: "hexa",
      qrcodeImageString5: "hexa",
      qrcodeImageString6: "hexa",
      qrcodeImageString7: "hexa",
      qrcodeImageString8: "hexa",
      qrcodeImageString9: "hexa",
      qrcodeImageString10: "hexa",
      base64string1: "",
      base64string2: "",
      base64string3: "",
      base64string4: "",
      base64string5: "",
      base64string6: "",
      base64string7: "",
      base64string8: "",
      base64string9: "",
      base64string10: "",
      flag_QrcodeDisaply: false,
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
      // this.setState( {
      //   flag_PdfFileCreate: true,
      //   arrErrorMessage: [ {
      //     type: "asyncTask",
      //     data: [ {
      //       message: "Creating your wallet backup",
      //       bgColor: "#262A2E",
      //       color: "#ffffff",
      //     } ]
      //   } ]  
      // } );
      const dateTime = Date.now();
      let walletDetails = await utils.getWalletDetails();
      let setUpWalletAnswerDetails = JSON.parse( walletDetails.setUpWalletAnswerDetails );
      console.log( { setUpWalletAnswerDetails } );
      let secureAccount = await bitcoinClassState.getSecureClassState();
      let sss = await bitcoinClassState.getS3ServiceClassState();
      var resSetupSecureAccount = await secureAccount.setupSecureAccount();
      if ( resSetupSecureAccount.status == 200 ) {
        resSetupSecureAccount = resSetupSecureAccount.data;
      } else {
        alert.simpleOkAction( "Oops", resSetupSecureAccount.err, this.click_StopLoader );
      }
      console.log( { resSetupSecureAccount } );
      var secondaryXpub = await secureAccount.getSecondaryXpub();
      if ( secondaryXpub.status == 200 ) {
        secondaryXpub = secondaryXpub.data.secondaryXpub;
      } else {
        alert.simpleOkAction( "Oops", secondaryXpub.err, this.click_StopLoader );
      }
      console.log( { secondaryXpub } );
      var getSecoundMnemonic = await secureAccount.getRecoveryMnemonic();
      if ( getSecoundMnemonic.status == 200 ) {
        await bitcoinClassState.setSecureClassState( secureAccount );
        getSecoundMnemonic = getSecoundMnemonic.data.secondaryMnemonic;
      } else {
        alert.simpleOkAction( "Oops", getSecoundMnemonic.err, this.click_StopLoader );
      }
      console.log( { getSecoundMnemonic } );
      //Get Shares                 
      const generateShareRes = await sss.generateShares( setUpWalletAnswerDetails[ 0 ].Answer );
      console.log( { generateShareRes } );
      if ( generateShareRes.status == 200 ) {
        const { encryptedShares } = generateShareRes.data;
        const autoHealthShares = encryptedShares.slice( 0, 3 );
        console.log( { autoHealthShares } );
        const resInitializeHealthcheck = await sss.initializeHealthcheck( autoHealthShares );
        console.log( { resInitializeHealthcheck } );
        if ( resInitializeHealthcheck.status == 200 || resInitializeHealthcheck.status == 400 ) {
          const shareIds = [];
          // console.log( { autoHealthShares } );
          for ( const share of encryptedShares ) {
            shareIds.push( S3Service.getShareId( share ) )
          }
          const socialStaticNonPMDD = { secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub }
          console.log( { socialStaticNonPMDD } );
          var resEncryptSocialStaticNonPMDD = await sss.encryptStaticNonPMDD( socialStaticNonPMDD );
          console.log( { shareIds, resEncryptSocialStaticNonPMDD } );
          if ( resEncryptSocialStaticNonPMDD.status == 200 ) {
            resEncryptSocialStaticNonPMDD = resEncryptSocialStaticNonPMDD.data.encryptedStaticNonPMDD;
            const buddyStaticNonPMDD = { getSecoundMnemonic, twoFASecret: resSetupSecureAccount.setupData.secret, secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub };
            console.log( { buddyStaticNonPMDD } );
            let resEncryptBuddyStaticNonPMDD = await sss.encryptStaticNonPMDD( buddyStaticNonPMDD );
            if ( resEncryptBuddyStaticNonPMDD.status == 200 ) {
              resEncryptBuddyStaticNonPMDD = resEncryptBuddyStaticNonPMDD.data.encryptedStaticNonPMDD;
              let rescreateMetaShare = await sss.createMetaShare( 1, encryptedShares[ 0 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
              console.log( { encpShare: encryptedShares[ 1 ], rescreateMetaShare } );
              let resGenerateEncryptedMetaShare1 = await sss.generateEncryptedMetaShare( rescreateMetaShare.data.metaShare );
              let rescreateMetaShare1 = await sss.createMetaShare( 2, encryptedShares[ 1 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
              console.log( { encpShare: encryptedShares[ 2 ], rescreateMetaShare1 } );
              let resGenerateEncryptedMetaShare2 = await sss.generateEncryptedMetaShare( rescreateMetaShare1.data.metaShare );
              let rescreateMetaShare2 = await sss.createMetaShare( 3, encryptedShares[ 2 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
              let resGenerateEncryptedMetaShare3 = await sss.generateEncryptedMetaShare( rescreateMetaShare2.data.metaShare );
              console.log( { rescreateMetaShare2 } );
              //for pdf                      
              let rescreateMetaShare3 = await sss.createMetaShare( 4, encryptedShares[ 3 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
              console.log( { rescreateMetaShare3 } );
              if ( rescreateMetaShare3.status == 200 ) {
                var qrcode4share = await sss.createQR( rescreateMetaShare3.data.metaShare, 4 );
                console.log( { qrcode4share } );
                if ( qrcode4share.status == 200 ) {
                  qrcode4share = qrcode4share.data.qrData
                  // console.log( { qrcode4share } );
                  //creating 4th share pdf   
                  let temp = [];
                  temp.push( { arrQRCodeData: qrcode4share, secondaryXpub: secondaryXpub, qrData: resSetupSecureAccount.setupData.qrData, secret: resSetupSecureAccount.setupData.secret, secondaryMnemonic: getSecoundMnemonic, bhXpub: resSetupSecureAccount.setupData.bhXpub } )
                  let resGenerate4thsharepdf = await this.generate4thShare( temp, setUpWalletAnswerDetails[ 0 ].Answer, walletDetails );
                  console.log( { resGenerate4thsharepdf } );
                  if ( resGenerate4thsharepdf != "" ) {
                    let rescreateMetaShare4 = await sss.createMetaShare( 5, encryptedShares[ 4 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                    console.log( { rescreateMetaShare4 } );
                    if ( rescreateMetaShare4.status == 200 ) {
                      var qrcode5share = await sss.createQR( rescreateMetaShare4.data.metaShare, 5 );
                      console.log( { qrcode5share } );
                      if ( qrcode5share.status == 200 ) {
                        qrcode5share = qrcode5share.data.qrData
                        let temp = [];
                        temp.push( { arrQRCodeData: qrcode5share, secondaryXpub: secondaryXpub, qrData: resSetupSecureAccount.setupData.qrData, secret: resSetupSecureAccount.setupData.secret, secondaryMnemonic: getSecoundMnemonic, bhXpub: resSetupSecureAccount.setupData.bhXpub } )
                        console.log( { temp } );
                        let resGenerate5thsharepdf = await this.generate5thShare( temp, setUpWalletAnswerDetails[ 0 ].Answer, walletDetails );
                        console.log( { resGenerate5thsharepdf } );
                        if ( resGenerate5thsharepdf != "" ) {
                          let keeperInfo = [ { info: null }, { info: null }, { info: rescreateMetaShare2.data }, { info: qrcode4share[ 0 ] }, { info: qrcode5share[ 0 ] } ];
                          let encryptedMetaShare = [ { metaShare: rescreateMetaShare.data.metaShare }, { metaShare: rescreateMetaShare1.data.metaShare }, { metaShare: rescreateMetaShare2.data.metaShare }, { metaShare: resGenerate4thsharepdf }, { metaShare: resGenerate5thsharepdf } ]
                          let arrTypes = [ { type: "Trusted Contacts 1" }, { type: "Trusted Contacts 2" }, { type: "Self Share 1" }, { type: "Self Share 2" }, { type: "Self Share 3" } ];
                          let temp = [ { date: dateTime, share: encryptedShares, shareId: shareIds, keeperInfo: keeperInfo, encryptedMetaShare: encryptedMetaShare, type: arrTypes } ]
                          console.log( { temp } );
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
                          console.log( { resInsertSSSShare } );
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

  base64string1 = async ( base64string1: any ) => {
    try {
      this.setState( {
        base64string1
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }
  base64string2 = async ( base64string2: any ) => {
    try {
      this.setState( {
        base64string2
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }
  base64string3 = async ( base64string3: any ) => {
    try {
      this.setState( {
        base64string3
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }
  base64string4 = async ( base64string4: any ) => {
    try {
      this.setState( {
        base64string4
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }
  base64string5 = async ( base64string5: any ) => {
    try {
      this.setState( {
        base64string5
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }
  base64string6 = async ( base64string6: any ) => {
    try {
      this.setState( {
        base64string6
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  base64string7 = async ( base64string7: any ) => {
    try {
      this.setState( {
        base64string7
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  base64string8 = async ( base64string8: any ) => {
    try {
      this.setState( {
        base64string8
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  base64string9 = async ( base64string9: any ) => {
    try {
      this.setState( {
        base64string9
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }



  base64string10 = async ( base64string10: any ) => {
    try {
      this.setState( {
        base64string10
      } );
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


  //For 4th Share
  generate4thShare = async ( data: any, password: string, walletDetails: any ) => {
    try {
      console.log( { password, walletDetails } );
      return new Promise( async ( resolve, reject ) => {
        data = data[ 0 ];
        let arrQRCodeData = data.arrQRCodeData;
        let secondaryXpub = data.secondaryXpub;
        let qrData = data.qrData;
        //set state value for qrcode   
        this.setState( {
          qrcodeImageString1: await this.getCorrectFormatStirng( arrQRCodeData[ 0 ] ),
          qrcodeImageString2: await this.getCorrectFormatStirng( arrQRCodeData[ 1 ] ),
          qrcodeImageString3: await this.getCorrectFormatStirng( arrQRCodeData[ 2 ] ),
          qrcodeImageString4: await this.getCorrectFormatStirng( arrQRCodeData[ 3 ] ),
          qrcodeImageString5: await this.getCorrectFormatStirng( arrQRCodeData[ 4 ] ),
          qrcodeImageString6: await this.getCorrectFormatStirng( arrQRCodeData[ 5 ] ),
          qrcodeImageString7: await this.getCorrectFormatStirng( arrQRCodeData[ 6 ] ),
          qrcodeImageString8: await this.getCorrectFormatStirng( arrQRCodeData[ 7 ] ),
          qrcodeImageString9: secondaryXpub,
          qrcodeImageString10: qrData,
        }, async () => {
          await this.svg1.toDataURL( this.base64string1 );
          await this.svg2.toDataURL( this.base64string2 );
          await this.svg3.toDataURL( this.base64string3 );
          await this.svg4.toDataURL( this.base64string4 );
          await this.svg5.toDataURL( this.base64string5 );
          await this.svg6.toDataURL( this.base64string6 );
          await this.svg7.toDataURL( this.base64string7 );
          await this.svg8.toDataURL( this.base64string8 );
          await this.svg9.toDataURL( this.base64string9 );
          await this.svg10.toDataURL( this.base64string10 );
          setTimeout( async () => {
            let base64string1 = this.state.base64string1;
            let base64string2 = this.state.base64string2;
            let base64string3 = this.state.base64string3;
            let base64string4 = this.state.base64string4;
            let base64string5 = this.state.base64string5;
            let base64string6 = this.state.base64string6;
            let base64string7 = this.state.base64string7;
            let base64string8 = this.state.base64string8;
            let base64string9 = this.state.base64string9;
            let base64string10 = this.state.base64string10;
            let res4thShare1Create = await this.generateSahreQRCode( base64string1, "qrcode4thSahre1.png" );
            // console.log( { res4thShare1Create } );     
            let res4thShare2Create = await this.generateSahreQRCode( base64string2, "qrcode4thSahre2.png" );
            //    console.log( { res4thShare2Create } );
            let res4thShare3Create = await this.generateSahreQRCode( base64string3, "qrcode4thSahre3.png" );
            //  console.log( { res4thShare3Create } );
            let res4thShare4Create = await this.generateSahreQRCode( base64string4, "qrcode4thSahre4.png" );
            //console.log( { res4thShare4Create } );
            let res4thShare5Create = await this.generateSahreQRCode( base64string5, "qrcode4thSahre5.png" );
            //console.log( { res4thShare5Create } );
            let res4thShare6Create = await this.generateSahreQRCode( base64string6, "qrcode4thSahre6.png" );
            //console.log( { res4thShare6Create } );
            let res4thShare7Create = await this.generateSahreQRCode( base64string7, "qrcode4thSahre7.png" );
            //console.log( { res4thShare7Create } );   
            let res4thShare8Create = await this.generateSahreQRCode( base64string8, "qrcode4thSahre8.png" );
            //console.log( { res4thShare8Create } );
            let resSecoundXpub4Share = await this.generateXpubAnd2FAQRCode( base64string9, "secoundryXpub4Share.png" );
            // console.log( { resSecoundXpub4Share } );  
            let res2FASecret4Share = await this.generateXpubAnd2FAQRCode( base64string10, "googleAuto2FASecret4Share.png" );
            // console.log( { res2FASecret4Share } );
            var create4thPdf;
            if ( Platform.OS == "android" ) {
              create4thPdf = await this.genreatePdf( data, "/storage/emulated/0/qrcode4thSahre1.png", "/storage/emulated/0/qrcode4thSahre2.png", "/storage/emulated/0/qrcode4thSahre3.png", "/storage/emulated/0/qrcode4thSahre4.png", "/storage/emulated/0/qrcode4thSahre5.png", "/storage/emulated/0/qrcode4thSahre6.png", "/storage/emulated/0/qrcode4thSahre7.png", "/storage/emulated/0/qrcode4thSahre8.png", "/storage/emulated/0/secoundryXpub4Share.png", "/storage/emulated/0/googleAuto2FASecret4Share.png", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 4.pdf", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 4", password );
            } else {
              create4thPdf = await this.genreatePdf( data, res4thShare1Create, res4thShare2Create, res4thShare3Create, res4thShare4Create, res4thShare5Create, res4thShare6Create, res4thShare7Create, res4thShare8Create, resSecoundXpub4Share, res2FASecret4Share, walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 4.pdf", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 4", password );
            }
            resolve( create4thPdf );
          }, delayTime.walletScreen.delay_qrcodeimage );
        } );
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  //for 5th share
  generate5thShare = async ( data: any, password: string, walletDetails: any ) => {
    try {
      return new Promise( async ( resolve, reject ) => {
        data = data[ 0 ];
        let arrQRCodeData = data.arrQRCodeData;
        let secondaryXpub = data.secondaryXpub;
        let qrData = data.qrData;
        console.log( { arrQRCodeData, secondaryXpub, qrData } );
        console.log( { password } );
        //set state value for qrcode
        this.setState( {
          qrcodeImageString1: await this.getCorrectFormatStirng( arrQRCodeData[ 0 ] ),
          qrcodeImageString2: await this.getCorrectFormatStirng( arrQRCodeData[ 1 ] ),
          qrcodeImageString3: await this.getCorrectFormatStirng( arrQRCodeData[ 2 ] ),
          qrcodeImageString4: await this.getCorrectFormatStirng( arrQRCodeData[ 3 ] ),
          qrcodeImageString5: await this.getCorrectFormatStirng( arrQRCodeData[ 4 ] ),
          qrcodeImageString6: await this.getCorrectFormatStirng( arrQRCodeData[ 5 ] ),
          qrcodeImageString7: await this.getCorrectFormatStirng( arrQRCodeData[ 6 ] ),
          qrcodeImageString8: await this.getCorrectFormatStirng( arrQRCodeData[ 7 ] ),
          qrcodeImageString9: secondaryXpub,
          qrcodeImageString10: qrData,
        }, async () => {
          await this.svg1.toDataURL( this.base64string1 );
          await this.svg2.toDataURL( this.base64string2 );
          await this.svg3.toDataURL( this.base64string3 );
          await this.svg4.toDataURL( this.base64string4 );
          await this.svg5.toDataURL( this.base64string5 );
          await this.svg6.toDataURL( this.base64string6 );
          await this.svg7.toDataURL( this.base64string7 );
          await this.svg8.toDataURL( this.base64string8 );
          await this.svg9.toDataURL( this.base64string9 );
          await this.svg10.toDataURL( this.base64string10 );
          setTimeout( async () => {
            let base64string1 = this.state.base64string1;
            let base64string2 = this.state.base64string2;
            let base64string3 = this.state.base64string3;
            let base64string4 = this.state.base64string4;
            let base64string5 = this.state.base64string5;
            let base64string6 = this.state.base64string6;
            let base64string7 = this.state.base64string7;
            let base64string8 = this.state.base64string8;
            let base64string9 = this.state.base64string9;
            let base64string10 = this.state.base64string10;
            let res5thShare1Create = await this.generateSahreQRCode( base64string1, "qrcode5thSahre1.png" );
            console.log( { res5thShare1Create } );
            let res5thShare2Create = await this.generateSahreQRCode( base64string2, "qrcode5thSahre2.png" );
            //    console.log( { res4thShare2Create } );
            let res5thShare3Create = await this.generateSahreQRCode( base64string3, "qrcode5thSahre3.png" );
            //  console.log( { res4thShare3Create } );
            let res5thShare4Create = await this.generateSahreQRCode( base64string4, "qrcode5thSahre4.png" );
            //console.log( { res4thShare4Create } );
            let res5thShare5Create = await this.generateSahreQRCode( base64string5, "qrcode5thSahre5.png" );
            //console.log( { res4thShare5Create } );
            let res5thShare6Create = await this.generateSahreQRCode( base64string6, "qrcode5thSahre6.png" );
            //console.log( { res5thShare6Create } );
            let res5thShare7Create = await this.generateSahreQRCode( base64string7, "qrcode5thSahre7.png" );
            //console.log( { res5thShare7Create } );
            let res5thShare8Create = await this.generateSahreQRCode( base64string8, "qrcode5thSahre8.png" );
            //console.log( { res5thShare8Create } );   
            let resSecoundXpub5Share = await this.generateXpubAnd2FAQRCode( base64string9, "secoundryXpub5Share.png" );
            // console.log( { resSecoundXpub4Share } );
            let res2FASecret5Share = await this.generateXpubAnd2FAQRCode( base64string10, "googleAuto2FASecret5Share.png" );
            // console.log( { res2FASecret4Share } );  
            var create5thPdf;
            if ( Platform.OS == "android" ) {
              create5thPdf = await this.genreatePdf( data, "/storage/emulated/0/qrcode5thSahre1.png", "/storage/emulated/0/qrcode5thSahre2.png", "/storage/emulated/0/qrcode5thSahre3.png", "/storage/emulated/0/qrcode5thSahre4.png", "/storage/emulated/0/qrcode5thSahre5.png", "/storage/emulated/0/qrcode5thSahre6.png", "/storage/emulated/0/qrcode5thSahre7.png", "/storage/emulated/0/qrcode5thSahre8.png", "/storage/emulated/0/secoundryXpub5Share.png", "/storage/emulated/0/googleAuto2FASecret5Share.png", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 5.pdf", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 5", password );
            } else {
              create5thPdf = await this.genreatePdf( data, res5thShare1Create, res5thShare2Create, res5thShare3Create, res5thShare4Create, res5thShare5Create, res5thShare6Create, res5thShare7Create, res5thShare8Create, resSecoundXpub5Share, res2FASecret5Share, walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 5.pdf", walletDetails.walletType.split( " " )[ 0 ] + " Hexa Wallet Share 5", password );
            }
            resolve( create5thPdf );
          }, delayTime.walletScreen.delay_qrcodeimage );
        } );
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  generateSahreQRCode = async ( share1: any, fileName: string ) => {
    try {
      return new Promise( async ( resolve, reject ) => {
        console.log( { share1, fileName } );
        var docsDir;
        if ( Platform.OS == "android" ) {
          docsDir = await RNFS.ExternalStorageDirectoryPath + "/pdfFiles/"; // RNFS.DocumentDirectoryPath; 
        } else {
          docsDir = await PDFLib.getDocumentsDirectory();
        }
        docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
        console.log( { docsDir } );
        var path = `${ docsDir }/${ fileName }`;
        RNFS.writeFile( path, share1, "base64" )
          .then( ( success: any ) => {
            console.log( { path } );
            resolve( path );
          } )
          .catch( ( err: any ) => {
            alert.simpleOk( "Oops", err );
          } )
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  generateXpubAnd2FAQRCode = async ( share1: string, fileName: string ) => {
    try {
      return new Promise( async ( resolve, reject ) => {
        console.log( { xpuband2fa: share1, fileName } );
        var docsDir;
        if ( Platform.OS == "android" ) {
          docsDir = await RNFS.ExternalStorageDirectoryPath + "/pdfFiles/"; // RNFS.DocumentDirectoryPath; //
        } else {
          docsDir = await PDFLib.getDocumentsDirectory();
        }
        docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
        console.log( { dir: docsDir } );

        var path = `${ docsDir }/${ fileName }`;
        RNFS.writeFile( path, share1, "base64" )
          .then( ( success: any ) => {
            console.log( { path } );
            resolve( path );
          } )
          .catch( ( err: any ) => {
            alert.simpleOk( "Oops", err );
          } )
      } );
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


  genreatePdf = async ( data: any, pathShare1: string, pathShare2: string, pathShare3: string, pathShare4: string, pathShare5: string, pathShare6: string, pathShare7: string, pathShare8: string, pathSecoundXpub: string, path2FASecret: string, pdfFileName: string, forShare: string, password: string ) => {
    try {


      return new Promise( async ( resolve, reject ) => {
        console.log( { data, pathShare1, pathShare8, pdfFileName, forShare } );
        console.log( { password } );
        let arrQRCodeData = data.arrQRCodeData;
        let secret2FA = data.secret;
        let secondaryMnemonic = data.secondaryMnemonic;
        let bhXpub = data.bhXpub;
        //Share 1 
        // let arrShare1 = .split();   
        // console.log( { arrShare1 } );       
        let arrShare1 = this.chunkArray( arrQRCodeData[ 0 ], 7 );
        let arrShare2 = this.chunkArray( arrQRCodeData[ 1 ], 7 );
        let arrShare3 = this.chunkArray( arrQRCodeData[ 2 ], 7 );
        let arrShare4 = this.chunkArray( arrQRCodeData[ 3 ], 7 );
        let arrShare5 = this.chunkArray( arrQRCodeData[ 4 ], 7 );
        let arrShare6 = this.chunkArray( arrQRCodeData[ 5 ], 7 );
        let arrShare7 = this.chunkArray( arrQRCodeData[ 6 ], 7 );
        let arrShare8 = this.chunkArray( arrQRCodeData[ 7 ], 7 );
        //Secound Mnemonic
        let arrSecondaryMnemonic = secondaryMnemonic.split( ' ' );
        var firstArrSecondaryMnemonic, secoundArrSecondaryMnemonic, threeSecondaryMnemonic;
        let arrSepArray = this.chunkArray( arrSecondaryMnemonic, 3 );
        firstArrSecondaryMnemonic = arrSepArray[ 0 ].toString();
        firstArrSecondaryMnemonic = firstArrSecondaryMnemonic.split( ',' ).join( ' ' );
        secoundArrSecondaryMnemonic = arrSepArray[ 1 ].toString();
        secoundArrSecondaryMnemonic = secoundArrSecondaryMnemonic.split( ',' ).join( ' ' );
        threeSecondaryMnemonic = arrSepArray[ 2 ].toString();
        threeSecondaryMnemonic = threeSecondaryMnemonic.split( ',' ).join( ' ' );
        //bhXpub
        // console.log( { bhXpub } );
        var firstArrbhXpub, secoundArrbhXpub, threebhXpub;
        let arrSepArraybhXpub = bhXpub.match( /.{1,40}/g );
        // console.log( arrSepArraybhXpub );
        firstArrbhXpub = arrSepArraybhXpub[ 0 ].toString();
        firstArrbhXpub = firstArrbhXpub.split( ',' ).join( ' ' );
        secoundArrbhXpub = arrSepArraybhXpub[ 1 ].toString();
        secoundArrbhXpub = secoundArrbhXpub.split( ',' ).join( ' ' );
        threebhXpub = arrSepArraybhXpub[ 2 ].toString();
        threebhXpub = threebhXpub.split( ',' ).join( ' ' );

        //console.log( { secondaryMnemonic, bhXpub } );
        var docsDir;
        if ( Platform.OS == "android" ) {
          docsDir = await RNFS.ExternalStorageDirectoryPath;
        } else {
          docsDir = await PDFLib.getDocumentsDirectory();
        }
        const pdfPath = `${ docsDir }/${ pdfFileName }`;
        console.log( { pdfPath } );
        const page1 = PDFPage
          .create()
          .drawText( forShare, {
            x: 5,
            y: 480,
            fontSize: 18
          } )
          .drawText( 'Part 1', {
            x: 5,
            y: 470,
            fontSize: 10
          } )
          .drawImage(
            pathShare1,
            'png',
            {
              x: 40,
              y: 320,
              width: 160,
              height: 140,
              //source: 'assets'
            }
          )
          .drawText( arrShare1[ 0 ].toString(), {
            x: 10,
            y: 300,
            fontSize: 10
          } )
          .drawText( arrShare1[ 1 ].toString(), {
            x: 10,
            y: 290,
            fontSize: 10
          } )
          .drawText( arrShare1[ 2 ].toString(), {
            x: 10,
            y: 280,
            fontSize: 10
          } )
          .drawText( arrShare1[ 3 ].toString(), {
            x: 10,
            y: 270,
            fontSize: 10
          } )
          .drawText( arrShare1[ 4 ].toString(), {
            x: 10,
            y: 260,
            fontSize: 10
          } )
          .drawText( arrShare1[ 5 ].toString(), {
            x: 10,
            y: 250,
            fontSize: 10
          } )
          .drawText( arrShare1[ 6 ].toString(), {
            x: 10,
            y: 240,
            fontSize: 10
          } )
          .drawText( 'Part 2', {
            x: 5,
            y: 230,
            fontSize: 10
          } )
          .drawImage(
            pathShare2,
            'png',
            {
              x: 40,
              y: 80,
              width: 160,
              height: 140,
              // source: 'assets'
            }
          )
          .drawText( arrShare2[ 0 ].toString(), {
            x: 10,
            y: 60,
            fontSize: 10
          } )
          .drawText( arrShare2[ 1 ].toString(), {
            x: 10,
            y: 50,
            fontSize: 10
          } )
          .drawText( arrShare2[ 2 ].toString(), {
            x: 10,
            y: 40,
            fontSize: 10
          } )
          .drawText( arrShare2[ 3 ].toString(), {
            x: 10,
            y: 30,
            fontSize: 10
          } )
          .drawText( arrShare2[ 4 ].toString(), {
            x: 10,
            y: 20,
            fontSize: 10
          } )
          .drawText( arrShare2[ 5 ].toString(), {
            x: 10,
            y: 10,
            fontSize: 10
          } )
          .drawText( arrShare2[ 6 ].toString(), {
            x: 10,
            y: 1,
            fontSize: 10
          } )

        const page2 = PDFPage
          .create()
          .drawText( 'Part 3', {
            x: 5,
            y: 470,
            fontSize: 10
          } )
          .drawImage(
            pathShare3,
            'png',
            {
              x: 40,
              y: 320,
              width: 160,
              height: 140,
              //source: 'assets'
            }
          )
          .drawText( arrShare3[ 0 ].toString(), {
            x: 10,
            y: 300,
            fontSize: 10
          } )
          .drawText( arrShare3[ 1 ].toString(), {
            x: 10,
            y: 290,
            fontSize: 10
          } )
          .drawText( arrShare3[ 2 ].toString(), {
            x: 10,
            y: 280,
            fontSize: 10
          } )
          .drawText( arrShare3[ 3 ].toString(), {
            x: 10,
            y: 270,
            fontSize: 10
          } )
          .drawText( arrShare3[ 4 ].toString(), {
            x: 10,
            y: 260,
            fontSize: 10
          } )
          .drawText( arrShare3[ 5 ].toString(), {
            x: 10,
            y: 250,
            fontSize: 10
          } )
          .drawText( arrShare3[ 6 ].toString(), {
            x: 10,
            y: 240,
            fontSize: 10
          } )
          .drawText( 'Part 4', {
            x: 5,
            y: 230,
            fontSize: 10
          } )
          .drawImage(
            pathShare4,
            'png',
            {
              x: 40,
              y: 80,
              width: 160,
              height: 140,
              // source: 'assets'
            }
          )
          .drawText( arrShare4[ 0 ].toString(), {
            x: 10,
            y: 60,
            fontSize: 10
          } )
          .drawText( arrShare4[ 1 ].toString(), {
            x: 10,
            y: 50,
            fontSize: 10
          } )
          .drawText( arrShare4[ 2 ].toString(), {
            x: 10,
            y: 40,
            fontSize: 10
          } )
          .drawText( arrShare4[ 3 ].toString(), {
            x: 10,
            y: 30,
            fontSize: 10
          } )
          .drawText( arrShare4[ 4 ].toString(), {
            x: 10,
            y: 20,
            fontSize: 10
          } )
          .drawText( arrShare4[ 5 ].toString(), {
            x: 10,
            y: 10,
            fontSize: 10
          } )
          .drawText( arrShare4[ 6 ].toString(), {
            x: 10,
            y: 1,
            fontSize: 10
          } )
        const page3 = PDFPage
          .create()
          .drawText( 'Part 5', {
            x: 5,
            y: 470,
            fontSize: 10
          } )
          .drawImage(
            pathShare5,
            'png',
            {
              x: 40,
              y: 320,
              width: 160,
              height: 140,
              //source: 'assets'
            }
          )
          .drawText( arrShare5[ 0 ].toString(), {
            x: 10,
            y: 300,
            fontSize: 10
          } )
          .drawText( arrShare5[ 1 ].toString(), {
            x: 10,
            y: 290,
            fontSize: 10
          } )
          .drawText( arrShare5[ 2 ].toString(), {
            x: 10,
            y: 280,
            fontSize: 10
          } )
          .drawText( arrShare5[ 3 ].toString(), {
            x: 10,
            y: 270,
            fontSize: 10
          } )
          .drawText( arrShare5[ 4 ].toString(), {
            x: 10,
            y: 260,
            fontSize: 10
          } )
          .drawText( arrShare5[ 5 ].toString(), {
            x: 10,
            y: 250,
            fontSize: 10
          } )
          .drawText( arrShare5[ 6 ].toString(), {
            x: 10,
            y: 240,
            fontSize: 10
          } )
          .drawText( 'Part 6', {
            x: 5,
            y: 230,
            fontSize: 10
          } )
          .drawImage(
            pathShare6,
            'png',
            {
              x: 40,
              y: 80,
              width: 160,
              height: 140,
              // source: 'assets'
            }
          )
          .drawText( arrShare6[ 0 ].toString(), {
            x: 10,
            y: 60,
            fontSize: 10
          } )
          .drawText( arrShare6[ 1 ].toString(), {
            x: 10,
            y: 50,
            fontSize: 10
          } )
          .drawText( arrShare6[ 2 ].toString(), {
            x: 10,
            y: 40,
            fontSize: 10
          } )
          .drawText( arrShare6[ 3 ].toString(), {
            x: 10,
            y: 30,
            fontSize: 10
          } )
          .drawText( arrShare6[ 4 ].toString(), {
            x: 10,
            y: 20,
            fontSize: 10
          } )
          .drawText( arrShare6[ 5 ].toString(), {
            x: 10,
            y: 10,
            fontSize: 10
          } )
          .drawText( arrShare6[ 6 ].toString(), {
            x: 10,
            y: 1,
            fontSize: 10
          } )
        const page4 = PDFPage
          .create()
          .drawText( 'Part 7', {
            x: 5,
            y: 470,
            fontSize: 10
          } )
          .drawImage(
            pathShare7,
            'png',
            {
              x: 40,
              y: 320,
              width: 160,
              height: 140,
              //source: 'assets'
            }
          )
          .drawText( arrShare7[ 0 ].toString(), {
            x: 10,
            y: 300,
            fontSize: 10
          } )
          .drawText( arrShare7[ 1 ].toString(), {
            x: 10,
            y: 290,
            fontSize: 10
          } )
          .drawText( arrShare7[ 2 ].toString(), {
            x: 10,
            y: 280,
            fontSize: 10
          } )
          .drawText( arrShare7[ 3 ].toString(), {
            x: 10,
            y: 270,
            fontSize: 10
          } )
          .drawText( arrShare7[ 4 ].toString(), {
            x: 10,
            y: 260,
            fontSize: 10
          } )
          .drawText( arrShare7[ 5 ].toString(), {
            x: 10,
            y: 250,
            fontSize: 10
          } )
          .drawText( arrShare7[ 6 ].toString(), {
            x: 10,
            y: 240,
            fontSize: 10
          } )
          .drawText( 'Part 8', {
            x: 5,
            y: 230,
            fontSize: 10
          } )
          .drawImage(
            pathShare8,
            'png',
            {
              x: 40,
              y: 80,
              width: 160,
              height: 140,
              // source: 'assets'
            }
          )
          .drawText( arrShare8[ 0 ].toString(), {
            x: 10,
            y: 60,
            fontSize: 10
          } )
          .drawText( arrShare8[ 1 ].toString(), {
            x: 10,
            y: 50,
            fontSize: 10
          } )
          .drawText( arrShare8[ 2 ].toString(), {
            x: 10,
            y: 40,
            fontSize: 10
          } )
          .drawText( arrShare8[ 3 ].toString(), {
            x: 10,
            y: 30,
            fontSize: 10
          } )
          .drawText( arrShare8[ 4 ].toString(), {
            x: 10,
            y: 20,
            fontSize: 10
          } )
          .drawText( arrShare8[ 5 ].toString(), {
            x: 10,
            y: 10,
            fontSize: 10
          } )
          .drawText( arrShare8[ 6 ].toString(), {
            x: 10,
            y: 1,
            fontSize: 10
          } )
        const page5 = PDFPage
          .create()
          .drawText( 'Secondary Xpub (Encrypted):', {
            x: 5,
            y: 480,
            fontSize: 18
          } )
          .drawImage(
            pathSecoundXpub,
            'png',
            {
              x: 25,
              y: 300,
              width: 160,
              height: 140,
              //source: 'assets'
            }
          )
          .drawText( 'Scan the above QR Code using your HEXA', {
            x: 30,
            y: 250,
            fontSize: 10
          } )
          .drawText( 'wallet in order to restore your Secure Account.', {
            x: 30,
            y: 240,
            fontSize: 10
          } )
        const page6 = PDFPage
          .create()
          .drawText( '2FA Secret:', {
            x: 5,
            y: 480,
            fontSize: 18
          } )
          .drawImage(
            path2FASecret,
            'png',
            {
              x: 25,
              y: 300,
              width: 160,
              height: 140,
              // source: 'assets'
            }
          )
          .drawText( secret2FA, {
            x: 25,
            y: 250,
            fontSize: 10
          } )
          .drawText( 'Following assets can be used to recover your funds using', {
            x: 5,
            y: 230,
            fontSize: 10
          } )
          .drawText( 'the open - sourced ga - recovery tool.', {
            x: 5,
            y: 220,
            fontSize: 10
          } )
          .drawText( 'Secondary Mnemonic:', {
            x: 5,
            y: 190,
            fontSize: 18
          } )
          .drawText( firstArrSecondaryMnemonic, {
            x: 5,
            y: 170,
            fontSize: 10
          } )
          .drawText( secoundArrSecondaryMnemonic, {
            x: 5,
            y: 160,
            fontSize: 10
          } )
          .drawText( threeSecondaryMnemonic, {
            x: 5,
            y: 150,
            fontSize: 10
          } )
          .drawText( 'BitHyve Xpub:', {
            x: 5,
            y: 120,
            fontSize: 18
          } )
          .drawText( firstArrbhXpub, {
            x: 5,
            y: 100,
            fontSize: 10
          } )
          .drawText( secoundArrbhXpub, {
            x: 5,
            y: 90,
            fontSize: 10
          } )
          .drawText( threebhXpub, {
            x: 5,
            y: 80,
            fontSize: 10
          } )
        if ( Platform.OS == "ios" ) {
          PDFDocument
            .create( pdfPath )
            .addPages( page1, page2, page3, page4, page5, page6 )
            .write()
            .then( async ( path: any ) => {
              console.log( 'PDF created at: ' + path );
              if ( Platform.OS == "ios" ) {
                var PdfPassword = NativeModules.PdfPassword;
                PdfPassword.addEvent( "/" + pdfFileName, password );
              }
              resolve( path );
            } );
        } else {
          PDFDocument
            .create( pdfPath )
            .addPages( page1, page2, page3, page4, page5, page6 )
            .write()
            .then( async ( path: any ) => {
              console.log( 'PDF created at: ' + path );
              console.log( { password } );
              //this.setPdfAndroidPasswrod( path, password );
              resolve( path );
            } );
        }
      } );
    } catch ( error ) {
      Alert.alert( error )
    }
  }


  // async function to call the Java native method
  async setPdfAndroidPasswrod( pdfPath: string, pdffilePassword: string ) {
    try {
      var PdfPassword = NativeModules.PdfPassword;
      PdfPassword.setPdfPasswrod( pdfPath, pdffilePassword, ( err: any ) => { console.log( err ) }, ( msg: any ) => { console.log( msg ) } );
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
    //qrcode string values
    let { qrcodeImageString1, qrcodeImageString2, qrcodeImageString3, qrcodeImageString4, qrcodeImageString5, qrcodeImageString6, qrcodeImageString7, qrcodeImageString8, qrcodeImageString9, qrcodeImageString10 } = this.state;

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
            <View style={ { flexDirection: "row", marginLeft: 500, height: 10 } }>
              <QRCode
                value={ qrcodeImageString1 }
                getRef={ ( c ) => ( this.svg1 = c ) }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString2 }
                getRef={ ( c ) => ( this.svg2 = c ) }
                style={ { height: 0, width: 0 } }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString3 }
                getRef={ ( c ) => ( this.svg3 = c ) }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString4 }
                getRef={ ( c ) => ( this.svg4 = c ) }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString5 }
                getRef={ ( c ) => ( this.svg5 = c ) }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString6 }
                getRef={ ( c ) => ( this.svg6 = c ) }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString7 }
                getRef={ ( c ) => ( this.svg7 = c ) }
                size={ 200 }
              />
              <QRCode
                value={ qrcodeImageString8 }
                getRef={ ( c ) => ( this.svg8 = c ) }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString9 }
                getRef={ ( c ) => ( this.svg9 = c ) }
                size={ 200 }

              />
              <QRCode
                value={ qrcodeImageString10 }
                getRef={ ( c ) => ( this.svg10 = c ) }
                size={ 200 }
              />
            </View>
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
