import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import { UsNumberFormat } from '../../common/utilities';
import {
  TEST_ACCOUNT,
  SUB_PRIMARY_ACCOUNT,
} from '../../common/constants/wallet-service-types';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import openLink from '../../utils/OpenLink';

export default function TransactionDetailsBottomSheetContent(props) {
  const txDetails = props.item;
  if (!txDetails) {
    return null;
  }
  const serviceType = props.serviceType ? props.serviceType : null;

  const getImageByAccountType = (accountType, primaryAccType?) => {
    if (accountType == 'FAST_BITCOINS') {
      return (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: Colors.borderColor,
            borderWidth: 0.5,
            borderRadius: wp('12%') / 2,
            width: wp('12%'),
            height: wp('12%'),
            backgroundColor: Colors.white,
          }}
        >
          <Image
            source={require('../../assets/images/icons/fastbitcoin_dark.png')}
            style={{
              width: wp('8%'),
              height: wp('8%'),
              resizeMode: 'contain',
            }}
          />
        </View>
      );
    } else if (
      accountType == 'Savings Account' ||
      accountType == 'Test Account' ||
      accountType == 'Checking Account' ||
      accountType == 'Donation Account' ||
      accountType === SUB_PRIMARY_ACCOUNT
    ) {
      return (
        <View>
          <Image
            source={
              accountType === SUB_PRIMARY_ACCOUNT
                ? primaryAccType === 'Savings Account'
                  ? require('../../assets/images/icons/icon_secureaccount.png')
                  : require('../../assets/images/icons/icon_regular.png')
                : accountType == 'Donation Account'
                ? require('../../assets/images/icons/icon_donation_account.png')
                : accountType == 'Savings Account'
                ? require('../../assets/images/icons/icon_secureaccount.png')
                : accountType == 'Test Account'
                ? require('../../assets/images/icons/icon_test.png')
                : require('../../assets/images/icons/icon_regular.png')
            }
            style={{ width: wp('12%'), height: wp('12%') }}
          />
        </View>
      );
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={styles.modalHeaderTitleText}>
            {'Transaction Details'}
          </Text>
          {serviceType && serviceType == TEST_ACCOUNT ? (
            <AppBottomSheetTouchableWrapper
              style={{ marginLeft: 'auto', marginRight: wp('2%') }}
              onPress={() => props.onPressKnowMore()}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  marginLeft: 'auto',
                }}
              >
                Know more
              </Text>
            </AppBottomSheetTouchableWrapper>
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
        {getImageByAccountType(txDetails.accountType, txDetails.primaryAccType)}
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
              {txDetails.accountType === SUB_PRIMARY_ACCOUNT
                ? txDetails.primaryAccType
                : txDetails.accountType}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
                marginTop: hp('1%'),
              }}
            >
              {moment(txDetails.date).utc().format('DD MMMM YYYY')}
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
            name={
              txDetails.transactionType == 'Received'
                ? 'long-arrow-down'
                : 'long-arrow-up'
            }
            color={
              txDetails.transactionType == 'Received'
                ? Colors.green
                : Colors.red
            }
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
              {txDetails.accountType == 'Test Account' ? ' t-sats' : ' sats'}
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
              {txDetails.recipientAddresses.length > 1
                ? 'To Addresses'
                : 'To Address'}
            </Text>
            {txDetails.recipientAddresses.map((address) => (
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('0.5%'),
                }}
              >
                {address}
              </Text>
            ))}
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
              {txDetails.senderAddresses.length > 1
                ? 'From Addresses'
                : 'From Address'}
            </Text>
            {txDetails.senderAddresses.map((address) => (
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginTop: hp('0.5%'),
                }}
              >
                {address}
              </Text>
            ))}
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
            {UsNumberFormat(txDetails.fee)}{' '}
            {txDetails.accountType == 'Test Account' ? ' t-sats' : ' sats'}
          </Text>
        </View>
        {txDetails.message ? (
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              Note
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
                marginTop: hp('0.5%'),
              }}
            >
              {txDetails.message}
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
            Transaction ID
          </Text>
          <AppBottomSheetTouchableWrapper
            onPress={() =>
              openLink(
                `https://blockstream.info${
                  txDetails.accountType === 'Test Account' ? '/testnet' : ''
                }/tx/${txDetails.txid}`,
              )
            }
          >
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
          </AppBottomSheetTouchableWrapper>
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
            {txDetails.accountType === 'Test Account'
              ? txDetails.confirmations < 6
                ? txDetails.confirmations
                : txDetails.confirmations === '-' // for testnet faucet tx
                ? txDetails.confirmations
                : '6+'
              : txDetails.confirmations < 6
              ? txDetails.confirmations
              : '6+'}
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
    width: '100%',
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
