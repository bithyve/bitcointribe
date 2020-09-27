import React, { memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import AddNewAccountCard from '../../pages/Home/AddNewAccountCard';
import AccountPayload from '../../common/data/models/AccountPayload/AccountPayload';
import HomeAccountsListCard from './HomeAccountsListCard';

export interface Props {
  isBalanceLoading: boolean;
  cardData: AccountPayload[];
  appendsAddButton: boolean;
  prefersBTCUnits: boolean;
  fiatCurrencyCode: string;
  onAccountCardSelected: (AccountPayload) => void;
  onAddNewAccountPressed: () => void;
}

const AccountCardColumn: React.FC<Props> = ({
  isBalanceLoading,
  cardData,
  appendsAddButton,
  prefersBTCUnits,
  fiatCurrencyCode,
  onAccountCardSelected,
  onAddNewAccountPressed,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      {cardData.map((accountPayload) => {
        return (
          <TouchableOpacity style={styles.cardContainer} onPress={() => onAccountCardSelected(accountPayload)}>
            <HomeAccountsListCard
              accountPayload={accountPayload}
              prefersBTCUnits={prefersBTCUnits}
              fiatCurrencyCode={fiatCurrencyCode}
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
