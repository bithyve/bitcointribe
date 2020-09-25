import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import CardView from 'react-native-cardview';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import Fonts from './../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  DONATION_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { UsNumberFormat } from '../../common/utilities';
import config from '../../bitcoin/HexaConfig';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions';
import DeviceInfo from 'react-native-device-info';
import { getCurrencyImageName } from '../../common/CommonFunctions/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getIconByAccountType } from '../../utils/accounts/IconUtils';
import AddNewAccountCard from '../../pages/Home/AddNewAccountCard';

const currencyCode = [
  'BRL',
  'CNY',
  'JPY',
  'GBP',
  'KRW',
  'RUB',
  'TRY',
  'INR',
  'EUR',
];

function setCurrencyCodeToImage(currencyName, currencyColor) {
  return (
    <View
      style={{
        marginRight: 5,
        marginBottom: wp('0.7%'),
      }}
    >
      <MaterialCommunityIcons
        name={currencyName}
        color={currencyColor == 'light' ? Colors.white : Colors.lightBlue}
        size={wp('3.5%')}
      />
    </View>
  );
}

const HomeList = ({
  isBalanceLoading,
  Items,
  navigation,
  switchOn,
  accounts,
  CurrencyCode,
  balances,
  exchangeRates,
  addNewDisable,
}) => {
  return (
    <View>
      {Items.item.map((value) => {
        if (value.accountType === 'add') {
          return (
            <TouchableOpacity
              disabled={addNewDisable}
              onPress={() => navigation.navigate('AddNewDonationAccount')}
            >
              <CardView
                cornerRadius={10}
                style={addNewDisable ? {
                  ...styles.card,
                   backgroundColor: Colors.borderColor
                } : {
                  ...styles.card}}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    style={{ width: wp('10%'), height: wp('10%') }}
                    source={require('../../assets/images/icons/icon_add.png')}
                  />
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(11),
                    }}
                  >
                    Add to my wallet
                  </Text>
                </View>
              </CardView>
            </TouchableOpacity>
          );
        } else {
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Accounts', {
                  serviceType: value.accountType,
                  index: value.id - 1,
                });
              }}
            >
              <CardView cornerRadius={10} style={styles.card}>
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    style={{ width: wp('10%'), height: wp('10%') }}
                    source={getIconByAccountType(
                      value.subType === DONATION_ACCOUNT
                        ? value.subType
                        : value.accountType,
                    )}
                  />
                  {value.accountType == SECURE_ACCOUNT ? (
                    <TouchableOpacity
                      onPress={() => {
                        // alert('2FA');
                      }}
                      style={{
                        marginLeft: 'auto',
                        paddingLeft: 10,
                        paddingBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.blue,
                          fontSize: RFValue(11),
                          fontFamily: Fonts.FiraSansRegular,
                        }}
                      >
                        2FA
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Text style={styles.cardTitle}>{value.title}</Text>
                  <Text
                    style={{
                      fontFamily: Fonts.FiraSansRegular,
                      color: Colors.textColorGrey,
                      fontSize: RFValue(11),
                    }}
                  >
                    {value.account}
                  </Text>
                  {isBalanceLoading ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        marginTop: hp('1%'),
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          width: wp('30%'),
                          height: wp('5%'),
                          borderRadius: 8,
                        }}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        marginTop: hp('1%'),
                      }}
                    >
                      {value.accountType === TEST_ACCOUNT || switchOn ? (
                        <Image
                          style={styles.cardBitCoinImage}
                          source={value.bitcoinicon}
                        />
                      ) : currencyCode.includes(CurrencyCode) ? (
                        setCurrencyCodeToImage(
                          getCurrencyImageName(CurrencyCode),
                          'light_blue',
                        )
                      ) : (
                        <Image
                          style={styles.cardBitCoinImage}
                          source={getCurrencyImageByRegion(
                            CurrencyCode,
                            'light_blue',
                          )}
                        />
                      )}
                      <Text
                        style={
                          accounts.accountsSynched
                            ? styles.cardAmountText
                            : styles.cardAmountTextGrey
                        }
                      >
                        {switchOn
                          ? config.EJECTED_ACCOUNTS.includes(value.subType)
                            ? UsNumberFormat(value.amount)
                            : value.accountType === TEST_ACCOUNT
                            ? UsNumberFormat(balances.testBalance)
                            : value.accountType === REGULAR_ACCOUNT
                            ? UsNumberFormat(balances.regularBalance)
                            : UsNumberFormat(balances.secureBalance)
                          : config.EJECTED_ACCOUNTS.includes(value.subType) &&
                            exchangeRates
                          ? (
                              (value.amount / 1e8) *
                              exchangeRates[CurrencyCode].last
                            ).toFixed(2)
                          : value.accountType === TEST_ACCOUNT
                          ? UsNumberFormat(balances.testBalance)
                          : value.accountType === REGULAR_ACCOUNT &&
                            exchangeRates
                          ? (
                              (balances.regularBalance / 1e8) *
                              exchangeRates[CurrencyCode].last
                            ).toFixed(2)
                          : exchangeRates
                          ? (
                              (balances.secureBalance / 1e8) *
                              exchangeRates[CurrencyCode].last
                            ).toFixed(2)
                          : value.amount}
                      </Text>
                      <Text style={styles.cardAmountUnitText}>
                        {switchOn
                          ? value.unit
                          : value.accountType === TEST_ACCOUNT
                          ? value.unit
                          : CurrencyCode.toLocaleLowerCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </CardView>
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 0,
    width: wp('42.6%'),
    height: hp('20.1%'),
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginRight: wp('2%'),
    marginBottom: wp('2%'),
    padding: wp('3'),
    backgroundColor: Colors.white,
  },

  cardTitle: {
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
    fontSize: RFValue(10),
  },
  activeTabStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
    padding: 7,
    borderRadius: 7,
    width: 120,
    height: 40,
    justifyContent: 'center',
  },
  activeTabTextStyle: {
    marginLeft: 8,
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  bottomTabBarContainer: {
    backgroundColor: Colors.white,
    justifyContent: 'space-evenly',
    display: 'flex',
    marginTop: 'auto',
    flexDirection: 'row',
    height: hp('12%'),
    alignItems: 'center',
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    paddingBottom: DeviceInfo.hasNotch() ? hp('4%') : 0,
  },
  cardBitCoinImage: {
    width: wp('3%'),
    height: wp('3%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('0.7%'),
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountTextGrey: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  tabBarImage: {
    width: 21,
    height: 21,
    resizeMode: 'contain',
  },
  tabBarTabView: {
    padding: wp('5%'),
  },
  transactionModalElementView: {
    backgroundColor: Colors.backgroundColor,
    padding: hp('1%'),
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalElementInfoView: {
    padding: hp('1%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(12),
    marginBottom: 3,
    fontFamily: Fonts.FiraSansRegular,
  },
  transactionModalDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  transactionModalAmountView: {
    padding: 10,
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  transactionModalAmountText: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: RFValue(20),
    fontFamily: Fonts.OpenSans,
  },
  transactionModalAmountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.OpenSans,
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 1,
    backgroundColor: Colors.borderColor,
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
});

export default memo(HomeList);
