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
  clearPaymentDetails,
} from '../../store/actions/trustedContacts'
import idx from 'idx'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import DeviceInfo from 'react-native-device-info'
import WalletName from './WalletName'

interface RestoreWithoutICloudStateTypes {
  listData: any[];
  selectedIds: any[];
}

interface RestoreWithoutICloudPropsTypes {
  navigation: any;
}

class RestoreWithoutICloud extends Component<
  RestoreWithoutICloudPropsTypes,
  RestoreWithoutICloudStateTypes
> {
  constructor( props ) {
    super( props )
    this.state = {
      selectedIds: [],
      listData: [
        {
          type: 'contact',
          title: 'Keeper Contact',
          info: 'Last backup not available',
          id: 1,
          image: require( '../../assets/images/icons/icon_contact.png' ),
        },
        {
          type: 'device',
          title: 'Keeper Contact',
          info: 'Last backup not available',
          id: 2,
          image: require( '../../assets/images/icons/icon_secondarydevice.png' ),
        },
        {
          type: 'pdf',
          title: 'PDF Keeper',
          info: 'Last backup not available',
          id: 3,
          image: require( '../../assets/images/icons/icon_secondarydevice.png' ),
        },
      ],
    }
  }

  render() {
    const { listData, selectedIds } = this.state
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
            <View style={{
              justifyContent: 'center', width: wp( '80%' )
            }}>
              <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                {'Recover using keys'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit
                amet, consetetur Lorem ipsum dolor sit amet, consetetur
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{
          flex: 1
        }}>
          {listData.map( ( item, index ) => {
            return (
              <View
                key={index}
                style={{
                  ...styles.cardsView,
                  borderBottomWidth: index == 2 ? 0 : 4,
                }}
              >
                <ImageBackground
                  source={require( '../../assets/images/icons/Ellipse.png' )}
                  style={styles.cardsImageView}
                >
                  <Image source={item.image} style={styles.cardImage} />
                </ImageBackground>
                <View style={{
                  marginLeft: 10
                }}>
                  <Text
                    style={{
                      ...styles.cardsInfoText,
                      fontSize: RFValue( 18 ),
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardsInfoText}>{item.title}</Text>
                  <Text style={styles.cardsInfoText}>{item.info}</Text>
                </View>
                <View style={styles.statusTextView}>
                  <Text style={styles.statusText}>Waiting for Key</Text>
                </View>
              </View>
            )
          } )}
        </ScrollView>
        <Text
          numberOfLines={2}
          style={{
            ...styles.modalHeaderInfoText,
            margin: wp( '8%' ),
            marginBottom: wp( '8%' ),
          }}
        >
          Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit amet,
          consetetur Lorem ipsum dolor sit amet, consetetur
        </Text>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Colors.blue,
            height: 60,
            borderRadius: 10,
            marginLeft: 25,
            marginRight: 25,
            marginBottom: hp( '4%' ),
            justifyContent: 'space-evenly',
            alignItems: 'center',
            shadowColor: Colors.shadowBlue,
            shadowOpacity: 1,
            shadowOffset: {
              width: 15, height: 15
            },
          }}
        >
          <TouchableOpacity
            // onPress={() => (this.refs.RestoreSuccess as any).snapTo(1)}
            style={styles.buttonInnerView}
          >
            <Image
              source={require( '../../assets/images/icons/openlink.png' )}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Send Request</Text>
          </TouchableOpacity>
          <View
            style={{
              width: 1, height: 30, backgroundColor: Colors.white
            }}
          />
          <TouchableOpacity
            style={styles.buttonInnerView}
            onPress={() => {
              ( this.refs.WalletName as any ).snapTo( 1 )
            }}
          >
            <Image
              source={require( '../../assets/images/icons/qr-code.png' )}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonText}>Scan Key</Text>
          </TouchableOpacity>
        </View>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'WalletName'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '60%' ),
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '80%' )
              : hp( '90%' ),
          ]}
          renderContent={() => (
            <WalletName
              modalRef={this.refs.WalletName}
              onPressProceed={() => {
                ( this.refs.WalletName as any ).snapTo( 0 )
              }}
              onPressBack={() => {
                ( this.refs.WalletName as any ).snapTo( 0 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => ( this.refs.WalletName as any ).snapTo( 0 )}
            />
          )}
        />
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
    walletName:
      idx( state, ( _ ) => _.storage.database.WALLET_SETUP.walletName ) || '',
    s3Service: idx( state, ( _ ) => _.sss.service ),
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchEphemeralChannel,
  } )( RestoreWithoutICloud ),
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
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  cardsInfoText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  cardsView: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.backgroundColor,
  },
  cardsImageView: {
    width: wp( '20%' ),
    height: wp( '20%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    resizeMode: 'contain',
    marginBottom: wp( '1%' ),
  },
  statusTextView: {
    padding: 5,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 'auto',
    paddingLeft: 10,
    paddingRight: 10
  },
  statusText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
} )
