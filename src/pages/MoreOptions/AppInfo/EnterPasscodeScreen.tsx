import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'

import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { translations } from '../../../common/content/LocContext'
import { credsAuth, credsAuthenticated, switchReLogin } from '../../../store/actions/setupAndAuth'

export default function EnterPasscodeScreen( props ) {
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const login = translations[ 'login' ]
  const [ pin, setPin ] = useState( '' )
  const [ pinFlag ] = useState( true )
  function onPressNumber( text ) {
    let tmpPasscode = pin
    if ( pin.length < 4 ) {
      if ( text != 'x' ) {
        tmpPasscode += text
        setPin( tmpPasscode )
      }
    }
    if ( pin && text == 'x' ) {
      setPin( pin.slice( 0, -1 ) )
      setCheckAuth( false )
    }
  }
  const [ checkAuth, setCheckAuth ] = useState( false )

  const dispatch = useDispatch()
  const { reLogin, authenticationFailed } = useSelector(
    state => state.setupAndAuth,
  )

  useEffect( () => {
    if ( reLogin ) {
      setCheckAuth( false )
      dispatch( credsAuthenticated( false ) )
      props.onPressConfirm()
      // props.navigation.navigate( 'SecurityQuestion' )
      dispatch( switchReLogin( false, true ) )
    }
  }, [ reLogin ] )


  useEffect( () => {
    if( authenticationFailed === true && pin ){
      setCheckAuth( true )
    }
  }, [ authenticationFailed ] )

  return (
    <SafeAreaView style={{
      backgroundColor: Colors.backgroundColor
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {props.closeBottomSheet()}}
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
            marginBottom: wp( 3 ),
            paddingRight: wp( 10 )
          }}>{strings.Changeyourwallet}</Text>
        </View>
        <View style={{
          marginLeft: wp( 6 ), flexDirection: 'row', marginVertical: hp( 3 )
        }}>
          <Text style={styles.modalBoldText}>Step 2</Text>
          <Text style={{
            ...styles.modalInfoText,
          }}>{`: ${strings.ConfirmWalletPin}`}</Text>
        </View>
        <View>
          <View style={styles.passcodeTextInputView}>
            <View
              style={[
                pin.length == 0 && pinFlag == true
                  ? styles.textBoxActive
                  : styles.textBoxStyles,
              ]}
            >
              <Text
                style={[
                  pin.length == 0 && pinFlag == true
                    ? styles.textFocused
                    : styles.textStyles,
                ]}
              >
                {pin.length >= 1 ? (
                  <Text
                    style={{
                      fontSize: RFValue( 10 ),
                      textAlignVertical: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome
                      size={8}
                      name={'circle'}
                      color={Colors.black}
                    />
                  </Text>
                ) : pin.length == 0 && pinFlag == true ? (
                  <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                ) : (
                  ''
                )}
              </Text>
            </View>
            <View
              style={[
                pin.length == 1
                  ? styles.textBoxActive
                  : styles.textBoxStyles,
              ]}
            >
              <Text
                style={[
                  pin.length == 1 ? styles.textFocused : styles.textStyles,
                ]}
              >
                {pin.length >= 2 ? (
                  <Text style={{
                    fontSize: RFValue( 10 )
                  }}>
                    <FontAwesome
                      size={8}
                      name={'circle'}
                      color={Colors.black}
                    />
                  </Text>
                ) : pin.length == 1 ? (
                  <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                ) : (
                  ''
                )}
              </Text>
            </View>
            <View
              style={[
                pin.length == 2
                  ? styles.textBoxActive
                  : styles.textBoxStyles,
              ]}
            >
              <Text
                style={[
                  pin.length == 2 ? styles.textFocused : styles.textStyles,
                ]}
              >
                {pin.length >= 3 ? (
                  <Text style={{
                    fontSize: RFValue( 10 )
                  }}>
                    <FontAwesome
                      size={8}
                      name={'circle'}
                      color={Colors.black}
                    />
                  </Text>
                ) : pin.length == 2 ? (
                  <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                ) : (
                  ''
                )}
              </Text>
            </View>
            <View
              style={[
                pin.length == 3
                  ? styles.textBoxActive
                  : styles.textBoxStyles,
              ]}
            >
              <Text
                style={[
                  pin.length == 3 ? styles.textFocused : styles.textStyles,
                ]}
              >
                {pin.length >= 4 ? (
                  <Text style={{
                    fontSize: RFValue( 10 )
                  }}>
                    <FontAwesome
                      size={8}
                      name={'circle'}
                      color={Colors.black}
                    />
                  </Text>
                ) : pin.length == 3 ? (
                  <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                ) : (
                  ''
                )}
              </Text>
            </View>
          </View>
        </View>
        {checkAuth ? (
          <View style={{
            marginLeft: 'auto'
          }}>
            <Text style={styles.errorText}>
              {login.Incorrect}
            </Text>
          </View>
        ) : null}
      </View>
      {pin.length == 4 ? (
        <View style={{
          marginTop: 'auto'
        }}>
          <TouchableOpacity
            disabled={pin.length == 4 ? false : true}
            onPress={() => {
              dispatch( credsAuth( pin, true ) )
              //props.navigation.navigate('SettingGetNewPin')
              //PinChangeSuccessBottomSheet.current.snapTo(1);
            }}
            style={{
              ...styles.proceedButtonView,
              backgroundColor:
                pin.length == 4 ? Colors.blue : Colors.lightBlue,
            }}
          >
            <Text style={styles.proceedButtonText}>{common.proceed}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{
          marginTop: 'auto'
        }}></View>
      )}
      <View style={styles.statusIndicatorView}>
        <View style={styles.statusIndicatorInactiveView} />
        <View style={styles.statusIndicatorActiveView} />
        <View style={styles.statusIndicatorInactiveView} />
      </View>
      <View style={{
      }}>
        <View style={styles.keyPadRow}>
          <TouchableOpacity
            onPress={() => onPressNumber( '1' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '1' )}
            >
              1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPressNumber( '2' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '2' )}
            >
              2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPressNumber( '3' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '3' )}
            >
              3
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyPadRow}>
          <TouchableOpacity
            onPress={() => onPressNumber( '4' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '4' )}
            >
              4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPressNumber( '5' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '5' )}
            >
              5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPressNumber( '6' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '6' )}
            >
              6
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyPadRow}>
          <TouchableOpacity
            onPress={() => onPressNumber( '7' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '7' )}
            >
              7
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPressNumber( '8' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '8' )}
            >
              8
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPressNumber( '9' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '9' )}
            >
              9
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keyPadRow}>
          <View style={styles.keyPadElementTouchable}>
            <Text style={{
              flex: 1, padding: 15
            }}></Text>
          </View>
          <TouchableOpacity
            onPress={() => onPressNumber( '0' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( '0' )}
            >
              0
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onPressNumber( 'x' )}
            style={styles.keyPadElementTouchable}
          >
            <Text
              style={styles.keyPadElementText}
              onPress={() => onPressNumber( 'x' )}
            >
              <Ionicons
                name="ios-backspace"
                size={30}
                color={Colors.blue}
              />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '6%' ),
    marginBottom: hp( 1 ),
    // marginTop: hp( 9 )
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
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
    // width: wp( 30 ),
  },
  modalInfoText: {
    marginRight: wp( 4 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    textAlign: 'justify',
    letterSpacing: 0.6,
    lineHeight: 18
  },
  keyPadRow: {
    flexDirection: 'row',
    height: hp( '8%' ),
  },
  errorText: {
    fontFamily: Fonts.MediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11, 812 ),
    fontStyle: 'italic',
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp( '8%' ),
    fontSize: RFValue( 18 ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.Regular,
    fontStyle: 'normal',
  },
  proceedButtonView: {
    marginLeft: wp( 6 ),
    marginTop: hp( '3%' ),
    height: wp( '13%' ),
    width: wp( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: hp( '1%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue( 13 ),
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp( '13%' ),
    width: wp( '13%' ),
    borderRadius: 7,
    marginLeft: wp( 6 ),
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp( '13%' ),
    width: wp( '13%' ),
    borderRadius: 7,
    marginLeft: wp( 6 ),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: {
      width: 0, height: 3
    },
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    marginTop: hp( '1%' ),
    marginBottom: hp( '2%' ),
  },
  boldItalicText: {
    fontFamily: Fonts.MediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    marginLeft: wp( 6 ),
    marginTop: hp( '10%' ),
    fontFamily: Fonts.Regular,
  },
  headerInfoText: {
    marginTop: hp( '2%' ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: wp( 6 ),
    fontFamily: Fonts.Regular,
  },
} )
