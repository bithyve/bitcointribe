import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AccountPayload from '../../../common/data/models/AccountPayload/AccountPayload';
import Colors from '../../../common/Colors';
import AccountOptionCard from './AccountOptionCard';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import CardStyles from '../../../common/Styles/Cards.js';

export interface Props {
  choices: AccountPayload[];
  selectedChoice?: AccountPayload;
  onOptionSelected: (AccountPayload) => void;
}

const keyExtractor = (item: AccountPayload) => item.uuid;


const NewAccountOptionsSection: React.FC<Props> = ({
  choices,
  selectedChoice,
  onOptionSelected,
}: Props) => {
  return (
    <View style={styles.rootContainer}>
      <FlatList
        horizontal
        contentContainerStyle={styles.listContentContainer}
        keyExtractor={keyExtractor}
        data={choices}
        extraData={[selectedChoice]}
        renderItem={({ item: accountChoicePayload }) => {
          return (
            <View style={styles.cardShadowContainer}>
              <View style={styles.cardRootContainer}>
                <TouchableOpacity
                  style={styles.cardTouchableContainer}
                  onPress={() => onOptionSelected(accountChoicePayload)}
                >
                  <AccountOptionCard
                    style={{ flex: 1 }}
                    accountPayload={accountChoicePayload}
                    isSelected={accountChoicePayload == selectedChoice}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: Colors.secondaryBackgroundColor,
  },

  listContentContainer: {
    height: widthPercentageToDP(43),
    paddingVertical: 4,
    justifyContent: 'center',
  },

  cardShadowContainer: {
    flex: 1,
    padding: 10,
  },

  cardRootContainer: {
    ...CardStyles.horizontalScrollViewCardContainer,
    flex: 1,
    width: widthPercentageToDP(34),
    minWidth: 120,
    marginLeft: 6,
  },

  cardTouchableContainer: {
    flex: 1,
    borderRadius: CardStyles.horizontalScrollViewCardContainer.borderRadius,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});

export default NewAccountOptionsSection;
