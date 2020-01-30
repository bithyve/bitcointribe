import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';

export default function TestAccountHelperModalContents(props) {
  return (
    <View style={styles.modalContainer}>
      <ScrollView>
        <View
          style={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <AppBottomSheetTouchableWrapper
              onPress={() => {
                if (props.onPressManageBackup) props.onPressManageBackup();
              }}
              style={{
                width: wp('85%'),
                height: wp('13%'),
                backgroundColor: Colors.homepageButtonColor,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('2%'),
                marginBottom: hp('1%'),
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontFamily: Fonts.FiraSansMedium,
                  fontSize: RFValue(14),
                }}
              >
                {props.topButtonText}
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <Image
              source={require('../../assets/images/icons/testAccountHelperImage.png')}
              style={{
                width: wp('45%'),
                height: wp('45%'),
                resizeMode: 'contain',
              }}
            />
          </View>
          { props.boldPara ? 
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('1%'),
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: Colors.white,
                marginLeft: 20,
                marginRight: 20,
                marginBottom: 10,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              {props.boldPara}
            </Text>
          </View> : null}
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('1%'),
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: Colors.white,
                marginLeft: 20,
                marginRight: 20,
                marginBottom: 10,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              {props.helperInfo}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          marginTop: hp('1%'),
          marginBottom: hp('2%'),
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressContinue()}
          style={{
            width: wp('40%'),
            height: wp('13%'),
            backgroundColor: Colors.white,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.continueButtonText}
          </Text>
        </AppBottomSheetTouchableWrapper>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressQuit()}
          style={{
            width: wp('20%'),
            height: wp('13%'),
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.quitButtonText}
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: hp('5%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
