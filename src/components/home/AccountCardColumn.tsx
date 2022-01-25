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
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'

export type Props = {
  index: number;
  cardData: AccountShell[];
  prependsAddButton: boolean;
  onAccountCardSelected: ( accountShell: AccountShell ) => void;
  onAddNewAccountPressed: () => void;
  currentLevel: number;
  onCardLongPressed: ( accountShell: AccountShell ) => void;
};

const AccountCardColumn: React.FC<Props> = ( {
  index,
  cardData,
  prependsAddButton,
  onAccountCardSelected,
  onAddNewAccountPressed,
  onCardLongPressed,
  currentLevel
}: Props ) => {
  return (
    <View style={styles.rootContainer} key={index}>

      {(index%2 != 0 ? cardData.reverse() : cardData).map( ( accountShell ) => {
        const disabled = false
        // if(currentLevel < 2 && accountShell.primarySubAccount.kind === SECURE_ACCOUNT) disabled = true;
        return typeof accountShell === 'string' ?
          (
            <AddNewAccountCard
              containerStyle={styles.cardContainer}
              onPress={onAddNewAccountPressed}
            />
          )
          :
          (
            <TouchableOpacity
              key={accountShell.id}
              disabled={disabled}
              style={styles.cardContainer}
              onPress={() => onAccountCardSelected( accountShell )}
              onLongPress={() => onCardLongPressed( accountShell )}
              delayPressIn={0}
              activeOpacity={0.85}
            >
              <HomeAccountsListCard
                accountShell={accountShell}
                cardDisabled={disabled}
              />
            </TouchableOpacity>
          )
      } )}
      {prependsAddButton && (
        <AddNewAccountCard
          containerStyle={styles.cardContainer}
          onPress={onAddNewAccountPressed}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    marginRight: widthPercentageToDP( 4.5 ),
    paddingTop: heightPercentageToDP( 2 )
  },

  cardContainer: {
    marginBottom: heightPercentageToDP( 2 ),
  },
} )

export default memo( AccountCardColumn )
