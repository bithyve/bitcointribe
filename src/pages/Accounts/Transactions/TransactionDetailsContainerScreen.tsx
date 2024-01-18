import React, { useCallback, useEffect } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'

import { widthPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { Account, NetworkType, TransactionType } from '../../../bitcoin/utilities/Interface'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import { displayNameForBitcoinUnit } from '../../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import TransactionKind from '../../../common/data/enums/TransactionKind'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import HeaderTitle from '../../../components/HeaderTitle'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import { markReadTx } from '../../../store/actions/accounts'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForTransaction'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import openLink from '../../../utils/OpenLink'
import TransactionDetailsHeader from './TransactionDetailsHeader'

export type Props = {
  navigation: any;
  route: any;
};


const TransactionDetailsContainerScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const dispatch = useDispatch()
  const transaction: TransactionDescribing = route.params?.transaction
  const accountShellID: SubAccountKind = route.params?.accountShellID
  const accountShell = useAccountShellForID( accountShellID )

  const common = translations[ 'common' ]
  const strings = translations[ 'stackTitle' ]

  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const account: Account = useSelector( state => state.accounts.accounts[ primarySubAccount.id ] )

  useEffect( () => {
    if ( transaction.isNew ) dispatch( markReadTx( [ transaction.txid ], accountShellID ) )
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
    <SafeAreaView>
      <HeaderTitle
        navigation={navigation}
        backButton={true}
        firstLineTitle={strings[ 'Transaction Details' ]}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <ScrollView contentContainerStyle={styles.rootContainer} overScrollMode="never" bounces={false}>
        <View style={{
          marginVertical: 10
        }}>
          <TransactionDetailsHeader
            transaction={transaction}
            accountShellID={accountShellID}
          />
        </View>

        <View style={styles.bodySection}>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{common.amount}</Text>

            <LabeledBalanceDisplay
              balance={transaction.transactionType === TransactionType.RECEIVED ? transaction.amount : transaction.amount - Number( transaction.fee )}
              isTestAccount={primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT}
              unitTextStyle={{
                ...ListStyles.listItemSubtitle,
              // marginBottom: 4
              }}
              amountTextStyle={{
                ...ListStyles.listItemSubtitle,
              // marginBottom: 3,
              //  marginLeft: -2
              }}
              currencyImageStyle={{
              // marginBottom: -3
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
                      {
                        getAvatarForSubAccount( primarySubAccount, false, true, true, transaction )
                      }
                      <Text style={[ ListStyles.listItemSubtitle, {
                        flex: 1,
                        marginLeft: widthPercentageToDP( 2 )
                      } ]}>
                        {`${rec.name ? rec.name : transaction.recipientAddresses[ index ]}`}</Text>
                      <LabeledBalanceDisplay
                        balance={rec.amount}
                        isTestAccount={primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT}
                        unitTextStyle={{
                          ...ListStyles.listItemSubtitle,
                        // marginBottom: 3
                        }}
                        amountTextStyle={{
                          ...ListStyles.listItemSubtitle,
                          // marginBottom: -3,
                          marginLeft: 2,

                        }}
                        currencyImageStyle={{
                        // marginBottom: -3
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
                `https://blockstream.info${account.networkType === NetworkType.TESTNET ? '/testnet' : ''
                }/tx/${transaction.txid}`,
              )}>{transaction.txid}</Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{destinationHeadingText()}</Text>
            <Text style={ListStyles.listItemSubtitle}>{destinationAddressText()}</Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{common.fees}</Text>
            {/* <Text style={ListStyles.listItemSubtitle}>{feeText()}</Text> */}
            <LabeledBalanceDisplay
              balance={Number( transaction.fee )}
              isTestAccount={primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT}
              unitTextStyle={{
                ...ListStyles.listItemSubtitle,
              // marginBottom: 1
              }}
              amountTextStyle={{
                ...ListStyles.listItemSubtitle,
                // marginBottom: -3,
                marginLeft: 2
              }}
              currencyImageStyle={{
              // marginBottom: -3
              }}
            />
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{common.confirmations}</Text>
            <Text style={ListStyles.listItemSubtitle}>{confirmationsText()}</Text>
          </View>

          {/* {transaction.notes ?
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{common.note}</Text>
            <Text style={ListStyles.listItemSubtitle}>{transaction.notes}</Text>
          </View> */}

          {
            ( transaction.receivers &&
            transaction.receivers.length > 1
            ) && (
              <View style={styles.lineItem}>
                <Text style={ListStyles.listItemTitleTransaction}>{common.recipients}</Text>
                {
                  transaction.receivers.map( ( rec, index ) => (
                    <View key={index} style={styles.containerRec}>
                      {
                        getAvatarForSubAccount( primarySubAccount, false, true, true, transaction )
                      }
                      <Text style={[ ListStyles.listItemSubtitle, {
                        flex: 1,
                        marginLeft: widthPercentageToDP( 2 )
                      } ]}>
                        {`${rec.name ? rec.name : transaction.recipientAddresses[ index ]}`}</Text>
                      <LabeledBalanceDisplay
                        balance={rec.amount}
                        isTestAccount={primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT}
                        unitTextStyle={{
                          ...ListStyles.listItemSubtitle,
                        // marginBottom: 3
                        }}
                        amountTextStyle={{
                          ...ListStyles.listItemSubtitle,
                          // marginBottom: -3,
                          marginLeft: 2,

                        }}
                        currencyImageStyle={{
                        // marginBottom: -3
                        }}
                      />
                    </View>
                  ) )
                }

              </View>
            )
          }

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{destinationHeadingText()}</Text>
            <Text style={ListStyles.listItemSubtitle}>{destinationAddressText()}</Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{common.fees}</Text>
            {/* <Text style={ListStyles.listItemSubtitle}>{feeText()}</Text> */}
            <LabeledBalanceDisplay
              balance={Number( transaction.fee )}
              isTestAccount={primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT}
              unitTextStyle={{
                ...ListStyles.listItemSubtitle,
              // marginBottom: 1
              }}
              amountTextStyle={{
                ...ListStyles.listItemSubtitle,
                // marginBottom: -3,
                marginLeft: 2
              }}
              currencyImageStyle={{
              // marginBottom: -3
              }}
            />
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>{common.confirmations}</Text>
            <Text style={ListStyles.listItemSubtitle}>{confirmationsText()}</Text>
          </View>

          {transaction.notes ?
            <View style={styles.lineItem}>
              <Text style={ListStyles.listItemTitleTransaction}>{common.note}</Text>
              <Text style={ListStyles.listItemSubtitle}>{transaction.notes}</Text>
            </View>
            : null}

        </View>
      </ScrollView>
    </SafeAreaView>
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
    fontFamily: Fonts.Regular,
  },

  bodySection: {
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
    padding: 10,
  },
} )

export default TransactionDetailsContainerScreen
