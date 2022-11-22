import React, { useContext, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { AppBottomSheetTouchableWrapper } from "../AppBottomSheetTouchableWrapper";
import { LocalizationContext } from "../../common/content/LocContext";
import Gifts from "../../assets/images/satCards/gifts.svg";
import Add_gifts from "../../assets/images/satCards/Add_gifts.svg";

export type Props = {
  closeModal: () => {};
  sendRequestToContact: () => {};
  createGifts: () => {};
};

const CreateFNFInvite = (props: Props) => {
  const { translations } = useContext(LocalizationContext);
  return (
    <View style={styles.modalContentContainer}>
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
          style={
            {
              // marginTop: hp( 0.5 )
            }
          }
        />
      </AppBottomSheetTouchableWrapper>
      <View style={{ padding: 10 }}>
        <View>
          <Text
            style={[
              styles.titleText,
              { fontSize: RFValue(14), marginBottom: 10 },
            ]}
          >
            Create an F{"&"}F invite
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cardBackView}
          onPress={() => props.sendRequestToContact()}
        >
          <View style={{width: '15%'}}>
            <Add_gifts />
          </View>
          <View style={{width: '85%'}}>
            <Text style={[styles.titleText, { fontSize: RFValue(12) }]}>
              Create Invitation link
            </Text>
            <Text style={styles.paragraphTitleText}>
              Send an invite link to any of your family and friends using
              generated link
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardBackView}
          onPress={() => props.createGifts()}
        >
          <View style={{width: '15%'}}>
            <Gifts />
          </View>
          <View style={{width: '85%'}}>
            <Text style={[styles.titleText, { fontSize: RFValue(12) }]}>
              Create Invitation link with gift
            </Text>
            <Text style={styles.paragraphTitleText}>
              Add gifts when sending an invite link to any of your family and
              friends using the generated link
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  modalContentContainer: {
    backgroundColor: Colors.white,
    padding: 10,
  },
  titleText: {
    color: Colors.blueText,
    fontWeight: "600",
    marginBottom: 5,
    fontFamily: Fonts.RobotoSlabRegular,
  },
  paragraphTitleText: {
    fontSize: 12,
    color: Colors.gray3,
    textAlign: 'left',
    flexWrap: 'wrap',
    fontFamily: Fonts.RobotoSlabRegular,
  },
  cardBackView: {
    alignItems: 'center',
    flexDirection: "row",
    width: "100%",
    backgroundColor: Colors.numberBg,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
});
export default CreateFNFInvite;
