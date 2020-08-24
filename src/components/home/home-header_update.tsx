import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from './../../common/Fonts';
import CommonStyles from '../../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import { UsNumberFormat } from '../../common/utilities';
import MessageAsPerHealth from '../../components/home/messgae-health';
import ToggleSwitch from '../../components/ToggleSwitchSlim';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrencyImageName } from '../../common/CommonFunctions/index';
import AntDesign from 'react-native-vector-icons/AntDesign';

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

const HomeHeader = ({
  onPressNotifications,
  notificationData,
  walletName,
  switchOn,
  getCurrencyImageByRegion,
  balances,
  exchangeRates,
  CurrencyCode,
  navigation,
  overallHealth,
  onSwitchToggle,
  setCurrencyToggleValue,
}) => {
  const getMessage = (health, keeper) => {
    if(!health){
      return (
        <View style={{flexDirection: 'row', width: wp('57%'), alignItems: 'flex-end'}}>
          <Text numberOfLines={1} style={styles.manageBackupMessageTextHighlight}>
            Add Keeper
          </Text>
          <Text numberOfLines={1} style={{...styles.manageBackupMessageText, flex: 1}}> to improve health</Text>
        </View>
      );
    }
    else if(health=='ugly'){
      return (
        <View style={{flexDirection: 'row', width: wp('57%'), alignItems: 'flex-end'}}>
          <Text style={styles.manageBackupMessageTextHighlight}>
            {keeper}
          </Text>
          <Text numberOfLines={1} style={{...styles.manageBackupMessageText, flex: 1}}> needs your attention</Text>
        </View>
      );
    }
    else if(health=='good'){
      return (
        <View style={{flexDirection: 'row', width: wp('57%'), alignItems: 'flex-end'}}>
          <Text style={styles.manageBackupMessageText}>Your wallet is now </Text>
          <Text numberOfLines={1} style={styles.manageBackupMessageTextHighlight}>secure</Text>
        </View>
      );
    }
  };
  
  return (
    <View style={{ ...styles.headerViewContainer, flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <ToggleSwitch
          currencyCodeValue={CurrencyCode}
          onpress={async () => {
            onSwitchToggle(!switchOn);
            let temp = !switchOn ? 'true' : '';
            setCurrencyToggleValue(temp);
            //await AsyncStorage.setItem('currencyToggleValue', temp);
          }}
          toggle={switchOn}
        />
        <TouchableOpacity
          onPress={onPressNotifications}
          style={{
            height: wp('10%'),
            width: wp('10%'),
            justifyContent: 'center',
            marginLeft: 'auto',
          }}
        >
          <ImageBackground
            source={require('../../assets/images/icons/icon_notification.png')}
            style={{ width: wp('6%'), height: wp('6%'), marginLeft: 'auto' }}
            resizeMode={'contain'}
          >
            {notificationData.findIndex((value) => value.read == false) > -1 ? (
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
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            marginBottom: wp('2%'),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.headerTitleText}>{`${walletName}’s Wallet`}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              // marginBottom: wp('3%'),
            }}
          >
            {switchOn ? (
              <Image
                style={{
                  ...CommonStyles.homepageAmountImage,
                  marginBottom: wp('1.5%'),
                }}
                source={require('../../assets/images/icons/icon_bitcoin_light.png')}
              />
            ) : currencyCode.includes(CurrencyCode) ? (
              setCurrencyCodeToImage(
                getCurrencyImageName(CurrencyCode),
                'light',
              )
            ) : (
              <Image
                style={{
                  ...styles.cardBitCoinImage,
                  marginBottom: wp('1.5%'),
                }}
                source={getCurrencyImageByRegion(CurrencyCode, 'light')}
              />
            )}
            <Text style={styles.homeHeaderAmountText}>
              {switchOn
                ? UsNumberFormat(balances.accumulativeBalance)
                : exchangeRates
                ? (
                    (balances.accumulativeBalance / 1e8) *
                    exchangeRates[CurrencyCode].last
                  ).toFixed(2)
                : 0}
            </Text>
            <Text style={styles.homeHeaderAmountUnitText}>
              {switchOn ? 'sats' : CurrencyCode.toLocaleLowerCase()}
            </Text>
          </View>
          {/* <MessageAsPerHealth
            health={overallHealth ? (overallHealth as any).overallStatus : 0}
          /> */}
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 'auto',
        }}
      >
        <ImageBackground
          source={require('../../assets/images/icons/Keeper_shield_white.png')}
          style={{
            width: wp('15%'),
            height: wp('20%'),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontFamily: Fonts.FiraSansMedium,
              fontSize: RFValue(18),
            }}
          >
            1
          </Text>
        </ImageBackground>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ManageBackupUpgradeSecurity');
            
            //navigation.navigate('ManageBackupKeeper');
          }}
          style={styles.manageBackupMessageView}
        >
          {getMessage('ugly', 'Security Question')}
          <AntDesign
            style={{ marginLeft: 'auto' }}
            name={'arrowright'}
            color={Colors.white}
            size={17}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  headerViewContainer: {
    marginTop: hp('1%'),
    marginLeft: 20,
    marginRight: 20,
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(25),
    marginBottom: wp('2%'),
  },
  cardBitCoinImage: {
    width: wp('3%'),
    height: wp('3%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('0.7%'),
  },
  manageBackupMessageView: {
    marginLeft: wp('2%'),
    borderRadius: wp('13') / 2,
    height: wp('13'),
    flex: 1,
    backgroundColor: Colors.deepBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp('5%'),
    paddingRight: wp('5%'),
  },
  manageBackupMessageTextHighlight: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMediumItalic,
    fontSize: RFValue(13),
  },
  manageBackupMessageText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
    color: Colors.white,
  },
  homeHeaderAmountText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(19),
    marginRight: 5,
    color: Colors.white,
  },
  homeHeaderAmountUnitText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(9),
    marginBottom: 3,
    color: Colors.white,
  },
});