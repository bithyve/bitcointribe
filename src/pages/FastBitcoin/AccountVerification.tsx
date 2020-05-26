import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CopyThisText from '../../components/CopyThisText';

export default function AccountVerification(props) {
  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View style={{ height: '100%' }}>
        <View style={styles.successModalHeaderView}>
          <Text
            style={{
              color: props.headerTextColor
                ? props.headerTextColor
                : Colors.blue,
              fontSize: RFValue(18),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            {'Fast Bitcoin\nAccount Verification'}
          </Text>
          <Text
            style={{
              ...styles.modalInfoText,
              marginTop: wp('1.5%'),
              color: Colors.lightTextColor,
            }}
          >
            {'Lorem ipsum dolor sit amet, consectetur'}
          </Text>
        </View>
        <View style={styles.successModalAmountView}>
          <Text
            style={{
              ...styles.modalInfoText,
              marginBottom: hp('1%'),
              marginTop: 'auto',
            }}
          >
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore'
            }
          </Text>
        </View>
          <CopyThisText 
            text={props.link}
            openLink={() => {
              props.openLinkVerification();
            }} 
          />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: wp('5%'),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: hp('2%'),
  }
});
