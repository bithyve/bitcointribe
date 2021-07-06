import React, { createRef, PureComponent } from 'react'
import {
  View,
  Platform,
  Linking,
  Alert,
} from 'react-native'
import {
  heightPercentageToDP,
  // widthPercentageToDP,
} from 'react-native-responsive-screen'
import DeviceInfo from 'react-native-device-info'
import CustodianRequestRejectedModalContents from '../../components/CustodianRequestRejectedModalContents'
import * as RNLocalize from 'react-native-localize'
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/wallet-service-types'
import { connect } from 'react-redux'
import {
  initializeTrustedContact,
  rejectTrustedContact,
  InitTrustedContactFlowKind,
} from '../../store/actions/trustedContacts'
import {
  updateFCMTokens,
  notificationsUpdated,
  updateNotificationList,
  updateMessageStatusInApp,
  updateMessageStatus
} from '../../store/actions/notifications'
import {
  setCurrencyCode,
} from '../../store/actions/preferences'
import {
  getCurrencyImageByRegion,
} from '../../common/CommonFunctions/index'
import Toast from '../../components/Toast'
import NotificationListContent from '../../components/NotificationListContent'
// import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import HomeHeader from '../../components/home/home-header_update'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import {
  addTransferDetails,
  fetchFeeAndExchangeRates
} from '../../store/actions/accounts'
import {
  LevelHealthInterface,
  QRCodeTypes,
} from '../../bitcoin/utilities/Interface'
import { ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import moment from 'moment'
import { withNavigationFocus } from 'react-navigation'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'
import TrustedContactRequestContent from '../../pages/Home/TrustedContactRequestContent'
import checkAppVersionCompatibility from '../../utils/CheckAppVersionCompatibility'
import BottomSheet from '@gorhom/bottom-sheet'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { AccountsState } from '../../store/reducers/accounts'
import AccountShell from '../../common/data/models/AccountShell'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { NotificationType } from '../../components/home/NotificationType'
import ModalContainer from '../../components/home/ModalContainer'
export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800


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
  currentBottomSheetKind: BottomSheetKind | null;

  secondaryDeviceOtp: any;
  currencyCode: string;
  selectedContact: any[];
  notificationDataChange: boolean;
  appState: string;
  trustedContactRequest: any;
  recoveryRequest: any;
  custodyRequest: any;
  isLoadContacts: boolean;
  encryptedCloudDataJson: any;
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
  walletName: string;
  UNDER_CUSTODY: any;
  updateFCMTokens: any;
  initializeTrustedContact: any;
  rejectTrustedContact: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  fetchFeeAndExchangeRates: any;
  addTransferDetails: any;
  trustedContacts: TrustedContactsService;
  isFocused: boolean;
  notificationListNew: any;
  notificationsUpdated: any;
  setCurrencyCode: any;
  currencyCode: any;
  setSecondaryDeviceAddress: any;
  regularAccount: RegularAccount;
  database: any;
  accountShells: AccountShell[];
  credsAuthenticated: any;
  updateNotificationList: any;
  messages: any;
  updateMessageStatusInApp: any;
  updateMessageStatus: any;
  fromScreen: string;
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  bottomSheetRef = createRef<BottomSheet>();
  openBottomSheetOnLaunchTimeout: null | ReturnType<typeof setTimeout>;

  static whyDidYouRender = true;

  constructor( props ) {
    super( props )
    this.openBottomSheetOnLaunchTimeout = null

    this.state = {
      notificationData: [],
      CurrencyCode: 'USD',
      netBalance: 0,
      currentBottomSheetKind: null,
      secondaryDeviceOtp: {
      },
      currencyCode: 'USD',
      selectedContact: [],
      notificationDataChange: false,
      appState: '',
      trustedContactRequest: null,
      recoveryRequest: null,
      custodyRequest: null,
      isLoadContacts: false,
      notificationLoading: true,
      encryptedCloudDataJson: [],
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

  navigateToQRScreen = () => {
    this.props.navigation.navigate( 'QRScanner', {
      onCodeScanned: this.processFAndFQR,
    } )
  };

  navigateToAddNewAccountScreen = () => {
    this.props.navigation.navigate( 'AddNewAccount' )
  };

  onPressNotifications = async () => {
    setTimeout( () => {
      this.setState( {
        notificationLoading: false,
      } )
    }, 500 )
    this.notificationCheck()
    this.openBottomSheetOnLaunch( BottomSheetKind.NOTIFICATIONS_LIST )
  };

  processFAndFQR = async ( qrData ) => {
    const { navigation } = this.props
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
            // console.log( 'scannedData', scannedData )
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


  componentDidMount = async() => {
    requestAnimationFrame( () => {
      // This will sync balances and transactions for all account shells
      // Keeping autoSynn disabled

      this.closeBottomSheet()
      // if( this.props.cloudBackupStatus == CloudBackupStatus.FAILED && this.props.levelHealth.length >= 1 && this.props.cloudPermissionGranted === true ) {
      //   this.openBottomSheet( BottomSheetKind.CLOUD_ERROR )
      // }
      this.calculateNetBalance()
      this.setUpFocusListener()
      // this.props.fetchFeeAndExchangeRates( this.props.currencyCode )
    } )
  };

  notificationCheck = () =>{
    const { messages } = this.props
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
        case NotificationType.FNF_REQUEST || NotificationType.FNF_REQUEST_ACCEPTED || NotificationType.FNF_REQUEST_REJECTED || NotificationType.FNF_KEEPER_REQUEST || NotificationType.FNF_KEEPER_REQUEST_ACCEPTED || NotificationType.FNF_KEEPER_REQUEST_REJECTED:
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
            }, () => {
              this.openBottomSheet( BottomSheetKind.NOTIFICATION_INFO )
            } )
          }
          break
    }
  };


  componentDidUpdate = ( prevProps, prevState ) => {
    if (
      this.props.fromScreen === 'Home' &&
      prevProps.accountsState.accountShells !==
      this.props.accountsState.accountShells
    ) {
      this.calculateNetBalance()
      // this.getNewTransactionNotifications()
    }

  };



  cleanupListeners() {

    clearTimeout( this.openBottomSheetOnLaunchTimeout )
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
    // this.notificationCheck()
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

    this.setState(
      {
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

  renderBottomSheetContent() {
    const { custodyRequest } = this.state
    switch ( this.state.currentBottomSheetKind ) {
        case BottomSheetKind.NOTIFICATIONS_LIST:
          const { notificationLoading, notificationData } = this.state
          return (
            <NotificationListContent
              notificationLoading={notificationLoading}
              NotificationData={notificationData}
              onNotificationClicked={this.onNotificationClicked}
              onPressBack={this.closeBottomSheet}
            />
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
    return (
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
          navigateToQRScreen={this.navigateToQRScreen}
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
        <ModalContainer
          visible={this.state.currentBottomSheetKind != null}
          closeBottomSheet={() => {}}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer>
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    notificationList: state.notifications.notifications,
    accountsState: state.accounts,
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    walletName:
      idx( state, ( _ ) => _.storage.wallet.walletName ) || '',
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    notificationListNew: idx( state, ( _ ) => _.notifications.notificationListNew ),
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    levelHealth: idx( state, ( _ ) => _.health.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    messages: state.notifications.messages,

  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    updateFCMTokens,
    initializeTrustedContact,
    rejectTrustedContact,
    fetchFeeAndExchangeRates,
    addTransferDetails,
    notificationsUpdated,
    setCurrencyCode,
    updateNotificationList,
    updateMessageStatusInApp,
    updateMessageStatus
  } )( Home )
)

