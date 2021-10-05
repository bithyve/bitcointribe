import React, { useCallback, useState } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  Linking,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import CurrencyKindToggleSwitch from '../components/CurrencyKindToggleSwitch'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper'
import { ScrollView } from 'react-native-gesture-handler'
import DeviceInfo from 'react-native-device-info'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../components/ModalHeader'
import AdvanceSettings from '../components/AdvanceSettings'
import ExitKeyModal from '../components/ExitKeyModal'
import SweepFundsQrScanner from '../components/SweepFundsQrScanner'

export default function SettingsContents( props ) {
  const [ AdvanceBottomSheet, setAdvanceBottomSheet ] = useState( React.createRef() )
  const [ ExitKeyBottomSheet, setExitKeyBottomSheet ] = useState( React.createRef() )
  const [ SweepFundsQrScannerBottomSheet, setSweepFundsQrScannerBottomSheet ] = useState( React.createRef() )

  const [ switchOn, setSwitchOn ] = useState( false )
  const [ PageData, setPageData ] = useState( [
    {
      title: 'Manage Passcode',
      info: 'Change your passcode',
      image: require( '../assets/images/icons/managepin.png' ),
      type: 'ManagePin',
    },
    {
      title: 'Change Currency',
      info: 'Choose your currency',
      image: require( '../assets/images/icons/country.png' ),
      type: 'ChangeCurrency',
    },
    {
      title: 'Hexa Release',
      info: 'Version ',
      image: require( '../assets/images/icons/settings.png' ),
      type: 'AboutApp',
    },
  ] )

  const openLink = ( url ) => {
    Linking.canOpenURL( url ).then( ( supported ) => {
      if ( supported ) {
        Linking.openURL( url )
      } else {
        console.log( 'Don\'t know how to open URI: ' + url )
      }
    } )
  }

  const renderAdvanceModalContent = useCallback( () => {
    return (
      <AdvanceSettings
        modalRef={AdvanceBottomSheet}
        onPressAdvanceSetting={( type ) =>{
          onPressAdvanceSetting( type )
        }}
        ooBackPress={()=>{
          ( AdvanceBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderAdvanceModalHeader = useCallback( () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor1}
        onPressHeader={() => {
          ( AdvanceBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderExitKeyModalContent = useCallback( () => {
    return (
      <ExitKeyModal
        modalRef={ExitKeyBottomSheet}
        onPressProceed={()=>{
          ( SweepFundsQrScannerBottomSheet as any ).current.snapTo( 1 )
        }}
        onPressBack={()=>{
          if( ExitKeyBottomSheet.current )
            ( ExitKeyBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderExitKeyModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if( ExitKeyBottomSheet.current )
            ( ExitKeyBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )


  const renderQrScannerModalContent = useCallback( () => {
    return (
      <SweepFundsQrScanner
        modalRef={SweepFundsQrScannerBottomSheet}
        ooBackPress={() => {
          if( SweepFundsQrScannerBottomSheet.current )
            ( SweepFundsQrScannerBottomSheet as any ).current.snapTo( 0 )
        }
        }
        onProceed={() => props.navigation.navigate( 'SweepFunds' )}
      />
    )
  }, [] )

  const renderQrScannerModalHeader = useCallback( () => {
    return (
      <ModalHeader
        backgroundColor={Colors.backgroundColor1}
        onPressHeader={() => {
          if( SweepFundsQrScannerBottomSheet.current )
            ( SweepFundsQrScannerBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const onPressAdvanceSetting = async ( type ) => {
    if ( type == 'UseExitKey' ) {
      ( AdvanceBottomSheet as any ).current.snapTo( 0 );
      ( ExitKeyBottomSheet as any ).current.snapTo( 1 )
    }
  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.white
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{
        flex: 1, backgroundColor: Colors.white
      }}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{
                height: 30, width: 30, justifyContent: 'center'
              }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitleText}>{'Settings'}</Text>
            <TouchableOpacity
              onPress={() => {
                ( AdvanceBottomSheet as any ).current.snapTo( 1 )
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto',
                marginRight: 10,
                backgroundColor: Colors.backgroundColor,
                borderRadius: 8,
                padding: 5,
                borderColor: Colors.borderColor,
                borderWidth: 2,
              }}
            >
              <Image
                source={require( '../assets/images/icons/setting.png' )}
                style={styles.headerSettingImage}
              />
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.FiraSansRegular,
                  marginLeft: 10,
                  textAlign: 'center'
                }}
              >
                  Advance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modalContainer}>
          <ScrollView style={{
            flex: 1
          }}>
            {PageData.map( ( item ) => {
              return (
                <AppBottomSheetTouchableWrapper
                  onPress={
                    () => {
                      if ( item.type == 'ManagePin' ) {
                        return props.navigation.navigate( 'SettingManagePin', {
                          managePinSuccessProceed: ( pin ) =>
                            this.managePinSuccessProceed( pin ),
                        } )
                      } else if ( item.type == 'ChangeCurrency' ) {
                        //await AsyncStorage.getItem('currencyCode');
                        props.navigation.navigate( 'ChangeCurrency' )
                      } else if ( item.type == 'ChangeWalletName' ) {
                        props.navigation.navigate( 'SettingWalletNameChange' )
                      }
                    }
                    //props.onPressManagePin(item.type, currencycode)
                  }
                  style={styles.selectedContactsView}
                >
                  <Image
                    source={item.image}
                    style={{
                      width: wp( '7%' ),
                      height: wp( '7%' ),
                      resizeMode: 'contain',
                      marginLeft: wp( '3%' ),
                      marginRight: wp( '3%' ),
                    }}
                  />
                  <View
                    style={{
                      justifyContent: 'center',
                      marginRight: 10,
                      flex: 1,
                    }}
                  >
                    <Text style={styles.titleText}>{item.title}</Text>
                    <Text style={styles.infoText}>
                      {item.type == 'AboutApp'
                        ? item.info +
                          DeviceInfo.getVersion() +
                          ' (' +
                          DeviceInfo.getBuildNumber() +
                          ') '
                        : item.info}
                    </Text>
                  </View>
                  <View style={{
                    marginLeft: 'auto'
                  }}>
                    {item.type == 'JumbleKeyboard' ? (
                      <CurrencyKindToggleSwitch
                        isNotImage={true}
                        trackColor={Colors.lightBlue}
                        thumbColor={Colors.blue}
                        onpress={() => {
                          setSwitchOn( !switchOn )
                        }}
                        isOn={switchOn}
                      />
                    ) : item.type != 'AboutApp' ? (
                      <Ionicons
                        name="ios-arrow-forward"
                        color={Colors.textColorGrey}
                        size={15}
                        style={{
                          marginLeft: wp( '3%' ),
                          marginRight: wp( '3%' ),
                          alignSelf: 'center',
                        }}
                      />
                    ) : null}
                  </View>
                </AppBottomSheetTouchableWrapper>
              )
            } )}
          </ScrollView>
        </View>
        <View
          style={{
            flexDirection: 'row',
            elevation: 10,
            shadowColor: Colors.borderColor,
            shadowOpacity: 10,
            shadowOffset: {
              width: 2, height: 2
            },
            backgroundColor: Colors.white,
            justifyContent: 'space-around',
            height: 45,
            alignItems: 'center',
            marginLeft: 10,
            marginRight: 10,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: hp( '1%' ),
            marginBottom: hp( '6%' ),
            borderRadius: 10,
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => openLink( 'http://hexawallet.io/faq' )}
          >
            <Text style={styles.addModalTitleText}>FAQs</Text>
          </AppBottomSheetTouchableWrapper>

          <View
            style={{
              height: 20,
              width: 1,
              backgroundColor: Colors.borderColor,
            }}
          />
          <AppBottomSheetTouchableWrapper
            onPress={() => openLink( 'https://hexawallet.io/terms-of-service/' )}
          >
            <Text style={styles.addModalTitleText}>Terms of Service</Text>
          </AppBottomSheetTouchableWrapper>
          <View
            style={{
              height: 20,
              width: 1,
              backgroundColor: Colors.borderColor,
            }}
          />
          <AppBottomSheetTouchableWrapper
            onPress={() => openLink( 'http://hexawallet.io/privacy-policy' )}
          >
            <Text style={styles.addModalTitleText}>Privacy Policy</Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={AdvanceBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '50%' ) : hp( '55%' ),
        ]}
        renderContent={renderAdvanceModalContent}
        renderHeader={renderAdvanceModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ExitKeyBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '50%' ) : hp( '55%' ),
        ]}
        renderContent={renderExitKeyModalContent}
        renderHeader={renderExitKeyModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SweepFundsQrScannerBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '85%' ) : hp( '85%' ),
        ]}
        renderContent={renderQrScannerModalContent}
        renderHeader={renderQrScannerModalHeader}
      />
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContentView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexView: {
    flex: 0.5,
    height: '100%',
    justifyContent: 'space-evenly',
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  infoText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
  shareButtonView: {
    height: wp( '8%' ),
    width: wp( '15%' ),
    backgroundColor: Colors.backgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  headerSettingImage: {
    height: wp( '6%' ),
    width: wp( '6%' ),
  },
  pageTitle: {
    marginLeft: 30,
    color: Colors.blue,
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 14 ),
  },
} )
