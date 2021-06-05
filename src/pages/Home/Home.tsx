import React, { createRef, PureComponent } from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Platform,
  Linking,
  Alert,
  Image,
  AppState,
  InteractionManager,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Easing } from 'react-native-reanimated'
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import DeviceInfo from 'react-native-device-info'
import CustodianRequestRejectedModalContents from '../../components/CustodianRequestRejectedModalContents'
import * as RNLocalize from 'react-native-localize'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import Colors from '../../common/Colors'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  FAST_BITCOINS,
} from '../../common/constants/wallet-service-types'
import {
  downloadMShare,
  uploadRequestedShare,
  // initHealthCheck,
} from '../../store/actions/sss'
import {
  initializeHealthSetup,
  onApprovalStatusChange,
  autoDownloadShareContact,
  uploadSecondaryShareForPK,
  downloadSMShard,
  updateKeeperInfoToUnderCustody,
  updateCloudPermission,
} from '../../store/actions/health'
import { createRandomString } from '../../common/CommonFunctions/timeFormatter'
import { connect } from 'react-redux'
import {
  initializeTrustedContact,
  rejectTrustedContact,
  InitTrustedContactFlowKind,
} from '../../store/actions/trustedContacts'
import {
  updateFCMTokens,
  notificationsUpdated,
  setupNotificationList,
  updateNotificationList,
  updateMessageStatusInApp,
  updateMessageStatus
} from '../../store/actions/notifications'
import {
  setCurrencyCode,
  setCardData,
  setIsPermissionGiven,
  updateLastSeen
} from '../../store/actions/preferences'
import {
  getCurrencyImageByRegion,
  getKeeperInfoFromShareId,
} from '../../common/CommonFunctions/index'
import ErrorModalContents from '../../components/ErrorModalContents'
import Toast from '../../components/Toast'
import PushNotification from 'react-native-push-notification'
import NotificationListContent from '../../components/NotificationListContent'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import RelayServices from '../../bitcoin/services/RelayService'
import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import config from '../../bitcoin/HexaConfig'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import HomeHeader from '../../components/home/home-header_update'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import CustomBottomTabs, {
  BottomTab,
  TAB_BAR_HEIGHT,
} from '../../components/home/custom-bottom-tabs'
import {
  addTransferDetails,
  autoSyncShells,
  addNewAccountShell,
  fetchFeeAndExchangeRates
} from '../../store/actions/accounts'
import {
  LevelHealthInterface,
  MetaShare,
  QRCodeTypes,
} from '../../bitcoin/utilities/Interface'
import { ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import moment from 'moment'
import { NavigationActions, StackActions, withNavigationFocus } from 'react-navigation'
import CustodianRequestModalContents from '../../components/CustodianRequestModalContents'
import {
  updatePreference,
  setFCMToken,
  setSecondaryDeviceAddress,
  setWalletId
} from '../../store/actions/preferences'
import { fetchKeeperTrustedChannel } from '../../store/actions/keeper'
import S3Service from '../../bitcoin/services/sss/S3Service'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'
import TrustedContactRequestContent from './TrustedContactRequestContent'
import BottomSheetBackground from '../../components/bottom-sheets/BottomSheetBackground'
import BottomSheetHeader from '../Accounts/BottomSheetHeader'
import { Button } from 'react-native-elements'
import checkAppVersionCompatibility from '../../utils/CheckAppVersionCompatibility'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'
import BottomSheet from '@gorhom/bottom-sheet'
import { resetToHomeAction } from '../../navigation/actions/NavigationActions'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { getEnvReleaseTopic } from '../../utils/geEnvSpecificParams'
import { AccountsState } from '../../store/reducers/accounts'
import HomeAccountCardsList from './HomeAccountCardsList'
import AccountShell from '../../common/data/models/AccountShell'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import messaging from '@react-native-firebase/messaging'
import firebase from '@react-native-firebase/app'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
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
import NotificationInfoContents from '../../components/NotificationInfoContents'
import { NotificationType } from '../../components/home/NotificationType'

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
}

interface HomePropsTypes {
  navigation: any;
  notificationList: any;
  exchangeRates?: any[];

  accountsState: AccountsState;
  cloudPermissionGranted: any;

  currentWyreSubAccount: ExternalServiceSubAccountInfo | null;
  currentRampSubAccount: ExternalServiceSubAccountInfo | null;
  currentSwanSubAccount: ExternalServiceSubAccountInfo | null;
  walletName: string;
  UNDER_CUSTODY: any;
  updateFCMTokens: any;
  downloadMShare: any;
  initializeTrustedContact: any;
  rejectTrustedContact: any;
  uploadRequestedShare: any;
  uploadSecondaryShareForPK: any;
  s3Service: S3Service;
  initializeHealthSetup: any;
  // initHealthCheck: any;
  overallHealth: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  autoSyncShells: any;
  clearWyreCache: any;
  clearRampCache: any;
  clearSwanCache: any;
  updateSwanStatus: any;
  addNewAccountShell: any;
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
  fcmTokenValue: any;
  setFCMToken: any;
  setSecondaryDeviceAddress: any;
  secondaryDeviceAddressValue: any;
  releaseCasesValue: any;
  swanDeepLinkContent: string | null;
  regularAccount: RegularAccount;
  database: any;
  setCardData: any;
  cardDataProps: any;
  fetchKeeperTrustedChannel: any;
  keeperApproveStatus: any;
  onApprovalStatusChange: any;
  secureAccount: any;
  autoDownloadShareContact: any;
  accountShells: AccountShell[];
  setVersion: any;
  wyreDeepLinkContent: string | null;
  rampDeepLinkContent: string | null;
  downloadSMShard: any;
  rampFromBuyMenu: boolean | null;
  rampFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreFromDeepLink: boolean | null;
  setCloudData: any;
  updateKeeperInfoToUnderCustody: any;
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
  setWalletId: any;
  updateMessageStatusInApp: any;
  updateMessageStatus: any;
}

const releaseNotificationTopic = getEnvReleaseTopic()

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;

  bottomSheetRef = createRef<BottomSheet>();
  openBottomSheetOnLaunchTimeout: null | ReturnType<typeof setTimeout>;

  static whyDidYouRender = true;

  constructor( props ) {
    super( props )
    this.props.setShowAllAccount( false )
    this.focusListener = null
    this.appStateListener = null
    this.openBottomSheetOnLaunchTimeout = null

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
    }
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

  processQRData = async ( qrData ) => {
    const { accountsState, addTransferDetails, navigation } = this.props

    const network = Bitcoin.networkType( qrData )
    if ( network ) {
      const serviceType =
        network === 'MAINNET' ? REGULAR_ACCOUNT : TEST_ACCOUNT // default service type

      const service = accountsState[ serviceType ].service
      const { type } = service.addressDiff( qrData )

      if ( type ) {
        let item

        switch ( type ) {
            case ScannedAddressKind.ADDRESS:
              const recipientAddress = qrData

              item = {
                id: recipientAddress
              }

              addTransferDetails( serviceType, {
                selectedContact: item,
              } )

              navigation.navigate( 'SendToContact', {
                selectedContact: item,
                serviceType,
              } )
              break

            case ScannedAddressKind.PAYMENT_URI:
              let address, options

              try {
                const res = service.decodePaymentURI( qrData )
                address = res.address
                options = res.options

              } catch ( err ) {
                Alert.alert( 'Unable to decode payment URI' )
                return
              }

              item = {
                id: address
              }

              addTransferDetails( serviceType, {
                selectedContact: item,
              } )

              navigation.navigate( 'SendToContact', {
                selectedContact: item,
                serviceType,
                bitcoinAmount: options.amount
                  ? `${Math.round( options.amount * SATOSHIS_IN_BTC )}`
                  : '',
              } )
              break
        }
      } else {
        Toast( 'Invalid QR' )
      }
    }

    try {
      const scannedData = JSON.parse( qrData )

      // check version compatibility
      if ( scannedData.version ) {
        const isAppVersionCompatible = await checkAppVersionCompatibility( {
          relayCheckMethod: scannedData.type,
          version: scannedData.ver,
        } )

        if ( !isAppVersionCompatible ) {
          return
        }
      }

      switch ( scannedData.type ) {
          case QRCodeTypes.CONTACT_REQUEST:
          case QRCodeTypes.KEEPER_REQUEST:
            const trustedContactRequest = {
              walletName: scannedData.walletName,
              channelKey: scannedData.channelKey,
              contactsSecondaryChannelKey: scannedData.secondaryChannelKey,
              isKeeper: scannedData.type === QRCodeTypes.KEEPER_REQUEST,
              isQR: true,
              version: scannedData.version,
              type: scannedData.type
            }
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
            break

          case 'trustedGuardian':
            const trustedGuardianRequest = {
              isGuardian: scannedData.isGuardian,
              approvedTC: scannedData.approvedTC,
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              uploadedAt: scannedData.uploadedAt,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
              isFromKeeper: scannedData.isFromKeeper
                ? scannedData.isFromKeeper
                : false,
            }
            this.setState(
              {
                secondaryDeviceOtp: trustedGuardianRequest,
                trustedContactRequest: trustedGuardianRequest,
                recoveryRequest: null,
                isLoadContacts: true,
              },
              () => {
                navigation.goBack()

                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'secondaryDeviceGuardian':
            console.log( 'scannedData', scannedData )
            const secondaryDeviceGuardianRequest = {
              isGuardian: scannedData.isGuardian,
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              uploadedAt: scannedData.uploadedAt,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
              isFromKeeper: true,
            }

            this.setState(
              {
                secondaryDeviceOtp: secondaryDeviceGuardianRequest,
                trustedContactRequest: secondaryDeviceGuardianRequest,
                recoveryRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'trustedContactQR':
            const tcRequest = {
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
            }

            this.setState(
              {
                secondaryDeviceOtp: tcRequest,
                trustedContactRequest: tcRequest,
                recoveryRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'paymentTrustedContactQR':
            const paymentTCRequest = {
              isPaymentRequest: true,
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
            }

            this.setState(
              {
                secondaryDeviceOtp: paymentTCRequest,
                trustedContactRequest: paymentTCRequest,
                recoveryRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'recoveryQR':
            const recoveryRequest = {
              isRecovery: true,
              requester: scannedData.requester,
              publicKey: scannedData.KEY,
              isQR: true,
            }
            this.setState(
              {
                recoveryRequest: recoveryRequest,
                trustedContactRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )
            break

          case 'ReverseRecoveryQR':
            Alert.alert(
              'Restoration QR Identified',
              'Restoration QR only works during restoration mode'
            )
            break

          default:
            break
      }
    } catch ( err ) {
      console.log( err )
      Toast( 'Invalid QR' )
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
        console.log( 'NOTIFICATION:', notification )
        // process the notification
        if ( notification.data ) {
          this.onNotificationOpen( notification )
          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish( PushNotificationIOS.FetchResult.NoData )
        }
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: ( notification ) => {
        console.log( 'ACTION:', notification.action )
        console.log( 'NOTIFICATION:', notification )

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
                routeName: 'Launch'
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
      s3Service,
      initializeHealthSetup,
      newBHRFlowStarted,
      credsAuthenticated,
      regularAccount,
      setWalletId
    } = this.props
    const { data } = await regularAccount.getWalletId()
    console.log( '**** data.walletId', data.walletId )
    this.appStateListener = AppState.addEventListener(
      'change',
      this.onAppStateChange
    )
    InteractionManager.runAfterInteractions( () => {
      // This will sync balances and transactions for all account shells
      // this.props.autoSyncShells()
      // Keeping autoSynn disabled
      setWalletId( data.walletId )
      credsAuthenticated( false )
      console.log( 'isAuthenticated*****', this.props.isAuthenticated )

      this.closeBottomSheet()
      if( this.props.cloudBackupStatus == CloudBackupStatus.FAILED && this.props.levelHealth.length >= 1 && this.props.cloudPermissionGranted === true ) {
        this.openBottomSheet( BottomSheetKind.CLOUD_ERROR )
      }
      this.calculateNetBalance()

      if( newBHRFlowStarted === true )
      {
        const { healthCheckInitializedKeeper } = s3Service.levelhealth
        if ( healthCheckInitializedKeeper === false ) {
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

  notificationCheck = () =>{
    const { messages } = this.props
    console.log( 'messages inside notificationCheck', messages )
    if( messages.length ){
      messages.sort( function ( left, right ) {
        return moment.utc( right.timeStamp ).unix() - moment.utc( left.timeStamp ).unix()
      } )
      this.setState( {
        notificationData: messages,
        notificationDataChange: !this.state.notificationDataChange,
      } )
      const message = messages.find( message => message.status === 'unread' )
      if( message ){
        this.handleNotificationBottomSheetSelection( message )}
    }
  }

  handleNotificationBottomSheetSelection = ( message ) => {
    console.log( 'handleNotificationBottomSheetSelection', message )
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
        case NotificationType.FNF_KEEPER_REQUEST:
          this.setState( {
            notificationTitle: message.title,
            notificationInfo: message.info,
            notificationNote: '',
            notificationAdditionalInfo: message.AdditionalInfo,
            notificationProceedText: 'Accept',
            notificationIgnoreText: 'Reject',
            isIgnoreButton: true
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
          this.setState( {
            notificationTitle: message.title,
            notificationInfo: message.info,
            notificationNote: 'For updating you will be taken to the ' + storeName,
            notificationAdditionalInfo: message.AdditionalInfo,
            notificationProceedText: 'Upgrade',
            notificationIgnoreText: 'Remind me later',
            isIgnoreButton: true
          }, () => {
            this.openBottomSheet( BottomSheetKind.NOTIFICATION_INFO )
          } )
          break
    }
  };


  componentDidUpdate = ( prevProps, prevState ) => {
    if (
      prevProps.accountsState.accountShells !==
      this.props.accountsState.accountShells
    ) {
      this.calculateNetBalance()
      // this.getNewTransactionNotifications()
    }

    if (
      prevProps.secondaryDeviceAddressValue !==
      this.props.secondaryDeviceAddressValue
    ) {
      this.setSecondaryDeviceAddresses()
    }

  };

  handleDeepLinkModal = () => {
    const custodyRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.custodyRequest : null//this.props.navigation.getParam( 'custodyRequest' )
    const recoveryRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.recoveryRequest : null //this.props.navigation.getParam( 'recoveryRequest' )
    const trustedContactRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.trustedContactRequest : null//this.props.navigation.getParam( 'trustedContactRequest' )
    const userKey = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.userKey : null//this.props.navigation.getParam( 'userKey' )
    const swanRequest = this.props.navigation.state.params && this.props.navigation.state.params.params ? this.props.navigation.state.params.params.swanRequest : null//this.props.navigation.getParam( 'swanRequest' )
    console.log( 'trustedContactRequest', trustedContactRequest )
    if ( swanRequest ) {
      this.setState( {
        swanDeepLinkContent:swanRequest.url,
      }, () => {
        this.props.currentSwanSubAccount
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
    console.log( 'Home::handleDeepLinkEvent::URL: ', url )

    const { navigation, isFocused } = this.props

    // If the user is on one of Home's nested routes, and a
    // deep link is opened, we will navigate back to Home first.
    if ( !isFocused ) {
      navigation.dispatch(
        resetToHomeAction( {
          unhandledDeepLinkURL: url,
        } )
      )
    } else {
      this.handleDeepLinking( url )
    }

  };

  handleDeepLinking = async ( url: string | null ) => {
    if ( url == null ) {
      return
    }

    console.log( 'handleDeepLinking: ' + url )

    const splits = url.split( '/' )
    if ( splits.includes( 'swan' ) ) {
      this.setState( {
        swanDeepLinkContent:url,
      }, () => {
        this.props.currentSwanSubAccount
          ? this.props.updateSwanStatus( SwanAccountCreationStatus.ACCOUNT_CREATED )
          : this.props.updateSwanStatus( SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS )
        this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
      } )

    }

    if ( splits.includes( 'wyre' ) ) {
      this.props.clearWyreCache()
      this.setState( {
        wyreDeepLinkContent:url,
        wyreFromBuyMenu: false,
        wyreFromDeepLink: true
      }, () => {
        this.openBottomSheet( BottomSheetKind.WYRE_STATUS_INFO )
      } )
    }
    if ( splits.includes( 'ramp' ) ) {
      this.props.clearRampCache()
      this.setState( {
        rampDeepLinkContent:url,
        rampFromBuyMenu: false,
        rampFromDeepLink: true
      }, () => {
        this.openBottomSheet( BottomSheetKind.RAMP_STATUS_INFO )
      } )
    }
    if ( splits[ 5 ] === 'sss' ) {
      const requester = splits[ 4 ]

      if ( splits[ 6 ] === 'ek' ) {
        const custodyRequest = {
          requester,
          ek: splits[ 7 ],
          uploadedAt: splits[ 8 ],
        }

        this.setState(
          {
            custodyRequest,
          },
          () => {
            this.openBottomSheetOnLaunch( BottomSheetKind.CUSTODIAN_REQUEST )
          }
        )
      } else if ( splits[ 6 ] === 'rk' ) {
        const recoveryRequest = {
          requester,
          rk: splits[ 7 ],
        }

        this.setState(
          {
            recoveryRequest,
            trustedContactRequest: null,
          },
          () => {
            this.openBottomSheetOnLaunch(
              BottomSheetKind.TRUSTED_CONTACT_REQUEST,
              1
            )
          }
        )
      }
    } else if ( [ 'tc', 'tcg', 'atcg', 'ptc' ].includes( splits[ 4 ] ) ) {
      if ( splits[ 3 ] !== config.APP_STAGE ) {
        Alert.alert(
          'Invalid deeplink',
          `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
            splits[ 3 ]
          }`
        )
      } else {
        const version = splits.pop().slice( 1 )

        if ( version ) {
          const isAppVersionCompatible = await checkAppVersionCompatibility( {
            relayCheckMethod: splits[ 4 ],
            version,
          } )

          if ( !isAppVersionCompatible ) {
            return
          }
        }
        let hint = splits[ 8 ]
        let isFromKeeper = false
        if ( splits[ 8 ].includes( '_' ) ) {
          const hintStr = splits[ 8 ].split( '_' )
          hint = hintStr[ 0 ]
          isFromKeeper = hintStr[ 1 ] == 'keeper' ? true : false
        }

        const trustedContactRequest = {
          isGuardian: [ 'tcg', 'atcg' ].includes( splits[ 4 ] ),
          approvedTC: splits[ 4 ] === 'atcg' ? true : false,
          isPaymentRequest: splits[ 4 ] === 'ptc' ? true : false,
          requester: splits[ 5 ],
          encryptedKey: splits[ 6 ],
          hintType: splits[ 7 ],
          hint,
          uploadedAt: splits[ 9 ],
          version,
          isFromKeeper,
        }

        this.setState(
          {
            trustedContactRequest,
            recoveryRequest: null,
          },
          () => {
            this.openBottomSheetOnLaunch(
              BottomSheetKind.TRUSTED_CONTACT_REQUEST,
              1
            )
          }
        )
      }
    } else if ( splits[ 4 ] === 'rk' ) {
      const recoveryRequest = {
        isRecovery: true,
        requester: splits[ 5 ],
        encryptedKey: splits[ 6 ],
        hintType: splits[ 7 ],
        hint: splits[ 8 ],
      }

      this.setState(
        {
          recoveryRequest,
          trustedContactRequest: null,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          )
        }
      )
    } else if ( splits[ 4 ] === 'scns' ) {
      const recoveryRequest = {
        isRecovery: true,
        requester: splits[ 5 ],
        encryptedKey: splits[ 6 ],
        hintType: splits[ 7 ],
        hint: splits[ 8 ],
        isPrimaryKeeperRecovery: true,
      }
      this.setState(
        {
          recoveryRequest,
          trustedContactRequest: null,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          )
        }
      )
    } else if ( splits[ 4 ] === 'rrk' ) {
      Alert.alert(
        'Restoration link Identified',
        'Restoration links only works during restoration mode'
      )
    }

    if ( url && url.includes( 'fastbitcoins' ) ) {
      const userKey = url.substr( url.lastIndexOf( '/' ) + 1 )
      this.props.navigation.navigate( 'VoucherScanner', {
        userKey
      } )
    }
  };

  setUpFocusListener = () => {
    const t0 = performance.now()
    const { navigation } = this.props

    this.focusListener = navigation.addListener( 'didFocus', () => {
      this.setCurrencyCodeFromAsync()
      this.props.fetchFeeAndExchangeRates( this.props.currencyCode )
      // this.notificationCheck()
      this.setState( {
        lastActiveTime: moment().toISOString(),
      } )
    } )
    this.notificationCheck()
    this.setCurrencyCodeFromAsync()
    const t1 = performance.now()
    console.log( 'setUpFocusListener ' + ( t1 - t0 ) + ' milliseconds.' )
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

  calculateNetBalance = () => {
    const { accountShells } = this.props.accountsState

    let totalBalance = 0
    accountShells.forEach( ( accountShell: AccountShell ) => {
      if (
        accountShell.primarySubAccount.sourceKind !==
        SourceAccountKind.TEST_ACCOUNT
      )
        totalBalance += AccountShell.getTotalBalance( accountShell )
    } )

    this.setState( {
      netBalance: totalBalance,
    } )
  };

  onTrustedContactRequestAccepted = ( key ) => {
    this.closeBottomSheet()
    const { navigation } = this.props
    const { trustedContactRequest } = this.state

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
  };

  onTrustedContactRejected = () => {
    this.closeBottomSheet()
    const { trustedContactRequest } = this.state
    this.props.rejectTrustedContact( {
      channelKey: trustedContactRequest.channelKey,
    } )
  };

  onPhoneNumberChange = () => {};

  handleBottomTabSelection = ( tab: BottomTab ) => {
    this.setState( {
      selectedBottomTab: tab,
    } )

    if ( tab === BottomTab.Transactions ) {
      this.props.navigation.navigate( 'AllTransactions' )
    } else if ( tab === BottomTab.More ) {
      this.props.navigation.navigate( 'MoreOptions' )
    } else if ( tab === BottomTab.QR ) {
      this.props.navigation.navigate( 'QRScanner', {
        onCodeScanned: this.processQRData,
      } )
    } else if ( tab === BottomTab.FriendsAndFamily ) {
      this.props.navigation.navigate( 'FriendsAndFamily' )
    }
  };

  handleBuyBitcoinBottomSheetSelection = ( menuItem: BuyBitcoinBottomSheetMenuItem ) => {
    switch ( menuItem.kind ) {
        case BuyMenuItemKind.FAST_BITCOINS:
          this.props.navigation.navigate( 'VoucherScanner' )
          break
        case BuyMenuItemKind.SWAN:
          this.props.clearSwanCache()
          if ( !this.props.currentSwanSubAccount ) {
            const newSubAccount = new ExternalServiceSubAccountInfo( {
              instanceNumber: 1,
              defaultTitle: 'Swan Account',
              defaultDescription: 'Sats purchased from Swan',
              serviceAccountKind: ServiceAccountKind.SWAN,
            } )
            this.props.createTempSwanAccountInfo( newSubAccount )
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
          if ( !this.props.currentRampSubAccount ) {
            const newSubAccount = new ExternalServiceSubAccountInfo( {
              instanceNumber: 1,
              defaultTitle: 'Ramp Account',
              defaultDescription: 'Sats purchased from Ramp',
              serviceAccountKind: ServiceAccountKind.RAMP,
            } )

            this.props.addNewAccountShell( newSubAccount )
          }
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
          if ( !this.props.currentWyreSubAccount ) {
            const newSubAccount = new ExternalServiceSubAccountInfo( {
              instanceNumber: 1,
              defaultTitle: 'Wyre Account',
              defaultDescription: 'Sats purchased from Wyre',
              serviceAccountKind: ServiceAccountKind.WYRE,
            } )
            this.props.addNewAccountShell( newSubAccount )
            // this.props.navigation.navigate( 'NewWyreAccountDetails', {
            //   currentSubAccount: newSubAccount,
            // } )
          }
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
    snapIndex: number | null = null
  ) => {
    console.log( 'kind', kind )
    console.log( 'snapIndex', snapIndex )

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

  renderBottomSheetContent() {
    const { UNDER_CUSTODY, navigation } = this.props
    const { custodyRequest, notificationTitle, notificationInfo, notificationNote, notificationAdditionalInfo, notificationProceedText, notificationIgnoreText, isIgnoreButton, notificationLoading, notificationData } = this.state
    console.log( 'this.state.currentBottomSheetKind', this.state.currentBottomSheetKind )
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
                let { skippedContactsCount } = this.props.trustedContacts.tc
                let data
                if ( !skippedContactsCount ) {
                  skippedContactsCount = 1
                  data = {
                    firstName: 'F&F request',
                    lastName: `awaiting ${skippedContactsCount}`,
                    name: `F&F request awaiting ${skippedContactsCount}`,
                  }
                } else {
                  data = {
                    firstName: 'F&F request',
                    lastName: `awaiting ${skippedContactsCount + 1}`,
                    name: `F&F request awaiting ${skippedContactsCount + 1}`,
                  }
                }

                this.closeBottomSheet()

                navigation.navigate( 'AddContactSendRequest', {
                  SelectedContact: [ data ],
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
                this.props.setCloudData()
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

              }}
              onPressIgnore={()=> {

              }}
              onPressClose={()=>{
                this.closeBottomSheet()
              }}
              proceedButtonText={notificationProceedText}
              cancelButtonText={notificationIgnoreText}
              isIgnoreButton={isIgnoreButton}
              note={notificationNote}
              bottomSheetRef={this.bottomSheetRef}
            />
          )

        default:
          break
    }
  }

  render() {
    const { netBalance, notificationData, currencyCode } = this.state
    console.log( 'notificationData', notificationData )
    const {
      navigation,
      exchangeRates,
      walletName,
      currentLevel,
    } = this.props

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
        <View
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
        </View>

        <HomeAccountCardsList
          containerStyle={styles.accountCardsSectionContainer}
          contentContainerStyle={{
            paddingTop: 36,
            paddingLeft: 14,
          }}
          currentLevel={currentLevel}
          onAddNewSelected={this.navigateToAddNewAccountScreen}
          onCardSelected={this.handleAccountCardSelection}
        />

        <View
          style={styles.floatingActionButtonContainer}
          pointerEvents="box-none"
        >
          <Button
            raised
            title="Buy"
            icon={
              <Image
                source={require( '../../assets/images/icons/icon_buy.png' )}
                style={{
                  width: widthPercentageToDP( 8 ),
                  height: widthPercentageToDP( 8 ),
                  marginTop: widthPercentageToDP( -3 ),
                  marginBottom: widthPercentageToDP( -3 ),
                }}
              />
            }
            buttonStyle={{
              ...ButtonStyles.floatingActionButton,
              borderRadius: 9999,
              paddingHorizontal: widthPercentageToDP( 10 ),
            }}
            titleStyle={{
              ...ButtonStyles.floatingActionButtonText,
              marginLeft: 8,
            }}
            onPress={() =>
              this.openBottomSheet( BottomSheetKind.TAB_BAR_BUY_MENU )
            }
          />
        </View>

        <BottomSheetBackground
          isVisible={this.state.bottomSheetState === BottomSheetState.Open}
          onPress={this.closeBottomSheet}
        />

        <CustomBottomTabs
          isEnabled={this.props.navigation.isFocused()}
          onSelect={this.handleBottomTabSelection}
          tabBarZIndex={
            this.state.currentBottomSheetKind ==
              BottomSheetKind.TAB_BAR_BUY_MENU || null
              ? 1
              : 0
          }
        />

        {this.state.currentBottomSheetKind != null && (
          <BottomSheet
            ref={this.bottomSheetRef}
            snapPoints={this.getBottomSheetSnapPoints()}
            initialSnapIndex={-1}
            animationDuration={defaultBottomSheetConfigs.animationDuration}
            animationEasing={Easing.out( Easing.back( 1 ) )}
            handleComponent={defaultBottomSheetConfigs.handleComponent}
            onChange={this.handleBottomSheetPositionChange}
          >
            <BottomSheetView>{this.renderBottomSheetContent()}</BottomSheetView>
          </BottomSheet>
        )}
      </ImageBackground>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    notificationList: state.notifications.notifications,
    accountsState: state.accounts,
    cloudPermissionGranted: state.health.cloudPermissionGranted,
    currentWyreSubAccount: state.accounts.currentWyreSubAccount,
    currentRampSubAccount: state.accounts.currentRampSubAccount,
    currentSwanSubAccount: state.accounts.currentSwanSubAccount,
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    walletName:
      idx( state, ( _ ) => _.storage.database.WALLET_SETUP.walletName ) || '',
    UNDER_CUSTODY: idx(
      state,
      ( _ ) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY
    ),
    cardDataProps: idx( state, ( _ ) => _.preferences.cardData ),
    secureAccount: idx( state, ( _ ) => _.accounts[ SECURE_ACCOUNT ].service ),
    s3Service: idx( state, ( _ ) => _.health.service ),
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    notificationListNew: idx( state, ( _ ) => _.notifications.notificationListNew ),
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    fcmTokenValue: idx( state, ( _ ) => _.preferences.fcmTokenValue ),
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
    keeperApproveStatus: idx( state, ( _ ) => _.health.keeperApproveStatus ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    newBHRFlowStarted: idx( state, ( _ ) => _.health.newBHRFlowStarted ),
    cloudBackupStatus: idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    isPermissionSet: idx( state, ( _ ) => _.preferences.isPermissionSet ),
    isAuthenticated: idx( state, ( _ ) => _.setupAndAuth.isAuthenticated, ),
    asyncNotificationList: idx( state, ( _ ) => _.notifications.updatedNotificationList ),
    fetchStarted: idx( state, ( _ ) => _.notifications.fetchStarted ),
    messages: state.notifications.messages,

  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    updateFCMTokens,
    downloadMShare,
    initializeTrustedContact,
    rejectTrustedContact,
    uploadRequestedShare,
    uploadSecondaryShareForPK,
    initializeHealthSetup,
    // initHealthCheck,
    autoSyncShells,
    clearWyreCache,
    clearRampCache,
    clearSwanCache,
    updateSwanStatus,
    addNewAccountShell,
    fetchFeeAndExchangeRates,
    createTempSwanAccountInfo,
    addTransferDetails,
    notificationsUpdated,
    setCurrencyCode,
    updatePreference,
    setFCMToken,
    setSecondaryDeviceAddress,
    setCardData,
    fetchKeeperTrustedChannel,
    onApprovalStatusChange,
    autoDownloadShareContact,
    setVersion,
    downloadSMShard,
    setCloudData,
    updateKeeperInfoToUnderCustody,
    updateCloudPermission,
    credsAuthenticated,
    setShowAllAccount,
    setIsPermissionGiven,
    updateLastSeen,
    setupNotificationList,
    updateNotificationList,
    setWalletId,
    updateMessageStatusInApp,
    updateMessageStatus
  } )( Home )
)

const styles = StyleSheet.create( {
  accountCardsSectionContainer: {
    flex: 7,
    marginTop: 30,
    backgroundColor: Colors.backgroundColor,
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
  },

  floatingActionButtonContainer: {
    position: 'absolute',
    zIndex: 0,
    bottom: TAB_BAR_HEIGHT,
    right: 0,
    flexDirection: 'row',
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
