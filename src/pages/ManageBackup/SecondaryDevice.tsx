import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import NavStyles from '../../common/Styles/NavStyles';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import BottomInfoBox from '../../components/BottomInfoBox';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import QRCode from 'react-native-qrcode-svg';


export default function SecondaryDeviceModelContents(props) {
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
          ...NavStyles.modalHeaderTitleView,
          paddingTop: hp('0.5%'),
          alignItems: 'center',
          marginLeft: 20,
        }}
      >
        <Text style={NavStyles.modalHeaderTitleText}>Scan QR Code</Text>
      </View>
      <View style={NavStyles.modalContentView}>
        {!props.secondaryQR ? (
          <View style={{ height: hp('27%'), justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
            <QRCode value={props.secondaryQR} size={hp('27%')} />
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
            Yes, I have scanned
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      <BottomInfoBox
        title={'Share your Recovery Key'}
        infoText={
          'Open the QR scanner at the bottom of the Home screen on your Keeper Device and scan this QR'
        }
      />
    </View>
  );
}
