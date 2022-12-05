import React, { useContext } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import moment from "moment";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import { LocalizationContext } from "../../common/content/LocContext";
import { ListItem } from "react-native-elements/dist/list/ListItem";

const ManageGiftsList = (props) => {
  const { translations } = useContext(LocalizationContext);
  const strings = translations["f&f"];

  return (
    <TouchableOpacity
      onPress={() => (props.onPress() ? props.onPress() : () => {})}
      key={props.key}
      style={{
        width: "92%",
        backgroundColor: Colors.gray7,
        // shadowOpacity: 0.06,
        // shadowOffset: {
        //   width: 10, height: 10
        // },
        // shadowRadius: 10,
        // elevation: 2,
        alignSelf: "center",
        borderRadius: wp(2),
        marginTop: hp(1),
        marginBottom: hp(0.5),
        paddingVertical: wp(1),
        paddingHorizontal: wp(1),
        // borderColor: Colors.darkBlue,
        // borderWidth: 1,
      }}
    >
      <View
        style={{
          // backgroundColor: Colors.gray7,
          borderRadius: wp(2),
          paddingVertical: hp(2),
          paddingHorizontal: wp(2),
          flexDirection: "row",
          alignItems: 'center',
          // borderColor: Colors.lightBlue,
          // borderWidth: 1,
          // borderStyle: 'dashed',
          // padding: wp( 3 ),
          width: '100%'
        }}
      >
        <View style={{width: '15%', alignItems: 'center', justifyContent: 'center'}}>
          {props.image}
        </View>
        <View style={{width: '53%'}}>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansMedium,
              // fontWeight: '700',
              letterSpacing: 0.3,
              marginTop: RFValue(6),
              lineHeight: 12,
            }}
          >
            {props.titleText}
          </Text>
          {props.date && (
            <Text
              style={{
                color: Colors.gray13,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansRegular,
                letterSpacing: 0.3,
                marginTop: RFValue(5),
              }}
            >
              Created {moment(props.date).format("lll")}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", width: '25%' }}>
          <Text
            style={{
              color: Colors.gray13,
              fontSize: RFValue(16),
              fontFamily: Fonts.FiraSansSemiBold,
              letterSpacing: 0.48,
            }}
          >
            {props.amt}
            <Text
              style={{
                color: Colors.gray13,
                fontSize: RFValue(8),
                fontFamily: Fonts.FiraSansRegular,
                // letterSpacing: 0.24,
              }}
            >
              {" "}
              {props.currency ? props.currency : "sats"}
            </Text>
          </Text>
          <Image
            source={require("../../assets/images/icons/icon_arrow.png")}
            style={{
              width: RFValue(10),
              height: RFValue(16),
              resizeMode: "contain",
              // marginBottom: hp( 0.7 ),
              // marginLeft: wp( 3 )
              marginStart: RFValue(20),
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ManageGiftsList;
