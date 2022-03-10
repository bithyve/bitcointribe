import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import CurrencyKind from '../common/data/enums/CurrencyKind'
import useCurrencyCode from '../utils/hooks/state-selectors/UseCurrencyCode'
import useCurrencyKind from '../utils/hooks/state-selectors/UseCurrencyKind'
import MaterialCurrencyCodeIcon, {
  materialIconCurrencyCodes,
} from './MaterialCurrencyCodeIcon'
import { getCurrencyImageByRegion } from '../common/CommonFunctions'
import useFormattedAmountText from '../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../utils/hooks/formatting/UseFormattedUnitText'
import { Satoshis } from '../common/data/enums/UnitAliases'
import BitcoinUnit, { displayNameForBitcoinUnit } from '../common/data/enums/BitcoinUnit'
import { SATOSHIS_IN_BTC } from '../common/constants/Bitcoin'
import { UsNumberFormat } from '../common/utilities'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

export type Props = {
  balance: Satoshis;
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind;
  textColor?: string;
  bitcoinIconColor?: 'gray' | 'dark' | 'light';
  iconSpacing?: number;
  containerStyle?: Record<string, unknown>;
  currencyImageStyle?: Record<string, unknown>;
  amountTextStyle?: Record<string, unknown>;
  unitTextStyle?: Record<string, unknown>;
  isTestAccount?: boolean;
};

/**
 * Displays a formatted balance amount in between a current icon
 * and a unit label that dynamically changes with the user's
 * currency preferences.
 */
const LabeledBalanceDisplay: React.FC<Props> = ( {
  balance,
  bitcoinUnit = BitcoinUnit.SATS,
  currencyKind = useCurrencyKind(),
  iconSpacing = 4,
  textColor = Colors.currencyGray,
  bitcoinIconColor = 'gray',
  containerStyle = {
  },
  currencyImageStyle = {
  },
  amountTextStyle,
  unitTextStyle = {
  },
  isTestAccount = false,
}: Props ) => {
  const fiatCurrencyCode = useCurrencyCode()

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const amountToDisplay = useMemo( () => {
    const divisor = [ BitcoinUnit.SATS, BitcoinUnit.TSATS ].includes( bitcoinUnit ) ? 1 : SATOSHIS_IN_BTC

    return balance / divisor
  }, [ balance, bitcoinUnit ] )

  const formattedBalanceText = isTestAccount ?
    UsNumberFormat( amountToDisplay )
    : useFormattedAmountText( amountToDisplay )

  const formattedUnitText = isTestAccount ?
    displayNameForBitcoinUnit( BitcoinUnit.TSATS )
    : useFormattedUnitText( {
      bitcoinUnit, currencyKind
    } )

  const bitcoinIconSource = useMemo( () => {
    switch ( bitcoinIconColor ) {
        case 'dark':
          return require( '../assets/images/currencySymbols/icon_bitcoin_dark.png' )
        case 'light':
          return require( '../assets/images/currencySymbols/icon_bitcoin_light.png' )
        case 'gray':
          return require( '../assets/images/currencySymbols/icon_bitcoin_gray.png' )
        default:
          return require( '../assets/images/currencySymbols/icon_bitcoin_gray.png' )
    }
  }, [ bitcoinIconColor ] )

  const unitTextStyles = useMemo( () => {
    const fontSize = Number( unitTextStyle.fontSize ) || RFValue( 11 )
    const paddingTop = fontSize * 0.5

    return {
      ...defaultStyles.unitText,
      color: textColor,
      ...unitTextStyle,
      fontSize,
      paddingTop,
    }
  }, [ unitTextStyle ] )

  const BalanceCurrencyIcon = () => {
    const style = {
      ...defaultStyles.currencyImage,
      ...currencyImageStyle,
    }

    if ( prefersBitcoin || isTestAccount ) {
      return <Image style={{
        ...style, marginLeft: wp( 1 )
      }} source={bitcoinIconSource} />
    }

    if ( materialIconCurrencyCodes.includes( fiatCurrencyCode ) ) {
      return (
        <MaterialCurrencyCodeIcon
          currencyCode={fiatCurrencyCode}
          color={textColor}
          size={RFValue( 16 )}
          style={{
          }}
        />
      )
    } else {
      return (
        <Image
          style={style}
          source={getCurrencyImageByRegion( fiatCurrencyCode, bitcoinIconColor )}
        />
      )
    }
  }

  return (
    <View style={{
      ...defaultStyles.rootContainer, ...containerStyle
    }}>
      <View style={{
        marginRight: 4,
        marginLeft: ( prefersBitcoin || isTestAccount ) ? -wp( 1 ) : [ 'SEK', 'BRL', 'DKK', 'ISK', 'KRW', 'PLN', 'SEK' ].includes( fiatCurrencyCode  ) ? 0 : -wp( 1 )
      }}>
        <BalanceCurrencyIcon />
      </View>

      <Text
        numberOfLines={1}
        style={{
          ...defaultStyles.amountText,
          color: textColor,
          ...amountTextStyle,
        }}
      >
        {formattedBalanceText}
      </Text>
      <Text style={unitTextStyles}>{`${formattedUnitText}`}</Text>
    </View>
  )
}

const defaultStyles = StyleSheet.create( {
  rootContainer: {
    flexDirection: 'row',
    // alignItems: 'baseline',
    alignItems: 'center',
  },

  currencyImage: {
    width: wp( 3 ),
    height: wp( 4 ),
    resizeMode: 'contain',
  },

  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue( 14.5 ),
    marginRight: wp( 2 ),
    // alignItems: 'baseline',
    // width:wp( 25 )
  },

  unitText: {
    fontFamily: Fonts.FiraSansRegular,
    // alignItems: 'baseline',
  },
} )

export default LabeledBalanceDisplay

