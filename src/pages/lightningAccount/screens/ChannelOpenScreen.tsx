import React, { Component } from 'react'
import {
  Text,
  View,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import RESTUtils from '../../../utils/ln/RESTUtils'
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import { inject, observer } from 'mobx-react'
import Toast from '../../../components/Toast'
import HeaderTitle from '../../../components/HeaderTitle'
import { CheckBox, Input } from 'react-native-elements'
import FormStyles from '../../../common/Styles/FormStyles'
import Colors from '../../../common/Colors'
import CheckMark from '../../../assets/images/svgs/checkmark.svg'
import Fonts from '../../../common/Fonts'

@inject( 'ChannelsStore' )
@observer
export default class OpenChannelScreen extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      node: props.navigation.getParam( 'node' ),
      node_pubkey_string: '',
      local_funding_amount: '',
      min_confs: '1',
      sat_per_byte: '2',
      private: false,
      host: '',
      suggestImport: '',
      utxos: [],
      utxoBalance: 0,
    }
  }

  connectPeer = ( request: any ) => {
    if (
      request.node_pubkey_string.trim() === '' ||
      request.host.trim() === ''
    ) {
      Toast( 'All Fields Are Compulsory' )
      return
    }
    if (
      isNaN( request.min_confs ) ||
      isNaN( request.local_funding_amount ) ||
      isNaN( request.sat_per_byte )
    ) {
      Toast( 'All Fields Are Compulsory' )
      return
    }

    const finalRequest = {
      node_pubkey_string: this.state.node_pubkey_string,
      sat_per_byte: parseInt( this.state.sat_per_byte ),
      min_confs: parseInt( this.state.min_confs ),
      private: this.state.private,
      local_funding_amount: this.state.local_funding_amount,
      host: this.state.host,
    }
    this.props.ChannelsStore.connectPeer( finalRequest )
    Toast( 'Channel Opening Initiated' )
  };

  render() {
    const { ChannelsStore } = this.props
    const {
      connectingToPeer,
      openingChannel,
      connectPeer,
      errorMsgChannel,
      errorMsgPeer,
      peerSuccess,
      channelSuccess,
    } = ChannelsStore
    return (
      <View
        style={{
          margin: 5,
          backgroundColor: Colors.backgroundColor,
          flex: 1
        }}
      >
        <View
          style={{
            margin: 5,
          }}
        >
          <HeaderTitle
            firstLineTitle={'Open a channel'}
            secondLineTitle={''}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>
        <Input
          onChangeText={( val ) => {
            this.setState( {
              node_pubkey_string: val
            } )
          }}
          value={this.state.node_pubkey_string}
          placeholder="Node Pubkey"
          inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
          inputStyle={FormStyles.inputText}
          placeholderTextColor={FormStyles.placeholderText.color}
          numberOfLines={1}
        />
        <Input
          onChangeText={( val ) => {
            this.setState( {
              host: val
            } )
          }}
          value={this.state.host}
          placeholder="Hostname:Port"
          inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
          inputStyle={FormStyles.inputText}
          placeholderTextColor={FormStyles.placeholderText.color}
          numberOfLines={1}
        />
        <Input
          onChangeText={( val ) => {
            this.setState( {
              local_funding_amount: val
            } )
          }}
          value={this.state.local_funding_amount}
          keyboardType="numeric"
          placeholder="Local Amount"
          inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
          inputStyle={FormStyles.inputText}
          placeholderTextColor={FormStyles.placeholderText.color}
          numberOfLines={1}
        />
        <Input
          value={this.state.min_confs}
          onChangeText={( val ) => {
            this.setState( {
              min_confs: val
            } )
          }}
          keyboardType="numeric"
          placeholder="Min. Number Of Confirmations"
          inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
          inputStyle={FormStyles.inputText}
          placeholderTextColor={FormStyles.placeholderText.color}
          numberOfLines={1}
        />
        <Input
          onChangeText={( val ) => {
            this.setState( {
              sat_per_byte: val
            } )
          }}
          value={this.state.sat_per_byte}
          keyboardType="numeric"
          placeholder="Satoshis Per Byte"
          inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
          inputStyle={FormStyles.inputText}
          placeholderTextColor={FormStyles.placeholderText.color}
          numberOfLines={1}
        />

        <View style={{
          marginBottom: hp( 2 ),
          marginHorizontal: wp( 3 ),
          flexDirection: 'row'
        }}>
          <TouchableOpacity
            disabled
            onPress={() =>{
              this.setState( {
                private: !this.state.private
              } )
            }}

            style={{
              flexDirection: 'row'
            }}
          >
            <View style={styles.imageView}>
              {this.state.private &&
                  <CheckMark style={{
                    marginLeft: 6,
                    marginTop: 6
                  }}/>
              }
            </View>
            <Text style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 14 ),
              fontFamily: Fonts.FiraSansRegular,
              marginHorizontal: wp( 3 )
            }}>
              Keep channel private
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.buttonView}
          activeOpacity={0.6}
          onPress={() => {
            const request = {
              node_pubkey_string: this.state.node_pubkey_string,
              sat_per_byte: parseInt( this.state.sat_per_byte ),
              min_confs: parseInt( this.state.min_confs ),
              private: this.state.private,
              local_funding_amount: this.state.local_funding_amount,
              host: this.state.host,
            }
            this.connectPeer( request )
          }}
        >
          <Text style={styles.buttonText}>Open Channel</Text>
        </TouchableOpacity>


        <View>
          {( connectingToPeer || openingChannel ) && (
            <ActivityIndicator size="large" color={Colors.blue} />
          )}
          {peerSuccess && (
            <Text style={{
              color: 'green'
            }}>
              {'Peer Connected...'}
            </Text>
          )}
          {channelSuccess && (
            <Text style={{
              color: 'green'
            }}>
              {'Channel Established...'}
            </Text>
          )}
          {( errorMsgPeer || errorMsgChannel ) && (
            <Text style={{
              color: 'red'
            }}>
              {errorMsgChannel || errorMsgPeer || 'error'}
            </Text>
          )}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  Input: {
    marginVertical: 2,
    backgroundColor: 'white',
    height: wp( '13%' ),
  },
  viewSectionContainer: {
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  buttonView: {
    height: wp( '12%' ),
    width: wp( '40%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    marginHorizontal: wp( 4 ),
    marginVertical: hp( '2%' ),
  },
} )
