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

//TODO: Custome Pages
import FullLinearGradientButton from "bithyve/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome Object
import {
  colors,
  localDB,
  errorValidMsg,
  images
} from "bithyve/src/app/constants/Constants";
var dbOpration = require("bithyve/src/app/manager/database/DBOpration");
var utils = require("bithyve/src/app/constants/Utils");
import renderIf from "bithyve/src/app/constants/validation/renderIf";
import Singleton from "bithyve/src/app/constants/Singleton";

//TODO: RegularAccount
import RegularAccount from "bithyve/src/bitcoin/services/RegularAccount";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";

export default class PasscodeConfirmScreen extends Component {
  constructor(props: any) {
    super(props);
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
      ]
    };
    isNetwork = utils.getNetwork();
  }

  onCheckPincode(code: any) {
    this.setState({
      pincode: code
    });
  }

  _onFinishCheckingCode2(isValid, code) {
    if (isValid) {
      this.setState({
        status: true,
        passcodeSecoundStyle: [
          {
            activeColor: colors.black,
            inactiveColor: colors.black,
            cellBorderWidth: 0
          }
        ]
      });
    } else {
      this.setState({
        passcodeSecoundStyle: [
          {
            activeColor: "red",
            inactiveColor: "red",
            cellBorderWidth: 1
          }
        ]
      });
    }
  }

  saveData = async () => {
    try {
      let commonData = Singleton.getInstance();
      commonData.setPasscode(this.state.pincode);
      const {
        mnemonic,
        address,
        privateKey,
        keyPair
      } = await RegularAccount.createWallet();
      const publicKey = keyPair.publicKey.toString("hex");
      this.setState({
        mnemonicValues: mnemonic.split(" ")
      });
      if (this.state.mnemonicValues.length > 0) {
        //mnemonic key
        var mnemonicValue = this.state.mnemonicValues;
        var priKeyValue = privateKey;
        //User Details Data
        const dateTime = Date.now();
        const fulldate = Math.floor(dateTime / 1000);
        const resultAccountType = await dbOpration.insertAccountTypeData(
          localDB.tableName.tblAccountType,
          fulldate
        );
        if (resultAccountType) {
          const resultCreateWallet = await dbOpration.insertWallet(
            localDB.tableName.tblWallet,
            fulldate,
            mnemonicValue,
            priKeyValue,
            address,
            publicKey,
            "Primary"
          );
          if (resultCreateWallet) {
            const resultCreateAccountSaving = await dbOpration.insertCreateAccount(
              localDB.tableName.tblAccount,
              fulldate,
              address,
              "BTC",
              "Savings",
              "Savings",
              ""
            );
            if (resultCreateAccountSaving) {
              const resultCreateAccount = await dbOpration.insertCreateAccount(
                localDB.tableName.tblAccount,
                fulldate,
                "",
                "",
                "UnKnown",
                "UnKnown",
                ""
              );
              if (resultCreateAccount) {
                try {
                  const username = "HexaWallet";
                  const password = this.state.pincode;
                  // Store the credentials
                  await Keychain.setGenericPassword(username, password);
                  AsyncStorage.setItem(
                    "PasscodeCreateStatus",
                    JSON.stringify(true)
                  );
                } catch (error) {
                  // Error saving data
                }
                this.setState({
                  success: "Ok"
                  //isLoading: false
                });
                const resetAction = StackActions.reset({
                  index: 0, // <-- currect active route from actions array
                  key: null,
                  actions: [
                    NavigationActions.navigate({ routeName: "TabbarBottom" })
                  ]
                });
                this.props.navigation.dispatch(resetAction);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log({ e });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.appColor} barStyle="dark-content" />
        <KeyboardAwareScrollView
          enableAutomaticScroll
          automaticallyAdjustContentInsets={true}
          keyboardOpeningTime={0}
          enableOnAndroid={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.viewAppLogo}>
            <Image style={styles.imgAppLogo} source={images.appIcon} />
            <Text
              style={[{ color: "#000000", fontWeight: "bold", marginTop: 20 }]}
            >
              Hello, Crypto wizard
            </Text>
          </View>
          <View style={styles.viewFirstPasscode}>
            <Text
              style={{ marginTop: 10, fontWeight: "bold", color: "#8B8B8B" }}
              note
            >
              Create Passcode
            </Text>
            <CodeInput
              ref="codeInputRef"
              secureTextEntry
              keyboardType="numeric"
              codeLength={5}
              activeColor={colors.black}
              inactiveColor={colors.black}
              className="border-box"
              cellBorderWidth={0}
              autoFocus={true}
              inputPosition="center"
              space={10}
              size={55}
              containerStyle={{
                alignItems: "center",
                justifyContent: "center",
                height: 0
              }}
              codeInputStyle={{
                borderRadius: 5,
                backgroundColor: "#F1F1F1"
              }}
              onFulfill={code => this.onCheckPincode(code)}
            />
          </View>
          <View style={styles.viewSecoundPasscode}>
            <Text
              style={{ marginTop: 10, fontWeight: "bold", color: "#8B8B8B" }}
            >
              Re - Enter Passcode{" "}
            </Text>
            <CodeInput
              ref="codeInputRef1"
              secureTextEntry
              keyboardType="numeric"
              codeLength={5}
              activeColor={this.state.passcodeSecoundStyle[0].activeColor}
              inactiveColor={this.state.passcodeSecoundStyle[0].inactiveColor}
              className="border-box"
              cellBorderWidth={
                this.state.passcodeSecoundStyle[0].cellBorderWidth
              }
              compareWithCode={this.state.pincode}
              autoFocus={false}
              inputPosition="center"
              space={10}
              size={55}
              codeInputStyle={{ borderRadius: 5, backgroundColor: "#F1F1F1" }}
              containerStyle={{
                alignItems: "center",
                justifyContent: "center",
                height: 0
              }}
              onFulfill={(isValid, code) =>
                this._onFinishCheckingCode2(isValid, code)
              }
            />
            {renderIf(this.state.passcodeSecoundStyle[0].activeColor == "red")(
              <Text style={{ color: "red" }}>{this.state.success}</Text>
            )}
          </View>
          <View style={styles.viewBtnProceed}>
            <FullLinearGradientButton
              style={
                this.state.status == true ? { opacity: 1 } : { opacity: 0.4 }
              }
              disabled={this.state.status == true ? false : true}
              title="PROCEED"
              click_Done={() => this.saveData(this.state.pincode)}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    flex: 0.2
  },
  imgAppLogo: {
    height: 150,
    width: 150
  }
});
