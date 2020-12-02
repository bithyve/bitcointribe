import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import AccountShell from '../../common/data/models/AccountShell';
import AccountCardColumn from './AccountCardColumn';

export type Props = {
  accountShells: AccountShell[];
  onCardLongPressed: (accountShell: AccountShell) => void;
  onAccountSelected: (accountShell: AccountShell) => void;
  onAddNewSelected: () => void;
  contentContainerStyle?: Record<string, unknown>;
};

type RenderItemProps = {
  item: AccountShell[];
  index: number;
};


function keyExtractor(item: AccountShell[]): string {
  return item[0].id;
}

const HomeAccountCardsGrid: React.FC<Props> = ({
  accountShells,
  onCardLongPressed,
  onAccountSelected,
  onAddNewSelected,
  contentContainerStyle = {},
}: Props) => {

  const columnData: Array<AccountShell[]> = useMemo(() => {
    if (accountShells.length == 0) {
      return [];
    }

    if (accountShells.length == 1) {
      return [accountShells];
    }

    let columns = [];
    let currentColumn = [];

    accountShells.forEach((accountShell, index) => {
      currentColumn.push(accountShell);

      // Make a new column after adding two items -- or after adding the
      // very first item. This is because the first column
      // will only contain one item, since the "Add new" button will be placed
      // in front of everything.
      if (currentColumn.length == 2 || index == 0) {
        columns.push(currentColumn);
        currentColumn = [];
      }

      if (currentColumn.length > 0) {
        columns.push(currentColumn);
      }
    });

    return columns;
  }, [accountShells]);

  return (
    <FlatList
      horizontal
      contentContainerStyle={contentContainerStyle}
      showsHorizontalScrollIndicator={false}
      data={columnData}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }: RenderItemProps) => {
        return <AccountCardColumn
          cardData={item}
          prependsAddButton={index == 0}
          onAccountCardSelected={onAccountSelected}
          onAddNewAccountPressed={onAddNewSelected}
          onCardLongPressed={onCardLongPressed}
        />
      }}
    />
  );
};


export default HomeAccountCardsGrid;
