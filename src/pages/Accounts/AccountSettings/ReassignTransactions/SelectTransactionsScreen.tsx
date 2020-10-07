import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TransactionDescribing } from '../../../../common/data/models/Transactions/Interfaces';
import useAccountPayloadFromNavigation from '../../../../utils/hooks/state-selectors/UseAccountPayloadFromNavigation';
import sampleTransactions from '../../Details/SampleTransactions';
import { Button } from 'react-native-elements';
import ButtonStyles from '../../../../common/Styles/Buttons';
import CurrentTotalHeader from '../../../../components/account-settings/transaction-reassignment/CurrentTotalHeader';
import TransactionsList from '../../../../components/account-settings/transaction-reassignment/TransactionsList';
import TransactionReassignmentKind from '../../../../common/data/enums/TransactionReassignmentKind';

export type Props = {
  navigation: any;
};

const ReassignAllTransactionsSelectTransactionsScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountPayload = useAccountPayloadFromNavigation(navigation);
  const [selectedTransactionIDs, setSelectedTransactionIDs] = useState<Set<string>>(new Set());
  const [selectableTransactions, setSelectableTransactions] = useState<TransactionDescribing[]>([]);

  const canProceed = useMemo(() => {
    return selectedTransactionIDs.size > 0;
  }, [selectedTransactionIDs]);

  const selectedTransactions = useMemo(() => {
    return selectableTransactions.filter(transaction => selectedTransactionIDs.has(transaction.txID));
  }, [selectedTransactionIDs]);


  useEffect(() => {
    // TODO: Devise some way to load selectable "non-designated" transactions for the
    // current account.
    setSelectableTransactions(sampleTransactions);
  }, [accountPayload]);


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
      accountID: accountPayload.uuid,
      reassignmentKind: TransactionReassignmentKind.UNDESIGNATED_XPUBS,
      selectedTransactions,
    });
  }

  return (
    <View style={styles.rootContainer}>
      <CurrentTotalHeader accountPayload={accountPayload} selectedTransactions={selectedTransactions} />

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
