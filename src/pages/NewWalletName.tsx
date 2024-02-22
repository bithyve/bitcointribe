import BottomSheet from '@gorhom/bottom-sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import React, { createRef, useCallback, useContext, useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../common/Colors'
import { LocalizationContext } from '../common/content/LocContext'
import Fonts from '../common/Fonts'
import BottomInfoBox from '../components/BottomInfoBox'
import CloudPermissionModalContents from '../components/CloudPermissionModalContents'
import HeaderTitle from '../components/HeaderTitle'
import ModalContainer from '../components/home/ModalContainer'
import LoaderModal from '../components/LoaderModal'
import { initNewBHRFlow, updateCloudPermission } from '../store/actions/BHR'
import { setupWallet } from '../store/actions/setupAndAuth'
import { setVersion } from '../store/actions/versionHistory'

export enum BottomSheetKind {
  CLOUD_PERMISSION,
}

export enum BottomSheetState {
  Closed,
  Open,
}

export type Props = {
  route: any;
  navigation: any;
};

const NewWalletName: React.FC<Props> = ( { route, navigation }: Props ) => {
  // const [ timerArray, setTimerArray ] = useState( [ 1, 1, 1 ] )
  // const [ timeLeft, setTimeLeft ] = useState( null )
  // const [ intervalRef, setIntervalRef ] = useState( null )
  const [ walletName, setWalletName ] = useState( '' )
  const [ inputStyle, setInputStyle ] = useState( styles.inputBox )
  const [ note, showNote ] = useState( true )
  const [ successModal, setSuccessModal ] = useState( false )
  const [ currentBottomSheetKind, setCurrentBottomSheetKind ]: [BottomSheetKind, any] = useState( null )
  const [ bottomSheetState, setBottomSheetState ]: [BottomSheetState, any] = useState( BottomSheetState.Closed )
  const [ cloud ] = useState( Platform.OS == 'ios' ? 'iCloud' : 'Google Drive' )
  const bottomSheetRef = createRef<BottomSheet>()
  const dispatch = useDispatch()
  const [ isCloudPermissionRender, setIsCloudPermissionRender ] = useState( false )
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const common = translations[ 'common' ]
  const walletSetupCompleted = useSelector( ( state ) => state.setupAndAuth.walletSetupCompleted )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus )
  const [ loaderModal, setLoaderModal ] = useState( false )
  const [ subTextMessage, setSubTextMessage ] = useState( strings.Thismay )
  const [ bottomTextMessage ] = useState( strings.Hexaencrypts )
  const subPoints = [ strings.multi, strings.creatingbackup, strings.preloading ]
  const [ message, setMessage ] = useState( strings.Creatingyourwallet )
  const [ signUpStarted, setSignUpStarted ] = useState( false )
  const mnemonic = route.params?.mnemonic || null
  const initialMnemonic =  route.params?.initialMnemonic || ''
  const gridType = route.params?.gridType|| ''
  const passphrase =  route.params?.passphrase|| ''

  useEffect( () => {
    if ( walletSetupCompleted ) {
      setLoaderModal( false )
      if(Platform.OS==='android'){
        navigation.dispatch( CommonActions.reset( {
          index: 0,
          routes: [
            {
              name: 'App',
              params: {
                walletName
              }
            },
          ]
        } ) )
      }else{
        setTimeout( () => {
            navigation.dispatch( CommonActions.reset( {
              index: 0,
              routes: [
                {
                  name: 'App',
                  params: {
                    walletName
                  }
                },
              ]
            } ) )
          },100)
      }
      }
  }, [ walletSetupCompleted, cloudBackupStatus ] )

  const renderLoaderModalContent = useCallback( () => {
    return <LoaderModal
      // headerText={'Gift Sats'}
      // messageText={'Send sats as gifts to your friends and family.'}
      headerText={'Backup phrase'}
      messageText={'New backup method: Now note down twelve-word phrase (Backup Phrase) to backup your wallet'}
      showGif={false}
    />
  }, [ message, subTextMessage, loaderModal ] )

  const renderBottomSheetContent = () =>{

    switch ( currentBottomSheetKind ) {
        case BottomSheetKind.CLOUD_PERMISSION:
          return (
            <CloudPermissionModalContents
              title={'Automated Cloud Backup'}
              // info={'This is the first level of security of your wallet and we encourage you to proceed with this step while setting up the wallet'}
              info={'Backup the wallet to easily restore it in case your phone gets damaged or lost'}
              note={''}
              onPressProceed={( flag )=>{
                closeBottomSheet()
                console.log( 'updateCloudPermission', flag )
                dispatch( updateCloudPermission( flag ) )
                navigation.navigate( 'NewWalletQuestion', {
                  walletName,
                } )
              }}
              onPressIgnore={( flag )=> {
                closeBottomSheet()
                console.log( 'updateCloudPermission', flag )
                dispatch( updateCloudPermission( flag ) )
                navigation.navigate( 'NewWalletQuestion', {
                  walletName,
                } )
              }}
              autoClose={()=>{
                closeBottomSheet()
                console.log( 'updateCloudPermission', true )
                // dispatch( updateCloudPermission( true ) )
                navigation.navigate( 'NewWalletQuestion', {
                  walletName,
                } )
              }}
              isRendered={isCloudPermissionRender}
              bottomImage={require( '../assets/images/icons/cloud_ilustration.png' )}
            />
          )

        default:
          break
    }
  }

  const openBottomSheet = (
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) => {
    setBottomSheetState( BottomSheetState.Open )
    setCurrentBottomSheetKind( kind )

    if ( snapIndex == null ) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.snapTo( snapIndex )
    }
  }

  const onBottomSheetClosed =()=> {
    setBottomSheetState( BottomSheetState.Closed )
    setCurrentBottomSheetKind( null )
  }

  const closeBottomSheet = () => {
    setIsCloudPermissionRender( false )
    // bottomSheetRef.current.snapTo( 0 )
    setCurrentBottomSheetKind( null )
    onBottomSheetClosed()
  }

  const onBackgroundOfLoader = () => {
    setLoaderModal( false )
    if ( signUpStarted )
      setTimeout( () => {
        console.log( 'TIMEOUT' )
        setLoaderModal( true )
      }, 100 )
  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={{
        flex: 1
      }}>
        <ModalContainer onBackground={() => onBackgroundOfLoader()} visible={loaderModal} closeBottomSheet={null}>
          {renderLoaderModalContent()}
        </ModalContainer>
        <KeyboardAvoidingView
          style={{
            flex: 1
          }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <View style={{
            flex: 1
          }} >
            <HeaderTitle
              navigation={navigation}
              backButton={true}
              firstLineTitle={initialMnemonic ? 'Step 7 of Create with Border Wallet' : `${strings.Step1}` }
              secondLineBoldTitle={strings.NameyourWallet}
              secondLineTitle={''}
              infoTextNormal={initialMnemonic ? `${strings.Step1}` : ''}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            <TextInput
              style={inputStyle}
              placeholder={strings.walletName}
              placeholderTextColor={Colors.borderColor}
              value={walletName}
              keyboardType={
                Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
              }
              maxLength={10}
              onChangeText={( text ) => {
                text = text.replace( /[^A-Za-z]/g, '' )
                setWalletName( text )
              }}
              onFocus={() => {
                setInputStyle( styles.inputBoxFocused )
                showNote( false )
              }}
              onBlur={() => {
                setInputStyle( styles.inputBox )
              }}
              autoCorrect={false}
              autoCompleteType="off"
            />
            <View style={{
              marginRight: wp( 6 )
            }}>
              <Text style={{
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Italic, color: Colors.textColorGrey,
                alignSelf: 'flex-end'
              }}>
                {strings.WalletCreationNumbers}</Text>
              {/* <Text style={{
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Italic, color: Colors.textColorGrey,
                alignSelf: 'flex-end'
              }}>
                {strings.numbers}</Text> */}
            </View>
          </View>
          {/* </KeyboardAvoidingView> */}
          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorActiveView} />
            <View style={styles.statusIndicatorInactiveView} />
            {/* <View style={styles.statusIndicatorInactiveView} /> */}
          </View>
          <View style={styles.bottomButtonView}>
            {walletName.trim() != '' ? (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setLoaderModal( true )
                    Keyboard.dismiss()
                    // navigation.navigate( 'NewWalletQuestion', {
                    //   walletName,
                    // } )
                    setTimeout( () => {
                      setSignUpStarted( true )
                      dispatch( updateCloudPermission( false ) )
                      dispatch( setupWallet( walletName, null, mnemonic, initialMnemonic, gridType, passphrase ) )
                      dispatch( initNewBHRFlow( true ) )
                      dispatch( setVersion( 'Current' ) )
                      const current = Date.now()
                      AsyncStorage.setItem( 'SecurityAnsTimestamp', JSON.stringify( current ) )
                      const securityQuestionHistory = {
                        created: current,
                      }
                      AsyncStorage.setItem( 'securityQuestionHistory', JSON.stringify( securityQuestionHistory ) )
                    }, 1000 )
                  }}
                >
                  <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
                    start={{
                      x: 0, y: 0
                    }} end={{
                      x: 1, y: 0
                    }}
                    locations={[ 0.2, 1 ]}
                    style={styles.buttonView}
                  >
                    <Text style={styles.buttonText}>{common.proceed}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null}


          </View>
        </KeyboardAvoidingView>
        {/* {walletName.trim() == '' ? ( */}
        {note ? (
          <View style={{
            marginBottom: DeviceInfo.hasNotch ? hp( '3%' ) : 0
          }}>
            <BottomInfoBox
              title={'Note'}
              infoText={
                strings.info
              }
            />
          </View>
        ) : null}

      </View>
      {/* <BottomSheetBackground
        isVisible={bottomSheetState === BottomSheetState.Open}
        onPress={closeBottomSheet}
      /> */}
      <ModalContainer onBackground={()=>setCurrentBottomSheetKind( null )} visible={currentBottomSheetKind != null} closeBottomSheet={() => {}} >
        {renderBottomSheetContent()}
      </ModalContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    marginLeft: 20,
    marginBottom: 5,
    fontFamily: Fonts.Regular,
  },
  labelStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    fontFamily: Fonts.Regular,
  },
  inputBox: {
    borderRadius: 10,
    marginTop: hp( '1%' ),
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    marginBottom: hp( 1 ),
    backgroundColor: Colors.backgroundColor1,
  },
  inputBoxFocused: {
    borderRadius: 10,
    marginTop: hp( '1%' ),
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.backgroundColor1,
    fontFamily: Fonts.Regular,
    marginBottom: hp( 1 ),
  },
  bottomNoteText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    marginBottom: 5,
    fontFamily: Fonts.Regular,
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingHorizontal: hp( 6 ),
    paddingBottom: DeviceInfo.hasNotch() ? hp( 4 ) : hp( 3 ),
    // paddin: hp( 9 ),
    alignItems: 'center',
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    paddingHorizontal: hp( 3 )
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  checkbox: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    borderRadius: 7,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doCloudBackupField: {
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    marginBottom: 36,
    marginHorizontal: 14,
    paddingHorizontal: 10,
    padding:10,
    marginTop: hp( '5%' ),
  },
  doCloudBackupFieldContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallInfoLabelText: {
    backgroundColor: Colors.backgroundColor,
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
} )

export default NewWalletName
