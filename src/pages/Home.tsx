import React, { useState, useEffect } from 'react';
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
import { checkMSharesHealth, updateMSharesHealth } from '../store/actions/sss';
import RecoverySecretRequestModalContents from '../components/RecoverySecretRequestModalContesnts';
import ShareRecoverySecretModalContents from '../components/ShareRecoverySecretModalContents';
import AsyncStorage from '@react-native-community/async-storage';

export default function Home( props ) {
  const database = useSelector( state => state.storage.database );
  const walletName = database ? database.WALLET_SETUP.walletName : '';
  const accounts = useSelector( state => state.accounts );

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

  const testTransactions = accounts[ TEST_ACCOUNT ].service
    ? accounts[ TEST_ACCOUNT ].service.hdWallet.transactions.transactionDetails
    : [];
  const regularTransactions = accounts[ REGULAR_ACCOUNT ].service
    ? accounts[ REGULAR_ACCOUNT ].service.hdWallet.transactions.transactionDetails
    : [];

  const secureTransactions = accounts[SECURE_ACCOUNT].service
    ? accounts[SECURE_ACCOUNT].service.secureHDWallet.transactions
        .transactionDetails: [];
  const accumulativeTransactions = [
    ...testTransactions,
    ...regularTransactions,
    ...secureTransactions,
  ];

  const [ dropdownBoxValue, setDropdownBoxValue ] = useState( {
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
  const [ReshareBottomSheet, setReshareBottomSheet] = useState(
    React.createRef(),
  );
  const [ConfirmBottomSheet, setConfirmBottomSheet] = useState(
    React.createRef(),
  );
  const [ChangeBottomSheet, setChangeBottomSheet] = useState(React.createRef());
  const [RegenerateBottomSheet, setRegenerateBottomSheet] = useState(
    React.createRef(),
  );

  const [
    ShareRecoverySecretBottomSheet,
    setShareRecoverySecretBottomSheet,
  ] = useState(React.createRef());
  const [
    ShareRecoverySecretOtpBottomSheet,
    setShareRecoverySecretOtpBottomSheet,
  ] = useState(React.createRef());
  const [
    HealthCheckSuccessBottomSheet,
    setHealthCheckSuccessBottomSheet,
  ] = useState( React.createRef() );
  const [
    HealthCheckGoogleAuthBottomSheet,
    setHealthCheckGoogleAuthBottomSheet,
  ] = useState( React.createRef() );
  const [
    HealthCheckSecurityQuestionBottomSheet,
    setHealthCheckSecurityQuestionBottomSheet,
  ] = useState( React.createRef() );
  const [
    ContactSelectedFromAddressBookQrCodeBottomSheet,
    setContactSelectedFromAddressBookQrCodeBottomSheet,
  ] = useState( React.createRef() );
  const [
    ContactSelectedFromAddressBookBottomSheet,
    setContactSelectedFromAddressBookBottomSheet,
  ] = useState( React.createRef() );
  const [
    FamilyAndFriendAddressBookBottomSheet,
    setFamilyAndFriendAddressBookBottomSheet,
  ] = useState( React.createRef() );
  const [ AddBottomSheet, setAddBottomSheet ] = useState( React.createRef() );
  const [
    fastBitcoinSellCalculationBottomSheet,
    setFastBitcoinSellCalculationBottomSheet,
  ] = useState( React.createRef() );
  const [
    fastBitcoinRedeemCalculationBottomSheet,
    setFastBitcoinRedeemCalculationBottomSheet,
  ] = useState( React.createRef() );
  const [ AllAccountsBottomSheet, setAllAccountsBottomSheet ] = useState(
    React.createRef(),
  );
  const [ addressBookBottomSheet, setAddressBookBottomSheet ] = useState(
    React.createRef(),
  );
  const [ MoreTabBottomSheet, setMoreTabBottomSheet ] = useState(
    React.createRef(),
  );
  const [ NoInternetBottomSheet, setNoInternetBottomSheet ] = useState(
    React.createRef(),
  );
  const [ ErrorBottomSheet, setErrorBottomSheet ] = useState( React.createRef() );
  const [
    PinChangeSuccessBottomSheet,
    setPinChangeSuccessBottomSheet,
  ] = useState( React.createRef() );
  const [ RecoveryRequestBottomSheet, setRecoveryRequestBottomSheet ] = useState(
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
  ] = useState( React.createRef() );
  const [
    CustodianRequestRejectedBottomSheet,
    setCustodianRequestRejectedBottomSheet,
  ] = useState( React.createRef() );
  const [
    CustodianRequestAcceptBottomSheet,
    setCustodianRequestAcceptBottomSheet,
  ] = useState( React.createRef() );
  const [
    transactionDetailsBottomSheet,
    setTransactionDetailsBottomSheet,
  ] = useState( React.createRef() );
  const [ settingsBottomSheet, setSettingsBottomSheet ] = useState(
    React.createRef(),
  );
  const [ bottomSheet, setBottomSheet ] = useState( React.createRef() );
  const [ data, setData ] = useState( [
    {
      title: 'Test Account',
      unit: 'tsats',
      amount: '400,000',
      account: 'Test it out!',
      accountType: 'test',
      bitcoinicon: require( '../assets/images/icons/icon_bitcoin_test.png' ),
    },
    {
      title: 'Regular Account',
      unit: 'sats',
      amount: '5,000',
      account: 'Fast and easy',
      accountType: 'regular',
      bitcoinicon: require( '../assets/images/icons/icon_bitcoin_gray.png' ),
    },
    {
      title: 'Secure Account',
      unit: 'sats',
      amount: '60,000',
      account: 'Resilient and Secure',
      accountType: 'secure',
      bitcoinicon: require( '../assets/images/icons/icon_bitcoin_gray.png' ),
    },
  ] );
  const [ transactionData, setTransactionData ] = useState( [
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
  ] );
  const [ modaldata, setModaldata ] = useState( transactionData );

  function getIconByAccountType( type ) {
    if ( type == 'saving' ) {
      return require( '../assets/images/icons/icon_regular.png' );
    } else if ( type == 'regular' ) {
      return require( '../assets/images/icons/icon_regular.png' );
    } else if ( type == 'secure' ) {
      return require( '../assets/images/icons/icon_secureaccount.png' );
    } else if ( type == 'test' ) {
      return require( '../assets/images/icons/icon_test.png' );
    } else {
      return require( '../assets/images/icons/icon_test.png' );
    }
  }


  useEffect(function() {
    // (PinChangeSuccessBottomSheet as any).current.snapTo(1);
    // (ErrorBottomSheet as any).current.snapTo(1);
    // (NoInternetBottomSheet as any).current.snapTo(0);
    // setTimeout(() => {
    //   setTabBarZIndex(0);
    //  }, 2);
    // (CustodianRequestBottomSheet as any).current.snapTo(1);
    ( bottomSheet as any ).current.snapTo( 1 );
  }, [] );

  const renderTransactionsContent = () => {
    return (
      <View style={ styles.modalContentContainer }>
        <FlatList
          data={ accumulativeTransactions }
          ItemSeparatorComponent={ () => (
            <View style={ { backgroundColor: Colors.white } }>
              <View style={ styles.separatorView } />
            </View>
          ) }
          renderItem={ ( { item } ) => (
            <TouchableOpacity
              onPress={ () =>
                props.navigation.navigate( 'TransactionDetails', { item } )
              }
              style={ {
                ...styles.transactionModalElementView,
                backgroundColor: Colors.white,
              } }
            >
              <View style={ styles.modalElementInfoView }>
                <View style={ { justifyContent: 'center' } }>
                  <FontAwesome
                    name={
                      item.transactionType == 'Received'
                        ? 'long-arrow-down'
                        : 'long-arrow-up'
                    }
                    size={ 15 }
                    color={
                      item.transactionType == 'Received'
                        ? Colors.green
                        : Colors.red
                    }
                  />
                </View>
                <View style={ { justifyContent: 'center', marginLeft: 10 } }>
                  <Text style={ styles.transactionModalTitleText }>
                    { item.accountType }{ ' ' }
                  </Text>
                  <Text style={ styles.transactionModalDateText }>
                    { item.date }{ ' ' }
                    {/* <Entypo
                      size={10}
                      name={"dot-single"}
                      color={Colors.textColorGrey}
                    />
                    {item.time} */}
                  </Text>
                </View>
              </View>
              <View style={ styles.transactionModalAmountView }>
                <Image
                  source={ require( '../assets/images/icons/icon_bitcoin_gray.png' ) }
                  style={ { width: 12, height: 12, resizeMode: 'contain' } }
                />
                <Text
                  style={ {
                    ...styles.transactionModalAmountText,
                    color:
                      item.transactionType == 'Received'
                        ? Colors.green
                        : Colors.red,
                  } }
                >
                  { item.amount }
                </Text>
                <Text style={ styles.transactionModalAmountUnitText }>
                  { item.confirmations < 6 ? item.confirmations : '6+' }
                </Text>
                <Ionicons
                  name="ios-arrow-forward"
                  color={ Colors.textColorGrey }
                  size={ 12 }
                  style={ { marginLeft: 20, alignSelf: 'center' } }
                />
              </View>
            </TouchableOpacity>
          ) }
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
        onPressElements={ type => {
          if (
            type == 'Fastbitcoins' ||
            type == 'Getbittr' ||
            type == 'Add Contact'
          ) {
            setTimeout( () => {
              setTabBarZIndex( 0 );
              setSelectToAdd( type );
            }, 2 );
            ( AddBottomSheet as any ).current.snapTo( 1 );
          }
        } }
        addData={ modaldata }
      />
    );
  };

  const getQrCodeData = (data) =>{
    console.log("Qrcodedata", data);
  }

  function renderContent1() {
    if ( selected == 'Transactions' ) {
      return renderTransactionsContent();
    } else if ( selected == 'Add' ) {
      return renderAdd();
      //return
    } else if (selected == 'QR') {
      return <QrCodeModalContents onPressQrScanner={()=>{ props.navigation.navigate("QrScanner", {scanedCode: getQrCodeData})}} />;
    }
  }

  function renderHeader() {
    return (
      <TouchableOpacity
        disabled={ selected == 'More' ? true : false }
        activeOpacity={ 10 }
        onPress={ () => openCloseModal() }
        style={ styles.modalHeaderContainer }
      >
        <View style={ styles.modalHeaderHandle } />
        <Text style={ styles.modalHeaderTitleText }>{ selected }</Text>
      </TouchableOpacity>
    );
  }

  function openCloseModal() {
    if ( openmodal == 'closed' ) {
      setOpenmodal( 'half' );
    }
    if ( openmodal == 'half' ) {
      setOpenmodal( 'full' );
    }
    if ( openmodal == 'full' ) {
      setOpenmodal( 'closed' );
    }
  }

  useEffect( () => {
    if ( openmodal == 'closed' ) {
      ( bottomSheet as any ).current.snapTo( 1 );
    }
    if ( openmodal == 'half' ) {
      ( bottomSheet as any ).current.snapTo( 2 );
    }
    if ( openmodal == 'full' ) {
      ( bottomSheet as any ).current.snapTo( 3 );
    }
  }, [ openmodal ] );

  async function selectTab( tabTitle ) {
    if ( tabTitle == 'More' ) {
      setTimeout( () => {
        setSelected( tabTitle );
        setSelected( tabTitle );
      }, 2 );
      ( bottomSheet as any ).current.snapTo( 0 );
      ( MoreTabBottomSheet as any ).current.snapTo( 1 );
    } else if ( tabTitle == 'Transactions' ) {
      setTimeout( () => {
        setModaldata( transactionData );
        setSelected( tabTitle );
      }, 2 );
      ( bottomSheet as any ).current.snapTo( 1 );
      ( MoreTabBottomSheet as any ).current.snapTo( 0 );
    } else if ( tabTitle == 'Add' ) {
      setTimeout( () => {
        setModaldata( [] );
        setSelected( tabTitle );
      }, 2 );
      ( bottomSheet as any ).current.snapTo( 1 );
      ( MoreTabBottomSheet as any ).current.snapTo( 0 );
    } else if ( tabTitle == 'QR' ) {
      setTimeout( () => {
        setModaldata( transactionData );
        setSelected( tabTitle );
      }, 2 );
      ( bottomSheet as any ).current.snapTo( 1 );
      ( MoreTabBottomSheet as any ).current.snapTo( 0 );
    }
  }

  const renderNoInternetModalContent = () => {
    return (
      <NoInternetModalContents
        onPressTryAgain={() => {}}
        onPressIgnore={() => {}}
      />
    );
  };

  const renderErrorModalContent = () => {
    return (
      <ErrorModalContents
        modalRef={ ErrorBottomSheet }
        title={ 'Something went wrong' }
        info={ 'There seems to a problem' }
        note={ 'Please try again' }
        proceedButtonText={ 'Try Again' }
        isIgnoreButton={ true }
        onPressProceed={ () => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 );
        } }
        onPressIgnore={ () => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 );
        } }
        isBottomImage={ true }
        bottomImage={ require( '../assets/images/icons/errorImage.png' ) }
      />
    );
  };

  const renderErrorModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 );
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
        } }
      />
    );
  };

  const renderPinChangeSuccessModalContent = () => {
    return (
      <ErrorModalContents
        modalRef={ PinChangeSuccessBottomSheet }
        title={ 'Pin Changed Successfully' }
        info={ 'Lorem ipsum dolor sit amet, consectetur' }
        note={ 'sed do eiusmod tempor incididunt ut labore et' }
        proceedButtonText={ 'View Settings' }
        isIgnoreButton={ false }
        onPressProceed={ () => {
          ( PinChangeSuccessBottomSheet as any ).current.snapTo( 0 );
        } }
        isBottomImage={ true }
      />
    );
  };

  const renderPinChangeSuccessModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( PinChangeSuccessBottomSheet as any ).current.snapTo( 0 );
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
        } }
      />
    );
  };

  const renderCustodianRequestModalContent = () => {
    if ( !custodyRequest ) return <View></View>;
    return (
      <CustodianRequestModalContents
        userName={ custodyRequest.requester }
        onPressAcceptSecret={ () => {
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
          ( CustodianRequestBottomSheet as any ).current.snapTo( 0 );
          props.navigation.navigate( 'CustodianRequestOTP', { custodyRequest } );
        } }
        onPressRejectSecret={ () => {
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
          ( CustodianRequestBottomSheet as any ).current.snapTo( 0 );
          ( CustodianRequestRejectedBottomSheet as any ).current.snapTo( 1 );
        } }
      />
    );
  };

  const renderRecoveryRequestModalContent = () => {
    if ( !recoveryRequest ) return <View></View>;

    return (
      <CustodianRequestModalContents
        userName={ recoveryRequest.requester }
        onPressAcceptSecret={ () => {
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
          ( RecoveryRequestBottomSheet as any ).current.snapTo( 0 );
          props.navigation.navigate( 'RecoveryRequestOTP', { recoveryRequest } );
        } }
        onPressRejectSecret={ () => {
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
          ( RecoveryRequestBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderCustodianRequestOtpModalContent = () => {
    return (
      <CustodianRequestOtpModalContents
        title1stLine={ 'Enter OTP to' }
        title2ndLine={ 'accept request' }
        info1stLine={ 'Please enter the 6 digit OTP the owner' }
        info2ndLine={ 'of secret shared with you' }
        subInfo1stLine={
          'The OTP is time sensitive, please be sure to enter the OTP '
        }
        subInfo2ndLine={ 'shared within 15minutes' }
        modalRef={ CustodianRequestOtpBottomSheet }
        onPressConfirm={ () => {
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
          ( CustodianRequestOtpBottomSheet as any ).current.snapTo( 0 );
          ( CustodianRequestAcceptBottomSheet as any ).current.snapTo( 1 );
        } }
      />
    );
  };

  const renderCustodianRequestRejectedModalContent = () => {
    if ( !custodyRequest ) return <View></View>;
    return (
      <CustodianRequestRejectedModalContents
        onPressViewThrustedContacts={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( CustodianRequestRejectedBottomSheet as any ).current.snapTo( 0 );
        } }
        userName={ custodyRequest.requester }
      />
    );
  };

  const renderCustodianRequestAcceptModalContent = () => {
    if ( !custodyRequest ) return <View></View>;
    return (
      <CustodianRequestAcceptModalContents
        userName={custodyRequest.requester}
        onPressAssociateContacts={() => {}}
        onPressSkip={() => {
          setTimeout(() => {
            setTabBarZIndex(999);
          }, 2);
          (CustodianRequestAcceptBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderNoInternetModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( NoInternetBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderCustodianRequestModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( CustodianRequestBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderRecoveryRequestModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( RecoveryRequestBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const onPressElement = item => {
    if ( item.title == 'Address Book' ) {
      setTimeout( () => {
        setTabBarZIndex( 0 );
      }, 2 );
      ( addressBookBottomSheet as any ).current.snapTo( 1 );
    } else if ( item.title == 'Settings' ) {
      setTimeout( () => {
        setTabBarZIndex( 0 );
      }, 10 );
      ( settingsBottomSheet as any ).current.snapTo( 1 );
    } else if ( item.title == 'All Accounts' ) {
      setTimeout( () => {
        setTabBarZIndex( 0 );
      }, 10 );
      ( AllAccountsBottomSheet as any ).current.snapTo( 1 );
    }
  };

  const managePinProceed = pin => {
    ( settingsBottomSheet as any ).current.snapTo( 0 );
    ( PinChangeSuccessBottomSheet as any ).current.snapTo( 1 );
  };

  const renderSettingsContents = () => {
    return (
      <SettingsContents
        onPressManagePIn={ () => {
          return props.navigation.navigate( 'SettingManagePin', {
            _managePinProceed: pin => managePinProceed( pin ),
          } );
        } }
        onPressBack={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 10 );
          ( settingsBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderSettingsHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 10 );
          ( settingsBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderAllAccountsContents = () => {
    return (
      <AllAccountsContents
        onPressBack={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 10 );
          ( AllAccountsBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderAllAccountsHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 10 );
          ( AllAccountsBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderMoreTabContents = () => {
    return (
      <MoreHomePageTabContents onPressElements={ item => onPressElement( item ) } />
    );
  };

  const renderMoreTabHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( MoreTabBottomSheet as any ).current.snapTo( 0 );
          ( bottomSheet as any ).current.snapTo( 1 );
          setTimeout( () => {
            setSelected( 'Transactions' );
          }, 2 );
        } }
      />
    );
  };

  const renderAddressBookContents = () => {
    return (
      <AddressBookContents
        onPressBack={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( addressBookBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderAddressBookHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( addressBookBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderTransactionDetailsContents = () => {
    return (
      <TransactionDetailsContents
        onPressBack={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( transactionDetailsBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderTransactionDetailsHeader = () => {
    return (
      <SmallHeaderModal
        headerColor={ Colors.backgroundColor }
        onPressHandle={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( transactionDetailsBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderCustodianRequestOtpModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( CustodianRequestOtpBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderCustodianRequestRejectedModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( CustodianRequestRejectedBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderCustodianRequestAcceptModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( CustodianRequestAcceptBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderAddModalContents = () => {
    if ( selectToAdd == 'Getbittr' ) {
      return (
        <GetBittrModalContents
          onPressBack={ () => {
            setTimeout( () => {
              setTabBarZIndex( 999 );
            }, 2 );
            ( AddBottomSheet as any ).current.snapTo( 0 );
          } }
        />
      );
    } else if ( selectToAdd == 'Fastbitcoins' ) {
      return (
        <FastBitcoinModalContents
          onPressSellTab={ () => {
            setTimeout( () => {
              setTabSelected( 'sell' );
            }, 2 );
            ( fastBitcoinSellCalculationBottomSheet as any ).current.snapTo( 1 );
          } }
          onPressRedeemTab={ () => {
            setTimeout( () => {
              setTabSelected( 'redeem' );
            }, 2 );
            ( fastBitcoinRedeemCalculationBottomSheet as any ).current.snapTo( 1 );
          } }
          onPressBack={ () => {
            setTimeout( () => {
              setTabBarZIndex( 999 );
            }, 2 );
            ( AddBottomSheet as any ).current.snapTo( 0 );
          } }
        />
      );
    } else if ( selectToAdd == 'Add Contact' ) {
      return (
        <AddContactsModalContents
          onPressFriendAndFamily={ () => {
            setTimeout( () => {
              setTabSelected( 'sell' );
            }, 2 );
            ( FamilyAndFriendAddressBookBottomSheet as any ).current.snapTo( 1 );
          } }
          onPressBiller={ () => {
            setTimeout( () => {
              setTabSelected( 'redeem' );
            }, 2 );
            ( FamilyAndFriendAddressBookBottomSheet as any ).current.snapTo( 1 );
          } }
          onPressBack={ () => {
            setTimeout( () => {
              setTabBarZIndex( 999 );
            }, 2 );
            ( AddBottomSheet as any ).current.snapTo( 0 );
          } }
        />
      );
    } else {
      return null;
    }
  };

  const renderAddModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
          ( AddBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderFastBitcoinRedeemCalculationContents = () => {
    return (
      <FastBitcoinCalculationModalContents
        navigation={ props.navigation }
        modalRef={ fastBitcoinRedeemCalculationBottomSheet }
        pageInfo={
          'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
        }
        pageTitle={ 'Redeem Voucher' }
        noteTitle={ 'Lorem ipsum' }
        noteInfo={ 'Lorem ipsum dolor sit amet, consectetur' }
        proceedButtonText="Calculate"
        onPressBack={ () => {
          ( fastBitcoinRedeemCalculationBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderFastBitcoinSellCalculationContents = () => {
    return (
      <FastBitcoinCalculationModalContents
        navigation={ props.navigation }
        modalRef={ fastBitcoinSellCalculationBottomSheet }
        pageInfo={
          'Lorem ipsum dolor sit amet, consectetur\nadipiscing elit, sed do eiusmod tempor'
        }
        pageTitle={ 'Sell Bitcoins' }
        noteTitle={ 'Lorem ipsum' }
        noteInfo={ 'Lorem ipsum dolor sit amet, consectetur' }
        proceedButtonText={ 'Calculate' }
        onPressBack={ () => {
          ( fastBitcoinSellCalculationBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderFastBitcoinSellCalculationHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          ( fastBitcoinSellCalculationBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderFastBitcoinRedeemCalculationHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          ( fastBitcoinRedeemCalculationBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderContactSelectedFromAddressBookContents = () => {
    return (
      <SelectedContactFromAddressBook
        onPressQrScanner={()=>{ props.navigation.navigate("QrScanner", {scanedCode: getQrCodeData})}}
        onPressProceed={() => {
          (ContactSelectedFromAddressBookQrCodeBottomSheet as any).current.snapTo(
            1,
          );
        } }
        onPressBack={ () => {
          ( ContactSelectedFromAddressBookBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderContactSelectedFromAddressBookHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          ( ContactSelectedFromAddressBookBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderContactSelectedFromAddressBookQrCodeContents = () => {
    return (
      <SelectedContactFromAddressBookQrCode
        onPressProceed={ () => {
          ( ContactSelectedFromAddressBookQrCodeBottomSheet as any ).current.snapTo(
            0,
          );
        } }
        onPressBack={ () => {
          ( ContactSelectedFromAddressBookQrCodeBottomSheet as any ).current.snapTo(
            0,
          );
        } }
      />
    );
  };

  const renderContactSelectedFromAddressBookQrCodeHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          ( ContactSelectedFromAddressBookQrCodeBottomSheet as any ).current.snapTo(
            0,
          );
        } }
      />
    );
  };

  const renderFamilyAndFriendAddressBookContents = () => {
    return (
      <FamilyandFriendsAddressBookModalContents
        modalRef={ FamilyAndFriendAddressBookBottomSheet }
        proceedButtonText={ 'Confirm & Proceed' }
        onPressProceed={ () => {
          ( ContactSelectedFromAddressBookBottomSheet as any ).current.snapTo( 1 );
        } }
        onPressBack={ () => {
          ( FamilyAndFriendAddressBookBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderFamilyAndFriendAddressBookHeader = () => {
    return (
      <SmallHeaderModal
        onPressHandle={ () => {
          ( FamilyAndFriendAddressBookBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const submitRecoveryQuestion = () => {
    ( HealthCheckSecurityQuestionBottomSheet as any ).current.snapTo( 0 );
    ( HealthCheckGoogleAuthBottomSheet as any ).current.snapTo( 1 );
    Keyboard.dismiss();
  };

  const renderHealthCheckSecurityQuestionContents = () => {
    return (
      <HealthCheckSecurityQuestionModalContents
        onQuestionSelect={value => {
          setDropdownBoxValue(value);
        }}
        onTextChange={text => {
          setAnswer(text);
        }}
        onPressConfirm={() => submitRecoveryQuestion()}
        onPressKnowMore={() => {}}
        bottomSheetRef={HealthCheckSecurityQuestionBottomSheet}
      />
    );
  };

  const renderHealthCheckSecurityQuestionHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( HealthCheckSecurityQuestionBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderHealthCheckGoogleAuthContents = () => {
    return (
      <HealthCheckGoogleAuthModalContents
        modalRef={ HealthCheckGoogleAuthBottomSheet }
        onPressConfirm={ () => {
          Keyboard.dismiss();
          ( HealthCheckGoogleAuthBottomSheet as any ).current.snapTo( 0 );
          //  (HealthCheckSuccessBottomSheet as any).current.snapTo(1);
        } }
      />
    );
  };

  const renderHealthCheckGoogleAuthHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( HealthCheckGoogleAuthBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const handleAppStateChange = nextAppState => {
    setTimeout(
      () =>
        nextAppState === 'active' ? props.navigation.navigate( 'ReLogin' ) : null,
      50,
    ); // producing a subtle delay to let deep link event listener make the first move
  };

  const handleDeepLink = event => {
    const splits = event.url.split( '/' );
    const requester = splits[ 3 ];

    if ( splits[ 4 ] === 'sss' ) {
      if ( splits[ 5 ] === 'ek' ) {
        const custodyRequest = { requester, ek: splits[ 6 ] };
        props.navigation.navigate( 'Home', { custodyRequest } );
      } else if ( splits[ 5 ] === 'rk' ) {
        const recoveryRequest = { requester, rk: splits[ 6 ] };
        props.navigation.replace( 'Home', { recoveryRequest } );
      }
    }
  };

  useEffect( () => {
    //AppState.addEventListener('change', handleAppStateChange);
    NetInfo.addEventListener( state => {
      if ( !state.isConnected ) ( NoInternetBottomSheet as any ).current.snapTo( 1 );
      else if ( state.isConnected )
        ( NoInternetBottomSheet as any ).current.snapTo( 0 );
    } );

    Linking.addEventListener( 'url', handleDeepLink );

    // return () => Linking.removeEventListener("url", handleDeepLink);
  }, [] );

  const custodyRequest = props.navigation.getParam( 'custodyRequest' );
  const recoveryRequest = props.navigation.getParam( 'recoveryRequest' );

  useEffect( () => {
    if ( custodyRequest ) {
      setTimeout( () => {
        setTabBarZIndex( 0 );
      }, 2 );
      ( CustodianRequestBottomSheet as any ).current.snapTo( 1 );
      ( bottomSheet as any ).current.snapTo( 1 );
    }

    if ( recoveryRequest ) {
      setTimeout( () => {
        setTabBarZIndex( 0 );
      }, 2 );
      ( RecoveryRequestBottomSheet as any ).current.snapTo( 1 );
      ( bottomSheet as any ).current.snapTo( 1 );
    } //TODO: connect the recovery guardian modal
  }, [ custodyRequest, recoveryRequest ] );

  const dispatch = useDispatch();

  const s3Service = useSelector(state => state.sss.service);
  const [overallHealth, setOverallHealth] = useState();

  const health = useSelector(state => state.sss.overallHealth);
  useEffect(() => {
    if (health) setOverallHealth(health);
  }, [health]);

  useEffect( () => {
    // HC up-streaming
    if ( database ) {
      if ( Object.keys( database.DECENTRALIZED_BACKUP.UNDER_CUSTODY ).length ) {
        dispatch( updateMSharesHealth() );
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

  const renderRecoverySecretRequestModalContent = () => {
    return (
      <RecoverySecretRequestModalContents
        name={'Pamela Aalto'}
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
        }}
        onPressReject={() => {
          setTimeout(() => {
            setTabBarZIndex(0);
          }, 2);
          (RecoverySecretRequestBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderRecoverySecretRequestModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( RecoverySecretRequestBottomSheet as any ).current.snapTo( 0 );
          setTimeout( () => {
            setTabBarZIndex( 999 );
          }, 2 );
        } }
      />
    );
  };

  const renderShareRecoverySecretQrCodeModalContent = () => {
    return (
      <ShareRecoverySecretModalContents
        title={'Share Recovery Secret\nto trusted contact'}
        infoText={
          'Share Recovery Secret to Trusted Contact, this will enable\nthem to restore their Hexa Wallet'
        }
        sunInfoText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt'
        }
        shareVia={'qr'}
        name={'Pamela Aalto'}
        contactInfo={'+44 0000 000000'}
        buttonText={'Share via QR'}
        onPressRequest={() => {
          ShareRecoverySecretBottomSheet.current.snapTo(1);
        }}
        onPressViaQr={() => {}}
        modalRef={ShareRecoverySecretBottomSheet}
      />
    );
  };

  const renderShareRecoverySecretQrCodeModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( ShareRecoverySecretBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderShareRecoverySecretOtpModalContent = () => {
    return (
      <ShareRecoverySecretModalContents
        title={'Share Recovery Secret\nto trusted contact'}
        infoText={
          'Share Recovery Secret to Trusted Contact, this will enable\nthem to restore their Hexa Wallet'
        }
        sunInfoText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt'
        }
        shareVia={'otp'}
        name={'Pamela Aalto'}
        contactInfo={'+44 0000 000000'}
        buttonText={'Share via QR'}
        onPressRequest={() => {
          ShareRecoverySecretOtpBottomSheet.current.snapTo(1);
        }}
        onPressViaQr={() => {}}
        modalRef={ShareRecoverySecretOtpBottomSheet}
      />
    );
  };

  const renderShareRecoverySecretOtpModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( ShareRecoverySecretBottomSheet as any ).current.snapTo( 0 );
        } }
      />
    );
  };

  const renderReshareContent = () => {
    return (
      <ErrorModalContents
        modalRef={ReshareBottomSheet}
        title={'Reshare Recovery Secret\nwith Trusted Contact'}
        info={'Did your contact not receive the Recovery Secret?'}
        note={
          'You can reshare the Recovery Secret with your Trusted\nContact via Email or Sms'
        }
        proceedButtonText={'Reshare'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ReshareBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderReshareHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( ReshareBottomSheet as any ).current.snapTo( 0 );
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
        } }
      />
    );
  };

  const renderConfirmContent = () => {
    return (
      <ErrorModalContents
        modalRef={ConfirmBottomSheet}
        title={'Confirm Recovery Secret\nwith Trusted Contact'}
        info={'Your Trusted Contact seems away from their Hexa App'}
        note={
          'You can send them a reminder to open their app to\nensure they have your Recovery Secret'
        }
        proceedButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ConfirmBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderConfirmHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( ConfirmBottomSheet as any ).current.snapTo( 0 );
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
        } }
      />
    );
  };

  const renderChangeContent = () => {
    return (
      <ErrorModalContents
        modalRef={ChangeBottomSheet}
        title={'Change your\nTrusted Contact'}
        info={'Having problems with your Trusted Contact'}
        note={
          'You can change the Trusted Contact you selected to share\nyour Recovery Secret'
        }
        proceedButtonText={'Change'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ChangeBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderChangeHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( ChangeBottomSheet as any ).current.snapTo( 0 );
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
        } }
      />
    );
  };

  const renderRegenerateContent = () => {
    return (
      <ErrorModalContents
        modalRef={RegenerateBottomSheet}
        title={'Regenerate\nRecovery Secrets'}
        info={'Did you make too many errors?'}
        note={'You can regenerate your Recovery Secrets\nand start over'}
        proceedButtonText={'Regenerate'}
        cancelButtonText={'Back'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (RegenerateBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (RegenerateBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={false}
      />
    );
  };

  const renderRegenerateHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={ () => {
          ( RegenerateBottomSheet as any ).current.snapTo( 0 );
          setTimeout( () => {
            setTabBarZIndex( 0 );
          }, 2 );
        } }
      />
    );
  };

  return (
    <ImageBackground
      source={ require( '../assets/images/home-bg.png' ) }
      style={ { width: '100%', height: '100%', flex: 1 } }
      imageStyle={ { resizeMode: 'stretch' } }
    >
      <StatusBar backgroundColor={ Colors.blue } barStyle="light-content" />

      <View
        style={ {
          flex: 3.8,
          paddingTop:
            Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp( '5%' ) : 0,
        } }
      >
        <View style={ styles.headerViewContainer }>
          <View style={ { flexDirection: 'row' } }>
            <View style={ styles.headerTitleViewContainer }>
              <Text
                style={ styles.headerTitleText }
              >{ `${ walletName }’s Wallet` }</Text>
              <View style={ { flexDirection: 'row', alignItems: 'flex-end' } }>
                <Image
                  style={ CommonStyles.homepageAmountImage }
                  source={ require( '../assets/images/icons/icon_bitcoin_light.png' ) }
                />
                <Text
                  style={ {
                    ...CommonStyles.homepageAmountText,
                    color: Colors.white,
                  } }
                >
                  { accumulativeBalance }
                </Text>
                <Text
                  style={ {
                    ...CommonStyles.homepageAmountUnitText,
                    color: Colors.white,
                  } }
                >
                  sats
                </Text>
              </View>
            </View>
            <View style={ styles.headerToggleSwitchContainer }>
              <ToggleSwitch
                onpress={ () => {
                  setSwitchOn( !switchOn );
                } }
                toggle={ switchOn }
              />
            </View>
          </View>
          <View style={ { flexDirection: 'row' } }>
            <View style={ { flex: 7 } }>
              <Text style={ styles.headerInfoText }>
                <Text style={ { fontStyle: 'italic' } }>Great!! </Text>
                The wallet backup is secure. Keep an eye on the health of the
                backup here
              </Text>
              <TouchableOpacity
                onPress={ () => {
                  props.navigation.navigate( 'ManageBackup' );
                } }
                style={ styles.headerButton }
              >
                <Text style={ styles.headerButtonText }>Manage Backup</Text>
              </TouchableOpacity>
            </View>
            <View style={ { flex: 4, alignItems: 'flex-end' } }>
              <TouchableOpacity
                activeOpacity={ 10 }
                onPress={ () => {
                  props.navigation.navigate( 'ManageBackup' );
                } }
              >
                <HomePageShield
                  shieldStatus={overallHealth ? overallHealth.overallStatus : 0}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={ { flex: 7 } }>
        <View style={ styles.cardViewContainer }>
          <FlatList
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
          />
        </View>
      </View>
      <BottomSheet
        onCloseEnd={ () => {
          ( bottomSheet as any ).current.snapTo( 1 );
        } }
        enabledInnerScrolling={ true }
        ref={ bottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp( '17%' )
            : Platform.OS == 'android'
            ? hp('20%')
            : hp('18%'),
          hp('50%'),
          hp('90%'),
        ]}
        renderContent={renderContent1}
        renderHeader={renderHeader}
      />
      <BottomSheet
        onCloseEnd={ () => {
          setTabBarZIndex( 999 );
        } }
        enabledInnerScrolling={ true }
        ref={ NoInternetBottomSheet }
        snapPoints={ [ -50, hp( '60%' ) ] }
        renderContent={ renderNoInternetModalContent }
        renderHeader={ renderNoInternetModalHeader }
      />
      <BottomSheet
        onCloseEnd={ () => {
          setTabBarZIndex( 999 );
        } }
        enabledInnerScrolling={ true }
        ref={ CustodianRequestBottomSheet }
        snapPoints={ [ -50, hp( '60%' ) ] }
        renderContent={ renderCustodianRequestModalContent }
        renderHeader={ renderCustodianRequestModalHeader }
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
      <BottomSheet
        onCloseEnd={ () => {
          setTabBarZIndex( 999 );
        } }
        onOpenStart={ () => {
          setTabBarZIndex( 0 );
        } }
        enabledInnerScrolling={ true }
        ref={ RecoveryRequestBottomSheet }
        snapPoints={ [ -50, hp( '60%' ) ] }
        renderContent={ renderRecoveryRequestModalContent }
        renderHeader={ renderRecoveryRequestModalHeader }
      />
      {/* <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={CustodianRequestOtpBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == "ios" && DeviceInfo.hasNotch() ? hp("67%") : hp("60%"),
          Platform.OS == "ios" ? hp("80%") : hp("70%")
        ]}
        renderContent={renderCustodianRequestOtpModalContent}
        renderHeader={renderCustodianRequestOtpModalHeader}
      /> */}
      <BottomSheet
        onCloseEnd={ () => {
          setTabBarZIndex( 999 );
        } }
        enabledInnerScrolling={ true }
        ref={ CustodianRequestRejectedBottomSheet }
        snapPoints={ [ -50, hp( '60%' ) ] }
        renderContent={ renderCustodianRequestRejectedModalContent }
        renderHeader={ renderCustodianRequestRejectedModalHeader }
      />
      <BottomSheet
        onCloseEnd={ () => {
          setTabBarZIndex( 999 );
          ( bottomSheet as any ).current.snapTo( 1 );
        } }
        enabledInnerScrolling={ true }
        ref={ MoreTabBottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '65%' ) : hp( '75%' ),
        ] }
        renderContent={ renderMoreTabContents }
        renderHeader={ renderMoreTabHeader }
      />
      <BottomSheet
        onOpenEnd={ () => {
          setTabBarZIndex( 0 );
        } }
        enabledInnerScrolling={ true }
        ref={ AllAccountsBottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
        ] }
        renderContent={ renderAllAccountsContents }
        renderHeader={ renderAllAccountsHeader }
      />
      <BottomSheet
        onOpenEnd={ () => {
          setTabBarZIndex( 0 );
        } }
        enabledInnerScrolling={ true }
        ref={ settingsBottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
        ] }
        renderContent={ renderSettingsContents }
        renderHeader={ renderSettingsHeader }
      />
      <BottomSheet
        onCloseEnd={ () => {
          setTabBarZIndex( 999 );
        } }
        enabledInnerScrolling={ true }
        ref={ CustodianRequestAcceptBottomSheet }
        snapPoints={ [ -50, hp( '60%' ) ] }
        renderContent={ renderCustodianRequestAcceptModalContent }
        renderHeader={ renderCustodianRequestAcceptModalHeader }
      />
      <BottomSheet
        onOpenEnd={ () => {
          setTabBarZIndex( 0 );
        } }
        enabledInnerScrolling={ true }
        ref={ ErrorBottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ] }
        renderContent={ renderErrorModalContent }
        renderHeader={ renderErrorModalHeader }
      />
      <BottomSheet
        onOpenEnd={ () => {
          setTabBarZIndex( 0 );
        } }
        enabledInnerScrolling={ true }
        ref={ PinChangeSuccessBottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ] }
        renderContent={ renderPinChangeSuccessModalContent }
        renderHeader={ renderPinChangeSuccessModalHeader }
      />
      <BottomSheet
        onOpenEnd={() => {}}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={transactionDetailsBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
        ] }
        renderContent={ renderTransactionDetailsContents }
        renderHeader={ renderTransactionDetailsHeader }
      />
      <BottomSheet
        onOpenEnd={() => {}}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={addressBookBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
        ] }
        renderContent={ renderAddressBookContents }
        renderHeader={ renderAddressBookHeader }
      />
      <BottomSheet
        onOpenEnd={ () => {
          setTabBarZIndex( 0 );
        } }
        onCloseEnd={ () => {
          setTabBarZIndex( 999 );
        } }
        enabledInnerScrolling={ true }
        ref={ AddBottomSheet }
        snapPoints={ [ -50, hp( '63%' ) ] }
        renderContent={ renderAddModalContents }
        renderHeader={ renderAddModalHeader }
      />
      <BottomSheet
        onOpenEnd={ () => {
          setTabBarZIndex( 0 );
        } }
        enabledInnerScrolling={ true }
        ref={ fastBitcoinRedeemCalculationBottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
          Platform.OS == 'ios' ? hp( '90%' ) : hp( '50%' ),
        ] }
        renderContent={ renderFastBitcoinRedeemCalculationContents }
        renderHeader={ renderFastBitcoinRedeemCalculationHeader }
      />
      <BottomSheet
        onOpenEnd={ () => {
          setTabBarZIndex( 0 );
        } }
        enabledInnerScrolling={ true }
        ref={ fastBitcoinSellCalculationBottomSheet }
        snapPoints={ [
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
          Platform.OS == 'ios' ? hp( '90%' ) : hp( '50%' ),
        ] }
        renderContent={ renderFastBitcoinSellCalculationContents }
        renderHeader={ renderFastBitcoinSellCalculationHeader }
      />
      <BottomSheet
        onOpenEnd={() => {}}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={FamilyAndFriendAddressBookBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
        ] }
        renderContent={ renderFamilyAndFriendAddressBookContents }
        renderHeader={ renderFamilyAndFriendAddressBookHeader }
      />
      <BottomSheet
        onOpenEnd={() => {}}
        enabledInnerScrolling={true}
        ref={ContactSelectedFromAddressBookBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
        ] }
        renderContent={ renderContactSelectedFromAddressBookContents }
        renderHeader={ renderContactSelectedFromAddressBookHeader }
      />
      <BottomSheet
        onOpenEnd={() => {}}
        enabledInnerScrolling={true}
        ref={ContactSelectedFromAddressBookQrCodeBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '90%' ) : hp( '90%' ),
        ] }
        renderContent={ renderContactSelectedFromAddressBookQrCodeContents }
        renderHeader={ renderContactSelectedFromAddressBookQrCodeHeader }
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

      <BottomSheet
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
      />
      <BottomSheet
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
      />

      <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={ReshareBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ] }
        renderContent={ renderReshareContent }
        renderHeader={ renderReshareHeader }
      />
      <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={ChangeBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ] }
        renderContent={ renderChangeContent }
        renderHeader={ renderChangeHeader }
      />
      <BottomSheet
        onOpenEnd={() => {
          setTabBarZIndex(0);
        }}
        onCloseEnd={() => {
          setTabBarZIndex(999);
        }}
        enabledInnerScrolling={true}
        ref={ConfirmBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ] }
        renderContent={ renderConfirmContent }
        renderHeader={ renderConfirmHeader }
      />
      <BottomSheet
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
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '37%' ) : hp( '45%' ),
        ] }
        renderContent={ renderRegenerateContent }
        renderHeader={ renderRegenerateHeader }
      />

      {/* TODO: If we open full modal above tab bar first change zIndex to 0 and when we close that modal please zIndex to 999 by using setTabBarZIndex(0) or setTabBarZIndex(999) */ }
      <View style={ { ...styles.bottomTabBarContainer, zIndex: tabBarZIndex } }>
        <TouchableOpacity
          onPress={ () => selectTab( 'Transactions' ) }
          style={ styles.tabBarTabView }
        >
          { selected == 'Transactions' ? (
            <View style={ styles.activeTabStyle }>
              <Image
                source={ require( '../assets/images/HomePageIcons/icon_transactions_active.png' ) }
                style={ { width: 25, height: 25, resizeMode: 'contain' } }
              />
              <Text style={ styles.activeTabTextStyle }>transactions</Text>
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
          onPress={ () => selectTab( 'Add' ) }
          style={ styles.tabBarTabView }
        >
          { selected == 'Add' ? (
            <View style={ styles.activeTabStyle }>
              <Image
                source={ require( '../assets/images/HomePageIcons/icon_add_active.png' ) }
                style={ styles.tabBarImage }
              />
              <Text style={ styles.activeTabTextStyle }>add</Text>
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
          onPress={ () => selectTab( 'QR' ) }
          style={ styles.tabBarTabView }
        >
          { selected == 'QR' ? (
            <View style={ styles.activeTabStyle }>
              <Image
                source={ require( '../assets/images/HomePageIcons/icon_qr_active.png' ) }
                style={ styles.tabBarImage }
              />
              <Text style={ styles.activeTabTextStyle }>qr</Text>
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
          style={ styles.tabBarTabView }
          onPress={ () => {
            setOpenmodal( 'closed' );
            ( MoreTabBottomSheet as any ).current.snapTo( 1 );
            selectTab( 'More' );
          } }
        >
          { selected == 'More' ? (
            <View style={ styles.activeTabStyle }>
              <Image
                source={ require( '../assets/images/HomePageIcons/icon_more.png' ) }
                style={ styles.tabBarImage }
              />
              <Text style={ styles.activeTabTextStyle }>More</Text>
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

const styles = StyleSheet.create( {
  card: {
    margin: 0,
    width: wp( '42.6%' ),
    height: hp( '20.1%' ),
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginRight: wp( '2%' ),
    marginBottom: wp( '2%' ),
    padding: wp( '3' ),
    backgroundColor: Colors.white,
  },
  cardTitle: {
    color: Colors.blue,
    fontSize: RFValue( 10, 812 ),
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
    fontSize: RFValue( 12, 812 ),
  },
  bottomTabBarContainer: {
    backgroundColor: Colors.white,
    justifyContent: 'space-evenly',
    display: 'flex',
    marginTop: 'auto',
    flexDirection: 'row',
    height: hp( '12%' ),
    alignItems: 'center',
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    paddingBottom: DeviceInfo.hasNotch() ? hp( '4%' ) : 0,
  },
  cardViewContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
    marginTop: hp( '4%' ),
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: { width: 2, height: -1 },
    paddingTop: hp( '1.5%' ),
    paddingBottom: hp( '7%' ),
    width: '100%',
    overflow: 'hidden',
    paddingLeft: wp( '3%' ),
  },
  modalHeaderContainer: {
    backgroundColor: Colors.white,
    marginTop: 'auto',
    flex: 1,
    height: 40,
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
    fontSize: RFValue( 18, 812 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  headerViewContainer: {
    marginTop: hp( '3%' ),
    marginLeft: 20,
    marginRight: 20,
  },
  headerTitleViewContainer: {
    flex: 7,
    marginBottom: hp( '3%' ),
    justifyContent: 'center',
  },
  headerTitleText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 25, 812 ),
    display: 'flex',
    marginBottom: hp( '0.8%' ),
  },
  headerToggleSwitchContainer: {
    flex: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: hp( '3%' ),
  },
  headerInfoText: {
    fontSize: RFValue( 12, 812 ),
    color: Colors.white,
    marginBottom: hp( '4%' ),
    width: wp( '50%' ),
  },
  headerButton: {
    backgroundColor: Colors.homepageButtonColor,
    height: hp( '5%' ),
    width: wp( '30%' ),
    borderRadius: 5,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13, 812 ),
    color: Colors.white,
  },
  cardBitCoinImage: {
    width: wp( '3%' ),
    height: wp( '3%' ),
    marginRight: 5,
    marginBottom: wp( '0.5%' ),
    resizeMode: 'contain',
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 17, 812 ),
    marginRight: 5,
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11, 812 ),
    marginBottom: 2,
  },
  tabBarImage: {
    width: 21,
    height: 21,
    resizeMode: 'contain',
  },
  tabBarTabView: {
    padding: wp( '5%' ),
  },
  transactionModalElementView: {
    backgroundColor: Colors.backgroundColor,
    padding: hp( '1%' ),
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalElementInfoView: {
    padding: hp( '1%' ),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 12, 812 ),
    marginBottom: 3,
    fontFamily: Fonts.FiraSansRegular,
  },
  transactionModalDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10, 812 ),
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
    fontSize: RFValue( 20, 812 ),
    fontFamily: Fonts.OpenSans,
  },
  transactionModalAmountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10, 812 ),
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
} );
