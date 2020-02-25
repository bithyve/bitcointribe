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
import CustodianRequestAcceptModalContents from '../components/CustodianRequestAcceptModalContents';
import HomePageShield from '../components/HomePageShield';
import ErrorModalContents from '../components/ErrorModalContents';
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
} from '../store/actions/sss';
import RecoverySecretRequestModalContents from '../components/RecoverySecretRequestModalContesnts';
import ShareRecoverySecretModalContents from '../components/ShareRecoverySecretModalContents';
import moment from 'moment';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import {
  getTestcoins,
  fetchBalance,
  fetchTransactions,
} from '../store/actions/accounts';
import axios from 'axios';
import { UsNumberFormat } from '../common/utilities';

// const { Value, abs, sub, min } = Animated
// const snapPoints = [ Dimensions.get( 'screen' ).height - 150, 150 ]
// const position = new Value( 1 )
// const opacity = min( abs( sub( position, 1 ) ), 0.8 )
// const zeroIndex = snapPoints.length - 1
// const height = snapPoints[ 0 ]

export default function Home(props) {
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
    state => state.storage.database.WALLET_SETUP,
  );
  // const DECENTRALIZED_BACKUP = useSelector(
  //   state => state.storage.database.DECENTRALIZED_BACKUP,
  // );
  const walletName = WALLET_SETUP ? WALLET_SETUP.walletName : '';
  const accounts = useSelector(state => state.accounts);
  // const exchangeRate = props.navigation.state.params
  //   ? props.navigation.state.params.exchangeRates
  //   : null;

  const [exchangeRates, setExchangeRates] = useState(accounts.exchangeRates);
  useEffect(() => {
    if (accounts.exchangeRates) setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);
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

  // const [NoInternetBottomSheet, setNoInternetBottomSheet] = useState(
  //   React.createRef(),
  // );
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
  const [
    transactionDetailsBottomSheet,
    setTransactionDetailsBottomSheet,
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

  const [data, setData] = useState([
    {
      id: 1,
      title: 'Test Account',
      unit: 't-sats',
      amount: '400,000',
      account: `Learn Bitcoin`,
      accountType: 'test',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
    },
    {
      id: 2,
      title: 'Savings Account',
      unit: 'sats',
      amount: '60,000',
      account: 'Multi-factor security',
      accountType: 'secure',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_gray.png'),
    },
    {
      id: 3,
      title: 'Regular Account',
      unit: 'sats',
      amount: '5,000',
      account: 'Fast and easy',
      accountType: 'regular',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_gray.png'),
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

  useEffect(function() {
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

    // let focusListener = props.navigation.addListener('didFocus', () => {
    //   getOverAllHealthFromAsync();
    // });
    // return () => {
    //   focusListener.remove();
    // };
  }, []);

  // const getOverAllHealthFromAsync = async () => {
  //   if (!overallHealth) {
  //     const storedHealth = await AsyncStorage.getItem('overallHealth');
  //     if (storedHealth) {
  //       setOverallHealth(JSON.parse(storedHealth));
  //     }
  //   }
  // };

  const messageAsPerHealth = health => {
    if (health == 0) {
      return (
        <Text style={styles.headerInfoText}>
          The wallet backup is not secure.{'\n'}Please visit the health section
          to{'\n'}improve the health of your backup
        </Text>
      );
    } else if (health > 0 && health < 100) {
      return (
        <Text style={styles.headerInfoText}>
          The wallet backup is not secured.{'\n'}Please complete the setup to
          {'\n'}safeguard against loss of funds
        </Text>
      );
    } else {
      return (
        <Text style={styles.headerInfoText}>
          <Text style={{ fontStyle: 'italic' }}>Great!! </Text>The wallet backup
          is{'\n'}secure. Keep an eye on the{'\n'}health of the backup here
        </Text>
      );
    }
  };

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
          <View style={{ height: 'auto' }}>
            <FlatList
              data={transactions}
              ItemSeparatorComponent={() => (
                <View style={{ backgroundColor: Colors.white }}>
                  <View style={styles.separatorView} />
                </View>
              )}
              renderItem={({ item }) => (
                <AppBottomSheetTouchableWrapper
                  onPress={() =>
                    props.navigation.navigate('TransactionDetails', { item })
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
                        {moment(item.date)
                          .utc()
                          .format('DD MMMM YYYY')}{' '}
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
          {transactions.length <= 1 ? (
            <View
              style={{
                flex: 1,
                marginTop: hp('15%'),
                alignItems: 'center',
                padding: wp('10%'),
                opacity: 0.5,
              }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(15),
                  textAlign: 'center',
                }}
              >
                Recent transactions across all accounts will appear here
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    ) : (
      <View style={styles.modalContentContainer}>
        <View
          style={{
            flex: 1,
            marginTop: hp('15%'),
            alignItems: 'center',
            padding: wp('10%'),
            opacity: 0.5,
          }}
        >
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(15),
              textAlign: 'center',
            }}
          >
            Recent transactions across all accounts will appear here
          </Text>
        </View>
      </View>
    );
  };

  const getQrCodeData = qrData => {
    const scannedData = JSON.parse(qrData);
    console.log({ scannedData });
    switch (scannedData.type) {
      case 'secondaryDeviceQR' || 'trustedContactQR':
        const custodyRequest = {
          requester: scannedData.requester,
          ek: scannedData.ENCRYPTED_KEY,
          otp: scannedData.OTP,
          isQR: true,
        };
        props.navigation.navigate('Home', { custodyRequest });
        break;
      case 'secondaryDeviceQRRecovery':
        const recoveryRequest = {
          requester: scannedData.requester,
          rk: scannedData.ENCRYPTED_KEY,
          otp: scannedData.OTP,
          isQR: true,
        };
        props.navigation.navigate('Home', { recoveryRequest });
      default:
        break;
    }
  };

  function renderTransactionContent() {
    return renderTransactionsContent();
  }

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

  function renderAddContent() {
    return (
      <AddModalContents
        onPressElements={type => {
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
        onQrScan={qrData => getQrCodeData(qrData)}
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
      <MoreHomePageTabContents onPressElements={item => onPressElement(item)} />
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
      transactionTabBarBottomSheet.current.snapTo(0);
      addTabBarBottomSheet.current.snapTo(0);
      QrTabBarBottomSheet.current.snapTo(0);
      moreTabBarBottomSheet.current.snapTo(2);
    }
    if (tabTitle == 'Transactions') {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 2);
      transactionTabBarBottomSheet.current.snapTo(2);
      addTabBarBottomSheet.current.snapTo(0);
      QrTabBarBottomSheet.current.snapTo(0);
      moreTabBarBottomSheet.current.snapTo(0);
    }
    if (tabTitle == 'Add') {
      setTimeout(() => {
        setAddBottomSheetsFlag(true);
        setModaldata([]);
        setSelected(tabTitle);
      }, 2);
      transactionTabBarBottomSheet.current.snapTo(0);
      addTabBarBottomSheet.current.snapTo(2);
      QrTabBarBottomSheet.current.snapTo(0);
      moreTabBarBottomSheet.current.snapTo(0);
    }
    if (tabTitle == 'QR') {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 2);
      transactionTabBarBottomSheet.current.snapTo(0);
      addTabBarBottomSheet.current.snapTo(0);
      QrTabBarBottomSheet.current.snapTo(2);
      moreTabBarBottomSheet.current.snapTo(0);
    }
  }

  // const renderNoInternetModalContent = () => {
  //   return (
  //     <NoInternetModalContents
  //       onPressTryAgain={() => {}}
  //       onPressIgnore={() => {}}
  //     />
  //   );
  // };

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

  const renderCustodianRequestModalContent = useCallback(() => {
    if (!custodyRequest) return <View></View>;
    return (
      <CustodianRequestModalContents
        userName={custodyRequest.requester}
        onPressAcceptSecret={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
            setDeepLinkModalOpen(false);
          }, 2);
          (CustodianRequestBottomSheet as any).current.snapTo(0);
          if (custodyRequest.isQR) {
            dispatch(downloadMShare(custodyRequest.otp, custodyRequest.ek));
          } else {
            props.navigation.navigate('CustodianRequestOTP', {
              custodyRequest,
            });
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
  }, [custodyRequest]);

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

  // const renderNoInternetModalHeader = () => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={() => {
  //         setTimeout(() => {
  //           setTabBarZIndex(999);
  //         }, 2);
  //         (NoInternetBottomSheet as any).current.snapTo(0);
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

  const onPressElement = item => {
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
    } else if (item.title == 'All accounts and funds') {
      (AllAccountsBottomSheet as any).current.snapTo(1);
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 10);
    }
  };

  const managePinSuccessProceed = pin => {
    setTimeout(() => {
      setTabBarZIndex(999);
    }, 10);
    (settingsBottomSheet as any).current.snapTo(0);
  };

  const renderSettingsContents = () => {
    return (
      <SettingsContents
        onPressManagePIn={() => {
          return props.navigation.navigate('SettingManagePin', {
            managePinSuccessProceed: pin => managePinSuccessProceed(pin),
          });
        }}
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

  const renderAddressBookContents = () => {
    return (
      <AddressBookContents
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

  const renderTransactionDetailsContents = () => {
    return (
      <TransactionDetailsContents
        onPressBack={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (transactionDetailsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderTransactionDetailsHeader = () => {
    return (
      <SmallHeaderModal
        headerColor={Colors.backgroundColor}
        onPressHeader={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (transactionDetailsBottomSheet as any).current.snapTo(0);
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

  const renderAddModalContents = () => {
    if (selectToAdd == 'Getbittr') {
      return (
        <GetBittrModalContents
          onPressBack={() => {
            setTimeout(() => {
              setAddSubBottomSheetsFlag(false);
              setTabBarZIndex(999);
            }, 2);
            (AddBottomSheet as any).current.snapTo(0);
          }}
        />
      );
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
      <TransparentHeaderModal
        onPressheader={() => {
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
  const handleAppStateChange = async nextAppState => {
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

  const handleDeepLink = useCallback(event => {
    const splits = event.url.split('/');
    const requester = splits[3];

    if (splits[4] === 'sss') {
      if (splits[5] === 'ek') {
        const custodyRequest = { requester, ek: splits[6] };
        props.navigation.navigate('Home', { custodyRequest });
      } else if (splits[5] === 'rk') {
        const recoveryRequest = { requester, rk: splits[6] };
        props.navigation.replace('Home', { recoveryRequest });
      }
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
          addressBookBottomSheet.current.snapTo(0);
          AllAccountsBottomSheet.current.snapTo(0);
          settingsBottomSheet.current.snapTo(0);
        }
        (CustodianRequestBottomSheet as any).current.snapTo(1);
        (transactionTabBarBottomSheet as any).current.snapTo(1);
      }, 30);
    }

    if (recoveryRequest) {
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 2);
      (RecoverySecretRequestBottomSheet as any).current.snapTo(1);
      (transactionTabBarBottomSheet as any).current.snapTo(1);
    }
  }, [custodyRequest, recoveryRequest]);

  const dispatch = useDispatch();

  // const s3Service = useSelector(state => state.sss.service);
  const [overallHealth, setOverallHealth] = useState();

  const health = useSelector(state => state.sss.overallHealth);
  useEffect(() => {
    console.log({ health });
    if (health) setOverallHealth(health);
  }, [health]);

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
          'I lost my hexa wallet, need the shares back to restore my\nwallet'
        }
        acceptButtonName={'Accept Request'}
        rejectButtonName={'Reject Request'}
        onPressAccept={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 2);
          (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
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
            setTabBarZIndex(999);
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
        <View style={styles.headerViewContainer}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.headerTitleViewContainer}>
              <Text
                style={styles.headerTitleText}
             >{`${walletName}’s Wallet`}</Text> 
             <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                {switchOn ? (
                  <Image
                    style={CommonStyles.homepageAmountImage}
                    source={require('../assets/images/icons/icon_bitcoin_light.png')}
                  />
                ) : (
                  <Image
                    style={styles.cardBitCoinImage}
                    source={require('../assets/images/icons/icon_dollar_white.png')}
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
                        exchangeRates['USD'].last
                      ).toFixed(2)
                    : 0}
                </Text>
                <Text
                  style={{
                    ...CommonStyles.homepageAmountUnitText,
                    color: Colors.white,
                  }}
                >
                  {switchOn ? 'sats' : 'usd'}
                </Text>
              </View>
            </View>
            <View style={styles.headerToggleSwitchContainer}>
              <ToggleSwitch
                onpress={async () => {
                  setSwitchOn(!switchOn);
                }}
                toggle={switchOn}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 7 }}>
              {messageAsPerHealth(
                overallHealth ? overallHealth.overallStatus : 0,
              )}
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('ManageBackup');
                }}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>Manage Backup</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 4, alignItems: 'flex-end' }}>
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
            renderItem={Items => {
              return (
                <View style={{ flexDirection: 'column' }}>
                  {Items.item.map(value => {
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
                                {value.title == 'Regular Account'
                                  ? 'Checking Account'
                                  : value.title}
                                {/* // {value.title} */}
                              </Text>
                              <Text
                                style={{
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
                                    source={require('../assets/images/icons/icon_dollar_dark.png')}
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
                                        exchangeRates['USD'].last
                                      ).toFixed(2)
                                    : exchangeRates
                                    ? (
                                        (balances.secureBalance / 1e8) *
                                        exchangeRates['USD'].last
                                      ).toFixed(2)
                                    : 0}
                                </Text>
                                <Text style={styles.cardAmountUnitText}>
                                  {switchOn
                                    ? value.unit
                                    : value.accountType === 'test'
                                    ? value.unit
                                    : 'usd'}
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
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          if (selected == 'Transactions')
            (transactionTabBarBottomSheet as any).current.snapTo(1);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={transactionTabBarBottomSheet}
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
        ref={addTabBarBottomSheet}
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
        ref={QrTabBarBottomSheet}
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
        ref={moreTabBarBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('18%')
            : Platform.OS == 'android'
            ? hp('19%')
            : hp('18%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('70%'),
        ]}
        renderContent={renderMoreContent}
        renderHeader={renderMoreHeader}
      />
      {/* <BottomSheet
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={NoInternetBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderNoInternetModalContent}
        renderHeader={renderNoInternetModalHeader}
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
        ref={CustodianRequestBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderCustodianRequestModalContent}
        renderHeader={renderCustodianRequestModalHeader}
      />
      <BottomSheet
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        enabledInnerScrolling={true}
        ref={RecoverySecretRequestBottomSheet}
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
        ref={CustodianRequestRejectedBottomSheet}
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
          ref={addressBookBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('70%'),
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
          ref={AllAccountsBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('70%'),
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
          ref={settingsBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('65%')
              : hp('70%'),
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
      <BottomSheet
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
      />
      {addBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            setTabBarZIndex(0);
          }}
          onCloseEnd={() => {
            setTabBarZIndex(999);
            setAddSubBottomSheetsFlag(false);
          }}
          enabledInnerScrolling={true}
          ref={AddBottomSheet}
          snapPoints={[-50, hp('63%')]}
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
          ref={fastBitcoinRedeemCalculationBottomSheet}
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
          ref={fastBitcoinSellCalculationBottomSheet}
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
      {addSubBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            setTabBarZIndex(0);
            setFamilyAndFriendsBookBottomSheetsFlag(true);
          }}
          onCloseEnd={() => {
            setTabBarZIndex(999);
            setFamilyAndFriendsBookBottomSheetsFlag(false);
          }}
          enabledInnerScrolling={true}
          ref={FamilyAndFriendAddressBookBottomSheet}
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
          ref={ContactSelectedFromAddressBookBottomSheet}
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
          ref={ContactSelectedFromAddressBookQrCodeBottomSheet}
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
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
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
    fontFamily: Fonts.firasonsRegular,
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
    paddingBottom: hp('7%'),
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
    marginBottom: hp('3%'),
    justifyContent: 'center',
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(25),
    display: 'flex',
    marginBottom: hp('0.8%'),
  },
  headerToggleSwitchContainer: {
    flex: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: hp('3%'),
  },
  headerInfoText: {
    fontSize: RFValue(12),
    color: Colors.white,
    marginBottom: hp('3%'),
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
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountTextGrey: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
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
