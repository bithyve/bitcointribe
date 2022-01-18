import React, { Component } from 'react'
import { Text, View, FlatList, TouchableOpacity, Button } from 'react-native'
import RESTUtils from '../../../utils/ln/RESTUtils'
import ChannelList from '../components/channels/ChannelListComponent'
import { widthPercentageToDP } from 'react-native-responsive-screen'

interface HTLC {
    hash_lock: string;
    expiration_height: number;
    incoming: boolean;
    amount: string;
}

interface ChannelFrame {
    commit_weight: string;
    local_balance: string;
    commit_fee: string;
    csv_delay: number;
    channel_point: string;
    chan_id: string;
    fee_per_kw: string;
    total_satoshis_received: string;
    pending_htlcs: Array<HTLC>;
    num_updates: string;
    active: boolean;
    remote_balance: string;
    unsettled_balance: string;
    total_satoshis_sent: string;
    remote_pubkey: string;
    capacity: string;
    private: boolean;
    state: string;
    msatoshi_total: string;
    msatoshi_to_us: string;
    channel_id?: string;
    alias?: string;
}

export default class ChannelScreen extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.navigation.getParam('node'), "+++++++++")
        this.state = {
            node: this.props.navigation.getParam('node'),
            channels: []
        }
    }

    componentDidMount(): void {
        this.channelList()
        console.log(this.state.node, "---")
    }

    uniqueKey = (item:any, index: number) => index;
    renderTemplate = ( {item} : {item: ChannelFrame}): ReactElement => {
      return (
        <TouchableOpacity
          onPress={() => {
            // this.props.navigation.navigate('TransactionInfo')
            // this.props.navigation.navigate('TransactionInfo', {
            //   transactionData: item
            // })

            this.props.navigation.navigate('ChannelInfoScreen', {
                channelInfo: item,
                node: this.state.node
            })
          }}
        >
            <ChannelList 
            params = {item} 
            />
  
          <View style={{
            borderBottomWidth: 1, borderColor: 'grey', marginHorizontal: widthPercentageToDP( 4 )
          }} />
        </TouchableOpacity>
      )
    }

    channelList = async () => {
        try {
            await RESTUtils.getChannels(this.state.node).then((resp: any) => {
              console.log(resp.channels[0])
              this.setState({channels: resp.channels})
            })
          } catch { (err) => {
            console.log(err)
            }
          }
    }

    render() {
        return (
            <View>
                <Button
                    onPress={()=> {
                        this.props.navigation.navigate('OpenChannelScreen', {
                          node: this.state.node
                        })
                        // this.props.navigation.navigate('ChannelScreen', {
                        //   node: this.state.node
                        // })
                        // console.log(this.state.node, "90")
                    }}
                    title='Open Channel'
                />
                <FlatList
         style={{
          margin: 5
        }}
        data={this.state.channels}
        renderItem={this.renderTemplate}
        keyExtractor={this.uniqueKey}
      />
            </View>
    // <View>
    //     <Text>
    //         HELL
    //     </Text>
    // </View>
        )
    }
}