import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import BitcoinUnit, { displayNameForBitcoinUnit } from '../../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import { UsNumberFormat } from '../../../common/utilities'
import { shadowColorForAccountKind } from '../../../components/account-details/AccountDetailsCard'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'

export type Props = {
  availableBalance: Satoshis;
  bitcoinUnit: BitcoinUnit,
  onViewMorePressed: () => void;
  isTestAccount?: boolean;
  kind: SubAccountKind
};

const TransactionPreviewHeader: React.FC<Props> = ( {
  availableBalance,
  bitcoinUnit,
  onViewMorePressed,
  isTestAccount = false,
  kind,
}: Props ) => {
  const strings  = translations[ 'accounts' ]

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
        ...ListStyles.listItemTitle, marginBottom: 4,  color: shadowColorForAccountKind( {
          kind
        } )
      }}>
        {`${strings.availableToSpend}: ${formattedBalanceText} ${formattedUnitText}`}
      </Text>

      <View style={styles.viewMoreLinkRow}>
        <Text style={styles.headerDateText}>{strings.RecentTransactions}</Text>

        <TouchableOpacity
          onPress={onViewMorePressed}
        >
          <View
            style={styles.viewMoreWrapper}
          >
            <Text style={styles.headerTouchableText}>
              {strings.ViewMore}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    // marginBottom: 5,
  },

  viewMoreLinkRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  headerDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },

  headerTouchableText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium,
  },
  viewMoreWrapper: {
    height: 26,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 5,
    backgroundColor: Colors.blue
  }
} )

export default TransactionPreviewHeader
