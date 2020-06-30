import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  TextInput,
  Keyboard,
  ScrollView,
  Linking,
  AsyncStorage,
  ActivityIndicator,
  Image,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import DeviceInfo from 'react-native-device-info';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';
import { UsNumberFormat } from '../../common/utilities';

export default function ExistingSavingMethodDetails(props) {
  const FBTCAccount = props.navigation.state.params.getBittrAccount
    ? props.navigation.state.params.getBittrAccount
    : {};

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1 }}>
      <StatusBar
        backgroundColor={Colors.backgroundColor1}
        barStyle="dark-content"
      />
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor1 }}
      />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ flex: 1, marginRight: 10, marginBottom: 10 }}>
              <Text style={styles.modalHeaderTitleText}>
                {'Funding Sources Detail'}
              </Text>
              <Text style={styles.modalHeaderSmallTitleText}>
                Funding sources full details
              </Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 15,
            marginBottom: 5,
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: Colors.borderColor,
            borderWidth: 1,
            borderRadius: 10,
          }}
        >
          <View
            style={{
              width: wp('10%'),
              height: wp('10%'),
              borderRadius: wp('10%') / 2,
              backgroundColor: Colors.backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: wp('3%'),
            }}
          >
            <Image
              source={require('../../assets/images/icons/fastbitcoin_dark.png')}
              style={{ width: wp('5%'), height: wp('5%') }}
            />
          </View>
          <View
            style={{ flex: 1, marginLeft: wp('3%'), marginRight: wp('3%') }}
          >
            <View
              style={{
                padding: wp('3%'),
                paddingLeft: wp('0%'),
                paddingRight: wp('0%'),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: Colors.blue,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(13),
                  }}
                >
                  Voucher Code {FBTCAccount.voucherCode}
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 'auto',
                  }}
                >
                  {moment(FBTCAccount.orderData.date)
                    .utc()
                    .format('DD MMMM YYYY')}
                </Text>
              </View>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(10),
                  marginTop: 5,
                }}
              >
                {FBTCAccount.accountType == REGULAR_ACCOUNT
                  ? 'Checking Account'
                  : 'Savings Account'}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: Colors.borderColor }} />
            <View
              style={{
                padding: wp('3%'),
                paddingLeft: wp('0%'),
                paddingRight: wp('0%'),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                  }}
                >
                  Voucher Amount
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(10),
                    marginLeft: 'auto',
                  }}
                >
                  Rate
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.transactionModalAmountView}>
                  <Image
                    source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                    style={{
                      width: wp('3%'),
                      height: wp('3%'),
                      resizeMode: 'contain',
                      marginBottom: wp('1%'),
                    }}
                  />
                  <Text style={styles.transactionModalAmountText}>
                    {FBTCAccount.quotes.bitcoin_amount
                      ? FBTCAccount.quotes.bitcoin_amount
                      : 0}
                  </Text>
                  <Text style={styles.transactionModalAmountUnitText}>
                    sats
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.transactionModalAmountView,
                    marginLeft: 'auto',
                  }}
                >
                  <Image
                    source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                    style={{
                      width: wp('3%'),
                      height: wp('3%'),
                      resizeMode: 'contain',
                      marginBottom: wp('1%'),
                    }}
                  />
                  <Text style={styles.transactionModalAmountText}>
                    {FBTCAccount.quotes.exchange_rate
                      ? FBTCAccount.quotes.exchange_rate
                      : 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 15,
            marginBottom: 5,
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: Colors.white,
            padding: wp('4%'),
            paddingLeft: wp('6%'),
          }}
        >
          <Text
            style={{
              color: Colors.black,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
            }}
          >
            Voucher Code
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
              marginTop: 5,
            }}
          >
            {FBTCAccount.voucherCode}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 5,
            marginBottom: 5,
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: Colors.white,
            padding: wp('4%'),
            paddingLeft: wp('6%'),
          }}
        >
          <Text
            style={{
              color: Colors.black,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
            }}
          >
            Amount
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
              marginTop: 5,
            }}
          >
            {FBTCAccount.quotes.amount}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 5,
            marginBottom: 5,
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: Colors.white,
            padding: wp('4%'),
            paddingLeft: wp('6%'),
          }}
        >
          <Text
            style={{
              color: Colors.black,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
            }}
          >
            Sats Received
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
              marginTop: 5,
            }}
          >
            {FBTCAccount.quotes.bitcoin_amount}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 5,
            marginBottom: 5,
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: Colors.white,
            padding: wp('4%'),
            paddingLeft: wp('6%'),
          }}
        >
          <Text
            style={{
              color: Colors.black,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
            }}
          >
            Rate
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
              marginTop: 5,
            }}
          >
            {FBTCAccount.quotes.exchange_rate}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 5,
            marginBottom: 5,
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: Colors.white,
            padding: wp('4%'),
            paddingLeft: wp('6%'),
          }}
        >
          <Text
            style={{
              color: Colors.black,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
            }}
          >
            Date
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
              marginTop: 5,
            }}
          >
            {moment(FBTCAccount.orderData.date).utc().format('DD MMMM YYYY')}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 5,
            marginBottom: 5,
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: Colors.white,
            padding: wp('4%'),
            paddingLeft: wp('6%'),
          }}
        >
          <Text
            style={{
              color: Colors.black,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
            }}
          >
            Receive In account
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(13),
              marginTop: 5,
            }}
          >
            {FBTCAccount.accountType == REGULAR_ACCOUNT
              ? 'Checking Account'
              : 'Savings Account'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    backgroundColor: Colors.backgroundColor1,
    width: '100%',
  },
  modalHeaderSmallTitleText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: 10,
  },

  transactionModalAmountView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  transactionModalAmountText: {
    marginRight: 5,
    fontSize: RFValue(17),
    fontFamily: Fonts.OpenSans,
    color: Colors.textColorGrey,
  },
  transactionModalAmountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.OpenSans,
    lineHeight: RFValue(18),
  },
});
