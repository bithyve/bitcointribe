import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import Colors from '../../../common/Colors';
import SubAccountOptionCard from '../../../components/accounts/SubAccountOptionCard';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import CardStyles from '../../../common/Styles/Cards.js';

export interface Props {
  choices: SubAccountDescribing[];
  selectedChoice?: SubAccountDescribing;
  onOptionSelected: (option: SubAccountDescribing) => void;
}

const keyExtractor = (item: SubAccountDescribing) => item.id;

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
        renderItem={({ item: subAccountInfo }: { item: SubAccountDescribing }) => {
          return (
            <View style={styles.cardShadowContainer}>
              <View style={styles.cardRootContainer}>
                <TouchableOpacity
                  style={styles.cardTouchableContainer}
                  onPress={() => onOptionSelected(subAccountInfo)}
                >
                  <SubAccountOptionCard
                    subAccountInfo={subAccountInfo}
                    isSelected={subAccountInfo.id == selectedChoice?.id}
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
