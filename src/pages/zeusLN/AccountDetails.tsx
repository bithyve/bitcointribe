import React, { Component, ReactElement } from 'react'
import { Text, View, SectionList, StyleSheet, RefreshControl, FlatList, SafeAreaView, StatusBar } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../utils/ln/RESTUtils'
import axios from 'axios'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useAccountShellFromNavigation from '../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import TransactionListComponent from './components/transactions/TransactionListComponent'
import RNFetchBlob from 'rn-fetch-blob'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
import Transaction from '../../models/Transaction'
import { useDispatch, useSelector } from 'react-redux'
import { sourceAccountSelectedForSending } from '../../store/actions/sending'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { connect } from 'react-redux'
import { inject, observer } from 'mobx-react'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import NavHeader from '../../components/account-details/AccountDetailsNavHeader'
import AccountDetailsCard from './components/AccountDetailsCard'

enum SectionKind {
  ACCOUNT_CARD,
  TRANSACTIONS_LIST_PREVIEW,
  SEND_AND_RECEIVE_FOOTER,
}

export enum Mode {
  ON_CHAIN,
  LIGHTNING,
}
import BalanceStore from './../../mobxstore/BalanceStore'
import SettingsStore from './../../mobxstore/SettingsStore'
import NodeInfoStore from './../../mobxstore/NodeInfoStore'

@inject(
  'BalanceStore',
  'SettingsStore',
  'NodeInfoStore',
  'FeeStore'
)
@observer
export class AccountDetails extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      node: props.navigation.getParam( 'node' ),
      accountShellID:props.navigation.getParam( 'accountShellID' ),
      accountShell: props.accountShells.find( accountShell => accountShell.id === props.navigation.getParam( 'accountShellID' ) ),
      mode: Mode.LIGHTNING,
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

      if ( implementation === 'lnd' ) {
        FeeStore.getForwardingHistory()
      }

      // if ( !!fiat && fiat !== 'Disabled' ) {
      //   FiatStore.getFiatRates()
      // }
    } catch ( error ) {
      console.log( error )
    }
  };

  sections = ()=>{
    const {
      totalBlockchainBalance,
      unconfirmedBlockchainBalance,
      lightningBalance,
      pendingOpenBalance,
      loading
    } = this.props.BalanceStore
    return [
      {
        kind: SectionKind.ACCOUNT_CARD,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewAccountDetailsCard}>
              <AccountDetailsCard
                onKnowMorePressed={()=> {}}
                onSettingsPressed={()=>{}}
                balance={totalBlockchainBalance}
                accountShell={this.state.accountShell}
                mode={Mode.ON_CHAIN}
              />
              <View style={{
                marginVertical: 10
              }}/>
              <AccountDetailsCard
                onKnowMorePressed={()=> {}}
                onSettingsPressed={()=>{}}
                balance={lightningBalance}
                accountShell={this.state.accountShell}
                mode={Mode.LIGHTNING}
              />
            </View>
          )
        },
      },
      {
        kind: SectionKind.SEND_AND_RECEIVE_FOOTER,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewSectionContainer}>
              <View style={styles.footerSection}>
                <SendAndReceiveButtonsFooter
                  onSendPressed={() => {
                    this.onSendButtonPress()
                  }}
                  onReceivePressed={() => {

                  }}
                  averageTxFees={''}
                  // network={
                  //   config.APP_STAGE === 'dev' ||
                  //     primarySubAccount.sourceKind === SourceAccountKind.TEST_ACCOUNT
                  //     ? NetworkKind.TESTNET
                  //     : NetworkKind.MAINNET
                  // }
                />


              </View>

            </View>
          )
        },
      },
    ]
  }


  render() {
    return (
      <View style = {{
        backgroundColor: Colors.backgroundColor, flex: 1
      }}>
        <SectionList
          contentContainerStyle={styles.scrollViewContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          refreshControl={
            <RefreshControl
              onRefresh={()=> {}}
              refreshing={false}
              style={{
                backgroundColor: Colors.backgroundColor,
              }}
            />
          }
          sections={this.sections()}
          stickySectionHeadersEnabled={false}
          keyExtractor={( index )=> String( index )}
        />
      </View>
    )
  }
}

const mapDispatchToProps = ( dispatch ) => ( {
  addNewAccountShells: data => {
    dispatch( addNewAccountShells( data ) )
  }, AccountDetails
} )

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
    accountShells:state.accounts.accountShells
  }
}




const styles = StyleSheet.create( {
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },

  rootContainer: {
    height: '100%',
  },

  scrollViewContainer: {
    paddingTop: 20,
    // height: '100%',
    paddingHorizontal: 0,
    backgroundColor: Colors.backgroundColor,
  },

  viewSectionContainer: {
    marginBottom: 10,
  },

  viewAccountDetailsCard: {
    paddingHorizontal: 20,
  },

  footerSection: {
    paddingVertical: 15,
  },
} )

AccountDetails.navigationOptions = ( { navigation, } ): NavigationScreenConfig<NavigationStackOptions, any> => {
  return {
    header() {
      const { accountShellID } = navigation.state.params
      return (
        <NavHeader
          accountShellID={accountShellID}
          onBackPressed={() => navigation.pop()}
        />
      )
    },
  }
}

// export default connect( mapStateToProps, mapDispatchToProps )( EnterNodeConfigScreen )

export default connect( mapStateToProps, mapDispatchToProps )( AccountDetails )

