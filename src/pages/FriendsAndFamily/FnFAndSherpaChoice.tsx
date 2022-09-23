import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CommonStyles from "../../common/Styles/Styles";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import SettingGear from "../../assets/images/svgs/icon_settings_noborder.svg";
import SherpaIcon from "../../assets/images/svgs/icon_sherpa.svg";
import UsersIcon from "../../assets/images/svgs/icon_users.svg";
import NextIcon from "../../assets/images/svgs/icon_arrow_right.svg";
import { Shadow } from "react-native-shadow-2";
import { SvgProps } from "react-native-svg";

export type IFnFAndSherpaChoiceProps = {
  navigation: any;
};

type HeadingType = {
  title: string;
  subTitle: string;
};

const Heading: React.FC<HeadingType> = (props) => {
  return (
    <View>
      <View style={styles.titleWrapper}>
        <Text style={[CommonStyles.headerTitles, { flex: 1 }]}>
          {props.title}
        </Text>
        <TouchableOpacity
          style={[
            CommonStyles.headerTitles,
            { marginRight: 25, justifyContent: "center" },
          ]}
        >
          <SettingGear />
        </TouchableOpacity>
      </View>
      <Text
        style={[
          CommonStyles.subHeaderTitles,
          { fontSize: RFValue(12), marginRight: 20 },
        ]}
      >
        {props.subTitle}
      </Text>
    </View>
  );
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
            <Text style={[CommonStyles.headerInfoText, { marginLeft: 0 }]}>
              {props.sub}
            </Text>
          </View>
          <View style={[styles.icons, { marginRight: wp(8) }]}>
            <NextIcon />
          </View>
        </View>
      </Shadow>
    </TouchableOpacity>
  );
};

const FnFAndSherpaChoice: React.FC<IFnFAndSherpaChoiceProps> = (props) => {
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
            props.navigation.goBack();
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>

      <Heading
        title="Friends & Family"
        subTitle="Choose between associating with a contact or being a Sherpa of a dependent."
      />

      <ListItem
        marginTop={wp(10)}
        main={"Associate a contact"}
        sub={"Tap to add a contact"}
        icon={UsersIcon}
        onPress={() =>
          props.navigation.navigate("AddContactSendRequest", {
            ...props.navigation.state.params,
          })
        }
      />

      <ListItem
        marginTop={wp(5)}
        main={"Become a Sherpa"}
        sub={"Tap to Create your Invitation code"}
        icon={SherpaIcon}
        onPress={() =>
          props.navigation.navigate("Sherpa", {
            screen: "BecomeASherpa",
            params: { ...props.navigation.state.params },
          })
        }
      />
    </View>
  );
};

export default FnFAndSherpaChoice;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  titleWrapper: {
    flexDirection: "row",
  },
  itemWrapper: {
    flexDirection: "row",
    width: wp(90),
    height: hp(15),
    backgroundColor: "white",
    borderRadius: 10,
  },
  icons: {
    marginHorizontal: wp(4),
    justifyContent: "center",
  },
  listTitle: {
    color: Colors.blue,
    fontSize: RFValue(15),
    letterSpacing: 0.01,
    fontFamily: Fonts.FiraSansRegular,
  },
});
