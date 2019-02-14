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
import { Container, Content, Button, Left, Right, Text } from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
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

//TODO: Custome Pages
import { colors, images, localDB } from "../../../app/constants/Constants";
var dbOpration = require("../../../app/manager/database/DBOpration");
var utils = require("../../../app/constants/Utils");
import renderIf from "../../../app/constants/validation/renderIf";
import moment from "moment";

let isNetwork: boolean;
//Custome Compontes
import ViewRecentTransaction from "../../../app/custcompontes/view/ViewRecentTransaction";
import SCLAlertTransferAccountAmount from "../../../app/custcompontes/alert/SCLAlertTransferAccountAmount";
import SCLAlertSimpleConfirmation from "../../../app/custcompontes/alert/SCLAlertSimpleConfirmation";
import SCLAlertOk from "../../../app/custcompontes/alert/SCLAlertOk";
import SCLAlertJointAccountAuthoriseConfirmation from "../../../app/custcompontes/alert/SCLAlertJointAccountAuthoriseConfirmation";
import BackButton from "../../../app/custcompontes/buttons/BackButton";
import DialogSecureAccountAuthentication from "../../../app/custcompontes/dialog/DialogSecureAccountAuthentication";

//TODO: Wallets
import RegularAccount from "../../../bitcoin/services/RegularAccount";
import jointAccount from "../../../bitcoin/services/JointAccount";
import secureAccount from "../../../bitcoin/services/SecureAccount";
import vaultAccount from "../../../bitcoin/services/VaultAccount";

interface Props {}
interface State {}
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
      selectedAccountType: ""
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

  date_diff_indays(date1: any, date2: any) {
    try {
      let dt1 = new Date(date1);
      let dt2 = new Date(date2);
      return Math.floor(
        (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
          Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
          (1000 * 60 * 60 * 24)
      );
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
      if (isNetwork) {
        //TODO: for transfer and sent btn disable and enable details
        if (
          resultAccount.temp.length > 2 &&
          parseFloat(this.state.data.balance) > 0
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
            let diffDays: number = parseInt(this.date_diff_indays(start, end));

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
        if (parseFloat(this.state.data.balance) > 0) {
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
            let diffDays: number = parseInt(this.date_diff_indays(start, end));
            if (diffDays <= 0) {
              this.setState({
                flag_sentBtnDisStatus: false
              });
            }
          }
        }

        //TODO: Account Bal checking
        const bal = await RegularAccount.getBalance(
          navigation.getParam("data").address
        );
        if (bal.statusCode == 200) {
          const resultRecentTras = await RegularAccount.getTransactions(
            navigation.getParam("data").address
          );
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
              bal.final_balance / 1e8,
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
              title: "Success",
              subtitle: "Transaction Successfully Completed.",
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
              title: "Success",
              subtitle: "Amount Transfer successfully.",
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
              title: "Oops",
              subtitle:
                "Invalid token number.Please enter correct token number.",
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
      <Container style={styles.container}>
        <Content
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refresh.bind(this)}
            />
          }
        >
          <ImageBackground
            source={images.accounts[this.state.data.accountType]}
            style={styles[this.state.data.accountType]}
            borderRadius={10}
            imageStyle={{
              resizeMode: "cover" // works only here!
            }}
          >
            <View style={styles.viewBackBtn}>
              <Left>
                <BackButton click_Done={() => this.props.navigation.goBack()} />
              </Left>
              {renderIf(this.state.data.accountType == "Joint")(
                <Right>
                  <MenuProvider>
                    <Menu
                      style={{
                        marginTop: 10,
                        color: "#ffffff",
                        marginRight: 10
                      }}
                    >
                      <MenuTrigger
                        customStyles={{
                          triggerText: { fontSize: 18, color: "#fff" }
                        }}
                        text="options"
                      />
                      <MenuOptions
                        customStyles={{ optionText: styles.menuOptions }}
                      >
                        <MenuOption
                          onSelect={() => {
                            this.props.navigation.push("QrcodeScannerScreen", {
                              onSelect: this.onSelect
                            });
                          }}
                          text="Authorize Transaction"
                        />
                      </MenuOptions>
                    </Menu>
                  </MenuProvider>
                </Right>
              )}
            </View>
            <View style={styles.viewBalInfo}>
              <Text style={[styles.txtTile, styles.txtAccountType]}>
                {this.state.data.accountName}
              </Text>
              {renderIf(this.state.data.accountType == "Joint")(
                <Text style={styles.txtTile}>Joint Account</Text>
              )}
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <Text style={[styles.txtTile, styles.txtBalInfo]}>
                  {this.state.data.balance + " "}
                </Text>
                <Text style={[styles.txtTile, styles.txtBalInfo]}>
                  {this.state.data.unit}
                </Text>
              </View>
            </View>
          </ImageBackground>
          <View style={styles.viewMainRecentTran}>
            <ViewRecentTransaction
              data={this.state.recentTransactionData}
              openRecentTrans={(val: any) => this.openRecentTrans(val)}
            />
          </View>
          <View style={styles.viewFooter}>
            {renderIf(this.state.flag_TransferBtn)(
              <Button
                style={styles.footerBtnAction}
                warning
                onPress={() => {
                  if (isNetwork) {
                    this.setState({
                      transferAmountPopupDAta: [
                        {
                          status: true,
                          subtitle:
                            "From " +
                            this.state.data.accountType.toLowerCase() +
                            " to",
                          data: this.state.arr_transferAccountList
                        }
                      ]
                    });
                  } else {
                    this.dropdown.alertWithType(
                      "info",
                      "OH",
                      "Sorry You're Not Connected to the Internet"
                    );
                  }
                }}
              >
                <Icon
                  style={styles.footerBtnIcon}
                  name="exchange-alt"
                  size={25}
                  color="#ffffff"
                />
                <Text style={styles.txtTile}>TRANSFER</Text>
              </Button>
            )}
            <Button
              warning
              style={styles.footerBtnAction}
              disabled={this.state.flag_sentBtnDisStatus}
              onPress={() => {
                if (isNetwork) {
                  this.props.navigation.push("SentMoneyScreen", {
                    data: this.state.data,
                    address: this.state.data.address,
                    waletteData: this.state.waletteData
                  });
                } else {
                  this.dropdown.alertWithType(
                    "info",
                    "OH",
                    "Sorry You're Not Connected to the Internet"
                  );
                }
              }}
            >
              <Icon
                style={styles.footerBtnIcon}
                name="angle-up"
                size={25}
                color="#ffffff"
              />
              <Text style={styles.txtTile}>Send</Text>
            </Button>
            <Button
              style={styles.footerBtnAction}
              warning
              onPress={() => {
                let data = {};
                data.address = this.state.data.address;
                this.props.navigation.push("ReceiveMoneyScreen", {
                  page: "SentAndReceiveScreen",
                  data: data
                });
              }}
            >
              <Icon
                style={styles.footerBtnIcon}
                name="angle-down"
                size={25}
                color="#ffffff"
              />
              <Text style={styles.txtTile}>Receive</Text>
            </Button>
          </View>

          <SCLAlertTransferAccountAmount
            data={this.state.transferAmountPopupDAta}
            onRequestClose={() =>
              this.setState({ transferAmountPopupDAta: [{ status: false }] })
            }
            onPress={async (accountType, amount, address, msg) => {
              let selfAddress = this.state.data.address;
              let privateKey = this.state.waletteData[0].privateKey;
              console.log({
                selfAddress,
                privateKey,
                accountType,
                amount,
                address,
                msg
              });
              const transfer = {
                senderAddress: selfAddress,
                recipientAddress: address,
                amount: parseFloat(amount) * 1e8,
                privateKey
              };
              if (this.state.data.accountType == "Savings") {
                this.setState({
                  selectedAccountType: "Savings",
                  securetransfer: transfer,
                  transferAmountPopupDAta: [
                    {
                      status: false
                    }
                  ],
                  confirmPopupData: [
                    {
                      status: true,
                      icon: "check-circle",
                      title: "Confirmation",
                      subtitle:
                        "Are you sure Saving account to " +
                        accountType +
                        " account transfer amount.",
                      confirmTitle: "CONFIRM"
                    }
                  ]
                });
              } else if (this.state.data.accountType == "Vault") {
                // let additionalInfo = JSON.parse(this.state.data.additionalInfo);
                // const locktime = additionalInfo.lockTime;
                // const res = await vaultAccount.transfer(
                //   transfer.senderAddress,
                //   transfer.recipientAddress,
                //   transfer.amount,
                //   locktime,
                //   transfer.privateKey
                // );
                // console.log({ res });
              } else if (this.state.data.accountType == "Secure") {
                this.setState({
                  securetransfer: transfer,
                  selectedAccountType: "Secure",
                  transferAmountPopupDAta: [
                    {
                      status: false
                    }
                  ],
                  confirmPopupData: [
                    {
                      status: true,
                      icon: "check-circle",
                      title: "Confirmation",
                      subtitle:
                        "Are you sure Saving account to " +
                        accountType +
                        " account transfer amount.",
                      confirmTitle: "CONFIRM"
                    }
                  ]
                });
              } else if (this.state.data.accountType == "Joint") {
                this.setState({
                  securetransfer: transfer,
                  selectedAccountType: "Joint",
                  transferAmountPopupDAta: [
                    {
                      status: false
                    }
                  ]
                });
              }
            }}
            onError={error => {
              this.dropdown.alertWithType("error", "OH", error);
            }}
          />
          <SCLAlertSimpleConfirmation
            data={this.state.confirmPopupData}
            click_Ok={async (status: boolean) => {
              this.setState({
                confirmPopupData: [
                  {
                    status: false
                  }
                ]
              });
              if (status) {
                if (this.state.selectedAccountType == "Savings") {
                  const transfer = this.state.securetransfer;
                  this.setState({
                    isLoading: true
                  });
                  const res = await RegularAccount.transfer(
                    transfer.senderAddress,
                    transfer.recipientAddress,
                    transfer.amount,
                    transfer.privateKey
                  );
                  if (res.statusCode == 200) {
                    this.setState({
                      isLoading: false,
                      successOkPopupData: [
                        {
                          theme: "success",
                          status: true,
                          icon: "smile",
                          title: "Success",
                          subtitle: "Amount Transfer successfully.",
                          goBackStatus: false
                        }
                      ]
                    });
                  }
                } else if (this.state.selectedAccountType == "Secure") {
                  console.log("its working");
                  const transfer = this.state.securetransfer;
                  this.setState({
                    arr_SecureAuthPopupData: [
                      {
                        visible: true,
                        amount: transfer.amount,
                        fee: "0.001",
                        secureRecipientAddress: transfer.recipientAddress
                      }
                    ]
                  });
                } else if (this.state.selectedAccountType == "Joint") {
                  const transfer = this.state.securetransfer;
                  const additionalInfo = JSON.parse(
                    this.state.data.additionalInfo
                  );
                  const scripts = additionalInfo.scripts;
                  const res = await jointAccount.initJointTxn({
                    senderAddress: transfer.senderAddress,
                    recipientAddress: transfer.recipientAddress,
                    amount: transfer.amount,
                    privateKey: transfer.privateKey,
                    scripts
                  });
                  this.props.navigation.push("ReceiveMoneyScreen", {
                    page: "AccountDetailsScreen",
                    data: res.data
                  });
                }
              }
            }}
          />
          <SCLAlertJointAccountAuthoriseConfirmation
            data={this.state.arr_ConfirmJointAccountAuthorise}
            click_Ok={(status: boolean) => {
              if (status) {
                this.connection_SentJointAccountMoney();
              }
              this.setState({
                arr_ConfirmJointAccountAuthorise: [
                  {
                    status: false
                  }
                ]
              });
            }}
          />
          <SCLAlertOk
            data={this.state.successOkPopupData}
            click_Ok={(status: boolean) => {
              this.fetchloadData();
              this.setState({
                successOkPopupData: [
                  {
                    status: false
                  }
                ]
              });
            }}
          />
          <DialogSecureAccountAuthentication
            data={this.state.arr_SecureAuthPopupData}
            click_Sent={(txt2fa: string) => {
              if (txt2fa.length != 6) {
                this.dropdown.alertWithType(
                  "error",
                  "OH",
                  "Please enter token."
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
          <DropdownAlert ref={ref => (this.dropdown = ref)} />
          <Loader loading={this.state.isLoading} color={colors.appColor} />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  Savings: {
    flex: 14,
    backgroundColor: colors.Saving,
    width: "100%"
  },
  Secure: {
    flex: 14,
    backgroundColor: colors.Secure,
    width: "100%"
  },
  Vault: {
    flex: 14,
    backgroundColor: colors.Vault,
    width: "100%"
  },
  Joint: {
    flex: 14,
    backgroundColor: colors.Joint,
    width: "100%"
  },
  viewBackBtn: {
    flex: 3,
    flexDirection: "row",
    padding: 15,
    marginTop: Platform.OS == "ios" ? 10 : 25
  },
  viewBalInfo: {
    flex: 5,
    flexDirection: "column",
    padding: 15
  },
  //txtbal info
  txtTile: {
    color: "#ffffff"
  },
  txtTitle: {
    color: "#ffffff"
  },
  txtAccountType: {
    fontSize: 20,
    fontWeight: "bold"
  },
  txtBalInfo: {
    fontSize: 28,
    fontWeight: "bold"
  },
  //view:Recent Transaction
  viewMainRecentTran: {
    flex: 25
  },
  viewTitleRecentTrans: {
    marginLeft: 20,
    flexDirection: "row",
    flex: 0.2,
    alignItems: "center"
  },
  txtRecentTran: {
    fontWeight: "bold",
    fontSize: 25,
    marginTop: 10
  },
  txtTransTitle: {
    fontWeight: "bold",
    marginBottom: 5
  },
  txtAmoundRec: {
    color: "#228B22",
    fontWeight: "bold"
  },
  txtAmoundSent: {
    color: "red",
    fontWeight: "bold"
  },
  recentTransListView: {
    flex: 1
  },
  //No Transaction
  viewNoTransaction: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20
  },
  txtNoTransaction: {
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 5
  },
  //TODO:Fotter view
  viewFooter: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  txtConfimation: {
    fontSize: 10,
    color: "gray"
  },
  //PopupMenu
  text: {
    fontSize: 18
  },
  //Fotter Button
  footerBtnIcon: {
    paddingLeft: 10
  },
  footerBtnAction: {
    alignSelf: "center",
    marginLeft: 2,
    marginRight: 2
  },
  //menuoption
  menuOptions: {
    fontSize: 14,
    marginRight: 60
  }
});
