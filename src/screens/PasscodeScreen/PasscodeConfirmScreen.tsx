/**
 * Created by dungtran on 8/20/17.
 */
import React, { Component } from "react";
import { StyleSheet, Text, View, AsyncStorage, Animated } from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import * as Keychain from "react-native-keychain";
import DropdownAlert from "react-native-dropdownalert";
import Loader from "react-native-modal-loader";

//TODO: Custome Pages
import { colors, localDB } from "../../app/constants/Constants";
var dbOpration = require("../../app/manager/database/DBOpration");
var utils = require("../../app/constants/Utils");
import renderIf from "../../app/constants/validation/renderIf";
import Singleton from "../../app/constants/Singleton";

//TODO: RegularAccount
import RegularAccount from "../../bitcoin/services/RegularAccount";

export default class PasscodeConfirmScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mnemonicValues: [],
      status: "choice",
      pincode: "",
      success: "Enter a PinCode",
      isLoading: false
    };
    isNetwork = utils.getNetwork();
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    this.animatedValue = new Animated.Value(0);
    this.value = 0;
    this.animatedValue.addListener(({ value }) => {
      this.value = value;
    });
    this.frontInterpolate = this.animatedValue.interpolate({
      inputRange: [0, 180],
      outputRange: ["0deg", "180deg"]
    });
    this.backInterpolate = this.animatedValue.interpolate({
      inputRange: [0, 180],
      outputRange: ["180deg", "360deg"]
    });
    this.frontOpacity = this.animatedValue.interpolate({
      inputRange: [89, 90],
      outputRange: [1, 0]
    });
    this.backOpacity = this.animatedValue.interpolate({
      inputRange: [89, 90],
      outputRange: [0, 1]
    });
  }

  onCheckPincode(code) {
    this.setState({
      status: "confirm",
      pincode: code,
      success: "Confirm your PinCode"
    });
    this.flipCard();
  }

  flipCard() {
    if (this.value >= 90) {
      Animated.spring(this.animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10
      }).start();
    } else {
      Animated.spring(this.animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10
      }).start();
    }
  }

  _onFinishCheckingCode2(isValid, code) {
    if (isValid) {
      this.setState({
        isLoading: true
      });
      this.saveData(code);
    } else {
      this.dropdown.alertWithType(
        "error",
        "Error",
        "Oh Please enter correct password"
      );
    }
  }

  saveData = async (code: string) => {
    let commonData = Singleton.getInstance();
    commonData.setPasscode(code);
    const {
      mnemonic,
      address,
      privateKey
    } = await RegularAccount.createWallet();
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
                const username = "mymoney";
                const password = code;
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
  };

  render() {
    const frontAnimatedStyle = {
      transform: [{ rotateY: this.frontInterpolate }]
    };
    const backAnimatedStyle = {
      transform: [{ rotateY: this.backInterpolate }]
    };
    return (
      <View style={styles.container}>
        <Text style={[styles.txtTitle, { color: "#000", fontWeight: "bold" }]}>
          My Money
        </Text>
        <Text style={{ color: "#000", marginTop: 10 }}>
          {this.state.success}
        </Text>
        {renderIf(this.state.status == "choice")(
          <Animated.View
            style={[
              styles.flipCard,
              frontAnimatedStyle,
              { opacity: this.frontOpacity }
            ]}
          >
            <CodeInput
              ref="codeInputRef2"
              secureTextEntry
              keyboardType="numeric"
              codeLength={4}
              activeColor={colors.black}
              inactiveColor={colors.black}
              className="border-circle"
              cellBorderWidth={2}
              autoFocus={true}
              inputPosition="center"
              inputPosition="center"
              space={10}
              size={50}
              codeInputStyle={{ borderWidth: 1.5 }}
              codeInputStyle={{ fontWeight: "800" }}
              onFulfill={code => this.onCheckPincode(code)}
            />
          </Animated.View>
        )}
        {renderIf(this.state.status == "confirm")(
          <Animated.View
            style={[
              styles.flipCard,
              styles.flipCardBack,
              backAnimatedStyle,
              { opacity: this.backOpacity }
            ]}
          >
            <CodeInput
              ref="codeInputRef2"
              secureTextEntry
              keyboardType="numeric"
              codeLength={4}
              activeColor={colors.black}
              inactiveColor={colors.black}
              className="border-circle"
              cellBorderWidth={2}
              compareWithCode={this.state.pincode}
              autoFocus={true}
              inputPosition="center"
              inputPosition="center"
              space={10}
              size={50}
              codeInputStyle={{ borderWidth: 1.5 }}
              codeInputStyle={{ fontWeight: "800" }}
              onFulfill={(isValid, code) =>
                this._onFinishCheckingCode2(isValid, code)
              }
            />
          </Animated.View>
        )}
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
        <Loader loading={this.state.isLoading} color={colors.appColor} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  cardContainer: {
    flex: 1
  },
  txtText: {
    color: colors.appColor,
    fontFamily: "Lalezar"
  },
  txtTitle: {
    marginTop: 100,
    fontSize: 40
  },
  //code:new style
  inputWrapper3: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: "#2F0B3A"
  }
});
