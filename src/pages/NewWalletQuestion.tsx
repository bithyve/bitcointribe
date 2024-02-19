import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createRef, useCallback, useContext, useEffect, useState } from 'react'
import {
  Clipboard,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
//import QuestionList from '../common/QuestionList'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Feather from 'react-native-vector-icons/Feather'
import CommonStyles from '../common/Styles/Styles'
import BottomInfoBox from '../components/BottomInfoBox'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch, useSelector } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import zxcvbn from 'zxcvbn'
import CheckMark from '../assets/images/svgs/checkmarktick.svg'
import { LevelHealthInterface } from '../bitcoin/utilities/Interface'
import TrustedContactsOperations from '../bitcoin/utilities/TrustedContactsOperations'
import { LocalizationContext } from '../common/content/LocContext'
import ButtonStyles from '../common/Styles/ButtonStyles'
import HeaderTitle from '../components/HeaderTitle'
import ModalContainer from '../components/home/ModalContainer'
import ModalContainerScroll from '../components/home/ModalContainerScroll'
import WalletInitKnowMore from '../components/know-more-sheets/WalletInitKnowMore'
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

// only admit lowercase letters and digits
const ALLOWED_CHARACTERS_REGEXP = /^[0-9a-z]+$/
let messageIndex = 0
const LOADER_MESSAGE_TIME = 2000
const windowHeight = Dimensions.get( 'window' ).height
function validateAllowedCharacters( answer: string ): boolean {
  return answer == '' || ALLOWED_CHARACTERS_REGEXP.test( answer )
}

export default function NewWalletQuestion( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const common = translations[ 'common' ]//SecurityCenter
  const bhr = translations[ 'bhr' ]
  const QuestionList = strings.questionList
  const loaderMessages = translations[ 'login' ].loaderMessages
  const [ message, setMessage ] = useState( strings.Creatingyourwallet )
  const [ subTextMessage, setSubTextMessage ] = useState( strings.Thismay )
  const [ bottomTextMessage ] = useState( strings.Hexaencrypts )
  const subPoints = [ strings.multi, Platform.OS == 'ios' ? strings.creatingbackup : strings.creatingbackupDrive, strings.preloading ]
  const [ Elevation, setElevation ] = useState( 10 )
  // const [ height, setHeight ] = useState( 72 )
  // const [ isLoaderStart, setIsLoaderStart ] = useState( false )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ dropdownBoxList ] = useState( QuestionList )
  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
    id: '',
    question: '',
  } )
  const [ answerInputStyle, setAnswerInputStyle ] = useState( styles.inputBox )
  const [ hintInputStyle, setHintInputStyle ] = useState( styles.inputBox )
  const [ pswdInputStyle, setPswdInputStyle ] = useState( styles.inputBox )
  const [ confirmInputStyle, setConfirmAnswerInputStyle ] = useState( styles.inputBox )
  const [ confirmPswdInputStyle, setConfirmPswdInputStyle ] = useState( styles.inputBox )
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
  const [ isSkipClicked, setIsSkipClicked ] = useState( false )
  const [ knowMore, setKnowMore ] = useState( false )

  const dispatch = useDispatch()
  const walletName =  props.route.params?.walletName
  const newUser = props.route.params?.newUser

  const [ answerError, setAnswerError ] = useState( '' )
  const [ pswdError, setPswdError ] = useState( '' )
  const [ tempAns, setTempAns ] = useState( '' )
  const [ tempPswd, setTempPswd ] = useState( '' )
  const [ isEditable, setIsEditable ] = useState( true )
  const [ isDisabled, setIsDisabled ] = useState( false )
  // const [ loaderBottomSheet ] = useState( React.createRef() )
  const [ loaderModal, setLoaderModal ] = useState( false )
  const [ signUpStarted, setSignUpStarted ] = useState( false )
  const [ confirmAnswerTextInput ] = useState( React.createRef() )
  const [ confirmPswdTextInput ] = useState( React.createRef() )
  const [ hint ] = useState( React.createRef() )
  const [ hintText, setHint ] = useState( '' )
  const [ visibleButton, setVisibleButton ] = useState( false )
  const [ showNote, setShowNote ] = useState( true )
  const [ securityQue, showSecurityQue ] = useState( false )
  const [ showAGSPmodal, setShowAGSPmodal ] = useState( false )
  const [ appGeneratedPassword ] = useState(
    TrustedContactsOperations.generateKey( 18 )
      .match( /.{1,6}/g )
      .join( '-' )
  )

  const [ copied, setCopied ] = useState( false )
  const [ encryptionPswd, showEncryptionPswd ] = useState( false )
  const [ activeIndex, setActiveIndex ] = useState( 0 )
  const [ passwordScore, setpasswordScore ] = useState( 0 )
  const accounts = useSelector( ( state: { accounts: any } ) => state.accounts )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus )
  const walletSetupCompleted = useSelector( ( state ) => state.setupAndAuth.walletSetupCompleted )
  const cloudPermissionGranted = useSelector( ( state ) => state.bhr.cloudPermissionGranted )
  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const updateWIStatus: boolean = useSelector( ( state ) => state.bhr.loading.updateWIStatus )
  const [ currentBottomSheetKind, setCurrentBottomSheetKind ]: [BottomSheetKind, any] = useState( null )
  const [ bottomSheetState, setBottomSheetState ]: [BottomSheetState, any] = useState( BottomSheetState.Closed )
  const [ cloud ] = useState( Platform.OS == 'ios' ? 'iCloud' : 'Google Drive' )
  const bottomSheetRef = createRef<BottomSheet>()
  const [ isCloudPermissionRender, setIsCloudPermissionRender ] = useState( false )
  const [ knowMoreIndex, setKnowMoreIndex ] = useState( 0 )
  const [ backup, setBackup ] = useState( true )
  const [ selectedOption, setSelectedOption ] = useState( 0 )

  const windowHeight = Dimensions.get( 'window' ).height
  const getNextMessage = () => {
    if ( messageIndex == loaderMessages.length ) messageIndex = 0
    return loaderMessages[ messageIndex++ ]
  }

  useEffect( () => {
    if ( walletSetupCompleted ) {
      setSignUpStarted( false )
      setLoaderModal( false )
      props.navigation.navigate( 'App', {
        walletName,
      } )
    }
  }, [ walletSetupCompleted, cloudBackupStatus ] )

  const checkCloudLogin = ( security ) => {
    requestAnimationFrame( () => {
      dispatch( setupWallet( walletName, security, newUser ) )
      // dispatch( walletSetupCompletion( security ) )
      dispatch( initNewBHRFlow( true ) )
      dispatch( setVersion( 'Current' ) )

      const current = Date.now()
      AsyncStorage.setItem( 'SecurityAnsTimestamp', JSON.stringify( current ) )
      const securityQuestionHistory = {
        created: current,
      }
      AsyncStorage.setItem( 'securityQuestionHistory', JSON.stringify( securityQuestionHistory ) )
    } )
  }

  const showLoader = () => {
    // ( loaderBottomSheet as any ).current.snapTo( 1 )
    setLoaderModal( true )
    // setLoaderMessages()
    setTimeout( () => {
      setElevation( 0 )
    }, 0.2 )
    setTimeout( () => {
      // setIsLoaderStart( true )
      setIsEditable( false )
      setIsDisabled( true )
    }, 2 )
  }

  const handleSubmit = () => {
    setConfirmAnswer( tempAns )

    if ( answer && confirmAnswer && confirmAnswer != answer ) {
      setAnswerError( strings.Answersdonotmatch )
    }
    if ( securityQue ) {
      if ( validateAllowedCharacters( answer ) == false || validateAllowedCharacters( tempAns ) == false ) {
        setAnswerError( strings.Answersmust )
      }
    } else {
      setTimeout( () => {
        setAnswerError( '' )
      }, 2 )
    }
  }

  const handlePswdSubmit = () => {
    setConfirmPswd( tempPswd )

    if ( pswd && confirmPswd && confirmPswd != pswd ) {
      setPswdError( strings.Passworddonotmatch )
    }
    // else if (
    //   validateAllowedCharacters( pswd ) == false ||
    //   validateAllowedCharacters( tempPswd ) == false
    // ) {
    //   setPswdError( strings.Passwordmust )
    // } else {
    //   // setTimeout( () => {
    //   //   setPswdError( '' )
    //   // }, 2 )
    // }
  }

  useEffect( () => {
    if ( answer.trim() == confirmAnswer.trim() && answer && confirmAnswer && answerError.length == 0 ) {
      setVisibleButton( true )
    } else {
      setVisibleButton( false )

      if ( answer && confirmAnswer && confirmAnswer != answer ) {
        setAnswerError( strings.Answersdonotmatch )
      }

      // else if (
      //   validateAllowedCharacters( answer ) == false ||
      //   validateAllowedCharacters( confirmAnswer ) == false
      // ) {
      //   setAnswerError( strings.Answersmust )
      // }
    }
  }, [ confirmAnswer ] )

  useEffect( () => {
    if ( pswd.trim() == confirmPswd.trim() && pswd && confirmPswd && pswdError.length == 0 ) {
      setVisibleButton( true )
    } else {
      setVisibleButton( false )

      if ( pswd && confirmPswd && confirmPswd != pswd ) {
        setPswdError( strings.Passworddonotmatch )
      }
      // else if (
      //   validateAllowedCharacters( pswd ) == false ||
      //   validateAllowedCharacters( confirmPswd ) == false
      // ) {
      //   setPswdError( strings.Passwordmust )
      // }
    }
  }, [ confirmPswd ] )

  const onPressProceed = ( isSkip? ) => {
    let security = null
    if ( selectedOption == 1 ){
      if( passwordScore < 2 ){
        setPswdError( 'Weak password. Try using longer passwords with a mix of lowercase, upper case, numbers and characters' )
        return
      }
      security = {
        questionId: '0',
        question: hintText,
        answer: pswd,
      }
    }else if( selectedOption == 2 ){
      security = {
        questionId: '100', //for AGSP
        question: 'App generated password',
        answer: appGeneratedPassword,
      }
    }
    // if ( activeIndex === 0 ) {
    //   security = {
    //     questionId: '100', //for AGSP
    //     question: 'App generated password',
    //     answer: appGeneratedPassword,
    //   }
    // } else if ( activeIndex === 1 ) {
    //   security = {
    //     questionId: dropdownBoxValue.id,
    //     question: dropdownBoxValue.question,
    //     answer,
    //   }
    // } else if ( activeIndex === 2 ) {
    //   if( passwordScore < 2 ){
    //     setPswdError( 'Weak password. Try using longer passwords with a mix of lowercase, upper case, numbers and characters' )
    //     return
    //   }
    //   security = {
    //     questionId: '0',
    //     question: hintText,
    //     answer: pswd,
    //   }
    // }
    setSignUpStarted( true )
    showLoader()
    setShowAGSPmodal( false )
    if ( !backup ) {
      security = null
      dispatch( updateCloudPermission( false ) )
    } else dispatch( updateCloudPermission( true ) )
    checkCloudLogin( security )
    showSecurityQue( false )
    showEncryptionPswd( false )
  }

  const setButtonVisible = () => {
    return (
      <TouchableOpacity
        onPress={() => onPressProceed()}
        style={{
          ...styles.buttonView,
          elevation: Elevation,
        }}
      >
        {/* {!loading.initializing ? ( */}
        <Text style={styles.buttonText}>{common.proceed}</Text>
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
    return <LoaderModal headerText={message} messageText={subTextMessage} subPoints={subPoints} bottomText={bottomTextMessage} />
  }, [ message, subTextMessage, loaderModal ] )

  const confirmAction = ( index ) => {
    setActiveIndex( index )
    dispatch( updateCloudPermission( true ) )
    if ( index === 0 ) {
      setShowAGSPmodal( true )
      showSecurityQue( false )
      setAnswer( '' )
    } else if ( index === 1 ) {
      showSecurityQue( true )
      setAnswer( '' )
      setConfirmAnswer( '' )
    } else if ( index === 2 ) {
      showEncryptionPswd( true )
      setTempPswd( '' )
      setConfirmPswdMasked( '' )
      setPswd( '' )
      setPswdMasked( '' )
    }
  }

  const renderAGSP = () => {
    return (
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0,
          y: 0,
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View
          style={{
            height: hp( windowHeight >= 800 ? ( Platform.OS== 'ios' ? '56%' : '65%' ) : windowHeight >= 600 ? '66%' :  windowHeight >= 500 && '71%' ),
            marginHorizontal: wp( 6 ),
          }}
        >
          <View style={{
            paddingTop: 10, paddingBottom: 4
          }}>
            <TouchableOpacity
              onPress={() => {
                setKnowMoreIndex( 1 )
                setShowAGSPmodal( false )
                setKnowMore( true )
              }}
              style={{
                ...styles.selectedContactsView,
                alignSelf: 'flex-end',
              }}
            >
              <Text style={styles.contactText}>{common[ 'knowMore' ]}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginHorizontal: wp( '2%' ),
              paddingTop: 5,
            }}
          >
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue( 18 ),
                fontFamily: Fonts.Regular,
              }}
            >
              {strings.HexaWalletcreated}
            </Text>
            <Text
              style={[
                styles.bottomNoteInfoText,
                {
                  color: Colors.lightTextColor,
                  marginTop: 10,
                  paddingRight: 15,
                },
              ]}
            >
              {strings.Makesureyou}
            </Text>

            <TouchableOpacity
              onPress={() => {
                Clipboard.setString( appGeneratedPassword )
                setCopied( true )
                setTimeout( () => {
                  setCopied( false )
                }, 1500 )
              }}
              style={styles.containerPasscode}
            >
              <Text numberOfLines={1} style={styles.textPasscode}>
                {appGeneratedPassword}
              </Text>
              <View
                style={{
                  width: wp( '12%' ),
                  height: wp( '12%' ),
                  backgroundColor: Colors.borderColor,
                  borderTopRightRadius: wp( 3 ),
                  borderBottomRightRadius: wp( 3 ),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  style={{
                    width: 18,
                    height: 20,
                  }}
                  source={require( '../assets/images/icons/icon-copy.png' )}
                />
              </View>
            </TouchableOpacity>
            {copied && (
              <Text
                style={{
                  textAlign: 'center',
                  color: Colors.lightTextColor,
                  marginBottom: 10,
                }}
              >
                Copied to clipboard
              </Text>
            )}
            <Text
              style={[
                styles.bottomNoteInfoText,
                {
                  marginTop: 10,
                  color: Colors.blue,
                },
              ]}
            >
              {common.note}
            </Text>
            <Text style={[ styles.bottomNoteInfoText, {
            } ]}>{strings.Itmayalso}</Text>
          </View>

          <View
            style={{
              alignItems: 'center',
              marginLeft: wp( '2%' ),
              marginBottom: hp( '4%' ),
              flexDirection: 'row',
              marginTop: hp( 5 ),
            }}
          >
            <TouchableOpacity
              onPress={() => {
                onPressProceed()
              }}
              style={ButtonStyles.primaryActionButtonShadow}
            >
              <Text
                style={{
                  fontSize: RFValue( 13 ),
                  color: Colors.white,
                  fontFamily: Fonts.Medium,
                  alignSelf: 'center',
                }}
              >{`${strings.UseStrongPasscode}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                showSecurityQue( false )
                showEncryptionPswd( false )
                setShowAGSPmodal( false )
                setAnswerError( '' )
              }}
            >
              <Text
                style={{
                  fontSize: RFValue( 13 ),
                  color: Colors.blue,
                  fontFamily: Fonts.Medium,
                  alignSelf: 'center',
                  marginLeft: wp( '7%' ),
                }}
              >{`${common.cancel}`}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    )
  }

  const getPasswordLevel = () => {
    if( pswd ==appGeneratedPassword ){
      return 'Strong Password'
    }
    if ( passwordScore < 2 ) {
      return 'Weak Password'
    } else if( passwordScore < 4 ) {
      return 'Could be stronger'
    }
    return 'Strong Password'
  }

  const renderEncryptionPswd = () => {
    return (
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0,
          y: 0,
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View
          style={{
            height: hp( '72%' ),
            paddingHorizontal: 8,
            paddingTop: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setKnowMoreIndex( 2 )
              showEncryptionPswd( false )
              setKnowMore( true )
            }}
            style={{
              ...styles.selectedContactsView,
              alignSelf: 'flex-end',
              marginRight: 15,
            }}
          >
            <Text style={styles.contactText}>{common[ 'knowMore' ]}</Text>
          </TouchableOpacity>
          <Text
            style={{
              // marginBottom: wp( '%' ),
              color: Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.Regular,
              marginLeft: wp( '8%' ),
            }}
          >
            {strings.encryptionpassword}
          </Text>
          <View
            style={{
              ...pswdInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: pswdError ? Colors.red : Colors.white,
              marginTop: 10,
              backgroundColor: Colors.white,
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              placeholder={strings.Enteryourpassword}
              placeholderTextColor={Colors.borderColor}
              value={pswd}
              autoCompleteType="password"
              textContentType="password"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={() => ( confirmPswdTextInput as any ).current.focus()}
              //keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
              onChangeText={( text ) => {
                setPswd( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                setPswdMasked( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                setPswdError( '' )
                setpasswordScore( zxcvbn( text ).score )
              }}
              onFocus={() => {
                setShowNote( false )
                setDropdownBoxOpenClose( false )
                setPswdInputStyle( styles.inputBoxFocused )
                if ( pswd.length > 0 ) {
                  setPswd( '' )
                  setPswdMasked( '' )
                  setPswdError( '' )
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
                <Text
                  style={{
                    color: passwordScore > 3 ? Colors.green : passwordScore > 1 ? Colors.coral: Colors.red,
                    fontFamily: Fonts.Italic,
                    fontSize: RFValue( 11 ),
                    marginLeft: 4,
                  }}
                >{getPasswordLevel()}</Text>
              </TouchableWithoutFeedback>
            ) : null}
          </View>
          <View
            style={{
              ...confirmPswdInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: pswdError ? Colors.red : Colors.white,
              marginTop: 10,
              backgroundColor: Colors.white,
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              ref={confirmPswdTextInput}
              placeholder={strings.Confirmyourpassword}
              placeholderTextColor={Colors.borderColor}
              value={hideShowConfirmPswd ? confirmPswdMasked : tempPswd}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              autoCapitalize="none"
              onSubmitEditing={() => {
                handlePswdSubmit();
                ( hint as any ).current.focus()
              }}
              keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
              onChangeText={( text ) => {
                setTempPswd( text )
                setConfirmPswdMasked( text )
                // setPswdError( '' )
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
                  setHideShowConfirmPswd( !hideShowConfirmPswd )
                  setDropdownBoxOpenClose( false )
                }}
              >
                <Feather
                  style={{
                    marginLeft: 'auto',
                    padding: 10,
                  }}
                  size={15}
                  color={Colors.blue}
                  name={hideShowConfirmPswd ? 'eye-off' : 'eye'}
                />
              </TouchableWithoutFeedback>
            ) : null}
          </View>
          <View
            style={{
              ...hintInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: Colors.backgroundColor1,
              marginVertical: 10,
              backgroundColor: Colors.white,
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              ref={hint}
              placeholder={strings.Addhint}
              placeholderTextColor={Colors.borderColor}
              value={hintText}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              autoCapitalize="none"
              keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
              onChangeText={( text ) => {
                setHint( text )
              }}
              onFocus={() => {
                setShowNote( false )
                setHintInputStyle( styles.inputBoxFocused )
              }}
              onBlur={() => {
                setShowNote( true )
                setHintInputStyle( styles.inputBox )
              }}
            />
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
                fontFamily: Fonts.MediumItalic,
                fontSize: RFValue( 10 ),
                marginLeft: 'auto',
              }}
            >
              {pswdError}
            </Text>
          </View>
          {showNote ? (
            <View
              style={{
                ...styles.bottomButtonView,
              }}
            >
              {( pswd.trim() === confirmPswd.trim() && confirmPswd.trim() && pswd.trim() && pswdError.length === 0 && hintText.length > 0 && setButtonVisible() ) || null}
            </View>
          ) : null}
          {showNote && (
            <View
              style={{
                marginTop: showNote ? hp( '0%' ) : hp( '2%' ),
                marginBottom: hp( 1 ),
              }}
            >
              {pswd.length === 0 && confirmPswd.length === 0 && <BottomInfoBox title={common.note} infoText={strings.Youcanuse} italicText={''} backgroundColor={Colors.white} />}
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    )
  }

  const renderSecurityQuestion = () => {
    return (
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0,
          y: 0,
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.bgColor,
          // height: `${height}%`
        }}
      >
        <View
          style={{
            height: hp( '72%' ),
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              showSecurityQue( false )
              showEncryptionPswd( false )
              setAnswerError( '' )
            }}
            style={{
              width: wp( 7 ),
              height: wp( 7 ),
              borderRadius: wp( 7 / 2 ),
              alignSelf: 'flex-end',
              backgroundColor: Colors.lightBlue,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: wp( 3 ),
              marginRight: wp( 3 ),
            }}
          >
            <FontAwesome
              name="close"
              color={Colors.white}
              size={19}
              style={
                {
                  // marginTop: hp( 0.5 )
                }
              }
            />
          </TouchableOpacity>
          <Text
            style={{
              // marginBottom: wp( '%' ),
              color: Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.Regular,
              marginLeft: wp( '6%' ),
            }}
          >
            {strings.AnswerSecurityQuestion}
          </Text>
          <TouchableOpacity
            activeOpacity={10}
            style={dropdownBoxOpenClose ? styles.dropdownBoxOpened : styles.dropdownBox}
            onPress={() => {
              setDropdownBoxOpenClose( !dropdownBoxOpenClose )
            }}
            disabled={isDisabled}
          >
            <Text style={styles.dropdownBoxText}>{dropdownBoxValue.question ? dropdownBoxValue.question : strings.SelectQuestion}</Text>
            <Ionicons
              style={{
                marginLeft: 'auto',
              }}
              name={dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'}
              size={20}
              color={Colors.textColorGrey}
            />
          </TouchableOpacity>
          {dropdownBoxOpenClose ? (
            <View style={styles.dropdownBoxModal}>
              <ScrollView
                nestedScrollEnabled={true}
                style={{
                  height: hp( '40%' ),
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
                      borderBottomLeftRadius: index == dropdownBoxList.length - 1 ? 10 : 0,
                      borderBottomRightRadius: index == dropdownBoxList.length - 1 ? 10 : 0,
                      paddingTop: index == 0 ? 5 : 0,
                      backgroundColor: dropdownBoxValue ? ( dropdownBoxValue.id == value.id ? Colors.lightBlue : Colors.white ) : Colors.white,
                    }}
                  >
                    <Text
                      style={{
                        color: dropdownBoxValue.id == value.id ? Colors.blue : Colors.black,
                        fontFamily: Fonts.Regular,
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
            <View
              style={{
                marginTop: 10,
              }}
            >
              <View
                style={{
                  ...answerInputStyle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 15,
                  borderColor: answerError ? Colors.red : Colors.white,
                  backgroundColor: Colors.white,
                }}
              >
                <TextInput
                  style={styles.modalInputBox}
                  placeholder={strings.Enteryouranswer}
                  placeholderTextColor={Colors.borderColor}
                  value={hideShowAnswer ? answerMasked : answer}
                  autoCompleteType="off"
                  textContentType="none"
                  returnKeyType="next"
                  autoCorrect={false}
                  editable={isEditable}
                  autoCapitalize="none"
                  onSubmitEditing={() => ( confirmAnswerTextInput as any ).current.focus()}
                  keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
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
                        marginLeft: 'auto',
                        padding: 10,
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
                  marginTop: 10,
                  borderColor: answerError ? Colors.red : Colors.white,
                  backgroundColor: Colors.white,
                }}
              >
                <TextInput
                  style={styles.modalInputBox}
                  ref={confirmAnswerTextInput}
                  placeholder={strings.Confirmyouranswer}
                  placeholderTextColor={Colors.borderColor}
                  value={hideShowConfirmAnswer ? confirmAnswerMasked : tempAns}
                  keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
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
                        marginLeft: 'auto',
                        padding: 10,
                      }}
                      size={15}
                      color={Colors.blue}
                      name={hideShowConfirmAnswer ? 'eye-off' : 'eye'}
                    />
                  </TouchableWithoutFeedback>
                ) : null}
              </View>

              {answerError.length == 0 && <Text style={styles.helpText}>{strings.Answersmust1}</Text>}
            </View>
          ) : (
            <View
              style={{
                marginTop: 9,
              }}
            />
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
                fontFamily: Fonts.MediumItalic,
                fontSize: RFValue( 10 ),
                marginLeft: 'auto',
              }}
            >
              {answerError}
            </Text>
          </View>

          {showNote ? (
            <View
              style={{
                ...styles.bottomButtonView,
              }}
            >
              {( answer.trim() === confirmAnswer.trim() && confirmAnswer.trim() && answer.trim() && answerError.length === 0 && setButtonVisible() ) || null}
            </View>
          ) : null}
          {showNote && (
            <View
              style={{
                marginTop: showNote ? hp( '0%' ) : hp( '2%' ),
                marginBottom: hp( 1 ),
              }}
            >
              {answer.length === 0 && confirmAnswer.length === 0 && (
                <View
                  style={{
                    marginBottom: 10,
                    padding: 20,
                    backgroundColor: Colors.white,
                    marginLeft: 12,
                    marginRight: 20,
                    borderRadius: 10,
                    flexDirection: 'row',
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: Colors.blue,
                        fontSize: RFValue( 13 ),
                        marginBottom: 2,
                        fontFamily: Fonts.Regular,
                      }}
                    >
                      {strings.note}
                    </Text>
                    <Text style={styles.bottomNoteInfoText}>
                      {strings.TheAnswer}
                      <Text style={styles.boldItalicText}>{` ${strings.encrypt} `}</Text>
                      {strings.backup} {strings.securityQuestion}
                      <Text style={styles.boldItalicText}>{` ${strings.hint} `}</Text>
                      {strings.toremember}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    )
  }

  const openBottomSheet = ( kind: BottomSheetKind, snapIndex: number | null = null ) => {
    setBottomSheetState( BottomSheetState.Open )
    setCurrentBottomSheetKind( kind )

    if ( snapIndex == null ) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.snapTo( snapIndex )
    }
  }

  const onBottomSheetClosed = () => {
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
    console.log( 'onBackground' )
    setLoaderModal( false )
    if ( signUpStarted )
      setTimeout( () => {
        console.log( 'TIMEOUT' )
        setLoaderModal( true )
      }, 100 )
  }

  return (
    <View
      style={{
        flex: 1,
        position:'relative',
        backgroundColor:Colors.backgroundColor
      }}
    >
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SafeAreaView
        style={{
          flex: 0,
        }}
      />
      <View
        style={[
          CommonStyles.headerContainer,
          {
            backgroundColor: Colors.backgroundColor,
            justifyContent: 'space-between',
          },
        ]}
      >
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setKnowMoreIndex( 0 )
            setKnowMore( true )
          }}
          style={{
            ...styles.selectedContactsView,
            height: hp( 3.2 ),
          }}
        >
          <Text style={{
            ...styles.contactText,
            fontSize: RFValue( 12 ),
          }}>{common[ 'knowMore' ]}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{
        flex:1
      }}   behavior={Platform.OS == 'ios' ? 'padding' : ''}
      enabled >
        <View style={styles.keyboardAvoidingContainer}>
          <TouchableOpacity
            activeOpacity={10}
            style={{
              flex: 1,
            }}
            onPress={() => {
              setDropdownBoxOpenClose( false )
              Keyboard.dismiss()
            }}
            disabled={isDisabled}
          >
            <HeaderTitle
              firstLineTitle={strings.Step2}
              secondLineTitle={''}
              secondLineBoldTitle={'Create a Password'}
              infoTextNormal={''}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            {selectedOption == 0 ? <View style={styles.fieldsButtonContainer}>
              <TouchableOpacity onPress={() => setSelectedOption( 1 )} style={styles.passwordButtonContainer}><Text style={styles.enterPassword}>Enter a strong password</Text></TouchableOpacity>
              <View style={styles.orBorderContainer}>
                <Text style={styles.enterPassword}>or</Text>
                <View style={styles.borderContainer}></View>
              </View>
              <TouchableOpacity onPress={() => {setSelectedOption( 2 ), setPswd( appGeneratedPassword )}} style={styles.passwordButtonContainer}><Text style={styles.enterPassword}>Generate a strong password for me</Text></TouchableOpacity>
            </View>:
              <>
                <View style={styles.fieldsButtonErrorContainer}>
                  <TextInput
                    style={styles.modalInputBoxError}
                    placeholder={'Enter a Strong Password'}
                    placeholderTextColor={Colors.borderColor}
                    value={pswd}
                    autoCompleteType="password"
                    textContentType="password"
                    returnKeyType="next"
                    autoCorrect={false}
                    editable={isEditable}
                    autoCapitalize="none"
                    // onSubmitEditing={() => ( confirmPswdTextInput as any ).current.focus()}
                    onSubmitEditing={() => ( confirmPswdTextInput as any ).current.focus()}
                    //keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                    onChangeText={( text ) => {
                      setPswd( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                      setPswdMasked( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                      setPswdError( '' )
                      setpasswordScore( zxcvbn( text ).score )
                    }}
                    onFocus={() => {
                      setShowNote( false )
                      setDropdownBoxOpenClose( false )
                      setPswdInputStyle( styles.inputBoxFocused )
                      if ( pswd.length > 0 ) {
                        setPswd( '' )
                        setPswdMasked( '' )
                        setPswdError( '' )
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

                  {pswd.length !=0 && <Text style={{
                    ...styles.guessableText, color: pswd ==appGeneratedPassword || passwordScore == 4? Colors.green : passwordScore<2 ? Colors.tomatoRed : passwordScore<4 && Colors.yellow
                  }}>{getPasswordLevel()}</Text>}
                </View>
                {pswd.length !== 0 &&
                <View style={styles.fieldsButtonContainer}>
                  <TextInput
                    style={styles.modalInputBox}
                    ref={hint}
                    placeholder={strings.Addhint}
                    placeholderTextColor={Colors.borderColor}
                    value={hintText}
                    autoCompleteType="off"
                    textContentType="none"
                    returnKeyType="next"
                    autoCorrect={false}
                    editable={isEditable}
                    autoCapitalize="none"
                    keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                    onChangeText={( text ) => {
                      setHint( text )
                    }}
                    onFocus={() => {
                      setShowNote( false )
                      setHintInputStyle( styles.inputBoxFocused )
                    }}
                    onBlur={() => {
                      setShowNote( true )
                      setHintInputStyle( styles.inputBox )
                    }}
                  />
                </View>}

              </>

            }

            <View style={styles.checkBoxDirectionContainer}>
              {backup ? <TouchableOpacity activeOpacity={1} style={styles.checkBoxColorContainer} onPress={() => setBackup( !backup )}>
                <CheckMark />
              </TouchableOpacity> :
                <TouchableOpacity activeOpacity={1} style={styles.checkBoxBorderContainer} onPress={() => setBackup( !backup )}>
                  {/* <CheckMark /> */}
                </TouchableOpacity>}
              <View>
                <Text style={styles.checkBoxHeading}>Create initial cloud backup</Text>
                <Text style={styles.checkBoxParagraph}>Backup lets you recover your wallet even if you lose your phone</Text>
              </View>
            </View>

          </TouchableOpacity>

          <View style={styles.bottomButtonView1}>
            {pswd.length!==0 && getPasswordLevel()!= 'Weak Password' && <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss()
                onPressProceed()
              }}
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>{strings.Next}</Text>
            </TouchableOpacity>}
            <View style={styles.statusIndicatorView}>
              <View style={styles.statusIndicatorInactiveView} />
              <View style={styles.statusIndicatorActiveView} />
              {/* <View style={styles.statusIndicatorInactiveView} /> */}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>


      <ModalContainer onBackground={() => onBackgroundOfLoader()} visible={loaderModal} closeBottomSheet={null}>
        {renderLoaderModalContent()}
      </ModalContainer>
      <ModalContainer onBackground={() => showSecurityQue( false )} visible={securityQue} closeBottomSheet={() => showSecurityQue( false )}>
        {renderSecurityQuestion()}
      </ModalContainer>
      <ModalContainer
        onBackground={() => {
          showEncryptionPswd( false )
        }}
        visible={encryptionPswd}
        closeBottomSheet={() => {
          showEncryptionPswd( false )
        }}
      >
        {renderEncryptionPswd()}
      </ModalContainer>
      <ModalContainer
        onBackground={() => {
          setShowAGSPmodal( false )
        }}
        visible={showAGSPmodal}
        closeBottomSheet={() => {
          setShowAGSPmodal( false )
        }}
      >
        {renderAGSP()}
      </ModalContainer>
      <ModalContainerScroll onBackground={() => setKnowMore( false )} visible={knowMore} closeBottomSheet={() => setKnowMore( false )}>
        <WalletInitKnowMore index={knowMoreIndex} closeModal={() => setKnowMore( false )} />
      </ModalContainerScroll>
    </View>
  )
}

const styles = StyleSheet.create( {
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    letterSpacing: 0.6,
    lineHeight: 18,
  },
  boldItalicText: {
    fontFamily: Fonts.MediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: RFValue( 12 ),
  },
  dropdownBox: {
    flexDirection: 'row',
    borderColor: Colors.white,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 15,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  dropdownBoxOpened: {
    flexDirection: 'row',
    borderColor: Colors.white,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 15,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2,
      height: 2,
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
      width: 15,
      height: 15,
    },
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: hp( 2 ),
    alignItems: 'center',

  },
  bottomButtonView1: {
    flexDirection: 'row',
    marginBottom:hp( 2.5 ),
    alignItems: 'center',
    paddingHorizontal:27,
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    // marginBottom: hp( 2 )
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
      width: 10,
      height: 10,
    },
    backgroundColor: Colors.white,
  },
  modalInputBox: {
    paddingVertical:hp( 0.6 ),
    height:30,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    paddingLeft: 10,
  },
  modalInputBoxError:{
    paddingVertical:hp( 0.6 ),
    height:30,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    paddingLeft: 10,
    width:wp( '60%' )
  },
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
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
      width: 0,
      height: 10,
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
    fontSize: RFValue( 10 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Italic,
    marginRight: wp( 5 ),
    alignSelf: 'flex-end',
    width: wp( '54%' ),
    textAlign: 'right',
    marginTop: hp( 0.5 ),
  },

  containerPasscode: {
    backgroundColor: Colors.white,
    borderRadius: wp( '3%' ),
    marginVertical: wp( '4%' ),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp( '0%' ),
    flexDirection: 'row',
  },

  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightBlue,
    borderRadius: wp( 2 ),
    height: hp( 3.6 ),
    paddingHorizontal: wp( 2 ),
    marginTop: wp( 2.7 ),
    alignSelf: 'flex-start',
    marginHorizontal:  wp( 2 ),
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
  textPasscode: {
    fontSize: RFValue( 18 ),
    color: Colors.black,
    fontFamily: Fonts.Regular,
    flex: 1,
    marginLeft: 8,
  },
  fieldsButtonErrorContainer:{
    borderRadius: 10,
    marginHorizontal:20,
    marginBottom:10,
    padding:12,
    height: 'auto',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    elevation: 10,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2,
      height: 8,
    },
    backgroundColor: Colors.white,
  },
  fieldsButtonContainer:{
    borderRadius: 10,
    marginHorizontal:20,
    marginBottom:10,
    padding:12,
    height: 'auto',
    elevation: 10,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2,
      height: 8,
    },
    backgroundColor: Colors.white,
  },
  enterPassword:{
    color:Colors.lightTextColor,
    fontSize: RFValue( 13 ),
    padding:4,
  },
  borderContainer:{
    backgroundColor:Colors.secondaryBackgroundColor,
    width:wp( '75%' ),
    height:hp( 0.1 ),
    marginLeft:wp( 2 ),
  },
  orBorderContainer:{
    flexDirection:'row',
    alignItems:'center',
    // paddingVertical:hp( 2 ),
  },
  passwordButtonContainer:{
    paddingVertical:hp( 1 )
  },
  checkBoxDirectionContainer:{
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:wp( 6 ),
    paddingVertical:hp( 6 )
  },
  checkBoxBorderContainer:{
    borderWidth:1,
    borderColor:Colors.gray12,
    width:wp( 5 ),
    height:20,
    borderRadius:3,
    justifyContent:'center',
    alignItems:'center',
  },
  checkBoxColorContainer:{
    width:wp( 5 ),
    height:20,
    borderRadius:3,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:Colors.green,
  },
  checkBoxHeading:{
    color: Colors.checkBlue,
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.Regular,
    marginLeft:wp( 4 )
  },
  checkBoxParagraph:{
    color: Colors.lightTextColor,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    marginLeft:wp( 4 ),
    width:wp( '70%' ),
    marginTop:hp( 0.6 )
  },
  keyboardAvoidingContainer:{
    flex:1,
    justifyContent:'space-between',
  },
  guessableText:{
    color:Colors.tomatoRed,
    // color:Colors.green,
    fontSize: RFValue( 10 ),
    fontWeight:'600',
    fontFamily: Fonts.Italic
  }
} )
