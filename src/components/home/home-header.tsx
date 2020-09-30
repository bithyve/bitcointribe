import React, { useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground,
  Image,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from './../../common/Fonts';
import CommonStyles from '../../common/Styles/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import { UsNumberFormat } from '../../common/utilities';
import MessageAsPerHealth from '../../components/home/messgae-health';
import CurrencyKindToggleSwitch from '../CurrencyKindToggleSwitch';
import HomePageShield from '../../components/HomePageShield';
const currencyCode = ['BRL', 'CNY', 'JPY', 'GBP', 'KRW', 'RUB', 'TRY', 'INR', 'EUR'];
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrencyImageName } from '../../common/CommonFunctions/index';
import { useDispatch, useSelector } from 'react-redux';
import CurrencyKind from '../../common/data/enums/CurrencyKind';
import { currencyKindSet } from '../../store/actions/preferences';
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind';


function setCurrencyCodeToImage(currencyName, currencyColor) {

  return (
    <View style={{
      marginRight: 5,
      marginBottom: wp('0.7%'),
    }}>
      <MaterialCommunityIcons
        name={currencyName}
        color={currencyColor == 'light' ? Colors.white : Colors.lightBlue}
        size={wp('3.5%')}
      />
    </View>
  );
}

const HomeHeader = ({
  onPressNotifications,
  notificationData,
  walletName,
  getCurrencyImageByRegion,
  balances,
  exchangeRates,
  CurrencyCode,
  navigation,
  overallHealth,
}) => {
  const dispatch = useDispatch();
  const currencyKind: CurrencyKind = useCurrencyKind();

  const prefersBitcoin = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  return (
    <View style={{ ...styles.headerViewContainer, flex: 1 }}>
      <View style={{ flexDirection: 'row', height: '100%' }}>
        <View style={{ ...styles.headerTitleViewContainer }}>
          <TouchableOpacity
            onPress={onPressNotifications}
            style={{
              height: wp('10%'),
              width: wp('10%'),
              justifyContent: 'center',
            }}
          >
            <ImageBackground
              source={require('../../assets/images/icons/icon_notification.png')}
              style={{ width: wp('6%'), height: wp('6%') }}
              resizeMode={'contain'}
            >
              {notificationData.findIndex((value) => value.read == false) >
                -1 ? (
                  <View
                    style={{
                      backgroundColor: Colors.red,
                      height: wp('2.5%'),
                      width: wp('2.5%'),
                      borderRadius: wp('2.5%') / 2,
                      alignSelf: 'flex-end',
                    }}
                  />
                ) : null}
            </ImageBackground>
          </TouchableOpacity>
          <View style={{ marginBottom: wp('2%') }}>
            <Text
              style={styles.headerTitleText}
            >{`${walletName}’s Wallet`}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                marginBottom: wp('3%'),
              }}
            >
              {prefersBitcoin ? (
                <Image
                  style={{
                    ...CommonStyles.homepageAmountImage,
                    marginBottom: wp('1.5%'),
                  }}
                  source={require('../../assets/images/icons/icon_bitcoin_light.png')}
                />
              ) : currencyCode.includes(CurrencyCode) ? (
                setCurrencyCodeToImage(getCurrencyImageName(CurrencyCode), 'light')
              ) : (
                    <Image
                      style={{
                        ...styles.cardBitCoinImage,
                        marginBottom: wp('1.5%'),
                      }}
                      source={getCurrencyImageByRegion(CurrencyCode, 'light')}
                    />
                  )}
              <Text
                style={{
                  ...CommonStyles.homepageAmountText,
                  color: Colors.white,
                }}
              >
                {prefersBitcoin
                  ? UsNumberFormat(balances.accumulativeBalance)
                  : exchangeRates
                    ? (
                      (balances.accumulativeBalance / 1e8) *
                      exchangeRates[CurrencyCode].last
                    ).toFixed(2)
                    : 0}
              </Text>
              <Text
                style={{
                  ...CommonStyles.homepageAmountUnitText,
                  color: Colors.white,
                }}
              >
                {prefersBitcoin ? 'sats' : CurrencyCode.toLocaleLowerCase()}
              </Text>
            </View>
            <MessageAsPerHealth
              health={
                overallHealth ? (overallHealth as any).overallStatus : 0
              }
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ManageBackup');
            }}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Manage Backup</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerToggleSwitchContainer}>
          <CurrencyKindToggleSwitch
            fiatCurrencyCode={CurrencyCode}
            onpress={() => {
              dispatch(currencyKindSet(
                prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
              ));
            }}
            isOn={prefersBitcoin}
          />
          <TouchableOpacity
            activeOpacity={10}
            onPress={() => {
              navigation.navigate('ManageBackup');
            }}
          >
            <HomePageShield
              shieldStatus={
                overallHealth ? (overallHealth as any).overallStatus : 0
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default HomeHeader


const styles = StyleSheet.create({
  headerViewContainer: {
    marginTop: hp('2%'),
    marginLeft: 20,
    marginRight: 20,
  },
  headerTitleViewContainer: {
    flex: 7,
    justifyContent: 'space-between',
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(25),
    marginBottom: wp('3%'),
  },
  cardBitCoinImage: {
    width: wp('3%'),
    height: wp('3%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('0.7%'),
  },
  headerButton: {
    backgroundColor: Colors.homepageButtonColor,
    height: hp('5%'),
    width: wp('35%'),
    borderRadius: 5,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
    color: Colors.white,
  },
  headerToggleSwitchContainer: {
    flex: 3,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
})
