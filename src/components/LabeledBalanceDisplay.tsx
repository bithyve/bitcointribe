import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import CurrencyKind from '../common/data/enums/CurrencyKind';
import useCurrencyCode from '../utils/hooks/state-selectors/UseCurrencyCode';
import useCurrencyKind from '../utils/hooks/state-selectors/UseCurrencyKind';
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from './MaterialCurrencyCodeIcon';
import { getCurrencyImageByRegion } from '../common/CommonFunctions';
import useFormattedAmountText from '../utils/hooks/formatting/UseFormattedAmountText';
import useFormattedUnitText from '../utils/hooks/formatting/UseFormattedUnitText';
import { Satoshis } from '../common/data/enums/UnitAliases';
import BitcoinUnit from '../common/data/enums/BitcoinUnit';
import { SATOSHIS_IN_BTC } from '../common/constants/Bitcoin';

export type Props = {
  balance: Satoshis,
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind;
  textColor?: string;
  bitcoinIconColor?: 'gray' | 'dark' | 'light',
  iconSpacing?: number;
  containerStyle?: Record<string, unknown>;
  currencyImageStyle?: Record<string, unknown>;
  amountTextStyle?: Record<string, unknown>;
  unitTextStyle?: Record<string, unknown>;
};


/**
 * Displays a formatted balance amount in between a current icon
 * and a unit label.
 */
const LabeledBalanceDisplay: React.FC<Props> = ({
  balance,
  bitcoinUnit = BitcoinUnit.SATS,
  currencyKind = useCurrencyKind(),
  iconSpacing = 4,
  textColor = Colors.currencyGray,
  bitcoinIconColor = 'gray',
  containerStyle = {},
  currencyImageStyle = {},
  amountTextStyle = {},
  unitTextStyle = {},
}: Props) => {
  const fiatCurrencyCode = useCurrencyCode();

  const prefersBitcoin = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  const amountToDisplay = useMemo(() => {
    const divisor = bitcoinUnit == BitcoinUnit.SATS ? 1 : SATOSHIS_IN_BTC;

    return balance / divisor;
  }, [balance, bitcoinUnit]);

  const formattedBalanceText = useFormattedAmountText(amountToDisplay);
  const formattedUnitText = useFormattedUnitText({ bitcoinUnit, currencyKind });

  const bitcoinIconSource = useMemo(() => {
    switch (bitcoinIconColor) {
      case 'dark':
        return require('../assets/images/currencySymbols/icon_bitcoin_dark.png');
      case 'light':
        return require('../assets/images/currencySymbols/icon_bitcoin_light.png');
      case 'gray':
        return require('../assets/images/currencySymbols/icon_bitcoin_gray.png');
      default:
        return require('../assets/images/currencySymbols/icon_bitcoin_gray.png');
    }
  }, [bitcoinIconColor]);

  const unitTextStyles = useMemo(() => {
    const fontSize = Number(unitTextStyle.fontSize) || RFValue(11);
    const paddingTop = fontSize * 0.5;

    return {
      ...defaultStyles.unitText,
      color: textColor,
      ...unitTextStyle,
      fontSize,
      paddingTop,
    };
  }, [unitTextStyle]);

  const BalanceCurrencyIcon = () => {
    const style = {
      ...defaultStyles.currencyImage,
      marginRight: iconSpacing,
      ...currencyImageStyle,
    };

    if (prefersBitcoin) {
      return <Image
        style={style}
        source={bitcoinIconSource}
      />;
    }

    if (materialIconCurrencyCodes.includes(fiatCurrencyCode)) {
      return <MaterialCurrencyCodeIcon
        currencyCode={fiatCurrencyCode}
        color={textColor}
        size={style.width}
        style={style}
      />;
    } else {
      return <Image
        style={style}
        source={
          getCurrencyImageByRegion(fiatCurrencyCode, bitcoinIconColor)
        }
      />;
    }
  };

  return (
    <View style={{ ...defaultStyles.rootContainer, ...containerStyle }}>
      <View style={{ marginRight: iconSpacing }}>
        <BalanceCurrencyIcon />
      </View>

      <Text style={{ ...defaultStyles.amountText, color: textColor, ...amountTextStyle }}>
        {formattedBalanceText}
      </Text>

      <Text style={unitTextStyles}>
        {formattedUnitText}
      </Text>
    </View>
  );
};


const defaultStyles = StyleSheet.create({
  rootContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  currencyImage: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },

  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 3,
  },

  unitText: {
    fontFamily: Fonts.FiraSansRegular,
  },
});

export default LabeledBalanceDisplay;
