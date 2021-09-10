import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import ModalHeader from '../../components/ModalHeader'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import Ionicons from 'react-native-vector-icons/Ionicons'
import QRModal from './QRModal'
import ResetTwoFAFailure from './ResetTwoFASuccess'
import ServerErrorModal from './ServerErrorModal'
import {
  resetTwoFA,
  generateSecondaryXpriv,
  twoFAResetted,
  secondaryXprivGenerated,
  getSMAndReSetTFAOrGenerateSXpriv,
  setResetTwoFALoader,
} from '../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../navigation/actions/NavigationActions'
import idx from 'idx'
import { AccountsState } from '../../store/reducers/accounts'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { resetSendState } from '../../store/actions/sending'
import SecurityQuestion from '../../pages/NewBHR/SecurityQuestion'
import Loader from '../../components/loader'
import useAccountShellForID from '../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import { Wallet } from '../../bitcoin/utilities/Interface'
import ModalContainer from '../../components/home/ModalContainer'

export type Props = {
  navigation: any;
};

const SubAccountTFAHelpScreen = ( { navigation, }: Props ) => {
  const [ QrBottomSheet ] = useState( React.createRef<BottomSheet>() )
  const [ qrModal, showQRModel ] = useState( false )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ QRModalHeader, setQRModalHeader ] = useState( '' )
  const [
    ResetTwoFASuccessBottomSheet,
  ] = useState( React.createRef<BottomSheet>() )
  const [ reset2FAModal, setReset2FAModal ] = useState( false )
  const [ failureMessage, setFailureMessage ] = useState( '' )
  const [ failureMessageHeader, setFailureMessageHeader ] = useState( '' )
  const [
    ServerNotRespondingBottomSheet,
  ] = useState( React.createRef<BottomSheet>() )
  const [ serverNotRespondingModal, showServerNotRespondingModal ] = useState( false )
  const accountsState: AccountsState = useAccountsState()
  const sourceAccountShell = useAccountShellForID( navigation.getParam( 'accountShellID' ) )
  const dispatch = useDispatch()
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const resetTwoFALoader: boolean = accountsState.resetTwoFALoader
  const [ showLoader, setShowLoader ] = useState( true )

  useEffect( () => {
    const resettedTwoFA = idx( accountsState.twoFAHelpFlags, ( _ ) => _.twoFAResetted )
    if ( resettedTwoFA ) {
      dispatch( setResetTwoFALoader( false ) )
      navigation.navigate( 'TwoFASetup', {
        twoFASetup: {
          twoFAKey: wallet.details2FA.twoFAKey
        },
        onPressBack: () => {
          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
        },
      } )
      dispatch( twoFAResetted( null ) ) //resetting to monitor consecutive change
    } else if ( resettedTwoFA === false ) {
      setTimeout( () => {
        setFailureMessageHeader( 'Failed to reset 2FA' )
        setFailureMessage(
          'The QR you have scanned seems to be invalid, pls try again',
        )
      }, 2 )
      setReset2FAModal( true )
      dispatch( twoFAResetted( null ) )
    }
  }, [ accountsState.twoFAHelpFlags, wallet ] )

  useEffect( ()=>{
    if( resetTwoFALoader ) setShowLoader( true )
    else setShowLoader( false )
  }, [ resetTwoFALoader ] )

  useEffect( () => {
    const generatedSecureXPriv = idx( accountsState.twoFAHelpFlags, ( _ ) => _.xprivGenerated )
    if ( generatedSecureXPriv ) {
      dispatch( resetSendState() )
      navigation.navigate( 'Send', {
        subAccountKind: sourceAccountShell.primarySubAccount.kind,
      } )
      dispatch( secondaryXprivGenerated( null ) )

    } else if ( generatedSecureXPriv === false ) {
      setTimeout( () => {
        setFailureMessageHeader( 'Invalid Exit Key' )
        setFailureMessage( 'Invalid Exit Key, please try again' )
      }, 2 )
      setReset2FAModal( true )
      dispatch( secondaryXprivGenerated( null ) )
    }
  }, [ accountsState.twoFAHelpFlags ] )

  const getQrCodeData = ( qrData, type? ) => {
    const actionType = type ? type : QRModalHeader
    setTimeout( () => {
      setQrBottomSheetsFlag( false )
    }, 2 )
    if( actionType === 'Reset 2FA' ) dispatch( setResetTwoFALoader( true ) )
    dispatch( getSMAndReSetTFAOrGenerateSXpriv( qrData, actionType, sourceAccountShell ) )
  }

  const renderQrContent = useCallback( () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={QRModalHeader}
        title={'Scan the Regenerate/Exit Key'}
        infoText={'This can be found on the last page of your PDF personal copy'}
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={( qrData ) => {
          if ( QRModalHeader == 'Sweep Funds' ) {
            showQRModel( false )
          }
          getQrCodeData( qrData )
        }}
        onBackPress={() => {
          showQRModel( false )
        }}
        onPressContinue={async() => {
          const qrData = '{"requester":"ShivaniQ","publicKey":"c64DyxhpJXyup8Y6lXmRE1S2","uploadedAt":1615905819048,"type":"ReverseRecoveryQR","ver":"1.5.0"}'
          if ( qrData ) {
            if ( QRModalHeader == 'Sweep Funds' ) {
              showQRModel( false )
            }
            getQrCodeData( qrData )
          }
        }}
      />
    )
  }, [ QRModalHeader, QrBottomSheetsFlag ] )

  const renderQrHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout( () => {
            setQrBottomSheetsFlag( false )
          }, 2 )
          showQRModel( false )
        }}
      />
    )
  }, [] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ResetTwoFAFailure
        modalRef={ResetTwoFASuccessBottomSheet}
        title={failureMessageHeader}
        note={''
          // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore'
        }
        info={failureMessage}
        proceedButtonText={'Try Again'}
        onPressProceed={() => {
          setReset2FAModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/icon_twoFASuccess.png' )}
      />
    )
  }, [ failureMessage, failureMessageHeader ] )

  const renderServerNotRespondingContent = useCallback( () => {
    return (
      <ServerErrorModal
        modalRef={ServerNotRespondingBottomSheet}
        title={'The server is not responding?'}
        info={
          'This may be due to network issues. Please try again. If it still does not work you can sweep the funds from Hexa using the Exit Key.'
        }
        proceedButtonText={'Try Again'}
        onPressProceed={() => {
          showServerNotRespondingModal( false )
        }}
        isIgnoreButton={true}
        cancelButtonText={'Sweep Funds'}
        onPressIgnore={() => {
          setTimeout( () => {
            setQRModalHeader( 'Sweep Funds' )
          }, 2 )

          if ( !qrModal ) { showQRModel( true ); setQrBottomSheetsFlag( true ) }
          showServerNotRespondingModal( false )
        }}
      />
    )
  }, [] )

  const renderServerNotRespondingHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          showServerNotRespondingModal( false )
        }}
      />
    )
  }, [] )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flexDirection: 'row', alignItems: 'center'
          }}>
            <AppBottomSheetTouchableWrapper
              onPress={()=>{ navigation.goBack()}}
              hitSlop={{
                top: 20, left: 20, bottom: 20, right: 20
              }}
              style={{
                height: 30, width: 30
              }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </AppBottomSheetTouchableWrapper>
            <View>
              <Text style={styles.modalHeaderTitleText}>
                {'Having trouble with your 2FA'}
              </Text>
              <Text style={styles.modalHeaderInfoText}>
                If your 2FA is not working follow one of the below steps
              </Text>
            </View>
          </View>
        </View>
        <View style={{
          flex: 1
        }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              setTimeout( () => {
                setQRModalHeader( 'Reset 2FA' )
              }, 2 )
              if ( !qrModal ) {
                showQRModel( true )
                setQrBottomSheetsFlag( true )
              }
            }}
            style={{
              ...styles.selectedContactsView, marginBottom: hp( '3%' )
            }}
          >
            <Image
              source={require( '../../assets/images/icons/icon_power.png' )}
              style={{
                width: wp( '7%' ),
                height: wp( '7%' ),
                resizeMode: 'contain',
                marginLeft: 0,
                marginRight: 10,
              }}
            />
            <View>
              <Text style={styles.titleText}>Reset 2FA</Text>
              <Text style={styles.infoText}>
                In case you've forgotten your 2FA
              </Text>
            </View>
            <View
              style={{
                width: wp( '17%' ),
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  marginLeft: 'auto',
                  alignSelf: 'center',
                  marginRight: 20,
                }}
              />
            </View>
          </AppBottomSheetTouchableWrapper>

          <AppBottomSheetTouchableWrapper
            onPress={() => {
              showServerNotRespondingModal( true )
            }}
            style={{
              ...styles.selectedContactsView, marginBottom: hp( '3%' )
            }}
          >
            <Image
              source={require( '../../assets/images/icons/icon_gear.png' )}
              style={{
                width: wp( '7%' ),
                height: wp( '7%' ),
                resizeMode: 'contain',
                marginLeft: 0,
                marginRight: 10,
              }}
            />
            <View>
              <Text style={styles.titleText}>Server is not responding</Text>
              <Text style={styles.infoText}>
                The 2FA you are entering is invalid
              </Text>
            </View>
            <View
              style={{
                width: wp( '17%' ),
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  marginLeft: 'auto',
                  alignSelf: 'center',
                  marginRight: 20,
                }}
              />
            </View>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <View
        style={{
          marginRight: 30,
          marginLeft: 30,
          marginTop: 'auto',
          marginBottom: hp( '5%' ),
        }}
      >
        {/* <Text style={{ ...styles.modalHeaderInfoText }}>
          Lorem ipsum dolor sit amet, consectetur{'\n'}adipiscing elit, sed do
          eiusmod tempor
        </Text> */}
      </View>
      {showLoader ? <Loader isLoading={true}/> : null}
      {/* <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag( true )
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag( false )
          showQRModel( false )
        }}
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
        ref={QrBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '92%' ) : hp( '91%' ),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
      /> */}
      {qrModal &&
        <ModalContainer visible={qrModal} closeBottomSheet={() => {}}>
          {renderQrContent()}
        </ModalContainer>
      }
      <ModalContainer visible={reset2FAModal} closeBottomSheet={() => {}} >
        {renderErrorModalContent()}
      </ModalContainer>
      <ModalContainer visible={serverNotRespondingModal} closeBottomSheet={() => {}}>
        {renderServerNotRespondingContent()}
      </ModalContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
    marginTop: 10,
    borderBottomColor: Colors.white,
    borderBottomWidth: 0.5,
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 10,
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
  modalHeaderContainer: {
    marginTop: 'auto',
    flex: 1,
    height: 20,
    borderTopLeftRadius: 10,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightWidth: 1,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
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
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
} )

export default SubAccountTFAHelpScreen
