import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../../../../common/Colors'
import Fonts from '../../../../common/Fonts'
import { setShowAllAccount } from '../../../../store/actions/accounts'

import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { translations } from '../../../../common/content/LocContext'
import { hp } from '../../../../common/data/responsiveness/responsive'
import CommonStyles from '../../../../common/Styles/Styles'
import HeaderTitle from '../../../../components/HeaderTitle'
import { credsAuth, credsAuthenticated, switchReLogin } from '../../../../store/actions/setupAndAuth'

export default function EnterPasscodeScreen( props ) {
  const common  = translations[ 'common' ]
  const strings  = translations[ 'login' ]
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

  const { security } = useSelector(
    state => state.storage.wallet,
  )

  useEffect( () => {
    if ( reLogin ) {
      setCheckAuth( false )
      dispatch( credsAuthenticated( false ) )
      if( security && security.question ) {
        props.navigation.navigate( 'SecurityQuestion' )
        dispatch( switchReLogin( false, true ) )
      } else {
        dispatch( setShowAllAccount( true ) )
        props.navigation.navigate( 'AccountManagementRoot' )
        dispatch( switchReLogin( false, true ) )
      }
    }
  }, [ reLogin ] )


  useEffect( () => {
    if( authenticationFailed === true && pin ){
      setCheckAuth( true )
    }
  }, [ authenticationFailed ] )

  const [] = useState( false )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.pop()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerWrapper}>
        <HeaderTitle
          firstLineTitle={'Show All Account'}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
      </View>
      <View style={{
        alignSelf: 'baseline'
      }}>
        <View>
          <Text style={styles.headerInfoText}>
            {strings.Toviewallaccounts},{' '}
            <Text style={styles.boldItalicText}>{strings.confirmpin}</Text>
          </Text>
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
              {strings.Incorrectpasscode}
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
          >
            <View
              style={{
                ...styles.proceedButtonView,
                backgroundColor:
                  pin.length == 4 ? Colors.blue : Colors.lightBlue,
              }}
            >
              <Text style={styles.proceedButtonText}>{common.proceed}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{
          marginTop: 'auto'
        }}></View>
      )}

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
  keyPadRow: {
    flexDirection: 'row',
    height: heightPercentageToDP( '8%' ),
  },
  errorText: {
    fontFamily: Fonts.MediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11, 812 ),
    fontStyle: 'italic',
  },
  keyPadElementTouchable: {
    flex: 1,
    height: heightPercentageToDP( '8%' ),
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
    marginTop: heightPercentageToDP( '4%' ),
    height: widthPercentageToDP( '13%' ),
    width: widthPercentageToDP( '30%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: heightPercentageToDP( '5%' ),
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
    height: widthPercentageToDP( '13%' ),
    width: widthPercentageToDP( '13%' ),
    borderRadius: 7,
    marginLeft: 20,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: widthPercentageToDP( '13%' ),
    width: widthPercentageToDP( '13%' ),
    borderRadius: 7,
    marginLeft: 20,
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
    marginTop: heightPercentageToDP( '1%' ),
    marginBottom: heightPercentageToDP( '4.5%' ),
  },
  boldItalicText: {
    fontFamily: Fonts.MediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    marginLeft: 20,
    marginTop: heightPercentageToDP( '10%' ),
    fontFamily: Fonts.Regular,
  },
  headerInfoText: {
    marginTop: heightPercentageToDP( '2%' ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
  },
  headerWrapper:{
    marginBottom: hp( 20 )
  }
} )
