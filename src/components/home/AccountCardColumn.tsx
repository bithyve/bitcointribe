import React, { memo } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import AccountShell from '../../common/data/models/AccountShell'
import AddNewAccountCard from '../../pages/Home/AddNewAccountCard'
import HomeAccountsListCard from './HomeAccountsListCard'

export type Props = {
  index: number;
  cardData: AccountShell[];
  prependsAddButton: boolean;
  onAccountCardSelected: ( accountShell: AccountShell ) => void;
  onAddNewAccountPressed: () => void;
  onCardLongPressed: ( accountShell: AccountShell ) => void;
};

const AccountCardColumn: React.FC<Props> = ( {
  index,
  cardData,
  prependsAddButton,
  onAccountCardSelected,
  onAddNewAccountPressed,
  onCardLongPressed
}: Props ) => {
  return (
    <View style={styles.rootContainer} key={index}>

      {( index%2 != 0 ? cardData.reverse() : cardData ).map( ( accountShell ) => {
        const disabled = false
        return typeof accountShell === 'string' ?
          (
            <AddNewAccountCard
              key={accountShell}
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
    marginRight: widthPercentageToDP( 3 ),
    paddingTop: heightPercentageToDP( 2 ),
  },

  cardContainer: {
    marginBottom: heightPercentageToDP( 2 ),
  },
} )

export default memo( AccountCardColumn )
