import React, { useState, useCallback, useEffect, useContext } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CommonStyles from '../../common/Styles/Styles'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import TimerModalContents from '../../pages/Contacts/TimerModalContents'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import ShareOtpWithContact from '../NewBHR/ShareOtpWithTrustedContact'
import ModalContainer from '../../components/home/ModalContainer'
import Secure2FA from '../Contacts/Secure2FAModal'
import { ChannelAssets, DeepLinkEncryptionType, KeeperInfoInterface, LevelInfo, MetaShare, QRCodeTypes, TrustedContact, TrustedContactRelationTypes, Trusted_Contacts, Wallet } from '../../bitcoin/utilities/Interface'
import BottomInfoBox from '../../components/BottomInfoBox'
import { useDispatch, useSelector } from 'react-redux'
import useTrustedContacts from '../../utils/hooks/state-selectors/trusted-contacts/UseTrustedContacts'
import { createChannelAssets, createOrChangeGuardian, setChannelAssets, updatedKeeperInfo, updateMSharesHealth } from '../../store/actions/BHR'
import dbManager from '../../storage/realm/dbManager'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import config from '../../bitcoin/HexaConfig'
import moment from 'moment'
import { updateTrustedContacts } from '../../store/actions/trustedContacts'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Toast from '../../components/Toast'
import idx from 'idx'
import { generateDeepLink, getDeepLinkKindFromContactsRelationType } from '../../common/CommonFunctions'
import DeviceInfo from 'react-native-device-info'
import { LocalizationContext } from '../../common/content/LocContext'

export default function QrAndLink( props ) {
  const { translations, formatString } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.bhr.channelAssets )
  const createChannelAssetsStatus = useSelector( ( state ) => state.bhr.loading.createChannelAssetsStatus )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )

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
  const [ Contact ] = useState(
    props.navigation.getParam( 'contact' )
      ? props.navigation.getParam( 'contact' )
      : {
      }
  )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ channelKey, setChannelKey ] = useState( props.navigation.getParam( 'channelKey' ) )
  const selectedKeeper = props.navigation.getParam( 'selectedKeeper' )
  const isChange = props.navigation.getParam( 'isChange' )
  const shareType = props.navigation.getParam( 'shareType' )
  const isReshare = props.navigation.getParam( 'isReshare' )
  const oldChannelKey = props.navigation.getParam( 'oldChannelKey' )
  const index = props.navigation.getParam( 'index' )
  const recreateChannel = props.navigation.getParam( 'recreateChannel' )
  const metaSharesKeeper = useSelector( ( state ) => state.bhr.metaSharesKeeper )
  const oldMetaSharesKeeper = useSelector( ( state ) => state.bhr.oldMetaSharesKeeper )

  const MetaShares: MetaShare[] = [ ...metaSharesKeeper ]
  const OldMetaShares: MetaShare[] = [ ...oldMetaSharesKeeper ]
  const trustedContacts: Trusted_Contacts = useTrustedContacts()
  const dispatch = useDispatch()

  useEffect( ()=> {
    if ( !Contact ) return
    createTrustedContact()
    if( trustedLink || trustedQR ){
      setTrustedLink( '' )
      setTrustedQR( '' )
    }
  }, [ Contact ] )

  const createTrustedContact = useCallback( async () => {
    const contacts: Trusted_Contacts = trustedContacts
    for( const contact of Object.values( contacts ) ){
      if ( contact.channelKey === channelKey && shareType != 'existingContact' ) return
    }
    createGuardian( )
  }, [ Contact ] )

  const createGuardian = ( ) => {
    const isChangeKeeper = isChange ? isChange : false
    if( shareType != 'existingContact' && ( trustedQR || isReshare ) && !isChangeKeeper && !recreateChannel ) return
    setIsGuardianCreationClicked( true )
    const channelKeyTemp: string = recreateChannel ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : shareType == 'existingContact' ? channelKey : isChangeKeeper ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
    setChannelKey( channelKeyTemp )

    const obj: KeeperInfoInterface = {
      shareId: selectedKeeper.shareId,
      name: Contact && Contact.displayedName ? Contact.displayedName : Contact && Contact.name ? Contact && Contact.name : '',
      type: shareType,
      scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ? MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme : OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ? OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme : '2of3',
      currentLevel: currentLevel,
      createdAt: moment( new Date() ).valueOf(),
      sharePosition: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
        MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ) :
        OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
          OldMetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ) :
          2,
      data: {
        ...Contact, index
      },
      channelKey: channelKeyTemp
    }

    dispatch( updatedKeeperInfo( obj ) )
    dispatch( createChannelAssets( selectedKeeper.shareId ) )
  }

  useEffect( ()=> {
    if( !createChannelAssetsStatus && channelAssets.shareId == selectedKeeper.shareId ) {
      dispatch( createOrChangeGuardian( {
        channelKey, shareId: selectedKeeper.shareId, contact: Contact, index, isChange, oldChannelKey, existingContact: shareType == 'existingContact' ? true : false
      } ) )
    }
  }, [ createChannelAssetsStatus, channelAssets ] )

  useEffect( () => {
    if( trustedLink ) generate()  // prevents multiple generation as trusted-contact updates twice during init
  }, [ Contact, trustedContacts ] )

  useEffect( ()=> {
    generate() // re-generate deeplink if encryption key changes
  }, [ encryptLinkWith, trustedContacts ] )

  const generate = async () => {
    console.log( 'useEffect Contact', Contact )
    // capture the contact
    if( !Contact ) return
    console.log( 'Contact', Contact )
    const contacts: Trusted_Contacts = trustedContacts
    const currentContact: TrustedContact = contacts[ channelKey ]

    if ( !currentContact || ( shareType == 'existingContact' && ( currentContact.relationType != TrustedContactRelationTypes.EXISTING_CONTACT && currentContact.relationType != TrustedContactRelationTypes.KEEPER ) ) || ( currentContact && !currentContact.isActive ) ) {console.log( 'RETURN FROM CONTACT' );return}

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
            // setEncryptLinkWith( DeepLinkEncryptionType.DEFAULT )
            break
      }

    const keysToEncrypt = currentContact.channelKey + '-' + ( currentContact.secondaryChannelKey ? currentContact.secondaryChannelKey : '' )
    const { deepLink, encryptedChannelKeys, encryptionType, encryptionHint } = await generateDeepLink( {
      deepLinkKind: getDeepLinkKindFromContactsRelationType( currentContact.relationType ),
      encryptionType: encryptLinkWith,
      encryptionKey: encryption_key,
      walletName: wallet.walletName,
      keysToEncrypt,
      currentLevel
    } )
    setTrustedLink( deepLink )
    const appVersion = DeviceInfo.getVersion()
    setTrustedQR(
      JSON.stringify( {
        type: shareType == 'existingContact' ? QRCodeTypes.EXISTING_CONTACT : QRCodeTypes.KEEPER_REQUEST,
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
    if( isGuardianCreationClicked ) {
      const shareObj: LevelInfo = {
        walletId: wallet.walletId,
        shareId: selectedKeeper.shareId,
        reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
          MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion :
          OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ) ?
            OldMetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion : 0,
        shareType: shareType,
        status: 'notAccessible',
        name: Contact && Contact.name ? Contact.name : ''
      }
      if( shareType == 'existingContact' ) shareObj.updatedAt = 0
      dispatch( updateMSharesHealth( shareObj, isChange ) )
      dispatch( setChannelAssets( {
      }, null ) )
      // saveInTransitHistory()
    }
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

  console.log( 'trustedQR', trustedQR )

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
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
        </View>
        <RequestKeyFromContact
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
              setEncryptLinkWith( type ); setSecure2FAModal( false )
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
    fontFamily: Fonts.FiraSansRegular,
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
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
} )
