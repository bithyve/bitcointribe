import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, SectionList, SafeAreaView } from 'react-native'
import NewAccountOptionsSection from './NewAccountOptionsSection'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import { Button } from 'react-native-elements'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import useAccountShellCreationCompletionEffect from '../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import { addNewAccountShell } from '../../../store/actions/accounts'
import { useDispatch } from 'react-redux'
import { resetToHomeAction } from '../../../navigation/actions/NavigationActions'
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind'
import ExternalServiceSubAccountInfo from '../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import useNewAccountChoices from '../../../utils/hooks/account-utils/UseNewAccountChoices'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors';

export enum SectionKind {
  ADD_NEW_HEXA_ACCOUNT,
  ADD_NEW_SERVICE_ACCOUNT,
  IMPORT_WALLET,
}

const sectionListItemKeyExtractor = ( index ) => index

function titleForSectionHeader( kind: SectionKind ) {
  switch ( kind ) {
      case SectionKind.ADD_NEW_HEXA_ACCOUNT:
        return 'Create a Hexa Account'
      case SectionKind.ADD_NEW_SERVICE_ACCOUNT:
        return 'Integrate a Service'
      case SectionKind.IMPORT_WALLET:
        return 'Import a Wallet'
  }
}

function renderSectionHeader( { section } ) {
  const kind: SectionKind = section.kind

  return (
    <Text style={[ HeadingStyles.listSectionHeading, styles.listSectionHeading ]}>
      {titleForSectionHeader( kind )}
    </Text>
  )
}

export interface Props {
  navigation: any;
}

const NewAccountSelectionContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  useAccountShellCreationCompletionEffect( () => {
    console.log( 'dispatching resetToHomeAction' )
    navigation.dispatch( resetToHomeAction() )
  } )

  const dispatch = useDispatch()
  const newAccountChoices = useNewAccountChoices()
  const [ selectedChoice, setSelectedChoice ] = useState<SubAccountDescribing>(
    null,
  )

  const canProceed = useMemo( () => {
    return selectedChoice !== null
  }, [ selectedChoice ] )

  function handleProceedButtonPress() {
    if ( selectedChoice.kind === SubAccountKind.SERVICE ) {
      // TODO: Implement alongside supporting Service integration from "Add New".
      //  - Present options for choosing b/w a standalone
      //    service account or adding it to a Hexa
      //    account (e.g. Checking or Savings account).
      switch (
        ( selectedChoice as ExternalServiceSubAccountInfo ).serviceAccountKind
      ) {
          case ServiceAccountKind.FAST_BITCOINS:
            dispatch( addNewAccountShell( selectedChoice ) )
            break
          default:
            break
      }
    }

    switch ( selectedChoice.kind ) {
        case SubAccountKind.TEST_ACCOUNT:
        case SubAccountKind.REGULAR_ACCOUNT:
        case SubAccountKind.SECURE_ACCOUNT:
          navigation.navigate( 'AddNewHexaAccountDetails', {
            currentSubAccountInfo: selectedChoice,
          } )
          break
        case SubAccountKind.DONATION_ACCOUNT:
          navigation.navigate( 'AddNewDonationAccountDetails', {
            currentSubAccountInfo: selectedChoice,
          } )
          break
        case SubAccountKind.TRUSTED_CONTACTS:
          dispatch( addNewAccountShell( selectedChoice ) )
          break
        case SubAccountKind.FULLY_IMPORTED_WALLET:
        case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
        // TODO: Implement alongside supporting Import integration from "Add New".
          break
        default:
          break
    }
  }

  function handleChoiceSelection( choice: SubAccountDescribing ) {
    setSelectedChoice( choice )
  }

  const ListFooter: React.FC = () => {
    return (
      <View style={styles.listFooterSection}>
        <Button
          raised
          buttonStyle={ButtonStyles.primaryActionButton}
          disabledStyle={ButtonStyles.disabledPrimaryActionButton}
          disabledTitleStyle={ButtonStyles.actionButtonText}
          title="Proceed"
          titleStyle={ButtonStyles.actionButtonText}
          onPress={handleProceedButtonPress}
          disabled={canProceed === false}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <SectionList
        contentContainerStyle={{
          paddingVertical: 25
        }}
        ListFooterComponent={<ListFooter />}
        extraData={[ selectedChoice ]}
        sections={[
          {
            kind: SectionKind.ADD_NEW_HEXA_ACCOUNT,
            data: [ newAccountChoices.hexaAccounts ],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={newAccountChoices.hexaAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              )
            },
          },
          {
            kind: SectionKind.ADD_NEW_SERVICE_ACCOUNT,
            data: [ newAccountChoices.serviceAccounts ],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={newAccountChoices.serviceAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              )
            },
          },
          {
            kind: SectionKind.IMPORT_WALLET,
            data: [ newAccountChoices.importedWalletAccounts ],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <NewAccountOptionsSection
                    choices={newAccountChoices.importedWalletAccounts}
                    selectedChoice={selectedChoice}
                    onOptionSelected={handleChoiceSelection}
                  />
                </View>
              )
            },
          },
        ]}
        keyExtractor={sectionListItemKeyExtractor}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
      ></SectionList>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  listSectionHeading: {
    fontSize: RFValue( 14 ),
    marginBottom: 12,
    paddingHorizontal: 24,
  },

  viewSectionContainer: {
    marginBottom: 22,
    marginHorizontal: 24,
  },

  listFooterSection: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'flex-start',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    elevation: 5
  },
} )

export default NewAccountSelectionContainerScreen
