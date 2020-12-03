import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces';
import Colors from '../../../common/Colors';
import SubAccountOptionCard from '../../../components/accounts/SubAccountOptionCard';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import CardStyles from '../../../common/Styles/Cards.js';
import SubAccountKind from '../../../common/data/enums/SubAccountKind';

export interface Props {
  choices: SubAccountDescribing[];
  selectedChoice?: SubAccountDescribing;
  onOptionSelected: (option: SubAccountDescribing) => void;
}

/**
 * Helper to determine whether or not adding a new sub-account kind
 * from the "Add New" screen is currently supported.
 *
 * (@see: https://github.com/bithyve/hexa/issues/2045)
 */
function isSubAccountCreationSupported(subAccount: SubAccountDescribing): boolean {
  switch (subAccount.kind) {
    case SubAccountKind.TEST_ACCOUNT:
      return true;
    case SubAccountKind.REGULAR_ACCOUNT:
      return true;
    case SubAccountKind.SECURE_ACCOUNT:
      return true;
    case SubAccountKind.TRUSTED_CONTACTS:
      return false;
    case SubAccountKind.DONATION_ACCOUNT:
      return true;
    case SubAccountKind.SERVICE:
      return false;
    case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
      return false;
    case SubAccountKind.FULLY_IMPORTED_WALLET:
      return false;
    default:
      return false;
  }
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
          const isDisabled = isSubAccountCreationSupported(subAccountInfo) == false;

          return (
            <View style={styles.cardShadowContainer}>
              <View style={styles.cardRootContainer}>
                <TouchableOpacity
                  style={styles.cardTouchableContainer}
                  onPress={() => onOptionSelected(subAccountInfo)}
                  disabled={isDisabled}
                >
                  <SubAccountOptionCard
                    subAccountInfo={subAccountInfo}
                    isDisabled={isDisabled}
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
