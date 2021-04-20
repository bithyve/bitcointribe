import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageBackground } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DeleteRecoveryKeys(props) {
  return (
    <View style={styles.modalContentContainer}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerTitleText}>{props.title}</Text>
        <Text style={styles.headerInfoText}>{props.subText}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {props.dataList.length
          ? props.dataList.map((item) => (
              <View style={styles.greyBox}>
                <ImageBackground
                  source={require('../../assets/images/icons/Ellipse.png')}
                  style={{ ...styles.cardsImageView, marginRight: 10 }}
                >
                  <Image
                    source={
                      item.type == 'contact'
                        ? require('../../assets/images/icons/icon_contact.png')
                        : item.type == 'device'
                        ? require('../../assets/images/icons/icon_secondarydevice.png')
                        : require('../../assets/images/icons/icon_contact.png')
                    }
                    style={styles.cardImage}
                  />
                </ImageBackground>
                <View style={{ marginLeft: 5, flex: 1 }}>
                  <Text style={styles.greyBoxText}>
                    {'Delete Recovery Key From'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      ...styles.greyBoxText,
                      fontSize: RFValue(20),
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      ...styles.greyBoxText,
                      fontSize: RFValue(10),
                    }}
                  >
                    {item.typeName}
                  </Text>
                </View>
              </View>
            ))
          : null}
      </View>
      <View style={styles.successModalAmountView}>
        <Text style={styles.bottomInfoText}>{props.info}</Text>
      </View>
      <View style={styles.bottomButtonsView}>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressProceed()}
          style={styles.successModalButtonView}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.white,
            }}
          >
            {'Proceed'}
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: wp('1.5%'),
  },
  bottomInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: hp('1%'),
    marginTop: 'auto',
  },
  bottomButtonsView: {
    height: hp('15%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  transparentButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalHeaderView: {
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: wp('4%'),
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: 'auto',
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
  greyBox: {
    width: wp('90%'),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greyBoxImage: {
    width: wp('15%'),
    height: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: wp('15%') / 2,
    borderColor: Colors.white,
    borderWidth: 1,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowColor: Colors.textColorGrey,
    shadowRadius: 5,
    elevation: 10,
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
  },
  successModalImage: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
  cardsImageView: {
    width: wp('20%'),
    height: wp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp('7%'),
    height: wp('7%'),
    resizeMode: 'contain',
    marginBottom: wp('1%'),
  },
});
