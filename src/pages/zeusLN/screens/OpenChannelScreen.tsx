import React, { Component } from 'react'
import { Text, View, Button, StyleSheet } from 'react-native'
import { TextInput } from 'react-native-paper'
import RESTUtils from '../../../utils/ln/RESTUtils'
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'

interface OpenChannelRequest {
    min_confs?: number;
    spend_unconfirmed?: boolean;
    remote_csv_delay?: number;
    node_pubkey_string: string;
    node_pubkey?: any;
    push_sat?: string;
    target_conf?: number;
    sat_per_byte?: string;
    private?: boolean;
    min_htlc_msat?: string;
    local_funding_amount: string;
    host: string;
    id?: string;
    satoshis?: string;
    announce?: boolean;
    utxos?: string[];
}
export default class OpenChannelScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            node: props.navigation.getParam('node'),
            node_pubkey_string: '',
            local_funding_amount: '',
            min_confs: '1',
            sat_per_byte: '2',
            private: false,
            host: '',
            suggestImport: '',
            utxos: [],
            utxoBalance: 0
        }
    }

    connectPeer = async (request: OpenChannelRequest) => {
        await RESTUtils.connectPeer(this.state.node, {
            addr: {
                pubkey: request.node_pubkey_string,
                host: request.host
            }
        }).then(async (resp: any) => {
            await RESTUtils.openChannel(this.state.node, request)
            .then((resp: any) => {
                console.log(resp)
            })
        })
    }

    render() {
        return (
          <View style = {{
            margin: 5
          }}>
              <View style = {{
            margin: 5
          }}>
            <View style={styles.viewSectionContainer}>
                <CoveredQRCodeScanner
                  containerStyle={styles.qrScannerContainer}
                  onCodeScanned = {(data)=> {
                      let peerInfo = data.data
                      // trigger open channel function
                  }
                }
                />
              </View>
          </View>
            <TextInput 
            onChangeText={(val) => {
                this.setState({node_pubkey_string: val})
            }}
            value={this.state.node_pubkey_string}
                placeholder='Node Pubkey'
            />
            <TextInput 
            onChangeText={(val) => {
                this.setState({host: val})
            }}
            value={this.state.host}

                placeholder='Hostname:Port'
            />
            <TextInput 
            onChangeText={(val) => {
                this.setState({local_funding_amount: val})
            }}
            value={this.state.local_funding_amount}

                keyboardType='numeric'
                placeholder='Local Amount'
            />
            <TextInput 

                value={this.state.min_confs}
            onChangeText={(val) => {
                this.setState({min_confs: val})
            }}  
                keyboardType='numeric'
                placeholder='Min. Number Of Confirmations'
            />
            <TextInput
            onChangeText={(val) => {
                this.setState({sat_per_byte: val})
            }}
            value={this.state.sat_per_byte}
                keyboardType='numeric' 
                placeholder='Satoshis Per Byte' 
            />

            <Button 
            title='open channel'
            onPress = {() => {
                let req = {
                    min_confs: parseInt( this.state.min_confs),
                    node_pubkey_string: this.state.node_pubkey_string,
                    sat_per_byte: parseInt (this.state.sat_per_byte),
                    private: this.state.private,
                    local_funding_amount: this.state.local_funding_amount,
                    host: this.state.host
                }
                this.connectPeer(req)
                // console.log(typeof parseInt (this.state.min_confs))
            }}/>
          </View>
        )
    }
}
const qrScannerHeight = heightPercentageToDP( 35 )

const styles = StyleSheet.create( {
    rootContainer: {
      flex: 1,
      backgroundColor: 'white',
    },
  
    viewSectionContainer: {
      marginBottom: 16,
    },
    qrScannerContainer: {
      // width: '100%',
      // maxWidth: qrScannerHeight * ( 1.40 ),
      height: qrScannerHeight,
      marginBottom: 9,
    }
  } )