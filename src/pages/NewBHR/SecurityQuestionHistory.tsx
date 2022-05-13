import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Clipboard
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Fonts from '../../common/Fonts'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import moment from 'moment'
import _ from 'underscore'
import HistoryPageComponent from './HistoryPageComponent'
import SecurityQuestion from './SecurityQuestion'
import ErrorModalContents from '../../components/ErrorModalContents'
import {
  updateMSharesHealth, changeEncryptionPassword, setPasswordResetState
} from '../../store/actions/BHR'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import ModalContainer from '../../components/home/ModalContainer'
import { Wallet } from '../../bitcoin/utilities/Interface'
import { translations } from '../../common/content/LocContext'
import { useDispatch, useSelector } from 'react-redux'
import LoaderModal from '../../components/LoaderModal'
import Toast from '../../components/Toast'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import BottomInfoBox from '../../components/BottomInfoBox'
import CardWithRadioBtn from '../../components/CardWithRadioBtn'
import HeaderTitle from '../../components/HeaderTitle'
import Feather from 'react-native-vector-icons/Feather'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import { getTime } from '../../common/CommonFunctions/timeFormatter'

const SecurityQuestionHistory = ( props ) => {
  const strings  = translations[ 'bhr' ]
  const loginStrings = translations[ 'login' ]
  const common  = translations[ 'common' ]

  const [ securityQuestionsHistory, setSecuirtyQuestionHistory ] = useState( [
    {
      id: 1,
      title: strings.Questionscreated,
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: strings.Passwordconfirmed,
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: strings.Questionsunconfirmed,
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
  ] )
  const [
    SecurityQuestionBottomSheet,
    setSecurityQuestionBottomSheet,
  ] = useState( React.createRef() )
  const [
    questionModal,
    showQuestionModal,
  ] = useState( false )
  const [
    successModal,
    showSuccessModal,
  ] = useState( false )
  const [ showAnswer, setShowAnswer ] = useState( false )
  const [
    HealthCheckSuccessBottomSheet,
    setHealthCheckSuccessBottomSheet,
  ] = useState( React.createRef() )
  const levelHealth: {
    level: number;
    levelInfo: {
      shareType: string;
      updatedAt: string;
      status: string;
      shareId: string;
      reshareVersion?: number;
      name?: string;
    }[];
  }[] = useSelector( ( state ) => state.bhr.levelHealth )

  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const next = props.navigation.getParam( 'next' )
  const [ showRescanningPrompt, setShowRescanningPrompt ] = useState( false )
  const [ showRescanningModal, setShowRescanningModal ] = useState( false )
  const [ showSelectMethodModal, setShowSelectMethodModal ] = useState( false )
  const [ copied, setCopied ] = useState( false )
  const [ confirmPswdTextInput ] = useState( React.createRef() )
  const [ encryptionPswd, showEncryptionPswd ] = useState( false )
  const [ activeIndex, setActiveIndex ] = useState( 0 )
  const [ tempPswd, setTempPswd ] = useState( '' )
  const [ hintInputStyle, setHintInputStyle ] = useState( styles.inputBox )
  const [ hint ] = useState( React.createRef() )
  const [ hintText, setHint ] = useState( '' )
  const [ Elevation, setElevation ] = useState( 10 )
  const [ confirmPswd, setConfirmPswd ] = useState( '' )
  const [ pswd, setPswd ] = useState( '' )
  const [ securityQue, showSecurityQue ] = useState( false )
  const [ pswdMasked, setPswdMasked ] = useState( '' )
  const [ confirmPswdMasked, setConfirmPswdMasked ] = useState( '' )
  const [ hideShowConfirmPswd, setHideShowConfirmPswd ] = useState( true )
  const [ hideShowPswd, setHideShowPswd ] = useState( true )
  const [ answerError, setAnswerError ] = useState( '' )
  const [ pswdError, setPswdError ] = useState( '' )
  const passwordResetState = useSelector( ( state ) => state.bhr.passwordResetState )
  const [ showAGSPmodal, setShowAGSPmodal ] = useState( false )
  const [ showNote, setShowNote ] = useState( true )
  const [ isEditable, setIsEditable ] = useState( true )
  const [ resetStarted, setresetStarted ] = useState( false )
  const [ type, setType ] = useState( '' )
  const [ loading, setLoading ] = useState( false )
  const [ confirmPswdInputStyle, setConfirmPswdInputStyle ] = useState(
    styles.inputBox,
  )
  const [ pswdInputStyle, setPswdInputStyle ] = useState( styles.inputBox )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const [ appGeneratedPassword ] = useState( TrustedContactsOperations.generateKey( 18 ).match( /.{1,6}/g ).join( '-' ) )
  const [ selectedKeeper, setSelectedKeeper ] = useState( props.navigation.getParam( 'selectedKeeper' ) )

  const dispatch = useDispatch()

  useEffect( () => {
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
  }, [ props.navigation.state.params ] )

  const renderSecurityQuestionContent = useCallback( () => {
    return (
      <SecurityQuestion
        onClose={() => showQuestionModal( false )}
        onPressConfirm={async () => {
          if( type === 'confirm' ) {
            Keyboard.dismiss()
            saveConfirmationHistory()
            updateHealthForSQ()
            showQuestionModal( false )
            showSuccessModal( true )
          } else {
            Keyboard.dismiss()
            showQuestionModal( false )
            setShowSelectMethodModal( true )
          }

        }}
        onPasscodeVerify={()=>{ showQuestionModal( true ); setShowAnswer( true ) }}
        showAnswer={showAnswer}
      />
    )
  }, [ showAnswer, questionModal ] )

  const renderHealthCheckSuccessModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={HealthCheckSuccessBottomSheet}
        title={strings.HealthCheckSuccessful}
        info={strings.Passwordbackedupsuccessfully}
        note={''}
        proceedButtonText={strings.ViewHealth}
        isIgnoreButton={false}
        onPressProceed={() => {
          // ( HealthCheckSuccessBottomSheet as any ).current.snapTo( 0 )
          showSuccessModal( false )
          props.navigation.goBack()
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/success.png' )}
      />
    )
  }, [] )

  useEffect( () => {
    dispatch( setPasswordResetState( '' ) )
    console.log( 'passwordResetState', passwordResetState )
    if( passwordResetState === 'init' ) {
      setLoading( true )
    } else if( passwordResetState === 'completed' ) {
      setLoading( false )
      Toast( 'Password reset successfully' )
    }  else if( passwordResetState === '' ) {
      if( loading ) {
        Toast( 'Password reset successfully' )
      }
      setLoading( false )
    }
  }, [ passwordResetState ] )

  const confirmAction = ( index ) => {
    setActiveIndex( index )
    setShowSelectMethodModal( false )
    if ( index === 0 ) {
      setShowAGSPmodal( true )
    } else if( index === 2 ) {
      showEncryptionPswd( true )
      setTempPswd( '' )
      setConfirmPswdMasked( '' )
      setPswd( '' )
      setPswdMasked( '' )
    }
  }

  const renderSelectMethods = useCallback( () => {
    return (
      <View style={{
        backgroundColor: Colors.backgroundColor,
        padding: 10
      }}>
        <HeaderTitle
          firstLineTitle={''}
          secondLineBoldTitle={loginStrings.ChangeEncryptionMethod}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
        <CardWithRadioBtn
          geticon={''}
          mainText={loginStrings.AGSP}
          subText={loginStrings.Hexawillgenerate}
          isSelected={false}
          setActiveIndex={()=> confirmAction( 0 )}
          index={0}
          italicText={''}
          boldText={''}
          changeBgColor={true}
          tag={loginStrings.MostSecure}
          hideRadioBtn
        />

        <CardWithRadioBtn
          geticon={''}
          mainText={loginStrings.Useencryptionpassword}
          subText={loginStrings.Createapassword}
          isSelected={false}
          setActiveIndex={()=> confirmAction( 2 )}
          index={2}
          italicText={''}
          boldText={''}
          changeBgColor={true}
          tag={loginStrings.UserDefined}
          hideRadioBtn
        />

        <View style={{
          marginTop: 20
        }}>
          <BottomInfoBox
            title={common.note}
            infoText={'Cloud backup provides you an automated recovery scheme as your first step. You can upgrade the security from the'}
            italicText={' Security Center'}
            backgroundColor={Colors.white}
          />
        </View>
      </View>
    )
  }, [ showSelectMethodModal ] )

  const onPressProceed = ( ) => {
    setresetStarted( true )
    setShowAGSPmodal( false )
    let security = null
    if ( activeIndex === 0 ) {
      security = {
        questionId: '100', //for AGSP
        question: 'App generated password',
        answer: appGeneratedPassword,
      }
    } else if ( activeIndex === 2 ){
      security = {
        questionId: '0',
        question: hintText,
        answer: pswd,
      }
    }
    setLoading( true )
    dispatch( changeEncryptionPassword(  security ) )
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
        <Text style={styles.buttonText}>{common.proceed}</Text>
        {/* ) : (
          <ActivityIndicator size="small" />
        )} */}
      </TouchableOpacity>
    )
  }

  const handlePswdSubmit = () => {
    setConfirmPswd( tempPswd )

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
          paddingTop:  hp( '4%' ),
        }}>
          <Text style={{
            // marginBottom: wp( '%' ),
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.FiraSansRegular,
            marginLeft: wp( '6%' )
          }} >{loginStrings.encryptionpassword}</Text>
          <View
            style={{
              ...styles.inputBox,
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
              placeholder={loginStrings.Enteryourpassword}
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
                setPswd( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
                setPswdMasked( text.replace( /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '' ) )
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
              ...styles.inputBox,
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
              placeholder={loginStrings.Confirmyourpassword}
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
              keyboardType={
                Platform.OS == 'ios'
                  ? 'ascii-capable'
                  : 'visible-password'
              }
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
              {loginStrings.Numbersorspecial}
            </Text>
          )} */}
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
              placeholder={loginStrings.Addhint}
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
          {showNote ? <View style={{
            ...styles.bottomButtonView,
          }}>
            {(
              pswd.trim() === confirmPswd.trim() &&
            confirmPswd.trim() &&
            pswd.trim() && pswdError.length === 0 && hintText.length > 0
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
          marginTop: showNote ? hp( '0%' ) :hp( '2%' ),
          marginBottom: hp( 1 )
        }}>
          {pswd.length === 0 && confirmPswd.length === 0 &&
          <BottomInfoBox
            title={common.note}
            infoText={loginStrings.Youcanuse}
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
          height: hp( '60%' ),
          marginHorizontal: wp( 4 ),
          paddingTop:  hp( '6%' ),
        }}>
          <View style={{
            marginHorizontal: wp( '6%' )
          }}>
            <Text style={{
              color: Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.FiraSansRegular,
            }} >{loginStrings.HexaWalletcreated}</Text>
            <Text style={[ styles.bottomNoteInfoText, {
              color: Colors.lightTextColor,
              marginTop: 10
            } ]}>{loginStrings.Makesureyou}</Text>

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
            } ]}>{loginStrings.Itmayalso}</Text>
          </View>

          <View style={{
            alignItems: 'center', marginLeft: wp( '5%' ), marginBottom: hp( '4%' ),
            flexDirection: 'row', marginTop: hp( 7 )
          }}>
            <TouchableOpacity
              onPress={() => {onPressProceed()}}
              style={ButtonStyles.primaryActionButton}
            >
              <Text style={{
                fontSize: RFValue( 13 ),
                color: Colors.white,
                fontFamily: Fonts.FiraSansMedium,
                alignSelf: 'center',
              }}>{`${loginStrings.UseStrongPasscode}`}</Text>
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
                marginLeft: wp( '5%' )
              }}>{`${common.cancel}`}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAwareScrollView>
    )
  }

  const renderLoaderModalContent = useCallback( () => {
    return <LoaderModal
      headerText={'Reseting password'}
      messageText={'Please wait'}
    />
  }, [ loading ] )


  const sortedHistory = ( history ) => {
    const currentHistory = history.filter( ( element ) => {
      if ( element.date ) return element
    } )

    const sortedHistory = _.sortBy( currentHistory, 'date' )
    sortedHistory.forEach( ( element ) => {
      element.date = moment( element.date )
        .utc()
        .local()
        .format( 'DD MMMM YYYY HH:mm' )
    } )

    return sortedHistory
  }

  const updateHistory = ( securityQuestionHistory ) => {
    const updatedSecurityQuestionsHistory = [ ...securityQuestionsHistory ]
    if ( securityQuestionHistory.created )
      updatedSecurityQuestionsHistory[ 0 ].date = securityQuestionHistory.created

    if ( securityQuestionHistory.confirmed )
      updatedSecurityQuestionsHistory[ 1 ].date =
        securityQuestionHistory.confirmed

    if ( securityQuestionHistory.unconfirmed )
      updatedSecurityQuestionsHistory[ 2 ].date =
        securityQuestionHistory.unconfirmed
    setSecuirtyQuestionHistory( updatedSecurityQuestionsHistory )
  }

  const saveConfirmationHistory = async () => {
    const securityQuestionHistory = JSON.parse(
      await AsyncStorage.getItem( 'securityQuestionHistory' ),
    )
    if ( securityQuestionHistory ) {
      const updatedSecurityQuestionsHistory = {
        ...securityQuestionHistory,
        confirmed: Date.now(),
      }
      updateHistory( updatedSecurityQuestionsHistory )
      await AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify( updatedSecurityQuestionsHistory ),
      )
    }
  }

  useEffect( () => {
    if ( next )showQuestionModal( true )
  }, [ next ] )

  useEffect( () => {
    ( async () => {
      const securityQuestionHistory = JSON.parse(
        await AsyncStorage.getItem( 'securityQuestionHistory' ),
      )
      console.log( {
        securityQuestionHistory
      } )
      if ( securityQuestionHistory ) updateHistory( securityQuestionHistory )
    } )()
  }, [] )

  const updateHealthForSQ = () => {
    if ( levelHealth.length > 0 && levelHealth[ 0 ].levelInfo.length > 0 ) {
      const shareObj =
        {
          walletId: wallet.walletId,
          shareId: levelHealth[ 0 ].levelInfo[ 0 ].shareId,
          reshareVersion: levelHealth[ 0 ].levelInfo[ 0 ].reshareVersion,
          updatedAt: moment( new Date() ).valueOf(),
          status: 'accessible',
          shareType: 'securityQuestion',
          name: 'Encryption Password'
        }
      dispatch( updateMSharesHealth( shareObj, true ) )
    }
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={strings.EncryptionPassword}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'Never'}
        moreInfo={''}
        headerImage={require( '../../assets/images/icons/icon_password.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          showButton={true}
          infoBoxTitle={strings.PasswordHistory}
          infoBoxInfo={strings.Thehistory}
          type={'security'}
          IsReshare
          onPressConfirm={() => {
            // ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
            showQuestionModal( true )
          }}
          data={sortedHistory( securityQuestionsHistory )}
          confirmButtonText={strings.ConfirmPassword}
          reshareButtonText={strings.ConfirmPassword}
          //changeButtonText={'Change Password'}
          isChangeKeeperAllow
          disableChange={false}
          onPressReshare={() => {
            // ( SecurityQuestionBottomSheet as any ).current.snapTo( 1 )
            setType( 'confirm' )
            showQuestionModal( true )
          }}
          onPressChange={() => {
            // setType( 'change' )
            // showQuestionModal( true )
          }}
          changeButtonText={''} // TODO: set to Change once change encryption password functionality is implemented
          isChangeKeeperAllow={true}
        />
      </View>
      <ModalContainer onBackground={()=>showQuestionModal( false )} visible={questionModal} closeBottomSheet={() => {showQuestionModal( false )}} >
        {renderSecurityQuestionContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>showSuccessModal( false )} visible={successModal} closeBottomSheet={() => {showSuccessModal( false )}} >
        {renderHealthCheckSuccessModalContent()}
      </ModalContainer>

      <ModalContainer onBackground={()=>{showEncryptionPswd( false )}} visible={encryptionPswd} closeBottomSheet={()=>{showEncryptionPswd( false )}} >
        {renderEncryptionPswd()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>{setShowAGSPmodal( false )}}
        visible={showAGSPmodal}
        closeBottomSheet={()=>{setShowAGSPmodal( false )}} >
        {renderAGSP()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>setShowSelectMethodModal( false )}
        visible={showSelectMethodModal}
        closeBottomSheet={() => {setShowSelectMethodModal( false )}} >
        {renderSelectMethods()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>setLoading( false )}
        visible={loading}
        closeBottomSheet={()=> {}}
      >
        {renderLoaderModalContent()}
      </ModalContainer>
    </View>
  )
}

export default SecurityQuestionHistory

const styles = StyleSheet.create( {
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '3%' ),
    marginTop: 20,
    marginBottom: 15,
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
    fontSize: RFValue( 10 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansItalic,
    marginRight: wp( 5 ),
    alignSelf: 'flex-end',
    width: wp( '54%' ),
    textAlign: 'right',
    marginTop: hp( 0.5 )
  },

  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
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
} )
