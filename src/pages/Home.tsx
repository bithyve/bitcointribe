import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  ImageBackground,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Alert,
  Keyboard,
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
} from '../store/actions/sss';
import RecoverySecretRequestModalContents from '../components/RecoverySecretRequestModalContesnts';
import ShareRecoverySecretModalContents from '../components/ShareRecoverySecretModalContents';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import { getTestcoins } from '../store/actions/accounts';
import axios from 'axios';
import { UsNumberFormat } from '../common/utilities';

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
  const database = useSelector(state => state.storage.database);
  const walletName = database ? database.WALLET_SETUP.walletName : '';
  const accounts = useSelector(state => state.accounts);
  const [exchangeRates, setExchangeRates] = useState();
  const [balances, setBalances] = useState({
    testBalance: 0,
    regularBalance: 0,
    secureBalance: 0,
    accumulativeBalance: 0,
  });
  const [qrData, setqrData] = useState('');
  const [transactions, setTransactions] = useState([]);
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
  }, [accounts]);

  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: '',
    question: '',
  });
  const [answer, setAnswer] = useState('');
  const [selectToAdd, setSelectToAdd] = useState('Getbittr');
  const [openmodal, setOpenmodal] = useState('closed');
  const [tabBarZIndex, setTabBarZIndex] = useState(999);
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
  const [
    ShareRecoverySecretOtpBottomSheet,
    setShareRecoverySecretOtpBottomSheet,
  ] = useState(React.createRef());
  const [
    HealthCheckSuccessBottomSheet,
    setHealthCheckSuccessBottomSheet,
  ] = useState(React.createRef());
  const [
    HealthCheckGoogleAuthBottomSheet,
    setHealthCheckGoogleAuthBottomSheet,
  ] = useState(React.createRef());
  const [
    HealthCheckSecurityQuestionBottomSheet,
    setHealthCheckSecurityQuestionBottomSheet,
  ] = useState(React.createRef());
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
  const [MoreTabBottomSheet, setMoreTabBottomSheet] = useState(
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
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const [newData, setNewData] = useState([]);
  const custodyRequest = props.navigation.getParam('custodyRequest');
  const recoveryRequest = props.navigation.getParam('recoveryRequest');

  const [data, setData] = useState([
    {
      id: 1,
      title: 'Test Account',
      unit: 'tsats',
      amount: '400,000',
      account: `Test Account`,
      accountType: 'test',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_test.png'),
    },
    {
      id: 2,
      title: 'Regular Account',
      unit: 'sats',
      amount: '5,000',
      account: 'Fast and easy',
      accountType: 'regular',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_gray.png'),
    },
    {
      id: 3,
      title: 'Savings Account',
      unit: 'sats',
      amount: '60,000',
      account: 'Multi-factor security',
      accountType: 'secure',
      bitcoinicon: require('../assets/images/icons/icon_bitcoin_gray.png'),
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
    (bottomSheet as any).current.snapTo(1);
    AppState.addEventListener('change', handleAppStateChange);
    // NetInfo.addEventListener(state => {
    //   if (!state.isConnected) (NoInternetBottomSheet as any).current.snapTo(1);
    //   else if (state.isConnected)
    //     (NoInternetBottomSheet as any).current.snapTo(0);
    // });
    Linking.addEventListener('url', handleDeepLink);
    // return () => Linking.removeEventListener("url", handleDeepLink);
    // HC up-streaming
    if (database) {
      if (Object.keys(database.DECENTRALIZED_BACKUP.UNDER_CUSTODY).length) {
        dispatch(updateMSharesHealth());
      }
    }

    (async () => {
      if (!overallHealth) {
        const storedHealth = await AsyncStorage.getItem('overallHealth');
        if (storedHealth) {
          setOverallHealth(JSON.parse(storedHealth));
        }
      }
    })();
  }, []);

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
    return (
      <View style={styles.modalContentContainer}>
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
    );
  };

  // useEffect(() => {
  //   if (selectToAdd) {
  //     setTimeout(() => {
  //       setTabBarZIndex(0);
  //     }, 2);
  //     AddBottomSheet.current.snapTo(1);
  //   }
  // }, [selectToAdd]);

  // function onClickFunc(type) {
  //   alert('dfdß');
  //   if (type == 'Fastbitcoins' || type == 'Getbittr' || type == 'Add Contact') {
  //     setTimeout(() => {
  //       setSelectToAdd(type);
  //       setTabBarZIndex(0);
  //     }, 2);
  //   }
  //   (AddBottomSheet as any).current.snapTo(1);
  // }

  const renderAdd = () => {
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
  };

  const getQrCodeData = qrData => {
    // console.log('Qrcodedata', data);
    const scannedData = JSON.parse(qrData);
    switch (scannedData.type) {
      case 'secondaryDeviceQR':
        const custodyRequest = {
          requester: scannedData.requester,
          ek: scannedData.ENCRYPTED_KEY,
          otp: scannedData.OTP,
        };
        props.navigation.navigate('Home', { custodyRequest });
        break;
      default:
        break;
    }
  };

  function renderContent1() {
    if (selected == 'Transactions') {
      return renderTransactionsContent();
    } else if (selected == 'Add') {
      return renderAdd();
      //return
    } else if (selected == 'QR') {
      return (
        <QrCodeModalContents
          modalRef={bottomSheet}
          isOpenedFlag={QrBottomSheetsFlag}
          onQrScan={qrData => getQrCodeData(qrData)}
          onPressQrScanner={() => {
            props.navigation.navigate('QrScanner', {
              scanedCode: getQrCodeData,
            });
          }}
        />
      );
    } else if (selected == 'More') {
      return (
        <MoreHomePageTabContents
          onPressElements={item => onPressElement(item)}
        />
      );
    }
  }

  function renderHeader() {
    return (
      <TouchableOpacity
        disabled={selected == 'More' ? true : false}
        activeOpacity={10}
        onPress={() => openCloseModal()}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>{selected}</Text>
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
    if (openmodal == 'closed') {
      setTimeout(() => {
        setQrBottomSheetsFlag(false);
      }, 10);
      (bottomSheet as any).current.snapTo(1);
    }
    if (openmodal == 'half') {
      if (selected == 'QR') {
        setTimeout(() => {
          setQrBottomSheetsFlag(true);
        }, 10);
      }
      (bottomSheet as any).current.snapTo(2);
    }
    if (openmodal == 'full') {
      if (selected == 'QR') {
        setTimeout(() => {
          setQrBottomSheetsFlag(true);
        }, 10);
      }
      (bottomSheet as any).current.snapTo(3);
    }
  }, [openmodal]);

  async function selectTab(tabTitle) {
    (bottomSheet as any).current.snapTo(2);
    if (tabTitle == 'More') {
      setTimeout(() => {
        setKnowMoreBottomSheetsFlag(true);
        setSelected(tabTitle);
        setSelected(tabTitle);
      }, 2);
    } else if (tabTitle == 'Transactions') {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 2);
    } else if (tabTitle == 'Add') {
      setTimeout(() => {
        setAddBottomSheetsFlag(true);
        setModaldata([]);
        setSelected(tabTitle);
      }, 2);
    } else if (tabTitle == 'QR') {
      setTimeout(() => {
        setModaldata(transactionData);
        setSelected(tabTitle);
      }, 2);
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
  //     <TransparentHeaderModal
  //       onPressheader={() => {
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
          }, 2);
          (CustodianRequestBottomSheet as any).current.snapTo(0);
          props.navigation.navigate('CustodianRequestOTP', { custodyRequest });
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
    if (item.title == 'Health of the App') {
      props.navigation.navigate('HealthCheck');
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
    } else if (item.title == 'All Accounts') {
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
        onPressHandle={() => {
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
        onPressHandle={() => {
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
        onPressHandle={() => {
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
        onPressHandle={() => {
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
        onPressHandle={() => {
          (fastBitcoinSellCalculationBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderFastBitcoinRedeemCalculationHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={() => {
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
        onPressHandle={() => {
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
        onPressHandle={() => {
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
        onPressHandle={() => {
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

  // const renderHealthCheckGoogleAuthContents = () => {
  //   return (
  //     <HealthCheckGoogleAuthModalContents
  //       modalRef={ HealthCheckGoogleAuthBottomSheet }
  //       onPressConfirm={ () => {
  //         Keyboard.dismiss();
  //         ( HealthCheckGoogleAuthBottomSheet as any ).current.snapTo( 0 );
  //         //  (HealthCheckSuccessBottomSheet as any).current.snapTo(1);
  //       } }
  //     />
  //   );
  // };

  // const renderHealthCheckGoogleAuthHeader = () => {
  //   return (
  //     <TransparentHeaderModal
  //       onPressheader={ () => {
  //         ( HealthCheckGoogleAuthBottomSheet as any ).current.snapTo( 0 );
  //       } }
  //     />
  //   );
  // };

  let isNavigate = false;
  const handleAppStateChange = nextAppState => {
    console.log('nextAppState', nextAppState);
    if (global.isCameraOpen) {
      global.isCameraOpen = false;
    }
    if (global.isContactOpen) {
      global.isContactOpen = false;
    }
    var blockApp = setTimeout(function() {
      if (isNavigate) {
        props.navigation.navigate('ReLogin');
      }
    }, 30000);
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
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 2);
      (CustodianRequestBottomSheet as any).current.snapTo(1);
      (bottomSheet as any).current.snapTo(1);
    }

    if (recoveryRequest) {
      setTimeout(() => {
        setTabBarZIndex(0);
      }, 2);
      (RecoverySecretRequestBottomSheet as any).current.snapTo(1);
      (bottomSheet as any).current.snapTo(1);
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

  const testAccService = useSelector(
    state => state.accounts[TEST_ACCOUNT].service,
  );

  useEffect(() => {
    if (testAccService)
      (async () => {
        if (!(await AsyncStorage.getItem('Received Testcoins'))) {
          const { balances } = testAccService.hdWallet;
          const netBalance = testAccService
            ? balances.balance + balances.unconfirmedBalance
            : 0;
          if (!netBalance) dispatch(getTestcoins(TEST_ACCOUNT));
        }
      })();
  }, [testAccService]);

  useEffect(() => {
    (async () => {
      const storedExchangeRates = await AsyncStorage.getItem('exchangeRates');
      if (storedExchangeRates) {
        const exchangeRates = JSON.parse(storedExchangeRates);
        if (Date.now() - exchangeRates.lastFetched < 1800000) {
          setExchangeRates(exchangeRates);
          return;
        } // maintaining a half an hour difference b/w fetches
      }
      const res = await axios.get('https://blockchain.info/ticker');
      console.log({ res });
      if (res.status == 200) {
        const exchangeRates = res.data;
        exchangeRates.lastFetched = Date.now();
        setExchangeRates(exchangeRates);
        await AsyncStorage.setItem(
          'exchangeRates',
          JSON.stringify(exchangeRates),
        );
      } else {
        console.log('Failed to retrieve exchange rates', res);
      }
    })();
  }, []);

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
          props.navigation.navigate('RecoveryRequestOTP', { recoveryRequest });
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
  //     <TransparentHeaderModal
  //       onPressheader={() => {
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
                    : (
                        (balances.accumulativeBalance / 1e8) *
                        exchangeRates['USD'].last
                      ).toFixed(2)}
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
                                  alert('2FA');
                                }}
                                style={{ marginLeft: 'auto' }}
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
                          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                            <Text style={styles.cardTitle}>{value.title}</Text>
                            <Text
                              style={{
                                color: Colors.textColorGrey,
                                fontSize: RFValue(11),
                              }}
                            >
                              {value.accountType === 'test'
                                ? `${walletName}'s ${value.account}`
                                : value.account}
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
                              <Text style={styles.cardAmountText}>
                                {switchOn
                                  ? value.accountType === 'test'
                                    ? UsNumberFormat(balances.testBalance)
                                    : value.accountType === 'regular'
                                    ? UsNumberFormat(balances.regularBalance)
                                    : UsNumberFormat(balances.secureBalance)
                                  : value.accountType === 'test'
                                  ? UsNumberFormat(balances.testBalance)
                                  : value.accountType === 'regular'
                                  ? (
                                      (balances.regularBalance / 1e8) *
                                      exchangeRates['USD'].last
                                    ).toFixed(2)
                                  : (
                                      (balances.secureBalance / 1e8) *
                                      exchangeRates['USD'].last
                                    ).toFixed(2)}
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
                  })}
                </View>
              );
            }}
          />
          {/* <FlatList
            horizontal
            showsHorizontalScrollIndicator={ false }
            data={ data }
            extraData={ JSON.stringify( {
              testBalance,
              regularBalance,
              secureBalance,
            } ) }
            renderItem={ Items => {
              return (
                <View style={ { flexDirection: 'column' } }>
                  <TouchableOpacity
                    onPress={ () => {
                      props.navigation.navigate( 'Accounts', {
                        serviceType:
                          Items.item.accountType === 'test'
                            ? TEST_ACCOUNT
                            : Items.item.accountType === 'regular'
                            ? REGULAR_ACCOUNT
                            : SECURE_ACCOUNT,
                      });
                    }}
                  >
                    <CardView cornerRadius={ 10 } style={ styles.card }>
                      <View style={ { flexDirection: 'row' } }>
                        <Image
                          style={ { width: wp( '10%' ), height: wp( '10%' ) } }
                          source={ getIconByAccountType( Items.item.accountType ) }
                        />
                        { Items.item.accountType == 'secure' ? (
                          <TouchableOpacity
                            onPress={ () => {
                              alert( '2FA' );
                            } }
                            style={ { marginLeft: 'auto' } }
                          >
                            <Text
                              style={ {
                                color: Colors.blue,
                                fontSize: RFValue( 11, 812 ),
                                fontFamily: Fonts.FiraSansRegular,
                              } }
                            >
                              2FA
                            </Text>
                          </TouchableOpacity>
                        ) : null }
                      </View>
                      <View style={ { flex: 1, justifyContent: 'flex-end' } }>
                        <Text style={ styles.cardTitle }>{ Items.item.title }</Text>
                        <Text
                          style={ {
                            color: Colors.textColorGrey,
                            fontSize: RFValue( 11, 812 ),
                          } }
                        >
                          { Items.item.account }
                        </Text>
                        <View
                          style={ {
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            marginTop: hp( '1%' ),
                          } }
                        >
                          <Image
                            style={ styles.cardBitCoinImage }
                            source={ Items.item.bitcoinicon }
                          />
                          <Text style={ styles.cardAmountText }>
                            { Items.item.accountType === 'test'
                              ? testBalance
                              : Items.item.accountType === 'regular'
                              ? regularBalance
                              : secureBalance}
                          </Text>
                          <Text style={ styles.cardAmountUnitText }>
                            { Items.item.unit }
                          </Text>
                        </View>
                      </View>
                    </CardView>
                  </TouchableOpacity>
                </View>
              );
            } }
          /> */}
        </View>
      </View>
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
          (bottomSheet as any).current.snapTo(1);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={bottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('18%')
            : Platform.OS == 'android'
            ? hp('20%')
            : hp('19%'),
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('75%'),
          hp('90%'),
        ]}
        renderContent={renderContent1}
        renderHeader={renderHeader}
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
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={CustodianRequestBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderCustodianRequestModalContent}
        renderHeader={renderCustodianRequestModalHeader}
      />
      <BottomSheet
        onOpenStart={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
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
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={CustodianRequestRejectedBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderCustodianRequestRejectedModalContent}
        renderHeader={renderCustodianRequestRejectedModalHeader}
      />
      {KnowMoreBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {}}
          onCloseEnd={() => {
            setTabBarZIndex(999);
          }}
          enabledInnerScrolling={true}
          ref={addressBookBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
          ]}
          renderContent={renderAddressBookContents}
          renderHeader={renderAddressBookHeader}
        />
      ) : null}
      {KnowMoreBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            setTabBarZIndex(0);
          }}
          onCloseEnd={() => {
            setTabBarZIndex(999);
          }}
          enabledInnerScrolling={true}
          ref={AllAccountsBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
          ]}
          renderContent={renderAllAccountsContents}
          renderHeader={renderAllAccountsHeader}
        />
      ) : null}
      {KnowMoreBottomSheetsFlag ? (
        <BottomSheet
          onOpenEnd={() => {
            setTabBarZIndex(0);
          }}
          enabledInnerScrolling={true}
          ref={settingsBottomSheet}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('90%')
              : hp('90%'),
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
              <Text style={styles.activeTabTextStyle}>More</Text>
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
    height: Platform.OS == 'ios' ? 45 : 40,
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
    marginTop: hp('3%'),
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
    marginBottom: hp('4%'),
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
    marginBottom: wp('0.5%'),
    resizeMode: 'contain',
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(17),
    marginRight: 5,
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginBottom: 2,
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
