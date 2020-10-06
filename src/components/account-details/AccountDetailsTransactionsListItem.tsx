import React from 'react';
import { ListItem } from 'react-native-elements';
import { TransactionDescribing } from '../../common/data/models/Transactions/Interfaces';
import TransactionListItemContent from './TransactionListItemContent';

export type Props = {
  transaction: TransactionDescribing;
};

const AccountDetailsTransactionsListItem: React.FC<Props> = ({
  transaction,
}: Props) => {
  return (
    <ListItem bottomDivider>
      <TransactionListItemContent transaction={transaction} />
      <ListItem.Chevron />
    </ListItem>
  );
};

export default AccountDetailsTransactionsListItem;
