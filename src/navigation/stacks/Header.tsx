import BottomSheet from '@gorhom/bottom-sheet'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import messaging from '@react-native-firebase/messaging'
import idx from 'idx'
import moment from 'moment'
import React, { createRef, PureComponent } from 'react'
import {
  Alert,
  AppState,
  Linking,
  Platform,
  StyleSheet,
  View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import LinearGradient from 'react-native-linear-gradient'
import * as RNLocalize from 'react-native-localize'
import PushNotification from 'react-native-push-notification'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP, widthPercentageToDP
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import { v4 as uuid } from 'uuid'
import {
  AccountType,
  DeepLinkEncryptionType,
  KeeperInfoInterface,
  LevelHealthInterface, notificationType, QRCodeTypes,
  Trusted_Contacts,
  Wallet
} from '../../bitcoin/utilities/Interface'
import Relay from '../../bitcoin/utilities/Relay'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Colors from '../../common/Colors'
import {
  getCurrencyImageByRegion,
  processDeepLink,
  processRequestQR
} from '../../common/CommonFunctions/index'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import ContactTrustKind from '../../common/data/enums/ContactTrustKind'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import AccountShell from '../../common/data/models/AccountShell'
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import Fonts from '../../common/Fonts'
import BottomSheetRampInfo from '../../components/bottom-sheets/ramp/BottomSheetRampInfo'
import BottomSheetSwanInfo from '../../components/bottom-sheets/swan/BottomSheetSwanInfo'
import ClipboardAutoRead from '../../components/ClipboardAutoRead'
import ErrorModalContents from '../../components/ErrorModalContents'
import BuyBitcoinHomeBottomSheet, { BuyBitcoinBottomSheetMenuItem, BuyMenuItemKind } from '../../components/home/BuyBitcoinHomeBottomSheet'
import HomeHeader from '../../components/home/home-header_update'
import ModalContainer from '../../components/home/ModalContainer'
import { NotificationType } from '../../components/home/NotificationType'
import NotificationInfoContents from '../../components/NotificationInfoContents'
import NotificationListContent from '../../components/NotificationListContent'
import Toast from '../../components/Toast'
import BottomSheetHeader from '../../pages/Accounts/BottomSheetHeader'
import AddContactAddressBook from '../../pages/Contacts/AddContactAddressBook'
import AcceptGift from '../../pages/FriendsAndFamily/AcceptGift'
import TrustedContactRequestContent from '../../pages/Home/TrustedContactRequestContent'
import {
  addTransferDetails,
  fetchExchangeRates,
  fetchFeeRates,
  recomputeNetBalance,
  setShowAllAccount
} from '../../store/actions/accounts'
import {
  acceptExistingContactRequest,
  initializeHealthSetup,
  rejectedExistingContactRequest,
  updateCloudPermission,
  updateSecondaryShard
} from '../../store/actions/BHR'
import { setCloudData } from '../../store/actions/cloud'
import { updateLinkingURL } from '../../store/actions/doNotStore'
import {
  getMessages,
  notificationPressed,
  notificationsUpdated,
  setupNotificationList,
  updateFCMTokens,
  updateMessageStatus,
  updateMessageStatusInApp,
  updateNotificationList
} from '../../store/actions/notifications'
import {
  setCardData,
  setCurrencyCode,
  setFCMToken,
  setIsPermissionGiven,
  setSecondaryDeviceAddress,
  updateLastSeen,
  updatePreference
} from '../../store/actions/preferences'
import { clearRampCache } from '../../store/actions/RampIntegration'
import { credsAuthenticated } from '../../store/actions/setupAndAuth'
import { clearSwanCache, createTempSwanAccountInfo, updateSwanStatus } from '../../store/actions/SwanIntegration'
import {
  fetchGiftFromTemporaryChannel,
  initializeTrustedContact, InitTrustedContactFlowKind,
  PermanentChannelsSyncKind, rejectGift,
  rejectTrustedContact,
  syncPermanentChannels
} from '../../store/actions/trustedContacts'
import { setVersion } from '../../store/actions/versionHistory'
import { AccountsState } from '../../store/reducers/accounts'
import { makeContactRecipientDescription } from '../../utils/sending/RecipientFactories'
import { CommonActions } from '@react-navigation/native'

export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 500
export enum BottomSheetState {
  Closed,
  Open,
}

export enum BottomSheetKind {
  TAB_BAR_BUY_MENU,
  TRUSTED_CONTACT_REQUEST,
  ADD_CONTACT_FROM_ADDRESS_BOOK,
  NOTIFICATIONS_LIST,
  SWAN_STATUS_INFO,
  WYRE_STATUS_INFO,
  RAMP_STATUS_INFO,
  ERROR,
  CLOUD_ERROR,
  NOTIFICATION_INFO,
  GIFT_REQUEST,
  APPROVAL_MODAL
}

interface HomeStateTypes {
  notificationLoading: boolean;
  notificationData: any[];
  CurrencyCode: string;
  netBalance: number;
  bottomSheetState: BottomSheetState;
  currentBottomSheetKind: BottomSheetKind | null;
  secondaryDeviceOtp: any;
  currencyCode: string;
  notificationDataChange: boolean;
  trustedContactRequest: any;
  isCurrentLevel0: boolean;
  giftRequest: any;
  recoveryRequest: any;
  isLoadContacts: boolean;
  notificationTitle: string | null;
  notificationInfo: string | null;
  notificationNote: string | null;
  notificationType: string | null;
  notificationAdditionalInfo: any;
  notificationProceedText: string | null;
  notificationIgnoreText: string | null;
  isIgnoreButton: boolean;
  currentMessage: any;
  errorMessageHeader: string;
  errorMessage: string;
  selectedContact: any[];
  appState: string;
  lastActiveTime: string;
  swanDeepLinkContent: string | null;
  isBalanceLoading: boolean;
  addContactModalOpened: boolean;
  wyreDeepLinkContent: string | null;
  rampDeepLinkContent: string | null;
  rampFromBuyMenu: boolean | null;
  rampFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreFromDeepLink: boolean | null;
  releaseNotes: string;
  giftLoading: boolean;
}

interface HomePropsTypes {
  showContent: boolean;
  navigation: any;
  route: any;
  notificationList: any;
  exchangeRates?: any[];
  levelHealth: LevelHealthInterface[];
  accountsState: AccountsState;
  wallet: Wallet;
  walletName: string;
  UNDER_CUSTODY: any;
  updateFCMTokens: any;
  initializeTrustedContact: any;
  fetchGiftFromTemporaryChannel: any,
  rejectGift: any,
  acceptExistingContactRequest: any;
  rejectTrustedContact: any;
  currentLevel: number;
  setCurrencyCode: any;
  currencyCode: any;
  setSecondaryDeviceAddress: any;
  accountShells: AccountShell[];
  messages: any;
  updateMessageStatusInApp: any;
  updateMessageStatus: any;
  fromScreen: string;
  cloudPermissionGranted: any;
  initializeHealthSetup: any;
  overallHealth: any;
  keeperInfo: any[];
  // clearWyreCache: any;
  clearRampCache: any;
  clearSwanCache: any;
  updateSwanStatus: any;
  fetchFeeRates: any;
  fetchExchangeRates: any;
  createTempSwanAccountInfo: any;
  addTransferDetails: any;
  notificationListNew: any;
  notificationsUpdated: any;
  updatePreference: any;
  existingFCMToken: any;
  setFCMToken: any;
  secondaryDeviceAddressValue: any;
  releaseCasesValue: any;
  swanDeepLinkContent: string | null;
  database: any;
  setCardData: any;
  cardDataProps: any;
  secureAccount: any;
  setVersion: any;
  wyreDeepLinkContent: string | null;
  rampDeepLinkContent: string | null;
  rampFromBuyMenu: boolean | null;
  rampFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreFromDeepLink: boolean | null;
  setCloudData: any;
  newBHRFlowStarted: any;
  cloudBackupStatus: CloudBackupStatus;
  updateCloudPermission: any;
  credsAuthenticated: any;
  setShowAllAccount: any;
  setIsPermissionGiven: any;
  isPermissionSet: any;
  isAuthenticated: any;
  setupNotificationList: any;
  asyncNotificationList: any;
  updateNotificationList: any;
  fetchStarted: any;
  initLoader: boolean;
  getMessages: any;
  syncPermanentChannels: any;
  updateLastSeen: any;
  updateSecondaryShard: any;
  openApproval: boolean;
  availableKeepers: KeeperInfoInterface[]
  approvalContactData: ContactRecipientDescribing;
  rejectedExistingContactRequest: any;
  trustedContacts: Trusted_Contacts;
  IsCurrentLevel0: boolean;
  walletId: string;
  notificationPressed: any;
  clipboardAccess: boolean;
  recomputeNetBalance: any;
  updateLinkingURL:( s:string )=>void;
  linkingURL: string;
  shouldListen:boolean;
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
  linkStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  currentNotificationId: string;
  bottomSheetRef = createRef<BottomSheet>();
  openBottomSheetOnLaunchTimeout: null | ReturnType<typeof setTimeout>;
  syncPermanantChannelTime: any
  static whyDidYouRender = true;

  constructor( props ) {
    super( props )
    this.openBottomSheetOnLaunchTimeout = null

    this.state = {
      notificationData: [],
      CurrencyCode: 'USD',
      netBalance: this.props.accountsState.netBalance,
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
      secondaryDeviceOtp: {
      },
      appState: '',
      currencyCode: 'USD',
      notificationDataChange: false,
      trustedContactRequest: null,
      isCurrentLevel0: false,
      giftRequest: null,
      recoveryRequest: null,
      isLoadContacts: false,
      notificationLoading: true,
      notificationTitle: null,
      notificationInfo: null,
      notificationNote: null,
      notificationType: null,
      notificationAdditionalInfo: null,
      notificationProceedText: null,
      notificationIgnoreText:null,
      isIgnoreButton: false,
      currentMessage: null,
      giftLoading: false,
      errorMessageHeader: '',
      errorMessage: '',
      selectedContact: [],
      lastActiveTime: moment().toISOString(),
      swanDeepLinkContent: null,
      isBalanceLoading: true,
      addContactModalOpened: false,
      wyreDeepLinkContent: null,
      rampDeepLinkContent: null,
      rampFromBuyMenu: null,
      rampFromDeepLink: null,
      wyreFromBuyMenu: null,
      wyreFromDeepLink: null,
      releaseNotes: '',
    }
    this.currentNotificationId= ''
  }

  onCodeScanned = async ( qrData ) => {
    const { trustedContactRequest, giftRequest } = await processRequestQR( qrData )
    if( trustedContactRequest ){
      this.setState( {
        trustedContactRequest
      },
      () => {
        if ( trustedContactRequest.isContactGift ) {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.GIFT_REQUEST,
            1
          )
        } else {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          )
        }

      }
      )
    }
    if( giftRequest ){
      this.setState( {
        giftRequest
      },  () => {
        this.openBottomSheetOnLaunch(
          BottomSheetKind.GIFT_REQUEST,
          1
        )
      } )
    }
  }

  navigateToQRScreen = () => {
    this.props.navigation.navigate( 'QRRoot', {
      onCodeScanned:  this.onCodeScanned,
    } )
  }


  onPressNotifications = async () => {
    this.readAllNotifications()
    setTimeout( () => {
      this.setState( {
        notificationLoading: false,
      } )
    }, 500 )
    this.notificationCheck()
    this.openBottomSheetOnLaunch( BottomSheetKind.NOTIFICATIONS_LIST )
    const notificationRejection = this.props.messages.find( value=>value.type == notificationType.FNF_KEEPER_REQUEST_REJECTED && value.additionalInfo && value.additionalInfo.wasExistingContactRequest && value.additionalInfo.channelKey )
    if( notificationRejection ) {
      this.props.rejectedExistingContactRequest( notificationRejection.additionalInfo.channelKey )
    }
  };

  notificationCheck = () =>{
    const { messages } = this.props
    if( messages && messages.length ){
      this.updateBadgeCounter()
      messages.sort( function ( left, right ) {
        return moment.utc( right.timeStamp ).unix() - moment.utc( left.timeStamp ).unix()
      } )
      this.setState( {
        notificationData: messages,
        notificationDataChange: !this.state.notificationDataChange,
      } )
      if( this.currentNotificationId !== '' ) {
        const message = messages.find( message => message.notificationId === this.currentNotificationId )
        if( message ){
          this.handleNotificationBottomSheetSelection( message )
        }
        this.currentNotificationId = ''
      } else {
        const message = messages.find( message => message.additionalInfo === null &&  message.status === 'unread' )
        if( message ){
          this.handleNotificationBottomSheetSelection( message )
        }
      }
    }
    const notificationRejection = messages.find( value=>value.type == notificationType.FNF_KEEPER_REQUEST_REJECTED && value.additionalInfo && value.additionalInfo.wasExistingContactRequest && value.additionalInfo.channelKey )
    if( notificationRejection ) {
      this.props.rejectedExistingContactRequest( notificationRejection.additionalInfo.channelKey )
    }
  }

  readAllNotifications= () => {
    const { messages } = this.props
    const arr = []
    messages.forEach( message => {
      if( message.status === 'unread' ) {
        arr.push(
          {
            notificationId: message.notificationId,
            status : 'read'
          }
        )
        this.props.updateMessageStatusInApp( message.notificationId )
      }
    } )
    if( arr.length > 0 ) {
      this.props.updateMessageStatus( arr )
    }
  }

  handleNotificationBottomSheetSelection = ( message ) => {
    const storeName = Platform.OS == 'ios' ? 'App Store' : 'Play Store'
    this.setState( {
      currentMessage: message
    } )
    const statusValue = [ {
      notificationId: message.notificationId,
      status : 'read'
    } ]
    this.props.updateMessageStatus( statusValue )
    this.props.updateMessageStatusInApp( message.notificationId )
    switch ( message.type ) {
        case NotificationType.FNF_KEEPER_REQUEST:
          this.setState( {
            trustedContactRequest: {
              walletName: message.additionalInfo.walletName,
              encryptedChannelKeys: message.additionalInfo.channelKey+'-'+message.additionalInfo.contactsSecondaryChannelKey,
              isExistingContact: true,
              isQR: true,
              type: QRCodeTypes.EXISTING_CONTACT,
              isKeeper: true,
              encryptionType: DeepLinkEncryptionType.DEFAULT,
              encryptionHint: ''
            }
          }, () => {
            this.openBottomSheet( BottomSheetKind.TRUSTED_CONTACT_REQUEST )
          } )
          break
        case NotificationType.FNF_REQUEST:
        case NotificationType.FNF_REQUEST_ACCEPTED:
          this.moveToContactDetails( message.additionalInfo.channelKey, 'Contact' )
          break
        case NotificationType.FNF_REQUEST_REJECTED:
          this.closeBottomSheet()
          this.props.navigation.popToTop()
          this.props.navigation.navigate( 'FriendsAndFamily')
          break
        case NotificationType.FNF_KEEPER_REQUEST_ACCEPTED:
          this.moveToContactDetails( message.additionalInfo.channelKey, 'I am the Keeper of' )
          break
        case NotificationType.FNF_KEEPER_REQUEST_REJECTED:
        case 'contact':
          if ( message.additionalInfo.txid !== undefined ) {
            this.moveToAccount( message.additionalInfo.type )
          }
          break
        case NotificationType.SECURE_XPUB:
        case NotificationType.APPROVE_KEEPER:
        case NotificationType.UPLOAD_SEC_SHARE:
        case NotificationType.RESHARE:
        case NotificationType.RESHARE_RESPONSE:
        case NotificationType.SM_UPLOADED_FOR_PK:
        case NotificationType.NEW_KEEPER_INFO:
        case NotificationType.GIFT_ACCEPTED:
          this.closeBottomSheet()
          this.props.navigation.navigate( 'ManageGifts', {
            giftType : '1'
          } )
          break
        case NotificationType.GIFT_REJECTED:
          this.setState( {
            notificationTitle: message.title,
            notificationInfo: message.info,
            notificationNote: '',
            notificationAdditionalInfo: message.additionalInfo,
            notificationProceedText: 'Okay',
            notificationIgnoreText: '',
            isIgnoreButton: false,
            notificationType: message.type
          }, () => {
            this.closeBottomSheet()
            this.props.navigation.navigate( 'ManageGifts', {
              giftType : '1'
            } )
          } )
          break
        case NotificationType.FNF_TRANSACTION:
          this.setState( {
            notificationTitle: message.title,
            notificationInfo: message.info,
            notificationNote: '',
            notificationAdditionalInfo: message.additionalInfo,
            notificationProceedText: 'Go to Account',
            notificationIgnoreText: '',
            isIgnoreButton: false,
            notificationType: message.type
          }, () => {
            this.moveToAccount( message.additionalInfo.txid )
          } )
          break
        case NotificationType.RELEASE:
          const current = DeviceInfo.getBuildNumber()
          const { build, mandatoryFor } = message.additionalInfo
          if( Number( current ) <= Number( mandatoryFor ) || Number( current ) <  Number( build ) ) {
            this.setState( {
              notificationTitle: message.title,
              notificationInfo: message.info,
              notificationNote: 'For updating you will be taken to the ' + storeName,
              notificationAdditionalInfo: message.additionalInfo,
              notificationProceedText: 'Upgrade',
              notificationIgnoreText: Number( current ) <= Number( mandatoryFor ) ? '' : 'Remind me later',
              isIgnoreButton: true,
              releaseNotes: Platform.OS === 'android' ?  message.additionalInfo.notes.android : message.additionalInfo.notes.ios,
              notificationType: message.type
            }, () => {
              this.openBottomSheet( BottomSheetKind.NOTIFICATION_INFO )
            } )
          }
          break
    }
  };

  onAppStateChange = async ( nextAppState ) => {
    const { appState } = this.state
    const { isPermissionSet, setIsPermissionGiven } = this.props
    if( this.props.linkingURL ){
      this.props.updateLinkingURL( '' )
    }
    try {
      if ( appState === nextAppState ) return
      if ( isPermissionSet ) {
        setIsPermissionGiven( false )
        return
      }
      this.setState(
        {
          appState: nextAppState,
        },
        async () => {
          if ( nextAppState === 'inactive' || nextAppState == 'background' ) {
            this.props.updatePreference( {
              key: 'hasShownNoInternetWarning',
              value: false,
            } )
            this.props.updateLastSeen( new Date() )
            // CommonActions.navigate( {
            //   name: 'Intermediate'
            // } )
          }
        }
      )
    } catch ( error ) {
      // do nothing
    }
  };

  localNotification = async ( notificationDetails ) => {
    const channelIdRandom = moment().valueOf()
    PushNotification.createChannel(
      {
        channelId: `${channelIdRandom}`,
        channelName: 'reminder',
        channelDescription: 'A channel to categorise your notifications',
        playSound: false,
        soundName: 'default',
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
      },
      ( created ) =>
        console.log( `createChannel localNotification returned '${created}'` ) // (optional) callback returns whether the channel was created, false means it already existed.
    )

    PushNotification.localNotification( {
      /* Android Only Properties */
      channelId: `${channelIdRandom}`,
      showWhen: true, // (optional) default: true
      autoCancel: true, // (optional) default: true
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      priority: 'high', // (optional) set notification priority, default: high

      /* iOS and Android properties */
      id: notificationDetails.id,
      title: notificationDetails.title,
      message: notificationDetails.body,
      soundName: 'default',
    } )
  };

  createNotificationListeners = async () => {
    this.props.setIsPermissionGiven( true )
    PushNotification.configure( {
      onNotification: ( notification ) => {
        this.props.getMessages()
        if( notification.data && notification.data.content ){
          const { content } = notification.data
          const notificationId = JSON.parse( content ).notificationId
          this.currentNotificationId = notificationId
        } else if( notification.data[ 'google.message_id' ] ){
          const notificationId = notification.data[ 'google.message_id' ]
          this.currentNotificationId = notificationId
        }
        this.notificationCheck()
        if ( notification.data ) {
          notification.finish( PushNotificationIOS.FetchResult.NoData )
        }
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: ( notification ) => {

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: ( err ) => {
        console.error( err.message, err )
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    } )

    messaging().getInitialNotification().then( ( data ) => {
      if ( data ) {
        const content = JSON.parse( data.data.content )
        this.props.notificationPressed( content.notificationId, this.handleNotificationBottomSheetSelection )
      }
    } )

    messaging().onNotificationOpenedApp( ( data ) => {
      const content = JSON.parse( data.data.content )
      this.props.notificationPressed( content.notificationId, this.handleNotificationBottomSheetSelection )
    } )
  };

  syncChannel= () => {
    if( this.syncPermanantChannelTime === null ) {
      this.syncPermanantChannelTime = new Date()
      this.props.syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
        metaSync: true,
      } )
    } else {
      const now: any = new Date()
      const diff = Math.abs( now - this.syncPermanantChannelTime )
      if( diff > 300000 ) {
        this.syncPermanantChannelTime = null
        this.syncChannel()
      }
    }
  }

  handleDeepLinkEvent = async ( { url } ) => {
    if(url.includes('backup')){
      this.props.navigation.navigate("BackupWithKeeper")
      return;
    }   
    const { navigation } = this.props
    const isFocused = navigation.isFocused()
    // If the user is on one of Home's nested routes, and a
    // deep link is opened, we will navigate back to Home first.
    if ( !isFocused ){
      navigation.popToTop()
      navigation.navigate( 'Home',{screen:'HomeTab'} )
      this.handleDeepLinking( url )
    } else {
      this.handleDeepLinking( url )
    }
  };


  handleDeepLinking = async ( url ) => {
    if ( !url ) return
    if( this.props.linkingURL.trim() === url.trim() ) return
    this.props.updateLinkingURL( url )
    const { trustedContactRequest, swanRequest, giftRequest, campaignId } = await processDeepLink( url )
    if( trustedContactRequest ){
      this.setState( {
        trustedContactRequest,
      },
      () => {
        if ( trustedContactRequest.isContactGift ) {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.GIFT_REQUEST,
            1
          )
        } else{
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          )
        }

      }
      )
    } else if ( giftRequest ) {
      this.setState( {
        giftRequest,
      },
      () => {
        this.openBottomSheetOnLaunch(
          BottomSheetKind.GIFT_REQUEST,
          1
        )
      }
      )
    } else if ( swanRequest ) {
      this.setState( {
        swanDeepLinkContent:url,
      }, () => {
        this.props.updateSwanStatus( SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS )
        this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
      } )
    }
    else if ( campaignId ) {
      try {
        const response = await Relay.getCampaignGift( campaignId, this.props.walletId )
        if( response.error || response.err ){
          Toast( response.error || response.err )
        } else if( response.link ){
          this.onCodeScanned( response.link )
        }
      } catch ( error ) {
        Toast( error.message )
      }
    }
  }

  componentDidMount = async() => {
    const shouldListen = this.props.route.name === 'HomeTab'
    if( !shouldListen ){
      return
    }
    const {
      navigation,
      initializeHealthSetup,
      newBHRFlowStarted,
      credsAuthenticated,
    } = this.props
    this.appStateListener = AppState.addEventListener(
      'change',
      this.onAppStateChange
    )
    this.linkStateListener = Linking.addEventListener( 'url', this.handleDeepLinkEvent )
    Linking.getInitialURL().then( this.handleDeepLinking )

    // call this once deeplink is detected aswell
    this.handleDeepLinkModal()
    requestAnimationFrame( () => {
      this.syncChannel()
      this.closeBottomSheet()
      if( this.props.cloudBackupStatus == CloudBackupStatus.FAILED && this.props.levelHealth.length >= 1 && this.props.cloudPermissionGranted === true ) {
        this.openBottomSheet( BottomSheetKind.CLOUD_ERROR )
      }

      if( newBHRFlowStarted === true )
      {
        if ( this.props.levelHealth.length == 0 && !this.props.initLoader ) {
          initializeHealthSetup()
        }
      }

      // this.bootStrapNotifications()
      this.createNotificationListeners()
      this.setUpFocusListener()
      //this.getNewTransactionNotifications()



      // set FCM token(if haven't already)
      this.storeFCMToken()

      // const unhandledDeepLinkURL = this.props.route.params?.unhandledDeepLinkURL

      // if ( unhandledDeepLinkURL ) {
      //   navigation.setParams( {
      //     unhandledDeepLinkURL: null,
      //   } )
      //   this.handleDeepLinking( unhandledDeepLinkURL )
      // }
      this.props.setVersion()
      this.props.fetchExchangeRates( this.props.currencyCode )
      this.props.fetchFeeRates()
      this.props.recomputeNetBalance()
    } )
  };

   storeFCMToken = async () => {
     const fcmToken = await messaging().getToken()
     if ( !this.props.existingFCMToken || this.props.existingFCMToken != fcmToken ) {
       this.props.setFCMToken( fcmToken )
       this.props.updateFCMTokens( [ fcmToken ] )
     }
   }

  updateBadgeCounter = () => {
    const { messages } = this.props
    const unread = messages.filter( msg => msg.status === 'unread' )
    if ( Platform.OS === 'ios' ) {
      PushNotificationIOS.setApplicationIconBadgeNumber( unread.length )
    }
    const notification = messages.find( value=>value.type == notificationType.FNF_KEEPER_REQUEST && value.status == 'unread' )
    if( notification && notification.status == 'unread' ){
      this.setState( {
        trustedContactRequest: {
          walletName: notification.additionalInfo.walletName,
          encryptedChannelKeys: notification.additionalInfo.channelKey+'-'+notification.additionalInfo.contactsSecondaryChannelKey,
          isExistingContact: true,
          isQR: true,
          type: QRCodeTypes.EXISTING_CONTACT,
          isKeeper: true,
          encryptionType: DeepLinkEncryptionType.DEFAULT,
          encryptionHint: ''
        }
      }, () => {
        this.openBottomSheet( BottomSheetKind.TRUSTED_CONTACT_REQUEST )
      } )
      this.readAllNotifications()
    }
  }


  setSecondaryDeviceAddresses = async () => {
    let secondaryDeviceOtpTemp = this.props.secondaryDeviceAddressValue

    if ( !secondaryDeviceOtpTemp ) {
      secondaryDeviceOtpTemp = []
    }
    if (
      secondaryDeviceOtpTemp.findIndex(
        ( value ) => value.otp == ( this.state.secondaryDeviceOtp as any ).otp
      ) == -1
    ) {
      secondaryDeviceOtpTemp.push( this.state.secondaryDeviceOtp )
      this.props.setSecondaryDeviceAddress( secondaryDeviceOtpTemp )
    }
  };

  getAssociatedContact = async () => {
    // TODO -- need to check this
    this.setSecondaryDeviceAddresses()
  };

  componentDidUpdate = ( prevProps, prevState ) => {
    if (
      this.state.netBalance !==
      this.props.accountsState.netBalance
    ) {
      this.setState( {
        netBalance: this.props.accountsState.netBalance,
      } )
    }

    if (
      prevProps.secondaryDeviceAddressValue !==
      this.props.secondaryDeviceAddressValue
    ) {
      this.setSecondaryDeviceAddresses()
    }
    if (
      prevProps.messages !==
      this.props.messages
    ) {
      this.updateBadgeCounter()
    }
    if( prevProps.openApproval != this.props.openApproval && !this.props.IsCurrentLevel0 ){
      if( this.props.openApproval ){
        this.openBottomSheetOnLaunch(
          BottomSheetKind.APPROVAL_MODAL,
          1
        )
      }
    }

  };

  handleDeepLinkModal = () => {
    const { params } = this.props.route
    const recoveryRequest = params?.recoveryRequest || null
    const trustedContactRequest = params?.trustedContactRequest || null
    const giftRequest = params?.giftRequest || null
    const userKey = params?.userKey || null
    const swanRequest = params?.swanRequest || null
    if ( swanRequest ) {
      this.setState( {
        swanDeepLinkContent:swanRequest.url,
      }, () => {
        this.props.wallet.accounts[ AccountType.SWAN_ACCOUNT ]?.length
          ? this.props.updateSwanStatus( SwanAccountCreationStatus.ACCOUNT_CREATED )
          : this.props.updateSwanStatus( SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS )
        this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
      } )
    }

    if ( trustedContactRequest || recoveryRequest ) {
      this.setState(
        {
          recoveryRequest,
          trustedContactRequest,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          )
        }
      )
    } else if( giftRequest ){
      this.setState(
        {
          giftRequest,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.GIFT_REQUEST,
            1
          )
        }
      )
    } else if ( userKey ) {
      this.props.navigation.navigate( 'VoucherScanner', {
        userKey,
      } )
    }
  };

  cleanupListeners() {
    try{
      this.focusListener?.()

      if ( this.appStateListener ) {
        this.appStateListener.remove()
      }
      if ( this.linkStateListener ) {
        this.linkStateListener.remove()
      }
      clearTimeout( this.openBottomSheetOnLaunchTimeout )
      if ( this.firebaseNotificationListener ) {
        this.firebaseNotificationListener()
      }
    }catch( err ){
      //
    }
  }

  componentWillUnmount() {
    this.cleanupListeners()
  }

  openBottomSheetOnLaunch(
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) {
    this.openBottomSheetOnLaunchTimeout = setTimeout( () => {
      this.openBottomSheet( kind, snapIndex )
    }, BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY )
  }

  setUpFocusListener = () => {
    const { navigation } = this.props

    this.focusListener = navigation.addListener( 'focus', () => {
      this.props.recomputeNetBalance()
      this.setCurrencyCodeFromAsync()
      this.props.fetchExchangeRates( this.props.currencyCode )
      this.props.fetchFeeRates()
      this.syncChannel()
      // this.notificationCheck()
      this.setState( {
        lastActiveTime: moment().toISOString(),
      } )
    } )
    this.notificationCheck()
    this.setCurrencyCodeFromAsync()
  };

  setCurrencyCodeFromAsync = async () => {
    const { currencyCode } = this.props
    if ( !currencyCode ) {
      this.props.setCurrencyCode( RNLocalize.getCurrencies()[ 0 ] )
      this.setState( {
        currencyCode: RNLocalize.getCurrencies()[ 0 ],
      } )
    } else {
      this.setState( {
        currencyCode: currencyCode,
      } )
    }
  };

  upgradeNow () {
    const url =
      Platform.OS == 'ios'
        ? 'https://apps.apple.com/us/app/bitcoin-wallet-hexa-2-0/id1586334138'
        : 'https://play.google.com/store/apps/details?id=io.hexawallet.hexa2&hl=en'
    Linking.canOpenURL( url ).then( ( supported ) => {
      if ( supported ) {
        Linking.openURL( url )
      } else {}
    } )
  }

  handleAccountCardSelection = ( selectedAccount: AccountShell ) => {
    this.props.navigation.navigate( 'AccountDetails', {
      accountShellID: selectedAccount.id,
    } )
  };

  openBottomSheet = (
    kind: BottomSheetKind,
    snapIndex?: number | null,
    swanAccountClicked?: boolean | false
  ) => {
    const tempMenuItem: BuyBitcoinBottomSheetMenuItem = {
      kind: BuyMenuItemKind.SWAN
    }

    if( swanAccountClicked ) this.handleBuyBitcoinBottomSheetSelection( tempMenuItem )

    this.setState(
      {
        bottomSheetState: BottomSheetState.Open,
        currentBottomSheetKind: kind,
      },
      () => {
        if ( snapIndex == null ) {
          this.bottomSheetRef.current?.expand()
        } else {
          this.bottomSheetRef.current?.snapTo( snapIndex )
        }
      }
    )
  };

  onBottomSheetClosed() {
    this.setState( {
      currentBottomSheetKind: null,
    } )
  }

  closeBottomSheet = () => {
    this.bottomSheetRef.current?.close()
    this.onBottomSheetClosed()
  };

  onNotificationClicked = async ( value ) => {
    // if( value.status === 'unread' || value.type === NotificationType.FNF_TRANSACTION )
    // if( value.type !== NotificationType.FNF_KEEPER_REQUEST )
    this.handleNotificationBottomSheetSelection( value )
  };


  onTrustedContactRequestAccepted = ( key ) => {
    try {
      this.closeBottomSheet()
      const { navigation } = this.props
      const { trustedContactRequest, isCurrentLevel0 } = this.state

      let channelKeys: string[]
      try{
        switch( trustedContactRequest.encryptionType ){
            case DeepLinkEncryptionType.DEFAULT:
              channelKeys = trustedContactRequest.encryptedChannelKeys.split( '-' )
              break

            case DeepLinkEncryptionType.NUMBER:
            case DeepLinkEncryptionType.EMAIL:
            case DeepLinkEncryptionType.OTP:
              const decryptedKeys = TrustedContactsOperations.decryptViaPsuedoKey( trustedContactRequest.encryptedChannelKeys, key )
              channelKeys = decryptedKeys.split( '-' )
              break
        }

        trustedContactRequest.channelKey = channelKeys[ 0 ]
        trustedContactRequest.contactsSecondaryChannelKey = channelKeys[ 1 ]
      } catch( err ){
        Toast( 'Invalid key', true, true )
        this.onToogleGiftLoading()
        return
      }

      if( trustedContactRequest.isExistingContact ){
        this.props.acceptExistingContactRequest( trustedContactRequest.channelKey, trustedContactRequest.contactsSecondaryChannelKey, isCurrentLevel0 )
      } else {
        navigation.navigate( 'ContactsListForAssociateContact', {
          postAssociation: ( contact ) => {
            this.props.initializeTrustedContact( {
              contact,
              flowKind: InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT,
              channelKey: trustedContactRequest.channelKey,
              contactsSecondaryChannelKey: trustedContactRequest.contactsSecondaryChannelKey,
              isPrimaryKeeper: trustedContactRequest.isPrimaryKeeper,
              isKeeper: trustedContactRequest.isKeeper,
              isCurrentLevel0
            } )
            // TODO: navigate post approval (from within saga)
            if ( trustedContactRequest.isContactGift ) {
              this.setState( {
                trustedContactRequest: {
                  ...trustedContactRequest, isAssociated: true
                }
              } )
              this.openBottomSheetOnLaunch(
                BottomSheetKind.GIFT_REQUEST,
                1
              )
            }
            setTimeout( ()=>{
              navigation.goBack()
            }, 3000 )
          }
        } )
      }
    } catch ( error ) {
      this.onToogleGiftLoading()
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  };

  onTrustedContactRejected = () => {
    try {
      this.closeBottomSheet()
      const { trustedContactRequest } = this.state
      this.props.rejectTrustedContact( {
        channelKey: trustedContactRequest.channelAddress, isExistingContact: trustedContactRequest.isExistingContact
      } )
    } catch ( error ) {
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  };

  onToogleGiftLoading=()=>{
    this.setState( ( prevState )=>{
      return {
        ...prevState,
        giftLoading:!prevState.giftLoading
      }
    } )
  }

  onGiftRequestAccepted = ( key? ) => {
    try {
      const { giftRequest } = this.state
      let decryptionKey: string
      try{
        switch( giftRequest.encryptionType ){
            case DeepLinkEncryptionType.DEFAULT:
              decryptionKey = giftRequest.encryptedChannelKeys
              break
            case DeepLinkEncryptionType.OTP:
            case DeepLinkEncryptionType.LONG_OTP:
            case DeepLinkEncryptionType.SECRET_PHRASE:
              decryptionKey = TrustedContactsOperations.decryptViaPsuedoKey( giftRequest.encryptedChannelKeys, key )
              break
        }
      } catch( err ){
        Toast( 'Invalid key', true, true )
        this.onToogleGiftLoading()
        return
      }
      this.props.fetchGiftFromTemporaryChannel( giftRequest.channelAddress, decryptionKey )
    } catch ( error ) {
      this.onToogleGiftLoading()
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  };

  onGiftRequestRejected = ( ) => {
    try {
      this.closeBottomSheet()
      const { giftRequest } = this.state
      this.props.rejectGift( giftRequest.channelAddress )
    } catch ( error ) {
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  };

  onPhoneNumberChange = () => {};

  handleBuyBitcoinBottomSheetSelection = ( menuItem: BuyBitcoinBottomSheetMenuItem ) => {

    switch ( menuItem.kind ) {
        case BuyMenuItemKind.FAST_BITCOINS:
          this.closeBottomSheet()
          this.props.navigation.navigate( 'VoucherScanner' )
          break
        case BuyMenuItemKind.SWAN:
          const swanAccountActive = false
          if( !swanAccountActive ){
            this.props.clearSwanCache()
            this.props.updateSwanStatus( SwanAccountCreationStatus.BUY_MENU_CLICKED )
          }
          else {
            this.props.updateSwanStatus( SwanAccountCreationStatus.ACCOUNT_CREATED )
          }
          this.setState( {
            swanDeepLinkContent: null
          }, () => {
            this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
          } )
          break
        case BuyMenuItemKind.RAMP:
          this.props.clearRampCache()
          this.setState( {
            rampDeepLinkContent: null,
            rampFromDeepLink: false,
            rampFromBuyMenu: true
          }, () => {
            this.openBottomSheet( BottomSheetKind.RAMP_STATUS_INFO )
          } )
          break
    }
  };

  numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }


  onBackPress = () => {
    this.openBottomSheet( BottomSheetKind.TAB_BAR_BUY_MENU )
  };

  onPressElement = ( item ) => {
    const { navigation } = this.props
    if ( item.title == 'Backup Health' ) {
      navigation.navigate( 'ManageBackupNewBHR' )
      return
    }
    if ( item.title == 'Friends & Family' ) {
      navigation.navigate( 'AddressBookContents' )
      return
    } else if ( item.title == 'Wallet Settings' ) {
      navigation.navigate( 'SettingsContents' )
      // this.settingsBottomSheetRef.current?.snapTo(1);
      // setTimeout(() => {
      //   this.setState({
      //     tabBarIndex: 0,
      //   });
      // }, 10);
    } else if ( item.title == 'Funding Sources' ) {
      navigation.navigate( 'ExistingSavingMethods' )
    } else if ( item.title === 'Bitcoin Tribe Community (Telegram)' ) {
      const url = 'https://t.me/HexaWallet'
      Linking.openURL( url )
        .then( ( data ) => {} )
        .catch( ( e ) => {
          alert( 'Make sure Telegram installed on your device' )
        } )
      return
    }
  };

  renderAcceptModal = () => {

  }

  moveToContactDetails = ( channelKey, type ) => {
    this.closeBottomSheet()
    const contactData = makeContactRecipientDescription(
      channelKey,
      this.props.trustedContacts[ channelKey ],
      ContactTrustKind.OTHER,
    )
    this.props.navigation.navigate( 'ContactDetails', {
      contact: contactData,
      contactsType: type,
      isFromApproval: true
    } )
  }

  moveToAccount = ( txid ) => {
    if ( txid !== undefined && txid !== null ) {
      this.closeBottomSheet()
      this.props.navigation.navigate( 'AccountDetails', {
        accountShellID: this.props.accountShells[ txid ].id,
        swanDeepLinkContent: this.props.swanDeepLinkContent
      } )
    }
  }

  moveToTransacation = ( notificationAdditionalInfo ) => {
    const accountShell = this.props.accountShells[ 1 ]
    const transaction = accountShell.primarySubAccount.transactions.find( tx => tx.txid === notificationAdditionalInfo.txid )
    this.closeBottomSheet()
    this.props.navigation.navigate( 'TransactionDetails', {
      transaction,
      accountShellID: accountShell.id,
    } )
  }

  renderBottomSheetContent() {
    const { navigation } = this.props
    const { notificationTitle, notificationInfo, notificationNote, notificationAdditionalInfo, notificationProceedText, notificationIgnoreText, isIgnoreButton, notificationLoading, notificationData, releaseNotes } = this.state
    switch ( this.state.currentBottomSheetKind ) {
        case BottomSheetKind.TAB_BAR_BUY_MENU:
          return (
            <>
              {/* <BottomSheetHeader title="Buy bitcoin" onPress={this.closeBottomSheet} /> */}

              <BuyBitcoinHomeBottomSheet
                onMenuItemSelected={this.handleBuyBitcoinBottomSheetSelection}
                onPress={this.closeBottomSheet}
              />
            </>
          )
        case BottomSheetKind.SWAN_STATUS_INFO:
          return (
            <>
              <BottomSheetHeader title="" onPress={this.closeBottomSheet} />
              <BottomSheetSwanInfo
                swanDeepLinkContent={this.state.swanDeepLinkContent}
                onClickSetting={() => {
                  this.closeBottomSheet()
                }}
                // onPress={this.closeBottomSheet}
                onPress={this.onBackPress}
              />
            </>
          )

        case BottomSheetKind.RAMP_STATUS_INFO:
          return (
            <>
              <BottomSheetHeader title="" onPress={this.closeBottomSheet} />
              <BottomSheetRampInfo
                rampDeepLinkContent={this.state.rampDeepLinkContent}
                rampFromBuyMenu={this.state.rampFromBuyMenu}
                rampFromDeepLink={this.state.rampFromDeepLink}
                onClickSetting={() => {
                  this.closeBottomSheet()
                }}
                // onPress={this.closeBottomSheet}
                onPress={this.onBackPress}
              />
            </>
          )

        case BottomSheetKind.TRUSTED_CONTACT_REQUEST:
          const { trustedContactRequest } = this.state

          return (
            <TrustedContactRequestContent
              trustedContactRequest={trustedContactRequest}
              onPressAccept={this.onTrustedContactRequestAccepted}
              onPressReject={this.onTrustedContactRejected}
              onPhoneNumberChange={this.onPhoneNumberChange}
              bottomSheetRef={this.bottomSheetRef}
            />
          )

        case BottomSheetKind.NOTIFICATIONS_LIST:
          return (
            <NotificationListContent
              notificationLoading={this.state.notificationLoading}
              NotificationData={this.state.notificationData}
              onNotificationClicked={this.onNotificationClicked}
              onPressBack={this.closeBottomSheet}
              bottomSheetRef={this.bottomSheetRef}
            />
          )

        case BottomSheetKind.ADD_CONTACT_FROM_ADDRESS_BOOK:
          const { isLoadContacts, selectedContact } = this.state

          return (
            <AddContactAddressBook
              isLoadContacts={isLoadContacts}
              proceedButtonText={'Confirm & Proceed'}
              onPressContinue={() => {
                if ( selectedContact && selectedContact.length ) {
                  this.closeBottomSheet()

                  navigation.navigate( 'AddContactSendRequest', {
                    SelectedContact: selectedContact,
                    headerText:'Add a contact  ',
                    subHeaderText:'Send a Friends & Family request',
                    contactText:'Adding to Friends & Family:',
                    showDone:true,
                  } )
                }
              }}
              onSelectContact={( selectedContact ) => {
                this.setState( {
                  selectedContact,
                } )
              }}
              onPressBack={this.closeBottomSheet}
              onSkipContinue={() => {
                this.closeBottomSheet()
                const contactDummy = {
                  id: uuid(),
                }
                navigation.navigate( 'AddContactSendRequest', {
                  SelectedContact: [ contactDummy ],
                  headerText:'Add a contact  ',
                  subHeaderText:'Send a Friends & Family request',
                  contactText:'Adding to Friends & Family:',
                  showDone:true,
                } )
              }}
            />
          )

        case BottomSheetKind.ERROR:
          const { errorMessageHeader, errorMessage } = this.state

          return (
            <ErrorModalContents
              title={errorMessageHeader}
              info={errorMessage}
              onPressProceed={this.closeBottomSheet}
              isBottomImage={true}
              bottomImage={require( '../../assets/images/icons/errorImage.png' )}
            />
          )

        case BottomSheetKind.CLOUD_ERROR:
          return (
            <ErrorModalContents
              title={'Cloud Backup Error'}
              info={'The wallet could not be backed up.\n\nThis may be due to network issues. Please try again in sometime from Security & Privacy.\nIf the problem persists, contact us at hexa@bithyve.com'}
              onPressProceed={()=>{
                if( this.props.levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup' && this.props.cloudPermissionGranted ){
                  this.props.setCloudData()
                }
                this.closeBottomSheet()
              }}
              onPressIgnore={()=> {
                this.props.updateCloudPermission( false )
                this.closeBottomSheet()
              }}
              // closeModal={() => this.closeBottomSheet()}
              proceedButtonText={'Try Again'}
              cancelButtonText={'Not Now'}
              isIgnoreButton={true}
              isBottomImage={true}
              isBottomImageStyle={styles.cloudErrorModalImage}
              bottomImage={require( '../../assets/images/icons/cloud_ilustration.png' )}
            />
          )


        case BottomSheetKind.NOTIFICATION_INFO:
          return (
            <NotificationInfoContents
              title={notificationTitle}
              info={notificationInfo ? notificationInfo : null}
              additionalInfo={notificationAdditionalInfo}
              onPressProceed={()=>{
                this.closeBottomSheet()
                if( this.state.notificationProceedText === 'Upgrade' ) {
                  this.upgradeNow()
                }
                switch ( this.state.notificationType ) {
                    case 'contact':
                      if ( notificationAdditionalInfo.txid !== undefined ) {
                        this.moveToAccount( notificationAdditionalInfo.type )
                      }
                      // this.moveToAccount( notificationAdditionalInfo )
                      break
                    case NotificationType.FNF_TRANSACTION:
                      this.moveToAccount( notificationAdditionalInfo.txid )
                      break

                    case NotificationType.FNF_REQUEST_ACCEPTED:
                      this.moveToContactDetails( notificationAdditionalInfo.channelKey, 'Contact' )
                      break

                    case NotificationType.GIFT_ACCEPTED:
                      this.closeBottomSheet()
                      this.props.navigation.navigate( 'ManageGifts', {
                        giftType : '1'
                      } )
                      break

                    case NotificationType.GIFT_REJECTED:
                      this.closeBottomSheet()
                      this.props.navigation.navigate( 'ManageGifts', {
                        giftType : '1'
                      } )
                      break

                    case NotificationType.FNF_KEEPER_REQUEST_ACCEPTED:
                      this.moveToContactDetails( notificationAdditionalInfo.channelKey, 'I am the Keeper of' )
                      break
                }
              }}
              onPressIgnore={()=> {
                this.closeBottomSheet()
              }}
              onPressClose={()=>{
                this.closeBottomSheet()
              }}
              proceedButtonText={notificationProceedText}
              cancelButtonText={notificationIgnoreText}
              isIgnoreButton={isIgnoreButton}
              note={notificationNote}
              bottomSheetRef={this.bottomSheetRef}
              releaseNotes={releaseNotes}
            />
          )

        case BottomSheetKind.GIFT_REQUEST:
          const giftRequest = this.state.giftRequest ?? this.state.trustedContactRequest

          return (
            <AcceptGift
              navigation={this.props.navigation}
              closeModal={() => this.closeBottomSheet()}
              onGiftRequestAccepted={this.onGiftRequestAccepted}
              onGiftRequestRejected={this.onGiftRequestRejected}
              walletName={giftRequest.walletName}
              giftAmount={giftRequest.amount}
              inputType={giftRequest.encryptionType}
              hint={giftRequest.encryptionHint}
              note={giftRequest.note}
              themeId={giftRequest.themeId}
              giftId={giftRequest.channelAddress}
              isGiftWithFnF={giftRequest.isContactGift}
              isContactAssociated={giftRequest.isAssociated}
              onPressAccept={this.onTrustedContactRequestAccepted}
              onPressReject={this.onTrustedContactRejected}
              version={giftRequest.version}
              giftLoading={this.state.giftLoading}
            />
          )

        case BottomSheetKind.APPROVAL_MODAL:
          return (
            <ErrorModalContents
              title={'Approve Request'}
              info={'You have been successfully added as a Keeper. Now Please Approve keeper by scanning QR from Primary Keeper'}
              onPressProceed={()=>{
                if( this.props.approvalContactData ){
                  this.closeBottomSheet()
                  this.props.navigation.navigate( 'ContactDetails', {
                    contact: this.props.approvalContactData,
                    contactsType: 'I am the Keeper of',
                    isFromApproval: true
                  } )
                }
              }}
              proceedButtonText={'Proceed'}
              isIgnoreButton={false}
              isBottomImage={false}
            />
          )

        default:
          break
    }
  }

  render() {
    const { netBalance, notificationData, currencyCode } = this.state

    const {
      navigation,
      exchangeRates,
      walletName,
      currentLevel,
    } = this.props
    if ( !this.props.showContent ) {
      return (
        <ModalContainer
          onBackground={()=>this.setState( {
            currentBottomSheetKind: null
          } )}
          visible={this.state.currentBottomSheetKind != null}
          closeBottomSheet={() => {}}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer>
      )
    }
    return (
      <View
        style={{
          height: heightPercentageToDP( Platform.OS == 'ios' ? '21.9%' : '20.3%' ),
          backgroundColor: Colors.blue,
          paddingTop:
                Platform.OS == 'ios' && DeviceInfo.hasNotch
                  ? heightPercentageToDP( '4%' )
                  : 0,
        }}
      >
        <LinearGradient colors={[ Colors.blue, Colors.blue ]}
          locations={[ 0.55, 1 ]}
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
            // backgroundColor:'red'
          }}>
          {this.props.clipboardAccess && <ClipboardAutoRead navigation={this.props.navigation} />}
          <HomeHeader
            onPressNotifications={this.onPressNotifications}
            navigateToQRScreen={this.navigateToQRScreen}
            notificationData={this.props.messages}
            walletName={walletName}
            getCurrencyImageByRegion={getCurrencyImageByRegion}
            netBalance={netBalance}
            exchangeRates={exchangeRates}
            CurrencyCode={currencyCode}
            navigation={navigation}
            currentLevel={currentLevel}
          />
          <ModalContainer
            onBackground={()=>{}}
            visible={this.state.currentBottomSheetKind != null}
            closeBottomSheet={() => {}}
          >
            {this.renderBottomSheetContent()}
          </ModalContainer>
        </LinearGradient>
      </View>
    )
  }
}

const styles = StyleSheet.create( {
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: widthPercentageToDP( '12%' ),
    width: widthPercentageToDP( '35%' ),
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
    marginTop: heightPercentageToDP( 0.5 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    marginRight: widthPercentageToDP( 12 ),
    letterSpacing: 0.6
  },
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.backgroundColor,
    paddingBottom: heightPercentageToDP( 4 ),
  },
  cloudErrorModalImage: {
    width: widthPercentageToDP( '27%' ),
    height: widthPercentageToDP( '27%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
  }
} )

const mapStateToProps = ( state ) => {
  return {
    levelHealth: idx( state, ( _ ) => _.bhr.levelHealth ),
    notificationList: state.notifications.notifications,
    accountsState: idx( state, ( _ ) => _.accounts ),
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    walletName:
      idx( state, ( _ ) => _.storage.wallet.walletName ) || '',
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    messages: state.notifications.messages,
    existingFCMToken: idx( state, ( _ ) => _.preferences.fcmTokenValue ),
    openApproval: idx( state, ( _ ) => _.bhr.openApproval ),
    availableKeepers: idx( state, ( _ ) => _.bhr.availableKeepers ),
    approvalContactData: idx( state, ( _ ) => _.bhr.approvalContactData ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.contacts ),
    IsCurrentLevel0: idx( state, ( _ ) => _.bhr.IsCurrentLevel0 ),
    walletId: idx( state, ( _ ) => _.storage.wallet.walletId ),
    clipboardAccess: idx( state, ( _ ) => _.misc.clipboardAccess ),
    linkingURL: state.doNotStore.linkingURL,
  }
}

export default (
  connect( mapStateToProps, {
    updateFCMTokens,
    initializeTrustedContact,
    fetchGiftFromTemporaryChannel,
    rejectGift,
    acceptExistingContactRequest,
    rejectTrustedContact,
    initializeHealthSetup,
    // clearWyreCache,
    clearRampCache,
    clearSwanCache,
    updateSwanStatus,
    fetchFeeRates,
    fetchExchangeRates,
    createTempSwanAccountInfo,
    addTransferDetails,
    notificationsUpdated,
    setCurrencyCode,
    updatePreference,
    setFCMToken,
    setSecondaryDeviceAddress,
    setCardData,
    setVersion,
    setCloudData,
    updateCloudPermission,
    credsAuthenticated,
    setShowAllAccount,
    setIsPermissionGiven,
    setupNotificationList,
    updateNotificationList,
    updateMessageStatusInApp,
    updateMessageStatus,
    getMessages,
    syncPermanentChannels,
    updateLastSeen,
    updateSecondaryShard,
    rejectedExistingContactRequest,
    notificationPressed,
    recomputeNetBalance,
    updateLinkingURL
  } )( Home )
)

