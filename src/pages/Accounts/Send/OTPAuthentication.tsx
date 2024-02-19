import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import commonStyle from '../../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch } from 'react-redux'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import SendConfirmationContent from '../SendConfirmationContent'
import { executeSendStage2, sendTxNotification } from '../../../store/actions/sending'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import {  refreshAccountShells } from '../../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import ModalContainer from '../../../components/home/ModalContainer'
import LoaderModal from '../../../components/LoaderModal'


export default function OTPAuthenticationScreen( { navigation, route } ) {
  const fromWallet = route.params?.fromWallet || false
  const txnPriority = route.params?.txnPriority
  const note = route.params?.note
  const [ Elevation, setElevation ] = useState( 10 )
  const [ token, setToken ] = useState( '' )
  const [ tokenArray, setTokenArray ] = useState( [ '' ] )
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const dispatch = useDispatch()
  const sendingState = useSendingState()
  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()
  const [ handleButton, setHandleButton ] = useState( true )
  const [ isConfirmDisabled, setIsConfirmDisabled ] = useState( true )

  function onPressNumber( text ) {
    const tmpToken = tokenArray
    if ( text ) {
      tmpToken.push( text )
    } else {
      tmpToken.pop()
    }
    setTokenArray( tmpToken )
    if ( tmpToken.length > 0 ) {
      setToken( tmpToken.join( '' ) )
    }
  }

  useEffect( () => {
    return () => {
      dismissBottomSheet()
    }
  }, [ navigation ] )

  const showSendSuccessBottomSheet = useCallback( () => {
    presentBottomSheet(
      <SendConfirmationContent
        title={'Sent Successfully'}
        info={'Transaction(s) successfully submitted'}
        infoText={'bitcoin successfully sent to Contact'}
        isFromContact={false}
        recipients={sendingState.selectedRecipients}
        // okButtonText={fromWallet ? 'Back to Wallet' : 'View Account'}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
          dismissBottomSheet()
          // dispatch( resetSendState() ) // need to delay reset as other background sagas read from the send state
          dispatch( refreshAccountShells( [ sourceAccountShell ], {
          } ) )
          // if( fromWallet ){
          //   navigation.navigate( 'WalletBackup' )
          // } else {
          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
          // }
        }}
        onPressCancel={dismissBottomSheet}
        isSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '67%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ] )

  const showSendFailureBottomSheet = useCallback( ( errorMessage: string | null ) => {
    presentBottomSheet(
      <SendConfirmationContent
        title={'Send Unsuccessful'}
        info={String( errorMessage )}
        isFromContact={false}
        recipients={sendingState.selectedRecipients}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={dismissBottomSheet}
        onPressCancel={() => {
          dismissBottomSheet()
          if( fromWallet ) {
            navigation.navigate( 'WalletBackup' )
          } else {
            navigation.dispatch(
              resetStackToAccountDetails( {
                accountShellID: sourceAccountShell.id,
              } )
            )
          }
        }}
        isUnSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '67%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ] )

  useEffect( () => {
    if ( !sendingState.sendST2.inProgress ) {
      setIsConfirmDisabled( false )
    }
  }, [ sendingState.sendST2 ] )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <View style={commonStyle.headerContainer}>
        <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
          }}
          hitSlop={{
            top: 20, left: 20, bottom: 20, right: 20
          }}
        >
          <View style={commonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
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
                dispatch( executeSendStage2( {
                  accountShell: sourceAccountShell,
                  txnPriority,
                  token: parseInt( token ),
                  note
                } ) )
              }}
              style={{
                ...styles.confirmModalButtonView,
                elevation: Elevation,
                backgroundColor: isConfirmDisabled
                  ? Colors.lightBlue
                  : Colors.blue,
              }}
            >
              {( !isConfirmDisabled && sendingState.sendST2.inProgress ) ||
              ( isConfirmDisabled && sendingState.sendST2.inProgress ) ? (
                  <ActivityIndicator color={Colors.white} size="small" />
              // setHandleButton(false)
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
              // setHandleButton(true)
                )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate( 'SubAccountTFAHelp', {
                  sourceAccountShell: sourceAccountShell
                } )
              }}
              style={{
                width: wp( '30%' ),
                height: wp( '13%' ),
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginLeft: 5,
              }}
            >
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue( 13 ),
                  fontFamily: Fonts.Regular,
                }}
              >
                Need Help?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ModalContainer visible={( !isConfirmDisabled && sendingState.sendST2.inProgress ) || ( isConfirmDisabled && sendingState.sendST2.inProgress )} closeBottomSheet = {()=>{}} onBackground = {()=>{}}>
          <LoaderModal
            headerText={'Sending...'}
          />
        </ModalContainer>
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
    fontFamily: Fonts.Medium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
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
    fontFamily: Fonts.Medium,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: hp( '2.5%' ),
    marginBottom: hp( '2.5%' ),
  },
} )
