import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import { withNavigation } from 'react-navigation'

function SecurityQuestion( props ) {

  const [ AnswerCounter, setAnswerCounter ] = useState( 0 )
  const securityQuestion = props.question ? props.question : ''
  const [ showAnswer, setShowAnswer ] = useState( false )
  const [ answer, setAnswer ] = useState( '' )
  const [ errorText, setErrorText ] = useState( '' )
  const [ isDisabled, setIsDisabled ] = useState( true )

  const setBackspace = ( event ) => {
    if ( event.nativeEvent.key == 'Backspace' ) {
      setErrorText( '' )
    }
  }

  useEffect( () => {
    if ( ( !errorText && !answer && answer ) || answer ) setIsDisabled( false )
    else setIsDisabled( true )
  }, [ answer, errorText ] )

  return (
    <View style={{
      ...styles.modalContentContainer, height: '100%'
    }}>
      <View style={styles.modalContentContainer}>
        <View>
          <View style={{
            flexDirection: 'row', padding: wp( '7%' )
          }}>
            <View style={{
              flex: 1, justifyContent: 'center'
            }}>
              <Text style={styles.modalTitleText}>
                Health Check{'\n'}Security Question
              </Text>
              <Text style={{
                ...styles.modalInfoText, marginTop: wp( '1.5%' )
              }}>
                Specify the answer{'\n'}as you did at
                the time of setting up the wallet
              </Text>
            </View>
          </View>
          <ScrollView style={{
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
                    errorText == 'Answer is incorrect'
                      ? Colors.red
                      : Colors.borderColor,
                }}
                placeholder={'Enter answer'}
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
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                // onFocus={() => props.onFocus()}
                // onBlur={() => props.onBlur()}
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
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  {answer}
                </Text>
              </View>
            )}
          </ScrollView>
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
              if ( answer.trim() ) {
                AsyncStorage.setItem(
                  'SecurityAnsTimestamp',
                  JSON.stringify( Date.now() ),
                ).then( () => {
                  props.onPressConfirm( answer )
                } )
              } else {
                setErrorText( 'Answer is incorrect' )
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
        </View>
      </View>
    </View>
  )
}

export default withNavigation( SecurityQuestion )

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
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
    alignItems: 'center',
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
