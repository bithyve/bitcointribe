import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { LocalizationContext } from '../../common/content/LocContext'

import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { useSelector } from 'react-redux'
import { withNavigation } from 'react-navigation'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Wallet } from '../../bitcoin/utilities/Interface'


const ALLOWED_CHARACTERS_REGEXP = /^[0-9a-z]+$/

function validateAllowedCharacters( answer: string ): boolean {
  return answer == '' || ALLOWED_CHARACTERS_REGEXP.test( answer )
}

function SecurityQuestion( props ) {
  const { security }: Wallet = useSelector(
    ( state ) => state.storage.wallet,
  )
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const strings = translations[ 'bhr' ]
  const stringsLogin = translations[ 'login' ]

  let [ AnswerCounter, setAnswerCounter ] = useState( 0 )
  const securityQuestion = security.question ? security.question : ''
  const securityAnswer = security.answer ? security.answer : ''
  const showAnswerProp = props.showAnswer
  const [ showAnswer, setShowAnswer ] = useState( props.showAnswer ? props.showAnswer : false )
  const [ answer, setAnswer ] = useState( '' )
  const [ errorText, setErrorText ] = useState( '' )
  const [ isDisabled, setIsDisabled ] = useState( true )
  const setConfirm = () => {
    if ( answer.length > 0 && answer != securityAnswer ) {
      if ( AnswerCounter < 2 ) {
        AnswerCounter++
        setAnswerCounter( AnswerCounter )
      } else {
        if( !props.title1 ) {
          props.onClose()
          props.navigation.navigate( 'ReLogin', {
            isPasscodeCheck: true,
            onPasscodeVerify: props.onPasscodeVerify ? props.onPasscodeVerify : null
          } )
          setShowAnswer( true )
          setErrorText( '' )
        } else {
          setAnswerCounter( 0 )
        }
        return
      }
      setErrorText( security && security.questionId == '0' ? stringsLogin.passwordisincorrect : stringsLogin.Answerisincorrect )
    } else {
      setErrorText( '' )
    }
  }

  useEffect( ()=>{
    setShowAnswer( showAnswerProp )
    if( showAnswerProp ) setErrorText( '' )
  }, [ showAnswerProp ] )

  const setBackspace = ( event ) => {
    if ( event.nativeEvent.key == 'Backspace' ) {
      setErrorText( '' )
    }
  }

  useEffect( () => {
    if( security.questionId ) {
      if ( answer.trim() == securityAnswer.trim() ) {
        setErrorText( '' )
      }
    }
  }, [ answer ] )

  useEffect( () => {
    if ( ( !errorText && !answer && answer ) || answer ) setIsDisabled( false )
    else setIsDisabled( true )
  }, [ answer, errorText ] )

  return (
    <KeyboardAwareScrollView
      resetScrollToCoords={{
        x: 0, y: 0
      }}
      scrollEnabled={false}
      style={{
        ...styles.modalContentContainer
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={props.onClose}
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
      <View style={styles.modalContentContainer}>

        <View>
          <View style={{
            paddingHorizontal: wp( '7%' )
          }}>
            {
              props.title1 && (
                <Text style={{
                  ...styles.modalInfoText, marginTop: wp( '1.5%' )
                }}>
                  {props.title1}
                </Text>
              )
            }
            <View style={{
              flex: 1, justifyContent: 'center'
            }}>
              <Text style={styles.modalTitleText}>
                {props.title ? props.title : strings.HealthCheckConfirmPassword}
              </Text>
              <Text style={{
                ...styles.modalInfoText, marginTop: wp( '1.5%' )
              }}>
                {strings.Specifythepassword}
              </Text>
            </View>
          </View>
          <View style={{
            paddingLeft: wp( '6%' ), paddingRight: wp( '6%' )
          }}>
            <View style={styles.dropdownBox}>
              {parseInt( security.questionId ) > 0 ? <Text style={styles.dropdownBoxText}>{securityQuestion}</Text> :
                <Text style={styles.dropdownBoxText}>{`${strings.Hint}: ${securityQuestion}`}</Text>
              }
            </View>
            <KeyboardAwareScrollView
              resetScrollToCoords={{
                x: 0, y: 0
              }}
              scrollEnabled={false}
              // style={styles.rootContainer}
              style={{
                flex: 1
                // height: `${height}%`

              }}
            >
              <TextInput
                style={{
                  ...styles.inputBox,
                  width: '100%',
                  marginBottom: hp( '1%' ),
                  borderColor:
                    errorText == stringsLogin.Answerisincorrect
                      ? Colors.red
                      : Colors.borderColor,
                }}
                placeholder={stringsLogin.Enteranswer}
                placeholderTextColor={Colors.borderColor}
                value={answer}
                textContentType="none"
                autoCompleteType="off"
                autoCorrect={false}
                autoCapitalize="none"
                onKeyPress={( event ) => {
                  setBackspace( event )
                }}
                onChangeText={( text ) => {
                  setAnswer( text )
                }}
                onBlur={() => {
                  if( parseInt( security.questionId ) > 0  ) {
                    // if ( validateAllowedCharacters( answer ) == false ) {
                    //   setErrorText( stringsLogin.Answersmust )
                    // }
                  }
                }}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                onSubmitEditing={( event ) => setConfirm()}
              />
              {errorText ? (
                <Text
                  style={{
                    marginLeft: 'auto',
                    color: Colors.red,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansMediumItalic,
                  }}
                >
                  {errorText}
                </Text>
              ) : null}
            </KeyboardAwareScrollView>
            {
              props.note && (
                <Text style={{
                  ...styles.modalInfoText, marginTop: wp( '1.5%' )
                }}>
                  {props.note}
                </Text>
              )
            }
            {showAnswer && (
              <View
                style={{
                  ...styles.inputBox,
                  width: '100%',
                  marginBottom: hp( '1%' ),
                  borderColor: Colors.borderColor,
                  justifyContent: 'center'
                }}
              >
                <Text
                  style={{
                    fontSize: RFValue( 13 ),
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  {securityAnswer}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View
          style={{
            paddingLeft: wp( '6%' ),
            paddingRight: wp( '6%' ),
            height: hp( '15%' ),
            justifyContent: 'center',
          }}
        >
          <AppBottomSheetTouchableWrapper
            disabled={isDisabled}
            onPress={() => {
              setConfirm()
              if ( answer.trim() == securityAnswer.trim() ) {
                AsyncStorage.setItem(
                  'SecurityAnsTimestamp',
                  JSON.stringify( Date.now() ),
                ).then( () => {
                  props.onPressConfirm()
                } )
              } else if( parseInt( security.questionId ) > 0  ) {
                // if ( validateAllowedCharacters( answer ) == false ) {
                //   setErrorText( stringsLogin.Answersmust )
                // }
              } else {
                setErrorText( security && security.questionId == '0' ? stringsLogin.passwordisincorrect : stringsLogin.Answerisincorrect )
              }
              setIsDisabled( false )
            }}
            style={{
              ...styles.questionConfirmButton,
              backgroundColor: isDisabled ? Colors.lightBlue : Colors.blue,
            }}
          >
            <Text style={styles.proceedButtonText}>
              {!errorText ? common.confirm : common.tryAgain}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default withNavigation( SecurityQuestion )

const styles = StyleSheet.create( {
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.white,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    marginTop: hp( '3%' ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  dropdownBoxText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    color: Colors.black,
  },
  dropdownBox: {
    marginTop: hp( '2%' ),
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    // alignItems: 'center',
  },
  questionConfirmButton: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp( '85%' ),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
