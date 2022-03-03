import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  Clipboard,
  Image,
  Dimensions
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import QuestionList from '../../common/QuestionList'
import CommonStyles from '../../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Feather from 'react-native-vector-icons/Feather'
import { RFValue } from 'react-native-responsive-fontsize'
import HeaderTitle from '../../components/HeaderTitle'
import BottomInfoBox from '../../components/BottomInfoBox'
import ButtonStyles from '../../common/Styles/ButtonStyles'

import { useDispatch, useSelector } from 'react-redux'
import zxcvbn from 'zxcvbn'
import LoaderModal from '../../components/LoaderModal'
import DeviceInfo from 'react-native-device-info'
import { changeQuestionAnswer, setupPassword } from '../../store/actions/BHR'
import {  setCloudData } from '../../store/actions/cloud'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import ModalContainer from '../../components/home/ModalContainer'
import ButtonBlue from '../../components/ButtonBlue'
import { updateCloudPermission } from '../../store/actions/BHR'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CardWithRadioBtn from '../../components/CardWithRadioBtn'
import { LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import { LocalizationContext } from '../../common/content/LocContext'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import ModalContainerScroll from '../../components/home/ModalContainerScroll'
import WalletInitKnowMore from '../../components/know-more-sheets/WalletInitKnowMore'

export enum BottomSheetKind {
  CLOUD_PERMISSION,
}

export enum BottomSheetState {
  Closed,
  Open,
}

// only admit lowercase letters and digits
const ALLOWED_CHARACTERS_REGEXP = /^[0-9a-z]+$/


function validateAllowedCharacters( answer: string ): boolean {
  return answer == '' || ALLOWED_CHARACTERS_REGEXP.test( answer )
}

export default function SetNewPassword( props: { navigation: { getParam: ( arg0: string ) => any; navigate: ( arg0: string, arg1: { isChange?: any } ) => void, goBack: () => any; } } ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const common = translations[ 'common' ]
  const message = 'Setting Up password'
  const subTextMessage = 'Setting Up password for backup encryption'
  const [ Elevation, setElevation ] = useState( 10 )
  const [ height, setHeight ] = useState( 81 )
  const [ isLoaderStart, setIsLoaderStart ] = useState( false )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ dropdownBoxList ] = useState( QuestionList )
  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
    id: '',
    question: '',
  } )
  const [ answerInputStyle, setAnswerInputStyle ] = useState( styles.inputBox )
  const [ hintInputStyle, setHintInputStyle ] = useState( styles.inputBox )
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
  const [ hintMasked, setHintMasked ] = useState( '' )
  const [ hideShowConfirmAnswer, setHideShowConfirmAnswer ] = useState( true )
  const [ hideShowConfirmPswd, setHideShowConfirmPswd ] = useState( true )
  const [ hideShowHint, setHideShowHint ] = useState( true )
  const [ hideShowAnswer, setHdeShowAnswer ] = useState( true )
  const [ hideShowPswd, setHideShowPswd ] = useState( true )
  const [ isSkipClicked, setIsSkipClicked ] = useState( false )
  const [ knowMore, setKnowMore ] = useState( false )

  const dispatch = useDispatch()

  const [ passwordScore, setpasswordScore ] = useState( 0 )
  const [ confirmpasswordScore, setconfirmpasswordScore ] = useState( 0 )
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
  const [ hint ] = useState( React.createRef() )
  const [ hintText, setHint ] = useState( '' )
  const [ visibleButton, setVisibleButton ] = useState( false )
  const [ showNote, setShowNote ] = useState( true )
  const [ showAGSPmodal, setShowAGSPmodal ] = useState( false )
  const [ copied, setCopied ] = useState( false )
  const [ appGeneratedPassword ] = useState( TrustedContactsOperations.generateKey( 18 ).match( /.{1,6}/g ).join( '-' ) )
  const [ securityQue, showSecurityQue ] = useState( false )
  const [ encryptionPswd, showEncryptionPswd ] = useState( false )
  const [ activeIndex, setActiveIndex ] = useState( 0 )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus )
  const setupPasswordStatus = useSelector( ( state ) => state.bhr.loading.setupPasswordStatus )
  const changeAnswerStatus = useSelector( ( state ) => state.bhr.loading.changeAnswerStatus )
  const cloudPermissionGranted = useSelector( ( state ) => state.bhr.cloudPermissionGranted )
  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const currentLevel: number = useSelector( ( state ) => state.bhr.currentLevel )
  const isChange = props.navigation.getParam( 'isChange' )
  const [ knowMoreIndex, setKnowMoreIndex ] = useState( 0 )

  const windowHeight = Dimensions.get( 'window' ).height

  useEffect( ()=>{
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setHeight( 85 )
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setHeight( 81 )
      }
    )
    // dispatch( clearAccountSyncCache() )
    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [] )

  useEffect( () =>{
    if( !isChange && !setupPasswordStatus && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status !=='notSetup' ){
      setLoaderModal( false )
      props.navigation.goBack()
    }
  }, [ setupPasswordStatus, levelHealth ] )

  useEffect( ()=>{
    if( isChange && !changeAnswerStatus && loaderModal ){
      setLoaderModal( false )
      props.navigation.goBack()
    }
  }, [ changeAnswerStatus ] )

  const setPassword = ( security ) =>{
    requestAnimationFrame( () => {
      // dispatch( updateCloudPermission( true ) )
      dispatch( setupPassword( security ) )
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

  // useEffect( ()=>{
  //   if( cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS &&
  //     cloudPermissionGranted === true && !isSkipClicked && ( ( currentLevel == 0 && levelHealth.length == 0 ) || ( currentLevel == 0 && levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup' ) ) ){
  //     dispatch( setCloudData() )
  //   }
  // }, [ cloudPermissionGranted, levelHealth ] )

  const changeAnswer = ( security ) =>{
    dispatch( changeQuestionAnswer( security.questionId, security.question, security.answer ) )
  }

  const showLoader = () => {
    setLoaderModal( true )
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
      setPswdError( 'Password mismatch' )
    } else if (
      validateAllowedCharacters( pswd ) == false ||
      validateAllowedCharacters( tempPswd ) == false
    ) {
      setPswdError( 'Password must only contain lowercase characters (a-z) and digits (0-9)' )
    } else {
      // setTimeout( () => {
      //   setPswdError( '' )
      // }, 2 )
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
        setPswdError( 'Password mismatch' )
      } else if (
        validateAllowedCharacters( pswd ) == false ||
        validateAllowedCharacters( confirmPswd ) == false
      ) {
        setPswdError( 'Password must only contain lowercase characters (a-z) and digits (0-9)' )
      }
    }
  }, [ confirmPswd ] )

  const onPressProceed = ( isSkip? ) => {
    showLoader()
    setShowAGSPmodal( false )
    let security = null
    if ( activeIndex === 0 ) {
      security = {
        questionId: '100', //for AGSP
        question: 'App generated password',
        answer: appGeneratedPassword,
      }
    }else if ( activeIndex === 1 ) {
      security = {
        questionId: dropdownBoxValue.id,
        question: dropdownBoxValue.question,
        answer,
      }
    } else if ( activeIndex === 2 ){
      security = {
        questionId: '0',
        question: hintText,
        answer: pswd,
      }
    }
    if( isSkip ) security = null
    if( isChange )changeAnswer( security )
    else setPassword( security )
    showSecurityQue( false )
    showEncryptionPswd( false )
  }

  const setButtonVisible = () => {
    return (
      <TouchableOpacity
        onPress={()=>onPressProceed()}
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

  const renderLoaderModalContent = useCallback( () => {
    return <LoaderModal headerText={message} messageText={subTextMessage} />
  }, [ message, subTextMessage ] )

  const confirmAction = ( index ) => {
    setActiveIndex( index )
    // dispatch( updateCloudPermission( true ) )
    if ( index === 0 ) {
      setShowAGSPmodal( true )
    }else if ( index === 1 ) {
      showSecurityQue( true )
      setAnswer( '' )
      setConfirmAnswer( '' )
    } else if ( index === 2 ){
      showEncryptionPswd( true )
      setTempPswd( '' )
      setConfirmPswdMasked( '' )
      setPswd( '' )
      setPswdMasked( '' )
    }
  }

  const renderAGSP = () => {
    return(
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View style={{
          height: hp( windowHeight >= 800 ? ( Platform.OS== 'ios' ? '56%' : '65%' ) : windowHeight >= 600 ? '66%' :  windowHeight >= 500 && '71%' ),
          marginHorizontal: wp( 4 )
        }}>
          <View style={{
            paddingTop:10, paddingBottom:4
          }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setKnowMoreIndex( 1 )
                setShowAGSPmodal( false )
                setKnowMore( true )
                showSecurityQue( false )
                showEncryptionPswd( false )
                setShowAGSPmodal( false )
                setAnswerError( '' )
              }}
              style={{
                ...styles.selectedContactsView,
                alignSelf: 'flex-end'
              }}
            >

              <Text style={styles.contactText}>{common[ 'knowMore' ]}</Text>
            </TouchableOpacity>
          </View>
          <View style={{
            marginHorizontal: wp( '2%' ),
            paddingTop:5
          }}>
            <Text style={{
              color: Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.FiraSansRegular,
            }} >{strings.HexaWalletcreated}</Text>
            <Text style={[ styles.bottomNoteInfoText, {
              color: Colors.lightTextColor,
              marginTop: 10,
              paddingRight:15
            } ]}>{strings.Makesureyou}</Text>

            <TouchableOpacity
              onPress={()=> {
                Clipboard.setString( appGeneratedPassword )
                setCopied( true )
                setTimeout( () => {
                  setCopied( false )
                }, 1500 )
              }}
              style={styles.containerPasscode}>
              <Text numberOfLines={1} style={styles.textPasscode}>{appGeneratedPassword}</Text>
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
                    width: 18, height: 20
                  }}
                  source={require( '../../assets/images/icons/icon-copy.png' )}
                />
              </View>
            </TouchableOpacity>

            {
              copied && (
                <Text style={{
                  textAlign: 'center',
                  color: Colors.lightTextColor,
                  marginBottom: 10
                }}>
                  Copied to clipboard
                </Text>
              )
            }


            <Text style={[ styles.bottomNoteInfoText, {
              marginTop: 10, color: Colors.blue
            } ]}>{common.note}</Text>
            <Text style={[ styles.bottomNoteInfoText, {
            } ]}>{strings.Itmayalso}</Text>
          </View>

          <View style={{
            alignItems: 'center', marginLeft: wp( '2%' ), marginBottom: hp( '4%' ),
            flexDirection: 'row', marginTop: hp( 5 )
          }}>
            <TouchableOpacity
              onPress={() => {onPressProceed()}}
              style={ButtonStyles.primaryActionButtonShadow}
            >
              <Text style={{
                fontSize: RFValue( 13 ),
                color: Colors.white,
                fontFamily: Fonts.FiraSansMedium,
                alignSelf: 'center',
              }}>{`${strings.UseStrongPasscode}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                showSecurityQue( false )
                showEncryptionPswd( false )
                setShowAGSPmodal( false )
                setAnswerError( '' )
              }}
            >
              <Text style={{
                fontSize: RFValue( 13 ),
                color: Colors.blue,
                fontFamily: Fonts.FiraSansMedium,
                alignSelf: 'center',
                marginLeft: wp( '7%' )
              }}>{`${common.cancel}`}</Text>
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
    return(
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.backgroundColor,
        }}
      >
        <View style={{
          height: hp( '72%' ),
          paddingHorizontal:8,
          paddingTop:8
        }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setKnowMoreIndex( 2 )
              showSecurityQue( false )
              showEncryptionPswd( false )
              setPswdError( '' )
              setKnowMore( true )
              setHint( '' )}
            }
            style={{
              ...styles.selectedContactsView,
              alignSelf: 'flex-end',
              marginRight:15
            }}
          >
            <Text style={styles.contactText}>{common[ 'knowMore' ]}</Text>

          </TouchableOpacity>
          <Text style={{
            // marginBottom: wp( '%' ),
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.FiraSansRegular,
            marginLeft: wp( '8%' )
          }} >{strings.encryptionpassword}</Text>
          <View
            style={{
              ...pswdInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: pswdError ? Colors.red : Colors.white,
              marginTop: 10,
              backgroundColor: Colors.white
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              placeholder={strings.Enteryourpassword}
              placeholderTextColor={Colors.borderColor}
              value={pswd}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              secureTextEntry = {hideShowPswd ? true : false}
              autoCapitalize="none"
              // onSubmitEditing={() =>
              //   ( confirmPswdTextInput as any ).current.focus()
              // }
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
              onChangeText={( text ) => {
                setPswd( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                setPswdMasked( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                setPswdError( '' )
                setpasswordScore( zxcvbn( text ).score )
                // setPswdError( '' )
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
            {/* {pswd ? (
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
            ) : null} */}
            {pswd ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowPswd( !hideShowPswd )
                }}
              >
                <Text
                  style={{
                    color: passwordScore > 3 ? Colors.green : passwordScore > 1 ? Colors.coral: Colors.red,
                    fontFamily: Fonts.FiraSansItalic,
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
              backgroundColor: Colors.white
            }}
          >
            <TextInput
              style={styles.modalInputBox}
              ref={confirmPswdTextInput}
              placeholder={strings.Confirmyourpassword}
              placeholderTextColor={Colors.borderColor}
              value={tempPswd}
              autoCompleteType="off"
              textContentType="none"
              returnKeyType="next"
              autoCorrect={false}
              editable={isEditable}
              secureTextEntry = {hideShowConfirmPswd ? true : false}
              autoCapitalize="none"
              // onSubmitEditing={() => {
              //   handlePswdSubmit();
              //   ( hint as any ).current.focus()
              // }}
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
              onChangeText={( text ) => {
                setTempPswd( text )
                setConfirmPswdMasked( text )
                setPswdError( '' )
                setconfirmpasswordScore( zxcvbn( text ).score )
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
            {/* {tempPswd ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowConfirmPswd( !hideShowConfirmPswd )
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
            ) : null} */}
            {/* {tempPswd ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowConfirmPswd( !hideShowConfirmPswd )
                }}
              >
                <Text
                  style={{
                    color: confirmpasswordScore > 3 ? Colors.green : confirmpasswordScore > 1 ? Colors.coral: Colors.red,
                    fontFamily: Fonts.FiraSansItalic,
                    fontSize: RFValue( 11 ),
                    marginLeft: 4,
                  }}
                >{getConfirmPasswordLevel()}</Text>
              </TouchableWithoutFeedback>
            ) : null} */}
          </View>

          <View
            style={{
              ...hintInputStyle,
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              borderColor: Colors.backgroundColor1,
              marginVertical: 10,
              backgroundColor: Colors.white
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
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
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
              }
              }
            />
            {/* {hintText ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  setHideShowHint( !hideShowHint )

                  // setDropdownBoxOpenClose( false )
                }}
              >
                <Feather
                  style={{
                    marginLeft: 'auto', padding: 10
                  }}
                  size={15}
                  color={Colors.blue}
                  name={hideShowHint ? 'eye-off' : 'eye'}
                />
              </TouchableWithoutFeedback>
            ) : null} */}
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
          {(
            pswd === tempPswd &&
              pswd.length!=0 && tempPswd.length!=0 &&
            pswdError.length === 0
          ) ? <View style={{
              ...styles.bottomButtonView,
            }}>

              {setButtonVisible()}

            </View> : null}
          {showNote &&
        <View style={{
          marginTop: showNote ? hp( '0%' ) :hp( '2%' ),
          marginBottom: hp( 1 )
        }}>
          {pswd.length === 0 && confirmPswd.length === 0 &&
          <BottomInfoBox
            title={common.note}
            infoText={strings.Youcanuse}
            italicText={''}
            backgroundColor={Colors.white}
          />
          }
        </View>
          }
        </View>
      </KeyboardAwareScrollView>
    )
  }


  const renderSecurityQuestion = () => {
    return (
      <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.bgColor,
          // height: `${height}%`

        }}
      >
        <View style={{
          height: hp( '72%' ),
        }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {showSecurityQue( false ); showEncryptionPswd( false ); setAnswerError( '' )}}
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
          }} >{strings.AnswerSecurityQuestion}</Text>
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
                : strings.SelectQuestion}
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
              marginTop: 10
            }}>
              <View
                style={{
                  ...answerInputStyle,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 15,
                  borderColor: answerError ? Colors.red : Colors.white,
                  backgroundColor: Colors.white
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
                  // onSubmitEditing={() =>
                  //   ( confirmAnswerTextInput as any ).current.focus()
                  // }
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
                  marginTop: 10,
                  borderColor: answerError ? Colors.red : Colors.white,
                  backgroundColor: Colors.white
                }}
              >
                <TextInput
                  style={styles.modalInputBox}
                  ref={confirmAnswerTextInput}
                  placeholder={strings.Confirmyouranswer}
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
                  {strings.Answersmust1}
                </Text>
              )}
            </View>
          ) : (
            <View style={{
              marginTop: 9
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
            {/* <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
          </View> */}
          </View> : null}
          {showNote &&
          <View style={{
            marginTop: showNote ? hp( '0%' ) : hp( '2%' ),
            marginBottom: hp( 1 )
          }}>
            {answer.length === 0 && confirmAnswer.length === 0 &&
            <BottomInfoBox
              title={common.note}
              infoText={`${strings.TheAnswer}  ${strings.encrypt} ${strings.backup} ${strings.securityQuestion} ${strings.hint}`}
              italicText={''}
              backgroundColor={Colors.white}
            />
            }
          </View>
          }
        </View>
      </KeyboardAwareScrollView>
    )
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SafeAreaView style={{
        flex: 0
      }} />

      <ScrollView>
        <View style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor
        }}>
          <View style={[ CommonStyles.headerContainer, {
            backgroundColor: Colors.backgroundColor,
            justifyContent: 'space-between'
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
            <TouchableOpacity
              onPress={() => {
                setKnowMoreIndex( 0 )
                setKnowMore( true )}
              }
              style={{
                ...styles.selectedContactsView,
              }}
            >
              <Text style={styles.contactText}>{common[ 'knowMore' ]}</Text>

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
              firstLineTitle={'Initial Cloud Backup'}
              secondLineTitle={'Select how you want to encrypt the backup'}
              infoTextNormal={''}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            <CardWithRadioBtn
              geticon={''}
              mainText={strings.AGSP}
              subText={strings.Hexawillgenerate}
              isSelected={false}
              index={0}
              setActiveIndex={()=> confirmAction( 0 )}
              italicText={''}
              changeBgColor={true}
              tag={strings.MostSecure}
              hideRadioBtn
            />
            {/* <CardWithRadioBtn
              geticon={''}
              mainText={strings.AnsweraSecurityQuestion}
              subText={strings.Easiertoremember}
              isSelected={false}
              setActiveIndex={()=> confirmAction( 1 )}
              index={1}
              italicText={''}
              boldText={''}
              changeBgColor={true}
              tag={strings.MostMemorable}
              hideRadioBtn
            /> */}
            <CardWithRadioBtn
              geticon={''}
              mainText={strings.Useencryptionpassword}
              subText={strings.Createapassword}
              isSelected={false}
              setActiveIndex={()=> confirmAction( 2 )}
              index={2}
              italicText={''}
              boldText={''}
              changeBgColor={true}
              tag={strings.UserDefined}
              hideRadioBtn
            />
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* <View style={styles.statusIndicatorView}>
        <View style={styles.statusIndicatorInactiveView} />
        <View style={styles.statusIndicatorInactiveView} />
        <View style={styles.statusIndicatorActiveView} />
      </View> */}
      {showNote && !visibleButton ? (
        <View
          style={{
            marginBottom:
                Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp( '1%' ) : 0,
          }}
        >
          <BottomInfoBox
            title={common.note}
            infoText={`${strings.Backuplets} `}
            italicText={'Security Centre'}
            backgroundColor={Colors.white}
          />
        </View>
      ) : null}
      {/* <View style={{
        alignItems: 'center', marginLeft: wp( '9%' ), marginBottom: hp( '9%' ),
        flexDirection: 'row'
      }}>
        <ButtonBlue
          buttonText="Confirm & Proceed"
          handleButtonPress={confirmAction}
          buttonDisable={false}
        />
        <TouchableOpacity
          onPress={() => {
            props.navigation.goBack()
          }}
        >
          <Text style={{
            color: Colors.blue,
            fontFamily: Fonts.FiraSansMedium,
            alignSelf: 'center',
            marginLeft: wp( '5%' )
          }}>{common.cancel}</Text>
        </TouchableOpacity>
      </View> */}
      {/* <ModalContainer visible={currentBottomSheetKind != null} closeBottomSheet={() => {}} >
        {renderBottomSheetContent()}
      </ModalContainer> */}
      <ModalContainer onBackground={()=>showSecurityQue( false )} visible={securityQue} closeBottomSheet={() => {showSecurityQue( false ) }} >
        {renderSecurityQuestion()}
      </ModalContainer>
      <ModalContainer onBackground={()=>showEncryptionPswd( false )} visible={encryptionPswd} closeBottomSheet={() => {showEncryptionPswd( false ) }} >
        {renderEncryptionPswd()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setLoaderModal( false )} visible={loaderModal} closeBottomSheet={() => {}} background={'rgba(42,42,42,0.4)'} >
        {renderLoaderModalContent()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>{setShowAGSPmodal( false )}}
        visible={showAGSPmodal}
        closeBottomSheet={()=>{setShowAGSPmodal( false )}} >
        {renderAGSP()}
      </ModalContainer>

      <ModalContainerScroll
        onBackground={()=>setKnowMore( false )}
        visible={knowMore}
        closeBottomSheet={() => setKnowMore( false )}>
        <WalletInitKnowMore index={knowMoreIndex} closeModal={() => setKnowMore( false )} />
      </ModalContainerScroll>

    </View>
  )
}

const styles = StyleSheet.create( {
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
    paddingBottom: hp( 2 ),
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
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 2 )
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
      width: 10, height: 10
    },
    backgroundColor: Colors.white,
  },
  modalInputBox: {
    flex: 1,
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
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  helpText: {
    fontSize: RFValue( 10 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansItalic,
    marginRight: wp( 5 ),
    alignSelf: 'flex-end',
    width: wp( '54%' ),
    textAlign: 'right',
    marginTop: hp( 0.5 )
  },
  containerPasscode: {
    backgroundColor: Colors.white,
    borderRadius: wp( '3%' ),
    marginVertical: wp( '4%' ),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp( '1%' ),
    flexDirection: 'row'
  },

  textPasscode: {
    fontSize: RFValue( 18 ),
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    flex: 1,
    marginLeft: 5
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
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
} )
