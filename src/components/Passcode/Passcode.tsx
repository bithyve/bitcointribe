import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Platform,
  Image,
  SafeAreaView,
  Keyboard,
  ImageBackground,
  Alert
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import * as Keychain from "react-native-keychain";


import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Pages
import { CustomeStatusBar } from "hexaCustomeStatusBar";
import { FullLinearGradientButton } from "hexaCustomeLinearGradientButton";

//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";

//TODO: Custome Object
import {
  colors,
  images,
  localDB,
  asyncStorageKeys
} from "hexaConstants";
import utils from "hexaUtils";
import Singleton from "hexaSingleton";
var dbOpration = require( "hexaDBOpration" );
import { renderIf } from "hexaValidation";

//TODO: Common Funciton  
var comFunDBRead = require( "hexaCommonDBReadData" );





export default class Passcode extends Component {

  constructor ( props: any ) {
    super( props );
    this.state = {
      mnemonicValues: [],
      status: false,
      pincode: "",
      success: "Passcode does not match!",
      flag_dialogShow: false,
      passcodeStyle: [
        {
          activeColor: colors.black,
          inactiveColor: colors.black,
          cellBorderWidth: 0
        }
      ]
    };
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    try {
      this.retrieveData();
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  async componentDidMount() {
    try {
      const resultWallet = await dbOpration.readTablesData(
        localDB.tableName.tblWallet
      );
      console.log( { resultWallet } );
      await utils.setWalletDetails( resultWallet.temp[ 0 ] );
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  retrieveData = async () => {
    try {
      const resultWallet = await dbOpration.readTablesData(
        localDB.tableName.tblWallet
      );
      await utils.setWalletDetails( resultWallet.temp );
      // AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
      const credentials = await Keychain.getGenericPassword();
      this.setState( {
        pincode: credentials.password
      } );
    } catch ( error ) {
      console.log( error );
    }
  }

  _onFinishCheckingCode( isValid: boolean, code: string ) {
    try {
      if ( isValid ) {
        this.setState( {
          status: true,
          passcodeStyle: [
            {
              activeColor: colors.black,
              inactiveColor: colors.black,
              cellBorderWidth: 0
            }
          ]
        } );
      } else {
        this.setState( {
          passcodeStyle: [
            {
              activeColor: "red",
              inactiveColor: "red",
              cellBorderWidth: 1
            }
          ]
        } );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  onSuccess = async ( code: string ) => {
    try {


      const rootViewController = await AsyncStorage.getItem( asyncStorageKeys.rootViewController );

      //Wallet Details Reading
      await comFunDBRead.readTblWallet();
      await comFunDBRead.readTblSSSDetails();

      let pageName = utils.getRootViewController();
      console.log( { pageName } );

      if ( pageName != "TrustedPartyShareSecretNavigator" && pageName != "OTPScreenNavigator" ) {
        const resetAction = StackActions.reset( {
          index: 0, // <-- currect active route from actions array
          key: null,
          actions: [
            NavigationActions.navigate( {
              routeName: rootViewController
            } )
          ]
        } );
        this.props.navigation.dispatch( resetAction );
      } else {
        const resetAction = StackActions.reset( {
          index: 0, // <-- currect active route from actions array
          key: null,
          actions: [
            NavigationActions.navigate( {
              routeName: pageName
            } )
          ]
        } );
        this.props.navigation.dispatch( resetAction );
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  };


  //TODO: func urlDecription
  async urlDecription( code: any ) {
    try {
      let commonData = Singleton.getInstance();
      let pageName = commonData.getRootViewController();
      var script = commonData.getDeepLinkingUrl();
      script = script.split( "_+_" ).join( "/" );
      let deepLinkingUrl = utils.decrypt( script, code.toString() );
      if ( deepLinkingUrl ) {
        const resultWallet = await dbOpration.readTablesData(
          localDB.tableName.tblWallet
        );
        console.log( { resultWallet } );
        let publicKey = resultWallet.temp[ 0 ].publicKey;
        let JsonDeepLinkingData = JSON.parse( deepLinkingUrl );
        if ( publicKey == JsonDeepLinkingData.cpk ) {
          console.log( "same public key" );
          Keyboard.dismiss();
        } else {
          const resetAction = StackActions.reset( {
            index: 0, // <-- currect active route from actions array
            key: null,
            actions: [
              NavigationActions.navigate( {
                routeName: pageName,
                params: {
                  data: deepLinkingUrl
                }
              } )
            ]
          } );
          this.props.navigation.dispatch( resetAction );
        }
        commonData.setRootViewController( "TabbarBottom" );
        this.setState( { flag_dialogShow: false } );
      } else {
        this.refs.codeInputRefUrlEncp.clear();
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  render() {
    return (
      <View style={ styles.container }>
        <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
          <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={ true }
              keyboardOpeningTime={ 0 }
              enableOnAndroid={ true }
              contentContainerStyle={ { flexGrow: 1 } }
            >
              <View style={ styles.viewAppLogo }>
                <Image style={ styles.imgAppLogo } source={ images.appIcon } />
                <Text
                  style={ [ FontFamily.ffFiraSansBold, { color: "#000000", marginTop: 20 } ] }
                >
                  Welcome to Hexa!
            </Text>
              </View>
              <View style={ styles.viewPasscode }>
                <Text
                  style={ [ FontFamily.ffFiraSansMedium, { marginTop: 10, color: "#8B8B8B" } ] }
                >
                  Enter Pin{ " " }
                </Text>
                <CodeInput
                  ref="codeInputRef1"
                  secureTextEntry
                  keyboardType="numeric"
                  codeLength={ 5 }
                  compareWithCode={ this.state.pincode }
                  activeColor={ this.state.passcodeStyle[ 0 ].activeColor }
                  inactiveColor={ this.state.passcodeStyle[ 0 ].inactiveColor }
                  className="border-box"
                  cellBorderWidth={ this.state.passcodeStyle[ 0 ].cellBorderWidth }
                  compareWithCode={ this.state.pincode }
                  autoFocus={ true }
                  inputPosition="center"
                  space={ 10 }
                  size={ 55 }
                  codeInputStyle={ { borderRadius: 5, backgroundColor: "#F1F1F1" } }
                  containerStyle={ {
                    alignItems: "center",
                    justifyContent: "center",
                    height: Platform.OS == "ios" ? 0 : 40,
                  } }
                  onFulfill={ ( isValid: any, code: any ) =>
                    this._onFinishCheckingCode( isValid, code )
                  }
                  type='withoutcharacters'
                />
                { renderIf( this.state.passcodeStyle[ 0 ].activeColor == "red" )(
                  <Text style={ [ FontFamily.ffFiraSansBookItalic, { color: "red", marginTop: 44 } ] }>{ this.state.success }</Text>
                ) }
              </View>
              <View style={ styles.viewBtnProceed }>
                <FullLinearGradientButton
                  style={ [
                    this.state.status == true ? { opacity: 1 } : { opacity: 0.4 },
                    { borderRadius: 5 } ] }
                  disabled={ this.state.status == true ? false : true }
                  title="PROCEED"
                  click_Done={ () => this.onSuccess( this.state.pincode ) }
                />
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <CustomeStatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
      </View>
    );
  }
}

let styles = StyleSheet.create( {
  container: {
    flex: 1
  },
  viewAppLogo: {
    flex: 1,
    alignItems: "center",
    marginTop: 50
  },
  imgAppLogo: {
    height: 150,
    width: 150
  },
  viewPasscode: {
    flex: 1,
    alignItems: "center"
  },
  viewBtnProceed: {
    flex: 3,
    justifyContent: "flex-end",
    marginBottom: 20
  }
} );
