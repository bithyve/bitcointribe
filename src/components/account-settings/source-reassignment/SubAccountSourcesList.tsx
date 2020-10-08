import React, { useCallback } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { ListItem } from 'react-native-elements';
import RadioButton from '../../RadioButton';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import DesignatedSourceListItemContent from '../DesignatedSourceListItemContent';

export type Props = {
  selectableSources: SubAccountDescribing[];
  selectedSourceIDs: Set<string>;
  onSourceSelected: (source: SubAccountDescribing) => void;
};

const listItemKeyExtractor = (item: SubAccountDescribing) => item.id;

const SubAccountSourcesList: React.FC<Props> = ({
  selectableSources,
  selectedSourceIDs,
  onSourceSelected,
}: Props) => {

  const isChecked = useCallback((subAccountInfo: SubAccountDescribing) => {
    return selectedSourceIDs.has(subAccountInfo.id);
  }, [selectedSourceIDs]);

  const renderItem = ({ item: subAccountInfo }: { item: SubAccountDescribing }) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { onSourceSelected(subAccountInfo) }}
      >
        <RadioButton
          isChecked={isChecked(subAccountInfo)}
          ignoresTouch
        />

        <DesignatedSourceListItemContent subAccountInfo={subAccountInfo} />
      </ListItem>
    );
  };

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      extraData={selectedSourceIDs}
      data={selectableSources}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default SubAccountSourcesList;
