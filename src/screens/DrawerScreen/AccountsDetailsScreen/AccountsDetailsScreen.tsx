import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  StatusBar,
  ImageBackground,
  RefreshControl,
  Dimensions,
  TextInput
} from "react-native";
import {
  Container,
  Content,
  Button,
  Left,
  Right,
  Text,
  Header,
  Body
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  MenuProvider,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";
import DropdownAlert from "react-native-dropdownalert";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Loader from "react-native-modal-loader";
import SvgImage from "react-native-remote-svg";

//TODO: Custome Pages
import {
  colors,
  images,
  localDB,
  errorMessages,
  errorValidMsg
} from "bithyve/src/app/constants/Constants";
var dbOpration = require("bithyve/src/app/manager/database/DBOpration");
var utils = require("bithyve/src/app/constants/Utils");
import renderIf from "bithyve/src/app/constants/validation/renderIf";
import moment from "moment";

let isNetwork: boolean;
//Custome Compontes
import ViewRecentTransaction from "bithyve/src/app/custcompontes/view/ViewRecentTransaction";
import SCLAlertTransferAccountAmount from "bithyve/src/app/custcompontes/alert/SCLAlertTransferAccountAmount";
import SCLAlertSimpleConfirmation from "bithyve/src/app/custcompontes/alert/SCLAlertSimpleConfirmation";
import SCLAlertOk from "bithyve/src/app/custcompontes/alert/SCLAlertOk";
import SCLAlertJointAccountAuthoriseConfirmation from "bithyve/src/app/custcompontes/alert/SCLAlertJointAccountAuthoriseConfirmation";
import BackButton from "bithyve/src/app/custcompontes/buttons/BackButton";
import DialogSecureAccountAuthentication from "bithyve/src/app/custcompontes/dialog/DialogSecureAccountAuthentication";

//new ui
import ViewAccountDetailsCard from "bithyve/src/app/custcompontes/view/ViewAccountDetailsCard/ViewAccountDetailsCard";
import ViewAccountDetailsRecentTransaction from "bithyve/src/app/custcompontes/view/ViewAccountDetailsRecentTransaction/ViewAccountDetailsRecentTransaction";

//TODO: Wallets
import RegularAccount from "bithyve/src/bitcoin/services/RegularAccount";
import jointAccount from "bithyve/src/bitcoin/services/JointAccount";
import secureAccount from "bithyve/src/bitcoin/services/SecureAccount";
import vaultAccount from "bithyve/src/bitcoin/services/VaultAccount";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";
let arr_AppConfigPopPupMsg = localization("appConfig.popUp");
let arr_amountTrnasfer = arr_AppConfigPopPupMsg[0].amountTrnasfer;
let arr_successMsg = arr_amountTrnasfer[0].successMsg;
let arr_failedMsg = arr_amountTrnasfer[0].failedMsg;
let arr_failedInvalidToken = arr_amountTrnasfer[0].failedInvalidToken;
interface Props {}
interface State {}
//new changes start
export default class AccountDetailsScreen extends React.Component<
  Props,
  State
> {
  constructor(props: any) {
    super(props);
    StatusBar.setBackgroundColor(colors.appColor, true);
    this.state = {
      data: [],
      waletteData: [],
      recentTransactionData: [],
      transferAmountPopupDAta: [],
      confirmPopupData: [],
      successOkPopupData: [],
      tranDetails: [],
      arr_transferAccountList: [],
      refreshing: false,
      isLoading: false,
      isNoTranstion: false,
      //transfer
      flag_TransferBtn: false,
      flag_sentBtnDisStatus: true,
      arr_TransferAccountData: [],
      arr_ConfirmJointAccountAuthorise: [],
      arr_SecureAuthPopupData: [],
      transactionHax: "",
      flag_SecureAccountPopup: false,
      txt2FA: "",
      secureAmount: "",
      secureRecipientAddress: "",
      securetransfer: {},
      selectedAccountType: "",
      //new State
      arr_RecentTrnasactionData: []
    };
    isNetwork = utils.getNetwork();
    this.baseState = this.state;
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    try {
      const { navigation } = this.props;
      let data = navigation.getParam("data");
      let walletsData = navigation.getParam("walletsData");
      console.log({ data, walletsData });
      this.setState({
        data: data,
        waletteData: walletsData
      });
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount() {
    try {
      this.willFocusSubscription = this.props.navigation.addListener(
        "willFocus",
        () => {
          isNetwork = utils.getNetwork();
          this.fetchloadData();
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  componentWillUnmount() {
    try {
      this.setState(this.baseState);
      this.willFocusSubscription.remove();
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: func loadData
  async fetchloadData() {
    try {
      const { navigation } = this.props;
      let isLoading: boolean = true;
      let isNoTranstion: boolean = false;
      let tranDetails: [] = [];
      let title: string =
        navigation.getParam("data").accountType + " Recent Transactions";
      const dateTime = Date.now();
      const lastUpdateDate = Math.floor(dateTime / 1000);
      var resultAccount = await dbOpration.readAccountTablesData(
        localDB.tableName.tblAccount
      );
      //TODO: Account Bal checking
      console.log(navigation.getParam("data").address);
      const bal = await RegularAccount.getBalance(
        navigation.getParam("data").address
      );
      if (isNetwork) {
        //TODO: for transfer and sent btn disable and enable details
        if (
          resultAccount.temp.length > 2 &&
          parseFloat(bal.balanceData.final_balance / 1e8) > 0
        ) {
          var resultAccount = await dbOpration.readAccountTablesData(
            localDB.tableName.tblAccount
          );
          resultAccount.temp.pop();
          for (var i = 0; i < resultAccount.temp.length; i++) {
            if (
              resultAccount.temp[i].accountType === this.state.data.accountType
            ) {
              resultAccount.temp.splice(i, 1);
              break;
            }
          }
          var isTransBtnStatus: boolean = false;
          if (this.state.data.accountType != "Vault") {
            isTransBtnStatus = true;
          } else {
            let additionalInfo = JSON.parse(this.state.data.additionalInfo);
            let validDate = moment(
              utils.getUnixToDateFormat(additionalInfo.validDate)
            );
            var start = moment(new Date()).format("DD-MM-YYYY");
            var end = moment(validDate).format("DD-MM-YYYY");
            let diffDays: number = parseInt(utils.date_diff_indays(start, end));
            console.log({ diffDays });
            if (diffDays <= 0) {
              isTransBtnStatus = false; //old code true
            }
          }
          let tempData = resultAccount.temp;
          console.log({ tempData });
          this.setState({
            arr_transferAccountList: resultAccount.temp,
            flag_TransferBtn: isTransBtnStatus
          });
        }
        if (parseFloat(bal.balanceData.final_balance / 1e8) > 0) {
          if (this.state.data.accountType != "Vault") {
            this.setState({
              flag_sentBtnDisStatus: false
            });
          } else {
            let additionalInfo = JSON.parse(this.state.data.additionalInfo);
            let validDate = moment(
              utils.getUnixToDateFormat(additionalInfo.validDate)
            );
            var start = moment(new Date()).format("DD-MM-YYYY");
            var end = moment(validDate).format("DD-MM-YYYY");
            let diffDays: number = parseInt(utils.date_diff_indays(start, end));
            console.log({ diffDays });
            if (diffDays <= 0) {
              this.setState({
                flag_sentBtnDisStatus: false
              });
            }
          }
        }
        if (bal.statusCode == 200) {
          const resultRecentTras = await RegularAccount.getTransactions(
            navigation.getParam("data").address
          );
          let resultRecentTransDetailsData =
            resultRecentTras.transactionDetails;
          var arr_DateSort = [];
          for (let i = 0; i < resultRecentTransDetailsData.length; i++) {
            let sortData = resultRecentTransDetailsData[i];
            sortData.received = new Date(
              resultRecentTransDetailsData[i].received
            );
            arr_DateSort.push(sortData);
          }
          let result_sortData = arr_DateSort.sort(utils.sortFunction);
          resultRecentTras.transactionDetails = result_sortData;
          if (resultRecentTras.statusCode == 200) {
            if (resultRecentTras.transactionDetails.length > 0) {
              const resultRecentTransaction = await dbOpration.insertTblTransation(
                localDB.tableName.tblTransaction,
                resultRecentTras.transactionDetails,
                resultRecentTras.address,
                lastUpdateDate
              );
              if (resultRecentTransaction) {
                let transation;
                let flag_noTrasation;
                const resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
                  localDB.tableName.tblTransaction,
                  navigation.getParam("data").address
                );
                if (resultRecentTras.temp.length > 0) {
                  transation = resultRecentTras.temp;
                  flag_noTrasation = false;
                } else {
                  transation = [];
                  flag_noTrasation = true;
                }
                tranDetails = transation;
                isNoTranstion = flag_noTrasation;
              }
            } else {
              isNoTranstion = true;
            }
            const resultUpdateTblAccount = await dbOpration.updateTableData(
              localDB.tableName.tblAccount,
              bal.balanceData.final_balance / 1e8,
              navigation.getParam("data").address,
              lastUpdateDate
            );
            if (resultUpdateTblAccount) {
              resultAccount = await dbOpration.readAccountTablesData(
                localDB.tableName.tblAccount
              );
              if (resultAccount.temp.length > 0) {
                isLoading = false;
                this.setState({
                  data: resultAccount.temp[navigation.getParam("indexNo")]
                });
              }
            }
          } else {
            this.dropdown.alertWithType(
              "error",
              "OH",
              resultRecentTras.errorMessage
            );
          }
        }
      } else {
        isLoading = false;
        let transation;
        let flag_noTrasation;
        const resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
          localDB.tableName.tblTransaction,
          navigation.getParam("data").address
        );
        if (resultRecentTras.temp.length > 0) {
          transation = resultRecentTras.temp;
          flag_noTrasation = false;
        } else {
          transation = [];
          flag_noTrasation = true;
        }
        tranDetails = transation;
        isNoTranstion = flag_noTrasation;

        this.setState({
          data: resultAccount.temp[navigation.getParam("indexNo")]
        });
      }

      this.setState({
        recentTransactionData: [
          {
            title,
            isLoading1: isLoading,
            isNoTranstion,
            tranDetails
          }
        ]
      });
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: func refresh
  refresh() {
    try {
      this.setState({ refreshing: true });
      return new Promise(resolve => {
        setTimeout(() => {
          this.setState({ refreshing: false });
          this.fetchloadData();
          resolve();
        }, 1000);
      });
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: func openRecentTrans
  openRecentTrans(item: any) {
    try {
      this.props.navigation.navigate("RecentTransactionsScreen", {
        transationDetails: item
      });
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: func connection_BarcodeRead
  onSelect = async data => {
    try {
      const txHex = data.barcode;
      let res = await jointAccount.recoverTxnDetails(txHex);
      console.log({ res });
      let additionalInfo = JSON.parse(this.state.data.additionalInfo);
      let jointData = additionalInfo.jointData;
      this.setState({
        transactionHax: txHex,
        arr_ConfirmJointAccountAuthorise: [
          {
            status: true,
            icon: "check-circle",
            title: "Confirmation",
            subtitle: `${
              jointData.cn
            } has initiated the following transaction from ${
              jointData.wn
            } joint accounts`,
            form: res.from,
            to: res.to,
            amount: res.amount,
            transFee: res.txnFee,
            confirmTitle: "AUTHORISE"
          }
        ]
      });
    } catch (error) {
      console.log(error);
    }
  };

  //TODO: func connection_SentJointAccountMoney
  async connection_SentJointAccountMoney() {
    try {
      let privateKey = this.state.waletteData[0].privateKey;
      console.log(privateKey, this.state.transactionHax);
      const res = await jointAccount.authorizeJointTxn(
        this.state.transactionHax,
        privateKey
      );
      console.log({ res });
      if (res.statusCode == 200) {
        this.setState({
          successOkPopupData: [
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
      }
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: func click_SecureAccountSendMoney
  async click_SecureAccountSendMoney(txt2fa: string) {
    try {
      let additionalInfo = JSON.parse(this.state.data.additionalInfo);
      console.log({ additionalInfo });
      const transfer = this.state.securetransfer;

      console.log(
        transfer.senderAddress,
        transfer.recipientAddress,
        transfer.amount
      );

      const res = await secureAccount.secureTransaction({
        senderAddress: transfer.senderAddress,
        recipientAddress: transfer.recipientAddress,
        amount: transfer.amount,
        primaryXpriv: additionalInfo.xpriv.primary,
        scripts: additionalInfo.multiSig.scripts,
        token: txt2fa,
        walletID: additionalInfo.walletID,
        childIndex: 0
      });
      console.log({ res });
      if (res.statusCode == 200) {
        this.setState({
          isLoading: false,
          successOkPopupData: [
            {
              theme: "success",
              status: true,
              icon: "smile",
              title: arr_successMsg.title,
              subtitle: arr_successMsg.subTitle,
              goBackStatus: false
            }
          ]
        });
      } else {
        this.setState({
          successOkPopupData: [
            {
              theme: "danger",
              status: true,
              icon: "frown",
              title: arr_failedInvalidToken.title,
              subtitle: arr_failedInvalidToken.subTitle,
              goBackStatus: false
            }
          ]
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <Container>
        <Content
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refresh.bind(this)}
            />
          }
        >
          <Header
            transparent
            style={Platform.OS == "ios" ? { marginTop: 10 } : { marginTop: 0 }}
          >
            <Left>
              <Button
                transparent
                onPress={() => this.props.navigation.goBack()}
              >
                <SvgImage
                  source={images.svgImages.back_Icon}
                  style={[styles.svgImage]}
                />
              </Button>
            </Left>
            <Right>
              <Button
                bordered
                style={{
                  height: 40,
                  margin: 0,
                  padding: 0,
                  borderColor: "gray"
                }}
              >
                <SvgImage
                  source={
                    images.svgImages.accountDetailsScreen.accountSettingsIcon
                  }
                  style={[styles.svgBtnAccoutSetting]}
                />
                <Text note style={{ fontSize: 12, fontWeight: "bold" }}>
                  Account Settings
                </Text>
              </Button>
            </Right>
          </Header>

          <View style={styles.viewaccountDetails}>
            <ViewAccountDetailsCard />
          </View>
          <View style={styles.viewrecentTransaction}>
            <ViewAccountDetailsRecentTransaction
              data={this.state.recentTransactionData}
            />
          </View>
          <View style={styles.viewAddAccountDetials}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#54A9DE",
                margin: 10,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 5
                }}
              >
                <SvgImage
                  source={images.svgImages.accountDetailsScreen.addAccount}
                  style={[styles.svgTxtAddAccount]}
                />
                <Text
                  style={[
                    styles.txtWhite,
                    { textAlign: "center", fontWeight: "bold", fontSize: 16 }
                  ]}
                >
                  Add Savings Account{" "}
                </Text>
              </View>
              <Text
                style={[
                  styles.txtWhite,
                  { textAlign: "center", marginTop: -15 }
                ]}
              >
                You can add up to four sub accounts for your main account
              </Text>
            </View>
          </View>
          <View style={styles.viewFotterButton}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginLeft: 10,
                marginRight: 10
              }}
            >
              <Button
                full
                style={{
                  flex: 1,
                  backgroundColor: "#37A0DA",
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                  borderTopRightRadius: 0,
                  borderBottomEndRadius: 0,
                  marginRight: 0.2
                }}
              >
                <Text>Send</Text>
              </Button>
              <Button
                style={{
                  flex: 1,
                  backgroundColor: "#0575BE",
                  borderTopRightRadius: 10,
                  borderBottomEndRadius: 10,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  marginLeft: 0.3
                }}
              >
                <Text>Receive</Text>
              </Button>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  txtWhite: {
    color: "#fff"
  },
  viewHeader: {
    flex: 1,
    flexDirection: "row"
  },
  viewaccountDetails: {
    flex: 0.7,
    margin: 10
  },
  viewrecentTransaction: {
    flex: 1
  },
  viewAddAccountDetials: {
    flex: 0.4
  },
  viewFotterButton: {
    flex: 0.2
  },
  svgImage: {
    width: 60,
    height: 73
  },
  svgTxtAddAccount: {
    width: 60,
    height: 40
  },
  svgBtnAccoutSetting: {
    width: 20,
    height: 40
  }
});
