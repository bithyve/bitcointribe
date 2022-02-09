import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Platform,
  ImageBackground,
  TextInput,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { withNavigationFocus } from 'react-navigation'
import { connect } from 'react-redux'
import {
  fetchEphemeralChannel,
} from '../../store/actions/trustedContacts'
import idx from 'idx'
import { RNCamera } from 'react-native-camera'
import BottomInfoBox from '../../components/BottomInfoBox'
import getFormattedStringFromQRString from '../../utils/qr-codes/GetFormattedStringFromQRData'

interface ScanRecoveryKeyStateTypes {
  isScanned: any;
}

interface ScanRecoveryKeyPropsTypes {
  navigation: any;
  walletName: any;
}

class ScanRecoveryKey extends Component<
  ScanRecoveryKeyPropsTypes,
  ScanRecoveryKeyStateTypes
> {
  constructor( props ) {
    super( props )
    this.state = {
      isScanned: false,
    }
  }

  barcodeRecognized = async ( barcodes ) => {
    const barcode = getFormattedStringFromQRString( barcodes.data )
    //console.log("barcodes1", barcode);
    this.props.navigation.state.params.scannedData( JSON.parse( barcode ) )
    this.props.navigation.goBack()
    if ( barcode ) {
      this.setState( {
        isScanned: false
      } )
    }
  };

  componentDidMount = () => {};

  render() {
    const { isScanned } = this.state
    const { navigation } = this.props
    return (
      <View style={{
        flex: 1, backgroundColor: Colors.backgroundColor1
      }}>
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row'
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackArrowView}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View
              style={{
                justifyContent: 'center',
                width: wp( '80%' ),
                marginLeft: 5,
              }}
            >
              <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                {'Scan Recovery Key'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
              Click on the image below to scan QR
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{
          flex: 1
        }}>
          <View style={styles.greyBox}>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Image
                source={require( '../../assets/images/icons/icon_wallet.png' )}
                style={styles.greyBoxImage}
              />
            </View>
            <View style={{
              marginLeft: 10
            }}>
              <Text style={{
                ...styles.greyBoxText, fontSize: RFValue( 11 )
              }}>
                Recovering Wallet
              </Text>
              { this.props.walletName || this.props.navigation.state.params.walletName ? <Text style={styles.greyBoxText}>{`${this.props.walletName ? this.props.walletName : this.props.navigation.state.params.walletName ? this.props.navigation.state.params.walletName : ''}` + '’s Wallet'}</Text> : null }

            </View>
          </View>
          {isScanned ? (
            <View
              style={{
                width: wp( '90%' ),
                height: wp( '90%' ),
                overflow: 'hidden',
                borderRadius: 20,
                alignSelf: 'center',
              }}
            >
              <RNCamera
                style={{
                  width: wp( '90%' ),
                  height: wp( '90%' ),
                }}
                onBarCodeRead={this.barcodeRecognized}
                captureAudio={false}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    paddingTop: 12,
                    paddingRight: 12,
                    paddingLeft: 12,
                    width: '100%',
                  }}
                >
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderTopColor: 'white',
                      borderLeftColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      borderTopWidth: 1,
                    }}
                  />
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderRightWidth: 1,
                      borderRightColor: 'white',
                      borderTopColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      marginLeft: 'auto',
                    }}
                  />
                </View>
                <View
                  style={{
                    marginTop: 'auto',
                    flexDirection: 'row',
                    paddingBottom: 12,
                    paddingRight: 12,
                    paddingLeft: 12,
                    width: '100%',
                  }}
                >
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderBottomColor: 'white',
                      borderLeftColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      borderBottomWidth: 1,
                    }}
                  />
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderRightWidth: 1,
                      borderRightColor: 'white',
                      borderBottomColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      marginLeft: 'auto',
                    }}
                  />
                </View>
              </RNCamera>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                alignSelf: 'center'
              }}
              onPress={() => {
                // this.barcodeRecognized( {
                //   data: '{"type":"RECOVERY_REQUEST","walletName":"ShivaniNew","channelId":"016eb4ac3b68d312ac8301e5cedeececdc4b8e42a56e49fd849048ff3642da86","streamId":"65bf22a7c","channelKey":"0BvnLFWTJfNP3hFy43qYk136","secondaryChannelKey":"upToEzzuNHJ75QYqyRz9Q6Lc","version":"2.0.7","walletId":"2ca1d6a049f75ec5c693d76a896745e12438941d97921dfabfa6c3a4a1ac258d"}'
                // } )
                this.setState( {
                  isScanned: true
                } )}}
            >
              <ImageBackground
                source={require( '../../assets/images/icons/iPhone-QR.png' )}
                style={{
                  width: wp( '90%' ),
                  height: wp( '90%' ),
                  overflow: 'hidden',
                  borderRadius: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    paddingTop: 12,
                    paddingRight: 12,
                    paddingLeft: 12,
                    width: '100%',
                  }}
                >
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderTopColor: 'white',
                      borderLeftColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      borderTopWidth: 1,
                    }}
                  />
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderRightWidth: 1,
                      borderRightColor: 'white',
                      borderTopColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      marginLeft: 'auto',
                    }}
                  />
                </View>
                <View
                  style={{
                    marginTop: 'auto',
                    flexDirection: 'row',
                    paddingBottom: 12,
                    paddingRight: 12,
                    paddingLeft: 12,
                    width: '100%',
                  }}
                >
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderBottomColor: 'white',
                      borderLeftColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      borderBottomWidth: 1,
                    }}
                  />
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderRightWidth: 1,
                      borderRightColor: 'white',
                      borderBottomColor: 'white',
                      height: hp( '5%' ),
                      width: hp( '5%' ),
                      marginLeft: 'auto',
                    }}
                  />
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}

        </ScrollView>
        {/* <BottomInfoBox
          backgroundColor={Colors.white}
          title={'Note'}
          infoText={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.'
          }
        /> */}
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
    walletName: idx( state, ( _ ) => _.storage.wallet.walletName ) || '',
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
  } )( ScanRecoveryKey ),
)

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp( '0.7%' ),
    marginBottom: hp( '0.7%' ),
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  greyBox: {
    width: wp( '90%' ),
    borderRadius: 10,
    backgroundColor: Colors.white,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    alignSelf: 'center',
    marginTop: wp( '10%' ),
    marginBottom: wp( '5%' ),
  },
  greyBoxImage: {
    width: wp( '11%' ),
    height: wp( '11%' ),
  },
  greyBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 20 ),
  },
} )
