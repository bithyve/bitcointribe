import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import AccountPayload from '../../../common/data/models/AccountPayload/Interfaces';
import RadioButton from '../../RadioButton';
import AccountSourceListItemContent from '../AccountSourceListItemContent';

export type Props = {
  selectableAccounts: AccountPayload[];
  selectedAccountID: string | null;
  onAccountSelected: (AccountPayload) => void;
};


const listItemKeyExtractor = (item: AccountPayload) => item.uuid;

const DestinationAccountList: React.FC<Props> = ({
  selectableAccounts,
  selectedAccountID,
  onAccountSelected,
}: Props) => {

  const isChecked = useCallback((accountPayload: AccountPayload) => {
    return accountPayload.uuid === selectedAccountID;
  }, [selectedAccountID]);

  const renderItem = ({ item: accountPayload }: { item: AccountPayload }) => {
    return (
      <ListItem
        onPress={() => { onAccountSelected(accountPayload) }}
      >
        <RadioButton
          isChecked={isChecked(accountPayload)}
          ignoresTouch
        />

        <AccountSourceListItemContent accountPayload={accountPayload} />
      </ListItem>
    );
  };

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      extraData={selectedAccountID}
      data={selectableAccounts}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default DestinationAccountList;
