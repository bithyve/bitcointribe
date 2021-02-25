import React from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import AccountShell from '../../../common/data/models/AccountShell'
import ReorderAccountShellsDraggableListItem from './ReorderAccountShellsDraggableListItem'

export type Props = {
  accountShells: AccountShell[];
  onDragEnded: ( newlyOrderedAccountShells: AccountShell[] ) => void;
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

const keyExtractor = ( item: AccountShell ) => item.id

function renderItem( { item: accountShell, drag, isActive }: RenderItemProps ): JSX.Element {
  return (
    <ReorderAccountShellsDraggableListItem
      accountShell={accountShell}
      isActive={isActive}
      onLongPress={() => {
        drag()
      }}
    />
  )
}

const ReorderAccountShellsDraggableList: React.FC<Props> = ( {
  accountShells,
  onDragEnded,
}: Props ) => {
  return (
    <DraggableFlatList
      activationDistance={5}
      data={accountShells}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onDragEnd={( { data } ) => onDragEnded( data )}
    />
  )
}

export default ReorderAccountShellsDraggableList
