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
import Invoice from '../../../models/Invoice'
import InvoiceItem from './InvoiceItem'

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
    paddingVertical: 40,
    color: 'grey'
  }
} )

type Props = {
    availableBalance: Satoshis,
    bitcoinUnit: BitcoinUnit,
    onViewMorePressed: () => void;
    invoices: Invoice [],
    accountShellId: string,
    loading: boolean,
    navigation: any
}

const TransactionsList: React.FC<Props> = ( {
  availableBalance,
  bitcoinUnit,
  onViewMorePressed,
  invoices,
  accountShellId,
  loading,
  navigation
}:Props ) => {
  const strings  = translations[ 'accounts' ]

  const formattedBalanceText = useFormattedAmountText( availableBalance )

  const formattedUnitText =  useFormattedUnitText( {
    bitcoinUnit
  } )

  const renderItem = ( { item: invoice, } : {
    item: Invoice;
  } ) => {
    return (
      <TouchableOpacity
        onPress={()=>{
          navigation.navigate( 'InvoiceDetailsScreen', {
            invoice
          } )
        }}
      >
        <InvoiceItem
          navigation = {navigation}
          invoice={invoice}/>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.rootContainer}>
      <Text style={{
        ...ListStyles.listItemTitle, marginBottom: 12,  color: Colors.mango
      }}>
        {`${strings.availableToSpend}: ${formattedBalanceText} ${formattedUnitText}`}
      </Text>

      <View style={styles.viewMoreLinkRow}>
        <Text style={styles.headerDateText}>{strings.RecentInvoices}</Text>

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
            data={invoices}
            //keyExtractor={keyExtractor}
            renderItem={renderItem}
          />
      }

    </View>
  )
}

export default TransactionsList

