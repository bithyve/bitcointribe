import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import AccountShell from '../../../common/data/models/AccountShell';
import RadioButton from '../../RadioButton';
import DestinationAccountShellListItemContent from '../DestinationAccountShellListItemContent';

export type Props = {
  selectableAccountShells: AccountShell[];
  selectedAccountShellID: string | null;
  onAccountSelected: (accountShell: AccountShell) => void;
};

const listItemKeyExtractor = (item: AccountShell) => item.id;

const DestinationAccountShellsList: React.FC<Props> = ({
  selectableAccountShells: selectableSubAccounts,
  selectedAccountShellID: selectedSubAccountID,
  onAccountSelected,
}: Props) => {

  const isChecked = useCallback((accountShell: AccountShell) => {
    return accountShell.id === selectedSubAccountID;
  }, [selectedSubAccountID]);

  const renderItem = ({ item: accountShell }: { item: AccountShell }) => {
    return (
      <ListItem
        onPress={() => { onAccountSelected(accountShell) }}
      >
        <RadioButton
          isChecked={isChecked(accountShell)}
          ignoresTouch
        />

        <DestinationAccountShellListItemContent subAccountInfo={accountShell.primarySubAccount} />
      </ListItem>
    );
  };

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      extraData={selectedSubAccountID}
      data={selectableSubAccounts}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default DestinationAccountShellsList;
