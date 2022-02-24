import { inject, observer } from 'mobx-react'
import React, { Component, ReactElement } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import Toast from '../../../components/Toast'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import HeaderTitle1 from '../../../components/HeaderTitle1'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
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
@inject( 'ChannelsStore', 'InvoicesStore' )
@observer
export default class ChannelInfoScreen extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      channelInfo: this.props.navigation.getParam( 'channelInfo' ),
      alias : this.props.navigation.getParam( 'alias' ),
      feeForm: false,
      feeValue: '2',
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
          <Text style={{
            ...ListStyles.listItemTitleTransaction, fontSize: RFValue( 12 )
          }}>
            {heading}
          </Text>
          <Text
            style={{
              ...ListStyles.listItemSubtitle,
              marginBottom: 3,
              fontSize: RFValue( 12 )
            }}
          >
            {data}
          </Text>
        </View>
      )
    }

    const RenderTemplate = ( { channelInfo }: { channelInfo: ChannelFrame } ): ReactElement => {
      const ChannelBar = ( { offline } ) => {
        const remote_balance: number = parseInt( channelInfo.remote_balance )
        const local_balance: number = parseInt( channelInfo.local_balance )
        const remoteEquity: number =
          remote_balance / ( remote_balance + local_balance )
        const localEquity: number =
          local_balance / ( remote_balance + local_balance )
        return (
          <>
            <View
              style={
                offline
                  ? [
                    styles.grayBoxContainer,
                    {
                      backgroundColor: Colors.gray11,
                      borderRadius: 20,
                    },
                    {
                      flex: localEquity,
                    },
                  ]
                  : [
                    styles.skyBlueBoxContainer,
                    {
                      backgroundColor: Colors.primaryAccentLighter2,
                      borderRadius: 20,
                    },
                    {
                      flex: localEquity,
                    },
                  ]
              }
            >
              <Text numberOfLines={1} style={styles.channelPrice}>
                {local_balance}
                <Text style={styles.channelSats}>sats</Text>
              </Text>
            </View>
            <View
              style={
                offline
                  ? [
                    styles.grayBoxContainer,
                    {
                      backgroundColor: Colors.gray11,
                      borderRadius: 20,
                    },
                    {
                      flex: remoteEquity,
                    },
                  ]
                  : [
                    styles.blueBoxContainer,
                    {
                      backgroundColor: Colors.darkBlue,
                      borderRadius: 20,
                    },
                    {
                      flex: remoteEquity,
                    },
                  ]
              }
            >
              <Text numberOfLines={1} style={styles.channelPrice}>
                {remote_balance}
                <Text style={styles.channelSats}>sats</Text>
              </Text>
            </View>
          </>
        )
      }

      return (
        <View
          style={styles.signleChannelItem}
        >
          <View style={styles.myPrivateChannelContainer}>
            <View
              style={channelInfo.active ? styles.goodContainer : styles.badContainer}
            >
              <Text style={channelInfo.active ? styles.goodText : styles.badText}>
                {channelInfo.active ? 'Active' : 'Offline'}
              </Text>
            </View>
            <Text style={styles.privateChannelText}>
              {this.state.alias ||
                channelInfo.chan_id ||
                channelInfo.alias}
            </Text>
          </View>

          <View style={styles.channelBoxesMaincontainer}>
            <View style={styles.channelBoxescontainer}>
              <ChannelBar offline={!channelInfo.active} />
            </View>
          </View>
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
        <HeaderTitle1
          firstLineTitle={'Channel'}
          secondLineTitle={'Channel Details'}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />


        <RenderTemplate channelInfo={this.state.channelInfo}/>
        <View style={styles.bodySection}>
          <ListCard heading={'Channel ID'} data={this.state.channelInfo.remote_pubkey}/>
          <ListCard heading={'Local Balance'} data={this.state.channelInfo.local_balance}/>
          <ListCard heading={'Remote Balance'} data={this.state.channelInfo.remote_balance}/>
          <ListCard heading={'Unsettled Balance'} data={this.state.channelInfo.unsettled_balance}/>
          <ListCard heading={'Status'} data={this.state.channelInfo.active ? 'active' : 'inactive'}/>
          <ListCard heading={'Private'} data={this.state.channelInfo.private ? 'true' : 'false'}/>
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
              false
            )
          }}/>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
    paddingTop:30,
    paddingHorizontal:10
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
    backgroundColor: Colors.backgroundColor1,
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
  skyBlueBoxContainer: {
    padding: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 2,
  },
  blueBoxContainer: {
    padding: 4,
    borderRadius: 3,
    marginRight: 2,
  },
  grayBoxContainer: {
    padding: 4,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  channelPrice: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 12 ),
    marginLeft: 7,
  },
  channelSats: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 8 ),
  },
  rightArrow: {
    width: widthPercentageToDP( 4 ),
    height: widthPercentageToDP( 4 ),
    resizeMode: 'contain',
  },
  goodContainer: {
    backgroundColor: Colors.lightGreen1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  badContainer: {
    backgroundColor: Colors.lightRed1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  goodText: {
    textAlign: 'center',
    fontSize: RFValue( 10 ),
    fontWeight: '800',
    color: Colors.darkGreen,
  },
  badText: {
    color: Colors.darkRed,
    textAlign: 'center',
    fontSize: RFValue( 10 ),
    fontWeight: '800',
  },
  privateChannelText: {
    color: Colors.gray4,
    fontSize: RFValue( 12 ),
    fontWeight: '700',
  },
  channelBoxesMaincontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 13,
  },
  channelBoxescontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  priceText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 16 ),
    color: Colors.black,
  },
  sats: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 10 ),
    color: Colors.gray10,
  },
  signleChannelItem: {
    backgroundColor: Colors.backgroundColor1,
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
    paddingHorizontal: 10,
    marginHorizontal:10
  },
  myPrivateChannelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
} )
