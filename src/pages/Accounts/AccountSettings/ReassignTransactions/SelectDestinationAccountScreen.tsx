import React, { useLayoutEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import ListStyles from '../../../../common/Styles/ListStyles'
import DestinationAccountShellsList from '../../../../components/account-settings/transaction-reassignment/DestinationAccountShellsList'
import useAccountShellFromRoute from '../../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import AccountShell from '../../../../common/data/models/AccountShell'
import { reassignTransactions } from '../../../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../../../navigation/actions/NavigationActions'
import useCompatibleAccountShells from '../../../../utils/hooks/state-selectors/accounts/UseCompatibleAccountShells'
import ButtonBlue from '../../../../components/ButtonBlue'
import XPubSourceKind from '../../../../common/data/enums/XPubSourceKind'

export type Props = {
  route: any;
  navigation: any;
};

const HeaderSection: React.FC = () => {
  return (
    <View style={ListStyles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>Choose a destination.</Text>
    </View>
  )
}

const ReassignTransactionsSelectDestinationAccountScreen: React.FC<Props> = ( { route, navigation }: Props ) => {
  const dispatch = useDispatch()

  useLayoutEffect( () => {
    const reassignmentKind = route.params?.reassignmentKind
    const nameText = reassignmentKind === XPubSourceKind.DESIGNATED ? 'Sources' : 'Transactions'
    navigation.setOptions( {
      title: `Reassign ${nameText}`
    } )
  }, [ navigation, route ] )
  const currentAccountShell = useAccountShellFromRoute( route )
  const selectableAccountShells = useCompatibleAccountShells( currentAccountShell )
  const [ selectedAccountShellID, setSelectedAccountShellID ] = useState<string>( null )

  const selectedTransactionIDs = useMemo( () => {
    return route.params?.selectedTransactionIDs || []
  }, [ route.params ] )

  const canProceed = useMemo( () => {
    return selectedAccountShellID != null
  }, [ selectedAccountShellID ] )

  function handleAccountSelection( accountShell: AccountShell ) {
    setSelectedAccountShellID( accountShell.id )
  }

  function handleProceedButtonPress() {
    dispatch( reassignTransactions( {
      transactionIDs: selectedTransactionIDs,
      sourceID: currentAccountShell.id,
      destinationID: selectedAccountShellID,
    } ) )

    navigation.dispatch( resetStackToAccountDetails( {
      accountShellID: currentAccountShell.id
    } ) )
  }

  return (
    <View style={styles.rootContainer}>
      <HeaderSection />

      <View>
        <DestinationAccountShellsList
          selectableAccountShells={selectableAccountShells}
          selectedAccountShellID={selectedAccountShellID}
          onAccountSelected={handleAccountSelection}
        />
      </View>

      <View style={styles.proceedButtonContainer}>
        <ButtonBlue
          buttonText="Proceed"
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
    alignSelf: 'center',
  },
} )

export default ReassignTransactionsSelectDestinationAccountScreen
