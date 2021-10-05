import React, { useEffect, useState, } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import commonStyle from '../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import SendStatusModalContents from '../../components/SendStatusModalContents'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import SendConfirmationContent from './SendConfirmationContent'
import DeviceInfo from 'react-native-device-info'
import { validateTwoFA } from '../../store/actions/accounts'
import ModalContainer from '../../components/home/ModalContainer'

export default function TwoFAValidation( props ) {
  const [ Elevation, setElevation ] = useState( 10 )
  const [ token, setToken ] = useState( '' )
  const [ tokenArray, setTokenArray ] = useState( [ '' ] )
  const [ SendUnSuccessBottomSheet, setSendUnSuccessBottomSheet ] = useState(
    React.createRef<BottomSheet>(),
  )
  const [ unsuccessModal, setUnsuccessModal ] = useState( false )
  const [ isConfirmDisabled, setIsConfirmDisabled ] = useState( true )

  const twoFAHelpFlags = useSelector( ( state ) => state.accounts.twoFAHelpFlags )

  useEffect( ()=>{
    if ( token && twoFAHelpFlags ) {
      const validationSucccessful = twoFAHelpFlags.twoFAValid
      if( validationSucccessful ){
        props.navigation.navigate( 'AccountDetails' )
      } else if( validationSucccessful === false ) {
        // SendUnSuccessBottomSheet.current.snapTo( 1 )
        setUnsuccessModal( true )
      }
    }
  }, [ twoFAHelpFlags ] )


  function onPressNumber( text ) {
    const tmpToken = [ ...tokenArray ]
    if ( text ) {
      tmpToken.push( text )
    } else {
      tmpToken.pop()
    }
    setTokenArray( tmpToken )
    if ( tmpToken.length > 0 ) {
      setToken( tmpToken.join( '' ) )
    }

    if( tmpToken.length > 6 ) setIsConfirmDisabled( false )
    else if( !isConfirmDisabled ) setIsConfirmDisabled( true )
  }

  const dispatch = useDispatch()

  const renderSendUnSuccessContents = () => {
    return (
      <SendConfirmationContent
        title={'2FA Validation Unsuccessful'}
        info={
          'Invalid 2FA token, please retry.'
        }
        isFromContact={false}
        recipients={[]}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          // if ( SendUnSuccessBottomSheet.current )
          // SendUnSuccessBottomSheet.current.snapTo( 0 )
          setUnsuccessModal( false )

          setIsConfirmDisabled( false )
        }}
        onPressCancel={() => {
          // if ( SendUnSuccessBottomSheet.current )
          // SendUnSuccessBottomSheet.current.snapTo( 0 )
          setUnsuccessModal( false )
          props.navigation.navigate( 'Home' )
        }}
        isUnSuccess={true}
        accountKind={''}
      />
    )
  }

  const renderSendUnSuccessHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          // if ( SendUnSuccessBottomSheet.current )
          //   SendUnSuccessBottomSheet.current.snapTo( 0 )
          setUnsuccessModal( false )
        }}
      />
    )
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={[ commonStyle.headerContainer, {
        backgroundColor: Colors.white
      } ]}>
        <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
          hitSlop={{
            top: 20, left: 20, bottom: 20, right: 20
          }}
        >
          <View style={commonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{
        ...styles.modalContentContainer, height: '100%'
      }}>
        <View
          style={{
            marginRight: wp( '8%' ),
            marginLeft: wp( '8%' ),
          }}
        >
          <View style={{
            ...styles.otpRequestHeaderView
          }}>
            <Text style={styles.modalTitleText}>
              {'Enter OTP to authenticate'}
            </Text>
            <Text style={{
              ...styles.modalInfoText, marginTop: hp( '1.5%' )
            }}>
              {
                'Please enter the OTP from the authenticator that you have set up'
              }
            </Text>
          </View>
          <View style={{
            marginBottom: hp( '2%' )
          }}>
            <View style={styles.passcodeTextInputView}>
              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={( input ) => {
                  this.textInput = input
                }}
                style={[
                  this.textInput && this.textInput.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={( value ) => {
                  onPressNumber( value )
                  if ( value ) this.textInput2.focus()
                }}
                onKeyPress={( e ) => {
                  if ( e.nativeEvent.key === 'Backspace' ) {
                    this.textInput.focus()
                  }
                }}
                autoCorrect={false}
                autoCompleteType="off"
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={( input ) => {
                  this.textInput2 = input
                }}
                style={[
                  this.textInput2 && this.textInput2.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={( value ) => {
                  onPressNumber( value )
                  if ( value ) this.textInput3.focus()
                }}
                onKeyPress={( e ) => {
                  if ( e.nativeEvent.key === 'Backspace' ) {
                    this.textInput.focus()
                  }
                }}
                autoCorrect={false}
                autoCompleteType="off"
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={( input ) => {
                  this.textInput3 = input
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={( value ) => {
                  onPressNumber( value )
                  if ( value ) this.textInput4.focus()
                }}
                onKeyPress={( e ) => {
                  if ( e.nativeEvent.key === 'Backspace' ) {
                    this.textInput2.focus()
                  }
                }}
                autoCorrect={false}
                autoCompleteType="off"
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={( input ) => {
                  this.textInput4 = input
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={( value ) => {
                  onPressNumber( value )
                  if ( value ) this.textInput5.focus()
                }}
                onKeyPress={( e ) => {
                  if ( e.nativeEvent.key === 'Backspace' ) {
                    this.textInput3.focus()
                  }
                }}
                autoCorrect={false}
                autoCompleteType="off"
              />

              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={( input ) => {
                  this.textInput5 = input
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={( value ) => {
                  onPressNumber( value )
                  if ( value ) this.textInput6.focus()
                }}
                onKeyPress={( e ) => {
                  if ( e.nativeEvent.key === 'Backspace' ) {
                    this.textInput4.focus()
                  }
                }}
                autoCorrect={false}
                autoCompleteType="off"
              />
              <TextInput
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType="number-pad"
                ref={( input ) => {
                  this.textInput6 = input
                }}
                style={[
                  this.textInput3 && this.textInput3.isFocused()
                    ? styles.textBoxActive
                    : styles.textBoxStyles,
                ]}
                onChangeText={( value ) => {
                  onPressNumber( value )
                }}
                onKeyPress={( e ) => {
                  if ( e.nativeEvent.key === 'Backspace' ) {
                    this.textInput5.focus()
                  }
                }}
                autoCorrect={false}
                autoCompleteType="off"
              />
            </View>
          </View>
          <View
            style={{
              marginBottom: hp( '8%' ),
              marginLeft: wp( '2%' ),
              marginRight: wp( '2%' ),
            }}
          >
            <Text style={{
              ...styles.modalInfoText
            }}>
              {
                'If you have not set up the authenticator yet, please see our FAQ section to see how to do it'
              }
            </Text>
          </View>
          <View style={{
            flexDirection: 'row', marginTop: 'auto'
          }}>
            <TouchableOpacity
              disabled={isConfirmDisabled}
              onPress={() => {
                setTimeout( () => {
                  setIsConfirmDisabled( true )
                }, 1 )
                dispatch( validateTwoFA( parseInt( token ) ) )
              }}
              style={{
                ...styles.confirmModalButtonView,
                elevation: Elevation,
                backgroundColor: isConfirmDisabled
                  ? Colors.lightBlue
                  : Colors.blue,
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ModalContainer visible={unsuccessModal} closeBottomSheet={() => {}} >
          {renderSendUnSuccessContents()}
        </ModalContainer>
        {/* <BottomSheet
          onCloseStart={() => {
            SendUnSuccessBottomSheet.current.snapTo( 0 )
          }}
          onCloseEnd={() => {
            setElevation( 10 )
          }}
          onOpenEnd={() => {
            setElevation( 0 )
          }}
          enabledInnerScrolling={true}
          ref={SendUnSuccessBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '65%' )
              : hp( '70%' ),
          ]}
          renderContent={renderSendUnSuccessContents}
          renderHeader={renderSendUnSuccessHeader}
        /> */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue( 13 ),
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp( '12%' ),
    width: wp( '12%' ),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp( '12%' ),
    width: wp( '12%' ),
    borderRadius: 7,
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
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
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
  otpRequestHeaderView: {
    marginTop: hp( '2%' ),
    marginBottom: hp( '2%' ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  confirmModalButtonView: {
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
    alignSelf: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: hp( '2.5%' ),
    marginBottom: hp( '2.5%' ),
  },
} )
