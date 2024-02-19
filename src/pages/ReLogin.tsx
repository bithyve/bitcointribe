import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { credsAuth, switchReLogin } from '../store/actions/setupAndAuth'

export default function Login( props ) {
  const pattern = props.route.params?.pattern
  const isValidate = props.route.params?.isValidate || false
  const viewPattern = props.route.params?.viewPattern || false
  const [ passcode, setPasscode ] = useState( '' )
  const [ passcodeFlag, setPasscodeFlag ] = useState( true )
  const [ checkAuth, setCheckAuth ] = useState( false )
  const [ passcodeCheck, setPasscodeCheck ] = useState( false )

  function onPressNumber( text ) {
    let tmpPasscode = passcode
    if ( passcode.length < 4 ) {
      if ( text != 'x' ) {
        tmpPasscode += text
        setPasscode( tmpPasscode )
        setCheckAuth( false )
      }
    }
    if ( passcode && text == 'x' ) {
      setPasscode( passcode.slice( 0, -1 ) )
      setCheckAuth( false )
    }
  }

  const dispatch = useDispatch()
  const { reLogin, isAuthenticated, authenticationFailed } = useSelector(
    state => state.setupAndAuth,
  )



  useEffect( () => {
    if( reLogin && viewPattern){
      props.navigation.replace( 'PreviewPattern', {
        pattern: pattern,
        isValidate: isValidate,
        payload:  props.route.params?.payload
      } )
      return
    }
    if ( reLogin && !viewPattern ) {
      if ( props.route.params?.isPasscodeCheck ){
        if( props.route.params?.onPasscodeVerify ) props.route.params?.onPasscodeVerify( )
        props.navigation.goBack() }
      else props.navigation.pop( 2 )
      dispatch( switchReLogin( false, true ) )
    }
  }, [ reLogin ] )


  useEffect( () => {
    if ( authenticationFailed ) {
      setCheckAuth( true )
      setPasscode( '' )
    } else {
      setCheckAuth( false )
    }
  }, [ authenticationFailed ] )

  useEffect( () => {
    if( isAuthenticated && passcodeCheck )
      if( isAuthenticated ){
        props.navigation.navigate( 'PreviewPattern', {
          pattern: pattern,
          isValidate: isValidate
        } )
      }
  }, [ isAuthenticated ] )

  const checkReloginNext = () => {
    setTimeout( () => {
      setCheckAuth( false )
      setPasscodeCheck( true )
      if( viewPattern ){ //Adding this for proper working of ViewForgetPattern flow.
        dispatch( credsAuth( passcode, true ) )
      }else{
        dispatch( credsAuth( passcode ) )
      }
    }, 2 )
  }

  const loginNext = () => {
    setCheckAuth( false )
    dispatch( credsAuth( passcode, true ) )
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar />
      <View style={{
        flex: 1
      }}>
        <View style={{
        }}>
          <Text style={[ styles.headerTitleText, {
            fontSize: isValidate? RFValue( 20 ) : RFValue( 25 )
          } ]}>{ isValidate? 'Confirm Passcode' : 'Welcome back'}</Text>
          <View>
            {isValidate?
              <Text style={styles.headerInfoText}>Please enter your passcode to view your pattern</Text>
              :
              <Text style={styles.headerInfoText}>
              Please enter your{' '}
                <Text style={styles.boldItalicText}>passcode</Text>
              </Text>
            }
            <View style={{
              alignSelf: 'baseline'
            }}>
              <View style={styles.passcodeTextInputView}>
                <View
                  style={[
                    passcode.length == 0 && passcodeFlag == true
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 0 && passcodeFlag == true
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 1 ? (
                      <Text
                        style={{
                          fontSize: RFValue( 10 ),
                          textAlignVertical: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 0 && passcodeFlag == true ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 1
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 1
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 2 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 1 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 2
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 2
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 3 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 2 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 3
                      ? styles.textBoxActive
                      : styles.textBoxStyles,
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 3
                        ? styles.textFocused
                        : styles.textStyles,
                    ]}
                  >
                    {passcode.length >= 4 ? (
                      <Text style={{
                        fontSize: RFValue( 10 )
                      }}>
                        <FontAwesome
                          size={10}
                          name={'circle'}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 3 ? (
                      <Text style={styles.passcodeTextInputText}>{'|'}</Text>
                    ) : (
                      ''
                    )}
                  </Text>
                </View>
              </View>
              {passcode.length > 4 && checkAuth ? (
                <View style={{
                  marginLeft: 'auto'
                }}>
                  <Text style={styles.errorText}>
                    Incorrect passcode, try again!
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          { passcode.length == 4 ? (
            <View>
              <TouchableOpacity
                disabled={passcode.length == 4 ? false : true}
                onPress={() => isValidate  ? checkReloginNext() : loginNext()}
                style={{
                  ...styles.proceedButtonView,
                  backgroundColor:
                    passcode.length == 4 ? Colors.blue : Colors.lightBlue,
                }}
              >
                <Text style={styles.proceedButtonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={{
          marginTop: 'auto'
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
                <Ionicons name="ios-backspace" size={30} color={Colors.blue} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp( '13%' ),
    width: wp( '13%' ),
    borderRadius: 7,
    marginLeft: 20,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  textBoxActive: {
    height: wp( '13%' ),
    width: wp( '13%' ),
    borderRadius: 7,
    marginLeft: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 3
    },
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
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
  keyPadRow: {
    flexDirection: 'row',
    height: hp( '8%' ),
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
    marginLeft: 20,
    marginTop: hp( '6%' ),
    height: wp( '13%' ),
    width: wp( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  errorText: {
    fontFamily: Fonts.MediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11 ),
    fontStyle: 'italic',
  },
  boldItalicText: {
    fontFamily: Fonts.MediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  headerTitleText: {
    color: Colors.blue,
    marginLeft: 20,
    marginTop: hp( '10%' ),
    fontFamily: Fonts.Regular,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue( 13 ),
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    marginTop: hp( '4.5%' ),
    marginBottom: hp( '1.5%' ),
    width: 'auto'
  },
} )
