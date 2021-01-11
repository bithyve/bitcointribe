import React, { useEffect } from 'react'
import { Linking, View, Text, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import ActionMenuListItem from './ActionMenuListItem'
import { FlatList } from 'react-native-gesture-handler'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import useWyreIntegrationState from '../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'
// import wyreReservationSucceeded from '../../utils/hooks/state-selectors/accounts/UseWyreIntegrationState'

import { fetchWyreReservation,  WyreActionKind } from '../../store/actions/WyreIntegration'

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
    title: 'Buy with Wyre',
    subtitle: 'Buy Bitcoin from Wyre',
    kind: WyreActionKind.FETCH_WYRE_RESERVATION,
  },
]

const actionItemKeyExtractor = ( item: ActionMenuItem ) => String( item.kind )


const WyreIntegrationScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()

  const { wyreHostedUrl, wyreReservationSucceeded } = useWyreIntegrationState()
  const currencyCode = useCurrencyCode()

  useEffect( ()=> {
    console.log( ' inside useEffect ', { 
      wyreReservationSucceeded, wyreHostedUrl 
    } )
    if( wyreReservationSucceeded && wyreHostedUrl )
      Linking.openURL( wyreHostedUrl )
  }, [ wyreReservationSucceeded, wyreHostedUrl ] )

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
          //Linking.openURL( 'https://dev-api.wyrebitcoin.com?client_id=demo-web-client&state=1599045135410-jFe&scope=openid%20profile%20read&response_type=code&code_challenge=SfO9AIeVOoLBdi8xF5VF5ByzExMx4bxGDRsXUYMVRWc&code_challenge_method=S256&prompt=login&ui_locales=en&nonce=1599046102647-dv4&redirect_uri=https://oauth.tools/callback/code' )
          dispatch( fetchWyreReservation( {
            amount: 100,
            currencyCode: currencyCode
          } ) )
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
    <FlatList
      style={styles.rootContainer}
      keyExtractor={actionItemKeyExtractor}
      renderItem={renderItem}
      data={actionMenuItems}
    />
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
