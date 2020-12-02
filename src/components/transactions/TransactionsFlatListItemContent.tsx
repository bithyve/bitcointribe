import React, { useMemo } from 'react'
import { StyleSheet, Image } from 'react-native'
import { ListItem, Icon } from 'react-native-elements'
import moment from 'moment'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { TransactionDetails } from '../../bitcoin/utilities/Interface'
import { FAST_BITCOINS, SUB_PRIMARY_ACCOUNT } from '../../common/constants/wallet-service-types'
import { UsNumberFormat } from '../../common/utilities'

export type Props = {
  transaction: TransactionDescribing;
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind | null;
};

const TransactionListItemContent: React.FC<Props> = ( {
  transaction,
  bitcoinUnit = BitcoinUnit.SATS,
  currencyKind = useCurrencyKind(),
}: Props ) => {
  const transactionKindIconName = useMemo( () => {
    switch ( transaction.transactionType ) {
        case TransactionKind.RECEIVE:
          return 'long-arrow-down'
        case TransactionKind.SEND:
          return 'long-arrow-up'
    }
  }, [ transaction.transactionType ] )

  const transactionKindIconColor = useMemo( () => {
    switch ( transaction.transactionType ) {
        case TransactionKind.RECEIVE:
          return Colors.green
        case TransactionKind.SEND:
          return Colors.red
    }
  }, [ transaction.transactionType ] )

  const amountTextStyle = useMemo( () => {
    return {
      ...styles.amountText,
      color: transactionKindIconColor,
    }
  }, [ transaction.transactionType ] )

  const formattedDateText = useMemo( () => {
    return moment( transaction.date ).format( 'DD MMMM YYYY' )
  }, [ transaction.transactionType ] )

  const confirmationsText = useMemo( () => {
    return transaction.confirmations > 6 ?
      '6+'
      : `${transaction.confirmations}`
  }, [ transaction.confirmations ] )

  return (
    <>
      <Icon
        style={styles.transactionKindIcon}
        name={transactionKindIconName}
        type={'font-awesome'}
        color={transactionKindIconColor}
        size={13}
      />

      <ListItem.Content style={styles.titleSection}>
        <ListItem.Title style={styles.titleText} numberOfLines={1}>
          {transaction.accountType}
        </ListItem.Title>
        <ListItem.Subtitle style={styles.subtitleText}>
          {formattedDateText}
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
        />
      </ListItem.Content>

      <ListItem.Content style={styles.confirmationsSection}>
        <ListItem.Subtitle style={styles.confirmationsText}>
          {confirmationsText}
        </ListItem.Subtitle>
      </ListItem.Content>
    </>
  )
}

const styles = StyleSheet.create( {
  transactionKindIcon: {
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
  },

  titleText: {
    color: Colors.blue,
    fontSize: RFValue( 12 ),
    marginBottom: 2,
  },

  subtitleText: {
    fontSize: RFValue( 10 ),
  },

  bitcoinImage: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  amountSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 16,
  },

  confirmationsSection: {
    flex: 0,
    marginLeft: 4,
  },

  confirmationsText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
    marginTop: RFValue( 4 ),
  },

  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue( 17 ),
  },
} )

export default TransactionListItemContent
