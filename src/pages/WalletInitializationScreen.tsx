import React, { useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Text,
  Platform,
  Linking
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Fonts from '../common/Fonts'
import Colors from '../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from '../components/BottomInfoBox'
import openLink from '../utils/OpenLink'
import { useDispatch } from 'react-redux'
import { setCloudDataRecovery } from '../store/actions/cloud'
import ErrorModalContents from '../components/ErrorModalContents'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import ModalHeader from '../components/ModalHeader'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

const WalletInitializationScreen = props => {
  const dispatch = useDispatch()
  const [ showModal, setShowModal ] = useState( false )
  const [
    contactListErrorBottomSheet,
    setContactListErrorBottomSheet,
  ] = useState( React.createRef() )

  const upgradeNow = () => {
    const url =
      Platform.OS == 'ios'
        ? 'https://apps.apple.com/us/app/bitcoin-wallet-hexa-2-0/id1586334138'
        : 'https://play.google.com/store/apps/details?id=io.hexawallet.hexa2&hl=en'
    Linking.canOpenURL( url ).then( ( supported ) => {
      if ( supported ) {
        Linking.openURL( url )
      } else {
        // console.log("Don't know how to open URI: " + url);
      }
    } )
  }

  const renderContactListErrorModalContent = useCallback( () => {
    return (
      <View style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        height: '100%',
        justifyContent: 'space-between'
      }}>
        <View style={{
          flex: 1
        }}/>

        <View>
          <ErrorModalContents
            modalRef={contactListErrorBottomSheet}
            title={'We’re better than ever'}
            info={'This app is not operational anymore. New users are requested to download Hexa 2.0. It is faster, more secure, and packs in a bunch of performance improvements over Hexa 1.0.\n\nIf you previously had sats in Hexa 1.0 and wish to recover the wallet, please go to the Restore Wallet section, click on "Using Recovery Keys" and follow the steps to restore your wallet. Once restored, please transfer your funds to Hexa 2.0\n'}
            proceedButtonText={'Download Hexa 2.0'}
            isIgnoreButton={false}
            onPressProceed={() => {
              upgradeNow( );
              ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
            }}
            isIgnoreButton
            onPressIgnore={() => {
              ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
            }}
            renderMore={
              ()=> <Text style={{
                color: Colors.textColorGrey,
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.FiraSansRegular,
              }}>
                <Text>For support, reach out to us on our telegram group: </Text>
                <Text onPress={()=> Linking.openURL( 'https://t.me/HexaWallet' )} style={{
                  color: 'blue',
                  textDecorationLine: 'underline'
                }}>t.me/HexaWallet</Text>
              </Text>
            }
            isBottomImage={true}
            bottomImage={require( '../assets/images/icons/errorImage.png' )}
          />
        </View>
      </View>

    )
  }, [  ] )

  const renderContactListErrorModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  function openModal() {
    contactListErrorBottomSheet.current.snapTo( 1 )
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <BottomSheet
        enabledInnerScrolling={true}
        enabledGestureInteraction={true}
        ref={contactListErrorBottomSheet}
        onCloseEnd={() => { }}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '100%' ) : hp( '100%' ),
        ]}
        initialSnap={1}
        renderContent={renderContactListErrorModalContent}
        renderHeader={renderContactListErrorModalHeader}
      />
      <View style={{
        flex: 1
      }}>
        <View style={{
          ...styles.viewSetupWallet, paddingTop: wp( '10%' )
        }}>
          <Text style={styles.headerTitleText}>New Hexa Wallet</Text>
          <Text style={styles.headerInfoText}>
            If this is your first time using Hexa on this device
          </Text>
          <TouchableOpacity
            onPress={() => openModal(  )}
            style={styles.NewWalletTouchableView}
          >
            <Image
              style={styles.iconImage}
              source={require( '../assets/images/icons/icon_newwallet.png' )}
            />
            <View style={styles.textView}>
              <Text style={styles.touchableText}>
                Create a new wallet
              </Text>
            </View>
            <View style={styles.arrowIconView}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={{
          ...styles.viewSetupWallet, paddingTop: wp( '10%' )
        }}>
          <Text style={styles.headerTitleText}>Restore Wallet</Text>
          <Text style={styles.headerInfoText}>
            If you would like to restore an existing Hexa Wallet
          </Text>
          <TouchableOpacity
            onPress={async () => {
              dispatch( setCloudDataRecovery( null ) )
              // if ( await AsyncStorage.getItem( 'recoveryExists' ) ) {
              props.navigation.navigate( 'RestoreWithICloud' )
              //props.navigation.navigate('RestoreSelectedContactsList');

              // } else {
              //   props.navigation.navigate( 'WalletNameRecovery' )
              // }
            }}
            style={{
              ...styles.NewWalletTouchableView,
              paddingTop: 20,
              paddingBottom: 20,
            }}
          >
            <Image
              style={styles.iconImage}
              source={require( '../assets/images/icons/icon_secrets.png' )}
            />
            <View style={styles.textView}>
              <Text style={styles.touchableText}>Using Recovery Keys</Text>
            </View>
            <View style={styles.arrowIconView}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={{
          flex: 1
        }}>
          <View style={{
            marginTop: 'auto'
          }}>
            <BottomInfoBox
              title={'Terms of Service'}
              infoText={
                'By proceeding to the next step, you agree to our '
              }
              linkText={'Terms of Service'}
              onPress={() => openLink( 'https://hexawallet.io/terms-of-service/' )}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default WalletInitializationScreen

let styles = StyleSheet.create( {
  container: {
    flex: 1,
  },
  viewSetupWallet: {
    height: wp( '55%' ),
    backgroundColor: Colors.white,
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    marginLeft: 15,
    marginRight: 15,
    fontFamily: Fonts.FiraSansRegular,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'normal',
    marginTop: 3,
    fontFamily: Fonts.FiraSansRegular,
  },
  NewWalletTouchableView: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
  },
  iconImage: {
    resizeMode: 'contain',
    width: 35,
    height: 35,
    alignSelf: 'center',
  },
  textView: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  touchableText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  arrowIconView: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 4,
    backgroundColor: Colors.backgroundColor,
  },
} )
