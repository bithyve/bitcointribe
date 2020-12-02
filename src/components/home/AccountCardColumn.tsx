import React, { memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import AddNewAccountCard from '../../pages/Home/AddNewAccountCard';
import HomeAccountsListCard from './HomeAccountsListCard';
import AccountShell from '../../common/data/models/AccountShell';

export type Props = {
  cardData: AccountShell[];
  prependsAddButton: boolean;
  onAccountCardSelected: (accountShell: AccountShell) => void;
  onAddNewAccountPressed: () => void;
  onCardLongPressed: (accountShell: AccountShell) => void;
};

const AccountCardColumn: React.FC<Props> = ({
  cardData,
  prependsAddButton,
  onAccountCardSelected,
  onAddNewAccountPressed,
  onCardLongPressed,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      {prependsAddButton && (
        <AddNewAccountCard onPress={onAddNewAccountPressed} />
      )}

      {cardData.map((accountShell) => {
        return (
          <TouchableOpacity
            key={accountShell.id}
            style={styles.cardContainer}
            onPress={() => onAccountCardSelected(accountShell)}
            onLongPress={() => onCardLongPressed(accountShell)}
          >
            <HomeAccountsListCard
              accountShell={accountShell}
            />
          </TouchableOpacity>
        );
      })}
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
