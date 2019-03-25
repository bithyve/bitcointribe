import React from "react";
import {
  View,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  SafeAreaView
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
import Icon from "react-native-vector-icons/FontAwesome";
import { SkypeIndicator } from "react-native-indicators";
import DropdownAlert from "react-native-dropdownalert";
import Loader from "react-native-modal-loader";

//Custome Compontes
import SCLAlertAccountTypes from "bithyve/src/app/custcompontes/alert/SCLAlertAccountTypes";
import ViewRecentTransaction from "bithyve/src/app/custcompontes/view/ViewRecentTransaction";
import TabBarWalletScreen from "bithyve/src/app/custcompontes/view/tabbar/TabBarWalletScreen/TabBarWalletScreen";
import ViewWalletScreenCards from "bithyve/src/app/custcompontes/view/ViewWalletScreenCards/ViewWalletScreenCards";

//TODO: Custome object
import {
  colors,
  images,
  localDB,
  errorMessage
} from "bithyve/src/app/constants/Constants";
var dbOpration = require("bithyve/src/app/manager/database/DBOpration");
var utils = require("bithyve/src/app/constants/Utils");
import renderIf from "bithyve/src/app/constants/validation/renderIf";
import Singleton from "bithyve/src/app/constants/Singleton";

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
import RegularAccount from "bithyve/src/bitcoin/services/RegularAccount";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";
export default class WalletScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      isNetwork: true,
      tranDetails: [],
      accountTypeList: [],
      arr_WalletScreenCard: [],
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
    isNetwork = utils.getNetwork();
  }

  //TODO: Page Life Cycle
  componentDidMount() {
    try {
      this.willFocusSubscription = this.props.navigation.addListener(
        "willFocus",
        () => {
          this.connnection_FetchData();
        }
      );
      console.log(utils.getDeviceModel());
    } catch (e) {
      console.log({ e });
    }
  }

  //TODO: func connnection_FetchData
  async connnection_FetchData() {
    try {
      let isLoading1: boolean = true;
      let isNoTranstion: boolean = false;
      let tranDetails: [] = [];
      let arr_AccountCardList: [] = [];
      let title: string = "";
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
      if (
        isNetwork &&
        this.state.cardIndexNo != resultAccount.temp.length - 1
      ) {
        title =
          resultAccount.temp[this.state.cardIndexNo].accountType +
          " Recent Transactions";

        const bal = await RegularAccount.getBalance(
          resultAccount.temp[this.state.cardIndexNo].address
        );

        var transation: [] = [];
        var flag_noTrasation: boolean;

        console.log({ bal });
        if (bal.statusCode == 200) {
          console.log("bal code 200");
          console.log(resultAccount.temp[this.state.cardIndexNo].address);
          var resultRecentTras = await RegularAccount.getTransactions(
            resultAccount.temp[this.state.cardIndexNo].address
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
                console.log({ transation });
                tranDetails = transation;
                isNoTranstion = flag_noTrasation;
              }
            } else {
              isNoTranstion = true;
              tranDetails = [];
            }
            const resultUpdateTblAccount = await dbOpration.updateTableData(
              localDB.tableName.tblAccount,
              bal.balanceData.final_balance / 1e8,
              resultAccount.temp[0].address,
              lastUpdateDate
            );
            if (resultUpdateTblAccount) {
              resultAccount = await dbOpration.readAccountTablesData(
                localDB.tableName.tblAccount
              );
              if (resultAccount.temp.length > 0) {
                isLoading1 = false;
                arr_AccountCardList = resultAccount.temp;
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
              resultRecentTras.errorMessage.error
            );
            this.setState({
              isLoading: false
            });
          }
        } else {
          this.dropdown.alertWithType("error", "OH", bal.errorMessage.error);
          this.setState({
            isLoading: false
          });
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
        console.log({ transation });
        tranDetails = transation;
        isNoTranstion = flag_noTrasation;
        isLoading1 = false;
        arr_AccountCardList = resultAccount.temp;
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
        arr_WalletScreenCard: [
          {
            accountTypeList: arr_AccountCardList,
            recentTransaction: [
              {
                title,
                isLoading1,
                isNoTranstion,
                tranDetails
              }
            ],
            isLoading: false
          }
        ]
      });
    } catch (e) {
      console.log({ e });
    }
  }

  //TODO: func openRecentTrans
  openRecentTrans(item: any) {
    console.log({ item });
    try {
      this.props.navigation.navigate("RecentTransactionsScreen", {
        transationDetails: item
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.container}>
          <StatusBar
            backgroundColor={colors.appColor}
            barStyle="dark-content"
          />
          <SafeAreaView style={styles.container}>
            {/* title */}
            <View
              style={{
                flex: 0.4,
                marginTop: 20,
                margin: 20
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    flex: 1,
                    color: "#ffffff",
                    fontSize: 34,
                    fontWeight: "bold"
                  }}
                >
                  Hexa
                </Text>
                <View
                  style={{
                    flex: 1,
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    alignSelf: "flex-end"
                  }}
                >
                  <Button
                    transparent
                    style={{
                      flex: 1,
                      backgroundColor: "#ffffff",
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      alignSelf: "flex-end",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Icon name="bell" size={15} color={colors.appColor} />
                  </Button>
                </View>
              </View>
            </View>

            {/* notificaiton box  */}
            <View
              style={[
                utils.getDeviceModel() == "IphoneX"
                  ? { flex: 0.8 }
                  : { flex: 1 },
                {
                  backgroundColor: "#8BC5E7",
                  justifyContent: "center",
                  margin: 20,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center"
                }
              ]}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  flex: 0.2,
                  height: 48,
                  width: 48,
                  borderRadius: 29,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 5
                }}
              >
                <Icon name="exclamation" size={15} color="red" />
              </View>
              <View style={{ flex: 1, marginLeft: 5, marginRight: 5 }}>
                <Text>
                  You haven't confirmed your passpharase last confiramtion was
                  15 days ago.
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#fff",
                  flex: 0.12,
                  height: 30,
                  width: 30,
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 5
                }}
              >
                <Icon name="close" size={10} color={colors.appColor} />
              </View>
            </View>
            {/*  cards */}
            <View style={{ flex: 5 }}>
              <ViewWalletScreenCards
                data={this.state.arr_WalletScreenCard}
                click_Details={(screen: string, item: any, index: any) =>
                  this.props.navigation.push(screen, {
                    data: item,
                    walletsData: this.state.walletsData,
                    indexNo: index
                  })
                }
                click_OpenRecentTrans={(val: any) => this.openRecentTrans(val)}
              />
            </View>
            {/*  tabbar bottom */}
            <View
              style={
                utils.getDeviceModel() == "IphoneX"
                  ? { flex: 0.9 }
                  : { flex: 1.1 }
              }
            >
              <TabBarWalletScreen />
            </View>
          </SafeAreaView>
        </Content>
        <Loader loading={this.state.isLoading} color={colors.appColor} />
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appColor
  },
  backgroundImage: {
    flex: 1,
    width: "100%"
  }
});
