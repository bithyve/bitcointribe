import React, { Component } from "react";
import {
  StyleSheet,
  ImageBackground,
  View,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  TextInput
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
  Input
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import Loader from "react-native-modal-loader";
import DropdownAlert from "react-native-dropdownalert";

//Custome Compontes
import SCLAlertOk from "bithyve/src/app/custcompontes/alert/SCLAlertOk";
import DialogSecureAccountAuthentication from "bithyve/src/app/custcompontes/dialog/DialogSecureAccountAuthentication";

//TODO: Custome Object
import {
  colors,
  images,
  localDB,
  msg,
  errorMessage,
  errorValidMsg
} from "bithyve/src/app/constants/Constants";
var dbOpration = require("bithyve/src/app/manager/database/DBOpration");

//TODO: Wallets
import RegularAccount from "bithyve/src/bitcoin/services/RegularAccount";

//TODO: SecureAccount
import secureAccount from "bithyve/src/bitcoin/services/SecureAccount";
import vaultAccount from "bithyve/src/bitcoin/services/VaultAccount";
import jointAccount from "bithyve/src/bitcoin/services/JointAccount";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";
let arr_AppConfigPopPupMsg = localization("appConfig.popUp");
let arr_amountTrnasfer = arr_AppConfigPopPupMsg[0].amountTrnasfer;
let arr_successMsg = arr_amountTrnasfer[0].successMsg;
let arr_failedMsg = arr_amountTrnasfer[0].failedMsg;
export default class SentMoneyScreen extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      walletJSON: [],
      alertPopupData: [],
      recipientAddress: "",
      amount: "",
      sentBtnColor: "gray",
      sentBtnStatus: true,
      isLoading: false,
      isSecureAccountPopup: false,
      arr_SecureAuthPopupData: []
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    let data = navigation.getParam("data");
    let walletJSON = navigation.getParam("waletteData");

    console.log({ data, walletJSON });

    this.setState({
      data: data,
      walletJSON: walletJSON
    });
  }

  async componentDidMount() {
    //TODO:User Deails read
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        try {
          AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(false));
        } catch (error) {
          // Error saving data
        }
      }
    );
  }

  async componentWillUnmount() {
    try {
      this.willFocusSubscription.remove();
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(false));
      this.setState({
        isLoading: false
      });
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: func validation
  validation(val, type) {
    if (type == "address") {
      this.setState({
        recipientAddress: val
      });
    } else {
      this.setState({
        amount: val
      });
    }
    if (
      this.state.recipientAddress.length > 0 &&
      this.state.amount.length > 0
    ) {
      this.setState({
        sentBtnColor: colors.appColor,
        sentBtnStatus: false
      });
    }
    if (
      this.state.recipientAddress.length < 0 ||
      this.state.amount.length < 0 ||
      val == ""
    ) {
      this.setState({
        sentBtnColor: "gray",
        sentBtnStatus: true
      });
    }
  }

  //TODO: func click_SentMoney
  async click_SentMoney() {
    let isLoading = false;
    if (this.state.data.accountType == "Secure") {
      try {
        AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
        this.setState({
          arr_SecureAuthPopupData: [
            {
              visible: true,
              amount: this.state.amount,
              fee: "0.001",
              secureRecipientAddress: this.state.recipientAddress
            }
          ]
        });
      } catch (error) {
        console.log(error);
      }
    } else if (this.state.data.accountType == "Vault") {
      const { navigation } = this.props;
      const dateTime = Date.now();
      const lastUpdateDate = Math.floor(dateTime / 1000);
      let additionalInfo = JSON.parse(this.state.data.additionalInfo);
      let res = await vaultAccount.transfer(
        this.state.data.address,
        this.state.recipientAddress,
        parseFloat(this.state.amount) * 1e8,
        additionalInfo.lockTime,
        additionalInfo.privateKey
      );
      if (res.statusCode == 200) {
        const bal = await RegularAccount.getBalance(
          navigation.getParam("address")
        );
        if (bal) {
          const resultUpdateTblAccount = await dbOpration.updateTableData(
            localDB.tableName.tblAccount,
            bal.balanceData.final_balance / 1e8,
            navigation.getParam("address"),
            lastUpdateDate
          );
          if (resultUpdateTblAccount) {
            isLoading = false;
            this.setState({
              alertPopupData: [
                {
                  theme: "success",
                  status: true,
                  icon: "smile",
                  title: arr_successMsg.title,
                  subtitle: arr_successMsg.subTitle,
                  goBackStatus: true
                }
              ]
            });
          } else {
            (isLoading = false),
              this.setState({
                alertPopupData: [
                  {
                    theme: "danger",
                    status: true,
                    icon: "frown",
                    title: arr_failedMsg.title,
                    subtitle: arr_failedMsg.subTitle,
                    goBackStatus: false
                  }
                ]
              });
          }
        }
      }
    } else if (this.state.data.accountType == "Joint") {
      const { navigation } = this.props;
      let additionalInfo = JSON.parse(this.state.data.additionalInfo);
      console.log({ additionalInfo });
      let scripts = additionalInfo.scripts;

      const resJointAccount = await jointAccount.initJointTxn({
        senderAddress: navigation.getParam("address"),
        recipientAddress: this.state.recipientAddress,
        amount: parseFloat(this.state.amount) * 1e8,
        privateKey: this.state.walletJSON[0].privateKey,
        scripts: scripts
      });
      if (resJointAccount.statusCode == 200) {
        this.props.navigation.push("ReceiveMoneyScreen", {
          page: "SentMoneyScreen",
          data: resJointAccount.data
        });
      }
    } else {
      isLoading = true;
      this.setState({
        isLoading: isLoading
      });
      var recAddress = this.state.recipientAddress;
      var amountValue = this.state.amount;
      const dateTime = Date.now();
      const lastUpdateDate = Math.floor(dateTime / 1000);
      const { navigation } = this.props;
      const res = await RegularAccount.transfer(
        navigation.getParam("address"),
        recAddress,
        parseFloat(amountValue) * 1e8,
        this.state.walletJSON[0].privateKey
      );
      if (res.statusCode == 200) {
        const bal = await RegularAccount.getBalance(
          navigation.getParam("address")
        );
        if (bal) {
          const resultUpdateTblAccount = await dbOpration.updateTableData(
            localDB.tableName.tblAccount,
            bal.balanceData.final_balance / 1e8,
            navigation.getParam("address"),
            lastUpdateDate
          );
          if (resultUpdateTblAccount) {
            (isLoading = false),
              this.setState({
                alertPopupData: [
                  {
                    theme: "success",
                    status: true,
                    icon: "smile",
                    title: arr_successMsg.title,
                    subtitle: arr_successMsg.subTitle,
                    goBackStatus: true
                  }
                ]
              });
          } else {
            (isLoading = false),
              this.setState({
                alertPopupData: [
                  {
                    theme: "danger",
                    status: true,
                    icon: "frown",
                    title: arr_failedMsg.title,
                    subtitle: arr_failedMsg.subTitle,
                    goBackStatus: false
                  }
                ]
              });
          }
        }
      }
    }
    this.setState({
      isLoading: isLoading
    });
  }

  //TODO: func openQRCodeScanner
  async openQRCodeScanner() {
    this.props.navigation.navigate("QrcodeScannerScreen", {
      onSelect: this.onSelect
    });
  }

  onSelect = data => {
    this.setState({
      recipientAddress: data.barcode
    });
  };

  //TODO: func click
  async click_SecureAccountSendMoney(txt2fa: string) {
    var mnemonic = this.state.walletJSON[0].mnemonic.replace(/,/g, " ");
    var amountValue = this.state.amount;
    var tokenNo = txt2fa;
    const dateTime = Date.now();
    const lastUpdateDate = Math.floor(dateTime / 1000);
    const { navigation } = this.props;
    const data = JSON.parse(this.state.data.additionalInfo);
    const res = await secureAccount.secureTransaction({
      senderAddress: data.multiSig.address,
      recipientAddress: this.state.recipientAddress,
      amount: parseFloat(amountValue) * 1e8,
      primaryXpriv: data.xpriv.primary,
      scripts: data.multiSig.scripts,
      token: parseInt(tokenNo),
      walletID: data.walletID,
      childIndex: 0
    });
    if (res.statusCode == 200) {
      try {
        AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(false));
      } catch (error) {
        console.log(error);
      }
      const bal = await RegularAccount.getBalance(
        navigation.getParam("address")
      );
      if (bal) {
        const resultUpdateTblAccount = await dbOpration.updateTableData(
          localDB.tableName.tblAccount,
          bal.balanceData.final_balance / 1e8,
          navigation.getParam("address"),
          lastUpdateDate
        );
        if (resultUpdateTblAccount) {
          this.setState({
            isLoading: false,
            alertPopupData: [
              {
                theme: "success",
                status: true,
                icon: "smile",
                title: arr_successMsg.title,
                subtitle: arr_successMsg.subTitle,
                goBackStatus: true
              }
            ]
          });
        } else {
          this.setState({
            isLoading: false,
            alertPopupData: [
              {
                theme: "danger",
                status: true,
                icon: "frown",
                title: arr_failedMsg.title,
                subtitle: arr_failedMsg.subTitle,
                goBackStatus: false
              }
            ]
          });
        }
      }
    } else {
      this.setState({
        isLoading: false,
        alertPopupData: [
          {
            theme: "danger",
            status: true,
            icon: "frown",
            title: arr_failedMsg.title,
            subtitle: arr_failedMsg.subTitle,
            goBackStatus: false
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

            <Body>
              <Title
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.txtTitle}
              >
                {localization("SentMoneyScreen.headerTitle")}
              </Title>
            </Body>
            <Right />
          </Header>
          <Content padder>
            <View style={styles.selectQRCodeOption}>
              <Input
                name={this.state.recipientAddress}
                value={this.state.recipientAddress}
                keyboardType={"default"}
                placeholder={localization(
                  "SentMoneyScreen.txtInputAddressPlaceholder"
                )}
                placeholderTextColor="#ffffff"
                style={styles.input}
                onChangeText={val => this.validation(val, "address")}
                onChange={val => this.validation(val, "address")}
              />
              <TouchableOpacity
                onPress={() => {
                  try {
                    AsyncStorage.setItem(
                      "flag_BackgoundApp",
                      JSON.stringify(false)
                    );
                  } catch (error) {
                    // Error saving data
                  }
                  this.openQRCodeScanner();
                }}
              >
                <Icon
                  style={{ alignItems: "flex-end", justifyContent: "flex-end" }}
                  name="barcode"
                  size={35}
                  color={"#000000"}
                />
              </TouchableOpacity>
            </View>
            <View>
              <Input
                name={this.state.amount}
                value={this.state.amount}
                keyboardType={"numeric"}
                placeholder={localization(
                  "SentMoneyScreen.txtInputAmountPlaceholder"
                )}
                placeholderTextColor="#ffffff"
                style={styles.input}
                onChangeText={val => this.validation(val, "amount")}
                onChange={val => this.validation(val, "amount")}
              />
            </View>
            <Button
              style={[
                styles.btnSent,
                { backgroundColor: this.state.sentBtnColor }
              ]}
              full
              disabled={this.state.sentBtnStatus}
              onPress={() => this.click_SentMoney()}
            >
              <Text> {localization("SentMoneyScreen.btnSend")} </Text>
            </Button>
          </Content>

          <DialogSecureAccountAuthentication
            data={this.state.arr_SecureAuthPopupData}
            click_Sent={(txt2fa: string) => {
              if (txt2fa.length != 6) {
                this.dropdown.alertWithType(
                  "error",
                  "OH",
                  errorValidMsg.enterToken
                );
              } else {
                this.setState({
                  isLoading: true,
                  arr_SecureAuthPopupData: [
                    {
                      visible: false
                    }
                  ]
                });
                this.click_SecureAccountSendMoney(txt2fa);
              }
            }}
            click_Cancel={() =>
              this.setState({
                arr_SecureAuthPopupData: [
                  {
                    visible: false
                  }
                ]
              })
            }
          />
        </ImageBackground>
        <SCLAlertOk
          data={this.state.alertPopupData}
          click_Ok={(status: boolean) => {
            status ? this.props.navigation.goBack() : console.log(status),
              this.setState({
                alertPopupData: [
                  {
                    status: false
                  }
                ]
              });
          }}
        />
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
        <Loader loading={this.state.isLoading} color={colors.appColor} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  txtTitle: {
    color: "#ffffff"
  },
  btnSent: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.appColor
  },
  //QRCode select option
  selectQRCodeOption: {
    flexDirection: "row"
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    color: "#ffffff"
  },

  //For flip
  flipCard: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "blue",
    backfaceVisibility: "hidden"
  },
  flipCardBack: {
    backgroundColor: "red",
    position: "absolute",
    top: 0
  },
  flipText: {
    width: 90,
    fontSize: 20,
    color: "white",
    fontWeight: "bold"
  },
  //popup
  dialogSecureAccount: {
    borderRadius: 5,
    backgroundColor: "#1F1E25"
  },
  dialogContainerSecureAccount: {},
  accountTypePopUP: {
    padding: 10,
    marginTop: 20
  },
  viewFeeShow: {
    marginTop: 20,
    marginBottom: 10
  },
  viewLineText: {
    flexDirection: "row"
  },
  viewReceipint: {},
  view2FaInput: {
    marginTop: 20
  },
  input2FA: {
    borderBottomWidth: 1,
    borderBottomColor: "#EA4336",
    color: "#EA4336",
    fontSize: 18
  },
  //view:Button
  viewBtn: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "flex-end"
  }
});
