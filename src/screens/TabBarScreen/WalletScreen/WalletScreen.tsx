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
  Alert
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
  ListItem
} from "native-base";
import { RkCard } from "react-native-ui-kitten";
import DropdownAlert from "react-native-dropdownalert";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import Permissions from 'react-native-permissions'

//Custome Compontes
import ViewShieldIcons from "HexaWallet/src/app/custcompontes/View/ViewShieldIcons/ViewShieldIcons";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome Models
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelFindYourTrustedContacts from "HexaWallet/src/app/custcompontes/Model/ModelFindYourTrustedContacts/ModelFindYourTrustedContacts";

import ModelBackupShareAssociateContact from "HexaWallet/src/app/custcompontes/Model/ModelBackupTrustedContactShareStore/ModelBackupShareAssociateContact";
import ModelBackupAssociateOpenContactList from "HexaWallet/src/app/custcompontes/Model/ModelBackupTrustedContactShareStore/ModelBackupAssociateOpenContactList";

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

export default class WalletScreen extends React.Component {
  constructor ( props: any ) {
    super( props );
    this.state = {
      isNetwork: true,
      arr_accounts: [],
      arr_SSSDetails: [],
      flag_cardScrolling: false,
      flag_Loading: false,
      walletDetails: [],
      //Shiled Icons
      shiledIconPer: 1,
      scrollY: new Animated.Value( 0 ),
      //custome comp
      arr_CustShiledIcon: [],
      //Model 
      arr_ModelBackupYourWallet: [],
      arr_ModelFindYourTrustedContacts: [],
      arr_ModelBackupShareAssociateContact: [],
      arr_ModelBackupAssociateOpenContactList: [],
      arr_ModelAcceptOrRejectSecret: [],
      //DeepLinking Param
      deepLinkingUrl: "",
      deepLinkingUrlType: ""
    };
    isNetwork = utils.getNetwork();
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        isNetwork = utils.getNetwork();
        this.connnection_FetchData();
        this.getDeepLinkingData();
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

  componentDidMount() {
    Permissions.request( 'camera' ).then( ( response: any ) => {
      console.log( response );
    } );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }


  //TODO: func connnection_FetchData
  async connnection_FetchData() {
    var resultWallet = await comFunDBRead.readTblWallet();
    var resAccount = await comFunDBRead.readTblAccount();
    if ( resAccount.length > 4 ) {
      this.setState( {
        flag_cardScrolling: true
      } )
    }
    var resSSSDetails = await comFunDBRead.readTblSSSDetails();
    this.setState( {
      walletDetails: resultWallet,
      arr_accounts: resAccount,
    } );
    //TODO: appHealthStatus funciton   
    let resAppHealthStatus = JSON.parse( resultWallet.appHealthStatus );
    console.log( { resAppHealthStatus } );
    if ( resAppHealthStatus.overallStatus == "1" ) {
      this.setState( {
        shiledIconPer: 1,
        arr_CustShiledIcon: [
          {
            "title": "Looks like your app needs a quick check to maintain good health",
            "image": "sheild_1",
            "imageHeight": this.animatedShieldIconSize,
            "imageWidth": this.animatedShieldIconSize
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
            "imageHeight": this.animatedShieldIconSize,
            "imageWidth": this.animatedShieldIconSize
          }
        ]
      } );
    }

  }




  //TODO: func get Deeplinking data 
  getDeepLinkingData() {
    let urlScript = utils.getDeepLinkingUrl();
    let urlType = utils.getDeepLinkingType();
    console.log( { urlScript } );
    if ( urlType != "" ) {
      this.setState( {
        deepLinkingUrl: urlScript,
        deepLinkingUrlType: urlType,
        arr_ModelBackupShareAssociateContact: [
          {
            modalVisible: true,
            walletName: urlScript.wn
          }
        ]
      } )
    }
  }

  //TODO: click_SkipAssociateContact

  click_SkipAssociateContact = async () => {
    let deepLinkingUrlType = utils.getDeepLinkingType();
    if ( deepLinkingUrlType == "SSS Recovery QR" ) {
      this.setState( {
        flag_Loading: true
      } );
      const dateTime = Date.now();
      let urlScriptDetails = utils.getDeepLinkingUrl();
      //console.log( { urlScriptDetails } );  
      let urlScriptData = urlScriptDetails.data;
      console.log( { urlScriptData } );
      let urlScript = {};
      urlScript.walletName = urlScriptDetails.wn;
      let walletDetails = utils.getWalletDetails();
      const sss = new S3Service(
        walletDetails.mnemonic
      );
      let resShareId = await sss.getShareId( urlScriptData.encryptedShare )
      console.log( { resShareId } );
      const { data, updated } = await sss.updateHealth( urlScriptData.meta.walletId, urlScriptData.encryptedShare );
      if ( updated ) {
        const resTrustedParty = await dbOpration.insertTrustedPartyDetailWithoutAssociate(
          localDB.tableName.tblTrustedPartySSSDetails,
          dateTime,
          urlScript,
          urlScriptData,
          resShareId,
          urlScriptData,
          typeof data !== "undefined" ? data : ""
        );
        this.setState( {
          flag_Loading: false,
        } )
        if ( resTrustedParty == true ) {
          setTimeout( () => {
            Alert.alert(
              'Success',
              'Decrypted share created.',
              [
                {
                  text: 'OK', onPress: () => {
                    utils.setDeepLinkingType( "" );
                    utils.setDeepLinkingUrl( "" );
                  }
                },

              ],
              { cancelable: false }
            )
          }, 100 );
        } else {
          setTimeout( () => {
            Alert.alert(
              'OH',
              resTrustedParty,
              [
                {
                  text: 'OK', onPress: () => {
                    utils.setDeepLinkingType( "" );
                    utils.setDeepLinkingUrl( "" );
                  }
                },
              ],
              { cancelable: false }
            )
          }, 100 );
        }
      } else {
        this.setState( {
          flag_Loading: false
        } )
        Alert.alert( "updateHealth func not working." )
      }
    } else {
      this.props.navigation.push( "OTPBackupShareStoreNavigator" );
    }
  }



  render() {
    let flag_cardScrolling = this.state.flag_cardScrolling;
    let walletDetails = this.state.walletDetails;
    return (
      <Container>
        <Content scrollEnabled={ false } contentContainerStyle={ styles.container }>
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
                  { this.state.arr_CustShiledIcon.length != 0 ? this.state.arr_CustShiledIcon[ 0 ].title : "" }
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
                <ViewShieldIcons data={ this.state.arr_CustShiledIcon } click_Image={ () => {
                  let resSSSDetails = utils.getSSSDetails();
                  if ( resSSSDetails.length > 0 ) {
                    if ( this.state.shiledIconPer == 0 ) {
                      this.props.navigation.push( "WalletSetUpScreen" )
                    } else {
                      this.setState( {
                        arr_ModelBackupYourWallet: [
                          {
                            modalVisible: true,
                          }
                        ]
                      } )
                    }
                  } else {
                    Alert.alert( "Working." );
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
                  data={ this.state.arr_accounts }
                  showsVerticalScrollIndicator={ false }
                  scrollEnabled={ flag_cardScrolling == true ? true : false }
                  renderItem={ ( { item } ) => (
                    <RkCard
                      rkType="shadowed"
                      style={ {
                        flex: 1,
                        margin: 10,
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
                  keyExtractor={ ( item, index ) => index }
                />
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </Content>
        <DropdownAlert ref={ ref => ( this.dropdown = ref ) } />
        <Button transparent style={ styles.plusButtonBottom }>
          <IconFontAwe name="plus" size={ 20 } color="#fff" />
        </Button>
        <ModelBackupYourWallet data={ this.state.arr_ModelBackupYourWallet }
          click_UseOtherMethod={ () => alert( 'working' ) }
          click_Confirm={ async () => {
            await Permissions.request( 'contacts' ).then( ( response: any ) => {
              console.log( response );
            } );
            this.setState( {
              arr_ModelBackupYourWallet: [
                {
                  modalVisible: false
                }
              ],
              arr_ModelFindYourTrustedContacts: [
                {
                  modalVisible: true
                }
              ]
            } );
          } }
          closeModal={ () => {
            this.setState( {
              arr_ModelBackupYourWallet: [
                {
                  modalVisible: false
                }
              ]
            } )
          } }
        />
        <ModelFindYourTrustedContacts
          data={ this.state.arr_ModelFindYourTrustedContacts }
          click_Confirm={ () => {
            AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
            this.setState( {
              arr_ModelFindYourTrustedContacts: [
                {
                  modalVisible: false
                }
              ]
            } )
            let resSSSDetails = utils.getSSSDetails();
            if ( resSSSDetails[ 0 ].keeperInfo != "" ) {
              this.props.navigation.push( "BackUpYourWalletSecoundTimeNavigator" );
            } else {
              this.props.navigation.push( "BackUpYourWalletNavigator" )
            }

          } }
          closeModal={ () => {
            this.setState( {
              arr_ModelFindYourTrustedContacts: [
                {
                  modalVisible: false
                }
              ]
            } )
          } }
        />

        <ModelBackupShareAssociateContact data={ this.state.arr_ModelBackupShareAssociateContact }
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

        <ModelBackupAssociateOpenContactList data={ this.state.arr_ModelBackupAssociateOpenContactList }
          click_OpenContact={ () => {
            this.setState( {
              arr_ModelBackupAssociateOpenContactList: [
                {
                  modalVisible: false,
                  walletName: "",
                }
              ]
            } );
            this.props.navigation.push( "BackupTrustedPartrySecretNavigator" )
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
        <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "absolute",
    bottom: 10,
    right: 10,
    alignSelf: "center",
    backgroundColor: colors.appColor,
    justifyContent: "center"
  },
  svgImage: {
    width: "100%",
    height: "100%"
  }
} );
