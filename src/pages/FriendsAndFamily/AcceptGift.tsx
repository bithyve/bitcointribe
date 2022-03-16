import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Keyboard, Alert } from 'react-native'
import BottomInfoBox from '../../components/BottomInfoBox'
import {  useDispatch, useSelector } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AccountType, DeepLinkEncryptionType, Gift, NetworkType, ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CheckingAcc from '../../assets/images/svgs/gift_icon_new.svg'

import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import DashedContainer from '../FriendsAndFamily/DashedContainer'
import Illustration from '../../assets/images/svgs/illustration.svg'
import idx from 'idx'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSpendableBalanceForAccountShell from '../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import DashedLargeContainer from './DahsedLargeContainer'
import ThemeList from './Theme'
import { giftAccepted } from '../../store/actions/accounts'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import { RootSiblingParent } from 'react-native-root-siblings'
import AccountSelection from './AccountSelection'
import { associateGift } from '../../store/actions/trustedContacts'
import DashedContainerSmall from './DashedContainerSmall'
import { resetStackToAccountDetails,  } from '../../navigation/actions/NavigationActions'
import AccountSelected from './AccountSelected'
import AddGiftToAccount from './AddGiftToAccount'


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
  version?: string
};


export default function AcceptGift( { navigation, closeModal, onGiftRequestAccepted, onGiftRequestRejected, walletName, giftAmount, inputType, hint, note, themeId, giftId, isGiftWithFnF, isContactAssociated, onPressAccept, onPressReject, version }: Props ) {
  const dispatch = useDispatch()
  const [ WrongInputError, setWrongInputError ] = useState( '' )
  const [ isDisabled, setIsDisabled ] = useState( true )
  const [ PhoneNumber, setPhoneNumber ] = useState( '' )
  const [ EmailId, setEmailId ] = useState( '' )
  const [ onBlurFocus, setOnBlurFocus ] = useState( false )
  const [ passcode, setPasscode ] = useState( '' )
  const [ passcodeArray, setPasscodeArray ] = useState( [] )
  const [ acceptGift, setAcceptGiftModal ] = useState( !isContactAssociated )
  const [ downloadedGiftid, seDownloadedGiftId ] = useState( '' )
  const [ confirmAccount, setConfirmAccount ] = useState( false )
  const [ giftAddedModal, setGiftAddedModel ] = useState( false )
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

  useEffect( () => {
    setAccId( sourcePrimarySubAccount.id )
    // return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`

  }, [ sourcePrimarySubAccount ] )

  useEffect( ()=> {
    Object.values( gifts ).forEach( ( gift: Gift ) => {
      if( gift.channelAddress === acceptedGiftId )
        setAcceptedGift( gift )
    } )
  }, [ acceptedGiftId ] )

  useEffect( () => {
    if ( !inputType || inputType === DeepLinkEncryptionType.DEFAULT ) setIsDisabled( false )
    else setIsDisabled( true )
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

  }, [ acceptedGiftId ] )

  useEffect( () => {
    if ( giftId === addedGiftId ) {
      setConfirmAccount( false )
      setGiftAddedModel( true )
      setIsDisabled( false )
    }
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

  function onPressNumber( text, i ) {
    const tempPasscode = passcodeArray
    tempPasscode[ i ] = text
    setTimeout( () => {
      setPasscodeArray( tempPasscode )
    }, 2 )
    if ( passcodeArray.join( '' ).length == 6 ) {
      setPasscode( tempPasscode.join( '' ) )
    }
  }

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
          {[ 0, 1, 2, 3, 4, 5 ].map( ( i ) => {
            return (
              <TextInput
                key={i}
                maxLength={1}
                returnKeyType="done"
                returnKeyLabel="Done"
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                placeholder="-"
                ref={( input ) => {
                  if ( i == 0 ) this.textInput = input
                  if ( i == 1 ) this.textInput2 = input
                  if ( i == 2 ) this.textInput3 = input
                  if ( i == 3 ) this.textInput4 = input
                  if ( i == 4 ) this.textInput5 = input
                  if ( i == 5 ) this.textInput6 = input
                }}
                style={getStyle( i )}
                onChangeText={( value ) => {
                  if ( value && i == 0 ) {
                    onPressNumber( value, 0 )
                    this.textInput2.focus()
                  }
                  if ( value && i == 1 ) {
                    onPressNumber( value, 1 )
                    this.textInput3.focus()
                  }
                  if ( value && i == 2 ) {
                    onPressNumber( value, 2 )
                    this.textInput4.focus()
                  }
                  if ( value && i == 3 ) {
                    onPressNumber( value, 3 )
                    this.textInput5.focus()
                  }
                  if ( value && i == 4 ) {
                    onPressNumber( value, 4 )
                    this.textInput6.focus()
                  }
                  if ( value && i == 5 ) {
                    onPressNumber( value, 5 )
                    this.textInput6.focus()

                  }
                }}
                onKeyPress={( e ) => {
                  if ( e.nativeEvent.key === 'Backspace' && i == 0 ) {
                    this.textInput.focus()
                    onPressNumber( '', 0 )
                  }
                  if ( e.nativeEvent.key === 'Backspace' && i == 1 ) {
                    this.textInput.focus()
                    onPressNumber( '', 1 )
                  }
                  if ( e.nativeEvent.key === 'Backspace' && i == 2 ) {
                    this.textInput2.focus()
                    onPressNumber( '', 2 )
                  }
                  if ( e.nativeEvent.key === 'Backspace' && i == 3 ) {
                    this.textInput3.focus()
                    onPressNumber( '', 3 )
                  }
                  if ( e.nativeEvent.key === 'Backspace' && i == 4 ) {
                    this.textInput4.focus()
                    onPressNumber( '', 4 )
                  }
                  if ( e.nativeEvent.key === 'Backspace' && i == 5 ) {
                    this.textInput5.focus()
                    onPressNumber( '', 5 )
                  }
                }}
                onFocus={() => {
                  // if ( Platform.OS == 'ios' ) {
                  setIsDisabled( true )
                  // }
                }}
                onBlur={() => {
                  // if ( Platform.OS == 'ios' ) {
                  if (
                    ( passcodeArray.length == 0 ||
                        passcodeArray.length == 6 ) &&
                      i == 5
                  ) {
                    setIsDisabled( false )
                  }
                  // }
                }}
                autoCorrect={false}
                autoCompleteType="off"
                //value={passcodeArray[i] && passcodeArray[i].length ? passcodeArray[i] : ""}
              />
            )
          } )}
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
            // setShowAccounts( true )
            setAddGiftToAccountFlow( true )
            // navigation.navigate( 'AccountDetails', {
            //   accountShellID: sourcePrimarySubAccount.accountShellID,
            // } )
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

                  default:
                    break
              }

              setTimeout( () => {
                setPhoneNumber( '' )
              }, 2 )
              onPressAccept( key )
            } else {
              onGiftRequestAccepted( passcode )
            }
            // setAcceptGiftModal( false )
            // setGiftAcceptedModel( true )
          }
        }}
        style={{
          ...styles.buttonView,
          backgroundColor: isDisabled && buttonIsDisabled ? Colors.lightBlue : Colors.blue,
        }}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    )
  }

  // const numberWithCommas = ( x ) => {
  //   return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  // }

  const renderGiftAcceptedtModal = () => {
    return (
      <>
        {/* <View style={{
          marginTop: 'auto', right: 0, bottom: 0, position: 'absolute', marginLeft: 'auto'
        }}>
          <Illustration/>
        </View> */}
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
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
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
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 6 ),
        }}>
          {/* {renderButton( 'Add to Account', false )} */}
          {/* <TouchableOpacity
            onPress={() => {
              // onGiftRequestRejected()
              setGiftAcceptedModel( false )
              closeModal()
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
                fontFamily: Fonts.FiraSansMedium,
                color: Colors.blue
              }}
            >
              {'OK'}
            </Text>
          </TouchableOpacity> */}
        </View>
      </>
    )
  }

  const checkForValidation = ( text ) => {
    // console.log( 'TEXT', text.charAt( 0 ) + text.substring( 8 ), hint )
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
          onPress={() => { 
            setAcceptGiftModal( false ); 
            closeModal(); 
            dispatch( giftAccepted( '' ) );
            navigation.navigate( 'ManageGifts' );
          } 

          }
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
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
            {inputType !== DeepLinkEncryptionType.DEFAULT?
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
          {/* <View
            style={{
              width: '95%',
              backgroundColor: Colors.gray7,
              alignSelf: 'center',
              borderRadius: wp( 2 ),
              marginVertical: hp( 3 ),
              paddingVertical: wp( 1 ),
              paddingHorizontal: wp( 1 ),
              borderColor: Colors.lightBlue,
              borderWidth: 1,
            }}>
            <View style={{
              backgroundColor: Colors.gray7,
              borderRadius: wp( 2 ),
              // paddingVertical: hp( 0.3 ),
              // paddingHorizontal: wp( 0.3 ),
              borderColor: Colors.lightBlue,
              borderWidth: 1,
              borderStyle: 'dashed',
              padding: wp( 3 )
            }}>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', padding: wp( 2 )
              }}>
                <View style={{
                  flex: 1
                }}>
                  <Text style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue( 13 ),
                    // fontFamily: Fonts.FiraSansRegular,
                  }}>{walletName}</Text>
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 12 ),
                    fontFamily: Fonts.FiraSansRegular,
                    letterSpacing: 0.6,
                    marginTop: hp( 1 )
                  }}>
                    {note? note: 'This is to get you started! Welcome to the world of Bitcoin'}
                  </Text>
                </View>

                <GiftCard width={63} height={63} />
              </View>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', padding: wp( 2 ),
                alignItems: 'center'
              }}>
                <Text style={{
                  color: Colors.blue,
                  fontSize: RFValue( 18 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}>Gift Sats</Text>
                <Text style={{
                  color: Colors.black,
                  fontSize: RFValue( 24 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}>
                  {numberWithCommas( giftAmount )}
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansRegular,
                  }}>
                    {' sats'}
                  </Text>
                </Text>
              </View>
            </View>
          </View> */}
          {/* <TouchableOpacity
            onPress={() => {setShowAccounts( true );  setAcceptGiftModal( false )}}
            style={{
              width: '95%',
              // height: '54%',
              backgroundColor: Colors.backgroundColor1,
              // shadowOpacity: 0.06,
              // shadowOffset: {
              //   width: 10, height: 10
              // },
              // shadowRadius: 10,
              // elevation: 2,
              alignSelf: 'center',
              borderRadius: wp( 2 ),
              marginVertical: hp( 2 ),
              paddingVertical: hp( 2 ),
              paddingHorizontal: wp( 4 ),
              flexDirection: 'row',
              alignItems: 'center'
            }}>
            {getAvatarForSubAccount( sourcePrimarySubAccount, false, true )}
            <View style={{
              marginHorizontal: wp( 3 )
            }}>
              <Text style={{
                color: Colors.gray4,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansRegular,
              }}>
                Bitcoin will be transferred to
              </Text>
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue( 14 ),
                  fontFamily: Fonts.FiraSansRegular,
                  marginVertical: hp( 0.3 )
                }}
              >
                {sourceAccountHeadlineText}
              </Text>
              <Text style={styles.availableToSpendText}>
                Balance
                <Text style={styles.balanceText}> {spendableBalance} {formattedUnitText}</Text>
              </Text>

            </View>
          </TouchableOpacity> */}

        </View>
        {inputType === DeepLinkEncryptionType.SECRET_PHRASE && hint &&
          <Text style={{
            color: Colors.gray4,
            fontSize: RFValue( 13 ),
            letterSpacing: 0.6,
            fontFamily: Fonts.FiraSansRegular,
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
            fontFamily: Fonts.FiraSansRegular,
            marginHorizontal: wp( 5 ),
            marginVertical: wp( 2 ),
          }}>
            Enter OTP to accept
          </Text>
        }
        {/* {props.inputNotRequired ? null: ( */}
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
          {renderButton( 'Accept', true )}
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
                fontFamily: Fonts.FiraSansMedium,
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
  // const renderMessage = () => {
  //   return(
  //     <View style={{
  //       height: hp( '20%' )
  //     }}>
  //       <View style={{
  //         marginLeft: wp( 6 ), marginTop: hp( 2 )
  //       }}>
  //         <Text style={styles.modalTitleText}>Accepting Gift inprogress...</Text>
  //         <Text style={{
  //           ...styles.modalInfoText,
  //         }}>You will get confirmation in some time</Text>
  //       </View>
  //     </View>
  //   )
  // }

  return (
    <RootSiblingParent>
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
      {/* {!acceptGift && !giftAcceptedModel && !showAccounts &&
       renderMessage()
      } */}
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
    fontFamily: Fonts.FiraSansMedium,
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
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
    color: Colors.textColorGrey,
    marginBottom: wp( '5%' ),
  },
  inputErrorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
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
    fontFamily: Fonts.FiraSansRegular,
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
    fontFamily: Fonts.FiraSansMedium,
  },
  buttonView: {
    height: wp( '14%' ),
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
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    marginTop: hp( 0.5 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
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


