import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TransactionDescribing } from '../../../../common/data/models/Transactions/Interfaces';
import useAccountShellFromNavigation from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import sampleTransactions from '../../Details/SampleTransactions';
import { Button } from 'react-native-elements';
import ButtonStyles from '../../../../common/Styles/Buttons';
import CurrentTotalHeader from '../../../../components/account-settings/transaction-reassignment/CurrentTotalHeader';
import TransactionsList from '../../../../components/account-settings/transaction-reassignment/TransactionsList';
import XPubSourceKind from '../../../../common/data/enums/XPubSourceKind';

export type Props = {
  navigation: any;
};

const ReassignAllTransactionsSelectTransactionsScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountShell = useAccountShellFromNavigation(navigation);
  const [selectedTransactionIDs, setSelectedTransactionIDs] = useState<Set<string>>(new Set());
  const [selectableTransactions, setSelectableTransactions] = useState<TransactionDescribing[]>([]);

  const canProceed = useMemo(() => {
    return selectedTransactionIDs.size > 0;
  }, [selectedTransactionIDs]);

  const selectedTransactions = useMemo(() => {
    return selectableTransactions.filter(transaction => selectedTransactionIDs.has(transaction.txID));
  }, [selectedTransactionIDs]);


  useEffect(() => {
    // TODO: Devise some way to load selectable "anonymous" transactions for the
    // current account shell.
    setSelectableTransactions(sampleTransactions);
  }, [accountShell]);


  function handleTransactionSelection(transaction: TransactionDescribing) {
    if (selectedTransactionIDs.has(transaction.txID)) {
      selectedTransactionIDs.delete(transaction.txID);
    } else {
      selectedTransactionIDs.add(transaction.txID);
    }

    setSelectedTransactionIDs(new Set(selectedTransactionIDs));
  }

  function handleProceedButtonPress() {
    navigation.navigate('ReassignTransactionsSelectDestination', {
      accountID: accountShell.id,
      reassignmentKind: XPubSourceKind.ANONYMOUS,
      selectedTransactions,
    });
  }

  return (
    <View style={styles.rootContainer}>
      <CurrentTotalHeader accountShell={accountShell} selectedTransactions={selectedTransactions} />

      <View>
        <TransactionsList
          selectableTransactions={selectableTransactions}
          selectedTransactionIDs={selectedTransactionIDs}
          onTransactionSelected={handleTransactionSelection}
        />
      </View>

      <View style={styles.proceedButtonContainer}>
        <Button
          raised
          buttonStyle={ButtonStyles.primaryActionButton}
          title="Confirm & Proceed"
          titleStyle={ButtonStyles.actionButtonText}
          onPress={handleProceedButtonPress}
          disabled={canProceed === false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },

  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
});

export default ReassignAllTransactionsSelectTransactionsScreen;
