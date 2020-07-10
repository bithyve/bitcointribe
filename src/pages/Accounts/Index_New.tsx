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
} from '../../common/constants/serviceTypes';
import {
  fetchBalance,
  fetchTransactions,
  getTestcoins,
  fetchBalanceTx,
  fetchDerivativeAccXpub,
  fetchDerivativeAccBalTx,
  fetchDerivativeAccAddress,
} from '../../store/actions/accounts';
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
// import accounts from '../../store/reducers/accounts';

function isEmpty(obj) {
  return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
}

export const isCompatible = async (method: string, version: string) => {
  if (parseFloat(version) > parseFloat(DeviceInfo.getVersion())) {
    // checking compatibility via Relay
    const res = await RelayServices.checkCompatibility(method, version);
    if (res.status !== 200) {
     // console.log('Failed to check compatibility');
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

const getIconByAccountType = (type) => {
  if (type == 'saving') {
    return require('../../assets/images/icons/icon_regular.png');
  } else if (type == 'regular') {
    return require('../../assets/images/icons/icon_regular.png');
  } else if (type == 'secure') {
    return require('../../assets/images/icons/icon_secureaccount.png');
  } else if (type == 'test') {
    return require('../../assets/images/icons/icon_test.png');
  } else {
    return require('../../assets/images/icons/icon_test.png');
  }
};

const TransactionHeader = ({ openCloseModal }) => {
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
};

interface AccountsStateTypes {
  FBTCAccount: any[];
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
  exchangeRates: any;
  switchOn: boolean;
  CurrencyCode: string;
  transactions: any[];
  tabBarIndex: number;
  loading: boolean;
  selectedTransactionItem: any;
  currencyCode: string;
  spendableBalance: any;
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
}

class Accounts extends Component<AccountsPropsTypes, AccountsStateTypes> {
  sliderWidth: any;
  currencyCode: any;
  carouselData: any;
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
    this.carouselData = [
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
    ];
    this.state = {
      FBTCAccount: {},
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
      transactionLoading: true,
      transactions: [],
      averageTxFees: null,
      exchangeRates:  this.props.accounts.exchangeRates,
      transactionItem: {},
      isHelperDone: true,
      showLoader: true,
      netBalance: 0,
      spendableBalance: 0,
    };
  }

  componentDidMount = () => {
    this.getBalance();
    let { serviceType } = this.state;
    let { accounts } = this.props;
    this.balanceTxLoading = accounts[serviceType].loading.balanceTx;
    this.derivativeBalanceTxLoading =
      accounts[serviceType].loading.derivativeBalanceTx;
    const service = accounts[serviceType].service;
    this.wallet =
      this.props.navigation.getParam('serviceType') === SECURE_ACCOUNT
        ? service.secureHDWallet
        : service.hdWallet;
    this.checkFastBitcoin();
    // if (this.wallet.transactions.transactionDetails.length) {
    //   this.wallet.transactions.transactionDetails.sort(function (left, right) {
    //     return moment.utc(right.date).unix() - moment.utc(left.date).unix();
    //   });
    // }

    this.setCurrencyCodeFromAsync();
    InteractionManager.runAfterInteractions(() => {
      this.setState({ is_initiated: true });
    });

    this.getServiceType(serviceType);
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

  setCurrencyCodeFromAsync = async () => {
    let currencyToggleValueTmp = await AsyncStorage.getItem(
      'currencyToggleValue',
    );
    let currencyCodeTmp = await AsyncStorage.getItem('currencyCode');
    this.setState({
      switchOn: currencyToggleValueTmp ? true : false,
      CurrencyCode: currencyCodeTmp ? currencyCodeTmp : 'USD',
    });
  };

  checkFastBitcoin = async () => {
    let getFBTCAccount = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    //console.log('getFBTCAccount', getFBTCAccount);
    // setFBTCAccount(getFBTCAccount ? getFBTCAccount : {});
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.accounts.exchangeRates!==this.props.accounts.exchangeRates){
      this.setState({exchangeRates: this.props.accounts.exchangeRates})
    }
    if(prevProps.accounts[this.state.serviceType].service!==this.props.accounts[this.state.serviceType].service){
      this.getBalance();
    }
    if (prevProps.accounts.exchangeRates!== this.props.accounts.exchangeRates){
      this.setState({exchangeRates: this.props.accounts.exchangeRates})
    }
  };

  componentWillUnmount() {
  }

  getServiceType = (serviceType) => {
    if (!serviceType) return;
      if (this.carousel.current) {
        if (serviceType == TEST_ACCOUNT) {
          setTimeout(() => {
            (this.carousel.current as any).snapToItem(0, true, false);
           }, 1000);
        } else if (serviceType == REGULAR_ACCOUNT) {
          setTimeout(() => {
            (this.carousel.current as any).snapToItem(1, true, false);
           }, 1000);
        } else if (serviceType == SECURE_ACCOUNT) {
          setTimeout(() => {
            (this.carousel.current as any).snapToItem(2, true, false);
           }, 1000);
        }
      }
    setTimeout(() => {
      this.setState({ serviceType: serviceType });
    }, 2);
    if (serviceType == TEST_ACCOUNT) this.checkNHighlight();
    setTimeout(() => {
      this.getBalance();
    }, 2);
  };

  checkNShowHelperModal = async () => {
    let isSendHelperDone = await AsyncStorage.getItem(
      'isTransactionHelperDone',
    );
    if (!isSendHelperDone && this.state.serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isTransactionHelperDone', 'true');
      setTimeout(() => {
        this.setState({ isHelperDone: true });
      }, 10);

      setTimeout(() => {
        (this.refs.TransactionDetailsHelperBottomSheet as any).current.snapTo(1);
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

    let isTestAccountHelperDone = await AsyncStorage.getItem(
      'isTestAccountHelperDone',
    );

    // if (isBuyHelperDone == 'true') {
    //   setBuyIsActive(false);
    // }
    // if (isSellHelperDone == 'true') {
    //   setSellIsActive(false);
    //   props.stop();
    // }
    // const providedBalance = this.props.navigation.getParam('netBalance');
    // if(providedBalance) this.setState({ spendableBalance: providedBalance});

    if (
      !isTestAccountHelperDone &&
      this.props.navigation.state.params &&
      this.props.navigation.getParam('serviceType') == TEST_ACCOUNT
    ) {
      await AsyncStorage.setItem('isTestAccountHelperDone', 'true');
      setTimeout(() => {
        this.setState({ isTestHelperDone: true });
      }, 10);

      setTimeout(() => {
        if (((this.refs.TestAccountHelperBottomSheet as any) as any).current) {
          ((this.refs.TestAccountHelperBottomSheet as any) as any).current.snapTo(1);
        }
      }, 1000);
    } else {
      setTimeout(() => {
        this.setState({ isTestHelperDone: false });
      }, 10);
    }
  };

  renderFBTC = (FBTCAccount, accountType) => {
    //console.log('FBTCAccount, renderFBTC', isEmpty(FBTCAccount), accountType);
    if (accountType) {
      if (accountType == 'Test Account')
        return (
          FBTCAccount.test_account.voucher.length &&
          FBTCAccount.test_account.voucher[0].hasOwnProperty('quotes')
        );
      else if (accountType == 'Checking Account')
        return (
          FBTCAccount.checking_account.voucher.length &&
          FBTCAccount.checking_account.voucher[0].hasOwnProperty('quotes')
        );
      else if (accountType == 'Savings Account')
        return (
          FBTCAccount.saving_account.length &&
          FBTCAccount.saving_account.voucher[0].hasOwnProperty('quotes')
        );
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

  renderItem = ({ item, index }) => {
    let {spendableBalance, switchOn, exchangeRates, CurrencyCode} = this.state;
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
                  if ((this.refs.TestAccountHelperBottomSheet as any).current)
                    (this.refs.TestAccountHelperBottomSheet as any).current.snapTo(1);
                } else if (item.accountType == 'Savings Account') {
                  if ((this.refs.SecureAccountHelperBottomSheet as any).current)
                    (this.refs.SecureAccountHelperBottomSheet as any).current.snapTo(1);
                } else if (item.accountType == 'Checking Account') {
                  if ((this.refs.RegularAccountHelperBottomSheet as any).current)
                    (this.refs.RegularAccountHelperBottomSheet as any).current.snapTo(1);
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
            {item.accountType == 'Savings Account' && (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  this.props.navigation.navigate('SecureScan', {
                    serviceType: this.state.serviceType,
                    getServiceType: this.getServiceType,
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
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ ...styles.cardAmountText, fontSize: RFValue(13) }}>
              Spendable:{' '}
              {item.accountType == 'Test Account'
                ? UsNumberFormat(spendableBalance)
                : switchOn
                ? UsNumberFormat(spendableBalance)
                : exchangeRates
                ? (
                    (spendableBalance / 1e8) *
                    exchangeRates[CurrencyCode].last
                  ).toFixed(2)
                : null}
            </Text>
            <Text style={styles.cardAmountUnitText}>
              {item.accountType == 'Test Account'
                ? 't-sats'
                : switchOn
                ? 'sats'
                : CurrencyCode.toLocaleLowerCase()}
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

  render() {
    const {
      serviceType,
      averageTxFees,
      netBalance,
      carouselInitIndex,
      FBTCAccount,
      showLoader,
      transactionLoading,
      isTestHelperDone,
      isSecureAccountHelperDone,
      isRegularAccountHelperDone,
      transactionItem,
      isHelperDone,
      switchOn,
      CurrencyCode,
      transactions,
      selectedTransactionItem,
      tabBarIndex,
      loading,
      currencyCode,
      spendableBalance
    } = this.state;
    const { navigation, exchangeRates, accounts } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar
          backgroundColor={Colors.backgroundColor}
          barStyle="dark-content"
        />

        <View
          style={{
            ...CommonStyles.headerContainer,
            justifyContent: 'space-between',
            backgroundColor: Colors.backgroundColor,
            borderBottomWidth: 0,
          }}
        >
          <TouchableOpacity
            style={{ ...CommonStyles.headerLeftIconContainer }}
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
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(20),
              fontFamily: Fonts.FiraSansRegular,
              textAlign: 'center',
            }}
          >
            Accounts
          </Text>
          <TouchableOpacity
            style={{ height: 54, justifyContent: 'center' }}
            onPress={() => {}}
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
                  await AsyncStorage.setItem('currencyToggleValue', temp);
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
                    this.balanceTxLoading || this.derivativeBalanceTxLoading
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
                  data={this.carouselData}
                  firstItem={carouselInitIndex}
                  initialNumToRender={carouselInitIndex}
                  // onBeforeSnapToItem={(index) => {
                  //   this.setState({ carouselInitIndex: index });
                  //   index === 0
                  //     ? this.getServiceType(TEST_ACCOUNT)
                  //     : index === 1
                  //     ? this.getServiceType(REGULAR_ACCOUNT)
                  //     : this.getServiceType(SECURE_ACCOUNT);
                  // }}
                  renderItem={this.renderItem}
                  sliderWidth={this.sliderWidth}
                  itemWidth={this.sliderWidth * 0.95}
                  onSnapToItem={(index) => {
                    index === 0
                      ? this.getServiceType(TEST_ACCOUNT)
                      : index === 1
                      ? this.getServiceType(REGULAR_ACCOUNT)
                      : this.getServiceType(SECURE_ACCOUNT);
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
                  if ((this.refs.TestAccountHelperBottomSheet as any).current)
                    (this.refs.TestAccountHelperBottomSheet as any).current.snapTo(0);
                  if ((this.refs.RegularAccountHelperBottomSheet as any).current)
                    (this.refs.RegularAccountHelperBottomSheet as any).current.snapTo(0);
                  if ((this.refs.SecureAccountHelperBottomSheet as any).current)
                    (this.refs.SecureAccountHelperBottomSheet as any).current.snapTo(0);
                }}
              >
                <View>
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColor,
                      flexDirection: 'row',
                      marginLeft: 20,
                      marginRight: 20,
                      marginBottom: hp('2%'),
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(13),
                        fontFamily: Fonts.FiraSansRegular,
                        padding: 10,
                      }}
                    >
                      Today
                    </Text>
                    <Text
                      onPress={() => {
                        if ((this.refs.bottomSheet as any))
                          (this.refs.bottomSheet as any).snapTo(1);
                      }}
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(12),
                        fontFamily: Fonts.FiraSansItalic,
                        textDecorationLine: 'underline',
                        marginLeft: 'auto',
                        padding: 10,
                      }}
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
                      renderItem={({ item, index }) => {
                        return (
                          <TouchableOpacity
                            onPress={
                              () => {
                                (this.refs.TransactionDetailsBottomSheet as any).current.snapTo(
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
                                  <Text
                                    style={styles.transactionModalTitleText}
                                  >
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
                                  <Text
                                    style={styles.transactionModalTitleText}
                                  >
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
                            /> */}
                                    {/* {item.time} */}
                                  </Text>
                                </View>
                              </View>
                            )}
                            <View style={styles.transactionModalAmountView}>
                              <Image
                                source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                                style={{
                                  width: 12,
                                  height: 12,
                                  resizeMode: 'contain',
                                  alignSelf: 'center',
                                }}
                              />
                              <View
                                style={{
                                  marginLeft: 5,
                                  alignSelf: 'center',
                                  marginRight: 5,
                                  flexDirection: 'row',
                                }}
                              >
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
                                  style={{
                                    alignSelf: 'center',
                                    fontSize: RFValue(13),
                                    fontFamily: Fonts.OpenSans,
                                    color: Colors.textColorGrey,
                                    lineHeight: 19,
                                  }}
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
                                {item.confirmations < 6
                                  ? item.confirmations
                                  : '6+'}
                              </Text>
                              {index == 0 ? (
                                <View
                                  style={{
                                    padding: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Ionicons
                                    name="ios-arrow-forward"
                                    color={Colors.textColorGrey}
                                    size={12}
                                  />
                                </View>
                              ) : (
                                <View
                                  style={{
                                    padding: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Ionicons
                                    name="ios-arrow-forward"
                                    color={Colors.textColorGrey}
                                    size={12}
                                  />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              {/* <TouchableWithoutFeedback
                onPress={() => {
                  if ((this.refs.TestAccountHelperBottomSheet as any).current)
                    (this.refs.TestAccountHelperBottomSheet as any).current.snapTo(0);
                  if ((this.refs.RegularAccountHelperBottomSheet as any).current)
                    (this.refs.RegularAccountHelperBottomSheet as any).current.snapTo(0);
                  if ((this.refs.SecureAccountHelperBottomSheet as any).current)
                    (this.refs.SecureAccountHelperBottomSheet as any).current.snapTo(0);
                }}
              > */}
              <View style={{ marginTop: hp('2%') }}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('Send', {
                        serviceType,
                        getServiceType: this.getServiceType,
                        averageTxFees,
                        spendableBalance,
                      });
                    }}
                    style={styles.bottomCardView}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 10,
                      }}
                    >
                      <Image
                        source={require('../../assets/images/icons/icon_send.png')}
                        style={styles.bottomCardSendReceiveImage}
                      />
                    </View>
                    <View style={{ flex: 3, marginLeft: wp('3%') }}>
                      <Text style={styles.bottomCardTitleText}>Send</Text>
                      <Text style={styles.bottomCardInfoText}>
                        Tran Fee :
                        {averageTxFees ? averageTxFees['low'].averageTxFee : 0}{' '}
                        ({serviceType === TEST_ACCOUNT ? 't-sats' : 'sats'})
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.navigate('Receive', {
                        serviceType,
                        getServiceType: this.getServiceType,
                        netBalance,
                      });
                    }}
                    style={styles.bottomCardView}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 10,
                      }}
                    >
                      <Image
                        source={require('../../assets/images/icons/icon_recieve.png')}
                        style={styles.bottomCardSendReceiveImage}
                      />
                    </View>
                    <View style={{ flex: 3, marginLeft: wp('3%') }}>
                      <Text style={styles.bottomCardTitleText}>Receive</Text>
                      {/* <Text style={styles.bottomCardInfoText}>
                          Tran Fee : {averageTxFees['high']} (
                          {serviceType === TEST_ACCOUNT ? 't-sats' : 'sats'})
                        </Text> */}
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                >
                  {/* TODO: Currently we removed BUY UI. */}
                  {/* <TouchableOpacity
                    onPress={() => {
                      props.navigation.navigate('Buy', {
                        serviceType,
                        getServiceType: getServiceType,
                      });
                    }}
                    style={{
                      ...styles.bottomCardView,
                      opacity: 0.3,
                      backgroundColor: Colors.borderColor,
                    }}
                    disabled={true}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 10,
                      }}
                    >
                      <Image
                        source={require('../../assets/images/icons/icon_buy.png')}
                        style={styles.bottomCardImage}
                      />
                    </View>
                    <View style={{ flex: 3, marginLeft: wp('3%') }}>
                      <Text style={styles.bottomCardTitleText}>Buy</Text>
                      <Text style={styles.bottomCardInfoText}>
                        Ex Rate : {exchangeRates ? exchangeRates[CurrencyCode].last : 0}{' '}
                        (usd)
                      </Text>
                    </View>
                  </TouchableOpacity> */}

                  {/* TODO: Currently we removed Sell UI. */}
                  {/* <TouchableOpacity
                    style={{...styles.bottomCardView, opacity: 0.3,
                      backgroundColor: Colors.borderColor,}}
                      disabled={ true }
                    onPress={() => {
                      props.navigation.navigate('Sell', {
                        serviceType,
                        getServiceType: getServiceType,
                      });
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 10,
                      }}
                    >
                      <Image
                        source={require('../../assets/images/icons/icon_sell.png')}
                        style={styles.bottomCardImage}
                      />
                    </View>
                    <View style={{ flex: 3, marginLeft: wp('3%') }}>
                      <Text style={styles.bottomCardTitleText}>Sell</Text>
                      <Text style={styles.bottomCardInfoText}>
                        Ex Rate : {exchangeRates ? exchangeRates[CurrencyCode].last : 0}{' '}
                        (usd)
                      </Text>
                    </View>
                  </TouchableOpacity> */}
                </View>
              </View>
              {/* </TouchableWithoutFeedback> */}
            </ScrollView>
            {showLoader ? <Loader /> : null}

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
                return (<TransactionsContent
                  isFromAccount={true}
                  transactionLoading={transactionLoading}
                  transactions={transactions}
                  AtCloseEnd={false}
                  setTransactionItem={(item) =>
                    this.setState({ selectedTransactionItem: item })
                  }
                  setTabBarZIndex={(index) =>
                    this.setState({ tabBarIndex: index })
                  }
                  TransactionDetailsBottomSheet={
                    (this.refs.TransactionDetailsBottomSheet as any)
                  }
                />)
              }}
              renderHeader={() => (
                <TouchableOpacity
                  activeOpacity={10}
                  onPress={() => {if ((this.refs.bottomSheet as any))
                    (this.refs.bottomSheet as any).snapTo(0);}}
                  style={styles.transactionModalHeaderContainer}
                >
                  <View style={styles.transactionModalHeaderHandle} />
                  <Text style={styles.transactionModalHeaderTitleText}>{'Transactions'}</Text>
                </TouchableOpacity>
              )}
            />

            {/* helper modals */}
            {/* <BottomSheet
            enabledInnerScrolling={true}
            ref={BuyHelperBottomSheet}
            snapPoints={[
              -50,
              hp('90%'),
              Platform.OS == 'android' ? hp('50%') : hp('90%'),
            ]}
            renderContent={renderBuyHelperContents}
            renderHeader={renderBuyHelperHeader}
          /> */}
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
              renderContent={() => <TestAccountHelpContents />}
              renderHeader={() => (
                <SmallHeaderModal
                  borderColor={Colors.blue}
                  backgroundColor={Colors.blue}
                  onPressHeader={() => {
                    if (isTestHelperDone) {
                      if ((this.refs.TestAccountHelperBottomSheet as any).current)
                        (this.refs.TestAccountHelperBottomSheet as any).current.snapTo(1);
                      setTimeout(() => {
                        this.setState({ isTestHelperDone: false });
                      }, 10);
                    } else {
                      if ((this.refs.TestAccountHelperBottomSheet as any).current)
                        (this.refs.TestAccountHelperBottomSheet as any).current.snapTo(0);
                    }
                  }}
                />
              )}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={'SecureAccountHelperBottomSheet'}
              snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                  ? hp('87%')
                  : hp('89%'),
              ]}
              renderContent={() => <SavingsAccountHelpContents />}
              renderHeader={() => (
                <SmallHeaderModal
                  borderColor={Colors.blue}
                  backgroundColor={Colors.blue}
                  onPressHeader={() => {
                    if (isSecureAccountHelperDone) {
                      if ((this.refs.SecureAccountHelperBottomSheet as any).current)
                        (this.refs.SecureAccountHelperBottomSheet as any).current.snapTo(1);
                      setTimeout(() => {
                        this.setState({ isSecureAccountHelperDone: false });
                      }, 10);
                    } else {
                      if ((this.refs.SecureAccountHelperBottomSheet as any).current)
                        (this.refs.SecureAccountHelperBottomSheet as any).current.snapTo(0);
                    }
                  }}
                />
              )}
            />
            <BottomSheet
              enabledInnerScrolling={true}
              ref={'RegularAccountHelperBottomSheet'}
              snapPoints={[
                -50,
                Platform.OS == 'ios' && DeviceInfo.hasNotch()
                  ? hp('87%')
                  : hp('89%'),
              ]}
              renderContent={() => <CheckingAccountHelpContents />}
              renderHeader={() => (
                <SmallHeaderModal
                  borderColor={Colors.blue}
                  backgroundColor={Colors.blue}
                  onPressHeader={() => {
                    if (isRegularAccountHelperDone) {
                      if ((this.refs.RegularAccountHelperBottomSheet as any).current)
                        (this.refs.RegularAccountHelperBottomSheet as any).current.snapTo(1);
                      setTimeout(() => {
                        this.setState({ isRegularAccountHelperDone: false });
                      }, 10);
                    } else {
                      if ((this.refs.RegularAccountHelperBottomSheet as any).current)
                        (this.refs.RegularAccountHelperBottomSheet as any).current.snapTo(0);
                    }
                  }}
                />
              )}
            />
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
                  getServiceType={this.getServiceType}
                  onPressKnowMore={() => {
                    AsyncStorage.setItem('isTransactionHelperDone', 'true');
                    (this.refs.TransactionDetailsHelperBottomSheet as any).current.snapTo(1);
                  }}
                />
              )}
              renderHeader={() => (
                <SmallHeaderModal
                  borderColor={Colors.white}
                  backgroundColor={Colors.white}
                  onPressHeader={() => {
                    if ((this.refs.TransactionDetailsBottomSheet as any).current)
                      (this.refs.TransactionDetailsBottomSheet as any).current.snapTo(0);
                  }}
                />
              )}
            />

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
              renderContent={() => <TransactionHelperModalContents />}
              renderHeader={() => (
                <SmallHeaderModal
                  borderColor={Colors.blue}
                  backgroundColor={Colors.blue}
                  onPressHeader={() => {
                    if (isHelperDone) {
                      (this.refs.TransactionDetailsHelperBottomSheet as any).current.snapTo(
                        1,
                      );
                      setTimeout(() => {
                        this.setState({ isHelperDone: false });
                      }, 10);
                    } else {
                      (this.refs.TransactionDetailsHelperBottomSheet as any).current.snapTo(
                        0,
                      );
                    }
                  }}
                />
              )}
            />
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
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    exchangeRates: idx(state, (_) => _.accounts.exchangeRates),
    accounts: idx(state, (_) => _.accounts) || [],
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
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    // marginLeft: 15
  },
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
    marginLeft: 'auto',
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.borderColor,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
    marginTop: 5,
  },
  modalContentView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  modalHeaderContainer: {
    paddingTop: 20,
  },
  copilotTooltip: {
    backgroundColor: 'rgba(0,0,0,0)',
    paddingTop: 5,
    marginBottom: 30,
  },
  stepNumber: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 14,
    borderColor: '#FFFFFF',
    backgroundColor: '#27ae60',
  },
  stepNumberText: {
    fontSize: 10,
    backgroundColor: 'transparent',
    color: '#FFFFFF',
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
});
