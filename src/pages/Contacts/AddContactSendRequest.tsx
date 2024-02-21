import * as ExpoContacts from 'expo-contacts'
import idx from 'idx'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import { DeepLinkEncryptionType, DeepLinkKind, QRCodeTypes, TrustedContact, Trusted_Contacts, Wallet } from '../../bitcoin/utilities/Interface'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Colors from '../../common/Colors'
import { generateDeepLink, getDeepLinkKindFromContactsRelationType } from '../../common/CommonFunctions'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import { LocalizationContext } from '../../common/content/LocContext'
import BottomInfoBox from '../../components/BottomInfoBox'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import Toast from '../../components/Toast'
import ModalContainer from '../../components/home/ModalContainer'
import { InitTrustedContactFlowKind, initializeTrustedContact, updateTrustedContacts } from '../../store/actions/trustedContacts'
import { AccountsState } from '../../store/reducers/accounts'
import useTrustedContacts from '../../utils/hooks/state-selectors/trusted-contacts/UseTrustedContacts'
import ChangeSelection from '../FriendsAndFamily/ChangeSelection'
import ShareOtpWithContact from '../NewBHR/ShareOtpWithTrustedContact'
import Secure2FA from './Secure2FAModal'
import TimerModalContents from './TimerModalContents'

export default function AddContactSendRequest( props ) {
  const { translations, formatString } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const [ shareOtpWithTrustedContactModel, setShareOtpWithTrustedContactModel ] = useState( false )
  const [ OTP, setOTP ] = useState( '' )
  const [ secure2FAModal, setSecure2FAModal ] = useState( false )
  const [ changeSelection, setChangeSelection ] = useState( false )
  const [ encryptionKey, setEncryptKey ] = useState( '' )

  const [ timerModal, setTimerModal ] = useState( false )
  const [ renderTimer, setRenderTimer ] = useState( false )
  const accountsState: AccountsState = useSelector( state => state.accounts )
  const giftId = props.route.params?.giftId
  const note = props.route.params?.note
  const giftToSend = giftId? accountsState.gifts[ giftId ]: null
  const [ trustedLink, setTrustedLink ] = useState( '' )
  const [ longLink, setLongLink ] = useState( '' )
  const [ trustedQR, setTrustedQR ] = useState( '' )
  const [ selectedContactsCHKey, setSelectedContactsCHKey ] = useState( '' )
  const [ encryptLinkWith, setEncryptLinkWith ] = useState( giftId? null: DeepLinkEncryptionType.DEFAULT )
  const [ isOTPType, setIsOTPType ] = useState( false )
  const themeId = props.route.params?.themeId
  const senderEditedName = props.route.params?.senderName
  const SelectedContact = props.route.params?.SelectedContact
    ? props.route.params?.SelectedContact
    : []

  const headerText = props.route.params?.headerText
    ? props.route.params?.headerText
    : ''

  const subHeaderText = props.route.params?.subHeaderText
    ? props.route.params?.subHeaderText
    : ''

  const contactText = props.route.params?.contactText
    ? props.route.params?.contactText
    : ''

  const showDone = props.route.params?.showDone
    ? props.route.params?.showDone
    : false

  const isKeeper = props.route.params?.isKeeper
    ? props.route.params?.isKeeper
    : false

  const isPrimary = props.route.params?.isPrimary
    ? props.route.params?.isPrimary
    : false

  const existingContact = props.route.params?.existingContact
    ? props.route.params?.existingContact
    : false

  const skipClicked = props.route.params?.skipClicked
    ? props.route.params?.skipClicked
    : false

  const [ Contact ] = useState(
    SelectedContact ? SelectedContact[ 0 ] : {
    },
  )
  const [ contactInfo, setContact ] = useState( SelectedContact ? SelectedContact[ 0 ] : {
  } )

  const wallet: Wallet = useSelector(
    ( state ) => state.storage.wallet,
  )
  const trustedContacts: Trusted_Contacts = useTrustedContacts()
  const dispatch = useDispatch()

  const getContact = () => {
    ExpoContacts.getContactsAsync().then( async ( { data } ) => {
      const filteredData = data.find( item => item.id === contactInfo.id )
      // setPhoneumber( filteredData.phoneNumbers )

      setContact( filteredData )
      // setEmails( filteredData.emails )
      // await AsyncStorage.setItem( 'ContactData', JSON.stringify( data ) )
    } )
  }

  const createTrustedContact = useCallback( async () => {
    const contacts: Trusted_Contacts = trustedContacts
    for( const contact of Object.values( contacts ) ){
      if ( contact.contactDetails.id === Contact.id ) return
    }

    dispatch( initializeTrustedContact( {
      contact: Contact,
      flowKind: InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT,
      giftId,
      giftNote: note,
    } ) )
  }, [ Contact, giftId ] )

  useEffect( ()=> {
    getContact()
  }, [] )

  // useEffect( () => {
  //   if( giftId && encryptLinkWith === DeepLinkEncryptionType.OTP ) {
  //     // TODO: remove alert and show OTP on the UI
  //     // setIsOTPType( true )
  //     // setShareOtpWithTrustedContactModel( true )
  //     if( encryptionKey ) Alert.alert( 'OTP: ', encryptionKey )
  //   }
  // }, [ encryptionKey ] )

  useEffect( ()=> {
    if ( !Contact ) return
    if( Contact.phoneNumbers && Contact.phoneNumbers.length ) setEncryptLinkWith( DeepLinkEncryptionType.NUMBER )
    else if( Contact.emails && Contact.emails.length ) setEncryptLinkWith( DeepLinkEncryptionType.EMAIL )
    else setEncryptLinkWith( DeepLinkEncryptionType.OTP )

    createTrustedContact()
    if( trustedLink || trustedQR ){
      setTrustedLink( '' )
      setTrustedQR( '' )
    }
  }, [ Contact ] )

  useEffect( () => {
    if( !trustedLink ) generate()  // prevents multiple generation as trusted-contact updates twice during init
  }, [ Contact, trustedContacts ] )

  useEffect( ()=> {
    if( encryptLinkWith ) generate() // re-generate deeplink if encryption key changes
  }, [ encryptLinkWith ] )

  const generate = async () => {
    // capture the contact
    if( !Contact ) return
    const contacts: Trusted_Contacts = trustedContacts
    let currentContact: TrustedContact
    let channelKey: string

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === Contact.id ){
          currentContact = contacts[ ck ]
          channelKey = ck
          setSelectedContactsCHKey( channelKey )
          break
        }
      }
    if ( !currentContact ) return

    // generate deep link & QR for the contact
    let encryption_key: string
    if( currentContact.deepLinkConfig ){
      const { encryptionType, encryptionKey } = currentContact.deepLinkConfig
      if( encryptLinkWith === encryptionType ) encryption_key = encryptionKey
    }

    if( !encryption_key ){
      switch( encryptLinkWith ){
          case DeepLinkEncryptionType.NUMBER:
            const phoneNumber = idx( contactInfo, ( _ ) => _.phoneNumbers[ 0 ].number )
            if( phoneNumber ){
              const number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
              encryption_key = number.slice( number.length - 10 ) // last 10 digits only
              setEncryptKey( encryption_key )
            } else { Toast( strings.numberMissing ); return }
            break

          case DeepLinkEncryptionType.EMAIL:
            const email = idx( contactInfo, ( _ ) => _.emails[ 0 ].email )
            if( email ){
              encryption_key = email // last 10 digits only
              setEncryptKey( encryption_key )
            } else { Toast( strings.emailMissing ); return }
            break

          case DeepLinkEncryptionType.OTP:
          // openTimer()
            encryption_key = TrustedContactsOperations.generateKey( 6 ).toUpperCase()
            setOTP( encryption_key )
            setEncryptKey( encryption_key )
            setIsOTPType( true )
            // setShareOtpWithTrustedContactModel( true )
            // setEncryptLinkWith( DeepLinkEncryptionType.DEFAULT )
            break
      }
    }

    const keysToEncrypt = currentContact.channelKey + '-' + ( currentContact.secondaryChannelKey ? currentContact.secondaryChannelKey : '' )
    const extraData = giftToSend?  {
      channelAddress: giftToSend.channelAddress,
      amount: giftToSend.amount,
      note: note,
      themeId: giftToSend.themeId
    }: {
      channelAddress: channelKey
    }

    const { deepLink, encryptedChannelKeys, encryptionType, encryptionHint, shortLink } = await generateDeepLink( {
      deepLinkKind: giftToSend? DeepLinkKind.CONTACT_GIFT: getDeepLinkKindFromContactsRelationType( currentContact.relationType ),
      encryptionType: encryptLinkWith,
      encryptionKey: encryption_key,
      walletName: wallet.walletName,
      keysToEncrypt,
      generateShortLink: true,
      extraData
    } )
    const link = shortLink !== '' ? shortLink: deepLink
    setTrustedLink( link )
    setLongLink( deepLink )
    const appVersion = DeviceInfo.getVersion()

    let qrType: string
    if( giftToSend ) qrType = QRCodeTypes.CONTACT_GIFT
    else if( existingContact ) qrType = QRCodeTypes.EXISTING_CONTACT
    else if( isPrimary ) qrType = QRCodeTypes.PRIMARY_KEEPER_REQUEST
    else if( isKeeper ) qrType = QRCodeTypes.KEEPER_REQUEST
    else qrType = QRCodeTypes.CONTACT_REQUEST

    if( giftToSend ){
      setTrustedQR( JSON.stringify( {
        type: qrType,
        encryptedChannelKeys: encryptedChannelKeys,
        encryptionType,
        encryptionHint,
        walletName: wallet.walletName,
        channelAddress: giftToSend.channelAddress,
        amount: giftToSend.amount,
        note: giftToSend.note,
        themeId: giftToSend.themeId,
        version: appVersion,
      } ) )
    } else{
      setTrustedQR(
        JSON.stringify( {
          type: qrType,
          encryptedChannelKeys: encryptedChannelKeys,
          encryptionType,
          encryptionHint,
          walletName: wallet.walletName,
          version: appVersion,
          channelAddress: channelKey
        } )
      )
    }

    // update deeplink configuration for the contact
    if( !currentContact.deepLinkConfig || currentContact.deepLinkConfig.encryptionType !== encryptLinkWith )
      dispatch( updateTrustedContacts( {
        [ currentContact.channelKey ]: {
          ...currentContact,
          deepLinkConfig: {
            encryptionType: encryptLinkWith,
            encryptionKey: encryption_key,
          }
        }
      } ) )
  }

  const openTimer = async () => {
    setTimeout( () => {
      setRenderTimer( true )
    }, 2 )
  }


  const renderTimerModalContents = useCallback( () => {
    return (
      <TimerModalContents
        isOTPType={isOTPType}
        contactText={'Trusted Contact'}
        contact={Contact}

        renderTimer={renderTimer}
        onPressContinue={() => onContinueWithTimer()}
      />
    )
  }, [ renderTimer ] )


  const onContinueWithTimer = () => {
    setTimerModal( false )
    props.navigation.goBack()
  }


  const renderShareOtpWithTrustedContactContent = useCallback( () => {
    return (
      <ShareOtpWithContact
        renderTimer={renderTimer}
        onPressOk={() => {
          setRenderTimer( false )
          setShareOtpWithTrustedContactModel( false )
          props.navigation.popToTop()
        }}
        onPressBack={() => {
          setShareOtpWithTrustedContactModel( false )
        }}
        OTP={OTP}
      />
    )
  }, [ OTP, renderTimer ] )

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <ScrollView >
        <View style={[ CommonStyles.headerContainer, {
          backgroundColor: Colors.backgroundColor,
          flexDirection: 'row',
          justifyContent: 'space-between'
        } ]}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.popToTop()
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
        <RequestKeyFromContact
          navigation={props.navigation}
          isModal={false}
          headerText={giftId ? 'Send Gift' : null}
          subHeaderText={ giftId ? 'You can send it to anyone using the QR or the link' : Contact.displayedName || Contact.name ? formatString( strings.withHexa, Contact.displayedName ? Contact.displayedName : Contact.name ) : strings.addContact}
          contactText={strings.adding}
          isGift={ giftId}
          giftNote={note}
          themeId={themeId}
          encryptLinkWith={encryptLinkWith}
          encryptionKey={encryptionKey}
          onSelectionChange ={() => setChangeSelection( true )}
          senderName={senderEditedName}
          contact={Contact}
          QR={trustedQR}
          link={trustedLink}
          longLink={longLink}
          contactEmail={''}
          onPressBack={() => {
            props.navigation.goBack()
          }}
          onPressDone={() => {
            // openTimer()
          }}
          amt={giftToSend?.amount}
          onPressShare={() => {
            setTimeout( () => {
              setRenderTimer( true )
            }, 2 )
            if ( isOTPType ) {
              // setShareOtpWithTrustedContactModel( true )
            } else {
              openTimer()
            }
          }}
        />
        {!giftId &&
        <TouchableOpacity
          onPress={() => setSecure2FAModal( true )}
          style={{
            flex: 1
          }}>
          <BottomInfoBox
            icon={true}
            title={encryptLinkWith === DeepLinkEncryptionType.DEFAULT ? strings.secure :
              `Secure with contacts ${encryptLinkWith === DeepLinkEncryptionType.NUMBER ? 'phone number' : encryptLinkWith === DeepLinkEncryptionType.EMAIL ? 'email' : 'OTP' }`
            }
            infoText={encryptLinkWith === DeepLinkEncryptionType.DEFAULT ? strings.optionally
              :
              encryptLinkWith === DeepLinkEncryptionType.NUMBER ? formatString( strings.number, encryptionKey )
                :
                encryptLinkWith === DeepLinkEncryptionType.EMAIL ? formatString( strings.email, encryptionKey )
                  :
                  formatString( strings.otp, encryptionKey )
            }
            backgroundColor={Colors.white}
          />
        </TouchableOpacity>
        }
        <ModalContainer onBackground={()=>setSecure2FAModal( false )} visible={secure2FAModal} closeBottomSheet={() => {}} >
          <Secure2FA
            closeBottomSheet={()=> setSecure2FAModal( false )}
            onConfirm={( type ) => {
              if( type === DeepLinkEncryptionType.OTP ) {
                setIsOTPType( true )
              }
              setEncryptLinkWith( type ); setSecure2FAModal( false )
            }}
            Contact={contactInfo}
          />
        </ModalContainer>
        <ModalContainer onBackground={()=>setChangeSelection( false )} visible={changeSelection} closeBottomSheet={() => {}} >
          <ChangeSelection
            closeBottomSheet={()=> setChangeSelection( false )}
            onConfirm={( index ) => {
              setChangeSelection( false )
              if ( index === 0 ) {
                props.navigation.navigate( 'AddContact' )
              } else{
                setSecure2FAModal( true )
              }

            }}
          />
        </ModalContainer>
        <ModalContainer
          onBackground={()=>{
            setTimerModal( false )
            // setTimeout( () => {
            //   setTimerModal( true )
            // }, 200 )
          }}
          visible={timerModal }  closeBottomSheet={() => {}} >
          {renderTimerModalContents()}
        </ModalContainer>
        <ModalContainer onBackground={()=>{
          setShareOtpWithTrustedContactModel( false )
          // setTimeout( () => {
          //   setShareOtpWithTrustedContactModel( true )
          // }, 200 )
        }}
        visible={shareOtpWithTrustedContactModel }  closeBottomSheet={() => {}} >
          {renderShareOtpWithTrustedContactContent()}
        </ModalContainer>
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '1.7%' ),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
    marginLeft: 25,
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    marginLeft: 10,
  },
} )
