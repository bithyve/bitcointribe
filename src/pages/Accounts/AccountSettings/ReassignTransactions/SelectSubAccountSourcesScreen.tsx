import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import ButtonStyles from '../../../../common/Styles/Buttons';
import XPubSourceKind from '../../../../common/data/enums/XPubSourceKind';
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces';
import useAccountShellFromNavigation from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import CurrentTotalHeader from '../../../../components/account-settings/source-reassignment/CurrentTotalHeader';
import CheckingSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo';
import SubAccountSourcesList from '../../../../components/account-settings/source-reassignment/SubAccountSourcesList';
import SavingsSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo';

// TODO: Remove these after testing UI.
const sampleSources: SubAccountDescribing[] = [
  new CheckingSubAccountInfo({
    isPrimarySubAccount: true,
    balance: 23583,
  }),
  new SavingsSubAccountInfo({
    isPrimarySubAccount: true,
    balance: 99121,
  }),
  new CheckingSubAccountInfo({
    isPrimarySubAccount: true,
    balance: 11,
  }),
  new SavingsSubAccountInfo({
    isPrimarySubAccount: true,
    balance: 82308,
  }),
];


export type Props = {
  navigation: any;
};

const SelectSubAccountSourcesScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const accountShell = useAccountShellFromNavigation(navigation);
  const [selectedSourceIDs, setSelectedSourceIDs] = useState<Set<string>>(new Set());
  // const selectableSources = useReassignableSourcesForAccountShell(accountShell);
  const selectableSources = sampleSources;

  const canProceed = useMemo(() => {
    return selectedSourceIDs.size > 0;
  }, [selectedSourceIDs]);

  const selectedSources = useMemo(() => {
    return selectableSources.filter(source => selectedSourceIDs.has(source.id));
  }, [selectedSourceIDs]);

  const selectedTransactionIDs = useMemo(() => {
    selectedSources.flatMap(subAccountInfo => subAccountInfo.transactionIDs);
  }, [selectedSources]);

  function handleSourceSelection(source: SubAccountDescribing) {
    if (selectedSourceIDs.has(source.id)) {
      selectedSourceIDs.delete(source.id);
    } else {
      selectedSourceIDs.add(source.id);
    }

    setSelectedSourceIDs(new Set(selectedSourceIDs));
  }

  function handleProceedButtonPress() {
    navigation.navigate('ReassignTransactionsSelectDestination', {
      accountShellID: accountShell.id,
      reassignmentKind: XPubSourceKind.DESIGNATED,
      selectedTransactionIDs,
    });
  }

  return (
    <View style={styles.rootContainer}>
      <CurrentTotalHeader accountShell={accountShell} selectedSources={selectedSources} />

      <View>
        <SubAccountSourcesList
          selectableSources={selectableSources}
          selectedSourceIDs={selectedSourceIDs}
          onSourceSelected={handleSourceSelection}
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

export default SelectSubAccountSourcesScreen;
