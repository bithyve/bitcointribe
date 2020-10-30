import React from 'react';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';


const BottomSheetHeader = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.headerContainer}
    >
      <Text style={styles.titleText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    paddingHorizontal: 16,
  },

  titleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
});


export default BottomSheetHeader;
