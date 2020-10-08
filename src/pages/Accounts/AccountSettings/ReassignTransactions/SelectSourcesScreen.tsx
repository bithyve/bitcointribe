import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import ButtonStyles from '../../../../common/Styles/Buttons';
import XPubSourceKind from '../../../../common/data/enums/XPubSourceKind';
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces';
import useAccountShellFromNavigation from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import useReassignableSourcesForAccount from '../../../../utils/hooks/account-utils/UseReassignableSourcesForAccount';
import CurrentTotalHeader from '../../../../components/account-settings/transaction-reassignment/CurrentTotalHeader';
import TransactionsList from '../../../../components/account-settings/transaction-reassignment/TransactionsList';

export type Props = {
  navigation: any;
};

const SelectSourcesScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountShell = useAccountShellFromNavigation(navigation);
  const [selectedSourceIDs, setSelectedSourceIDs] = useState<Set<string>>(new Set());
  const selectableSources = useReassignableSourcesForAccount(accountShell);

  const canProceed = useMemo(() => {
    return selectedSourceIDs.size > 0;
  }, [selectedSourceIDs]);

  const selectedSources = useMemo(() => {
    return selectableSources.filter(source => selectedSourceIDs.has(source.id));
  }, [selectedSourceIDs]);



  function handleSourceSelection(source: SubAccountDescribing) {
    if (selectedSourceIDs.has(accountShell.id)) {
      selectedSourceIDs.delete(accountShell.id);
    } else {
      selectedSourceIDs.add(accountShell.id);
    }

    setSelectedSourceIDs(new Set(selectedSourceIDs));
  }

  function handleProceedButtonPress() {
    navigation.navigate('ReassignTransactionsSelectDestination', {
      accountID: accountShell.id,
      reassignmentKind: XPubSourceKind.DESIGNATED,
      selectedSources,
    });
  }

  return (
    <View style={styles.rootContainer}>
      <CurrentTotalHeader accountShell={accountShell} selectedSources={selectedSources} />

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

export default SelectSourcesScreen;
