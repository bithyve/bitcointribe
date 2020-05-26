import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import BackupStyles from '../ManageBackup/Styles';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import BottomInfoBox from '../../components/BottomInfoBox';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import QRCodeWrapper from '../../components/qr-hoc';

export default function RecoveryTrustedQR(props) {
  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          ...BackupStyles.modalHeaderTitleView,
          marginLeft: 10,
          marginRight: 10,
          marginTop: 5,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
          >
            <Text style={BackupStyles.modalHeaderTitleText}>
              Trusted contact QR code
            </Text>
          </View>
        </View>
      </View>
      <View style={BackupStyles.modalContentView}>
        {!props.trustedQR ? (
          <View style={{ height: hp('27%'), justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
            <QRCodeWrapper value={props.trustedQR} size={hp('27%')} />
          )}
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk()}
          style={{
            backgroundColor: Colors.blue,
            borderRadius: 10,
            width: wp('50%'),
            height: wp('13%'),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp('3%'),
            marginBottom: hp('3%'),
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Yes, I have shared
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      <BottomInfoBox
        title={'Share your Recovery Secret'}
        infoText={
          'Open the QR scanner at the bottom of the Home screen on your Secondary Device and scan this QR'
        }
      />
    </View>
  );
}
