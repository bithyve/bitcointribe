import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Platform,
  Dimensions,
  Image,
  Keyboard,
  StatusBar,
  Linking
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import * as Keychain from "react-native-keychain";
import DeepLinking from "react-native-deep-linking";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
  colors,
  images,
  localDB,
  asyncStorageKeys
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

export default class PasscodeScreen extends Component {

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
    this.retrieveData();
  }

  async componentDidMount() {
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    console.log( { resultWallet } );
    await utils.setWalletDetails( resultWallet.temp[ 0 ] );
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
  }


  onSuccess = async ( code: string ) => {
    const rootViewController = await AsyncStorage.getItem( asyncStorageKeys.rootViewController );
    // console.log( { rootViewController } );
    let pageName = utils.getRootViewController();
    let walletDetails = await comFunDBRead.readTblWallet();
    if ( pageName != "TrustedPartyShareSecretNavigator" ) {
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

  };



  //TODO: func urlDecription
  async urlDecription( code: any ) {
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
  }

  render() {
    return (
      <View style={ styles.container }>
        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ true } barStyle="dark-content" />
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
              style={ [ globalStyle.ffFiraSansBold, { color: "#000000", marginTop: 20 } ] }
            >
              Hello, Crypto wizard
            </Text>
          </View>
          <View style={ styles.viewPasscode }>
            <Text
              style={ [ globalStyle.ffFiraSansMedium, { marginTop: 10, color: "#8B8B8B" } ] }
            >
              Re - Enter Passcode{ " " }
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
              onFulfill={ ( isValid, code ) =>
                this._onFinishCheckingCode( isValid, code )
              }
            />
            { renderIf( this.state.passcodeStyle[ 0 ].activeColor == "red" )(
              <Text style={ [ globalStyle.ffFiraSansBookItalic, { color: "red", marginTop: 44 } ] }>{ this.state.success }</Text>
            ) }
          </View>
          <View style={ styles.viewBtnProceed }>
            <FullLinearGradientButton
              style={ [
                this.state.status == true ? { opacity: 1 } : { opacity: 0.4 },
                { borderRadius: 5 } ] }
              disabled={ this.state.status == true ? false : true }
              title="LOGIN"
              click_Done={ () => this.onSuccess( this.state.pincode ) }
            />
          </View>
        </KeyboardAwareScrollView>
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
