import React from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import Colors from '../../../common/Colors'
import SubAccountOptionCard from '../../../components/accounts/SubAccountOptionCard'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import CardStyles from '../../../common/Styles/Cards.js'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind'
import ExternalServiceSubAccountInfo from '../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'

export interface Props {
  choices: SubAccountDescribing[];
  selectedChoice?: SubAccountDescribing;
  onOptionSelected: ( option: SubAccountDescribing ) => void;
}

const keyExtractor = ( item: SubAccountDescribing ) => item.id

const NewAccountOptionsSection: React.FC<Props> = ( {
  choices,
  selectedChoice,
  onOptionSelected,
}: Props ) => {

  const { currentWyreSubAccount } = useAccountsState()
  /**
   * Helper to determine whether or not adding a new sub-account kind
   * from the "Add New" screen is currently supported.
   *
   * (@see: https://github.com/bithyve/hexa/issues/2045)
   */
  function isSubAccountCreationSupported( subAccount: SubAccountDescribing ): boolean {
    switch ( subAccount.kind ) {
        case SubAccountKind.TEST_ACCOUNT:
          return true
        case SubAccountKind.REGULAR_ACCOUNT:
          return true
        case SubAccountKind.SECURE_ACCOUNT:
          return true
        case SubAccountKind.TRUSTED_CONTACTS:
          return false
        case SubAccountKind.DONATION_ACCOUNT:
          return true
        case SubAccountKind.SERVICE:
          return isServiceSubAccountCreationSupported( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind )
        case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
          return false
        case SubAccountKind.FULLY_IMPORTED_WALLET:
          return false
        default:
          return false
    }
  }

  function isServiceSubAccountCreationSupported( serviceAccountKind: ServiceAccountKind ): boolean {
    switch ( serviceAccountKind ) {
        case ServiceAccountKind.FAST_BITCOINS:
          return false
        case ServiceAccountKind.SWAN:
          return false
        case ServiceAccountKind.WYRE:
          return currentWyreSubAccount == null
        default:
          return false
    }
  }

  /**
   * Helper to determine whether or not an option card
   * has a special tag such as "NEW" or "COMING SOON"
   *
   * (@see: https://github.com/bithyve/hexa/issues/2313)
   */
  function specialTagForChoice( subAccount: SubAccountDescribing ): string | null {
    switch ( subAccount.kind ) {
        case SubAccountKind.TEST_ACCOUNT:
          return null
        case SubAccountKind.REGULAR_ACCOUNT:
          return null
        case SubAccountKind.SECURE_ACCOUNT:
          return null
        case SubAccountKind.TRUSTED_CONTACTS:
          return 'COMING SOON'
        case SubAccountKind.DONATION_ACCOUNT:
          return 'NEW'
        case SubAccountKind.SERVICE:
          return specialTagForServiceChoice( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind )
        case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
          return 'COMING SOON'
        case SubAccountKind.FULLY_IMPORTED_WALLET:
          return 'COMING SOON'
        default:
          return null
    }
  }

  function specialTagForServiceChoice( serviceAccountKind: ServiceAccountKind ): string {
    switch ( serviceAccountKind ) {
        case ServiceAccountKind.FAST_BITCOINS:
          return 'COMING SOON'
        case ServiceAccountKind.SWAN:
          return 'COMING SOON'
        case ServiceAccountKind.WYRE:
          return 'NEW'
        default:
          return 'COMING SOON'
    }
  }


  return (
    <View style={styles.rootContainer}>
      <FlatList
        horizontal
        contentContainerStyle={styles.listContentContainer}
        keyExtractor={keyExtractor}
        data={choices}
        extraData={[ selectedChoice ]}
        renderItem={( { item: subAccountInfo }: { item: SubAccountDescribing } ) => {
          const isDisabled = isSubAccountCreationSupported( subAccountInfo ) == false

          return (
            <View style={styles.cardShadowContainer}>
              <View style={styles.cardRootContainer}>
                <TouchableOpacity
                  style={styles.cardTouchableContainer}
                  onPress={() => onOptionSelected( subAccountInfo )}
                  disabled={isDisabled}
                >
                  <SubAccountOptionCard
                    subAccountInfo={subAccountInfo}
                    isDisabled={isDisabled}
                    isSelected={subAccountInfo.id == selectedChoice?.id}
                    specialTag={specialTagForChoice( subAccountInfo )}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}


const styles = StyleSheet.create( {
  rootContainer: {
    backgroundColor: Colors.secondaryBackgroundColor,
    borderRadius: 12,
  },

  listContentContainer: {
    height: widthPercentageToDP( 42 ),
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
    width: widthPercentageToDP( 34 ),
    minWidth: 120,
    marginLeft: 4,
  },

  cardTouchableContainer: {
    flex: 1,
    borderRadius: CardStyles.horizontalScrollViewCardContainer.borderRadius,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
} )

export default NewAccountOptionsSection
