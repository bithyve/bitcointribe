import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import { getCurrencyImageByRegion } from '../common/CommonFunctions/index';

export default function ToggleSwitch(props) {
  return (
    <TouchableOpacity
      activeOpacity={10}
      onPress={() => props.onpress()}
      style={{
        flexDirection: props.transform ? 'column' : 'row',
        backgroundColor: props.toggleColor ? props.toggleColor : '#1E82C2',
        height: props.transform ? wp('17%') : wp('10%'),
        width: props.transform ? wp('10%') : wp('17%'),
        borderRadius: wp('10%') / 2,
        alignItems: 'center',
        paddingLeft: 2,
        paddingRight: 2,
      }}
    >
      {props.toggle ? (
        <View style={{ flexDirection: props.transform ? 'column' : 'row' }}>
          <View
            style={{
              height: wp('8%'),
              width: wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {!props.isNotImage && (
              <Image
                source={
                  props.inactiveOffImage
                    ? props.inactiveOffImage
                    : getCurrencyImageByRegion(props.currencyCodeValue, 'gray')
                }
                style={{
                  width: wp('3.5%'),
                  height: wp('3.5%'),
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>
          <View
            style={{
              backgroundColor: props.toggleCircleColor
                ? props.toggleCircleColor
                : Colors.white,
              height: wp('8%'),
              width: wp('8%'),
              borderRadius: wp('8%') / 2,
              marginLeft: props.toggle ? 'auto' : 0,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 2,
            }}
          >
            {!props.isNotImage && (
              <Image
                source={
                  props.activeOnImage
                    ? props.activeOnImage
                    : require('../assets/images/icons/icon_bitcoin_dark.png')
                }
                style={{
                  width: wp('3.5%'),
                  height: wp('3.5%'),
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: props.transform ? 'column' : 'row' }}>
          <View
            style={{
              backgroundColor: props.toggleCircleColor
                ? props.toggleCircleColor
                : Colors.white,
              height: wp('8%'),
              width: wp('8%'),
              borderRadius: wp('8%') / 2,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 2,
            }}
          >
            {!props.isNotImage && (
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
          </View>
          <View
            style={{
              height: wp('8%'),
              width: wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: props.toggle ? 'auto' : 0,
              marginRight: -3,
            }}
          >
            {!props.isNotImage && (
              <Image
                source={
                  props.inactiveOnImage
                    ? props.inactiveOnImage
                    : require('../assets/images/icons/icon_bitcoin_gray.png')
                }
                style={{
                  width: wp('3.5%'),
                  height: wp('3.5%'),
                  resizeMode: 'contain',
                }}
              />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
