import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import CommonStyles from "../../common/Styles/Styles";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { Shadow } from "react-native-shadow-2";
import { SvgProps } from "react-native-svg";
import AddIcon from "../../assets/images/svgs/icon_send_sherpa.svg";
import GiftAddIcon from "../../assets/images/svgs/icon_sherpa_with_gift.svg";
import { AppBottomSheetTouchableWrapper } from "../../components/AppBottomSheetTouchableWrapper";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { NavigationActions } from "react-navigation";

export type IBecomeASherpaProps = { navigation: any; closeModal: () => void };

type HeadingType = {
  title: string;
  titleFont: number;
  subTitle: string;
};

const Heading: React.FC<HeadingType> = (props) => {
  return (
    <View>
      <Text
        style={{
          color: Colors.blue,
          letterSpacing: 0.01,
          marginLeft: 20,
          fontFamily: Fonts.FiraSansRegular,
          fontSize: props.titleFont,
        }}
      >
        {props.title}
      </Text>
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
      <Shadow
        startColor={"rgba(0, 0, 0, 0.075)"}
        sides={["right", "bottom"]}
        corners={["topRight", "bottomRight", "bottomLeft"]}
        offset={[1, 1]}
      >
        <View style={styles.itemWrapper}>
          <View style={styles.icons}>
            <props.icon />
          </View>
          <View style={{ flex: 5, justifyContent: "center" }}>
            <Text style={styles.listTitle}>{props.main}</Text>
            <Text
              style={[
                CommonStyles.headerInfoText,
                {
                  marginLeft: 0,
                  fontSize: RFValue(12),
                  color: "#525252",
                  marginRight: wp(10),
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

const BecomeASherpa: React.FC<IBecomeASherpaProps> = (props) => {
  return (
    <View style={styles.wrapper}>
      <AppBottomSheetTouchableWrapper
        onPress={() => props.closeModal()}
        style={{
          width: wp(7),
          height: wp(7),
          borderRadius: wp(7 / 2),
          alignSelf: "flex-end",
          backgroundColor: Colors.lightBlue,
          alignItems: "center",
          justifyContent: "center",
          marginTop: wp(3),
          marginRight: wp(3),
        }}
      >
        <FontAwesome
          name="close"
          color={Colors.white}
          size={19}
        />
      </AppBottomSheetTouchableWrapper>

      <Heading title="Become a Sherpa" subTitle="" titleFont={RFValue(25)} />

      <ListItem
        main={"Create Invitation code"}
        sub={
          "Send Sherpa code to any of your dependent using the generated link"
        }
        icon={AddIcon}
        marginTop={wp(1)}
        onPress={() => {
          props.closeModal();
          props.navigation.navigate("Sherpa", {}, NavigationActions.navigate({
            routeName: 'InvitationCode',
            params: {
              contact: props.navigation.state.params,
              id: 123,
              key: props.navigation.state.key,
            },
          }));
        }}
      />
      <ListItem
        main={"Create Invitation code with Gift"}
        sub={
          "Add gift and send Sherpa code to any of your dependent using the generated link"
        }
        icon={GiftAddIcon}
        marginTop={wp(5)}
        onPress={() => {
          // temporarily added already available gift, once taken care we can direct to Gift Sats Tab and from there pass this on
          props.closeModal();
          props.navigation.navigate("CreateGift", {
            fromScreen: "BecomeSherpa",
            contact: props.navigation.state.params,
          });
        }}
      />
    </View>
  );
};

export default BecomeASherpa;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.backgroundColor,
    height: hp(55),
  },
  titleWrapper: {
    flexDirection: "row",
  },
  itemWrapper: {
    flexDirection: "row",
    width: wp(85),
    height: hp(15),
    backgroundColor: "white",
    borderRadius: 10,
  },
  icons: {
    alignItems: "flex-end",
    paddingEnd: wp(2),
    justifyContent: "center",
    flex: 1,
  },
  listTitle: {
    color: "#006cb4",
    fontSize: RFValue(15),
    letterSpacing: 0.01,
    fontFamily: Fonts.FiraSansMedium,
  },
});
