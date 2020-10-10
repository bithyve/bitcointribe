import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import AccountShell from '../../../common/data/models/AccountShell';
import RadioButton from '../../RadioButton';
import DestinationAccountShellListItemContent from '../DestinationAccountShellListItemContent';

export type Props = {
  selectableDestinations: AccountShell[];
  selectedDestinationID: string | null;
  onDestinationSelected: (accountShell: AccountShell) => void;
};

const listItemKeyExtractor = (item: AccountShell) => item.id;

const DestinationAccountShellsList: React.FC<Props> = ({
  selectableDestinations,
  selectedDestinationID,
  onDestinationSelected,
}: Props) => {

  const isChecked = useCallback((accountShell: AccountShell) => {
    return accountShell.id === selectedDestinationID;
  }, [selectedDestinationID]);

  const renderItem = ({ item: accountShell }: { item: AccountShell }) => {
    return (
      <ListItem
        onPress={() => { onDestinationSelected(accountShell) }}
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
      extraData={selectedDestinationID}
      data={selectableDestinations}
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
