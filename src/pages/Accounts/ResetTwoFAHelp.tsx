import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';
import { useSelector, useDispatch } from 'react-redux';
import {
  generateSecondaryXpriv,
  resetTwoFA,
  twoFAResetted,
  secondaryXprivGenerated,
  clearTransfer,
} from '../../store/actions/accounts';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../common/Fonts';
import CommonStyles from '../../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QrCodeModalContents from '../../components/QrCodeModalContents';

const ResetTwoFAHelp = (props) => {
  
    return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row' }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View>
            <Text style={styles.modalHeaderTitleText}>
              {'Having trouble with\nyour 2FA'}
            </Text>
            <Text style={styles.modalHeaderInfoText}>
              Lorem ipsum dolor sit amet, consectetur{'\n'}adipiscing elit, sed
              do eiusmod tempor
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <AppBottomSheetTouchableWrapper
          onPress={() => {
              props.onClickResetTwoFA();
            // props.navigation.navigate('QrScanner', {
            //   title: 'Scan Secondary Mnemonic',
            //   scanedCode: (qrData) => {
            //     dispatch(resetTwoFA(qrData));
            //   },
            // });
          }}
          style={{ ...styles.selectedContactsView, marginBottom: hp('3%') }}
        >
          <Image
            source={require('../../assets/images/icons/icon_power.png')}
            style={{
              width: wp('7%'),
              height: wp('7%'),
              resizeMode: 'contain',
              marginLeft: 0,
              marginRight: 10,
            }}
          />
          <View>
            <Text style={styles.titleText}>Reset 2FA</Text>
            <Text style={styles.infoText}>
              In case you've forgotten your 2FA
            </Text>
          </View>
          <View
            style={{
              width: wp('17%'),
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 'auto',
            }}
          >
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.textColorGrey}
              size={15}
              style={{
                marginLeft: 'auto',
                alignSelf: 'center',
                marginRight: 20,
              }}
            />
          </View>
        </AppBottomSheetTouchableWrapper>

        <AppBottomSheetTouchableWrapper
          onPress={() => {
            props.onClickServerIsNotResponding();
            // props.navigation.navigate('QrScanner', {
            //   title: 'Scan Secondary Mnemonic',
            //   scanedCode: (qrData) => {
            //     dispatch(generateSecondaryXpriv(SECURE_ACCOUNT, qrData));
            //   },
            // });
          }}
          style={{ ...styles.selectedContactsView, marginBottom: hp('3%') }}
        >
          <Image
            source={require('../../assets/images/icons/icon_gear.png')}
            style={{
              width: wp('7%'),
              height: wp('7%'),
              resizeMode: 'contain',
              marginLeft: 0,
              marginRight: 10,
            }}
          />
          <View>
            <Text style={styles.titleText}>Server is not responding</Text>
            <Text style={styles.infoText}>
              The 2FA you are entering is invalid
            </Text>
          </View>
          <View
            style={{
              width: wp('17%'),
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 'auto',
            }}
          >
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.textColorGrey}
              size={15}
              style={{
                marginLeft: 'auto',
                alignSelf: 'center',
                marginRight: 20,
              }}
            />
          </View>
        </AppBottomSheetTouchableWrapper>
      </View>
      <View
        style={{
          marginRight: 30,
          marginLeft: 30,
          marginTop: 'auto',
          marginBottom: hp('3%'),
        }}
      >
        <Text style={{ ...styles.modalHeaderInfoText }}>
          Lorem ipsum dolor sit amet, consectetur{'\n'}adipiscing elit, sed do
          eiusmod tempor
        </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 10,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp('0.7%'),
  },
  modalContentView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
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
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  infoText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
});

export default ResetTwoFAHelp;
