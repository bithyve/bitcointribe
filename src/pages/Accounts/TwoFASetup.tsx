import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CopyThisText from '../../components/CopyThisText';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import { uploadEncMShare } from '../../store/actions/sss';
import QRCode from 'react-native-qrcode-svg';


const TwoFASetup = props => {
  const twoFASetup = props.navigation.getParam('twoFASetup');
  const onPressBack = props.navigation.getParam('onPressBack');
  const { qrData, secret } = twoFASetup;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.headerContainer}>
        <TouchableOpacity
          style={BackupStyles.headerLeftIconContainer}
          onPress={
            onPressBack
              ? onPressBack
              : () => {
                props.navigation.goBack();
              }
          }
        >
          <View style={BackupStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ marginTop: hp('1%') }}>
          <Text style={BackupStyles.modalHeaderTitleText}>
            Setup Two Factor Authentication
          </Text>
          <Text style={BackupStyles.modalHeaderInfoText}>
            Please scan the following QR on your authenticator app like Google
            Authenticator in order to setup the 2FA
          </Text>
          <Text style={BackupStyles.modalHeaderInfoText}>
            The authenticator app should be installed on another device
            like your Keeper Device
          </Text>
        </View>
      </View>
      <View style={BackupStyles.modalContentView}>
        <QRCode value={qrData} size={hp('27%')} />
        <CopyThisText text={secret} />
      </View>
      <View style={{ margin: 20 }}>
        <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={
              onPressBack
                ? onPressBack
                : () => {
                  // props.navigation.navigate('GoogleAuthenticatorOTP');
                  props.navigation.goBack();
                }
            }
            style={{
              height: wp('13%'),
              width: wp('40%'),
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              onPressBack
                ? onPressBack
                : () => {
                  props.navigation.goBack();
                }
            }
            style={{
              height: wp('13%'),
              width: wp('30%'),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
          >
            {/* <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Activate Later
            </Text> */}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: { height: hp('27%'), justifyContent: 'center' },
});

export default TwoFASetup;
