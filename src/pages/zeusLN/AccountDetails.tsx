import React, { Component, ReactElement } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../utils/ln/RESTUtils'
import axios from "axios";
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useAccountShellFromNavigation from '../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import TransactionListComponent from './components/transactions/TransactionListComponent';
import RNFetchBlob from 'rn-fetch-blob'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { sourceAccountSelectedForSending } from '../../store/actions/sending';
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import { connect } from 'react-redux'

interface transaction {
  tx_hash: string;
  amount: string;
  num_confirmations: number;
  block_hash: string;
  block_height: 0;
  time_stamp: string;
  total_fees: string;
  dest_addresses: string[];
  raw_tx_hex: string;
  label: string;
}


export class AccountDetails extends Component {

  constructor( props: any ) {
    super( props )
    this.state = {
      node: props.navigation.getParam( 'node' ),
      transactions: [],
      offChainBalance: '',
      onChainBalance: '',
      address: 'jhj'
    }
  }
  // dispatch = useDispatch()

  // accountShell = useAccountShellFromNavigation(this.props.navigation)

  // primarySubAccount = usePrimarySubAccountForShell(this.accountShell)

  componentDidMount(): void {
    // console.log(this.state.node, "++")
    this.fetchTransactions(this.state.node)
    this.fetchBalance(this.state.node)
    this.fetchAddress(this.state.node)
  }

  onSendBittonPress = () => {
    this.dispatch( sourceAccountSelectedForSending( this.accountShell ) )

    this.props.navigation.navigate( 'Send', {
      subAccountKind: this.primarySubAccount.kind,
    } )
    console.log("pressed")
  }
  // accountShell = useAccountShellFromNavigation(this.props.navigation) // this line gives the hook error
  uniqueKey = (item:any, index: number) => index;
  renderTemplate = ( {item} : {item: transaction}): ReactElement => {
    return (
      <TouchableOpacity
        onPress={() => {
          // this.props.navigation.navigate('TransactionInfo')
          this.props.navigation.navigate('TransactionInfo', {
            transactionData: item
          })
        }}
      >
        <TransactionListComponent
        params = {item}
        />

        <View style={{
          borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
        }} />
      </TouchableOpacity>
    )
  }

  public fetchTransactions = async (node:any) => {
    try {
      await RESTUtils.getTransactions(node).then((data:any) => {
        // console.log("this.sta")
        this.setState({transactions: data.transactions})
      }) 
    } catch {(err: any) => {console.log(err)}
    }
};

public fetchBalance = async (node: any) => {
  try{
    await RESTUtils.getBlockchainBalance(node).then((data:any) => {
      this.setState({onChainBalance: data.total_balance})
    })

    await RESTUtils.getLightningBalance(node).then((data:any) => {
      this.setState({offChainBalance: data.balance})
    })
  } catch{(err: any) => {
    console.log(err)
  }}


}

  public fetchAddress = async (node: any) => {
    try {
      await RESTUtils.getNewAddress(node).then((data: any) => {
        // console.log(data, "+++_")
        this.setState({address: data.address})
      })
    } catch {(err: any) => {
      console.log(err)
    }
  }
  }



  render() {
    return (
      <View style = {styles.container}>
        <View style={{ flex: 2, 
          backgroundColor: "pink", 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          alignItems: 'center' }}>
          <Text>offChain: {this.state.offChainBalance}</Text>
          <Text>onChain: {this.state.onChainBalance}</Text>
        </View>
        <Button onPress={() => {
          this.props.navigation.navigate('ChannelScreen', {
            node: this.state.node
          })
        }}
        title={'channels'} titleStyle = {{
          color: 'black'
        }}/>
        <View style={{ flex: 3 }}>
        <FlatList
         style={{
          margin: 5
        }}
        data={this.state.transactions}
        renderItem={this.renderTemplate}
        keyExtractor={this.uniqueKey}
      />
      <View style = {{
        margin: 5
      }}>
        <SendAndReceiveButtonsFooter
        onSendPressed={() => {
          this.props.navigation.navigate('SendCoinScreen')
          // this.onSendBittonPress()
        }}

        onReceivePressed={() => {
          this.props.navigation.navigate('ReceiveCoinScreen', {
            node: this.state.node,
            address: this.state.address,
            title: 'lightning',
            size: hp( '27%' )
          })
        }}
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
  },AccountDetails
} )

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  }
});

// export default connect( mapStateToProps, mapDispatchToProps )( EnterNodeConfigScreen )

export default connect(mapStateToProps, mapDispatchToProps)(AccountDetails)
