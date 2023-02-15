import moment from 'moment'
import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { Icon, ListItem } from 'react-native-elements'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { TransactionDetails } from '../../../bitcoin/utilities/Interface'
import TransactionKind from '../../../common/data/enums/TransactionKind'
import LabeledBalanceDisplay from '../../LabeledBalanceDisplay'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'

export type Props = {
  transactionData: RescannedTransactionData;
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind | null;
};

const RescannedTransactionListItem: React.FC<Props> = ( {
  transactionData,
  bitcoinUnit = BitcoinUnit.SATS,
  currencyKind = useCurrencyKind(),
}: Props ) => {

  const transactionDetails = useMemo( () => {
    return transactionData.details
  }, [ transactionData.details ] )

  const transactionKindIconName = useMemo( () => {
    switch ( transactionDetails.transactionType ) {
        case TransactionKind.RECEIVE:
          return 'long-arrow-down'
        case TransactionKind.SEND:
          return 'long-arrow-up'
    }
  }, [ transactionDetails.transactionType ] )

  const transactionKindIconColor = useMemo( () => {
    switch ( transactionDetails.transactionType ) {
        case TransactionKind.RECEIVE:
          return Colors.green
        case TransactionKind.SEND:
          return Colors.red
    }
  }, [ transactionDetails.transactionType ] )

  const amountTextStyle = useMemo( () => {
    return {
      ...styles.amountText,
      color: transactionKindIconColor,
    }
  }, [ transactionDetails.transactionType ] )

  const formattedTitleText = useMemo( () => {
    switch ( transactionDetails.transactionType ) {
        case 'Received':
          return transactionDetails.senderAddresses[ 0 ]
        case 'Sent':
          return transactionDetails.recipientAddresses[ 0 ]
        default:
          return 'Unknown target address'
    }
  }, [ transactionDetails.transactionType ] )

  const formattedSubtitleText = useMemo( () => {
    switch ( transactionDetails.transactionType ) {
        case 'Received':
          return `From: ${transactionDetails.senderAddresses[ 0 ] ?? ''}`
        case 'Sent':
          return `To: ${transactionDetails.recipientAddresses[ 0 ] ?? ''}`
        default:
          return 'Unknown target address'
    }
  }, [ transactionDetails.transactionType ] )

  const formattedDateText = useMemo( () => {
    return moment( transactionDetails.date ).format( 'DD MMMM YYYY' )
  }, [ transactionDetails.transactionType ] )

  const confirmationsText = useMemo( () => {
    return transactionDetails.confirmations > 6 ?
      '6+'
      : `${transactionDetails.confirmations}`
  }, [ transactionDetails.confirmations ] )

  return (
    <ListItem>
      <Icon
        style={styles.transactionKindIcon}
        name={transactionKindIconName}
        type={'font-awesome'}
        color={transactionKindIconColor}
        size={13}
      />

      <ListItem.Content style={styles.titleSection}>
        <ListItem.Title style={styles.titleText} numberOfLines={1}>
          {formattedTitleText}
        </ListItem.Title>
        <ListItem.Subtitle style={styles.subtitleText} numberOfLines={1}>
          {formattedSubtitleText}
        </ListItem.Subtitle>
      </ListItem.Content>

      <ListItem.Content style={styles.amountSection}>
        <LabeledBalanceDisplay
          balance={transactionDetails.amount}
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

      <ListItem.Chevron />
    </ListItem>
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
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 17 ),
  },
} )



export default RescannedTransactionListItem


