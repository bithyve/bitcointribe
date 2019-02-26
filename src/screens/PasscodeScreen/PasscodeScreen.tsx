import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Dimensions,
  Keyboard
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import DropdownAlert from "react-native-dropdownalert";
import * as Keychain from "react-native-keychain";
import Modal from "react-native-simple-modal";
import Singleton from "bithyve/src/app/constants/Singleton";

//Custome Compontes
import SCLAlertOk from "bithyve/src/app/custcompontes/alert/SCLAlertOk";

//TODO: Custome Pages
import {
  colors,
  localDB,
  errorMessage,
  errorValidMsg
} from "bithyve/src/app/constants/Constants";
import utils from "bithyve/src/app/constants/Utils";
var dbOpration = require("bithyve/src/app/manager/database/DBOpration");

export default class PasscodeScreen extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      mnemonicValues: [],
      status: "choice",
      pincode: "",
      success: "Enter a PinCode",
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      message: "Enter your PIN",
      flag_dialogShow: false,
      arr_OkPopupData: []
    };
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    this.retrieveData();
  }

  retrieveData = async () => {
    try {
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
      const credentials = await Keychain.getGenericPassword();
      this.setState({
        pincode: credentials.password
      });
    } catch (error) {
      console.log(error);
    }
  };

  _onFinishCheckingCode2(isValid: boolean, code: string) {
    if (isValid) {
      this.onSuccess(code);
    } else {
      this.dropdown.alertWithType(
        "error",
        "Error",
        errorValidMsg.correctPassword
      );
    }
  }

  onSuccess = (code: string) => {
    let commonData = Singleton.getInstance();
    let pageName = commonData.getRootViewController();
    if (pageName == "TabbarBottom") {
      const resetAction = StackActions.reset({
        index: 0, // <-- currect active route from actions array
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: pageName
          })
        ]
      });
      this.props.navigation.dispatch(resetAction);
    } else {
      this.setState({ flag_dialogShow: true });
    }
  };

  openModal = () => this.setState({ flag_dialogShow: true });

  closeModal = () => {
    this.setState({ flag_dialogShow: false });
  };

  //TODO: func urlDecription
  async urlDecription(code: any) {
    let commonData = Singleton.getInstance();
    let pageName = commonData.getRootViewController();
    var script = commonData.getDeepLinkingUrl();
    script = script.split("_+_").join("/");
    let deepLinkingUrl = utils.decrypt(script, code.toString());
    if (deepLinkingUrl) {
      const resultWallet = await dbOpration.readTablesData(
        localDB.tableName.tblWallet
      );
      console.log({ resultWallet });
      let publicKey = resultWallet.temp[0].publicKey;
      let JsonDeepLinkingData = JSON.parse(deepLinkingUrl);
      if (publicKey == JsonDeepLinkingData.cpk) {
        console.log("same public key");
        Keyboard.dismiss();
        this.setState({
          arr_OkPopupData: [
            {
              theme: "danger",
              status: true,
              icon: "frown",
              title: "Oops",
              subtitle: errorMessage.initiatorSamePublicKUse,
              goBackStatus: false
            }
          ]
        });
      } else {
        const resetAction = StackActions.reset({
          index: 0, // <-- currect active route from actions array
          key: null,
          actions: [
            NavigationActions.navigate({
              routeName: pageName,
              params: {
                data: deepLinkingUrl
              }
            })
          ]
        });
        this.props.navigation.dispatch(resetAction);
      }
      commonData.setRootViewController("TabbarBottom");
      this.setState({ flag_dialogShow: false });
    } else {
      this.dropdown.alertWithType("error", "Error", errorValidMsg.correctCode);
      this.refs.codeInputRefUrlEncp.clear();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={[styles.txtTitle, { color: "#000", fontWeight: "bold" }]}>
          My Money
        </Text>
        <Text style={{ color: "#000", marginTop: 10 }}>
          {this.state.success}
        </Text>
        <CodeInput
          ref="codeInputRef2"
          secureTextEntry
          keyboardType="numeric"
          codeLength={4}
          activeColor={colors.black}
          inactiveColor={colors.black}
          className="border-circle"
          compareWithCode={this.state.pincode}
          cellBorderWidth={2}
          autoFocus={true}
          inputPosition="center"
          space={10}
          size={50}
          containerStyle={{ marginTop: Dimensions.get("screen").height / 3 }}
          codeInputStyle={{ borderWidth: 1.5 }}
          codeInputStyle={{ fontWeight: "800" }}
          containerStyle={styles.codeInput}
          onFulfill={(isValid, code) =>
            this._onFinishCheckingCode2(isValid, code)
          }
        />
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
        <Modal
          offset={10}
          closeOnTouchOutside={false}
          open={this.state.flag_dialogShow}
          modalDidOpen={this.modalDidOpen}
          modalDidClose={this.modalDidClose}
          style={{ alignItems: "center" }}
        >
          <View style={{ alignItems: "center", paddingBottom: 70 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Enter Code</Text>
            <CodeInput
              ref="codeInputRefUrlEncp"
              secureTextEntry
              keyboardType="numeric"
              codeLength={4}
              activeColor={colors.black}
              inactiveColor={colors.black}
              className="border-circle"
              cellBorderWidth={2}
              autoFocus={true}
              inputPosition="center"
              space={10}
              size={50}
              codeInputStyle={{ borderWidth: 1.5 }}
              codeInputStyle={{ fontWeight: "800" }}
              onFulfill={code => this.urlDecription(code)}
            />
          </View>
        </Modal>
        <SCLAlertOk
          data={this.state.arr_OkPopupData}
          click_Ok={(status: boolean) => {
            let commonData = Singleton.getInstance();
            this.setState({
              arr_OkPopupData: [
                {
                  status: false
                }
              ]
            });
            const resetAction = StackActions.reset({
              index: 0, // <-- currect active route from actions array
              key: null,
              actions: [
                NavigationActions.navigate({
                  routeName: "TabbarBottom"
                })
              ]
            });
            commonData.setRootViewController("TabbarBottom");
            this.props.navigation.dispatch(resetAction);
          }}
        />
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  txtText: {
    color: colors.appColor,
    fontFamily: "Lalezar"
  },
  txtTitle: {
    marginTop: 100,
    fontSize: 40
  }
});
