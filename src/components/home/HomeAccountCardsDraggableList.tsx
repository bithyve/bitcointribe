import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import AccountShell from '../../common/data/models/AccountShell';
import HomeAccountsListCard from './HomeAccountsListCard';

export type Props = {
  accountShells: AccountShell[];
  onDragEnded: (newlyOrderedAccountShells: AccountShell[]) => void;
};


type RenderItemProps = {
  item: AccountShell;
  index: number;

  /**
   * A function to be called when the row should become
   * active (i.e. in an `onLongPress` or `onPressIn` event)
   */
  drag: () => void;

  isActive: boolean;
};


const keyExtractor = (item: AccountShell) => item.id;

function renderItem({ item, drag }: RenderItemProps): JSX.Element {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onLongPress={() => {
        drag();
      }}
    >
      <HomeAccountsListCard
        accountShell={item}
      />
    </TouchableOpacity>
  );
}

const HomeAccountCardsDraggableList: React.FC<Props> = ({
  accountShells,
  onDragEnded,
}: Props) => {
  return (
    <DraggableFlatList
      horizontal
      contentContainerStyle={{ paddingLeft: 14 }}
      showsHorizontalScrollIndicator={false}
      data={accountShells}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onDragEnd={({ data }) => onDragEnded(data)}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginRight: 14,
    position: 'relative',
  },

  reorderIcon: {

  },
});

export default HomeAccountCardsDraggableList;
