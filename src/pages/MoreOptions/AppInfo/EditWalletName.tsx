import React, { useState, useEffect } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Platform
} from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import BottomInfoBox from '../../../components/BottomInfoBox'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import { translations } from '../../../common/content/LocContext'

const ALLOWED_CHARACTERS_REGEXP = /^[A-Za-z]+$/

function validateAllowedCharacters( answer: string ): boolean {
  return answer == '' || ALLOWED_CHARACTERS_REGEXP.test( answer )
}

export default function EditWalletName( props ) {
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const login = translations[ 'login' ]
  const [ answerInputStyle, setAnswerInputStyle ] = useState( styles.inputBox )
  const [ confirmInputStyle, setConfirmAnswerInputStyle ] = useState(
    styles.inputBox,
  )
  const [ answerError, setAnswerError ] = useState( '' )
  const [ tempAns, setTempAns ] = useState( '' )
  const [ confirmAnswer, setConfirmAnswer ] = useState( '' )
  const [ isEditable, setIsEditable ] = useState( true )
  const [ answer, setAnswer ] = useState( '' )
  const [ confirmAnswerTextInput ] = useState( React.createRef() )
  const [ Elevation, setElevation ] = useState( 10 )

  const handleSubmit = () => {
    setConfirmAnswer( tempAns )
    if ( answer && tempAns && tempAns != answer ) {
      setAnswerError( login.Answersdonotmatch )
    } else if (
      validateAllowedCharacters( answer ) == false ||
      validateAllowedCharacters( tempAns ) == false
    ) {
      setAnswerError( login.Answersmust )
    } else {
      setTimeout( () => {
        setAnswerError( '' )
      }, 2 )
    }
  }

  const setButtonVisible = () => {
    return (
      <View
        style={{
          paddingLeft: wp( '6%' ),
          paddingRight: wp( '6%' ),
          height: hp( '9%' ),
          justifyContent: 'center',
          flexDirection: 'row'
        }}
      >
        <TouchableOpacity
          disabled={!(
              answer.trim() && answerError.length === 0
          )}
          onPress={()=>props.onPressConfirm( answer )}
          style={{
            ...styles.buttonView, backgroundColor: !(
                  answer.trim() && answerError.length === 0
            ) ? Colors.lightBlue : Colors.blue, elevation: Elevation
          }}
        >
          <Text style={styles.buttonText}>{common.save}</Text>
        </TouchableOpacity>
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
              fontFamily: Fonts.FiraSansMedium,
              color: Colors.blue
            }}
          >
            {'Need Help?'}
          </Text>
        </AppBottomSheetTouchableWrapper> */}
      </View>
    )
  }

  return (
    <SafeAreaView style={{
      backgroundColor: Colors.bgColor
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => props.closeBottomSheet() }
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19} />
      </TouchableOpacity>
      <View style={{
        alignSelf: 'baseline'
      }}>
        <View style={{
          marginLeft: wp( 6 ),
        }}>
          <Text style={styles.modalTitleText}>{strings.EditWalletName}</Text>
          <Text style={{
            ...styles.modalInfoText,
            marginTop: wp( 1.5 ),
            paddingRight: wp( 10 )
          }}>{strings.Changeyourwallet}</Text>
        </View>
        <View style={{
          marginLeft: wp( 6 ), flexDirection: 'row', marginVertical: hp( 5 )
        }}>
          <Text style={styles.modalBoldText}>{strings.NewWalletName}</Text>
        </View>
        <View
          style={{
            ...answerInputStyle,
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: answerError ? Colors.red : Colors.white,
            backgroundColor: Colors.white,
            width: wp( 80 ),

          }}
        >
          <TextInput
            maxLength={24}
            style={styles.modalInputBox}
            placeholder={strings.Enternewwalletname}
            placeholderTextColor={Colors.borderColor}
            value={answer}
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
              text = text.replace( /[^A-Za-z]/g, '' )
              setAnswer( text )
            }}
            onFocus={() => {
              // setShowNote( false )
              setAnswerInputStyle( styles.inputBoxFocused )
              if ( answer.length > 0 ) {
                setAnswer( '' )
              }
            }}
            onBlur={() => {
              // setShowNote( true )
              setAnswerInputStyle( styles.inputBox )
              handleSubmit()
            }}
          />
          {/* {answer ? (
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
          ) : null} */}
        </View>
        <View
          // style={{
          //   ...confirmInputStyle,
          //   marginBottom: 15,
          //   flexDirection: 'row',
          //   alignItems: 'center',
          //   paddingRight: 15,
          //   marginTop: 10,
          //   borderColor: answerError ? Colors.red : Colors.white,
          //   backgroundColor: Colors.white,
          //   width: wp( 80 )
          // }}
        >
          {/* <TextInput
            style={styles.modalInputBox}
            ref={confirmAnswerTextInput}
            placeholder={strings.Confirmnewwalletname}
            placeholderTextColor={Colors.borderColor}
            value={tempAns}
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
            }}
            onSubmitEditing={handleSubmit}
            onFocus={() => {
              // setShowNote( false )
              setConfirmAnswerInputStyle( styles.inputBoxFocused )
              if ( tempAns.length > 0 ) {
                setTempAns( '' )
                setAnswerError( '' )
                setConfirmAnswer( '' )
              }
            }}
            onBlur={() => {
              // setShowNote( true )
              setConfirmAnswerInputStyle( styles.inputBox )
              handleSubmit()
            }}
          /> */}
          {/* {tempAns ? (
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
          ) : null} */}

        </View>
      </View>

      <View style={styles.statusIndicatorView}>

        <View style={styles.statusIndicatorInactiveView} />
        <View style={styles.statusIndicatorInactiveView} />
        <View style={styles.statusIndicatorActiveView} />
      </View>
      <BottomInfoBox
        backgroundColor={Colors.backgroundColor}
        title={common.note}
        infoText={
          strings.acrossyour
        }
      />
      {setButtonVisible()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  helpText: {
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
    marginRight: wp( 5 ),
    alignSelf: 'flex-end',
    width: wp( '72%' ),
    textAlign: 'right'
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
    backgroundColor: Colors.backgroundColor1,
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
    width: '80%'

  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 2 ),
    marginTop: hp( 3 )
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
    fontFamily: Fonts.FiraSansMedium,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    // width: wp( 30 ),
  },
  modalInfoText: {
    marginRight: wp( 4 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    letterSpacing: 0.6,
    lineHeight: 18
  },
} )
