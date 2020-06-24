import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
  AsyncStorage,
  Linking,
  NativeModules,
  Alert,
} from 'react-native';
import Fonts from './../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import DeviceInfo from 'react-native-device-info';
import { RFValue } from 'react-native-responsive-fontsize';
import TransparentHeaderModal from '../components/TransparentHeaderModal';
import CustodianRequestRejectedModalContents from '../components/CustodianRequestRejectedModalContents';
import MoreHomePageTabContents from '../components/MoreHomePageTabContents';
import SmallHeaderModal from '../components/SmallHeaderModal';
import AddModalContents from '../components/AddModalContents';
import QrCodeModalContents from '../components/QrCodeModalContents';
import FastBitcoinCalculationModalContents from '../components/FastBitcoinCalculationModalContents';
import AddContactsModalContents from '../components/AddContactsModalContents';
import SelectedContactFromAddressBook from '../components/SelectedContactFromAddressBook';
import SelectedContactFromAddressBookQrCode from '../components/SelectedContactFromAddressBookQrCode';
import CustodianRequestModalContents from '../components/CustodianRequestModalContents';
import { AppState } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../common/constants/serviceTypes';
import AllAccountsContents from '../components/AllAccountsContents';
import SettingsContents from '../components/SettingsContents';
import { connect } from 'react-redux';
import NoInternetModalContents from '../components/NoInternetModalContents';
import NetInfo from '@react-native-community/netinfo';
import {
  downloadMShare,
  initHealthCheck,
  uploadRequestedShare,
} from '../store/actions/sss';
import { createRandomString } from '../common/CommonFunctions/timeFormatter';

import {
  approveTrustedContact,
  fetchEphemeralChannel,
  clearPaymentDetails,
} from '../store/actions/trustedContacts';
import {
  updateFCMTokens,
  fetchNotifications,
} from '../store/actions/notifications';
import { UsNumberFormat } from '../common/utilities';
import { getCurrencyImageByRegion } from '../common/CommonFunctions/index';
import ErrorModalContents from '../components/ErrorModalContents';
import ModalHeader from '../components/ModalHeader';
import TransactionDetails from './Accounts/TransactionDetails';
import Toast from '../components/Toast';
import firebase from 'react-native-firebase';
import NotificationListContent from '../components/NotificationListContent';
import { timeFormatter } from '../common/CommonFunctions/timeFormatter';
import Config from 'react-native-config';
import RelayServices from '../bitcoin/services/RelayService';
import AddContactAddressBook from './Contacts/AddContactAddressBook';
import TrustedContactRequest from './Contacts/TrustedContactRequest';
import config from '../bitcoin/HexaConfig';
import TrustedContactsService from '../bitcoin/services/TrustedContactsService';
import TransactionsContent from '../components/home/transaction-content';
import SaveBitcoinModalContents from './FastBitcoin/SaveBitcoinModalContents';
import HomeList from '../components/home/home-list';
import HomeHeader from '../components/home/home-header';
import idx from 'idx';
import CustomBottomTabs from '../components/home/custom-bottom-tabs';
import { initialCardData } from '../stubs/initialCardData';
import { initialTransactionData } from '../stubs/initialTransactionData';
import {
  fetchDerivativeAccBalTx,
  addTransferDetails,
} from '../store/actions/accounts';
import RegularAccount from '../bitcoin/services/accounts/RegularAccount';
import { TrustedContactDerivativeAccount } from '../bitcoin/utilities/Interface';
import moment from 'moment'


function isEmpty(obj) {
  return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
}

export const isCompatible = async (method: string, version: string) => {
  if (parseFloat(version) > parseFloat(DeviceInfo.getVersion())) {
    // checking compatibility via Relay
    const res = await RelayServices.checkCompatibility(method, version);
    if (res.status !== 200) {
      console.log('Failed to check compatibility');
      return true;
    }

    const { compatible, alternatives } = res.data;
    if (!compatible) {
      if (alternatives) {
        if (alternatives.update)
          Alert.alert('Update your app inorder to process this link/QR');
        else if (alternatives.message) Alert.alert(alternatives.message);
      } else {
        Alert.alert('Incompatible link/QR, updating your app might help');
      }
      return false;
    }
    return true;
  }
  return true;
};

const getIconByAccountType = (type) => {
  if (type == 'saving') {
    return require('../assets/images/icons/icon_regular.png');
  } else if (type == 'regular') {
    return require('../assets/images/icons/icon_regular.png');
  } else if (type == 'secure') {
    return require('../assets/images/icons/icon_secureaccount.png');
  } else if (type == 'test') {
    return require('../assets/images/icons/icon_test.png');
  } else {
    return require('../assets/images/icons/icon_test.png');
  }
};

const TransactionHeader = ({ openCloseModal }) => {
  return (
    <TouchableOpacity
      activeOpacity={10}
      onPress={() => openCloseModal()}
      style={styles.modalHeaderContainer}
    >
      <View style={styles.modalHeaderHandle} />
      <Text style={styles.modalHeaderTitleText}>{'Transactions'}</Text>
    </TouchableOpacity>
  );
};

const TrustedContactRequestContent = ({
  bottomSheetRef,
  trustedContactRequest,
  recoveryRequest,
  onPressAccept,
  onPressReject,
  onPhoneNumberChange,
}) => {
  if (!trustedContactRequest && !recoveryRequest) return;
  let { requester, hintType, hint, isGuardian, isQR, isRecovery } =
    trustedContactRequest || recoveryRequest;

  return (
    <TrustedContactRequest
      isQR={isQR}
      inputType={
        hintType === 'num' ? 'phone' : hintType === 'eml' ? 'email' : null
      }
      isGuardian={isGuardian}
      isRecovery={isRecovery}
      hint={hint}
      bottomSheetRef={bottomSheetRef}
      trustedContactName={requester}
      onPressAccept={(key) => onPressAccept(key)}
      onPressReject={(key) => {
        onPressReject(key);
      }}
      onPhoneNumberChange={(text) => {
        onPhoneNumberChange(text);
      }}
    />
  );
};

interface HomeStateTypes {
  notificationData?: any[];
  cardData?: any[];
  switchOn: boolean;
  CurrencyCode: string;
  balances: any;
  selectedBottomTab: string;
  transactions: any[];
  modalData: any;
  knowMoreBottomSheetsFlag: boolean;
  qrBottomSheetsFlag: boolean;
  addBottomSheetsFlag: boolean;
  tabBarIndex: number;
  addSubBottomSheetsFlag: boolean;
  selectToAdd: string;
  openModal: string;
  atCloseEnd: boolean;
  loading: boolean;
  secondaryDeviceOtp: any;
  selectedTransactionItem: any;
  deepLinkModalOpen: boolean;
  currencyCode: string;
  errorMessageHeader: string;
  errorMessage: string;
  buttonText: string;
  familyAndFriendsBookBottomSheetsFlag: boolean;
  selectedContact: any[];
  notificationDataChange: boolean;
  appState: string;
  fbBTCAccount: any;
  transactionsLoading: boolean;
  trustedContactRequest: any;
  recoveryRequest: any;
  custodyRequest: any;
  isLoadContacts: boolean;
  canNavigate: boolean,
  lastActiveTime: string
  isContactOpen: boolean;
  isCameraOpen: boolean;
}

interface HomePropsTypes {
  navigation: any;
  notificationList: any[];
  exchangeRates: any[];
  accounts: any[];
  walletName: string;
  UNDER_CUSTODY: any;
  fetchNotifications: any;
  updateFCMTokens: any;
  downloadMShare: any;
  approveTrustedContact: any;
  fetchEphemeralChannel: any;
  uploadRequestedShare: any;
  s3Service: any;
  initHealthCheck: any;
  overallHealth: any;
  fetchDerivativeAccBalTx: any;
  addTransferDetails: any;
  paymentDetails: any;
  clearPaymentDetails: any;

}

class HomeUpdated extends Component<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;

  constructor(props) {
    super(props);
    this.focusListener = null;
    this.appStateListener = null;
    this.NoInternetBottomSheet = React.createRef();
    this.unsubscribe = null;
    this.state = {
      notificationData: [],
      cardData: [],
      switchOn: false,
      CurrencyCode: 'USD',
      balances: {},
      qrBottomSheetsFlag: false,
      selectedBottomTab: 'Transactions',
      transactions: [],
      knowMoreBottomSheetsFlag: false,
      modalData: initialTransactionData,
      addBottomSheetsFlag: false,
      tabBarIndex: 999,
      addSubBottomSheetsFlag: false,
      selectToAdd: 'buyBitcoins',
      openModal: 'closed',
      atCloseEnd: false,
      loading: false,
      secondaryDeviceOtp: {},
      selectedTransactionItem: null,
      deepLinkModalOpen: false,
      currencyCode: 'USD',
      errorMessageHeader: '',
      errorMessage: '',
      buttonText: '',
      familyAndFriendsBookBottomSheetsFlag: false,
      selectedContact: [],
      notificationDataChange: false,
      appState: '',
      fbBTCAccount: {},
      transactionsLoading: true,
      trustedContactRequest: null,
      recoveryRequest: null,
      custodyRequest: null,
      isLoadContacts: false,
      canNavigate: false,
      lastActiveTime: moment().toISOString()
      isContactOpen: false,
      isCameraOpen: false
    };
  }

  onPressNotifications = () => {
    (this.refs.notificationsListBottomSheet as any).snapTo(1);
  };

  onSwitchToggle = (switchOn) => {
    this.setState({
      switchOn,
    });
  };

  processQRData = async (qrData) => {
    const { accounts, addTransferDetails, navigation } = this.props;
    const { balances } = this.state;

    const regularService: RegularAccount = accounts[REGULAR_ACCOUNT].service;
    const { type } = regularService.addressDiff(qrData);
    if (type) {
      const serviceType = REGULAR_ACCOUNT; // default service type
      let item;
      switch (type) {
        case 'address':
          const recipientAddress = qrData;
          item = {
            id: recipientAddress,
          };

          addTransferDetails(serviceType, {
            selectedContact: item,
          });
          navigation.navigate('SendToContact', {
            selectedContact: item,
            serviceType,
            netBalance: (balances || {}).regularBalance,
          });
          break;

        case 'paymentURI':
          const { address, options } = regularService.decodePaymentURI(qrData);
          item = {
            id: address,
          };

          addTransferDetails(serviceType, {
            selectedContact: item,
          });

          navigation.navigate('SendToContact', {
            selectedContact: item,
            serviceType,
            netBalance: balances.regularBalance,
            bitcoinAmount: options.amount ? `${options.amount}` : '',
          });
          break;

        default:
          Toast('Invalid QR');
          break;
      }

      return;
    }

    try {
      const scannedData = JSON.parse(qrData);
      if (scannedData.ver) {
        if (!(await isCompatible(scannedData.type, scannedData.ver))) return;
      }
      switch (scannedData.type) {
        case 'trustedGuardian':
          const trustedGruardianRequest = {
            isGuardian: scannedData.isGuardian,
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            uploadedAt: scannedData.uploadedAt,
            type: scannedData.type,
            isQR: true,
          };
          this.setState(
            {
              loading: false,
              secondaryDeviceOtp: trustedGruardianRequest,
              trustedContactRequest: trustedGruardianRequest,
              recoveryRequest: null,
              isLoadContacts: true,
            },
            () => {
              setTimeout(() => {
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
              }, 2);

              if (this.state.tabBarIndex === 999) {
                this.setState({
                  tabBarIndex: 0,
                  deepLinkModalOpen: true,
                });
              }
              setTimeout(() => {
                (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
                (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
              }, 2);
            },
          );

          break;

        case 'secondaryDeviceGuardian':
          const secondaryDeviceGuardianRequest = {
            isGuardian: scannedData.isGuardian,
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            uploadedAt: scannedData.uploadedAt,
            type: scannedData.type,
            isQR: true,
          };

          this.setState(
            {
              loading: false,
              secondaryDeviceOtp: secondaryDeviceGuardianRequest,
              trustedContactRequest: secondaryDeviceGuardianRequest,
            },
            () => {
              // TODO -- figure out why its not closing with out timeout
              setTimeout(() => {
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
              }, 2);

              if (this.state.tabBarIndex === 999) {
                this.setState({
                  tabBarIndex: 0,
                  deepLinkModalOpen: true,
                });
              }
              setTimeout(() => {
                (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
                (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
              }, 2);
            },
          );

          break;

        case 'trustedContactQR':
          const tcRequest = {
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            type: scannedData.type,
            isQR: true,
          };

          this.setState(
            {
              loading: false,
              secondaryDeviceOtp: tcRequest,
              trustedContactRequest: tcRequest,
              recoveryRequest: null,
            },
            () => {
              // TODO -- figure out why its not closing with out timeout
              setTimeout(() => {
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
              }, 2);

              if (this.state.tabBarIndex === 999) {
                this.setState({
                  tabBarIndex: 0,
                  deepLinkModalOpen: true,
                });
              }
              setTimeout(() => {
                (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
                (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
              }, 2);
            },
          );

          break;

        case 'paymentTrustedContactQR':
          const paymentTCRequest = {
            isPaymentRequest: true,
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            type: scannedData.type,
            isQR: true,
          };

          this.setState(
            {
              loading: false,
              secondaryDeviceOtp: paymentTCRequest,
              trustedContactRequest: paymentTCRequest,
              recoveryRequest: null,
            },
            () => {
              // TODO -- figure out why its not closing with out timeout
              setTimeout(() => {
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
              }, 2);

              if (this.state.tabBarIndex === 999) {
                this.setState({
                  tabBarIndex: 0,
                  deepLinkModalOpen: true,
                });
              }
              setTimeout(() => {
                (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
                (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
              }, 2);
            },
          );

          break;

        case 'recoveryQR':
          const recoveryRequest = {
            isRecovery: true,
            requester: scannedData.requester,
            publicKey: scannedData.KEY,
            isQR: true,
          };
          this.setState(
            {
              loading: false,
              recoveryRequest: recoveryRequest,
            },
            () => {
              setTimeout(() => {
                (this.refs.qrTabBarBottomSheet as any).snapTo(0);
              }, 2);

              if (this.state.tabBarIndex === 999) {
                this.setState({
                  tabBarIndex: 0,
                  deepLinkModalOpen: true,
                });
              }
              setTimeout(() => {
                (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
                (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
              }, 2);
            },
          );
          break;

        case 'ReverseRecoveryQR':
          Alert.alert(
            'Restoration QR Identified',
            'Restoration QR only works during restoration mode',
          );
          break;

        default:
          break;
      }
    } catch (err) {
      Toast('Invalid QR');
    }
  };

  updateAccountCardData = () => {
    let newArrayFinal = [];
    let tempArray = [];
    for (let a = 0; a < initialCardData.length; a++) {
      tempArray.push(initialCardData[a]);
      if (
        tempArray.length == 2 ||
        initialCardData[initialCardData.length - 1].id == tempArray[0].id
      ) {
        newArrayFinal.push(tempArray);
        tempArray = [];
      }
    }
    if (newArrayFinal) {
      this.setState({
        cardData: newArrayFinal,
      });
    }
  };

  scheduleNotification = async () => {
    const notification = new firebase.notifications.Notification()
      .setTitle('We have not seen you in a while!')
      .setBody(
        'Opening your app regularly ensures you get all the notifications and security updates',
      )
      .setNotificationId('1')
      .setSound('default')
      .setData({
        title: 'We have not seen you in a while!',
        body:
          'Opening your app regularly ensures you get all the notifications and security updates',
      })
      .android.setChannelId('reminder')
      .android.setPriority(firebase.notifications.Android.Priority.High);

    // Schedule the notification for 2hours on development and 2 weeks on Production in the future
    const date = new Date();
    date.setHours(date.getHours() + Number(Config.NOTIFICATION_HOUR));

    // //console.log('DATE', date, Config.NOTIFICATION_HOUR, date.getTime());
    await firebase
      .notifications()
      .scheduleNotification(notification, {
        fireDate: date.getTime(),
        //repeatInterval: 'hour',
      })
      .then(() => { })
      .catch(
        (err) => { }, //console.log('err', err)
      );
    firebase
      .notifications()
      .getScheduledNotifications()
      .then((notifications) => {
        //console.log('logging notifications', notifications);
      });
  };

  onAppStateChange = async (nextAppState) => {
    console.log("NEXTAPPSTATE", nextAppState)
    this.handleAppStateChange(nextAppState);
    const { appState } = this.state;
    try {
      if (appState === nextAppState) return;
      this.setState(
        {
          appState: nextAppState,
        },
        async () => {
          if (nextAppState === 'active') {
            this.scheduleNotification();
          }
          if (nextAppState === 'inactive' || nextAppState == 'background') {
            await AsyncStorage.setItem(
              'isInternetModalCome',
              JSON.stringify(false),
            );
          }

        },
      );
    } catch (error) { }
  };

  componentDidMount = () => {
    this.updateAccountCardData();
    this.getBalances();
    this.appStateListener = AppState.addEventListener(
      'change',
      this.onAppStateChange,
    );
    this.bootStrapNotifications();
    this.setUpFocusListener();
    this.getNewTransactionNotifications();
    Linking.addEventListener('url', this.handleDeepLink);
    setTimeout(() => {
      this.setState({
        transactionsLoading: false,
      });
    }, 1000);

    this.unsubscribe = NetInfo.addEventListener((state) => {
      setTimeout(() => {
        if (state.isInternetReachable === null) {
          return;
        }

        if (state.isInternetReachable) {
          (this.NoInternetBottomSheet as any).current.snapTo(0);
        } else {
          (this.NoInternetBottomSheet as any).current.snapTo(1);
        }
      }, 1000);
    });

    // health check

    const { s3Service, initHealthCheck } = this.props;
    const { healthCheckInitialized } = s3Service.sss;
    if (!healthCheckInitialized) {
      initHealthCheck();
    }

    this.handleDeeplinkModal();
  };

  getNewTransactionNotifications = async () => {
    let newTransactions = [];
    const derivativeAccountType = 'FAST_BITCOINS';
    const { accounts, fetchDerivativeAccBalTx } = this.props;
    const regularAccount = accounts[REGULAR_ACCOUNT].service.hdWallet;
    const secureAccount = accounts[SECURE_ACCOUNT].service.secureHDWallet;
    if (
      secureAccount.derivativeAccounts[derivativeAccountType][1] &&
      secureAccount.derivativeAccounts[derivativeAccountType][1].xpub
    )
      fetchDerivativeAccBalTx(SECURE_ACCOUNT, derivativeAccountType);

    if (
      regularAccount.derivativeAccounts[derivativeAccountType][1] &&
      regularAccount.derivativeAccounts[derivativeAccountType][1].xpub
    )
      fetchDerivativeAccBalTx(REGULAR_ACCOUNT, derivativeAccountType);

    let newTransactionsRegular =
      regularAccount.derivativeAccounts[derivativeAccountType][1] &&
      regularAccount.derivativeAccounts[derivativeAccountType][1]
        .newTransactions;
    let newTransactionsSecure =
      secureAccount.derivativeAccounts[derivativeAccountType][1] &&
      secureAccount.derivativeAccounts[derivativeAccountType][1]
        .newTransactions;

    if (
      newTransactionsRegular &&
      newTransactionsRegular.length &&
      newTransactionsSecure &&
      newTransactionsSecure.length
    ) {
      newTransactions = [...newTransactionsRegular, ...newTransactionsSecure];
    } else if (newTransactionsRegular && newTransactionsRegular.length)
      newTransactions = [...newTransactionsRegular];
    else if (newTransactionsSecure && newTransactionsSecure.length)
      newTransactions = [...newTransactionsSecure];

    //console.log('newTransactions', newTransactions);

    if (newTransactions.length) {
      let asyncNotification = JSON.parse(
        await AsyncStorage.getItem('notificationList'),
      );
      let asyncNotificationList = [];
      if (asyncNotification.length) {
        asyncNotificationList = [];
        for (let i = 0; i < asyncNotification.length; i++) {
          asyncNotificationList.push(asyncNotification[i]);
        }
      }
      let tmpList = asyncNotificationList;
      let obj = {
        type: 'contact',
        isMandatory: false,
        read: false,
        title: 'New FastBitcoin Transactions',
        time: timeFormatter(moment(new Date()), moment(new Date()).valueOf()),
        date: new Date(),
        info: newTransactions.length + ' New FBTC transactions',
        notificationId: createRandomString(17),
      };
      tmpList.push(obj);

      await AsyncStorage.setItem('notificationList', JSON.stringify(tmpList));
      let notificationDetails = {
        id: obj.notificationId,
        title: obj.title,
        body: obj.info,
      };
      this.localNotification(notificationDetails);
      tmpList.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
      setTimeout(() => {
        this.setState({
          notificationData: tmpList,
          notificationDataChange: !this.state.notificationDataChange,
        });
      }, 2);
    }
  };

  localNotification = async (notificationDetails) => {
    const notification = new firebase.notifications.Notification()
      .setTitle(notificationDetails.title)
      .setBody(notificationDetails.body)
      .setNotificationId(notificationDetails.id)
      .setSound('default')
      .setData({
        title: notificationDetails.title,
        body: notificationDetails.body,
      })
      .android.setChannelId('reminder')
      .android.setPriority(firebase.notifications.Android.Priority.High);
    // Schedule the notification for 2hours on development and 2 weeks on Production in the future
    const date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    await firebase
      .notifications()
      .scheduleNotification(notification, {
        fireDate: date.getTime(),
      })
      .then(() => { })
      .catch((err) => { });
    firebase
      .notifications()
      .getScheduledNotifications()
      .then((notifications) => { });
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.notificationList !== this.props.notificationList) {
      this.setupNotificationList();
    }

    if (this.props.paymentDetails !== null && this.props.paymentDetails) {
      const serviceType = REGULAR_ACCOUNT;
      const {
        paymentDetails,
        accounts,
        navigation,
        clearPaymentDetails,
      } = this.props;
      const { balances } = this.state;
      let { address, paymentURI } = paymentDetails;
      let options: any = {};
      if (paymentURI) {
        const details = accounts[serviceType].service.decodePaymentURI(
          paymentURI,
        );
        address = details.address;
        options = details.options;
      }

      const item = {
        id: address,
      };

      addTransferDetails(serviceType, {
        selectedContact: item,
      });

      clearPaymentDetails();

      navigation.navigate('SendToContact', {
        selectedContact: item,
        serviceType,
        netBalance: balances.regularBalance,
        bitcoinAmount: options.amount ? `${options.amount}` : '',
      });
    }
  };

  handleDeeplinkModal = () => {
    const custodyRequest = this.props.navigation.getParam('custodyRequest');
    const recoveryRequest = this.props.navigation.getParam('recoveryRequest');
    const trustedContactRequest = this.props.navigation.getParam(
      'trustedContactRequest',
    );
    const userKey = this.props.navigation.getParam('userKey');

    if (custodyRequest) {
      this.setState(
        {
          custodyRequest,
        },
        () => {
          if (this.state.tabBarIndex === 999) {
            this.setState({
              tabBarIndex: 0,
              deepLinkModalOpen: true,
            });
          }

          setTimeout(() => {
            if (this.refs.allAccountsBottomSheet) {
              (this.refs.allAccountsBottomSheet as any).snapTo(0);
              (this.refs.settingsBottomSheet as any).snapTo(0);
            }

            (this.refs.custodianRequestBottomSheet as any).snapTo(1);
            (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
          }, 2);
        },
      );
      return;
    }

    if (recoveryRequest || trustedContactRequest) {
      this.setState(
        {
          recoveryRequest,
          trustedContactRequest,
        },
        () => {
          if (this.state.tabBarIndex === 999) {
            this.setState({
              tabBarIndex: 0,
              deepLinkModalOpen: true,
            });
          }

          (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
          (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
        },
      );

      return;
    }

    if (userKey) {
      this.props.navigation.navigate('VoucherScanner', { userKey });
      return;
    }

    return;
  };

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.appStateListener) {
      this.appStateListener();
    }
    if (this.firebaseNotificationListener) {
      this.firebaseNotificationListener();
    }
    if (this.notificationOpenedListener) {
      this.notificationOpenedListener();
    }
  }

  handleAppStateChange = async (nextAppState) => {
    let limit = 15000
    const { canNavigate, isContactOpen, isCameraOpen } = this.state
    let response = await AsyncStorage.multiGet([
      'isContactOpen',
      'isCameraOpen',
    ]);
    this.setState(JSON.parse(response[0][1]));
    this.setState(JSON.parse(response[1][1]));
    let keyArray = [
      ['isCameraOpen', JSON.stringify(true)],
      ['isContactOpen', JSON.stringify(true)],
    ];
    if (isCameraOpen) keyArray[0][1] = JSON.stringify(false);
    if (isContactOpen) keyArray[1][1] = JSON.stringify(false);
    if (isContactOpen || isCameraOpen) {
      AsyncStorage.multiSet(keyArray, () => { });
      return;
    }

    if (
      Platform.OS == 'android'
        ? nextAppState == 'active'
        : nextAppState == 'inactive' || nextAppState == 'background'
    ) {
      this.setState({ lastActiveTime: moment().toISOString() })

    } else {
      let diff = moment().diff(moment(this.state.lastActiveTime))
      if (diff >= limit) {
        this.setState({
          lastActiveTime: moment().toISOString()
        }, () => {
          this.props.navigation.navigate('ReLogin');
        })

      } else {
        this.setState({
          lastActiveTime: moment().toISOString()
        })
        return
      }
    }
  };

  handleDeepLink = async (event) => {
    const { navigation } = this.props;
    const splits = event.url.split('/');

    if (splits[5] === 'sss') {
      const requester = splits[4];
      if (splits[6] === 'ek') {
        const custodyRequest = {
          requester,
          ek: splits[7],
          uploadedAt: splits[8],
        };
        this.setState(
          {
            custodyRequest,
          },
          () => {
            if (this.state.tabBarIndex === 999) {
              this.setState({
                tabBarIndex: 0,
                deepLinkModalOpen: true,
              });
            }
            setTimeout(() => {
              (this.refs.allAccountsBottomSheet as any)
                .snapTo(0)(this.refs.settingsBottomSheet as any)
                .snapTo(0)(this.refs.custodianRequestBottomSheet as any)
                .snapTo(1)(this.refs.transactionTabBarBottomSheet as any)
                .snapTo(1);
            }, 2);
          },
        );
        // navigation.navigate('Home', { custodyRequest });
      } else if (splits[6] === 'rk') {
        const recoveryRequest = { requester, rk: splits[7] };
        this.setState(
          {
            recoveryRequest,
            trustedContactRequest: null,
          },
          () => {
            if (this.state.tabBarIndex === 999) {
              this.setState({
                tabBarIndex: 0,
                deepLinkModalOpen: true,
              });
            }
            setTimeout(() => {
              (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
              (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
            }, 2);
          },
        );
      }
    } else if (
      splits[4] === 'tc' ||
      splits[4] === 'tcg' ||
      splits[4] === 'ptc'
    ) {
      if (splits[3] !== config.APP_STAGE) {
        Alert.alert(
          'Invalid deeplink',
          `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
          splits[3]
          }`,
        );
      } else {
        const version = splits.pop().slice(1);
        if (version) {
          if (!(await isCompatible(splits[4], version))) return;
        }

        const trustedContactRequest = {
          isGuardian: splits[4] === 'tcg' ? true : false,
          isPaymentRequest: splits[4] === 'ptc' ? true : false,
          requester: splits[5],
          encryptedKey: splits[6],
          hintType: splits[7],
          hint: splits[8],
          uploadedAt: splits[9],
        };

        this.setState(
          {
            trustedContactRequest,
            recoveryRequest: null,
          },
          () => {
            if (this.state.tabBarIndex === 999) {
              this.setState({
                tabBarIndex: 0,
                deepLinkModalOpen: true,
              });
            }
            setTimeout(() => {
              (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
              (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
            }, 2);
          },
        );
      }
    } else if (splits[4] === 'rk') {
      const recoveryRequest = {
        isRecovery: true,
        requester: splits[5],
        encryptedKey: splits[6],
        hintType: splits[7],
        hint: splits[8],
      };
      this.setState(
        {
          recoveryRequest,
          trustedContactRequest: null,
        },
        () => {
          if (this.state.tabBarIndex === 999) {
            this.setState({
              tabBarIndex: 0,
              deepLinkModalOpen: true,
            });
          }
          setTimeout(() => {
            (this.refs.trustedContactRequestBottomSheet as any).snapTo(1);
            (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
          }, 2);
        },
      );
    } else if (splits[4] === 'rrk') {
      Alert.alert(
        'Restoration link Identified',
        'Restoration links only works during restoration mode',
      );
    }

    if (event.url.includes('fastbitcoins')) {
      const userKey = event.url.substr(event.url.lastIndexOf('/') + 1);
      navigation.navigate('VoucherScanner', { userKey });
    }
  };

  setUpFocusListener = () => {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.setCurrencyCodeFromAsync();
      this.getAssociatedContact();
      this.checkFastBitcoin();
      this.getBalances();
      this.props.fetchNotifications();
      this.getNewTransactionNotifications();
      this.setState({
        lastActiveTime: moment().toISOString()
      })
    });


    setTimeout(() => {
      (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
      (this.refs.addTabBarBottomSheet as any).snapTo(0);
      (this.refs.qrTabBarBottomSheet as any).snapTo(0);
      (this.refs.moreTabBarBottomSheet as any).snapTo(0);
    }, 500);

    this.getAssociatedContact();
    this.setCurrencyCodeFromAsync();
    this.checkFastBitcoin();
  };

  checkFastBitcoin = async () => {
    let getFBTCAccount =
      JSON.parse(await AsyncStorage.getItem('FBTCAccount')) || {};
    this.setState({ fbBTCAccount: getFBTCAccount });
    return;
  };

  setSecondaryDeviceAddresses = async () => {
    let secondaryDeviceOtpTemp = JSON.parse(
      await AsyncStorage.getItem('secondaryDeviceAddress'),
    );
    if (!secondaryDeviceOtpTemp) {
      secondaryDeviceOtpTemp = [];
    }
    if (
      secondaryDeviceOtpTemp.findIndex(
        (value) => value.otp == (this.state.secondaryDeviceOtp as any).otp,
      ) == -1
    ) {
      secondaryDeviceOtpTemp.push(this.state.secondaryDeviceOtp);
      await AsyncStorage.setItem(
        'secondaryDeviceAddress',
        JSON.stringify(secondaryDeviceOtpTemp),
      );
    }
  };

  getAssociatedContact = async () => {
    let SelectedContacts = JSON.parse(
      await AsyncStorage.getItem('SelectedContacts'),
    );

    // TODO -- need to check this
    let AssociatedContact = JSON.parse(
      await AsyncStorage.getItem('AssociatedContacts'),
    );
    // setAssociatedContact(AssociatedContact);
    let SecondaryDeviceAddress = JSON.parse(
      await AsyncStorage.getItem('secondaryDeviceAddress'),
    );
    this.setSecondaryDeviceAddresses();
    this.setState({
      selectedContact: SelectedContacts,
    });
  };

  setCurrencyCodeFromAsync = async () => {
    let currencyCodeTmp = await AsyncStorage.getItem('currencyCode');
    if (!currencyCodeTmp) {
      await AsyncStorage.setItem('currencyCode', RNLocalize.getCurrencies()[0]);
      this.setState({
        currencyCode: RNLocalize.getCurrencies()[0],
      });
    } else {
      this.setState({
        currencyCode: currencyCodeTmp,
      });
    }
    let currencyToggleValueTmp = await AsyncStorage.getItem(
      'currencyToggleValue',
    );

    this.setState({
      switchOn: currencyToggleValueTmp ? true : false,
    });
  };

  bootStrapNotifications = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (!enabled) {
      await firebase
        .messaging()
        .requestPermission()
        .then(() => {
          // User has authorized
          this.createNotificationListeners();
          this.storeFCMToken();
          this.scheduleNotification();
        })
        .catch((error) => {
          // User has rejected permissions
          //console.log(
          // 'PERMISSION REQUEST :: notification permission rejected',
          //  error,
          //);
        });
    } else {
      this.createNotificationListeners();
      this.storeFCMToken();
      this.scheduleNotification();
    }
  };

  storeFCMToken = async () => {
    const fcmToken = await firebase.messaging().getToken();
    let fcmArray = [fcmToken];
    let fcmTokenFromAsync = await AsyncStorage.getItem('fcmToken');
    if (fcmTokenFromAsync != fcmToken && fcmTokenFromAsync) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      this.props.updateFCMTokens(fcmArray);
    } else if (!fcmTokenFromAsync) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      this.props.updateFCMTokens(fcmArray);
    }
  };

  onNotificationArrives = async (notification) => {
    this.props.fetchNotifications();
    const { title, body } = notification;
    const deviceTrayNotification = new firebase.notifications.Notification()
      .setTitle(title)
      .setBody(body)
      .setNotificationId(notification.notificationId)
      .setSound('default')
      .android.setPriority(firebase.notifications.Android.Priority.High)
      .android.setChannelId(
        notification.android.channelId
          ? notification.android.channelId
          : 'foregroundNotification',
      ) // previously created
      .android.setAutoCancel(true); // To remove notification when tapped on it

    const channelId = new firebase.notifications.Android.Channel(
      notification.android.channelId,
      notification.android.channelId ? 'Reminder' : 'ForegroundNotification',
      firebase.notifications.Android.Importance.High,
    );
    firebase.notifications().android.createChannel(channelId);
    firebase.notifications().displayNotification(deviceTrayNotification);
  };

  createNotificationListeners = async () => {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.firebaseNotificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        this.onNotificationArrives(notification);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(async (notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        this.props.fetchNotifications();
        this.onNotificationOpen(notificationOpen.notification);
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;

      this.props.fetchNotifications();
      this.onNotificationOpen(notificationOpen.notification);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    firebase.messaging().onMessage((message) => {
      //process data message
    });
  };

  onNotificationOpen = async (item) => {
    let content = JSON.parse(item._data.content);
    let asyncNotificationList = JSON.parse(
      await AsyncStorage.getItem('notificationList'),
    );
    if (!asyncNotificationList) {
      asyncNotificationList = [];
    }
    let readStatus = true;
    if (content.notificationType == 'release') {
      let releaseCases = JSON.parse(await AsyncStorage.getItem('releaseCases'));
      if (releaseCases.ignoreClick) {
        readStatus = true;
      } else if (releaseCases.remindMeLaterClick) {
        readStatus = false;
      } else {
        readStatus = false;
      }
    }
    let obj = {
      type: content.notificationType,
      isMandatory: false,
      read: readStatus,
      title: item.title,
      time: timeFormatter(moment(new Date()), moment(new Date()).valueOf()),
      date: new Date(),
      info: item.body,
      notificationId: content.notificationId,
    };
    asyncNotificationList.push(obj);
    await AsyncStorage.setItem(
      'notificationList',
      JSON.stringify(asyncNotificationList),
    );
    asyncNotificationList.sort(function (left, right) {
      return moment.utc(right.date).unix() - moment.utc(left.date).unix();
    });
    this.setState({
      notificationData: asyncNotificationList,
      notificationDataChange: !this.state.notificationDataChange,
    });
  };

  getBalances = () => {
    const { accounts } = this.props;

    const testBalance = accounts[TEST_ACCOUNT].service
      ? accounts[TEST_ACCOUNT].service.hdWallet.balances.balance +
      accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;

    const testTransactions = accounts[TEST_ACCOUNT].service
      ? accounts[TEST_ACCOUNT].service.hdWallet.transactions.transactionDetails
      : [];

    let regularBalance = accounts[REGULAR_ACCOUNT].service
      ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
      accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;

    let regularTransactions = accounts[REGULAR_ACCOUNT].service
      ? accounts[REGULAR_ACCOUNT].service.hdWallet.transactions
        .transactionDetails
      : [];

    const trustedAccounts: TrustedContactDerivativeAccount =
      accounts[REGULAR_ACCOUNT].service.hdWallet.derivativeAccounts[
      TRUSTED_CONTACTS
      ];
    if (trustedAccounts.instance.using) {
      for (
        let accountNumber = 1;
        accountNumber <= trustedAccounts.instance.using;
        accountNumber++
      ) {
        // console.log({
        //   accountNumber,
        //   balances: trustedAccounts[accountNumber].balances,
        //   transactions: trustedAccounts[accountNumber].transactions,
        // });
        if (trustedAccounts[accountNumber].balances) {
          regularBalance +=
            trustedAccounts[accountNumber].balances.balance +
            trustedAccounts[accountNumber].balances.unconfirmedBalance;
        }

        if (trustedAccounts[accountNumber].transactions) {
          trustedAccounts[
            accountNumber
          ].transactions.transactionDetails.forEach((tx) => {
            let include = true;
            for (const currentTx of regularTransactions) {
              if (tx.txid === currentTx.txid) {
                include = false;
                break;
              }
            }
            if (include) regularTransactions.push(tx);
          });
        }
      }
    }

    const secureBalance = accounts[SECURE_ACCOUNT].service
      ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
      accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
        .unconfirmedBalance
      : 0;

    const secureTransactions = accounts[SECURE_ACCOUNT].service
      ? accounts[SECURE_ACCOUNT].service.secureHDWallet.transactions
        .transactionDetails
      : [];

    const accumulativeBalance = regularBalance + secureBalance;

    const accumulativeTransactions = [
      ...testTransactions,
      ...regularTransactions,
      ...secureTransactions,
    ];
    if (accumulativeTransactions.length) {
      accumulativeTransactions.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
    }

    this.setState({
      balances: {
        testBalance,
        regularBalance,
        secureBalance,
        accumulativeBalance,
      },
      transactions: accumulativeTransactions,
    });

    // if (balancesParam) {
    //   if (
    //     JSON.stringify(balancesParam) !==
    //     JSON.stringify({
    //       testBalance,
    //       regularBalance,
    //       secureBalance,
    //       accumulativeBalance,
    //     })
    //   ) {
    //     setBalances({
    //       testBalance,
    //       regularBalance,
    //       secureBalance,
    //       accumulativeBalance,
    //     });
    //     setTransactions(accumulativeTransactions);
    //   }
    // } else {
    //   setBalances({
    //     testBalance,
    //     regularBalance,
    //     secureBalance,
    //     accumulativeBalance,
    //   });
    //   setTransactions(accumulativeTransactions);
    // }
  };

  onPressSettingsElements = async (type, currencycode) => {
    const { navigation } = this.props;
    if (type == 'ManagePin') {
      return navigation.navigate('SettingManagePin', {
        managePinSuccessProceed: (pin) => this.managePinSuccessProceed(pin),
      });
    } else if (type == 'ChangeCurrency') {
      let currency = await AsyncStorage.getItem('currencyCode');
      navigation.navigate('ChangeCurrency');
      this.setState({
        currencyCode: currency,
      });
    } else if (type == 'ChangeWalletName') {
      navigation.navigate('SettingWalletNameChange');
    }
  };

  managePinSuccessProceed = (pin) => {
    this.setState(
      {
        tabBarIndex: 999,
      },
      () => {
        (this.refs.settingsBottomSheet as any).snapTo(0);
      },
    );
  };

  onNotificationListOpen = async () => {
    let asyncNotificationList = JSON.parse(
      await AsyncStorage.getItem('notificationList'),
    );
    if (asyncNotificationList) {
      for (let i = 0; i < asyncNotificationList.length; i++) {
        if (asyncNotificationList[i]) {
          asyncNotificationList[i].time = timeFormatter(
            moment(new Date()),
            moment(asyncNotificationList[i].date).valueOf(),
          );
        }
      }
      await AsyncStorage.setItem(
        'notificationList',
        JSON.stringify(asyncNotificationList),
      );
      asyncNotificationList.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });

      this.setState({
        notificationData: asyncNotificationList,
        notificationDataChange: !this.state.notificationDataChange,
      });
    }
  };

  onPressSaveBitcoinElements = (type) => {
    const { navigation } = this.props;
    if (type == 'voucher') {
      navigation.navigate('VoucherScanner');
    } else if (type == 'existingBuyingMethods') {
      navigation.navigate('ExistingSavingMethods');
    }
  };

  onTrustedContactRequestAccept = (key) => {
    this.setState({
      tabBarIndex: 999,
      deepLinkModalOpen: false,
    });
    setTimeout(() => {
      (this.refs.trustedContactRequestBottomSheet as any).snapTo(0);
    }, 1);
    this.processDLRequest(key, false);
  };

  onTrustedContactRejct = (key) => {
    setTimeout(() => {
      this.setState({
        tabBarIndex: 999,
        deepLinkModalOpen: false,
      });
    }, 2);
    (this.refs.trustedContactRequestBottomSheet as any).snapTo(0);
    this.processDLRequest(key, true);
  };

  onPhoneNumberChange = () => { };

  selectTab = (tabTitle) => {
    if (tabTitle == 'More') {
      this.setState(
        {
          knowMoreBottomSheetsFlag: true,
          selectedBottomTab: tabTitle,
        },
        () => {
          (this.refs.transactionTabBarBottomSheet as any).snapTo(0);
          (this.refs.addTabBarBottomSheet as any).snapTo(0);
          (this.refs.qrTabBarBottomSheet as any).snapTo(0);
          (this.refs.moreTabBarBottomSheet as any).snapTo(2);
        },
      );
      return;
    }
    if (tabTitle == 'Transactions') {
      this.setState(
        {
          modalData: initialTransactionData,
          selectedBottomTab: tabTitle,
        },
        () => {
          (this.refs.transactionTabBarBottomSheet as any).snapTo(2);
          (this.refs.addTabBarBottomSheet as any).snapTo(0);
          (this.refs.qrTabBarBottomSheet as any).snapTo(0);
          (this.refs.moreTabBarBottomSheet as any).snapTo(0);
        },
      );
      return;
    }
    if (tabTitle == 'Add') {
      this.setState(
        {
          addBottomSheetsFlag: true,
          modalData: [],
          selectedBottomTab: tabTitle,
        },
        () => {
          (this.refs.transactionTabBarBottomSheet as any).snapTo(0);
          (this.refs.addTabBarBottomSheet as any).snapTo(2);
          (this.refs.qrTabBarBottomSheet as any).snapTo(0);
          (this.refs.moreTabBarBottomSheet as any).snapTo(0);
        },
      );
      return;
    }
    if (tabTitle == 'QR') {
      this.setState(
        {
          modalData: initialTransactionData,
          selectedBottomTab: tabTitle,
        },
        () => {
          (this.refs.transactionTabBarBottomSheet as any).snapTo(0);
          (this.refs.addTabBarBottomSheet as any).snapTo(0);
          (this.refs.qrTabBarBottomSheet as any).snapTo(2);
          (this.refs.moreTabBarBottomSheet as any).snapTo(0);
        },
      );
      return;
    }
  };

  processDLRequest = (key, rejected) => {
    const { trustedContactRequest, recoveryRequest } = this.state;
    let {
      requester,
      isGuardian,
      encryptedKey,
      publicKey,
      isQR,
      uploadedAt,
      isRecovery,
    } = trustedContactRequest || recoveryRequest;
    const {
      UNDER_CUSTODY,
      uploadRequestedShare,
      navigation,
      approveTrustedContact,
      fetchEphemeralChannel,
      walletName,
    } = this.props;

    if (!isRecovery) {
      if (requester === walletName) {
        Toast('Cannot be your own Trusted Contact/Guardian');
        return;
      }
      if (uploadedAt && Date.now() - uploadedAt > config.TC_REQUEST_EXPIRY) {
        Alert.alert(
          `${isQR ? 'QR' : 'Link'} expired!`,
          `Please ask the sender to initiate a new ${isQR ? 'QR' : 'Link'}`,
        );
        this.setState({
          loading: false,
        });
      } else {
        if (isGuardian && UNDER_CUSTODY[requester]) {
          Alert.alert(
            'Failed to store',
            'You cannot custody multiple shares of the same user.',
          );
          this.setState({
            loading: false,
          });
        } else {
          if (!publicKey) {
            try {
              publicKey = TrustedContactsService.decryptPub(encryptedKey, key)
                .decryptedPub;
            } catch (err) {
              //console.log({ err });
              Alert.alert(
                'Invalid Number/Email',
                'Decryption failed due to invalid input, try again.',
              );
            }
          }
          if (publicKey && !rejected) {
            navigation.navigate('ContactsListForAssociateContact', {
              postAssociation: (contact) => {
                const contactName = `${contact.firstName} ${
                  contact.lastName ? contact.lastName : ''
                  }`.toLowerCase();
                if (isGuardian) {
                  approveTrustedContact(
                    contactName,
                    publicKey,
                    true,
                    requester,
                  );
                } else {
                  approveTrustedContact(contactName, publicKey, true);
                }
              },
              isGuardian,
            });
          } else if (publicKey && rejected) {
            // don't assoicate; only fetch the payment details from EC
            fetchEphemeralChannel(null, null, publicKey);
          }
        }
      }
    } else {
      if (requester === walletName) {
        Toast('You do not host any share of your own');
        return;
      }

      if (!UNDER_CUSTODY[requester]) {
        Alert.alert(
          'Failed to send!',
          'You do not host any share for this user',
        );

        this.setState({
          loading: false,
        });
      } else {
        if (!publicKey) {
          try {
            publicKey = TrustedContactsService.decryptPub(encryptedKey, key)
              .decryptedPub;
          } catch (err) {
            console.log({ err });
            Alert.alert(
              'Invalid Number/Email',
              'Decryption failed due to invalid input, try again.',
            );
          }
        }
        if (publicKey) {
          uploadRequestedShare(recoveryRequest.requester, publicKey);
        }
      }
    }
  };

  openCloseModal = () => {
    const { openModal, selectedBottomTab } = this.state;
    if (openModal === 'closed') {
      this.setState(
        {
          openModal: 'half',
        },
        () => {
          if (selectedBottomTab === 'Transactions') {
            (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
          }
        },
      );
    }
    if (openModal === 'half') {
      this.setState(
        {
          openModal: 'full',
        },
        () => {
          if (selectedBottomTab === 'Transactions') {
            (this.refs.transactionTabBarBottomSheet as any).snapTo(2);
          }
        },
      );
    }
    if (openModal === 'full') {
      this.setState(
        {
          openModal: 'closed',
        },
        () => {
          if (selectedBottomTab === 'Transactions') {
            (this.refs.transactionTabBarBottomSheet as any).snapTo(0);
          }
        },
      );
    }
  };

  onNotificationClicked = async (value) => {
    let asyncNotifications = JSON.parse(
      await AsyncStorage.getItem('notificationList'),
    );
    const { notificationData } = this.state;
    const { navigation } = this.props;
    let tempNotificationData = notificationData;
    for (let i = 0; i < tempNotificationData.length; i++) {
      const element = tempNotificationData[i];
      if (element.notificationId == value.notificationId) {
        if (
          asyncNotifications &&
          asyncNotifications.length &&
          asyncNotifications.findIndex(
            (item) => item.notificationId == value.notificationId,
          ) > -1
        ) {
          asyncNotifications[
            asyncNotifications.findIndex(
              (item) => item.notificationId == value.notificationId,
            )
          ].read = true;
        }
        tempNotificationData[i].read = true;
      }
    }
    await AsyncStorage.setItem(
      'notificationList',
      JSON.stringify(asyncNotifications),
    );

    this.setState({
      notificationData: tempNotificationData,
      notificationDataChange: !this.state.notificationDataChange,
    });

    if (value.type == 'release') {
      RelayServices.fetchReleases(value.info.split(' ')[1])
        .then(async (res) => {
          if (res.data.releases.length) {
            let releaseNotes = res.data.releases.length
              ? res.data.releases.find((el) => {
                return el.build === value.info.split(' ')[1];
              })
              : '';
            navigation.navigate('UpdateApp', {
              releaseData: [releaseNotes],
              isOpenFromNotificationList: true,
              releaseNumber: value.info.split(' ')[1],
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  onPressElement = (item) => {
    const { navigation } = this.props;
    if (item.title == 'Backup Health') {
      navigation.navigate('ManageBackup');
      return;
    }
    if (item.title == 'Friends and Family') {
      navigation.navigate('AddressBookContents');
      return;
    } else if (item.title == 'Wallet Settings') {
      (this.refs.settingsBottomSheet as any).snapTo(1);
      setTimeout(() => {
        this.setState({
          tabBarIndex: 0,
        });
      }, 10);
    } else if (item.title == 'Funding Sources') {
      navigation.navigate('ExistingSavingMethods');
    }
  };

  setupNotificationList = async () => {
    let asyncNotification = JSON.parse(
      await AsyncStorage.getItem('notificationList'),
    );
    let asyncNotificationList = [];
    if (asyncNotification) {
      asyncNotificationList = [];
      for (let i = 0; i < asyncNotification.length; i++) {
        asyncNotificationList.push(asyncNotification[i]);
      }
    }
    let tmpList = asyncNotificationList;
    const { notificationList } = this.props;
    if (notificationList) {
      for (let i = 0; i < notificationList['notifications'].length; i++) {
        const element = notificationList['notifications'][i];
        let readStatus = false;
        if (element.notificationType == 'release') {
          let releaseCases = JSON.parse(
            await AsyncStorage.getItem('releaseCases'),
          );
          if (element.body.split(' ')[1] == releaseCases.build) {
            if (releaseCases.remindMeLaterClick) {
              readStatus = false;
            }
            if (releaseCases.ignoreClick) {
              readStatus = true;
            }
          } else {
            readStatus = true;
          }
        }
        if (
          asyncNotificationList.findIndex(
            (value) => value.notificationId == element.notificationId,
          ) > -1
        ) {
          let temp =
            asyncNotificationList[
            asyncNotificationList.findIndex(
              (value) => value.notificationId == element.notificationId,
            )
            ];
          if (element.notificationType == 'release') {
            readStatus = readStatus;
          } else {
            readStatus = temp.read;
          }
          let obj = {
            ...temp,
            read: readStatus,
            type: element.notificationType,
            title: element.title,
            info: element.body,
            isMandatory: element.tag == 'mandatory' ? true : false,
            time: timeFormatter(
              moment(new Date()),
              moment(element.date).valueOf(),
            ),
            date: new Date(element.date),
          };
          tmpList[
            tmpList.findIndex(
              (value) => value.notificationId == element.notificationId,
            )
          ] = obj;
        } else {
          let obj = {
            type: element.notificationType,
            isMandatory: element.tag == 'mandatory' ? true : false,
            read: readStatus,
            title: element.title,
            time: timeFormatter(
              moment(new Date()),
              moment(element.date).valueOf(),
            ),
            date: new Date(element.date),
            info: element.body,
            notificationId: element.notificationId,
          };
          tmpList.push(obj);
        }
      }
      await AsyncStorage.setItem('notificationList', JSON.stringify(tmpList));
      tmpList.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });

      this.setState({
        notificationData: tmpList,
        notificationDataChange: !this.state.notificationDataChange,
      });
    }
  };

  render() {
    const {
      cardData,
      switchOn,
      CurrencyCode,
      transactions,
      balances,
      selectedBottomTab,
      modalData,
      qrBottomSheetsFlag,
      selectedTransactionItem,
      tabBarIndex,
      deepLinkModalOpen,
      knowMoreBottomSheetsFlag,
      addBottomSheetsFlag,
      errorMessageHeader,
      errorMessage,
      buttonText,
      addSubBottomSheetsFlag,
      selectedContact,
      familyAndFriendsBookBottomSheetsFlag,
      notificationData,
      selectToAdd,
      fbBTCAccount,
      loading,
      atCloseEnd,
      transactionsLoading,
      currencyCode,
      trustedContactRequest,
      recoveryRequest,
      custodyRequest,
      isLoadContacts,
    } = this.state;
    const {
      navigation,
      notificationList,
      exchangeRates,
      accounts,
      walletName,
      UNDER_CUSTODY,
      downloadMShare,
      overallHealth,
    } = this.props;

    // const custodyRequest = navigation.getParam('custodyRequest');
    return (
      <ImageBackground
        source={require('../assets/images/home-bg.png')}
        style={{ width: '100%', height: '100%', flex: 1 }}
        imageStyle={{ resizeMode: 'stretch' }}
      >
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <View
          style={{
            flex: 3.8,
            paddingTop:
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp('5%') : 0,
          }}
        >
          <HomeHeader
            onPressNotifications={this.onPressNotifications}
            notificationData={notificationList}
            walletName={walletName}
            switchOn={switchOn}
            getCurrencyImageByRegion={getCurrencyImageByRegion}
            balances={balances}
            exchangeRates={exchangeRates}
            CurrencyCode={currencyCode}
            navigation={this.props.navigation}
            overallHealth={overallHealth}
            onSwitchToggle={this.onSwitchToggle}
          />
        </View>

        <View style={{ flex: 7 }}>
          <View style={styles.cardViewContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={cardData}
              extraData={{
                balances,
                switchOn,
                walletName,
                currencyCode,
                accounts,
                exchangeRates,
              }}
              renderItem={(Items) => (
                <HomeList
                  Items={Items}
                  navigation={navigation}
                  getIconByAccountType={getIconByAccountType}
                  switchOn={switchOn}
                  accounts={accounts}
                  CurrencyCode={currencyCode}
                  balances={balances}
                  exchangeRates={exchangeRates}
                />
              )}
            />
          </View>
        </View>

        <CustomBottomTabs
          tabBarZIndex={tabBarIndex}
          selectTab={this.selectTab}
          selected={selectedBottomTab}
        />

        <BottomSheet
          onOpenEnd={() => {
            this.setState({
              atCloseEnd: true,
            });
          }}
          onCloseEnd={() => {
            this.setState(
              {
                qrBottomSheetsFlag: false,
              },
              () => {
                if (this.state.selectedBottomTab == 'Transactions') {
                  (this.refs.transactionTabBarBottomSheet as any).snapTo(1);
                }
              },
            );
          }}
          onCloseStart={() => {
            this.setState({
              qrBottomSheetsFlag: false,
              atCloseEnd: false,
            });
          }}
          enabledInnerScrolling={true}
          ref={'transactionTabBarBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('18%')
              : Platform.OS == 'android'
                ? hp('19%')
                : hp('18%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('64%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('82%')
              : hp('82%'),
          ]}
          renderContent={() => (
            <TransactionsContent
              transactionLoading={transactionsLoading}
              transactions={transactions}
              AtCloseEnd={atCloseEnd}
              setTransactionItem={(item) =>
                this.setState({ selectedTransactionItem: item })
              }
              setTabBarZIndex={(index) => this.setState({ tabBarIndex: index })}
              TransactionDetailsBottomSheet={
                this.refs.transactionDetailsBottomSheet
              }
            />
          )}
          renderHeader={() => (
            <TransactionHeader openCloseModal={this.openCloseModal} />
          )}
        />

        <BottomSheet
          ref="addTabBarBottomSheet"
          onCloseEnd={() => {
            this.setState({
              qrBottomSheetsFlag: false,
            });

            if (selectedBottomTab == 'Add') {
              (this.refs.addTabBarBottomSheet as any).snapTo(1);
            }
          }}
          onCloseStart={() => {
            this.setState({
              qrBottomSheetsFlag: false,
            });
          }}
          enabledInnerScrolling={true}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('18%')
              : Platform.OS == 'android'
                ? hp('19%')
                : hp('18%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('64%'),
          ]}
          renderContent={() => (
            <AddModalContents
              onPressElements={(type) => {
                if (type == 'buyBitcoins') {
                  this.setState(
                    {
                      //addBottomSheetsFlag: true,
                      // tabBarIndex: 0,
                      selectToAdd: type,
                    },
                    () => {
                      this.props.navigation.navigate('VoucherScanner');
                    },
                  );
                } else if (type == 'addContact') {
                  this.setState(
                    {
                      // addSubBottomSheetsFlag: true,
                      // addBottomSheetsFlag: false,
                      isLoadContacts: true,
                      tabBarIndex: 0,
                      selectToAdd: type,
                    },
                    () =>
                      (this.refs
                        .addContactAddressBookBookBottomSheet as any).snapTo(1),
                  );
                }
              }}
              addData={modalData}
            />
          )}
          renderHeader={() => (
            <TouchableOpacity
              activeOpacity={10}
              onPress={this.openCloseModal}
              style={styles.modalHeaderContainer}
            >
              <View style={styles.modalHeaderHandle} />
              <Text style={styles.modalHeaderTitleText}>{'Add'}</Text>
            </TouchableOpacity>
          )}
        />

        <BottomSheet
          ref="qrTabBarBottomSheet"
          onOpenEnd={() => {
            this.setState({
              qrBottomSheetsFlag: selectedBottomTab === 'QR',
            });
          }}
          onCloseEnd={() => {
            this.setState(
              {
                qrBottomSheetsFlag: false,
              },
              () => {
                if (selectedBottomTab === 'QR') {
                  (this.refs.qrTabBarBottomSheet as any).snapTo(1);
                }
              },
            );
          }}
          onCloseStart={() => {
            this.setState({
              qrBottomSheetsFlag: false,
            });
          }}
          enabledInnerScrolling={true}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('18%')
              : Platform.OS == 'android'
                ? hp('19%')
                : hp('18%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('82%')
              : hp('82%'),
          ]}
          renderContent={() => (
            <QrCodeModalContents
              modalRef={this.refs.qrTabBarBottomSheet}
              isOpenedFlag={qrBottomSheetsFlag}
              onQrScan={(qrData) => this.processQRData(qrData)}
              onPressQrScanner={() => {
                navigation.navigate('QrScanner', {
                  scanedCode: this.processQRData,
                });
              }}
            />
          )}
          renderHeader={() => (
            <TouchableOpacity
              activeOpacity={10}
              onPress={this.openCloseModal}
              style={styles.modalHeaderContainer}
            >
              <View style={styles.modalHeaderHandle} />
              <Text style={styles.modalHeaderTitleText}>{'QR'}</Text>
            </TouchableOpacity>
          )}
        />

        <BottomSheet
          onCloseEnd={() => {
            this.setState(
              {
                qrBottomSheetsFlag: false,
              },
              () => {
                if (selectedBottomTab == 'More') {
                  (this.refs.moreTabBarBottomSheet as any).snapTo(1);
                }
              },
            );
          }}
          onCloseStart={() => {
            this.setState({
              qrBottomSheetsFlag: false,
            });
          }}
          enabledInnerScrolling={true}
          ref={'moreTabBarBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('18%')
              : Platform.OS == 'android'
                ? hp('19%')
                : hp('18%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('64%'),
          ]}
          renderContent={() => (
            <MoreHomePageTabContents
              onPressElements={(item) => this.onPressElement(item)}
            />
          )}
          renderHeader={() => (
            <TouchableOpacity
              activeOpacity={10}
              onPress={() => this.openCloseModal()}
              style={styles.modalHeaderContainer}
            >
              <View style={styles.modalHeaderHandle} />
              <Text style={styles.modalHeaderTitleText}>{'More'}</Text>
            </TouchableOpacity>
          )}
        />

        <BottomSheet
          onCloseEnd={() => {
            if (tabBarIndex === 0 && !deepLinkModalOpen) {
              this.setState({
                tabBarIndex: 999,
              });
            }
          }}
          onOpenEnd={() => {
            if (tabBarIndex == 999) {
              this.setState({
                tabBarIndex: 0,
              });
            }
            this.setState({
              deepLinkModalOpen: true,
            });
          }}
          enabledInnerScrolling={true}
          ref={'custodianRequestBottomSheet'}
          snapPoints={[-50, hp('60%')]}
          renderContent={() => {
            if (!custodyRequest) {
              return null;
            }

            return (
              <CustodianRequestModalContents
                loading={loading}
                userName={custodyRequest.requester}
                onPressAcceptSecret={() => {
                  this.setState(
                    {
                      loading: true,
                      tabBarIndex: 0,
                      deepLinkModalOpen: true,
                    },
                    () => {
                      (this.refs.custodianRequestBottomSheet as any).snapTo(0);
                    },
                  );

                  if (Date.now() - custodyRequest.uploadedAt > 600000) {
                    Alert.alert(
                      'Request expired!',
                      'Please ask the sender to initiate a new request',
                    );
                    this.setState({
                      loading: false,
                    });
                  } else {
                    if (UNDER_CUSTODY[custodyRequest.requester]) {
                      Alert.alert(
                        'Failed to store',
                        'You cannot custody multiple shares of the same user.',
                      );
                      this.setState({ loading: false });
                    } else {
                      if (custodyRequest.isQR) {
                        downloadMShare(custodyRequest.ek, custodyRequest.otp);
                        this.setState({
                          loading: false,
                        });
                      } else {
                        navigation.navigate('CustodianRequestOTP', {
                          custodyRequest,
                        });
                        this.setState({
                          loading: false,
                        });
                      }
                    }
                  }
                }}
                onPressRejectSecret={() => {
                  this.setState(
                    {
                      tabBarIndex: 0,
                    },
                    () => {
                      (this.refs.custodianRequestBottomSheet as any).snapTo(0);
                      (this.refs
                        .custodianRequestRejectedBottomSheet as any).snapTo(1);
                    },
                  );
                }}
              />
            );
          }}
          renderHeader={() => (
            <TransparentHeaderModal
              onPressheader={() => {
                this.setState(
                  {
                    tabBarIndex: 999,
                    deepLinkModalOpen: false,
                  },
                  () =>
                    (this.refs.custodianRequestBottomSheet as any).snapTo(0),
                );
              }}
            />
          )}
        />
        <BottomSheet
          onCloseEnd={() => {
            if (tabBarIndex === 0 && !deepLinkModalOpen) {
              this.setState({
                tabBarIndex: 999,
              });
            }
          }}
          onOpenEnd={() => {
            if (tabBarIndex === 999) {
              this.setState({
                tabBarIndex: 0,
              });
            }
            this.setState({
              deepLinkModalOpen: true,
            });
          }}
          enabledInnerScrolling={true}
          ref={'trustedContactRequestBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('70%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('95%')
              : hp('95%'),
          ]}
          renderContent={() => {
            if (!trustedContactRequest && !recoveryRequest) {
              return;
            }
            return (
              <TrustedContactRequestContent
                trustedContactRequest={trustedContactRequest}
                recoveryRequest={recoveryRequest}
                onPressAccept={this.onTrustedContactRequestAccept}
                onPressReject={this.onTrustedContactRejct}
                onPhoneNumberChange={this.onPhoneNumberChange}
                bottomSheetRef={this.refs.trustedContactRequestBottomSheet}
              />
            );
          }}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                this.setState(
                  {
                    tabBarIndex: 999,
                    deepLinkModalOpen: false,
                  },
                  () => {
                    (this.refs.trustedContactRequestBottomSheet as any).snapTo(
                      0,
                    );
                  },
                );
              }}
            />
          )}
        />

        <BottomSheet
          onCloseStart={() => {
            this.setState({
              tabBarIndex: 999,
            });
          }}
          onOpenEnd={() => {
            this.setState({
              tabBarIndex: 0,
            });
          }}
          enabledInnerScrolling={true}
          ref={'custodianRequestRejectedBottomSheet'}
          snapPoints={[-50, hp('60%')]}
          renderContent={() => {
            if (!custodyRequest) return null;
            return (
              <CustodianRequestRejectedModalContents
                onPressViewThrustedContacts={() => {
                  this.setState(
                    {
                      tabBarIndex: 999,
                    },
                    () => {
                      (this.refs
                        .custodianRequestRejectedBottomSheet as any).snapTo(0);
                    },
                  );
                }}
                userName={custodyRequest.requester}
              />
            );
          }}
          renderHeader={() => (
            <TransparentHeaderModal
              onPressheader={() => {
                this.setState(
                  {
                    tabBarIndex: 999,
                  },
                  () =>
                    (this.refs
                      .custodianRequestRejectedBottomSheet as any).snapTo(0),
                );
              }}
            />
          )}
        />
        {knowMoreBottomSheetsFlag ? (
          <BottomSheet
            onOpenEnd={() => {
              if (!deepLinkModalOpen) {
                this.setState({
                  tabBarIndex: 0,
                });
              }
            }}
            onCloseEnd={() => {
              if (!deepLinkModalOpen) {
                this.setState({
                  tabBarIndex: 999,
                });
              }
            }}
            enabledInnerScrolling={true}
            ref={'allAccountsBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('65%')
                : hp('64%'),
            ]}
            renderContent={() => (
              <AllAccountsContents
                onPressBack={() => {
                  this.setState(
                    {
                      tabBarIndex: 999,
                    },
                    () => (this.refs.allAccountsBottomSheet as any).snapTo(0),
                  );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.white}
                backgroundColor={Colors.white}
                onPressHeader={() => {
                  this.setState(
                    {
                      tabBarIndex: 999,
                    },
                    () => (this.refs.allAccountsBottomSheet as any).snapTo(0),
                  );
                }}
              />
            )}
          />
        ) : null}

        <BottomSheet
          enabledInnerScrolling={true}
          onCloseEnd={() => {
            this.setState({
              tabBarIndex: 999,
            });
          }}
          onCloseStart={() => {
            this.setState({
              tabBarIndex: 999,
            });
          }}
          onOpenEnd={() => {
            this.setState({
              tabBarIndex: 0,
            });
          }}
          ref={'transactionDetailsBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('82%')
              : hp('82%'),
          ]}
          renderContent={() => (
            <TransactionDetails
              item={selectedTransactionItem}
              onPressKnowMore={() => {
                (this.refs.transactionDetailsBottomSheet as any).snapTo(1);
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              borderColor={Colors.white}
              backgroundColor={Colors.white}
              onPressHeader={() => {
                if (this.refs.transactionDetailsBottomSheet)
                  (this.refs.transactionDetailsBottomSheet as any).snapTo(0);
              }}
            />
          )}
        />

        {knowMoreBottomSheetsFlag ? (
          <BottomSheet
            onOpenEnd={() => {
              if (!deepLinkModalOpen) {
                this.setState({
                  tabBarIndex: 0,
                });
              }
            }}
            onCloseEnd={() => {
              if (!deepLinkModalOpen) {
                this.setState({
                  tabBarIndex: 999,
                });
              }
            }}
            enabledInnerScrolling={true}
            ref={'settingsBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('65%')
                : hp('64%'),
            ]}
            renderContent={() => (
              <SettingsContents
                currencyCode={CurrencyCode}
                onPressManagePin={(type, currencycode) =>
                  this.onPressSettingsElements(type, currencycode)
                }
                onPressBack={() => {
                  this.setState(
                    {
                      tabBarIndex: 999,
                    },
                    () => {
                      (this.refs.settingsBottomSheet as any).snapTo(0);
                    },
                  );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.white}
                backgroundColor={Colors.white}
                onPressHeader={() => {
                  this.setState(
                    {
                      tabBarIndex: 999,
                    },
                    () => (this.refs.settingsBottomSheet as any).snapTo(0),
                  );
                }}
              />
            )}
          />
        ) : null}

        {addBottomSheetsFlag ? (
          <BottomSheet
            onOpenEnd={() => {
              if (!deepLinkModalOpen) {
                this.setState({
                  tabBarIndex: 0,
                });
              }
            }}
            onCloseEnd={() => {
              if (!deepLinkModalOpen) {
                this.setState({
                  tabBarIndex: 999,
                });
              }

              this.setState({
                addBottomSheetsFlag: false,
              });
            }}
            enabledInnerScrolling={true}
            ref={'addBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('65%')
                : hp('64%'),
            ]}
            renderContent={() => {
              if (selectToAdd == 'buyBitcoins') {
                return (
                  <SaveBitcoinModalContents
                    onPressBack={() => {
                      (this.refs.addBottomSheet as any).snapTo(0);
                    }}
                    onPressElements={(type) =>
                      this.onPressSaveBitcoinElements(type)
                    }
                    isExistingSavingMethod={isEmpty(fbBTCAccount)}
                  />
                );
              } else if (selectToAdd == 'addContact') {
                return (
                  <AddContactsModalContents
                    onPressFriendAndFamily={() => {
                      this.setState(
                        {
                          isLoadContacts: true,
                        },
                        () =>
                          (this.refs
                            .AddContactAddressBookBookBottomSheet as any).snapTo(
                              1,
                            ),
                      );
                    }}
                    onPressBiller={() => {
                      this.setState(
                        {
                          isLoadContacts: true,
                        },
                        () =>
                          (this.refs
                            .AddContactAddressBookBookBottomSheet as any).snapTo(
                              1,
                            ),
                      );
                    }}
                    onPressBack={() => {
                      this.setState(
                        {
                          addSubBottomSheetsFlag: true,
                          tabBarIndex: 999,
                        },
                        () => (this.refs.addBottomSheet as any).snapTo(0),
                      );
                    }}
                  />
                );
              } else {
                return null;
              }
            }}
            renderHeader={() => (
              <ModalHeader
                onPressHeader={() => {
                  this.setState(
                    {
                      addSubBottomSheetsFlag: false,
                      tabBarIndex: 999,
                    },
                    () => {
                      (this.refs.addBottomSheet as any).snapTo(0);
                    },
                  );
                }}
              />
            )}
          />
        ) : null}

        <BottomSheet
          onOpenEnd={() => {
            this.setState({
              tabBarIndex: 0,
            });
          }}
          onCloseEnd={() => {
            this.setState({
              tabBarIndex: 999,
            });
          }}
          enabledInnerScrolling={true}
          ref={'errorBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('35%')
              : hp('40%'),
          ]}
          renderContent={() => (
            <ErrorModalContents
              modalRef={this.refs.errorBottomSheet}
              title={errorMessageHeader}
              info={errorMessage}
              proceedButtonText={buttonText}
              onPressProceed={() => {
                this.setState(
                  {
                    tabBarIndex: 999,
                  },
                  () => {
                    (this.refs.errorBottomSheet as any).snapTo(0);
                  },
                );
              }}
              isBottomImage={true}
              bottomImage={require('../assets/images/icons/errorImage.png')}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                this.setState(
                  {
                    tabBarIndex: 999,
                  },
                  () => (this.refs.errorBottomSheet as any).snapTo(0),
                );
              }}
            />
          )}
        />

        {addSubBottomSheetsFlag ? (
          <BottomSheet
            onOpenEnd={() => {
              this.setState({
                tabBarIndex: 0,
              });
            }}
            enabledInnerScrolling={true}
            ref={'fastBitcoinRedeemCalculationBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('90%')
                : hp('90%'),
              Platform.OS == 'ios' ? hp('90%') : hp('50%'),
            ]}
            renderContent={() => (
              <FastBitcoinCalculationModalContents
                navigation={navigation}
                modalRef={this.refs.fastBitcoinRedeemCalculationBottomSheet}
                pageInfo={
                  'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
                }
                pageTitle={'Redeem Voucher'}
                noteTitle={'Lorem ipsum'}
                noteInfo={'Lorem ipsum dolor sit amet, consectetur'}
                proceedButtonText="Calculate"
                onPressBack={() => {
                  (this.refs
                    .fastBitcoinRedeemCalculationBottomSheet as any).snapTo(0);
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.white}
                backgroundColor={Colors.white}
                onPressHeader={() => {
                  (this.refs
                    .fastBitcoinRedeemCalculationBottomSheet as any).snapTo(0);
                }}
              />
            )}
          />
        ) : null}

        {addSubBottomSheetsFlag ? (
          <BottomSheet
            onOpenEnd={() => {
              this.setState({
                tabBarIndex: 0,
              });
            }}
            enabledInnerScrolling={true}
            ref={'fastBitcoinSellCalculationBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('90%')
                : hp('90%'),
              Platform.OS == 'ios' ? hp('90%') : hp('50%'),
            ]}
            renderContent={() => (
              <FastBitcoinCalculationModalContents
                navigation={navigation}
                modalRef={this.refs.fastBitcoinSellCalculationBottomSheet}
                pageInfo={
                  'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
                }
                pageTitle={'Sell Bitcoins'}
                noteTitle={'Lorem ipsum'}
                noteInfo={'Lorem ipsum dolor sit amet, consectetur'}
                proceedButtonText={'Calculate'}
                onPressBack={() => {
                  (this.refs
                    .fastBitcoinSellCalculationBottomSheet as any).snapTo(0);
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.white}
                backgroundColor={Colors.white}
                onPressHeader={() => {
                  (this.refs
                    .fastBitcoinSellCalculationBottomSheet as any).snapTo(0);
                }}
              />
            )}
          />
        ) : null}

        <BottomSheet
          onOpenEnd={() => {
            this.setState({
              tabBarIndex: 0,
              familyAndFriendsBookBottomSheetsFlag: true,
            });
          }}
          onOpenStart={() => {
            this.setState({
              tabBarIndex: 0,
            });
          }}
          onCloseStart={() => {
            this.setState({
              tabBarIndex: 999,
              familyAndFriendsBookBottomSheetsFlag: false,
            });
          }}
          enabledInnerScrolling={true}
          ref={'addContactAddressBookBookBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('82%')
              : hp('82%'),
          ]}
          renderContent={() => (
            <AddContactAddressBook
              isLoadContacts={isLoadContacts}
              modalRef={this.refs.addContactAddressBookBookBottomSheet}
              proceedButtonText={'Confirm & Proceed'}
              onPressContinue={() => {
                navigation.navigate('AddContactSendRequest', {
                  SelectedContact: selectedContact,
                });
                (this.refs.addContactAddressBookBookBottomSheet as any).snapTo(
                  0,
                );
              }}
              onSelectContact={(selectedContact) => {
                this.setState({
                  selectedContact,
                });
              }}
              onPressBack={() => {
                this.setState(
                  {
                    familyAndFriendsBookBottomSheetsFlag: false,
                  },
                  () =>
                    (this.refs
                      .addContactAddressBookBookBottomSheet as any).snapTo(0),
                );
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              borderColor={Colors.white}
              backgroundColor={Colors.white}
              onPressHeader={() => {
                this.setState(
                  {
                    familyAndFriendsBookBottomSheetsFlag: false,
                  },
                  () =>
                    (this.refs
                      .addContactAddressBookBookBottomSheet as any).snapTo(0),
                );
              }}
            />
          )}
        />

        {familyAndFriendsBookBottomSheetsFlag ? (
          <BottomSheet
            onOpenEnd={() => { }}
            enabledInnerScrolling={true}
            ref={'contactSelectedFromAddressBookBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('90%')
                : hp('90%'),
            ]}
            renderContent={() => (
              <SelectedContactFromAddressBook
                onPressQrScanner={() => {
                  navigation.navigate('QrScanner', {
                    scanedCode: this.processQRData,
                  });
                }}
                onPressProceed={() => {
                  (this.refs
                    .contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                      1,
                    );
                }}
                onPressBack={() => {
                  (this.refs
                    .contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                      0,
                    );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.white}
                backgroundColor={Colors.white}
                onPressHeader={() => {
                  (this.refs
                    .contactSelectedFromAddressBookBottomSheet as any).snapTo(
                      0,
                    );
                }}
              />
            )}
          />
        ) : null}
        {familyAndFriendsBookBottomSheetsFlag ? (
          <BottomSheet
            onOpenEnd={() => { }}
            enabledInnerScrolling={true}
            ref={'contactSelectedFromAddressBookQrCodeBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('90%')
                : hp('90%'),
            ]}
            renderContent={() => (
              <SelectedContactFromAddressBookQrCode
                onPressProceed={() => {
                  (this.refs
                    .contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                      0,
                    );
                }}
                onPressBack={() => {
                  (this.refs
                    .contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                      0,
                    );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.white}
                backgroundColor={Colors.white}
                onPressHeader={() => {
                  (this.refs
                    .contactSelectedFromAddressBookQrCodeBottomSheet as any).snapTo(
                      0,
                    );
                }}
              />
            )}
          />
        ) : null}

        <BottomSheet
          onOpenEnd={() => {
            this.setState(
              {
                tabBarIndex: 0,
              },
              () => this.onNotificationListOpen(),
            );
          }}
          onCloseEnd={() => {
            this.setState({
              tabBarIndex: 999,
            });
          }}
          enabledInnerScrolling={true}
          ref={'notificationsListBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('82%')
              : hp('82%'),
          ]}
          renderContent={() => (
            <NotificationListContent
              NotificationData={notificationData}
              onNotificationClicked={(value) =>
                this.onNotificationClicked(value)
              }
              onPressBack={() => {
                (this.refs.notificationsListBottomSheet as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                (this.refs.notificationsListBottomSheet as any).snapTo(0);
              }}
            />
          )}
        />
        <BottomSheet
          onCloseEnd={() => { }}
          enabledInnerScrolling={true}
          ref={this.NoInternetBottomSheet}
          snapPoints={[-50, hp('60%')]}
          renderContent={() => (
            <NoInternetModalContents
              onPressTryAgain={() => {
                (this.NoInternetBottomSheet as any).current.snapTo(0);
              }}
              onPressIgnore={() => {
                (this.NoInternetBottomSheet as any).current.snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                (this.NoInternetBottomSheet as any).current.snapTo(0);
              }}
            />
          )}
        />
      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notificationList: state.notifications,
    exchangeRates: idx(state, (_) => _.accounts.exchangeRates),
    accounts: state.accounts || [],
    walletName:
      idx(state, (_) => _.storage.database.WALLET_SETUP.walletName) || '',
    UNDER_CUSTODY: idx(
      state,
      (_) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY,
    ),
    s3Service: idx(state, (_) => _.sss.service),
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    paymentDetails: idx(state, (_) => _.trustedContacts.paymentDetails),
  };
};

export default connect(mapStateToProps, {
  fetchEphemeralChannel,
  fetchNotifications,
  updateFCMTokens,
  downloadMShare,
  approveTrustedContact,
  uploadRequestedShare,
  initHealthCheck,
  fetchDerivativeAccBalTx,
  addTransferDetails,
  clearPaymentDetails,
})(HomeUpdated);

const styles = StyleSheet.create({
  card: {
    margin: 0,
    width: wp('42.6%'),
    height: hp('20.1%'),
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginRight: wp('2%'),
    marginBottom: wp('2%'),
    padding: wp('3'),
    backgroundColor: Colors.white,
  },
  cardTitle: {
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
    fontSize: RFValue(10),
  },
  activeTabStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
    padding: 7,
    borderRadius: 7,
    width: 120,
    height: 40,
    justifyContent: 'center',
  },
  activeTabTextStyle: {
    marginLeft: 8,
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  bottomTabBarContainer: {
    backgroundColor: Colors.white,
    justifyContent: 'space-evenly',
    display: 'flex',
    marginTop: 'auto',
    flexDirection: 'row',
    height: hp('12%'),
    alignItems: 'center',
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    paddingBottom: DeviceInfo.hasNotch() ? hp('4%') : 0,
  },
  cardViewContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
    marginTop: hp('4%'),
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: { width: 2, height: -1 },
    paddingTop: hp('1.5%'),
    paddingBottom: hp('5%'),
    width: '100%',
    overflow: 'hidden',
    paddingLeft: wp('3%'),
  },
  modalHeaderContainer: {
    backgroundColor: Colors.white,
    marginTop: 'auto',
    flex: 1,
    height:
      Platform.OS == 'ios' && DeviceInfo.hasNotch()
        ? 50
        : Platform.OS == 'android'
          ? 43
          : 40,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  headerViewContainer: {
    marginTop: hp('2%'),
    marginLeft: 20,
    marginRight: 20,
  },
  headerTitleViewContainer: {
    flex: 7,
    justifyContent: 'space-between',
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(25),
    marginBottom: wp('3%'),
  },
  headerToggleSwitchContainer: {
    flex: 3,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerInfoText: {
    fontSize: RFValue(12),
    color: Colors.white,
  },
  headerButton: {
    backgroundColor: Colors.homepageButtonColor,
    height: hp('5%'),
    width: wp('35%'),
    borderRadius: 5,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
    color: Colors.white,
  },
  cardBitCoinImage: {
    width: wp('3%'),
    height: wp('3%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('0.7%'),
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountTextGrey: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  tabBarImage: {
    width: 21,
    height: 21,
    resizeMode: 'contain',
  },
  tabBarTabView: {
    padding: wp('5%'),
  },
  transactionModalElementView: {
    backgroundColor: Colors.backgroundColor,
    padding: hp('1%'),
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalElementInfoView: {
    padding: hp('1%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(12),
    marginBottom: 3,
    fontFamily: Fonts.FiraSansRegular,
  },
  transactionModalDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  transactionModalAmountView: {
    padding: 10,
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  transactionModalAmountText: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: RFValue(20),
    fontFamily: Fonts.OpenSans,
  },
  transactionModalAmountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.OpenSans,
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 1,
    backgroundColor: Colors.borderColor,
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
});
