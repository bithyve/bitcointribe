import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ImageBackground,
  FlatList,
  Platform,
  RefreshControl
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CommonStyles from "../../common/Styles";
import ToggleSwitch from "../../components/ToggleSwitch";
import Carousel, { getInputRangeFromIndexes } from "react-native-snap-carousel";
import BottomSheet from "reanimated-bottom-sheet";
import DeviceInfo from "react-native-device-info";
import TransparentHeaderModal from "../../components/TransparentHeaderModal";
import SendModalContents from "../../components/SendModalContents";
import CustodianRequestOtpModalContents from "../../components/CustodianRequestOtpModalContents";
import SendStatusModalContents from "../../components/SendStatusModalContents";
import { useDispatch, useSelector } from "react-redux";
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT
} from "../../common/constants/serviceTypes";
import CopyThisText from "../../components/CopyThisText";
import BottomInfoBox from "../../components/BottomInfoBox";
import { fetchBalance, fetchTransactions } from "../../store/actions/accounts";
import { ScrollView } from "react-native-gesture-handler";

export default function Accounts(props) {
  const sliderWidth = Dimensions.get("window").width;
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const [SendBottomSheet, setSendBottomSheet] = useState(React.createRef());
  const [ReceiveBottomSheet, setReceiveBottomSheet] = useState(
    React.createRef()
  );
  const [
    CustodianRequestOtpBottomSheet,
    setCustodianRequestOtpBottomSheet
  ] = useState(React.createRef());
  const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
    React.createRef()
  );
  const [SendErrorBottomSheet, setSendErrorBottomSheet] = useState(
    React.createRef()
  );
  const [transactionData, setTransactionData] = useState([
    {
      title: "Spending accounts",
      date: "30 November 2019",
      time: "11:00 am",
      price: "0.025",
      transactionStatus: "send"
    },
    {
      title: "Spending accounts",
      date: "1 November 2019",
      time: "11:00 am",
      price: "0.015",
      transactionStatus: "receive"
    },
    {
      title: "Spending accounts",
      date: "30 Jully 2019",
      time: "10:00 am",
      price: "0.125",
      transactionStatus: "receive"
    },
    {
      title: "Saving accounts",
      date: "1 June 2019",
      time: "12:00 am",
      price: "0.5",
      transactionStatus: "receive"
    },
    {
      title: "Saving accounts",
      date: "11 May 2019",
      time: "1:00 pm",
      price: "0.1",
      transactionStatus: "send"
    },
    {
      title: "Spending accounts",
      date: "30 November 2019",
      time: "11:00 am",
      price: "0.025",
      transactionStatus: "send"
    },
    {
      title: "Spending accounts",
      date: "1 November 2019",
      time: "11:00 am",
      price: "0.015",
      transactionStatus: "receive"
    },
    {
      title: "Spending accounts",
      date: "30 Jully 2019",
      time: "10:00 am",
      price: "0.125",
      transactionStatus: "receive"
    },
    {
      title: "Saving accounts",
      date: "1 June 2019",
      time: "12:00 am",
      price: "0.5",
      transactionStatus: "receive"
    },
    {
      title: "Saving accounts",
      date: "12 May 2019",
      time: "1:00 pm",
      price: "0.1",
      transactionStatus: "send"
    }
  ]);
  const [carouselData, setCarouselData] = useState([
    {
      accountType: "Test Account",
      accountInfo: "Pam’s Test Account",
      backgroundImage: require("../../assets/images/carouselImages/test_account_background.png"),
      accountTypeImage: require("../../assets/images/icons/icon_test_white.png")
    },
    {
      accountType: "Regular Account",
      accountInfo: "Fast and easy",
      backgroundImage: require("../../assets/images/carouselImages/regular_account_background.png"),
      accountTypeImage: require("../../assets/images/icons/icon_regular_account.png")
    },
    {
      accountType: "Savings account",
      accountInfo: "Multi-factor security",
      backgroundImage: require("../../assets/images/carouselImages/savings_account_background.png"),
      accountTypeImage: require("../../assets/images/icons/icon_secureaccount_white.png")
    }
  ]);

  const [carouselInitIndex, setCarouselInitIndex] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);
  const [carousel, setCarousel] = useState(React.createRef());

  const renderSendContents = () => {
    return (
      <SendModalContents
        onPressBack={() => {
          (SendBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={() => {
          (SendBottomSheet as any).current.snapTo(0);
          (CustodianRequestOtpBottomSheet as any).current.snapTo(1);
        }}
        modalRef={SendBottomSheet}
      />
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <ImageBackground
        source={item.backgroundImage}
        imageStyle={{
          height: hp("20%"),
          borderRadius: 10
        }}
        style={{
          height: hp("20%"),
          borderRadius: 10,
          margin: 5,
          padding: hp("2%"),
          elevation: 5,
          shadowColor:
            index == 0
              ? Colors.blue
              : index == 1
              ? Colors.yellow
              : index == 2
              ? Colors.green
              : Colors.borderColor,
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 7 },
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <View style={{ justifyContent: "space-between" }}>
          <Image
            source={item.accountTypeImage}
            style={{
              width: wp("15%"),
              height: wp("15%"),
              resizeMode: "contain"
            }}
          />
          <View style={{}}>
            <Text
              style={{
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(15, 812),
                color: Colors.white
              }}
            >
              {item.accountType}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12, 812),
                color: Colors.white
              }}
            >
              {item.accountInfo}
            </Text>
          </View>
        </View>

        <View style={{ justifyContent: "space-between" }}>
          <Image
            style={{
              marginLeft: "auto",
              width: wp("5%"),
              height: wp("5%"),
              resizeMode: "contain"
            }}
            source={require("../../assets/images/icons/icon_settings.png")}
          />
          {item.accountType == "Savings account" && (
            <Text
              style={{
                marginLeft: "auto",
                fontFamily: Fonts.FiraSansMedium,
                fontSize: RFValue(15, 812),
                color: Colors.white,
                alignSelf: "center"
              }}
            >
              2FA
            </Text>
          )}
          <View style={{ flexDirection: "row" }}>
            <Image
              style={styles.cardBitCoinImage}
              source={require("../../assets/images/icons/icon_bitcoin_light.png")}
            />
            <Text style={styles.cardAmountText}>{netBalance}</Text>
            <Text style={styles.cardAmountUnitText}>sat</Text>
          </View>
        </View>
      </ImageBackground>
    );
  };
  const scrollInterpolator = (index, carouselProps) => {
    const range = [1, 0, -1];
    const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
    const outputRange = range;
    return { inputRange, outputRange };
  };

  const slideInterpolatedStyle = (index, animatedValue, carouselProps) => {
    return {
      opacity: animatedValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0.5, 1, 0.5],
        extrapolate: "clamp"
      }),
      transform: [
        {
          translateX: animatedValue.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [
              carouselProps.itemWidth / 100,
              0,
              -carouselProps.itemWidth / 100
            ],
            extrapolate: "clamp"
          }),
          scale: animatedValue.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [1, 1, 1]
          })
        }
      ]
    };
  };

  const renderTransactionsContent = () => {
    return (
      <View style={styles.modalContentContainer}>
        <View style={{ marginLeft: 20, marginTop: 20 }}>
          <Text style={styles.modalHeaderTitleText}>{"Transactions"}</Text>
        </View>
        <FlatList
          data={transactions.transactionDetails}
          ItemSeparatorComponent={() => (
            <View style={{ backgroundColor: Colors.white }}>
              <View style={styles.separatorView} />
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate("TransactionDetails", { item })
              }
              style={{
                ...styles.transactionModalElementView,
                backgroundColor: Colors.white
              }}
            >
              <View style={styles.modalElementInfoView}>
                <View style={{ justifyContent: "center" }}>
                  <FontAwesome
                    name={
                      item.transactionType == "Received"
                        ? "long-arrow-down"
                        : "long-arrow-up"
                    }
                    size={15}
                    color={
                      item.transactionType == "Received"
                        ? Colors.green
                        : Colors.red
                    }
                  />
                </View>
                <View style={{ justifyContent: "center", marginLeft: 10 }}>
                  <Text style={styles.transactionModalTitleText}>
                    {item.accountType}{" "}
                  </Text>
                  <Text style={styles.transactionModalDateText}>
                    {item.date}{" "}
                    {/* <Entypo
                      size={10}
                      name={"dot-single"}
                      color={Colors.textColorGrey}
                    />
                    {item.time} */}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionModalAmountView}>
                <Image
                  source={require("../../assets/images/icons/icon_bitcoin_gray.png")}
                  style={{ width: 12, height: 12, resizeMode: "contain" }}
                />
                <Text
                  style={{
                    ...styles.transactionModalAmountText,
                    color:
                      item.transactionType == "Received"
                        ? Colors.green
                        : Colors.red
                  }}
                >
                  {item.amount}
                </Text>
                <Text style={styles.transactionModalAmountUnitText}>
                  {item.confirmations < 6 ? item.confirmations : "6+"}
                </Text>
                <Ionicons
                  name="ios-arrow-forward"
                  color={Colors.textColorGrey}
                  size={12}
                  style={{ marginLeft: 20, alignSelf: "center" }}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderTransactionsHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (bottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderSendModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (SendBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSendOtpModalContents = () => {
    return (
      <CustodianRequestOtpModalContents
        title1stLine={"Enter OTP to"}
        title2ndLine={"authenticate"}
        info1stLine={"Lorem ipsum dolor sit amet, consectetur"}
        info2ndLine={"adipiscing elit, sed do eiusmod tempor"}
        subInfo1stLine={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit,"
        }
        subInfo2ndLine={"sed do eiusmod tempor incididunt ut labore et dolore"}
        modalRef={CustodianRequestOtpBottomSheet}
        onPressConfirm={() => {
          (CustodianRequestOtpBottomSheet as any).current.snapTo(0);
          (SendSuccessBottomSheet as any).current.snapTo(1);
        }}
      />
    );
  };
  const renderSendOTPModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (CustodianRequestOtpBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSuccessStatusContents = () => {
    return (
      <SendStatusModalContents
        title1stLine={"Sent Successfully"}
        title2ndLine={"to Contact"}
        info1stLine={"Bitcoins successfully sent to Contact"}
        info2ndLine={""}
        userName={"Arpan Jain"}
        modalRef={SendSuccessBottomSheet}
        isSuccess={true}
        onPressViewAccount={() => {
          (SendSuccessBottomSheet as any).current.snapTo(0);
        }}
        transactionId={"38123819421304"}
        transactionDateTime={"11:00am, 19 June 2019"}
      />
    );
  };
  const renderSendSuccessHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (SendSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSendErrorContents = () => {
    return (
      <SendStatusModalContents
        title1stLine={"Could not Send "}
        title2ndLine={"Amount to Contact"}
        info1stLine={"There seems to be a problem"}
        info2ndLine={""}
        subInfo1stLine={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        }
        subInfo2ndLine={"sed do eiusmod tempor incididunt ut labore et dolore"}
        userName={"Arpan Jain"}
        modalRef={SendErrorBottomSheet}
        isSuccess={false}
        onPressTryAgain={() => {
          (SendErrorBottomSheet as any).current.snapTo(0);
        }}
        onPressSkip={() => {
          (SendErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderSendErrorHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (SendErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // useEffect(() => {
  //(SendErrorBottomSheet as any).current.snapTo(1);
  // (SendBottomSheet as any).current.snapTo(1)
  // }, []);

  const [serviceType, setServiceType] = useState(
    props.navigation.getParam("serviceType")
  );
  const { loading, service } = useSelector(
    state => state.accounts[serviceType]
  );

  const { balances, transactions } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
  const netBalance = service
    ? balances.balance + balances.unconfirmedBalance
    : 0;

  const dispatch = useDispatch();
  useEffect(() => {
    if (!netBalance) dispatch(fetchBalance(serviceType));
  }, [serviceType]);

  useEffect(() => {
    if (!transactions.totalTransactions)
      dispatch(fetchTransactions(serviceType));
  }, [serviceType]);

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        backgroundColor: Colors.backgroundColor
      }}
      refreshControl={
        <RefreshControl
          refreshing={loading.transactions || loading.balances}
          onRefresh={() => {
            dispatch(fetchBalance(serviceType));
            dispatch(fetchTransactions(serviceType));
          }}
        />
      }
    >
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar />
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <View
          style={{
            ...CommonStyles.headerContainer,
            justifyContent: "space-between",
            backgroundColor: Colors.backgroundColor,
            borderBottomWidth: 0
          }}
        >
          <TouchableOpacity
            style={{ ...CommonStyles.headerLeftIconContainer }}
            onPress={() => {
              props.navigation.navigate("Home");
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(20, 812),
              fontFamily: Fonts.FiraSansRegular,
              textAlign: "center"
            }}
          >
            Accounts
          </Text>
          <TouchableOpacity
            style={{ height: 54, justifyContent: "center" }}
            onPress={() => {}}
          >
            <View
              style={{
                ...CommonStyles.headerLeftIconInnerContainer,
                paddingRight: 30
              }}
            >
              <ToggleSwitch
                activeOnImage={require("../../assets/images/icons/icon_bitcoin_light.png")}
                inactiveOnImage={require("../../assets/images/icons/icon_bitcoin_dark.png")}
                activeOffImage={require("../../assets/images/icons/icon_dollar_white.png")}
                inactiveOffImage={require("../../assets/images/icons/icon_dollar_dark.png")}
                toggleColor={Colors.lightBlue}
                toggleCircleColor={Colors.blue}
                onpress={() => {
                  setSwitchOn(!switchOn);
                }}
                toggle={switchOn}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ paddingTop: hp("3%"), paddingBottom: hp("3%") }}>
          <Carousel
            ref={carousel}
            data={carouselData}
            initialNumToRender={carouselInitIndex}
            renderItem={renderItem}
            sliderWidth={sliderWidth}
            itemWidth={sliderWidth * 0.95}
            onSnapToItem={index => {
              setCarouselInitIndex(index);
              index === 0
                ? setServiceType(TEST_ACCOUNT)
                : index === 1
                ? setServiceType(REGULAR_ACCOUNT)
                : setServiceType(SECURE_ACCOUNT);
            }}
            style={{ activeSlideAlignment: "center" }}
            scrollInterpolator={scrollInterpolator}
            slideInterpolatedStyle={slideInterpolatedStyle}
            useScrollView={true}
            extraData={carouselData}
          />
        </View>
        <View>
          <View
            style={{
              backgroundColor: Colors.backgroundColor,
              flexDirection: "row",
              marginLeft: 20,
              marginRight: 20,
              marginBottom: hp("2%")
            }}
          >
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(13, 812),
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              Today
            </Text>
            <Text
              onPress={() => {
                (bottomSheet as any).current.snapTo(1);
              }}
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12, 812),
                fontFamily: Fonts.FiraSansItalic,
                textDecorationLine: "underline",
                marginLeft: "auto"
              }}
            >
              View More
            </Text>
          </View>
          <View>
            <FlatList
              data={transactions.transactionDetails.slice(0, 3)}
              ItemSeparatorComponent={() => (
                <View style={{ backgroundColor: Colors.backgroundColor }}>
                  <View style={styles.separatorView} />
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate("TransactionDetails", { item })
                  }
                  style={styles.transactionModalElementView}
                >
                  <View style={styles.modalElementInfoView}>
                    <View style={{ justifyContent: "center" }}>
                      <FontAwesome
                        name={
                          item.transactionType == "Received"
                            ? "long-arrow-down"
                            : "long-arrow-up"
                        }
                        size={15}
                        color={
                          item.transactionType == "Received"
                            ? Colors.green
                            : Colors.red
                        }
                      />
                    </View>
                    <View style={{ justifyContent: "center", marginLeft: 10 }}>
                      <Text style={styles.transactionModalTitleText}>
                        {item.accountType}{" "}
                      </Text>
                      <Text style={styles.transactionModalDateText}>
                        {item.date}{" "}
                        {/* <Entypo
                          size={10}
                          name={"dot-single"}
                          color={Colors.textColorGrey}
                        /> */}
                        {/* {item.time} */}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionModalAmountView}>
                    <Image
                      source={require("../../assets/images/icons/icon_bitcoin_gray.png")}
                      style={{ width: 12, height: 12, resizeMode: "contain" }}
                    />
                    <Text
                      style={{
                        ...styles.transactionModalAmountText,
                        color:
                          item.transactionType == "Received"
                            ? Colors.green
                            : Colors.red
                      }}
                    >
                      {item.amount}
                    </Text>
                    <Text style={styles.transactionModalAmountUnitText}>
                      {item.confirmations < 6 ? item.confirmations : "6+"}
                    </Text>
                    <Ionicons
                      name="ios-arrow-forward"
                      color={Colors.textColorGrey}
                      size={12}
                      style={{ marginLeft: 20, alignSelf: "center" }}
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        <View style={{ marginTop: hp("2%") }}>
          <View
            style={{ flexDirection: "row", marginLeft: 10, marginRight: 10 }}
          >
            <TouchableOpacity
              onPress={() => props.navigation.navigate("Send", { serviceType })}
              style={styles.bottomCardView}
            >
              <Image
                source={require("../../assets/images/icons/icon_send.png")}
                style={styles.bottomCardSendReceiveImage}
              />
              <View style={{ marginLeft: wp("3%") }}>
                <Text style={styles.bottomCardTitleText}>Send</Text>
                <Text style={styles.bottomCardInfoText}>
                  Tran Fee : 0.032 (sats)
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("ReceivingAddress", { serviceType });
              }}
              style={styles.bottomCardView}
            >
              <Image
                source={require("../../assets/images/icons/icon_recieve.png")}
                style={styles.bottomCardSendReceiveImage}
              />
              <View style={{ marginLeft: wp("3%") }}>
                <Text style={styles.bottomCardTitleText}>Receive</Text>
                <Text style={styles.bottomCardInfoText}>
                  Tran Fee : 0.032 (sats)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{ flexDirection: "row", marginLeft: 10, marginRight: 10 }}
          >
            <TouchableOpacity style={styles.bottomCardView}>
              <Image
                source={require("../../assets/images/icons/icon_buy.png")}
                style={styles.bottomCardImage}
              />
              <View style={{ marginLeft: wp("3%") }}>
                <Text style={styles.bottomCardTitleText}>Buy</Text>
                <Text style={styles.bottomCardInfoText}>
                  Ex Rate : 0.032 (sats)
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomCardView}>
              <Image
                source={require("../../assets/images/icons/icon_sell.png")}
                style={styles.bottomCardImage}
              />
              <View style={{ marginLeft: wp("3%") }}>
                <Text style={styles.bottomCardTitleText}>Sell</Text>
                <Text style={styles.bottomCardInfoText}>
                  Ex Rate : 0.032 (sats)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={bottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("60%") : hp("60%")
        ]}
        renderContent={renderTransactionsContent}
        renderHeader={renderTransactionsHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendBottomSheet}
        snapPoints={[
          -50,
          hp("90%"),
          Platform.OS == "android" ? hp("50%") : hp("90%")
        ]}
        renderContent={renderSendContents}
        renderHeader={renderSendModalHeader}
      />
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={ReceiveBottomSheet}
        snapPoints={[-50, hp("90%")]}
        renderContent={renderReceivingAddrContents}
        renderHeader={renderReceivingAddrHeader}
      /> */}

      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={CustodianRequestOtpBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("67%") : hp("60%"),
          Platform.OS == "ios" ? hp("80%") : hp("70%")
        ]}
        renderContent={renderSendOtpModalContents}
        renderHeader={renderSendOTPModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendSuccessBottomSheet}
        snapPoints={[-50, hp("60%")]}
        renderContent={renderSuccessStatusContents}
        renderHeader={renderSendSuccessHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendErrorBottomSheet}
        snapPoints={[-50, hp("60%")]}
        renderContent={renderSendErrorContents}
        renderHeader={renderSendErrorHeader}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardBitCoinImage: {
    width: wp("3%"),
    height: wp("3%"),
    marginRight: 5,
    marginTop: "auto",
    marginBottom: wp("1.2%"),
    resizeMode: "contain"
  },
  cardAmountText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(21, 812),
    marginRight: 5
  },
  cardAmountUnitText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13, 812),
    marginBottom: 2,
    marginTop: "auto"
  },
  transactionModalElementView: {
    backgroundColor: Colors.backgroundColor,
    padding: hp("1%"),
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between"
  },
  modalElementInfoView: {
    padding: hp("1%"),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  transactionModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(12, 812),
    marginBottom: 3,
    fontFamily: Fonts.FiraSansRegular
  },
  transactionModalDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  transactionModalAmountView: {
    padding: 10,
    flexDirection: "row",
    display: "flex",
    alignItems: "center"
  },
  transactionModalAmountText: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: RFValue(20, 812),
    fontFamily: Fonts.OpenSans
  },
  transactionModalAmountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10, 812),
    fontFamily: Fonts.OpenSans
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 1,
    backgroundColor: Colors.borderColor
  },
  bottomCardView: {
    flex: 1,
    margin: 5,
    height: hp("8%"),
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
    flexDirection: "row",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  bottomCardImage: {
    width: wp("10%"),
    height: wp("10%"),
    resizeMode: "contain"
  },
  bottomCardSendReceiveImage: {
    width: wp("7%"),
    height: wp("7%"),
    resizeMode: "contain"
  },
  bottomCardInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(9, 812)
  },
  bottomCardTitleText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(15, 812)
  },
  modalContentContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansRegular
    // marginLeft: 15
  },
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: "contain",
    marginLeft: "auto"
  },
  modalContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.borderColor,
    alignSelf: "center",
    width: "100%"
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 15
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12, 812),
    marginTop: 5
  },
  modalContentView: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 7
  },
  modalHeaderContainer: {
    paddingTop: 20
  }
});
