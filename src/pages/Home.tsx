import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
  AsyncStorage,
  Linking,
  NativeModules,
  Alert,
} from 'react-native';
import CardView from 'react-native-cardview';
import Fonts from './../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';
import Colors from '../common/Colors';
import DeviceInfo from 'react-native-device-info';
import ToggleSwitch from '../components/ToggleSwitch';
import Entypo from 'react-native-vector-icons/Entypo';
import { RFValue } from 'react-native-responsive-fontsize';
import CommonStyles from '../common/Styles';
import NoInternetModalContents from '../components/NoInternetModalContents';
import TransparentHeaderModal from '../components/TransparentHeaderModal';
import CustodianRequestModalContents from '../components/CustodianRequestModalContents';
import CustodianRequestRejectedModalContents from '../components/CustodianRequestRejectedModalContents';
import CustodianRequestOtpModalContents from '../components/CustodianRequestOtpModalContents';
import MoreHomePageTabContents from '../components/MoreHomePageTabContents';
import SmallHeaderModal from '../components/SmallHeaderModal';
import AddressBookContents from '../components/AddressBookContents';
import SaveBitcoinModalContents from './GetBittr/SaveBitcoinModalContents';
import CustodianRequestAcceptModalContents from '../components/CustodianRequestAcceptModalContents';
import HomePageShield from '../components/HomePageShield';
import TransactionDetailsContents from '../components/TransactionDetailsContents';
import TransactionListModalContents from '../components/TransactionListModalContents';
import AddModalContents from '../components/AddModalContents';
import QrCodeModalContents from '../components/QrCodeModalContents';
import FastBitcoinModalContents from '../components/FastBitcoinModalContents';
import FastBitcoinCalculationModalContents from '../components/FastBitcoinCalculationModalContents';
import GetBittrModalContents from '../components/GetBittrModalContents';
import AddContactsModalContents from '../components/AddContactsModalContents';
import FamilyandFriendsAddressBookModalContents from '../components/FamilyandFriendsAddressBookModalContents';
import SelectedContactFromAddressBook from '../components/SelectedContactFromAddressBook';
import SelectedContactFromAddressBookQrCode from '../components/SelectedContactFromAddressBookQrCode';
import HealthCheckSecurityQuestionModalContents from '../components/HealthCheckSecurityQuestionModalContents';
import HealthCheckGoogleAuthModalContents from '../components/HealthCheckGoogleAuthModalContents';
import SettingManagePin from './SettingManagePin';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../common/constants/serviceTypes';
import AllAccountsContents from '../components/AllAccountsContents';
import SettingsContents from '../components/SettingsContents';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkMSharesHealth,
  updateMSharesHealth,
  downloadMShare,
  initHealthCheck,
  uploadRequestedShare,
  ErrorSending,
  ErrorReceiving,
  UploadSuccessfully,
} from '../store/actions/sss';
import RecoverySecretRequestModalContents from '../components/RecoverySecretRequestModalContesnts';
import ShareRecoverySecretModalContents from '../components/ShareRecoverySecretModalContents';
import moment from 'moment';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import {
  getTestcoins,
  fetchBalance,
  fetchTransactions,
  runTest,
  fetchGetBittrDetails,
  updateFCMTokens,
  deliverNotification,
} from '../store/actions/accounts';
import axios from 'axios';
import TestAccountHelperModalContents from '../components/Helper/TestAccountHelperModalContents';
import { UsNumberFormat } from '../common/utilities';
import { getCurrencyImageByRegion } from '../common/CommonFunctions/index';
import ErrorModalContents from '../components/ErrorModalContents';
import ModalHeader from '../components/ModalHeader';
import TransactionDetails from './Accounts/TransactionDetails';
import Toast from '../components/Toast';
import RegularAccount from '../bitcoin/services/accounts/RegularAccount';
import GetBittrRecurringBuyContents from './GetBittr/GetBittrRecurringBuyContent';
import firebase from 'react-native-firebase';
import NotificationListContent from '../components/NotificationListContent';
import {firebaseNotificationListener} from "../common/CommonFunctions/notifications";
// const { Value, abs, sub, min } = Animated
// const snapPoints = [ Dimensions.get( 'screen' ).height - 150, 150 ]
// const position = new Value( 1 )
// const opacity = min( abs( sub( position, 1 ) ), 0.8 )
// const zeroIndex = snapPoints.length - 1
// const height = snapPoints[ 0 ]

export default function Home(props) {
  const [
    notificationsListBottomSheet,
    setNotificationsListBottomSheet,
  ] = useState(React.createRef());
  const [GetBittrRecurringBuy, setGetBittrRecurringBuy] = useState(
    React.createRef(),
  );
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonText, setButtonText] = useState('Try again');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector((state) => state.sss.errorSending);
  const isUploadSuccessfully = useSelector(
    (state) => state.sss.uploadSuccessfully,
  );
  const isErrorReceivingFailed = useSelector(
    (state) => state.sss.errorReceiving,
  );
  let [AtCloseEnd, setAtCloseEnd] = useState(false);
  let [loading, setLoading] = useState(false);
  let [AssociatedContact, setAssociatedContact] = useState([]);
  let [SelectedContacts, setSelectedContacts] = useState([]);
  let [SecondaryDeviceAddress, setSecondaryDeviceAddress] = useState([]);
  const [secondaryDeviceOtp, setSecondaryDeviceOtp] = useState({});
  let SecondaryDeviceStatus = useSelector(
    (state) => state.sss.downloadedMShare,
  );
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [KnowMoreBottomSheetsFlag, setKnowMoreBottomSheetsFlag] = useState(
    false,
  );
  const [addBottomSheetsFlag, setAddBottomSheetsFlag] = useState(false);
  const [addSubBottomSheetsFlag, setAddSubBottomSheetsFlag] = useState(false);
  const [
    familyAndFriendsBookBottomSheetsFlag,
    setFamilyAndFriendsBookBottomSheetsFlag,
  ] = useState(false);
  const WALLET_SETUP = useSelector(
    (state) => state.storage.database.WALLET_SETUP,
  );
  const { status } = useSelector((state) => state.sss);
  // alert(status);
  // const DECENTRALIZED_BACKUP = useSelector(
  //   state => state.storage.database.DECENTRALIZED_BACKUP,
  // );
  const walletName = WALLET_SETUP ? WALLET_SETUP.walletName : '';
  const accounts = useSelector((state) => state.accounts);
  // const exchangeRate = props.navigation.state.params
  //   ? props.navigation.state.params.exchangeRates
  //   : null;
  const dispatch = useDispatch();
  const [exchangeRates, setExchangeRates] = useState(accounts.exchangeRates);
  useEffect(() => {
    if (accounts.exchangeRates) setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);

  const s3Service = useSelector((state) => state.sss.service);
  useEffect(() => {
    if (s3Service) {
      const { healthCheckInitialized } = s3Service.sss;
      if (!healthCheckInitialized) dispatch(initHealthCheck());
    }
  }, [s3Service]);
  // const [balances, setBalances] = useState({
  //   testBalance: 0,
  //   regularBalance: 0,
  //   secureBalance: 0,
  //   accumulativeBalance: 0,
  // });
  // const [transactions, setTransactions] = useState([]);

  // const balancesParam = props.navigation.getParam('balances');
  const [balances, setBalances] = useState({
    testBalance: 0,
    regularBalance: 0,
    secureBalance: 0,
    accumulativeBalance: 0,
  });
  // const transactionsParam = props.navigation.getParam('transactions');
  const [transactions, setTransactions] = useState([]);

  const [qrData, setqrData] = useState('');

  useEffect(() => {
    const testBalance = accounts[TEST_ACCOUNT].service
      ? accounts[TEST_ACCOUNT].service.hdWallet.balances.balance +
        accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    const regularBalance = accounts[REGULAR_ACCOUNT].service
      ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
        accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    const secureBalance = accounts[SECURE_ACCOUNT].service
      ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
        accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
          .unconfirmedBalance
      : 0;
    const accumulativeBalance = regularBalance + secureBalance;

    const testTransactions = accounts[TEST_ACCOUNT].service
      ? accounts[TEST_ACCOUNT].service.hdWallet.transactions.transactionDetails
      : [];
    const regularTransactions = accounts[REGULAR_ACCOUNT].service
      ? accounts[REGULAR_ACCOUNT].service.hdWallet.transactions
          .transactionDetails
      : [];

    const secureTransactions = accounts[SECURE_ACCOUNT].service
      ? accounts[SECURE_ACCOUNT].service.secureHDWallet.transactions
          .transactionDetails
      : [];
    const accumulativeTransactions = [
      ...testTransactions,
      ...regularTransactions,
      ...secureTransactions,
    ];
    if (accumulativeTransactions.length) {
      accumulativeTransactions.sort(function (left, right) {
        console.log(
          'moment.utc(right.date),moment.utc(left.date)',
          moment.utc(right.date).unix(),
          moment.utc(left.date).unix(),
          moment.utc(right.date).unix() - moment.utc(left.date).unix(),
        );
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
    }
    setBalances({
      testBalance,
      regularBalance,
      secureBalance,
      accumulativeBalance,
    });
    setTransactions(accumulativeTransactions);

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
  }, [accounts]);

  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: '',
    question: '',
  });
  const [answer, setAnswer] = useState('');
  const [selectToAdd, setSelectToAdd] = useState('Getbittr');
  const [openmodal, setOpenmodal] = useState('closed');
  const [tabBarZIndex, setTabBarZIndex] = useState(999);
  const [deepLinkModalOpen, setDeepLinkModalOpen] = useState(false);
  const [tabSelected, setTabSelected] = useState('sell');
  const [switchOn, setSwitchOn] = useState(true);
  const [selected, setSelected] = useState('Transactions');
  // const [RegenerateBottomSheet, setRegenerateBottomSheet] = useState(
  //   React.createRef(),
  // );
  // const [
  //   ShareRecoverySecretBottomSheet,
  //   setShareRecoverySecretBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   ShareRecoverySecretOtpBottomSheet,
  //   setShareRecoverySecretOtpBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   HealthCheckSuccessBottomSheet,
  //   setHealthCheckSuccessBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   HealthCheckGoogleAuthBottomSheet,
  //   setHealthCheckGoogleAuthBottomSheet,
  // ] = useState(React.createRef());
  // const [
  //   HealthCheckSecurityQuestionBottomSheet,
  //   setHealthCheckSecurityQuestionBottomSheet,
  // ] = useState(React.createRef());
  const [
    ContactSelectedFromAddressBookQrCodeBottomSheet,
    setContactSelectedFromAddressBookQrCodeBottomSheet,
  ] = useState(React.createRef());
  const [
    ContactSelectedFromAddressBookBottomSheet,
    setContactSelectedFromAddressBookBottomSheet,
  ] = useState(React.createRef());
  const [
    FamilyAndFriendAddressBookBottomSheet,
    setFamilyAndFriendAddressBookBottomSheet,
  ] = useState(React.createRef());
  const [AddBottomSheet, setAddBottomSheet] = useState(React.createRef());
  const [
    fastBitcoinSellCalculationBottomSheet,
    setFastBitcoinSellCalculationBottomSheet,
  ] = useState(React.createRef());
  const [
    fastBitcoinRedeemCalculationBottomSheet,
    setFastBitcoinRedeemCalculationBottomSheet,
  ] = useState(React.createRef());
  const [AllAccountsBottomSheet, setAllAccountsBottomSheet] = useState(
    React.createRef(),
  );
  const [addressBookBottomSheet, setAddressBookBottomSheet] = useState(
    React.createRef(),
  );

  const [NoInternetBottomSheet, setNoInternetBottomSheet] = useState(
    React.createRef(),
  );
  // const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  // const [RecoveryRequestBottomSheet, setRecoveryRequestBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [
    CustodianRequestBottomSheet,
    setCustodianRequestBottomSheet,
  ] = useState(React.createRef());
  const [
    RecoverySecretRequestBottomSheet,
    setRecoverySecretRequestBottomSheet,
  ] = useState(React.createRef());

  const [
    CustodianRequestOtpBottomSheet,
    setCustodianRequestOtpBottomSheet,
  ] = useState(React.createRef());
  const [
    CustodianRequestRejectedBottomSheet,
    setCustodianRequestRejectedBottomSheet,
  ] = useState(React.createRef());
  // const [
  //   CustodianRequestAcceptBottomSheet,
  //   setCustodianRequestAcceptBottomSheet,
  // ] = useState(React.createRef());
  const [settingsBottomSheet, setSettingsBottomSheet] = useState(
    React.createRef(),
  );
  const [transactionTabBarBottomSheet, setTransactionBottomSheet] = useState(
    React.createRef(),
  );
  const [addTabBarBottomSheet, setAddTabBarBottomSheet] = useState(
    React.createRef(),
  );
  const [QrTabBarBottomSheet, setQrTabBarBottomSheet] = useState(
    React.createRef(),
  );
  const [moreTabBarBottomSheet, setMoreTabBarBottomSheet] = useState(
    React.createRef(),
  );
  const [newData, setNewData] = useState([]);
  const custodyRequest = props.navigation.getParam('custodyRequest');
  const recoveryRequest = props.navigation.getParam('recoveryRequest');

  const [data, setData] = useState([
    {
      id: 1,
      title: 'Test Account',
      unit: 't-sats',
      amount: '400,000',
      account: `Learn Bitcoin`,
      accountType: 'test',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_gray.png'),
    },
    {
      id: 2,
      title: 'Savings Account',
      unit: 'sats',
      amount: '60,000',
      account: 'Multi-factor security',
      accountType: 'secure',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
    },
    {
      id: 3,
      title: 'Checking Account',
      unit: 'sats',
      amount: '5,000',
      account: 'Fast and easy',
      accountType: 'regular',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
    },
    {
      id: 4,
      title: 'Add Account',
      unit: '',
      amount: '',
      account: '',
      accountType: 'add',
      bitcoinicon: require('../assets/images/icons/icon_add.png'),
    },
  ]);

  const [transactionData, setTransactionData] = useState([
    {
      title: 'Spending accounts',
      date: '30 November 2019',
      time: '11:00 am',
      price: '0.025',
      transactionStatus: 'send',
    },
    {
      title: 'Spending accounts',
      date: '1 November 2019',
      time: '11:00 am',
      price: '0.015',
      transactionStatus: 'receive',
    },
    {
      title: 'Spending accounts',
      date: '30 Jully 2019',
      time: '10:00 am',
      price: '0.125',
      transactionStatus: 'receive',
    },
    {
      title: 'Saving accounts',
      date: '1 June 2019',
      time: '12:00 am',
      price: '0.5',
      transactionStatus: 'receive',
    },
    {
      title: 'Saving accounts',
      date: '11 May 2019',
      time: '1:00 pm',
      price: '0.1',
      transactionStatus: 'send',
    },
    {
      title: 'Spending accounts',
      date: '30 November 2019',
      time: '11:00 am',
      price: '0.025',
      transactionStatus: 'send',
    },
    {
      title: 'Spending accounts',
      date: '1 November 2019',
      time: '11:00 am',
      price: '0.015',
      transactionStatus: 'receive',
    },
    {
      title: 'Spending accounts',
      date: '30 Jully 2019',
      time: '10:00 am',
      price: '0.125',
      transactionStatus: 'receive',
    },
    {
      title: 'Saving accounts',
      date: '1 June 2019',
      time: '12:00 am',
      price: '0.5',
      transactionStatus: 'receive',
    },
    {
      title: 'Saving accounts',
      date: '12 May 2019',
      time: '1:00 pm',
      price: '0.1',
      transactionStatus: 'send',
    },
  ]);
  const [modaldata, setModaldata] = useState(transactionData);
  const [
    TransactionDetailsBottomSheet,
    setTransactionDetailsBottomSheet,
  ] = useState(React.createRef());
  const [transactionItem, setTransactionItem] = useState({});
  const [
    TransactionDetailsHelperBottomSheet,
    setTransactionDetailsHelperBottomSheet,
  ] = useState(React.createRef());
  const [isHelperDone, setIsHelperDone] = useState(true);

  function getIconByAccountType(type) {
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
  }

  useEffect(function () {
    firebaseNotificationListener();
    storeFCMToken();
    (async () => {
    const enabled = await firebase.messaging().hasPermission();
    if(enabled){
      scheduleNotification();
    }
  })();
    

    let focusListener = props.navigation.addListener('didFocus', () => {
      setCurrencyCodeFromAsync();
      getAssociatedContact();
    });
    getAssociatedContact();
    setCurrencyCodeFromAsync();
    updateAccountCardData();
    (transactionTabBarBottomSheet as any).current.snapTo(1);
    (addTabBarBottomSheet as any).current.snapTo(0);
    (QrTabBarBottomSheet as any).current.snapTo(0);
    (moreTabBarBottomSheet as any).current.snapTo(0);
    AppState.addEventListener('change', handleAppStateChange);

    Linking.addEventListener('url', handleDeepLink);
    // return () => Linking.removeEventListener("url", handleDeepLink);

    // HC up-streaming
    // if (DECENTRALIZED_BACKUP) {
    //   if (Object.keys(DECENTRALIZED_BACKUP.UNDER_CUSTODY).length) {
    //     dispatch(updateMSharesHealth());
    //   }
    // }
    return () => {
      focusListener.remove();
    };
  }, []);

  // useEffect(() => {
  //   const unsubscribe = firebase
  //     .messaging()
  //     .onMessage(async (remoteMessage) => {
  //       Alert.alert(
  //         'A new FCM message arrived!',
  //         JSON.stringify(remoteMessage),
  //       );
  //     });

  //   return unsubscribe;
  // }, []);

  const scheduleNotification = async () => {
    const notification = new firebase.notifications.Notification().setTitle('abcd').setBody('xyz').setNotificationId('1').setSound('default').setSubtitle('www').setData({title:"qqq", body:'rrrr'}).android.setChannelId("reminder").android.setPriority(firebase.notifications.Android.Priority.High);

    // Schedule the notification for 1 minute in the future
    const date = new Date();
    date.setSeconds(date.getSeconds() + 20);
    // date.setMinutes(date.getMinutes() + 1);

    await firebase.notifications().scheduleNotification(notification, {
        fireDate: date.getTime(),
        repeatInterval: 'minute'
    }).then(()=>{

    }).catch(err => console.log('err', err));
    firebase
      .notifications()
      .getScheduledNotifications()
      .then(notifications => {
        console.log("logging notifications", notifications);
      });
  }

  const storeFCMToken = async () => {
    const fcmToken = await firebase.messaging().getToken();
    console.log('fcmToken', fcmToken);
    if (fcmToken) {
      let fcmArray = [fcmToken];
      dispatch(updateFCMTokens(fcmArray));
    }
  };

  const setCurrencyCodeFromAsync = async () => {
    let currencyCodeTmp = await AsyncStorage.getItem('currencyCode');
    if (!currencyCodeTmp) {
      const identifiers = ['io.hexawallet.hexa'];
      NativeModules.InAppUtils.loadProducts(
        identifiers,
        async (error, products) => {
          await AsyncStorage.setItem(
            'currencyCode',
            products && products.length ? products[0].currencyCode : 'USD',
          );
          setCurrencyCode(
            products && products.length ? products[0].currencyCode : 'USD',
          );
        },
      );
    } else {
      setCurrencyCode(currencyCodeTmp);
    }
    let currencyToggleValueTmp = await AsyncStorage.getItem(
      'currencyToggleValue',
    );
    setSwitchOn(currencyToggleValueTmp ? true : false);
  };

  // const getOverAllHealthFromAsync = async () => {
  //   if (!overallHealth) {
  //     const storedHealth = await AsyncStorage.getItem('overallHealth');
  //     if (storedHealth) {
  //       setOverallHealth(JSON.parse(storedHealth));
  //     }
  //   }
  // };

  const messageAsPerHealth = (health) => {
    if (health == 0) {
      return (
        <Text numberOfLines={1} style={{ ...styles.headerInfoText }}>
          The wallet backup is not secure.{'\n'}Please visit the health section
          to{'\n'}improve the health of your backup
        </Text>
      );
    } else if (health > 0 && health < 100) {
      return (
        <Text numberOfLines={1} style={styles.headerInfoText}>
          The wallet backup is not secured.{'\n'}Please complete the setup to
          {'\n'}safeguard against loss of funds
        </Text>
      );
    } else {
      return (
        <Text numberOfLines={1} style={styles.headerInfoText}>
          <Text style={{ fontStyle: 'italic' }}>Great!! </Text>The wallet backup
          is{'\n'}secure. Keep an eye on the{'\n'}health of the backup here
        </Text>
      );
    }
  };

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={buttonText}
        onPressProceed={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage, errorMessageHeader, buttonText]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  if (isErrorSendingFailed) {
    setTimeout(() => {
      setErrorMessageHeader('Error sending Recovery Secret');
      setErrorMessage(
        'There was an error while sending your Recovery Secret, please try again in a little while',
      );
      setButtonText('Try again');
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorSending(null));
  }

  if (isUploadSuccessfully) {
    setTimeout(() => {
      setErrorMessageHeader('Sending successful');
      setErrorMessage(
        'The Recovery Secret has been sent, the receiver needs to accept ',
      );
      setButtonText('Done');
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(UploadSuccessfully(null));
  }

  if (isErrorReceivingFailed) {
    setTimeout(() => {
      setErrorMessageHeader('Error receiving Recovery Secret');
      setErrorMessage(
        'There was an error while receiving your Recovery Secret, please try again',
      );
      setButtonText('Try again');
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorReceiving(null));
  }

  const updateAccountCardData = () => {
    let newArrayFinal = [];
    let tempArray = [];
    for (let a = 0; a < data.length; a++) {
      tempArray.push(data[a]);
      if (
        tempArray.length == 2 ||
        data[data.length - 1].id == tempArray[0].id
      ) {
        newArrayFinal.push(tempArray);
        tempArray = [];
      }
    }
    if (newArrayFinal) {
      setNewData(newArrayFinal);
    }
  };

  const renderTransactionsContent = () => {
    return transactions.length ? (
      <View style={styles.modalContentContainer}>
        <View style={{ flex: 1 }}>
          <View
            style={{ height: 'auto', marginTop: 10, marginBottom: hp('13%') }}
          >
            <FlatList
              data={transactions}
              ItemSeparatorComponent={() => (
                <View style={{ backgroundColor: Colors.white }}>
                  <View style={styles.separatorView} />
                </View>
              )}
              renderItem={({ item }) => (
                <AppBottomSheetTouchableWrapper
                  onPress={
                    () => {
                      (TransactionDetailsBottomSheet as any).current.snapTo(1);
                      setTimeout(() => {
                        setTransactionItem(item);
                        setTabBarZIndex(0);
                      }, 10);
                    }
                    //props.navigation.navigate('TransactionDetails', { item })
                  }
                  style={{
                    ...styles.transactionModalElementView,
                    backgroundColor: Colors.white,
                  }}
                >
                  <View style={styles.modalElementInfoView}>
                    <View style={{ justifyContent: 'center' }}>
                      <FontAwesome
                        name={
                          item.transactionType == 'Received'
                            ? 'long-arrow-down'
                            : 'long-arrow-up'
                        }
                        size={15}
                        color={
                          item.transactionType == 'Received'
                            ? Colors.green
                            : Colors.red
                        }
                      />
                    </View>
                    <View style={{ justifyContent: 'center', marginLeft: 10 }}>
                      <Text style={styles.transactionModalTitleText}>
                        {item.accountType}{' '}
                      </Text>
                      <Text style={styles.transactionModalDateText}>
                        {moment(item.date).utc().format('DD MMMM YYYY')}{' '}
                        {/* <Entypo
                      size={10}
                      name={"dot-single"}
                      color={Colors.textColorGrey}
                    />
                    {item.time} */}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionModalAmountView}>
                    <Image
                      source={require('../assets/images/icons/icon_bitcoin_gray.png')}
                      style={{ width: 12, height: 12, resizeMode: 'contain' }}
                    />
                    <Text
                      style={{
                        ...styles.transactionModalAmountText,
                        color:
                          item.transactionType == 'Received'
                            ? Colors.green
                            : Colors.red,
                      }}
                    >
                      {UsNumberFormat(item.amount)}
                    </Text>
                    <Text style={styles.transactionModalAmountUnitText}>
                      {item.confirmations < 6 ? item.confirmations : '6+'}
                    </Text>
                    <Ionicons
                      name="ios-arrow-forward"
                      color={Colors.textColorGrey}
                      size={12}
                      style={{ marginLeft: 20, alignSelf: 'center' }}
                    />
                  </View>
                </AppBottomSheetTouchableWrapper>
              )}
            />
          </View>
        </View>
        {transactions.length <= 1 ? (
          <View
            style={{
              margin: 15,
              backgroundColor: Colors.backgroundColor,
              marginBottom: AtCloseEnd ? hp('12%') + 15 : hp('30%') + 15,
              padding: 10,
              paddingTop: 20,
              paddingBottom: 20,
              borderRadius: 7,
            }}
          >
            <Text
              style={{
                color: Colors.black,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              You don't have any transactions yet
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Start using your accounts to make transactions
            </Text>
          </View>
        ) : null}
      </View>
    ) : (
      <View style={styles.modalContentContainer}>
        <View
          style={{
            flex: 1,
          }}
        >
          {[1, 2, 3, 4, 5].map((value) => {
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: wp('5%'),
                  paddingBottom: wp('5%'),
                  borderBottomWidth: 0.5,
                  borderColor: Colors.borderColor,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColor,
                      height: wp('5%'),
                      width: wp('5%'),
                      borderRadius: wp('5%') / 2,
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                  />
                  <View>
                    <View
                      style={{
                        backgroundColor: Colors.backgroundColor,
                        height: wp('5%'),
                        width: wp('25%'),
                        borderRadius: 10,
                      }}
                    />
                    <View
                      style={{
                        backgroundColor: Colors.backgroundColor,
                        height: wp('5%'),
                        width: wp('35%'),
                        marginTop: 5,
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColor,
                      height: wp('7%'),
                      width: wp('20%'),
                      borderRadius: 10,
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColor,
                      height: wp('5%'),
                      width: wp('5%'),
                      borderRadius: wp('5%') / 2,
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ backgroundColor: Colors.white }}>
          <View
            style={{
              margin: 15,
              backgroundColor: Colors.backgroundColor,
              marginBottom: hp('12%') + 15,
              padding: 10,
              paddingTop: 20,
              paddingBottom: 20,
              borderRadius: 7,
            }}
          >
            <Text
              style={{
                color: Colors.black,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              You don't have any transactions yet
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Start using your accounts to make transactions
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const setSecondaryDeviceAddresses = async () => {
    let secondaryDeviceOtpTemp = JSON.parse(
      await AsyncStorage.getItem('secondaryDeviceAddress'),
    );
    if (!secondaryDeviceOtpTemp) {
      secondaryDeviceOtpTemp = [];
    }
    if (
      secondaryDeviceOtpTemp.findIndex(
        (value) => value.otp == (secondaryDeviceOtp as any).otp,
      ) == -1
    ) {
      secondaryDeviceOtpTemp.push(secondaryDeviceOtp);
      await AsyncStorage.setItem(
        'secondaryDeviceAddress',
        JSON.stringify(secondaryDeviceOtpTemp),
      );
    }
  };

  useEffect(() => {
    if (
      (secondaryDeviceOtp as any).otp &&
      SecondaryDeviceStatus[(secondaryDeviceOtp as any).otp] &&
      SecondaryDeviceStatus[(secondaryDeviceOtp as any).otp].status
    ) {
      if ((secondaryDeviceOtp as any).type == 'trustedContactQR') {
        props.navigation.navigate('CustodianRequestAccepted', {
          requester: (secondaryDeviceOtp as any).requester,
        });
      }
      if ((secondaryDeviceOtp as any).type == 'secondaryDeviceQR') {
        Toast('Recovery Secret received successfully');
        setSecondaryDeviceAddresses();
      }
      getAssociatedContact();
    }
  }, [SecondaryDeviceStatus]);

  const getQrCodeData = (qrData) => {
    const scannedData = JSON.parse(qrData);
    switch (scannedData.type) {
      case 'trustedContactQR':
        const custodyRequest1 = {
          requester: scannedData.requester,
          ek: scannedData.ENCRYPTED_KEY,
          uploadedAt: scannedData.UPLOADED_AT,
          otp: scannedData.OTP,
          isQR: true,
          type: scannedData.type,
        };
        setLoading(false);
        setSecondaryDeviceOtp(custodyRequest1);
        props.navigation.navigate('Home', { custodyRequest: custodyRequest1 });
        break;
      case 'secondaryDeviceQR':
        const custodyRequest2 = {
          requester: scannedData.requester,
          ek: scannedData.ENCRYPTED_KEY,
          uploadedAt: scannedData.UPLOADED_AT,
          otp: scannedData.OTP,
          isQR: true,
          type: scannedData.type,
        }; //trustedContactQR
        setLoading(false);
        setSecondaryDeviceOtp(custodyRequest2);
        props.navigation.navigate('Home', { custodyRequest: custodyRequest2 });
        break;
      case 'recoveryQR':
        const recoveryRequest = {
          requester: scannedData.requester,
          rk: scannedData.ENCRYPTED_KEY,
          otp: scannedData.OTP,
          isQR: true,
        };
        setLoading(false);
        props.navigation.navigate('Home', { recoveryRequest });
      default:
        break;
    }
  };

  const renderTransactionContent = useCallback(() => {
    return renderTransactionsContent();
  }, [AtCloseEnd, transactions]);

  function renderTransactionHeader() {
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
  }

  const renderTransactionDetailsContents = useCallback(() => {
    return (
      <TransactionDetails
        item={transactionItem}
        onPressKnowMore={() => {
          (TransactionDetailsHelperBottomSheet as any).current.snapTo(1);
        }}
      />
    );
  }, [transactionItem]);

  const renderTransactionDetailsHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          if (TransactionDetailsBottomSheet.current)
            (TransactionDetailsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [transactionItem]);

  function renderAddContent() {
    return (
      <AddModalContents
        onPressElements={(type) => {
          if (
            type == 'Fastbitcoins' ||
            type == 'Getbittr' ||
            type == 'Add Contact'
          ) {
            setTimeout(() => {
              setAddSubBottomSheetsFlag(true);
              setTabBarZIndex(0);
              setSelectToAdd(type);
            }, 2);
            (AddBottomSheet as any).current.snapTo(1);
          }
        }}
        addData={modaldata}
      />
    );
  }

  function renderAddHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => openCloseModal()}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>{'Add'}</Text>
      </TouchableOpacity>
    );
  }

  function renderQrContent() {
    return (
      <QrCodeModalContents
        modalRef={QrTabBarBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => getQrCodeData(qrData)}
        onPressQrScanner={() => {
          props.navigation.navigate('QrScanner', {
            scanedCode: getQrCodeData,
          });
        }}
      />
    );
  }

  function renderQrHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => openCloseModal()}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>{'QR'}</Text>
      </TouchableOpacity>
    );
  }

  function renderMoreContent() {
    return (
      <MoreHomePageTabContents
        onPressElements={(item) => onPressElement(item)}
      />
    );
  }

  function renderMoreHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => openCloseModal()}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>{'More'}</Text>
      </TouchableOpacity>
    );
  }

  function openCloseModal() {
    if (openmodal == 'closed') {
      setOpenmodal('half');
    }
    if (openmodal == 'half') {
      setOpenmodal('full');
    }
    if (openmodal == 'full') {
      setOpenmodal('closed');
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setQrBottomSheetsFlag(false);
    }, 10);
    if (selected == 'Transactions') {
      if (openmodal == 'closed') {
        (transactionTabBarBottomSheet as any).current.snapTo(1);
      }
      if (openmodal == 'half') {
        (transactionTabBarBottomSheet as any).current.snapTo(2);
      }
      if (openmodal == 'full') {
        (transactionTabBarBottomSheet as any).current.snapTo(3);
      }
    } else if (selected == 'Add') {
      if (openmodal == 'closed') {
        setTimeout(() => {
          setQrBottomSheetsFlag(false);
        }, 10);
        (addTabBarBottomSheet as any).current.snapTo(1);
      }
      if (openmodal == 'half' || openmodal == 'full') {
        (addTabBarBottomSheet as any).current.snapTo(2);
      }
    } else if (selected == 'QR') {
      if (openmodal == 'closed') {
        setTimeout(() => {
          setQrBottomSheetsFlag(false);
        }, 10);
        (QrTabBarBottomSheet as any).current.snapTo(1);
      }
      if (openmodal == 'half' || openmodal == 'full') {
        setTimeout(() => {
          setQrBottomSheetsFlag(true);
        }, 10);
        (QrTabBarBottomSheet as any).current.snapTo(2);
      }
    } else if (selected == 'More') {
      if (openmodal == 'closed') {
        (moreTabBarBottomSheet as any).current.snapTo(1);
      }
      if (openmodal == 'half' || openmodal == 'full') {
        (moreTabBarBottomSheet as any).current.snapTo(2);
      }
    }
  }, [openmodal]);

  async function selectTab(tabTitle) {
    if (tabTitle == 'More') {
      setTimeout(() => {
        setKnowMoreBottomSheetsFlag(true);
        setSelected(tabTitle);
        setSelected(tabTitle);
      }, 2);
      (transactionTabBarBottomSheet as any).current.snapTo(0);
      (addTabBarBottomSheet.current as any).snapTo(0);
      (QrTabBarBottomSheet.current as any).snapTo(0);
      (moreTabBarBottomSheet.current as any).snapTo(2);
    }
    if (tabTitle == 'Transactions') {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 2);
      (transactionTabBarBottomSheet as any).current.snapTo(2);
      (addTabBarBottomSheet.current as any).snapTo(0);
      (QrTabBarBottomSheet.current as any).snapTo(0);
      (moreTabBarBottomSheet.current as any).snapTo(0);
    }
    if (tabTitle == 'Add') {
      setTimeout(() => {
        setAddBottomSheetsFlag(true);
        setModaldata([]);
        setSelected(tabTitle);
      }, 2);
      (transactionTabBarBottomSheet as any).current.snapTo(0);
      (addTabBarBottomSheet.current as any).snapTo(2);
      (QrTabBarBottomSheet.current as any).snapTo(0);
      (moreTabBarBottomSheet.current as any).snapTo(0);
    }
    if (tabTitle == 'QR') {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 2);
      (transactionTabBarBottomSheet as any).current.snapTo(0);
      (addTabBarBottomSheet.current as any).snapTo(0);
      (QrTabBarBottomSheet.current as any).snapTo(2);
      (moreTabBarBottomSheet.current as any).snapTo(0);
    }
  }

  const renderNoInternetModalContent = () => {
    return (
      <NoInternetModalContents
        onPressTryAgain={() => {}}
        onPressIgnore={() => {
          (NoInternetBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderNoInternetModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (NoInternetBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // const renderErrorModalContent = () => {
  //   return (
  //     <ErrorModalContents
  //       modalRef={ErrorBottomSheet}
  //       title={'Something went wrong'}
  //       info={'There seems to a problem'}
  //       note={'Please try again'}
  //       proceedButtonText={'Try Again'}
  //       isIgnoreButton={true}
  //       onPressProceed={() => {
  //         (ErrorBottomSheet as any).current.snapTo(0);
  //       }}
  //       onPressIgnore={() => {
  //         (ErrorBottomSheet as any).current.snapTo(0);
  //       }}
  //       isBottomImage={true}
  //       bottomImage={require('../assets/images/icons/errorImage.png')}
  //     />
  //   );
  // };

  // const renderErrorModalHeader = () => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (ErrorBottomSheet as any).current.snapTo(0);
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //       }}
  //     />
  //   );
  // };

  const { UNDER_CUSTODY } = useSelector(
    (state) => state.storage.database.DECENTRALIZED_BACKUP,
  );
  const renderCustodianRequestModalContent = useCallback(() => {
    if (!custodyRequest) return;

    return (
      <CustodianRequestModalContents
        loading={loading}
        userName={custodyRequest.requester}
        onPressAcceptSecret={() => {
          setLoading(true);
          setTimeout(() => {
            setTabBarZIndex(0);
            setDeepLinkModalOpen(false);
          }, 2);
          (CustodianRequestBottomSheet as any).current.snapTo(0);

          if (Date.now() - custodyRequest.uploadedAt > 600000) {
            Alert.alert(
              'Request expired!',
              'Please ask the sender to initiate a new request',
            );
            setLoading(false);
          } else {
            if (UNDER_CUSTODY[custodyRequest.requester]) {
              Alert.alert(
                'Failed to store',
                'You cannot custody multiple shares of the same user.',
              );
              setLoading(false);
            } else {
              if (custodyRequest.isQR) {
                dispatch(downloadMShare(custodyRequest.otp, custodyRequest.ek));
                setLoading(false);
              } else {
                props.navigation.navigate('CustodianRequestOTP', {
                  custodyRequest,
                });
                setLoading(false);
              }
            }
          }
        }}
        onPressRejectSecret={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 2);
          (CustodianRequestBottomSheet as any).current.snapTo(0);
          (CustodianRequestRejectedBottomSheet as any).current.snapTo(1);
        }}
      />
    );
  }, [custodyRequest, loading]);

  // const renderRecoveryRequestModalContent = useCallback(() => {
  //   if (!recoveryRequest) return <View></View>;

  //   return (
  //     <CustodianRequestModalContents
  //       userName={recoveryRequest.requester}
  //       onPressAcceptSecret={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //         (RecoveryRequestBottomSheet as any).current.snapTo(0);
  //         props.navigation.navigate('RecoveryRequestOTP', { recoveryRequest });
  //       }}
  //       onPressRejectSecret={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //         (RecoveryRequestBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, [recoveryRequest]);

  // const renderCustodianRequestOtpModalContent = () => {
  //   return (
  //     <CustodianRequestOtpModalContents
  //       title1stLine={'Enter OTP to'}
  //       title2ndLine={'accept request'}
  //       info1stLine={'Please enter the 6 digit OTP the owner'}
  //       info2ndLine={'of secret shared with you'}
  //       subInfo1stLine={
  //         'The OTP is time sensitive, please be sure to enter the OTP '
  //       }
  //       subInfo2ndLine={'shared within 15minutes'}
  //       modalRef={CustodianRequestOtpBottomSheet}
  //       onPressConfirm={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //         (CustodianRequestOtpBottomSheet as any).current.snapTo(0);
  //         (CustodianRequestAcceptBottomSheet as any).current.snapTo(1);
  //       }}
  //     />
  //   );
  // };

  const renderCustodianRequestRejectedModalContent = useCallback(() => {
    if (!custodyRequest) return <View></View>;
    return (
      <CustodianRequestRejectedModalContents
        onPressViewThrustedContacts={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (CustodianRequestRejectedBottomSheet as any).current.snapTo(0);
        }}
        userName={custodyRequest.requester}
      />
    );
  }, [custodyRequest]);

  // const renderCustodianRequestAcceptModalContent = () => {
  //   if (!custodyRequest) return <View></View>;
  //   return (
  //     <CustodianRequestAcceptModalContents
  //       userName={custodyRequest.requester}
  //       onPressAssociateContacts={() => {}}
  //       onPressSkip={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(999);
  //         }, 2);
  //         (CustodianRequestAcceptBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  const renderCustodianRequestModalHeader = useCallback(() => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
            setDeepLinkModalOpen(false);
          }, 2);
          (CustodianRequestBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  // const renderRecoveryRequestModalHeader = useCallback(() => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(999);
  //         }, 2);
  //         (RecoveryRequestBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, []);

  const onPressElement = (item) => {
    if (item.title == 'Backup Health') {
      props.navigation.navigate('ManageBackup');
    }
    if (item.title == 'Address Book') {
      (addressBookBottomSheet as any).current.snapTo(1);
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 10);
    } else if (item.title == 'Settings') {
      (settingsBottomSheet as any).current.snapTo(1);
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 10);
    }
    // else if (item.title == 'All accounts and funds') {
    //   (AllAccountsBottomSheet as any).current.snapTo(1);
    //   setTimeout(() => {
    //     setTabBarZIndex(0);
    //   }, 10);
    // }
  };

  const managePinSuccessProceed = (pin) => {
    setTimeout(() => {
      setTabBarZIndex(999);
    }, 10);
    (settingsBottomSheet as any).current.snapTo(0);
  };

  const onPressSettingsElements = async (type, currencycode) => {
    if (type == 'ManagePin') {
      return props.navigation.navigate('SettingManagePin', {
        managePinSuccessProceed: (pin) => managePinSuccessProceed(pin),
      });
    } else if (type == 'ManageCurrency') {
      setCurrencyCode(currencycode);
    }
  };

  const renderSettingsContents = () => {
    return (
      <SettingsContents
        currencyCode={CurrencyCode}
        onPressManagePin={(type, currencycode) =>
          onPressSettingsElements(type, currencycode)
        }
        onPressBack={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          (settingsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSettingsHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          (settingsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderAllAccountsContents = () => {
    return (
      <AllAccountsContents
        onPressBack={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          (AllAccountsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderAllAccountsHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          (AllAccountsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const getAssociatedContact = async () => {
    let SelectedContacts = JSON.parse(
      await AsyncStorage.getItem('SelectedContacts'),
    );
    setSelectedContacts(SelectedContacts);
    let AssociatedContact = JSON.parse(
      await AsyncStorage.getItem('AssociatedContacts'),
    );
    setAssociatedContact(AssociatedContact);
    let SecondaryDeviceAddress = JSON.parse(
      await AsyncStorage.getItem('secondaryDeviceAddress'),
    );
    setSecondaryDeviceAddress(SecondaryDeviceAddress);
  };

  const renderAddressBookContents = () => {
    return (
      <AddressBookContents
        SecondaryDeviceAddress={SecondaryDeviceAddress}
        AssociatedContact={AssociatedContact}
        SelectedContacts={SelectedContacts}
        onPressBack={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (addressBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderAddressBookHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (addressBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // const renderCustodianRequestOtpModalHeader = () => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(999);
  //         }, 2);
  //         (CustodianRequestOtpBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  const renderCustodianRequestRejectedModalHeader = useCallback(() => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (CustodianRequestRejectedBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  // const renderCustodianRequestAcceptModalHeader = () => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(999);
  //         }, 2);
  //         (CustodianRequestAcceptBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  const renderGetBittrRecurringBuyContents = () => {
    return (
      <GetBittrRecurringBuyContents
        onPressBack={() => {
          (GetBittrRecurringBuy as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderGetBittrRecurringBuyHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setAddSubBottomSheetsFlag(false);
            setTabBarZIndex(999);
          }, 2);
          (GetBittrRecurringBuy as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderGetBittrSaveBitcoinContents = () => {
    return (
      <SaveBitcoinModalContents
        onPressBack={() => {
          (AddBottomSheet as any).current.snapTo(0);
        }}
        onPressElements={(type) => onPressSaveBitcoinElements(type)}
      />
    );
  };

  const onPressSaveBitcoinElements = (type) => {
    if (type == 'recurringBuy') {
      (GetBittrRecurringBuy as any).current.snapTo(1);
    } else if (type == 'existingSavingMethods') {
      props.navigation.navigate('ExistingSavingMethods');
    }
  };

  const renderAddModalContents = () => {
    if (selectToAdd == 'Getbittr') {
      return renderGetBittrSaveBitcoinContents();
    } else if (selectToAdd == 'Fastbitcoins') {
      return (
        <FastBitcoinModalContents
          onPressSellTab={() => {
            setTimeout(() => {
              setTabSelected('sell');
            }, 2);
            (fastBitcoinSellCalculationBottomSheet as any).current.snapTo(1);
          }}
          onPressRedeemTab={() => {
            setTimeout(() => {
              setTabSelected('redeem');
            }, 2);
            (fastBitcoinRedeemCalculationBottomSheet as any).current.snapTo(1);
          }}
          onPressBack={() => {
            setTimeout(() => {
              setAddSubBottomSheetsFlag(false);
              setTabBarZIndex(999);
            }, 2);
            (AddBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    } else if (selectToAdd == 'Add Contact') {
      return (
        <AddContactsModalContents
          onPressFriendAndFamily={() => {
            setTimeout(() => {
              setFamilyAndFriendsBookBottomSheetsFlag(true);
            }, 2);
            (FamilyAndFriendAddressBookBottomSheet as any).current.snapTo(1);
          }}
          onPressBiller={() => {
            setTimeout(() => {
              setFamilyAndFriendsBookBottomSheetsFlag(true);
            }, 2);
            (FamilyAndFriendAddressBookBottomSheet as any).current.snapTo(1);
          }}
          onPressBack={() => {
            setTimeout(() => {
              setAddSubBottomSheetsFlag(false);
              setTabBarZIndex(999);
            }, 2);
            (AddBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    } else {
      return null;
    }
  };

  const renderAddModalHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setAddSubBottomSheetsFlag(false);
            setTabBarZIndex(999);
          }, 2);
          (AddBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderFastBitcoinRedeemCalculationContents = () => {
    return (
      <FastBitcoinCalculationModalContents
        navigation={props.navigation}
        modalRef={fastBitcoinRedeemCalculationBottomSheet}
        pageInfo={
          'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
        }
        pageTitle={'Redeem Voucher'}
        noteTitle={'Lorem ipsum'}
        noteInfo={'Lorem ipsum dolor sit amet, consectetur'}
        proceedButtonText="Calculate"
        onPressBack={() => {
          (fastBitcoinRedeemCalculationBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderFastBitcoinSellCalculationContents = () => {
    return (
      <FastBitcoinCalculationModalContents
        navigation={props.navigation}
        modalRef={fastBitcoinSellCalculationBottomSheet}
        pageInfo={
          'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
        }
        pageTitle={'Sell Bitcoins'}
        noteTitle={'Lorem ipsum'}
        noteInfo={'Lorem ipsum dolor sit amet, consectetur'}
        proceedButtonText={'Calculate'}
        onPressBack={() => {
          (fastBitcoinSellCalculationBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderFastBitcoinSellCalculationHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          (fastBitcoinSellCalculationBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderFastBitcoinRedeemCalculationHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          (fastBitcoinRedeemCalculationBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderContactSelectedFromAddressBookContents = () => {
    return (
      <SelectedContactFromAddressBook
        onPressQrScanner={() => {
          props.navigation.navigate('QrScanner', { scanedCode: getQrCodeData });
        }}
        onPressProceed={() => {
          (ContactSelectedFromAddressBookQrCodeBottomSheet as any).current.snapTo(
            1,
          );
        }}
        onPressBack={() => {
          (ContactSelectedFromAddressBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderContactSelectedFromAddressBookHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          (ContactSelectedFromAddressBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderContactSelectedFromAddressBookQrCodeContents = () => {
    return (
      <SelectedContactFromAddressBookQrCode
        onPressProceed={() => {
          (ContactSelectedFromAddressBookQrCodeBottomSheet as any).current.snapTo(
            0,
          );
        }}
        onPressBack={() => {
          (ContactSelectedFromAddressBookQrCodeBottomSheet as any).current.snapTo(
            0,
          );
        }}
      />
    );
  };

  const renderContactSelectedFromAddressBookQrCodeHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          (ContactSelectedFromAddressBookQrCodeBottomSheet as any).current.snapTo(
            0,
          );
        }}
      />
    );
  };

  const renderFamilyAndFriendAddressBookContents = () => {
    return (
      <FamilyandFriendsAddressBookModalContents
        modalRef={FamilyAndFriendAddressBookBottomSheet}
        proceedButtonText={'Confirm & Proceed'}
        onPressProceed={() => {
          (ContactSelectedFromAddressBookBottomSheet as any).current.snapTo(1);
        }}
        onPressBack={() => {
          setTimeout(() => {
            setFamilyAndFriendsBookBottomSheetsFlag(false);
          }, 2);
          (FamilyAndFriendAddressBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderFamilyAndFriendAddressBookHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          setTimeout(() => {
            setFamilyAndFriendsBookBottomSheetsFlag(false);
          }, 2);
          (FamilyAndFriendAddressBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // const submitRecoveryQuestion = () => {
  //   (HealthCheckSecurityQuestionBottomSheet as any).current.snapTo(0);
  //   (HealthCheckGoogleAuthBottomSheet as any).current.snapTo(1);
  //   Keyboard.dismiss();
  // };

  // const renderHealthCheckSecurityQuestionContents = () => {
  //   return (
  //     <HealthCheckSecurityQuestionModalContents
  //       onQuestionSelect={ value => {
  //         setDropdownBoxValue( value );
  //       } }
  //       onTextChange={ text => {
  //         setAnswer( text );
  //       } }
  //       onPressConfirm={ () => submitRecoveryQuestion() }
  //       onPressKnowMore={ () => { } }
  //       bottomSheetRef={ HealthCheckSecurityQuestionBottomSheet }
  //     />
  //   );
  // };

  // const renderHealthCheckSecurityQuestionHeader = () => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={ () => {
  //         ( HealthCheckSecurityQuestionBottomSheet as any ).current.snapTo( 0 );
  //       } }
  //     />
  //   );
  // };

  let isNavigate = false;
  let isContactOpen = false;
  let isCameraOpen = false;
  const handleAppStateChange = async (nextAppState) => {
    AsyncStorage.getItem('isContactOpen', (err, value) => {
      if (err) console.log(err);
      else {
        isContactOpen = JSON.parse(value);
      }
    });
    AsyncStorage.getItem('isCameraOpen', (err, value) => {
      if (err) console.log(err);
      else {
        isCameraOpen = JSON.parse(value);
      }
    });
    if (isCameraOpen) {
      await AsyncStorage.setItem('isCameraOpen', JSON.stringify(false));
      return;
    }
    if (isContactOpen) {
      await AsyncStorage.setItem('isContactOpen', JSON.stringify(false));
      return;
    }
    var blockApp = setTimeout(() => {
      if (isNavigate) {
        props.navigation.navigate('ReLogin');
      }
    }, 15000);
    if (
      Platform.OS == 'android'
        ? nextAppState == 'active'
        : nextAppState == 'background'
    ) {
      clearTimeout(blockApp);
      isNavigate = true; // producing a subtle delay to let deep link event listener make the first move
    } else {
      isNavigate = false;
    }
  };

  const handleDeepLink = useCallback((event) => {
    const splits = event.url.split('/');
    const requester = splits[4];

    if (splits[5] === 'sss') {
      if (splits[6] === 'ek') {
        const custodyRequest = {
          requester,
          ek: splits[7],
          uploadedAt: splits[8],
        };
        props.navigation.navigate('Home', { custodyRequest });
      } else if (splits[6] === 'rk') {
        const recoveryRequest = { requester, rk: splits[7] };
        props.navigation.replace('Home', { recoveryRequest });
      }
    } else {
      const EmailToken = event.url.substr(event.url.lastIndexOf('/') + 1);
      console.log('EmailToken', EmailToken);
      props.navigation.navigate('SignUpDetails', { EmailToken });
    }
  }, []);

  useEffect(() => {
    if (custodyRequest) {
      if (tabBarZIndex == 999) {
        setTimeout(() => {
          setTabBarZIndex(0);
          setDeepLinkModalOpen(true);
        }, 2);
      }
      setTimeout(() => {
        if (
          addressBookBottomSheet.current &&
          AllAccountsBottomSheet.current &&
          settingsBottomSheet.current
        ) {
          (addressBookBottomSheet as any).current.snapTo(0);
          (AllAccountsBottomSheet as any).current.snapTo(0);
          (settingsBottomSheet.current as any).snapTo(0);
        }
        (CustodianRequestBottomSheet as any).current.snapTo(1);
        (transactionTabBarBottomSheet as any).current.snapTo(1);
      }, 30);
    }

    if (recoveryRequest) {
      if (tabBarZIndex == 999) {
        setTimeout(() => {
          setTabBarZIndex(0);
          setDeepLinkModalOpen(true);
        }, 2);
      }
      (RecoverySecretRequestBottomSheet as any).current.snapTo(1);
      (transactionTabBarBottomSheet as any).current.snapTo(1);
    }
  }, [custodyRequest, recoveryRequest]);

  // const s3Service = useSelector(state => state.sss.service);
  const [overallHealth, setOverallHealth] = useState();

  const health = useSelector((state) => state.sss.overallHealth);
  useEffect(() => {
    if (health) setOverallHealth(health);
  }, [health]);

  useEffect(() => {
    (async () => {
      const getBittrDetails = JSON.parse(
        await AsyncStorage.getItem('getBittrDetails'),
      );
      console.log({ getBittrDetails });
      if (!getBittrDetails) {
        dispatch(fetchGetBittrDetails());
      }
    })();
  }, []);

  // useEffect(() => {
  //   dispatch(runTest());
  // }, []);

  // useEffect(() => {
  //   const unsubscribe = NetInfo.addEventListener(state => {
  //     console.log('Connection type', state.type);
  //     console.log('Is connected?', state.isConnected);
  //
  //     if (!state.isConnected) {
  //       (NoInternetBottomSheet as any).current.snapTo(1);
  //     } else {
  //       (NoInternetBottomSheet as any).current.snapTo(0);
  //     }
  //   });

  //   // return unsubscribe; // unsubscribing
  // }, []);

  // const s3Service = useSelector(state => state.sss.service);
  // useEffect(() => {
  //   if (s3Service)
  //     if (!s3Service.sss.healthCheckInitialized) dispatch(initHealthCheck());
  // }, [s3Service]);

  // const testAccService = accounts[TEST_ACCOUNT].service;
  // useEffect(() => {
  //   (async () => {
  //     if (testAccService && !(await AsyncStorage.getItem('walletRecovered')))
  //       if (!(await AsyncStorage.getItem('Received Testcoins'))) {
  //         const { balances } = testAccService.hdWallet;
  //         const netBalance = testAccService
  //           ? balances.balance + balances.unconfirmedBalance
  //           : 0;
  //         if (!netBalance) {
  //           console.log('Getting Testcoins');
  //           dispatch(getTestcoins(TEST_ACCOUNT));
  //         }
  //       }
  //   })();
  // }, [testAccService]);

  // useEffect(() => {
  //   (async () => {
  //     const storedExchangeRates = await AsyncStorage.getItem('exchangeRates');
  //     if (storedExchangeRates) {
  //       const exchangeRates = JSON.parse(storedExchangeRates);
  //       if (Date.now() - exchangeRates.lastFetched < 1800000) {
  //         setExchangeRates(exchangeRates);
  //         return;
  //       } // maintaining a half an hour difference b/w fetches
  //     }
  //     const res = await axios.get('https://blockchain.info/ticker');
  //     if (res.status == 200) {
  //       const exchangeRates = res.data;
  //       exchangeRates.lastFetched = Date.now();
  //       setExchangeRates(exchangeRates);
  //       await AsyncStorage.setItem(
  //         'exchangeRates',
  //         JSON.stringify(exchangeRates),
  //       );
  //     } else {
  //       console.log('Failed to retrieve exchange rates', res);
  //     }
  //   })();
  // }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (await AsyncStorage.getItem('walletRecovered')) {
  //       dispatch(fetchBalance(TEST_ACCOUNT));
  //       dispatch(fetchBalance(REGULAR_ACCOUNT));
  //       dispatch(fetchBalance(SECURE_ACCOUNT));
  //       dispatch(fetchTransactions(TEST_ACCOUNT));
  //       dispatch(fetchTransactions(REGULAR_ACCOUNT));
  //       dispatch(fetchTransactions(SECURE_ACCOUNT));

  //       setTimeout(() => {
  //         AsyncStorage.removeItem('walletRecovered');
  //       }, 3000);
  //     }
  //   })();
  // }, []);

  const renderRecoverySecretRequestModalContent = useCallback(() => {
    if (!recoveryRequest) return <View></View>;
    return (
      <RecoverySecretRequestModalContents
        name={recoveryRequest.requester}
        title={'You have a Recovery Request\nfrom your Trusted Contact'}
        infoText={
          'Please contact the sender to get\nthe OTP and share the secret'
        }
        subTitle={'Message from the Sender'}
        subTitleInfo={
          'I am trying to restore my Hexa wallet and need the Recovery Secret shared with you'
        }
        acceptButtonName={'Accept Request'}
        rejectButtonName={'Reject Request'}
        onPressAccept={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 2);
          (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
          if (!UNDER_CUSTODY[recoveryRequest.requester]) {
            Alert.alert(
              'Failed to send!',
              'You do not host any secret for this user.',
            );
            setLoading(false);
          } else {
            if (recoveryRequest.isQR) {
              dispatch(
                uploadRequestedShare(
                  recoveryRequest.requester,
                  recoveryRequest.rk,
                  recoveryRequest.otp,
                ),
              );
            } else {
              props.navigation.navigate('RecoveryRequestOTP', {
                recoveryRequest,
              });
            }
          }
        }}
        onPressReject={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 2);
          (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [recoveryRequest]);

  const renderRecoverySecretRequestModalHeader = useCallback(() => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 2);
        }}
      />
    );
  }, []);

  // const renderShareRecoverySecretQrCodeModalContent = () => {
  //   return (
  //     <ShareRecoverySecretModalContents
  //       title={'Share Recovery Secret\nto trusted contact'}
  //       infoText={
  //         'Share Recovery Secret to Trusted Contact, this will enable\nthem to restore their Hexa Wallet'
  //       }
  //       sunInfoText={
  //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt'
  //       }
  //       shareVia={'qr'}
  //       name={'Pamela Aalto'}
  //       contactInfo={'+44 0000 000000'}
  //       buttonText={'Share via QR'}
  //       onPressRequest={() => {
  //         ShareRecoverySecretBottomSheet.current.snapTo(1);
  //       }}
  //       onPressViaQr={() => {}}
  //       modalRef={ShareRecoverySecretBottomSheet}
  //     />
  //   );
  // };

  // const renderShareRecoverySecretQrCodeModalHeader = () => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         (ShareRecoverySecretBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  // const renderShareRecoverySecretOtpModalContent = () => {
  //   return (
  //     <ShareRecoverySecretModalContents
  //       title={'Share Recovery Secret\nto trusted contact'}
  //       infoText={
  //         'Share Recovery Secret to Trusted Contact, this will enable\nthem to restore their Hexa Wallet'
  //       }
  //       sunInfoText={
  //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt'
  //       }
  //       shareVia={'otp'}
  //       name={'Pamela Aalto'}
  //       contactInfo={'+44 0000 000000'}
  //       buttonText={'Share via QR'}
  //       onPressRequest={() => {
  //         ShareRecoverySecretOtpBottomSheet.current.snapTo(1);
  //       }}
  //       onPressViaQr={() => {}}
  //       modalRef={ShareRecoverySecretOtpBottomSheet}
  //     />
  //   );
  // };

  // const renderShareRecoverySecretOtpModalHeader = () => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         (ShareRecoverySecretBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  // const renderRegenerateContent = () => {
  //   return (
  //     <ErrorModalContents
  //       modalRef={RegenerateBottomSheet}
  //       title={'Regenerate\nRecovery Secrets'}
  //       info={'Did you make too many errors?'}
  //       note={'You can regenerate your Recovery Secrets\nand start over'}
  //       proceedButtonText={'Regenerate'}
  //       cancelButtonText={'Back'}
  //       isIgnoreButton={true}
  //       onPressProceed={() => {
  //         (RegenerateBottomSheet as any).current.snapTo(0);
  //       }}
  //       onPressIgnore={() => {
  //         (RegenerateBottomSheet as any).current.snapTo(0);
  //       }}
  //       isBottomImage={false}
  //     />
  //   );
  // };

  // const renderRegenerateHeader = () => {
  //   return (
  //     <ModalHeader
  //       onPressHeader={() => {
  //         (RegenerateBottomSheet as any).current.snapTo(0);
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //       }}
  //     />
  //   );
  // };

  const onPressNotifications = () => {
    (notificationsListBottomSheet as any).current.snapTo(1);
  };

  const renderNotificationsContent = useCallback(() => {
    return (
      <NotificationListContent
        onPressBack={() => {
          (notificationsListBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderNotificationsHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (notificationsListBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

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
        <View style={{ ...styles.headerViewContainer, flex: 1 }}>
          <View style={{ flexDirection: 'row', height: '100%' }}>
            <View style={{ ...styles.headerTitleViewContainer }}>
              <TouchableOpacity
                onPress={() => onPressNotifications()}
                style={{
                  height: wp('10%'),
                  width: wp('10%'),
                  justifyContent: 'center',
                }}
              >
                <ImageBackground
                  source={require('../assets/images/icons/icon_notification.png')}
                  style={{ width: wp('6%'), height: wp('6%') }}
                  resizeMode={'contain'}
                >
                  <View
                    style={{
                      backgroundColor: Colors.red,
                      height: wp('2.5%'),
                      width: wp('2.5%'),
                      borderRadius: wp('2.5%') / 2,
                      alignSelf: 'flex-end',
                    }}
                  />
                </ImageBackground>
              </TouchableOpacity>
              <View style={{ marginBottom: wp('2%') }}>
                <Text
                  style={styles.headerTitleText}
                >{`${walletName}’s Wallet`}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    marginBottom: wp('3%'),
                  }}
                >
                  {switchOn ? (
                    <Image
                      style={{
                        ...CommonStyles.homepageAmountImage,
                        marginBottom: wp('1.5%'),
                      }}
                      source={require('../assets/images/icons/icon_bitcoin_light.png')}
                    />
                  ) : (
                    <Image
                      style={{
                        ...styles.cardBitCoinImage,
                        marginBottom: wp('1.5%'),
                      }}
                      source={getCurrencyImageByRegion(CurrencyCode, 'light')}
                    />
                  )}
                  <Text
                    style={{
                      ...CommonStyles.homepageAmountText,
                      color: Colors.white,
                    }}
                  >
                    {switchOn
                      ? UsNumberFormat(balances.accumulativeBalance)
                      : exchangeRates
                      ? (
                          (balances.accumulativeBalance / 1e8) *
                          exchangeRates[CurrencyCode].last
                        ).toFixed(2)
                      : 0}
                  </Text>
                  <Text
                    style={{
                      ...CommonStyles.homepageAmountUnitText,
                      color: Colors.white,
                    }}
                  >
                    {switchOn ? 'sats' : CurrencyCode.toLocaleLowerCase()}
                  </Text>
                </View>
                {messageAsPerHealth(
                  overallHealth ? overallHealth.overallStatus : 0,
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('ManageBackup');
                }}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>Manage Backup</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerToggleSwitchContainer}>
              <ToggleSwitch
                currencyCodeValue={CurrencyCode}
                onpress={async () => {
                  setSwitchOn(!switchOn);
                  let temp = !switchOn ? 'true' : '';
                  await AsyncStorage.setItem('currencyToggleValue', temp);
                }}
                toggle={switchOn}
              />
              <TouchableOpacity
                activeOpacity={10}
                onPress={() => {
                  props.navigation.navigate('ManageBackup');
                }}
              >
                <HomePageShield
                  shieldStatus={overallHealth ? overallHealth.overallStatus : 0}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flex: 7 }}>
        <View style={styles.cardViewContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={newData}
            extraData={{ balances, switchOn, walletName }}
            renderItem={(Items) => {
              return (
                <View style={{ flexDirection: 'column' }}>
                  {Items.item.map((value) => {
                    if (value.accountType === 'add') {
                      return (
                        <TouchableOpacity disabled={true}>
                          <CardView
                            cornerRadius={10}
                            style={{
                              ...styles.card,
                              opacity: 0.4,
                              backgroundColor: Colors.borderColor,
                            }}
                          >
                            <View
                              style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Image
                                style={{ width: wp('10%'), height: wp('10%') }}
                                source={require('../assets/images/icons/icon_add.png')}
                              />
                              <Text
                                style={{
                                  color: Colors.textColorGrey,
                                  fontSize: RFValue(11),
                                }}
                              >
                                Add Account
                              </Text>
                            </View>
                          </CardView>
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            props.navigation.navigate('Accounts', {
                              serviceType:
                                value.accountType === 'test'
                                  ? TEST_ACCOUNT
                                  : value.accountType === 'regular'
                                  ? REGULAR_ACCOUNT
                                  : SECURE_ACCOUNT,
                              index:
                                value.accountType === 'test'
                                  ? 0
                                  : value.accountType === 'regular'
                                  ? 1
                                  : 2,
                            });
                          }}
                        >
                          <CardView cornerRadius={10} style={styles.card}>
                            <View style={{ flexDirection: 'row' }}>
                              <Image
                                style={{ width: wp('10%'), height: wp('10%') }}
                                source={getIconByAccountType(value.accountType)}
                              />
                              {value.accountType == 'secure' ? (
                                <TouchableOpacity
                                  onPress={() => {
                                    // alert('2FA');
                                  }}
                                  style={{
                                    marginLeft: 'auto',
                                    paddingLeft: 10,
                                    paddingBottom: 10,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: Colors.blue,
                                      fontSize: RFValue(11),
                                      fontFamily: Fonts.FiraSansRegular,
                                    }}
                                  >
                                    2FA
                                  </Text>
                                </TouchableOpacity>
                              ) : null}
                            </View>
                            <View
                              style={{ flex: 1, justifyContent: 'flex-end' }}
                            >
                              <Text style={styles.cardTitle}>
                                {value.title}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: Fonts.FiraSansRegular,
                                  color: Colors.textColorGrey,
                                  fontSize: RFValue(11),
                                }}
                              >
                                {value.account}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'flex-end',
                                  marginTop: hp('1%'),
                                }}
                              >
                                {value.accountType === 'test' || switchOn ? (
                                  <Image
                                    style={styles.cardBitCoinImage}
                                    source={value.bitcoinicon}
                                  />
                                ) : (
                                  <Image
                                    style={styles.cardBitCoinImage}
                                    source={getCurrencyImageByRegion(
                                      CurrencyCode,
                                      'light_blue',
                                    )}
                                  />
                                )}
                                <Text
                                  style={
                                    accounts.accountsSynched
                                      ? styles.cardAmountText
                                      : styles.cardAmountTextGrey
                                  }
                                >
                                  {switchOn
                                    ? value.accountType === 'test'
                                      ? UsNumberFormat(balances.testBalance)
                                      : value.accountType === 'regular'
                                      ? UsNumberFormat(balances.regularBalance)
                                      : UsNumberFormat(balances.secureBalance)
                                    : value.accountType === 'test'
                                    ? UsNumberFormat(balances.testBalance)
                                    : value.accountType === 'regular' &&
                                      exchangeRates
                                    ? (
                                        (balances.regularBalance / 1e8) *
                                        exchangeRates[CurrencyCode].last
                                      ).toFixed(2)
                                    : exchangeRates
                                    ? (
                                        (balances.secureBalance / 1e8) *
                                        exchangeRates[CurrencyCode].last
                                      ).toFixed(2)
                                    : 0}
                                </Text>
                                <Text style={styles.cardAmountUnitText}>
                                  {switchOn
                                    ? value.unit
                                    : value.accountType === 'test'
                                    ? value.unit
                                    : CurrencyCode.toLocaleLowerCase()}
                                </Text>
                              </View>
                            </View>
                          </CardView>
                        </TouchableOpacity>
                      );
                    }
                  })}
                </View>
              );
            }}
          />
        </View>
      </View>
      {/* <TouchableWithoutFeedback>
        <Animated.View
          style={
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flex: 1,
              backgroundColor: '#000',
              opacity,
            }
          }
        />
      </TouchableWithoutFeedback> */}
      <BottomSheet
        onOpenEnd={() => {
          setAtCloseEnd(true);
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          if (selected == 'Transactions')
            (transactionTabBarBottomSheet as any).current.snapTo(1);
        }}
        onCloseStart={() => {
          setAtCloseEnd(false);
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={transactionTabBarBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('18%')
            : Platform.OS == 'android'
            ? hp('19%')
            : hp('18%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('64%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('84%') : hp('83%'),
        ]}
        renderContent={renderTransactionContent}
        renderHeader={renderTransactionHeader}
      />
      <BottomSheet
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          if (selected == 'Add')
            (addTabBarBottomSheet as any).current.snapTo(1);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={addTabBarBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('18%')
            : Platform.OS == 'android'
            ? hp('19%')
            : hp('18%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('64%'),
        ]}
        renderContent={renderAddContent}
        renderHeader={renderAddHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          if (selected == 'QR') {
            setQrBottomSheetsFlag(true);
          } else {
            setQrBottomSheetsFlag(false);
          }
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          if (selected == 'QR') (QrTabBarBottomSheet as any).current.snapTo(1);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        // initialSnap={ zeroIndex }
        // snapPoints={ snapPoints }
        // callbackNode={ position }
        // ref={bottomSheet}
        ref={QrTabBarBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('18%')
            : Platform.OS == 'android'
            ? hp('19%')
            : hp('18%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('84%') : hp('83%'),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
      />
      <BottomSheet
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          if (selected == 'More')
            (moreTabBarBottomSheet as any).current.snapTo(1);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={moreTabBarBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('18%')
            : Platform.OS == 'android'
            ? hp('19%')
            : hp('18%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('64%'),
        ]}
        renderContent={renderMoreContent}
        renderHeader={renderMoreHeader}
      />
      <BottomSheet
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={NoInternetBottomSheet as any}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderNoInternetModalContent}
        renderHeader={renderNoInternetModalHeader}
      />
      <BottomSheet
        onCloseEnd={() => {
          if (tabBarZIndex == 0 && !deepLinkModalOpen) {
            setTabBarZIndex(999);
          }
        }}
        onOpenEnd={() => {
          if (tabBarZIndex == 999) {
            setTabBarZIndex(0);
          }
          setDeepLinkModalOpen(true);
        }}
        enabledInnerScrolling={true}
        ref={CustodianRequestBottomSheet as any}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderCustodianRequestModalContent}
        renderHeader={renderCustodianRequestModalHeader}
      />
      <BottomSheet
        onCloseEnd={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
        }}
        onOpenEnd={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 2);
        }}
        enabledInnerScrolling={true}
        ref={RecoverySecretRequestBottomSheet as any}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderRecoverySecretRequestModalContent}
        renderHeader={renderRecoverySecretRequestModalHeader}
      />
      {/* <BottomSheet
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        onOpenStart={() => {
          setTabBarZIndex(0);
        }}
        enabledInnerScrolling={true}
        ref={RecoveryRequestBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderRecoveryRequestModalContent}
        renderHeader={renderRecoveryRequestModalHeader}
      /> */}
      {/* <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={CustodianRequestOtpBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('67%') : hp('60%'),
          Platform.OS == 'ios' ? hp('80%') : hp('70%'),
        ]}
        renderContent={renderCustodianRequestOtpModalContent}
        renderHeader={renderCustodianRequestOtpModalHeader}
      /> */}
      <BottomSheet
        onCloseStart={() => {
          setTabBarZIndex(999);
        }}
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        enabledInnerScrolling={true}
        ref={CustodianRequestRejectedBottomSheet as any}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderCustodianRequestRejectedModalContent}
        renderHeader={renderCustodianRequestRejectedModalHeader}
      />
      {KnowMoreBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(0);
            }
          }}
          onCloseEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(999);
            }
          }}
          enabledInnerScrolling={true}
          ref={addressBookBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('64%'),
          ]}
          renderContent={renderAddressBookContents}
          renderHeader={renderAddressBookHeader}
        />
      ) : null}
      {KnowMoreBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(0);
            }
          }}
          onCloseEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(999);
            }
          }}
          enabledInnerScrolling={true}
          ref={AllAccountsBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('64%'),
          ]}
          renderContent={renderAllAccountsContents}
          renderHeader={renderAllAccountsHeader}
        />
      ) : null}
      {KnowMoreBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(0);
            }
          }}
          onCloseEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(999);
            }
          }}
          enabledInnerScrolling={true}
          ref={settingsBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('64%'),
          ]}
          renderContent={renderSettingsContents}
          renderHeader={renderSettingsHeader}
        />
      ) : null}
      {/* <BottomSheet
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={CustodianRequestAcceptBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderCustodianRequestAcceptModalContent}
        renderHeader={renderCustodianRequestAcceptModalHeader}
      /> */}
      {/* <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      /> */}
      {/* <BottomSheet
        onOpenEnd={() => {}}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={transactionDetailsBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('90%') : hp('90%'),
        ]}
        renderContent={renderTransactionDetailsContents}
        renderHeader={renderTransactionDetailsHeader}
      /> */}

      <BottomSheet
        enabledInnerScrolling={true}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        onCloseStart={() => {
          setTabBarZIndex(999);
        }}
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        ref={TransactionDetailsBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('84%') : hp('83%'),
        ]}
        renderContent={renderTransactionDetailsContents}
        renderHeader={renderTransactionDetailsHeader}
      />

      {addBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(0);
            }
          }}
          onCloseEnd={() => {
            if (!deepLinkModalOpen) {
              setTabBarZIndex(999);
            }
            setAddSubBottomSheetsFlag(false);
          }}
          enabledInnerScrolling={true}
          ref={AddBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('64%'),
          ]}
          renderContent={renderAddModalContents}
          renderHeader={renderAddModalHeader}
        />
      ) : null}
      {addSubBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            setTabBarZIndex(0);
          }}
          enabledInnerScrolling={true}
          ref={fastBitcoinRedeemCalculationBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
            Platform.OS == 'ios' ? hp('90%') : hp('50%'),
          ]}
          renderContent={renderFastBitcoinRedeemCalculationContents}
          renderHeader={renderFastBitcoinRedeemCalculationHeader}
        />
      ) : null}
      {addSubBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            setTabBarZIndex(0);
          }}
          enabledInnerScrolling={true}
          ref={fastBitcoinSellCalculationBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
            Platform.OS == 'ios' ? hp('90%') : hp('50%'),
          ]}
          renderContent={renderFastBitcoinSellCalculationContents}
          renderHeader={renderFastBitcoinSellCalculationHeader}
        />
      ) : null}
      <BottomSheet
        onOpenEnd={() => {}}
        onCloseEnd={() => {}}
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
        ref={GetBittrRecurringBuy as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('84%') : hp('83%'),
        ]}
        renderContent={renderGetBittrRecurringBuyContents}
        renderHeader={renderGetBittrRecurringBuyHeader}
      />
      {addSubBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            setTabBarZIndex(0);
            setFamilyAndFriendsBookBottomSheetsFlag(true);
          }}
          onCloseStart={() => {
            setTabBarZIndex(999);
            setFamilyAndFriendsBookBottomSheetsFlag(false);
          }}
          enabledInnerScrolling={true}
          ref={FamilyAndFriendAddressBookBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
          ]}
          renderContent={renderFamilyAndFriendAddressBookContents}
          renderHeader={renderFamilyAndFriendAddressBookHeader}
        />
      ) : null}
      {familyAndFriendsBookBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {}}
          enabledInnerScrolling={true}
          ref={ContactSelectedFromAddressBookBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
          ]}
          renderContent={renderContactSelectedFromAddressBookContents}
          renderHeader={renderContactSelectedFromAddressBookHeader}
        />
      ) : null}
      {familyAndFriendsBookBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {}}
          enabledInnerScrolling={true}
          ref={ContactSelectedFromAddressBookQrCodeBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
          ]}
          renderContent={renderContactSelectedFromAddressBookQrCodeContents}
          renderHeader={renderContactSelectedFromAddressBookQrCodeHeader}
        />
      ) : null}

      <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={notificationsListBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('84%') : hp('83%'),
        ]}
        renderContent={renderNotificationsContent}
        renderHeader={renderNotificationsHeader}
      />
      {/* <BottomSheet
        onOpenStart={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={HealthCheckSecurityQuestionBottomSheet}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('67%') : hp('75%'),
          Platform.OS == 'ios' ? hp('90%') : hp('72%'),
        ]}
        renderContent={renderHealthCheckSecurityQuestionContents}
        renderHeader={renderHealthCheckSecurityQuestionHeader}
      /> */}
      {/* <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        // onCloseEnd={() => { setTabBarZIndex(999); }}
        enabledInnerScrolling={true}
        ref={HealthCheckGoogleAuthBottomSheet}
        snapPoints={[-50, hp('58%'), hp('90%')]}
        renderContent={renderHealthCheckGoogleAuthContents}
        renderHeader={renderHealthCheckGoogleAuthHeader}
      /> */}
      {/* <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        enabledInnerScrolling={true}
        ref={HealthCheckSuccessBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderHealthCheckSuccessModalContent}
        renderHeader={renderHealthCheckSuccessModalHeader}
      /> */}

      {/* <BottomSheet
        onOpenStart={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={ShareRecoverySecretBottomSheet}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('60%') : hp('75%'),
        ]}
        renderContent={renderShareRecoverySecretQrCodeModalContent}
        renderHeader={renderShareRecoverySecretQrCodeModalHeader}
      /> */}
      {/* <BottomSheet
        onOpenStart={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={ShareRecoverySecretOtpBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('60%') : hp('75%'),
          hp('95%'),
        ]}
        renderContent={renderShareRecoverySecretOtpModalContent}
        renderHeader={renderShareRecoverySecretOtpModalHeader}
      /> */}
      {/* <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={RegenerateBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderRegenerateContent}
        renderHeader={renderRegenerateHeader}
      /> */}

      {/* TODO: If we open full modal above tab bar first change zIndex to 0 and when we close that modal please zIndex to 999 by using setTabBarZIndex(0) or setTabBarZIndex(999) */}
      <View style={{ ...styles.bottomTabBarContainer, zIndex: tabBarZIndex }}>
        <TouchableOpacity
          onPress={() => selectTab('Transactions')}
          style={styles.tabBarTabView}
        >
          {selected == 'Transactions' ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_transactions_active.png')}
                style={{ width: 25, height: 25, resizeMode: 'contain' }}
              />
              <Text style={styles.activeTabTextStyle}>transactions</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_transactions.png')}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => selectTab('Add')}
          style={styles.tabBarTabView}
        >
          {selected == 'Add' ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_add_active.png')}
                style={styles.tabBarImage}
              />
              <Text style={styles.activeTabTextStyle}>add</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_add.png')}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => selectTab('QR')}
          style={styles.tabBarTabView}
        >
          {selected == 'QR' ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_qr_active.png')}
                style={styles.tabBarImage}
              />
              <Text style={styles.activeTabTextStyle}>qr</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_qr.png')}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBarTabView}
          onPress={() => selectTab('More')}
        >
          {selected == 'More' ? (
            <View style={styles.activeTabStyle}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_more.png')}
                style={styles.tabBarImage}
              />
              <Text style={styles.activeTabTextStyle}>more</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={require('../assets/images/HomePageIcons/icon_more.png')}
                style={styles.tabBarImage}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

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
