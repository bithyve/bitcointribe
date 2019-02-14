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
  Item
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";

//TODO: Custome Pages
//Custome Compontes
import SCLAlertOk from "../../../../app/custcompontes/alert/SCLAlertOk";
import { colors, images, localDB } from "../../../../app/constants/Constants";

//import WalletService from "../../../../bitcoin/services/WalletService";
var dbOpration = require("../../../../app/manager/database/DBOpration");

//TODO: VaultAccount
import jointAccount from "../../../../bitcoin/services/JointAccount";

const { width } = Dimensions.get("window");

export default class MergeConfirmJointAccountScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      name: "",
      flag_disableMergeBtn: true,
      alertPopupData: [],
      ackJSON: ""
    };
  }

  componentWillMount() {
    console.log(this.props.navigation.getParam("data"));
    let jointDetails = JSON.parse(this.props.navigation.getParam("data"));
    console.log({ jointDetails });
    this.setState({
      data: jointDetails
    });
  }

  // async CreateMultisigAndStore(joint: string, name: string) {
  //   const resultWallet = await dbOpration.readTablesData(
  //     localDB.tableName.tblWallet
  //   );
  //   console.log("mnemonics:", resultWallet.temp[0].mnemonic);
  //   const { keyPair } = await WalletService.importWallet(
  //     resultWallet.temp[0].mnemonic
  //   );
  //   let Joint = JSON.parse(joint);
  //   Joint.MPky = keyPair.publicKey.toString("hex");
  //   Joint.MN = name;
  //   const { p2wsh, p2sh, address } = await WalletService.createMultiSig(2, [
  //     Joint.CPky,
  //     Joint.MPky
  //   ]);
  //   Joint.p2wsh = p2wsh;
  //   Joint.p2sh = p2sh;
  //   Joint.Add = address;
  //   Joint.Typ = "IMP";
  //   await this.storeData("Joint", JSON.stringify(Joint));
  // }

  //this.props.navigation.navigate("AcknowledgeJointAccountScreen",{JsonString:data.barcode})

  //TODO: func click_JointAccount
  async click_JointAccount() {
    const dateTime = Date.now();
    const fulldate = Math.floor(dateTime / 1000);
    const details = {
      jointDetails: this.props.navigation.getParam("data"),
      merger: this.state.name
    };
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    let mnemonic = resultWallet.temp[0].mnemonic.replace(/,/g, " ");
    const restJointAccount = jointAccount.mergeJointAccount(mnemonic, details);
    console.log({ restJointAccount });
    this.setState({
      ackJSON: jointAccount.ackDetails(restJointAccount.mergeJSON)
    });
    const additionalInfo = {
      scripts: restJointAccount.multiSig.scripts,
      jointData: JSON.parse(restJointAccount.mergeJSON)
    };
    this.connection_CreateJointAccount(
      fulldate,
      restJointAccount.multiSig.address,
      additionalInfo
    );
  }

  async connection_CreateJointAccount(
    fulldate: string,
    address: string,
    data: any
  ) {
    const resultCreateAccount = await dbOpration.insertLastBeforeCreateAccount(
      localDB.tableName.tblAccount,
      fulldate,
      address,
      "BTC",
      this.state.data.wn,
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
              >
                Merge Confirmation
              </Title>
            </Body>
            <Right />
          </Header>
          <Content contentContainerStyle={styles.container} padder>
            <View style={styles.viewMergeLogo}>
              <Image
                style={styles.logoMerge}
                source={images.secureAccount.secureLogo}
              />
              <Text style={styles.txtTitle}>
                Do you want to have a joint account, {this.state.data.wn}, with{" "}
                {this.state.data.cn}?
              </Text>
            </View>

            <View style={styles.viewInputValues}>
              <Input
                name={this.state.name}
                value={this.state.name}
                placeholder="Enter your name"
                keyboardType={"default"}
                placeholderTextColor={Platform.OS == "ios" ? "#000" : "#000"}
                style={styles.input}
                onChangeText={text => {
                  this.setState({ name: text });
                  let flag_disableValue: boolean;
                  if (text == "" || this.state.name == "") {
                    flag_disableValue = true;
                  } else {
                    flag_disableValue = false;
                  }
                  this.setState({
                    flag_disableMergeBtn: flag_disableValue
                  });
                }}
              />
              <Button
                full
                style={styles.btnMerge}
                disabled={this.state.flag_disableMergeBtn}
                style={[
                  styles.btnMerge,
                  this.state.flag_disableMergeBtn
                    ? { backgroundColor: "gray" }
                    : { backgroundColor: colors.appColor }
                ]}
                onPress={() => this.click_JointAccount()}
              >
                <Text> Merge </Text>
              </Button>
            </View>
          </Content>
        </ImageBackground>
        <SCLAlertOk
          data={this.state.alertPopupData}
          click_Ok={(status: boolean) => {
            status
              ? this.props.navigation.push("ReceiveMoneyScreen", {
                  page: "MergeConfirmJointAccountScreen",
                  data: this.state.ackJSON
                })
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
  viewMergeLogo: {
    flex: 0.45,
    alignItems: "center"
  },
  logoMerge: {
    height: 120,
    width: 120
  },
  txtTitle: {
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    fontSize: 20
  },
  //view:viewInputValues
  viewInputValues: {
    flex: 0.2
  },
  //txt:inputValues
  input: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    color: Platform.OS == "ios" ? "#000" : "#000"
  },
  btnMerge: {
    marginTop: 20,
    borderRadius: 10
  }
});
