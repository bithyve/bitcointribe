import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import CommonStyles from "../../common/Styles/Styles";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MoreIcon from "../../assets/images/svgs/icon_more_gray.svg";
import SendQR from "../../assets/images/svgs/link.svg";
import { Avatar } from "react-native-elements";
import { AccountsState } from "../../store/reducers/accounts";
import { useSelector } from "react-redux";
import Card from '../../assets/images/svgs/card.svg';

type IInvitationCodeProps = { navigation: any };

type HeadingType = {
  title: string;
  titleFont: number;
  subTitle: string;
};

const Heading: React.FC<HeadingType> = (props) => {
  return (
    <View>
      <Text style={[CommonStyles.headerTitles, { fontSize: props.titleFont }]}>
        {props.title}
      </Text>
      <Text
        style={[
          CommonStyles.subHeaderTitles,
          { fontSize: RFValue(13), marginRight: wp(14) },
        ]}
      >
        {props.subTitle}
      </Text>
    </View>
  );
};

const CodeTextBox: React.FC<{ code: string }> = (props) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Avatar
        title="P"
        titleStyle={{ fontSize: RFValue(25) }}
        containerStyle={styles.dpCircle}
      />
      <View style={styles.codeText}>
        <View style={styles.codeWrapper}>
          <Text style={{ fontSize: RFValue(12) }}>Sherpa code</Text>
          <Text style={styles.code}>{props.code}</Text>
          <Text
            style={{ fontSize: RFValue(12), fontFamily: Fonts.FiraSansMedium }}
          >
            Pam Angela
          </Text>
        </View>
        <TouchableOpacity style={styles.copyButton}>
          <MoreIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SherpaInvitationCode: React.FC<IInvitationCodeProps> = (props) => {
  const [code, setCode] = useState("");

  const accountsState: AccountsState = useSelector((state) => state.accounts);

  const receivingContact = props.navigation.state.params.contact;
  console.log(props.navigation.state.params)
  const giftToSend = null;

  const numberWithCommas = (x) => {
    return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  };

  const GiftContainer = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          width: "90%",
          backgroundColor: Colors.gray7,
          alignSelf: "center",
          borderRadius: wp(2),
          marginTop: hp(1),
          marginBottom: hp(1),
          paddingVertical: wp(1),
          paddingHorizontal: wp(1),
          borderColor: Colors.lightBlue,
          borderWidth: 1,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.gray7,
            borderRadius: wp(2),
            paddingTop: hp(2),
            paddingHorizontal: wp(4),
            borderColor: Colors.lightBlue,
            borderWidth: 1,
            borderStyle: "dashed",
            padding: wp(3),
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.FiraSansMedium,
              fontSize: RFValue(14),
            }}
          >
            Gift Card
          </Text>
          <Text
            style={{
              fontFamily: Fonts.FiraSansRegular,
              color: Colors.lightTextColor,
              fontSize: RFValue(12),
              lineHeight: RFValue(18),
            }}
          >
            {`This is a gift from me to you Pam. I hope you like it. Haha, xoxo.`}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: Math.min(wp(5), 15),
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: Fonts.FiraSansRegular,
                  color: Colors.lightTextColor,
                  fontSize: RFValue(12),
                  lineHeight: RFValue(18),
                }}
              >
                {`This is to get you started!\nWelcome to Bitcoin`}
              </Text>
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(24),
                  fontFamily: Fonts.FiraSansRegular,
                  marginVertical: hp(1),
                }}
              >
                {numberWithCommas(giftToSend.amount)}
                <Text
                  style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  &ensp;sats
                </Text>
              </Text>
            </View>

            <Card height={Math.max(wp(20), 75)} width={Math.max(wp(20), 75)} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    setCode("567908");
  }, []);

  console.log("THE_CONTACT", props.navigation.state.params.contact);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          CommonStyles.headerContainer,
          {
            backgroundColor: Colors.backgroundColor,
          },
        ]}
      >
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack(props.navigation.state.params.key);
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>

      <Heading
        title="Become a Sherpa"
        titleFont={RFValue(25)}
        subTitle={"Your invitation code has been generated"}
      />

      <CodeTextBox code={code} />

      <Heading
        title={""}
        titleFont={0}
        subTitle={"Become a Sherpa by sharing this code with your dependents."}
      />

      <View style={{ flex: 1, justifyContent: "center" }}>
        {giftToSend !== null && <GiftContainer />}
      </View>

      <View style={styles.footer}>
        <Heading
          title={""}
          titleFont={0}
          subTitle={
            "Lorem ipsum dolor sit amet, consectetur adip iscing elit, sed do eiusmod"
          }
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: Colors.blue,
              width: wp(35),
              height: hp(8),
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 10,
              margin: wp(5),
            }}
          >
            <SendQR />
            <Text
              style={{
                color: "white",
                fontSize: RFValue(14),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              &ensp;Share Code
            </Text>
          </TouchableOpacity>

          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default SherpaInvitationCode;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  codeText: {
    backgroundColor: "#fff",
    alignSelf: "center",
    borderRadius: 15,
    width: wp(79),
    marginVertical: hp(3),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.75),
    flexDirection: "row",
    marginLeft: -wp(15),
    elevation: 5,
  },
  codeWrapper: {
    flex: 1,
    marginLeft: wp(10),
  },
  code: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(18),
    letterSpacing: RFValue(18),
  },
  copyButton: {
    alignSelf: "center",
  },
  dpCircle: {
    height: wp(24),
    width: wp(24),
    borderRadius: wp(12),
    backgroundColor: Colors.blue,
    borderWidth: wp(1),
    borderColor: "white",
    elevation: 5,
    zIndex: 1,
  },
  footer: {
    marginBottom: wp(5),
  },
  statusIndicatorView: {
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: wp(10),
    marginHorizontal: wp("6%"),
    marginBottom: hp(2),
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    height: 5,
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
});
