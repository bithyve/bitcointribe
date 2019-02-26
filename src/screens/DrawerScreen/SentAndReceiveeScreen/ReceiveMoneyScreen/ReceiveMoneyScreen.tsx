import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
  Clipboard,
  Dimensions,
  Vibration,
  AsyncStorage,
  Platform
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
  Text
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
//import { QRCode } from "react-native-custom-qr-codes";
import QRCode from "react-native-qrcode";
import Toast from "react-native-simple-toast";
import Share from "react-native-share";
import Loader from "react-native-modal-loader";
import PushNotification from "react-native-push-notification";
//TODO: Custome Pages
import { colors, images, localDB } from "bithyve/src/app/constants/Constants";
import Singleton from "bithyve/src/app/constants/Singleton";
var dbOpration = require("bithyve/src/app/manager/database/DBOpration");
var utils = require("bithyve/src/app/constants/Utils");
import renderIf from "bithyve/src/app/constants/validation/renderIf";
//TODO: VaultAccount
import jointAccount from "bithyve/src/bitcoin/services/JointAccount";

export default class ReceiveMoneyScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      qrcodedata: "mymoney",
      isLoading: false,
      securetCodeEncpUrl: Math.floor(1000 + Math.random() * 9000),
      flag_SecuretCodeVisible: false,
      seconds: 5
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    let page = navigation.getParam("page");
    let data = navigation.getParam("data");
    console.log({ page, data });
    let address: string;
    if (page == "SentAndReceiveScreen") {
      address = data.address;
    } else if (page == "CreateJointAccountScreen") {
      this.createJointAccount();
    } else if (page == "MergeConfirmJointAccountScreen") {
      let dataJson = JSON.parse(data);
      console.log({ dataJson });
      console.log(JSON.stringify(dataJson));
      address = data;
    } else if (page == "SentMoneyScreen") {
      address = data;
    } else if (page == "AccountDetailsScreen") {
      address = data;
    }

    this.setState({
      qrcodedata: address
    });
  }

  componentWillUnmount() {
    try {
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
    } catch (e) {
      console.log(e);
    }
  }

  async createJointAccount() {
    const { navigation } = this.props;
    let data = navigation.getParam("data");
    let address: string;
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    let mnemonic = resultWallet.temp[0].mnemonic.replace(/,/g, " ");

    const details = {
      creator: data.name,
      walletName: data.walletName
    };
    let res = jointAccount.initiateJointAccount(mnemonic, details);
    this.setState({
      qrcodedata: res
    });
  }

  //TODO: Func Copy they code
  click_CopyAddress = async () => {
    const { navigation } = this.props;
    let page = navigation.getParam("page");
    let securetCode = this.state.securetCodeEncpUrl.toString();
    var shareOptions: string;
    var code = utils.encrypt(this.state.qrcodedata.toString(), securetCode);
    code = code.split("/").join("_+_");
    console.log({ page });
    if (page == "CreateJointAccountScreen") {
      shareOptions = "https://prime-sign-230407.appspot.com/ja/mck/" + code;
    } else if (page == "MergeConfirmJointAccountScreen") {
      shareOptions = "https://prime-sign-230407.appspot.com/ja/ca/" + code;
    } else {
      console.log(this.state.qrcodedata);
      shareOptions = this.state.qrcodedata;
    }
    await Clipboard.setString(shareOptions);
    Toast.show("Address copyed.!", Toast.SHORT);
  };

  //TODO: func click_SentQrCode
  click_SentQrCode() {
    try {
      const { navigation } = this.props;
      let page = navigation.getParam("page");
      let securetCode = this.state.securetCodeEncpUrl.toString();
      var shareOptions;
      var code = utils.encrypt(this.state.qrcodedata.toString(), securetCode);
      code = code.split("/").join("_+_");
      if (page == "CreateJointAccountScreen") {
        let msg = "https://prime-sign-230407.appspot.com/ja/mck/" + code;
        shareOptions = {
          title: "Address",
          message: msg,
          url: "\nhttps://bithyve.com/",
          subject: "MyMoney" //  for email
        };
      } else if (page == "MergeConfirmJointAccountScreen") {
        let msg = "https://prime-sign-230407.appspot.com/ja/ca/" + code;
        shareOptions = {
          title: "Address",
          message: msg,
          url: "\nhttps://bithyve.com/",
          subject: "MyMoney" //  for email
        };
      } else {
        shareOptions = {
          title: "Address",
          message: this.state.qrcodedata,
          url: "\nhttps://bithyve.com/",
          subject: "MyMoney" //  for email
        };
      }

      Share.open(shareOptions)
        .then(res => {
          console.log(res);
          this.setState({
            flag_SecuretCodeVisible: true
          });
          Vibration.vibrate(100);
          PushNotification.localNotificationSchedule({
            message: "Code :" + this.state.securetCodeEncpUrl,
            date: new Date(Date.now() + 2 * 1000)
          });
          if (Platform.OS == "ios") {
            AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
          }
        })
        .catch(err => {
          err && console.log(err);
        });
    } catch (error) {
      // Error saving data
    }
  }

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.appBackgound}
          style={styles.backgroundImage}
        >
          <Header transparent>
            <Left>
              <Button
                transparent
                onPress={() => {
                  if (
                    this.props.navigation.getParam("page") ==
                    "MergeConfirmJointAccountScreen"
                  ) {
                    this.props.navigation.navigate("TabbarBottom");
                  } else {
                    this.props.navigation.goBack();
                  }
                }}
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
          <Content
            contentContainerStyle={styles.container}
            scrollEnabled={false}
            padder
          >
            <View style={styles.viewShowQRcode}>
              <QRCode
                value={this.state.qrcodedata}
                size={Dimensions.get("screen").width - 70}
                bgColor="black"
                fgColor="white"
              />
              <TouchableOpacity onPress={() => this.click_CopyAddress()}>
                <Text style={styles.txtBarcode} numberOfLines={4} note>
                  {this.state.qrcodedata}
                </Text>
              </TouchableOpacity>
              {renderIf(this.state.flag_SecuretCodeVisible)(
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.appColor,
                    textDecorationLine: "underline"
                  }}
                >
                  Code : {this.state.securetCodeEncpUrl}
                </Text>
              )}
            </View>
            <View style={styles.viewShareButtonMain}>
              <View style={styles.viewSahreBtn}>
                <Button
                  transparent
                  onPress={() => {
                    try {
                      AsyncStorage.setItem(
                        "flag_BackgoundApp",
                        JSON.stringify(false)
                      );
                      this.click_SentQrCode();
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                >
                  <Icon name="share-square" size={25} color="#ffffff" />
                  <Text style={styles.titleUserName}>Share</Text>
                </Button>
              </View>
            </View>
          </Content>
        </ImageBackground>
        <Loader loading={this.state.isLoading} color={colors.appColor} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1
  },
  titleUserName: {
    color: "#ffffff"
  },
  viewShowQRcode: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  txtTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold"
  },
  txtBarcode: {
    marginTop: 40,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center"
  },
  btnCopy: {
    backgroundColor: colors.appColor
  },
  //share button
  viewShareButtonMain: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center"
  },
  viewSahreBtn: {
    backgroundColor: colors.appColor,
    paddingLeft: 10,
    borderRadius: 10
  }
});
