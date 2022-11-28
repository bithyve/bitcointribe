import React, { createRef, PureComponent } from 'react'
import {
  StyleSheet,
  StatusBar,
  View,
  Platform,
  SafeAreaView,
  FlatList,
  Image,
  Text,
  TouchableOpacity
} from 'react-native'
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import Colors from '../../common/Colors'
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import {
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import { connect } from 'react-redux'
import {
  rejectTrustedContact,
  syncPermanentChannels,
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
} from '../../store/actions/preferences'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import * as RNLocalize from 'react-native-localize'
import {
  addTransferDetails,
  fetchFeeAndExchangeRates
} from '../../store/actions/accounts'
import {
  DeepLinkEncryptionType,
  LevelHealthInterface,
  notificationType,
  QRCodeTypes,
  Wallet,
} from '../../bitcoin/utilities/Interface'
import moment from 'moment'
import { withNavigationFocus } from 'react-navigation'
import {
  updatePreference,
  setFCMToken,
  setSecondaryDeviceAddress,
} from '../../store/actions/preferences'
import BottomSheetHeader from '../Accounts/BottomSheetHeader'
import BottomSheet from '@gorhom/bottom-sheet'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import { AccountsState } from '../../store/reducers/accounts'
import AccountShell from '../../common/data/models/AccountShell'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
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
import ModalContainer from '../../components/home/ModalContainer'
import HomeHeader from '../../components/home/home-header_update'
import DeviceInfo from 'react-native-device-info'
import ClipboardAutoRead from '../../components/ClipboardAutoRead'
import { NotificationType } from '../../components/home/NotificationType'
import {
  initializeHealthSetup,
  updateCloudPermission,
  acceptExistingContactRequest,
  updateSecondaryShard,
  rejectedExistingContactRequest
} from '../../store/actions/BHR'
import { makeContactRecipientDescription } from '../../utils/sending/RecipientFactories'
import { getCurrencyImageByRegion, processRequestQR } from '../../common/CommonFunctions'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from './../../common/Fonts'
import CustomToolbar from '../../components/home/CustomToolbar'
import NotificationListContent from '../../components/NotificationListContent'

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
  notificationType: string | null;
  releaseNotes: string;
  giftRequest: any;
  homeData: any[]
}

interface HomePropsTypes {
  navigation: any;
  notificationList: any;
  exchangeRates?: any[];
  accountsState: AccountsState;
  cloudPermissionGranted: any;
  wallet: Wallet;
  UNDER_CUSTODY: any;
  updateFCMTokens: any;
  acceptExistingContactRequest: any;
  rejectTrustedContact: any;
  initializeHealthSetup: any;
  overallHealth: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  clearWyreCache: any;
  clearRampCache: any;
  clearSwanCache: any;
  updateSwanStatus: any;
  fetchFeeAndExchangeRates: any;
  createTempSwanAccountInfo: any;
  addTransferDetails: any;
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
  updateWIStatus: boolean;
  isGoogleLoginCancelled: boolean
  clipboardAccess: boolean;
  rejectedExistingContactRequest: any;
  walletName: string;
}

class NewHome extends PureComponent<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  bottomSheetRef = createRef<BottomSheet>();
  openBottomSheetOnLaunchTimeout: null | ReturnType<typeof setTimeout>;
  syncPermanantChannelTime: any;
  currentNotificationId: string;
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
      notificationIgnoreText: null,
      isIgnoreButton: false,
      currentMessage: null,
      notificationType: null,
      releaseNotes: '',
      giftRequest: null,
      homeData: [ {
        name: 'Gift and tips',
        type: 1
      }, {
        name: 'Add New F&F',
        type: 2
      }, {
        name: 'Create group',
        type: 3
      }, {
        name: 'Settings',
        type: 4
      }, {
        name: 'Buy Bitcoin',
        type: 5
      }, {
        name: 'Shepa Settings',
        type: 6
      } ]
    }
    this.currentNotificationId = ''
  }

  componentDidMount = async () => {
    if ( this.props.levelHealth.length && this.props.cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS && this.props.cloudPermissionGranted === true && this.props.updateWIStatus === false && this.props.levelHealth[ 0 ].levelInfo[ 0 ].status != 'notSetup' && this.props.currentLevel == 0 ) {
      if ( Platform.OS === 'android' ) {
        if ( !this.props.isGoogleLoginCancelled ) {
          this.props.setCloudData()
        }
      } else {
        this.props.setCloudData()
      }
    }
    requestAnimationFrame( () => {
      this.setUpFocusListener()
    } )
  }

  handleBuyBitcoinBottomSheetSelection = ( menuItem: BuyBitcoinBottomSheetMenuItem ) => {

    switch ( menuItem.kind ) {
        case BuyMenuItemKind.FAST_BITCOINS:
          this.closeBottomSheet()
          this.props.navigation.navigate( 'VoucherScanner' )
          break
        case BuyMenuItemKind.SWAN:
          const swanAccountActive = false
          if ( !swanAccountActive ) {
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
  updateBadgeCounter = () => {
    const { messages } = this.props
    const unread = messages.filter( msg => msg.status === 'unread' )
    if ( Platform.OS === 'ios' ) {
      PushNotificationIOS.setApplicationIconBadgeNumber( unread.length )
    }
  }

  // notificationCheck = () =>{
  //   const { messages } = this.props
  //   if( messages && messages.length ){
  //     this.updateBadgeCounter()
  //     messages.sort( function ( left, right ) {
  //       return moment.utc( right.timeStamp ).unix() - moment.utc( left.timeStamp ).unix()
  //     } )
  //     this.setState( {
  //       notificationData: messages,
  //       notificationDataChange: !this.state.notificationDataChange,
  //     } )
  //     if( this.currentNotificationId !== '' ) {
  //       const message = messages.find( message => message.notificationId === this.currentNotificationId )
  //       if( message ){
  //         this.handleNotificationBottomSheetSelection( message )
  //       }
  //       this.currentNotificationId = ''
  //     } else {
  //       const message = messages.find( message => message.status === 'unread' )
  //       if( message ){
  //         this.handleNotificationBottomSheetSelection( message )
  //       }
  //     }
  //   }
  // }

  setUpFocusListener = () => {
    const { navigation } = this.props

    this.focusListener = navigation.addListener( 'didFocus', () => {

      this.setCurrencyCodeFromAsync()
      this.props.fetchFeeAndExchangeRates( this.props.currencyCode )
      // this.syncChannel()
      // this.notificationCheck()
      this.setState( {
        lastActiveTime: moment().toISOString(),
      } )
    } )
    // this.notificationCheck()
    this.setCurrencyCodeFromAsync()
  };


  cleanupListeners() {
    if ( typeof this.focusListener === 'function' ) {
      this.props.navigation.removeListener( 'didFocus', this.focusListener )
    }
  }

  openBottomSheet = (
    kind: BottomSheetKind,
    snapIndex?: number | null,
    swanAccountClicked?: boolean | false
  ) => {
    const tempMenuItem: BuyBitcoinBottomSheetMenuItem = {
      kind: BuyMenuItemKind.SWAN
    }

    if ( swanAccountClicked ) this.handleBuyBitcoinBottomSheetSelection( tempMenuItem )

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


  renderBottomSheetContent() {
    // console.log( 'this.state.currentBottomSheetKind', this.state.currentBottomSheetKind )
    switch ( this.state.currentBottomSheetKind ) {
        case BottomSheetKind.TAB_BAR_BUY_MENU:
          return (
            <>
              <BottomSheetHeader title="Buy Bitcoin" onPress={this.closeBottomSheet} />

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

        default:
          break
    }
  }

  onNotificationClicked = async ( value ) => {
    console.log( 'value', value )
    // if( value.status === 'unread' || value.type === NotificationType.FNF_TRANSACTION )
    // if( value.type !== NotificationType.FNF_KEEPER_REQUEST )
    this.handleNotificationBottomSheetSelection( value )
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
    const notificationRejection = this.props.messages.find( value => value.type == notificationType.FNF_KEEPER_REQUEST_REJECTED && value.additionalInfo && value.additionalInfo.wasExistingContactRequest && value.additionalInfo.channelKey )
    console.log( 'notificationRejection', notificationRejection )
    if ( notificationRejection ) {
      this.props.rejectedExistingContactRequest( notificationRejection.additionalInfo.channelKey )
    }
  };

  openBottomSheetOnLaunch(
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) {
    this.openBottomSheetOnLaunchTimeout = setTimeout( () => {
      this.openBottomSheet( kind, snapIndex )
    }, BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY )
  }

  notificationCheck = () => {
    const { messages } = this.props
    console.log( 'notificationCheck ' + JSON.stringify( messages ) )
    if ( messages && messages.length ) {
      this.updateBadgeCounter()
      messages.sort( function ( left, right ) {
        return moment.utc( right.timeStamp ).unix() - moment.utc( left.timeStamp ).unix()
      } )
      this.setState( {
        notificationData: messages,
        notificationDataChange: !this.state.notificationDataChange,
      } )
      if ( this.currentNotificationId !== '' ) {
        const message = messages.find( message => message.notificationId === this.currentNotificationId )
        if ( message ) {
          this.handleNotificationBottomSheetSelection( message )
        }
        this.currentNotificationId = ''
      } else {
        const message = messages.find( message => message.additionalInfo === null && message.status === 'unread' )
        if ( message ) {
          this.handleNotificationBottomSheetSelection( message )
        }
      }
    }
    const notificationRejection = messages.find( value => value.type == notificationType.FNF_KEEPER_REQUEST_REJECTED && value.additionalInfo && value.additionalInfo.wasExistingContactRequest && value.additionalInfo.channelKey )
    console.log( 'notificationRejection', notificationRejection )
    if ( notificationRejection ) {
      this.props.rejectedExistingContactRequest( notificationRejection.additionalInfo.channelKey )
    }
  }

  readAllNotifications = () => {
    const { messages } = this.props
    const arr = []
    messages.forEach( message => {
      if ( message.status === 'unread' ) {
        arr.push(
          {
            notificationId: message.notificationId,
            status: 'read'
          }
        )
        this.props.updateMessageStatusInApp( message.notificationId )
      }
    } )
    if ( arr.length > 0 ) {
      this.props.updateMessageStatus( arr )
    }
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

  handleNotificationBottomSheetSelection = ( message ) => {
    const storeName = Platform.OS == 'ios' ? 'App Store' : 'Play Store'
    this.setState( {
      currentMessage: message
    } )
    const statusValue = [ {
      notificationId: message.notificationId,
      status: 'read'
    } ]
    this.props.updateMessageStatus( statusValue )
    this.props.updateMessageStatusInApp( message.notificationId )
    switch ( message.type ) {
        case NotificationType.FNF_KEEPER_REQUEST:
          this.setState( {
            trustedContactRequest: {
              walletName: message.additionalInfo.walletName,
              encryptedChannelKeys: message.additionalInfo.channelKey + '-' + message.additionalInfo.contactsSecondaryChannelKey,
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
            giftType: '1'
          } )
          break
        case NotificationType.GIFT_REJECTED:
        // console.log( 'message.AdditionalInfo', message.additionalInfo )
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
              giftType: '1'
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
          if ( Number( current ) <= Number( mandatoryFor ) || Number( current ) < Number( build ) ) {
            this.setState( {
              notificationTitle: message.title,
              notificationInfo: message.info,
              notificationNote: 'For updating you will be taken to the ' + storeName,
              notificationAdditionalInfo: message.additionalInfo,
              notificationProceedText: 'Upgrade',
              notificationIgnoreText: Number( current ) <= Number( mandatoryFor ) ? '' : 'Remind me later',
              isIgnoreButton: true,
              releaseNotes: Platform.OS === 'android' ? message.additionalInfo.notes.android : message.additionalInfo.notes.ios,
              notificationType: message.type
            }, () => {
              this.openBottomSheet( BottomSheetKind.NOTIFICATION_INFO )
            } )
          }
          break
    }
  };

  onCodeScanned = async ( qrData ) => {
    const { trustedContactRequest, giftRequest, link } = await processRequestQR( qrData )
    if ( trustedContactRequest ) {
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
    if ( giftRequest ) {
      this.setState( {
        giftRequest
      }, () => {
        this.openBottomSheetOnLaunch(
          BottomSheetKind.GIFT_REQUEST,
          1
        )
      } )
    }
  }

  onItemClick = ( item ) => {
    switch ( item.type ) {
        //Gift and tips
        case 1:
          this.props.navigation.navigate( 'ManageGifts' )
          break

        //Friends and Family
        case 2:
          this.props.navigation.navigate( 'FriendsAndFamily' )
          break

        //
        case 3:
          break

        //Settings
        case 4:
          this.props.navigation.navigate( 'MoreOptions' )
          break

        //Buy BTC
        case 5:
          this.openBottomSheet( BottomSheetKind.TAB_BAR_BUY_MENU )
          break
    }
  }

  getIconPath = ( item ) => {
    switch ( item.type ) {
        case 1:
          return require( '../../assets/images/newHome/gift.png' )

        case 2:
          return require( '../../assets/images/newHome/group.png' )

        case 3:
          return require( '../../assets/images/newHome/broadcast.png' )

        case 4:
          return require( '../../assets/images/newHome/contacts.png' )

        case 5:
          return require( '../../assets/images/newHome/bitcoin.png' )

        case 6:
          return require( '../../assets/images/newHome/payments.png' )
    }
  }

  renderHomeItem = ( { item, index } ) => {
    return (
      <TouchableOpacity style={{
        width: wp( 95 ), height: wp( 120 ), marginEnd: wp( 18 ),
        backgroundColor: Colors.cream, paddingHorizontal: wp( 12 ),
        borderRadius: 10, marginBottom: 18
      }} activeOpacity={1} onPress={() => this.onItemClick( item )}>
        { ( item.name == 'Shepa Settings' || item.name == '' ) && <Text style={{
          fontSize: RFValue( 8 ), fontFamily: Fonts.RobotoSlabMedium,
          letterSpacing: 0.8, lineHeight: ( 16 ), marginTop: 7, color: Colors.goldenText
        }}>{'COMING SOON'}</Text>}
        <Image source={this.getIconPath( item )}
          style={{
            width: wp( 31 ), height: wp( 31 ), marginTop: item.name == 'Shepa Settings' ? ( 14 ) : (36)
          }} />
        <Text style={{
          fontSize: RFValue( 12 ), fontFamily: Fonts.RobotoSlabMedium,
          letterSpacing: 0.6, lineHeight: ( 16 ), marginTop: 7, color: Colors.greyText
        }}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  navigateToQRScreen = () => {
    this.props.navigation.navigate( 'QRScanner', {
      onCodeScanned: this.onCodeScanned,
    } )
  };
  render() {
    const { netBalance, notificationData, currencyCode } = this.state

    const {
      navigation,
      exchangeRates,
      walletName,
      currentLevel,
    } = this.props
    return (
      <View style={{
        backgroundColor: Colors.appPrimary, flex:1
      }}>
        <SafeAreaView style={{
          backgroundColor: Colors.appPrimary
        }}/>
        <StatusBar backgroundColor={Colors.appPrimary} barStyle="dark-content" />
        {/* <CustomToolbar toolbarTitle={'Title'} onBackPressed={()=>{}}/> */}
        {/* <ModalContainer
          onBackground={() => this.setState( {
            currentBottomSheetKind: null
          } )}
          visible={this.state.currentBottomSheetKind !== null}
          closeBottomSheet={() => { }}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer> */}
        <ModalContainer
          onBackground={() => {
            if ( this.state.currentBottomSheetKind === BottomSheetKind.GIFT_REQUEST ) {
              console.log( 'bgState' )
            } else if ( this.state.currentBottomSheetKind === BottomSheetKind.TRUSTED_CONTACT_REQUEST ) {
              console.log( 'bgState' )
            } else {
              const perviousState = this.state.currentBottomSheetKind
              this.setState( {
                currentBottomSheetKind: null
              } )
              setTimeout( () => {
                this.setState( {
                  currentBottomSheetKind: perviousState
                }
                )
              }, 200 )
            }
          }}
          visible={this.state.currentBottomSheetKind != null}
          closeBottomSheet={() => {}}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer>
        <View style={{
          backgroundColor: Colors.white, flex:1
        }}>
          <View style={{
            flex:1
          }}>
            {this.props.clipboardAccess && <ClipboardAutoRead navigation={this.props.navigation} />}
            <View style={{
              flex:1
            }}>
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
            </View>
            <View>
              <View style={{
                borderBottomStartRadius: hp( 40 ),
                height: hp( 30 ), backgroundColor: Colors.appPrimary,
                position: 'absolute', zIndex: -1, width: '100%'
              }} />
              <FlatList
                contentContainerStyle={{
                  marginStart: wp( 27 ), marginEnd: wp( 9 )
                }}
                data={this.state.homeData}
                numColumns={3}
                renderItem={this.renderHomeItem}
                keyExtractor={( item, index ) => item.id}
              />
            </View>
            <ModalContainer
              onBackground={() => {
                if ( this.state.currentBottomSheetKind === BottomSheetKind.GIFT_REQUEST ) {
                  console.log( 'bgState' )
                } else if ( this.state.currentBottomSheetKind === BottomSheetKind.TRUSTED_CONTACT_REQUEST ) {
                  console.log( 'bgState' )
                } else {
                  const perviousState = this.state.currentBottomSheetKind
                  this.setState( {
                    currentBottomSheetKind: null
                  } )
                  setTimeout( () => {
                    this.setState( {
                      currentBottomSheetKind: perviousState
                    }
                    )
                  }, 200 )
                }
              }}
              visible={this.state.currentBottomSheetKind != null}
              closeBottomSheet={() => { }}
            >
            </ModalContainer>
          </View>
        </View>
        <SafeAreaView style={{
          backgroundColor: Colors.white
        }}/>
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    notificationList: state.notifications.notifications,
    accountsState: state.accounts,
    cloudPermissionGranted: state.bhr.cloudPermissionGranted,
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    wallet: idx( state, ( _ ) => _.storage.wallet ),
    UNDER_CUSTODY: idx(
      state,
      ( _ ) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY
    ),
    cardDataProps: idx( state, ( _ ) => _.preferences.cardData ),
    secureAccount: idx( state, ( _ ) => _.accounts[ SECURE_ACCOUNT ].service ),
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    notificationListNew: idx( state, ( _ ) => _.notifications.notificationListNew ),
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    existingFCMToken: idx( state, ( _ ) => _.preferences.existingFCMToken ),
    secondaryDeviceAddressValue: idx(
      state,
      ( _ ) => _.preferences.secondaryDeviceAddressValue
    ),
    releaseCasesValue: idx( state, ( _ ) => _.preferences.releaseCasesValue ),
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    levelHealth: idx( state, ( _ ) => _.bhr.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
    keeperInfo: idx( state, ( _ ) => _.bhr.keeperInfo ),
    // accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    newBHRFlowStarted: idx( state, ( _ ) => _.bhr.newBHRFlowStarted ),
    isGoogleLoginCancelled: idx( state, ( _ ) => _.cloud.isGoogleLoginCancelled ),
    cloudBackupStatus: idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    isPermissionSet: idx( state, ( _ ) => _.preferences.isPermissionSet ),
    isAuthenticated: idx( state, ( _ ) => _.setupAndAuth.isAuthenticated, ),
    asyncNotificationList: idx( state, ( _ ) => _.notifications.updatedNotificationList ),
    fetchStarted: idx( state, ( _ ) => _.notifications.fetchStarted ),
    messages: state.notifications.messages,
    initLoader: idx( state, ( _ ) => _.bhr.loading.initLoader ),
    updateWIStatus: idx( state, ( _ ) => _.bhr.loading.updateWIStatus ),
    clipboardAccess: idx( state, ( _ ) => _.misc.clipboardAccess ),
    walletName:
      idx( state, ( _ ) => _.storage.wallet.walletName ) || '',
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    updateFCMTokens,
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
    rejectedExistingContactRequest,
  } )( NewHome )
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
    paddingHorizontal: widthPercentageToDP( 2 )
  },
  // accountCardsSectionContainer: {
  //   height: hp( '71.46%' ),
  //   // marginTop: 30,
  //   backgroundColor: Colors.backgroundColor1,
  //   // borderTopLeftRadius: 25,
  //   // shadowColor: 'black',
  //   // shadowOpacity: 0.4,
  //   // shadowOffset: {
  //   //   width: 2,
  //   //   height: -1,
  //   // },
  //   flexDirection: 'column',
  //   justifyContent: 'space-around'
  // },

  // floatingActionButtonContainer: {
  //   // position: 'absolute',
  //   // zIndex: 0,
  //   // bottom: TAB_BAR_HEIGHT,
  //   // right: 0,
  //   // flexDirection: 'row',
  //   justifyContent: 'flex-end',
  //   alignSelf: 'flex-end',
  //   padding: heightPercentageToDP( 1.5 ),
  // },

  // cloudErrorModalImage: {
  //   width: wp( '30%' ),
  //   height: wp( '25%' ),
  //   marginLeft: 'auto',
  //   resizeMode: 'stretch',
  //   marginBottom: hp( '-3%' ),
  // }
} )
