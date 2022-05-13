import { inject, observer } from 'mobx-react'
import React, { Component, ReactElement } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Clipboard } from 'react-native'
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
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import ModalContainer from '../../../components/home/ModalContainer'
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
      closeChannelState: false,
    }
  }

  closeModal =() => {
    this.setState( ( prev )=>{
      return {
        ...prev, closeChannelState: false
      }
    } )
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
          <View style={{
            flexDirection:'row'
          }}>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
                fontSize: RFValue( 12 ),
                width: '90%'
              }}
              numberOfLines = {1}
            >
              {data}
            </Text>
            {heading == 'Channel ID' &&
            <TouchableOpacity
              onPress={()=>{
                Clipboard.setString( data )
                Toast( 'Copied to clipboard' )
              }}
            >
              <Image
                style={{
                  width: 18, height: 20, marginLeft:widthPercentageToDP( 3 )
                }}
                source={require( '../../../assets/images/icons/icon-copy.png' )}
              />
            </TouchableOpacity>
            }
          </View>
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
          <View style={{
            flexDirection:'row', alignItems:'center'
          }} >
            <View style={styles.modalCrossButton}>
              <FontAwesome name="close" color={'#77B9EB'} size={12} />
            </View>
            <View style={{
              paddingLeft:13
            }} >
              <Text style={styles.buttonText}>Close Channel</Text>
            </View>
          </View>
        </TouchableOpacity>
      )
    }
    const CloseChannelModal =() => {
      return (
        <View style={styles.modalContainer}>
          <View style={styles.crossIconContainer}>
            <FontAwesome name="close" color={Colors.blue} size={20} onPress={()=>this.closeModal()}/>
          </View>
          <View style={{
            flexDirection:'column',
            alignItems:'center',
            marginTop:hp( 1 )
          }}>
            <Text style={{
              fontSize:RFValue( 17 ),
              fontFamily:Fonts.FiraSansRegular,
              color:Colors.blue,
              marginBottom: 17
            }}>
                Do you want to close this Channel
            </Text>
            <ButtonComponent text={'Close Channel'} onPress={() => {
              this.closeChannel(
                this.state.channelInfo.channel_point,
                null,
                this.state.feeValue,
                false
              )
            }}/>
          </View>

        </View>
      )
    }
    return (
      <>
        <ScrollView
          style={styles.rootContainer}
        >
          <StatusBar barStyle="dark-content"/>
          <HeaderTitle1
            firstLineTitle={''}
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
            <ListCard heading={'Status'} data={this.state.channelInfo.active ? 'Active' : 'Inactive'}/>
            <ListCard heading={'Private'} data={this.state.channelInfo.private ? 'True' : 'False'}/>
          </View>

        </ScrollView>
        <View style={{
          flexDirection: 'row', justifyContent:'space-evenly'
        }}>
          <View style={{
            alignItems:'center'
          }} >
            <View style={{
              position:'absolute', bottom:20
            }} >
              {/* <ButtonComponent text={'Keysend'} onPress={() => {}}/> */}
              <ButtonComponent text={'Close Channel'} onPress={() => {
                // this.closeChannel(
                //   this.state.channelInfo.channel_point,
                //   null,
                //   this.state.feeValue,
                //   false
                // )
                this.setState( ( prev )=>{
                  return {
                    ...prev, closeChannelState: true
                  }
                } )
              }}/>
            </View>
          </View>
          <ModalContainer visible={this.state.closeChannelState} closeBottomSheet={this.closeModal}>
            {CloseChannelModal()}
          </ModalContainer>
        </View>
      </>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
    paddingTop:20,
    paddingHorizontal:10,
    position:'relative'
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
    marginBottom: RFValue( 5 ),
    backgroundColor: Colors.backgroundColor1,
    padding: 12,
    paddingHorizontal: 20,
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
    color: Colors.black,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  buttonView: {
    flexDirection:'row',
    height: wp( '14%' ),
    width: wp( '40%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#8686860D',
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.backgroundColor1,
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
    fontSize: RFValue( 9 ),
    fontWeight: '600',
    color: Colors.darkGreen,
  },
  badText: {
    color: Colors.darkRed,
    textAlign: 'center',
    fontSize: RFValue( 9 ),
    fontWeight: '600',
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
  modalCrossButton: {
    width: wp( 6 ),
    height: wp( 6 ),
    borderRadius: wp( 7/2 ),
    backgroundColor: '#C8E1F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft:'auto'
  },
  modalContainer:{
    backgroundColor:Colors.backgroundColor,
    height:hp( '25%' ),
  },
  crossIconContainer:{
    justifyContent:'flex-end',
    flexDirection:'row',
    margin:10,
  },
} )
