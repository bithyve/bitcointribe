import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Avatar } from "react-native-elements";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Colors from "../../common/Colors";
import CommonStyles from "../../common/Styles/Styles";
import Fonts from "../../common/Fonts";
import BTCIcon from "../../assets/images/svgs/icon_bitcoin.svg";
import RightArrow from "../../assets/images/svgs/icon_arrow.svg";
import AddIcon from "../../assets/images/svgs/icon_add_dark.svg";
import Gifts from "../../assets/images/satCards/gifts.svg";
import ModalContainer from "../../components/home/ModalContainer";
import { AppBottomSheetTouchableWrapper } from "../../components/AppBottomSheetTouchableWrapper";
import { Shadow } from "react-native-shadow-2";
import { SvgProps } from "react-native-svg";

export type ISherpaHomeProps = {
  navigation: any;
};

export type SherpaDetails = {
  name: string;
  profile: string;
  txns: Array<{ outgoing: boolean; time: Date; amount: number }>;
  lastBackup: Date;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatDate = (time: Date) => {
  return `${time.getDate()} ${MONTHS[time.getMonth()]} '${
    time.getFullYear() % 100
  }   .   ${
    time.getHours() > 12 ? time.getHours() - 12 : time.getHours()
  }:${time.getMinutes()} ${time.getHours() >= 12 ? "pm" : "am"}`;
};

type ListItemProps = {
  main: string;
  sub: string;
  icon: React.FC<SvgProps>;
  marginTop: number;
  onPress: () => void;
};

const ListItem: React.FC<ListItemProps> = (props) => {
  return (
    <TouchableOpacity
      style={{ alignSelf: "center", marginTop: props.marginTop }}
      onPress={props.onPress}
    >
      <Shadow startColor={"#ececec"} offset={[6, 6]}>
        <View style={styles.itemWrapper}>
          <View style={styles.icons}>
            <props.icon />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.listTitle}>{props.main}</Text>
            <Text
              style={[
                CommonStyles.headerInfoText,
                {
                  marginLeft: 0,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansLight,
                  letterSpacing: 0.5,
                  lineHeight: RFValue(16),
                  color: "#525252",
                },
              ]}
            >
              {props.sub}
            </Text>
          </View>
        </View>
      </Shadow>
    </TouchableOpacity>
  );
};

const SherpaHome: React.FC<ISherpaHomeProps> = ({ navigation }) => {
  useEffect(() => {
    setData(getSherpaDependent(navigation.state.params.id));
  }, [navigation.state.params.id]);

  const getSherpaDependent: (id: string) => null | SherpaDetails = (
    id: string
  ) => {
    // a function to return the contact details of Sherpa Dependent using the ID.

    if (!id) {
      return null;
    }

    return {
      name: "Pam",
      profile:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
      lastBackup: new Date(Date.UTC(2022, 7, 20, 16, 0)),
      txns: [
        {
          outgoing: true,
          time: new Date(Date.UTC(2022, 2, 1, 10, 51)),
          amount: 2000,
        },
        {
          outgoing: false,
          time: new Date(Date.UTC(2021, 12, 21, 12, 0)),
          amount: 2000,
        },
        {
          outgoing: true,
          time: new Date(Date.UTC(2021, 10, 21, 14, 0)),
          amount: 2000,
        },
        {
          outgoing: false,
          time: new Date(Date.UTC(2021, 8, 29, 16, 0)),
          amount: 140000,
        },
        {
          outgoing: false,
          time: new Date(Date.UTC(2021, 5, 18, 15, 0)),
          amount: null,
        },
      ],
    };
  };

  const getTime = (time: Date) => {
    const cur = new Date();
    const difSecs = Math.ceil((cur.getTime() - time.getTime()) / 1000);
    const difMins = Math.ceil(difSecs / 60);
    const difHour = Math.ceil(difMins / 60);
    const difDays = Math.ceil(difHour / 24);
    const difMons = Math.ceil(difDays / 30);
    const difYear = Math.ceil(difMons / 12);

    if (difYear > 0) {
      return `${difYear} years ago`;
    } else if (difMons > 0) {
      return `${difMons} months ago`;
    } else if (difDays > 0) {
      return `${difDays} days ago`;
    } else if (difHour > 0) {
      return `${difHour} hours ago`;
    } else if (difMins > 0) {
      return `${difMins} minutes ago`;
    } else {
      return `${difSecs} seconds ago`;
    }
  };

  const [data, setData] = useState<SherpaDetails | null>(null);
  const [restoreModal, setRestoreModal] = useState<boolean>(false);

  const RestoreModal: React.FC<{}> = () => {
    return (
      <View
        style={{
          backgroundColor: "#F8F8F8",
          height: hp(50),
          width: "100%",
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => setRestoreModal(false)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignSelf: "flex-end",
            backgroundColor: "#77B9EB",
            alignItems: "center",
            justifyContent: "center",
            marginTop: wp(3),
            marginRight: wp(3),
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={RFValue(17)} />
        </AppBottomSheetTouchableWrapper>

        <Text
          style={{
            fontSize: RFValue(20),
            color: "#006DB4",
            fontFamily: Fonts.FiraSansRegular,
            marginHorizontal: RFValue(40),
          }}
        >
          Restore Wallet
        </Text>

        <ListItem
          marginTop={wp(5)}
          main={"Restore using Sherpa Code"}
          sub={
            "Send Sherpa code to any of your dependent using the generated link"
          }
          icon={AddIcon}
          onPress={() => {
            setRestoreModal(false);
            navigation.navigate("CodeRestore");
          }}
        />

        <ListItem
          marginTop={wp(5)}
          main={"Restore using Backup Phrases"}
          sub={
            "Add gift and send Sherpa code to any of your dependent using the generated link"
          }
          icon={Gifts}
          onPress={() => {
            setRestoreModal(false);
            navigation.navigate("SeedRestore");
          }}
        />
      </View>
    );
  };

  const Header: React.FC<{}> = () => {
    return (
      <View style={styles.headerWrapper}>
        <View style={{ marginRight: wp(3) }}>
          <Avatar
            title={data !== null ? data.name[0] : "S"}
            titleStyle={{ fontSize: RFValue(25) }}
            imageProps={styles.dpCircle}
            containerStyle={styles.dpCircle}
            source={data !== null ? { uri: data.profile } : undefined}
          />
        </View>

        <View style={{ justifyContent: "center" }}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
                color: "#6C6C6C",
              }}
            >
              Last Backup{" "}
            </Text>
            <Text
              style={{
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansMediumItalic,
                color: "#6C6C6C",
              }}
            >
              {data !== null ? getTime(data.lastBackup) : ""}
            </Text>
          </View>

          <Text
            style={{
              fontSize: RFValue(20),
              fontFamily: Fonts.FiraSansSemiBold,
              color: "#656565",
            }}
          >
            {data !== null ? `${data.name}'s Wallet` : ""}
          </Text>
        </View>
      </View>
    );
  };

  const Footer: React.FC<{}> = () => {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => setRestoreModal(true)}
      >
        <Text
          style={{
            color: "#FAFAFA",
            fontFamily: Fonts.FiraSansMedium,
            fontSize: RFValue(13),
          }}
        >
          Help Restore Wallet
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: "#FAFAFA", padding: wp(8)}}>
    <SafeAreaView style={styles.wrapper}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View
        style={[
          CommonStyles.headerContainer,
          {
            backgroundColor: "#FAFAFA",
            left: -wp(5),
          },
        ]}
      >
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack(navigation.dangerouslyGetParent().state.key);
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>

      <Header />

      <View style={styles.body}>
        <View
          style={{
            height: "100%",
            width: 1,
            backgroundColor: "#E0E0E0",
            position: "absolute",
            zIndex: -1,
            left: 6,
          }}
        />
        <View>
          <ScrollView style={{ flex: 1, marginTop: 20 }}>
            <FlatList
              data={data === null ? [] : data.txns}
              renderItem={(data) => {
                const { index, item } = data;
                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={[styles.dot, index === 0 ? styles.active : {}]}
                    />

                    <View
                      style={{ marginHorizontal: wp(5), marginBottom: wp(5) }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.FiraSansMedium,
                          fontSize: RFValue(10),
                        }}
                      >
                        {formatDate(item.time)}
                      </Text>

                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor: "#F4F4F4",
                          width: wp(73),
                          flexDirection: "row",
                          marginVertical: 5,
                          paddingHorizontal: wp(3),
                          paddingVertical: wp(3),
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue(12),
                          }}
                        >
                          {item.amount === null
                            ? "Dependent Wallet Created"
                            : item.outgoing
                            ? "Outgoing Transaction"
                            : "Incoming Transaction"}
                        </Text>

                        {item.amount !== null && (
                          <>
                            <BTCIcon />

                            <Text
                              style={{
                                fontFamily: Fonts.FiraSansRegular,
                                fontSize: RFValue(16),
                                color: item.outgoing ? "#FF7761" : "#70C1B3",
                                alignSelf: "flex-end",
                              }}
                            >
                              &ensp;{item.amount + " "}
                            </Text>

                            <Text
                              style={{
                                alignSelf: "flex-end",
                                fontFamily: Fonts.FiraSansRegular,
                                fontSize: RFValue(10),
                                color: "#A3A3A3",
                                marginBottom: wp(0.75),
                              }}
                            >
                              sats&ensp;&ensp;
                            </Text>

                            <RightArrow />
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </ScrollView>

          <Footer />
        </View>
      </View>

      <ModalContainer
        onBackground={() => setRestoreModal(false)}
        visible={restoreModal}
        closeBottomSheet={() => {}}
      >
        <RestoreModal />
      </ModalContainer>
    </SafeAreaView>
    </View>
  );
};

export default SherpaHome;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerWrapper: {
    flexDirection: "row",
  },
  dpCircle: {
    height: wp(16),
    width: wp(16),
    borderRadius: wp(8),
    backgroundColor: Colors.blue,
    elevation: 5,
    zIndex: 1,
  },
  button: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.blue,
    width: wp(45),
    height: hp(7),
    marginBottom: Math.min(hp(5), 40),
    marginHorizontal: wp(3),
  },
  body: {
    flex: 1,
    // borderLeftWidth: 1,
    // borderLeftColor: Colors.gray1,
    flexDirection: "row",
    marginTop: Math.min(hp(5), 45),
  },
  dot: {
    borderWidth: 4,
    borderColor: "transparent",
    backgroundColor: "#D0D0D0",
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  active: {
    borderColor: Colors.blue,
    backgroundColor: Colors.backgroundColor,
  },
  listTitle: {
    color: Colors.blue,
    fontSize: RFValue(14),
    letterSpacing: 0.7,
    fontFamily: Fonts.FiraSansMedium,
  },
  itemWrapper: {
    flexDirection: "row",
    width: wp(88),
    height: hp(12),
    backgroundColor: "white",
    borderRadius: 10,
  },
  icons: {
    marginLeft: wp(8),
    marginRight: wp(3),
    justifyContent: "center",
  },
});
