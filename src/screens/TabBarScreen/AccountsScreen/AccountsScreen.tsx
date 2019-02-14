import React from "react";
import {
  View,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
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
import { RkCard } from "react-native-ui-kitten";
import Carousel, { Pagination } from "react-native-snap-carousel";
import Icon from "react-native-vector-icons/FontAwesome5";
import { SkypeIndicator } from "react-native-indicators";
import DropdownAlert from "react-native-dropdownalert";

//Custome Compontes
import SCLAlertAccountTypes from "../../../app/custcompontes/alert/SCLAlertAccountTypes";
import ViewRecentTransaction from "../../../app/custcompontes/view/ViewRecentTransaction";

//TODO: Custome object
import { colors, images, localDB } from "../../../app/constants/Constants";
var dbOpration = require("../../../app/manager/database/DBOpration");
var utils = require("../../../app/constants/Utils");
import renderIf from "../../../app/constants/validation/renderIf";
import Singleton from "../../../app/constants/Singleton";

let isNetwork: boolean;
const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);

function wp(percentage: number) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}
const slideHeight = viewportHeight * 0.36;
const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);
const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 2;
const SLIDER_1_FIRST_ITEM = 0;

//TODO: Wallets
import RegularAccount from "../../../bitcoin/services/RegularAccount";

export default class AccountsScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    StatusBar.setBackgroundColor(colors.appColor, true);
    this.state = {
      isNetwork: true,
      tranDetails: [],
      accountTypeList: [],
      accountTypeVisible: false,
      popupData: [],
      recentTransactionData: [],
      walletsData: [],
      slider1ActiveSlide: SLIDER_1_FIRST_ITEM,
      isOpen: false,
      refreshing: false,
      isLoading: false,
      isLoading1: false,
      isNoTranstion: false,
      cardIndexNo: 0
    };
    this.click_openPopupAccountType = this.click_openPopupAccountType.bind(
      this
    );
    isNetwork = utils.getNetwork();
    let commonData = Singleton.getInstance();
    passcode = commonData.getPasscode();
  }

  //TODO: Page Life Cycle
  componentDidMount() {
    //TODO:User Deails read
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        console.log(this.state.cardIndexNo);
        isNetwork = utils.getNetwork();
        this.connnection_FetchData();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  //TODO: func connnection_FetchData
  async connnection_FetchData() {
    let isLoading1: boolean = true;
    let isNoTranstion: boolean = false;
    let tranDetails: [] = [];
    let title: string;
    this.setState({
      isLoading: true
    });
    const dateTime = Date.now();
    const lastUpdateDate = Math.floor(dateTime / 1000);
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    const resultPopUpAccountTypes = await dbOpration.readTableAcccountType(
      localDB.tableName.tblAccountType,
      localDB.tableName.tblAccount
    );
    var resultAccount = await dbOpration.readAccountTablesData(
      localDB.tableName.tblAccount
    );
    if (isNetwork && this.state.cardIndexNo != resultAccount.temp.length - 1) {
      title =
        resultAccount.temp[this.state.cardIndexNo].accountType +
        " Recent Transactions";

      const bal = await RegularAccount.getBalance(
        resultAccount.temp[this.state.cardIndexNo].address
      );

      var transation: [] = [];
      var flag_noTrasation: boolean;

      // var resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
      //   localDB.tableName.tblTransaction,
      //   resultAccount.temp[this.state.cardIndexNo].address
      // );
      // console.log({ resultRecentTras });
      // if (resultRecentTras.temp.length > 0) {
      //   transation = resultRecentTras.temp;
      //   flag_noTrasation = false;
      // } else {
      //   transation = [];
      //   flag_noTrasation = true;
      // }
      // tranDetails = transation;
      // isNoTranstion = flag_noTrasation;

      if (bal.statusCode == 200) {
        var resultRecentTras = await RegularAccount.getTransactions(
          resultAccount.temp[this.state.cardIndexNo].address
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
              resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
                localDB.tableName.tblTransaction,
                resultAccount.temp[this.state.cardIndexNo].address
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
            tranDetails = [];
          }
          const resultUpdateTblAccount = await dbOpration.updateTableData(
            localDB.tableName.tblAccount,
            bal.final_balance / 1e8,
            resultAccount.temp[0].address,
            lastUpdateDate
          );
          if (resultUpdateTblAccount) {
            resultAccount = await dbOpration.readAccountTablesData(
              localDB.tableName.tblAccount
            );
            if (resultAccount.temp.length > 0) {
              isLoading1 = false;
              this.setState({
                accountTypeList: resultAccount.temp,
                walletsData: resultWallet.temp,
                popupData: [
                  {
                    success: "success",
                    icon: "plus-circle",
                    data: resultPopUpAccountTypes.temp
                  }
                ],
                isLoading: false
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
      } else {
        this.dropdown.alertWithType("error", "OH", bal.errorMessage);
      }
    } else {
      let transation: [] = [];
      let flag_noTrasation: boolean;
      const resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
        localDB.tableName.tblTransaction,
        resultAccount.temp[this.state.cardIndexNo].address
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
      isLoading1 = false;
      this.setState({
        accountTypeList: resultAccount.temp,
        walletsData: resultWallet.temp,
        popupData: [
          {
            success: "success",
            icon: "plus-circle",
            data: resultPopUpAccountTypes.temp
          }
        ],
        isLoading: false
      });
    }
    this.setState({
      recentTransactionData: [
        {
          title,
          isLoading1,
          isNoTranstion,
          tranDetails
        }
      ]
    });
  }

  //TODO: func getSwapCardDetails
  async getSwapCardDetails(index: number) {
    console.log(index);
    let isLoading1: boolean = true;
    let isNoTranstion: boolean = false;
    let tranDetails: [] = [];
    let title: string;
    isNetwork = utils.getNetwork();
    isLoading1 = true;
    this.setState({
      cardIndexNo: index
    });
    this.setState({ slider1ActiveSlide: index });
    const dateTime = Date.now();
    const lastUpdateDate = Math.floor(dateTime / 1000);
    var resultAccount = await dbOpration.readAccountTablesData(
      localDB.tableName.tblAccount
    );

    if (resultAccount.temp[index].accountType != "UnKnown") {
      title = resultAccount.temp[index].accountType + " Recent Transactions";
    } else {
      this.setState({ accountTypeVisible: !this.state.accountTypeVisible });
      title = "";
    }

    if (resultAccount.temp[index].address != "") {
      console.log(resultAccount.temp[index].address);
      if (isNetwork) {
        const bal = await RegularAccount.getBalance(
          resultAccount.temp[index].address
        );
        let transation: [] = [];
        let flag_noTrasation: boolean;

        // var resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
        //   localDB.tableName.tblTransaction,
        //   resultAccount.temp[index].address
        // );

        // if (resultRecentTras.temp.length > 0) {
        //   transation = resultRecentTras.temp;
        //   flag_noTrasation = false;
        // } else {
        //   transation = [];
        //   flag_noTrasation = true;
        // }
        // tranDetails = transation;
        // isNoTranstion = flag_noTrasation;

        if (bal.statusCode == 200) {
          console.log({ bal });
          var resultRecentTras = await RegularAccount.getTransactions(
            resultAccount.temp[index].address
          );
          console.log({ resultRecentTras });
          if (resultRecentTras.statusCode == 200) {
            if (resultRecentTras.transactionDetails.length > 0) {
              const resultRecentTransaction = await dbOpration.insertTblTransation(
                localDB.tableName.tblTransaction,
                resultRecentTras.transactionDetails,
                resultRecentTras.address,
                lastUpdateDate
              );
              if (resultRecentTransaction) {
                let transation: [] = [];
                let flag_noTrasation: boolean;
                resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
                  localDB.tableName.tblTransaction,
                  resultAccount.temp[index].address
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
              tranDetails = [];
            }
            const resultUpdateTblAccount = await dbOpration.updateTableData(
              localDB.tableName.tblAccount,
              bal.final_balance / 1e8,
              resultAccount.temp[index].address,
              lastUpdateDate
            );
            if (resultUpdateTblAccount) {
              resultAccount = await dbOpration.readAccountTablesData(
                localDB.tableName.tblAccount
              );
              isLoading1 = false;
              this.setState({
                accountTypeList: resultAccount.temp
              });
            }
          } else {
            this.dropdown.alertWithType(
              "error",
              "OH",
              resultRecentTras.errorMessage
            );
          }
        } else {
          this.dropdown.alertWithType("error", "OH", bal.errorMessage);
        }
      } else {
        isLoading1 = false;
        let transation: [] = [];
        let flag_noTrasation: boolean;
        const resultRecentTras = await dbOpration.readRecentTransactionAddressWise(
          localDB.tableName.tblTransaction,
          resultAccount.temp[index].address
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
          accountTypeList: resultAccount.temp
        });
      }
    } else {
      (isNoTranstion = true), (tranDetails = []), (isLoading1 = false);
    }

    this.setState({
      recentTransactionData: [
        {
          title,
          isLoading1,
          isNoTranstion,
          tranDetails
        }
      ]
    });
  }

  //TODO: func click_openPopupAccountType
  click_openPopupAccountType() {
    if (isNetwork) {
      this.setState({ accountTypeVisible: !this.state.accountTypeVisible });
    } else {
      this.dropdown.alertWithType(
        "info",
        "OH",
        "Sorry You're Not Connected to the Internet"
      );
    }
  }

  //TODO: func refresh
  refresh() {
    this.setState({ refreshing: true });
    return new Promise(resolve => {
      setTimeout(() => {
        this.setState({ refreshing: false });
        this.connnection_FetchData();
        resolve();
      }, 1000);
    });
  }

  //TODO: func openRecentTrans
  openRecentTrans(item: any) {
    this.props.navigation.navigate("RecentTransactionsScreen", {
      transationDetails: item
    });
  }

  //TODO: func cardBgColor
  cardBgColor(type: string) {
    if (type == "Saving") {
      return "style.cardSlideBgImageSaving";
    } else {
      return "style.cardSlideBgImageSecure";
    }
  }
  _renderItem({ item, index }) {
    return (
      <View key={"card" + index}>
        {renderIf(item.accountType == "UnKnown")(
          <TouchableOpacity onPress={this.click_openPopupAccountType}>
            <RkCard style={styles.rkCardUnnown}>
              <Icon name="plus-circle" size={40} color={"#ffffff"} />
              <Text
                style={{ marginTop: 10, fontWeight: "bold", fontSize: 20 }}
                note
              >
                Create a wallet
              </Text>
            </RkCard>
          </TouchableOpacity>
        )}
        {renderIf(item.accountType != "UnKnown")(
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.push("AccountsDetailsScreen", {
                data: item,
                walletsData: this.state.walletsData,
                indexNo: index
              })
            }
          >
            <RkCard style={styles.rkCard}>
              <ImageBackground
                source={images.accounts[item.accountType]}
                style={styles[item.accountType]}
                borderRadius={10}
                imageStyle={{
                  resizeMode: "cover" // works only here!
                }}
              >
                <View rkCardContent style={styles.cardHeader}>
                  <Text style={[styles.cardText, styles.cardTitle]}>
                    {item.accountName}
                  </Text>
                  {renderIf(item.accountType == "Joint")(
                    <Text style={[styles.cardText]}>Joint Account</Text>
                  )}

                  <Text
                    style={[
                      styles.cardText,
                      styles.cardAmount,
                      { marginTop: 10 }
                    ]}
                  >
                    {item.balance} {item.unit}
                  </Text>
                </View>
                <View style={styles.cardFotter}>
                  <TouchableOpacity onPress={() => alert("working")}>
                    <Icon name="ellipsis-v" size={30} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </RkCard>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  //TODO: func createNewAccount
  createNewAccount(type: string) {
    this.setState({ accountTypeVisible: !this.state.accountTypeVisible });
    this.props.navigation.push("AccountDetailsOnboardingRouter", {
      type: type
    });
  }

  render() {
    const { slider1ActiveSlide } = this.state;
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
          <ImageBackground
            source={images.appBackgound}
            style={styles.backgroundImage}
            imageStyle={{
              resizeMode: "cover" // works only here!
            }}
          >
            <Header transparent>
              <Left>
                <Button
                  transparent
                  onPress={() => this.props.navigation.toggleDrawer()}
                >
                  <Icon name="bars" size={25} color="#ffffff" />
                </Button>
              </Left>
              <Body style={{ flex: 0, alignItems: "center" }}>
                <Title
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.titleUserName}
                >
                  My Money
                </Title>
              </Body>
              <Right>
                <Button
                  transparent
                  onPress={() =>
                    this.props.navigation.push("NotificationScreen")
                  }
                >
                  <Icon name="bell" size={15} color="#ffffff" />
                </Button>
                <Button transparent onPress={this.click_openPopupAccountType}>
                  <Icon name="plus" size={25} color="#ffffff" />
                </Button>
              </Right>
            </Header>

            <View style={styles.sliderView}>
              <Carousel
                ref={c => {
                  this._carousel = c;
                }}
                data={this.state.accountTypeList}
                renderItem={this._renderItem.bind(this)}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth}
                onSnapToItem={index => this.getSwapCardDetails(index)}
              />
              {renderIf(!this.state.isLoading)(
                <Pagination
                  dotsLength={this.state.accountTypeList.length}
                  activeDotIndex={slider1ActiveSlide}
                  containerStyle={styles.paginationContainer}
                  dotColor={"rgba(255, 255, 255, 0.92)"}
                  dotStyle={styles.paginationDot}
                  inactiveDotColor={colors.black}
                  inactiveDotOpacity={0.4}
                  inactiveDotScale={0.6}
                  carouselRef={this._slider1Ref}
                  tappableDots={!!this._slider1Ref}
                />
              )}

              {renderIf(this.state.isLoading)(
                <View style={styles.loading}>
                  <SkypeIndicator color={colors.white} />
                </View>
              )}
            </View>
            <View style={styles.viewMainRecentTran}>
              <ViewRecentTransaction
                data={this.state.recentTransactionData}
                openRecentTrans={(val: any) => this.openRecentTrans(val)}
              />
            </View>
          </ImageBackground>
        </Content>
        <SCLAlertAccountTypes
          status={this.state.accountTypeVisible}
          onRequestClose={() => this.setState({ accountTypeVisible: false })}
          data={this.state.popupData}
          onPress={(val: string) => this.createNewAccount(val)}
        />

        <DropdownAlert ref={ref => (this.dropdown = ref)} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    width: "100%"
  },
  titleUserName: {
    color: "#ffffff"
  },
  sliderView: {
    flex: 2,
    paddingTop: Platform.OS === "ios" ? 20 : 0
  },
  slideMainCard: {
    marginTop: 5,
    flex: 9
  },
  rkCard: {
    height: "100%",
    width: "100%",
    alignSelf: "center",
    borderRadius: 12
  },
  rkCardUnnown: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    alignSelf: "center",
    borderRadius: 12,
    backgroundColor: "#787878"
  },
  Savings: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.Saving,
    borderRadius: 10
  },
  Secure: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.Secure,
    borderRadius: 10
  },
  Vault: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.Vault,
    borderRadius: 10
  },
  Joint: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.Joint,
    borderRadius: 10
  },
  //TODO: swip card:Body or Content
  cardHeader: {
    flex: 5,
    justifyContent: "center",
    flexDirection: "column"
  },
  cardText: {
    color: "#ffffff"
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold"
  },
  cardAmount: {
    fontWeight: "bold",
    fontSize: 30
  },
  paginationContainer: {
    marginBottom: -10
  },
  //TODO: swip card:fotter
  cardFotter: {
    flex: 2,
    alignItems: "flex-end",
    marginRight: 20
  },
  //Amount Infomation
  viewAmountInfo: {
    flex: 1,
    paddingLeft: 50
  },
  viewAmountSingleLine: {
    flexDirection: "row"
  },
  txtAmountTitle: {
    color: "#000000"
  },
  txtAmount: {
    fontWeight: "bold"
  },
  //Recent Transaction
  viewMainRecentTran: {
    flex: 2.8
  },
  viewTitleRecentTrans: {
    marginLeft: 20,
    flexDirection: "row",
    flex: 0.2
  },
  //Loading
  loading: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    alignContent: "center"
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
  //TODO:sty Dialog:Account Type Popup Account
  dialogAccountType: {
    backgroundColor: "transparent"
  },
  dialogContainerAccountType: {
    backgroundColor: colors.white
  },
  accountTypePopUP: {
    marginTop: -40,
    paddingTop: 40,
    borderRadius: 5,
    padding: 20,
    justifyContent: "center",
    backgroundColor: colors.white,
    zIndex: 1
  },
  iconPopUP: {
    alignSelf: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 1
  },
  viewPopUpAccountType: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  btnPopupAccountAddIcon: {
    height: 60,
    width: 60,
    borderRadius: 30,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.appColor
  },
  //Account list
  viewPopUpAccountList: {
    alignItems: "center"
  },
  btnGroupAccountTypes: {
    flexDirection: "column"
  },
  btnAccountTypes: {
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#539F01"
  },
  popupButtonIcon: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginHorizontal: 10
  },
  popupBtnAccountInfo: {
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "space-between"
  },
  txtAccountBtnInfo: {
    fontSize: 14,
    color: "gray"
  },
  btnPopUPConfigure: {
    backgroundColor: colors.appColor,
    color: "#ffffff",
    borderRadius: 5,
    marginBottom: 20,
    marginLeft: 5,
    marginRight: 5,
    height: 50
  }
});
