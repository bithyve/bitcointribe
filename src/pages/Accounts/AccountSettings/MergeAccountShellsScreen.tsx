
import React, { useMemo, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useAccountShellFromRoute from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import AccountShellMergeDestinationsList from '../../../components/account-settings/merge-account-shells/AccountShellMergeDestinationsList'
import useCompatibleAccountShells from '../../../utils/hooks/state-selectors/accounts/UseCompatibleAccountShells'
import AccountShell from '../../../common/data/models/AccountShell'
import { mergeAccountShells } from '../../../store/actions/accounts'
import AccountShellMergeSelectionListHeader from '../../../components/account-settings/merge-account-shells/AccountShellMergeSelectionListHeader'
import ButtonBlue from '../../../components/ButtonBlue'


export type Props = {
  route: any;
  navigation: any;
};


const AccountSettingsMergeAccountShellsScreen: React.FC<Props> = ( { route, navigation }: Props ) => {
  const dispatch = useDispatch()

  const accountShell = useAccountShellFromRoute( route )
  const compatibleDestinations = useCompatibleAccountShells( accountShell )

  const [ selectedDestinationID, setSelectedDestinationID ] = useState<string>( null )

  const canProceed = useMemo( () => {
    return selectedDestinationID != null
  }, [ selectedDestinationID ] )

  const selectedDestination = useMemo( () => {
    return compatibleDestinations.find( shell => shell.id === selectedDestinationID )
  }, [ selectedDestinationID ] )


  function handleDestinationSelection( accountShell: AccountShell ) {
    setSelectedDestinationID( accountShell.id )
  }

  function handleProceedButtonPress() {
    dispatch( mergeAccountShells( {
      source: accountShell,
      destination: selectedDestination,
    } ) )

    navigation.dispatch( resetStackToAccountDetails( {
      accountShellID: accountShell.id,
    } ) )
  }

  return (
    <View style={styles.rootContainer}>
      <AccountShellMergeSelectionListHeader sourceShell={accountShell} />

      <View>
        <AccountShellMergeDestinationsList
          compatibleDestinations={compatibleDestinations}
          selectedDestinationID={selectedDestinationID}
          onDestinationSelected={handleDestinationSelection}
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

export default AccountSettingsMergeAccountShellsScreen
