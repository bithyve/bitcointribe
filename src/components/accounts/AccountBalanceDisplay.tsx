import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import AccountKind from '../../common/data/enums/AccountKind';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { displayNameForBitcoinUnit } from '../../common/data/enums/BitcoinUnit';
import CurrencyKind from '../../common/data/enums/CurrencyKind';
import AccountPayload from '../../common/data/models/AccountPayload/Interfaces';
import { UsNumberFormat } from '../../common/utilities';
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode';
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind';
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../MaterialCurrencyCodeIcon';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions';
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText';

export type Props = {
  accountPayload: AccountPayload;
  containerStyle?: Record<string, unknown>;
  currencyImageSource?: NodeRequire;
  currencyImageStyle?: Record<string, unknown>;
  amountTextStyle?: Record<string, unknown>;
  unitTextStyle?: Record<string, unknown>;
};


const AccountBalanceDisplay: React.FC<Props> = ({
  accountPayload,
  containerStyle,
  currencyImageSource,
  currencyImageStyle,
  amountTextStyle,
  unitTextStyle,
}: Props) => {
  const balance = accountPayload.balance || 0;
  const currencyKind = useCurrencyKind();
  const fiatCurrencyCode = useCurrencyCode();

  const prefersBitcoin: boolean = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  const isUsingBitcoinUnits: boolean = useMemo(() => {
    return prefersBitcoin || accountPayload.kind === AccountKind.TEST;
  }, [prefersBitcoin, accountPayload.kind])

  const formattedBalanceText = useFormattedAmountText(balance);

  const formattedUnitText = useMemo(() => {
    if (isUsingBitcoinUnits) {
      return displayNameForBitcoinUnit(accountPayload.unit);
    } else {
      return fiatCurrencyCode.toLocaleLowerCase();
    }
  }, [isUsingBitcoinUnits, accountPayload.unit]);


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
