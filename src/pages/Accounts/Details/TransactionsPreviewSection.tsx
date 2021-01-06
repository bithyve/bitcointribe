import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import TransactionsList from '../../../components/account-details/AccountDetailsTransactionsList'

import TransactionPreviewHeader from './TransactionPreviewHeader'

export type Props = {
  transactions: TransactionDescribing[];
  availableBalance: Satoshis;
  bitcoinUnit: BitcoinUnit;
  isTestAccount: boolean;
  onViewMorePressed: () => void;
  onTransactionItemSelected: ( TransactionDescribing ) => void;
};

const TransactionsPreviewSection: React.FC<Props> = ( {
  transactions,
  availableBalance,
  bitcoinUnit,
  isTestAccount,
  onViewMorePressed,
  onTransactionItemSelected,
}: Props ) => {
  return (
    <View>
      <View style={styles.headerContainer}>
        <TransactionPreviewHeader
          availableBalance={availableBalance}
          bitcoinUnit={bitcoinUnit}
          isTestAccount={isTestAccount}
          onViewMorePressed={onViewMorePressed}
        />
      </View>


      {/* <TransactionPreviewTabs  */}

      {/* /> */}

      <View>
        <TransactionsList
          transactions={transactions}
          onTransactionSelected={onTransactionItemSelected}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  headerContainer: {
    paddingVertical: 20,
  },
} )

export default TransactionsPreviewSection
