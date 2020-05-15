import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  ImageBackground,
  FlatList
} from 'react-native';
import CardView from 'react-native-cardview';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import {
  transferST1,
  clearTransfer,
  transferST2,
  fetchTransactions,
  transferST3,
  fetchBalance,
  fetchBalanceTx,
  alternateTransferST2,
} from '../../store/actions/accounts';
import DeviceInfo from 'react-native-device-info';
import * as ExpoContacts from 'expo-contacts';
import SendStatusModalContents from '../../components/SendStatusModalContents';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import QrCodeModalContents from '../../components/QrCodeModalContents';
import SendConfirmationContent from './SendConfirmationContent';
import ModalHeader from '../../components/ModalHeader';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import RadioButton from '../../components/RadioButton';
import { UsNumberFormat } from '../../common/utilities';
import { nameToInitials } from '../../common/CommonFunctions';

export default function Send(props) {
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [
    SendConfirmationBottomSheet,
    setSendConfirmationBottomSheet,
  ] = useState(React.createRef());
  const [
    SendSuccessWithAddressBottomSheet,
    setSuccessWithAddressBottomSheet,
  ] = useState(React.createRef());
  const [
    SendUnSuccessWithAddressBottomSheet,
    setUnSuccessWithAddressBottomSheet,
  ] = useState(React.createRef());

  const [averageTxFees, setAverageTxFees] = useState(
    props.navigation.getParam('averageTxFees'),
  );
  const [serviceType, setServiceType] = useState(
    props.navigation.getParam('serviceType')
      ? props.navigation.getParam('serviceType')
      : REGULAR_ACCOUNT,
  );
  const sweepSecure = props.navigation.getParam('sweepSecure');
  let netBalance = props.navigation.getParam('netBalance');
  const { transfer, loading, service } = useSelector(
    (state) => state.accounts[serviceType],
  );
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const getServiceType = props.navigation.getParam('getServiceType')
    ? props.navigation.getParam('getServiceType')
    : null;
  const isFromAddressBook = props.navigation.getParam('isFromAddressBook')
    ? props.navigation.getParam('isFromAddressBook')
    : false;
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('');
  const [description, setDescription] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderValueText, setSliderValueText] = useState('Low Fee');
  const [isSendHelperDone, setIsSendHelperDone] = useState(true);
  const [isInvalidBalance, setIsInvalidBalance] = useState(false);
  const [isInvalidAddress, setIsInvalidAddress] = useState(true);
  // const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [SendHelperBottomSheet, setSendHelperBottomSheet] = useState(
    React.createRef(),
  );

  const [balances, setBalances] = useState({
    regularBalance: 0,
    secureBalance: 0,
  });
  const [filterContactData, setFilterContactData] = useState([]);
  const accounts = useSelector((state) => state.accounts);
  const sendStorage = useSelector((state) => state.sendReducer.sendStorage);

  useEffect(() => {
    const regularBalance = accounts[REGULAR_ACCOUNT].service
      ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
        accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    const secureBalance = accounts[SECURE_ACCOUNT].service
      ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
        accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
          .unconfirmedBalance
      : 0;
    setBalances({
      regularBalance,
      secureBalance,
    });
  }, [accounts]);

  const [isEditable, setIsEditable] = useState(true);

  const accountData = [
    {
      id: '1',
      account_name: 'Checking Account',
      type: REGULAR_ACCOUNT,
      icon: require('../../assets/images/icons/icon_regular_account.png'),
    },
    {
      id: '2',
      account_name: 'Saving Account',
      type: SECURE_ACCOUNT,
      icon: require('../../assets/images/icons/icon_secureaccount_white.png'),
    }
  ];

  const getContact = () => {
    ExpoContacts.getContactsAsync().then(async ({ data }) => {
      if(data.length > 0) {
        await AsyncStorage.setItem('ContactData', JSON.stringify(data));
        const contactList = data.sort(function (a, b) {
          if (a.name && b.name) {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
          }
          return 0;
        });
        setFilterContactData(contactList);
      }
    });
  };

  useEffect(() => {
    getContact();
  }, []);

  let userInfo = {
    to: '2MvXh39FM7m5v8GHyQ3eCLi45ccA1pFL7DR',
    from: 'Secure Account',
    amount: '0.00012',
    fee: '0.0001',
    total: 0.00022,
    estDeliveryTime: '2 hours',
    description: '',
  };

  const checkNShowHelperModal = async () => {
    let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
    if (!isSendHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isSendHelperDone', 'true');
      setTimeout(() => {
        setIsSendHelperDone(true);
      }, 10);

      setTimeout(() => {
        if (SendHelperBottomSheet.current)
          SendHelperBottomSheet.current.snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsSendHelperDone(false);
      }, 10);
    }
  };

  useEffect(() => {
    checkNShowHelperModal();
  }, []);

  useEffect(() => {
    if (!averageTxFees) {
      (async () => {
        const storedAverageTxFees = await AsyncStorage.getItem(
          'storedAverageTxFees',
        );
        if (storedAverageTxFees) {
          const { averageTxFees, lastFetched } = JSON.parse(
            storedAverageTxFees,
          );
          if (Date.now() - lastFetched < 1800000) {
            setAverageTxFees(averageTxFees);
            return;
          } // maintaining a half an hour difference b/w fetches
        }

        const instance = service.hdWallet || service.secureHDWallet;
        const averageTxFees = await instance.averageTransactionFee();
        setAverageTxFees(averageTxFees);
        await AsyncStorage.setItem(
          'storedAverageTxFees',
          JSON.stringify({ averageTxFees, lastFetched: Date.now() }),
        );
      })();
    }
  }, []);

  useEffect(() => {
    if (sweepSecure) {
      SendConfirmationBottomSheet.current.snapTo(0);
      if (netBalance === 0) {
        setAmount(`0`);
      } else {
        setAmount(
          `${
            netBalance -
            Number(
              averageTxFees[
                sliderValueText === 'Low Fee'
                  ? 'low'
                  : sliderValueText === 'In the middle'
                  ? 'medium'
                  : 'high'
              ].averageTxFee,
            )
          }`,
        );
      }
    }
  }, [sweepSecure, sliderValueText]);

  const updateDescription = useCallback(async (txid, description) => {
    let descriptionHistory = {};
    const storedHistory = JSON.parse(
      await AsyncStorage.getItem('descriptionHistory'),
    );
    if (storedHistory) descriptionHistory = storedHistory;
    descriptionHistory[txid] = description;

    await AsyncStorage.setItem(
      'descriptionHistory',
      JSON.stringify(descriptionHistory),
    );
  }, []);

  const dispatch = useDispatch();

  const renderSuccessStatusContents = () => (
    <SendStatusModalContents
      title1stLine={'Sent Successfully'}
      title2ndLine={''}
      info1stLine={'Bitcoins successfully sent to'}
      info2ndLine={''}
      userName={recipientAddress}
      // modalRef={SendSuccessBottomSheet}
      isSuccess={true}
      onPressViewAccount={() => {
        dispatch(clearTransfer(serviceType));
        // dispatch(fetchTransactions(serviceType));
        dispatch(
          fetchBalanceTx(serviceType, {
            loader: true,
          }),
        );
        props.navigation.navigate('Accounts');
      }}
      transactionId={transfer.txid}
      transactionDateTime={Date()}
    />
  );

  useEffect(() => {
    if (
      transfer.stage1.failed ||
      transfer.stage2.failed ||
      transfer.stage3.failed
    ) {
      if (SendConfirmationBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendConfirmationBottomSheet.current.snapTo(0);
      }
      if (SendUnSuccessWithAddressBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendUnSuccessWithAddressBottomSheet.current.snapTo(1);
      }
      setIsEditable(true);
    } else if (transfer.txid) {
      if (description) {
        updateDescription(transfer.txid, description);
      }
      if (SendConfirmationBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendConfirmationBottomSheet.current.snapTo(0);
      }
      if (SendSuccessWithAddressBottomSheet.current) {
        setTimeout(() => {
          setIsConfirmDisabled(false);
        }, 10);
        SendSuccessWithAddressBottomSheet.current.snapTo(1);
      }
    } else if (transfer.executed === 'ST1') {
      if (SendConfirmationBottomSheet.current)
        SendConfirmationBottomSheet.current.snapTo(1);
      setTimeout(() => {
        setIsConfirmDisabled(false);
      }, 10);
    } else if (!transfer.txid && transfer.executed === 'ST2') {
      setIsConfirmDisabled(false);
      if (SendConfirmationBottomSheet.current)
        SendConfirmationBottomSheet.current.snapTo(0);
      props.navigation.navigate('TwoFAToken', {
        serviceType,
        recipientAddress,
      });
    }
  }, [transfer]);

  const renderSendHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={`Sending Bitcoins`}
        image={require('../../assets/images/icons/send.png')}
        helperInfo={`When you want to send bitcoins or sats, you need the recipient’s bitcoin address\n\nYou can scan this address as a QR code or copy it from the recipient`}
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          if (SendHelperBottomSheet.current)
            (SendHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderSendHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if (isSendHelperDone) {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsSendHelperDone(false);
            }, 10);
          } else {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  const getQrCodeData = (qrData) => {
    setTimeout(() => {
      setQrBottomSheetsFlag(false);
      setRecipientAddress(qrData);
    }, 2);
    setTimeout(() => {
      if (bottomSheet.current) (bottomSheet as any).current.snapTo(0);
    }, 10);
  };

  const renderContent1 = () => {
    return (
      <QrCodeModalContents
        flag={true}
        modalRef={bottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => getQrCodeData(qrData)}
      />
    );
  };

  function renderHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => {
          setTimeout(() => {
            setQrBottomSheetsFlag(false);
          }, 2);
          if (bottomSheet.current) (bottomSheet as any).current.snapTo(0);
        }}
        style={styles.modalHeaderContainer}
      >
        <View style={styles.modalHeaderHandle} />
        <Text style={styles.modalHeaderTitleText}>QR</Text>
      </TouchableOpacity>
    );
  }

  const renderSendConfirmationContents = () => {
    if (transfer) {
      userInfo = {
        to: recipientAddress,
        from: getAccountFromType(),
        amount: amount,
        fee: transfer.stage1.fee,
        total: parseInt(amount, 10) + parseInt(transfer.stage1.fee, 10),
        estDeliveryTime: timeConvert(transfer.stage1.estimatedBlocks * 10),
        description: description,
      };
    }
    return (
      <SendConfirmationContent
        title={'Send Confirmation'}
        info={'Confirm the follow details'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          const txnPriority = 'low';
          if (sweepSecure) {
            dispatch(alternateTransferST2(serviceType, txnPriority));
          } else {
            dispatch(transferST2(serviceType, txnPriority));
          }
        }}
        onPressCancel={() => {
          dispatch(clearTransfer(serviceType));
          if (SendConfirmationBottomSheet.current)
            SendConfirmationBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderSendConfirmationHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          if (SendConfirmationBottomSheet.current) {
            dispatch(clearTransfer(serviceType));
            SendConfirmationBottomSheet.current.snapTo(0);
          }
        }}
      />
    );
  };

  const renderSendSuccessWithAddressContents = () => {
    if (transfer) {
      userInfo = {
        to: recipientAddress,
        from: getAccountFromType(),
        amount: amount,
        fee: transfer.stage1.fee,
        total: parseInt(amount, 10) + parseInt(transfer.stage1.fee, 10),
        estDeliveryTime: timeConvert(transfer.stage1.estimatedBlocks * 10),
        description: description,
      };
    }
    return (
      <SendConfirmationContent
        title={'Sent Successfully'}
        info={'Bitcoins successfully sent to Contact'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
          dispatch(clearTransfer(serviceType));
          dispatch(
            fetchBalanceTx(serviceType, {
              loader: true,
            }),
          );
          if (SendSuccessWithAddressBottomSheet.current)
            SendSuccessWithAddressBottomSheet.current.snapTo(0);
          props.navigation.replace('Accounts', { serviceType: serviceType });
        }}
        isSuccess={true}
      />
    );
  };

  const renderSendSuccessWithAddressHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          dispatch(clearTransfer(serviceType));
          dispatch(
            fetchBalanceTx(serviceType, {
              loader: true,
            }),
          );
          if (SendSuccessWithAddressBottomSheet.current)
            SendSuccessWithAddressBottomSheet.current.snapTo(0);
          props.navigation.navigate('Accounts');
        }}
      />
    );
  };

  const renderSendUnSuccessWithAddressContents = () => {
    return (
      <SendConfirmationContent
        title={'Sent Unsuccessful'}
        info={'There seems to be a problem'}
        userInfo={userInfo}
        isFromContact={false}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
          checkBalance();
        }}
        onPressCancel={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
        isUnSuccess={true}
      />
    );
  };

  const renderSendUnSuccessWithAddressHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessWithAddressBottomSheet.current)
            SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  useEffect(() => {
    if (serviceType === SECURE_ACCOUNT) {
      (async () => {
        if (
          !(await AsyncStorage.getItem('twoFASetup')) &&
          !(await AsyncStorage.getItem('walletRecovered'))
        ) {
          props.navigation.navigate('TwoFASetup', {
            twoFASetup: service.secureHDWallet.twoFASetup,
          });
          await AsyncStorage.setItem('twoFASetup', 'true');
        }
      })();
    }
  }, []);

  const getAccountFromType = () => {
    if (serviceType == 'TEST_ACCOUNT') {
      return 'Test Account';
    }
    if (serviceType == 'SECURE_ACCOUNT') {
      return 'Secure Account';
    }
    if (serviceType == 'REGULAR_ACCOUNT') {
      return 'Checking Account';
    }
    if (serviceType == 'S3_SERVICE') {
      return 'S3 Service';
    }
  };

  function timeConvert(valueInMinutes) {
    var num = valueInMinutes;
    var hours = Math.round(num / 60);
    var days = Math.round(hours / 24);
    if (valueInMinutes < 60) {
      return valueInMinutes + ' minutes';
    } else if (hours < 24) {
      return hours + ' hours';
    } else if (days > 0) {
      return days == 1 ? days + ' day' : days + ' days';
    }
  }

  const checkBalance = () => {
    setIsConfirmDisabled(true);
    if (
      netBalance <
      Number(amount) +
        Number(
          averageTxFees[
            sliderValueText === 'Low Fee'
              ? 'low'
              : sliderValueText === 'In the middle'
              ? 'medium'
              : 'high'
          ].averageTxFee,
        )
    ) {
      setIsInvalidBalance(true);
    } else {
      setIsEditable(false);
      const priority =
        sliderValueText === 'Low Fee'
          ? 'low'
          : sliderValueText === 'In the middle'
          ? 'medium'
          : 'high';
      const recipients = [
        { address: recipientAddress, amount: parseInt(amount) },
      ];
      dispatch(transferST1(serviceType, recipients, averageTxFees));
    }
  };

  useEffect(() => {
    console.log(
      'isInvalidAddress && recipientAddress && amount',
      isInvalidAddress,
      recipientAddress,
      amount,
    );
    if (isInvalidAddress && recipientAddress && amount) {
      setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
    }
  }, [recipientAddress, isInvalidAddress, amount]);

  const renderQRCodeThumbnail = () => {
    return (
      <AppBottomSheetTouchableWrapper>
        <ImageBackground source={require("../../assets/images/icons/iPhone-QR.png")} style={{
          width: wp('100%'),
          height: wp('70%'),
          overflow: "hidden",
          borderRadius: 20,
        }} >
          <View style={{ flexDirection: 'row', paddingTop: 12, paddingRight: 12, paddingLeft: 12, width: '100%' }}>
            <View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderTopWidth: 1 }} />
            <View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
          </View>
          <View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 12, paddingRight: 12, paddingLeft: 12, width: '100%', }}>
            <View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: hp('5%'), width: hp('5%'), borderBottomWidth: 1 }} />
            <View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: hp('5%'), width: hp('5%'), marginLeft: 'auto' }} />
          </View>
        </ImageBackground>
      </AppBottomSheetTouchableWrapper>
    )
  }

  const onSelectContact = (item) => {
    let isNavigate = true;
    if (sendStorage && sendStorage.length === 0) {
      props.navigation.navigate('SendToContact', { selectedContact: item, serviceType });
    }
    else {
      sendStorage && sendStorage.map((contact) => {
        if(contact.selectedContact.id === item.id) {
          return isNavigate = false;
        }
      })
      if(isNavigate) {
        props.navigation.navigate('SendToContact', { selectedContact: item, serviceType });
      }
    }
  }

  const getImageIcon = item => {
    if (item) {
      if (item.imageAvailable) {
        return (
          <Image
            source={item.image}
            style={styles.circleShapeView}
          />
        );
      } else {
        return (
          <View
            style={{...styles.circleShapeView, 
              backgroundColor: Colors.shadowBlue, 
              alignItems: 'center', 
              justifyContent: 'center'}}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                lineHeight: 13, //... One for top and one for bottom alignment
              }}
            >
              {item
                ? nameToInitials(
                    item.firstName && item.lastName
                      ? item.firstName + ' ' + item.lastName
                      : item.firstName && !item.lastName
                      ? item.firstName
                      : !item.firstName && item.lastName
                      ? item.lastName
                      : '',
                  )
                : ''}
            </Text>
          </View>
        );
      }
    }
  };

  const renderContacts = ({ item, index }) => {
    return (
      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity onPress={() => onSelectContact(item)}>
          <View style={{ justifyContent: 'center', marginLeft: hp('4%') }}>
            {sendStorage && sendStorage.length > 0 && 
              sendStorage.map((contact) => {
                if(contact.selectedContact.id === item.id) {
                  return (
                    <Image style={styles.checkmarkStyle} 
                      source={require('../../assets/images/icons/checkmark.png')} 
                      resizeMode="contain" />
                  )
                }
              })
            }
            {/* <Image style={styles.circleShapeView} 
              source={require('../../assets/images/icons/icon_contact.png')} 
              resizeMode="contain" /> */}
            {getImageIcon(item)}
            <Text 
              style={{
                width: 50,
                height: 15,
                color: Colors.textColorGrey,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansRegular,
                textAlign: 'center'
              }}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const renderAccounts = ({ item, index }) => {
    return(
      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity onPress={() => onSelectContact(item)}>
          <CardView cornerRadius={10} opacity={1} style={styles.card}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 2,
                marginRight: 2
              }}
            >
              <Image
                style={{ width: wp('10%'), height: wp('10%') }}
                source={item.icon}
              />
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue(10),
                  fontWeight: '500',
                  textAlign: 'center'
                }}
              >
                {item.account_name}
              </Text>
              <Text 
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                  textAlign: 'center',
                  marginTop: 2
                }}>
                {item.type === REGULAR_ACCOUNT ? '$'+UsNumberFormat(balances.regularBalance) : '$'+UsNumberFormat(balances.secureBalance)}
              </Text>
              <View style={{ marginTop: 5}}>
                {sendStorage && sendStorage.length > 0 && 
                  sendStorage.map((contact) => {
                    if(contact.selectedContact.id === item.id) {
                      return (
                        <Image style={styles.checkmarkStyle} 
                          source={require('../../assets/images/icons/checkmark.png')} 
                          resizeMode="contain" />
                      )
                    } else {
                      return (
                        <RadioButton
                          size={15}
                          color={Colors.lightBlue}
                          borderColor={Colors.borderColor}
                          isChecked={item.checked}
                        />
                      )
                    }
                  })
                }
              </View>
            </View>
          </CardView>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContentContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <ScrollView nestedScrollEnabled={true}>
            <TouchableWithoutFeedback
              onPress={() => {
                if (SendHelperBottomSheet.current)
                  SendHelperBottomSheet.current.snapTo(0);
              }}
            >
              <View onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeaderTitleView}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (getServiceType) {
                          getServiceType(serviceType);
                        }
                        props.navigation.goBack();
                      }}
                      style={{
                        height: 30,
                        width: 30,
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome
                        name="long-arrow-left"
                        color={Colors.blue}
                        size={17}
                      />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
                    {serviceType == TEST_ACCOUNT ? (
                      <Text
                        onPress={() => {
                          AsyncStorage.setItem('isSendHelperDone', 'true');
                          if (SendHelperBottomSheet.current)
                            SendHelperBottomSheet.current.snapTo(1);
                        }}
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(12),
                          marginLeft: 'auto',
                        }}
                      >
                        Know more
                      </Text>
                    ) : null}
                  </View>
                </View>
                {renderQRCodeThumbnail()}
                <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 15 }}>
                  <View style={styles.textBoxView}>
                    <TextInput
                      editable={isEditable}
                      style={styles.textBox}
                      placeholder={'Enter Address Manually'}
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
                      }
                      value={recipientAddress}
                      onChangeText={setRecipientAddress}
                      placeholderTextColor={Colors.borderColor}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            setIsInvalidAddress(true);
                          }, 10);
                        }
                      }}
                      onBlur={() => {
                        const instance =
                          service.hdWallet || service.secureHDWallet;
                        let isAddressValid = instance.isValidAddress(
                          recipientAddress,
                        );
                        setIsInvalidAddress(isAddressValid);
                      }}
                    />
                  </View>
                  {!isInvalidAddress ? (
                    <View style={{ marginLeft: 'auto' }}>
                      <Text style={styles.errorText}>
                        Enter correct address
                      </Text>
                    </View>
                  ) : null}
                  <View style={{ paddingTop: 15 }}>
                    <Text
                      style={{
                        color: Colors.blue,
                        fontSize: RFValue(13),
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                    >
                      Send to Contact
                    </Text>
                    <View
                      style={{
                        ...styles.textBoxView,
                        flexDirection: 'column',
                        height: 90,
                        marginTop: hp('2%'),
                        justifyContent: 'center',
                        backgroundColor: Colors.backgroundColor1
                      }}>
                        <View style={{ flex: 1,  flexDirection: 'row', alignItems: 'center' }}>
                          <FlatList
                            horizontal
                            nestedScrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            data={filterContactData}
                            renderItem={renderContacts}
                            extraData={{ sendStorage }}
                            keyExtractor={(item, index) => index.toString()}
                          />
                        </View>
                    </View>
                  </View>
                  <View style={{ paddingTop: 15 }}>
                    <Text
                      style={{
                        color: Colors.blue,
                        fontSize: RFValue(13),
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                    >
                      Send to Account
                    </Text>
                    <View
                      style={{
                        ...styles.textBoxView,
                        flexDirection: 'column',
                        height: 130,
                        marginTop: hp('2%'),
                        justifyContent: 'center',
                        backgroundColor: Colors.backgroundColor1
                      }}>
                        <View style={{ flex: 1,  flexDirection: 'row', alignItems: 'center' }}>
                          <FlatList
                            data={accountData}
                            horizontal
                            nestedScrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderAccounts}
                            keyExtractor={(item, index) => index.toString()}
                          />
                        </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendHelperBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderSendHelperContents}
        renderHeader={renderSendHelperHeader}
      />
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag(true);
        }}
        onCloseStart={() => {
          setQrBottomSheetsFlag(false);
        }}
        enabledInnerScrolling={true}
        ref={bottomSheet}
        snapPoints={[0, hp('90%')]}
        renderContent={renderContent1}
        renderHeader={renderHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendConfirmationBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendConfirmationContents}
        renderHeader={renderSendConfirmationHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          {
            dispatch(clearTransfer(serviceType));
            dispatch(
              fetchBalanceTx(serviceType, {
                loader: true,
              }),
            );
            props.navigation.navigate('Accounts');
          }
        }}
        enabledInnerScrolling={true}
        ref={SendSuccessWithAddressBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendSuccessWithAddressContents}
        renderHeader={renderSendSuccessWithAddressHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          dispatch(clearTransfer(serviceType));
          SendUnSuccessWithAddressBottomSheet.current.snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={SendUnSuccessWithAddressBottomSheet}
        snapPoints={[-50, hp('50%')]}
        renderContent={renderSendUnSuccessWithAddressContents}
        renderHeader={renderSendUnSuccessWithAddressHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
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
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  contactNameInputImageView: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  confirmButtonView: {
    width: wp('50%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue(13),
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp('12%'),
    width: wp('12%'),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp('12%'),
    width: wp('12%'),
    borderRadius: 7,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  otpRequestHeaderView: {
    marginTop: hp('4%'),
    marginBottom: hp('2%'),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  confirmModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: hp('2.5%'),
    marginBottom: hp('2.5%'),
  },
  dropdownBox: {
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  dropdownBoxOpened: {
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  dropdownBoxText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
  },
  dropdownBoxModal: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp('1%'),
    width: wp('90%'),
    height: hp('18%'),
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.white,
    position: 'absolute',
    zIndex: 9999,
    overflow: 'hidden',
  },
  dropdownBoxModalElementView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
  },
  circleShapeView: {
    width: 50,
    height: 50,
    borderRadius: 50/2,
    borderColor: Colors.white,
    borderWidth: 2
  },
  card: {
    width: 108,
    height: 110,
    marginLeft: 15,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkStyle: {
    position: 'absolute',
    width: 16,
    height: 16,
    top: 0,
    right: 0,
    zIndex: 5
  }
});
