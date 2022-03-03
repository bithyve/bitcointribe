/* eslint-disable react/jsx-key */
import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  TouchableOpacity,
  Image
} from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import HeaderTitle1 from '../../../components/HeaderTitle1'
import { inject, observer } from 'mobx-react'
import Toast from '../../../components/Toast'
import QRCode from '../../../components/QRCode'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
@inject(
  'NodeInfoStore',
)
@observer
export default class NodeInfoScreen extends Component {


  constructor( props ) {
    super( props )

    this.state = {
      showQr: []
    }
  }


  componentDidMount() {
    this.props.NodeInfoStore.reset()
    this.props.NodeInfoStore.getNodeInfo()
  }

  writeToClipboard  ( text: string ) {
    Clipboard.setString( text )
    Toast( 'Text Copied' )
  }

  showHideQR ( uri ) {
    if( !this.state.showQr.includes( uri ) ){
      const { showQr } = this.state
      showQr.push( uri )
      console.log( showQr,  )
      this.setState( {
        showQr,
      } )
    }
  }

  render() {
    const { NodeInfoStore } = this.props
    const {  alias, version, synced_to_chain, block_height, block_hash, uris } = NodeInfoStore.nodeInfo
    if( NodeInfoStore.loading ){
      return(
        <ActivityIndicator
          color={Colors.blue}
          size="large"
          style={{
            height: '90%'
          }}
        />
      )
    }
    return (
      <ScrollView
        contentContainerStyle={styles.rootContainer}
        overScrollMode="never"
        bounces={false}
      >
        <View style={{
          paddingTop:hp( 3.5 )
        }}>
          <HeaderTitle1
            firstLineTitle={'Settings'}
            secondLineTitle={'Node Information'}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />
        </View>

        <View style={styles.bodySection}>
          <View style={styles.lineItem}>
            <Text style={{
              ...ListStyles.listItemTitleTransaction, fontSize:RFValue( 13 )
            }}>Alias</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.getFee} */}
              {alias}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={{
              ...ListStyles.listItemTitleTransaction, fontSize:RFValue( 13 )
            }}>
              Implementation Version
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.payment_hash} */}
              {version}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={{
              ...ListStyles.listItemTitleTransaction, fontSize:RFValue( 13 )
            }}>
              Synced To Chain
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.payment_preimage } */}
              {synced_to_chain ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={{
              ...ListStyles.listItemTitleTransaction, fontSize:RFValue( 13 )
            }}>Block Height</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {moment( parseInt( this.state.payment.creation_date ) ).format( 'DD/MM/YY • hh:MMa' )} */}
              {block_height}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={{
              ...ListStyles.listItemTitleTransaction, fontSize:RFValue( 13 )
            }}>
              Block Hash
            </Text>
            <Text
              numberOfLines={1}
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.enhancedPath[0].join('\n\n')} */}
              {block_hash}

            </Text>
          </View>
          {
            uris.length > 0 && (
              uris.map( uri => (
                <View style={[ styles.lineItem, {
                  alignItems: 'center'
                } ]}>
                  <View>
                    <Text style={{
                      ...ListStyles.listItemTitleTransaction, fontSize:RFValue( 13 )
                    }}>
                  URI
                    </Text>
                    <Text
                      style={{
                        ...ListStyles.listItemSubtitle,
                        marginBottom: 3,
                      }}
                    >
                      {uri}
                    </Text>

                  </View>

                  <View style={styles.containerBtn}>

                    <TouchableOpacity
                      style={styles.button}
                      activeOpacity={0.6}
                      onPress={()=> this.showHideQR( uri )}
                    >
                      <Image
                        source={require( '../../../assets/images/icons/qr.png' )}
                        style={{
                          width: wp( '5%' ), height: wp( '5%' ), marginLeft: 'auto',
                        }}
                        resizeMode={'contain'}
                      />
                      <Text style={[ styles.buttonText, {
                        marginLeft: 4
                      } ]}>Show QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.button}
                      activeOpacity={0.6}
                      onPress={()=> this.writeToClipboard( uri )}
                    >
                      <Image
                        source={require( '../../../assets/images/icons/icon-copy.png' )}
                        style={{
                          width: wp( '4%' ), height: wp( '4%' ), marginLeft: 'auto',
                        }}
                        resizeMode={'contain'}
                      />
                      <Text style={[ styles.buttonText, {
                        marginLeft: 4
                      } ]}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  {
                    this.state.showQr.includes( uri ) && (
                      <QRCode
                        size={hp( '25%' )}
                        title="Node URI"
                        value={uri}
                      />
                    )
                  }

                </View>

              ) )
            )
          }

        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.offWhite,
    paddingHorizontal: wp( 2 ),
  },
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.FiraSansRegular,
  },

  bodySection: {
    marginTop: 15,
    paddingHorizontal: 10,
  },

  lineItem: {
    marginBottom: RFValue( 9 ),
    backgroundColor: Colors.white,
    padding: 15,
    paddingHorizontal: 15,
    elevation: 4,
    borderRadius: 8,
  },

  containerRec: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  containerBtn: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    marginVertical: 10
  },

  button: {
    height: hp( '3.5%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.lightBlue,
    marginHorizontal: wp( 1 ),
    flexDirection: 'row',
  },

  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
