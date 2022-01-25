import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { inject, observer } from 'mobx-react'
import BalanceStore from './../../mobxstore/BalanceStore'
import SettingsStore from './../../mobxstore/SettingsStore'
import NodeInfoStore from './../../mobxstore/NodeInfoStore'

@inject(
  'BalanceStore',
  'SettingsStore',
  'NodeInfoStore',
)
@observer
export class AccountDetails extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      node: props.navigation.getParam( 'node' )
    }
  }

  async UNSAFE_componentWillMount() {
    this.getSettingsAndRefresh()
  }

  async getSettingsAndRefresh() {
    const {
      SettingsStore,
      BalanceStore,
    } = this.props

    //NodeInfoStore.reset()
    //BalanceStore.reset()

    // This awaits on settings, so should await on Tor being bootstrapped before making requests
    await SettingsStore.getSettings().then( () => {
      this.refresh()
    } )
  }


  refresh = () => {
    try {
      const {
        NodeInfoStore,
        BalanceStore,
        ChannelsStore,
        FeeStore,
        SettingsStore,
        FiatStore
      } = this.props
      const {
        settings,
        implementation,
        username,
        password,
        login
      } = SettingsStore
      if ( implementation === 'lndhub' ) {
        login( {
          login: username, password
        } ).then( () => {
          BalanceStore.getLightningBalance()
        } )
      } else {
        NodeInfoStore.getNodeInfo()
        BalanceStore.getBlockchainBalance()
        BalanceStore.getLightningBalance()
      }

      // if ( implementation === 'lnd' ) {
      //   FeeStore.getForwardingHistory()
      // }

      // if ( !!fiat && fiat !== 'Disabled' ) {
      //   FiatStore.getFiatRates()
      // }
    } catch ( error ) {
      console.log( error )
    }
  };


  render() {
    const {
      totalBlockchainBalance,
      unconfirmedBlockchainBalance,
      lightningBalance,
      pendingOpenBalance,
      loading
    } = this.props.BalanceStore
    return (
      <View>
        {
          loading? <Text>Loading....</Text>:
            <View>
              <Text>{lightningBalance}</Text>
              <Text>{totalBlockchainBalance}</Text>
              <Text>{pendingOpenBalance}</Text>

            </View>
        }
      </View>
    )
  }
}

export default AccountDetails
