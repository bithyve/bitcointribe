import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import NavStyles from '../../common/Styles/NavStyles';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

import {
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types';
import moment from 'moment';
import SmallNavHeaderBackButton from '../../components/navigation/SmallNavHeaderBackButton';


export default function FundingSourceDetails(props) {
  const FBTCAccount = props.navigation.state.params.getBittrAccount
    ? props.navigation.state.params.getBittrAccount
    : {};

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundColor1 }}>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.backgroundColor1 }} />

      <View style={styles.modalContainer}>
        <View style={NavStyles.modalNavHeaderContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SmallNavHeaderBackButton
              containerStyle={{ marginRight: 16 }}
              onPress={() => props.navigation.pop()}
            />

            <View style={{ flex: 1 }}>
              <Text style={NavStyles.modalHeaderTitleText}>
                Funding Sources Detail
              </Text>
              <Text style={NavStyles.modalHeaderSubtitleText}>
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
  modalContainer: {
    backgroundColor: Colors.backgroundColor1,
    width: '100%',
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
