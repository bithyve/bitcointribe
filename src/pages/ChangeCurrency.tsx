import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomInfoBox from '../components/BottomInfoBox';
import { ScrollView } from 'react-native-gesture-handler';

export default function ChangeCurrency(props) {
  const [currencyList, setCurrencyList] = useState([
    {
      code: 'USD',
      symbol: '$',
    },
    {
      code: 'EUR',
      symbol: '€',
    },
    {
      code: 'GBP',
      symbol: '£',
    },
    {
      code: 'INR',
      symbol: '₹',
    },
    {
      code: 'AUD',
      symbol: '$',
    },
    {
      code: 'BRL',
      symbol: 'R$',
    },
    {
      code: 'CAD',
      symbol: '$',
    },
    {
      code: 'CHF',
      symbol: 'CHF',
    },
    {
      code: 'CLP',
      symbol: '$',
    },
    {
      code: 'CNY',
      symbol: '¥',
    },
    {
      code: 'DKK',
      symbol: 'kr',
    },
    {
      code: 'HKD',
      symbol: '$',
    },
    {
      code: 'ISK',
      symbol: 'kr',
    },
    {
      code: 'JPY',
      symbol: '¥',
    },
    {
      code: 'KRW',
      symbol: '₩',
    },
    {
      code: 'NZD',
      symbol: '$',
    },
    {
      code: 'PLN',
      symbol: 'zł',
    },
    {
      code: 'RUB',
      symbol: '₽',
    },
    {
      code: 'SEK',
      symbol: 'kr',
    },
    {
      code: 'SGD',
      symbol: '$',
    },
    {
      code: 'THB',
      symbol: '฿',
    },
    {
      code: 'TRY',
      symbol: '₺',
    },
    {
      code: 'TWD',
      symbol: '$',
    },
  ]);

  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState({
    code: 'USD',
    symbol: '$',
  });

  useEffect(() => {
    (async () => {
      let currencyCode = await AsyncStorage.getItem('currencyCode');
      setCurrency(
        currencyList[
          currencyList.findIndex((value) => value.code == currencyCode)
        ],
      );
    })();
  }, []);

  const setNewCurrency = async () => {
    await AsyncStorage.setItem('currencyCode', currency.code);
    props.navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitleText}>{'Change Currency'}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue(11),
            color: Colors.textColorGrey,
            marginLeft: wp('10%'),
            marginRight: wp('10%'),
            marginTop: wp('5%'),
            marginBottom: wp('7%'),
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </Text>
        <TouchableOpacity
          onPress={() => {
            setIsVisible(!isVisible);
          }}
          style={{
            flexDirection: 'row',
            height: wp('13%'),
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.borderColor,
            marginLeft: wp('10%'),
            marginRight: wp('10%'),
          }}
        >
          <View
            style={{
              height: wp('13%'),
              width: wp('15%'),
              backgroundColor: Colors.borderColor,
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.FiraSansMedium,
                fontSize: RFValue(13),
                color: Colors.textColorGrey,
              }}
            >
              {currency.symbol}
            </Text>
          </View>
          <View
            style={{ flex: 1, justifyContent: 'center', height: wp('13%') }}
          >
            <Text
              style={{
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(13),
                color: Colors.textColorGrey,
                marginLeft: wp('3%'),
              }}
            >
              {currency.code}
            </Text>
          </View>
          <View
            style={{
              marginLeft: 'auto',
              height: wp('13%'),
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isVisible ? 'ios-arrow-up' : 'ios-arrow-down'}
              color={Colors.textColorGrey}
              size={15}
              style={{
                marginLeft: wp('3%'),
                marginRight: wp('3%'),
                alignSelf: 'center',
              }}
            />
          </View>
        </TouchableOpacity>
        <View style={{position: 'relative', flex: 1,}}>
        {isVisible && (
          <View
            style={{
              marginTop: wp('3%'),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.borderColor,
              overflow: 'hidden',
              marginLeft: wp('10%'),
              marginRight: wp('10%'),
              
            }}
          >
            <ScrollView>
            {currencyList.map((item) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setCurrency(item);
                    setIsVisible(false);
                  }}
                  style={{ flexDirection: 'row', height: wp('13%') }}
                >
                  <View
                    style={{
                      height: wp('13%'),
                      width: wp('15%'),
                      backgroundColor: Colors.borderColor,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.white,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.FiraSansMedium,
                        fontSize: RFValue(13),
                        color: Colors.textColorGrey,
                      }}
                    >
                      {item.symbol}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      height: wp('13%'),
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.borderColor,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.FiraSansRegular,
                        fontSize: RFValue(13),
                        color: Colors.textColorGrey,
                        marginLeft: wp('3%'),
                      }}
                    >
                      {item.code}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            </ScrollView>
          </View>
        )}
      </View>
      <View >
        <BottomInfoBox
        title={'Note'}
          infoText={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
          }
        />
        <TouchableOpacity
          onPress={() => setNewCurrency()}
          style={{
            backgroundColor: Colors.blue,
            width: wp('35%'),
            height: wp('13%'),
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft:30,
            marginRight: 20,
            marginBottom: hp('3%')
          }}
        >
          <Text
            style={{
              fontSize: RFValue(13),
              color: Colors.white,
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
});
