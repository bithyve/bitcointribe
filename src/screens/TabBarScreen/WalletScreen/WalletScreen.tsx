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
  Image,
  RefreshControl,
  ImageBackground
} from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Right,
  Body,
  Text,
  List,
  ListItem,
  Icon,
  Fab
} from "native-base";
import { RkCard } from "react-native-ui-kitten";
import DropdownAlert from "react-native-dropdownalert";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import Permissions from 'react-native-permissions';


//Custome Compontes
import ViewShieldIcons from "HexaWallet/src/app/custcompontes/View/ViewShieldIcons/ViewShieldIcons";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome Models
import ModelAcceptOrRejectSecret from "HexaWallet/src/app/custcompontes/Model/ModelBackupTrustedContactShareStore/ModelAcceptOrRejectSecret";
import ModelBackupShareAssociateContact from "HexaWallet/src/app/custcompontes/Model/ModelBackupTrustedContactShareStore/ModelBackupShareAssociateContact";
import ModelBackupAssociateOpenContactList from "HexaWallet/src/app/custcompontes/Model/ModelBackupTrustedContactShareStore/ModelBackupAssociateOpenContactList";
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelSelfShareAcceptAndReject from "HexaWallet/src/app/custcompontes/Model/ModelWalletScreen/ModelSelfShareAcceptAndReject";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome object
import {
  colors,
  images,
  localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
import Singleton from "HexaWallet/src/app/constants/Singleton";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

let isNetwork: boolean;
const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);
function wp( percentage: number ) {
  const value = ( percentage * viewportWidth ) / 100;
  return Math.round( value );
}
const slideHeight = viewportHeight * 0.36;
const slideWidth = wp( 75 );
const itemHorizontalMargin = wp( 2 );
const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 2;
const SLIDER_1_FIRST_ITEM = 0;

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

//TODO: Bitcoin files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";


export default class WalletScreen extends React.Component {
  constructor ( props: any ) {
    super( props );
    this.state = {
      isNetwork: true,
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
      //DeepLinking Param   
      deepLinkingUrl: "",
      deepLinkingUrlType: "",
      flag_FabActive: false,

      //Circler Progress
      progressFill: 15,
      //flag   
      flag_refreshing: false,
      flag_cardScrolling: false,
      flag_Loading: false,
    };
    isNetwork = utils.getNetwork();
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    let { progressFill } = this.state;
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {

        // isNetwork = utils.getNetwork();
        this.connnection_FetchData();
        this.getDeepLinkingData();

        //calling refresh
        //this.refresh();  
      }
    );

    //TODO: Animation View
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
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  //TODO: func connnection_FetchData
  async connnection_FetchData() {
    var resultWallet = await utils.getWalletDetails();
    var resAccount = await comFunDBRead.readTblAccount();
    await comFunDBRead.readTblSSSDetails();
    console.log( { resAccount } );
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
      data.setupData = setupData;
      if ( setupData != "" )
        data.secureBtnTitle = setupData.title;
      else
        data.secureBtnTitle = ""
      temp.push( data )
    }
    console.log( { temp } );
    if ( resAccount.length > 4 ) {
      this.setState( {
        flag_cardScrolling: true
      } )
    }
    this.setState( {
      walletDetails: resultWallet,
      arr_accounts: temp,
    } );

    //TODO: appHealthStatus    
    let appHealth = resultWallet.appHealthStatus;
    if ( appHealth != "" ) {
      let resAppHealthStatus = JSON.parse( resultWallet.appHealthStatus );
      console.log( { resAppHealthStatus } );
      if ( resAppHealthStatus.overallStatus == "1" ) {
        this.setState( {
          shiledIconPer: 1,
          arr_CustShiledIcon: [
            {
              "title": "Looks like your app needs a quick check to maintain good health",
              "image": "sheild_1",
              "imageHeight": 80, //this.animatedShieldIconSize,
              "imageWidth": 80, //this.animatedShieldIconSize,
              progressFill: 15
            }
          ]
        } );
      } else {
        this.setState( {
          shiledIconPer: 3,
          arr_CustShiledIcon: [
            {
              "title": "Your wallet is not secure, some Information about backup comes here. Click on the icon to backup",
              "image": "sheild_2",
              "imageHeight": 80, //this.animatedShieldIconSize,
              "imageWidth": 80, //this.animatedShieldIconSize,
              progressFill: 30
            }
          ]
        } );
      }
    } else {
      this.setState( {
        shiledIconPer: 1,
        arr_CustShiledIcon: [
          {
            "title": "Looks like your app needs a quick check to maintain good health",
            "image": "sheild_1",
            "imageHeight": 80, //this.animatedShieldIconSize,
            "imageWidth": 80, //this.animatedShieldIconSize,
            progressFill: 15
          }
        ]
      } );
    }
  }

  //TODO: func get Deeplinking data 
  getDeepLinkingData() {
    let urlScript = utils.getDeepLinkingUrl();
    let urlType = utils.getDeepLinkingType();
    if ( urlType != "" ) {
      if ( urlType == "SSS Restore SMS/EMAIL" || urlType == "SSS Recovery QR" ) {
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
  }

  //TODO: click_SkipAssociateContact
  click_SkipAssociateContact = async () => {
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
      const sss = await utils.getS3ServiceObject();
      let resDownlaodShare = await S3Service.downloadShare( urlScriptDetails.data );
      console.log( { resDownlaodShare } );
      if ( resDownlaodShare.status == 200 ) {
        let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownlaodShare.data.encryptedMetaShare, urlScriptDetails.data );
        if ( resDecryptEncMetaShare.status == 200 ) {
          console.log( { resDecryptEncMetaShare } );
          const resUpdateHealth = await sss.updateHealth( resDecryptEncMetaShare.data.decryptedMetaShare.meta.walletId, resDecryptEncMetaShare.data.decryptedMetaShare.encryptedShare );
          if ( resUpdateHealth.status == 200 ) {
            const resTrustedParty = await dbOpration.insertTrustedPartyDetailWithoutAssociate(
              localDB.tableName.tblTrustedPartySSSDetails,
              dateTime,
              urlScript,
              resDecryptEncMetaShare.data,
              resDecryptEncMetaShare.data.decryptedMetaShare.meta,
              resDecryptEncMetaShare.data.decryptedMetaShare.encryptedStaticNonPMDD
            );
            if ( resTrustedParty ) {
              flag_Loading = false;
              utils.setDeepLinkingType( "" );
              utils.setDeepLinkingUrl( "" );
              setTimeout( () => {
                alert.simpleOk( "Success", "Decrypted share stored." );
              }, 100 );
            }
          }
        } else {
          flag_Loading = false;
          setTimeout( () => {
            alert.simpleOk( "Oops", resDecryptEncMetaShare.err );
          }, 100 );
        }
      } else {
        flag_Loading = false;
        setTimeout( () => {
          alert.simpleOk( "Oops", resDownlaodShare.err );
        }, 100 );
      }
      this.setState( {
        flag_Loading
      } )
    } else {
      this.props.navigation.push( "OTPBackupShareStoreNavigator" );
    }
  }


  storeSelfShare = async () => {
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
    const sss = await utils.getS3ServiceObject();
    let resDownlaodShare = await S3Service.downloadShare( urlScriptDetails.data );
    console.log( { resDownlaodShare } );
    if ( resDownlaodShare.status == 200 ) {
      let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownlaodShare.data.encryptedMetaShare, urlScriptDetails.data );
      if ( resDecryptEncMetaShare.status == 200 ) {
        console.log( { resDecryptEncMetaShare } );
        const resUpdateHealth = await sss.updateHealth( resDecryptEncMetaShare.data.decryptedMetaShare.meta.walletId, resDecryptEncMetaShare.data.decryptedMetaShare.encryptedShare );
        if ( resUpdateHealth.status == 200 ) {
          const resTrustedParty = await dbOpration.insertTrustedPartyDetailSelfShare(
            localDB.tableName.tblTrustedPartySSSDetails,
            dateTime,
            urlScript,
            resDecryptEncMetaShare.data,
            resDecryptEncMetaShare.data.decryptedMetaShare.meta,
            resDecryptEncMetaShare.data.decryptedMetaShare.encryptedStaticNonPMDD
          );
          if ( resTrustedParty ) {
            flag_Loading = false;
            utils.setDeepLinkingType( "" );
            utils.setDeepLinkingUrl( "" );
            setTimeout( () => {
              alert.simpleOk( "Success", "Self share stored." );
            }, 100 );
          }
        }
      } else {
        flag_Loading = false;
        setTimeout( () => {
          alert.simpleOk( "Oops", resDecryptEncMetaShare.err );
        }, 100 );
      }
    } else {
      flag_Loading = false;
      setTimeout( () => {
        alert.simpleOk( "Oops", resDownlaodShare.err );
      }, 100 );
    }
    this.setState( {
      flag_Loading
    } )
  }





  //TODO: func refresh
  refresh = async () => {
    this.setState( {
      flag_Loading: true
    } );
    var resAccount = await comFunDBRead.readTblAccount();
    console.log( { resAccount } );

    let regularAccount = await utils.getRegularAccountObject();
    let secureAccount = await utils.getSecureAccountObject();
    console.log( { regularAccount } );

    //Get Regular Account Bal
    var getBalR = await regularAccount.getBalance();
    if ( getBalR.status == 200 ) {
      getBalR = getBalR.data;
    } else {
      alert.simpleOk( "Oops", getBalR.err );
    }
    console.log( { getBalR } );
    const resUpdateAccountBalR = await dbOpration.updateAccountBalAddressWise(
      localDB.tableName.tblAccount,
      resAccount[ 0 ].address,
      getBalR.balance / 1e8
    );

    //Get Secure Account Bal
    let resUpdateAccountBalS;
    if ( resAccount[ 1 ].address != "" ) {
      var getBalS = await secureAccount.getBalance();
      if ( getBalS.status == 200 ) {
        getBalR = getBalS.data;
      } else {
        alert.simpleOk( "Oops", getBalS.err );
      }
      resUpdateAccountBalS = await dbOpration.updateAccountBalAddressWise(
        localDB.tableName.tblAccount,
        resAccount[ 1 ].address,
        getBalS.balance / 1e8
      );
    }

    if ( resUpdateAccountBalR ) {
      this.setState( {
        flag_Loading: false
      } )
      this.connnection_FetchData();
    }
  }

  // getTransactionAndBal() {
  //   let bal, getTransactions;
  //   if ( data.selectedAccount.accountType == "Regular Account" ) {
  //     bal = await regularAccount.getBalance();
  //     console.log( { bal } );
  //   } else {
  //   }
  //   if ( bal.status == 200 ) {
  //     const resUpdateAccountBal = await dbOpration.updateAccountBal(
  //       localDB.tableName.tblAccount,
  //       data.selectedAccount.address,
  //       bal.data.balance / 1e8,
  //       data.selectedAccount.id
  //     );
  //     if ( resUpdateAccountBal ) {
  //       getTransactions = await regularAccount.getTransactions();
  //       console.log( { getTransactions } );
  //       //update db bal
  //       const resUpdateAccountBal = await dbOpration.updateAccountBalAddressWise(
  //         localDB.tableName.tblAccount,
  //         resAccount[ 0 ].address,
  //         bal.data.balance / 1e8
  //       );
  //     }
  //     console.log( { resUpdateAccountBal } );
  //   } else {
  //     Alert.alert(
  //       'Oops',
  //       bal.err,
  //       [
  //         {
  //           text: 'Ok', onPress: () => {

  //           }
  //         },
  //       ],
  //       { cancelable: false },
  //     );
  //   }
  // }    



  _renderItem( { item, index } ) {
    return (
      <View key={ "card" + index }>
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
                borderBottomColor: "#F5F5F5",
                borderBottomWidth: 1
              } }
            >

              <SvgIcon
                name="icon_dailywallet"
                color="#37A0DA"
                size={ 40 }
              />
              <Text
                style={ [ globalStyle.ffFiraSansMedium, {
                  flex: 2,
                  fontSize: 16,
                  marginLeft: 10
                } ] }
              >
                { item.accountName }
              </Text>
              <SvgIcon name="icon_more" color="gray" size={ 15 } />
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
                <Text note style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] } >Anant's Savings</Text>
                <Text style={ [ globalStyle.ffOpenSansBold, { fontSize: 20 } ] }>
                  { item.balance }
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
                <Button transparent>
                  <SvgIcon
                    name="timelockNew"
                    color="gray"
                    size={ 20 }
                  />
                </Button>
                <Button transparent style={ { marginLeft: 10 } }>
                  <SvgIcon name="icon_multisig" color="gray" size={ 20 } />
                </Button>
              </View>

            </View>

          </RkCard>
        ) }
        { renderIf( item.accountType == "Secure Account" && item.address == "" )(
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
              rkCardContent
              style={ {
                flex: 1,
                flexDirection: "row",
                justifyContent: "center"
              } }
            >
              <View
                style={ {
                  flex: 1,
                  justifyContent: "center"
                } }
              >
                <SvgIcon
                  name="icon_dailywallet"
                  color="#37A0DA"
                  size={ 40 }
                />
              </View>
              <View style={ { flex: 3, alignItems: "flex-start", justifyContent: "center" } }>
                <Text
                  style={ [ globalStyle.ffFiraSansMedium, {
                    fontSize: 16,
                  } ] }
                >
                  { item.accountName }
                </Text>
                <Text note>Secure Account is not backed up</Text>
                { renderIf( item.secureBtnTitle == "" )(
                  <Text note style={ { color: "red" } }>Please first backup your sss</Text>
                ) }
              </View>
              { renderIf( item.secureBtnTitle != "" )(
                <View style={ { flex: 2, alignItems: "flex-end", justifyContent: "center" } }>
                  <Button light style={ { borderRadius: 8, borderColor: "gray", borderWidth: 0.4, alignSelf: "flex-end" } } onPress={ () => {
                    if ( item.secureBtnTitle == "Setup" ) {
                      this.props.navigation.push( "BackupSecureAccountWithPdfNavigator", { data: item } )
                    } else {
                      this.props.navigation.push( "ResotreSecureAccountNavigator", { prevScreen: "WalletScreen", data: item } );
                    }
                  } }>
                    <Text style={ { color: "#838383", fontSize: 14 } } >{ item.secureBtnTitle }</Text>
                  </Button>
                </View>
              ) }
            </View>
          </RkCard>
        ) }
        { renderIf( item.accountType == "Secure Account" && item.address != "" )(
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
              <SvgIcon
                name="icon_dailywallet"
                color="#37A0DA"
                size={ 40 }
              />
              <Text
                style={ [ globalStyle.ffFiraSansMedium, {
                  flex: 2,
                  fontSize: 16,
                  marginLeft: 10
                } ] }
              >
                { item.accountName }
              </Text>
              <SvgIcon name="icon_more" color="gray" size={ 15 } />
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
                <Text note style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] } >Anant's Savings</Text>
                <Text style={ [ globalStyle.ffOpenSansBold, { fontSize: 20 } ] }>
                  { item.balance }
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
                <Button transparent>
                  <SvgIcon
                    name="timelockNew"
                    color="gray"
                    size={ 20 }
                  />
                </Button>
                <Button transparent style={ { marginLeft: 10 } }>
                  <SvgIcon name="icon_multisig" color="gray" size={ 20 } />
                </Button>
              </View>

            </View>
          </RkCard>
        ) }
      </View>
    );
  }

  render() {
    //array
    let { walletDetails, arr_CustShiledIcon, arr_accounts } = this.state;
    //model array
    let { arr_ModelAcceptOrRejectSecret, arr_ModelBackupShareAssociateContact, arr_ModelBackupAssociateOpenContactList, arr_ModelBackupYourWallet, arr_ModelSelfShareAcceptAndReject } = this.state;
    //values
    //flag
    let { flag_cardScrolling, flag_Loading, flag_refreshing } = this.state;
    return (
      <Container>
        <Content
          scrollEnabled={ true }
          contentContainerStyle={ styles.container }
          refreshControl={
            <RefreshControl
              refreshing={ flag_refreshing }
              onRefresh={ this.refresh.bind( this ) }
            />
          }
        >
          <CustomeStatusBar backgroundColor={ colors.appColor } flagShowStatusBar={ true } barStyle="light-content" />
          <SafeAreaView style={ styles.container }>
            {/* Top View Animation */ }
            <Animated.View
              style={ {
                height: this.animatedHeaderHeight,
                backgroundColor: colors.appColor,
                flexDirection: "row",
                zIndex: 0
              } }
            >
              <Animated.View
                style={ {
                  marginLeft: 20,
                  flex: 4
                } }
              >
                <Animated.Text
                  style={ [ globalStyle.ffFiraSansMedium, {
                    color: "#fff",
                    fontSize: this.animatedAppTextSize,
                    marginTop: 20,
                    marginBottom: 30
                  } ] }
                >
                  { walletDetails.walletType != null ? walletDetails.walletType : "Hexa Wallet" }
                </Animated.Text>
                <Animated.Text
                  style={ [ globalStyle.ffFiraSansRegular, {
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
                contentContainerStyle={ { flex: 0 } }
                horizontal={ false }
                pagingEnabled={ false }
                scrollEnabled={ flag_cardScrolling == true ? true : false }
                onScroll={ Animated.event( [
                  {
                    nativeEvent: { contentOffset: { y: this.state.scrollY } }
                  }
                ] ) }
              >
                <FlatList
                  data={ arr_accounts }
                  showsVerticalScrollIndicator={ false }
                  scrollEnabled={ flag_cardScrolling == true ? true : false }
                  renderItem={ this._renderItem.bind( this ) }
                  keyExtractor={ ( item, index ) => index }
                />
              </ScrollView>
            </Animated.View>

          </SafeAreaView>
        </Content>
        <DropdownAlert ref={ ref => ( this.dropdown = ref ) } />
        <Button transparent style={ styles.plusButtonBottom }>
          <Fab
            active={ this.state.flag_FabActive }
            direction="up"
            containerStyle={ {} }
            style={ { backgroundColor: colors.appColor } }
            position="bottomRight"
            onPress={ () => this.setState( { flag_FabActive: !this.state.flag_FabActive } ) }>
            <Icon name="add" />
            <Button style={ { backgroundColor: '#34A34F' } }>
              <Icon name="logo-whatsapp" />
            </Button>
            <Button style={ { backgroundColor: '#3B5998' } }>
              <Icon name="logo-facebook" />
            </Button>
            <Button disabled style={ { backgroundColor: '#DD5144' } }>
              <Icon name="mail" />
            </Button>
          </Fab>
        </Button>

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

        <ModelBackupShareAssociateContact data={ arr_ModelBackupShareAssociateContact }
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

        <ModelBackupAssociateOpenContactList data={ arr_ModelBackupAssociateOpenContactList }
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
          click_UseOtherMethod={ () => Alert.alert( "Working" ) }
          click_Confirm={ async () => {
            this.setState( {
              arr_ModelBackupYourWallet: [ {
                modalVisible: false,
              } ]
            } )
            this.props.navigation.push( "HealthOfTheAppNavigator" );
            // let appHealthStatus = {};
            // appHealthStatus.backupType = "share";
            // let resUpdateAppHealthStatus = await dbOpration.updateWalletAppHealthStatus(
            //   localDB.tableName.tblWallet,
            //   appHealthStatus
            // );
            // if ( resUpdateAppHealthStatus ) {
            //   await comFunDBRead.readTblWallet();
            // }
          } }
        />
        <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
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
    bottom: 5,
    right: 5,
  },
  svgImage: {
    width: "100%",
    height: "100%"
  }
} );  
