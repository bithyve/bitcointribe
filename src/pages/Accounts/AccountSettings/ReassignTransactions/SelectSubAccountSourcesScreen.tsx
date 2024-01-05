import React, { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import XPubSourceKind from '../../../../common/data/enums/XPubSourceKind'
import CheckingSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/CheckingSubAccountInfo'
import SavingsSubAccountInfo from '../../../../common/data/models/SubAccountInfo/HexaSubAccounts/SavingsSubAccountInfo'
import SubAccountDescribing from '../../../../common/data/models/SubAccountInfo/Interfaces'
import CurrentTotalHeader from '../../../../components/account-settings/source-reassignment/CurrentTotalHeader'
import SubAccountSourcesList from '../../../../components/account-settings/source-reassignment/SubAccountSourcesList'
import ButtonBlue from '../../../../components/ButtonBlue'
import useAccountShellFromRoute from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'

// TODO: Remove these after testing UI.
const sampleSources: SubAccountDescribing[] = [
  new CheckingSubAccountInfo( {
    balance: 23583,
  } ),
  new SavingsSubAccountInfo( {
    balance: 99121,
  } ),
  new CheckingSubAccountInfo( {
    balance: 11,
  } ),
  new SavingsSubAccountInfo( {
    balance: 82308,
  } ),
]


export type Props = {
  navigation: any;
};

const SelectSubAccountSourcesScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const accountShell = useAccountShellFromRoute( navigation )
  const [ selectedSourceIDs, setSelectedSourceIDs ] = useState<Set<string>>( new Set() )
  // const selectableSources = useReassignableSourcesForAccountShell(accountShell);
  const selectableSources = sampleSources

  const canProceed = useMemo( () => {
    return selectedSourceIDs.size > 0
  }, [ selectedSourceIDs ] )

  const selectedSources = useMemo( () => {
    return selectableSources.filter( source => selectedSourceIDs.has( source.id ) )
  }, [ selectedSourceIDs ] )

  const selectedTransactionIDs = useMemo( () => {
    selectedSources.flatMap( subAccountInfo => subAccountInfo.transactionIDs )
  }, [ selectedSources ] )

  function handleSourceSelection( source: SubAccountDescribing ) {
    if ( selectedSourceIDs.has( source.id ) ) {
      selectedSourceIDs.delete( source.id )
    } else {
      selectedSourceIDs.add( source.id )
    }

    setSelectedSourceIDs( new Set( selectedSourceIDs ) )
  }

  function handleProceedButtonPress() {
    navigation.navigate( 'ReassignTransactionsSelectDestination', {
      accountShellID: accountShell.id,
      reassignmentKind: XPubSourceKind.DESIGNATED,
      selectedTransactionIDs,
    } )
  }

  return (
    <View style={styles.rootContainer}>
      <CurrentTotalHeader accountShell={accountShell} selectedSources={selectedSources} />

      <View>
        <SubAccountSourcesList
          selectableSources={selectableSources}
          selectedSourceIDs={selectedSourceIDs}
          onSourceSelected={handleSourceSelection}
        />
      </View>

      <View style={styles.proceedButtonContainer}>
        <ButtonBlue
          buttonText="Confirm & Proceed"
          handleButtonPress={handleProceedButtonPress}
          buttonDisable={canProceed === false}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
  },
} )

export default SelectSubAccountSourcesScreen
