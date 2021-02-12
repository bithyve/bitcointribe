import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
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

export type Props = {
  navigation: any;
};


const TransactionDetailsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const transaction: TransactionDescribing = navigation.getParam( 'transaction' )
  const accountShellID: SubAccountKind = navigation.getParam( 'accountShellID' )

  const accountShell = useAccountShellForID( accountShellID )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )

  const confirmationsText = useMemo( () => {
    return transaction.confirmations > 6 ?
      '6+'
      : `${transaction.confirmations}`
  }, [ transaction.confirmations ] )

  const feeText = useMemo( () => {
    const unitText = primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT ?
      displayNameForBitcoinUnit( accountShell.unit )
      : useFormattedUnitText( {
        bitcoinUnit: accountShell.unit
      } )

    return `${transaction.fee || ''} ${unitText}`
  }, [ primarySubAccount.kind, transaction.fee ] )


  const destinationHeadingText = useMemo( () => {
    switch ( transaction.transactionType ) {
        case TransactionKind.RECEIVE:
          return 'From Address'
        case TransactionKind.SEND:
          return 'To Address'
        default:
          return ''
    }
  }, [ transaction.transactionType ] )

  const destinationAddressText = useMemo( () => {
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


  async function openExplorer( txid ) {
    let explorerTarget: string
    if( config.ENVIRONMENT !== 'DEV' &&  primarySubAccount.sourceKind !== SourceAccountKind.TEST_ACCOUNT ) explorerTarget = `https://live.blockcypher.com/btc/tx/${txiid}`
    else explorerTarget = `https://live.blockcypher.com/btc-testnet/tx/${txid}`
    await openLink( explorerTarget )
  }

  return (
    <View style={styles.rootContainer}>

      <TransactionDetailsHeader
        transaction={transaction}
        accountShellID={accountShellID}
      />

      <View style={styles.bodySection}>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitle}>Amount</Text>

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
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitle}>{destinationHeadingText}</Text>
          <Text style={ListStyles.listItemSubtitle}>{destinationAddressText}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitle}>Fees</Text>
          <Text style={ListStyles.listItemSubtitle}>{feeText}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitle}>Transaction ID</Text>
          <Text style={ListStyles.listItemSubtitle} onPress={()=>{
            openExplorer( transaction.txid )
          }}>{transaction.txid}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitle}>Confirmations</Text>
          <Text style={ListStyles.listItemSubtitle}>{confirmationsText}</Text>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  bodySection: {
    marginTop: 24,
    paddingHorizontal: 24,
  },

  lineItem: {
    marginBottom: RFValue( 16 ),
  },
} )

export default TransactionDetailsContainerScreen
