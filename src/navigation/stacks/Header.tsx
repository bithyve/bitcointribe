import React, { createRef, PureComponent } from 'react'
import {
  View,
  Platform,
  Linking,
  ImageBackground,
  AppState,
  Alert,
  StyleSheet
} from 'react-native'
import {
  heightPercentageToDP, widthPercentageToDP,
  // widthPercentageToDP,
} from 'react-native-responsive-screen'
import DeviceInfo from 'react-native-device-info'
import * as RNLocalize from 'react-native-localize'
import { connect } from 'react-redux'
import messaging from '@react-native-firebase/messaging'
import {
  initializeTrustedContact,
  rejectTrustedContact,
  InitTrustedContactFlowKind,
  PermanentChannelsSyncKind,
  syncPermanentChannels,
} from '../../store/actions/trustedContacts'
import {
  getCurrencyImageByRegion, processFriendsAndFamilyQR,
} from '../../common/CommonFunctions/index'
import NotificationListContent from '../../components/NotificationListContent'
// import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import HomeHeader from '../../components/home/home-header_update'
//import HomeHeader from '../../components/home/home-header'
import Colors from '../../common/Colors'
import idx from 'idx'
import { v4 as uuid } from 'uuid'
import moment from 'moment'
import { credsAuthenticated } from '../../store/actions/setupAndAuth'
import { NavigationActions, StackActions, withNavigationFocus } from 'react-navigation'
import TrustedContactRequestContent from '../../pages/Home/TrustedContactRequestContent'
import BottomSheet from '@gorhom/bottom-sheet'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import { AccountsState } from '../../store/reducers/accounts'
import AccountShell from '../../common/data/models/AccountShell'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { NotificationType } from '../../components/home/NotificationType'
import ModalContainer from '../../components/home/ModalContainer'
import NotificationInfoContents from '../../components/NotificationInfoContents'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Toast from '../../components/Toast'
import { resetToHomeAction } from '../actions/NavigationActions'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import AddContactAddressBook from '../../pages/Contacts/AddContactAddressBook'
import BuyBitcoinHomeBottomSheet, { BuyBitcoinBottomSheetMenuItem, BuyMenuItemKind } from '../../components/home/BuyBitcoinHomeBottomSheet'
import BottomSheetHeader from '../../pages/Accounts/BottomSheetHeader'
import BottomSheetRampInfo from '../../components/bottom-sheets/ramp/BottomSheetRampInfo'
import BottomSheetWyreInfo from '../../components/bottom-sheets/wyre/BottomSheetWyreInfo'
import BottomSheetSwanInfo from '../../components/bottom-sheets/swan/BottomSheetSwanInfo'
import ErrorModalContents from '../../components/ErrorModalContents'
import {
  initializeHealthSetup,
  updateCloudPermission,
  acceptExistingContactRequest
} from '../../store/actions/BHR'
import {
  updateFCMTokens,
  notificationsUpdated,
  setupNotificationList,
  updateNotificationList,
  updateMessageStatusInApp,
  updateMessageStatus,
  getMessages,
} from '../../store/actions/notifications'
import {
  setCurrencyCode,
  setCardData,
  setIsPermissionGiven,
} from '../../store/actions/preferences'
import {
  processDeepLink,
} from '../../common/CommonFunctions/index'
import {
  addTransferDetails,
  fetchFeeAndExchangeRates
} from '../../store/actions/accounts'
import {
  AccountType,
  DeepLinkEncryptionType,
  LevelHealthInterface,
  QRCodeTypes,
  Wallet,
} from '../../bitcoin/utilities/Interface'
import {
  updatePreference,
  setFCMToken,
  setSecondaryDeviceAddress,
} from '../../store/actions/preferences'
import { setVersion } from '../../store/actions/versionHistory'
import { clearSwanCache, updateSwanStatus, createTempSwanAccountInfo } from '../../store/actions/SwanIntegration'
import { clearRampCache } from '../../store/actions/RampIntegration'
import { clearWyreCache } from '../../store/actions/WyreIntegration'
import { setCloudData } from '../../store/actions/cloud'
import { setShowAllAccount } from '../../store/actions/accounts'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'
import {
  updateLastSeen
} from '../../store/actions/preferences'

export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800
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
  recoveryRequest: any;
  custodyRequest: any;
  isLoadContacts: boolean;
  notificationTitle: string | null;
  notificationInfo: string | null;
  notificationNote: string | null;
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
  releaseNotes: string,
}

interface HomePropsTypes {
  showContent: boolean;
  navigation: any;
  notificationList: any;
  exchangeRates?: any[];
  levelHealth: LevelHealthInterface[];
  accountsState: AccountsState;
  wallet: Wallet;
  walletName: string;
  UNDER_CUSTODY: any;
  updateFCMTokens: any;
  initializeTrustedContact: any;
  acceptExistingContactRequest: any;
  rejectTrustedContact: any;
  currentLevel: number;
  isFocused: boolean;
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
  clearWyreCache: any;
  clearRampCache: any;
  clearSwanCache: any;
  updateSwanStatus: any;
  fetchFeeAndExchangeRates: any;
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
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
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
      recoveryRequest: null,
      custodyRequest: null,
      isLoadContacts: false,
      notificationLoading: true,
      notificationTitle: null,
      notificationInfo: null,
      notificationNote: null,
      notificationAdditionalInfo: null,
      notificationProceedText: null,
      notificationIgnoreText:null,
      isIgnoreButton: false,
      currentMessage: null,

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

  navigateToQRScreen = () => {
    this.props.navigation.navigate( 'QRScanner', {
      onCodeScanned:  ( qrData )=>{
        const trustedContactRequest = processFriendsAndFamilyQR( qrData )
        if( trustedContactRequest )
          this.setState( {
            trustedContactRequest
          },
          () => {
            this.openBottomSheetOnLaunch(
              BottomSheetKind.TRUSTED_CONTACT_REQUEST,
              1
            )
          }
          )
      },
    } )
  };

  onPressNotifications = async () => {
    this.readAllNotifications()
    setTimeout( () => {
      this.setState( {
        notificationLoading: false,
      } )
    }, 500 )
    this.notificationCheck()
    this.openBottomSheetOnLaunch( BottomSheetKind.NOTIFICATIONS_LIST )
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
              ...message.additionalInfo,
              isExistingContact: true,
              isQR: true,
              type: QRCodeTypes.EXISTING_CONTACT,
              isKeeper: true,
            }
          }, () => {
            this.openBottomSheet( BottomSheetKind.TRUSTED_CONTACT_REQUEST )
          } )
          break
        case NotificationType.FNF_REQUEST:
        case NotificationType.FNF_REQUEST_ACCEPTED:
        case NotificationType.FNF_REQUEST_REJECTED:
        case NotificationType.FNF_KEEPER_REQUEST_ACCEPTED:
        case NotificationType.FNF_KEEPER_REQUEST_REJECTED:
        case NotificationType.CONTACT:
        case NotificationType.SECURE_XPUB:
        case NotificationType.APPROVE_KEEPER:
        case NotificationType.UPLOAD_SEC_SHARE:
        case NotificationType.RESHARE:
        case NotificationType.RESHARE_RESPONSE:
        case NotificationType.SM_UPLOADED_FOR_PK:
        case NotificationType.NEW_KEEPER_INFO:
          this.setState( {
            notificationTitle: message.title,
            notificationInfo: message.info,
            notificationNote: '',
            notificationAdditionalInfo: message.AdditionalInfo,
            notificationProceedText: 'Okay',
            notificationIgnoreText: '',
            isIgnoreButton: false
          }, () => {
            this.openBottomSheet( BottomSheetKind.NOTIFICATION_INFO )
          } )
          break
        case NotificationType.FNF_TRANSACTION:
          this.setState( {
            notificationTitle: message.title,
            notificationInfo: message.info,
            notificationNote: '',
            notificationAdditionalInfo: message.AdditionalInfo,
            notificationProceedText: 'Go to Account',
            notificationIgnoreText: '',
            isIgnoreButton: false
          }, () => {
            this.openBottomSheet( BottomSheetKind.NOTIFICATION_INFO )
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
              notificationAdditionalInfo: message.AdditionalInfo,
              notificationProceedText: 'Upgrade',
              notificationIgnoreText: Number( current ) <= Number( mandatoryFor ) ? '' : 'Remind me later',
              isIgnoreButton: true,
              releaseNotes: Platform.OS === 'android' ?  message.additionalInfo.notes.android : message.additionalInfo.notes.ios,
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
    try {
      // TODO: Will this function ever be called if the state wasn't different? If not,
      // I don't think we need to be holding on to `appState` in this component's state.
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
          if ( nextAppState === 'active' ) {
          //this.scheduleNotification()
          }
          if ( nextAppState === 'inactive' || nextAppState == 'background' ) {
            if( nextAppState === 'background' ) {
              this.closeBottomSheet()
            }
            console.log( 'inside if nextAppState', nextAppState )
            this.props.updatePreference( {
              key: 'hasShownNoInternetWarning',
              value: false,
            } )
            // sss files removed
            this.props.updateLastSeen( new Date() )
            // this.props.navigation.dispatch( [ NavigationActions.navigate( {
            //   routeName: 'Bottomtab',
            // } ),
            NavigationActions.navigate( {
              routeName: 'Intermediate',
            } )
          // ]
            // )
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
      // largeIcon: 'ic_launcher',
      // smallIcon:'ic_notification',
      onNotification: ( notification ) => {
        this.props.getMessages()
        const { content } = notification.data
        const notificationId = JSON.parse( content ).notificationId
        this.currentNotificationId = notificationId
        this.notificationCheck()
        // process the notification
        if ( notification.data ) {
          // this.onNotificationOpen( notification )
          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish( PushNotificationIOS.FetchResult.NoData )
        }
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: ( notification ) => {
        console.log( 'ACTION onAction:', notification.action )
        console.log( 'NOTIFICATION onAction:', notification )

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
    const { navigation, isFocused } = this.props
    // If the user is on one of Home's nested routes, and a
    // deep link is opened, we will navigate back to Home first.
    if ( !isFocused )
      navigation.dispatch(
        resetToHomeAction( {
          unhandledDeepLinkURL: url,
        } )
      )
    else this.handleDeepLinking( url )
  };

  handleDeepLinking = async ( url ) => {
    if ( url === null ) return
    const { trustedContactRequest, swanRequest } = await processDeepLink( url )
    if( trustedContactRequest ){
      this.setState( {
        trustedContactRequest
      },
      () => {
        this.openBottomSheetOnLaunch(
          BottomSheetKind.TRUSTED_CONTACT_REQUEST,
          1
        )
      }
      )
    }
    else if ( swanRequest ) {
      this.setState( {
        swanDeepLinkContent:url,
      }, () => {
        this.props.updateSwanStatus( SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS )
        this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
      } )
    }
  }
  componentDidMount = async() => {
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
    requestAnimationFrame( () => {
      // Keeping autoSync disabled
      credsAuthenticated( false )
      //console.log( 'isAuthenticated*****', this.props.isAuthenticated )
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

      Linking.addEventListener( 'url', this.handleDeepLinkEvent )
      Linking.getInitialURL().then( this.handleDeepLinking )

      // call this once deeplink is detected aswell
      this.handleDeepLinkModal()

      // set FCM token(if haven't already)
      this.storeFCMToken()

      const unhandledDeepLinkURL = navigation.getParam( 'unhandledDeepLinkURL' )

      if ( unhandledDeepLinkURL ) {
        navigation.setParams( {
          unhandledDeepLinkURL: null,
        } )
        this.handleDeepLinking( unhandledDeepLinkURL )
      }
      this.props.setVersion()
      this.props.fetchFeeAndExchangeRates( this.props.currencyCode )
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
      prevProps.accountsState.netBalance !==
      this.props.accountsState.netBalance
    )  this.setState( {
      netBalance: this.props.accountsState.netBalance,
    } )

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

  };

  handleDeepLinkModal = () => {
    const recoveryRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.recoveryRequest : null //this.props.navigation.getParam( 'recoveryRequest' )
    const trustedContactRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.trustedContactRequest : null//this.props.navigation.getParam( 'trustedContactRequest' )
    const userKey = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.userKey : null//this.props.navigation.getParam( 'userKey' )
    const swanRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.swanRequest : null//this.props.navigation.getParam( 'swanRequest' )
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

    if ( recoveryRequest || trustedContactRequest ) {
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
    } else if ( userKey ) {
      this.props.navigation.navigate( 'VoucherScanner', {
        userKey,
      } )
    }
  };

  cleanupListeners() {
    if ( typeof this.focusListener === 'function' ) {
      this.props.navigation.removeListener( 'didFocus', this.focusListener )
    }

    if ( typeof this.appStateListener === 'function' ) {
      AppState.removeEventListener( 'change', this.appStateListener )
    }

    Linking.removeEventListener( 'url', this.handleDeepLinkEvent )
    clearTimeout( this.openBottomSheetOnLaunchTimeout )
    if ( this.firebaseNotificationListener ) {
      this.firebaseNotificationListener()
    }
  }
  // handleDeepLinking = async ( url ) => {
  //   const { trustedContactRequest } = await processDeepLink( url )
  //   if( trustedContactRequest )
  //     this.setState( {
  //       trustedContactRequest
  //     },
  //     () => {
  //       this.openBottomSheetOnLaunch(
  //         BottomSheetKind.TRUSTED_CONTACT_REQUEST,
  //         1
  //       )
  //     }
  //     )
  // }

  // handleDeepLinkEvent = async ( { url } ) => {
  //   const { navigation, isFocused } = this.props
  //   // If the user is on one of Home's nested routes, and a
  //   // deep link is opened, we will navigate back to Home first.
  //   if ( !isFocused ) {
  //     navigation.dispatch(
  //       resetToHomeAction( {
  //         unhandledDeepLinkURL: url,
  //       } )
  //     )
  //   } else {
  //     this.handleDeepLinking( url )
  //   }
  // };

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

    this.focusListener = navigation.addListener( 'didFocus', () => {
      this.setCurrencyCodeFromAsync()
      this.props.fetchFeeAndExchangeRates( this.props.currencyCode )
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
        ? 'https://apps.apple.com/us/app/hexa-simple-bitcoin-wallet/id1490205837'
        : 'https://play.google.com/store/apps/details?id=io.hexawallet.hexa&hl=en'
    Linking.canOpenURL( url ).then( ( supported ) => {
      if ( supported ) {
        Linking.openURL( url )
      } else {
        // console.log("Don't know how to open URI: " + url);
      }
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
    if( value.status === 'unread' || value.type === NotificationType.FNF_TRANSACTION )
      this.handleNotificationBottomSheetSelection( value )
  };


  onTrustedContactRequestAccepted = ( key ) => {
    try {
      this.closeBottomSheet()
      const { navigation } = this.props
      const { trustedContactRequest } = this.state

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
        Toast( 'Invalid key' )
        return
      }

      if( trustedContactRequest.isExistingContact ){
        this.props.acceptExistingContactRequest( trustedContactRequest.channelKey, trustedContactRequest.contactsSecondaryChannelKey )
      } else {
        navigation.navigate( 'ContactsListForAssociateContact', {
          postAssociation: ( contact ) => {
            this.props.initializeTrustedContact( {
              contact,
              flowKind: InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT,
              channelKey: trustedContactRequest.channelKey,
              contactsSecondaryChannelKey: trustedContactRequest.contactsSecondaryChannelKey,
              isPrimaryKeeper: trustedContactRequest.isPrimaryKeeper,
            } )
            // TODO: navigate post approval (from within saga)
            navigation.navigate( 'Home' )
          }
        } )
      }
    } catch ( error ) {
      Alert.alert( 'Incompatible request, updating your app might help' )
    }
  };

  onTrustedContactRejected = () => {
    try {
      this.closeBottomSheet()
      const { trustedContactRequest } = this.state
      this.props.rejectTrustedContact( {
        channelKey: trustedContactRequest.channelKey,
      } )
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
        case BuyMenuItemKind.WYRE:
          this.props.clearWyreCache()
          this.setState( {
            wyreDeepLinkContent: null,
            wyreFromDeepLink: false,
            wyreFromBuyMenu: true
          }, () => {
            this.openBottomSheet( BottomSheetKind.WYRE_STATUS_INFO )
          } )
          break
    }
  };



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
    } else if ( item.title === 'Hexa Community (Telegram)' ) {
      const url = 'https://t.me/HexaWallet'
      Linking.openURL( url )
        .then( ( data ) => {} )
        .catch( ( e ) => {
          alert( 'Make sure Telegram installed on your device' )
        } )
      return
    }
  };


  renderBottomSheetContent() {
    const { UNDER_CUSTODY, navigation } = this.props
    const { custodyRequest, notificationTitle, notificationInfo, notificationNote, notificationAdditionalInfo, notificationProceedText, notificationIgnoreText, isIgnoreButton, notificationLoading, notificationData, releaseNotes } = this.state
    // console.log( 'this.state.currentBottomSheetKind', this.state.currentBottomSheetKind )
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
        case BottomSheetKind.WYRE_STATUS_INFO:
          return (
            <>
              <BottomSheetHeader title="" onPress={this.closeBottomSheet} />
              <BottomSheetWyreInfo
                wyreDeepLinkContent={this.state.wyreDeepLinkContent}
                wyreFromBuyMenu={this.state.wyreFromBuyMenu}
                wyreFromDeepLink={this.state.wyreFromDeepLink}
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
              title={'Automated Cloud\nBackup Error'}
              info={'We could not backup your wallet\non the cloud. This may be due to:'}
              errPoints={[ 'A network issue', 'Inadequate space in your cloud storage', 'A bug on our part' ]}
              note={'Please try again in some time.\nIn case the error persists,\nplease reach out to us on:'}
              links={[ {
                link: 'hello@bithyve.com',
                icon: require( '../../assets/images/socialicon/twitter.png' )
              }, {
                link: '@HexaWallet',
                icon: require( '../../assets/images/socialicon/twitter.png' )
              }, {
                link: 'https://t.me/HexaWallet',
                icon: require( '../../assets/images/socialicon/twitter.png' )
              }
              ]}
              onPressProceed={()=>{
                if( this.props.levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup' ){
                  this.props.setCloudData()
                }
                this.closeBottomSheet()
              }}
              onPressIgnore={()=> {
                this.props.updateCloudPermission( false )
                this.closeBottomSheet()
              }}
              closeModal={() => this.closeBottomSheet()}
              proceedButtonText={'Try Again'}
              cancelButtonText={'Skip'}
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
          visible={this.state.currentBottomSheetKind != null}
          closeBottomSheet={() => {}}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer>
      )
    }
    return (
      // <ImageBackground
      //   source={require( '../../assets/images/home-bg.png' )}
      //   style={{
      //     width: '100%',
      //     height: '100%',
      //     flex: 1,
      //   }}
      //   imageStyle={{
      //     resizeMode: 'stretch',
      //   }}
      // >
      <View
        style={{
          height: heightPercentageToDP( '21.33%' ),
          backgroundColor: Colors.blue,
          paddingTop:
                Platform.OS == 'ios' && DeviceInfo.hasNotch
                  ? heightPercentageToDP( '4%' )
                  : 0,
        }}
      >
        <ImageBackground
          source={require( '../../assets/images/home-bg.png' )}
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
          }}
          imageStyle={{
            resizeMode: 'stretch',
          }}
        >
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
          //  onSwitchToggle={this.onSwitchToggle}
          // setCurrencyToggleValue={this.setCurrencyToggleValue}
          // navigation={this.props.navigation}
          // overallHealth={overallHealth}
          />
          <ModalContainer
            visible={this.state.currentBottomSheetKind != null}
            closeBottomSheet={() => {}}
          >
            {this.renderBottomSheetContent()}
          </ModalContainer>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create( {
  cloudErrorModalImage: {
    width: widthPercentageToDP( '30%' ),
    height: widthPercentageToDP( '25%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
  }
} )

const mapStateToProps = ( state ) => {
  return {
    levelHealth: idx( state, ( _ ) => _.bhr.levelHealth ),
    notificationList: state.notifications.notifications,
    accountsState: state.accounts,
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    walletName:
      idx( state, ( _ ) => _.storage.wallet.walletName ) || '',
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    messages: state.notifications.messages,
    existingFCMToken: idx( state, ( _ ) => _.preferences.fcmTokenValue ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    updateFCMTokens,
    initializeTrustedContact,
    acceptExistingContactRequest,
    rejectTrustedContact,
    initializeHealthSetup,
    clearWyreCache,
    clearRampCache,
    clearSwanCache,
    updateSwanStatus,
    fetchFeeAndExchangeRates,
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
    updateLastSeen
  } )( Home )
)

