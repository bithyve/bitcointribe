import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import AccountShell from '../../common/data/models/AccountShell';
import AccountCardColumn from '../../components/home/AccountCardColumn';
import AddNewAccountCard from './AddNewAccountCard';

export interface Props {
  columnData: Array<AccountShell[]>;
  isBalanceLoading: boolean;
  onCardSelected: (selectedAccount: AccountShell) => void;
  onAddNewSelected: () => void;
}

const HomeAccountCardsList: React.FC<Props> = ({
  columnData,
  isBalanceLoading,
  onCardSelected,
  onAddNewSelected,
}: Props) => {
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
      keyExtractor={(_, index) => String(index)}
      renderItem={({ item, index }: { item: AccountShell[] | string, index: number }) => {
        if (typeof item === 'string') {
          // "Manually" append an Add button ONLY if we're at the end and we know
          // it won't be stacked as the last item of a column.
          if (lastColumnLength === 1) { return null; }
          return <AddNewAccountCard onPress={onAddNewSelected} />
        } else {
          return <AccountCardColumn
            isBalanceLoading={isBalanceLoading}
            cardData={item as AccountShell[]}
            appendsAddButton={
              (item as AccountShell[]).length === 1 &&
              index === columnCount - 1
            }
            onAccountCardSelected={onCardSelected}
            onAddNewAccountPressed={onAddNewSelected}
          />
        }
      }}
    />
  );
};

export default HomeAccountCardsList;
