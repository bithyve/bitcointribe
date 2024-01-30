import BottomSheet from '@gorhom/bottom-sheet'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import idx from 'idx'
import moment from 'moment'
import React, { createRef, PureComponent } from 'react'
import {
  Platform,
  StatusBar,
  StyleSheet,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import * as RNLocalize from 'react-native-localize'
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import {
  AccountType,
  LevelHealthInterface,
  Wallet
} from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import {
  SECURE_ACCOUNT
} from '../../common/constants/wallet-service-types'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import AccountShell from '../../common/data/models/AccountShell'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import BottomSheetAddWalletInfo from '../../components/bottom-sheets/add-wallet/BottomSheetAddWalletInfo'
import BottomSheetRampInfo from '../../components/bottom-sheets/ramp/BottomSheetRampInfo'
import BottomSheetSwanInfo from '../../components/bottom-sheets/swan/BottomSheetSwanInfo'
import BottomSheetWyreInfo from '../../components/bottom-sheets/wyre/BottomSheetWyreInfo'
import BuyBitcoinHomeBottomSheet, { BuyBitcoinBottomSheetMenuItem, BuyMenuItemKind } from '../../components/home/BuyBitcoinHomeBottomSheet'
import {
  BottomTab
} from '../../components/home/custom-bottom-tabs'
import ModalContainer from '../../components/home/ModalContainer'
import {
  addTransferDetails,
  fetchExchangeRates,
  fetchFeeRates,
  setShowAllAccount
} from '../../store/actions/accounts'
import {
  acceptExistingContactRequest,
  initializeHealthSetup,
  updateCloudPermission
} from '../../store/actions/BHR'
import { setCloudData } from '../../store/actions/cloud'
import {
  getMessages,
  notificationsUpdated,
  setupNotificationList,
  updateFCMTokens,
  updateMessageStatus,
  updateMessageStatusInApp,
  updateNotificationList
} from '../../store/actions/notifications'
import {
  setCardData,
  setCurrencyCode, setFCMToken, setIsPermissionGiven, setSecondaryDeviceAddress,
  updatePreference
} from '../../store/actions/preferences'
import { clearRampCache } from '../../store/actions/RampIntegration'
import { credsAuthenticated } from '../../store/actions/setupAndAuth'
import { clearSwanCache, createTempSwanAccountInfo, updateSwanStatus } from '../../store/actions/SwanIntegration'
import {
  rejectTrustedContact,
  syncPermanentChannels
} from '../../store/actions/trustedContacts'
import { setVersion } from '../../store/actions/versionHistory'
import { clearWyreCache } from '../../store/actions/WyreIntegration'
import { AccountsState } from '../../store/reducers/accounts'
import BottomSheetHeader from '../Accounts/BottomSheetHeader'
import BottomSheetWalletHeader from '../Accounts/BottomSheetWalletHeader'
import HomeContainer from './HomeContainer'

export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800
export enum BottomSheetState {
  Closed,
  Open,
}
export enum BottomSheetKind {
  TAB_BAR_BUY_MENU,
  TRUSTED_CONTACT_REQUEST,
  ADD_CONTACT_FROM_ADDRESS_BOOK,
  ADD_A_WALLET_INFO,
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
  fetchFeeRates: any;
  fetchExchangeRates: any;
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
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  bottomSheetRef = createRef<BottomSheet>();
  openBottomSheetOnLaunchTimeout: null | ReturnType<typeof setTimeout>;
  syncPermanantChannelTime: any;
  currentNotificationId: string;
  static whyDidYouRender = true;

  constructor(props) {
    super(props)
    this.props.setShowAllAccount(false)
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
    }
    this.currentNotificationId = ''
  }

  componentDidMount = async () => {
    if (this.props.levelHealth.length && this.props.cloudBackupStatus !== CloudBackupStatus.IN_PROGRESS && this.props.cloudPermissionGranted === true && this.props.updateWIStatus === false && this.props.levelHealth[0].levelInfo[0].status != 'notSetup' && this.props.currentLevel == 0) {
      if (Platform.OS === 'android') {
        if (!this.props.isGoogleLoginCancelled) {
          this.props.setCloudData()
        }
      } else {
        this.props.setCloudData()
      }
    }
    requestAnimationFrame(() => {
      this.setUpFocusListener()
    })
  }

  handleBuyBitcoinBottomSheetSelection = (menuItem: BuyBitcoinBottomSheetMenuItem) => {

    switch (menuItem.kind) {
      case BuyMenuItemKind.FAST_BITCOINS:
        this.closeBottomSheet()
        this.props.navigation.navigate('VoucherScanner')
        break
      case BuyMenuItemKind.SWAN:
        const swanAccountActive = false
        if (!swanAccountActive) {
          this.props.clearSwanCache()
          this.props.updateSwanStatus(SwanAccountCreationStatus.BUY_MENU_CLICKED)
        }
        else {
          this.props.updateSwanStatus(SwanAccountCreationStatus.ACCOUNT_CREATED)
        }
        this.setState({
          swanDeepLinkContent: null
        }, () => {
          this.openBottomSheet(BottomSheetKind.SWAN_STATUS_INFO)
        })
        break
      case BuyMenuItemKind.RAMP:
        this.props.clearRampCache()
        this.setState({
          rampDeepLinkContent: null,
          rampFromDeepLink: false,
          rampFromBuyMenu: true
        }, () => {
          this.openBottomSheet(BottomSheetKind.RAMP_STATUS_INFO)
        })
        break
      case BuyMenuItemKind.WYRE:
        this.props.clearWyreCache()
        this.setState({
          wyreDeepLinkContent: null,
          wyreFromDeepLink: false,
          wyreFromBuyMenu: true
        }, () => {
          this.openBottomSheet(BottomSheetKind.WYRE_STATUS_INFO)
        })
        break
    }
  };

  setCurrencyCodeFromAsync = async () => {
    const { currencyCode } = this.props
    if (!currencyCode) {
      this.props.setCurrencyCode(RNLocalize.getCurrencies()[0])
      this.setState({
        currencyCode: RNLocalize.getCurrencies()[0],
      })
    } else {
      this.setState({
        currencyCode: currencyCode,
      })
    }
  };
  updateBadgeCounter = () => {
    const { messages } = this.props
    const unread = messages.filter(msg => msg.status === 'unread')
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(unread.length)
    }
  }

  setUpFocusListener = () => {
    const { navigation } = this.props

    this.focusListener = navigation.addListener('focus', () => {

      this.setCurrencyCodeFromAsync()
      this.props.fetchExchangeRates(this.props.currencyCode)
      this.props.fetchFeeRates()
      // this.syncChannel()
      // this.notificationCheck()
      this.setState({
        lastActiveTime: moment().toISOString(),
      })
    })
    // this.notificationCheck()
    this.setCurrencyCodeFromAsync()
  };


  cleanupListeners() {
    this.focusListener?.()
  }

  openBottomSheet = (
    kind: BottomSheetKind,
    snapIndex?: number | null,
    swanAccountClicked?: boolean | false
  ) => {
    const tempMenuItem: BuyBitcoinBottomSheetMenuItem = {
      kind: BuyMenuItemKind.SWAN
    }

    if (swanAccountClicked) this.handleBuyBitcoinBottomSheetSelection(tempMenuItem)

    this.setState(
      {
        bottomSheetState: BottomSheetState.Open,
        currentBottomSheetKind: kind,
      },
      () => {
        if (snapIndex == null) {
          this.bottomSheetRef.current?.expand()
        } else {
          this.bottomSheetRef.current?.snapTo(snapIndex)
        }
      }
    )
  };

  onBottomSheetClosed() {
    this.setState({
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
    })
  }

  closeBottomSheet = () => {
    this.bottomSheetRef.current?.close()
    this.onBottomSheetClosed()
  };

  onBackPress = () => {
    this.openBottomSheet(BottomSheetKind.TAB_BAR_BUY_MENU)
  };


  renderBottomSheetContent() {
    switch (this.state.currentBottomSheetKind) {
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
              onPress={this.onBackPress}
            />
          </>
        )

      case BottomSheetKind.ADD_A_WALLET_INFO:
        return (
          <>
            <BottomSheetWalletHeader title="Add a wallet" onPress={this.closeBottomSheet} />
            <BottomSheetAddWalletInfo
              onRGBWalletClick={() => {
                this.closeBottomSheet()
                const accountShell = this.props.accountShells[1]
                this.props.navigation.navigate('NewRGBWallet', {
                  accountShellID: accountShell.id,
                })
              }}
              onLighteningWalletClick={() => {
                this.closeBottomSheet()
                this.props.navigation.navigate('ScanNodeConfig', {
                  currentSubAccount: null,
                })
              }}
              title1='RGB Wallet'
              title2='Lightening Wallet'
              desc1='Issue new coins or collectibles on RGB. Set limit and send it around your Tribe'
              desc2='You can also add an asset to your Tribe wallet by receiving it from someone'
            />
          </>
        )

      default:
        break
    }
  }

  render() {
    return (
      <View style={{
        backgroundColor: Colors.blue
      }}>
        <LinearGradient colors={[Colors.blue, Colors.blue]}
          start={{
            x: 0, y: 0
          }} end={{
            x: 0.5, y: 1
          }}>
          <StatusBar translucent={false} backgroundColor={'transparent'} barStyle="light-content" />
        </LinearGradient>
        <ModalContainer
          onBackground={() => this.setState({
            currentBottomSheetKind: null
          })}
          visible={this.state.currentBottomSheetKind !== null}
          closeBottomSheet={() => { }}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer>
        <HomeContainer navigation={this.props.navigation} lnAcc={this.props.accountShells.filter(shell => shell.primarySubAccount.type === AccountType.LIGHTNING_ACCOUNT)} containerView={styles.accountCardsSectionContainer} openBottomSheet={this.openBottomSheet} swanDeepLinkContent={this.state.swanDeepLinkContent} />

      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    notificationList: state.notifications.notifications,
    accountsState: state.accounts,
    cloudPermissionGranted: state.bhr.cloudPermissionGranted,
    exchangeRates: idx(state, (_) => _.accounts.exchangeRates),
    wallet: idx(state, (_) => _.storage.wallet),
    UNDER_CUSTODY: idx(
      state,
      (_) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY
    ),
    cardDataProps: idx(state, (_) => _.preferences.cardData),
    secureAccount: idx(state, (_) => _.accounts[SECURE_ACCOUNT].service),
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    notificationListNew: idx(state, (_) => _.notifications.notificationListNew),
    currencyCode: idx(state, (_) => _.preferences.currencyCode),
    existingFCMToken: idx(state, (_) => _.preferences.existingFCMToken),
    secondaryDeviceAddressValue: idx(
      state,
      (_) => _.preferences.secondaryDeviceAddressValue
    ),
    releaseCasesValue: idx(state, (_) => _.preferences.releaseCasesValue),
    database: idx(state, (_) => _.storage.database) || {
    },
    levelHealth: idx(state, (_) => _.bhr.levelHealth),
    currentLevel: idx(state, (_) => _.bhr.currentLevel),
    keeperInfo: idx(state, (_) => _.bhr.keeperInfo),
    accountShells: idx(state, (_) => _.accounts.accountShells),
    newBHRFlowStarted: idx(state, (_) => _.bhr.newBHRFlowStarted),
    isGoogleLoginCancelled: idx(state, (_) => _.cloud.isGoogleLoginCancelled),
    cloudBackupStatus: idx(state, (_) => _.cloud.cloudBackupStatus) || CloudBackupStatus.PENDING,
    isPermissionSet: idx(state, (_) => _.preferences.isPermissionSet),
    isAuthenticated: idx(state, (_) => _.setupAndAuth.isAuthenticated,),
    asyncNotificationList: idx(state, (_) => _.notifications.updatedNotificationList),
    fetchStarted: idx(state, (_) => _.notifications.fetchStarted),
    messages: state.notifications.messages,
    initLoader: idx(state, (_) => _.bhr.loading.initLoader),
    updateWIStatus: idx(state, (_) => _.bhr.loading.updateWIStatus),
  }
}

export default
  connect(mapStateToProps, {
    updateFCMTokens,
    acceptExistingContactRequest,
    rejectTrustedContact,
    initializeHealthSetup,
    clearWyreCache,
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
  })(Home)

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    width: widthPercentageToDP('95%'),
    borderRadius: widthPercentageToDP(3),
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthPercentageToDP(5),
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: widthPercentageToDP(2)
  },
  accountCardsSectionContainer: {
    height: hp('71.46%'),
    backgroundColor: Colors.backgroundColor,
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
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: heightPercentageToDP(1.5),
  },

  cloudErrorModalImage: {
    width: wp('30%'),
    height: wp('25%'),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginBottom: hp('-3%'),
  }
})
