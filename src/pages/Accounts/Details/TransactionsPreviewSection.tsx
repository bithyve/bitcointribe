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
  accountShellId: string,
  onTransactionItemSelected: ( TransactionDescribing ) => void;
  kind: SubAccountKind
};

const TransactionsPreviewSection: React.FC<Props> = ( {
  transactions,
  availableBalance,
  bitcoinUnit,
  isTestAccount,
  onViewMorePressed,
  onTransactionItemSelected,
  accountShellId,
  kind
}: Props ) => {
  return (
    <View>
      <View style={styles.headerContainer}>
        <TransactionPreviewHeader
          availableBalance={availableBalance}
          bitcoinUnit={bitcoinUnit}
          isTestAccount={isTestAccount}
          onViewMorePressed={onViewMorePressed}
          kind={kind}
        />
      </View>


      {/* <TransactionPreviewTabs  */}

      {/* /> */}

      <View>
        <TransactionsList
          transactions={transactions}
          onTransactionSelected={onTransactionItemSelected}
          accountShellId={accountShellId}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
} )

export default TransactionsPreviewSection
