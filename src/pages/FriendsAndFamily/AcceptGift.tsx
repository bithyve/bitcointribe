import React, { useEffect, useRef, useState } from 'react'
import { Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import CheckingAcc from '../../assets/images/svgs/gift_icon_new.svg'
import { AccountType, DeepLinkEncryptionType, Gift } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import BottomInfoBox from '../../components/BottomInfoBox'
import idx from 'idx'
import { RootSiblingParent } from 'react-native-root-siblings'
import AccountShell from '../../common/data/models/AccountShell'
import { giftAccepted } from '../../store/actions/accounts'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import AddGiftToAccount from './AddGiftToAccount'
import DashedLargeContainer from './DahsedLargeContainer'
import ThemeList from './Theme'
import ModalContainer from '../../components/home/ModalContainer'
import LoaderModal from '../../components/LoaderModal'


export type Props = {
  navigation: any;
  closeModal: () => void;
  onGiftRequestAccepted: ( otp ) => void;
  onGiftRequestRejected: () => void;
  onPressAccept: ( key ) => void;
  onPressReject: () => void;
  walletName: string;
  giftAmount: string;
  inputType: string;
  hint: string;
  note: string,
  themeId: string
  giftId: string; //NOTE: here gift id stands for channelAddress of the gift(we should use more consistent naming to avoid confusion)
  isGiftWithFnF: boolean;
  isContactAssociated: boolean;
  version?: string;
  stopReset?:boolean;
  giftLoading:boolean;
};

const NUMBER_OF_INPUTS = 6

export default function AcceptGift( { giftLoading, stopReset, navigation, closeModal, onGiftRequestAccepted, onGiftRequestRejected, walletName, giftAmount, inputType, hint, note, themeId, giftId, isGiftWithFnF, isContactAssociated, onPressAccept, onPressReject, version }: Props ) {
  const dispatch = useDispatch()
  const [ WrongInputError, setWrongInputError ] = useState( '' )
  const [ isDisabled, setIsDisabled ] = useState( true )
  const [ PhoneNumber, setPhoneNumber ] = useState( '' )
  const [ EmailId, setEmailId ] = useState( '' )
  const [ onBlurFocus, setOnBlurFocus ] = useState( false )
  const [ loading, setLoading ] = useState( false )
  const [ passcode, setPasscode ] = useState( '' )
  const [ passcodeArray, setPasscodeArray ] = useState( [
    '',
    '',
    '',
    '',
    '',
    '',
  ] )
  const [ acceptGift, setAcceptGiftModal ] = useState( !isContactAssociated )
  const [ downloadedGiftid, seDownloadedGiftId ] = useState( '' )
  const [ confirmAccount, setConfirmAccount ] = useState( false )
  const [ giftAddedModal, setGiftAddedModel ] = useState( false )
  const toogleLoading = useSelector( ( state ) => state.doNotStore.toogleGiftLoading )
  const [ accType, setAccType ] = useState( AccountType.CHECKING_ACCOUNT )
  const [ accId, setAccId ] = useState( '' )
  const [ giftAcceptedModel, setGiftAcceptedModel ] = useState( false )
  const [ addGiftToAccountFlow, setAddGiftToAccountFlow ] = useState( false )
  const accountShells: AccountShell[] = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.accountShells ) )
  const acceptedGiftId = useSelector( ( state ) => state.accounts.acceptedGiftId )
  const gifts = useSelector( ( state ) => state.accounts.gifts ) || {
  }
  const [ acceptedGift, setAcceptedGift ] = useState( null )
  const addedGiftId = useSelector( ( state ) => state.accounts.addedGift )
  const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == accType && shell.primarySubAccount.instanceNumber === 0 )
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sendingAccount )

  const handleGiftAccept=( key )=>{
    setLoading( true )
    setTimeout( ()=>{
      onGiftRequestAccepted( key )
    }, 2000 )
  }

  useEffect( () => {
    setLoading( false )
    setIsDisabled( false )
  }, [ giftLoading, toogleLoading ] )


  useEffect( () => {
    setAccId( sourcePrimarySubAccount.id )
    // return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`
    setLoading( false )
  }, [ sourcePrimarySubAccount ] )

  useEffect( ()=> {
    Object.values( gifts ).forEach( ( gift: Gift ) => {
      if( gift.channelAddress === acceptedGiftId )
        setAcceptedGift( gift )
    } )
    setLoading( false )
  }, [ acceptedGiftId ] )

  useEffect( () => {
    if ( !inputType || inputType === DeepLinkEncryptionType.DEFAULT ) setIsDisabled( false )
    else setIsDisabled( true )
    setLoading( false )
  }, [ inputType ] )

  useEffect( () => {
    if ( giftId === acceptedGiftId ) {
      setAcceptGiftModal( false )
      const filterGift = Object.values( gifts ?? {
      } ).find( ( item ) =>  giftId === item.channelAddress )
      seDownloadedGiftId( filterGift?.id )
      setGiftAcceptedModel( true )
      setIsDisabled( false )
    }
    setLoading( false )
  }, [ acceptedGiftId ] )

  useEffect( () => {
    if ( giftId === addedGiftId ) {
      setConfirmAccount( false )
      setGiftAddedModel( true )
      setIsDisabled( false )
    }
    setLoading( false )
  }, [ addedGiftId ] )

  const getStyle = ( i ) => {
    if ( i == 0 ) {
      return this.textInput && this.textInput.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles
    }
    if ( i == 1 ) {
      return this.textInput2 && this.textInput2.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles
    }
    if ( i == 2 ) {
      return this.textInput3 && this.textInput3.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles
    }
    if ( i == 3 ) {
      return this.textInput4 && this.textInput4.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles
    }
    if ( i == 4 ) {
      return this.textInput5 && this.textInput5.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles
    }
    if ( i == 5 ) {
      return this.textInput6 && this.textInput6.isFocused()
        ? styles.textBoxActive
        : styles.textBoxStyles
    }
  }

  useEffect( ()=>{
    if ( passcodeArray[ 5 ] != '' ) {
      setIsDisabled( false )
    } else {
      setIsDisabled( true )
    }
  }, [ passcodeArray ] )

  function onPressNumber( text, i ) {
    const tempPasscode = passcodeArray
    tempPasscode[ i ] = text
    setTimeout( () => {
      setPasscodeArray( tempPasscode )
    }, 2 )
    if ( passcodeArray.join( '' ).length == 6 ) {
      setPasscode( tempPasscode.join( '' ) )
    }
    if ( i == 5 && tempPasscode[ i ] != '' ) {
      setIsDisabled( false )
    } else {
      setIsDisabled( true )
    }
  }
  const itemsRef = useRef<Array<TextInput | null>>( [] )

  const applyOTPCodeToInputs = ( code: string ) => {
    // split up code and apply it to all inputs
    const codeArray = code.split( '' )
    codeArray.forEach( ( char, index ) => {
      const input = itemsRef.current[ index ]
      if ( input ) {
        input.setNativeProps( {
          text: char,
        } )
      }
    } )
    // focus on last input as a cherry on top
    const lastInput = itemsRef.current[ itemsRef.current.length - 1 ]
    if ( lastInput ) {
      lastInput.focus()
      // otpCodeChanged(code);
    }
  }

  const handleClose=()=>{
    setAcceptGiftModal( false )
    closeModal()
    dispatch( giftAccepted( '' ) )
    if( !stopReset ){
      navigation.navigate( 'ManageGifts', {
        giftType: '0'
      } )
    }
  }

  const throttle=( func, delay )=>{
    let lastCall = 0
    return function( ...args ) {
      const now = new Date().getTime()
      if ( now - lastCall < delay ) {
        return
      }
      lastCall = now
      return func( ...args )
    }
  }

  const handleOTPInput=throttle( ( event: any, i : number )=>{
    const { text } = event.nativeEvent
    if ( text.length > 1 ) {
      applyOTPCodeToInputs( text )
      setPasscodeArray( text.split( '' ) )
      return
    }
    if ( text.length === 1 && i !== NUMBER_OF_INPUTS - 1 ) {
      const nextInput = itemsRef.current[ i + 1 ]
      if ( nextInput ) {
        nextInput.focus()
      }
    }
    // }
    // determine new value
    const newValues = [ ...passcodeArray ]
    newValues[ i ] = text

    // update state
    setPasscodeArray( newValues )
    // also call callback as a flat string
    // otpCodeChanged(newValues?.join(''));

  }, 300 )

  const getInputBox = () => {
    if ( inputType == DeepLinkEncryptionType.EMAIL ) {
      return (
        <View style={styles.textboxView}>
          <TextInput
            autoCapitalize={'none'}
            returnKeyLabel="Done"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            keyboardType={'email-address'}
            placeholderTextColor={Colors.borderColor}
            placeholder={`${hint.charAt( 0 )}XXXX@XXX${hint.substring(
              1,
            )}`}
            onChangeText={( text ) => {
              setEmailId( text )
            }}
            style={{
              flex: 1, fontSize: RFValue( 13 )
            }}
            onFocus={() => {
              if ( Platform.OS === 'ios' ) {
                setOnBlurFocus( true )
              }
            }}
            onBlur={() => {
              checkForValidation( EmailId )
              setOnBlurFocus( false )

            }}
            value={EmailId}
            autoCorrect={false}
            autoCompleteType="off"
          />
        </View>
      )
    } else if ( inputType == DeepLinkEncryptionType.NUMBER ) {
      return (
        <View style={styles.textboxView}>
          <View style={styles.separatorView} />
          <TextInput
            keyboardType={'numeric'}
            returnKeyLabel="Done"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            placeholderTextColor={Colors.borderColor}
            placeholder={`${hint?.charAt(
              0,
            )}XXX XXX X${hint?.substring( 1 )}`}
            onChangeText={( text ) => {
              setPhoneNumber( text )
              if ( text.length === 10 ) checkForValidation( text )
            }}
            style={{
              flex: 1
            }}
            onFocus={() => {
              if ( Platform.OS === 'ios' ) {
                setOnBlurFocus( true )
              }
            }}
            onBlur={() => {
              checkForValidation( PhoneNumber )
              setOnBlurFocus( false )
            }}
            value={PhoneNumber}
            autoCorrect={false}
            autoCompleteType="off"
          />
        </View>
      )
    } else if ( inputType === DeepLinkEncryptionType.OTP ){
      return (
        <View style={{
          flexDirection: 'row', marginBottom: wp( '5%' ), justifyContent: 'space-evenly'
        }}>
          {Array.from( {
            length: NUMBER_OF_INPUTS
          }, ( _, i ) => (
            <TextInput
              style={getStyle( i )}
              ref={( el ) => ( itemsRef.current[ i ] = el )}
              key={i}
              returnKeyType="done"
              returnKeyLabel="Done"
              keyboardType={
                Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
              }
              placeholder={'-'}
              value={passcodeArray[ i ]}
              defaultValue=""
              // first input can have a length of 6 because they paste their code into it
              onChange={( event ) => {handleOTPInput( event, i )}}
              onKeyPress={( event ) => {
                if ( event.nativeEvent.key === 'Backspace' ) {
                  // going backward:
                  if ( i !== 0 ) {
                    const previousInput = itemsRef.current[ i - 1 ]
                    if ( previousInput ) {
                      previousInput.focus()
                      return
                    }
                  }
                }
              }}
              // textContentType="oneTimeCode"
              autoCorrect={false}
              autoCompleteType="off"
            />
          ) )}
        </View>
      )
    } else if ( inputType == DeepLinkEncryptionType.LONG_OTP || inputType == DeepLinkEncryptionType.SECRET_PHRASE ) {
      return (
        <View style={styles.textboxView}>
          <TextInput
            autoCapitalize={'none'}
            returnKeyLabel="Done"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            placeholderTextColor={Colors.borderColor}
            onChangeText={( text ) => {
              setPasscode( text )
              setIsDisabled( false ) // TODO: place validation and then enable accept button
            }}
            placeholder={inputType === DeepLinkEncryptionType.LONG_OTP ? 'Enter OTP' : 'Enter answer'}
            style={{
              flex: 1, fontSize: RFValue( 14 )
            }}
            onFocus={() => {
              if ( Platform.OS === 'ios' ) {
                setOnBlurFocus( true )
              }
            }}
            onBlur={() => {
              setOnBlurFocus( false )
            }}
            value={passcode}
            autoCorrect={false}
            autoCompleteType="off"
          />
        </View>
      )
    }
  }

  const renderButton = ( text, buttonIsDisabled ) => {
    return (
      <TouchableOpacity
        disabled={!buttonIsDisabled ? buttonIsDisabled : isDisabled}
        onPress={() => {
          if ( text === 'Add to Account' ) {
            setGiftAcceptedModel( false )
            setAddGiftToAccountFlow( true )
          } else if( text === 'Accept' ) {
            setIsDisabled( true )
            if ( isGiftWithFnF ) {
              let key
              switch ( inputType ) {
                  case DeepLinkEncryptionType.NUMBER:
                    key = PhoneNumber
                    break

                  case DeepLinkEncryptionType.EMAIL:
                    key = EmailId
                    break

                  case DeepLinkEncryptionType.OTP:
                  case DeepLinkEncryptionType.LONG_OTP:
                  case DeepLinkEncryptionType.SECRET_PHRASE:
                    key = passcode
                    break
                  case DeepLinkEncryptionType.DEFAULT:
                    setIsDisabled( false )

                  default:
                    break
              }

              setTimeout( () => {
                setPhoneNumber( '' )
              }, 2 )
              onPressAccept( key )
            } else {
              if( inputType === DeepLinkEncryptionType.OTP ){
                let data = ''
                passcodeArray.map( ( item )=> {
                  data+=item
                } )
                handleGiftAccept( data )
              } else handleGiftAccept( passcode )
            }
          }
        }}
        style={{
          ...styles.buttonView,
          backgroundColor:
          Colors.blue,
        }}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    )
  }

  const renderGiftAcceptedtModal = () => {
    return (
      <>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setGiftAcceptedModel( false )
            closeModal()
          }
          }
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19}/>
        </TouchableOpacity>
        <View style={{
          marginLeft: wp( 6 ),
          marginVertical: hp( 3.5 )
        }}>
          <Text style={styles.modalTitleText}>Gift Sats Accepted</Text>
          {/* <Text style={{
            ...styles.modalInfoText,
          }}>The sats have been added to the account</Text> */}
        </View>
        <DashedLargeContainer
          titleText={'Gift Card'}
          titleTextColor={Colors.black}
          subText={walletName}
          extraText={acceptedGift?.note? acceptedGift.note: ''}
          amt={giftAmount}
          image={<CheckingAcc />}
          theme={getTheme()}
          version={version}
          isSend
          isAccept
        />
        <BottomInfoBox
          containerStyle={{
            paddingRight: wp( 15 ),
            backgroundColor: 'transparent'
          }}
          infoText={''}
        />
      </>
    )
  }

  const checkForValidation = ( text ) => {
    if ( inputType == DeepLinkEncryptionType.NUMBER ) {
      if ( text.length == 0 ) {
        setWrongInputError( '' )
        setIsDisabled( true )
      } else if ( text.length != 0 && text.length < 10 ) {
        setWrongInputError( 'Incorrect Phone Number, try again' )
        setIsDisabled( true )
      } else if ( !text.match( /^[0-9]+$/ ) ) {
        setWrongInputError( 'Incorrect Phone Number, try again' )
        setIsDisabled( true )
      } else if (
        text.length >= 3 &&
        text.charAt( 0 ) + text.substring( 8 ) != hint
      ) {
        setWrongInputError( 'Incorrect Phone Number, try again' )
        setIsDisabled( true )
      } else {
        setWrongInputError( '' )
        setIsDisabled( false )
      }
    }
    if ( inputType == DeepLinkEncryptionType.EMAIL ) {
      if ( text.length == 0 ) {
        setWrongInputError( 'Please enter Email, try again' )
        setIsDisabled( true )
      } else if (
        text.length >= 3 &&
        text.charAt( 0 ) +
          text.slice( text.length - 2 ) !=
          hint
      ) {
        setWrongInputError( 'Incorrect Email, try again' )
        setIsDisabled( true )
      } else {
        setWrongInputError( '' )
        setIsDisabled( false )
      }
    }
  }
  const getTheme = () => {
    // props.themeId
    const filteredArr = ThemeList.filter( ( item => item.id === themeId ) )
    return filteredArr[ 0 ]
  }
  const renderAcceptModal = () => {
    return (
      <>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <View>
          <View style={{
            marginLeft: wp( 6 ),
          }}>
            <Text style={styles.modalTitleText}>Accept Gift Sats</Text>
            {inputType !== DeepLinkEncryptionType.DEFAULT ?
              <Text style={{
                ...styles.modalInfoText,
              }}>{`The gift is encrypted with ${inputType == DeepLinkEncryptionType.EMAIL ? 'an email' : inputType == DeepLinkEncryptionType.NUMBER ? 'number' : 'an OTP'}`}</Text>
              : null}
          </View>
          <DashedLargeContainer
            titleText={'Gift Card'}
            titleTextColor={Colors.black}
            subText={walletName}
            extraText={note? note: ''}
            amt={giftAmount}
            image={<CheckingAcc height={60} width={60} />}
            theme={getTheme()}
            version={version}
            isAccept
          />
        </View>
        {inputType === DeepLinkEncryptionType.SECRET_PHRASE && hint &&
          <Text style={{
            color: Colors.gray4,
            fontSize: RFValue( 13 ),
            letterSpacing: 0.6,
            fontFamily: Fonts.Regular,
            marginHorizontal: wp( 5 ),
            marginVertical: wp( 2 ),
          }}>
            {`Hint: ${Buffer.from( hint, 'hex' ).toString( 'utf-8' )}`}
          </Text>
        }
        {( inputType === DeepLinkEncryptionType.LONG_OTP
        || inputType === DeepLinkEncryptionType.OTP
        ) &&
          <Text style={{
            color: Colors.gray4,
            fontSize: RFValue( 13 ),
            letterSpacing: 0.6,
            fontFamily: Fonts.Regular,
            marginHorizontal: wp( 5 ),
            marginVertical: wp( 2 ),
          }}>
            Enter OTP to accept
          </Text>
        }
        <View style={{
          marginHorizontal: wp( 5 )
        }}>
          <View style={{
            flexDirection: 'row'
          }}>
            {
              WrongInputError !== '' && (
                <Text style={styles.inputErrorText}>{WrongInputError}</Text>
              )
            }
          </View>
          {getInputBox()}
        </View>
        {/* )} */}

        <View style={{
          flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 6 ),
          marginTop: hp( 5 )
        }}>
          {renderButton( 'Accept', inputType == DeepLinkEncryptionType.DEFAULT ? false : true )}
          <TouchableOpacity
            onPress={() => {
              if ( isGiftWithFnF ) {
                onPressReject()
              } else {
                onGiftRequestRejected()
              }

            }}
            style={{
              height: wp( '12%' ),
              width: wp( '27%' ),
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: wp( '8%' ),
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.Medium,
                color: Colors.blue
              }}
            >
              {'Deny'}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  return (
    <RootSiblingParent>
      {loading && <View style={styles.modalContentContainer}>
        <ModalContainer
          onBackground={() => {}}
          visible={true}
          closeBottomSheet={() => {}}
        >
          <LoaderModal
            headerText={'Unpacking Your Gift'}
            messageText={
              'Your gift is currently being unpacked. Once this process is complete, you will be able to claim it in the gift section.'
            }
            messageText2={''}
            source={require( '../../assets/images/gift.gif' )}
          />
        </ModalContainer>
      </View>}
      {acceptGift &&
        <View style={styles.modalContentContainer}>
          {renderAcceptModal()}
        </View>
      }
      {giftAcceptedModel &&
        <View style={styles.modalContentContainer}>
          {renderGiftAcceptedtModal()}
        </View>
      }
      {addGiftToAccountFlow &&
      <AddGiftToAccount
        getTheme={getTheme}
        navigation={navigation}
        giftAmount={giftAmount}
        giftId={downloadedGiftid}
        closeModal={closeModal}
        onCancel={() =>{ setAddGiftToAccountFlow( false ); setGiftAcceptedModel( true )}}
      />
      }
    </RootSiblingParent>
  )
}

const styles = StyleSheet.create( {
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '1%' ),
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
  box: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.shadowBlue,
    marginTop: hp( '3%' ),
    marginLeft: wp( '4%' ),
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
  },
  successModalHeaderView: {
    flex: 1,
    marginTop: hp( '3%' ),
    marginBottom: hp( '3%' ),
    marginLeft: wp( '8%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  successModalAmountImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
    marginRight: 10,
    marginLeft: 10,
    // marginBottom: wp('1%'),
    resizeMode: 'contain',
  },
  phoneNumberInfoText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
    color: Colors.textColorGrey,
    marginBottom: wp( '5%' ),
  },
  inputErrorText: {
    fontFamily: Fonts.MediumItalic,
    fontSize: RFValue( 10 ),
    color: Colors.red,
    marginTop: wp( '2%' ),
    marginBottom: wp( '3%' ),
    marginLeft: 'auto',
  },
  textboxView: {
    flexDirection: 'row',
    paddingLeft: 5,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    marginBottom: wp( '5%' ),
    alignItems: 'center',
    marginTop: 10,
  },
  countryCodeText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    paddingRight: 15,
  },
  separatorView: {
    marginRight: 15,
    height: 25,
    width: 2,
    borderColor: Colors.borderColor,
    borderWidth: 1,
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




  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: wp( '14%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 15, height: 15
    // },
    backgroundColor: Colors.blue,
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Italic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Italic,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    marginTop: hp( 0.5 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    marginRight: wp( 12 ),
    letterSpacing: 0.6,
    marginBottom: hp( 2 )
  },
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.bgColor,
    paddingBottom: hp( 4 ),
  },
  rootContainer: {
    flex: 1
  },
  viewSectionContainer: {
    marginBottom: 16,
  },
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  floatingActionButtonContainer: {
    bottom: hp( 1.5 ),
    right: 0,
    marginLeft: 'auto',
    padding: hp( 1.5 ),
  },
} )

// export default AcceptGift

