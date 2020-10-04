import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import CurrencyKind from '../../common/data/enums/CurrencyKind';
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode';
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind';
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../MaterialCurrencyCodeIcon';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions';
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText';
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText';
import { Satoshis } from '../../common/data/enums/UnitAliases';

export type Props = {
  balance: Satoshis;
  color?: string;
  iconSpacing?: number;
  containerStyle?: Record<string, unknown>;
  currencyImageSource?: ImageSourcePropType;
  currencyImageStyle?: Record<string, unknown>;
  amountTextStyle?: Record<string, unknown>;
  unitTextStyle?: Record<string, unknown>;
};


const AccountBalanceDisplay: React.FC<Props> = ({
  balance,
  iconSpacing = 0,
  color = Colors.currencyGray,
  containerStyle = {},
  currencyImageSource,
  currencyImageStyle = {},
  amountTextStyle = {},
  unitTextStyle = {},
}: Props) => {
  const currencyKind = useCurrencyKind();
  const fiatCurrencyCode = useCurrencyCode();

  const prefersBitcoin: boolean = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  const formattedBalanceText = useFormattedAmountText(balance);
  const formattedUnitText = useFormattedUnitText(balance);

  const BalanceCurrencyIcon = () => {
    const style = {
      ...styles.currencyImage,
      ...currencyImageStyle,
    };

    if (currencyImageSource) {
      return <Image
        style={style}
        source={currencyImageSource}
      />;
    } else if (prefersBitcoin) {
      return <Image
        style={style}
        source={require('../../assets/images/currencySymbols/icon_bitcoin_gray.png')}
      />;
    } else if (materialIconCurrencyCodes.includes(fiatCurrencyCode)) {
      return <MaterialCurrencyCodeIcon
        currencyCode={fiatCurrencyCode}
        color={color}
        size={styles.currencyImage.width}
        style={style}
      />;
    } else {
      return <Image
        style={style}
        source={
          getCurrencyImageByRegion(
            fiatCurrencyCode,
            'gray'
          )
        }
      />;
    }
  };

  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>
      <View style={{ marginRight: iconSpacing }}>
        <BalanceCurrencyIcon />
      </View>

      <Text style={{ ...styles.amountText, ...amountTextStyle, color }}>
        {formattedBalanceText}
      </Text>

      <Text style={{ ...styles.unitText, ...unitTextStyle, color }}>
        {formattedUnitText}
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  rootContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
    lineHeight: RFValue(17),
  },

  unitText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
  },
});

export default AccountBalanceDisplay;
