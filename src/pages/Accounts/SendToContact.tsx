import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ToggleSwitch from '../../components/ToggleSwitch';
import { nameToInitials } from '../../common/CommonFunctions';
import { useDispatch, useSelector } from 'react-redux';
import {
  transferST1,
  addTransferDetails,
  removeTransferDetails,
  clearTransfer,
} from '../../store/actions/accounts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { UsNumberFormat } from '../../common/utilities';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import RemoveSelectedTransaction from './RemoveSelectedTrasaction';
import SendConfirmationContent from './SendConfirmationContent';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TRUSTED_CONTACTS,
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { TrustedContactDerivativeAccount } from '../../bitcoin/utilities/Interface';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AccountSelectionModalContents from './AccountSelectionModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import BottomInfoBox from '../../components/BottomInfoBox';
import Currencies from '../../common/Currencies';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions/index';
import { getCurrencyImageName } from '../../common/CommonFunctions/index';
import config from '../../bitcoin/HexaConfig';

export default function SendToContact(props) {
  const [RegularAccountBalance, setRegularAccountBalance] = useState(0);
  const [SavingAccountBalance, setSavingAccountBalance] = useState(0);
  const dispatch = useDispatch();
  const isFromAddressBook = props.navigation.getParam('isFromAddressBook')
    ? props.navigation.getParam('isFromAddressBook')
    : null;
  const [isOpen, setIsOpen] = useState(false);
  const [RemoveBottomSheet, setRemoveBottomSheet] = useState(React.createRef());
  const accounts = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(
    accounts && accounts.exchangeRates,
  );
  const selectedContact = props.navigation.getParam('selectedContact');
  const [serviceType, setServiceType] = useState(
    props.navigation.getParam('serviceType'),
  );
  const [averageTxFees, setAverageTxFees] = useState(
    props.navigation.getParam('averageTxFees'),
  );
  const [spendableBalance, setSpendableBalance] = useState(
    props.navigation.getParam('spendableBalance'),
  );
  const sweepSecure = props.navigation.getParam('sweepSecure');
  const [removeItem, setRemoveItem] = useState({});
  const [switchOn, setSwitchOn] = useState(true);
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const [CurrencySymbol, setCurrencySymbol] = useState('$');
  const [bitcoinAmount, setBitCoinAmount] = useState(
    props.navigation.getParam('bitcoinAmount')
      ? props.navigation.getParam('bitcoinAmount')
      : '',
  );
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [note, setNote] = useState('');
  const [InputStyle, setInputStyle] = useState(styles.textBoxView);
  const [InputStyle1, setInputStyle1] = useState(styles.textBoxView);
  const [InputStyleNote, setInputStyleNote] = useState(styles.textBoxView);
  const [isInvalidBalance, setIsInvalidBalance] = useState(false);
  const [SendUnSuccessBottomSheet, setSendUnSuccessBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const [
    AccountSelectionBottomSheet,
    setAccountSelectionBottomSheet,
  ] = useState(React.createRef<BottomSheet>());
  const [recipients, setRecipients] = useState([]);
  const loading = useSelector((state) => state.accounts[serviceType].loading);
  const transfer = useSelector((state) => state.accounts[serviceType].transfer);
  const service = useSelector((state) => state.accounts[serviceType].service);

  useEffect(() => {
    setCurrencyCodeFromAsync();
    if (bitcoinAmount) convertBitCoinToCurrency(bitcoinAmount);
    if (!averageTxFees) storeAverageTxFees();
  }, []);

  const setCurrencyCodeFromAsync = async () => {
    let currencyToggleValueTmp = await AsyncStorage.getItem(
      'currencyToggleValue',
    );
    setSwitchOn(currencyToggleValueTmp ? true : false);
    let currencyCodeTmp = await AsyncStorage.getItem('currencyCode');
    setCurrencyCode(currencyCodeTmp ? currencyCodeTmp : 'USD');
    for (let i = 0; i < Currencies.length; i++) {
      if (Currencies[i].code.includes(currencyCodeTmp)) {
        setCurrencySymbol(Currencies[i].symbol);
      }
    }
  };

  const currencyCode = [
    'BRL',
    'CNY',
    'JPY',
    'GBP',
    'KRW',
    'RUB',
    'TRY',
    'INR',
    'EUR',
  ];

  function setCurrencyCodeToImage(currencyName, currencyColor) {
    return (
      <View
        style={{
          width: wp('6%'),
          height: wp('6%'),
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons
          name={currencyName}
          color={Colors.currencyGray}
          size={wp('6%')}
        />
      </View>
    );
  }

  useEffect(() => {
    // if (isFromAddressBook) {
    //   dispatch(clearTransfer(serviceType));
    //   dispatch(addTransferDetails(serviceType, { selectedContact }));
    // } // already dispatching before navigation (ContactDetails)

    if (spendableBalance !== 0 && !spendableBalance) {
      const service = accounts[serviceType].service;
      const instance = service.hdWallet || service.secureHDWallet;
      let balance = instance.balances.balance;
      // instance.balances.balance + instance.balances.unconfirmedBalance;

      // if (serviceType === TEST_ACCOUNT)
      //   balance += instance.balances.unconfirmedBalance;

      if (serviceType === REGULAR_ACCOUNT || serviceType === SECURE_ACCOUNT) {
        for (const dAccountType of Object.keys(config.DERIVATIVE_ACC)) {
          let derivativeAccount;

          if (serviceType === REGULAR_ACCOUNT) {
            derivativeAccount =
              accounts[REGULAR_ACCOUNT].service.hdWallet.derivativeAccounts[
                dAccountType
              ];
          } else if (serviceType === SECURE_ACCOUNT) {
            derivativeAccount =
              accounts[SECURE_ACCOUNT].service.secureHDWallet
                .derivativeAccounts[dAccountType];
          }

          if (
            serviceType === SECURE_ACCOUNT &&
            dAccountType === TRUSTED_CONTACTS
          ) {
            continue;
          }

          if (derivativeAccount.instance.using) {
            for (
              let accountNumber = 1;
              accountNumber <= derivativeAccount.instance.using;
              accountNumber++
            ) {
              // console.log({
              //   accountNumber,
              //   balances: trustedAccounts[accountNumber].balances,
              //   transactions: trustedAccounts[accountNumber].transactions,
              // });
              if (derivativeAccount[accountNumber].balances) {
                balance += derivativeAccount[accountNumber].balances.balance;
                // + derivativeAccount[accountNumber].balances.unconfirmedBalance;
              }
            }
          }
        }
      }

      setSpendableBalance(balance);
    }
  }, [serviceType]);

  useEffect(() => {
    if (serviceType == REGULAR_ACCOUNT) {
      setRegularAccountBalance(spendableBalance);
    } else if (serviceType == SECURE_ACCOUNT) {
      setSavingAccountBalance(spendableBalance);
    }
  }, [spendableBalance]);

  const storeAverageTxFees = async () => {
    const storedAverageTxFees = await AsyncStorage.getItem(
      'storedAverageTxFees',
    );
    if (storedAverageTxFees) {
      const { averageTxFees, lastFetched } = JSON.parse(storedAverageTxFees);
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
  };

  useEffect(() => {
    if (accounts && accounts.exchangeRates)
      setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);

  useEffect(() => {
    if (bitcoinAmount && currencyAmount && transfer.details.length) {
      let amountStacked = 0;
      transfer.details.forEach((recipient) => {
        if (
          recipient.bitcoinAmount &&
          recipient.selectedContact.id !== selectedContact.id
        ) {
          amountStacked += parseInt(recipient.bitcoinAmount);
        }
      });
      if (spendableBalance - amountStacked < Number(bitcoinAmount)) {
        setIsInvalidBalance(true);
        setIsConfirmDisabled(true);
      } else setIsConfirmDisabled(false);
    } else {
      setIsConfirmDisabled(true);
      if (!transfer.details.length) {
        props.navigation.goBack();
      }
    }
  }, [bitcoinAmount, currencyAmount, transfer]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      checkRecordsHavingPrice();
    });
  }, []);

  useEffect(() => {
    if (!recipients.length) return;
    if (transfer.stage1.failed) {
      setTimeout(() => {
        setIsConfirmDisabled(false);
      }, 10);
      SendUnSuccessBottomSheet.current.snapTo(1);
    } else if (transfer.executed === 'ST1') {
      if (transfer.details.length) {
        props.navigation.navigate('SendConfirmation', {
          serviceType,
          sweepSecure,
          spendableBalance,
          recipients,
          averageTxFees,
        });
      }
    }
  }, [transfer, recipients, averageTxFees]);

  const handleTrasferST1 = () => {
    const recipients = [];
    const currentRecipientInstance = {
      selectedContact,
      bitcoinAmount,
      currencyAmount,
      note,
    };

    const recipientsList = [];
    transfer.details.forEach((instance) => {
      if (
        instance.bitcoinAmount &&
        instance.selectedContact.id !== selectedContact.id
      )
        recipientsList.push(instance);
    });
    recipientsList.push(currentRecipientInstance);
    const instance = service.hdWallet || service.secureHDWallet;

    recipientsList.map((item) => {
      const recipientId = item.selectedContact.id;
      const isValidAddress = instance.isValidAddress(recipientId);
      if (isValidAddress) {
        // recipient: explicit address
        recipients.push({
          id: recipientId,
          address: recipientId,
          amount: parseInt(item.bitcoinAmount),
        });
      } else {
        if (recipientId === REGULAR_ACCOUNT || recipientId === SECURE_ACCOUNT) {
          // recipient: sibling account
          recipients.push({
            id: recipientId,
            address: null,
            amount: parseInt(item.bitcoinAmount),
          });
        } else {
          // recipient: trusted contact
          const contactName = `${item.selectedContact.firstName} ${
            item.selectedContact.lastName ? item.selectedContact.lastName : ''
          }`.toLowerCase();
          recipients.push({
            id: contactName,
            address: null,
            amount: parseInt(item.bitcoinAmount),
          });
        }
      }
    });
    setRecipients(recipients);
    dispatch(transferST1(serviceType, recipients, averageTxFees));
  };

  const removeFromSendStorage = (item) => {
    setTimeout(() => {
      setRemoveItem(item);
    }, 2);
    (RemoveBottomSheet as any).current.snapTo(1);
  };

  const getServiceTypeAccount = () => {
    if (serviceType == 'TEST_ACCOUNT') {
      return 'Test Account';
    } else if (serviceType == 'SECURE_ACCOUNT') {
      return 'Savings Account';
    } else if (serviceType == 'REGULAR_ACCOUNT') {
      return 'Checking Account';
    } else if (serviceType == 'S3_SERVICE') {
      return 'S3 Service';
    }
  };

  const getImageIcon = (item) => {
    if (item) {
      if (item.account_name) {
        return (
          <Image
            source={
              item.account_name === 'Checking Account'
                ? require('../../assets/images/icons/icon_regular.png')
                : item.account_name === 'Savings Account'
                ? require('../../assets/images/icons/icon_secureaccount.png')
                : item.account_name === 'Test Account'
                ? require('../../assets/images/icons/icon_test_white.png')
                : require('../../assets/images/icons/icon_user.png')
            }
            style={styles.circleShapeView}
          />
        );
      }

      if (item.image) {
        return <Image source={item.image} style={styles.circleShapeView} />;
      } else {
        return (
          <View
            style={{
              ...styles.circleShapeView,
              backgroundColor: Colors.shadowBlue,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item && item.firstName ? (
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
            ) : item && item.id ? (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                  lineHeight: 18, //... One for top and one for bottom alignment
                }}
              >
                @
              </Text>
            ) : (
              <Image
                source={require('../../assets/images/icons/icon_user.png')}
                style={styles.circleShapeView}
              />
            )}
          </View>
        );
      }
    }
  };

  const renderMultipleContacts = (item) => {
    return (
      <View
        style={{
          marginRight: 20,
          justifyContent: 'center',
          alignItems: 'center',
          width: wp('15%'),
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {getImageIcon(item.selectedContact)}
          <TouchableOpacity
            style={styles.closeMarkStyle}
            onPress={() => removeFromSendStorage(item)}
          >
            <AntDesign size={16} color={Colors.blue} name={'closecircle'} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            color: Colors.textColorGrey,
            fontSize: RFValue(13),
            fontFamily: Fonts.FiraSansRegular,
            textAlign: 'center',
            marginTop: 5,
            width: wp('15%'),
          }}
          numberOfLines={1}
        >
          {item.selectedContact.name ||
            item.selectedContact.account_name ||
            item.selectedContact.id}
        </Text>
        <Text
          style={{
            color: Colors.blue,
            fontSize: RFValue(10),
            fontFamily: Fonts.FiraSansRegular,
          }}
        >
          {switchOn
            ? `${item.bitcoinAmount ? item.bitcoinAmount : bitcoinAmount} sats`
            : CurrencySymbol +
              ' ' +
              `${item.currencyAmount ? item.currencyAmount : currencyAmount}`}
        </Text>
      </View>
    );
  };

  const renderVerticalDivider = () => {
    return (
      <View
        style={{
          width: 2,
          height: '60%',
          backgroundColor: Colors.borderColor,
          marginRight: 5,
          marginLeft: 5,
          alignSelf: 'center',
        }}
      />
    );
  };

  const convertBitCoinToCurrency = (value) => {
    let temp = value;
    if (switchOn) {
      let result = exchangeRates
        ? ((value / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2)
        : 0;
      setBitCoinAmount(temp);
      setCurrencyAmount(result.toString());
    } else {
      let currency = exchangeRates
        ? value / exchangeRates[CurrencyCode].last
        : 0;
      currency = currency < 1 ? currency * 1e8 : currency;
      setCurrencyAmount(temp);
      setBitCoinAmount(currency.toFixed(0));
    }
  };

  const renderSendUnSuccessContents = () => {
    // let netAmount: any = 0;
    // let fee: any = 0;
    // let balance = netBalance;
    // if (switchOn || serviceType === TEST_ACCOUNT) {
    //   netAmount = transfer.stage1.netAmount;
    //   fee = transfer.stage1.fee;
    // } else {
    //   if (exchangeRates) {
    //     netAmount = (
    //       (transfer.stage1.netAmount / 1e8) *
    //       exchangeRates[CurrencyCode].last
    //     ).toFixed(2);
    //     fee = (
    //       (transfer.stage1.fee / 1e8) *
    //       exchangeRates[CurrencyCode].last
    //     ).toFixed(2);

    //     balance = ((balance / 1e8) * exchangeRates[CurrencyCode].last).toFixed(
    //       2,
    //     );
    //   }
    // }

    return (
      <SendConfirmationContent
        title={'Sent Unsuccessful'}
        info={
          'There seems to be a problem' + '\n' + transfer.stage1.failed
            ? transfer.stage1.err === 'Insufficient balance'
              ? // `Insufficient balance to compensate the transfer amount: ${netAmount} and the transaction fee: ${fee}` +
                //   `\n\nPlease reduce the transfer amount by ${(
                //     parseFloat(netAmount) +
                //     parseFloat(fee) -
                //     parseFloat(balance)
                //   ).toFixed(
                //     switchOn ? 0 : 2,
                //   )} in order to conduct this transaction`
                'Insufficient balance to complete the transaction plus fee.\nPlease reduce the amount and try again.'
              : transfer.stage1.err
            : 'Something went wrong'
        }
        userInfo={transfer.details}
        isFromContact={false}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={() => {
          //dispatch(clearTransfer(serviceType));
          if (SendUnSuccessBottomSheet.current)
            SendUnSuccessBottomSheet.current.snapTo(0);
        }}
        onPressCancel={() => {
          dispatch(clearTransfer(serviceType));
          if (SendUnSuccessBottomSheet.current)
            SendUnSuccessBottomSheet.current.snapTo(0);

          props.navigation.navigate('Accounts');
        }}
        isUnSuccess={true}
      />
    );
  };

  const renderSendUnSuccessHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          //  dispatch(clearTransfer(serviceType));
          if (SendUnSuccessBottomSheet.current)
            SendUnSuccessBottomSheet.current.snapTo(0);
        }}
      />
    );
  };

  const renderBitCoinInputText = () => {
    return (
      <TouchableOpacity
        style={{
          ...InputStyle,
          marginBottom: wp('1.5%'),
          marginTop: wp('1.5%'),
          flexDirection: 'row',
          width: wp('70%'),
          height: wp('13%'),
          backgroundColor: switchOn ? Colors.white : Colors.backgroundColor,
        }}
        // onPress={()=>setSwitchOn(!switchOn)}
      >
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
          />
        </View>
        {renderVerticalDivider()}
        <TextInput
          style={{
            ...styles.textBox,
            flex: 1,
            paddingLeft: 10,
            height: wp('13%'),
            width: wp('45%'),
          }}
          placeholder={
            switchOn ? 'Enter amount in sats' : 'Converted amount in sats'
          }
          editable={switchOn}
          value={bitcoinAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => {
            convertBitCoinToCurrency(value);
          }}
          placeholderTextColor={Colors.borderColor}
          onFocus={() => {
            setInputStyle(styles.inputBoxFocused);
          }}
          onBlur={() => {
            setInputStyle(styles.textBoxView);
          }}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === 'Backspace') {
              setTimeout(() => {
                setIsInvalidBalance(false);
              }, 10);
            }
          }}
        />
      </TouchableOpacity>
    );
  };
  const renderUSDInputText = () => {
    return (
      <TouchableOpacity
        style={{
          ...InputStyle1,
          marginBottom: wp('1.5%'),
          marginTop: wp('1.5%'),
          flexDirection: 'row',
          width: wp('70%'),
          height: wp('13%'),
          backgroundColor: !switchOn ? Colors.white : Colors.backgroundColor,
        }}
        // onPress={()=>setSwitchOn(!switchOn)}
      >
        <View style={styles.amountInputImage}>
          {currencyCode.includes(CurrencyCode) ? (
            setCurrencyCodeToImage(getCurrencyImageName(CurrencyCode), 'gray')
          ) : (
            <Image
              style={{
                ...styles.textBoxImage,
              }}
              source={getCurrencyImageByRegion(CurrencyCode, 'gray')}
            />
          )}
          {/* <Image
            style={styles.textBoxImage}
            source={require('../../assets/images/icons/dollar_grey.png')}
          /> */}
        </View>
        {renderVerticalDivider()}

        <TextInput
          style={{
            ...styles.textBox,
            paddingLeft: 10,
            flex: 1,
            height: wp('13%'),
            width: wp('45%'),
          }}
          editable={!switchOn}
          placeholder={
            switchOn
              ? 'Converted amount in ' + CurrencyCode
              : 'Enter amount in ' + CurrencyCode
          }
          value={currencyAmount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={(value) => {
            convertBitCoinToCurrency(value);
          }}
          placeholderTextColor={Colors.borderColor}
          onFocus={() => {
            setInputStyle1(styles.inputBoxFocused);
          }}
          onBlur={() => {
            setInputStyle1(styles.textBoxView);
          }}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === 'Backspace') {
              setTimeout(() => {
                setIsInvalidBalance(false);
              }, 10);
            }
          }}
        />
      </TouchableOpacity>
    );
  };

  const renderRemoveSelectedContents = useCallback(() => {
    if (
      Object.keys(removeItem).length != 0 &&
      removeItem.constructor === Object
    ) {
      return (
        <RemoveSelectedTransaction
          selectedContact={removeItem}
          onPressBack={() => {
            if (RemoveBottomSheet.current)
              (RemoveBottomSheet as any).current.snapTo(0);
          }}
          onPressDone={() => {
            setTimeout(() => {
              dispatch(removeTransferDetails(serviceType, removeItem));
            }, 2);
            (RemoveBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    }
  }, [removeItem]);

  const renderRemoveSelectedHeader = useCallback(() => {
    if (
      Object.keys(removeItem).length === 0 &&
      removeItem.constructor === Object
    ) {
      return (
        <ModalHeader
          onPressHeader={() => {
            if (RemoveBottomSheet.current)
              (RemoveBottomSheet as any).current.snapTo(0);
          }}
        />
      );
    }
  }, []);

  const renderAccountSelectionContents = useCallback(() => {
    return (
      <AccountSelectionModalContents
        RegularAccountBalance={RegularAccountBalance}
        SavingAccountBalance={SavingAccountBalance}
        onPressBack={() => {
          AccountSelectionBottomSheet.current.snapTo(0);
        }}
        onPressConfirm={(type) => {
          AccountSelectionBottomSheet.current.snapTo(0);
          setTimeout(() => {
            setServiceType(type);
          }, 2);
        }}
      />
    );
  }, [SavingAccountBalance, RegularAccountBalance]);

  const renderAccountSelectionHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        onPressHeader={() => {
          AccountSelectionBottomSheet.current.snapTo(0);
        }}
      />
    );
  }, []);

  const checkRecordsHavingPrice = () => {
    if (transfer.details && transfer.details.length) {
      for (let i = 0; i < transfer.details.length; i++) {
        if (
          !transfer.details[i].selectedContact.hasOwnProperty(
            'bitcoinAmount',
          ) &&
          !transfer.details[i].selectedContact.hasOwnProperty(
            'currencyAmount',
          ) &&
          selectedContact.id == transfer.details[i].selectedContact.id
        ) {
          dispatch(removeTransferDetails(serviceType, transfer.details[i]));
        }
      }
    }
  };

  const onConfirm = () => {
    dispatch(clearTransfer(serviceType, 'stage1'));
    setIsConfirmDisabled(false);
    if (transfer.details && transfer.details.length) {
      for (let i = 0; i < transfer.details.length; i++) {
        if (transfer.details[i].selectedContact.id == selectedContact.id) {
          dispatch(removeTransferDetails(serviceType, transfer.details[i]));
        }
      }
      dispatch(
        addTransferDetails(serviceType, {
          selectedContact,
          bitcoinAmount,
          currencyAmount,
          note,
        }),
      );
    }
    setTimeout(() => {
      handleTrasferST1();
    }, 10);
  };

  const getBalanceText = () => {
    let balance = spendableBalance;
    if (serviceType == REGULAR_ACCOUNT) balance = RegularAccountBalance;
    if (serviceType == SECURE_ACCOUNT) balance = SavingAccountBalance;
    return (
      <Text
        style={{
          color: Colors.blue,
          fontSize: RFValue(10),
          fontFamily: Fonts.FiraSansItalic,
        }}
      >
        {serviceType == TEST_ACCOUNT
          ? UsNumberFormat(balance)
          : switchOn
          ? UsNumberFormat(balance)
          : exchangeRates
          ? ((balance / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2)
          : null}
      </Text>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
      }}
    >
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
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
              checkRecordsHavingPrice();
              props.navigation.goBack();
            }}
            style={{
              height: 30,
              width: 30,
              justifyContent: 'center',
            }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Image
            source={
              serviceType == TEST_ACCOUNT
                ? require('../../assets/images/icons/icon_test.png')
                : serviceType == REGULAR_ACCOUNT
                ? require('../../assets/images/icons/icon_regular.png')
                : require('../../assets/images/icons/icon_secureaccount.png')
            }
            style={{ width: wp('10%'), height: wp('10%') }}
          />
          <View style={{ marginLeft: wp('2.5%') }}>
            <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              {serviceType == TEST_ACCOUNT
                ? 'Test Account'
                : serviceType == REGULAR_ACCOUNT
                ? 'Checking Account'
                : 'Savings Account'}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          alignSelf: 'center',
          width: wp('90%'),
          marginBottom: hp('2%'),
          marginTop: hp('2%'),
          flexDirection: 'row',
          paddingBottom: hp('1.5%'),
          paddingTop: hp('1%'),
        }}
      >
        <TouchableOpacity
          activeOpacity={10}
          onPress={() => {
            if (isFromAddressBook)
              AccountSelectionBottomSheet.current.snapTo(1);
          }}
          style={{ flexDirection: 'row', alignItems: 'flex-end' }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansItalic,
            }}
          >
            {getServiceTypeAccount()}
          </Text>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansItalic,
              lineHeight: 15,
              textAlign: 'center',
            }}
          >
            {' (Available to spend '}
            {getBalanceText()}
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(7),
                fontFamily: Fonts.FiraSansMediumItalic,
              }}
            >
              {serviceType == TEST_ACCOUNT
                ? ' t-sats )'
                : switchOn
                ? ' sats )'
                : ' ' + CurrencyCode.toLocaleLowerCase() + ' )'}
            </Text>
          </Text>
          {isFromAddressBook && (
            <Ionicons
              style={{ marginLeft: 5 }}
              name={isOpen ? 'ios-arrow-up' : 'ios-arrow-down'}
              size={RFValue(15)}
              color={Colors.blue}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={{ width: wp('85%'), alignSelf: 'center' }}>
        {transfer.details && transfer.details.length > 0 ? (
          <ScrollView horizontal={true}>
            {transfer.details.map((item) => renderMultipleContacts(item))}
          </ScrollView>
        ) : null}
      </View>
      <View
        style={{
          alignSelf: 'center',
          width: wp('90%'),
          borderBottomWidth: 1,
          borderColor: Colors.borderColor,
          marginBottom: hp('1%'),
          marginTop: hp('2%'),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <View
          style={{ paddingLeft: 20, paddingRight: 20, paddingTop: wp('5%') }}
        >
          <ScrollView>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                {renderUSDInputText()}
                {isInvalidBalance ? (
                  <View style={{ marginLeft: 'auto' }}>
                    <Text style={styles.errorText}>Insufficient balance</Text>
                  </View>
                ) : null}
                {renderBitCoinInputText()}
              </View>
              <View
                style={{
                  marginLeft: 'auto',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ToggleSwitch
                  currencyCodeValue={CurrencyCode}
                  onpress={async () => {
                    setSwitchOn(!switchOn);
                    let temp = !switchOn ? 'true' : '';
                    await AsyncStorage.setItem('currencyToggleValue', temp);
                  }}
                  toggle={switchOn}
                  transform={true}
                />
              </View>
            </View>
            {serviceType == TEST_ACCOUNT ? (
              <View
                style={{
                  marginTop: wp('1.5%'),
                  marginBottom: -25,
                  padding: -20,
                  marginLeft: -20,
                  marginRight: -20,
                }}
              >
                <BottomInfoBox
                  title={'Value of your test-sats'}
                  infoText={
                    'The corresponding ' +
                    CurrencySymbol +
                    ' value shown here is for illustration only. Test-sats have no ' +
                    CurrencySymbol +
                    ' value'
                  }
                />
              </View>
            ) : null}
            <View
              style={{
                ...InputStyleNote,
                marginBottom: wp('1.5%'),
                marginTop: wp('1.5%'),
                flexDirection: 'row',
                height: wp('13%'),
              }}
            >
              <TextInput
                style={{
                  ...styles.textBox,
                  paddingLeft: 15,
                  flex: 1,
                  height: wp('13%'),
                }}
                returnKeyLabel="Done"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                placeholder={'Add a Note ( Optional )'}
                value={note}
                onChangeText={setNote}
                placeholderTextColor={Colors.borderColor}
                onFocus={() => {
                  setInputStyleNote(styles.inputBoxFocused);
                }}
                onBlur={() => {
                  setInputStyleNote(styles.textBoxView);
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: hp('3%'),
                marginBottom: hp('5%'),
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  onConfirm();
                }}
                disabled={isConfirmDisabled || loading.transfer}
                style={{
                  ...styles.confirmButtonView,
                  backgroundColor: Colors.blue,
                  elevation: 10,
                  shadowColor: Colors.shadowBlue,
                  shadowOpacity: 1,
                  shadowOffset: { width: 15, height: 15 },
                  opacity: isConfirmDisabled ? 0.5 : 1,
                }}
              >
                {/* {loading.transfer && !isInvalidBalance ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : ( */}
                {loading.transfer ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.buttonText}>{'Confirm & Proceed'}</Text>
                )}
                {/* )} */}
              </TouchableOpacity>
              {serviceType != 'TEST_ACCOUNT' ? (
                <TouchableOpacity
                  style={{
                    ...styles.confirmButtonView,
                    width: wp('30%'),
                    marginLeft: 10,
                  }}
                  disabled={isConfirmDisabled || loading.transfer}
                  onPress={() => {
                    // dispatch(clearTransfer(serviceType));
                    // if (getServiceType) {
                    //   getServiceType(serviceType);
                    // }
                    if (transfer.details && transfer.details.length) {
                      for (let i = 0; i < transfer.details.length; i++) {
                        if (
                          transfer.details[i].selectedContact.id ==
                          selectedContact.id
                        ) {
                          dispatch(
                            removeTransferDetails(
                              serviceType,
                              transfer.details[i],
                            ),
                          );
                        }
                      }
                      dispatch(
                        addTransferDetails(serviceType, {
                          selectedContact,
                          bitcoinAmount,
                          currencyAmount,
                          note,
                        }),
                      );
                      props.navigation.goBack();
                    }
                  }}
                >
                  <Text style={{ ...styles.buttonText, color: Colors.blue }}>
                    Add Recipient
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={RemoveBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('50%') : hp('50%'),
        ]}
        renderContent={renderRemoveSelectedContents}
        renderHeader={renderRemoveSelectedHeader}
      />
      <BottomSheet
        onCloseStart={() => {
          SendUnSuccessBottomSheet.current.snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={SendUnSuccessBottomSheet}
        snapPoints={[-50, hp('65%')]}
        renderContent={renderSendUnSuccessContents}
        renderHeader={renderSendUnSuccessHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={AccountSelectionBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('55%') : hp('60%'),
        ]}
        renderContent={renderAccountSelectionContents}
        renderHeader={renderAccountSelectionHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
    marginRight: 10,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginBottom: hp('0.5%'),
    width: wp('90%'),
  },
  textBoxView: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  inputBoxFocused: {
    borderRadius: 10,
    elevation: 10,
    borderColor: Colors.borderColor,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
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
  circleShapeView: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('14%') / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  closeMarkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    elevation: 10,
  },
});
