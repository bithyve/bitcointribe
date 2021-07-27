import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import BitcoinUnit, { displayNameForBitcoinUnit } from '../../../common/data/enums/BitcoinUnit'
import { UsNumberFormat } from '../../../common/utilities'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'

export type Props = {
  availableBalance: Satoshis;
  bitcoinUnit: BitcoinUnit,
  onViewMorePressed: () => void;
  isTestAccount?: boolean;
};

const TransactionPreviewHeader: React.FC<Props> = ( {
  availableBalance,
  bitcoinUnit,
  onViewMorePressed,
  isTestAccount = false,
}: Props ) => {

  const formattedBalanceText = isTestAccount ?
    UsNumberFormat( availableBalance )
    : useFormattedAmountText( availableBalance )

  const formattedUnitText = isTestAccount ?
    displayNameForBitcoinUnit( bitcoinUnit )
    : useFormattedUnitText( {
      bitcoinUnit
    } )

  return (
    <View style={styles.rootContainer}>

      <Text style={{
        ...ListStyles.listItemTitle, marginBottom: 12
      }}>
        Available to spend: {formattedBalanceText} {formattedUnitText}
      </Text>

      <View style={styles.viewMoreLinkRow}>
        <Text style={styles.headerDateText}>Today</Text>

        <TouchableOpacity
          style={{
            marginLeft: 'auto', flex: 0
          }}
          onPress={onViewMorePressed}
        >
          <Text style={styles.headerTouchableText}>
            View More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    marginBottom: 5,
  },

  viewMoreLinkRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  headerDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },

  headerTouchableText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansItalic,
    textDecorationLine: 'underline',
    marginLeft: 'auto',
  },
} )

export default TransactionPreviewHeader
