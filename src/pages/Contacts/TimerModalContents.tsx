import React, { useState } from 'react';
import { View, Text, StyleSheet, AsyncStorage } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import CountDown from 'react-native-countdown-component';
import { config } from 'process';
import Config from '../../bitcoin/HexaConfig';

export default function TimerModalContents(props) {
  const [showMessage, setShowMessage] = useState(false);

  const setDoNotShowTimer = async () => {
    if (showMessage) {
      await AsyncStorage.setItem('TCRequestTimer', JSON.stringify(true));
    }
    props.onTimerFinish();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View>
          <Text style={styles.modalHeaderTitleText}>Added Successfully</Text>
          <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
            Your request has been sent successfully, once it is accepted by ,
            they will appear in your F&F list.
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, marginLeft: 20, marginRight: 20 }}>
        <AppBottomSheetTouchableWrapper
          activeOpacity={10}
          onPress={() => setShowMessage(!showMessage)}
          style={{
            flexDirection: 'row',
            borderRadius: 8,
            backgroundColor: Colors.backgroundColor,
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            Never show this message again
          </Text>
          <View
            style={{
              width: wp('7%'),
              height: wp('7%'),
              borderRadius: 7,
              backgroundColor: Colors.white,
              borderColor: Colors.borderColor,
              borderWidth: 1,
              marginLeft: 'auto',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showMessage && (
              <Entypo name="check" size={RFValue(17)} color={Colors.green} />
            )}
          </View>
        </AppBottomSheetTouchableWrapper>
        <View style={styles.bottomView}>
          <View style={styles.bottomInnerView}>
            <Ionicons color={Colors.blue} size={18} name={'md-time'} />
            {props.renderTimer ? (
              <CountDown
                size={15}
                until={Config.TC_REQUEST_EXPIRY}
                onFinish={() => props.onTimerFinish()}
                digitStyle={{
                  backgroundColor: '#FFF',
                  borderWidth: 0,
                  borderColor: '#FFF',
                  margin: -10,
                }}
                digitTxtStyle={{
                  color: Colors.blue,
                  fontSize: RFValue(19),
                  fontFamily: Fonts.FiraSansRegular,
                }}
                separatorStyle={{ color: Colors.blue }}
                timeToShow={['H', 'M', 'S']}
                timeLabels={{ h: null, m: null, s: null }}
                showSeparator
              />
            ) : null}
          </View>

          <AppBottomSheetTouchableWrapper
            onPress={() => setDoNotShowTimer()}
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
              Continue
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
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
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    marginTop: 15,
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
    marginRight: 20,
    flexWrap: 'wrap',
  },
  qrModalImage: {
    width: wp('100%'),
    height: wp('100%'),
    borderRadius: 20,
  },
  otpText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(23),
  },
  otpTextView: {
    height: wp('12%'),
    width: wp('12%'),
    backgroundColor: Colors.backgroundColor,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('5%'),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderColor,
    marginTop: hp('5%'),
    marginBottom: hp('3%'),
  },
  bottomView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomInnerView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timerText: {
    color: Colors.blue,
    fontSize: RFValue(19),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
});
