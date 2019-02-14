import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ImageBackground,
  AsyncStorage,
  Dimensions
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
  Input,
  Item,
  Form,
  Label,
  Footer
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import Toast from "react-native-simple-toast";
let flag_createJoinAccount: boolean = true;
var dbOpration = require("../../../../app/manager/database/DBOpration");

//TODO: Custome Pages
import { colors, images, localDB } from "../../../../app/constants/Constants";
import SCLAlertOk from "../../../../app/custcompontes/alert/SCLAlertOk";

//TODO: VaultAccount
import jointAccount from "../../../../bitcoin/services/JointAccount";

const { width } = Dimensions.get("screen");
export default class CreateJointAccountScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      name: "",
      accountName: "",
      flag_createAccountBtnStatus: true,
      alertPopupData: []
    };
  }

  // async acknowledgeAndStore(joint: string) {
  //   Joint = JSON.parse(joint);
  //   const resultWallet = await dbOpration.readTablesData(
  //     localDB.tableName.tblWallet
  //   );
  //   console.log("mnemonics:", resultWallet.temp[0].mnemonic);
  //   const { keyPair } = await WalletService.importWallet(
  //     resultWallet.temp[0].mnemonic
  //   );
  //   const { p2wsh, p2sh, address } = await WalletService.createMultiSig(2, [
  //     keyPair.publicKey.toString("hex"),
  //     Joint.MPky
  //   ]);
  //   if (address == Joint.Add) {
  //     Joint.p2wsh = p2wsh;
  //     Joint.p2sh = p2sh;
  //     Joint.Typ = "IMP";
  //     Toast.show("Acknowledge merge", Toast.SHORT);
  //     await this.storeData("Joint", JSON.stringify(Joint));
  //     this.props.navigation.goBack(null);
  //   } else {
  //     Toast.show("Acknowledge merge Error", Toast.SHORT);
  //   }
  // }

  //TODO: func selfCreateJointAccount

  componentWillMount() {
    let qrCodeData = this.props.navigation.getParam("data");
    if (qrCodeData != "") {
      this.selfCreateJointAccount(qrCodeData);
    }
  }

  async selfCreateJointAccount(data: any) {
    const dateTime = Date.now();
    const fulldate = Math.floor(dateTime / 1000);
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    let mnemonic = resultWallet.temp[0].mnemonic.replace(/,/g, " ");
    const details = {
      jointDetails: data
    };
    const resJointAccountCreate = jointAccount.createInitiatedJointAccount(
      mnemonic,
      details
    );
    const additionalInfo = {
      scripts: resJointAccountCreate.multiSig.scripts,
      jointData: JSON.parse(resJointAccountCreate.creationJSON)
    };
    if (flag_createJoinAccount) {
      this.connection_CreateJointAccount(
        fulldate,
        resJointAccountCreate.multiSig.address,
        additionalInfo
      );
      flag_createJoinAccount = false;
    }
  }

  async connection_CreateJointAccount(
    fulldate: string,
    address: string,
    data: any
  ) {
    console.log("create account");
    console.log({ data });
    const resultCreateAccount = await dbOpration.insertLastBeforeCreateAccount(
      localDB.tableName.tblAccount,
      fulldate,
      address,
      "BTC",
      this.state.accountName,
      "Joint",
      data
    );
    if (resultCreateAccount) {
      this.setState({
        isLoading: false,
        alertPopupData: [
          {
            theme: "success",
            status: true,
            icon: "smile",
            title: "Success",
            subtitle: "Joint account Created.",
            goBackStatus: true
          }
        ]
      });
    }
  }

  onSelect = data => {
    this.setState({
      JsonString: data.barcode
    });
    let jointDetails = JSON.parse(data.barcode);
    if (jointDetails.typ == "conf") {
      this.props.navigation.push("MergeConfirmJointAccountScreen", {
        data: data.barcode
      });
    } else if (jointDetails.typ == "ack") {
      this.selfCreateJointAccount(data.barcode);
    } else if (jointDetails.typ == "imp") {
      Toast.show("Imported succesfully", Toast.SHORT);
    } else {
      Toast.show("Error qr code", Toast.SHORT);
    }
  };

  //TODO: func validationText
  validationText(text, type) {
    if (type == "name") {
      this.setState({
        name: text
      });
    } else {
      this.setState({
        accountName: text
      });
    }
    if (this.state.name.length > 0 && this.state.accountName.length > 0) {
      this.setState({
        flag_createAccountBtnStatus: false
      });
    }
    if (
      this.state.name.length < 0 ||
      this.state.accountName.length < 0 ||
      text == ""
    ) {
      this.setState({
        flag_createAccountBtnStatus: true
      });
    }
  }

  click_MargeAccount() {}

  //TODO: func click_openQrCodeScannerScreen
  async click_openQrCodeScannerScreen() {
    try {
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(false));
      this.props.navigation.push("QrcodeScannerScreen", {
        onSelect: this.onSelect
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <Container>
        <ImageBackground source={images.appBackgound} style={styles.container}>
          <Header transparent>
            <Left>
              <Button
                transparent
                onPress={() => this.props.navigation.goBack()}
              >
                <Icon name="chevron-left" size={25} color="#ffffff" />
              </Button>
            </Left>

            <Body style={{ flex: 0, alignItems: "center" }}>
              <Title
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.titleUserName}
              />
            </Body>
            <Right />
          </Header>
          <Content contentContainerStyle={styles.container}>
            <View style={styles.logoJointAccount}>
              <Image
                style={styles.jointLogo}
                source={images.secureAccount.secureLogo}
              />
              <Text style={styles.txtTitle}>Joint Account</Text>
              <Text style={styles.txtLorem} />
            </View>

            <View style={styles.jointAccountInput}>
              <Input
                name={this.state.name}
                value={this.state.name}
                placeholder="Enter your name"
                keyboardType={"default"}
                placeholderTextColor={Platform.OS == "ios" ? "#000" : "#000"}
                style={styles.input}
                onChangeText={text => this.validationText(text, "name")}
              />
              <Input
                name={this.state.accountName}
                value={this.state.accountName}
                placeholder="Enter account name"
                keyboardType={"default"}
                placeholderTextColor={Platform.OS == "ios" ? "#000" : "#000"}
                style={styles.input}
                onChangeText={text => this.validationText(text, "accountName")}
              />
              <Button
                full
                disabled={this.state.flag_createAccountBtnStatus}
                style={[
                  styles.btnCreateJointAccount,
                  this.state.flag_createAccountBtnStatus
                    ? { backgroundColor: "gray" }
                    : { backgroundColor: colors.appColor }
                ]}
                onPress={() => {
                  let data = {};
                  data.name = this.state.name;
                  data.walletName = this.state.accountName;
                  this.props.navigation.push("ReceiveMoneyScreen", {
                    page: "CreateJointAccountScreen",
                    data: data
                  });
                }}
              >
                <Text style={{ color: "#ffffff" }}>Initiate</Text>
              </Button>
              <Text
                style={{
                  color: "#000",
                  textAlign: "center",
                  justifyContent: "center",
                  marginTop: 15,
                  paddingTop: 5,
                  fontWeight: "bold"
                }}
              >
                OR
              </Text>
              <Button
                full
                style={[
                  styles.btnCreateJointAccount,
                  ,
                  {
                    backgroundColor: colors.appColor
                  }
                ]}
                onPress={() => this.click_openQrCodeScannerScreen()}
              >
                <Text style={{ color: "#ffffff" }}>Merge</Text>
              </Button>
            </View>
          </Content>
        </ImageBackground>
        <SCLAlertOk
          data={this.state.alertPopupData}
          click_Ok={(status: boolean) => {
            status
              ? this.props.navigation.navigate("TabbarBottom")
              : console.log(status),
              this.setState({
                alertPopupData: [
                  {
                    status: false
                  }
                ]
              });
          }}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  titleUserName: {
    color: "#ffffff"
  },
  //View:jointAccount
  logoJointAccount: {
    flex: 0.4,
    alignItems: "center"
  },
  jointLogo: {
    height: 120,
    width: 120
  },
  txtTitle: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 28
  },
  txtLorem: {
    textAlign: "center",
    marginTop: 10
  },
  input: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    color: Platform.OS == "ios" ? "#000" : "#000"
  },
  //view:input values
  jointAccountInput: {
    flex: 0.47,
    marginLeft: 10,
    marginRight: 10
  },
  //btn:btnCreateJointAccount
  btnCreateJointAccount: {
    marginTop: 20,
    borderRadius: 10
  }
});
