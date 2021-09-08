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
import { TransactionType } from '../../../bitcoin/utilities/Interface'
import { translations } from '../../../common/content/LocContext'

export type Props = {
  navigation: any;
};


const TransactionDetailsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const transaction: TransactionDescribing = navigation.getParam( 'transaction' )
  const accountShellID: SubAccountKind = navigation.getParam( 'accountShellID' )
  const accountShell = useAccountShellForID( accountShellID )
  const common  = translations[ 'common' ]
  const strings  = translations[ 'stackTitle' ]

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
          return common.fromAddress
        case TransactionKind.SEND:
          return common.toAddress
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
      <Text style={styles.textHeader}>{strings[ 'Transaction Details' ]}</Text>

      <TransactionDetailsHeader
        transaction={transaction}
        accountShellID={accountShellID}
      />

      <View style={styles.bodySection}>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>{common.amount}</Text>

          <LabeledBalanceDisplay
            balance={transaction.transactionType === TransactionType.RECEIVED ? transaction.amount : transaction.amount - Number( transaction.fee )}
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

        {
          ( transaction.receivers &&
            transaction.receivers.length > 1
          ) && (
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>{common.recipients}</Text>
              {
                transaction.receivers.map( ( rec, index ) => (
                  <View key={index} style={styles.containerRec}>
                    <Text style={[ ListStyles.listItemSubtitle, {
                      flex: 1
                    } ]}>{`${rec.name ? rec.name : transaction.recipientAddresses[ index ]}`}</Text>
                    <LabeledBalanceDisplay
                      balance={rec.amount}
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
                ) )
              }

            </View>
          )
        }

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>{common.TransactionID}</Text>
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
          <Text style={ListStyles.listItemTitleTransaction}>{common.fees}</Text>
          <Text style={ListStyles.listItemSubtitle}>{feeText()}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>{common.confirmations}</Text>
          <Text style={ListStyles.listItemSubtitle}>{confirmationsText()}</Text>
        </View>

      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
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

  containerRec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
} )

export default TransactionDetailsContainerScreen
