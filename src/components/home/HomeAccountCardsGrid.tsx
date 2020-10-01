import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AccountShell from '../../common/data/models/AccountShell';
import AddNewAccountCard from '../../pages/Home/AddNewAccountCard';
import AccountCardColumn from './AccountCardColumn';

export type Props = {
  accountShells: AccountShell[];
  onCardLongPressed: (accountShell: AccountShell) => void;
  onAccountSelected: (accountShell: AccountShell) => void;
  onAddNewSelected: () => void;
};

type RenderItemProps = {
  item: AccountShell[] | string;
  index: number;
};


function keyExtractor(item: AccountShell[] | string): string {
  if (typeof item === 'string') {
    return item;
  } else {
    return (item as AccountShell[])[0].id;
  }
}

const HomeAccountCardsGrid: React.FC<Props> = ({
  accountShells,
  onCardLongPressed,
  onAccountSelected,
  onAddNewSelected,
}: Props) => {

  const columnData: Array<AccountShell[]> = useMemo(() => {
    if (accountShells.length <= 2) {
      return [accountShells];
    }

    let columns = [];
    let currentColumn = [];

    for (let accountShell of accountShells) {
      currentColumn.push(accountShell);

      if (currentColumn.length == 2) {
        columns.push(currentColumn);
        currentColumn = [];
      }
    }

    if (currentColumn.length > 0) {
      columns.push(currentColumn);
    }

    return columns;
  }, [accountShells]);

  const columnCount = useMemo(() => {
    return columnData.length;
  }, [columnData]);

  const lastColumnLength = useMemo(() => {
    if (columnCount === 0) {
      return 0;
    } else {
      return columnData[columnCount - 1].length;
    }
  }, [columnData, columnCount]);


  return (
    <FlatList
      horizontal
      contentContainerStyle={{ paddingLeft: 14 }}
      showsHorizontalScrollIndicator={false}
      data={[...columnData, 'Flag for Add Button']}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }: RenderItemProps) => {
        if (typeof item === 'string') {
          // "Manually" append an Add button ONLY if we're at the end and we know
          // it won't be stacked as the last item of a column.
          if (lastColumnLength === 1) {
            return null;
          } else {
            return <AddNewAccountCard onPress={onAddNewSelected} />
          }
        } else {
          return <AccountCardColumn
            cardData={item as AccountShell[]}
            appendsAddButton={
              (item as AccountShell[]).length === 1 &&
              index === columnCount - 1
            }
            onAccountCardSelected={onAccountSelected}
            onAddNewAccountPressed={onAddNewSelected}
            onCardLongPressed={onCardLongPressed}
          />
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default HomeAccountCardsGrid;
