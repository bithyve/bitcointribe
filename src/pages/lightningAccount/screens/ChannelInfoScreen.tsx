import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import Toast from '../../../components/Toast'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import HeaderTitle from '../../../components/HeaderTitle'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
@inject( 'ChannelsStore', 'InvoicesStore' )
@observer
export default class ChannelInfoScreen extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      channelInfo: this.props.navigation.getParam( 'channelInfo' ),
      feeForm: false,
      feeValue: null
    }
  }

  closeChannel = (
    channelPoint: string,
    channelId: string,
    satPerByte?: string | null,
    forceClose?: boolean | null
  ) => {
    const { ChannelsStore, navigation } = this.props

    // lnd
    if ( channelPoint ) {
      const [ funding_txid_str, output_index ] = channelPoint.split( ':' )

      if ( satPerByte ) {
        ChannelsStore.closeChannel(
          {
            funding_txid_str, output_index
          },
          null,
          satPerByte,
          forceClose
        )
      } else {
        ChannelsStore.closeChannel(
          {
            funding_txid_str, output_index
          },
          null,
          null,
          forceClose
        )
      }
    } else if ( channelId ) {
      // c-lightning, eclair
      ChannelsStore.closeChannel( null, channelId, satPerByte, forceClose )
    }

    this.props.navigation.goBack()
    Toast( 'Channel Close Intitiated' )
  };

  render() {
    const ListCard = ( { heading, data } ) => {
      return (
        <View style={styles.lineItem}>
          <Text style={ListStyles.listItemTitleTransaction}>
            {heading}
          </Text>
          <Text
            style={{
              ...ListStyles.listItemSubtitle,
              marginBottom: 3,
            }}
          >
            {data}
          </Text>
        </View>
      )
    }

    const ButtonComponent = ( {  onPress } ) => {
      return (
        <TouchableOpacity
          style={styles.buttonView}
          activeOpacity={0.6}
          onPress={() => {
            onPress()
          }}
        >
          <Text style={styles.buttonText}>Close Channel</Text>
        </TouchableOpacity>
      )
    }
    return (
      <ScrollView
        style={styles.rootContainer}
      >
        <HeaderTitle
          firstLineTitle={'Channel Details'}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />


        <View style={styles.bodySection}>
          <ListCard heading={'Channel ID'} data={this.state.channelInfo.remote_pubkey}/>
          <ListCard heading={'Local Balance'} data={this.state.channelInfo.local_balance}/>
          <ListCard heading={'Remote Balance'} data={this.state.channelInfo.remote_balance}/>
          <ListCard heading={'Unsettled Balance'} data={this.state.channelInfo.unsettled_balance}/>
          <ListCard heading={'Status'} data={this.state.channelInfo.active ? 'active' : 'inactive'}/>
          <ListCard heading={'private'} data={this.state.channelInfo.private ? 'true' : 'false'}/>
        </View>
        <View style={{
          flexDirection: 'row', justifyContent:'space-evenly'
        }}>
          {/* <ButtonComponent text={'Keysend'} onPress={() => {}}/> */}
          <ButtonComponent text={'Close Channel'} onPress={() => {
            this.closeChannel(
              this.state.channelInfo.channel_point,
              null,
              this.state.feeValue,
              true
            )
          }}/>
        </View>
        {/* <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>{this.state.channelInfo.remote_pubkey}</Text>
          <Text>local balance: {this.state.channelInfo.local_balance}</Text>

          <Text>remote balance: {this.state.channelInfo.remote_balance}</Text>

          <Text>
            unsettled balance: {this.state.channelInfo.unsettled_balance}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-around',
          }}
        >
          <Text>
            status: {this.state.channelInfo.active ? 'active' : 'inactive'}
          </Text>
          <Text>
            private: {this.state.channelInfo.private ? 'true' : 'false'}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              margin: 10,
            }}
          >
            <Button
              title="keysend"
              onPress={() => {}}
            />
          </View>


          <View
            style={{
              margin: 10,
            }}
          >
            <Button
              title="set fees"
              onPress={() => {
                if( this.state.feeForm ) {
                  this.setState( {
                    feeValue: null
                  } )
                }
                this.setState( {
                  feeForm: !this.state.feeForm
                } )
              }}
            />
            {this.state.feeForm && ( <TextInput
              placeholder = {'fees'}
              keyboardType="numeric"
              onChangeText={( value ) => {
                this.setState( {
                  feeValue: value
                } )
              }}
            /> )}
          </View>

          <View
            style={{
              margin: 10,
            }}
          >
            <Button
              title="close channel"
              onPress={() => {
                this.closeChannel(
                  this.state.channelInfo.channel_point,
                  null,
                  this.state.feeValue,
                  true
                )
              }}
            />
          </View>
        </View> */}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
  },
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.FiraSansRegular,
  },

  bodySection: {
    marginTop: 24,
    paddingHorizontal: 10,
  },

  lineItem: {
    marginBottom: RFValue( 16 ),
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 8,
  },

  containerRec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionKindIcon: {
    marginRight: 14,
  },

  titleSection: {
    flex: 1, width: widthPercentageToDP( '35%' )
  },
  titleText: {
    color: Colors.greyTextColor,
    fontSize: RFValue( 12 ),
    marginBottom: 2,
    // fontWeight: 'bold',
    fontFamily: Fonts.FiraSansRegular,
  },

  subtitleText: {
    fontSize: RFValue( 10 ),
    letterSpacing: 0.3,
    color: Colors.gray2
  },
  amountSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 16,
  },
  containerImg: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: 45,
    marginRight: 10,
    backgroundColor: '#F4F4F4',
    padding: 2,
    borderRadius: 45/2,
    borderColor: Colors.white,
    borderWidth: 2,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.6,
    shadowOffset: {
      width: 10, height: 10
    },
  },
  amountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue( 17 ),
  },
  bitcoinImage: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    alignSelf: 'center',
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
