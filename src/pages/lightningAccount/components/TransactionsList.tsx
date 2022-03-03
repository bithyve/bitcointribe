import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import { translations } from '../../../common/content/LocContext'
import { ListItem } from 'react-native-elements'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Transaction from '../../../models/Transaction'
import TransactionItem from './TransactionItem'

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

  activityIndicator: {
    paddingVertical: 40
  }
} )

type Props = {
    availableBalance: Satoshis,
    bitcoinUnit: BitcoinUnit,
    onViewMorePressed: () => void;
    transactions: Transaction [],
    accountShellId: string,
    loading: boolean,
    navigation: any
}

const TransactionsList: React.FC<Props> = ( {
  availableBalance,
  bitcoinUnit,
  onViewMorePressed,
  transactions,
  accountShellId,
  loading,
  navigation
}:Props ) => {
  const strings  = translations[ 'accounts' ]

  const formattedBalanceText = useFormattedAmountText( availableBalance )

  const formattedUnitText =  useFormattedUnitText( {
    bitcoinUnit
  } )

  const renderItem = ( { item: transaction, } : {
    item: Transaction;
  } ) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate( 'TransactionDetailsScreen', {
            transaction,
            accountShellId
          } )
        }}>
        <TransactionItem
          transaction={transaction}
          accountShellId={accountShellId}
        />

      </TouchableOpacity>
    )
  }


  return (
    <View style={styles.rootContainer}>
      <Text style={{
        ...ListStyles.listItemTitle, marginBottom: 12,  color: Colors.orange
      }}>
        {`${strings.availableToSpend}: ${formattedBalanceText} ${formattedUnitText}`}
      </Text>

      <View style={styles.viewMoreLinkRow}>
        <Text style={styles.headerDateText}>{strings.RecentTransactions}</Text>

        <TouchableOpacity
          style={{
            marginLeft: 'auto', flex: 0
          }}
          onPress={onViewMorePressed}
        >
          <Text style={styles.headerTouchableText}>
            {strings.ViewMore}
          </Text>
        </TouchableOpacity>
      </View>
      {
        loading ? <ActivityIndicator color={Colors.blue} size="large" style={styles.activityIndicator}/>:
          <FlatList
            data={transactions}
            //keyExtractor={keyExtractor}
            renderItem={renderItem}
          />
      }

    </View>
  )
}

export default TransactionsList

