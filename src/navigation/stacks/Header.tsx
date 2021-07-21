import React, { createRef, PureComponent } from 'react'
import {
  View,
  Platform,
  Linking,
} from 'react-native'
import {
  heightPercentageToDP,
  // widthPercentageToDP,
} from 'react-native-responsive-screen'
import DeviceInfo from 'react-native-device-info'
import CustodianRequestRejectedModalContents from '../../components/CustodianRequestRejectedModalContents'
import * as RNLocalize from 'react-native-localize'
import { connect } from 'react-redux'
import {
  initializeTrustedContact,
  rejectTrustedContact,
  InitTrustedContactFlowKind,
} from '../../store/actions/trustedContacts'
import {
  updateFCMTokens,
  updateMessageStatusInApp,
  updateMessageStatus
} from '../../store/actions/notifications'
import {
  setCurrencyCode,
} from '../../store/actions/preferences'
import {
  getCurrencyImageByRegion, processDeepLink, processFriendsAndFamilyQR,
} from '../../common/CommonFunctions/index'
import NotificationListContent from '../../components/NotificationListContent'
// import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import HomeHeader from '../../components/home/home-header_update'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import moment from 'moment'
import { withNavigationFocus } from 'react-navigation'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import TrustedContactRequestContent from '../../pages/Home/TrustedContactRequestContent'
import BottomSheet from '@gorhom/bottom-sheet'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import { AccountsState } from '../../store/reducers/accounts'
import AccountShell from '../../common/data/models/AccountShell'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import { NotificationType } from '../../components/home/NotificationType'
import ModalContainer from '../../components/home/ModalContainer'
import { acceptExistingContactRequest } from '../../store/actions/health'
import NotificationInfoContents from '../../components/NotificationInfoContents'
import TrustedContactsOperations from '../../bitcoin/utilities/TrustedContactsOperations'
import Toast from '../../components/Toast'
import { resetToHomeAction } from '../actions/NavigationActions'
export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800

export enum BottomSheetKind {
  CUSTODIAN_REQUEST,
  CUSTODIAN_REQUEST_REJECTED,
  TRUSTED_CONTACT_REQUEST,
  ADD_CONTACT_FROM_ADDRESS_BOOK,
  NOTIFICATIONS_LIST,
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
  notificationDataChange: boolean;
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
  acceptExistingContactRequest: any;
  rejectTrustedContact: any;
  currentLevel: number;
  trustedContacts: TrustedContactsService;
  isFocused: boolean;
  setCurrencyCode: any;
  currencyCode: any;
  setSecondaryDeviceAddress: any;
  regularAccount: RegularAccount;
  accountShells: AccountShell[];
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
      notificationDataChange: false,
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
    setTimeout( () => {
      this.setState( {
        notificationLoading: false,
      } )
    }, 500 )
    this.notificationCheck()
    this.openBottomSheetOnLaunch( BottomSheetKind.NOTIFICATIONS_LIST )
  };

  componentDidMount = async() => {
    requestAnimationFrame( () => {
      // This will sync balances and transactions for all account shells
      // Keeping autoSynn disabled

      this.closeBottomSheet()
      this.calculateNetBalance()
      this.setUpFocusListener()

      // Linking.addEventListener( 'url', this.handleDeepLinkEvent )
      // Linking.getInitialURL().then( this.handleDeepLinking )
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

  cleanupListeners() {
    clearTimeout( this.openBottomSheetOnLaunchTimeout )
    // Linking.removeEventListener( 'url', this.handleDeepLinkEvent )
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

  onNotificationClicked = async ( value ) => {
    if( value.status === 'unread' || value.type === NotificationType.FNF_TRANSACTION )
      this.handleNotificationBottomSheetSelection( value )
  };


  onTrustedContactRequestAccepted = ( key ) => {
    this.closeBottomSheet()
    const { navigation } = this.props
    const { trustedContactRequest } = this.state

    if( !trustedContactRequest.isQR ){
      try{
        trustedContactRequest.channelKey = TrustedContactsOperations.decryptData( key, trustedContactRequest.encryptedencryptedChannelKeys ).data
      } catch( err ){
        Toast( 'Invalid key' )
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

  renderBottomSheetContent() {
    const { custodyRequest, notificationTitle, notificationInfo, notificationNote, notificationAdditionalInfo, notificationProceedText, notificationIgnoreText, isIgnoreButton, notificationLoading, notificationData, releaseNotes } = this.state

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
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    messages: state.notifications.messages,

  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    updateFCMTokens,
    initializeTrustedContact,
    acceptExistingContactRequest,
    rejectTrustedContact,
    setCurrencyCode,
    updateMessageStatusInApp,
    updateMessageStatus
  } )( Home )
)

