import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Dimensions,
  Keyboard
} from 'react-native'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from '../../components/BottomInfoBox'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { LocalizationContext } from '../../common/content/LocContext'
import { Shadow } from 'react-native-shadow-2'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import LinearGradient from 'react-native-linear-gradient'

export default function ConfirmSeedWordsModal( props ) {
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]

  const windowHeight = Dimensions.get( 'window' ).height

  const [ word, setWord ]=useState( '' )
  const getSeedNumber = ( seedNumber )=>{
    switch( seedNumber ){
        case 1: return 'first (01)'
        case 2: return 'second (02)'
        case 3: return 'third (03)'
        case 4: return 'fourth (04)'
        case 5: return 'fifth (05)'
        case 6: return 'sixth (06)'
        case 7: return 'seventh (07)'
        case 8: return 'eighth (08)'
        case 9: return 'ninth (09)'
        case 10: return 'tenth (10)'
        case 11: return 'eleventh (11)'
        case 12: return 'twelfth (12)'
    }
  }
  const getHint = ( seedNumber )=>{
    switch( seedNumber ){
        case 1: return 'first'
        case 2: return 'second'
        case 3: return 'third'
        case 4: return 'fourth'
        case 5: return 'fifth'
        case 6: return 'sixth'
        case 7: return 'seventh'
        case 8: return 'eighth'
        case 9: return 'ninth'
        case 10: return 'tenth'
        case 11: return 'eleventh'
        case 12: return 'twelfth'
    }
  }

  return (
    <View style={{
      // flex: 1,
      backgroundColor: Colors.backgroundColor,
    }}>
      {/* <KeyboardAwareScrollView
        resetScrollToCoords={{
          x: 0, y: 0
        }}
        scrollEnabled={false}
        // style={styles.rootContainer}
        style={{
          backgroundColor: Colors.backgroundColor,
          height: 'auto'
        }}
      > */}
      <View style={{
        // height: hp( '72%' ),
        paddingHorizontal:8,
        paddingTop:8
      }}>
        <Text style={{
          // marginBottom: wp( '%' ),
          color: Colors.blue,
          fontSize: RFValue( 18 ),
          fontFamily: Fonts.Regular,
          marginHorizontal: wp( '5%' ),
          marginTop: 30
        }} >{'Confirm Backup Phrase'}</Text>
        <Text style={{
          color: Colors.lightTextColor,
          fontSize: RFValue( 11 ),
          fontFamily: Fonts.Regular,
          marginHorizontal: wp( '5%' ),
          marginTop: 5
        }}>{'Enter the word exactly like it was displayed'}</Text>
        <Text style={{
          color: Colors.lightTextColor,
          fontSize: RFValue( 14 ),
          fontFamily: Fonts.Regular,
          marginHorizontal: wp( '5%' ),
          marginTop: RFValue( 25 )
        }}>{'Enter the '}
          <Text style={{
            fontFamily: Fonts.Medium
          }}>{getSeedNumber( props.seedNumber ) + ' word'}</Text></Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 15,
            borderColor: Colors.borderColor,
            marginTop: 10,
            marginHorizontal: wp( '5%' ),
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderRadius: 10
          }}
        >
          <TextInput
            style={styles.modalInputBox}
            placeholder={`Enter ${getHint( props.seedNumber )} word`}
            placeholderTextColor={Colors.borderColor}
            value={word}
            // autoCompleteType="off"
            textContentType="none"
            returnKeyType='done'
            autoCorrect={false}
            // editable={isEditable}
            autoCapitalize="none"
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={( text ) => {
              setWord( text.trim() )
            }}
            // onFocus={() => {
            //   if ( word.length > 0 ) {
            //     setWord( '' )
            //   }
            // }}
          />
        </View>

        { props.bottomBoxInfo && <View style={{
          marginTop: hp( '2%' ),
          marginBottom: hp( 1 ),
          marginLeft: wp ( '2%' )
        }}>
          <BottomInfoBox
            title={''}
            infoText={'If you don’t have the words written down you may choose to start over'}
            italicText={''}
            backgroundColor={Colors.white}
          />
        </View>
        }
        <View
          style={{
            height: hp( '12%' ),
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'flex-end',
          }}
        >
          <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            locations={[ 0.2, 1 ]}
            style={{
              ...styles.successModalButtonView,
              backgroundColor: props.buttonColor
                ? props.buttonColor
                : Colors.blue,
            }}
          >
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressProceed( word )}
              style={{
                // ...styles.successModalButtonView,
                shadowColor: props.buttonShadowColor
                  ? props.buttonShadowColor
                  : Colors.shadowBlue,

              }}
              delayPressIn={0}
            >
              <Text
                style={{
                  ...styles.proceedButtonText,
                  color: props.buttonTextColor
                    ? props.buttonTextColor
                    : Colors.white,
                }}
              >
                {props.proceedButtonText}
              </Text>
            </AppBottomSheetTouchableWrapper>
          </LinearGradient>

          {props.isIgnoreButton && (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressIgnore()}
              style={{
                height: wp( '12%' ),
                width: wp( '27%' ),
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'center',
                // position: 'absolute',
                // left: wp( 53 )
              }}
              delayPressIn={0}
            >
              <Text
                style={{
                  ...styles.proceedButtonText,
                  color: props.buttonTextColor
                    ? props.buttonTextColor
                    : Colors.blue,
                }}
              >
                {props.cancelButtonText ? props.cancelButtonText : common.ignore}
              </Text>
            </AppBottomSheetTouchableWrapper>
          )}
        </View>
      </View>
      {/* </KeyboardAwareScrollView> */}
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
    fontFamily: Fonts.Medium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: hp( 2 ),
    alignItems: 'center',
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    paddingLeft: 15,

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
  successModalButtonView: {
    height: wp( '12%' ),
    minWidth: wp( '40%' ),
    paddingLeft: wp( '5%' ),
    paddingRight: wp( '5%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
    marginBottom:hp ( '3%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )
