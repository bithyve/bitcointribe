import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  Platform,
  AsyncStorage,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import CommonStyles from '../../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import HeaderTitle from '../../components/HeaderTitle';
import RequestModalContents from '../../components/RequestModalContents';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import Entypo from 'react-native-vector-icons/Entypo';
import RecoveryQuestionModalContents from '../../components/RecoveryQuestionModalContents';
import RecoverySuccessModalContents from '../../components/RecoverySuccessModalContents';
import ErrorModalContents from '../../components/ErrorModalContents';
import { useDispatch, useSelector } from 'react-redux';
import { downloadMShare, recoverWallet, walletRecoveryFailed } from '../../store/actions/sss';
import ModalHeader from '../../components/ModalHeader';
import RestoreByCloudQrCodeContents from './RestoreByCloudQrCodeContents';

import LoaderModal from '../../components/LoaderModal';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';
import {
  getTestcoins,
  fetchBalance,
  fetchTransactions,
  syncAccounts,
  calculateExchangeRate,
} from '../../store/actions/accounts';
import axios from 'axios';

export default function RestoreSelectedContactsList(props) {
  let [message, setMessage] = useState('Creating your wallet');
  const [Elevation, setElevation] = useState(10);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loaderBottomSheet, setLoaderBottomSheet] = useState(React.createRef());
  const [walletNameBottomSheet, setWalletNameBottomSheet] = useState(
    React.createRef(),
  );
  const [successMessageBottomSheet, setSuccessMessageBottomSheet] = useState(
    React.createRef(),
  );
  const [
    recoveryQuestionBottomSheet,
    setRecoveryQuestionBottomSheet,
  ] = useState(React.createRef());
  const [requestBottomSheet, setRequestBottomSheet] = useState(
    React.createRef(),
  );
  const [walletNameOpenModal, setWalletNameOpenModal] = useState('close');
  // const [walletName, setWalletName] = useState("");
  const [isContactSelected, setIsContactSelected] = useState(true);
  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: '',
    question: '',
  });
  const [answer, setAnswer] = useState('');
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [RestoreByCloudQrCode, setRestoreByCloudQrCode] = useState(
    React.createRef(),
  );
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [openmodal, setOpenmodal] = useState('closed');
  const [ErrorBottomSheet1, setErrorBottomSheet1] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isWalletRecoveryFailed = useSelector(state => state.sss.walletRecoveryFailed);
  console.log("isWalletRecoveryFailed", isWalletRecoveryFailed);
  // function openCloseModal() {
  //   if (!walletName) {
  //     walletNameBottomSheet.current.snapTo(0);
  //     return;
  //   }
  //   if (walletNameOpenModal == "closed") {
  //     setWalletNameOpenModal("half");
  //     return;
  //   }
  //   if (walletNameOpenModal == "half") {
  //     setWalletNameOpenModal("full");
  //     return;
  //   }
  //   if (walletNameOpenModal == "full") {
  //     setWalletNameOpenModal("closed");
  //     return;
  //   }
  // }

  const getSelectedContactList = async () => {
    let contactList = await AsyncStorage.getItem('selectedContacts');
    if (contactList) {
      setSelectedContacts(JSON.parse(contactList));
    }
    let documentList = await AsyncStorage.getItem('selectedDocuments');
    if (documentList) {
      setSelectedDocuments(JSON.parse(documentList));
    }
  };
  const [exchangeRates, setExchangeRates] = useState();
  const accounts = useSelector(state => state.accounts);

  const dispatch = useDispatch();

  const [balances, setBalances] = useState({
    testBalance: 0,
    regularBalance: 0,
    secureBalance: 0,
    accumulativeBalance: 0,
  });
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

  useEffect(() => {
    // (ErrorBottomSheet as any).current.snapTo(1);
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
    let focusListener = props.navigation.addListener('didFocus', () => {
      getSelectedContactList();
    });
    return () => {
      focusListener.remove();
    };
  }, []);

  useEffect(() => {
    if (walletNameOpenModal == 'closed') {
      (walletNameBottomSheet as any).current.snapTo(0);
    }
    if (walletNameOpenModal == 'half') {
      (walletNameBottomSheet as any).current.snapTo(1);
    }
    if (walletNameOpenModal == 'full') {
      (walletNameBottomSheet as any).current.snapTo(2);
    }
  }, [walletNameOpenModal]);

  const openRequestModal = () => {
    (requestBottomSheet as any).current.snapTo(1);
  };

  // function renderContent() {
  //   return (
  //     <RecoveryWalletNameModalContents
  //       onTextChange={text => {
  //         setWalletName(text);
  //       }}
  //       onPressTextBoxFocus={() => {
  //         setWalletNameOpenModal("full");
  //       }}
  //       onPressTextBoxBlur={() => {
  //         setWalletNameOpenModal("half");
  //       }}
  //       onPressProceed={() => {
  //         walletNameBottomSheet.current.snapTo(0);
  //         recoveryQuestionBottomSheet.current.snapTo(1);
  //       }}
  //     />
  //   );
  // }

  const onPressRequest = async () => {
    let selectedContacts = JSON.parse(
      await AsyncStorage.getItem('selectedContacts'),
    );
    if (!selectedContacts[0].status && !selectedContacts[1].status) {
      selectedContacts[1].status = 'received';
    } else if (selectedContacts[1].status == 'received') {
      selectedContacts[0].status = 'inTransit';
      selectedContacts[1].status = 'rejected';
    }
    AsyncStorage.setItem('selectedContacts', JSON.stringify(selectedContacts));
    getSelectedContactList();
    (requestBottomSheet as any).current.snapTo(0);
  };

  const RequestModalContentFunction = () => {
    return (
      <RequestModalContents
        onPressRequest={() => onPressRequest()}
        onPressViaQr={() => {}}
      />
    );
  };

  const RequestHeaderFunction = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          (requestBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  function renderHeader() {
    return <TransparentHeaderModal onPressheader={() => closeModal()} />;
  }

  const renderLoaderModalContent = () => {
    return (
      <LoaderModal
        headerText={message}
        messageText={'This may take some time while Hexa is using the Recovery Secrets to recreate your wallet'}
      />
    );
  };

  const renderLoaderModalHeader = () => {
    return (
      <View
        style={{
          marginTop: 'auto',
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          height: hp('75%'),
          zIndex: 9999,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    );
  };

  function closeModal() {
    (successMessageBottomSheet as any).current.snapTo(0);
    (recoveryQuestionBottomSheet as any).current.snapTo(0);
    (walletNameBottomSheet.current as any).snapTo(0);
    return;
  }

  const submitRecoveryQuestion = () => {
    (recoveryQuestionBottomSheet.current as any).snapTo(0);
    (successMessageBottomSheet.current as any).snapTo(1);
  };

  function renderRecoveryQuestionContent() {
    return (
      <RecoveryQuestionModalContents
        onQuestionSelect={value => {
          setDropdownBoxValue(value);
        }}
        onTextChange={text => {
          setAnswer(text);
        }}
        onPressConfirm={() => submitRecoveryQuestion()}
        onPressKnowMore={() => {}}
        bottomSheetRef={recoveryQuestionBottomSheet}
      />
    );
  }

  function renderSuccessContent() {
    return (
      <RecoverySuccessModalContents
        walletName={'Pam’s Wallet'}
        walletAmount={'2,065,000'}
        walletUnit={'sats'}
        onPressGoToWallet={() => {
          props.navigation.navigate('Home');
        }}
      />
    );
  }

  const handleDocuments = async () => {
    let selectedDocuments = JSON.parse(
      await AsyncStorage.getItem('selectedDocuments'),
    );
    if (!selectedDocuments[0].status) {
      selectedDocuments[0].status = 'rejected';
    } else if (selectedDocuments[0].status == 'rejected') {
      selectedDocuments[0].status = 'received';
    }
    AsyncStorage.setItem(
      'selectedDocuments',
      JSON.stringify(selectedDocuments),
    );
    getSelectedContactList();
  };

  const renderErrorModalContent = () => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={'Recovery Secret Request'}
        titleNextLine={'from Cloud unsuccessful'}
        info={'There seems to a problem'}
        note={'You can choose to try again or select a different source'}
        noteNextLine={'for Personal Copies'}
        proceedButtonText={'Try Again'}
        cancelButtonText={'Select others'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderErrorModalHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderErrorModalContent1 = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet1}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          (ErrorBottomSheet1 as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage,errorMessageHeader]);

  const renderErrorModalHeader1 = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet1 as any).current.snapTo(0);
        }}
      />
    );
  }, []);

if(isWalletRecoveryFailed){
  setTimeout(() => {
    setErrorMessageHeader('Error recovering your wallet!');
    setErrorMessage(
      'There was an error while recovering your wallet, please try again',
    );
  }, 2);
  (ErrorBottomSheet as any).current.snapTo(1);
  dispatch(walletRecoveryFailed(null));
}
  const { DECENTRALIZED_BACKUP, SERVICES } = useSelector(
    state => state.storage.database,
  );

  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

  const { REQUEST_DETAILS, META_SHARE } = RECOVERY_SHARES[0]
    ? RECOVERY_SHARES[0]
    : { REQUEST_DETAILS: null, META_SHARE: null };

  const metaShares = [];
  Object.keys(RECOVERY_SHARES).forEach(key => {
    const { META_SHARE } = RECOVERY_SHARES[key];
    if (META_SHARE) metaShares.push(META_SHARE);
  });

  useEffect(() => {
    (async () => {
      if (SERVICES) {
        await AsyncStorage.setItem('walletExists', 'true');
        await AsyncStorage.setItem('walletRecovered', 'true');
        // props.navigation.navigate('Home');
        // dispatch(fetchBalance(TEST_ACCOUNT, { fetchTransactionsSync: true }));
        // dispatch(
        //   fetchBalance(REGULAR_ACCOUNT, { fetchTransactionsSync: true }),
        // );
        // dispatch(fetchBalance(SECURE_ACCOUNT, { fetchTransactionsSync: true }));
        // // dispatch(fetchTransactions(TEST_ACCOUNT));
        // dispatch(fetchTransactions(REGULAR_ACCOUNT));
        // dispatch(fetchTransactions(SECURE_ACCOUNT));
        // dispatch(syncAccounts(true)); // syncAccounts(true) would do a hard refresh for the accounts (BST executed)

        dispatch(calculateExchangeRate());

        // setTimeout(() => {
        //   (loaderBottomSheet as any).current.snapTo(0);
        //   props.navigation.navigate('Home');
        // }, 4000);

        dispatch(syncAccounts());
      }
    })();
  }, [SERVICES]);

  if (accounts.accountsSynched) {
    (loaderBottomSheet as any).current.snapTo(0);
    props.navigation.navigate('Home', {
      exchangeRates,
      balances,
      transactions,
    });
  }

  const downloadSecret = shareIndex => {
    const { REQUEST_DETAILS, META_SHARE } = RECOVERY_SHARES[shareIndex];

    if (!META_SHARE) {
      const { OTP, ENCRYPTED_KEY } = REQUEST_DETAILS;
      console.log({ OTP, ENCRYPTED_KEY });
      dispatch(downloadMShare(OTP, ENCRYPTED_KEY, 'recovery'));
    } else {
      Alert.alert('Downloaded', 'Secret already downloaded');
    }
  };

  useEffect(() => {
    (async () => {
      let mod = false;
      selectedContacts.forEach((contact, index) => {
        if (RECOVERY_SHARES[index + 1]) {
          if (RECOVERY_SHARES[index + 1].META_SHARE) {
            if (selectedContacts[index].status !== 'received') {
              selectedContacts[index].status = 'received';
              mod = true;
            }
          } else if (RECOVERY_SHARES[index + 1].REQUEST_DETAILS) {
            if (selectedContacts[index].status !== 'inTransit') {
              selectedContacts[index].status = 'inTransit';
              mod = true;
            }
          }
        }
      });

      if (mod) {
        await AsyncStorage.setItem(
          'selectedContacts',
          JSON.stringify(selectedContacts),
        );
        getSelectedContactList();
      }
    })();
  }, [RECOVERY_SHARES, selectedContacts]);

  useEffect(() => {
    if (openmodal == 'closed') {
      setTimeout(() => {
        setQrBottomSheetsFlag(false);
      }, 10);
      (RestoreByCloudQrCode as any).current.snapTo(0);
    }
    if (openmodal == 'full') {
      setTimeout(() => {
        setQrBottomSheetsFlag(true);
      }, 10);
      (RestoreByCloudQrCode as any).current.snapTo(1);
    }
  }, [openmodal]);

  function openCloseModal() {
    if (openmodal == 'closed') {
      setOpenmodal('full');
    }
    if (openmodal == 'full') {
      setOpenmodal('closed');
    }
  }

  const onScanCompleted = async shareCode => {
    let selectedDocsTemp = JSON.parse(
      await AsyncStorage.getItem('selectedDocuments'),
    );
    if (!selectedDocsTemp) {
      selectedDocsTemp = [];
    }
    let obj = null;
    if (shareCode == 'e0') {
      obj = { title: 'Personal Copy 1', status: 'received' };
      selectedDocsTemp[0] = obj;
    } else if (shareCode == 'c0') {
      obj = { title: 'Personal Copy 2', status: 'received' };
      selectedDocsTemp[1] = obj;
    }
    await AsyncStorage.setItem(
      'selectedDocuments',
      JSON.stringify(selectedDocsTemp),
    );
    selectedDocsTemp = JSON.parse(
      await AsyncStorage.getItem('selectedDocuments'),
    );
    setSelectedDocuments(selectedDocsTemp);
  };

  function renderRestoreByCloudQrCodeContent() {
    return (
      <RestoreByCloudQrCodeContents
        onScanCompleted={shareCode => onScanCompleted(shareCode)}
        modalRef={RestoreByCloudQrCodeContents}
        isOpenedFlag={QrBottomSheetsFlag}
        onPressBack={() => {
          (RestoreByCloudQrCode as any).current.snapTo(0);
        }}
      />
    );
  }

  function renderRestoreByCloudQrCodeHeader() {
    return (
      <ModalHeader
        onPressHeader={() => {
          (RestoreByCloudQrCode as any).current.snapTo(0);
          openCloseModal();
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.navigate('RestoreAndRecoverWallet');
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <HeaderTitle
          firstLineTitle={'Restore wallet using'}
          secondLineTitle={'Recovery Secrets'}
          infoTextNormal={
            'These are the Recovery Secrets that you have stored in five places. '
          }
          infoTextBold={'You need three of them restore your wallet'}
        />
        <TouchableOpacity
          style={{
            ...styles.listElements,
            marginTop: 60,
            marginBottom: META_SHARE ? 0 : 10,
          }}
          onPress={() =>
            props.navigation.navigate('RestoreWalletBySecondaryDevice')
          }
        >
          <Image
            style={styles.iconImage}
            source={require('../../assets/images/icons/icon_secondarydevice.png')}
          />
          <View style={styles.textInfoView}>
            <Text style={styles.listElementsTitle}>Secondary Device (One)</Text>
            <Text style={styles.listElementsInfo}>
              You need your secondary device with you to scan the QR code
            </Text>
          </View>
          <View style={styles.listElementIcon}>
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.textColorGrey}
              size={15}
              style={{ alignSelf: 'center' }}
            />
          </View>
        </TouchableOpacity>
        {META_SHARE && (
          <View style={{}}>
            <TouchableOpacity
              style={{
                ...styles.selectedContactView,
                marginBottom: 15,
              }}
            >
              <View>
                <Text style={styles.selectedContactName}>
                  {META_SHARE ? 'Downloaded' : 'Download'}
                </Text>
              </View>
              {META_SHARE ? (
                <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                  <View
                    style={{
                      ...styles.secretReceivedCheckSignView,
                      backgroundColor: Colors.green,
                    }}
                  >
                    <Feather
                      name={'check'}
                      size={12}
                      color={Colors.darkGreen}
                    />
                  </View>
                </View>
              ) : !META_SHARE ? (
                <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                  <View
                    style={{
                      height: 25,
                      width: 25,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 5,
                    }}
                  >
                    <Entypo
                      name={'dots-three-horizontal'}
                      size={15}
                      color={Colors.borderColor}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                  <Text>{META_SHARE ? 'Downloaded' : 'Download'}</Text>
                  <View style={styles.dotsView} />
                  <View style={styles.dotsView} />
                  <View style={styles.dotsView} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.separator} />
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('RestoreWalletByContacts', { index: 1 })
          }
        >
          <View
            style={{
              ...styles.listElements,
              marginBottom: selectedContacts.length > 0 ? 0 : 10,
            }}
          >
            <Image
              style={styles.iconImage}
              source={require('../../assets/images/icons/icon_contact.png')}
            />
            <View style={styles.textInfoView}>
              <Text style={styles.listElementsTitle}>
                Trusted Contacts (Two)
              </Text>
              <Text style={styles.listElementsInfo}>
                Select one or two contacts with whom you have stored your
                recover secret
              </Text>
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </View>
          {selectedContacts.length > 0 && (
            <View style={{}}>
              {selectedContacts.map((contact, index) => {
                return (
                  <TouchableOpacity
                    activeOpacity={contact.status == '' ? 0 : 10}
                    onPress={() => {
                      props.navigation.navigate('RecoveryCommunication', {
                        contact,
                        index: index + 1,
                      });
                    }}
                    style={{ ...styles.selectedContactView, marginBottom: 15 }}
                  >
                    <View>
                      <Text style={styles.selectedContactName}>
                        {contact.name && contact.name.split(' ')[0]
                          ? contact.name.split(' ')[0]
                          : ''}{' '}
                        <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                          {contact.name && contact.name.split(' ')[0]
                            ? contact.name.split(' ')[1]
                            : ''}
                        </Text>
                      </Text>
                      {contact &&
                      contact.communicationMode &&
                      contact.communicationMode.length ? (
                        <Text
                          style={{
                            ...styles.selectedContactName,
                            fontSize: RFValue(11),
                          }}
                        >
                          {contact.communicationMode[0].info}
                        </Text>
                      ) : null}
                    </View>
                    {contact.status == 'received' ? (
                      <View
                        style={{ flexDirection: 'row', marginLeft: 'auto' }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.green,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.darkGreen,
                            }}
                          >
                            Secret Receieved
                          </Text>
                        </View>
                        <View
                          style={{
                            ...styles.secretReceivedCheckSignView,
                            backgroundColor: Colors.green,
                          }}
                        >
                          <Feather
                            name={'check'}
                            size={12}
                            color={Colors.darkGreen}
                          />
                        </View>
                      </View>
                    ) : contact.status == 'inTransit' ? (
                      <View
                        style={{ flexDirection: 'row', marginLeft: 'auto' }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.lightBlue,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.blue,
                            }}
                          >
                            Secret In-Transit
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={{
                            ...styles.secretReceivedCheckSignView,
                            backgroundColor: Colors.lightBlue,
                          }}
                          onPress={() => downloadSecret(index + 1)}
                        >
                          <Ionicons
                            name={'download'}
                            size={15}
                            color={Colors.blue}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : contact.status == 'rejected' ? (
                      <View
                        style={{ flexDirection: 'row', marginLeft: 'auto' }}
                      >
                        <View
                          style={{
                            ...styles.secretReceivedView,
                            backgroundColor: Colors.lightRed,
                          }}
                        >
                          <Text
                            style={{
                              ...styles.secretReceivedText,
                              color: Colors.red,
                            }}
                          >
                            Rejected by Contact
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 5,
                          }}
                        >
                          <Entypo
                            name={'dots-three-horizontal'}
                            size={15}
                            color={Colors.borderColor}
                          />
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {}}
                        style={{ flexDirection: 'row', marginLeft: 'auto' }}
                      >
                        <Text>{contact.status}</Text>
                        <View style={styles.dotsView} />
                        <View style={styles.dotsView} />
                        <View style={styles.dotsView} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          onPress={
            () => (RestoreByCloudQrCode as any).current.snapTo(1)
            // props.navigation.navigate('RestoreWalletUsingDocuments')
          }
        >
          <View
            style={{
              ...styles.listElements,
              marginBottom: selectedDocuments.length > 0 ? 0 : hp('5%'),
            }}
          >
            <Image
              style={styles.iconImage}
              source={require('../../assets/images/icons/files-and-folders-2.png')}
            />
            <View style={styles.textInfoView}>
              <Text style={styles.listElementsTitle}>
                Personal Copies (Two)
              </Text>
              <Text style={styles.listElementsInfo}>
                Select one or two of the sources where you have kept the
                Recovery Secret
              </Text>
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </View>
          {selectedDocuments.length > 0 && (
            <View style={{}}>
              {selectedDocuments.map(value => {
                if (value) {
                  return (
                    <TouchableOpacity
                      activeOpacity={value.status != 'received' ? 0 : 10}
                      onPress={() =>
                        value.status != 'received' ? handleDocuments() : {}
                      }
                      style={{
                        ...styles.selectedContactView,
                        marginBottom: 15,
                      }}
                    >
                      <View>
                        <Text style={styles.selectedContactName}>
                          {value.title}
                        </Text>
                      </View>
                      {value.status == 'received' ? (
                        <View
                          style={{ flexDirection: 'row', marginLeft: 'auto' }}
                        >
                          <View
                            style={{
                              ...styles.secretReceivedView,
                              backgroundColor: Colors.green,
                            }}
                          >
                            <Text
                              style={{
                                ...styles.secretReceivedText,
                                color: Colors.darkGreen,
                              }}
                            >
                              Secret Entered
                            </Text>
                          </View>
                          <View
                            style={{
                              ...styles.secretReceivedCheckSignView,
                              backgroundColor: Colors.green,
                            }}
                          >
                            <Feather
                              name={'check'}
                              size={12}
                              color={Colors.darkGreen}
                            />
                          </View>
                        </View>
                      ) : value.status == 'rejected' ? (
                        <View
                          style={{ flexDirection: 'row', marginLeft: 'auto' }}
                        >
                          <View
                            style={{
                              ...styles.secretReceivedView,
                              backgroundColor: Colors.lightRed,
                            }}
                          >
                            <Text
                              style={{
                                ...styles.secretReceivedText,
                                color: Colors.red,
                              }}
                            >
                              Secret Invalid
                            </Text>
                          </View>
                          <View
                            style={{
                              height: 25,
                              width: 25,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginLeft: 5,
                            }}
                          >
                            <Entypo
                              name={'dots-three-horizontal'}
                              size={15}
                              color={Colors.borderColor}
                            />
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleDocuments()}
                          style={{ flexDirection: 'row', marginLeft: 'auto' }}
                        >
                          <Text>{value.status}</Text>
                          <View style={styles.dotsView} />
                          <View style={styles.dotsView} />
                          <View style={styles.dotsView} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                } else {
                  null;
                }
              })}
            </View>
          )}
        </TouchableOpacity>
        {metaShares.length >= 3 ? (
          <View>
            <TouchableOpacity
              style={{
                ...styles.questionConfirmButton,
                margin: 20,
                elevation: Elevation,
              }}
              onPress={() => {
                (loaderBottomSheet as any).current.snapTo(1);
                setTimeout(() => {
                  setElevation(0);
                }, 2);
                dispatch(recoverWallet());
              }}
            >
              <Text style={styles.proceedButtonText}>Restore</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={walletNameBottomSheet}
        snapPoints={[
          0,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("50%") : hp("60%"),
          Platform.OS == "ios" ? hp("90%") : hp("55%")
        ]}
        renderContent={renderContent}
        renderHeader={renderHeader}
      /> */}
      <BottomSheet
        enabledInnerScrolling={true}
        ref={successMessageBottomSheet as any}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          hp('60%'),
        ]}
        renderContent={renderSuccessContent}
        renderHeader={renderHeader}
      />
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={recoveryQuestionBottomSheet}
        snapPoints={[
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("67%") : hp("75%"),
          Platform.OS == "ios" ? hp("90%") : hp("72%")
        ]}
        renderContent={renderRecoveryQuestionContent}
        renderHeader={renderHeader}
      /> */}
      <BottomSheet
        enabledInnerScrolling={true}
        ref={requestBottomSheet as any}
        snapPoints={[
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 0 : 0,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('60%') : hp('75%'),
        ]}
        renderContent={RequestModalContentFunction}
        renderHeader={RequestHeaderFunction}
      />
      <BottomSheet
        onOpenEnd={() => {}}
        onCloseEnd={() => {}}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('45%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />

      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag(true);
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          (RestoreByCloudQrCode as any).current.snapTo(0);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={RestoreByCloudQrCode as any}
        snapPoints={[-30, hp('90%')]}
        renderContent={renderRestoreByCloudQrCodeContent}
        renderHeader={renderRestoreByCloudQrCodeHeader}
      />
      <BottomSheet
        onCloseEnd={() => {}}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={loaderBottomSheet as any}
        snapPoints={[-50, hp('100%')]}
        renderContent={renderLoaderModalContent}
        renderHeader={renderLoaderModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet1}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent1}
        renderHeader={renderErrorModalHeader1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listElements: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    marginLeft: 13,
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsView: {
    backgroundColor: Colors.borderColor,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  separator: {
    borderBottomColor: Colors.backgroundColor,
    borderBottomWidth: 5,
  },
  iconImage: {
    resizeMode: 'contain',
    width: 25,
    height: 30,
    alignSelf: 'center',
  },
  textInfoView: {
    justifyContent: 'space-between',
    flex: 1,
  },

  selectedContactView: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  selectedContactName: {
    marginLeft: 10,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  secretReceivedView: {
    borderRadius: 5,
    height: 25,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secretReceivedText: {
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansMedium,
  },
  secretReceivedCheckSignView: {
    backgroundColor: Colors.green,
    borderRadius: 25 / 2,
    height: 25,
    width: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  questionConfirmButton: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    marginTop: hp('6%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
