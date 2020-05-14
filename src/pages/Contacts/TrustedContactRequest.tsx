import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function TrustedContactRequest(props) {
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [onBlurFocus, setOnBlurFocus] = useState(false);
  return (
    <KeyboardAvoidingView
      style={{
        height: '100%',
        backgroundColor: Colors.white,
      }}
      behavior={Platform.OS == 'ios' ? 'padding' : ''}
      enabled
    >
      <ScrollView
        style={{
          ...styles.modalContentContainer,
          paddingBottom: onBlurFocus ? hp('30%') : 0,
        }}
      >
        <View>
          <View style={styles.successModalHeaderView}>
            <Text style={styles.modalTitleText}>
              Trusted Contact{'\n'}Request
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor
            </Text>
          </View>
          <View style={styles.box}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: hp('2%'),
              }}
            >
              <Image
                style={styles.successModalAmountImage}
                source={require('../../assets/images/icons/icon_wallet.png')}
              />
              <Text
                style={{
                  fontSize: RFValue(25),
                  fontFamily: Fonts.FiraSansRegular,
                  color: Colors.black1,
                }}
              >
                {props.trustedContactName}
              </Text>
            </View>
          </View>
          <Text
            style={{
              ...styles.modalInfoText,
              marginLeft: wp('8%'),
              marginRight: wp('8%'),
              marginBottom: wp('8%'),
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod{' '}
            <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>
              +91 XXX XXX X000
            </Text>
          </Text>
          <View style={{ marginLeft: wp('8%'), marginRight: wp('8%') }}>
            <Text
              style={styles.phoneNumberInfoText}
            >
              Enter Phone Number
            </Text>
            <View
              style={styles.textboxView}
            >
              <Text
                style={{...styles.countryCodeText, color: PhoneNumber
                  ? Colors.textColorGrey
                  : Colors.borderColor,}}
              >
                +91
              </Text>
              <View
                style={styles.seperatorView}
              />
              <TextInput
                keyboardType={'numeric'}
                placeholderTextColor={Colors.borderColor}
                placeholder={'Enter Phone Number'}
                onChangeText={(text) => {setPhoneNumber(text); props.onPhoneNumberChange(text)}}
                style={{ flex: 1 }}
                onFocus={() => {
                  setOnBlurFocus(true);
                  props.bottomSheetRef.current.snapTo(2);
                }}
                onBlur={() => {
                  setOnBlurFocus(false);
                  props.bottomSheetRef.current.snapTo(1);
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
              alignItems: 'center',
            }}
          >
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressAccept()}
              style={{ ...styles.successModalButtonView }}
            >
              {props.loading && props.loading == true ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.proceedButtonText}>Accept Request</Text>
              )}
            </AppBottomSheetTouchableWrapper>
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressReject()}
              style={{
                height: wp('13%'),
                width: wp('35%'),
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
                Reject Request
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    padding: hp('2%'),
    marginBottom: hp('3%'),
    borderRadius: 10,
    justifyContent: 'center',
  },
  successModalHeaderView: {
    marginTop: hp('3%'),
    marginBottom: hp('3%'),
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
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
  successModalAmountImage: {
    width: wp('15%'),
    height: wp('15%'),
    marginRight: 15,
    marginLeft: 10,
    marginBottom: wp('1%'),
    resizeMode: 'contain',
  },
  phoneNumberInfoText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    color: Colors.textColorGrey,
    marginBottom: wp('5%'),
  },
  textboxView:{
    flexDirection: 'row',
    paddingLeft: 15,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    marginBottom: wp('5%'),
    alignItems: 'center',
  },
  countryCodeText:{
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    paddingRight: 15,
  },
  seperatorView:{
    marginRight: 15,
    height: 25,
    width: 2,
    borderColor: Colors.borderColor,
    borderWidth: 1,
  }
});
