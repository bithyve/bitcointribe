import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, SectionList, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native'
import NewAccountOptionsSection from './NewAccountOptionsSection'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import ServiceAccountKind from '../../../common/data/enums/ServiceAccountKind'
import ExternalServiceSubAccountInfo from '../../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import useNewAccountChoices from '../../../utils/hooks/account-utils/UseNewAccountChoices'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import NavStyles from '../../../common/Styles/NavStyles'
import ButtonBlue from '../../../components/ButtonBlue'

export enum SectionKind {
  ADD_NEW_HEXA_ACCOUNT,
  ADD_NEW_SERVICE_ACCOUNT,
  IMPORT_WALLET,
}

const sectionListItemKeyExtractor = ( index ) => index

function titleForSectionHeader( kind: SectionKind ) {
  switch ( kind ) {
      case SectionKind.ADD_NEW_HEXA_ACCOUNT:
        return 'Add a Hexa Account'
      case SectionKind.ADD_NEW_SERVICE_ACCOUNT:
        return 'Create a Shared Account'
      case SectionKind.IMPORT_WALLET:
        return 'Import a Wallet'
  }
}
function titleForSectionSubHeader( kind: SectionKind ) {
  switch ( kind ) {
      case SectionKind.ADD_NEW_HEXA_ACCOUNT:
        return 'Your keys, your coins, manage them your way'
      case SectionKind.ADD_NEW_SERVICE_ACCOUNT:
        return 'Bitcoin is for everyone, share an account with your Friends & Family'
      case SectionKind.IMPORT_WALLET:
        return 'Have your sats somewhere else? Import it in Hexa'
  }
}

function renderSectionHeader( { section } ) {
  const kind: SectionKind = section.kind

  return (
    <>
      <Text style={[ HeadingStyles.listSectionHeading, styles.listSectionHeading ]}>
        {titleForSectionHeader( kind )}
      </Text>
      <Text style={[ styles.listSectionHeading, {
        color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 12 ),
        marginBottom: hp( 1 ),

      } ]}>
        {titleForSectionSubHeader( kind )}
      </Text>
    </>
  )
}

export interface Props {
  navigation: any;
}

const NewAccountSelectionContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const newAccountChoices = useNewAccountChoices()
  const [ selectedChoice, setSelectedChoice ] = useState<SubAccountDescribing>(
    null,
  )

  const canProceed = useMemo( () => {
    return selectedChoice !== null
  }, [ selectedChoice ] )

  function handleProceedButtonPress() {
    switch ( selectedChoice.kind ) {
        case SubAccountKind.REGULAR_ACCOUNT:
        case SubAccountKind.SECURE_ACCOUNT:
          navigation.navigate( 'NewHexaAccountDetails', {
            currentSubAccount: selectedChoice,
          } )
          break

        case SubAccountKind.DONATION_ACCOUNT:
          navigation.navigate( 'AddNewDonationAccountDetails', {
            currentSubAccount: selectedChoice,
          } )
          break

        case SubAccountKind.SERVICE:
          switch( ( selectedChoice as ExternalServiceSubAccountInfo ).serviceAccountKind ){
              case ServiceAccountKind.SWAN:
                navigation.navigate( 'NewSwanAccountDetails', {
                  currentSubAccount: selectedChoice,
                } )
                break
          }
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
        <ButtonBlue
          buttonText="Proceed"
          handleButtonPress={handleProceedButtonPress}
          buttonDisable={canProceed === false}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={NavStyles.modalContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.pop()
          }}
          hitSlop={{
            top: 20, left: 20, bottom: 20, right: 20
          }}
          style={{
            height: 30, width: 30, justifyContent: 'center',
            marginLeft: wp( '5%' )
          }}
        >
          <FontAwesome
            name="long-arrow-left"
            color={Colors.blue}
            size={17}
          />
        </TouchableOpacity>
        <View style={{
          // flex: 1
        }}>
          <Text
            style={{
              ...NavStyles.modalHeaderTitleText,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue( 25 ),
              marginLeft: wp( '5%' ),
              marginTop: hp( '2%' )
            }}
          >
                Add Accounts
          </Text>
          {/* <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 12 ),
              fontFamily: Fonts.FiraSansRegular,
              paddingTop: 5,
            }}
          >
                Add an account, add a service, or import a wallet
          </Text> */}
        </View>
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
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  listSectionHeading: {
    fontSize: RFValue( 14 ),
    paddingHorizontal: wp( 6 ),
  },

  viewSectionContainer: {
    marginBottom: hp( 2 ),
    marginHorizontal: wp( 5 ),
  },

  listFooterSection: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
} )

export default NewAccountSelectionContainerScreen
