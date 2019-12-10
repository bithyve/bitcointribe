import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  ImageBackground,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Alert
} from "react-native";
import { useSelector } from "react-redux";
import CardView from "react-native-cardview";
import Fonts from "./../common/Fonts";
import BottomSheet from "reanimated-bottom-sheet";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../common/Colors";
import DeviceInfo from "react-native-device-info";
import ToggleSwitch from "../components/ToggleSwitch";
import Entypo from "react-native-vector-icons/Entypo";
import { RFValue } from "react-native-responsive-fontsize";
import CommonStyles from "../common/Styles";
import NoInternetModalContents from "../components/NoInternetModalContents";
import TransparentHeaderModal from "../components/TransparentHeaderModal";
import CustodianRequestModalContents from "../components/CustodianRequestModalContents";
import CustodianRequestRejectedModalContents from "../components/CustodianRequestRejectedModalContents";
import CustodianRequestOtpModalContents from "../components/CustodianRequestOtpModalContents";
import MoreHomePageTabContents from "../components/MoreHomePageTabContents";
import SmallHeaderModal from "../components/SmallHeaderModal";
import AddressBookContents from "../components/AddressBookContents";
import CustodianRequestAcceptModalContents from "../components/CustodianRequestAcceptModalContents";
import HomePageShield from "../components/HomePageShield";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export default function Home(props) {
  const [tabBarZIndex, setTabBarZIndex] = useState(999);
  const [switchOn, setSwitchOn] = useState(true);
  const [data, setData] = useState([
    [
      {
        title: "Test Account",
        unit: "tsats",
        amount: "400,000",
        account: "Murtuza’s Test Account",
        accountType: "test",
        bitcoinicon: require("../assets/images/icons/icon_bitcoin_test.png")
      },
      {
        title: "Test Account",
        unit: "sats",
        amount: "2,000,000",
        account: "Multi-factor security",
        accountType: "secure",
        bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png")
      }
    ],
    [
      {
        title: "Regular Account",
        unit: "sats",
        amount: "5,000",
        account: "Fast and easy",
        accountType: "saving",
        bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png")
      },
      {
        title: "Saving Account",
        unit: "sats",
        amount: "60,000",
        account: "Fast and easy",
        accountType: "saving",
        bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png")
      }
    ],
    [
      {
        title: "Regular Account",
        unit: "sats",
        amount: "5,000",
        account: "Murtuza’s Test Account",
        accountType: "regular",
        bitcoinicon: require("../assets/images/icons/icon_bitcoin_gray.png")
      }
    ]
  ]);
  const [selected, setSelected] = useState("Transactions");
  const [addressBookBottomSheet, setAddressBookBottomSheet] = useState(
    React.createRef()
  );
  const [MoreTabBottomSheet, setMoreTabBottomSheet] = useState(
    React.createRef()
  );
  const [NoInternetBottomSheet, setNoInternetBottomSheet] = useState(
    React.createRef()
  );
  const [
    CustodianRequestBottomSheet,
    setCustodianRequestBottomSheet
  ] = useState(React.createRef());
  const [
    CustodianRequestOtpBottomSheet,
    setCustodianRequestOtpBottomSheet
  ] = useState(React.createRef());
  const [
    CustodianRequestRejectedBottomSheet,
    setCustodianRequestRejectedBottomSheet
  ] = useState(React.createRef());
  const [
    CustodianRequestAcceptBottomSheet,
    setCustodianRequestAcceptBottomSheet
  ] = useState(React.createRef());
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
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
  const [addData, setAddData] = useState([
    {
      title: "Getbittr",
      image: require("../assets/images/icons/icon_getbitter.png"),
      info: "GetBittr gives you an easy way to stack sats"
    },
    {
      title: "Fastbitcoins",
      image: require("../assets/images/icons/icon_fastbicoin.png"),
      info: "The quickest way to buy bitcoins, from your local store"
    },
    {
      title: "Add Account",
      image: require("../assets/images/icons/icon_addaccount.png"),
      info: "Add an account to your wallet, Select from options"
    },
    {
      title: "Add Contact",
      image: require("../assets/images/icons/icon_addcontact.png"),
      info: "Add contacts from your address book"
    },
    {
      title: "Import Wallet",
      image: require("../assets/images/icons/icon_importwallet.png"),
      info: "Import a non-Hexa wallet as an account"
    },
    {
      title: "Add Account",
      image: require("../assets/images/icons/icon_addaccount.png"),
      info: "Add an account to your wallet, Select from options"
    },
    {
      title: "Add Contact",
      image: require("../assets/images/icons/icon_addcontact.png"),
      info: "Add contacts from your address book"
    },
    {
      title: "Import Wallet",
      image: require("../assets/images/icons/icon_importwallet.png"),
      info: "Import a non-Hexa wallet as an account"
    },
    {
      title: "Add Account",
      image: require("../assets/images/icons/icon_addaccount.png"),
      info: "Add an account to your wallet, Select from options"
    },
    {
      title: "Add Contact",
      image: require("../assets/images/icons/icon_addcontact.png"),
      info: "Add contacts from your address book"
    },
    {
      title: "Import Wallet",
      image: require("../assets/images/icons/icon_importwallet.png"),
      info: "Import a non-Hexa wallet as an account"
    }
  ]);
  const [modaldata, setModaldata] = useState(transactionData);
  const [openmodal, setOpenmodal] = useState("closed");

  function getIconByAccountType(type) {
    if (type == "saving") {
      return require("../assets/images/icons/icon_regular.png");
    } else if (type == "regular") {
      return require("../assets/images/icons/icon_regular.png");
    } else if (type == "secure") {
      return require("../assets/images/icons/icon_secureaccount.png");
    } else if (type == "test") {
      return require("../assets/images/icons/icon_test.png");
    } else {
      return require("../assets/images/icons/icon_test.png");
    }
  }

  function renderContent() {
    if (selected == "Transactions") {
      return (
        <View style={styles.modalContentContainer}>
          <FlatList
            data={modaldata}
            ItemSeparatorComponent={() => (
              <View style={{ backgroundColor: Colors.white }}>
                <View style={styles.separatorView} />
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.transactionModalElementView}>
                <View style={styles.modalElementInfoView}>
                  <View style={{ justifyContent: "center" }}>
                    <FontAwesome
                      name={
                        item.transactionStatus == "receive"
                          ? "long-arrow-down"
                          : "long-arrow-up"
                      }
                      size={15}
                      color={
                        item.transactionStatus == "receive"
                          ? Colors.green
                          : Colors.red
                      }
                    />
                  </View>
                  <View style={{ justifyContent: "center", marginLeft: 10 }}>
                    <Text style={styles.transactionModalTitleText}>
                      {item.title}{" "}
                    </Text>
                    <Text style={styles.transactionModalDateText}>
                      {item.date}{" "}
                      <Entypo
                        size={10}
                        name={"dot-single"}
                        color={Colors.textColorGrey}
                      />
                      {item.time}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionModalAmountView}>
                  <Image
                    source={require("../assets/images/icons/icon_bitcoin_gray.png")}
                    style={{ width: 12, height: 12, resizeMode: "contain" }}
                  />
                  <Text
                    style={{
                      ...styles.transactionModalAmountText,
                      color:
                        item.transactionStatus == "receive"
                          ? Colors.green
                          : Colors.red
                    }}
                  >
                    {item.price}
                  </Text>
                  <Text style={styles.transactionModalAmountUnitText}>6+</Text>
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={12}
                    style={{ marginLeft: 20, alignSelf: "center" }}
                  />
                </View>
              </View>
            )}
          />
        </View>
      );
    } else if (selected == "Add") {
      return (
        <View style={styles.modalContentContainer}>
          <FlatList
            data={modaldata}
            ItemSeparatorComponent={() => (
              <View style={{ backgroundColor: Colors.white }}>
                <View style={styles.separatorView} />
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.addModalView}>
                <View style={styles.modalElementInfoView}>
                  <View style={{ justifyContent: "center" }}>
                    <Image
                      source={item.image}
                      style={{ width: 25, height: 25 }}
                    />
                  </View>
                  <View style={{ justifyContent: "center", marginLeft: 10 }}>
                    <Text style={styles.addModalTitleText}>{item.title} </Text>
                    <Text style={styles.addModalInfoText}>{item.info}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      );
    } else if (selected == "QR") {
      return (
        <View style={styles.modalContentContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS == "ios" ? "padding" : ""}
            enabled
          >
            <ScrollView style={styles.qrModalScrollView}>
              <View style={styles.qrModalImageNTextInputView}>
                <ImageBackground
                  source={require("../assets/images/icons/iPhone-QR.png")}
                  style={styles.qrModalImage}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      paddingTop: 10,
                      paddingRight: 5,
                      paddingLeft: 10,
                      width: "100%"
                    }}
                  >
                    <View
                      style={{
                        borderLeftWidth: 1,
                        borderTopColor: "white",
                        borderLeftColor: "white",
                        height: hp("5%"),
                        width: hp("5%"),
                        borderTopWidth: 1
                      }}
                    />
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderRightWidth: 1,
                        borderRightColor: "white",
                        borderTopColor: "white",
                        height: hp("5%"),
                        width: hp("5%"),
                        marginLeft: "auto"
                      }}
                    />
                  </View>
                  <View
                    style={{
                      marginTop: "auto",
                      flexDirection: "row",
                      paddingBottom: 5,
                      paddingRight: 5,
                      paddingLeft: 10,
                      width: "100%"
                    }}
                  >
                    <View
                      style={{
                        borderLeftWidth: 1,
                        borderBottomColor: "white",
                        borderLeftColor: "white",
                        height: hp("5%"),
                        width: hp("5%"),
                        borderBottomWidth: 1
                      }}
                    />
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        borderRightColor: "white",
                        borderBottomColor: "white",
                        height: hp("5%"),
                        width: hp("5%"),
                        marginLeft: "auto"
                      }}
                    />
                  </View>
                </ImageBackground>
                <TextInput
                  placeholder={"Enter Recipients Address"}
                  placeholderTextColor={Colors.borderColor}
                  style={styles.qrModalTextInput}
                />
              </View>
              <View style={styles.qrModalInfoView}>
                <View style={{ marginRight: 15 }}>
                  <Text style={styles.qrModalInfoTitleText}>Qr</Text>
                  <Text style={styles.qrModalInfoInfoText}>
                    Scan a QR code to send money or receive information from
                    another Hexa wallet
                  </Text>
                </View>
                <Ionicons
                  name="ios-arrow-forward"
                  color={Colors.textColorGrey}
                  size={15}
                  style={{ alignSelf: "center" }}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      );
    }
  }

  function renderHeader() {
    return (
      <TouchableOpacity
        disabled={selected == "More" ? true : false}
        activeOpacity={10}
        onPress={() => openCloseModal()}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>{selected}</Text>
      </TouchableOpacity>
    );
  }

  function openCloseModal() {
    if (openmodal == "closed") {
      setOpenmodal("half");
    }
    if (openmodal == "half") {
      setOpenmodal("full");
    }
    if (openmodal == "full") {
      setOpenmodal("closed");
    }
  }

  useEffect(() => {
    if (openmodal == "closed") {
      bottomSheet.current.snapTo(1);
    }
    if (openmodal == "half") {
      bottomSheet.current.snapTo(2);
    }
    if (openmodal == "full") {
      bottomSheet.current.snapTo(3);
    }
  }, [openmodal]);

  useEffect(() => {
    if (openmodal == "closed") {
      bottomSheet.current.snapTo(1);
    }
    if (openmodal == "half") {
      bottomSheet.current.snapTo(2);
    }
    if (openmodal == "full") {
      bottomSheet.current.snapTo(3);
    }
  }, []);

  async function selectTab(tabTitle) {
    if (tabTitle == "More") {
      setTimeout(() => {
        setSelected(tabTitle);
        setSelected(tabTitle);
      }, 10);
      bottomSheet.current.snapTo(0);
      MoreTabBottomSheet.current.snapTo(1);
    } else if (tabTitle == "Transactions") {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 10);
      bottomSheet.current.snapTo(1);
      MoreTabBottomSheet.current.snapTo(0);
    } else if (tabTitle == "Add") {
      setTimeout(() => {
        setModaldata(addData);
        setSelected(tabTitle);
      }, 10);
      bottomSheet.current.snapTo(1);
      MoreTabBottomSheet.current.snapTo(0);
    } else if (tabTitle == "QR") {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 10);
      bottomSheet.current.snapTo(1);
      MoreTabBottomSheet.current.snapTo(0);
    }
  }

  const renderNoInternetModalContent = () => {
    return (
      <NoInternetModalContents
        onPressTryAgain={() => {}}
        onPressIgnore={() => {}}
      />
    );
  };

  const renderCustodianRequestModalContent = () => {
    if (!custodyRequest) return <View></View>;
    return (
      <CustodianRequestModalContents
        userName={custodyRequest.requester}
        onPressAcceptSecret={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 10);
          CustodianRequestBottomSheet.current.snapTo(0);
          props.navigation.navigate("CustodianRequestOtp", { custodyRequest });
        }}
        onPressRejectSecret={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 10);
          CustodianRequestBottomSheet.current.snapTo(0);
          CustodianRequestRejectedBottomSheet.current.snapTo(1);
        }}
      />
    );
  };

  const renderCustodianRequestOtpModalContent = () => {
    if (!custodyRequest) return <View></View>;
    return (
      <CustodianRequestOtpModalContents
        custodyRequest={custodyRequest}
        modalRef={CustodianRequestOtpBottomSheet}
        downloadStatus={success => {
          setTabBarZIndex(0);
          CustodianRequestOtpBottomSheet.current.snapTo(0);
          if (success) CustodianRequestAcceptBottomSheet.current.snapTo(1);
        }}
      />
    );
  };

  const renderCustodianRequestRejectedModalContent = () => {
    if (!custodyRequest) return <View></View>;
    return (
      <CustodianRequestRejectedModalContents
        onPressViewThrustedContacts={() => {
          setTimeout(() => {
            setTabBarZIndex(9999);
          }, 10);
          CustodianRequestRejectedBottomSheet.current.snapTo(0);
        }}
        userName={custodyRequest.requester}
      />
    );
  };

  const renderCustodianRequestAcceptModalContent = () => {
    if (!custodyRequest) return <View></View>;
    return (
      <CustodianRequestAcceptModalContents
        userName={custodyRequest.requester}
        onPressAssociateContacts={() => {}}
        onPressSkip={() => {
          setTimeout(() => {
            setTabBarZIndex(9999);
          }, 10);
          CustodianRequestAcceptBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderNoInternetModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          NoInternetBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderCustodianRequestModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          CustodianRequestBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const onPressElement = item => {
    setTimeout(() => {
      setTabBarZIndex(0);
    }, 10);
    if (item.title == "Address Book") {
      MoreTabBottomSheet.current.snapTo(0);
      addressBookBottomSheet.current.snapTo(1);
    }
  };

  const renderMoreTabContents = () => {
    return (
      <MoreHomePageTabContents onPressElements={item => onPressElement(item)} />
    );
  };

  const renderMoreTabHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          MoreTabBottomSheet.current.snapTo(0);
          bottomSheet.current.snapTo(1);
          setTimeout(() => {
            setSelected("Transactions");
          }, 10);
        }}
      />
    );
  };

  const renderAddressBookContents = () => {
    return (
      <AddressBookContents
        onPressBack={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          addressBookBottomSheet.current.snapTo(0);
          bottomSheet.current.snapTo(1);
        }}
      />
    );
  };

  const renderAddressBookHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          addressBookBottomSheet.current.snapTo(0);
          bottomSheet.current.snapTo(1);
        }}
      />
    );
  };

  const renderCustodianRequestOtpModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          CustodianRequestOtpBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderCustodianRequestRejectedModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          CustodianRequestRejectedBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderCustodianRequestAcceptModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          CustodianRequestAcceptBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const database = useSelector(state => state.storage.database);
  const walletName = database ? database.WALLET_SETUP.walletName : "";

  const handleAppStateChange = nextAppState => {
    setTimeout(
      () =>
        nextAppState === "active" ? props.navigation.navigate("ReLogin") : null,
      50
    ); // producing a subtle delay to let deep link event listener make the first move
  };

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);

    NetInfo.addEventListener(state => {
      if (!state.isConnected) NoInternetBottomSheet.current.snapTo(1);
      else if (state.isConnected) NoInternetBottomSheet.current.snapTo(0);
    });
  }, []);

  const handleDeepLink = event => {
    const splits = event.url.split("/");
    const requester = splits[3];
    if (splits[4] === "sss" && splits[5] === "ek") {
      const custodyRequest = { requester, ek: splits[6] };
      props.navigation.navigate("Home", { custodyRequest });
    }
  };

  useEffect(() => {
    Linking.addEventListener("url", handleDeepLink);

    // return () => Linking.removeEventListener("url", handleDeepLink);
  }, []);

  const custodyRequest = props.navigation.getParam("custodyRequest");
  useEffect(() => {
    if (custodyRequest) {
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 10);
      CustodianRequestBottomSheet.current.snapTo(1);
      bottomSheet.current.snapTo(1);
    }
  }, [custodyRequest]);

  return (
    <ImageBackground
      source={require("./../assets/images/home-bg.png")}
      style={{ width: "100%", height: "100%", flex: 1 }}
      imageStyle={{ resizeMode: "stretch" }}
    >
      <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
      <View
        style={{
          flex: 3.8,
          paddingTop: Platform.OS == "ios" && DeviceInfo.hasNotch ? hp("5%") : 0
        }}
      >
        <View style={styles.headerViewContainer}>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.headerTitleViewContainer}>
              <Text
                style={styles.headerTitleText}
              >{`${walletName}’s Wallet`}</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <Image
                  style={CommonStyles.homepageAmountImage}
                  source={require("./../assets/images/icons/icon_bitcoin_light.png")}
                />
                <Text
                  style={{
                    ...CommonStyles.homepageAmountText,
                    color: Colors.white
                  }}
                >
                  20,65,000
                </Text>
                <Text
                  style={{
                    ...CommonStyles.homepageAmountUnitText,
                    color: Colors.white
                  }}
                >
                  sats
                </Text>
              </View>
            </View>
            <View style={styles.headerToggleSwitchContainer}>
              <ToggleSwitch
                onpress={() => {
                  setSwitchOn(!switchOn);
                }}
                toggle={switchOn}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 7 }}>
              <Text style={styles.headerInfoText}>
                <Text style={{ fontStyle: "italic" }}>Great!! </Text>
                The wallet backup is secure. Keep an eye on the health of the
                backup here
              </Text>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("ManageBackup");
                }}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>Manage Backup</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 4, alignItems: "flex-end" }}>
              <HomePageShield shieldStatus={100} />
            </View>
          </View>
        </View>
      </View>
      <View style={{ flex: 7 }}>
        <View style={styles.cardViewContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={data}
            renderItem={Items => {
              return (
                <View style={{ flexDirection: "column" }}>
                  {Items.item.map(value => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          props.navigation.navigate("Accounts");
                        }}
                      >
                        <CardView cornerRadius={10} style={styles.card}>
                          <View style={{ flexDirection: "row" }}>
                            <Image
                              style={{ width: wp("10%"), height: wp("10%") }}
                              source={getIconByAccountType(value.accountType)}
                            />
                            {value.accountType == "secure" ? (
                              <TouchableOpacity
                                onPress={() => {
                                  alert("2FA");
                                }}
                                style={{ marginLeft: "auto" }}
                              >
                                <Text
                                  style={{
                                    color: Colors.blue,
                                    fontSize: RFValue(11, 812),
                                    fontFamily: Fonts.FiraSansRegular
                                  }}
                                >
                                  2FA
                                </Text>
                              </TouchableOpacity>
                            ) : null}
                          </View>
                          <View style={{ flex: 1, justifyContent: "flex-end" }}>
                            <Text style={styles.cardTitle}>{value.title}</Text>
                            <Text
                              style={{
                                color: Colors.textColorGrey,
                                fontSize: RFValue(11, 812)
                              }}
                            >
                              {value.account}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "flex-end",
                                marginTop: hp("1%")
                              }}
                            >
                              <Image
                                style={styles.cardBitCoinImage}
                                source={value.bitcoinicon}
                              />
                              <Text style={styles.cardAmountText}>
                                {value.amount}
                              </Text>
                              <Text style={styles.cardAmountUnitText}>
                                {value.unit}
                              </Text>
                            </View>
                          </View>
                        </CardView>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            }}
          />
        </View>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={addressBookBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("90%") : hp("90%")
        ]}
        renderContent={renderAddressBookContents}
        renderHeader={renderAddressBookHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={bottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch()
            ? hp("17%")
            : Platform.OS == "android"
            ? hp("20%")
            : hp("18%"),
          hp("50%"),
          hp("90%")
        ]}
        renderContent={renderContent}
        renderHeader={renderHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={NoInternetBottomSheet}
        snapPoints={[-50, hp("60%")]}
        renderContent={renderNoInternetModalContent}
        renderHeader={renderNoInternetModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={CustodianRequestBottomSheet}
        snapPoints={[-50, hp("60%")]}
        renderContent={renderCustodianRequestModalContent}
        renderHeader={renderCustodianRequestModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={CustodianRequestOtpBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("67%") : hp("60%"),
          Platform.OS == "ios" ? hp("80%") : hp("70%")
        ]}
        renderContent={renderCustodianRequestOtpModalContent}
        renderHeader={renderCustodianRequestOtpModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={CustodianRequestRejectedBottomSheet}
        snapPoints={[-50, hp("60%")]}
        renderContent={renderCustodianRequestRejectedModalContent}
        renderHeader={renderCustodianRequestRejectedModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={MoreTabBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("65%") : hp("75%")
        ]}
        renderContent={renderMoreTabContents}
        renderHeader={renderMoreTabHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={CustodianRequestAcceptBottomSheet}
        snapPoints={[-50, hp("60%")]}
        renderContent={renderCustodianRequestAcceptModalContent}
        renderHeader={renderCustodianRequestAcceptModalHeader}
      />
      {/* TODO: If we open full modal above tab bar first change zIndex to 0 and when we close that modal please zIndex to 999 by using setTabBarZIndex(0) or setTabBarZIndex(999) */}
      <View style={{ ...styles.bottomTabBarContainer, zIndex: tabBarZIndex }}>
        <TouchableOpacity
          onPress={() => selectTab("Transactions")}
          style={styles.tabBarTabView}
        >
          {selected == "Transactions" ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_transactions_active.png")}
                style={{ width: 25, height: 25, resizeMode: "contain" }}
              />
              <Text style={styles.activeTabTextStyle}>transactions</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_transactions.png")}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => selectTab("Add")}
          style={styles.tabBarTabView}
        >
          {selected == "Add" ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_add_active.png")}
                style={styles.tabBarImage}
              />
              <Text style={styles.activeTabTextStyle}>add</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_add.png")}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => selectTab("QR")}
          style={styles.tabBarTabView}
        >
          {selected == "QR" ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_qr_active.png")}
                style={styles.tabBarImage}
              />
              <Text style={styles.activeTabTextStyle}>qr</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_qr.png")}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBarTabView}
          onPress={() => {
            setOpenmodal("closed");
            MoreTabBottomSheet.current.snapTo(1);
            selectTab("More");
          }}
        >
          {selected == "More" ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_more.png")}
                style={styles.tabBarImage}
              />
              <Text style={styles.activeTabTextStyle}>More</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <Image
                source={require("../assets/images/HomePageIcons/icon_more.png")}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  card: {
    margin: 0,
    width: wp("42.6%"),
    height: hp("20.1%"),
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginRight: wp("2%"),
    marginBottom: wp("2%"),
    padding: wp("3"),
    backgroundColor: Colors.white
  },
  cardTitle: {
    color: Colors.blue,
    fontSize: RFValue(10, 812)
  },
  activeTabStyle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundColor,
    padding: 7,
    borderRadius: 7,
    width: 120,
    height: 40,
    justifyContent: "center"
  },
  activeTabTextStyle: {
    marginLeft: 8,
    color: Colors.blue,
    fontFamily: Fonts.firasonsRegular,
    fontSize: RFValue(12, 812)
  },
  bottomTabBarContainer: {
    backgroundColor: Colors.white,
    justifyContent: "space-evenly",
    display: "flex",
    marginTop: "auto",
    flexDirection: "row",
    height: hp("12%"),
    alignItems: "center",
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    paddingBottom: DeviceInfo.hasNotch() ? hp("4%") : 0
  },
  cardViewContainer: {
    height: "100%",
    backgroundColor: Colors.backgroundColor,
    marginTop: hp("4%"),
    borderTopLeftRadius: 25,
    shadowColor: "black",
    shadowOpacity: 0.4,
    shadowOffset: { width: 2, height: -1 },
    paddingTop: hp("1.5%"),
    paddingBottom: hp("7%"),
    width: "100%",
    overflow: "hidden",
    paddingLeft: wp("3%")
  },
  modalHeaderContainer: {
    backgroundColor: Colors.white,
    marginTop: "auto",
    flex: 1,
    height: 40,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    zIndex: 9999
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 7
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15
  },
  modalContentContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    paddingBottom: hp("10%")
  },
  headerViewContainer: {
    marginTop: hp("3%"),
    marginLeft: 20,
    marginRight: 20
  },
  headerTitleViewContainer: {
    flex: 7,
    marginBottom: hp("3%"),
    justifyContent: "center"
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(25, 812),
    display: "flex",
    marginBottom: hp("0.8%")
  },
  headerToggleSwitchContainer: {
    flex: 3,
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: hp("3%")
  },
  headerInfoText: {
    fontSize: RFValue(12, 812),
    color: Colors.white,
    marginBottom: hp("4%"),
    width: wp("50%")
  },
  headerButton: {
    backgroundColor: Colors.homepageButtonColor,
    height: hp("5%"),
    width: wp("30%"),
    borderRadius: 5,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center"
  },
  headerButtonText: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13, 812),
    color: Colors.white
  },
  headerShieldImage: {
    width: wp("16%"),
    height: wp("25%"),
    resizeMode: "contain"
  },
  cardBitCoinImage: {
    width: wp("3%"),
    height: wp("3%"),
    marginRight: 5,
    marginBottom: wp("0.5%"),
    resizeMode: "contain"
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(17, 812),
    marginRight: 5
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11, 812),
    marginBottom: 2
  },
  tabBarImage: {
    width: 21,
    height: 21,
    resizeMode: "contain"
  },
  tabBarTabView: {
    padding: wp("5%")
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor
  },
  transactionModalElementView: {
    backgroundColor: Colors.white,
    padding: 10,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between"
  },
  modalElementInfoView: {
    padding: 10,
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
  addModalView: {
    backgroundColor: Colors.white,
    padding: 7,
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between"
  },
  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(14, 812)
  },
  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11, 812)
  },
  qrModalScrollView: {
    display: "flex",
    backgroundColor: Colors.white
  },
  qrModalImageNTextInputView: {
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: Colors.backgroundColor,
    borderBottomWidth: 3
  },
  qrModalImage: {
    width: wp("72%"),
    height: wp("72%"),
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.backgroundColor
  },
  qrModalTextInput: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    width: wp("72%"),
    height: 60,
    marginTop: 25,
    marginBottom: 25,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: RFValue(11, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  qrModalInfoView: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: "row",
    alignSelf: "center"
  },
  qrModalInfoTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812)
  },
  qrModalInfoInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812)
  }
});
