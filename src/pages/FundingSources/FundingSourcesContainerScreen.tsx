import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types';
import moment from 'moment';
import BottomInfoBox from '../../components/BottomInfoBox';
import { useSelector } from 'react-redux';
import Loader from '../../components/loader';
import SmallNavHeaderBackButton from '../../components/navigation/SmallNavHeaderBackButton';

export default function FundingSourcesContainerScreen(props) {
  const FBTCAccountData = useSelector((state) => state.fbtc.FBTCAccountData);
  const [FBTCAccount, setFBTCAccount] = useState([]);
  const [FBTCAccountInfo, setFBTCAccountInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [FBTCAccount]);

  useEffect(() => {
    (async () => {
      let FBTCAccount = [];
      let accounts = FBTCAccountData;

      setFBTCAccountInfo(accounts);

      if (accounts) {
        if (accounts.checking_account.voucher.length) {
          for (let i = 0; i < accounts.checking_account.voucher.length; i++) {
            const element = accounts.checking_account.voucher[i];
            let obj = {
              ...element,
              accountType: REGULAR_ACCOUNT,
            };
            FBTCAccount.push(obj);
          }
        }
        if (accounts.saving_account.voucher.length) {
          for (let i = 0; i < accounts.saving_account.voucher.length; i++) {
            const element = accounts.saving_account.voucher[i];
            let obj = {
              ...element,
              accountType: SECURE_ACCOUNT,
            };
            FBTCAccount.push(obj);
          }
        }
        FBTCAccount.sort(function (left, right) {
          return (
            moment.utc(right.orderData.date).unix() -
            moment.utc(left.orderData.date).unix()
          );
        });
        setFBTCAccount(FBTCAccount);
      }
    })();
  }, []);

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
                Funding Sources
              </Text>
              <Text style={NavStyles.modalHeaderSubtitleText}>
                View all your funding sources in one place
              </Text>
            </View>
          </View>
        </View>
      </View>

      {FBTCAccountInfo ? (
        <ScrollView style={{ flex: 1 }}>
          <View
            style={{
              ...styles.cardOuterView,
              padding: wp('3%'),
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: wp('1.5%'),
                marginRight: wp('3%'),
              }}
            >
              <Image
                source={require('../../assets/images/icons/fastbitcoin.png')}
                style={{ width: wp('10%'), height: wp('10%') }}
              />
              <Text
                style={{
                  color: Colors.blue,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(14),
                  marginLeft: wp('2%'),
                }}
              >
                FastBitcoins
              </Text>
              <Text
                style={{
                  color: FBTCAccountInfo.user_key ? Colors.darkGreen : Colors.red,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginLeft: 'auto',
                }}
              >
                {FBTCAccountInfo.user_key ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: Colors.borderColor,
                margin: wp('3%'),
                marginTop: wp('0.5%'),
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                margin: wp('3%'),
                marginTop: wp('1.5%'),
              }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(9),
                }}
              >
                REGISTRATION DATE
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                  marginLeft: 'auto',
                }}
              >
                {moment(FBTCAccount.registrationDate)
                  .utc()
                  .format('DD MMMM YYYY')}
              </Text>
            </View>
            <View style={styles.permissionView}>
              <Text style={styles.permissionTitle}>REDEEM PERMISSION</Text>
              <View style={styles.permissionSeparationView} />
              {FBTCAccountInfo.redeem_vouchers ? (
                <Image
                  source={require('../../assets/images/icons/icon_check_green.png')}
                  style={styles.permissionImage}
                />
              ) : (
                  <View style={styles.permissionImage} />
                )}
            </View>
            <View
              style={{
                ...styles.permissionView,
                marginTop: wp('0%'),
                marginBottom: wp('1.5%'),
              }}
            >
              <Text style={styles.permissionTitle}>BALANCE PERMISSION</Text>
              <View style={styles.permissionSeparationView} />
              {FBTCAccountInfo.exchange_balances ? (
                <Image
                  source={require('../../assets/images/icons/icon_check_green.png')}
                  style={styles.permissionImage}
                />
              ) : (
                  <View style={styles.permissionImage} />
                )}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            {FBTCAccount.map((value) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate('FundingSourceDetails', {
                      getBittrAccount: value,
                    });
                  }}
                  style={{
                    ...styles.cardOuterView,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{ ...styles.fastBitcoinIcon, marginLeft: wp('3%') }}
                  >
                    <Image
                      source={require('../../assets/images/icons/fastbitcoin_dark.png')}
                      style={{ width: wp('5%'), height: wp('5%') }}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginLeft: wp('3%'),
                      marginRight: wp('3%'),
                    }}
                  >
                    <View
                      style={{
                        padding: wp('3%'),
                        paddingRight: wp('0%'),
                        paddingLeft: wp('0%'),
                      }}
                    >
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Text
                          style={{
                            color: Colors.blue,
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue(13),
                          }}
                        >
                          Voucher Code {value.voucherCode}
                        </Text>

                      </View>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Text
                          style={{
                            color: Colors.textColorGrey,
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue(10),
                            marginTop: 5,
                          }}
                        >
                          {value.accountType == REGULAR_ACCOUNT
                            ? 'Checking Account'
                            : 'Savings Account'}
                        </Text>
                        <Text
                          style={{
                            color: Colors.textColorGrey,
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue(10),
                            marginLeft: 'auto',
                          }}
                        >
                          {moment(value.orderData.date)
                            .utc()
                            .format('DD MMMM YYYY')}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        height: 1,
                        backgroundColor: Colors.borderColor,
                      }}
                    />
                    <View
                      style={{
                        padding: wp('3%'),
                        paddingRight: wp('0%'),
                        paddingLeft: wp('0%'),
                      }}
                    >
                      <View style={{ flexDirection: 'row' }}>
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
                            {value.quotes.bitcoin_amount
                              ? value.quotes.bitcoin_amount
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
                            {value.quotes.exchange_rate
                              ? value.quotes.exchange_rate
                              : 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : null}
      {
        loading ? <Loader isLoading={true}/> : null
      }
      <View style={{ marginTop: 'auto' }}>
        <BottomInfoBox
          title={'Funding Sources'}
          infoText={
            'When you setup a service for getting bitcoin, it appears here'
          }
        />
      </View>
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
    fontSize: RFValue(9),
    fontFamily: Fonts.OpenSans,
    lineHeight: RFValue(18),
  },
  cardOuterView: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5,
    marginBottom: 5,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    borderRadius: 10,
  },
  fastBitcoinIcon: {
    flexDirection: 'row',
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('10%') / 2,
    backgroundColor: Colors.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
  },
  permissionView: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: wp('3%'),
  },
  permissionSeparationView: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderColor,
    marginLeft: wp('3%'),
    marginRight: wp('3%'),
  },
  permissionImage: {
    width: wp('5.5%'),
    height: wp('5.5%'),
    marginLeft: 'auto',
  },
});
