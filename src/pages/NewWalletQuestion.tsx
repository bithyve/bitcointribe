import React, { useState, useEffect, useCallback, createRef } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  Image,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Fonts from '../common/Fonts'
import Colors from '../common/Colors'
import QuestionList from '../common/QuestionList'
import CommonStyles from '../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Feather from 'react-native-vector-icons/Feather'
import { RFValue } from 'react-native-responsive-fontsize'
import HeaderTitle from '../components/HeaderTitle'
import BottomInfoBox from '../components/BottomInfoBox'

import { useDispatch, useSelector } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import LoaderModal from '../components/LoaderModal'
import DeviceInfo from 'react-native-device-info'
import { walletCheckIn } from '../store/actions/trustedContacts'
import { setVersion } from '../store/actions/versionHistory'
import { initNewBHRFlow } from '../store/actions/health'
import {  setCloudData } from '../store/actions/cloud'
import CloudBackupStatus from '../common/data/enums/CloudBackupStatus'
import ModalContainer from '../components/home/ModalContainer'
import ButtonBlue from '../components/ButtonBlue'
import { updateCloudPermission } from '../store/actions/health'
import CloudPermissionModalContents from '../components/CloudPermissionModalContents'


export enum BottomSheetKind {
  CLOUD_PERMISSION,
}

export enum BottomSheetState {
  Closed,
  Open,
}

// only admit lowercase letters and digits
const ALLOWED_CHARACTERS_REGEXP = /^[0-9a-z]+$/
let messageIndex = 0
const LOADER_MESSAGE_TIME = 2000
const loaderMessages = [
  {
    heading: 'Bootstrapping Accounts',
    text: 'Hexa has a multi-account model which lets you better manage your bitcoin (sats)',
    subText: '',
  },
  {
    heading: 'Filling Test Account with test sats',
    text:
      'Preloaded Test Account is the best place to start your Bitcoin journey',
    subText: '',
  },
  {
    heading: 'Generating Recovery Keys',
    text: 'Recovery Keys help you restore your Hexa wallet in case your phone is lost',
    subText: '',
  },
  {
    heading: 'Manage Backup',
    text:
      'You can backup your wallet at 3 different levels of security\nAutomated cloud backup | Double backup | Multi-key backup',
    subText: '',
  },
  {
    heading: 'Level 1 - Automated Cloud Backup',
    text: 'Allow Hexa to automatically backup your wallet to your cloud storage and we’ll ensure you easily recover your wallet in case your phone gets lost',
    subText: '',
  },
  {
    heading: 'Level 2 - Double Backup',
    text: 'Starting to hodl sats and bitcoin? Ensure that you backup your wallet atleast to Level 2 backup called Double Backup',
    subText: '',
  },
  {
    heading: 'Level 3 - Multi-key Backup',
    text: 'For hardcore Bitcoiners who understand Bitcoin, stack large amounts of sats or bitcoin and care for utmost security of their wallet',
    subText: '',
  }
]

const getNextMessage = () => {
  if ( messageIndex == ( loaderMessages.length ) ) messageIndex = 0
  return loaderMessages[ messageIndex++ ]
}

function validateAllowedCharacters( answer: string ): boolean {
  return answer == '' || ALLOWED_CHARACTERS_REGEXP.test( answer )
}

export default function NewWalletQuestion( props: { navigation: { getParam: ( arg0: string ) => any; navigate: ( arg0: string, arg1: { walletName: any } ) => void } } ) {
  const [ message, setMessage ] = useState( 'Creating your wallet' )
  const [ subTextMessage, setSubTextMessage ] = useState(
    'The Hexa wallet is non-custodial and is created locally on your phone so that you have full control of it',
  )
  const [ Elevation, setElevation ] = useState( 10 )
  const [ isLoaderStart, setIsLoaderStart ] = useState( false )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ dropdownBoxList ] = useState( QuestionList )
  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
    id: '',
    question: '',
  } )
  const [ answerInputStyle, setAnswerInputStyle ] = useState( styles.inputBox )
  const [ pswdInputStyle, setPswdInputStyle ] = useState( styles.inputBox )
  const [ confirmInputStyle, setConfirmAnswerInputStyle ] = useState(
    styles.inputBox,
  )
  const [ confirmPswdInputStyle, setConfirmPswdInputStyle ] = useState(
    styles.inputBox,
  )
  const [ confirmAnswer, setConfirmAnswer ] = useState( '' )
  const [ confirmPswd, setConfirmPswd ] = useState( '' )
  const [ answer, setAnswer ] = useState( '' )
  const [ answerMasked, setAnswerMasked ] = useState( '' )
  const [ confirmAnswerMasked, setConfirmAnswerMasked ] = useState( '' )
  const [ pswd, setPswd ] = useState( '' )
  const [ pswdMasked, setPswdMasked ] = useState( '' )
  const [ confirmPswdMasked, setConfirmPswdMasked ] = useState( '' )
  const [ hideShowConfirmAnswer, setHideShowConfirmAnswer ] = useState( true )
  const [ hideShowConfirmPswd, setHideShowConfirmPswd ] = useState( true )
  const [ hideShowAnswer, setHdeShowAnswer ] = useState( true )
  const [ hideShowPswd, setHideShowPswd ] = useState( true )

  const dispatch = useDispatch()
  const walletName = props.navigation.getParam( 'walletName' )
  const [ answerError, setAnswerError ] = useState( '' )
  const [ pswdError, setPswdError ] = useState( '' )
  const [ tempAns, setTempAns ] = useState( '' )
  const [ tempPswd, setTempPswd ] = useState( '' )
  const [ isEditable, setIsEditable ] = useState( true )
  const [ isDisabled, setIsDisabled ] = useState( false )
  // const [ loaderBottomSheet ] = useState( React.createRef() )
  const [ loaderModal, setLoaderModal ] = useState( false )
  const [ confirmAnswerTextInput ] = useState( React.createRef() )
  const [ confirmPswdTextInput ] = useState( React.createRef() )
  const [ visibleButton, setVisibleButton ] = useState( false )
  const [ showNote, setShowNote ] = useState( true )
  const [ securityQue, showSecurityQue ] = useState( false )
  const [ encryptionPswd, showEncryptionPswd ] = useState( false )
  const [ activeIndex, setActiveIndex ] = useState( 0 )
  const s3service = useSelector( ( state ) => state.health.service )
  const accounts = useSelector( ( state: { accounts: any } ) => state.accounts )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus )
  const cloudPermissionGranted = useSelector( ( state ) => state.health.cloudPermissionGranted )
  const levelHealth = useSelector( ( state ) => state.health.levelHealth )
  const [ currentBottomSheetKind, setCurrentBottomSheetKind ]: [BottomSheetKind, any] = useState( null )
  const [ bottomSheetState, setBottomSheetState ]: [BottomSheetState, any] = useState( BottomSheetState.Closed )
  const [ cloud ] = useState( Platform.OS == 'ios' ? 'iCloud' : 'Google Drive' )
  const bottomSheetRef = createRef<BottomSheet>()
  const [ isCloudPermissionRender, setIsCloudPermissionRender ] = useState( false )


  useEffect( () => {
    console.log( '@@@-> cloudBackupStatus ', cloudBackupStatus )
    if( cloudBackupStatus === CloudBackupStatus.COMPLETED || cloudBackupStatus === CloudBackupStatus.FAILED ){
      // ( loaderBottomSheet as any ).current.snapTo( 0 )
      setLoaderModal( false )
      props.navigation.navigate( 'HomeNav', {
        walletName,
      } )
    }
  }, [ cloudBackupStatus ] )

  // useEffect( () => {
  //   if( walletSetupCompleted ){
  //     console.log( 'walletSetupCompleted****', walletSetupCompleted )

  //     dispatch( walletCheckIn() )
  //   }
  // }, [ walletSetupCompleted ] )

  useEffect( () => {
    if( levelHealth && levelHealth.length ){
      console.log( '@@@-> levelHealth ', levelHealth )
      console.log( 'healthCheckInitializedKeeper****', levelHealth.length )
      if( cloudPermissionGranted ){
        dispatch( setCloudData() )
      } else{
        // ( loaderBottomSheet as any ).current.snapTo( 0 )
        setLoaderModal( false )
        props.navigation.navigate( 'HomeNav', {
          walletName,
        } ) }
    }
  }, [ levelHealth ] )

  const checkCloudLogin = () =>{

    showLoader()
    requestAnimationFrame( () => {
      const security = {
        questionId: dropdownBoxValue.id,
        question: dropdownBoxValue.question,
        answer,
      }
      //const chosenAccounts = {
      //   REGULAR_ACCOUNT: true, TEST_ACCOUNT: true, SECURE_ACCOUNT: true
      // }
      // dispatch( setupWallet( walletName, security, chosenAccounts ) )
      dispatch( initNewBHRFlow( true ) )
      dispatch( setVersion( 'Current' ) )
      const current = Date.now()
      AsyncStorage.setItem(
        'SecurityAnsTimestamp',
        JSON.stringify( current ),
      )
      const securityQuestionHistory = {
        created: current,
      }
      AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify( securityQuestionHistory ),
      )
    } )
  }

  const showLoader = () => {
    // ( loaderBottomSheet as any ).current.snapTo( 1 )
    setLoaderModal( true )
    setLoaderMessages()
    setTimeout( () => {
      setElevation( 0 )
    }, 0.2 )
    setTimeout( () => {
      setIsLoaderStart( true )
      setIsEditable( false )
      setIsDisabled( true )
    }, 2 )
  }

  const handleSubmit = () => {
    setConfirmAnswer( tempAns )

    if ( answer && confirmAnswer && confirmAnswer != answer ) {
      setAnswerError( 'Answers do not match' )
    } else if (
      validateAllowedCharacters( answer ) == false ||
      validateAllowedCharacters( tempAns ) == false
    ) {
      setAnswerError( 'Answers must only contain lowercase characters (a-z) and digits (0-9)' )
    } else {
      setTimeout( () => {
        setAnswerError( '' )
      }, 2 )
    }
  }

  const handlePswdSubmit = () => {
    setConfirmPswd( tempPswd )

    if ( pswd && confirmPswd && confirmPswd != pswd ) {
      setPswdError( 'Password do not match' )
    } else if (
      validateAllowedCharacters( pswd ) == false ||
      validateAllowedCharacters( tempPswd ) == false
    ) {
      setPswdError( 'Password must only contain lowercase characters (a-z) and digits (0-9)' )
    } else {
      setTimeout( () => {
        setPswdError( '' )
      }, 2 )
    }
  }


  useEffect( () => {
    if ( answer.trim() == confirmAnswer.trim() && answer && confirmAnswer && answerError.length == 0 ) {
      setVisibleButton( true )
    } else {
      setVisibleButton( false )

      if ( answer && confirmAnswer && confirmAnswer != answer ) {
        setAnswerError( 'Answers do not match' )
      } else if (
        validateAllowedCharacters( answer ) == false ||
        validateAllowedCharacters( confirmAnswer ) == false
      ) {
        setAnswerError( 'Answers must only contain lowercase characters (a-z) and digits (0-9)' )
      }
    }
  }, [ confirmAnswer ] )

  useEffect( () => {
    if ( pswd.trim() == confirmPswd.trim() && pswd && confirmPswd && pswdError.length == 0 ) {
      setVisibleButton( true )
    } else {
      setVisibleButton( false )

      if ( pswd && confirmPswd && confirmPswd != pswd ) {
        setPswdError( 'Password do not match' )
      } else if (
        validateAllowedCharacters( pswd ) == false ||
        validateAllowedCharacters( confirmPswd ) == false
      ) {
        setPswdError( 'Password must only contain lowercase characters (a-z) and digits (0-9)' )
      }
    }
  }, [ confirmPswd ] )



  const setButtonVisible = () => {
    return (
      <TouchableOpacity
        onPress={async () => {
          if ( activeIndex === 0 ) {
            checkCloudLogin()
            // setIsCloudPermissionRender( true )
            // openBottomSheet( BottomSheetKind.CLOUD_PERMISSION )
            showSecurityQue( false )
          } else {
            showEncryptionPswd( false )
          }
        }}
        style={{
          ...styles.buttonView, elevation: Elevation
        }}
      >
        {/* {!loading.initializing ? ( */}
        <Text style={styles.buttonText}>Proceed</Text>
        {/* ) : (
          <ActivityIndicator size="small" />
        )} */}
      </TouchableOpacity>
    )
  }

  const setLoaderMessages = () => {
    setTimeout( () => {
      const newMessage = getNextMessage()
      setMessage( newMessage.heading )
      setSubTextMessage( newMessage.text )
      setTimeout( () => {
        const newMessage = getNextMessage()
        setMessage( newMessage.heading )
        setSubTextMessage( newMessage.text )
        setTimeout( () => {
          const newMessage = getNextMessage()
          setMessage( newMessage.heading )
          setSubTextMessage( newMessage.text )
          setTimeout( () => {
            const newMessage = getNextMessage()
            setMessage( newMessage.heading )
            setSubTextMessage( newMessage.text )
            setTimeout( () => {
              const newMessage = getNextMessage()
              setMessage( newMessage.heading )
              setSubTextMessage( newMessage.text )
              setTimeout( () => {
                const newMessage = getNextMessage()
                setMessage( newMessage.heading )
                setSubTextMessage( newMessage.text )
              }, LOADER_MESSAGE_TIME )
            }, LOADER_MESSAGE_TIME )
          }, LOADER_MESSAGE_TIME )
        }, LOADER_MESSAGE_TIME )
      }, LOADER_MESSAGE_TIME )
    }, LOADER_MESSAGE_TIME )
  }

  const renderLoaderModalContent = useCallback( () => {
    return <LoaderModal headerText={message} messageText={subTextMessage} />
  }, [ message, subTextMessage ] )

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

  const confirmAction = () => {
    if ( activeIndex === 0 ) {
      showSecurityQue( true )
      setAnswer( '' )
      setConfirmAnswer( '' )
    } else {
      showEncryptionPswd( true )
      setTempPswd( '' )
      setConfirmPswdMasked( '' )
      setPswd( '' )
      setPswdMasked( '' )
    }
  }

  const renderEncryptionPswd = () => {
    return(
      <ScrollView style={{
        backgroundColor: Colors.white,
        height: '63%'

      }}>
        <View style={{
          flex: 1
        }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {showSecurityQue( false ); showEncryptionPswd( false )}}
            style={{
              width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
              alignSelf: 'flex-end',
              backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
              marginTop: wp( 3 ), marginRight: wp( 3 )
            }}
          >
            <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
            }} />
          </TouchableOpacity>
          <Text style={{
            // marginBottom: wp( '%' ),
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.FiraSansRegular,
            marginLeft: wp( '6%' )
          }} >Use your own{'\n'}encryption password</Text>
          <View
            style={{
              ...answerInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: answerError ? Colors.red : Colors.borderColor,
              marginTop: 20
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              placeholder={'Enter your password'}
              placeholderTextColor={Colors.borderColor}
              value={hideShowPswd ? pswdMasked : pswd}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              autoCapitalize="none"
              onSubmitEditing={() =>
                ( confirmPswdTextInput as any ).current.focus()
              }
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
              onChangeText={( text ) => {
                setPswd( text )
                setPswdMasked( text )
              }}
              onFocus={() => {
                setShowNote( false )
                setDropdownBoxOpenClose( false )
                setPswdInputStyle( styles.inputBoxFocused )
                if ( pswd.length > 0 ) {
                  setPswd( '' )
                  setPswdMasked( '' )
                }
              }}
              onBlur={() => {
                setShowNote( true )
                setPswdInputStyle( styles.inputBox )
                setDropdownBoxOpenClose( false )
                let temp = ''
                for ( let i = 0; i < pswd.length; i++ ) {
                  temp += '*'
                }
                setPswdMasked( temp )
                handlePswdSubmit()
              }}
            />
            {pswd ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowPswd( !hideShowPswd )
                }}
              >
                <Feather
                  style={{
                    marginLeft: 'auto', padding: 10
                  }}
                  size={15}
                  color={Colors.blue}
                  name={hideShowPswd ? 'eye-off' : 'eye'}
                />
              </TouchableWithoutFeedback>
            ) : null}
          </View>
          <View
            style={{
              ...answerInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: pswdError ? Colors.red : Colors.borderColor,
              marginVertical: 20
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              ref={confirmPswdTextInput}
              placeholder={'Confirm your password'}
              placeholderTextColor={Colors.borderColor}
              value={hideShowConfirmPswd ? confirmPswdMasked : tempPswd}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              autoCapitalize="none"
              onSubmitEditing={handlePswdSubmit}
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
              onChangeText={( text ) => {
                setTempPswd( text )
                setConfirmPswdMasked( text )
              }}
              onFocus={() => {
                setShowNote( false )
                setDropdownBoxOpenClose( false )
                setConfirmPswdInputStyle( styles.inputBoxFocused )
                if ( tempPswd.length > 0 ) {
                  // setTempPswd( '' )
                  // setPswdMasked( '' )
                  setTempPswd( '' )
                  setPswdError( '' )
                  setConfirmPswd( '' )
                  setConfirmPswdMasked( '' )
                }
              }}
              onBlur={() => {
                setShowNote( true )
                setConfirmPswdInputStyle( styles.inputBox )
                setDropdownBoxOpenClose( false )
                let temp = ''
                for ( let i = 0; i < tempPswd.length; i++ ) {
                  temp += '*'
                }
                setConfirmPswdMasked( temp )
                handlePswdSubmit()
              }}
            />
            {tempPswd ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowConfirmPswd( !hideShowConfirmAnswer )
                  setDropdownBoxOpenClose( false )
                }}
              >
                <Feather
                  style={{
                    marginLeft: 'auto', padding: 10
                  }}
                  size={15}
                  color={Colors.blue}
                  name={hideShowConfirmPswd ? 'eye-off' : 'eye'}
                />
              </TouchableWithoutFeedback>
            ) : null}
          </View>

          {/* {pswdError.length == 0 && (
            <Text style={styles.helpText}>
              Password must only contain lowercase characters (a-z) and digits (0-9).
            </Text>
          )} */}
        </View>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            flexDirection: 'row',
          }}
        >
          <Text
            style={{
              color: Colors.red,
              fontFamily: Fonts.FiraSansMediumItalic,
              fontSize: RFValue( 10 ),
              marginLeft: 'auto',
            }}
          >
            {pswdError}
          </Text>
        </View>
        {showNote ? <View style={{
          ...styles.bottomButtonView,
        }}>
          {(
            pswd.trim() === confirmPswd.trim() &&
            confirmPswd.trim() &&
            pswd.trim() && pswdError.length === 0
          ) && (
            setButtonVisible()
          ) || null}
          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
          </View>
        </View> : null}
      </ScrollView>
    )
  }
  const renderSecurityQuestion = () => {
    return (
      <ScrollView style={{
        backgroundColor: Colors.white,
        height: '63%'

      }}>
        <View style={{
          flex: 1
        }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {showSecurityQue( false ); showEncryptionPswd( false )}}
            style={{
              width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
              alignSelf: 'flex-end',
              backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
              marginTop: wp( 3 ), marginRight: wp( 3 )
            }}
          >
            <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
            }} />
          </TouchableOpacity>
          <Text style={{
            // marginBottom: wp( '%' ),
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.FiraSansRegular,
            marginLeft: wp( '6%' )
          }} >Use answer to{'\n'}a Security Question</Text>
          <TouchableOpacity
            activeOpacity={10}
            style={
              dropdownBoxOpenClose
                ? styles.dropdownBoxOpened
                : styles.dropdownBox
            }
            onPress={() => {
              setDropdownBoxOpenClose( !dropdownBoxOpenClose )
            }}
            disabled={isDisabled}
          >
            <Text style={styles.dropdownBoxText}>
              {dropdownBoxValue.question
                ? dropdownBoxValue.question
                : 'Select Question'}
            </Text>
            <Ionicons
              style={{
                marginLeft: 'auto'
              }}
              name={
                dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'
              }
              size={20}
              color={Colors.textColorGrey}
            />
          </TouchableOpacity>
          {dropdownBoxOpenClose ? (
            <View style={styles.dropdownBoxModal}>
              <ScrollView
                nestedScrollEnabled={true}
                style={{
                  height: hp( '40%' )
                }}
              >
                {dropdownBoxList.map( ( value, index ) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setTimeout( () => {
                        setDropdownBoxValue( value )
                        setDropdownBoxOpenClose( false )
                      }, 70 )
                    }}
                    style={{
                      ...styles.dropdownBoxModalElementView,
                      borderTopLeftRadius: index == 0 ? 10 : 0,
                      borderTopRightRadius: index == 0 ? 10 : 0,
                      borderBottomLeftRadius:
                    index == dropdownBoxList.length - 1 ? 10 : 0,
                      borderBottomRightRadius:
                    index == dropdownBoxList.length - 1 ? 10 : 0,
                      paddingTop: index == 0 ? 5 : 0,
                      backgroundColor: dropdownBoxValue
                        ? dropdownBoxValue.id == value.id
                          ? Colors.lightBlue
                          : Colors.white
                        : Colors.white,
                    }}
                  >
                    <Text
                      style={{
                        color:
                      dropdownBoxValue.id == value.id
                        ? Colors.blue
                        : Colors.black,
                        fontFamily: Fonts.FiraSansRegular,
                        fontSize: RFValue( 12 ),
                      }}
                    >
                      {value.question}
                    </Text>
                  </TouchableOpacity>
                ) )}
              </ScrollView>
            </View>
          ) : null}
          {dropdownBoxValue.id ? (
            <View style={{
              marginTop: 15
            }}>
              <View
                style={{
                  ...answerInputStyle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 15,
                  borderColor: answerError ? Colors.red : Colors.borderColor,
                }}
              >
                <TextInput
                  style={styles.modalInputBox}
                  placeholder={'Enter your answer'}
                  placeholderTextColor={Colors.borderColor}
                  value={hideShowAnswer ? answerMasked : answer}
                  autoCompleteType="off"
                  textContentType="none"
                  returnKeyType="next"
                  autoCorrect={false}
                  editable={isEditable}
                  autoCapitalize="none"
                  onSubmitEditing={() =>
                    ( confirmAnswerTextInput as any ).current.focus()
                  }
                  keyboardType={
                    Platform.OS == 'ios'
                      ? 'ascii-capable'
                      : 'visible-password'
                  }
                  onChangeText={( text ) => {
                    setAnswer( text )
                    setAnswerMasked( text )
                  }}
                  onFocus={() => {
                    setShowNote( false )
                    setDropdownBoxOpenClose( false )
                    setAnswerInputStyle( styles.inputBoxFocused )
                    if ( answer.length > 0 ) {
                      setAnswer( '' )
                      setAnswerMasked( '' )
                    }
                  }}
                  onBlur={() => {
                    setShowNote( true )
                    setAnswerInputStyle( styles.inputBox )
                    setDropdownBoxOpenClose( false )
                    let temp = ''
                    for ( let i = 0; i < answer.length; i++ ) {
                      temp += '*'
                    }
                    setAnswerMasked( temp )
                    handleSubmit()
                  }}
                />
                {answer ? (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      setHdeShowAnswer( !hideShowAnswer )
                    }}
                  >
                    <Feather
                      style={{
                        marginLeft: 'auto', padding: 10
                      }}
                      size={15}
                      color={Colors.blue}
                      name={hideShowAnswer ? 'eye-off' : 'eye'}
                    />
                  </TouchableWithoutFeedback>
                ) : null}
              </View>
              <View
                style={{
                  ...confirmInputStyle,
                  marginBottom: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 15,
                  marginTop: 15,
                  borderColor: answerError ? Colors.red : Colors.borderColor,
                }}
              >
                <TextInput
                  style={styles.modalInputBox}
                  ref={confirmAnswerTextInput}
                  placeholder={'Confirm your answer'}
                  placeholderTextColor={Colors.borderColor}
                  value={
                    hideShowConfirmAnswer ? confirmAnswerMasked : tempAns
                  }
                  keyboardType={
                    Platform.OS == 'ios'
                      ? 'ascii-capable'
                      : 'visible-password'
                  }
                  returnKeyType="done"
                  returnKeyLabel="Done"
                  autoCompleteType="off"
                  autoCorrect={false}
                  editable={isEditable}
                  autoCapitalize="none"
                  onChangeText={( text ) => {
                    setTempAns( text )
                    setConfirmAnswerMasked( text )
                  }}
                  onSubmitEditing={handleSubmit}
                  onFocus={() => {
                    setShowNote( false )
                    setDropdownBoxOpenClose( false )
                    setConfirmAnswerInputStyle( styles.inputBoxFocused )
                    if ( tempAns.length > 0 ) {
                      setTempAns( '' )
                      setAnswerError( '' )
                      setConfirmAnswer( '' )
                      setConfirmAnswerMasked( '' )
                    }
                  }}
                  onBlur={() => {
                    setShowNote( true )
                    setConfirmAnswerInputStyle( styles.inputBox )
                    setDropdownBoxOpenClose( false )
                    let temp = ''
                    for ( let i = 0; i < tempAns.length; i++ ) {
                      temp += '*'
                    }
                    setConfirmAnswerMasked( temp )
                    handleSubmit()
                  }}
                />
                {tempAns ? (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      setHideShowConfirmAnswer( !hideShowConfirmAnswer )
                      setDropdownBoxOpenClose( false )
                    }}
                  >
                    <Feather
                      style={{
                        marginLeft: 'auto', padding: 10
                      }}
                      size={15}
                      color={Colors.blue}
                      name={hideShowConfirmAnswer ? 'eye-off' : 'eye'}
                    />
                  </TouchableWithoutFeedback>
                ) : null}
              </View>

              {answerError.length == 0 && (
                <Text style={styles.helpText}>
              Answers must only contain lowercase characters (a-z) and digits (0-9).
                </Text>
              )}
            </View>
          ) : (
            <View style={{
              marginTop: 15
            }} />
          )}
          <View
            style={{
              marginLeft: 20,
              marginRight: 20,
              flexDirection: 'row',
            }}
          >
            <Text
              style={{
                color: Colors.red,
                fontFamily: Fonts.FiraSansMediumItalic,
                fontSize: RFValue( 10 ),
                marginLeft: 'auto',
              }}
            >
              {answerError}
            </Text>
          </View>

          {/* <TouchableOpacity
            style={{
              flexDirection: 'row',
              marginLeft: 25,
              marginRight: 25,
              paddingBottom: 10,
              paddingTop: 10,
            }}
            onPress={() =>
              props.navigation.navigate( 'NewOwnQuestions', {
                walletName,
              } )
            }
          >
            <Text
              style={{
                fontFamily: Fonts.FiraSansMediumItalic,
                fontWeight: 'bold',
                fontStyle: 'italic',
                fontSize: RFValue( 12 ),
                color: Colors.blue,
              }}
              onPress={() =>
                props.navigation.navigate( 'NewOwnQuestions', {
                  walletName,
                } )
              }
            >
        Or choose your own question
            </Text>
          </TouchableOpacity> */}
        </View>
        {showNote ? <View style={{
          ...styles.bottomButtonView,
        }}>
          {(
            answer.trim() === confirmAnswer.trim() &&
            confirmAnswer.trim() &&
            answer.trim() && answerError.length === 0
          ) && (
            setButtonVisible()
          ) || null}
          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
          </View>
        </View> : null}
      </ScrollView>
    )
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

  const renderBottomSheetContent = () =>{

    switch ( currentBottomSheetKind ) {
        case BottomSheetKind.CLOUD_PERMISSION:
          return (
            <CloudPermissionModalContents
              title={'Automated Cloud Backup'}
              info={'This is the first level of security of your wallet and we encourage you to proceed with this step while setting up the wallet'}
              note={''}
              onPressProceed={( flag )=>{
                closeBottomSheet()
                console.log( 'updateCloudPermission', flag )
                dispatch( updateCloudPermission( flag ) )
                props.navigation.navigate( 'NewWalletQuestion', {
                  walletName,
                } )
              }}
              onPressIgnore={( flag )=> {
                closeBottomSheet()
                console.log( 'updateCloudPermission', flag )
                dispatch( updateCloudPermission( flag ) )
                props.navigation.navigate( 'NewWalletQuestion', {
                  walletName,
                } )
              }}
              autoClose={()=>{
                closeBottomSheet()
                console.log( 'updateCloudPermission', true )
                dispatch( updateCloudPermission( true ) )
                props.navigation.navigate( 'NewWalletQuestion', {
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

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.backgroundColor1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SafeAreaView style={{
        flex: 0
      }} />

      <ScrollView>
        <View style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor1
        }}>
          <View style={[ CommonStyles.headerContainer, {
            backgroundColor: Colors.backgroundColor1
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
                  color={Colors.blue}
                  size={17}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={10}
            style={{
              flex: 1
            }}
            onPress={() => {
              setDropdownBoxOpenClose( false )
              Keyboard.dismiss()
            }}
            disabled={isDisabled}
          >
            <HeaderTitle
              firstLineTitle={'Step 3'}
              secondLineTitle={'Create initial cloud backup'}
              infoTextNormal={'New Wallet creation'}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            <TouchableOpacity
              onPress={() => setActiveIndex( 0 )}
              style={{
                width: '90%', height: hp( '12%' ), backgroundColor: activeIndex === 0 ?  Colors.lightBlue: Colors.white,
                alignSelf: 'center', justifyContent: 'center',
                borderRadius: wp( '4' ),
                marginVertical: hp( '3%' )
              }}>
              <View style={{
                flexDirection:'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: wp( '4%' )
              }}>
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  borderWidth: 0.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {activeIndex === 0 &&
                    <Image
                      style={{
                        width: '100%', height: '100%'
                      }}
                      source={require( '../assets/images/icons/checkmark.png' )}
                    />
                  }
                </View>
                <View >
                  <Text style={{
                    fontSize: RFValue( 13 ), fontFamily: activeIndex === 0 ? Fonts.FiraSansMedium : Fonts.FiraSansRegular, color: activeIndex === 0 ? Colors.white : Colors.blue
                  }}>
                    Use answer to a Security Question
                  </Text>
                  <Text style={{
                    fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: activeIndex === 0 ? Colors.white : Colors.textColorGrey
                  }}>
                    Use answer to a Security Question
                  </Text>
                </View>
              </View>
              {/* {isSelected && ( */}


              {/* )} */}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveIndex( 1 )}
              style={{
                width: '90%', height: hp( '12%' ), backgroundColor: activeIndex === 1 ? Colors.lightBlue : Colors.white,
                alignSelf: 'center', justifyContent: 'center',
                borderRadius: wp( '4' ),
                // marginVertical: hp( '3%' )
              }}>
              <View style={{
                flexDirection:'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: wp( '5%' )
              }}>
                <View style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  borderWidth: 0.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {activeIndex === 1 &&
                    <Image
                      style={{
                        width: '100%', height: '100%'
                      }}
                      source={require( '../assets/images/icons/checkmark.png' )}
                    />
                  }
                </View>
                <View >
                  <Text style={{
                    fontSize: RFValue( 13 ), fontFamily: activeIndex === 1 ? Fonts.FiraSansMedium : Fonts.FiraSansRegular, color:  activeIndex === 1 ? Colors.white : Colors.blue
                  }}>
                    Use your own encryption password
                  </Text>
                  <Text style={{
                    fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: activeIndex === 1 ? Colors.white : Colors.textColorGrey
                  }}>
                    Need text to be replaced
                  </Text>
                </View>
              </View>
              {/* {isSelected && ( */}


              {/* )} */}
            </TouchableOpacity>


          </TouchableOpacity>

        </View>
      </ScrollView>


      {showNote && !visibleButton ? (
        <View
          style={{
            marginBottom:
                Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp( '1%' ) : 0,
          }}
        >
          <BottomInfoBox
            title={'Note'}
            infoText={'Initial wallet backup is essential for security This can be changed later from the '}
            italicText={'Security Centre'}
          />
        </View>
      ) : null}
      <View style={{
        alignItems: 'center', marginLeft: wp( '9%' ), marginBottom: hp( '9%' ),
        flexDirection: 'row'
      }}>
        <ButtonBlue
          buttonText="Confirm & Proceed"
          handleButtonPress={confirmAction}
          buttonDisable={false}
        />
        <TouchableOpacity
          onPress={() => {}}

        >
          <Text style={{
            color: Colors.blue,
            fontFamily: Fonts.FiraSansMedium,
            alignSelf: 'center',
            marginLeft: wp( '5%' )
          }}>Skip Backup</Text>
        </TouchableOpacity>
      </View>
      <ModalContainer visible={currentBottomSheetKind != null} closeBottomSheet={() => {}} >
        {renderBottomSheetContent()}
      </ModalContainer>

      <ModalContainer visible={securityQue} closeBottomSheet={() => {showSecurityQue( false ) }} >
        {renderSecurityQuestion()}
      </ModalContainer>
      <ModalContainer visible={encryptionPswd} closeBottomSheet={() => {showEncryptionPswd( false ) }} >
        {renderEncryptionPswd()}
      </ModalContainer>
      <ModalContainer visible={loaderModal} closeBottomSheet={() => {}} >
        {renderLoaderModalContent()}
      </ModalContainer>
      {/* <BottomSheet
        onCloseEnd={() => { }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={loaderBottomSheet}
        snapPoints={[ -50, hp( '100%' ) ]}
        renderContent={renderLoaderModalContent}
        renderHeader={renderLoaderModalHeader}
      /> */}

    </View>
  )
}

const styles = StyleSheet.create( {
  dropdownBox: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
  },
  dropdownBoxOpened: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomButtonView1: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
  },
  modalInputBox: {
    // flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
  },
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    marginRight: 15,
  },
  dropdownBoxModal: {
    borderRadius: 10,
    margin: 15,
    height: 'auto',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 10
    },
    backgroundColor: Colors.white,
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },

  helpText: {
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
    paddingHorizontal: 24,
  }
} )
