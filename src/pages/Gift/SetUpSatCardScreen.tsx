import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
  BackHandler,
  Linking,
  Keyboard,
  Alert,
  Dimensions,
  SafeAreaView
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'
import CommonStyles from '../../common/Styles/Styles'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { credsAuth } from '../../store/actions/setupAndAuth'
import BottomSheet from 'reanimated-bottom-sheet'
import LoaderModal from '../../components/LoaderModal'
import JailMonkey from 'jail-monkey'
import DeviceInfo from 'react-native-device-info'
import ErrorModalContents from '../../components/ErrorModalContents'
import { processDeepLink } from '../../common/CommonFunctions'
import ModalContainer from '../../components/home/ModalContainer'
import firebase from '@react-native-firebase/app'
import {
  setIsPermissionGiven,
  setFCMToken
} from '../../store/actions/preferences'
import messaging from '@react-native-firebase/messaging'
import {
  updateFCMTokens,
} from '../../store/actions/notifications'
import { autoSyncShells } from '../../store/actions/accounts'
import Relay from '../../bitcoin/utilities/Relay'
import { LocalizationContext } from '../../common/content/LocContext'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import { setCloudBackupStatus } from '../../store/actions/cloud'
import { setOpenToApproval } from '../../store/actions/BHR'
import SecurityQuestion from '../NewBHR/SecurityQuestion'
import Toast from '../../components/Toast'
import SecuritySeedWord from '../NewBHR/SecuritySeedWord'
import AlertModalContents from '../../components/AlertModalContents'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BottomInputModalContainer from '../../components/home/BottomInputModalContainer'
import ConfirmSeedWordsModal from '../NewBHR/ConfirmSeedWordsModal'

const { height, } = Dimensions.get( 'window' )

export default function SetUpSatCardScreen( props ) {
  // const subPoints = [
  //   'Setting up multi-accounts',
  //   'Fetching test sats & balances',
  //   'Generating shares for back-up',
  //   'Getting the latest details'
  // ]
  // const [ bottomTextMessage, setBottomTextMessage ] = useState(
  //   'Bitcoin Tribe uses the passcode and answer to the security question to encrypt different parts of your wallet',
  // )
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const common = translations[ 'common' ]
  const isMigrated = useSelector( ( state ) => state.preferences.isMigrated )
  const currentLevel: number = useSelector( ( state ) => state.bhr.currentLevel )
  const levelHealth = useSelector( ( state ) => state.bhr.levelHealth )

  const getRandomMessage = () => {
    //const randomIndex = Math.floor( Math.random() * 5 )
    //return strings.loaderMessages[ randomIndex ]
    // added static message for 2.0.5 #4833
    return {
      // heading: 'Gift Sats',
      // text: 'Send sats as gifts to your friends and family.',
      heading: 'Backup phrase',
      text: 'New backup method: Now note down twelve-word phrase (Backup Phrase) to backup your wallet',
      subText: ''
    }
  }
  const [
    questionModal,
    showQuestionModal,
  ] = useState( false )
  const [
    secuiritySeedWordModal,
    showSecuiritySeedWordModal,
  ] = useState( false )
  const initialMessage = getRandomMessage()
  const [ message ] = useState( initialMessage.heading )
  const [ subTextMessage1 ] = useState( initialMessage.text )
  const [ subTextMessage2 ] = useState( initialMessage.subText )
  const [ passcode, setPasscode ] = useState( '' )
  const [ Elevation, setElevation ] = useState( 10 )
  const [ JailBrokenTitle, setJailBrokenTitle ] = useState( '' )
  const [ JailBrokenInfo, setJailBrokenInfo ] = useState( '' )
  const [ passcodeFlag ] = useState( true )
  const [ checkAuth, setCheckAuth ] = useState( false )
  const [ attempts, setAttempts ] = useState( 0 )
  // const [ loaderBottomSheet ] = useState(
  //   React.createRef<BottomSheet>(),
  // )
  const [ loaderModal, setloaderModal ] = useState( false )
  const [ errorModal, setErrorModal ] = useState( false )
  const [ showAlertModal, setShowAlertModal ]=useState( false )
  const [ confirmSeedWordModal, setConfirmSeedWordModal ] = useState( false )
  const [ info, setInfo ] = useState( '' )

  const passcodeLength = 6

  const [ ErrorBottomSheet ] = useState(
    React.createRef<BottomSheet>(),
  )
  const releaseCasesValue = useSelector(
    ( state ) => state.preferences.releaseCasesValue,
  )
  const existingFCMToken = useSelector(
    ( state ) => state.preferences.fcmTokenValue,
  )
  const [ processedLink, setProcessedLink ] = useState( null )
  const [ isDisabledProceed, setIsDisabledProceed ] = useState( false )
  const [ creationFlag, setCreationFlag ] = useState( false )
  const [ ranSeedWord, setRanSeedWord ] = useState( null )

  const onPressNumber = useCallback(
    ( text ) => {
      let tmpPasscode = passcode
      if ( passcode.length < passcodeLength ) {
        if ( text != 'x' ) {
          tmpPasscode += text
          setPasscode( tmpPasscode )
        }
      }
      if ( passcode && text == 'x' ) {
        setPasscode( passcode.slice( 0, -1 ) )
        setCheckAuth( false )
      }
    },
    [ passcode ],
  )

  const hardwareBackPressCustom = useCallback( () => {
    return true
  }, [] )

  useEffect( () => {
    dispatch( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
    dispatch( setOpenToApproval( false, [], null ) )
    const subscription = Linking.addEventListener( 'url', handleDeepLinkEvent )
    //Linking.getInitialURL().then( handleDeepLinking )
    BackHandler.addEventListener( 'hardwareBackPress', hardwareBackPressCustom )
    return () => {
      BackHandler.removeEventListener( 'hardwareBackPress', hardwareBackPressCustom )
      subscription.remove()
    }

  }, [] )

  const handleDeepLinkEvent = async ( { url } ) => {
    handleDeepLinking( url )
  }

  const handleDeepLinking = async ( url: string | null ) => {
    // console.log( 'Login::handleDeepLinkEvent::URL: ', url )
    if ( url == null ) {
      return
    }
    setCreationFlag( true )
    const processedLink = await processDeepLink( url )
    setProcessedLink( processedLink )
  }

  useEffect( () => {
    if ( passcode.length == passcodeLength ) {
      setIsDisabledProceed( false )
    }
  }, [ passcode ] )

  const dispatch = useDispatch()

  const { isAuthenticated, authenticationFailed } = useSelector(
    ( state ) => state.setupAndAuth,
  )
  const { walletExists } = useSelector( ( state ) => state.storage )

  useEffect( () => {
    if ( JailMonkey.isJailBroken() ) {
      // ErrorBottomSheet.current.snapTo( 1 )
      setErrorModal( true )
      setTimeout( () => {
        setJailBrokenTitle(
          Platform.OS == 'ios'
            ? 'Your device is Jail Broken'
            : 'Your device is Rooted',
        )
        setJailBrokenInfo(
          Platform.OS == 'ios'
            ? 'You are using a jailbroken device hence in built security features of the app as well as the phone will not work as intended. We recommend you use a non jailbroken device with the latest iOS updates installed to ensure the security of your app data'
            : 'You are using a rooted device hence in built security features of the app as well as the phone will not work as intended. We recommend you use a non rooted device with the latest Android updates installed to ensure the security of your app data'
        )
        setElevation( 0 )
      }, 2 )
    }
    DeviceInfo.isPinOrFingerprintSet().then( ( isPinOrFingerprintSet ) => {
      if ( !isPinOrFingerprintSet ) {
        // ErrorBottomSheet.current.snapTo( 1 )
        setErrorModal( true )
        setTimeout( () => {
          setJailBrokenTitle(
            'Security entry unavilable',
          )
          setJailBrokenInfo(
            'Your phone does not have any secure entry like Pin or Biometric \n\n\nThis may be a security risk to your funds on Bitcoin Tribe',
          )
          setElevation( 0 )
        }, 2 )
      }
    } )

    Relay.fetchReleases( DeviceInfo.getBuildNumber() )
      .then( async ( res ) => {
        // console.log('Release note', res.data.releases);
        const releaseCases = releaseCasesValue

        if (
          res.releases.length &&
          res.releases[ 0 ].build > DeviceInfo.getBuildNumber()
        ) {
          if (
            releaseCases &&
            releaseCases.build == res.releases[ 0 ].build &&
            releaseCases.ignoreClick &&
            releaseCases.reminderLimit < 0
          )
            return
          props.navigation.navigate( 'UpdateApp', {
            releaseData: res.releases,
          } )
        }
        return
      } )
      .catch( ( error ) => {
        console.error( error )
      } )
  }, [] )


  useEffect( () => {
    if ( isAuthenticated ) {
      if( !walletExists ) {
        props.navigation.replace( 'WalletInitialization' )
      } else {
        setloaderModal( false )
        if( !creationFlag ) {
          props.navigation.navigate( 'Home', {
            screen: 'Home'
          } )
        } else if( processedLink ){
          props.navigation.navigate( 'Home', {
            screen: 'Home',
            params: {
              trustedContactRequest: processedLink ? processedLink.trustedContactRequest: null,
              giftRequest: processedLink ? processedLink.giftRequest: null,
              swanRequest: processedLink ? processedLink.swanRequest: null,
            }
          } )
        }

        bootStrapNotifications()
        dispatch( autoSyncShells() )
      }
    }
  }, [ isAuthenticated, walletExists, processedLink ] )

  const bootStrapNotifications = async () => {
    dispatch( setIsPermissionGiven( true ) )
    const t0 = performance.now()
    if ( Platform.OS === 'ios' ) {
      firebase
        .messaging()
        .hasPermission()
        .then( ( enabled ) => {
          if ( enabled ) {
            storeFCMToken()
            //this.createNotificationListeners()
          } else {
            firebase
              .messaging()
              .requestPermission( {
                provisional: true,
              } )
              .then( () => {
                storeFCMToken()
                // this.createNotificationListeners()
              } )
              .catch( () => {
                console.log( 'Permission rejected.' )
              } )
          }
        } )
        .catch()
    } else {
      storeFCMToken()
      //this.createNotificationListeners()
    }
    const t1 = performance.now()
    console.log( 'Call bootStrapNotifications took ' + ( t1 - t0 ) + ' milliseconds.' )
  }

  const storeFCMToken = async () => {
    const fcmToken = await messaging().getToken()
    if ( !existingFCMToken || existingFCMToken != fcmToken ) {
      dispatch( setFCMToken( fcmToken ) )
      dispatch( updateFCMTokens( [ fcmToken ] ) )
    }
  }

  const handleLoaderMessages = ( passcode ) => {
    setTimeout( () => {
      dispatch( credsAuth( passcode ) )
    }, 2 )
  }

  const renderLoaderModalContent = useCallback( () => {
    return (
      <LoaderModal
        headerText={message}
        messageText={subTextMessage1}
        messageText2={subTextMessage2}
        showGif={false}
        // subPoints={subPoints}
        // bottomText={bottomTextMessage}
      />
    )
  }, [ message, subTextMessage1, subTextMessage2 ] )

  const renderLoaderModalHeader = () => {
    return (
      <View
        style={{
          marginTop: 'auto',
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          height: hp( '75%' ),
          zIndex: 9999,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    )
  }

  const checkPasscode = () => {
    if ( checkAuth ) {
      setTimeout( () => {
        // loaderBottomSheet.current.snapTo( 0 )
        setloaderModal( false )
      }, 300 )

      return (
        <View style={{
          marginLeft: 'auto'
        }}>
          <Text style={styles.errorText}>{strings.Incorrect}</Text>
        </View>
      )
    }
  }

  const onPasscodeReset= () => {
    setCheckAuth( false )
    setAttempts( 0 )
    Toast( 'Passcode reset successfully, please login with new passcode' )
  }

  const renderSecurityQuestionContent = useCallback( () => {
    return (
      <SecurityQuestion
        onClose={() => showQuestionModal( false )}
        onPressConfirm={async () => {
          Keyboard.dismiss()
          showQuestionModal( false )
          props.navigation.navigate( 'SettingGetNewPin', {
            oldPasscode: '',
            onPasscodeReset:onPasscodeReset
          } )
        }}
        title="Enter your Passphrase"
        title1="Forgot Passcode"
        note="You will be prompted to change your passcode"
        onPasscodeVerify={()=>{ showQuestionModal( true )  }}
        showAnswer={false}
      />
    )
  }, [ questionModal ] )

  const renderSeedWordContent = useCallback( () => {
    return (
      <SecuritySeedWord
        onClose={() => showSecuiritySeedWordModal( false )}
        onPressConfirm={async () => {
          Keyboard.dismiss()
          showSecuiritySeedWordModal( false )
          props.navigation.navigate( 'SettingGetNewPin', {
            oldPasscode: '',
            onPasscodeReset:onPasscodeReset
          } )
        }}
        title="Enter your backup phrase Details"
        title1="Forgot Passcode"
        note="You will be prompted to change your passcode"
        onPasscodeVerify={()=>{ showSecuiritySeedWordModal( true )  }}
        showAnswer={false}
      />
    )
  }, [ questionModal ] )


  useEffect( () => {
    if ( authenticationFailed && passcode ) {
      setCheckAuth( true )
      checkPasscode()
      setPasscode( '' )
      setAttempts( attempts + 1 )
    } else {
      setCheckAuth( false )
    }
  }, [ authenticationFailed ] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={JailBrokenTitle}
        info={JailBrokenInfo}
        proceedButtonText={'Ok'}
        onPressProceed={() => {
          // ErrorBottomSheet.current.snapTo( 0 )
          setErrorModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        type={'small'}
      />
    )
  }, [ JailBrokenTitle ] )

  // const renderErrorModalHeader = useCallback( () => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         ErrorBottomSheet.current.snapTo( 0 )
  //       }}
  //     />
  //   )
  // }, [] )

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.white,
    }}>
      <StatusBar />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.white,
        // marginRight: wp( 4 ),
        // marginVertical: height < 720 ? wp( 0 ) : 'auto'
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{
        flex: 1,
        // backgroundColor:'red'
      }}>
        <View style={{
          // backgroundColor:'yellow'
        }}>
          <Text style={styles.headerTitleText}>{'Setting up SATSCARD™'}</Text>
          <View>
            <Text style={styles.headerInfoText}>
              {'Enter the 6-digit code printed\non the back of your SATSCARD™'}
              {/* <Text style={styles.boldItalicText}>{'Enter the 6-digit code printed\non the back of your SATSCARD™}</Text> */}
            </Text>
            <View style={{
              alignSelf: 'baseline'
            }}>
              <View style={styles.passcodeTextInputView}>
                <View
                  style={[
                    passcode.length == 0 && passcodeFlag == true
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 0 && passcodeFlag == true
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 1 ? (
                      <Text
                        style={{
                          fontSize: RFValue( 10 ),
                          textAlignVertical: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 0 && passcodeFlag == true ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 1
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 1
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 2 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 1 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 2
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 2
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 3 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 2 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 3
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 3
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 4 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 3 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 4
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 4
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 5 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 4 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 5
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 5
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 6 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 5 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
              </View>
              {checkPasscode()}
            </View>
          </View>

          <Text style={{
            fontSize: RFValue( 12 ),
            fontFamily: Fonts.Regular,
            color: Colors.black2,
            letterSpacing: 0.65,
            marginStart: 20,
            marginEnd: 120,
            marginTop: hp( '10%' ),
            // marginTop: RFValue( 70 )
          }} numberOfLines={2}>{'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}</Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:'space-between',
            marginTop: hp( '7%' ),
            marginHorizontal: ( 20 )
          }}>
            <View style={{
              flexDirection:'row'
            }}>
              <View style={{
                backgroundColor:Colors.blue, width:26, height:4, borderRadius:4
              }}/>
              <View style={{
                backgroundColor:Colors.blue, width:6, height:4, borderRadius:4, marginStart:4
              }}/>
            </View>
            <TouchableOpacity
              // disabled={passcode.length !== passcodeLength}
              onPress={() => {
                props.navigation.navigate( 'SetUpSatNextCard', {
                  fromClaimFlow: 1
                } )
              }}
              style={{
                ...styles.proceedButtonView,
                elevation: Elevation,
                backgroundColor: passcode.length !== passcodeLength
                  ? Colors.lightBlue
                  : Colors.blue,
              }}
            >
              <Text style={styles.proceedButtonText}>{'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{
          marginTop: 'auto', marginBottom: 20
        }}>
          <View style={styles.keyPadRow}>
            <TouchableOpacity
              onPress={() => onPressNumber( '1' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '1' )}
              >
                1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber( '2' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '2' )}
              >
                2
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber( '3' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '3' )}
              >
                3
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyPadRow}>
            <TouchableOpacity
              onPress={() => onPressNumber( '4' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '4' )}
              >
                4
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber( '5' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '5' )}
              >
                5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber( '6' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '6' )}
              >
                6
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyPadRow}>
            <TouchableOpacity
              onPress={() => onPressNumber( '7' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '7' )}
              >
                7
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber( '8' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '8' )}
              >
                8
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber( '9' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '9' )}
              >
                9
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyPadRow}>
            <View style={styles.keyPadElementTouchable}>
              <Text style={{
                flex: 1, padding: 15
              }}></Text>
            </View>
            <TouchableOpacity
              onPress={() => onPressNumber( '0' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( '0' )}
              >
                0
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber( 'x' )}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber( 'x' )}
              >
                <Ionicons name="ios-backspace" size={30} color={Colors.blue} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ModalContainer
          visible={loaderModal}
          closeBottomSheet={() => {}}
          background={'rgba(42,42,42,0.4)'}
          onBackground={()=>{
            setloaderModal( false )
            // setTimeout( () => {
            //   setloaderModal( true )
            // }, 200 )
          }
          }
        >
          {renderLoaderModalContent()}
        </ModalContainer>
      </View>
      <ModalContainer onBackground={()=>setErrorModal( false )} visible={errorModal} closeBottomSheet={() => {}}>
        {renderErrorModalContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>showQuestionModal( false )} visible={questionModal} closeBottomSheet={() => {showQuestionModal( false )}} >
        {renderSecurityQuestionContent()}
      </ModalContainer>
      <BottomInputModalContainer onBackground={() => setConfirmSeedWordModal( false )} visible={confirmSeedWordModal}
        closeBottomSheet={() => setConfirmSeedWordModal( false )}  showBlurView={true}>
        <ConfirmSeedWordsModal
          proceedButtonText={'Confirm'}
          seedNumber={ranSeedWord != null ? ranSeedWord.id :1}
          onPressProceed={( word ) => {
            setConfirmSeedWordModal( false )
            if( word == '' ){
              setTimeout( () => {
                setInfo( 'Please enter backup phrase' )
                setShowAlertModal( true )
              }, 500 )
            } else if( word !=  ranSeedWord.name  ){
              setTimeout( () => {
                setInfo( 'Please enter valid backup phrase' )
                setShowAlertModal( true )
              }, 500 )
            } else {
              props.navigation.navigate( 'SettingGetNewPin', {
                oldPasscode: '',
                onPasscodeReset:onPasscodeReset
              } )
              // dispatch(setSeedBackupHistory())
            }
          }}
          bottomBoxInfo={false}
          onPressIgnore={() => setConfirmSeedWordModal( false )}
          isIgnoreButton={true}
          cancelButtonText={'Cancel'}
        />
      </BottomInputModalContainer>
      {/* <ModalContainer onBackground={()=>showSecuiritySeedWordModal( false )} visible={secuiritySeedWordModal} closeBottomSheet={() => {showSecuiritySeedWordModal( false )}} >
        {renderSeedWordContent()}
      </ModalContainer> */}
      {/* <BottomSheet
        onCloseEnd={() => {
          setElevation( 10 )
        }}
        onOpenEnd={() => {
          setElevation( 0 )
        }}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '25%' ) : hp( '30%' ),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      /> */}
      <ModalContainer onBackground={()=>{setShowAlertModal( false )}} visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          // modalRef={this.ErrorBottomSheet}
          // title={''}
          // info={'In case you have forgotten passcode, please setup the wallet again and restore it'}
          info={info}
          proceedButtonText={'Okay'}
          onPressProceed={() => {
            setShowAlertModal( false )
          }}
          isBottomImage={false}
          // bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp( '10%' ),
    width: wp( '10%' ),
    borderRadius: 7,
    marginLeft: 20,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  textBoxActive: {
    height: wp( '10%' ),
    width: wp( '10%' ),
    borderRadius: 7,
    marginLeft: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 3
    },
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  keyPadRow: {
    flexDirection: 'row',
    height: hp( '8%' ),
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp( '8%' ),
    fontSize: RFValue( 18 ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.Regular,
    fontStyle: 'normal',
  },
  proceedButtonView: {
    marginLeft: 20,
    height: wp( '13%' ),
    width: wp( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  boldItalicText: {
    fontFamily: Fonts.MediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  errorText: {
    fontFamily: Fonts.MediumItalic,
    color: Colors.tomatoRed,
    fontSize: RFValue( 10 ),
    fontStyle: 'italic',
    letterSpacing: 0.5
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 16 ),
    marginLeft: 20,
    marginTop: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    letterSpacing: 0.8
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
    marginTop: RFValue( 5 ),
    letterSpacing: 1.3
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue( 13 ),
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    marginTop: hp( '4.5%' ),
    marginBottom: hp( '1.5%' ),
    width: 'auto',
  },
} )
