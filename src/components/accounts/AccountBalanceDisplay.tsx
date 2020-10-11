import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import CurrencyKind from '../../common/data/enums/CurrencyKind';
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces';
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode';
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind';
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../MaterialCurrencyCodeIcon';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions';
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText';
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText';
import AccountShell from '../../common/data/models/AccountShell';

export type Props = {
  accountShell: AccountShell;
  containerStyle?: Record<string, unknown>;
  currencyImageSource?: NodeRequire;
  currencyImageStyle?: Record<string, unknown>;
  amountTextStyle?: Record<string, unknown>;
  unitTextStyle?: Record<string, unknown>;
};


const AccountBalanceDisplay: React.FC<Props> = ({
  accountShell,
  containerStyle,
  currencyImageSource,
  currencyImageStyle,
  amountTextStyle,
  unitTextStyle,
}: Props) => {
  const balance = AccountShell.getTotalBalance(accountShell) || 0;
  const currencyKind = useCurrencyKind();
  const fiatCurrencyCode = useCurrencyCode();

  const prefersBitcoin: boolean = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  const formattedBalanceText = useFormattedAmountText(balance);
  const formattedUnitText = useFormattedUnitText(accountShell);

  const BalanceCurrencyIcon = () => {
    if (currencyImageSource) {
      return <Image
        style={{ ...styles.currencyImage, ...currencyImageStyle }}
        source={currencyImageSource}
      />;
    }

    if (prefersBitcoin) {
      return <Image
        style={{ ...styles.currencyImage, ...currencyImageStyle }}
        source={require('../../assets/images/currencySymbols/icon_bitcoin_gray.png')}
      />;
    } else if (materialIconCurrencyCodes.includes(fiatCurrencyCode)) {
      return <MaterialCurrencyCodeIcon
        currencyCode={fiatCurrencyCode}
        color={Colors.lightBlue}
        size={styles.currencyImage.width}
      />;
    } else {
      return <Image
        style={{ ...styles.currencyImage, ...currencyImageStyle }}
        source={
          getCurrencyImageByRegion(
            fiatCurrencyCode,
            'light_blue',
          )
        }
      />;
    }
  };

  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>

      <View style={styles.currencyIconContainer}>
        <BalanceCurrencyIcon />
      </View>

      <Text style={{ ...styles.amountText, ...amountTextStyle }}>
        {formattedBalanceText}
      </Text>

      <Text style={{ ...styles.unitText, ...unitTextStyle }}>
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

  currencyIconContainer: {
    marginRight: 5,
  },

  currencyImage: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },

  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 5,
    lineHeight: RFValue(17),
  },

  unitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
  },
});

export default AccountBalanceDisplay;
