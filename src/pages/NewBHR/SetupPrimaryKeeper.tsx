import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import CopyThisText from '../../components/CopyThisText';

export default function SetupPrimaryKeeper(props) {
  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View style={{ height: '100%' }}>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.headerText}>
            {props.title}
          </Text>
          <Text style={styles.modalInfoText}>
            {props.subText}
          </Text>
        </View>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressContinue()}
          activeOpacity={10}
          style={{
            ...styles.grayBox,
            width: wp('90%'),
            height: wp('20%'),
          }}
        >
          <Image
            source={require('../../assets/images/icons/setupPK.png')}
            style={{ width: wp('85%'), height: wp('15%'), resizeMode: 'cover' }}
          />
        </AppBottomSheetTouchableWrapper>
        <CopyThisText text={props.textToCopy}/>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.modalInfoText}>
            {props.info}
          </Text>
        </View>
        <View
          style={{
            height: hp('18%'),
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'center',
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressContinue()}
            style={styles.successModalButtonView}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.white,
              }}
            >
              {props.proceedButtonText}
            </Text>
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={{
              height: wp('13%'),
              width: wp('35%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.blue,
              }}
            >
              {props.backButtonText}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
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
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: wp('1.5%'),
    color: Colors.lightTextColor,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  grayBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: wp('5%'),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
  },
  successModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp('8%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
