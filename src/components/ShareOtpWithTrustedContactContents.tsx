import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import CommonStyles from '../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import ContactList from '../components/ContactList';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import KnowMoreButton from '../components/KnowMoreButton';

export default function ShareOtpWithTrustedContactContents(props) {
  const OTP = props.OTP;
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              props.onPressBack();
            }}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View>
            <Text style={styles.modalHeaderTitleText}>
              Share OTP with{'\n'}trusted contact
            </Text>
            <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
              Please provide this OTP to your trusted contact in order for them
              to send you the recovery secret
            </Text>
          </View>
          {/* <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
            <KnowMoreButton
              onpress={() => { }}
              containerStyle={{}}
              textStyle={{}}
            />
            <Image
              source={require('../assets/images/icons/icon_error_red.png')}
              style={{
                width: wp('5%'),
                height: wp('5%'),
                resizeMode: 'contain',
              }}
            />
          </View> */}
        </View>
      </View>
      <View style={{ flex: 1, marginLeft: 30, marginRight: 30 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: hp('5%'),
            marginBottom: hp('5%'),
          }}
        >
          <View
            style={{
              height: wp('12%'),
              width: wp('12%'),
              backgroundColor: Colors.backgroundColor,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.otpText}>{OTP[0]}</Text>
          </View>
          <View
            style={{
              height: wp('12%'),
              width: wp('12%'),
              backgroundColor: Colors.backgroundColor,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.otpText}>{OTP[1]}</Text>
          </View>
          <View
            style={{
              height: wp('12%'),
              width: wp('12%'),
              backgroundColor: Colors.backgroundColor,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.otpText}>{OTP[2]}</Text>
          </View>
          <View
            style={{
              height: wp('12%'),
              width: wp('12%'),
              backgroundColor: Colors.backgroundColor,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.otpText}>{OTP[3]}</Text>
          </View>
          <View
            style={{
              height: wp('12%'),
              width: wp('12%'),
              backgroundColor: Colors.backgroundColor,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.otpText}>{OTP[4]}</Text>
          </View>
          <View style={styles.otpTextView}>
            <Text style={styles.otpText}>{OTP[5]}</Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
          This OTP is only valid for 10 minutes, if the OTP{'\n'}expires you
          will be asked to create a new one
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: Colors.borderColor,
            marginTop: hp('5%'),
            marginBottom: hp('3%'),
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons color={Colors.blue} size={17} name={'md-time'} />
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(19),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: 10,
            }}
          >
            09 : 12
          </Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.borderColor,
    alignSelf: "center",
    width: "100%"
  },
  modalHeaderTitleView: {
    // borderBottomWidth: 1,
    // borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('3%'),
    paddingTop: hp('2%'),
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
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
  otpText:{
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(23),
  },
  otpTextView:{
    height: wp('12%'),
    width: wp('12%'),
    backgroundColor: Colors.backgroundColor,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
