import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import AccountVisibility from '../../../common/data/enums/AccountVisibility';
import RadioButton from '../../RadioButton';
import VisibilityOptionsListItemContent from './VisibilityOptionsListItemContent';

export type Props = {
  selectableOptions: AccountVisibility[];
  selectedOption: AccountVisibility | null;
  onOptionSelected: (option: AccountVisibility) => void;
};

const listItemKeyExtractor = (item: AccountVisibility) => String(item);

const VisibilityOptionsList: React.FC<Props> = ({
  selectableOptions,
  selectedOption,
  onOptionSelected,
}: Props) => {

  const isChecked = useCallback((option: AccountVisibility) => {
    return selectedOption === option;
  }, [selectedOption]);

  const renderItem = ({ item: visibilityOption }: { item: AccountVisibility }) => {
    return (
      <ListItem
        onPress={() => { onOptionSelected(visibilityOption) }}
      >
        <RadioButton
          isChecked={isChecked(visibilityOption)}
          ignoresTouch
        />

        <VisibilityOptionsListItemContent visibilityOption={visibilityOption} />
      </ListItem>
    );
  };

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      extraData={selectedOption}
      data={selectableOptions}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default VisibilityOptionsList;
