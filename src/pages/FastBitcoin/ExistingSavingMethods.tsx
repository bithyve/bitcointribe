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
  FAST_BITCOINS,
} from '../../common/constants/serviceTypes';
import { fetchDerivativeAccBalTx } from '../../store/actions/accounts';
import moment from 'moment';

export default function ExistingSavingMethods(props) {
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
      let accounts = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
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
        console.log('FBTCAccount', FBTCAccount);
        FBTCAccount.sort(function (left, right) {
          return (
            moment.utc(right.orderData.date).unix() -
            moment.utc(left.orderData.date).unix()
          );
        });
        setFBTCAccount(FBTCAccount);
      }
      console.log('accounts', FBTCAccount);
    })();
  }, []);

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
                {'Funding Sources'}
              </Text>
              <Text style={styles.modalHeaderSmallTitleText}>
                View all your funding sources in one place
              </Text>
            </View>
          </View>
        </View>
      </View>
      {loading ? (
        <ScrollView style={{ flex: 1 }}>
          {loading ? (
            <View style={{ flex: 1 }}>
              {[1, 2, 3, 4].map(() => {
                return (
                  <View
                    style={{
                      width: wp('70%'),
                      height: wp('3%'),
                      margin: 5,
                      marginLeft: wp('5%'),
                      backgroundColor: Colors.backgroundColor,
                      borderRadius: 5,
                    }}
                  />
                );
              })}
              <View style={{ flex: 1 }}>
                {[1, 2, 3, 4].map(() => {
                  return (
                    <View style={{}}>
                      <View
                        style={{
                          marginLeft: 20,
                          marginRight: 20,
                          marginTop: 5,
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
                            marginLeft: wp('3%'),
                          }}
                        />
                        <View
                          style={{
                            flex: 1,
                            marginLeft: wp('3%'),
                            marginRight: wp('3%'),
                          }}
                        >
                          <View style={{ padding: wp('3%') }}>
                            <View
                              style={{
                                width: wp('40%'),
                                height: wp('5%'),
                                backgroundColor: Colors.backgroundColor,
                                borderRadius: 5,
                              }}
                            />
                            <View
                              style={{
                                width: wp('30%'),
                                height: wp('5%'),
                                backgroundColor: Colors.backgroundColor,
                                borderRadius: 5,
                                marginTop: 5,
                              }}
                            />
                          </View>
                          <View
                            style={{
                              height: 1,
                              backgroundColor: Colors.borderColor,
                            }}
                          />
                          <View style={{ padding: wp('3%') }}>
                            <View
                              style={{
                                width: wp('40%'),
                                height: wp('5%'),
                                backgroundColor: Colors.backgroundColor,
                                borderRadius: 5,
                              }}
                            />
                            <View
                              style={{
                                width: wp('30%'),
                                height: wp('5%'),
                                backgroundColor: Colors.backgroundColor,
                                borderRadius: 5,
                                marginTop: 5,
                              }}
                            />
                          </View>
                        </View>
                        <View
                          style={{
                            width: wp('5%'),
                            height: wp('5%'),
                            marginRight: wp('3%'),
                            backgroundColor: Colors.backgroundColor,
                            borderRadius: wp('10%') / 2,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : FBTCAccountInfo ? (
        <View style={{ flex: 1 }}>
          <View
            style={{
              margin: wp('3%'),
              marginLeft: wp('5%'),
              marginRight: wp('5%'),
              borderBottomColor: Colors.borderColor,
              borderBottomWidth: 0.5,
              paddingBottom: wp('4%'),
            }}
          >
            {FBTCAccountInfo.user_key && (
              <Text style={styles.accountInfo}>
                <Text style={styles.accountInfoTitle}>User Key: </Text>
                {FBTCAccountInfo.user_key}
              </Text>
            )}
            {FBTCAccountInfo.hasOwnProperty('redeem_vouchers') && (
              <Text style={styles.accountInfo}>
                <Text style={styles.accountInfoTitle}>
                  Has Redeem Permission:{' '}
                </Text>
                {FBTCAccountInfo.redeem_vouchers ? 'Yes' : 'No'}
              </Text>
            )}
            {FBTCAccountInfo.hasOwnProperty('redeem_vouchers') && (
              <Text style={styles.accountInfo}>
                <Text style={styles.accountInfoTitle}>
                  Has Exchange Balances Permission:{' '}
                </Text>
                {FBTCAccountInfo.exchange_balances ? 'Yes' : 'No'}
              </Text>
            )}
            {FBTCAccountInfo.hasOwnProperty('sell_bitcoins') && (
              <Text style={styles.accountInfo}>
                <Text style={styles.accountInfoTitle}>
                  Has Sell Bitcoin Permission:{' '}
                </Text>
                {FBTCAccountInfo.sell_bitcoins ? 'Yes' : 'No'}
              </Text>
            )}
          </View>
          <ScrollView style={{ flex: 1 }}>
            {FBTCAccount.map((value) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate('ExistingSavingMethodDetails', {
                      getBittrAccount: value,
                    });
                  }}
                  style={{
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 5,
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
                    style={{
                      flex: 1,
                      marginLeft: wp('3%'),
                      marginRight: wp('3%'),
                    }}
                  >
                    <View style={{ padding: wp('3%') }}>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansMedium,
                          fontSize: RFValue(13),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: RFValue(11),
                            fontFamily: Fonts.FiraSansRegular,
                          }}
                        >
                          Voucher Code
                        </Text>{' '}
                        #{value.voucherCode}
                      </Text>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue(13),
                          marginTop: 5,
                        }}
                      >
                        {value.accountType == REGULAR_ACCOUNT
                          ? 'Checking Account'
                          : 'Savings Account'}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 1,
                        backgroundColor: Colors.borderColor,
                      }}
                    />
                    <View style={{ padding: wp('3%') }}>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue(13),
                        }}
                      >
                        Voucher Amount
                      </Text>
                      <View style={styles.transactionModalAmountView}>
                        <Text style={styles.transactionModalAmountText}>
                          {value.quotes.amount ? value.quotes.amount : 0}
                        </Text>
                        <Text style={styles.transactionModalAmountUnitText}>
                          {value.quotes.currency}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      width: wp('10%'),
                      height: wp('10%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: wp('3%'),
                    }}
                  >
                    <Ionicons
                      name="ios-arrow-forward"
                      color={Colors.borderColor}
                      size={RFValue(20)}
                      style={{ alignSelf: 'center' }}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
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
  accountInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansMedium,
  },
  accountInfoTitle: {
    fontFamily: Fonts.FiraSansRegular,
  },
});
