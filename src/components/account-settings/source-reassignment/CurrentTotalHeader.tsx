import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText';
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText';
import { RFValue } from 'react-native-responsive-fontsize';
import AccountShell from '../../../common/data/models/AccountShell';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';

export type Props = {
  accountShell: AccountShell;
  selectedSources: SubAccountDescribing[];
};

const CurrentTotalHeader: React.FC<Props> = ({
  accountShell,
  selectedSources,
}: Props) => {
  const totalAmount = useMemo(() => {
    return selectedSources.reduce((accumulated, current) => accumulated + current.balance, 0);
  }, [selectedSources]);

  const formattedAmountText = useFormattedAmountText(totalAmount);
  const formattedUnitText = useFormattedUnitText(accountShell);

  const countDescriptionText = useMemo(() => {
    const count = selectedSources.length;
    return `${count} source${count == 1 ? '' : 's'} selected`;
  }, [selectedSources]);


  return (
    <View style={styles.rootContainer}>

      <View style={styles.countDescriptionSection}>
        <Text style={styles.countDescriptionText}>{countDescriptionText}</Text>
      </View>

      <View style={styles.countTotalSection}>
        <Text style={styles.selectedTotalHeading}>Selected Total</Text>

        <View style={styles.totalAmountRow}>
          <Image
            style={styles.currencyIcon}
            source={require('../../../assets/images/icons/icon_bitcoin_gray.png')}
            resizeMode="contain"
          />

          <View style={styles.dividerLine}/>

          <Text style={styles.amountText}>{formattedAmountText}</Text>
          <Text style={styles.unitText}>{formattedUnitText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  selectedTotalHeading: {
    textAlign: 'right',
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: 11,
  },

  countDescriptionSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  countDescriptionText: {
    color: Colors.blue,
    paddingLeft: 10,
    marginBottom: -4,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: 16,
  },

  countTotalSection: {
    justifyContent: 'flex-end',
  },

  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  currencyIcon: {
    width: 20,
    height: 20,
  },

  dividerLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.borderColor,
    marginHorizontal: 10,
  },

  amountText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(20),
    marginRight: 6,
  },

  unitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
  },
});

export default CurrentTotalHeader;
