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
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux'
import { DeepLinkEncryptionType, KeeperType, QRCodeTypes, TrustedContact, TrustedContactRelationTypes, Trusted_Contacts, Wallet } from '../../bitcoin/utilities/Interface'
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
import TimerModalContents from '../../pages/Contacts/TimerModalContents'
import { updateTrustedContacts } from '../../store/actions/trustedContacts'
import useTrustedContacts from '../../utils/hooks/state-selectors/trusted-contacts/UseTrustedContacts'
import Secure2FA from '../Contacts/Secure2FAModal'
import ShareOtpWithContact from '../NewBHR/ShareOtpWithTrustedContact'

export default function QrAndLink( props ) {
  const { translations, formatString } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const currentLevel = useSelector( ( state: RootStateOrAny ) => state.bhr.currentLevel )
  const wallet: Wallet = useSelector( ( state : RootStateOrAny ) => state.storage.wallet )

  const [ isOTPType, setIsOTPType ] = useState( false )
  const [ shareOtpWithTrustedContactModel, setShareOtpWithTrustedContactModel ] = useState( false )
  const [ OTP, setOTP ] = useState( '' )
  const [ secure2FAModal, setSecure2FAModal ] = useState( false )
  const [ encryptLinkWith, setEncryptLinkWith ] = useState( DeepLinkEncryptionType.DEFAULT )
  const [ encryptionKey, setEncryptKey ] = useState( '' )
  const [ timerModal, setTimerModal ] = useState( false )
  const [ renderTimer, setRenderTimer ] = useState( false )
  const [ trustedLink, setTrustedLink ] = useState( '' )
  const [ trustedQR, setTrustedQR ] = useState( '' )

  const Contact  = props.route.params?.contact
  const channelKey = props.route.params?.channelKey
  const shareType = props.route.params?.shareType
  const trustedContacts: Trusted_Contacts = useTrustedContacts()
  const dispatch = useDispatch()

  useEffect( () => {
    if( !trustedLink ) generate()  // prevents multiple generation as trusted-contact updates twice during init
  }, [ Contact, trustedContacts ] )

  const generate = async () => {
    // capture the contact
    if( !Contact ) return
    const contacts: Trusted_Contacts = trustedContacts
    const currentContact: TrustedContact = contacts[ channelKey ]

    if ( !currentContact || ( shareType == KeeperType.EXISTING_CONTACT && ( currentContact.relationType != TrustedContactRelationTypes.EXISTING_CONTACT && currentContact.relationType != TrustedContactRelationTypes.KEEPER ) ) || ( currentContact && !currentContact.isActive ) ) return

    // generate deep link & QR for the contact
    let encryption_key: string
    if( currentContact.deepLinkConfig ){
      const { encryptionType, encryptionKey } = currentContact.deepLinkConfig
      if( encryptLinkWith === encryptionType ) encryption_key = encryptionKey
    }
    if( !encryption_key )
      switch( encryptLinkWith ){
          case DeepLinkEncryptionType.NUMBER:
            const phoneNumber = idx( Contact, ( _ ) => _.phoneNumbers[ 0 ].number )

            if( phoneNumber ){
              const number = phoneNumber.replace( /[^0-9]/g, '' ) // removing non-numeric characters
              encryption_key = number.slice( number.length - 10 ) // last 10 digits only
              setEncryptKey( encryption_key )
            } else { Toast( strings.numberMissing ); return }
            break

          case DeepLinkEncryptionType.EMAIL:
            const email = idx( Contact, ( _ ) => _.emails[ 0 ].email )
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
            break
      }

    const keysToEncrypt = currentContact.channelKey + '-' + ( currentContact.secondaryChannelKey ? currentContact.secondaryChannelKey : '' )
    const { deepLink, encryptedChannelKeys, encryptionType, encryptionHint, shortLink } = await generateDeepLink( {
      deepLinkKind: getDeepLinkKindFromContactsRelationType( currentContact.relationType ),
      encryptionType: encryptLinkWith,
      encryptionKey: encryption_key,
      walletName: wallet.walletName,
      keysToEncrypt,
      generateShortLink: true
    } )
    setTrustedLink( shortLink !== '' ? shortLink: deepLink )
    const appVersion = DeviceInfo.getVersion()
    setTrustedQR(
      JSON.stringify( {
        type: shareType == KeeperType.EXISTING_CONTACT ? QRCodeTypes.EXISTING_CONTACT : QRCodeTypes.KEEPER_REQUEST,
        encryptedChannelKeys: encryptedChannelKeys,
        encryptionType,
        encryptionHint,
        walletName: wallet.walletName,
        version: appVersion,
        currentLevel
      } )
    )

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
    // const TCRequestTimer = JSON.parse(
    //   await AsyncStorage.getItem( 'TCRequestTimer' ),
    // );
    // ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
    // if ( !TCRequestTimer ) {
    //   ( TimerModalBottomSheet as any ).current.snapTo( 1 )
    // }
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
          props.navigation.goBack()
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
          backgroundColor: Colors.backgroundColor, marginTop: 0
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
          // headerText={'Request Recovery Secret from trusted contact'}
          subHeaderText={Contact.displayedName || Contact.name ? formatString( strings.withHexa, Contact.displayedName ? Contact.displayedName : Contact.name ) : strings.addKeeper}
          contactText={strings.addingAs}
          contact={Contact}
          QR={trustedQR}
          link={trustedLink}
          contactEmail={''}
          onPressBack={() => {
            props.navigation.goBack()
          }}
          isKeeper={true}
          onPressDone={() => {
            // openTimer()
          }}
          onPressShare={() => {
            setTimeout( () => {
              setRenderTimer( true )
            }, 2 )
            if ( isOTPType ) {
              setShareOtpWithTrustedContactModel( true )
            } else {
              openTimer()
            }
          }}
        />
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
        <ModalContainer onBackground={()=>setSecure2FAModal( false )} visible={secure2FAModal} closeBottomSheet={() => setSecure2FAModal( false )} >
          <Secure2FA
            closeBottomSheet={()=> setSecure2FAModal( false )}
            onConfirm={( type ) => {
              if( type === DeepLinkEncryptionType.OTP ) {
                setIsOTPType( true )
              }

              if( type !== encryptLinkWith ){
                setEncryptLinkWith( type )
                generate()  // re-generate deeplink if encryption key changes
              }
              setSecure2FAModal( false )
            }}
            Contact={Contact}
          />
        </ModalContainer>
        <ModalContainer onBackground={()=>setTimerModal( false )} visible={timerModal}  closeBottomSheet={() => setTimerModal( false )} >
          {renderTimerModalContents()}
        </ModalContainer>
        <ModalContainer onBackground={()=>setShareOtpWithTrustedContactModel( false )} visible={shareOtpWithTrustedContactModel }  closeBottomSheet={() => setShareOtpWithTrustedContactModel( false )} >
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
