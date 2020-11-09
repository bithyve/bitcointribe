import React, { Component } from 'react';
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
  FlatList,
} from 'react-native';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ToggleSwitch from '../../../components/ToggleSwitch';
import {
  transferST1,
  addTransferDetails,
  removeTransferDetails,
  clearTransfer,
  setAverageTxFee,
} from '../../../store/actions/accounts';
import { currencyKindSet } from '../../../store/actions/preferences';
import { syncTrustedChannels } from '../../../store/actions/trustedContacts';
import { UsNumberFormat } from '../../../common/utilities';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../../components/ModalHeader';
import RemoveSelectedTransaction from '../RemoveSelectedTrasaction';
import SendConfirmationContent from '../SendConfirmationContent';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TRUSTED_CONTACTS,
  TEST_ACCOUNT,
  DONATION_ACCOUNT,
} from '../../../common/constants/serviceTypes';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AccountSelectionModalContents from '../AccountSelectionModalContents';
import SmallHeaderModal from '../../../components/SmallHeaderModal';
import BottomInfoBox from '../../../components/BottomInfoBox';
import FiatCurrencies from '../../../common/FiatCurrencies';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrencyImageByRegion } from '../../../common/CommonFunctions/index';
import { getCurrencyImageName } from '../../../common/CommonFunctions/index';
import config from '../../../bitcoin/HexaConfig';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation';
import idx from 'idx';
import TrustedContactsService from '../../../bitcoin/services/TrustedContactsService';
import CurrencyKind from '../../../common/data/enums/CurrencyKind';
import SelectedRecipientCarouselItem from '../../../components/send/SelectedRecipientCarouselItem';
import { RecipientDescribing, ContactRecipientDescribing, AccountRecipientDescribing, makeContactRecipientDescription, makeSubAccountRecipientDescription } from '../../../common/data/models/interfaces/RecipientDescribing';


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


interface SendToContactPropsTypes {
  navigation: any;
  accountsState: any;
  transferST1: any;
  removeTransferDetails: any;
  clearTransfer: any;
  addTransferDetails: any;
  currencyCode: any;
  averageTxFees: any;
  setAverageTxFee: any;
  trustedContactsService: TrustedContactsService;
  syncTrustedChannels: any;
  currencyKind: CurrencyKind;
  currencyKindSet: (kind: CurrencyKind) => void;
}

interface SendToContactStateTypes {
  selectedRecipients: any[];
  RegularAccountBalance: any;
  SavingAccountBalance: any;
  isFromAddressBook: any;
  isOpen: boolean;
  exchangeRates: any[];
  selectedContact: any;
  serviceType: string;
  averageTxFees: any;
  spendableBalance: any;
  derivativeAccountDetails: { type: string; number: number };
  sweepSecure: any;
  removeItem: any;
  CurrencyCode: string;
  CurrencySymbol: string;
  bitcoinAmount: string;
  donationId: string;
  currencyAmount: string;
  isConfirmDisabled: boolean;
  note: string;
  InputStyle: any;
  InputStyle1: any;
  InputStyleNote: any;
  isInvalidBalance: boolean;
  recipients: any[];
  spendableBalances: any;
  isSendMax: boolean;
  prefersBitcoin: boolean;
}

class SendToContact extends Component<
  SendToContactPropsTypes,
  SendToContactStateTypes
  > {
  removeItemBottomSheetRef = React.createRef<BottomSheet>();

  constructor(props) {
    super(props);

    const accountKind = this.props.navigation.getParam('serviceType');

    this.state = {
      selectedRecipients: this.props
        .accountsState[accountKind]
        .transfer
        .details
        .map(item => item.selectedContact),
      RegularAccountBalance: 0,
      SavingAccountBalance: 0,
      isFromAddressBook: this.props.navigation.getParam('isFromAddressBook')
        ? this.props.navigation.getParam('isFromAddressBook')
        : null,
      isOpen: false,
      exchangeRates: null,
      selectedContact: this.props.navigation.getParam('selectedContact'),
      serviceType: accountKind,
      averageTxFees: this.props.navigation.getParam('averageTxFees'),
      spendableBalance: this.props.navigation.getParam('spendableBalance'),
      derivativeAccountDetails: this.props.navigation.getParam(
        'derivativeAccountDetails',
      ),
      sweepSecure: this.props.navigation.getParam('sweepSecure'),
      removeItem: {},
      CurrencyCode: 'USD',
      CurrencySymbol: '$',
      bitcoinAmount: props.navigation.getParam('bitcoinAmount')
        ? props.navigation.getParam('bitcoinAmount')
        : '',
      donationId: props.navigation.getParam('donationId'),
      currencyAmount: '',
      isConfirmDisabled: true,
      note: '',
      InputStyle: styles.textBoxView,
      InputStyle1: styles.textBoxView,
      InputStyleNote: styles.textBoxView,
      isInvalidBalance: false,
      recipients: [],
      spendableBalances: {
        testBalance: 0,
        regularBalance: 0,
        secureBalance: 0,
      },
      isSendMax: false,
      prefersBitcoin: this.props.currencyKind === CurrencyKind.BITCOIN,
    };
  }

  componentDidMount = () => {
    const { accountsState, trustedContactsService } = this.props;

    const {
      bitcoinAmount,
      averageTxFees,
      serviceType,
      spendableBalance,
      selectedContact,
    } = this.state;
    // syncs trusted channel for TC and takes appropriate action
    if (selectedContact.displayedName) {
      const contactName = `${selectedContact.displayedName}`
        .toLowerCase()
        .trim();
      const contacts = {
        [contactName]: trustedContactsService.tc.trustedContacts[contactName],
      };
      this.props.syncTrustedChannels(contacts);
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      this.checkRecordsHavingPrice();
    });

    this.setState(
      { exchangeRates: accountsState && accountsState.exchangeRates },
      () => {
        if (bitcoinAmount) {
          const currency = this.state.exchangeRates
            ? (
              (parseInt(bitcoinAmount) / 1e8) *
              this.state.exchangeRates[this.state.CurrencyCode].last
            ).toFixed(2)
            : 0;

          this.setState({
            currencyAmount: currency.toString(),
          });
        }
      },
    );
    this.getAccountBalances();
    this.setCurrencyCodeFromAsync();
    if (!averageTxFees) this.storeAverageTxFees();

    if (serviceType == REGULAR_ACCOUNT) {
      this.setState({ RegularAccountBalance: spendableBalance });
    } else if (serviceType == SECURE_ACCOUNT) {
      this.setState({ SavingAccountBalance: spendableBalance });
    }

    this.updateSpendableBalance();
    this.amountCalculation();
  };

  updateSpendableBalance = () => {
    const { serviceType, spendableBalances } = this.state;
    if (this.state.derivativeAccountDetails) return;
    if (serviceType === TEST_ACCOUNT) {
      this.setState({ spendableBalance: spendableBalances.testBalance });
    } else if (serviceType == REGULAR_ACCOUNT) {
      this.setState({ spendableBalance: spendableBalances.regularBalance });
    } else if (serviceType == SECURE_ACCOUNT) {
      this.setState({ spendableBalance: spendableBalances.secureBalance });
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.accountsState !== this.props.accountsState) {
      this.getAccountBalances();
    }

    if (
      prevProps.accountsState[this.state.serviceType].service !==
      this.props.accountsState[this.state.serviceType].service
    ) {
      this.storeAverageTxFees();
    }

    if (prevState.spendableBalance !== this.state.spendableBalance) {
      if (this.state.serviceType == REGULAR_ACCOUNT) {
        this.setState({ RegularAccountBalance: this.state.spendableBalance });
      } else if (this.state.serviceType == SECURE_ACCOUNT) {
        this.setState({ SavingAccountBalance: this.state.spendableBalance });
      }
      this.updateSpendableBalance();
    }

    if (prevState.serviceType !== this.state.serviceType) {
      this.updateSpendableBalance();
    }

    if (
      prevProps.accountsState.exchangeRates !==
      this.props.accountsState.exchangeRates
    ) {
      this.setState({
        exchangeRates:
          this.props.accountsState && this.props.accountsState.exchangeRates,
      });
    }

    if (
      prevState.bitcoinAmount !== this.state.bitcoinAmount ||
      prevState.currencyAmount !== this.state.currencyAmount ||
      prevState.spendableBalance !== this.state.spendableBalance ||
      prevProps.accountsState[this.state.serviceType].transfer.details
        .length !==
      this.props.accountsState[this.state.serviceType].transfer.details.length
    ) {
      this.amountCalculation();
    }

    if (
      prevProps.accountsState[this.state.serviceType].transfer !==
      this.props.accountsState[this.state.serviceType].transfer
    ) {
      this.sendConfirmation();
    }

    if (
      prevProps.trustedContactsService !== this.props.trustedContactsService &&
      this.state.selectedContact.displayedName
    ) {
      let contactRemoved = true;
      const selectedContactName = `${this.state.selectedContact.displayedName}`
        .toLowerCase()
        .trim();
      Object.keys(this.props.trustedContactsService.tc.trustedContacts).forEach(
        (contactName) => {
          if (contactName === selectedContactName) contactRemoved = false;
        },
      );

      if (contactRemoved) {
        Alert.alert(
          'F&F contact removed',
          `You no longer seem to be a F&F contact for ${this.state.selectedContact.displayedName}`,
          [
            {
              text: 'Okay',
              onPress: () => {
                this.props.navigation.goBack();
              },
            },
          ],
        );
        const { serviceType } = this.state;
        const { accountsState } = this.props;

        const toRemove =
          accountsState[serviceType].transfer.details[
          accountsState[serviceType].transfer.details.length - 1
          ];

        this.props.removeTransferDetails(serviceType, toRemove);
      }
    }
  };

  getAccountBalances = () => {
    const { accountsState } = this.props;

    const testBalance = accountsState[TEST_ACCOUNT].service
      ? accountsState[TEST_ACCOUNT].service.hdWallet.balances.balance
      : // +  accountsState[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      0;

    let regularBalance = accountsState[REGULAR_ACCOUNT].service
      ? accountsState[REGULAR_ACCOUNT].service.hdWallet.balances.balance
      : // +  accountsState[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      0;

    // regular derivative accounts
    for (const dAccountType of config.DERIVATIVE_ACC_TO_SYNC) {
      const derivativeAccount =
        accountsState[REGULAR_ACCOUNT].service.hdWallet.derivativeAccounts[
        dAccountType
        ];
      if (derivativeAccount && derivativeAccount.instance.using) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          if (derivativeAccount[accountNumber].balances) {
            regularBalance += derivativeAccount[accountNumber].balances.balance;
            // + derivativeAccount[accountNumber].balances.unconfirmedBalance;
          }
        }
      }
    }

    let secureBalance = accountsState[SECURE_ACCOUNT].service
      ? accountsState[SECURE_ACCOUNT].service.secureHDWallet.balances.balance
      : // + accountsState[SECURE_ACCOUNT].service.secureHDWallet.balances
      //      .unconfirmedBalance
      0;

    // secure derivative accounts
    for (const dAccountType of config.DERIVATIVE_ACC_TO_SYNC) {
      if (dAccountType === TRUSTED_CONTACTS) continue;

      const derivativeAccount =
        accountsState[SECURE_ACCOUNT].service.secureHDWallet.derivativeAccounts[
        dAccountType
        ];
      if (derivativeAccount && derivativeAccount.instance.using) {
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
            secureBalance += derivativeAccount[accountNumber].balances.balance;
            // +derivativeAccount[accountNumber].balances.unconfirmedBalance;
          }
        }
      }
    }
    this.setState({
      spendableBalances: {
        testBalance,
        regularBalance,
        secureBalance,
      },
    });
  };

  setCurrencyCodeFromAsync = async () => {
    // await AsyncStorage.getItem(
    //   'currencyToggleValue',
    // );
    let currencyCodeTmp = this.props.currencyCode;
    //await AsyncStorage.getItem('currencyCode');
    this.setState({
      CurrencyCode: currencyCodeTmp ? currencyCodeTmp : 'USD',
    });
    for (let i = 0; i < FiatCurrencies.length; i++) {
      if (FiatCurrencies[i].code.includes(currencyCodeTmp)) {
        this.setState({ CurrencySymbol: FiatCurrencies[i].symbol });
      }
    }
  };

  checkRecordsHavingPrice = () => {
    const { accountsState, removeTransferDetails } = this.props;
    const { serviceType, selectedContact } = this.state;
    if (
      accountsState[serviceType].transfer.details &&
      accountsState[serviceType].transfer.details.length
    ) {
      for (
        let i = 0;
        i < accountsState[serviceType].transfer.details.length;
        i++
      ) {
        if (
          !accountsState[serviceType].transfer.details[
            i
          ].selectedContact.hasOwnProperty('bitcoinAmount') &&
          !accountsState[serviceType].transfer.details[
            i
          ].selectedContact.hasOwnProperty('currencyAmount') &&
          selectedContact.id ==
          accountsState[serviceType].transfer.details[i].selectedContact.id
        ) {
          removeTransferDetails(
            serviceType,
            accountsState[serviceType].transfer.details[i],
          );
        }
      }
    }
  };

  convertBitCoinToCurrency = (value) => {
    const { prefersBitcoin, exchangeRates, CurrencyCode } = this.state;
    let temp = value;
    if (prefersBitcoin) {
      let result = exchangeRates
        ? ((value / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2)
        : 0;
      this.setState({ bitcoinAmount: temp, currencyAmount: result.toString() });
    } else {
      let currency = exchangeRates
        ? value / exchangeRates[CurrencyCode].last
        : 0;
      currency = currency < 1 ? currency * 1e8 : currency;
      this.setState({
        currencyAmount: temp,
        bitcoinAmount: currency.toFixed(0),
      });
    }
  };

  storeAverageTxFees = async () => {
    const { accountsState } = this.props;
    const { serviceType } = this.state;
    const storedAverageTxFees = this.props.averageTxFees;
    const instance =
      accountsState[serviceType].service.hdWallet ||
      accountsState[serviceType].service.secureHDWallet;
    // const storedAverageTxFees = await AsyncStorage.getItem(
    //   'storedAverageTxFees',
    // );
    const network = [REGULAR_ACCOUNT, SECURE_ACCOUNT].includes(serviceType)
      ? 'MAINNET'
      : 'TESTNET';

    if (storedAverageTxFees && storedAverageTxFees[network]) {
      const { averageTxFees, lastFetched } = storedAverageTxFees[network];
      if (Date.now() - lastFetched < 1800000 && instance.feeRates) {
        this.setState({ averageTxFees: averageTxFees });
        return;
      } // maintaining a half an hour difference b/w fetches
    }

    const averageTxFees = await instance.averageTransactionFee();
    this.setState({ averageTxFees: averageTxFees });
    this.props.setAverageTxFee({
      ...storedAverageTxFees,
      [network]: {
        averageTxFees,
        lastFetched: Date.now(),
      },
    });
  };

  amountCalculation = () => {
    const {
      bitcoinAmount,
      currencyAmount,
      serviceType,
      spendableBalance,
      selectedContact,
    } = this.state;
    const { accountsState } = this.props;
    if (
      bitcoinAmount &&
      currencyAmount &&
      accountsState[serviceType].transfer.details.length
    ) {
      let amountStacked = 0;
      accountsState[serviceType].transfer.details.forEach((recipient) => {
        if (
          recipient.bitcoinAmount &&
          recipient.selectedContact.id !== selectedContact.id
        ) {
          amountStacked += parseInt(recipient.bitcoinAmount);
        }
      });
      if (spendableBalance - amountStacked < Number(bitcoinAmount)) {
        this.setState({ isInvalidBalance: true, isConfirmDisabled: true });
      } else
        this.setState({ isConfirmDisabled: false, isInvalidBalance: false });
    } else {
      this.setState({ isConfirmDisabled: true });
      if (!accountsState[serviceType].transfer.details.length) {
        this.props.navigation.goBack();
      }
    }
  };

  sendConfirmation = () => {
    const {
      recipients,
      serviceType,
      sweepSecure,
      spendableBalance,
      averageTxFees,
      isSendMax,
      derivativeAccountDetails,
      donationId,
    } = this.state;
    const { accountsState } = this.props;
    if (!recipients.length) return;
    if (accountsState[serviceType].transfer.stage1.failed) {
      this.setState({ isConfirmDisabled: false });
      setTimeout(() => {
        (this.refs.SendUnSuccessBottomSheet as any).snapTo(1);
      }, 2);
    } else if (accountsState[serviceType].transfer.executed === 'ST1') {
      if (accountsState[serviceType].transfer.details.length) {
        this.props.navigation.navigate('SendConfirmation', {
          serviceType,
          sweepSecure,
          spendableBalance,
          recipients,
          averageTxFees,
          isSendMax,
          derivativeAccountDetails,
          donationId,
        });
      }
    }
  };

  sendMaxHandler = () => {
    const {
      selectedContact,
      averageTxFees,
      serviceType,
      spendableBalance,
      prefersBitcoin,
    } = this.state;
    const { accountsState } = this.props;

    const recipientsList = [];
    let amountStacked = 0;
    accountsState[serviceType].transfer.details.forEach((instance) => {
      if (
        instance.bitcoinAmount &&
        instance.selectedContact.id !== selectedContact.id
      ) {
        amountStacked += parseInt(instance.bitcoinAmount);
        recipientsList.push(instance);
      }
    });

    const { fee } = this.props.accountsState[
      serviceType
    ].service.calculateSendMaxFee(
      recipientsList.length + 1, // +1 for the current instance
      averageTxFees,
      this.state.derivativeAccountDetails,
    );

    if (spendableBalance) {
      const max = spendableBalance - amountStacked - fee;
      if (max <= 0) {
        // fee greater than remaining spendable(spendable - amountStacked)
        this.setState({ isInvalidBalance: true });
        return;
      }
      this.setState(
        {
          prefersBitcoin: !prefersBitcoin ? true : prefersBitcoin,
          isSendMax: true,
        },
        () => {
          this.convertBitCoinToCurrency(max.toString());
        },
      );
    }
  };

  handleTrasferST1 = () => {
    const {
      selectedContact,
      bitcoinAmount,
      currencyAmount,
      note,
      serviceType,
      averageTxFees,
    } = this.state;
    const { accountsState, transferST1 } = this.props;

    const recipients = [];
    const currentRecipientInstance = {
      selectedContact,
      bitcoinAmount,
      currencyAmount,
      note,
    };

    const recipientsList = [];
    accountsState[serviceType].transfer.details.forEach((instance) => {
      if (
        instance.bitcoinAmount &&
        instance.selectedContact.id !== selectedContact.id
      ) {
        recipientsList.push(instance);
      } else if (
        instance.bitcoinAmount &&
        instance.selectedContact.id === selectedContact.id
      ) {
        if (config.EJECTED_ACCOUNTS.includes(selectedContact.id)) {
          if (
            instance.selectedContact.account_number ===
            selectedContact.account_number &&
            instance.selectedContact.type === selectedContact.type
          ) {
            // skip (current donation instance), get added as currentRecipientInstance
          } else {
            recipientsList.push(instance);
          }
        }
      }
    });
    recipientsList.push(currentRecipientInstance);
    const instance =
      accountsState[serviceType].service.hdWallet ||
      accountsState[serviceType].service.secureHDWallet;

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
        if (
          recipientId === REGULAR_ACCOUNT ||
          recipientId === SECURE_ACCOUNT ||
          config.EJECTED_ACCOUNTS.includes(recipientId)
        ) {
          // recipient: account
          recipients.push({
            id: recipientId,
            type: item.selectedContact.type, // underlying accountType (used in case of derv acc(here donation))
            accountNumber: item.selectedContact.account_number, // donation acc number
            address: null,
            amount: parseInt(item.bitcoinAmount),
          });
        } else {
          // recipient: trusted contact
          const contactName = `${item.selectedContact.displayedName}`
            .toLowerCase()
            .trim();
          recipients.push({
            id: contactName,
            address: null,
            amount: parseInt(item.bitcoinAmount),
          });
        }
      }
    });
    this.setState({ recipients: recipients });
    transferST1(
      serviceType,
      recipients,
      averageTxFees,
      this.state.derivativeAccountDetails,
    );
  };

  onConfirm = () => {
    const {
      clearTransfer,
      accountsState,
      removeTransferDetails,
      addTransferDetails,
    } = this.props;

    const { bitcoinAmount, currencyAmount, note } = this.state;
    const { serviceType, selectedContact } = this.state;
    clearTransfer(serviceType, 'stage1');
    if (
      accountsState[serviceType].transfer.details &&
      accountsState[serviceType].transfer.details.length
    ) {
      for (
        let i = 0;
        i < accountsState[serviceType].transfer.details.length;
        i++
      ) {
        if (
          accountsState[serviceType].transfer.details[i].selectedContact.id ==
          selectedContact.id
        ) {
          if (config.EJECTED_ACCOUNTS.includes(selectedContact.id)) {
            if (
              accountsState[serviceType].transfer.details[i].selectedContact
                .account_number === selectedContact.account_number &&
              accountsState[serviceType].transfer.details[i].selectedContact
                .type === selectedContact.type
            )
              removeTransferDetails(
                serviceType,
                accountsState[serviceType].transfer.details[i],
              );
          } else {
            removeTransferDetails(
              serviceType,
              accountsState[serviceType].transfer.details[i],
            );
          }
        }
      }
      addTransferDetails(serviceType, {
        selectedContact,
        bitcoinAmount,
        currencyAmount,
        note,
      });
    }
    setTimeout(() => {
      this.handleTrasferST1();
    }, 10);
  };

  getBalanceText = () => {
    const {
      serviceType,
      spendableBalance,
      prefersBitcoin,
      exchangeRates,
      CurrencyCode,
    } = this.state;

    return serviceType == TEST_ACCOUNT
      ? UsNumberFormat(spendableBalance)
      : prefersBitcoin
        ? UsNumberFormat(spendableBalance)
        : exchangeRates
          ? ((spendableBalance / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2)
          : null;
  };

  getIsMinimumAllowedStatus = () => {
    const { bitcoinAmount } = this.state;
    return bitcoinAmount.length > 0 &&
      Number(bitcoinAmount) >= 0 &&
      Number(bitcoinAmount) < 550
      ? true
      : false;
  };

  render() {
    const {
      selectedRecipients,
      isFromAddressBook,
      isOpen,
      selectedContact,
      serviceType,
      removeItem,
      prefersBitcoin,
      CurrencyCode,
      CurrencySymbol,
      bitcoinAmount,
      currencyAmount,
      isConfirmDisabled,
      isSendMax,
      note,
      InputStyle,
      InputStyle1,
      InputStyleNote,
      isInvalidBalance,
      spendableBalances,
    } = this.state;

    const {
      accountsState,
      removeTransferDetails,
      clearTransfer,
      addTransferDetails,
    } = this.props;

    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

        <View style={styles.modalHeaderTitleView}>
          <View style={styles.view}>
            <TouchableOpacity
              onPress={() => {
                this.checkRecordsHavingPrice();
                this.props.navigation.goBack();
              }}
              style={styles.backArrow}
              hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Image
              source={
                this.state.derivativeAccountDetails &&
                  this.state.derivativeAccountDetails.type === DONATION_ACCOUNT
                  ? require('../../../assets/images/icons/icon_donation_hexa.png')
                  : serviceType == TEST_ACCOUNT
                    ? require('../../../assets/images/icons/icon_test.png')
                    : serviceType == REGULAR_ACCOUNT
                      ? require('../../../assets/images/icons/icon_regular.png')
                      : require('../../../assets/images/icons/icon_secureaccount.png')
              }
              style={{ width: wp('10%'), height: wp('10%') }}
            />
            <View style={{ marginLeft: wp('2.5%') }}>
              <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
              <Text style={styles.sendText}>Enter amount/ details</Text>
            </View>
          </View>
        </View>

        <View style={styles.availableToSpendView}>
          <TouchableOpacity
            activeOpacity={10}
            onPress={() => {
              if (isFromAddressBook)
                (this.refs.AccountSelectionBottomSheet as any).snapTo(1);
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
              {this.state.derivativeAccountDetails &&
                this.state.derivativeAccountDetails.type === DONATION_ACCOUNT
                ? 'Donation Account'
                : serviceType == 'TEST_ACCOUNT'
                  ? 'Test Account'
                  : serviceType == 'SECURE_ACCOUNT'
                    ? 'Savings Account'
                    : serviceType == 'REGULAR_ACCOUNT'
                      ? 'Checking Account'
                      : ''}
            </Text>
            <Text style={styles.availableToSpendText}>
              {' (Available to spend '}
              <Text style={styles.balanceText}>{this.getBalanceText()}</Text>
              <Text style={styles.textTsats}>
                {serviceType == TEST_ACCOUNT
                  ? ' t-sats )'
                  : prefersBitcoin
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

        <View>
          <FlatList
            horizontal
            contentContainerStyle={styles.selectedRecipientsListContentContainer}
            data={selectedRecipients}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: -24, y: 0 }}
            renderItem={({ item, index }: { item: unknown, index: number }) => {
              let recipient: RecipientDescribing;

              // 🔑 This seems to be the way the backend is distinguishing between
              // accounts and contacts.
              if (item.account_name != null) {
                // 🔑 This seems to be the way the backend is defining the "account kind".
                const accountKind = {
                  'Checking Account': REGULAR_ACCOUNT,
                  'Savings Account': SECURE_ACCOUNT,
                  'Test Account': TEST_ACCOUNT,
                  'Donation Account': DONATION_ACCOUNT,
                }[item.account_name || 'Checking Account'];

                recipient = makeSubAccountRecipientDescription(item, accountKind);
              } else {
                recipient = makeContactRecipientDescription(item);
              }

              return (
                <SelectedRecipientCarouselItem
                  containerStyle={{ marginHorizontal: 12 }}
                  recipient={recipient}
                  onRemove={() => {
                    this.setState(
                      { removeItem: accountsState[serviceType].transfer.details[index] },
                      () => {
                        this.removeItemBottomSheetRef.current?.snapTo(1);
                      }
                    );
                  }}
                />
              );
            }}
          />
        </View>

        <View style={styles.dividerView} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
          enabled
        >
          <View style={styles.parentView}>
            <ScrollView>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <TouchableOpacity
                    style={{
                      ...InputStyle1,
                      marginBottom: wp('1.5%'),
                      marginTop: wp('1.5%'),
                      flexDirection: 'row',
                      width: wp('70%'),
                      height: wp('13%'),
                      alignItems: 'center',
                      backgroundColor: !prefersBitcoin
                        ? Colors.white
                        : Colors.backgroundColor,
                    }}
                    onPress={this.sendMaxHandler}
                  >
                    <View style={styles.amountInputImage}>
                      {currencyCode.includes(CurrencyCode) ? (
                        <View style={styles.currencyImageView}>
                          <MaterialCommunityIcons
                            name={getCurrencyImageName(CurrencyCode)}
                            color={Colors.currencyGray}
                            size={wp('6%')}
                          />
                        </View>
                      ) : (
                          <Image
                            style={{
                              ...styles.textBoxImage,
                            }}
                            source={getCurrencyImageByRegion(
                              CurrencyCode,
                              'gray',
                            )}
                          />
                        )}
                    </View>
                    <View style={styles.convertText} />
                    <TextInput
                      style={{
                        ...styles.textBox,
                        paddingLeft: 10,
                        flex: 1,
                        height: wp('13%'),
                        width: wp('45%'),
                      }}
                      editable={!prefersBitcoin}
                      placeholder={
                        prefersBitcoin
                          ? 'Converted amount in ' + CurrencyCode
                          : 'Enter amount in ' + CurrencyCode
                      }
                      value={currencyAmount}
                      returnKeyLabel="Done"
                      returnKeyType="done"
                      keyboardType={'numeric'}
                      onChangeText={(value) => {
                        if (this.state.isSendMax) {
                          this.setState({ isSendMax: false });
                        }
                        this.convertBitCoinToCurrency(value);
                      }}
                      placeholderTextColor={Colors.borderColor}
                      onFocus={() => {
                        this.setState({ InputStyle1: styles.inputBoxFocused });
                      }}
                      onBlur={() => {
                        this.setState({ InputStyle1: styles.textBoxView });
                      }}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            this.setState({ isInvalidBalance: false });
                          }, 10);
                        }
                      }}
                    />
                    {!prefersBitcoin && (
                      <Text
                        style={{
                          color: Colors.blue,
                          textAlign: 'center',
                          paddingHorizontal: 10,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansItalic,
                        }}
                      >
                        Send Max
                      </Text>
                    )}
                  </TouchableOpacity>

                  {isInvalidBalance ? (
                    <View style={{ marginLeft: 'auto' }}>
                      <Text style={styles.errorText}>Insufficient balance</Text>
                    </View>
                  ) : null}

                  {this.getIsMinimumAllowedStatus() ? (
                    <View style={{ marginLeft: 'auto' }}>
                      <Text style={styles.errorText}>
                        Enter more than 550 sats (min allowed)
                      </Text>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={{
                      ...InputStyle,
                      marginBottom: wp('1.5%'),
                      marginTop: wp('1.5%'),
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: wp('70%'),
                      height: wp('13%'),
                      backgroundColor: prefersBitcoin
                        ? Colors.white
                        : Colors.backgroundColor,
                    }}
                    onPress={this.sendMaxHandler}
                  >
                    <View style={styles.amountInputImage}>
                      <Image
                        style={styles.textBoxImage}
                        source={require('../../../assets/images/icons/icon_bitcoin_gray.png')}
                      />
                    </View>
                    <View style={styles.enterAmountView} />
                    <TextInput
                      style={{
                        ...styles.textBox,
                        flex: 1,
                        paddingLeft: 10,
                        height: wp('13%'),
                        width: wp('45%'),
                      }}
                      placeholder={
                        prefersBitcoin
                          ? serviceType == TEST_ACCOUNT
                            ? 'Enter amount in t-sats'
                            : 'Enter amount in sats'
                          : serviceType == TEST_ACCOUNT
                            ? 'Converted amount in t-sats'
                            : 'Converted amount in sats'
                      }
                      editable={prefersBitcoin}
                      value={bitcoinAmount}
                      returnKeyLabel="Done"
                      returnKeyType="done"
                      keyboardType={'numeric'}
                      onChangeText={(value) => {
                        if (this.state.isSendMax) {
                          this.setState({ isSendMax: false });
                        }
                        this.convertBitCoinToCurrency(value);
                      }}
                      placeholderTextColor={Colors.borderColor}
                      onFocus={() => {
                        this.setState({ InputStyle: styles.inputBoxFocused });
                      }}
                      onBlur={() => {
                        this.setState({ InputStyle: styles.textBoxView });
                      }}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            this.setState({ isInvalidBalance: false });
                          }, 10);
                        }
                      }}
                    />
                    {prefersBitcoin && (
                      <Text
                        style={{
                          color: Colors.blue,
                          textAlign: 'center',
                          paddingHorizontal: 10,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansItalic,
                        }}
                      >
                        Send Max
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleSwitchView}>
                  <ToggleSwitch
                    currencyCodeValue={CurrencyCode}
                    onpress={() => {
                      const newValue = prefersBitcoin
                        ? CurrencyKind.FIAT
                        : CurrencyKind.BITCOIN;

                      this.setState(
                        { prefersBitcoin: newValue == CurrencyKind.BITCOIN },
                        () => {
                          this.props.currencyKindSet(newValue);
                        },
                      );
                    }}
                    toggle={prefersBitcoin}
                    transform={true}
                  />
                </View>
              </View>

              {serviceType == TEST_ACCOUNT ? (
                <View style={styles.bottomInfoView}>
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
              {this.state.donationId ? (
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
                      Platform.OS == 'ios'
                        ? 'ascii-capable'
                        : 'visible-password'
                    }
                    placeholder={'Send a short note to the donee'}
                    value={note}
                    onChangeText={(text) => this.setState({ note: text })}
                    placeholderTextColor={Colors.borderColor}
                    onFocus={() => {
                      this.setState({ InputStyleNote: styles.inputBoxFocused });
                    }}
                    onBlur={() => {
                      this.setState({ InputStyleNote: styles.textBoxView });
                    }}
                  />
                </View>
              ) : null}
              <View style={styles.confirmView}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ isConfirmDisabled: true });
                    this.onConfirm();
                  }}
                  disabled={
                    isConfirmDisabled || this.getIsMinimumAllowedStatus()
                  }
                  style={{
                    ...styles.confirmButtonView,
                    backgroundColor: isConfirmDisabled
                      ? Colors.lightBlue
                      : Colors.blue,
                    elevation: 10,
                    shadowColor: Colors.shadowBlue,
                    shadowOpacity: 1,
                    shadowOffset: { width: 15, height: 15 },
                  }}
                >
                  {(!isConfirmDisabled &&
                    accountsState[serviceType].loading.transfer) ||
                    (isConfirmDisabled &&
                      accountsState[serviceType].loading.transfer) ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Text style={styles.buttonText}>{'Confirm & Proceed'}</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...styles.confirmButtonView,
                    width: wp('30%'),
                    marginLeft: 10,
                  }}
                  disabled={isConfirmDisabled || isSendMax}
                  onPress={() => {
                    if (
                      accountsState[serviceType].transfer.details &&
                      accountsState[serviceType].transfer.details.length
                    ) {
                      for (
                        let i = 0;
                        i < accountsState[serviceType].transfer.details.length;
                        i++
                      ) {
                        if (
                          accountsState[serviceType].transfer.details[i]
                            .selectedContact.id == selectedContact.id
                        ) {
                          if (
                            config.EJECTED_ACCOUNTS.includes(selectedContact.id)
                          ) {
                            if (
                              accountsState[serviceType].transfer.details[i]
                                .selectedContact.account_number ===
                              selectedContact.account_number &&
                              accountsState[serviceType].transfer.details[i]
                                .selectedContact.type === selectedContact.type
                            )
                              removeTransferDetails(
                                serviceType,
                                accountsState[serviceType].transfer.details[i],
                              );
                          } else {
                            removeTransferDetails(
                              serviceType,
                              accountsState[serviceType].transfer.details[i],
                            );
                          }
                        }
                      }
                      addTransferDetails(serviceType, {
                        selectedContact,
                        bitcoinAmount,
                        currencyAmount,
                        note,
                      });
                      this.props.navigation.goBack();
                    }
                  }}
                >
                  <Text
                    style={{
                      ...styles.buttonText,
                      color: Colors.blue,
                      opacity: isSendMax ? 0.5 : 1,
                    }}
                  >
                    Add Recipient
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={this.removeItemBottomSheetRef}
          snapPoints={[
            -50,
            hp('50%'),
          ]}
          renderContent={() => {
            if (
              Object.keys(removeItem).length != 0 &&
              removeItem.constructor === Object
            ) {
              return (
                <RemoveSelectedTransaction
                  selectedContact={removeItem}
                  onPressBack={() => {
                    this.removeItemBottomSheetRef.current?.snapTo(0);
                  }}
                  onPressDone={() => {
                    setTimeout(() => {
                      removeTransferDetails(serviceType, removeItem);
                    }, 2);
                    this.removeItemBottomSheetRef.current?.snapTo(0);
                  }}
                  serviceType={serviceType}
                />
              );
            }
          }}
          renderHeader={() => {
            if (
              Object.keys(removeItem).length === 0 &&
              removeItem.constructor === Object
            ) {
              return <ModalHeader />;
            }
          }}
        />
        <BottomSheet
          onCloseStart={() => {
            (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
          }}
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'SendUnSuccessBottomSheet'}
          snapPoints={[-50, hp('65%')]}
          renderContent={() => (
            <SendConfirmationContent
              title={'Send Unsuccessful'}
              info={
                'There seems to be a problem' +
                  '\n' +
                  accountsState[serviceType].transfer.stage1.failed
                  ? accountsState[serviceType].transfer.stage1.err ===
                    'Insufficient balance'
                    ? 'Insufficient balance to complete the transaction plus fee.\nPlease reduce the amount and try again.'
                    : 'Something went wrong; ' +
                    accountsState[serviceType].transfer.stage1.err
                  : 'Something went wrong; error in transfer state'
              }
              userInfo={accountsState[serviceType].transfer.details}
              isFromContact={false}
              okButtonText={'Try Again'}
              cancelButtonText={'Back'}
              isCancel={true}
              onPressOk={() => {
                if (this.refs.SendUnSuccessBottomSheet)
                  (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
              }}
              onPressCancel={() => {
                clearTransfer(serviceType);
                if (this.refs.SendUnSuccessBottomSheet)
                  (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);

                this.props.navigation.navigate('AccountDetails');
              }}
              isUnSuccess={true}
            />
          )}
          renderHeader={() => <ModalHeader />}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'AccountSelectionBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('55%')
              : hp('60%'),
          ]}
          renderContent={() => (
            <AccountSelectionModalContents
              RegularAccountBalance={spendableBalances.regularBalance}
              SavingAccountBalance={spendableBalances.secureBalance}
              onPressBack={() => {
                (this.refs.AccountSelectionBottomSheet as any).snapTo(0);
              }}
              onPressConfirm={(type) => {
                if (
                  accountsState[type].transfer.details &&
                  accountsState[type].transfer.details.length
                ) {
                  // do nothing (transfer details already exist)
                } else {
                  addTransferDetails(type, {
                    selectedContact,
                  });
                }
                (this.refs.AccountSelectionBottomSheet as any).snapTo(0);
                setTimeout(() => {
                  this.setState({ serviceType: type });
                }, 2);
              }}
            />
          )}
          renderHeader={() => <SmallHeaderModal />}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accountsState: state.accounts || [],
    trustedContactsService: idx(state, (_) => _.trustedContacts.service),
    currencyCode: idx(state, (_) => _.preferences.currencyCode),
    currencyKind: idx(state, (_) => _.preferences.currencyKind),
    averageTxFees: idx(state, (_) => _.accounts.averageTxFees),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    transferST1,
    removeTransferDetails,
    clearTransfer,
    addTransferDetails,
    currencyKindSet,
    setAverageTxFee,
    syncTrustedChannels,
  })(SendToContact),
);

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  view: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  view1: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('15%'),
  },
  name: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    marginTop: 5,
    width: wp('15%'),
  },
  amountText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  dividerView: {
    alignSelf: 'center',
    width: wp('90%'),
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: hp('1%'),
    marginTop: hp('2%'),
  },
  parentView: { paddingLeft: 20, paddingRight: 20, paddingTop: wp('5%') },
  backArrow: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  sendText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  confirmView: {
    flexDirection: 'row',
    marginTop: hp('3%'),
    marginBottom: hp('5%'),
  },
  currencyImageView: {
    width: wp('6%'),
    height: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  convertText: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  enterAmountView: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  toggleSwitchView: {
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfoView: {
    marginTop: wp('1.5%'),
    marginBottom: -25,
    padding: -20,
    marginLeft: -20,
    marginRight: -20,
  },

  availableToSpendView: {
    alignSelf: 'center',
    width: wp('90%'),
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    flexDirection: 'row',
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
  },

  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
    textAlign: 'center',
  },

  balanceText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
  },

  textTsats: {
    color: Colors.textColorGrey,
    fontSize: RFValue(7),
    fontFamily: Fonts.FiraSansMediumItalic,
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

  selectedRecipientsListContentContainer: {
    paddingVertical: 24,
  },
});
