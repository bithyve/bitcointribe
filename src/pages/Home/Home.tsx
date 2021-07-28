import React, { createRef, PureComponent } from 'react'
import {
  StyleSheet,
  StatusBar,
  ImageBackground,
  Platform,
  Linking,
  Alert,
  AppState,
} from 'react-native'
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import DeviceInfo from 'react-native-device-info'
import CustodianRequestRejectedModalContents from '../../components/CustodianRequestRejectedModalContents'
import * as RNLocalize from 'react-native-localize'
import Colors from '../../common/Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import {
  downloadMShare,
} from '../../store/actions/sss'
import {
  initializeHealthSetup,
  updateCloudPermission,
  acceptExistingContactRequest
} from '../../store/actions/health'
import { connect } from 'react-redux'
import {
  initializeTrustedContact,
  rejectTrustedContact,
  syncPermanentChannels,
  PermanentChannelsSyncKind,
  InitTrustedContactFlowKind
} from '../../store/actions/trustedContacts'
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
  updateLastSeen
} from '../../store/actions/preferences'
import {
  processDeepLink,
} from '../../common/CommonFunctions/index'
import ErrorModalContents from '../../components/ErrorModalContents'
import Toast from '../../components/Toast'
import PushNotification from 'react-native-push-notification'
import NotificationListContent from '../../components/NotificationListContent'
import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import { v4 as uuid } from 'uuid'
import {
  BottomTab,
} from '../../components/home/custom-bottom-tabs'
import {
  addTransferDetails,
  autoSyncShells,
  fetchFeeAndExchangeRates
} from '../../store/actions/accounts'
import {
  AccountType,
  DeepLinkEncryptionType,
  LevelHealthInterface,
  Wallet,
} from '../../bitcoin/utilities/Interface'
import moment from 'moment'
import { NavigationActions, StackActions, withNavigationFocus } from 'react-navigation'
import CustodianRequestModalContents from '../../components/CustodianRequestModalContents'
import {
  updatePreference,
  setFCMToken,
  setSecondaryDeviceAddress,
} from '../../store/actions/preferences'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import TrustedContactRequestContent from './TrustedContactRequestContent'
import BottomSheetHeader from '../Accounts/BottomSheetHeader'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'
import BottomSheet from '@gorhom/bottom-sheet'
import { resetToHomeAction } from '../../navigation/actions/NavigationActions'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import { AccountsState } from '../../store/reducers/accounts'
import AccountShell from '../../common/data/models/AccountShell'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import messaging from '@react-native-firebase/messaging'
import BuyBitcoinHomeBottomSheet, { BuyBitcoinBottomSheetMenuItem, BuyMenuItemKind } from '../../components/home/BuyBitcoinHomeBottomSheet'
import BottomSheetWyreInfo from '../../components/bottom-sheets/wyre/BottomSheetWyreInfo'
import BottomSheetRampInfo from '../../components/bottom-sheets/ramp/BottomSheetRampInfo'
import BottomSheetSwanInfo from '../../components/bottom-sheets/swan/BottomSheetSwanInfo'
import { setVersion } from '../../store/actions/versionHistory'
import { clearSwanCache, updateSwanStatus, createTempSwanAccountInfo } from '../../store/actions/SwanIntegration'
import { clearRampCache } from '../../store/actions/RampIntegration'
import { clearWyreCache } from '../../store/actions/WyreIntegration'
import { setCloudData } from '../../store/actions/cloud'
import { credsAuthenticated } from '../../store/actions/setupAndAuth'
import { setShowAllAccount } from '../../store/actions/accounts'
import HomeContainer from './HomeContainer'
import Header from '../../navigation/stacks/Header'
import { NotificationType } from '../../components/home/NotificationType'
import NotificationInfoContents from '../../components/NotificationInfoContents'
import ModalContainer from '../../components/home/ModalContainer'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'

export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800
export enum BottomSheetState {
  Closed,
  Open,
}
export enum BottomSheetKind {
  TAB_BAR_BUY_MENU,
  CUSTODIAN_REQUEST,
  CUSTODIAN_REQUEST_REJECTED,
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
  selectedBottomTab: BottomTab | null;

  bottomSheetState: BottomSheetState;
  currentBottomSheetKind: BottomSheetKind | null;

  secondaryDeviceOtp: any;
  currencyCode: string;
  errorMessageHeader: string;
  errorMessage: string;
  selectedContact: any[];
  notificationDataChange: boolean;
  appState: string;
  trustedContactRequest: any;
  recoveryRequest: any;
  custodyRequest: any;
  isLoadContacts: boolean;
  lastActiveTime: string;
  swanDeepLinkContent: string | null;
  isBalanceLoading: boolean;
  addContactModalOpened: boolean;
  encryptedCloudDataJson: any;
  wyreDeepLinkContent: string | null;
  rampDeepLinkContent: string | null;
  rampFromBuyMenu: boolean | null;
  rampFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreFromDeepLink: boolean | null;
  notificationTitle: string | null;
  notificationInfo: string | null;
  notificationNote: string | null;
  notificationAdditionalInfo: any;
  notificationProceedText: string | null;
  notificationIgnoreText: string | null;
  isIgnoreButton: boolean;
  currentMessage: any;
  releaseNotes: string,
}

interface HomePropsTypes {
  navigation: any;
  notificationList: any;
  exchangeRates?: any[];
  initializeTrustedContact: any;
  accountsState: AccountsState;
  cloudPermissionGranted: any;

  wallet: Wallet;
  UNDER_CUSTODY: any;
  updateFCMTokens: any;
  downloadMShare: any;
  acceptExistingContactRequest: any;
  rejectTrustedContact: any;
  initializeHealthSetup: any;
  overallHealth: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  autoSyncShells: any;
  clearWyreCache: any;
  clearRampCache: any;
  clearSwanCache: any;
  updateSwanStatus: any;
  fetchFeeAndExchangeRates: any;
  createTempSwanAccountInfo: any;
  addTransferDetails: any;
  trustedContacts: TrustedContactsService;
  isFocused: boolean;
  notificationListNew: any;
  notificationsUpdated: any;
  setCurrencyCode: any;
  currencyCode: any;
  updatePreference: any;
  existingFCMToken: any;
  setFCMToken: any;
  setSecondaryDeviceAddress: any;
  secondaryDeviceAddressValue: any;
  releaseCasesValue: any;
  swanDeepLinkContent: string | null;
  regularAccount: RegularAccount;
  database: any;
  setCardData: any;
  cardDataProps: any;
  secureAccount: any;
  accountShells: AccountShell[];
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
  updateLastSeen: any;
  isAuthenticated: any;
  setupNotificationList: any;
  asyncNotificationList: any;
  updateNotificationList: any;
  fetchStarted: any;
  messages: any;
  updateMessageStatusInApp: any;
  updateMessageStatus: any;
  initLoader: boolean;
  getMessages: any;
  syncPermanentChannels: any;
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
    this.props.setShowAllAccount( false )
    this.focusListener = null
    this.appStateListener = null
    this.openBottomSheetOnLaunchTimeout = null
    this.syncPermanantChannelTime = null
    this.state = {
      notificationData: [],
      CurrencyCode: 'USD',
      netBalance: 0,
      selectedBottomTab: null,
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
      secondaryDeviceOtp: {
      },
      currencyCode: 'USD',
      errorMessageHeader: '',
      errorMessage: '',
      selectedContact: [],
      notificationDataChange: false,
      appState: '',
      trustedContactRequest: null,
      recoveryRequest: null,
      custodyRequest: null,
      isLoadContacts: false,
      lastActiveTime: moment().toISOString(),
      notificationLoading: true,
      swanDeepLinkContent: null,
      isBalanceLoading: true,
      addContactModalOpened: false,
      encryptedCloudDataJson: [],
      wyreDeepLinkContent: null,
      rampDeepLinkContent: null,
      rampFromBuyMenu: null,
      rampFromDeepLink: null,
      wyreFromBuyMenu: null,
      wyreFromDeepLink: null,
      notificationTitle: null,
      notificationInfo: null,
      notificationNote: null,
      notificationAdditionalInfo: null,
      notificationProceedText: null,
      notificationIgnoreText:null,
      isIgnoreButton: false,
      currentMessage: null,
      releaseNotes: '',
    }
    this.currentNotificationId= ''
  }

  navigateToAddNewAccountScreen = () => {
    this.props.navigation.navigate( 'AddNewAccount' )
  };

  onPressNotifications = async () => {
    setTimeout( () => {
      this.setState( {
        notificationLoading: false,
      } )
    }, 500 )

    this.openBottomSheetOnLaunch( BottomSheetKind.NOTIFICATIONS_LIST )
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
          this.onNotificationOpen( notification )
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

  onNotificationOpen = async ( item ) => {
    console.log( 'item', item )
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
            console.log( 'inside if nextAppState', nextAppState )
            this.props.updatePreference( {
              key: 'hasShownNoInternetWarning',
              value: false,
            } )
            this.props.updateLastSeen( new Date() )
            this.props.navigation.dispatch( StackActions.reset( {
              index: 0,
              actions: [ NavigationActions.navigate( {
                routeName: 'Intermediate'
              } ) ],
            } ) )
          }
        }
      )
    } catch ( error ) {
      // do nothing
    }
  };

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
      // This will sync balances and transactions for all account shells
      // this.props.autoSyncShells()
      // Keeping autoSync disabled
      credsAuthenticated( false )
      //console.log( 'isAuthenticated*****', this.props.isAuthenticated )
      this.syncChannel()
      this.closeBottomSheet()
      if( this.props.cloudBackupStatus == CloudBackupStatus.FAILED && this.props.levelHealth.length >= 1 && this.props.cloudPermissionGranted === true ) {
        this.openBottomSheet( BottomSheetKind.CLOUD_ERROR )
      }
      // this.calculateNetBalance()

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
        const message = messages.find( message => message.status === 'unread' )
        if( message ){
          this.handleNotificationBottomSheetSelection( message )
        }
      }
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
        case NotificationType.FNF_REQUEST:
        case NotificationType.FNF_REQUEST_ACCEPTED:
        case NotificationType.FNF_REQUEST_REJECTED:
        case NotificationType.FNF_KEEPER_REQUEST:
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


  componentDidUpdate = ( prevProps, prevState ) => {
    // if (
    //   prevProps.accountsState.accountShells !==
    //   this.props.accountsState.accountShells
    // ) {
    //   this.calculateNetBalance()
    //   // this.getNewTransactionNotifications()
    // }

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
    const custodyRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.custodyRequest : null//this.props.navigation.getParam( 'custodyRequest' )
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

    if ( custodyRequest ) {
      this.setState(
        {
          custodyRequest,
        },
        () => {
          this.openBottomSheetOnLaunch( BottomSheetKind.CUSTODIAN_REQUEST )
        }
      )
    } else if ( recoveryRequest || trustedContactRequest ) {
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

  handleAccountCardSelection = ( selectedAccount: AccountShell ) => {
    this.props.navigation.navigate( 'AccountDetails', {
      accountShellID: selectedAccount.id,
    } )
  };

  handleBottomSheetPositionChange = ( newIndex: number ) => {
    if ( newIndex === 0 ) {
      this.onBottomSheetClosed()
    }
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

  onTrustedContactRequestAccepted = ( key ) => {
    this.closeBottomSheet()
    const { navigation } = this.props
    const { trustedContactRequest } = this.state
    if( !trustedContactRequest.isQR ){
      let channelKeys: string[]
      try{
        switch( trustedContactRequest.encryptionType ){
            case DeepLinkEncryptionType.DEFAULT:
              channelKeys = trustedContactRequest.encryptedChannelKeys.split( '-' )
              break

            case DeepLinkEncryptionType.NUMBER:
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
          } )
          // TODO: navigate post approval (from within saga)
          navigation.navigate( 'Home' )
        }
      } )
    }
  };

  onTrustedContactRejected = () => {
    this.closeBottomSheet()
    const { trustedContactRequest } = this.state
    this.props.rejectTrustedContact( {
      channelKey: trustedContactRequest.channelKey,
    } )
  };

  onPhoneNumberChange = () => {};

  onBottomSheetClosed() {
    this.setState( {
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
    } )
  }

  closeBottomSheet = () => {
    this.bottomSheetRef.current?.close()
    this.onBottomSheetClosed()
  };

  onBackPress = () => {
    this.openBottomSheet( BottomSheetKind.TAB_BAR_BUY_MENU )
  };

  onNotificationClicked = async ( value ) => {
    if( value.status === 'unread' || value.type === NotificationType.FNF_TRANSACTION )
      this.handleNotificationBottomSheetSelection( value )
  };

  onPressElement = ( item ) => {
    const { navigation } = this.props
    if ( item.title == 'Backup Health' ) {
      navigation.navigate( 'ManageBackupNewBHR' )
      return
    }
    if ( item.title == 'Friends and Family' ) {
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

  getBottomSheetSnapPoints(): any[] {
    switch ( this.state.currentBottomSheetKind ) {
        case BottomSheetKind.SWAN_STATUS_INFO:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 70 : 65,
            ),
            heightPercentageToDP( 71 ),
          ]
        case BottomSheetKind.WYRE_STATUS_INFO:
          return ( this.state.wyreFromDeepLink )
            ? [ 0, '67%' ]
            : Platform.OS == 'ios' ? [ 0, '67%' ] : [ 0, '65%' ]
        case BottomSheetKind.RAMP_STATUS_INFO:
          return ( this.state.rampFromDeepLink )
            ? [ 0, '67%' ]
            : Platform.OS == 'ios' ? [ 0, '67%' ] : [ 0, '65%' ]
        case BottomSheetKind.TAB_BAR_BUY_MENU:
          return Platform.OS == 'ios' ? [ 0, '65%' ] : [ 0, '70%' ]
        case BottomSheetKind.CUSTODIAN_REQUEST:
        case BottomSheetKind.CUSTODIAN_REQUEST_REJECTED:
          return defaultBottomSheetConfigs.snapPoints

        case BottomSheetKind.TRUSTED_CONTACT_REQUEST:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 70 : 65,
            ),
            heightPercentageToDP( 95 ),
          ]

        case BottomSheetKind.ERROR:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 40 : 50,
            ),
          ]

        case BottomSheetKind.CLOUD_ERROR:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 45 : 50,
            ),
          ]

        case BottomSheetKind.ADD_CONTACT_FROM_ADDRESS_BOOK:
        case BottomSheetKind.NOTIFICATIONS_LIST:
          return [ -50, heightPercentageToDP( 82 ) ]
        case BottomSheetKind.NOTIFICATION_INFO:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 75 : 80,
            ),
          ]
        default:
          return defaultBottomSheetConfigs.snapPoints
    }
  }

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

  renderBottomSheetContent() {
    const { UNDER_CUSTODY, navigation } = this.props
    const { custodyRequest, notificationTitle, notificationInfo, notificationNote, notificationAdditionalInfo, notificationProceedText, notificationIgnoreText, isIgnoreButton, notificationLoading, notificationData, releaseNotes } = this.state
    // console.log( 'this.state.currentBottomSheetKind', this.state.currentBottomSheetKind )
    switch ( this.state.currentBottomSheetKind ) {
        case BottomSheetKind.TAB_BAR_BUY_MENU:
          return (
            <>
              <BottomSheetHeader title="Buy bitcoin" onPress={this.closeBottomSheet} />

              <BuyBitcoinHomeBottomSheet
                onMenuItemSelected={this.handleBuyBitcoinBottomSheetSelection}
                // onPress={this.closeBottomSheet}
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

        case BottomSheetKind.CUSTODIAN_REQUEST:
          return (
            <>
              <CustodianRequestModalContents
                userName={custodyRequest.requester}
                onPressAcceptSecret={() => {
                  this.closeBottomSheet()

                  if ( Date.now() - custodyRequest.uploadedAt > 600000 ) {
                    Alert.alert(
                      'Request expired!',
                      'Please ask the sender to initiate a new request',
                    )
                  } else {
                    if ( UNDER_CUSTODY[ custodyRequest.requester ] ) {
                      Alert.alert(
                        'Failed to store',
                        'You cannot custody multiple shares of the same user.',
                      )
                    } else {
                      if ( custodyRequest.isQR ) {
                        downloadMShare( custodyRequest.ek, custodyRequest.otp )
                      } else {
                        navigation.navigate( 'CustodianRequestOTP', {
                          custodyRequest,
                        } )
                      }
                    }
                  }
                }}
                onPressRejectSecret={() => {
                  this.closeBottomSheet()
                  this.openBottomSheet( BottomSheetKind.CUSTODIAN_REQUEST_REJECTED )
                }}
              />

              <BuyBitcoinHomeBottomSheet
                onMenuItemSelected={this.handleBuyBitcoinBottomSheetSelection}
              />
            </>
          )
        case BottomSheetKind.CUSTODIAN_REQUEST_REJECTED:
          return (
            <CustodianRequestRejectedModalContents
              onPressViewTrustedContacts={this.closeBottomSheet}
              userName={custodyRequest.requester}
            />
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
                    subHeaderText:'Send a Friends and Family request',
                    contactText:'Adding to Friends and Family:',
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
                  subHeaderText:'Send a Friends and Family request',
                  contactText:'Adding to Friends and Family:',
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
              title={'Automated Cloud Backup Error'}
              info={'We could not backup your wallet on the cloud. This may be due to: \n1) A network issue\n2) Inadequate space in your cloud storage\n3) A bug on our part'}
              note={'Please try again in some time. In case the error persists, please reach out to us on: \nTwitter: @HexaWallet\nTelegram: https://t.me/HexaWallet\nEmail: hello@bithyve.com'}
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
    return (
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
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <ModalContainer
          visible={this.state.currentBottomSheetKind !== null}
          closeBottomSheet={() => {}}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer>
        <Header fromScreen={'Home'} />
        {/* <View
          style={{
            flex: 3.8,
            paddingTop:
              Platform.OS == 'ios' && DeviceInfo.hasNotch
                ? heightPercentageToDP( '5%' )
                : 0,
          }}
        >
          <HomeHeader
            onPressNotifications={this.onPressNotifications}
            notificationData={notificationData}
            walletName={wallet.walletName}
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
        </View> */}
        <HomeContainer containerView={styles.accountCardsSectionContainer} openBottomSheet={this.openBottomSheet} swanDeepLinkContent={this.state.swanDeepLinkContent} />

      </ImageBackground>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    notificationList: state.notifications.notifications,
    accountsState: state.accounts,
    cloudPermissionGranted: state.health.cloudPermissionGranted,
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    wallet: idx( state, ( _ ) => _.storage.wallet ),
    UNDER_CUSTODY: idx(
      state,
      ( _ ) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY
    ),
    cardDataProps: idx( state, ( _ ) => _.preferences.cardData ),
    secureAccount: idx( state, ( _ ) => _.accounts[ SECURE_ACCOUNT ].service ),
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    notificationListNew: idx( state, ( _ ) => _.notifications.notificationListNew ),
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    existingFCMToken: idx( state, ( _ ) => _.preferences.existingFCMToken ),
    secondaryDeviceAddressValue: idx(
      state,
      ( _ ) => _.preferences.secondaryDeviceAddressValue
    ),
    releaseCasesValue: idx( state, ( _ ) => _.preferences.releaseCasesValue ),
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    levelHealth: idx( state, ( _ ) => _.health.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    keeperInfo: idx( state, ( _ ) => _.health.keeperInfo ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    newBHRFlowStarted: idx( state, ( _ ) => _.health.newBHRFlowStarted ),
    cloudBackupStatus: idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    isPermissionSet: idx( state, ( _ ) => _.preferences.isPermissionSet ),
    isAuthenticated: idx( state, ( _ ) => _.setupAndAuth.isAuthenticated, ),
    asyncNotificationList: idx( state, ( _ ) => _.notifications.updatedNotificationList ),
    fetchStarted: idx( state, ( _ ) => _.notifications.fetchStarted ),
    messages: state.notifications.messages,
    initLoader: idx( state, ( _ ) => _.health.loading.initLoader ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    updateFCMTokens,
    initializeTrustedContact,
    downloadMShare,
    acceptExistingContactRequest,
    rejectTrustedContact,
    initializeHealthSetup,
    autoSyncShells,
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
    updateLastSeen,
    setupNotificationList,
    updateNotificationList,
    updateMessageStatusInApp,
    updateMessageStatus,
    getMessages,
    syncPermanentChannels,
  } )( Home )
)

const styles = StyleSheet.create( {
  cardContainer: {
    backgroundColor: Colors.white,
    width: widthPercentageToDP( '95%' ),
    // height: heightPercentageToDP( '7%' ),
    // borderColor: Colors.borderColor,
    // borderWidth: 1,
    borderRadius: widthPercentageToDP( 3 ),
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthPercentageToDP( 5 ),
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: widthPercentageToDP ( 2 )
  },
  accountCardsSectionContainer: {
    height: hp( '70.83%' ),
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor1,
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
    flexDirection: 'column',
    justifyContent: 'space-around'
  },

  floatingActionButtonContainer: {
    // position: 'absolute',
    // zIndex: 0,
    // bottom: TAB_BAR_HEIGHT,
    // right: 0,
    // flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: heightPercentageToDP( 1.5 ),
  },

  cloudErrorModalImage: {
    width: wp( '30%' ),
    height: wp( '25%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginBottom: hp( '-3%' ),
  }
} )
