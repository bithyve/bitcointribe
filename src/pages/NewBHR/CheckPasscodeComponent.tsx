import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  Image,
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
import BottomSheet from 'reanimated-bottom-sheet'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import Fonts from '../../common/Fonts'
import Toast from '../../components/Toast'
import { setOpenToApproval } from '../../store/actions/BHR'
import { setCloudBackupStatus } from '../../store/actions/cloud'
import { credsAuth } from '../../store/actions/setupAndAuth'

export default function CheckPasscodeComponent( props ) {
  const backupType = props.route.params?.backupType
  console.log( 'backupType', backupType )
  const dispatch = useDispatch()
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const common = translations[ 'common' ]
  const isMigrated = useSelector( ( state ) => state.preferences.isMigrated )
  const currentLevel: number = useSelector( ( state ) => state.bhr.currentLevel )
  const levelHealth = useSelector( ( state ) => state.bhr.levelHealth )
  const [ passcode, setPasscode ] = useState( '' )
  const [ Elevation, setElevation ] = useState( 10 )
  const [ passcodeFlag ] = useState( true )
  const [ checkAuth, setCheckAuth ] = useState( false )
  const [ attempts, setAttempts ] = useState( 0 )
  const [ loaderModal, setloaderModal ] = useState( false )

  const [ ErrorBottomSheet ] = useState(
    React.createRef<BottomSheet>(),
  )
  const [ processedLink, setProcessedLink ] = useState( null )
  const [ isDisabledProceed, setIsDisabledProceed ] = useState( false )
  const [ creationFlag, setCreationFlag ] = useState( false )
  const [ ranSeedWord, setRanSeedWord ] = useState( null )

  useEffect( () => {
    dispatch( setCloudBackupStatus( CloudBackupStatus.FAILED ) )
    dispatch( setOpenToApproval( false, [], null ) )
  }, [] )

  const onPressNumber = useCallback(
    ( text ) => {
      let tmpPasscode = passcode
      if ( passcode.length < 4 ) {
        if ( text != 'x' ) {
          tmpPasscode += text
          setPasscode( tmpPasscode )
        }
      }
      if ( passcode && text == 'x' ) {
        setPasscode( passcode.slice( 0, -1 ) )
        setCheckAuth( false )
      }
    },
    [ passcode ],
  )

  const { isAuthenticated, authenticationFailed } = useSelector(
    ( state ) => state.setupAndAuth,
  )

  useEffect( () => {
    if ( authenticationFailed && passcode ) {
      setCheckAuth( true )
      checkPasscode()
      setPasscode( '' )
      setAttempts( attempts + 1 )
    } else {
      setCheckAuth( false )
    }
  }, [ authenticationFailed ] )


  useEffect( () => {
    if ( isAuthenticated ) {
      // setloaderModal( false )
      // props.navigation.pop()
      redirectToNextScreen()
      setCreationFlag( true )
    }
  }, [ isAuthenticated, processedLink ] )

  const redirectToNextScreen=()=>{
    if( creationFlag )
      if( backupType==='borderWallet' ){
        props.navigation.navigate( 'PreviewPattern', {
          pattern: 'saddle hospital yard autumn side ticket feed gaze hair electric husband'
        } )
      }else{
        props.navigation.replace( 'BackupSeedWordsContent' )
      }

  }

  useEffect( () => {
    if ( passcode.length == 4 ) {
      setIsDisabledProceed( false )
    }
  }, [ passcode ] )

  const handleLoaderMessages = ( passcode ) => {
    setTimeout( () => {
      dispatch( credsAuth( passcode ) )
    }, 2 )
  }

  const checkPasscode = () => {
    if ( checkAuth ) {
      setTimeout( () => {
        // loaderBottomSheet.current.snapTo( 0 )
        setloaderModal( false )
      }, 300 )

      return (
        <View style={{
          marginLeft: 'auto'
        }}>
          <Text style={styles.errorText}>{strings.Incorrect}</Text>
        </View>
      )
    }
  }

  const onPasscodeReset= () => {
    setCheckAuth( false )
    setAttempts( 0 )
    Toast( 'Passcode reset successfully, please login with new passcode' )
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
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={{
              height: wp( '10%' ), width: wp( '10%' ), alignItems: 'center',
              marginTop: hp( '5%' ), marginStart: hp( '1%' )
            }}
          >
            <Image
              source={require( '../../assets/images/icons/icon_back.png' )}
              style={{
                width: wp( '5%' ), height: wp( '2%' ),
                tintColor: Colors.homepageButtonColor
              }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>{'Confirm Passcode'}</Text>
          <View>
            <Text style={styles.headerInfoText}>
              {'Please enter your passcode to view your backup'}
              {/* <Text style={styles.headerInfoText}>{'passcode to view your backup'}</Text> */}
            </Text>
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
              {checkPasscode()}
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <TouchableOpacity
              disabled={passcode.length !==4}
              activeOpacity={0.6}
              onPress={() => {
                setCheckAuth( false )
                setTimeout( () => {
                  setIsDisabledProceed( true )
                  setElevation( 0 )
                }, 2 )
                setTimeout( () => setloaderModal( true ), 2 )
                handleLoaderMessages( passcode )

                redirectToNextScreen()
                setCreationFlag( true )
              }}
            >
              <View
                style={{
                  ...styles.proceedButtonView,
                  backgroundColor: isDisabledProceed
                    ? Colors.lightBlue
                    : Colors.blue,
                }}
              >
                <Text style={styles.proceedButtonText}>{common.proceed}</Text>
              </View>
            </TouchableOpacity>

            {/* {
              attempts >= 3&&(
                <TouchableOpacity
                  style={{
                    ...styles.proceedButtonView,
                    elevation: Elevation,
                    marginHorizontal: 15,
                  }}
                  onPress={()=> {

                  }}>
                  <Text style={{
                    color: Colors.blue,
                    fontFamily: Fonts.Medium
                  }}>{strings.ForgotPasscode}</Text>
                </TouchableOpacity>
              )
            } */}
          </View>
        </View>

        <View style={{
          marginTop: 'auto', marginBottom: 20
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
    marginTop: hp( '15%' ),
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
  boldItalicText: {
    fontFamily: Fonts.MediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  errorText: {
    fontFamily: Fonts.MediumItalic,
    color: Colors.tomatoRed,
    fontSize: RFValue( 10 ),
    fontStyle: 'italic',
    letterSpacing: 0.5
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    marginLeft: 20,
    // marginTop: hp( '10%' ),
    fontFamily: Fonts.Regular,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
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
    width: 'auto',
  },
} )
