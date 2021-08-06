import React, { useMemo, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { displayNameForBitcoinUnit } from '../../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import TransactionKind from '../../../common/data/enums/TransactionKind'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import ListStyles from '../../../common/Styles/ListStyles'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import TransactionDetailsHeader from './TransactionDetailsHeader'
import openLink from '../../../utils/OpenLink'
import config from '../../../bitcoin/HexaConfig'
import SourceAccountKind from '../../../common/data/enums/SourceAccountKind'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { useSelector, useDispatch } from 'react-redux'
import { markReadTx } from '../../../store/actions/accounts'
import { update } from '../../../storage/database'
export type Props = {
  navigation: any;
};


const TransactionDetailsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const transaction: TransactionDescribing = navigation.getParam( 'transaction' )
  const accountShellID: SubAccountKind = navigation.getParam( 'accountShellID' )
  const accountShell = useAccountShellForID( accountShellID )

  const primarySubAccount = usePrimarySubAccountForShell( accountShell )

  useEffect( () => {
    if( transaction.isNew ) dispatch( markReadTx( transaction.txid, accountShellID ) )
  }, [ transaction.isNew ] )

  const confirmationsText = useCallback( () => {
    return transaction.confirmations > 6 ?
      '6+'
      : `${transaction.confirmations}`
  }, [ transaction.confirmations ] )

  const feeText = useCallback( () => {
    const unitText = primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT ?
      displayNameForBitcoinUnit( accountShell.unit )
      : useFormattedUnitText( {
        bitcoinUnit: accountShell.unit
      } )

    return `${transaction.fee || ''} ${unitText}`
  }, [ primarySubAccount.kind, transaction.fee ] )


  const destinationHeadingText = useCallback( () => {
    switch ( transaction.transactionType ) {
        case TransactionKind.RECEIVE:
          return 'From Address'
        case TransactionKind.SEND:
          return 'To Address'
        default:
          return ''
    }
  }, [ transaction.transactionType ] )

  const destinationAddressText = useCallback( () => {
    switch ( transaction.transactionType ) {
        case TransactionKind.RECEIVE:
          return transaction.senderAddresses ?
            transaction.senderAddresses[ 0 ]
            : ''
        case TransactionKind.SEND:
          return transaction.recipientAddresses ?
            transaction.recipientAddresses[ 0 ]
            : ''
        default:
          return ''
    }
  }, [ transaction.transactionType ] )

  return (
    <ScrollView contentContainerStyle={styles.rootContainer} overScrollMode="never" bounces={false}>
      <Text style={styles.textHeader}>Transaction Details</Text>

      <TransactionDetailsHeader
        transaction={transaction}
        accountShellID={accountShellID}
      />

      <View style={styles.bodySection}>

        {/* <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>Amount</Text>

          <LabeledBalanceDisplay
            balance={transaction.amount}
            isTestAccount={primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT}
            unitTextStyle={{
              ...ListStyles.listItemSubtitle, marginBottom: 3
            }}
            amountTextStyle={{
              ...ListStyles.listItemSubtitle, marginBottom: -3, marginLeft: -2
            }}
            currencyImageStyle={{
              marginBottom: -3
            }}
          />
        </View> */}

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>Transaction ID</Text>
          <Text style={ListStyles.listItemSubtitle} onPress={() =>
            openLink(
              `https://blockstream.info${
                transaction.accountType === 'Test Account' ? '/testnet' : ''
              }/tx/${transaction.txid}`,
            )}>{transaction.txid}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>{destinationHeadingText()}</Text>
          <Text style={ListStyles.listItemSubtitle}>{destinationAddressText()}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>Fees</Text>
          <Text style={ListStyles.listItemSubtitle}>{feeText()}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>Confirmations</Text>
          <Text style={ListStyles.listItemSubtitle}>{confirmationsText()}</Text>
        </View>

      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.FiraSansRegular,
  },

  bodySection: {
    marginTop: 24,
    paddingHorizontal: 10,
  },

  lineItem: {
    marginBottom: RFValue( 16 ),
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 8,
  },
} )

export default TransactionDetailsContainerScreen
