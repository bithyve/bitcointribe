import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import AccountShell from '../../../common/data/models/AccountShell';
import RadioButton from '../../RadioButton';
import AccountMergeDestinationListItemContent from '../AccountMergeDestinationListItemContent';

export type Props = {
  compatibleDestinations: AccountShell[];
  selectedDestinationID: string;
  onDestinationSelected: (accountShell: AccountShell) => void;
};

const listItemKeyExtractor = (item: AccountShell) => item.id;

const AccountShellMergeDestinationsList: React.FC<Props> = ({
  compatibleDestinations,
  selectedDestinationID,
  onDestinationSelected,
}: Props) => {

  const isChecked = useCallback((accountShell: AccountShell) => {
    return selectedDestinationID === accountShell.id;
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

        <AccountMergeDestinationListItemContent accountShell={accountShell} />
      </ListItem>
    );
  };

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      extraData={selectedDestinationID}
      data={compatibleDestinations}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});


export default AccountShellMergeDestinationsList;
