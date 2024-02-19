import React, { useState, useEffect } from 'react'
import { View, Text, AsyncStorage, StyleSheet, TextInput, Platform, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, KeyboardAvoidingView } from 'react-native'
import Colors from '../../../../common/Colors'
import Fonts from '../../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../../../components/AppBottomSheetTouchableWrapper'
import { useDispatch, useSelector } from 'react-redux'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { setShowAllAccount } from '../../../../store/actions/accounts'
import { translations } from '../../../../common/content/LocContext'

export default function SecurityQuestionScreen( props ) {
  const { security } = useSelector( ( state ) => state.storage.wallet )
  const common  = translations[ 'common' ]
  const strings  = translations[ 'login' ]
  let [ AnswerCounter, setAnswerCounter ] = useState( 0 )
  const securityQuestion = security.question
  const securityAnswer = security.answer
  const [ showAnswer, setShowAnswer ] = useState( false )
  const [ answer, setAnswer ] = useState( '' )
  const [ errorText, setErrorText ] = useState( '' )
  const [ isDisabled, setIsDisabled ] = useState( true )
  const dispatch = useDispatch()

  const setConfirm = () => {
    if ( answer.length > 0 && answer != securityAnswer ) {
      if ( AnswerCounter < 2 ) {
        AnswerCounter++
        setAnswerCounter( AnswerCounter )
      } else {
        setShowAnswer( true )
        setErrorText( '' )
        return
      }
      setErrorText( strings.Answerisincorrect )
    } else {
      setErrorText( '' )
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
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <StatusBar />
        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={{
              ...styles.modalInfoText,
              marginTop: wp( '1.5%' ),
              marginBottom: wp( '5%' ),
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            {strings.Toviewallaccounts}, <Text style={styles.boldItalicText}>{strings.Specifythe}</Text>
          </Text>

          <ScrollView
            style={{
              paddingLeft: wp( '6%' ),
              paddingRight: wp( '6%' ),
            }}
          >
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
                  borderColor: errorText == strings.Answerisincorrect ? Colors.red : Colors.borderColor,
                }}
                placeholder={strings.Enteranswer}
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
                keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
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
          </ScrollView>
          <View
            style={{
              marginBottom: hp( '13%' ),
              paddingLeft: wp( '6%' ),
              paddingRight: wp( '6%' ),
              marginTop:'auto'
            }}
          >
            <AppBottomSheetTouchableWrapper
              disabled={isDisabled}
              onPress={() => {
                setConfirm()
                if ( answer.trim() == securityAnswer.trim() ) {
                  dispatch( setShowAllAccount( true )
                  )
                  // props.navigation.popToTop( 3 )
                  props.navigation.navigate( 'AccountManagementRoot' )
                } else {
                  setErrorText( strings.Answerisincorrect )
                }
                setIsDisabled( false )
              }}
              style={{
                ...styles.questionConfirmButton,
                backgroundColor: isDisabled ? Colors.lightBlue : Colors.blue,
              }}
            >
              <Text style={styles.proceedButtonText}>{!errorText ? common.confirm : common.tryAgain}</Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
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
    fontFamily: Fonts.Medium,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Medium,
  },
  modalInfoText: {
    marginTop: hp( '3%' ),
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
    marginTop: hp( '2%' ),
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
  },
  questionConfirmButton: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
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
} )
