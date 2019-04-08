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
  StatusBar
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import * as Keychain from "react-native-keychain";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Loader from "bithyve/src/app/custcompontes/Loader/ModelLoader";
//TODO: Custome Pages
import CustomeStatusBar from "bithyve/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "bithyve/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import bip39 from "bip39";

//TODO: Custome Object
import {
  colors,
  localDB,
  errorValidMsg,
  images
} from "bithyve/src/app/constants/Constants";
var dbOpration = require( "bithyve/src/app/manager/database/DBOpration" );
var utils = require( "bithyve/src/app/constants/Utils" );
import renderIf from "bithyve/src/app/constants/validation/renderIf";
import Singleton from "bithyve/src/app/constants/Singleton";

//TODO: Bitcoin Files


//TODO: Local Varible    
let isNetwork: Boolean;

//TODO: Localization   
import { localization } from "bithyve/src/app/manager/Localization/i18n";


export default class PasscodeConfirmScreen extends Component {
  constructor ( props: any ) {
    super( props );
    this.state = {
      mnemonicValues: [],
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

  onCheckPincode( code: any ) {
    this.setState( {
      pincode: code
    } );
  }

  _onFinishCheckingCode2( isValid: boolean, code: any ) {
    if ( isValid ) {
      this.setState( {
        status: true,
        passcodeSecoundStyle: [
          {
            activeColor: colors.black,
            inactiveColor: colors.black,
            cellBorderWidth: 0
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
      this.setState( {
        isLoading: true
      } )
      let code = this.state.pincode;
      let commonData = Singleton.getInstance();
      commonData.setPasscode( code );
      var mnemonic = bip39.generateMnemonic();
      mnemonic = mnemonic.split( " " );
      console.log( { mnemonic } );

      const dateTime = Date.now();
      const fulldate = Math.floor( dateTime / 1000 );
      const resultCreateWallet = await dbOpration.insertWallet(
        localDB.tableName.tblWallet,
        fulldate,
        mnemonic,
        "",
        "",
        "",
        "Primary"
      );
      console.log( { resultCreateWallet } );

      if ( resultCreateWallet ) {
        const resultCreateDailyWallet = await dbOpration.insertCreateAccount(
          localDB.tableName.tblAccount,
          fulldate,
          "",
          "BTC",
          "Daily Wallet",
          "Daily Wallet",
          ""
        );
        console.log( { resultCreateDailyWallet } );

        if ( resultCreateDailyWallet ) {
          try {
            const username = "HexaWallet";
            const password = code;
            // Store the credentials
            await Keychain.setGenericPassword( username, password );
            AsyncStorage.setItem(
              "PasscodeCreateStatus",
              JSON.stringify( true )
            );
          } catch ( error ) {
            // Error saving data
          }
          this.setState( {
            isLoading: false
          } );
          const resetAction = StackActions.reset( {
            index: 0, // <-- currect active route from actions array
            key: null,
            actions: [
              NavigationActions.navigate( { routeName: "TabbarBottom" } )
            ]
          } );
          this.props.navigation.dispatch( resetAction );
        }
      }
    } catch ( e ) {
      console.log( { e } );
    }
  };

  render() {
    return (
      <View style={ styles.container }>
        <CustomeStatusBar backgroundColor={ colors.white } barStyle="dark-content" />
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={ 40 }
          contentContainerStyle={ { flexGrow: 1, } }
        >
          <View style={ styles.viewAppLogo }>
            <Image style={ styles.imgAppLogo } source={ images.appIcon } />
            <Text
              style={ [ { color: "#000000", fontWeight: "bold", marginTop: 20 } ] }
            >
              Hello, Crypto wizard
            </Text>
          </View>
          <View style={ styles.viewFirstPasscode }>
            <Text
              style={ { marginTop: 10, fontWeight: "bold", color: "#8B8B8B" } }
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
              <Text style={ { color: "red" } }>{ this.state.success }</Text>
            ) }
          </View>
          <View style={ styles.viewBtnProceed }>
            <FullLinearGradientButton
              style={
                this.state.status == true ? { opacity: 1 } : { opacity: 0.4 }
              }
              disabled={ this.state.status == true ? false : true }
              title="PROCEED"
              click_Done={ () => this.saveData( this.state.pincode ) }
            />
          </View>
        </KeyboardAwareScrollView>
        <Loader loading={ this.state.isLoading } color={ colors.appColor } size={ 60 } />
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
