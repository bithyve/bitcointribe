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
  Platform,
  Image,
  CameraRoll
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
import ActionButton from "react-native-circular-action-menu";
import ViewShot from "react-native-view-shot";

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
      qrcodedata: "hexa",
      isLoading: false,
      securetCodeEncpUrl: Math.floor(1000 + Math.random() * 9000),
      flag_SecuretCodeVisible: false,
      seconds: 5,
      imageURI:
        "file://data/user/0/com.bithyve.hexa/cache/ReactNative-snapshot-image1856300205.jpg"
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
  click_CopyAddress = async (address: string) => {
    const { navigation } = this.props;
    let page = navigation.getParam("page");
    let securetCode = this.state.securetCodeEncpUrl.toString();
    var shareOptions: string;
    var code = utils.encrypt(address.toString(), securetCode);
    code = code.split("/").join("_+_");
    console.log({ page });
    if (page == "CreateJointAccountScreen") {
      shareOptions = "https://prime-sign-230407.appspot.com/ja/mck/" + code;
    } else if (page == "MergeConfirmJointAccountScreen") {
      shareOptions = "https://prime-sign-230407.appspot.com/ja/ca/" + code;
    } else {
      console.log(address);
      shareOptions = address;
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
          subject: "HexaWallet" //  for email
        };
      } else if (page == "MergeConfirmJointAccountScreen") {
        let msg = "https://prime-sign-230407.appspot.com/ja/ca/" + code;
        shareOptions = {
          title: "Address",
          message: msg,
          url: "\nhttps://bithyve.com/",
          subject: "HexaWallet" //  for email
        };
      } else {
        shareOptions = {
          title: "Address",
          message: this.state.qrcodedata,
          url: "\nhttps://bithyve.com/",
          subject: "HexaWallet" //  for email
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
              <ViewShot
                ref="viewShot"
                options={{ format: "jpg", quality: 0.9 }}
              >
                <QRCode
                  ref="qrcodeView"
                  value={this.state.qrcodedata}
                  size={Dimensions.get("screen").width - 70}
                  bgColor="black"
                  fgColor="white"
                />
              </ViewShot>

              <TouchableOpacity
                onPress={() =>
                  this.click_CopyAddress(this.state.qrcodedata.toString())
                }
              >
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
              {renderIf(Platform.OS == "ios")(
                <View style={styles.viewSahreBtn}>
                  <ActionButton buttonColor="rgba(231,76,60,1)">
                    <ActionButton.Item
                      buttonColor="#9b59b6"
                      title="New Task"
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
                      <Icon
                        name="share-square"
                        style={styles.actionButtonIcon}
                      />
                    </ActionButton.Item>
                    <ActionButton.Item
                      buttonColor="#000"
                      title="Notifications"
                      onPress={() => {
                        try {
                          AsyncStorage.setItem(
                            "flag_BackgoundApp",
                            JSON.stringify(false)
                          );
                        } catch (e) {
                          console.log(e);
                        }
                        this.refs.viewShot.capture().then(uri => {
                          try {
                            Vibration.vibrate(100);
                            Toast.show(
                              "Barcode capture success.!",
                              Toast.SHORT
                            );
                          } catch (e) {
                            console.log(e);
                          }

                          CameraRoll.saveImageWithTag(
                            uri,
                            function(result) {
                              console.log(result);
                            },
                            function(error) {
                              console.log(error);
                            }
                          );
                        });
                      }}
                    >
                      <Icon name="barcode" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item
                      buttonColor="#1abc9c"
                      title="All Tasks"
                      onPress={() =>
                        this.click_CopyAddress(this.state.qrcodedata.toString())
                      }
                    >
                      <Icon name="copy" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                  </ActionButton>
                </View>
              )}
              {renderIf(Platform.OS == "android")(
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                  <Button
                    transparent
                    style={{ margin: 4 }}
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
                    <Icon
                      name="share-square"
                      size={30}
                      color="#ffffff"
                      style={{
                        backgroundColor: "#9b59b6",
                        padding: 10,
                        borderRadius: 10
                      }}
                    />
                  </Button>
                  <Button
                    transparent
                    style={{ margin: 4 }}
                    onPress={() => {
                      try {
                        AsyncStorage.setItem(
                          "flag_BackgoundApp",
                          JSON.stringify(false)
                        );
                      } catch (e) {
                        console.log(e);
                      }
                      this.refs.viewShot.capture().then(uri => {
                        try {
                          AsyncStorage.setItem(
                            "flag_BackgoundApp",
                            JSON.stringify(true)
                          );
                          Vibration.vibrate(100);
                          Toast.show("Barcode capture success.!", Toast.SHORT);
                        } catch (e) {
                          console.log(e);
                        }
                        CameraRoll.saveImageWithTag(
                          uri,
                          function(result) {
                            console.log(result);
                          },
                          function(error) {
                            console.log(error);
                          }
                        );
                      });
                    }}
                  >
                    <Icon
                      name="barcode"
                      size={30}
                      color="#ffffff"
                      style={{
                        backgroundColor: "#000000",
                        padding: 10,
                        borderRadius: 10
                      }}
                    />
                  </Button>
                  <Button
                    transparent
                    style={{ margin: 4 }}
                    onPress={() =>
                      this.click_CopyAddress(this.state.qrcodedata.toString())
                    }
                  >
                    <Icon
                      name="copy"
                      size={30}
                      color="#ffffff"
                      style={{
                        backgroundColor: "#1abc9c",
                        padding: 10,
                        borderRadius: 10
                      }}
                    />
                  </Button>
                </View>
              )}
            </View>
            <Image
              style={{ width: 50, height: 50 }}
              source={{ uri: this.state.imageURI }}
            />
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
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: "white"
  }
});
