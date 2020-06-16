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
import Fonts from './../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import DeviceInfo from 'react-native-device-info';
import ToggleSwitch from '../components/ToggleSwitch';
import { RFValue } from 'react-native-responsive-fontsize';
import CommonStyles from '../common/Styles';
import NoInternetModalContents from '../components/NoInternetModalContents';
import TransparentHeaderModal from '../components/TransparentHeaderModal';
import CustodianRequestModalContents from '../components/CustodianRequestModalContents';
import CustodianRequestRejectedModalContents from '../components/CustodianRequestRejectedModalContents';
import MoreHomePageTabContents from '../components/MoreHomePageTabContents';
import SmallHeaderModal from '../components/SmallHeaderModal';
import HomePageShield from '../components/HomePageShield';
import AddModalContents from '../components/AddModalContents';
import QrCodeModalContents from '../components/QrCodeModalContents';
import FastBitcoinCalculationModalContents from '../components/FastBitcoinCalculationModalContents';
import AddContactsModalContents from '../components/AddContactsModalContents';
import SelectedContactFromAddressBook from '../components/SelectedContactFromAddressBook';
import SelectedContactFromAddressBookQrCode from '../components/SelectedContactFromAddressBookQrCode';
import { AppState } from 'react-native';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../common/constants/serviceTypes';
import AllAccountsContents from '../components/AllAccountsContents';
import SettingsContents from '../components/SettingsContents';
import { useDispatch, useSelector } from 'react-redux';
import {
  downloadMShare,
  initHealthCheck,
  uploadRequestedShare,
  ErrorSending,
  ErrorReceiving,
  UploadSuccessfully,
} from '../store/actions/sss';
import moment from 'moment';
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
// const { Value, abs, sub, min } = Animated
// const snapPoints = [ Dimensions.get( 'screen' ).height - 150, 150 ]
// const position = new Value( 1 )
// const opacity = min( abs( sub( position, 1 ) ), 0.8 )
// const zeroIndex = snapPoints.length - 1
// const height = snapPoints[ 0 ]
import { timeFormatter, createRandomString } from '../common/CommonFunctions/timeFormatter';
import Config from 'react-native-config';
import RelayServices from '../bitcoin/services/RelayService';
import AddContactAddressBook from './Contacts/AddContactAddressBook';
import TrustedContactRequest from './Contacts/TrustedContactRequest';
import config from '../bitcoin/HexaConfig';
import TrustedContactsService from '../bitcoin/services/TrustedContactsService';
import {
  approveTrustedContact,
  fetchEphemeralChannel,
  clearPaymentDetails,
} from '../store/actions/trustedContacts';
import MessageAsPerHealth from '../components/home/messgae-health';
import TransactionsContent from '../components/home/transaction-content';
import SaveBitcoinModalContents from './FastBitcoin/SaveBitcoinModalContents';
import {
  fetchDerivativeAccBalTx,
  addTransferDetails,
} from '../store/actions/accounts';
import {
  TrustedContactDerivativeAccount,
  EphemeralData,
} from '../bitcoin/utilities/Interface';
import * as RNLocalize from "react-native-localize";

export default function Home(props) {
  // const trustedContacts: TrustedContactsService = useSelector(
  //   (state) => state.trustedContacts.service,
  // );
  // useEffect(() => {
  //   setTimeout(() => {
  //     dispatch(initializeTrustedContact('Blake'));
  //   }, 4000); // letting other db insertion happen
  // }, []);
  // //console.log(trustedContacts.tc.trustedContacts['Blake']);
  const [
    TrustedContactRequestBottomSheet,
    setTrustedContactRequestBottomSheet,
  ] = useState(React.createRef<BottomSheet>());

  const [SelectedContact, setSelectedContact] = useState([]);
  const notificationList = useSelector((state) => state.notifications);
  const [NotificationList, setNotificationList] = useState([]);
  const [
    notificationsListBottomSheet,
    setNotificationsListBottomSheet,
  ] = useState(React.createRef());
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
  // let [AssociatedContact, setAssociatedContact] = useState([]);
  // let [SelectedContacts, setSelectedContacts] = useState([]);
  // let [SecondaryDeviceAddress, setSecondaryDeviceAddress] = useState([]);
  let [associatedContactName, setAssociatedContactName] = useState('');
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
  // alert(status);
  // const DECENTRALIZED_BACKUP = useSelector(
  //   state => state.storage.database.DECENTRALIZED_BACKUP,
  // );
  const walletName = WALLET_SETUP ? WALLET_SETUP.walletName : '';
  const accounts = useSelector((state) => state.accounts);

  const paymentDetails = useSelector(
    (state) => state.trustedContacts.paymentDetails,
  );
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

  const [balances, setBalances] = useState({
    testBalance: 0,
    regularBalance: 0,
    secureBalance: 0,
    accumulativeBalance: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [NotificationDataChange, setNotificationDataChange] = useState(false);
  const [NotificationData, setNotificationData] = useState([]);
  const [qrData, setqrData] = useState('');

  const onNotificationClicked = async (value) => {
    let asyncNotifications = JSON.parse(
      await AsyncStorage.getItem('notificationList'),
    );
    let tempNotificationData = NotificationData;
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
    setNotificationData(tempNotificationData);
    setNotificationDataChange(!NotificationDataChange);

    if (value.type == 'release') {
      RelayServices.fetchReleases(value.info.split(' ')[1])
        .then(async (res) => {
          if (res.data.releases.length) {
            let releaseNotes = res.data.releases.length
              ? res.data.releases.find((el) => {
                return el.build === value.info.split(' ')[1];
              })
              : '';
            props.navigation.navigate('UpdateApp', {
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

  useEffect(() => {
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
    setBalances({
      testBalance,
      regularBalance,
      secureBalance,
      accumulativeBalance,
    });
    setTransactions(accumulativeTransactions);
  }, [accounts]);

  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: '',
    question: '',
  });
  const [FBTCAccount, setFBTCAccount] = useState({});
  const [answer, setAnswer] = useState('');
  const [selectToAdd, setSelectToAdd] = useState('buyBitcoins');
  const [openmodal, setOpenmodal] = useState('closed');
  const [tabBarZIndex, setTabBarZIndex] = useState(999);
  const [deepLinkModalOpen, setDeepLinkModalOpen] = useState(false);
  const [tabSelected, setTabSelected] = useState('sell');
  const [switchOn, setSwitchOn] = useState(true);
  const [selected, setSelected] = useState('Transactions');
  const [
    ContactSelectedFromAddressBookQrCodeBottomSheet,
    setContactSelectedFromAddressBookQrCodeBottomSheet,
  ] = useState(React.createRef());
  const [
    ContactSelectedFromAddressBookBottomSheet,
    setContactSelectedFromAddressBookBottomSheet,
  ] = useState(React.createRef());
  const [
    AddContactAddressBookBookBottomSheet,
    setAddContactAddressBookBottomSheet,
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
  const [NoInternetBottomSheet, setNoInternetBottomSheet] = useState(
    React.createRef(),
  );
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
  const trustedContactRequest = props.navigation.getParam(
    'trustedContactRequest',
  );

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

  useEffect(() => {
    getNotificationList();
    getNewTransactionNotifications();
    let notificationOnFocusListener = props.navigation.addListener(
      'didFocus',
      () => {
        getNewTransactionNotifications();
        getNotificationList();
      },
    );
    return () => {
      notificationOnFocusListener.remove();
    };
  }, []);

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const getNewTransactionNotifications = async () => {
    let newTransactions = [];
    const derivativeAccountType = 'FAST_BITCOINS';
    const regularAccount = accounts[REGULAR_ACCOUNT].service.hdWallet;
    const secureAccount = accounts[SECURE_ACCOUNT].service.secureHDWallet;
    if (
      secureAccount.derivativeAccounts[derivativeAccountType][1] &&
      secureAccount.derivativeAccounts[derivativeAccountType][1].xpub
    )
      dispatch(fetchDerivativeAccBalTx(SECURE_ACCOUNT, derivativeAccountType));

    if (
      regularAccount.derivativeAccounts[derivativeAccountType][1] &&
      regularAccount.derivativeAccounts[derivativeAccountType][1].xpub
    )
      dispatch(fetchDerivativeAccBalTx(REGULAR_ACCOUNT, derivativeAccountType));

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
        id : obj.notificationId,
        title: obj.title,
        body: obj.info,
      }
      localNotification(notificationDetails)
      tmpList.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
      setTimeout(() => {
        setNotificationData(tmpList);
        setNotificationDataChange(!NotificationDataChange);
      }, 2);
    }
  };

  const getNotificationList = async () => {
    dispatch(fetchNotifications());
  };

  useEffect(() => {
    setupNotificationList();
  }, [notificationList]);

  const onNotificationListOpen = async () => {
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
      setNotificationData(asyncNotificationList);
      setNotificationDataChange(!NotificationDataChange);
    }
  };

  const setupNotificationList = async () => {
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
      setNotificationData(tmpList);
      setNotificationDataChange(!NotificationDataChange);
    }
  };

  const onNotificationOpen = async (item) => {
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
    setNotificationData(asyncNotificationList);
    setNotificationDataChange(!NotificationDataChange);
  };

  useEffect(function () {
    AppState.addEventListener('change', onAppStateChange);
    (async () => {
      const enabled = await firebase.messaging().hasPermission();
      if (!enabled) {
        await firebase
          .messaging()
          .requestPermission()
          .then(() => {
            // User has authorized
            createNotificationListeners();
            storeFCMToken();
            scheduleNotification();
          })
          .catch((error) => {
            // User has rejected permissions
            //console.log(
            // 'PERMISSION REQUEST :: notification permission rejected',
            //  error,
            //);
          });
      } else {
        createNotificationListeners();
        storeFCMToken();
        scheduleNotification();
      }
    })();

    let focusListener = props.navigation.addListener('didFocus', () => {
      setCurrencyCodeFromAsync();
      // getAssociatedContact();
      checkFastBitcoin();
    });
    // getAssociatedContact();
    setCurrencyCodeFromAsync();
    updateAccountCardData();
    checkFastBitcoin();
    (transactionTabBarBottomSheet as any).current.snapTo(1);
    (addTabBarBottomSheet as any).current.snapTo(0);
    (QrTabBarBottomSheet as any).current.snapTo(0);
    (moreTabBarBottomSheet as any).current.snapTo(0);
    // AppState.addEventListener('change', handleAppStateChange);

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

  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }

  const checkFastBitcoin = async () => {
    let getFBTCAccount = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    setFBTCAccount(getFBTCAccount ? getFBTCAccount : {});
  };

  const onAppStateChange = async (nextAppState) => {
    handleAppStateChange(nextAppState)
    try {
      if (this.appState == nextAppState) return;
      this.appState = nextAppState;
      if (this.appState == 'active') {
        scheduleNotification();
      }
    } catch (error) { }
  };

  const createNotificationListeners = async () => {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        onNotificationArrives(notification);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(async (notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        // let data = JSON.parse(notificationOpen.notification.data.content);
        // if(data.notificationType == "release"){
        //   props.navigation.navigate('UpdateApp', {releaseData: data})
        // }
        getNotificationList();
        onNotificationOpen(notificationOpen.notification);
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      getNotificationList();
      onNotificationOpen(notificationOpen.notification);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
    });
  };

  const scheduleNotification = async () => {
    const notification = new firebase.notifications.Notification()
      .setTitle('We have not seen you in a while!')
      .setBody(
        'Opening your app regularly ensures you get all the notifications and security updates',
      )
      .setNotificationId('1')
      .setSound('default')
      .setData({
        title: 'We have not seen you in a while!',
        body: 'Opening your app regularly ensures you get all the notifications and security updates',
      })
      .android.setChannelId('reminder')
      .android.setPriority(firebase.notifications.Android.Priority.High);

    // Schedule the notification for 2hours on development and 2 weeks on Production in the future
    const date = new Date();
    date.setHours(date.getHours() + Number(Config.NOTIFICATION_HOUR));
    // date.setSeconds(date.getSeconds() + Number(Config.NOTIFICATION_HOUR));

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

  const localNotification = async (notificationDetails) => {
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
      .then(() => {})
      .catch(
        (err) => {},
      );
    firebase
      .notifications()
      .getScheduledNotifications()
      .then((notifications) => {
      });
  };

  const onNotificationArrives = async (notification) => {
    getNotificationList();
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

  // //console.log("notification.data", JSON.parse(notification.data.content));
  //   let data = JSON.parse(notification.data.content);
  //   if(data.notificationType == "release"){
  //     props.navigation.navigate('UpdateApp', {releaseData: data})
  //   }

  // useEffect(() => {
  //   const unsubscribe = firebase
  //     .messaging()
  //     .onMessage(async (remoteMessage) => {
  //       //console.log('A new FCM message arrived!', remoteMessage);
  //     });

  //   return unsubscribe;
  // }, []);

  // const notifications = useSelector(
  //   (state) => state.notifications.notifications,
  // );
  // //console.log({ notifications });
  // useEffect(() => {
  //   dispatch(fetchNotifications());
  // }, []);

  const storeFCMToken = async () => {
    const fcmToken = await firebase.messaging().getToken();
    let fcmArray = [fcmToken];
    let fcmTokenFromAsync = await AsyncStorage.getItem('fcmToken');
    if (fcmTokenFromAsync != fcmToken && fcmTokenFromAsync) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      dispatch(updateFCMTokens(fcmArray));
    } else if (!fcmTokenFromAsync) {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      dispatch(updateFCMTokens(fcmArray));
    }
  };
  const setCurrencyCodeFromAsync = async () => {
    ///console.log("RNLocalize.getCurrencies()[0]", RNLocalize.getCurrencies()[0]);
    let currencyCodeTmp = await AsyncStorage.getItem('currencyCode');
    if (!currencyCodeTmp) {
      await AsyncStorage.setItem(
              'currencyCode',
              RNLocalize.getCurrencies()[0],
            );
            setCurrencyCode(
              RNLocalize.getCurrencies()[0],
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
      setErrorMessageHeader('Error sending Recovery Key');
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      );
      setButtonText('Try again');
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorSending(null));
  }

  useEffect(() => {
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
  }, [isUploadSuccessfully]);

  useEffect(() => {
    if (isErrorReceivingFailed) {
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
  }, [isErrorReceivingFailed]);

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
        Toast('Recovery Key received successfully');
        setSecondaryDeviceAddresses();
      }
      // getAssociatedContact();
    }
  }, [SecondaryDeviceStatus]);

  const getQrCodeData = (qrData) => {
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
          dispatch(
            addTransferDetails(serviceType, {
              selectedContact: item,
            }),
          );

          props.navigation.navigate('SendToContact', {
            selectedContact: item,
            serviceType,
            netBalance: balances.regularBalance,
          });
          break;

        case 'paymentURI':
          const { address, options } = regularService.decodePaymentURI(qrData);
          item = {
            id: address,
          };

          dispatch(
            addTransferDetails(serviceType, {
              selectedContact: item,
            }),
          );

          props.navigation.navigate('SendToContact', {
            selectedContact: item,
            serviceType,
            netBalance: balances.regularBalance,
            bitcoinAmount: options.amount ? `${options.amount}` : '',
          });
          break;

        default:
          Alert.alert('Invalid QR');
          break;
      }

      return;
    }

    try {
      const scannedData = JSON.parse(qrData);
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
          setLoading(false);
          setSecondaryDeviceOtp(trustedGruardianRequest);
          props.navigation.navigate('Home', {
            trustedContactRequest: trustedGruardianRequest,
            recoveryRequest: null,
          });
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

          setLoading(false);
          setSecondaryDeviceOtp(secondaryDeviceGuardianRequest);
          props.navigation.navigate('Home', {
            trustedContactRequest: secondaryDeviceGuardianRequest,
            recoveryRequest: null,
          });
          break;

        case 'trustedContactQR':
          const tcRequest = {
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            type: scannedData.type,
            isQR: true,
          };
          setLoading(false);
          setSecondaryDeviceOtp(tcRequest);
          props.navigation.navigate('Home', {
            trustedContactRequest: tcRequest,
            recoveryRequest: null,
          });
          break;

        case 'paymentTrustedContactQR':
          const paymentTCRequest = {
            isPaymentRequest: true,
            requester: scannedData.requester,
            publicKey: scannedData.publicKey,
            type: scannedData.type,
            isQR: true,
          };
          setLoading(false);
          setSecondaryDeviceOtp(tcRequest);
          props.navigation.navigate('Home', {
            trustedContactRequest: paymentTCRequest,
            recoveryRequest: null,
          });
          break;

        case 'recoveryQR':
          const recoveryRequest = {
            isRecovery: true,
            requester: scannedData.requester,
            publicKey: scannedData.KEY,
            isQR: true,
          };
          setLoading(false);
          props.navigation.navigate('Home', {
            recoveryRequest,
            trustedContactRequest: null,
          });
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
      Alert.alert('Invalid QR');
    }
  };

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
      <ModalHeader
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
          if (type == 'buyBitcoins') {
            setTimeout(() => {
              // setAddSubBottomSheetsFlag(true);
              // setTabBarZIndex(0);
              setSelectToAdd(type);
            }, 2);
            props.navigation.navigate('VoucherScanner');
            //(AddBottomSheet as any).current.snapTo(1);
          } else if (type == 'addContact') {
            setTimeout(() => {
              //setAddSubBottomSheetsFlag(true);
              // setAddBottomSheetsFlag(true);
              setTabBarZIndex(0);
              setSelectToAdd(type);
            }, 2);
            (AddContactAddressBookBookBottomSheet as any).current.snapTo(1);
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
        <Text style={styles.modalHeaderTitleText}>{'Scan QR'}</Text>
      </TouchableOpacity>
    );
  }

  function renderMoreContent() {
    return (
      <MoreHomePageTabContents
        onPressElements={(item) => onPressElement(item)}
        isExistingSavingMethod={isEmpty(FBTCAccount)}
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
        onPressTryAgain={() => { }}
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
                dispatch(downloadMShare(custodyRequest.ek, custodyRequest.otp));
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

  const onPressElement = (item) => {
    if (item.title == 'Backup Health') {
      props.navigation.navigate('ManageBackup');
    }
    if (item.title == 'Friends and Family') {
      props.navigation.navigate('AddressBookContents');
    } else if (item.title == 'Wallet Settings') {
      (settingsBottomSheet as any).current.snapTo(1);
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 10);
    }
    else if (item.title == 'Services') {
      props.navigation.navigate('ExistingSavingMethods');
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
    } else if (type == 'ChangeCurrency') {
      let currency = await AsyncStorage.getItem('currencyCode');
      props.navigation.navigate('ChangeCurrency');
      setCurrencyCode(currency);
    } else if (type == 'ChangeWalletName') {
      props.navigation.navigate('SettingWalletNameChange');
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
      <ModalHeader
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
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 10);
          (AllAccountsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // const getAssociatedContact = async () => {
  //   let SelectedContacts = JSON.parse(
  //     await AsyncStorage.getItem('SelectedContacts'),
  //   );
  //   setSelectedContacts(SelectedContacts);
  //   let AssociatedContact = JSON.parse(
  //     await AsyncStorage.getItem('AssociatedContacts'),
  //   );
  //   setAssociatedContact(AssociatedContact);
  //   let SecondaryDeviceAddress = JSON.parse(
  //     await AsyncStorage.getItem('secondaryDeviceAddress'),
  //   );
  //   setSecondaryDeviceAddress(SecondaryDeviceAddress);
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

  const onPressSaveBitcoinElements = (type) => {
    if (type == 'voucher') {
      props.navigation.navigate('VoucherScanner');
    }
  };

  const renderAddModalContents = () => {
    if (selectToAdd == 'buyBitcoins') {
      return (
        <SaveBitcoinModalContents
          onPressBack={() => {
            (AddBottomSheet as any).current.snapTo(0);
          }}
          onPressElements={(type) => onPressSaveBitcoinElements(type)}
        />
      );
    }
    else if (selectToAdd == 'addContact') {
      return (
        <AddContactsModalContents
          onPressFriendAndFamily={() => {
            // setTimeout(() => {
            //   setFamilyAndFriendsBookBottomSheetsFlag(true);
            // }, 2);
            (AddContactAddressBookBookBottomSheet as any).current.snapTo(1);
          }}
          onPressBiller={() => {
            // setTimeout(() => {
            //   setFamilyAndFriendsBookBottomSheetsFlag(true);
            // }, 2);
            (AddContactAddressBookBookBottomSheet as any).current.snapTo(1);
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
      <ModalHeader
        onPressHeader={() => {
          (fastBitcoinSellCalculationBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderFastBitcoinRedeemCalculationHeader = () => {
    return (
      <ModalHeader
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
      <ModalHeader
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
      <ModalHeader
        onPressHeader={() => {
          (ContactSelectedFromAddressBookQrCodeBottomSheet as any).current.snapTo(
            0,
          );
        }}
      />
    );
  };

  const renderAddContactAddressBookContents = () => {
    return (
      <AddContactAddressBook
        modalTitle={'Add contact to Friends and Family'}
        modalRef={AddContactAddressBookBookBottomSheet}
        proceedButtonText={'Confirm & Proceed'}
        onPressContinue={(selectedContacts) => {
          setSelectedContact(selectedContacts);
          props.navigation.navigate('AddContactSendRequest', {
            SelectedContact: selectedContacts,
          });
          (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
        }}
        onSelectContact={(selectedContact) => {
          setSelectedContact(selectedContact);
        }}
        onPressBack={() => {
          setTimeout(() => {
            setFamilyAndFriendsBookBottomSheetsFlag(false);
          }, 2);
          (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderAddContactAddressBookHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setFamilyAndFriendsBookBottomSheetsFlag(false);
          }, 2);
          (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  let isNavigate = false;
  let isContactOpen = false;
  let isCameraOpen = false;
  const handleAppStateChange = async (nextAppState) => {
    AsyncStorage.multiGet(["isContactOpen", "isCameraOpen"]).then(response => {
      isContactOpen = JSON.parse(response[0][1]);
      isCameraOpen = JSON.parse(response[1][1]);
    })
    let keyArray = [['isCameraOpen', JSON.stringify(true)], ['isContactOpen', JSON.stringify(true)]]
    if(isCameraOpen) keyArray[0][1] = JSON.stringify(false);
    if(isContactOpen) keyArray[1][1] = JSON.stringify(false);
    if(isContactOpen || isContactOpen){
      AsyncStorage.multiSet(keyArray, ()=>{});
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
        : nextAppState == 'inactive' || nextAppState == 'background'
    ) {
      clearTimeout(blockApp);
      isNavigate = true; // producing a subtle delay to let deep link event listener make the first move
    } else {
      isNavigate = false;
    }
  };

  const handleDeepLink = useCallback((event) => {
    const splits = event.url.split('/');

    if (splits[5] === 'sss') {
      const requester = splits[4];
      if (splits[6] === 'ek') {
        const custodyRequest = {
          requester,
          ek: splits[7],
          uploadedAt: splits[8],
        };
        props.navigation.navigate('Home', { custodyRequest });
      } else if (splits[6] === 'rk') {
        const recoveryRequest = { requester, rk: splits[7] };
        props.navigation.navigate('Home', {
          recoveryRequest,
          trustedContactRequest: null,
        });
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
        const trustedContactRequest = {
          isGuardian: splits[4] === 'tcg' ? true : false,
          isPaymentRequest: splits[4] === 'ptc' ? true : false,
          requester: splits[5],
          encryptedKey: splits[6],
          hintType: splits[7],
          hint: splits[8],
          uploadedAt: splits[9],
        };
        props.navigation.navigate('Home', {
          trustedContactRequest,
          recoveryRequest: null,
        });
      }
    } else if (splits[4] === 'rk') {
      const recoveryRequest = {
        isRecovery: true,
        requester: splits[5],
        encryptedKey: splits[6],
        hintType: splits[7],
        hint: splits[8],
      };
      props.navigation.navigate('Home', {
        recoveryRequest,
        trustedContactRequest: null,
      });
    } else if (splits[4] === 'rrk') {
      Alert.alert(
        'Restoration link Identified',
        'Restoration links only works during restoration mode',
      );
    }

    if (event.url.includes('fastbitcoins')) {
      const userKey = event.url.substr(event.url.lastIndexOf('/') + 1);
      props.navigation.navigate('VoucherScanner', { userKey });
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
        if (AllAccountsBottomSheet.current && settingsBottomSheet.current) {
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
      (TrustedContactRequestBottomSheet as any).current.snapTo(1);
      (transactionTabBarBottomSheet as any).current.snapTo(1);
    }

    if (trustedContactRequest) {
      if (tabBarZIndex == 999) {
        setTimeout(() => {
          setTabBarZIndex(0);
          setDeepLinkModalOpen(true);
        }, 2);
      }
      (TrustedContactRequestBottomSheet as any).current.snapTo(1);
      (transactionTabBarBottomSheet as any).current.snapTo(1);
    }
  }, [custodyRequest, recoveryRequest, trustedContactRequest]);

  // const s3Service = useSelector(state => state.sss.service);
  const [overallHealth, setOverallHealth] = useState();

  const health = useSelector((state) => state.sss.overallHealth);
  useEffect(() => {
    if (health) setOverallHealth(health);
  }, [health]);

  // useEffect(() => {
  //   dispatch(runTest());
  // }, []);

  // useEffect(() => {
  //   const unsubscribe = NetInfo.addEventListener(state => {
  //     //console.log('Connection type', state.type);
  //     //console.log('Is connected?', state.isConnected);
  //
  //     if (!state.isConnected) {
  //       (NoInternetBottomSheet as any).current.snapTo(1);
  //     } else {
  //       (NoInternetBottomSheet as any).current.snapTo(0);
  //     }
  //   });

  //   // return unsubscribe; // unsubscribing
  // }, []);

  // const renderRecoverySecretRequestModalContent = useCallback(() => {
  //   if (!recoveryRequest) return <View></View>;
  //   return (
  //     <RecoverySecretRequestModalContents
  //       name={recoveryRequest.requester}
  //       title={'You have a Recovery Request\nfrom your Trusted Contact'}
  //       infoText={
  //         'Please contact the sender to get\nthe OTP and share the secret'
  //       }
  //       subTitle={'Message from the Sender'}
  //       subTitleInfo={
  //         'I am trying to restore my Hexa wallet and need the Recovery Secret shared with you'
  //       }
  //       acceptButtonName={'Accept Request'}
  //       rejectButtonName={'Reject Request'}
  //       onPressAccept={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //         (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
  //         if (!UNDER_CUSTODY[recoveryRequest.requester]) {
  //           Alert.alert(
  //             'Failed to send!',
  //             'You do not host any secret for this user.',
  //           );
  //           setLoading(false);
  //         } else {
  //           if (recoveryRequest.isQR) {
  //             dispatch(
  //               uploadRequestedShare(
  //                 recoveryRequest.requester,
  //                 recoveryRequest.rk,
  //                 recoveryRequest.otp,
  //               ),
  //             );
  //           } else {
  //             props.navigation.navigate('RecoveryRequestOTP', {
  //               recoveryRequest,
  //             });
  //           }
  //         }
  //       }}
  //       onPressReject={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //         (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // }, [recoveryRequest]);

  // const renderRecoverySecretRequestModalHeader = useCallback(() => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
  //         setTimeout(() => {
  //           setTabBarZIndex(0);
  //         }, 2);
  //       }}
  //     />
  //   );
  // }, []);

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
        NotificationData={NotificationData}
        onNotificationClicked={(value) => onNotificationClicked(value)}
        onPressBack={() => {
          (notificationsListBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [NotificationData, NotificationDataChange]);

  const renderNotificationsHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (notificationsListBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [NotificationData, NotificationDataChange]);

  useEffect(() => {
    if (paymentDetails) {
      const serviceType = REGULAR_ACCOUNT;
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
      dispatch(
        addTransferDetails(serviceType, {
          selectedContact: item,
        }),
      );

      dispatch(clearPaymentDetails());

      props.navigation.navigate('SendToContact', {
        selectedContact: item,
        serviceType,
        netBalance: balances.regularBalance,
        bitcoinAmount: options.amount ? `${options.amount}` : '',
      });
    }
  }, [paymentDetails]);

  const processDLRequest = useCallback(
    (key, rejected?) => {
      let {
        requester,
        isGuardian,
        encryptedKey,
        publicKey,
        isQR,
        uploadedAt,
        isRecovery,
      } = trustedContactRequest || recoveryRequest;

      if (!isRecovery) {
        if (uploadedAt && Date.now() - uploadedAt > 600000) {
          Alert.alert(
            `${isQR ? 'QR' : 'Link'} expired!`,
            `Please ask the sender to initiate a new ${isQR ? 'QR' : 'Link'}`,
          );
          setLoading(false);
        } else {
          if (isGuardian && UNDER_CUSTODY[requester]) {
            Alert.alert(
              'Failed to store',
              'You cannot custody multiple shares of the same user.',
            );
            setLoading(false);
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
              props.navigation.navigate('ContactsListForAssociateContact', {
                postAssociation: (contact) => {
                  const contactName = `${contact.firstName} ${
                    contact.lastName ? contact.lastName : ''
                  }`.toLowerCase();
                  if (isGuardian) {
                    dispatch(
                      approveTrustedContact(
                        contactName,
                        publicKey,
                        true,
                        requester,
                      ),
                    );
                  } else {
                    dispatch(
                      approveTrustedContact(contactName, publicKey, true),
                    );
                  }
                  setAssociatedContactName(contactName);
                },
                isGuardian,
              });
            } else if (publicKey && rejected) {
              // don't assoicate; only fetch the payment details from EC
              dispatch(fetchEphemeralChannel(null, null, publicKey));
            }
          }
        }
      } else {
        if (!UNDER_CUSTODY[requester]) {
          Alert.alert(
            'Failed to send!',
            'You do not host any secret for this user.',
          );
          setLoading(false);
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
            dispatch(
              uploadRequestedShare(recoveryRequest.requester, publicKey),
            );
          }
        }
      }

      TrustedContactRequestBottomSheet.current.snapTo(0);
    },
    [trustedContactRequest, recoveryRequest],
  );

  const renderTrustedContactRequestContent = useCallback(() => {
    if (!trustedContactRequest && !recoveryRequest) return;
    console.log({ trustedContactRequest, recoveryRequest });

    let {
      requester,
      hintType,
      hint,
      isGuardian,
      isQR,
      isRecovery,
      isPaymentRequest,
    } = trustedContactRequest || recoveryRequest;

    return (
      <TrustedContactRequest
        isQR={isQR}
        inputType={
          hintType === 'num' ? 'phone' : hintType === 'eml' ? 'email' : null
        }
        isGuardian={isGuardian}
        isRecovery={isRecovery}
        isPayment={isPaymentRequest}
        hint={hint}
        bottomSheetRef={TrustedContactRequestBottomSheet}
        trustedContactName={requester}
        onPressAccept={(key) => {
          setTimeout(() => {
            setTabBarZIndex(999);
            setDeepLinkModalOpen(false);
          }, 2);
          processDLRequest(key);
        }}
        onPressReject={(key) => {
          setTimeout(() => {
            setTabBarZIndex(999);
            setDeepLinkModalOpen(false);
          }, 2);
          TrustedContactRequestBottomSheet.current.snapTo(0);
          processDLRequest(key, true);
        }}
      />
    );
  }, [trustedContactRequest, recoveryRequest]);

  const renderTrustedContactRequestHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
            setDeepLinkModalOpen(false);
          }, 2);
          TrustedContactRequestBottomSheet.current.snapTo(0);
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
                  {NotificationData.findIndex((value) => value.read == false) >
                    -1 ? (
                      <View
                        style={{
                          backgroundColor: Colors.red,
                          height: wp('2.5%'),
                          width: wp('2.5%'),
                          borderRadius: wp('2.5%') / 2,
                          alignSelf: 'flex-end',
                        }}
                      />
                    ) : null}
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
                <MessageAsPerHealth
                  health={
                    overallHealth ? (overallHealth as any).overallStatus : 0
                  }
                />
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
                  shieldStatus={
                    overallHealth ? (overallHealth as any).overallStatus : 0
                  }
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
            renderItem={(Items) =>
              <HomeList
                Items={Items}
                navigation={props.navigation}
                getIconByAccountType={getIconByAccountType}
                switchOn={switchOn}
                accounts={accounts}
                CurrencyCode={CurrencyCode}
                balances={balances}
                exchangeRates={exchangeRates}
              />
            }
          />
        </View>
      </View>
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
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
        ]}
        renderContent={() => (
          <TransactionsContent
            transactions={transactions}
            AtCloseEnd={AtCloseEnd}
            setTransactionItem={setTransactionItem}
            setTabBarZIndex={setTabBarZIndex}
            TransactionDetailsBottomSheet={TransactionDetailsBottomSheet}
          />
        )}
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
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
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
      {/* <BottomSheet
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
      /> */}
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
        ref={TrustedContactRequestBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('70%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('95%') : hp('95%'),
        ]}
        renderContent={renderTrustedContactRequestContent}
        renderHeader={renderTrustedContactRequestHeader}
      />
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
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
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
        onOpenEnd={() => {
          setTabBarZIndex(0);
          // setFamilyAndFriendsBookBottomSheetsFlag(true);
        }}
        onOpenStart={() => {
          setTabBarZIndex(0);
        }}
        onCloseStart={() => {
          setTabBarZIndex(999);
          setFamilyAndFriendsBookBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={AddContactAddressBookBookBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
        ]}
        renderContent={renderAddContactAddressBookContents}
        renderHeader={renderAddContactAddressBookHeader}
      />
      {/* {familyAndFriendsBookBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => { }}
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
          onOpenEnd={() => { }}
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
      ) : null} */}

      <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          onNotificationListOpen();
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={notificationsListBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
        ]}
        renderContent={renderNotificationsContent}
        renderHeader={renderNotificationsHeader}
      />
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
