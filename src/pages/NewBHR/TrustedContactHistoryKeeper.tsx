import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Keyboard,
  TouchableOpacity,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import ErrorModalContents from '../../components/ErrorModalContents'
import DeviceInfo from 'react-native-device-info'
import HistoryPageComponent from './HistoryPageComponent'
import ShareOtpWithTrustedContact from './ShareOtpWithTrustedContact'
import moment from 'moment'
import _ from 'underscore'
import { nameToInitials } from '../../common/CommonFunctions'
import {
  ErrorSending,
  updateMSharesHealth,
  updatedKeeperInfo,
  setChannelAssets,
  createChannelAssets,
  createOrChangeGuardian,
  switchS3LoaderKeeper,
} from '../../store/actions/BHR'
import { useDispatch } from 'react-redux'
import {
  KeeperInfoInterface,
  Keepers,
  LevelHealthInterface,
  MetaShare,
  TrustedContact,
  Trusted_Contacts,
  ChannelAssets,
  TrustedContactRelationTypes,
  Wallet,
  INotification,
  notificationType,
  notificationTag,
  LevelInfo,
  LevelData
} from '../../bitcoin/utilities/Interface'
import config from '../../bitcoin/HexaConfig'
import FriendsAndFamilyHelpContents from '../../components/Helper/FriendsAndFamilyHelpContents'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import semver from 'semver'
import ModalContainer from '../../components/home/ModalContainer'
import { getTime } from '../../common/CommonFunctions/timeFormatter'
import { historyArray } from '../../common/CommonVars/commonVars'
import { getIndex } from '../../common/utilities'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import BackupStyles from './Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import BHROperations from '../../bitcoin/utilities/BHROperations'
import dbManager from '../../storage/realm/dbManager'
import idx from 'idx'
import Toast from '../../components/Toast'
import Loader from '../../components/loader'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import Relay from '../../bitcoin/utilities/Relay'

const TrustedContactHistoryKeeper = ( props ) => {
  const [ ChangeBottomSheet, setChangeBottomSheet ] = useState( React.createRef() )
  const [ keeperTypeModal, setKeeperTypeModal ] = useState( false )
  const [ HelpModal, setHelpModal ] = useState( false )
  const [ ErrorModal, setErrorModal ] = useState( false )
  const [ ConfirmModal, setConfirmModal ] = useState( false )
  const [ ChangeModal, setChangeModal ] = useState( false )
  const [ shareOtpWithTrustedContactModal, setShareOtpWithTrustedContactModal ] = useState( false )
  const [ SecondaryDeviceMessageModal, setSecondaryDeviceMessageModal ] = useState( false )
  const [ oldChannelKey, setOldChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
  const [ changeContact, setChangeContact ] = useState( false )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ reshareModal, setReshareModal ] = useState( false )
  const [ isChangeClicked, setIsChangeClicked ] = useState( false )
  const [ ReshareBottomSheet, setReshareBottomSheet ] = useState(
    React.createRef(),
  )
  const [ ConfirmBottomSheet, setConfirmBottomSheet ] = useState(
    React.createRef(),
  )
  const [ showLoader, setShowLoader ] = useState( false )
  const [ OTP, setOTP ] = useState( '' )
  const [ renderTimer, setRenderTimer ] = useState( false )
  const [ trustedContactHistory, setTrustedContactHistory ] = useState( historyArray )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ isVersionMismatch, setIsVersionMismatch ] = useState( false )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ isNavigation, setNavigation ] = useState( false )
  const [ isReshare, setIsReshare ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'selectedKeeper' ).status === 'notAccessible' && props.navigation.getParam( 'selectedKeeper' ).updatedAt == 0 ? true : false )
  const [ selectedTitle, setSelectedTitle ] = useState( props.navigation.getParam( 'selectedTitle' ) )
  const [ selectedLevelId, setSelectedLevelId ] = useState( props.navigation.getParam( 'selectedLevelId' ) )
  const [ selectedKeeper, setSelectedKeeper ] = useState( props.navigation.getParam( 'selectedKeeper' ) )
  const [ isChange, setIsChange ] = useState( props.navigation.getParam( 'isChangeKeeperType' )
    ? props.navigation.getParam( 'isChangeKeeperType' )
    : false )
  const [ chosenContact, setChosenContact ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? null :
    props.navigation.state.params.selectedKeeper && props.navigation.state.params.selectedKeeper.data && props.navigation.state.params.selectedKeeper.data.index
      ? props.navigation.state.params.selectedKeeper.data
      : null,
  )
  const [ shareType, setShareType ] = useState( props.navigation.getParam( 'selectedKeeper' ).shareType )
  const [ showQrCode, setShowQrCode ] = useState( false )
  const [ showFNFList, setShowFNFList ] = useState( false )
  const [ recreateChannel, setRecreateChannel ] = useState( false )
  const createChannelAssetsStatus = useSelector( ( state ) => state.bhr.loading.createChannelAssetsStatus )
  const isErrorSendingFailed = useSelector( ( state ) => state.bhr.errorSending )
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.bhr.channelAssets )
  const s3 = dbManager.getBHR()
  const MetaShares: MetaShare[] = [ ...s3.metaSharesKeeper ]
  const OldMetaShares: MetaShare[] = [ ...s3.oldMetaSharesKeeper ]
  const keeperInfo = useSelector( ( state ) => state.bhr.keeperInfo )
  const levelData: LevelData[] = useSelector( ( state ) => state.bhr.levelData )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const trustedContacts: Trusted_Contacts = useSelector( ( state ) => state.trustedContacts.contacts )
  const [ contacts, setContacts ] = useState( [] )
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const index = props.navigation.getParam( 'index' )
  const [ isChangeKeeperAllow, setIsChangeKeeperAllow ] = useState( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'isChangeKeeperAllow' ) )
  const dispatch = useDispatch()

  useEffect( () => {
    setSelectedLevelId( props.navigation.getParam( 'selectedLevelId' ) )
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
    setIsReshare( props.navigation.getParam( 'isChangeKeeperType' ) ? false : props.navigation.getParam( 'selectedKeeper' ).status === 'notAccessible' && props.navigation.getParam( 'selectedKeeper' ).updatedAt == 0 ? true : false )
    setIsChange(
      props.navigation.getParam( 'isChangeKeeperType' )
        ? props.navigation.getParam( 'isChangeKeeperType' )
        : false
    )
    setOldChannelKey( props.navigation.getParam( 'selectedKeeper' ).channelKey ? props.navigation.getParam( 'selectedKeeper' ).channelKey : '' )
    setShareType( props.navigation.getParam( 'selectedKeeper' ).shareType ? props.navigation.getParam( 'selectedKeeper' ).shareType : 'contact' )
  }, [ props.navigation.state.params ] )

  useEffect( () => {
    if ( isChange ) {
      // setTrustedContactModal( true )
      props.navigation.navigate( 'FNFToKeeper', {
        ...props.navigation.state.params,
        onPressContinue
      } )
      setShowQrCode( true )
    }
  }, [ isChange ] )

  //didMount
  useEffect( () => {
    ( async () => {
      const contacts: Trusted_Contacts = trustedContacts
      const existingContactsArr = []
      for( const channelKey of Object.keys( contacts ) ){
        const contact = contacts[ channelKey ]
        if( contact.relationType === TrustedContactRelationTypes.CONTACT || contact.relationType === TrustedContactRelationTypes.WARD ) {
          existingContactsArr.push( {
            ...contact, channelKey
          } )
        }
      }
      setContacts( existingContactsArr )
      if( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ) {
        // setTrustedContactModal( true )
        props.navigation.navigate( 'FNFToKeeper', {
          ...props.navigation.state.params,
          onPressContinue
        } )
        setShowQrCode( true )
      }
      const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
      if ( shareHistory ) updateHistory( shareHistory )
    } )()
    const trustedContactsInfo: Keepers = trustedContacts
    const contactName = props.navigation.getParam( 'selectedKeeper' ).name.toLowerCase().trim()
    const trustedData = trustedContactsInfo[ contactName ]

    if( trustedData && trustedData.trustedChannel && trustedData.trustedChannel.data.length == 2 ){
      if( trustedData.trustedChannel.data[ 1 ] && semver.lt( trustedData.trustedChannel.data[ 1 ].data.version, '1.6.0' ) ) {
        setTimeout( () => {
          setErrorMessageHeader( 'Error sending Recovery Key' )
          setErrorMessage(
            'your keeper need to update app / come online',
          )
          setIsVersionMismatch( true )
        }, 2 )
        setErrorModal( true )
      }
    }
  }, [] )

  const getContacts = useCallback(
    ( selectedContacts ) => {
      if ( selectedContacts[ 0 ] ) {
        setChosenContact( selectedContacts[ 0 ] )
        setSelectedTitle(
          selectedContacts[ 0 ].firstName && selectedContacts[ 0 ].lastName
            ? selectedContacts[ 0 ].firstName + ' ' + selectedContacts[ 0 ].lastName
            : selectedContacts[ 0 ].firstName && !selectedContacts[ 0 ].lastName
              ? selectedContacts[ 0 ].firstName
              : !selectedContacts[ 0 ].firstName && selectedContacts[ 0 ].lastName
                ? selectedContacts[ 0 ].lastName
                : 'Friends & Family',
        )
      }
      return selectedContacts[ 0 ]
    },
    [ chosenContact ],
  )

  const renderContactListItem = useCallback( ( {
    contactDescription,
    index,
  }: {
    contactDescription: any;
    index: number;
    contactsType: string;
  }
  ) => {
    return <TouchableOpacity style={{
      padding : 5
    }} onPress={()=>{
      const obj = {
        name: contactDescription.contactDetails.contactName,
        imageAvailable: contactDescription.contactDetails.imageAvailable ? true : false,
        image: contactDescription.contactDetails.imageAvailable,
        id: contactDescription.contactDetails.id
      }
      setChannelKey( contactDescription.channelKey )
      setChosenContact( obj ); setShowFNFList( false )}}>
      <Text>{contactDescription.contactDetails.contactName}</Text>
    </TouchableOpacity>

  }, [] )

  const updateHistory = useCallback(
    ( shareHistory ) => {
      const updatedTrustedContactHistory = [ ...trustedContactHistory ]
      if ( shareHistory[ index ].createdAt )
        updatedTrustedContactHistory[ 0 ].date = shareHistory[ index ].createdAt
      if ( shareHistory[ index ].inTransit )
        updatedTrustedContactHistory[ 1 ].date = shareHistory[ index ].inTransit

      if ( shareHistory[ index ].accessible )
        updatedTrustedContactHistory[ 2 ].date = shareHistory[ index ].accessible

      if ( shareHistory[ index ].notAccessible )
        updatedTrustedContactHistory[ 3 ].date =
          shareHistory[ index ].notAccessible
      setTrustedContactHistory( updatedTrustedContactHistory )
    },
    [ trustedContactHistory ],
  )

  const saveInTransitHistory = useCallback( async () => {
    const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
    if ( shareHistory ) {
      const updatedShareHistory = [ ...shareHistory ]
      updatedShareHistory[ index ] = {
        ...updatedShareHistory[ index ],
        inTransit: Date.now(),
      }
      updateHistory( updatedShareHistory )
      await AsyncStorage.setItem(
        'shareHistory',
        JSON.stringify( updatedShareHistory ),
      )
    }
  }, [ updateHistory ] )

  const onOTPShare = useCallback(
    async ( ) => {
      saveInTransitHistory()
      setIsReshare( true )
    },
    [ saveInTransitHistory, chosenContact ],
  )

  const renderShareOtpWithTrustedContactContent = useCallback( () => {
    return (
      <ShareOtpWithTrustedContact
        renderTimer={renderTimer}
        onPressOk={( index ) => {
          setRenderTimer( false )
          onOTPShare( )
          setOTP( '' )
          props.navigation.goBack()
        }}
        onPressBack={() => setShareOtpWithTrustedContactModal( false ) }
        OTP={OTP}
        index={index}
      />
    )
  }, [ onOTPShare, OTP, renderTimer ] )

  const renderConfirmContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ConfirmBottomSheet}
        title={'Confirm Recovery Key\nwith Keeper'}
        note={
          'Your Recovery Keys with contacts get confirmed automatically when the contact opens their app.\nSimply remind them to open their Hexa app and login to confirm your Recovery Key'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => setConfirmModal( false )}
        onPressIgnore={() => setConfirmModal( false )}
        isBottomImage={false}
      />
    )
  }, [] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ErrorModal}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          setErrorModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [] )

  if ( isErrorSendingFailed ) {
    setTimeout( () => {
      setErrorMessageHeader( 'Error sending Recovery Key' )
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      )
    }, 2 )
    setErrorModal( true )
    dispatch( ErrorSending( null ) )
  }

  const sendNotificationForExistingContact = async() =>{
    const appVersion = DeviceInfo.getVersion()
    const contact = trustedContacts[ channelKey ]
    const instream = useStreamFromContact( contact, wallet.walletId, true )
    const fcmToken: string = idx( instream, ( _ ) => _.primaryData.FCM )
    const notification: INotification = {
      notificationType: notificationType.FNF_KEEPER_REQUEST,
      title: 'Friends & Family notification',
      body: `You have new keeper request ${contact.contactDetails.contactName}`,
      data: {
        walletName: wallet.walletName,
        channelKey: channelKey,
        contactsSecondaryChannelKey: contact.secondaryChannelKey,
        version: appVersion
      },
      tag: notificationTag.IMP,
    }
    const notifReceivers = []
    notifReceivers.push( {
      walletId: instream.primaryData.walletID,
      FCMs: [ fcmToken ],
    } )
    if( notifReceivers.length ) {
      await Relay.sendNotifications(
        notifReceivers,
        notification,
      )
      if( fcmToken ) Toast( 'Notification Sent' )
    }
  }

  const onPressReshare = useCallback( async () => {
    const currentContact: TrustedContact = trustedContacts[ channelKey ]
    console.log( 'currentContact && currentContact.isActive', currentContact.isActive )
    if ( currentContact && currentContact.isActive ){
      setReshareModal( false )
      if( selectedKeeper.shareType == 'existingContact' ){
        sendNotificationForExistingContact()
      } else {
        props.navigation.navigate( 'QrAndLink', {
          contact: chosenContact,
          selectedKeeper: selectedKeeper,
          isChange: isChange,
          shareType,
          isReshare,
          oldChannelKey,
          channelKey: channelKey
        } )
      }
    } else {
      setRecreateChannel( true )
      setReshareModal( false )
      props.navigation.navigate( 'FNFToKeeper', {
        ...props.navigation.state.params,
        onPressContinue,
        recreateChannel: true
      } )
    }
  }, [ selectedTitle, chosenContact, getContacts ] )

  const renderChangeContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nKeeper'}
        info={'Having problems with your Keeper'}
        note={
          'You can change the Keeper you selected to send your Recovery Key'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          setTimeout( () => {
            setChangeContact( true )
          }, 2 )

          props.navigation.navigate( 'FNFToKeeper', {
            ...props.navigation.state.params,
            onPressContinue
          } )
          setShowQrCode( true )

          setChangeModal( false )
        }}
        onPressIgnore={() => {
          setChangeModal( false )
        }}
        isBottomImage={false}
      />
    )
  }, [] )

  const sortedHistory = useCallback( ( history ) => {
    const currentHistory = history.filter( ( element ) => {
      if ( element.date ) return element
    } )

    const sortedHistory = _.sortBy( currentHistory, 'date' )
    sortedHistory.forEach( ( element ) => {
      element.date = moment( element.date )
        .utc()
        .local()
        .format( 'DD MMMM YYYY HH:mm' )
    } )

    return sortedHistory
  }, [] )

  const getImageIcon = () => {
    if ( chosenContact && chosenContact.name ) {
      if ( chosenContact.imageAvailable ) {
        return (
          <View style={styles.imageBackground}>
            <Image source={chosenContact.image} style={styles.contactImage} />
          </View>
        )
      } else {
        return (
          <View style={styles.imageBackground}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: RFValue( 16 ),
              }}
            >
              {chosenContact &&
              chosenContact.firstName === 'F&F request' &&
              chosenContact.contactsWalletName !== undefined &&
              chosenContact.contactsWalletName !== ''
                ? nameToInitials( `${chosenContact.contactsWalletName}'s wallet` )
                : chosenContact && chosenContact.name
                  ? nameToInitials(
                    chosenContact &&
                      chosenContact.firstName &&
                      chosenContact.lastName
                      ? chosenContact.firstName + ' ' + chosenContact.lastName
                      : chosenContact.firstName && !chosenContact.lastName
                        ? chosenContact.firstName
                        : !chosenContact.firstName && chosenContact.lastName
                          ? chosenContact.lastName
                          : chosenContact.name ? chosenContact.name : '',
                  )
                  : ''}
            </Text>
          </View>
        )
      }
    }
    return (
      <Image
        style={styles.contactImageAvatar}
        source={require( '../../assets/images/icons/icon_user.png' )}
      />
    )
  }

  const createGuardian = async ( payload?: {isChangeTemp?: any, chosenContactTmp?: any, shareType?: string, isRecreateChannel?: any} ) => {
    const isChangeKeeper = isChange ? isChange : payload && payload.isChangeTemp ? payload.isChangeTemp : false
    const Contact = payload.chosenContactTmp
    const isRecreateChannel = payload && payload.isRecreateChannel ? payload.isRecreateChannel : false

    if( payload.shareType != 'existingContact' && isReshare && !isChangeKeeper && !isRecreateChannel ){
      console.log( 'RETURN' ); return}
    setIsGuardianCreationClicked( true )
    const channelKeyTemp: string = isRecreateChannel ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : payload.shareType == 'existingContact' ? Contact.channelKey : isChangeKeeper ? BHROperations.generateKey( config.CIPHER_SPEC.keyLength ) : selectedKeeper.channelKey ? selectedKeeper.channelKey : BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
    setChannelKey( channelKeyTemp )

    if( payload.shareType == 'existingContact' ){
      console.log( 'payload.shareType', payload.shareType )
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
      console.log( 'obj', obj )

      dispatch( updatedKeeperInfo( obj ) )
      dispatch( createChannelAssets( selectedKeeper.shareId ) )
    } else props.navigation.navigate( 'QrAndLink', {
      contact: Contact,
      selectedKeeper: selectedKeeper,
      isChange: isChangeKeeper,
      shareType: payload.shareType,
      isReshare,
      oldChannelKey,
      channelKey: channelKeyTemp,
      recreateChannel: isRecreateChannel
    } )
  }

  useEffect( ()=> {
    if( isGuardianCreationClicked && !createChannelAssetsStatus && channelAssets.shareId == selectedKeeper.shareId && shareType == 'existingContact' ) {
      dispatch( createOrChangeGuardian( {
        channelKey, shareId: selectedKeeper.shareId, contact: chosenContact, index, isChange, oldChannelKey, existingContact: shareType == 'existingContact' ? true : false
      } ) )
    }
  }, [ createChannelAssetsStatus, channelAssets, chosenContact, keeperInfo ] )

  useEffect( () => {
    // capture the contact
    if( !chosenContact ) return
    const contacts: Trusted_Contacts = trustedContacts
    const currentContact: TrustedContact = contacts[ channelKey ]

    if ( !currentContact || ( currentContact && currentContact.relationType != TrustedContactRelationTypes.KEEPER ) ) return

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
        name: chosenContact && chosenContact.name ? chosenContact.name : '',
        updatedAt: 0
      }

      if( shareType == 'existingContact' ) shareObj.updatedAt = 0
      dispatch( updateMSharesHealth( shareObj, isChange ) )
      dispatch( setChannelAssets( {
      }, null ) )
      setIsGuardianCreationClicked( false )
      // saveInTransitHistory()
    }
  }, [ chosenContact, trustedContacts ] )

  const onPressChangeKeeperType = ( type, name ) => {
    const changeIndex = getIndex( levelData, type, selectedKeeper, keeperInfo )
    setIsChangeClicked( false )
    setKeeperTypeModal( false )
    const navigationParams = {
      selectedTitle: name,
      selectedLevelId: selectedLevelId,
      selectedKeeper: {
        shareType: type,
        name: name,
        reshareVersion: 0,
        status: 'notSetup',
        updatedAt: 0,
        shareId: selectedKeeper.shareId,
        data: {
        },
      },
      index: changeIndex,
    }

    if ( type == 'contact' ) {
      setChangeModal( true )
    }
    if ( type == 'device' ) {
      props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'pdf' ) {
      props.navigation.navigate( 'PersonalCopyHistoryNewBHR', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
    }
  }

  const onPressContinue = ( selectedContacts, isRecreateChannel? ) => {
    Keyboard.dismiss()
    let shareType = 'contact'
    if( selectedContacts.length && selectedContacts[ 0 ].isExisting ){ setChannelKey( selectedContacts[ 0 ].channelKey ); shareType = 'existingContact' }
    setShareType( shareType )
    setTimeout( () => {
      createGuardian( {
        chosenContactTmp: getContacts( selectedContacts ), shareType, isRecreateChannel: isRecreateChannel
      } )
      setShowQrCode( true )
    }, 10 )
  }

  const renderSecondaryDeviceMessageContents = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={SecondaryDeviceMessageModal}
        title={'Keeper Contact'}
        note={
          'For confirming your Recovery Key on the Keeper Contact, simply open the app on that device and log in'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => setSecondaryDeviceMessageModal( false )}
        onPressIgnore={() => setSecondaryDeviceMessageModal( false )}
        isBottomImage={false}
      />
    )
  }, [] )

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={selectedTitle}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'never'}
        moreInfo={selectedTitle}
        headerImage={require( '../../assets/images/icons/icon_secondarydevice.png' )}
        imageIcon={getImageIcon}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          showButton={true}
          type={'contact'}
          IsReshare={isReshare}
          data={sortedHistory( trustedContactHistory )}
          confirmButtonText={props.navigation.getParam( 'selectedKeeper' ).updatedAt > 0 ? 'Confirm' : 'Share Now' }
          onPressChange={() => {
            setKeeperTypeModal( true )
          }}
          onPressConfirm={() => {
            if( props.navigation.getParam( 'selectedKeeper' ).updatedAt == 0 ){
              setTimeout( () => {
                setShowQrCode( true )
              }, 2 )
              setNavigation( false )
              props.navigation.navigate( 'FNFToKeeper', {
                ...props.navigation.state.params,
                onPressContinue
              } )
            } else {
              setSecondaryDeviceMessageModal( true )
            }
          }}
          onPressReshare={() => {
            setReshareModal( true )
          }}
          isVersionMismatch={isVersionMismatch}
          isChangeKeeperAllow={isChange ? false : ( props.navigation.getParam( 'selectedKeeper' ).updatedAt > 0 || props.navigation.getParam( 'selectedKeeper' ).status == 'notAccessible' ) ? true : false}
          reshareButtonText={'Reshare'}
          changeButtonText={'Change'}
        />
      </View>
      <ModalContainer visible={SecondaryDeviceMessageModal} closeBottomSheet={()=>setSecondaryDeviceMessageModal( false )} >
        {renderSecondaryDeviceMessageContents()}
      </ModalContainer>
      <ModalContainer visible={shareOtpWithTrustedContactModal} closeBottomSheet={() => setShareOtpWithTrustedContactModal( false )}>
        {renderShareOtpWithTrustedContactContent()}
      </ModalContainer>
      <ModalContainer visible={ChangeModal} closeBottomSheet={() => setChangeModal( false )}>
        {renderChangeContent()}
      </ModalContainer>
      <ModalContainer visible={reshareModal} closeBottomSheet={() => setReshareModal( false )}>
        <ErrorModalContents
          modalRef={ReshareBottomSheet}
          title={'Reshare with the same contact?'}
          info={'Proceed if you want to reshare the link/ QR with the same contact'}
          note={'For a different contact, please go back and choose ‘Change contact’'}
          proceedButtonText={'Reshare'}
          cancelButtonText={'Back'}
          isIgnoreButton={true}
          onPressProceed={() => {
            onPressReshare()
          }}
          onPressIgnore={() => {
            // ( ReshareBottomSheet as any ).current.snapTo( 0 )
            setReshareModal( false )
          }}
          isBottomImage={false}
        />
      </ModalContainer>
      <ModalContainer visible={ConfirmModal} closeBottomSheet={() => setConfirmModal( false )}>
        {renderConfirmContent()}
      </ModalContainer>
      <ModalContainer visible={ErrorModal} closeBottomSheet={() => setErrorModal( false )}>
        {renderErrorModalContent()}
      </ModalContainer>
      {/* <ModalContainer visible={showQrCode} closeBottomSheet={() => setShowQrCode( false )}>
        <RequestKeyFromContact
          isModal={true}
          headerText={`Send Recovery Key${'\n'}to contact`}
          subHeaderText={'Send Key to Keeper, you can change your Keeper, or their primary mode of contact'}
          contactText={'Sharing Recovery Key with'}
          contact={chosenContact}
          QR={trustedQR}
          link={trustedLink}
          contactEmail={''}
          onPressBack={() => {
            // ( shareBottomSheet as any ).current.snapTo( 0 )
            props.navigation.goBack()
          }}
          onPressDone={() => {
            if( props.navigation.getParam( 'isChangeKeeperType' ) ){
              props.navigation.pop( 2 )
            } else {
              props.navigation.pop( 1 )
            }
            // ( shareBottomSheet as any ).current.snapTo( 0 )
          }}
          onPressShare={() => {
            if ( isOTPType ) {
              setTimeout( () => {
                setRenderTimer( true )
              }, 2 )
              // ( shareBottomSheet as any ).current.snapTo( 0 );
              props.navigation.goBack()
              setShareOtpWithTrustedContactModal( true )
            }
            else {
              // ( shareBottomSheet as any ).current.snapTo( 0 )
              props.navigation.goBack()
              const popAction = StackActions.pop( {
                n: isChange ? 2 : 1
              } )
              props.navigation.dispatch( popAction )
            }
          }}
        />
      </ModalContainer> */}
      <ModalContainer visible={showFNFList} closeBottomSheet={() => setShowFNFList( false )}>
        <View
          style={{
            height: '100%',
            backgroundColor: Colors.white,
            alignSelf: 'center',
            width: '100%',
          }}>
          <View
            style={{
              ...BackupStyles.modalHeaderTitleView,
              paddingTop: hp( '0.5%' ),
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 20,
            }}
          >
            <AppBottomSheetTouchableWrapper
              onPress={() => setShowFNFList( false )}
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center'
              }}
            >
              <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
            </AppBottomSheetTouchableWrapper>
            <Text style={BackupStyles.modalHeaderTitleText}>
              Associate a contact
            </Text>
            <AppBottomSheetTouchableWrapper
              onPress={()=> {}}
              style={{
                height: wp( '13%' ),
                width: wp( '35%' ),
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}
            >
            </AppBottomSheetTouchableWrapper>
          </View>
          {( contacts.length && contacts.map( ( item, index ) => {
            return renderContactListItem( {
              contactDescription: item,
              index,
              contactsType: 'Keeper',
            } )
          } ) ) || <View style={{
            height: wp( '22%' ) + 30
          }} />}
        </View>
      </ModalContainer>

      <ModalContainer visible={HelpModal} closeBottomSheet={() => {setHelpModal( false )}} >
        <FriendsAndFamilyHelpContents
          titleClicked={() => setHelpModal( false )}
        />
      </ModalContainer>
      <ModalContainer visible={keeperTypeModal} closeBottomSheet={() => {setKeeperTypeModal( false )}} >
        <KeeperTypeModalContents
          headerText={'Change backup method'}
          subHeader={'Share your Recovery Key with a new contact or a different device'}
          onPressSetup={async ( type, name ) => {
            setSelectedKeeperType( type )
            setSelectedKeeperName( name )
            onPressChangeKeeperType( type, name )
          }}
          onPressBack={() => setKeeperTypeModal( false )}
          selectedLevelId={selectedLevelId}
          keeper={selectedKeeper}
        />
      </ModalContainer>
      {showLoader ? <Loader /> : null}
    </View>
  )
}

export default TrustedContactHistoryKeeper

const styles = StyleSheet.create( {
  imageBackground: {
    backgroundColor: Colors.shadowBlue,
    height: wp( '15%' ),
    width: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 2.5,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp( '4%' ),
  },
  contactImageAvatar: {
    width: wp( '15%' ),
    height: wp( '15%' ),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginRight: 8,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
  },
  contactImage: {
    height: wp( '14%' ),
    width: wp( '14%' ),
    resizeMode: 'cover',
    alignSelf: 'center',
    borderRadius: wp( '14%' ) / 2,
  },
} )
