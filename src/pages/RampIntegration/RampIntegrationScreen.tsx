import React, { useEffect } from 'react'
import { View, StyleSheet, Button } from 'react-native'
import { useDispatch } from 'react-redux'
import ActionMenuListItem from './ActionMenuListItem'
import { FlatList } from 'react-native-gesture-handler'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import useRampIntegrationState from '../../utils/hooks/state-selectors/accounts/UseRampIntegrationState'

import { clearRampCache, fetchRampReservation,  RampActionKind } from '../../store/actions/RampIntegration'
import openLink from '../../utils/OpenLink'

export type Props = {
  navigation: any;
};

export type ActionMenuItem = {
  title: string;
  subtitle: string;
  kind: RampActionKind;
}

const actionMenuItems: ActionMenuItem[] = [
  {
    title: 'Authenticate',
    subtitle: 'Login and Authenticate with Ramp',
    kind: RampActionKind.AUTHENTICATE,
  },
  // {
  //   title: 'Create Ramp Account Shell in Hexa',
  //   subtitle: 'Create Ramp Account Shell in Hexa Wallet',
  //   kind: RampActionKind.CREATE_RAMP_ACCOUNT_SHELL,
  // },
  // {
  //   title: 'Link Hexa and Ramp SubAccounts',
  //   subtitle: 'Send xPub to Ramp',
  //   kind: RampActionKind.LINK_HEXA_AND_RAMP_SUB_ACCOUNTS,
  // },
  {
    title: 'Fetch Reservation Code from Ramp',
    subtitle: 'Buy bitcoin from Ramp',
    kind: RampActionKind.FETCH_RAMP_RESERVATION,
  },
]

const actionItemKeyExtractor = ( item: ActionMenuItem ) => String( item.kind )


const RampIntegrationScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()

  const { rampHostedUrl, hasRampReservationFetchSucceeded } = useRampIntegrationState()
  const currencyCode = useCurrencyCode()

  useEffect ( ()=>{
    dispatch( clearRampCache() )
  }, [] )

  function handleItemSelection( { kind: itemKind }: ActionMenuItem ) {
    switch ( itemKind ) {
        case RampActionKind.CREATE_RAMP_ACCOUNT_SHELL:
        // TODO: This would be a call to the "add new AccountShell" action
        // need to add redux components for
          // dispatch( createRampAccountShell( {
          // } ) )
          break
        case RampActionKind.FETCH_RAMP_RESERVATION:
          console.log( {
            itemKind
          } )
          dispatch( fetchRampReservation( 
            100,
            currencyCode
          ) )
          break
    }
  }

  const renderItem = ( { item: actionMenuItem }: { item: ActionMenuItem } ) => {
    return (
      <ActionMenuListItem
        containerStyle={{
          marginBottom: 20
        }}
        actionItem={actionMenuItem}
        onItemSelected={() => handleItemSelection( actionMenuItem ) }
      />
    )
  }

  return (
    <View>
      <FlatList
        style={styles.rootContainer}
        keyExtractor={actionItemKeyExtractor}
        renderItem={renderItem}
        data={actionMenuItems}
      />
      <Button
        onPress = {()=>{( hasRampReservationFetchSucceeded &&  rampHostedUrl )? openLink( rampHostedUrl ): null}}
        title = "Buy Now!"
        color = "blue"
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,

    // Until we fully refactor our navigation, the navbar is "null" by default,
    // so this just bumps the content down into view.
    paddingTop: 60,
  },
} )

export default RampIntegrationScreen
