import React, { Component, ReactElement } from 'react'
import { Text, View, SectionList, StyleSheet, RefreshControl, FlatList, SafeAreaView, StatusBar } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../utils/ln/RESTUtils'
import axios from 'axios'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter'
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

@inject( 'TransactionsStore',
  'BalancesStore',
  'InvoicesStore'
)
@observer
export class AccountDetails extends Component {

  constructor( props: any ) {
    super( props )
    this.state = {
      node: props.navigation.getParam( 'node' ),
      accountShellID:props.navigation.getParam( 'accountShellID' ),
      transactions: [],
      offChainBalance: '',
      onChainBalance: '',
      address: 'jhj',
      accountShell: props.accountShells.find( accountShell => accountShell.id === props.navigation.getParam( 'accountShellID' ) )
    }
    // console.log(props.navigation.getParam( 'accountShellID' ), "+++---\n", props.accountShells.find( accountShell => accountShell.id === props.navigation.getParam( 'accountShellID' ) ))
  }


  uniqueKey = (item:any, index: number) => index.toString();

  componentDidMount(): void {
    this.props.TransactionsStore.fetchTransactions( this.state.node )
    this.props.BalancesStore.getOffChainBalance( this.state.node )
    this.props.BalancesStore.getOnChainBalance( this.state.node )
    this.props.InvoicesStore.fetchAddress( this.state.node )
  }


  onSendButtonPress = (node:any) => {
    this.props.navigation.navigate('SendCoinScreen', {
      node
    })
  }


  onReceiveButtonPress = (address:string, size:any, title:string, node:any) => {
    this.props.navigation.navigate('ReceiveCoinScreen', {
      address,
      size,
      title,
      node
    })
  }

   sections = ()=>{
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
                 balance={this.props.BalancesStore.onChainBalance}
                 accountShell={this.state.accountShell}
                 mode={Mode.ON_CHAIN}
               />
               <View style={{
                 marginVertical: 10
               }}/>
               <AccountDetailsCard
                 onKnowMorePressed={()=> {}}
                 onSettingsPressed={()=>{}}
                 balance={this.props.BalancesStore.offChainBalance}
                 accountShell={this.state.accountShell}
                 mode={Mode.LIGHTNING}
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

            <TransactionListComponent
              navigation={this.props.navigation}
              transactions={this.props.TransactionsStore.transactions}
            />

            </View>
          )
        }
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


  public fetchTransactions = async ( node:any ) => {
    try {
      await RESTUtils.getTransactions( node ).then( ( data:any ) => {
        // console.log("this.sta")
        this.setState( {
          transactions: data.transactions
        } )
      } )
    } catch {( err: any ) => {console.log( err )}
    }
  };

public fetchBalance = async ( node: any ) => {
  try{
    await RESTUtils.getBlockchainBalance( node ).then( ( data:any ) => {
      this.setState( {
        onChainBalance: data.total_balance
      } )
    } )

    await RESTUtils.getLightningBalance( node ).then( ( data:any ) => {
      this.setState( {
        offChainBalance: data.balance
      } )
    } )
  } catch{( err: any ) => {
    console.log( err )
  }}
}

  public fetchAddress = async ( node: any ) => {
    try {
      await RESTUtils.getNewAddress( node ).then( ( data: any ) => {
        // console.log(data, "+++_")
        this.setState( {
          address: data.address
        } )
      } )
    } catch {( err: any ) => {
      console.log( err )
    }
    }
  }



  render() {
    // console.log(this.props.BalancesStore.offChainBalance, "++")
    console.log(this.props.TransactionsStore.transactions.slice(0, 3), ";")
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

{/* <View style={styles.viewSectionContainer}>
               <View style={styles.footerSection}>
                 <SendAndReceiveButtonsFooter
                   onSendPressed={() => {
                     this.onSendButtonPress(this.state.node)
                   }}
                   onReceivePressed={() => {
                      this.onReceiveButtonPress(
                        this.props.InvoicesStore.invoice,
                        hp('27%'),
                        'lightning',
                        this.state.node
                      )
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

             </View> */}

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
