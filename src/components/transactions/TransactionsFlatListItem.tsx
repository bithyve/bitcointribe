import React from 'react';
import { ListItem } from 'react-native-elements';
import TransactionsFlatListItemContent from './TransactionsFlatListItemContent';
import { TransactionDetails } from '../../bitcoin/utilities/Interface';

export type Props = {
  transaction: TransactionDetails;
  onPress: () => void;
};

const TransactionsFlatListItem: React.FC<Props> = ({
  transaction,
  onPress,
}: Props) => {
  return (
    <ListItem bottomDivider onPress={onPress}>
      <TransactionsFlatListItemContent transaction={transaction} />
    </ListItem>
  );
};

export default TransactionsFlatListItem;
