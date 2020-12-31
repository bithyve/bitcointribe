import React from 'react'
import { Linking, View, Text, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import ActionMenuListItem from './ActionMenuListItem'
import { FlatList } from 'react-native-gesture-handler'
import useSwanIntegrationState from '../../utils/hooks/state-selectors/accounts/UseSwanIntegrationState'
import { fetchSwanToken, linkSwanWallet, syncSwanWallet, SwanActionKind, addSwanMetadata } from '../../store/actions/SwanIntegration'

export type Props = {
  navigation: any;
};

export type ActionMenuItem = {
  title: string;
  subtitle: string;
  kind: SwanActionKind;
}

const actionMenuItems: ActionMenuItem[] = [
  {
    title: 'Authenticate',
    subtitle: 'Login and Authenticate with Swan',
    kind: SwanActionKind.AUTHENTICATE,
  },
  {
    title: 'Create Swan Account Shell in Hexa',
    subtitle: 'Create Swan Account Shell in Hexa Wallet',
    kind: SwanActionKind.CREATE_SWAN_ACCOUNT_SHELL,
  },
  {
    title: 'Link Hexa and Swan SubAccounts',
    subtitle: 'Send xPub to Swan',
    kind: SwanActionKind.LINK_HEXA_AND_SWAN_SUB_ACCOUNTS,
  },
  {
    title: 'Query Swan Account Data',
    subtitle: 'Get latest Swan Account Info',
    kind: SwanActionKind.SYNC_SWAN_ACCOUNT_DATA,
  },
]

const actionItemKeyExtractor = ( item: ActionMenuItem ) => String( item.kind )


const SwanIntegrationDemoScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()

  function handleItemSelection( { kind: itemKind }: ActionMenuItem ) {
    switch ( itemKind ) {
        case SwanActionKind.AUTHENTICATE:
          dispatch( fetchSwanToken( {
          } ) )
          break
        case SwanActionKind.CREATE_SWAN_ACCOUNT_SHELL:
        // TODO: This would be a call to the "add new AccountShell" action
        // being built here: https://github.com/bithyve/hexa/blob/f247ab7ae05e52e23ec4fc773360ef84a063248f/src/store/actions/accounts.ts#L296
          dispatch( addSwanMetadata( {
          } ) )
          break
        case SwanActionKind.LINK_HEXA_AND_SWAN_SUB_ACCOUNTS:
          dispatch( linkSwanWallet( {
          } ) )
          break
        case SwanActionKind.SYNC_SWAN_ACCOUNT_DATA:
          Linking.openURL( 'https://dev-api.swanbitcoin.com?client_id=demo-web-client&state=1599045135410-jFe&scope=openid%20profile%20read&response_type=code&code_challenge=SfO9AIeVOoLBdi8xF5VF5ByzExMx4bxGDRsXUYMVRWc&code_challenge_method=S256&prompt=login&ui_locales=en&nonce=1599046102647-dv4&redirect_uri=https://oauth.tools/callback/code' )
          // dispatch(syncSwanWallet({}));
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

export default SwanIntegrationDemoScreen
