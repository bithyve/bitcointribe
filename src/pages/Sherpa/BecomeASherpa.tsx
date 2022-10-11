import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import CommonStyles from "../../common/Styles/Styles";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { Shadow } from "react-native-shadow-2";
import { SvgProps } from "react-native-svg";
import AddIcon from "../../assets/images/svgs/icon_send_sherpa.svg";
import GiftAddIcon from "../../assets/images/svgs/icon_sherpa_with_gift.svg";
import { StackActions } from "react-navigation";
import { resetToHomeAction } from '../../navigation/actions/NavigationActions';

export type IBecomeASherpaProps = { navigation: any };

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
        offset={[5, 5]}
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
                { marginLeft: 0, fontSize: RFValue(12), color: "#525252", marginRight: wp(10) },
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
            props.navigation.dispatch(StackActions.pop());
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>

      <Heading title="Become a Sherpa" subTitle="" titleFont={RFValue(25)} />

      <Heading
        title="No link created"
        titleFont={RFValue(20)}
        subTitle="Create a link to be Sherpa.."
      />

      <ListItem
        main={"Create Invitation code"}
        sub={
          "Send Sherpa code to any of your dependent using the generated link"
        }
        icon={AddIcon}
        marginTop={wp(10)}
        onPress={() => props.navigation.navigate('InvitationCode', {
          contact: props.navigation.state.params.params,
          id: 123
        })}
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
          props.navigation.navigate('CreateGift', {
            // fromScreen: 'GiftDetails',
            // giftId: "91dd4c21968c318e4400462e006c6caf35887c1d5b44680d8d9ea75b730c4f06", // currently a temporary Gift
            // // senderName: name,
            fromScreen: "BecomeSherpa",
            contact: props.navigation.state.params
          });
        }}
      />
    </View>
  );
};

export default BecomeASherpa;

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
