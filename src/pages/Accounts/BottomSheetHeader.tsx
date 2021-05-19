import React from 'react';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const BottomSheetHeader = ({ title, onPress }) => {
  if (!title)  { return null }
  return (
    <View style={{ backgroundColor: Colors.white }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={styles.headerContainer}
      >
        <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
        <Text style={styles.titleText}>{title}</Text>
      </TouchableOpacity>
      <Text style={styles.modalInfoText}>
        Many ways to stack sats directly in Hexa
      </Text>
    <View style={{ borderWidth: 0.5, borderColor: '#E3E3E3', marginHorizontal: 16, marginTop: 9,  alignSelf: 'center', width: wp('93%') }} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 15,
    
  },
  modalInfoText: {
    marginLeft: wp( '11%' ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
  },
  titleText: {
    marginLeft: 9,
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
});


export default BottomSheetHeader;
