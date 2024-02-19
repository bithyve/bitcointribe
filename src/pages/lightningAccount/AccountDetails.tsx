import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { RefreshControl, SectionList, StatusBar, StyleSheet, View, } from 'react-native'
import {
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import Colors from '../../common/Colors'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
// import { NavigationStackOptions } from 'react-navigation-stack'
import NavHeader from '../../components/account-details/AccountDetailsNavHeader'
import AccountCard from './components/AccountCard'
import InvoicesList from './components/InvoicesList'
import TransactionList from './components/TransactionsList'

enum SectionKind {
  ACCOUNT_CARD,
  TRANSACTIONS_LIST_PREVIEW,
  SEND_AND_RECEIVE_FOOTER,
}

export enum Mode {
  ON_CHAIN,
  LIGHTNING,
}

interface AccountDetailsPropsTypes {
  navigation: any;
  route: any;
}

@inject(
  'InvoicesStore',
  'BalanceStore',
  'TransactionsStore',
  'SettingsStore',
  'NodeInfoStore',
  'FeeStore',
)
@observer
export class AccountDetails extends Component<
  AccountDetailsPropsTypes
> {

  constructor( props ) {
    super( props )
    this.state = {
      node:  props.route.params.node,
      accountShellID: props.route.params.accountShellID,
      accountShell: props.accountShells.find( accountShell => accountShell.id === props.route.params.accountShellID ),
      mode: Mode.LIGHTNING,
    }
  }

  componentDidMount() {
    this.props.navigation.setOptions( {
      header: () => (
        <NavHeader accountShellID={this.state.accountShellID} onBackPressed={this.onBackPressed} />
      ),
    } )
  }

   onBackPressed =()=>  {
     this.props.navigation.goBack()
   }


  onReceiveButtonPress = ( size:any, title:string, node:any ) => {
    this.props.navigation.navigate( 'ReceiveCoin', {
      size,
      title,
      node
    } )
  }

  async UNSAFE_componentWillMount() {
    this.getSettingsAndRefresh()
  }

  async getSettingsAndRefresh() {
    try {
      const {
        SettingsStore,
        BalanceStore,
        InvoicesStore,
        NodeInfoStore,
        TransactionsStore
      } = this.props

      NodeInfoStore.reset()
      BalanceStore.reset()
      InvoicesStore.reset()
      TransactionsStore.reset()
      // This awaits on settings, so should await on Tor being bootstrapped before making requests
      await SettingsStore.getSettings().then( () => {
        this.refresh()
      } )
    } catch ( error ) {
      console.log( error )
    }
  }


  refresh = () => {
    try {
      const {
        NodeInfoStore,
        BalanceStore,
        InvoicesStore,
        FeeStore,
        SettingsStore,
        TransactionsStore
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
          InvoicesStore.getInvoices()
        } )
      } else {
        NodeInfoStore.getNodeInfo()
        BalanceStore.getBlockchainBalance()
        BalanceStore.getLightningBalance()
        InvoicesStore.getInvoices()
        TransactionsStore.getTransactions()
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
    const { accountShell } = this.state
    const {
      totalBlockchainBalance,
      unconfirmedBlockchainBalance,
      lightningBalance,
      pendingOpenBalance,
      loading
    } = this.props.BalanceStore
    const { invoices, invoicesCount, loading: loadingInvoices  } = this.props.InvoicesStore
    const { transactions, loading: loadingTransactions } = this.props.TransactionsStore

    return [
      {
        kind: SectionKind.ACCOUNT_CARD,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewAccountDetailsCard}>
              <AccountCard
                mode={this.state.mode}
                lightningBalance={lightningBalance}
                totalBlockchainBalance={totalBlockchainBalance}
                unconfirmedBlockchainBalance={unconfirmedBlockchainBalance}
                pendingOpenBalance={pendingOpenBalance}
                setMode={( mode: Mode )=> this.setState( {
                  mode
                } )}
                accountShell={accountShell}
                onClickSettings={() => {
                  if( this.state.mode === Mode.LIGHTNING ){
                    this.props.navigation.navigate( 'SettingsScreen' )
                  } else {
                    this.props.navigation.navigate( 'AccountSettings', {
                      accountShellID: this.state.accountShellID
                    } )
                  }

                }}
              />
            </View>
          )
        },
      },
      {
        kind: SectionKind.TRANSACTIONS_LIST_PREVIEW,
        data: [ null ],
        renderItem: () => {
          return (
            <View>
              <View style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
              }}>
                {
                  this.state.mode === Mode.LIGHTNING ?
                    <InvoicesList
                      availableBalance={lightningBalance}
                      bitcoinUnit={BitcoinUnit.SATS}
                      onViewMorePressed={()=> this.props.navigation.navigate( 'ViewAll', {
                        mode: this.state.mode,
                        accountShellID: this.state.accountShellID
                      } )}
                      invoices={invoices.slice( 0, 3 )}
                      accountShellId={this.state.accountShellID}
                      loading={loadingInvoices}
                      navigation={this.props.navigation}
                    />:
                    <TransactionList
                      availableBalance={totalBlockchainBalance}
                      bitcoinUnit={BitcoinUnit.SATS}
                      onViewMorePressed={()=> this.props.navigation.navigate( 'ViewAll', {
                        mode: this.state.mode,
                        accountShellID: this.state.accountShellID
                      } )}
                      transactions={transactions.slice( 0, 3 )}
                      accountShellId={this.state.accountShellID}
                      loading={loadingTransactions}
                      navigation={this.props.navigation}
                    />
                }

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
              onRefresh={()=> this.getSettingsAndRefresh()}
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
        <View style={styles.viewSectionContainer}>
          <View style={styles.footerSection}>
            <SendAndReceiveButtonsFooter
              onSendPressed={() => {
                this.props.navigation.navigate( 'SendScreen' )
              } }
              onReceivePressed={() => {
                this.onReceiveButtonPress(
                  hp( '27%' ),
                  'lightning',
                  this.state.node
                )
              } }
              isTestAccount={false}
              averageTxFees={''}              // network={
              //   config.APP_STAGE === 'dev' ||
              //     primarySubAccount.sourceKind === SourceAccountKind.TEST_ACCOUNT
              //     ? NetworkKind.TESTNET
              //     : NetworkKind.MAINNET
              // }
            />


          </View>

        </View>
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
    flex:1,
    paddingHorizontal: 0,
    backgroundColor: Colors.backgroundColor,
  },

  viewSectionContainer: {

  },

  viewAccountDetailsCard: {
    paddingHorizontal: 20,
  },

  footerSection: {
    marginBottom:hp( 2 ),
  },
} )

// export default connect( mapStateToProps, mapDispatchToProps )( EnterNodeConfigScreen )

export default connect( mapStateToProps, mapDispatchToProps )( AccountDetails )

