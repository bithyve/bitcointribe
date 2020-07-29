import React from 'react';
import { View, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import { getCurrencyImageByRegion } from '../common/CommonFunctions/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrencyImageName } from '../common/CommonFunctions/index';

export default function ToggleSwitchSlim(props) {
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

  function setCurrencyCode(currencyName, currencyColor) {
    return (
      <MaterialCommunityIcons
        name={currencyName}
        color={currencyColor == 'gray' ? Colors.currencyGray : Colors.blue}
        size={wp('3.8%')}
      />
    );
  }

  return (
    <TouchableOpacity activeOpacity={10} onPress={() => props.onpress()}>
      {props.toggle ? (
        <ImageBackground
          resizeMode={'stretch'}
          style={{ width: wp('16%'), height: wp('9%'), flexDirection: 'row' }}
          source={require('../assets/images/icons/switchbase.png')}
        >
          <View
            style={{
              height: wp('9%'),
              width: wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {!props.isNotImage &&
            currencyCode.includes(props.currencyCodeValue) ? (
              props.inactiveOffImage ? (
                props.inactiveOffImage
              ) : (
                setCurrencyCode(
                  getCurrencyImageName(props.currencyCodeValue),
                  'light',
                )
              )
            ) : (
              <Image
                source={
                  props.inactiveOffImage
                    ? props.inactiveOffImage
                    : getCurrencyImageByRegion(props.currencyCodeValue, 'light')
                }
                style={{
                  width: wp('3.5%'),
                  height: wp('3.5%'),
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>
          <ImageBackground
            style={{
              width: wp('8%'),
              height: wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
            source={require('../assets/images/icons/switch.png')}
          >
            {!props.isNotImage && (
              <Image
                source={
                  props.inactiveOnImage
                    ? props.inactiveOnImage
                    : require('../assets/images/icons/icon_bitcoin_dark.png')
                }
                style={{
                  width: wp('3.5%'),
                  height: wp('3.5%'),
                  resizeMode: 'contain',
                }}
              />
            )}
          </ImageBackground>
        </ImageBackground>
      ) : (
        <ImageBackground
          style={{ width: wp('16%'), height: wp('9%'), flexDirection: 'row' }}
          source={require('../assets/images/icons/switchbase_rotated.png')}
          resizeMode={'stretch'}
        >
          <ImageBackground
            style={{
              width: wp('8%'),
              height: wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
            source={require('../assets/images/icons/switch.png')}
          >
            {!props.isNotImage &&
            currencyCode.includes(props.currencyCodeValue) ? (
              props.activeOffImage ? (
                props.activeOffImage
              ) : (
                setCurrencyCode(
                  getCurrencyImageName(props.currencyCodeValue),
                  'blue',
                )
              )
            ) : (
              <Image
                source={
                  props.activeOffImage
                    ? props.activeOffImage
                    : getCurrencyImageByRegion(props.currencyCodeValue, 'dark')
                }
                style={{
                  width: wp('3.5%'),
                  height: wp('3.5%'),
                  resizeMode: 'contain',
                }}
              />
            )}
          </ImageBackground>
          <View
            style={{
              height: wp('9%'),
              width: wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            {!props.isNotImage && (
              <Image
                source={
                  props.inactiveOnImage
                    ? props.inactiveOnImage
                    : require('../assets/images/icons/icon_bitcoin_light.png')
                }
                style={{
                  width: wp('3.5%'),
                  height: wp('3.5%'),
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>
        </ImageBackground>
      )}
    </TouchableOpacity>
  );
}
