import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import RadioButton from '../../RadioButton';
import AccountSourceListItemContent from '../AccountSourceListItemContent';

export type Props = {
  selectableSubAccounts: SubAccountDescribing[];
  selectedSubAccountID: string | null;
  onAccountSelected: (subAccountInfo: SubAccountDescribing) => void;
};


const listItemKeyExtractor = (item: SubAccountDescribing) => item.id;

const DestinationAccountList: React.FC<Props> = ({
  selectableSubAccounts,
  selectedSubAccountID,
  onAccountSelected,
}: Props) => {

  const isChecked = useCallback((subAccountInfo: SubAccountDescribing) => {
    return subAccountInfo.id === selectedSubAccountID;
  }, [selectedSubAccountID]);

  const renderItem = ({ item: subAccountInfo }: { item: SubAccountDescribing }) => {
    return (
      <ListItem
        onPress={() => { onAccountSelected(subAccountInfo) }}
      >
        <RadioButton
          isChecked={isChecked(subAccountInfo)}
          ignoresTouch
        />

        <AccountSourceListItemContent subAccountInfo={subAccountInfo} />
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

export default DestinationAccountList;
