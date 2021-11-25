import React from 'react'
import { View, Image, TouchableOpacity, Text, ImageSourcePropType } from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import { getCurrencyImageByRegion } from '../common/CommonFunctions/index'
import { AppBottomSheetTouchableWrapper as TouchableWrapper } from './AppBottomSheetTouchableWrapper'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from './MaterialCurrencyCodeIcon'
import { LinearGradient } from 'react-native-linear-gradient';

export type Props = {
  isOn: boolean;
  fiatCurrencyCode?: string;
  thumbColor?: string;
  thumbSize?: number;
  trackColor?: string;
  isVertical?: boolean;

  /**
   * TODO: Figure out what this means
   */
  changeSettingToggle?: boolean;

  /**
  * TODO: Figure out what this means. I think it means don't use BTC images (?)
  */
  isNotImage?: boolean;

  activeOnImage?: ImageSourcePropType;
  activeOffImage?: ImageSourcePropType;
  inactiveOnImage?: ImageSourcePropType;
  inactiveOffImage?: ImageSourcePropType;
  disabled?: boolean;
  onpress: () => void;
};


const CurrencyCodeIcon = ({
  currencyCode,
  color,
}) => {
  return (
    <MaterialCurrencyCodeIcon
      currencyCode={currencyCode}
      color={color}
      size={12}
    />
  )
}

const CurrencyKindToggleSwitch: React.FC<Props> = ({
  isOn,
  fiatCurrencyCode,
  thumbColor,
  thumbSize,
  trackColor,
  isNotImage,
  activeOnImage,
  activeOffImage,
  inactiveOnImage,
  inactiveOffImage,
  isVertical,
  changeSettingToggle,
  disabled,
  onpress,
}: Props) => {
  return (

    <TouchableWrapper
      activeOpacity={1}
      onPress={onpress}
      disabled={disabled}
      style={{
        flexDirection: isVertical ? 'column' : 'row',
        backgroundColor: trackColor || '#1E82C2',
        height: isVertical ? wp('17%') : changeSettingToggle ? wp('8%') : wp('10%'),
        width: isVertical ? wp('10%') : changeSettingToggle ? wp('14%') : wp('17%'),
        borderRadius: wp('10%') / 2,
        alignItems: 'center',
        paddingLeft: isVertical ? 4 : 2,
        paddingRight: 2,
      }}
    >
      {isOn ? (
        <View style={{
          flexDirection: isVertical ? 'column' : 'row'
        }}>

          <View
            style={{
              height: thumbSize || wp('8%'),
              width: thumbSize || wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {inactiveOffImage || (
              (!isNotImage && materialIconCurrencyCodes.includes(fiatCurrencyCode)) && (
                <CurrencyCodeIcon
                  currencyCode={fiatCurrencyCode}
                  color={Colors.currencyGray}
                />
              )
              || (
                <Image
                  source={
                    inactiveOffImage || getCurrencyImageByRegion(fiatCurrencyCode, 'light')
                  }
                  style={{
                    width: wp('3.5%'),
                    height: wp('3.5%'),
                    resizeMode: 'contain',
                  }}
                />
              ))}
          </View>

          <View
            style={{
              backgroundColor: thumbColor || Colors.white,
              height: thumbSize || wp('8%'),
              width: thumbSize || wp('8%'),
              borderRadius: thumbSize || wp('8%') / 2,
              marginLeft: isOn ? 'auto' : 0,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 2,
            }}
          >
            {!isNotImage && (
              <Image
                source={
                  activeOnImage || require('../assets/images/icons/icon_bitcoin_dark.png')
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
        <View style={{
          flexDirection: isVertical ? 'column' : 'row'
        }}>
          <View
            style={{
              backgroundColor: thumbColor
                ? thumbColor
                : Colors.white,
              height: thumbSize || wp('8%'),
              width: thumbSize || wp('8%'),
              borderRadius: thumbSize || wp('8%') / 2,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 2,
              marginRight: isVertical ? 4 : 0,
              marginTop: isVertical ? 4 : 0,
            }}
          >
            {activeOffImage || (
              (!isNotImage && materialIconCurrencyCodes.includes(fiatCurrencyCode)) && (
                <CurrencyCodeIcon
                  currencyCode={fiatCurrencyCode}
                  color={Colors.blue}
                />
              )
              || (
                <Image
                  source={
                    activeOffImage || getCurrencyImageByRegion(fiatCurrencyCode, 'light')
                  }
                  style={{
                    width: wp('3.5%'),
                    height: wp('3.5%'),
                    resizeMode: 'contain',
                  }}
                />
              ))}
          </View>

          <View
            style={{
              height: thumbSize || wp('8%'),
              width: thumbSize || wp('8%'),
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: isOn ? 'auto' : isVertical ? 2 : 0,
              marginRight: isVertical ? 2 : -3,
              marginTop: isVertical ? 0 : 0,
            }}
          >
            {!isNotImage && (
              <Image
                source={
                  inactiveOnImage || require('../assets/images/icons/icon_bitcoin_gray.png')
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

    </TouchableWrapper>


  )
}

export default CurrencyKindToggleSwitch
