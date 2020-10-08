import React, { memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import AddNewAccountCard from '../../pages/Home/AddNewAccountCard';
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces';
import HomeAccountsListCard from './HomeAccountsListCard';
import AccountShell from '../../common/data/models/AccountShell';

export type Props = {
  isBalanceLoading: boolean;
  cardData: AccountShell[];
  appendsAddButton: boolean;
  onAccountCardSelected: (accountShell: AccountShell) => void;
  onAddNewAccountPressed: () => void;
}

const AccountCardColumn: React.FC<Props> = ({
  isBalanceLoading,
  cardData,
  appendsAddButton,
  onAccountCardSelected,
  onAddNewAccountPressed,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      {cardData.map((accountShell) => {
        return (
          <TouchableOpacity style={styles.cardContainer} onPress={() => onAccountCardSelected(accountShell)}>
            <HomeAccountsListCard
              accountShell={accountShell}
              isBalanceLoading={isBalanceLoading}
            />
          </TouchableOpacity>
        );
      })}

      {appendsAddButton && (
        <AddNewAccountCard onPress={onAddNewAccountPressed} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    marginRight: 14,
  },

  cardContainer: {
    marginBottom: 14,
  },
})

export default memo(AccountCardColumn);
