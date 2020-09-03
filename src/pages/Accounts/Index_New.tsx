import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ImageBackground,
  FlatList,
  Platform,
  RefreshControl,
  TouchableWithoutFeedback,
  AsyncStorage,
  InteractionManager,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CommonStyles from '../../common/Styles';
import ToggleSwitch from '../../components/ToggleSwitch';
import Carousel, { getInputRangeFromIndexes } from 'react-native-snap-carousel';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  FAST_BITCOINS,
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
} from '../../common/constants/serviceTypes';
import {
  fetchBalance,
  fetchTransactions,
  getTestcoins,
  fetchBalanceTx,
  fetchDerivativeAccXpub,
  fetchDerivativeAccBalTx,
  fetchDerivativeAccAddress,
  setAverageTxFee,
} from '../../store/actions/accounts';
import {
  setCurrencyToggleValue,
  setTestAccountHelperDone,
  setTransactionHelper,
} from '../../store/actions/preferences';
import { ScrollView } from 'react-native-gesture-handler';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions/index';
import moment from 'moment';
import config from '../../bitcoin/HexaConfig';
import { UsNumberFormat } from '../../common/utilities';
import TransactionDetails from './TransactionDetails';
import TransactionHelperModalContents from '../../components/Helper/TransactionHelperModalContents';
import TestAccountHelpContents from '../../components/Helper/TestAccountHelpContents';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrencyImageName } from '../../common/CommonFunctions/index';
import CheckingAccountHelpContents from '../../components/Helper/CheckingAccountHelpContents';
import deviceInfoModule from 'react-native-device-info';
import SavingsAccountHelpContents from '../../components/Helper/SavingsAccountHelpContents';
import Loader from '../../components/loader';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation';
import idx from 'idx';
import TransactionsContent from '../../components/home/transaction-content';
import RelayServices from '../../bitcoin/services/RelayService';
import DonationWebPageModalContents from '../../components/DonationWebPageModalContents';
import ModalHeader from '../../components/ModalHeader';
import DonationAccountHelpContents from '../../components/Helper/DonationAccountHelpContents';
import { DonationDerivativeAccount, DonationDerivativeAccountElements } from '../../bitcoin/utilities/Interface';
// import accounts from '../../store/reducers/accounts';

function isEmpty(obj) {
  return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
}

export const isCompatible = async (method: string, version: string) => {
  if (parseFloat(version) > parseFloat(DeviceInfo.getVersion())) {
    // checking compatibility via Relay
    const res = await RelayServices.checkCompatibility(method, version);
    if (res.status !== 200) {
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

interface AccountsStateTypes {
  carouselData: any;
  presentCarouselData: any;
  presentCarouselIndex: number;
  FBTCAccount: any;
  serviceType: any;
  isHelperDone: boolean;
  isTestHelperDone: boolean;
  netBalance: any;
  is_initiated: boolean;
  carouselInitIndex: any;
  transactionItem: any;
  isSecureAccountHelperDone: boolean;
  transactionLoading: boolean;
  showLoader: boolean;
  averageTxFees: any;
  isRegularAccountHelperDone: boolean;
  isDonationAccountHelperDone: boolean;
  exchangeRates: any;
  switchOn: boolean;
  CurrencyCode: string;
  transactions: any[];
  spendableBalance: any;
  providedBalance: any;
}

interface AccountsPropsTypes {
  navigation: any;
  exchangeRates: any;
  fetchBalance: any;
  fetchTransactions: any;
  getTestcoins: any;
  fetchBalanceTx: any;
  fetchDerivativeAccXpub: any;
  fetchDerivativeAccBalTx: any;
  fetchDerivativeAccAddress: any;
  service: any;
  balanceTxLoading: any;
  derivativeBalanceTxLoading: any;
  accounts: any;
  FBTCAccountData: any;
  currencyCode: any;
  currencyToggleValue: any;
  setCurrencyToggleValue: any;
  setTestAccountHelperDone: any;
  isTestHelperDoneValue: any;
  setTransactionHelper: any;
  isTransactionHelperDoneValue: any;
  setAverageTxFee: any;
}

class Accounts extends Component<AccountsPropsTypes, AccountsStateTypes> {
  sliderWidth: any;
  currencyCode: any;
  wallet: any;
  balanceTxLoading: any;
  derivativeBalanceTxLoading: any;
  carousel: any;
  constructor(props) {
    super(props);
    this.carousel = React.createRef<Carousel>();
    this.sliderWidth = Dimensions.get('window').width;
    this.currencyCode = [
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

    this.state = {
      carouselData: [
        {
          accountType: 'Test Account',
          accountInfo: 'Learn Bitcoin',
          backgroundImage: require('../../assets/images/carouselImages/test_account_background.png'),
          accountTypeImage: require('../../assets/images/icons/icon_test_white.png'),
          type: TEST_ACCOUNT,
        },
        {
          accountType: 'Checking Account',
          accountInfo: 'Fast and easy',
          backgroundImage: require('../../assets/images/carouselImages/regular_account_background.png'),
          accountTypeImage: require('../../assets/images/icons/icon_regular_account.png'),
          type: REGULAR_ACCOUNT,
        },
        {
          accountType: 'Savings Account',
          accountInfo: 'Multi-factor security',
          backgroundImage: require('../../assets/images/carouselImages/savings_account_background.png'),
          accountTypeImage: require('../../assets/images/icons/icon_secureaccount_white.png'),
          type: SECURE_ACCOUNT,
        },
      ],
      presentCarouselData: null,
      presentCarouselIndex: null,
      CurrencyCode: 'USD',
      serviceType: this.props.navigation.state.params
        ? this.props.navigation.getParam('serviceType')
        : TEST_ACCOUNT,
      carouselInitIndex: this.props.navigation.state.params
        ? this.props.navigation.getParam('index')
        : 1,
      switchOn: true,
      is_initiated: false,
      isTestHelperDone: true,
      isRegularAccountHelperDone: true,
      isSecureAccountHelperDone: true,
      isDonationAccountHelperDone: true,
      transactionLoading: true,
      transactions: [],
      averageTxFees: null,
      exchangeRates: this.props.accounts.exchangeRates,
      transactionItem: {},
      isHelperDone: true,
      showLoader: true,
      netBalance: 0,
      providedBalance: 0,
      spendableBalance: 0,
      FBTCAccount: {},
    };
  }

  componentDidMount = () => {
    let { serviceType } = this.state;
    let { accounts } = this.props;
    // this.setState({ spendableBalance: this.props.navigation.state.params
    //   ? this.props.navigation.getParam('spendableBalance') : 0})


    this.getServiceType(serviceType, serviceType === SECURE_ACCOUNT ? 2 : serviceType === REGULAR_ACCOUNT ? 1 : 0);
    this.getBalance();
    this.balanceTxLoading = accounts[serviceType].loading.balanceTx;
    this.derivativeBalanceTxLoading =
      accounts[serviceType].loading.derivativeBalanceTx;
    const service = accounts[serviceType].service;
    this.wallet =
      this.props.navigation.getParam('serviceType') === SECURE_ACCOUNT
        ? service.secureHDWallet
        : service.hdWallet;
    this.setAverageTransactionFees();
    this.checkFastBitcoin();
    this.updateCarouselData();
    // if (this.wallet.transactions.transactionDetails.length) {
    //   this.wallet.transactions.transactionDetails.sort(function (left, right) {
    //     return moment.utc(right.date).unix() - moment.utc(left.date).unix();
    //   });
    // }

    this.setCurrencyCodeFromAsync();
    InteractionManager.runAfterInteractions(() => {
      this.setState({ is_initiated: true });
    });

    if (this.state.showLoader) {
      // after all interactions are done , loader need to be removed
      InteractionManager.runAfterInteractions(() => {
        this.setState({ showLoader: false });
        return;
      });

      // we need to force remove loader if interaction manager did not response in 3 secs
      InteractionManager.setDeadline(3);
    } else {
      return;
    }
  };

  updateCarouselData = () => {
    let { accounts } = this.props;
    const defaultCarouselData = [{
      accountType: 'Test Account',
      accountInfo: 'Learn Bitcoin',
      backgroundImage: require('../../assets/images/carouselImages/test_account_background.png'),
      accountTypeImage: require('../../assets/images/icons/icon_test_white.png'),
      type: TEST_ACCOUNT,
    },
    {
      accountType: 'Checking Account',
      accountInfo: 'Fast and easy',
      backgroundImage: require('../../assets/images/carouselImages/regular_account_background.png'),
      accountTypeImage: require('../../assets/images/icons/icon_regular_account.png'),
      type: REGULAR_ACCOUNT,
    },
    {
      accountType: 'Savings Account',
      accountInfo: 'Multi-factor security',
      backgroundImage: require('../../assets/images/carouselImages/savings_account_background.png'),
      accountTypeImage: require('../../assets/images/icons/icon_secureaccount_white.png'),
      type: SECURE_ACCOUNT,
    }];

    const additionalCarouselData = [];
    for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {
      const derivativeAccounts =
        accounts[serviceType].service[serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet'].derivativeAccounts

      for (let index = 1; index <= derivativeAccounts && derivativeAccounts[DONATION_ACCOUNT].instance.using; index++) {
        const donAcc: DonationDerivativeAccountElements = derivativeAccounts[DONATION_ACCOUNT][index]
        const donationInstance = {
          accountType: 'Donation Account',
          accountInfo: donAcc.subject,
          backgroundImage: require('../../assets/images/carouselImages/donation_account_background.png'),
          accountTypeImage: require('../../assets/images/icons/icon_donation_account.png'),
          type: serviceType,
          donationAcc: donAcc,
          accountNumber: index
        };
        additionalCarouselData.push(donationInstance)
      }
    }
    this.setState({ carouselData: [...defaultCarouselData, ...additionalCarouselData] })
  }

  getBalance = () => {
    let { serviceType } = this.state;
    let { accounts } = this.props;
    const service = accounts[serviceType].service;
    const wallet =
      serviceType === SECURE_ACCOUNT
        ? service.secureHDWallet
        : service.hdWallet;
    if (service) {
      let currentBalance =
        wallet.balances.balance + wallet.balances.unconfirmedBalance;
      let spendableBalance = wallet.balances.balance;
      let currentTransactions = wallet.transactions.transactionDetails;

      if (serviceType === TEST_ACCOUNT) {
        // hardcoding t-balance (till t-faucet saga syncs)
        if (!currentTransactions.length) {
          currentBalance = 10000;
          spendableBalance = 10000;
        }
      }

      if (serviceType === REGULAR_ACCOUNT || serviceType === SECURE_ACCOUNT) {
        for (const dAccountType of Object.keys(config.DERIVATIVE_ACC)) {
          let derivativeAccount;

          if (serviceType === REGULAR_ACCOUNT) {
            derivativeAccount =
              accounts[REGULAR_ACCOUNT].service.hdWallet.derivativeAccounts[
              dAccountType
              ];
          } else if (serviceType === SECURE_ACCOUNT) {
            if (dAccountType === TRUSTED_CONTACTS) continue;
            derivativeAccount =
              accounts[SECURE_ACCOUNT].service.secureHDWallet
                .derivativeAccounts[dAccountType];
          }

          if (derivativeAccount && derivativeAccount.instance.using) {
            for (
              let accountNumber = 1;
              accountNumber <= derivativeAccount.instance.using;
              accountNumber++
            ) {
              if (derivativeAccount[accountNumber].balances) {
                currentBalance +=
                  derivativeAccount[accountNumber].balances.balance +
                  derivativeAccount[accountNumber].balances.unconfirmedBalance;
                spendableBalance +=
                  derivativeAccount[accountNumber].balances.balance;
              }

              if (derivativeAccount[accountNumber].transactions) {
                derivativeAccount[
                  accountNumber
                ].transactions.transactionDetails.forEach((tx) => {
                  let include = true;
                  for (const currentTx of currentTransactions) {
                    if (tx.txid === currentTx.txid) {
                      include = false;
                      break;
                    }
                  }
                  if (include) currentTransactions.push(tx);
                });
              }
            }
          }
        }
      }
      currentTransactions.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
      this.setState({
        netBalance: currentBalance,
        spendableBalance: spendableBalance,
        transactions: currentTransactions,
        transactionLoading: false,
      });
    }
  };

  setAverageTransactionFees = async () => {
    let { serviceType } = this.state;
    let { accounts } = this.props;
    const service = accounts[serviceType].service;
    const instance = service.hdWallet || service.secureHDWallet;
    const storedAverageTxFees = this.props.averageTxFees;
    // const storedAverageTxFees = JSON.parse(
    //   await AsyncStorage.getItem('storedAverageTxFees'),
    // );
    console.log({ storedAverageTxFees });

    const network = [REGULAR_ACCOUNT, SECURE_ACCOUNT].includes(serviceType)
      ? 'MAINNET'
      : 'TESTNET';
    if (storedAverageTxFees && storedAverageTxFees[network]) {
      const { averageTxFees, lastFetched } = storedAverageTxFees[network];
      if (Date.now() - lastFetched < 1800000 && instance.feeRates) {
        // maintaining a half an hour difference b/w fetches
        this.setState({ averageTxFees: averageTxFees });
        return;
      }
    }
    console.log('Fetching average fee...', network);
    const averageTxFees = await instance.averageTransactionFee();
    this.setState({ averageTxFees: averageTxFees });
    this.props.setAverageTxFee({
      ...storedAverageTxFees,
      [network]: { averageTxFees, lastFetched: Date.now() },
    });
    // await AsyncStorage.setItem(
    //   'storedAverageTxFees',
    //   JSON.stringify({
    //     serviceType: { averageTxFees, lastFetched: Date.now() },
    //   }),
    // );
  };

  setCurrencyCodeFromAsync = async () => {
    let currencyToggleValueTmp = this.props.currencyToggleValue;
    // await AsyncStorage.getItem(
    //   'currencyToggleValue',
    // );
    let currencyCodeTmp = this.props.currencyCode;
    //await AsyncStorage.getItem('currencyCode');
    this.setState({
      switchOn: currencyToggleValueTmp ? true : false,
      CurrencyCode: currencyCodeTmp ? currencyCodeTmp : 'USD',
    });
  };

  checkFastBitcoin = async () => {
    const { FBTCAccountData } = this.props;
    let getFBTCAccount = FBTCAccountData || {};
    // JSON.parse(await AsyncStorage.getItem('FBTCAccount')) || {};
    this.setState({ FBTCAccount: getFBTCAccount });
    return;
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.accounts.exchangeRates !== this.props.accounts.exchangeRates
    ) {
      this.setState({ exchangeRates: this.props.accounts.exchangeRates });
    }
    if (
      prevProps.accounts[this.state.serviceType].service !==
      this.props.accounts[this.state.serviceType].service
    ) {
      this.getBalance();
      this.balanceTxLoading = this.props.accounts[
        this.state.serviceType
      ].loading.balanceTx;
      this.derivativeBalanceTxLoading = this.props.accounts[
        this.state.serviceType
      ].loading.derivativeBalanceTx;
    }
    if (
      prevProps.accounts.exchangeRates !== this.props.accounts.exchangeRates
    ) {
      this.setState({ exchangeRates: this.props.accounts.exchangeRates });
    }

    if (prevState.serviceType !== this.state.serviceType) {
      this.setAverageTransactionFees();
    }

    if (prevProps.accounts !==
      this.props.accounts) {
      let donationAccUpdated = false;
      for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {

        const prevDonationAccounts =
          prevProps.accounts[serviceType].service[serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet'].derivativeAccounts

        const updatedDonationAccounts =
          this.props.accounts[serviceType].service[serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet'].derivativeAccounts

        if (prevDonationAccounts[DONATION_ACCOUNT] !== updatedDonationAccounts[DONATION_ACCOUNT]) {
          donationAccUpdated = true;
        }
      }

      if (donationAccUpdated) this.updateCarouselData();
    }
  };

  getServiceType = (serviceType, index?) => {
    if (!serviceType) return;

    if (!index) {
      if (this.carousel.current) {
        if (serviceType == TEST_ACCOUNT) {
          if (this.carousel.current as any)
            //setTimeout(() => {
            (this.carousel.current as any).snapToItem(0, true, false);
          //}, 1100);
        } else if (serviceType == REGULAR_ACCOUNT) {
          if (this.carousel.current as any)
            // setTimeout(() => {
            (this.carousel.current as any).snapToItem(1, true, false);
          //}, 1100);
        } else if (serviceType == SECURE_ACCOUNT) {
          if (this.carousel.current as any)
            // setTimeout(() => {
            (this.carousel.current as any).snapToItem(2, true, false);
          // }, 1100);
        }
      }
      this.setState({ serviceType: serviceType });
    } else {
      if (this.carousel.current as any)
        (this.carousel.current as any).snapToItem(index, true, false);
      this.setState({ serviceType: serviceType, presentCarouselData: this.state.carouselData[index], presentCarouselIndex: index });
    }

    if (serviceType == TEST_ACCOUNT) this.checkNHighlight();
    setTimeout(() => {
      this.getBalance();
    }, 2);
  };

  checkNShowHelperModal = async () => {
    let isTransactionHelperDone = this.props.isTransactionHelperDoneValue;
    if (!isTransactionHelperDone) {
      isTransactionHelperDone = await AsyncStorage.getItem(
        'isTransactionHelperDone',
      );
    }
    if (!isTransactionHelperDone && this.state.serviceType == TEST_ACCOUNT) {
      this.props.setTransactionHelper(true);
      //await AsyncStorage.setItem('isTransactionHelperDone', 'true');
      setTimeout(() => {
        this.setState({ isHelperDone: true });
      }, 10);

      setTimeout(() => {
        (this.refs.TransactionDetailsHelperBottomSheet as any).snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        this.setState({ isHelperDone: false });
      }, 10);
    }
  };

  checkNHighlight = async () => {
    // let isBuyHelperDone = await AsyncStorage.getItem('isBuyHelperDone');
    // let isSellHelperDone = await AsyncStorage.getItem('isSellHelperDone');

    let isTestAccountHelperDone = this.props.isTestHelperDoneValue;
    if (!isTestAccountHelperDone) {
      isTestAccountHelperDone = await AsyncStorage.getItem(
        'isTestAccountHelperDone',
      );
    }

    // if (isBuyHelperDone == 'true') {
    //   setBuyIsActive(false);
    // }
    // if (isSellHelperDone == 'true') {
    //   setSellIsActive(false);
    //   props.stop();
    // }

    if (
      !isTestAccountHelperDone &&
      this.props.navigation.state.params &&
      this.props.navigation.getParam('serviceType') == TEST_ACCOUNT
    ) {
      this.props.setTestAccountHelperDone(true);
      // await AsyncStorage.setItem('isTestAccountHelperDone', 'true');
      setTimeout(() => {
        this.setState({ isTestHelperDone: true });
      }, 10);

      setTimeout(() => {
        if ((this.refs.TestAccountHelperBottomSheet as any) as any) {
          ((this.refs.TestAccountHelperBottomSheet as any) as any).snapTo(1);
        }
      }, 1000);
    } else {
      setTimeout(() => {
        this.setState({ isTestHelperDone: false });
      }, 10);
    }
  };

  renderFBTC = (FBTCAccount, accountType) => {
    if (accountType) {
      if (accountType == 'Test Account') {
        for (let i = 0; i < FBTCAccount.test_account.voucher.length; i++) {
          if (FBTCAccount.test_account.voucher[i].hasOwnProperty('quotes'))
            return true;
        }
      } else if (accountType == 'Checking Account') {
        for (let i = 0; i < FBTCAccount.checking_account.voucher.length; i++) {
          if (FBTCAccount.checking_account.voucher[i].hasOwnProperty('quotes'))
            return true;
        }
      } else if (accountType == 'Savings Account') {
        for (let i = 0; i < FBTCAccount.saving_account.voucher.length; i++) {
          if (FBTCAccount.saving_account.voucher[i].hasOwnProperty('quotes'))
            return true;
        }
      }
    }
    return false;
  };

  setCurrencyCodeToImage = (currencyName, currencyColor) => {
    return (
      <MaterialCommunityIcons
        name={currencyName}
        color={currencyColor == 'light' ? Colors.white : Colors.blue}
        size={wp('3.5%')}
      />
    );
  };

  RenderItem = ({ item, index }) => {
    let {
      spendableBalance,
      switchOn,
      exchangeRates,
      CurrencyCode,
    } = this.state;
    return (
      <ImageBackground
        source={item.backgroundImage}
        imageStyle={{
          height: hp('20%'),
          borderRadius: 10,
        }}
        style={{
          height: hp('20%'),
          borderRadius: 10,
          margin: 5,
          padding: hp('2%'),
          elevation: 5,
          shadowColor:
            index == 0
              ? Colors.blue
              : index == 1
                ? Colors.yellow
                : index == 2
                  ? Colors.green
                  : Colors.borderColor,
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 7 },
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ justifyContent: 'space-between' }}>
          <Image
            source={item.accountTypeImage}
            style={{
              width: wp('15%'),
              height: wp('15%'),
              resizeMode: 'contain',
            }}
          />
          <View style={{}}>
            <Text
              style={{
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(15),
                color: Colors.white,
                alignSelf: 'flex-start',
              }}
            >
              {item.accountType}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
                color: Colors.white,
                alignSelf: 'flex-start',
                marginTop: 5,
              }}
            >
              {item.accountInfo}
            </Text>
          </View>
        </View>

        <View style={{ justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: Fonts.FiraSansMedium,
                fontSize: RFValue(15),
                color: Colors.white,
                alignSelf: 'center',
                padding: 10,
                marginLeft: 'auto',
              }}
              onPress={() => {
                if (item.accountType == 'Test Account') {
                  if (this.refs.TestAccountHelperBottomSheet as any)
                    (this.refs.TestAccountHelperBottomSheet as any).snapTo(1);
                } else if (item.accountType == 'Savings Account') {
                  if (this.refs.SecureAccountHelperBottomSheet as any)
                    (this.refs.SecureAccountHelperBottomSheet as any).snapTo(1);
                } else if (item.accountType == 'Checking Account') {
                  if (this.refs.RegularAccountHelperBottomSheet as any)
                    (this.refs.RegularAccountHelperBottomSheet as any).snapTo(1);
                } else if (item.accountType == 'Donation Account') {
                  if (this.refs.DonationAccountHelperBottomSheet as any)
                    (this.refs.DonationAccountHelperBottomSheet as any).snapTo(1);
                }
              }}
            >
              Know more
            </Text>
            {/* <Image
              style={{
                marginLeft: 'auto',
                width: wp('5%'),
                height: wp('5%'),
                resizeMode: 'contain',
                padding: 10,
              }}
              source={require('../../assets/images/icons/icon_settings.png')}
            /> */}
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              marginLeft: 'auto',
            }}
          >
            {!isEmpty(this.state.FBTCAccount) ? (
              this.renderFBTC(this.state.FBTCAccount, item.accountType) ? (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.white,
                    borderRadius: 15,
                    padding: 5,
                  }}
                >
                  <Image
                    style={{
                      marginLeft: 'auto',
                      width: wp('3%'),
                      height: wp('3%'),
                      resizeMode: 'contain',
                      padding: 5,
                    }}
                    source={require('../../assets/images/icons/fastbitcoin_dark.png')}
                  />
                </View>
              ) : null
            ) : null}
            {(item.accountType === 'Savings Account' || (item.accountType === "Donation Account" && item.type === SECURE_ACCOUNT)) && (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.props.navigation.navigate('SecureScan', {
                    serviceType: this.state.serviceType,
                    getServiceType: this.getServiceType,
                    carouselIndex: this.state.presentCarouselIndex,
                  });
                }}
              >
                <Text
                  style={{
                    paddingLeft: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginLeft: 'auto',
                    fontFamily: Fonts.FiraSansMedium,
                    fontSize: RFValue(15),
                    color: Colors.white,
                    alignSelf: 'center',
                  }}
                  onPress={() => {
                    // if (service.secureHDWallet.twoFASetup) {
                    //   this.props.navigation.navigate('TwoFASetup', {
                    //     twoFASetup: service.secureHDWallet.twoFASetup,
                    //   });
                    // }
                  }}
                >
                  2FA
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {item.accountType == 'Test Account' || this.state.switchOn ? (
              <Image
                style={styles.cardBitCoinImage}
                source={require('../../assets/images/icons/icon_bitcoin_light.png')}
              />
            ) : this.currencyCode.includes(this.state.CurrencyCode) ? (
              <View
                style={{
                  marginRight: 5,
                  marginTop: 'auto',
                  marginLeft: 'auto',
                  marginBottom: wp('1.2%'),
                }}
              >
                {this.setCurrencyCodeToImage(
                  getCurrencyImageName(this.state.CurrencyCode),
                  'light',
                )}
              </View>
            ) : (
                  <Image
                    style={styles.cardBitCoinImage}
                    source={getCurrencyImageByRegion(
                      this.state.CurrencyCode,
                      'light',
                    )}
                  />
                )}
            <Text style={styles.cardAmountText}>
              {item.accountType == 'Test Account'
                ? UsNumberFormat(this.state.netBalance)
                : this.state.switchOn
                  ? UsNumberFormat(this.state.netBalance)
                  : this.state.exchangeRates
                    ? (
                      (this.state.netBalance / 1e8) *
                      this.state.exchangeRates[this.state.CurrencyCode].last
                    ).toFixed(2)
                    : null}
            </Text>
            <Text style={styles.cardAmountUnitText}>
              {item.accountType == 'Test Account'
                ? 't-sats'
                : this.state.switchOn
                  ? 'sats'
                  : this.state.CurrencyCode.toLocaleLowerCase()}
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  };

  scrollInterpolator = (index, carouselProps) => {
    const range = [1, 0, -1];
    const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
    const outputRange = range;
    return { inputRange, outputRange };
  };

  slideInterpolatedStyle = (index, animatedValue, carouselProps) => {
    return {
      opacity: animatedValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0.5, 1, 0.5],
        extrapolate: 'clamp',
      }),
      transform: [
        {
          translateX: animatedValue.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [
              carouselProps.itemWidth / 100,
              0,
              -carouselProps.itemWidth / 100,
            ],
            extrapolate: 'clamp',
          }),
          scale: animatedValue.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [1, 1, 1],
          }),
        },
      ],
    };
  };

  getAccountNameFromType = () => {
    if (this.state.serviceType == TEST_ACCOUNT) return 'Test Account';
    else if (this.state.serviceType == REGULAR_ACCOUNT)
      return 'Checking Account';
    else return 'Savings Account';
  };

  getAverageTxFees = () => {
    const network = [REGULAR_ACCOUNT, SECURE_ACCOUNT].includes(
      this.state.serviceType,
    )
      ? 'MAINNET'
      : 'TESTNET';
    const averageTxFees = idx(
      this.props.averageTxFees,
      (_) => _[network].averageTxFees,
    );
    return averageTxFees;
  };

  render() {
    const {
      serviceType,
      // averageTxFees,
      netBalance,
      carouselInitIndex,
      showLoader,
      transactionLoading,
      isTestHelperDone,
      isSecureAccountHelperDone,
      isRegularAccountHelperDone,
      isDonationAccountHelperDone,
      transactionItem,
      isHelperDone,
      switchOn,
      CurrencyCode,
      transactions,
      spendableBalance,
    } = this.state;
    const { navigation, exchangeRates, accounts } = this.props;
    const averageTxFees = this.getAverageTxFees();
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar
          backgroundColor={Colors.backgroundColor}
          barStyle="dark-content"
        />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              this.props.navigation.navigate('Home');
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerText}>Accounts</Text>
          <TouchableOpacity
            style={{ height: 54, justifyContent: 'center' }}
            onPress={() => { }}
          >
            <View
              style={{
                ...CommonStyles.headerLeftIconInnerContainer,
                paddingRight: 30,
              }}
            >
              <ToggleSwitch
                currencyCodeValue={CurrencyCode}
                activeOnImage={require('../../assets/images/icons/icon_bitcoin_light.png')}
                inactiveOnImage={require('../../assets/images/icons/icon_bitcoin_dark.png')}
                activeOffImage={
                  this.currencyCode.includes(CurrencyCode)
                    ? this.setCurrencyCodeToImage(
                      getCurrencyImageName(CurrencyCode),
                      'light',
                    )
                    : getCurrencyImageByRegion(CurrencyCode, 'light')
                }
                inactiveOffImage={
                  this.currencyCode.includes(CurrencyCode)
                    ? this.setCurrencyCodeToImage(
                      getCurrencyImageName(CurrencyCode),
                      'dark',
                    )
                    : getCurrencyImageByRegion(CurrencyCode, 'dark')
                }
                toggleColor={Colors.lightBlue}
                toggleCircleColor={Colors.blue}
                onpress={async () => {
                  this.setState({ switchOn: !this.state.switchOn });
                  let temp = !switchOn ? 'true' : '';
                  this.props.setCurrencyToggleValue(temp);
                  //await AsyncStorage.setItem('currencyToggleValue', temp);
                }}
                toggle={switchOn}
              />
            </View>
          </TouchableOpacity>
        </View>
        {this.state.is_initiated ? (
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{
                backgroundColor: Colors.backgroundColor,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={
                    accounts[serviceType].loading.balanceTx ||
                    accounts[serviceType].loading.derivativeBalanceTx
                  }
                  onRefresh={() => {
                    // this.props.fetchTransactions(serviceType);
                    this.props.fetchBalanceTx(serviceType, {
                      loader: true,
                      syncTrustedDerivative:
                        serviceType === REGULAR_ACCOUNT ||
                          serviceType === SECURE_ACCOUNT
                          ? true
                          : false,
                    });
                  }}
                />
              }
            >
              <View style={{ paddingTop: hp('3%'), paddingBottom: hp('3%') }}>
                <Carousel
                  ref={this.carousel}
                  data={this.state.carouselData}
                  firstItem={carouselInitIndex}
                  initialNumToRender={carouselInitIndex}
                  renderItem={this.RenderItem}
                  sliderWidth={this.sliderWidth}
                  itemWidth={this.sliderWidth * 0.95}
                  onSnapToItem={(index) => {
                    this.getServiceType(this.state.carouselData[index].type, index)
                  }}
                  style={{ activeSlideAlignment: 'center' }}
                  scrollInterpolator={this.scrollInterpolator}
                  slideInterpolatedStyle={this.slideInterpolatedStyle}
                  useScrollView={true}
                  extraData={carouselInitIndex}
                />
              </View>
              <TouchableWithoutFeedback
                onPress={() => {
                  if (this.refs.TestAccountHelperBottomSheet as any)
                    (this.refs.TestAccountHelperBottomSheet as any).snapTo(0);
                  if (this.refs.RegularAccountHelperBottomSheet as any)
                    (this.refs.RegularAccountHelperBottomSheet as any).snapTo(
                      0,
                    );
                  if (this.refs.SecureAccountHelperBottomSheet as any)
                    (this.refs.SecureAccountHelperBottomSheet as any).snapTo(0);
                }}
              >
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: 30,
                      marginRight: 20,
                      alignItems: 'flex-end',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.FiraSansItalic,
                        color: Colors.blue,
                        fontSize: RFValue(13),
                      }}
                    >
                      Available to spend:{' '}
                      {serviceType == TEST_ACCOUNT
                        ? UsNumberFormat(spendableBalance)
                        : switchOn
                          ? UsNumberFormat(spendableBalance)
                          : exchangeRates
                            ? (
                              (spendableBalance / 1e8) *
                              exchangeRates[CurrencyCode].last
                            ).toFixed(2)
                            : null}{' '}
                      {serviceType == TEST_ACCOUNT
                        ? 't-sats'
                        : switchOn
                          ? 'sats'
                          : CurrencyCode.toLocaleLowerCase()}
                    </Text>
                    {/* <Text
                      style={{
                        fontFamily: Fonts.FiraSansMediumItalic,
                        color: Colors.textColorGrey,
                        fontSize: RFValue(10),
                        marginBottom: 1,
                      }}
                    >
                      {serviceType == TEST_ACCOUNT
                        ? 't-sats'
                        : switchOn
                          ? 'sats'
                          : CurrencyCode.toLocaleLowerCase()}
                    </Text> */}
                  </View>
                  <View style={styles.transactionTitle}>
                    <Text style={styles.transactionTitleDateText}>Today</Text>
                    <Text
                      onPress={() => {
                        if (this.refs.bottomSheet as any)
                          (this.refs.bottomSheet as any).snapTo(1);
                      }}
                      style={styles.viewMoreText}
                    >
                      View more
                    </Text>
                  </View>
                  <View>
                    <FlatList
                      data={transactions.slice(0, 3)}
                      ItemSeparatorComponent={() => (
                        <View
                          style={{ backgroundColor: Colors.backgroundColor }}
                        >
                          <View style={styles.separatorView} />
                        </View>
                      )}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          onPress={
                            () => {
                              (this.refs
                                .TransactionDetailsBottomSheet as any).snapTo(
                                  1,
                                );
                              this.checkNShowHelperModal();
                              setTimeout(() => {
                                this.setState({ transactionItem: item });
                              }, 10);
                            }
                            // props.navigation.navigate('TransactionDetails', {
                            //   item,
                            //   serviceType,
                            //   getServiceType: getServiceType,
                            // })
                          }
                          style={styles.transactionModalElementView}
                        >
                          {index == 0 ? (
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
                              <View
                                style={{
                                  justifyContent: 'center',
                                  marginLeft: 10,
                                }}
                              >
                                <Text style={styles.transactionModalTitleText}>
                                  {item.accountType == FAST_BITCOINS
                                    ? 'FastBitcoins.com'
                                    : item.accountType}{' '}
                                </Text>
                                <Text style={styles.transactionModalDateText}>
                                  {moment(item.date)
                                    .utc()
                                    .format('DD MMMM YYYY')}{' '}
                                  {/* <Entypo
                            size={10}
                            name={"dot-single"}
                            color={Colors.textColorGrey}
                          /> */}
                                  {/* {item.time} */}
                                </Text>
                              </View>
                            </View>
                          ) : (
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
                                <View
                                  style={{
                                    justifyContent: 'center',
                                    marginLeft: 10,
                                  }}
                                >
                                  <Text style={styles.transactionModalTitleText}>
                                    {item.accountType == FAST_BITCOINS
                                      ? 'FastBitcoins.com'
                                      : item.accountType}{' '}
                                  </Text>
                                  <Text style={styles.transactionModalDateText}>
                                    {moment(item.date)
                                      .utc()
                                      .format('DD MMMM YYYY')}{' '}
                                    {/* <Entypo
                            size={10}
                            name={"dot-single"}
                            color={Colors.textColorGrey}
                          /> */}
                                    {/* {item.time} */}
                                  </Text>
                                </View>
                              </View>
                            )}
                          <View style={styles.transactionModalAmountView}>
                            <Image
                              source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                              style={styles.bitcoinImage}
                            />
                            <View style={styles.transactionBalanceTextView}>
                              <Text
                                style={{
                                  ...styles.transactionModalAmountText,
                                  color:
                                    item.transactionType == 'Received'
                                      ? Colors.green
                                      : Colors.red,
                                  alignSelf: 'center',
                                }}
                              >
                                {item.accountType == 'Test Account'
                                  ? UsNumberFormat(item.amount)
                                  : switchOn
                                    ? UsNumberFormat(item.amount)
                                    : exchangeRates
                                      ? (
                                        (item.amount / 1e8) *
                                        exchangeRates[CurrencyCode].last
                                      ).toFixed(2)
                                      : null}

                                {/* {UsNumberFormat(item.amount)} */}
                              </Text>
                              <Text
                                style={styles.transactionBalanceUnitTextView}
                              >
                                {item.accountType == 'Test Account'
                                  ? 't-sats'
                                  : switchOn
                                    ? 'sats'
                                    : CurrencyCode.toLocaleLowerCase()}
                              </Text>
                            </View>
                            <Text
                              style={{
                                ...styles.transactionModalAmountUnitText,
                                alignSelf: 'center',
                              }}
                            >
                              {item.accountType === 'Test Account'
                                ? item.confirmations < 6
                                  ? item.confirmations
                                  : item.confirmations === '-' // for testnet faucet tx
                                    ? item.confirmations
                                    : '6+'
                                : item.confirmations < 6
                                  ? item.confirmations
                                  : '6+'}
                            </Text>
                            {index == 0 ? (
                              <View style={styles.forwardIconView}>
                                <Ionicons
                                  name="ios-arrow-forward"
                                  color={Colors.textColorGrey}
                                  size={12}
                                />
                              </View>
                            ) : (
                                <View style={styles.forwardIconView}>
                                  <Ionicons
                                    name="ios-arrow-forward"
                                    color={Colors.textColorGrey}
                                    size={12}
                                  />
                                </View>
                              )}
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <View style={{ marginTop: hp('2%') }}>
                <View style={styles.bottomButtonView}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('Send', {
                        serviceType,
                        getServiceType: this.getServiceType,
                        carouselIndex: this.state.presentCarouselIndex,
                        averageTxFees,
                        spendableBalance,
                      });
                    }}
                    style={styles.bottomCardView}
                  >
                    <View style={styles.sendButtonImageView}>
                      <Image
                        source={require('../../assets/images/icons/icon_send.png')}
                        style={styles.bottomCardSendReceiveImage}
                      />
                    </View>
                    <View style={{ flex: 3, marginLeft: wp('3%') }}>
                      <Text style={styles.bottomCardTitleText}>Send</Text>
                      <Text style={styles.bottomCardInfoText}>
                        Tran Fee : (~
                        {switchOn || serviceType === TEST_ACCOUNT
                          ? (averageTxFees
                            ? averageTxFees['medium'].averageTxFee
                            : 0) +
                          ' ' +
                          (serviceType === TEST_ACCOUNT ? 't-sats' : 'sats')
                          : exchangeRates
                            ? (
                              ((averageTxFees
                                ? averageTxFees['medium'].averageTxFee
                                : 0) /
                                1e8) *
                              exchangeRates[CurrencyCode].last
                            ).toFixed(2) +
                            ' ' +
                            CurrencyCode.toLocaleLowerCase()
                            : null}
                        )
                        {/* {averageTxFees ? averageTxFees['low'].averageTxFee : 0}{' '}
                        ({serviceType == TEST_ACCOUNT
                          ? 't-sats'
                          : switchOn
                            ? 'sats'
                            : CurrencyCode.toLocaleLowerCase()}) */}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('Receive', {
                        serviceType,
                        getServiceType: this.getServiceType,
                        carouselIndex: this.state.presentCarouselIndex,
                        netBalance,
                      });
                    }}
                    style={styles.bottomCardView}
                  >
                    <View style={styles.sendButtonImageView}>
                      <Image
                        source={require('../../assets/images/icons/icon_recieve.png')}
                        style={styles.bottomCardSendReceiveImage}
                      />
                    </View>
                    <View style={{ flex: 3, marginLeft: wp('3%') }}>
                      <Text style={styles.bottomCardTitleText}>Receive</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                ></View>
              </View>
              {this.state.presentCarouselData && this.state.presentCarouselData.accountType === 'Donation Account' ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
                <AppBottomSheetTouchableWrapper
                  style={styles.buttonStyle}
                  onPress={() => {
                    if (this.refs.DonationWebPageBottomSheet as any) {
                      (this.refs.DonationWebPageBottomSheet as any).snapTo(1);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Donation Webpage</Text>
                </AppBottomSheetTouchableWrapper>
              </View> : null}
            </ScrollView>
            {showLoader ? <Loader /> : null}
          </View>
        ) : (
            <ScrollView
              contentContainerStyle={{
                backgroundColor: Colors.backgroundColor,
              }}
              refreshControl={
                <RefreshControl refreshing={!this.state.is_initiated} />
              }
            />
          )}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'DonationWebPageBottomSheet'}
          snapPoints={[-50, hp('70%')]}
          renderContent={() => {
            const { donationAcc, accountNumber } = this.state.presentCarouselData ? this.state.presentCarouselData : { donationAcc: null, accountNumber: null }
            if (!donationAcc) return
            return (
              <DonationWebPageModalContents account={donationAcc} accountNumber={accountNumber} serviceType={this.state.serviceType} close={() => (this.refs.DonationWebPageBottomSheet as any).snapTo(0)} />
            )
          }}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                (this.refs.DonationWebPageBottomSheet as any).snapTo(0);
              }}
            />
          )}
        />
        {this.state.is_initiated ? (
          <BottomSheet
            enabledInnerScrolling={true}
            ref={'bottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('60%')
                : hp('60%'),
            ]}
            renderContent={() => {
              const infoBoxInfoText =
                'All your recent transactions for the ' +
                this.getAccountNameFromType() +
                ' will appear here.';
              return (
                <TransactionsContent
                  infoBoxInfoText={infoBoxInfoText}
                  isFromAccount={true}
                  transactionLoading={transactionLoading}
                  transactions={transactions}
                  AtCloseEnd={false}
                  setTransactionItem={(item) => { }
                    //this.setState({ selectedTransactionItem: item })
                  }
                  setTabBarZIndex={(index) => { }
                    //this.setState({ tabBarIndex: index })
                  }
                  TransactionDetailsBottomSheet={
                    this.refs.TransactionDetailsBottomSheet as any
                  }
                />
              );
            }}
            renderHeader={() => (
              <TouchableOpacity
                activeOpacity={10}
                onPress={() => {
                  if (this.refs.bottomSheet as any)
                    (this.refs.bottomSheet as any).snapTo(0);
                }}
                style={styles.transactionModalHeaderContainer}
              >
                <View style={styles.transactionModalHeaderHandle} />
                <Text style={styles.transactionModalHeaderTitleText}>
                  {'Transactions'}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : null}

        {this.state.is_initiated ? (
          <BottomSheet
            onCloseStart={async () => {
              // let isBuyHelperDone = await AsyncStorage.getItem('isBuyHelperDone');
              // let isSellHelperDone = await AsyncStorage.getItem('isSellHelperDone');
            }}
            enabledInnerScrolling={true}
            ref={'TestAccountHelperBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('87%')
                : hp('89%'),
              // Platform.OS == 'ios' && DeviceInfo.hasNotch()
              //   ? hp('35%')
              //   : hp('40%'),
              //Platform.OS == 'android' ? hp('50%') : hp('90%'),
            ]}
            renderContent={() => (
              <TestAccountHelpContents
                titleClicked={() => {
                  if (this.refs.TestAccountHelperBottomSheet as any)
                    (this.refs.TestAccountHelperBottomSheet as any).snapTo(0);
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.blue}
                backgroundColor={Colors.blue}
                onPressHeader={() => {
                  if (isTestHelperDone) {
                    if (this.refs.TestAccountHelperBottomSheet as any)
                      (this.refs.TestAccountHelperBottomSheet as any).snapTo(1);
                    setTimeout(() => {
                      this.setState({ isTestHelperDone: false });
                    }, 10);
                  } else {
                    if (this.refs.TestAccountHelperBottomSheet as any)
                      (this.refs.TestAccountHelperBottomSheet as any).snapTo(0);
                  }
                }}
              />
            )}
          />
        ) : null}

        {this.state.is_initiated ? (
          <BottomSheet
            enabledInnerScrolling={true}
            ref={'SecureAccountHelperBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('87%')
                : hp('89%'),
            ]}
            renderContent={() => (
              <SavingsAccountHelpContents
                titleClicked={() => {
                  if (this.refs.SecureAccountHelperBottomSheet as any)
                    (this.refs.SecureAccountHelperBottomSheet as any).snapTo(0);
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.blue}
                backgroundColor={Colors.blue}
                onPressHeader={() => {
                  if (isSecureAccountHelperDone) {
                    if (this.refs.SecureAccountHelperBottomSheet as any)
                      (this.refs.SecureAccountHelperBottomSheet as any).snapTo(
                        1,
                      );
                    setTimeout(() => {
                      this.setState({ isSecureAccountHelperDone: false });
                    }, 10);
                  } else {
                    if (this.refs.SecureAccountHelperBottomSheet as any)
                      (this.refs.SecureAccountHelperBottomSheet as any).snapTo(
                        0,
                      );
                  }
                }}
              />
            )}
          />
        ) : null}

        {this.state.is_initiated ? (
          <BottomSheet
            enabledInnerScrolling={true}
            ref={'RegularAccountHelperBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('87%')
                : hp('89%'),
            ]}
            renderContent={() => (
              <CheckingAccountHelpContents
                titleClicked={() => {
                  if (this.refs.RegularAccountHelperBottomSheet as any)
                    (this.refs.RegularAccountHelperBottomSheet as any).snapTo(
                      0,
                    );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.blue}
                backgroundColor={Colors.blue}
                onPressHeader={() => {
                  if (isRegularAccountHelperDone) {
                    if (this.refs.RegularAccountHelperBottomSheet as any)
                      (this.refs.RegularAccountHelperBottomSheet as any).snapTo(
                        1,
                      );
                    setTimeout(() => {
                      this.setState({ isRegularAccountHelperDone: false });
                    }, 10);
                  } else {
                    if (this.refs.RegularAccountHelperBottomSheet as any)
                      (this.refs.RegularAccountHelperBottomSheet as any).snapTo(
                        0,
                      );
                  }
                }}
              />
            )}
          />
        ) : null}

        {this.state.is_initiated ? (
          <BottomSheet
            enabledInnerScrolling={true}
            ref={'TransactionDetailsBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('88%')
                : hp('88%'),
            ]}
            renderContent={() => (
              <TransactionDetails
                item={transactionItem}
                serviceType={serviceType}
                onPressKnowMore={() => {
                  this.props.setTransactionHelper(true);
                  //AsyncStorage.setItem('isTransactionHelperDone', 'true');
                  (this.refs.TransactionDetailsHelperBottomSheet as any).snapTo(
                    1,
                  );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.white}
                backgroundColor={Colors.white}
                onPressHeader={() => {
                  if (this.refs.TransactionDetailsBottomSheet as any)
                    (this.refs.TransactionDetailsBottomSheet as any).snapTo(0);
                }}
              />
            )}
          />
        ) : null}

        {this.state.is_initiated ? (
          <BottomSheet
            enabledInnerScrolling={true}
            ref={'TransactionDetailsHelperBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && deviceInfoModule.hasNotch()
                ? hp('87%')
                : hp('89%'),
              // Platform.OS == 'ios' && DeviceInfo.hasNotch()
              //   ? hp('35%')
              //   : hp('40%'),
            ]}
            renderContent={() => (
              <TransactionHelperModalContents
                titleClicked={() => {
                  (this.refs.TransactionDetailsHelperBottomSheet as any).snapTo(
                    0,
                  );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.blue}
                backgroundColor={Colors.blue}
                onPressHeader={() => {
                  if (isHelperDone) {
                    (this.refs
                      .TransactionDetailsHelperBottomSheet as any).snapTo(1);
                    setTimeout(() => {
                      this.setState({ isHelperDone: false });
                    }, 10);
                  } else {
                    (this.refs
                      .TransactionDetailsHelperBottomSheet as any).snapTo(0);
                  }
                }}
              />
            )}
          />
        ) : null}

        {this.state.is_initiated ? (
          <BottomSheet
            enabledInnerScrolling={true}
            ref={'DonationAccountHelperBottomSheet'}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('87%')
                : hp('89%'),
            ]}
            renderContent={() => (
              <DonationAccountHelpContents
                titleClicked={() => {
                  if (this.refs.DonationAccountHelperBottomSheet as any)
                    (this.refs.DonationAccountHelperBottomSheet as any).snapTo(
                      0,
                    );
                }}
              />
            )}
            renderHeader={() => (
              <SmallHeaderModal
                borderColor={Colors.blue}
                backgroundColor={Colors.blue}
                onPressHeader={() => {
                  if (isDonationAccountHelperDone) {
                    if (this.refs.DonationAccountHelperBottomSheet as any)
                      (this.refs.DonationAccountHelperBottomSheet as any).snapTo(
                        1,
                      );
                    setTimeout(() => {
                      this.setState({ isDonationAccountHelperDone: false });
                    }, 10);
                  } else {
                    if (this.refs.DonationAccountHelperBottomSheet as any)
                      (this.refs.DonationAccountHelperBottomSheet as any).snapTo(
                        0,
                      );
                  }
                }}
              />
            )}
          />
        ) : null}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    exchangeRates: idx(state, (_) => _.accounts.exchangeRates),
    accounts: idx(state, (_) => _.accounts) || [],
    FBTCAccountData: idx(state, (_) => _.fbtc.FBTCAccountData),
    currencyCode: idx(state, (_) => _.preferences.currencyCode),
    currencyToggleValue: idx(state, (_) => _.preferences.currencyToggleValue),
    isTestHelperDoneValue: idx(
      state,
      (_) => _.preferences.isTestHelperDoneValue,
    ),
    isTransactionHelperDoneValue: idx(
      state,
      (_) => _.preferences.isTransactionHelperDoneValue,
    ),
    averageTxFees: idx(state, (_) => _.accounts.averageTxFees),
    // service: idx(state, (_) => _.accounts)
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchBalance,
    fetchTransactions,
    getTestcoins,
    fetchBalanceTx,
    fetchDerivativeAccXpub,
    fetchDerivativeAccBalTx,
    fetchDerivativeAccAddress,
    setCurrencyToggleValue,
    setTestAccountHelperDone,
    setTransactionHelper,
    setAverageTxFee,
  })(Accounts),
);

const styles = StyleSheet.create({
  cardBitCoinImage: {
    width: wp('3%'),
    height: wp('3%'),
    marginRight: 5,
    marginTop: 'auto',
    marginLeft: 'auto',
    marginBottom: wp('1.2%'),
    resizeMode: 'contain',
  },
  cardAmountText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(21),
    marginRight: 5,
  },
  cardAmountUnitText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginBottom: 2,
    marginTop: 'auto',
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
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    display: 'flex',
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
  bottomCardView: {
    flex: 1,
    margin: 5,
    height: hp('8%'),
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCardImage: {
    width: wp('10%'),
    height: wp('10%'),
    resizeMode: 'contain',
  },
  bottomCardSendReceiveImage: {
    width: wp('7%'),
    height: wp('7%'),
    resizeMode: 'contain',
  },
  bottomCardInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(9),
  },
  bottomCardTitleText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(15),
  },
  transactionModalHeaderContainer: {
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
  transactionModalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  transactionModalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  headerContainer: {
    ...CommonStyles.headerContainer,
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundColor,
    borderBottomWidth: 0,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
  },
  transactionTitle: {
    backgroundColor: Colors.backgroundColor,
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: hp('2%'),
  },
  transactionTitleDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    padding: 10,
  },
  viewMoreText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansItalic,
    textDecorationLine: 'underline',
    marginLeft: 'auto',
    padding: 10,
  },
  bitcoinImage: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  transactionBalanceTextView: {
    marginLeft: 5,
    alignSelf: 'center',
    marginRight: 5,
    flexDirection: 'row',
  },
  transactionBalanceUnitTextView: {
    alignSelf: 'center',
    fontSize: RFValue(13),
    fontFamily: Fonts.OpenSans,
    color: Colors.textColorGrey,
    lineHeight: 19,
  },
  forwardIconView: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonView: {
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
  },
  sendButtonImageView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonStyle: {
    height: 50,
    width: wp('40%'),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
});
