import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Image,
  StatusBar,
  Alert
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import * as Keychain from "react-native-keychain";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";



//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
  colors,
  localDB,
  images,
  asyncStorageKeys
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
import Singleton from "HexaWallet/src/app/constants/Singleton";

//TODO: Bitcoin Files   
//TODO: Local Varible    
let isNetwork: Boolean;

//TODO: Localization   
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";




export default class PasscodeConfirmScreen extends Component<any, any> {
  constructor ( props: any ) {
    super( props );
    this.state = {
      mnemonicValues: "",
      status: false,
      pincode: "",
      success: "Passcode does not match!",
      passcodeSecoundStyle: [
        {
          activeColor: colors.black,
          inactiveColor: colors.black,
          cellBorderWidth: 0
        }
      ],
      isLoading: false
    };
    isNetwork = utils.getNetwork();
  }

  // async componentDidMount() {
  //   // let mnemonic = await utils.getMnemonic();
  //   // alert( { mnemonic } );
  //   this.setState( {
  //     mnemonicValues: utils.getMnemonic()
  //   } );
  // }

  onCheckPincode( code: any ) {
    this.setState( {
      pincode: code
    } );
  }

  _onFinishCheckingCode2( isValid: boolean, code: any ) {
    if ( isValid ) {
      this.setState( {
        pincode: code,
        status: true,
        passcodeSecoundStyle: [
          {
            activeColor: colors.black,
            inactiveColor: colors.black,
            cellBorderWidth: 0,
          }
        ]
      } );
    } else {
      this.setState( {
        passcodeSecoundStyle: [
          {
            activeColor: "red",
            inactiveColor: "red",
            cellBorderWidth: 1
          }
        ]
      } );
    }
  }

  saveData = async () => {
    try {
      const dateTime = Date.now();
      const fulldate = Math.floor( dateTime / 1000 );
      let code = this.state.pincode;
      let commonData = Singleton.getInstance();
      commonData.setPasscode( code );
      const username = "HexaWallet";
      const password = code;

      // Store the credentials
      await Keychain.setGenericPassword( username, password );
      AsyncStorage.setItem(
        asyncStorageKeys.flag_PasscodeCreate,
        JSON.stringify( true )
      );
      const resetAction = StackActions.reset( {
        index: 0, // <-- currect active route from actions array
        key: null,
        actions: [
          NavigationActions.navigate( { routeName: "RestoreAndWalletSetupNavigator" } )
        ]
      } );
      AsyncStorage.setItem(
        asyncStorageKeys.rootViewController,
        "RestoreAndWalletSetupNavigator"
      );
      this.props.navigation.dispatch( resetAction );
    } catch ( e ) {
      console.log( { e } );
    }
  };

  render() {
    return (
      <View style={ styles.container }>
        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ true } barStyle="dark-content" />
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={ 40 }
          contentContainerStyle={ { flexGrow: 1, } }
        >
          <View style={ styles.viewAppLogo }>
            <Image style={ styles.imgAppLogo } source={ images.appIcon } />
            <Text
              style={ [ globalStyle.ffFiraSansBold, { color: "#000000", marginTop: 20 } ] }
            >
              Hello, Crypto wizard
            </Text>
          </View>
          <View style={ styles.viewFirstPasscode }>
            <Text
              style={ [ globalStyle.ffFiraSansMedium, { marginTop: 10, color: "#8B8B8B" } ] }
              note
            >
              Create Passcode
            </Text>
            <CodeInput
              ref="codeInputRef"
              secureTextEntry
              keyboardType="numeric"
              codeLength={ 5 }
              activeColor={ colors.black }
              inactiveColor={ colors.black }
              className="border-box"
              cellBorderWidth={ 0 }
              autoFocus={ true }
              inputPosition="center"
              space={ 10 }
              size={ 55 }
              containerStyle={ {
                alignItems: "center",
                justifyContent: "center",
                height: Platform.OS == "ios" ? 0 : 40,
              } }
              codeInputStyle={ {
                borderRadius: 5,
                backgroundColor: "#F1F1F1"
              } }
              onFulfill={ code => this.onCheckPincode( code ) }
            />
          </View>
          <View style={ styles.viewSecoundPasscode }>
            <Text
              style={ { marginTop: 10, fontWeight: "bold", color: "#8B8B8B" } }
            >
              Re - Enter Passcode{ " " }
            </Text>
            <CodeInput
              ref="codeInputRef1"
              secureTextEntry
              keyboardType="numeric"
              codeLength={ 5 }
              activeColor={ this.state.passcodeSecoundStyle[ 0 ].activeColor }
              inactiveColor={ this.state.passcodeSecoundStyle[ 0 ].inactiveColor }
              className="border-box"
              cellBorderWidth={
                this.state.passcodeSecoundStyle[ 0 ].cellBorderWidth
              }
              compareWithCode={ this.state.pincode }
              autoFocus={ false }
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
                this._onFinishCheckingCode2( isValid, code )
              }
            />
            { renderIf( this.state.passcodeSecoundStyle[ 0 ].activeColor == "red" )(
              <Text style={ [ globalStyle.ffFiraSansBookItalic, { color: "red", marginTop: 44 } ] }>{ this.state.success }</Text>
            ) }
          </View>
          <View style={ styles.viewBtnProceed }>
            <FullLinearGradientButton
              style={ [
                this.state.status == true ? { opacity: 1 } : { opacity: 0.4 }, { borderRadius: 5 } ] }
              disabled={ this.state.status == true ? false : true }
              title="PROCEED"
              click_Done={ () => this.saveData() }
            />
          </View>
        </KeyboardAwareScrollView>
        <Loader loading={ this.state.isLoading } color={ colors.appColor } size={ 30 } />
      </View>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1
  },
  viewAppLogo: {
    flex: 0.5,
    alignItems: "center",
    marginTop: 50
  },
  viewFirstPasscode: {
    flex: 1.4,
    alignItems: "center"
  },
  viewSecoundPasscode: {
    flex: 1.4,
    alignItems: "center"
  },
  viewBtnProceed: {
    flex: 0.2,
    marginTop: 20
  },
  imgAppLogo: {
    height: 150,
    width: 150
  }
} );
