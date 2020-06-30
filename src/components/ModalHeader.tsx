import React, { Component, memo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';

const ModalHeader = (props) => {
  //console.log("ModalHeader rendered")
  return <AppBottomSheetTouchableWrapper
    activeOpacity={10}
    onPress={() => props.onPressHeader()}
    style={{ ...styles.modalHeaderContainer, backgroundColor: props.backgroundColor ? props.backgroundColor : Colors.white, borderLeftColor: props.borderColor ? props.borderColor : Colors.borderColor, borderRightColor: props.borderColor ? props.borderColor : Colors.borderColor, borderTopColor: props.borderColor ? props.borderColor : Colors.borderColor }}
  >
    <View style={styles.modalHeaderHandle} />
  </AppBottomSheetTouchableWrapper>
}

export default memo(ModalHeader)

const styles = StyleSheet.create({
  modalHeaderContainer: {
    marginTop: 'auto',
    flex: 1,
    height: 20,
    borderTopLeftRadius: 10,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightWidth: 1,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
})