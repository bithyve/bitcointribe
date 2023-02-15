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
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import { shadowColorForAccountKind } from '../../../components/account-details/AccountDetailsCard'
import { translations } from '../../../common/content/LocContext'
import LinearGradient from 'react-native-linear-gradient'

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
          <LinearGradient
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            colors={[ Colors.skyBlue, Colors.darkBlue ]}
            style={styles.viewMoreWrapper}
          >
            <Text style={styles.headerTouchableText}>
              {strings.ViewMore}
            </Text>
          </LinearGradient>
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
    fontFamily: Fonts.Italic,
  },
  viewMoreWrapper: {
    height: 22,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 5
  }
} )

export default TransactionPreviewHeader
