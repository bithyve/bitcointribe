import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
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
import AccountSavings from '../../../assets/images/accIcons/lightning.svg'
import moment from 'moment'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'

const styles = StyleSheet.create( {
  transactionKindIcon: {
    marginRight: 14,
  },

  titleSection: {
    flex: 1, width: widthPercentageToDP( '35%' )
  },
  titleText: {
    color: Colors.greyTextColor,
    fontSize: RFValue( 12 ),
    marginBottom: 2,
    // fontWeight: 'bold',
    fontFamily: Fonts.FiraSansRegular,
  },

  subtitleText: {
    fontSize: RFValue( 10 ),
    letterSpacing: 0.3,
    color: Colors.gray2
  },
  amountSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  containerImg: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: 45,
    marginRight: 10,
    backgroundColor: '#F4F4F4',
    padding: 2,
    borderRadius: 45/2,
    borderColor: Colors.white,
    borderWidth: 2,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.6,
    shadowOffset: {
      width: 10, height: 10
    },
  },
  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue( 17 ),
  },
  bitcoinImage: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  confirmationsText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
    marginTop: RFValue( 4 ),
  },

} )


type Props = {
  transaction: Transaction,
  accountShellId: string,
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind | null;
}

const TransactionItem = ( {
  transaction,
  accountShellId,
  bitcoinUnit = BitcoinUnit.SATS,
  currencyKind = useCurrencyKind()
}: Props ) => {
  const { getAmount } = transaction

  const confirmationsText = useMemo( () => {
    return transaction.num_confirmations > 6 ?
      ' 6+'
      : ` ${transaction.num_confirmations}`
  }, [ transaction.num_confirmations ] )

  const transactionKindIconColor = useMemo( () => {
    if ( Number( getAmount ) >= 0 ) {
      return Colors.green
    }
    return Colors.red
  }, [ transaction ] )

  const amountTextStyle = useMemo( () => {
    return {
      ...styles.amountText,
      color: transactionKindIconColor,
    }
  }, [ transaction ] )


  return (
    <View>
      <ListItem containerStyle={{
        backgroundColor: '#f5f5f5', paddingHorizontal: widthPercentageToDP( 1 )
      }} pad={1}>

        <View style={styles.containerImg}>
          <Text style={{
            fontSize:RFValue( 15 )
          }}>@</Text>
        </View>
        <ListItem.Content style={styles.titleSection}>
          <ListItem.Title style={styles.titleText} numberOfLines={1}>
          External address
          </ListItem.Title>
          <ListItem.Subtitle style={styles.subtitleText}>
            {moment( transaction.getDate ).format( 'DD/MM/YY • hh:MMa' )}
          </ListItem.Subtitle>
        </ListItem.Content>

        <ListItem.Content style={styles.amountSection}>
          <LabeledBalanceDisplay
            balance={transaction.amount}
            bitcoinUnit={bitcoinUnit}
            currencyKind={currencyKind}
            amountTextStyle={amountTextStyle}
            currencyImageStyle={styles.bitcoinImage}
            iconSpacing={2}
            bitcoinIconColor="gray"
            textColor="gray"
            isTestAccount={false}
          />
          <ListItem.Subtitle style={styles.confirmationsText}>
            {confirmationsText}
          </ListItem.Subtitle>
          <ListItem.Chevron size={22}/>

        </ListItem.Content>
      </ListItem>

      <View style={{
        borderBottomWidth: 1, borderColor: Colors.lightTextColor, marginHorizontal: widthPercentageToDP( 4 ), opacity:.1,
      }} />
    </View>
  )
}

export default TransactionItem

