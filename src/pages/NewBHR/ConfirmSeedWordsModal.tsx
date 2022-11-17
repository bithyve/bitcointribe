import React, { useState, useEffect, useCallback, useContext } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Dimensions,
  Keyboard,
  TouchableOpacity
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
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { hp as hp1, wp as wp1 } from '../../common/data/responsiveness/responsive'

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

  const arr = props.number !== undefined ? ( props.number < 3 ? Array.from( Array( 3 ).keys() ) : Array.from( Array( 4 ).keys() ) ) : []

  const n = props.number < 3 ? props.number : props.number - 3

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
        backgroundColor: 'white'
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={props.onPressIgnore}
          style={{
            width: wp1( 28 ), height: wp1( 28 ), borderRadius: wp( 14 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.golden, alignItems: 'center', justifyContent: 'center',
            marginTop: hp1( 10 ), marginRight: wp1( 10 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
          // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <Text style={{
          fontFamily: Fonts.RobotoSlabRegular,
          fontSize: RFValue( 14 ),
          color: Colors.textColorGrey,
          lineHeight: RFValue( 30 ),
          marginHorizontal: wp1( 30 ),
        }}>
          Backup Seed Words
        </Text>
        <Text style={{
          // marginBottom: wp( '%' ),
          color: Colors.blue,
          fontSize: RFValue( 18 ),
          fontFamily: Fonts.RobotoSlabRegular,
          lineHeight: RFValue( 30 ),
          marginHorizontal: wp1( 30 ),
          marginTop: hp1( 4 ),
          letterSpacing: RFValue( 0.01 )
        }} >{'Confirm Seed Words'}</Text>
        <Text style={{
          color: Colors.textColorGrey,
          fontSize: RFValue( 12 ),
          fontFamily: Fonts.RobotoSlabRegular,
          marginHorizontal: wp1( 30 ),
          marginTop: hp1( 2 ),
          lineHeight: RFValue( 18 ),
          letterSpacing: RFValue( 0.6 )
        }}>{'Key in the word exactly like it was displayed'}</Text>
        <Text style={{
          height: hp1( 16 ),
          color: Colors.greyTextColor,
          fontSize: RFValue( 12 ),
          fontFamily: Fonts.RobotoSlabRegular,
          marginHorizontal: wp1( 30 ),
          marginTop: hp1( 37 ),
          letterSpacing: RFValue( 0.48 ),
          lineHeight: RFValue( 12 ),
        }}>{'Enter the '}
          <Text style={{
            fontFamily: Fonts.RobotoSlabMedium,
            color: Colors.greyTextColor,
          }}>{getSeedNumber( props.seedNumber ) + ' word'}</Text></Text>
        <Shadow
          containerViewStyle={{
            marginTop: hp1( 15 ),
            marginLeft: wp1( 30 ),
            marginRight: wp1( 35 ),
            alignSelf: 'center',
          }}
          offset={ [ 7, 7 ] }
          distance={7}
          startColor={'rgba( 108, 108, 108, 0.07 )'}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingRight: 15,
              // borderColor: Colors.borderColor,
              backgroundColor: Colors.white,
              // borderWidth: 1,
              borderRadius: 10,
              width: wp( 79 ),
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
        </Shadow>

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
        <View style={{
          display: props.number === undefined ? 'none' : 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginHorizontal: wp( '8%' ),
          marginTop: hp1( 23 )
        }}>
          {
            arr.map( ( x ) => (
              <View key={x} style={{
                width: x === n ? wp1( 25 ) : wp1( 6 ),
                height: hp1( 5 ),
                backgroundColor: x === n ? '#EA4335' : '#EA433566',
                marginRight: wp1( 5 ),
                borderRadius: hp1( 2.5 ),
              }}/>
            ) )
          }
        </View>
        <View
          style={{
            height: hp( '14%' ),
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'flex-end',
          }}
        >
          <Shadow viewStyle={{
            ...styles.successModalButtonView,
            backgroundColor: props.buttonColor
              ? props.buttonColor
              : Colors.blue,
          }} distance={2}
          startColor={props.buttonShadowColor
            ? props.buttonShadowColor
            : Colors.shadowBlue }
          offset={[ 40, 10 ]}>
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
          </Shadow>

          {props.isIgnoreButton && (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressIgnore()}
              style={{
                height: hp1( 50 ),
                width: wp1( 120 ),
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: hp1( 29 )
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
                    : Colors.golden,
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
    fontFamily: Fonts.FiraSansMedium,
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
    height: hp1( 50 ),
    width: wp1( 290 ),
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.RobotoSlabRegular,
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
    height: hp1( 50 ),
    width: wp1( 120 ),
    paddingHorizontal: wp1( 36 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp1( 30 ),
    marginBottom:hp1 ( 29 ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.RobotoSlabMedium,
    textAlignVertical: 'center',
    lineHeight: RFValue( 16 )
  },
} )
