import React, { memo } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'

import AddNewAccountCard from '../../pages/Home/AddNewAccountCard'
import HomeAccountsListCard from './HomeAccountsListCard'
import AccountShell from '../../common/data/models/AccountShell'
import { SECURE_ACCOUNT } from '../../common/constants/wallet-service-types'

export type Props = {
  cardData: AccountShell[];
  prependsAddButton: boolean;
  onAccountCardSelected: ( accountShell: AccountShell ) => void;
  onAddNewAccountPressed: () => void;
  currentLevel: number;
  onCardLongPressed: ( accountShell: AccountShell ) => void;
};

const AccountCardColumn: React.FC<Props> = ( {
  cardData,
  prependsAddButton,
  onAccountCardSelected,
  onAddNewAccountPressed,
  onCardLongPressed,
  currentLevel
}: Props ) => {
  return (
    <View style={styles.rootContainer}>
      {prependsAddButton && (
        <AddNewAccountCard
          containerStyle={styles.cardContainer}
          onPress={onAddNewAccountPressed}
        />
      )}

      {cardData.map( ( accountShell ) => {
        const disabled = false
        // if(currentLevel < 2 && accountShell.primarySubAccount.kind === SECURE_ACCOUNT) disabled = true;
        return (
          <TouchableOpacity
            key={accountShell.id}
            disabled={disabled}
            style={styles.cardContainer}
            onPress={() => onAccountCardSelected( accountShell )}
            onLongPress={() => onCardLongPressed( accountShell )}
          >
            <HomeAccountsListCard
              accountShell={accountShell}
              cardDisabled={disabled}
            />
          </TouchableOpacity>
        )
      } )}
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    marginRight: 14,
  },

  cardContainer: {
    marginBottom: 14,
  },
} )

export default memo( AccountCardColumn )
