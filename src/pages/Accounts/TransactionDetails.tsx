import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableWithoutFeedback,
  AsyncStorage,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import CommonStyles from '../../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import ContactList from '../../components/ContactList';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import { UsNumberFormat } from '../../common/utilities';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';

export default function TransactionDetails(props) {
  const txDetails = props.item;
  const getServiceType = props.getServiceType
    ? props.getServiceType
    : null;
  const serviceType = props.serviceType
    ? props.serviceType
    : null;
console.log("txDetails", txDetails, getServiceType, serviceType);
  return (
          <View style={styles.modalContainer}>
          <View style={styles.modalHeaderTitleView}>
            <View
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            >
              {/* <TouchableOpacity
                onPress={() => {
                  if (getServiceType && serviceType) {
                    getServiceType(serviceType);
                  }
                  props.navigation.goBack();
                }}
                style={{ height: 30, width: 30, justifyContent: 'center' }}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </TouchableOpacity> */}
              <Text style={styles.modalHeaderTitleText}>
                {'Transaction Details'}
              </Text>
              {serviceType && serviceType == TEST_ACCOUNT ? (
                <Text
                  onPress={() => props.onPressKnowMore()}
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(12),
                    marginLeft: 'auto',
                  }}
                >
                  Know more
                </Text>
              ) : null}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: hp('2%'),
              marginRight: hp('2%'),
              alignItems: 'center',
              paddingTop: hp('2%'),
              paddingBottom: hp('2%'),
            }}
          >
            <View>
              <Image
                source={require('../../assets/images/icons/icon_regular.png')}
                style={{ width: wp('12%'), height: wp('12%') }}
              />
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 10,
              }}
            >
              <View>
                <Text
                  style={{
                    color: Colors.blue,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(14),
                  }}
                >
                  {txDetails.accountType}
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(12),
                    marginTop: hp('1%'),
                  }}
                >
                  {moment(txDetails.date)
                    .utc()
                    .format('DD MMMM YYYY')}
                  {/* <Entypo
                size={10}
                name={"dot-single"}
                color={Colors.textColorGrey}
              />{" "}
              11:00am */}
                </Text>
              </View>
              <FontAwesome
                style={{ marginLeft: 'auto' }}
                name="long-arrow-down"
                color={Colors.green}
                size={17}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.infoCardView}>
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                Amount
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: hp('0.5%'),
                }}
              >
                <Image
                  source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                  style={{
                    width: wp('3%'),
                    height: wp('3%'),
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(12),
                    marginLeft: 3,
                  }}
                >
                  {UsNumberFormat(txDetails.amount)}
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(12),
                    marginLeft: 3,
                  }}
                >
                  {txDetails.accountType == 'Test Account'
                    ? ' t-sats'
                    : ' sats'}
                </Text>
              </View>
            </View>
            {txDetails.recipientAddresses ? (
              <View style={styles.infoCardView}>
                <Text
                  style={{
                    color: Colors.blue,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(12),
                  }}
                >
                  To Address
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(12),
                    marginTop: hp('0.5%'),
                  }}
                >
                  {txDetails.recipientAddresses[0]}
                </Text>
              </View>
            ) : null}
            {txDetails.senderAddresses ? (
              <View style={styles.infoCardView}>
                <Text
                  style={{
                    color: Colors.blue,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(12),
                  }}
                >
                  From Address
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(12),
                    marginTop: hp('0.5%'),
                  }}
                >
                  {txDetails.senderAddresses[0]}
                </Text>
              </View>
            ) : null}
            <View style={styles.infoCardView}>
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                Fees
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('0.5%'),
                }}
              >
                {UsNumberFormat(txDetails.fee)}
              </Text>
            </View>
            <View style={styles.infoCardView}>
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                Transaction ID
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('0.5%'),
                }}
              >
                {txDetails.txid}
              </Text>
            </View>
            <View style={styles.infoCardView}>
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                Confirmations
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('0.5%'),
                }}
              >
                {txDetails.confirmations < 6 ? txDetails.confirmations : '6+'}
              </Text>
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
        width: '100%'
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  infoCardView: {
    backgroundColor: Colors.white,
    marginLeft: hp('2%'),
    marginRight: hp('2%'),
    height: hp('8%'),
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: hp('2%'),
    paddingRight: hp('2%'),
    marginBottom: hp('0.5%'),
    marginTop: hp('0.5%'),
  },
});
