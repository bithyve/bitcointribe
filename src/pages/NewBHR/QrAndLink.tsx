import React, { useState, useCallback, useEffect } from 'react'
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
import { generateDeepLink } from '../../common/CommonFunctions'
import DeviceInfo from 'react-native-device-info'


export default function QrAndLink( props ) {
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
  const s3 = dbManager.getBHR()
  const MetaShares: MetaShare[] = [ ...s3.metaSharesKeeper ]
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
      if ( contact.contactDetails.id === Contact.id && shareType != 'existingContact' ) return
    }
    createGuardian( {
      isChangeTemp: isChange, chosenContactTmp: Contact
    } )
  }, [ Contact ] )

  const createGuardian = ( payload?: {isChangeTemp?: any, chosenContactTmp?: any} ) => {
    const isChangeKeeper = isChange ? isChange : false
    if( shareType != 'existingContact' && ( trustedQR || isReshare ) && !isChangeKeeper ) return
    setIsGuardianCreationClicked( true )
    const channelKeyTemp: string = shareType == 'existingContact' ? channelKey : isChangeKeeper ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
    setChannelKey( channelKeyTemp )

    const obj: KeeperInfoInterface = {
      shareId: selectedKeeper.shareId,
      name: Contact && Contact.displayedName ? Contact.displayedName : Contact && Contact.name ? Contact && Contact.name : '',
      type: shareType,
      scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme,
      currentLevel: currentLevel,
      createdAt: moment( new Date() ).valueOf(),
      sharePosition: MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ),
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
    console.log( 'useEffect Contact', Contact )
    // capture the contact
    if( !Contact ) return
    console.log( 'Contact', Contact )
    const contacts: Trusted_Contacts = trustedContacts
    let currentContact: TrustedContact

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === Contact.id ){
          currentContact = contacts[ ck ]
          break
        }
      }
    if ( !currentContact || ( shareType == 'existingContact' && ( currentContact.relationType != TrustedContactRelationTypes.EXISTING_CONTACT && currentContact.relationType != TrustedContactRelationTypes.KEEPER ) ) ) return

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
            } else { Toast( 'F&F contact number missing' ); return }
            break

          case DeepLinkEncryptionType.EMAIL:
            const email = idx( Contact, ( _ ) => _.emails[ 0 ].email )
            if( email ){
              encryption_key = email // last 10 digits only
              setEncryptKey( encryption_key )
            } else { Toast( 'F&F contact email missing' ); return }
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

    const { deepLink, encryptedChannelKeys, encryptionType, encryptionHint } = generateDeepLink( encryptLinkWith, encryption_key, currentContact, wallet.walletName )
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
        walletId: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.walletId,
        shareId: selectedKeeper.shareId,
        reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion,
        shareType: shareType,
        status: 'notAccessible',
        name: Contact && Contact.name ? Contact.name : ''
      }
      if( shareType == 'existingContact' ) shareObj.updatedAt = 0
      dispatch( updateMSharesHealth( shareObj, isChange ) )
      dispatch( setChannelAssets( {
      } ) )
      // saveInTransitHistory()
    }
  }, [ Contact, trustedContacts, encryptLinkWith ] )

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
          // subHeaderText={`Request share from trusted Contact, you can change${'\n'}your trusted contact, or either primary mode of context`}
          contactText={'Adding to Friends & Family:'}
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
            title={encryptLinkWith === DeepLinkEncryptionType.DEFAULT ? 'Secure with additional factor' :
              `Secure with contacts ${encryptLinkWith === DeepLinkEncryptionType.NUMBER ? 'phone number' : encryptLinkWith === DeepLinkEncryptionType.EMAIL ? 'email' : 'OTP' }`
            }
            infoText={encryptLinkWith === DeepLinkEncryptionType.DEFAULT ? 'You can optionally add a second factor when you are sending the link/QR through an unencrypted channel'
              :
              encryptLinkWith === DeepLinkEncryptionType.NUMBER ? `Your contact will have to verify their phone number '${encryptionKey}' to accept the request`
                :
                encryptLinkWith === DeepLinkEncryptionType.EMAIL ? `Your contact will have to verify their email '${encryptionKey}' to accept the request`
                  :
                  `Your contact will have to confirm the OTP '${encryptionKey}' to accept the request`
            }
            backgroundColor={Colors.white}
          />
        </TouchableOpacity>
        <ModalContainer visible={secure2FAModal} closeBottomSheet={() => {}} >
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
        <ModalContainer visible={timerModal }  closeBottomSheet={() => {}} >
          {renderTimerModalContents()}
        </ModalContainer>
        <ModalContainer visible={shareOtpWithTrustedContactModel }  closeBottomSheet={() => {}} >
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
