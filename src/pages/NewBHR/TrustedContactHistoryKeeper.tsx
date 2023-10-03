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
import { RootStateOrAny, useSelector } from 'react-redux'
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
  createGuardian,
  setApprovalStatus,
  downloadSMShare,
} from '../../store/actions/BHR'
import { useDispatch } from 'react-redux'
import {
  KeeperInfoInterface,
  Keepers,
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
  LevelData,
  ShareSplitScheme,
  KeeperType
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
import idx from 'idx'
import Toast from '../../components/Toast'
import Loader from '../../components/loader'
import useStreamFromContact from '../../utils/hooks/trusted-contacts/UseStreamFromContact'
import Relay from '../../bitcoin/utilities/Relay'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import { translations } from '../../common/content/LocContext'
import QRModal from '../Accounts/QRModal'

const TrustedContactHistoryKeeper = ( props ) => {
  const strings  = translations[ 'bhr' ]
  const [ ChangeBottomSheet ] = useState( React.createRef() )
  const [ keeperTypeModal, setKeeperTypeModal ] = useState( false )
  const [ HelpModal, setHelpModal ] = useState( false )
  const [ ErrorModal, setErrorModal ] = useState( false )
  const [ ConfirmModal, setConfirmModal ] = useState( false )
  const [ ChangeModal, setChangeModal ] = useState( false )
  const [ shareOtpWithTrustedContactModal, setShareOtpWithTrustedContactModal ] = useState( false )
  const [ keeperDeviceConfirmMessageModal, setKeeperDeviceConfirmMessageModal ] = useState( false )
  const  selectedKeeper  = props.route.params?.selectedKeeper
  const [ oldChannelKey, setOldChannelKey ] = useState( selectedKeeper.channelKey ? selectedKeeper.channelKey : '' )
  const [ channelKey, setChannelKey ] = useState( selectedKeeper.channelKey ? selectedKeeper.channelKey : '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ reshareModal, setReshareModal ] = useState( false )
  const [ isChangeClicked, setIsChangeClicked ] = useState( false )
  const [ ReshareBottomSheet ] = useState(
    React.createRef(),
  )
  const [ ConfirmBottomSheet ] = useState(
    React.createRef(),
  )
  const [ showLoader ] = useState( false )
  const [ OTP, setOTP ] = useState( '' )
  const [ renderTimer, setRenderTimer ] = useState( false )
  const [ trustedContactHistory, setTrustedContactHistory ] = useState( historyArray )
  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ isVersionMismatch, setIsVersionMismatch ] = useState( false )
  const [ isGuardianCreationClicked, setIsGuardianCreationClicked ] = useState( false )
  const [ isReshare, setIsReshare ] = useState( props.route.params?.isChangeKeeperType ? false : selectedKeeper.status === 'notAccessible' && selectedKeeper.updatedAt == 0 ? true : false )
  const [ selectedTitle, setSelectedTitle ] = useState( props.route.params?.selectedTitle )
  const [ SelectedRecoveryKeyNumber, setSelectedRecoveryKeyNumber ] = useState( props.route.params?.SelectedRecoveryKeyNumber )
  const [ isChange, setIsChange ] = useState( props.route.params?.isChangeKeeperType )
  const [ chosenContact, setChosenContact ] = useState( props.route.params?.isChangeKeeperType ? null :
    selectedKeeper && selectedKeeper.data && selectedKeeper.data.index
      ? selectedKeeper.data
      : null,
  )
  const [ shareType, setShareType ] = useState( selectedKeeper.shareType )
  const [ showFNFList, setShowFNFList ] = useState( false )
  const createChannelAssetsStatus = useSelector( ( state: RootStateOrAny ) => state.bhr.loading.createChannelAssetsStatus )
  const isErrorSendingFailed = useSelector( ( state: RootStateOrAny ) => state.bhr.errorSending )
  const channelAssets: ChannelAssets = useSelector( ( state: RootStateOrAny ) => state.bhr.channelAssets )
  const metaSharesKeeper = useSelector( ( state: RootStateOrAny ) => state.bhr.metaSharesKeeper )
  const oldMetaSharesKeeper = useSelector( ( state: RootStateOrAny ) => state.bhr.oldMetaSharesKeeper )

  const MetaShares: MetaShare[] = [ ...metaSharesKeeper ]
  const OldMetaShares: MetaShare[] = [ ...oldMetaSharesKeeper ]
  const keeperInfo = useSelector( ( state: RootStateOrAny ) => state.bhr.keeperInfo )
  const levelData: LevelData[] = useSelector( ( state: RootStateOrAny ) => state.bhr.levelData )
  const currentLevel = useSelector( ( state: RootStateOrAny ) => state.bhr.currentLevel )
  const trustedContacts: Trusted_Contacts = useSelector( ( state: RootStateOrAny ) => state.trustedContacts.contacts )
  const [ contacts, setContacts ] = useState( [] )
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const index = props.route.params?.index
  const dispatch = useDispatch()
  const [ approvalErrorModal, setApprovalErrorModal ] = useState( false )
  const [ qrModal, setQRModal ] = useState( false )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const approvalStatus = useSelector( ( state: RootStateOrAny ) => state.bhr.approvalStatus )

  useEffect( () => {
    if ( isChange ) {
      // setTrustedContactModal( true )
      props.navigation.navigate( 'FNFToKeeper', {
        ...props.route.params,
        onPressContinue
      } )
    }
  }, [ isChange ] )

  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true )
    setQRModal( true )
    setKeeperTypeModal( false )
  }

  const renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={
          'Please approve this request by scanning the Secondary Key stored with any of the other backups'
        }
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={async( qrScannedData ) => {
          dispatch( setApprovalStatus( false ) )
          dispatch( downloadSMShare( qrScannedData ) )
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag( false )
          setQRModal( false )
        }}
        onPressContinue={()=>{}}
      />
    )
  }

  useEffect( ()=>{
    if( approvalStatus && isChangeClicked ){
      setQRModal( false )
      onPressChangeKeeperType( selectedKeeperType, selectedKeeperName )
    }
  }, [ approvalStatus ] )

  useEffect( ()=>{
    if( isChange && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( setApprovalStatus( true ) )
    }
  }, [ channelAssets ] )


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
      if( selectedKeeper.status === 'notSetup' ) {
        // setTrustedContactModal( true )
        props.navigation.navigate( 'FNFToKeeper', {
          ...props.route.params,
          onPressContinue
        } )
      }
      const shareHistory = JSON.parse( await AsyncStorage.getItem( 'shareHistory' ) )
      if ( shareHistory ) updateHistory( shareHistory )
    } )()
    const trustedContactsInfo: Keepers = trustedContacts
    const contactName = selectedKeeper.name.toLowerCase().trim()
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
    approvalCheck()
  }, [ ] )

  const approvalCheck = async() => {
    if( selectedKeeper.channelKey ){
      const instream = useStreamFromContact( trustedContacts[ selectedKeeper.channelKey ], wallet.walletId, true )
      const flag = await TrustedContactsOperations.checkSecondaryUpdated(
        {
          walletId: wallet.walletId,
          options:{
            retrieveSecondaryData: true
          },
          channelKey: selectedKeeper.channelKey,
          StreamId: instream.streamId
        }
      )
      if( !flag ){
        setApprovalErrorModal( true )
      }
    }
  }

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

  const renderContactListItem = useCallback( ( { contactDescription, }: {
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
        onPressOk={( ) => {
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
    if ( currentContact && currentContact.isActive ){
      setReshareModal( false )
      if( selectedKeeper.shareType == 'existingContact' ){
        sendNotificationForExistingContact()
      } else {
        props.navigation.navigate( 'QrAndLink', {
          contact: chosenContact,
          shareType,
          channelKey,
        } )
      }
    } else {
      setReshareModal( false )
      props.navigation.navigate( 'FNFToKeeper', {
        ...props.route.params,
        onPressContinue,
        recreateChannel: true
      } )
    }
  }, [ selectedTitle, chosenContact, getContacts ] )

  const renderChangeContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change where you store \nyour Recovery Key'}
        info={'Having problems?'}
        note={
          'You can send your Recovery Key to someone else'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          props.navigation.navigate( 'FNFToKeeper', {
            ...props.route.params,
            onPressContinue
          } )
          setIsChange( true )
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

  const initiateGuardianCreation = async (
    { changeKeeper, chosenContact, shareType, recreateChannel }:
    { changeKeeper?: boolean, chosenContact?: any, shareType?: KeeperType, recreateChannel?: any}
  ) => {
    const isChangeKeeper = isChange || changeKeeper
    if( shareType != KeeperType.EXISTING_CONTACT && isReshare && !isChangeKeeper && !recreateChannel ) return
    const contactDetails = chosenContact || {
    }
    setChosenContact( contactDetails )

    let channelKeyToUse: string
    if( recreateChannel ) channelKeyToUse =  BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
    else {
      if( shareType == KeeperType.EXISTING_CONTACT ) channelKeyToUse = contactDetails.channelKey
      else {
        if( isChangeKeeper ) channelKeyToUse = BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
        else {
          if( selectedKeeper.channelKey ) channelKeyToUse = selectedKeeper.channelKey
          else channelKeyToUse = BHROperations.generateKey( config.CIPHER_SPEC.keyLength )
        }
      }
    }

    setIsGuardianCreationClicked( true )
    setChannelKey( channelKeyToUse )

    let sharePosition: number
    if( currentLevel === 0 ) sharePosition = -1
    else{
      const metaShareIndex = MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId )
      if( metaShareIndex >= 0 ) sharePosition = metaShareIndex
      else {
        const oldMetaShareIndex = OldMetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId )
        if( oldMetaShareIndex >= 0 ) sharePosition = oldMetaShareIndex
        else sharePosition = 2
      }
    }

    let splitScheme: ShareSplitScheme
    const share: MetaShare = MetaShares.find( value => value.shareId === selectedKeeper.shareId ) || OldMetaShares.find( value => value.shareId === selectedKeeper.shareId )
    if( share ) splitScheme = share.meta.scheme
    else{
      if( currentLevel == 0 ) splitScheme = ShareSplitScheme.OneOfOne
      else splitScheme = ShareSplitScheme.TwoOfThree
    }
    const keeperInfo: KeeperInfoInterface = {
      shareId: selectedKeeper.shareId,
      name: contactDetails.name || contactDetails.displayedName || '',
      type: shareType,
      scheme: splitScheme,
      currentLevel: currentLevel == 0 ? 1 : currentLevel,
      createdAt: moment( new Date() ).valueOf(),
      sharePosition,
      data: {
        ...contactDetails,
        index
      },
      channelKey: channelKeyToUse
    }
    dispatch( updatedKeeperInfo( keeperInfo ) ) // updates keeper-info in the reducer
    dispatch( createChannelAssets( selectedKeeper.shareId ) )
  }

  useEffect( ()=> {
    // invoke create/change guardian saga, once channel assets have been created
    const channelAssetsCreated = !createChannelAssetsStatus
    if( isGuardianCreationClicked && channelAssetsCreated && channelAssets.shareId == selectedKeeper.shareId ) {
      dispatch( createGuardian( {
        channelKey, shareId: selectedKeeper.shareId, contact: chosenContact, isChangeKeeper: isChange, oldChannelKey, isExistingContact: shareType == KeeperType.EXISTING_CONTACT ? true : false
      } ) )
    }
  }, [ createChannelAssetsStatus, channelAssets, chosenContact, keeperInfo ] )

  useEffect( () => {
    if( chosenContact ){ // if contact has been associated
      const currentContact: TrustedContact = trustedContacts[ channelKey ]
      if ( !currentContact || ( currentContact && currentContact.relationType != TrustedContactRelationTypes.KEEPER ) ) return

      if( isGuardianCreationClicked ){
        initiateKeeperHealth()
        if( shareType !== KeeperType.EXISTING_CONTACT ){
          props.navigation.navigate( 'QrAndLink', {
            // navigate to QRAndLink page to generate and show links/QR
            contact: chosenContact,
            shareType,
            channelKey,
          } )
        }
      }
    }
  }, [ chosenContact, trustedContacts ] )

  const initiateKeeperHealth = () => {
    let reshareVersion = 0
    const share: MetaShare = MetaShares.find( value => value.shareId === selectedKeeper.shareId ) || OldMetaShares.find( value => value.shareId === selectedKeeper.shareId )
    if( share ) reshareVersion = share.meta.reshareVersion

    const shareHealth: LevelInfo = {
      walletId: wallet.walletId,
      shareId: selectedKeeper.shareId,
      reshareVersion,
      shareType: shareType,
      status: 'notAccessible',
      name: chosenContact && chosenContact.name ? chosenContact.name : '',
      updatedAt: 0
    }

    dispatch( updateMSharesHealth( shareHealth, isChange ) )
    dispatch( setChannelAssets( {
    }, null ) )
    setIsGuardianCreationClicked( false )
  }

  const onPressChangeKeeperType = ( type, name ) => {
    const changeIndex = getIndex( levelData, type, selectedKeeper, keeperInfo )
    setIsChangeClicked( false )
    setKeeperTypeModal( false )
    const navigationParams = {
      selectedTitle: name,
      SelectedRecoveryKeyNumber: SelectedRecoveryKeyNumber,
      selectedKeeper: {
        shareType: type,
        name: name,
        reshareVersion: 0,
        status: 'notSetup',
        updatedAt: 0,
        shareId: selectedKeeper.shareId,
        data: {
        },
        channelKey: selectedKeeper.channelKey
      },
      index: changeIndex,
    }

    if ( type == 'contact' ) {
      setChangeModal( true )
    }
    if( type == 'cloud' ){
      props.navigation.navigate( 'CloudBackupHistory', {
        ...navigationParams,
        isChangeKeeperType: true,
      } )
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

  const onPressContinue = ( selectedContacts, recreateChannel? ) => {
    Keyboard.dismiss()
    let shareType = KeeperType.CONTACT
    if( selectedContacts.length && selectedContacts[ 0 ].isExisting ){
      setChannelKey( selectedContacts[ 0 ].channelKey )
      shareType = KeeperType.EXISTING_CONTACT
    }
    setShareType( shareType )
    setTimeout( () => {
      initiateGuardianCreation( {
        chosenContact: getContacts( selectedContacts ), shareType, recreateChannel
      } )
    }, 10 )
  }

  const renderKeeperDeviceConfirmMessage = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={keeperDeviceConfirmMessageModal}
        title={'Keeper Contact'}
        note={
          'For confirming your Recovery Key on the Keeper Contact, simply open the app on that device and log in'
        }
        proceedButtonText={'Ok, got it'}
        onPressProceed={() => setKeeperDeviceConfirmMessageModal( false )}
        onPressIgnore={() => setKeeperDeviceConfirmMessageModal( false )}
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
          : 'Never'}
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
          confirmButtonText={selectedKeeper.updatedAt > 0 ? 'Confirm' : 'Share Now' }
          onPressChange={() => {
            setKeeperTypeModal( true )
          }}
          onPressConfirm={() => {
            if( selectedKeeper.updatedAt == 0 ){
              props.navigation.navigate( 'FNFToKeeper', {
                ...props.route.params,
                onPressContinue
              } )
            } else {
              setKeeperDeviceConfirmMessageModal( true )
            }
          }}
          onPressReshare={() => {
            setReshareModal( true )
          }}
          isVersionMismatch={isVersionMismatch}
          isChangeKeeperAllow={false}
          // isChangeKeeperAllow={isChange ? false : ( selectedKeeper.updatedAt > 0 || selectedKeeper.status == 'notAccessible' ) ? true : false}
          reshareButtonText={'Reshare'}
          changeButtonText={'Change'}
        />
      </View>
      <ModalContainer onBackground={()=>setKeeperDeviceConfirmMessageModal( false )} visible={keeperDeviceConfirmMessageModal} closeBottomSheet={()=>setKeeperDeviceConfirmMessageModal( false )} >
        {renderKeeperDeviceConfirmMessage()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setShareOtpWithTrustedContactModal( false )} visible={shareOtpWithTrustedContactModal} closeBottomSheet={() => setShareOtpWithTrustedContactModal( false )}>
        {renderShareOtpWithTrustedContactContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setChangeModal( false )} visible={ChangeModal} closeBottomSheet={() => setChangeModal( false )}>
        {renderChangeContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setReshareModal( false )} visible={reshareModal} closeBottomSheet={() => setReshareModal( false )}>
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
      <ModalContainer onBackground={()=>setConfirmModal( false )} visible={ConfirmModal} closeBottomSheet={() => setConfirmModal( false )}>
        {renderConfirmContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setErrorModal( false )} visible={ErrorModal} closeBottomSheet={() => setErrorModal( false )}>
        {renderErrorModalContent()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setShowFNFList( false )} visible={showFNFList} closeBottomSheet={() => setShowFNFList( false )}>
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

      <ModalContainer onBackground={()=>setHelpModal( false )} visible={HelpModal} closeBottomSheet={() => {setHelpModal( false )}} >
        <FriendsAndFamilyHelpContents
          titleClicked={() => setHelpModal( false )}
        />
      </ModalContainer>
      <ModalContainer onBackground={()=>setKeeperTypeModal( false )} visible={keeperTypeModal} closeBottomSheet={() => {setKeeperTypeModal( false )}} >
        <KeeperTypeModalContents
          selectedLevelId={props.route.params?.selectedLevelId}
          headerText={'Change backup method'}
          subHeader={'Share your Recovery Key with a new contact or a different device'}
          onPressSetup={async ( type, name ) => {
            setSelectedKeeperType( type )
            setSelectedKeeperName( name )
            // note remove PDF flow for level 2 & 3
            // if( type == 'pdf' ) { setIsChangeClicked( true ); sendApprovalRequestToPK( ) }
            // else
            onPressChangeKeeperType( type, name )
          }}
          onPressBack={() => setKeeperTypeModal( false )}
          keeper={selectedKeeper}
        />
      </ModalContainer>
      <ModalContainer visible={approvalErrorModal} closeBottomSheet={()=>{setApprovalErrorModal( false )}} >
        <ErrorModalContents
          title={'Need Approval'}
          note={'Scan the Approval Key stored on Personal Device 1 in: Security and Privacy> I am the Keeper of > Contact'}
          proceedButtonText={strings.ok}
          onPressProceed={() => setApprovalErrorModal( false )}
          isBottomImage={false}
        />
      </ModalContainer>
      <ModalContainer visible={qrModal} closeBottomSheet={() => {setQRModal( false )}} >
        {renderQrContent()}
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
