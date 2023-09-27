import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import { useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BottomInfoBox from '../../../components/BottomInfoBox'
import { translations } from '../../../common/content/LocContext'
import { Wallet } from '../../../bitcoin/utilities/Interface'


const ALLOWED_CHARACTERS_REGEXP = /^[0-9a-z]+$/

function validateAllowedCharacters( answer: string ): boolean {
  return answer !== ''
}

function SecurityQuestion( props ) {
  const { security }: Wallet = useSelector(
    ( state ) => state.storage.wallet,
  )
  const navigation: any = useNavigation()
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const login = translations[ 'login' ]
  let [ AnswerCounter, setAnswerCounter ] = useState( 0 )
  const [ showNote, setShowNote ] = useState( true )
  const [ height, setHeight ] = useState( 12 )
  const securityQuestion = security && security.question ? security.question : ''
  const securityAnswer = security && security.answer ? security.answer : ''
  const [ showAnswer, setShowAnswer ] = useState( false )
  const [ answer, setAnswer ] = useState( '' )
  const [ errorText, setErrorText ] = useState( '' )
  const [ isDisabled, setIsDisabled ] = useState( true )
  const setConfirm = () => {
    if( props.isNeedAuthentication ){
      if ( answer.length > 0 && answer != securityAnswer ) setErrorText( login.Answerisincorrect )
      else setErrorText( '' )
    } else {
      if ( answer.length > 0 && answer != securityAnswer ) {
        if ( AnswerCounter < 2 ) {
          AnswerCounter++
          setAnswerCounter( AnswerCounter )
        } else {
          navigation.navigate( 'ReLogin', {
            isPasscodeCheck: true,
          } )
          props.onClose()
          setShowAnswer( true )
          setErrorText( '' )
          return
        }
        setErrorText( login.Answerisincorrect )
      } else setErrorText( '' )
    }
  }

  const setBackspace = ( event ) => {
    if ( event.nativeEvent.key == 'Backspace' ) {
      setErrorText( '' )
    }
  }

  useEffect( () => {
    if ( answer.trim() == securityAnswer.trim() ) {
      setErrorText( '' )
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
      onKeyboardDidShow={() => setHeight( 0 )}
      onKeyboardDidHide={() => setHeight( 12 )}
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
          backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
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
            marginLeft: wp( 6 ),
          }}>
            <Text style={styles.modalTitleText}>{strings.EditWalletName}</Text>
            <Text style={{
              ...styles.modalInfoText,
            }}>{strings.Changeyourwallet}</Text>
          </View>
          <View style={{
            marginLeft: wp( 6 ), flexDirection: 'row', marginVertical: hp( 3 ), alignItems: 'center'
          }}>
            <Text style={styles.modalBoldText}>Step 1</Text>
            <Text style={{
              ...styles.modalInfoText,
            }}>
              {` ${strings.ConfirmEncryptionPassword}`}
            </Text>
          </View>
          <View style={{
            paddingLeft: wp( '6%' ), paddingRight: wp( '6%' )
          }}>
            <View style={styles.dropdownBox}>
              <Text style={styles.dropdownBoxText}>{securityQuestion}</Text>
            </View>
            <View style={{
            }}>
              <TextInput
                style={{
                  ...styles.inputBox,
                  width: '100%',
                  marginBottom: hp( '1%' ),
                  borderColor:
                    errorText == strings.Answerisincorrect
                      ? Colors.red
                      : Colors.white,
                }}
                placeholder={login.Enteryouranswer}
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
                onFocus={() => setShowNote( false )}
                onBlur={() => {
                  // setShowNote( true )
                  if ( validateAllowedCharacters( answer ) == false ) {
                    setErrorText( login.Answersmust )
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
                    fontFamily: Fonts.MediumItalic,
                  }}
                >
                  {errorText}
                </Text>
              ) : null}
            </View>
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
                    fontFamily: Fonts.Regular,
                  }}
                >
                  {securityAnswer}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={[ styles.statusIndicatorView, {
          marginTop: `${height}%`
        } ]}>
          <View style={styles.statusIndicatorActiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
        </View>
        {/* {showNote &&
        <BottomInfoBox
          // backgroundColor={Colors.white}
          title={'Note'}
          infoText={
            'Your Friends & Family will be notified of this change, so they may update their saved details.'
          }
        />
        } */}
        <View
          style={{
            paddingLeft: wp( '6%' ),
            paddingRight: wp( '6%' ),
            height: hp( '9%' ),
            justifyContent: 'center',
            flexDirection: 'row',
            // marginBottom: hp( 4 )
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
              } else if ( validateAllowedCharacters( answer ) == false ) {
                setErrorText( login.Answersmust )
              } else {
                setErrorText( login.Answerisincorrect )
              }
              setIsDisabled( false )
            }}
            style={{
              ...styles.questionConfirmButton,
              backgroundColor: isDisabled ? Colors.lightBlue : Colors.blue,
            }}
          >
            <Text style={styles.proceedButtonText}>
              {!errorText ? 'Confirm' : 'Try Again'}
            </Text>
          </AppBottomSheetTouchableWrapper>
          {/* <AppBottomSheetTouchableWrapper
            onPress={() => {}}
            style={{
              height: wp( '15%' ),
              width: wp( '36%' ),
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: wp( '8%' ),
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.Medium,
                color: Colors.blue
              }}
            >
              {'Need Help?'}
            </Text>
          </AppBottomSheetTouchableWrapper> */}
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

export default SecurityQuestion

const styles = StyleSheet.create( {
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 2 ),
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
  modalBoldText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Medium,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.backgroundColor,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
  dropdownBoxText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    color: Colors.black,
  },
  dropdownBox: {
    marginTop: hp( '1%' ),
    height: 50,
    // paddingLeft: 10,
    paddingRight: 15,
    alignItems: 'flex-start',
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
    fontFamily: Fonts.Regular,
    backgroundColor: Colors.white
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )
