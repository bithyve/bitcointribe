import React, { useEffect } from 'react'
import { View, StyleSheet, Button } from 'react-native'
import { useDispatch } from 'react-redux'
import ActionMenuListItem from './ActionMenuListItem'
import { FlatList } from 'react-native-gesture-handler'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import useWyreIntegrationState from '../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'

import { clearWyreCache, fetchWyreReservation,  WyreActionKind } from '../../store/actions/WyreIntegration'
import openLink from '../../utils/OpenLink'

export type Props = {
  navigation: any;
};

export type ActionMenuItem = {
  title: string;
  subtitle: string;
  kind: WyreActionKind;
}

const actionMenuItems: ActionMenuItem[] = [
  {
    title: 'Authenticate',
    subtitle: 'Login and Authenticate with Wyre',
    kind: WyreActionKind.AUTHENTICATE,
  },
  // {
  //   title: 'Create Wyre Account Shell in Hexa',
  //   subtitle: 'Create Wyre Account Shell in Hexa Wallet',
  //   kind: WyreActionKind.CREATE_WYRE_ACCOUNT_SHELL,
  // },
  // {
  //   title: 'Link Hexa and Wyre SubAccounts',
  //   subtitle: 'Send xPub to Wyre',
  //   kind: WyreActionKind.LINK_HEXA_AND_WYRE_SUB_ACCOUNTS,
  // },
  {
    title: 'Fetch Reservation Code from Wyre',
    subtitle: 'Buy bitcoin from Wyre',
    kind: WyreActionKind.FETCH_WYRE_RESERVATION,
  },
]

const actionItemKeyExtractor = ( item: ActionMenuItem ) => String( item.kind )


const WyreIntegrationScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()

  const { wyreHostedUrl, hasWyreReservationFetchSucceeded } = useWyreIntegrationState()
  const currencyCode = useCurrencyCode()

  useEffect ( ()=>{
    dispatch( clearWyreCache() )
  }, [] )

  function handleItemSelection( { kind: itemKind }: ActionMenuItem ) {
    switch ( itemKind ) {
        case WyreActionKind.CREATE_WYRE_ACCOUNT_SHELL:
        // TODO: This would be a call to the "add new AccountShell" action
        // need to add redux components for
          // dispatch( createWyreAccountShell( {
          // } ) )
          break
        case WyreActionKind.FETCH_WYRE_RESERVATION:
          console.log( {
            itemKind
          } )
          dispatch( fetchWyreReservation( 
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
        onPress = {()=>{( hasWyreReservationFetchSucceeded &&  wyreHostedUrl )? openLink( wyreHostedUrl ): null}}
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

export default WyreIntegrationScreen
