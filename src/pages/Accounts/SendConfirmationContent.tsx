import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import commonStyle from '../../common/Styles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DeviceInfo from 'react-native-device-info';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { nameToInitials } from '../../common/CommonFunctions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';

export default function SendConfirmationContent(props) {
  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  const renderContacts = (item) => {
    return (
      <TouchableOpacity style={styles.contactProfileView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              backgroundColor: Colors.backgroundColor1,
              height: 90,
              position: 'relative',
              borderRadius: 10,
            }}
          >
            <View style={{ marginLeft: 70 }}>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(11),
                  marginLeft: 25,
                  paddingTop: 5,
                  paddingBottom: 3,
                }}
              >
                Sending to:
              </Text>
              <Text style={styles.contactNameText}>
                {item.selectedContact.name ||
                  item.selectedContact.account_name ||
                  item.selectedContact.id}
              </Text>
              {item.hasOwnProperty('bitcoinAmount') ||
              item.hasOwnProperty('currencyAmount') ? (
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 25,
                    paddingTop: 3,
                  }}
                >
                  {item.bitcoinAmount
                    ? item.bitcoinAmount + ' Sats'
                    : '$ ' + item.currencyAmount
                    ? item.currencyAmount
                    : ''}
                </Text>
              ) : null}
            </View>
            <Ionicons
              style={{ marginLeft: 'auto', marginRight: 10 }}
              name={dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'}
              size={20}
              color={Colors.borderColor}
            />
          </View>
          {item.selectedContact.imageAvailable ? (
            <View
              style={{
                position: 'absolute',
                marginLeft: 15,
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
            >
              <Image
                source={item.selectedContact.image}
                style={{ ...styles.contactProfileImage }}
              />
            </View>
          ) : (
            <View
              style={{
                position: 'absolute',
                marginLeft: 15,
                marginRight: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.backgroundColor,
                width: 70,
                height: 70,
                borderRadius: 70 / 2,
                shadowColor: Colors.shadowBlue,
                shadowOpacity: 1,
                shadowOffset: { width: 2, height: 2 },
              }}
            >
              {item.selectedContact && item.selectedContact.name ? (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: RFValue(20),
                    lineHeight: RFValue(20), //... One for top and one for bottom alignment
                  }}
                >
                  {nameToInitials(
                    item.selectedContact.firstName &&
                      item.selectedContact.lastName
                      ? item.selectedContact.firstName +
                          ' ' +
                          item.selectedContact.lastName
                      : item.selectedContact.firstName &&
                        !item.selectedContact.lastName
                      ? item.selectedContact.firstName
                      : !item.selectedContact.firstName &&
                        item.selectedContact.lastName
                      ? item.selectedContact.lastName
                      : '',
                  )}
                </Text>
              ) : (
                <Image
                  source={require('../../assets/images/icons/icon_user.png')}
                  style={styles.contactProfileImage}
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ height: '100%', backgroundColor: Colors.white }}>
      <View
        style={{
          ...styles.successModalHeaderView,
          marginRight: wp('8%'),
          marginLeft: wp('8%'),
        }}
      >
        <Text style={styles.modalTitleText}>{props.title}</Text>
        <Text style={{ ...styles.modalInfoText, marginTop: wp('1%') }}>
          {props.info}
        </Text>
      </View>
        <View style={{ flex: 1, marginRight: wp('8%'),
        marginLeft: wp('8%'), marginTop: hp('2%'), marginBottom: hp('2%') }}>
          {props.userInfo && props.userInfo.length > 0 ? (
              <ScrollView>
                {props.userInfo.map((item) => renderContacts(item))}
              </ScrollView>
            ) : null}
        </View>
        <View
          style={{
            marginTop: hp('1%'),
            marginBottom: hp('1%'),
            marginRight: wp('8%'),
        marginLeft: wp('8%'),
          }}
        >
          <Text style={{ ...styles.modalInfoText }}>
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore'
            }
          </Text>
          </View>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 'auto',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk()}
          style={{ ...styles.successModalButtonView }}
        >
          <Text style={styles.proceedButtonText}>{props.okButtonText}</Text>
        </AppBottomSheetTouchableWrapper>
        {props.isCancel && (
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressCancel()}
            style={{
              height: wp('13%'),
              width: wp('35%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
              {props.cancelButtonText}
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}
        {(props.isSuccess || props.isUnSuccess) && (
          <Image
            style={{
              width: wp('25%'),
              height: hp('18%'),
              marginLeft: 'auto',
              resizeMode: 'cover',
            }}
            source={
              props.isSuccess
                ? require('../../assets/images/icons/sendSuccess.png')
                : require('../../assets/images/icons/sendError.png')
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp('5%'),
    marginLeft: wp('5%'),
    marginBottom: hp('3%'),
    borderRadius: 10,
    justifyContent: 'center',
    padding: wp('5%'),
  },
  successModalHeaderView: {
    marginBottom: hp('1%'),
    marginTop: hp('1%'),
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
  successModalAmountView: {
    marginRight: wp('10%'),
    marginLeft: wp('10%'),
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    paddingRight: 10,
    flex: 1,
  },
  successModalAmountImage: {
    width: wp('15%'),
    height: wp('15%'),
    marginRight: 15,
    marginLeft: 10,
    // marginBottom: wp("1%"),
    resizeMode: 'contain',
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(21),
    marginLeft: 5,
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
  },
  successModalAmountInfoView: {
    flex: 0.4,
    marginRight: wp('10%'),
    marginLeft: wp('10%'),
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
  separator: {
    height: 2,
    marginLeft: wp('2%'),
    marginRight: wp('2%'),
    backgroundColor: Colors.borderColor,
  },
  sendSuccessView: {
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginBottom: wp('1%'),
    flexDirection: 'row',
  },
  sendSuccessInfoTitle: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
  },
  contactProfileView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
});
