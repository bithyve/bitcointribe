import React, { useState, useEffect, useCallback } from 'react';
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
import TransactionsContent from '../../components/home/transaction-content';

export default function Accounts(props) {
  const [FBTCAccount, setFBTCAccount] = useState({});
  const [CurrencyCode, setCurrencyCode] = useState('USD');
  const [serviceType, setServiceType] = useState(
    props.navigation.state.params
      ? props.navigation.getParam('serviceType')
      : TEST_ACCOUNT,
  );
  const sliderWidth = Dimensions.get('window').width;

  const [bottomSheet, setBottomSheet] = useState(React.createRef());

  // const [BuyHelperBottomSheet, setBuyHelperBottomSheet] = useState(
  //   React.createRef(),
  // );
  const [
    TestAccountHelperBottomSheet,
    setTestAccountHelperBottomSheet,
  ] = useState(React.createRef());

  const [
    SecureAccountHelperBottomSheet,
    setSecureAccountHelperBottomSheet,
  ] = useState(React.createRef());

  const [
    RegularAccountHelperBottomSheet,
    setRegularAccountHelperBottomSheet,
  ] = useState(React.createRef());

  const [
    TransactionDetailsBottomSheet,
    setTransactionDetailsBottomSheet,
  ] = useState(React.createRef());

  const [carouselData, setCarouselData] = useState([
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
  ]);

  let [carouselInitIndex, setCarouselInitIndex] = useState(
    props.navigation.state.params ? props.navigation.getParam('index') : 1,
  );
  const [switchOn, setSwitchOn] = useState(true);
  const [is_initiated, setIs_initiated] = useState(false);

  let [carousel, setCarousel] = useState(React.createRef());

  const handleIndexChange = (index: number) => {
    setCarouselInitIndex(index);
  };
  const [isTestHelperDone, setIsTestHelperDone] = useState(true);
  const [isRegularAccountHelperDone, setIsRegularAccountHelperDone] = useState(
    true,
  );
  const [isSecureAccountHelperDone, setIsSecureAccountHelperDone] = useState(
    true,
  );
  const service = useSelector((state) => state.accounts[serviceType].service);
  const balanceTxLoading = useSelector(
    (state) => state.accounts[serviceType].loading.balanceTx,
  );
  const derivativeBalanceTxLoading = useSelector(
    (state) => state.accounts[serviceType].loading.derivativeBalanceTx,
  );

  const wallet =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
  const [netBalance, setNetBalance] = useState();
  const [spendableBalance, setSpendableBalance] = useState();
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [averageTxFees, setAverageTxFees] = useState(null);

  const accounts = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(accounts.exchangeRates);
  const [transactionItem, setTransactionItem] = useState({});
  const [
    TransactionDetailsHelperBottomSheet,
    setTransactionDetailsHelperBottomSheet,
  ] = useState(React.createRef());
  const [isHelperDone, setIsHelperDone] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
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
      <MaterialCommunityIcons
        name={currencyName}
        color={currencyColor == 'light' ? Colors.white : Colors.blue}
        size={wp('3.5%')}
      />
    );
  }

  const checkNHighlight = async () => {
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
    const providedBalance = props.navigation.getParam('spendableBalance');
    useEffect(() => {
      if (providedBalance) setSpendableBalance(providedBalance);
    }, [providedBalance]);

    if (
      !isTestAccountHelperDone &&
      props.navigation.state.params &&
      props.navigation.getParam('serviceType') == TEST_ACCOUNT
    ) {
      await AsyncStorage.setItem('isTestAccountHelperDone', 'true');
      setTimeout(() => {
        setIsTestHelperDone(true);
      }, 10);

      setTimeout(() => {
        if (TestAccountHelperBottomSheet.current) {
          (TestAccountHelperBottomSheet.current as any).snapTo(1);
        }
      }, 1000);
    } else {
      setTimeout(() => {
        setIsTestHelperDone(false);
      }, 10);
    }
  };

  useEffect(() => {
    checkFastBitcoin();
    if (wallet.transactions.transactionDetails.length) {
      wallet.transactions.transactionDetails.sort(function (left, right) {
        return moment.utc(right.date).unix() - moment.utc(left.date).unix();
      });
    }

    setCurrencyCodeFromAsync();
    InteractionManager.runAfterInteractions(() => {
      setIs_initiated(true);
    });

    getServiceType(serviceType);
  }, []);

  const checkFastBitcoin = async () => {
    let getFBTCAccount = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    //console.log('getFBTCAccount', getFBTCAccount);
    setFBTCAccount(getFBTCAccount ? getFBTCAccount : {});
  };
  // useEffect(() => {
  //   const accountNumber = 0;
  //   const { derivativeAccounts } =
  //     serviceType === SECURE_ACCOUNT
  //       ? service.secureHDWallet
  //       : service.hdWallet;

  //   if (!derivativeAccounts[FAST_BITCOINS][accountNumber])
  //     dispatch(fetchDerivativeAccAddress(serviceType, FAST_BITCOINS));
  //   else {
  //     console.log({
  //       FBAddress:
  //         derivativeAccounts[FAST_BITCOINS][accountNumber].receivingAddress,
  //     });
  //   }
  // }, [service]);

  // useEffect(() => {
  //   if (serviceType === REGULAR_ACCOUNT || SECURE_ACCOUNT) {
  //     const derivativeAccountType = 'FAST_BITCOINS';
  //     const accountNumber = 0;
  //     const { derivativeAccounts } =
  //       serviceType === REGULAR_ACCOUNT
  //         ? service.hdWallet
  //         : service.secureHDWallet;
  //     //console.log({
  //       balances:
  //         derivativeAccounts[derivativeAccountType][accountNumber].balances,
  //       transactions:
  //         derivativeAccounts[derivativeAccountType][accountNumber].transactions,
  //     });
  //     if (derivativeAccounts[derivativeAccountType][accountNumber].xpub)
  //       dispatch(fetchDerivativeAccBalTx(serviceType, derivativeAccountType));
  //   }
  // }, []);

  useEffect(() => {
    (async () => {
      const storedAverageTxFees = JSON.parse(
        await AsyncStorage.getItem('storedAverageTxFees'),
      );
      const instance = service.hdWallet || service.secureHDWallet;

      //console.log({ storedAverageTxFees });
      if (storedAverageTxFees && storedAverageTxFees[serviceType]) {
        const { averageTxFees, lastFetched } = storedAverageTxFees[serviceType];
        if (Date.now() - lastFetched < 1800000 && instance.feeRates) {
          // maintaining a half an hour difference b/w fetches
          setAverageTxFees(averageTxFees);
        } else {
          const averageTxFees = await instance.averageTransactionFee();

          setAverageTxFees(averageTxFees);
          await AsyncStorage.setItem(
            'storedAverageTxFees',
            JSON.stringify({
              ...storedAverageTxFees,
              [serviceType]: { averageTxFees, lastFetched: Date.now() },
            }),
          );
        }
      } else {
        const instance = service.hdWallet || service.secureHDWallet;
        const averageTxFees = await instance.averageTransactionFee();
        setAverageTxFees(averageTxFees);
        await AsyncStorage.setItem(
          'storedAverageTxFees',
          JSON.stringify({
            [serviceType]: { averageTxFees, lastFetched: Date.now() },
          }),
        );
      }
    })();
  }, [serviceType]);

  const setCurrencyCodeFromAsync = async () => {
    let currencyToggleValueTmp = await AsyncStorage.getItem(
      'currencyToggleValue',
    );
    setSwitchOn(currencyToggleValueTmp ? true : false);
    let currencyCodeTmp = await AsyncStorage.getItem('currencyCode');
    setCurrencyCode(currencyCodeTmp ? currencyCodeTmp : 'USD');
  };
  useEffect(() => {
    if (accounts.exchangeRates) setExchangeRates(accounts.exchangeRates);
  }, [accounts.exchangeRates]);

  const getServiceType = (serviceType) => {
    if (!serviceType) return;
    setServiceType(serviceType);
    //console.log('Service type', serviceType);
    if (carousel.current) {
      if (serviceType == TEST_ACCOUNT) {
        setTimeout(() => {
          (carousel.current as any).snapToItem(0, true, false);
        }, 1000);
      } else if (serviceType == REGULAR_ACCOUNT) {
        setTimeout(() => {
          (carousel.current as any).snapToItem(1, true, false);
        }, 1000);
      } else if (serviceType == SECURE_ACCOUNT) {
        setTimeout(() => {
          (carousel.current as any).snapToItem(2, true, false);
        }, 1000);
      }
    }

    if (serviceType == TEST_ACCOUNT) checkNHighlight();
  };
  function isEmpty(obj) {
    return Object.keys(obj).every((k) => !Object.keys(obj[k]).length);
  }
  const renderFBTC = (FBTCAccount, accountType) => {
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

  const renderItem = ({ item, index }) => {
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
            {
              <Text
                style={{
                  // marginRight: 10,
                  fontFamily: Fonts.FiraSansMedium,
                  fontSize: RFValue(15),
                  color: Colors.white,
                  alignSelf: 'center',
                  padding: 10,
                  marginLeft: 'auto',
                }}
                onPress={() => {
                  //console.log('item.accountType', item.accountType);
                  if (item.accountType == 'Test Account') {
                    if (TestAccountHelperBottomSheet.current)
                      (TestAccountHelperBottomSheet as any).current.snapTo(1);
                  } else if (item.accountType == 'Savings Account') {
                    if (SecureAccountHelperBottomSheet.current)
                      (SecureAccountHelperBottomSheet as any).current.snapTo(1);
                  } else if (item.accountType == 'Checking Account') {
                    if (RegularAccountHelperBottomSheet.current)
                      (RegularAccountHelperBottomSheet as any).current.snapTo(
                        1,
                      );
                  }
                }}
              >
                Know more
              </Text>
            }
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
            {!isEmpty(FBTCAccount) ? (
              renderFBTC(FBTCAccount, item.accountType) ? (
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
                  props.navigation.navigate('SecureScan', {
                    serviceType,
                    getServiceType: getServiceType,
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
                    if (service.secureHDWallet.twoFASetup) {
                      props.navigation.navigate('TwoFASetup', {
                        twoFASetup: service.secureHDWallet.twoFASetup,
                      });
                    }
                  }}
                >
                  2FA
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {item.accountType == 'Test Account' || switchOn ? (
              <Image
                style={styles.cardBitCoinImage}
                source={require('../../assets/images/icons/icon_bitcoin_light.png')}
              />
            ) : currencyCode.includes(CurrencyCode) ? (
              <View
                style={{
                  marginRight: 5,
                  marginTop: 'auto',
                  marginLeft: 'auto',
                  marginBottom: wp('1.2%'),
                }}
              >
                {setCurrencyCodeToImage(
                  getCurrencyImageName(CurrencyCode),
                  'light',
                )}
              </View>
            ) : (
              <Image
                style={styles.cardBitCoinImage}
                source={getCurrencyImageByRegion(CurrencyCode, 'light')}
              />
            )}
            <Text style={styles.cardAmountText}>
              {item.accountType == 'Test Account'
                ? UsNumberFormat(netBalance)
                : switchOn
                ? UsNumberFormat(netBalance)
                : exchangeRates
                ? (
                    (netBalance / 1e8) *
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
  const scrollInterpolator = (index, carouselProps) => {
    const range = [1, 0, -1];
    const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
    const outputRange = range;
    return { inputRange, outputRange };
  };

  const slideInterpolatedStyle = (index, animatedValue, carouselProps) => {
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

  const getAccountNameFromType = () => {
    if (serviceType == TEST_ACCOUNT) return 'Test Account';
    else if (serviceType == REGULAR_ACCOUNT) return 'Checking Account';
    else return 'Savings Account';
  };

  const renderTransactionsContent = () => {
    const infoBoxInfoText =
      'All your recent transactions for the ' +
      getAccountNameFromType() +
      ' will appear here.';
    return (
      <TransactionsContent
        infoBoxInfoText={infoBoxInfoText}
        isFromAccount={true}
        transactionLoading={transactionLoading}
        transactions={transactions}
        AtCloseEnd={false}
        setTransactionItem={(item) =>
          this.setState({ selectedTransactionItem: item })
        }
        setTabBarZIndex={(index) => this.setState({ tabBarIndex: index })}
        TransactionDetailsBottomSheet={this.transactionDetailsBottomSheet}
      />
    );
  };

  const renderTransactionsHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          if (bottomSheet.current) (bottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  // const renderBuyHelperContents = () => {
  //   return (
  //     <TestAccountHelperModalContents
  //       topButtonText={'Buying Bitcoins from the Test Account'}
  //       helperInfo={
  //         'Lorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\nLorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\nLorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\nLorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\n'
  //       }
  //       continueButtonText={'Ok, got it'}
  //       onPressContinue={() => {
  //         (BuyHelperBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };
  // const renderBuyHelperHeader = () => {
  //   return (
  //     <SmallHeaderModal
  //       borderColor={Colors.blue}
  //       backgroundColor={Colors.blue}
  //       onPressHeader={() => {
  //         (BuyHelperBottomSheet as any).current.snapTo(0);
  //       }}
  //     />
  //   );
  // };

  const renderTestAccountsHelperContents = () => {
    return (
      // <TestAccountHelperModalContents
      //   topButtonText={`Test Account`}
      //   image={require('../../assets/images/icons/icon_test_white.png')}
      //   boldPara={``}
      //   helperInfo={`This account is designed for those who are new to Bitcoin, and for those who want to experiment with Bitcoin. It comes pre-loaded with test bitcoins that you can send to and receive from other Hexa test accounts`}
      //   continueButtonText={'Ok, got it'}
      //   onPressContinue={() => {
      //     if (TestAccountHelperBottomSheet.current)
      //       (TestAccountHelperBottomSheet as any).current.snapTo(0);
      //   }}
      // />
      <TestAccountHelpContents
        titleClicked={() => {
          if (TestAccountHelperBottomSheet.current)
            (TestAccountHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderTestAccountsHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          //console.log('isTestHelperDone', isTestHelperDone);
          if (isTestHelperDone) {
            if (TestAccountHelperBottomSheet.current)
              (TestAccountHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsTestHelperDone(false);
            }, 10);
          } else {
            if (TestAccountHelperBottomSheet.current)
              (TestAccountHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  const renderSecureAccountsHelperContents = useCallback(() => {
    return (
      // <TestAccountHelperModalContents
      //   topButtonText={'Savings Account'}
      //   image={require('../../assets/images/icons/secure.png')}
      //   boldPara={''}
      //   helperInfo={
      //     'The funds in this account are secured by two factor authentication (2FA) which should be set up on the Keeper device\n\nUse this account to store funds that you will not require on a daily basis. Transactions from and to this account are costlier compared to the Checking Account'
      //   }
      //   continueButtonText={'Ok, got it'}
      //   onPressContinue={() => {
      //     if (SecureAccountHelperBottomSheet.current)
      //       (SecureAccountHelperBottomSheet as any).current.snapTo(0);
      //   }}
      // />
      <SavingsAccountHelpContents
        titleClicked={() => {
          if (SecureAccountHelperBottomSheet.current)
            (SecureAccountHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderSecureAccountsHelperHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if (isSecureAccountHelperDone) {
            if (SecureAccountHelperBottomSheet.current)
              (SecureAccountHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsSecureAccountHelperDone(false);
            }, 10);
          } else {
            if (SecureAccountHelperBottomSheet.current)
              (SecureAccountHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  }, []);

  const renderRegularAccountsHelperContents = useCallback(() => {
    return (
      // <TestAccountHelperModalContents
      //   topButtonText={'Checking Account'}
      //   image={require('../../assets/images/icons/regular.png')}
      //   boldPara={''}
      //   helperInfo={
      //     'These are funds that you want to have easy access to for transactional needs\n\nTransfers from and to this account are typically cheap and fast'
      //   }
      //   continueButtonText={'Ok, got it'}
      //   onPressContinue={() => {
      //     if (RegularAccountHelperBottomSheet.current)
      //       (RegularAccountHelperBottomSheet as any).current.snapTo(0);
      //   }}
      // />
      <CheckingAccountHelpContents
        titleClicked={() => {
          if (RegularAccountHelperBottomSheet.current)
            (RegularAccountHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const checkNShowHelperModal = async () => {
    let isSendHelperDone = await AsyncStorage.getItem(
      'isTransactionHelperDone',
    );
    if (!isSendHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isTransactionHelperDone', 'true');
      setTimeout(() => {
        setIsHelperDone(true);
      }, 10);

      setTimeout(() => {
        (TransactionDetailsHelperBottomSheet.current as any).snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsHelperDone(false);
      }, 10);
    }
  };

  const renderTransactionDetailsContents = useCallback(() => {
    return (
      <TransactionDetails
        item={transactionItem}
        serviceType={serviceType}
        getServiceType={getServiceType}
        onPressKnowMore={() => {
          AsyncStorage.setItem('isTransactionHelperDone', 'true');
          (TransactionDetailsHelperBottomSheet.current as any).snapTo(1);
        }}
      />
    );
  }, [transactionItem]);

  const renderTransactionDetailsHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.white}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          if (TransactionDetailsBottomSheet.current)
            (TransactionDetailsBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [transactionItem]);

  const renderHelperContents = () => {
    return (
      // <TestAccountHelperModalContents
      //   topButtonText={`Transaction Details`}
      //   helperInfo={`This is where you can see the details of your transaction\n\nThe number of confirmations tells you the surety of your transaction. Generally 3-6 confirmations is considered secure depending on the amount sent`}
      //   continueButtonText={'Ok, got it'}
      //   onPressContinue={() => {
      //     (TransactionDetailsHelperBottomSheet as any).current.snapTo(0);
      //   }}
      // />
      <TransactionHelperModalContents
        titleClicked={() => {
          if (TransactionDetailsHelperBottomSheet.current)
            (TransactionDetailsHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          //console.log('isHelperDone', isHelperDone);
          if (isHelperDone) {
            (TransactionDetailsHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsHelperDone(false);
            }, 10);
          } else {
            (TransactionDetailsHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  const renderRegularAccountsHelperHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          //console.log('isRegularAccountHelperDone', isRegularAccountHelperDone);
          if (isRegularAccountHelperDone) {
            if (RegularAccountHelperBottomSheet.current)
              (RegularAccountHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsRegularAccountHelperDone(false);
            }, 10);
          } else {
            if (RegularAccountHelperBottomSheet.current)
              (RegularAccountHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  }, []);

  useEffect(() => {
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
      setNetBalance(currentBalance);
      setSpendableBalance(spendableBalance);
      setTransactions(currentTransactions);
    }
  }, [service]);

  useEffect(() => {
    setTimeout(() => {
      setTransactionLoading(false);
    }, 1000);
  }, [transactions]);

  const dispatch = useDispatch();
  useEffect(() => {
    // if (!netBalance) {
    //   // if (serviceType === TEST_ACCOUNT) dispatch(getTestcoins(serviceType));
    //   dispatch(fetchBalance(serviceType, { fetchTransactionsSync: true })); // TODO: do periodic auto search
    //   // dispatch(fetchTransactions(serviceType));
    // }
    if (serviceType === SECURE_ACCOUNT) {
      AsyncStorage.getItem('isSecureAccountHelperDone').then((done) => {
        if (!done) {
          AsyncStorage.setItem('isSecureAccountHelperDone', 'true');
          setTimeout(() => {
            setIsSecureAccountHelperDone(true);
          }, 10);
          // setTimeout(() => {
          //   if (SecureAccountHelperBottomSheet.current) {
          //     (SecureAccountHelperBottomSheet.current as any).snapTo(1);
          //   }
          // }, 1000);
        } else {
          setTimeout(() => {
            setIsSecureAccountHelperDone(false);
          }, 10);
        }
      });
    }
    if (serviceType === REGULAR_ACCOUNT) {
      AsyncStorage.getItem('isRegularAccountHelperDone').then((done) => {
        if (!done) {
          AsyncStorage.setItem('isRegularAccountHelperDone', 'true');
          setTimeout(() => {
            setIsRegularAccountHelperDone(true);
          }, 10);
          setTimeout(() => {
            // if (RegularAccountHelperBottomSheet.current) {
            //   (RegularAccountHelperBottomSheet as any).current.snapTo(1);
            // }
          }, 1000);
        } else {
          setTimeout(() => {
            setIsRegularAccountHelperDone(false);
          }, 10);
        }
      });
    }
  }, [serviceType]);

  useEffect(() => {
    if (showLoader) {
      // after all interactions are done , loader need to be removed
      InteractionManager.runAfterInteractions(() => {
        setShowLoader(false);
        return;
      });

      // we need to force remove loader if interaction manager did not response in 3 secs
      InteractionManager.setDeadline(3);
    } else {
      return;
    }
  });

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
            props.navigation.navigate('Home');
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
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
                currencyCode.includes(CurrencyCode)
                  ? setCurrencyCodeToImage(
                      getCurrencyImageName(CurrencyCode),
                      'light',
                    )
                  : getCurrencyImageByRegion(CurrencyCode, 'light')
              }
              inactiveOffImage={
                currencyCode.includes(CurrencyCode)
                  ? setCurrencyCodeToImage(
                      getCurrencyImageName(CurrencyCode),
                      'dark',
                    )
                  : getCurrencyImageByRegion(CurrencyCode, 'dark')
              }
              toggleColor={Colors.lightBlue}
              toggleCircleColor={Colors.blue}
              onpress={async () => {
                setSwitchOn(!switchOn);
                let temp = !switchOn ? 'true' : '';
                await AsyncStorage.setItem('currencyToggleValue', temp);
              }}
              toggle={switchOn}
            />
          </View>
        </TouchableOpacity>
      </View>
      {is_initiated ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              backgroundColor: Colors.backgroundColor,
            }}
            refreshControl={
              <RefreshControl
                refreshing={balanceTxLoading || derivativeBalanceTxLoading}
                onRefresh={() => {
                  // dispatch(fetchTransactions(serviceType));
                  dispatch(
                    fetchBalanceTx(serviceType, {
                      loader: true,
                      syncTrustedDerivative:
                        serviceType === REGULAR_ACCOUNT ||
                        serviceType === SECURE_ACCOUNT
                          ? true
                          : false,
                    }),
                  );
                }}
              />
            }
          >
            <View style={{ paddingTop: hp('3%'), paddingBottom: hp('3%') }}>
              <Carousel
                ref={carousel}
                data={carouselData}
                firstItem={carouselInitIndex}
                initialNumToRender={carouselInitIndex}
                // onBeforeSnapToItem={(index) => {
                //   console.log('onBeforeSnapToItem', index);
                //   index === 0
                //     ? getServiceType(TEST_ACCOUNT)
                //     : index === 1
                //     ? getServiceType(REGULAR_ACCOUNT)
                //     : getServiceType(SECURE_ACCOUNT);
                //   // setTimeout(() => {
                //   //   setCarouselInitIndex(index);
                //   // }, 200);
                // }}
                renderItem={renderItem}
                sliderWidth={sliderWidth}
                itemWidth={sliderWidth * 0.95}
                onSnapToItem={(index) => {
                  //console.log('onSnapToItem', index, carouselInitIndex);
                  index === 0
                    ? getServiceType(TEST_ACCOUNT)
                    : index === 1
                    ? getServiceType(REGULAR_ACCOUNT)
                    : getServiceType(SECURE_ACCOUNT);
                }}
                style={{ activeSlideAlignment: 'center' }}
                scrollInterpolator={scrollInterpolator}
                slideInterpolatedStyle={slideInterpolatedStyle}
                useScrollView={true}
                extraData={carouselInitIndex}
              />
            </View>
            <TouchableWithoutFeedback
              onPress={() => {
                if (TestAccountHelperBottomSheet.current)
                  (TestAccountHelperBottomSheet.current as any).snapTo(0);
                if (RegularAccountHelperBottomSheet.current)
                  (RegularAccountHelperBottomSheet.current as any).snapTo(0);
                if (SecureAccountHelperBottomSheet.current)
                  (SecureAccountHelperBottomSheet.current as any).snapTo(0);
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
                      : null}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.FiraSansMediumItalic,
                      color: Colors.textColorGrey,
                      fontSize: RFValue(10),
                      marginBottom: 1,
                    }}
                  >
                    {serviceType == TEST_ACCOUNT
                      ? ' t-sats'
                      : switchOn
                      ? ' sats'
                      : CurrencyCode.toLocaleLowerCase()}
                  </Text>
                </View>
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
                      if (bottomSheet.current)
                        (bottomSheet as any).current.snapTo(1);
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
                      <View style={{ backgroundColor: Colors.backgroundColor }}>
                        <View style={styles.separatorView} />
                      </View>
                    )}
                    renderItem={({ item, index }) => {
                      return (
                        <TouchableOpacity
                          onPress={
                            () => {
                              (TransactionDetailsBottomSheet as any).current.snapTo(
                                1,
                              );
                              checkNShowHelperModal();
                              setTimeout(() => {
                                setTransactionItem(item);
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
            <TouchableWithoutFeedback
              onPress={() => {
                if (TestAccountHelperBottomSheet.current)
                  (TestAccountHelperBottomSheet.current as any).snapTo(0);
                if (RegularAccountHelperBottomSheet.current)
                  (RegularAccountHelperBottomSheet.current as any).snapTo(0);
                if (SecureAccountHelperBottomSheet.current)
                  (SecureAccountHelperBottomSheet.current as any).snapTo(0);
              }}
            >
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
                      props.navigation.navigate('Send', {
                        serviceType,
                        getServiceType: getServiceType,
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
                        Avg. Fee :{' '}
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
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      props.navigation.navigate('Receive', {
                        serviceType,
                        getServiceType: getServiceType,
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
            </TouchableWithoutFeedback>
          </ScrollView>
          {showLoader ? <Loader /> : null}

          <BottomSheet
            enabledInnerScrolling={true}
            ref={bottomSheet as any}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('60%')
                : hp('60%'),
            ]}
            renderContent={renderTransactionsContent}
            renderHeader={renderTransactionsHeader}
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
            ref={TestAccountHelperBottomSheet as any}
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
            renderContent={renderTestAccountsHelperContents}
            renderHeader={renderTestAccountsHelperHeader}
          />
          <BottomSheet
            enabledInnerScrolling={true}
            ref={SecureAccountHelperBottomSheet as any}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('87%')
                : hp('89%'),
            ]}
            renderContent={renderSecureAccountsHelperContents}
            renderHeader={renderSecureAccountsHelperHeader}
          />
          <BottomSheet
            enabledInnerScrolling={true}
            ref={RegularAccountHelperBottomSheet as any}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('87%')
                : hp('89%'),
            ]}
            renderContent={renderRegularAccountsHelperContents}
            renderHeader={renderRegularAccountsHelperHeader}
          />
          <BottomSheet
            enabledInnerScrolling={true}
            ref={TransactionDetailsBottomSheet as any}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && DeviceInfo.hasNotch()
                ? hp('88%')
                : hp('88%'),
            ]}
            renderContent={renderTransactionDetailsContents}
            renderHeader={renderTransactionDetailsHeader}
          />

          <BottomSheet
            enabledInnerScrolling={true}
            ref={TransactionDetailsHelperBottomSheet as any}
            snapPoints={[
              -50,
              Platform.OS == 'ios' && deviceInfoModule.hasNotch()
                ? hp('87%')
                : hp('89%'),
              // Platform.OS == 'ios' && DeviceInfo.hasNotch()
              //   ? hp('35%')
              //   : hp('40%'),
            ]}
            renderContent={renderHelperContents}
            renderHeader={renderHelperHeader}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            backgroundColor: Colors.backgroundColor,
          }}
          refreshControl={<RefreshControl refreshing={!is_initiated} />}
        />
      )}
    </View>
  );
  //  } else {
  //    return(
  //   <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
  //   <SafeAreaView style={{ flex: 0 }} />
  //   <StatusBar
  //     backgroundColor={Colors.backgroundColor}
  //     barStyle="dark-content"
  //   />

  //   <View
  //     style={{
  //       ...CommonStyles.headerContainer,
  //       justifyContent: 'space-between',
  //       backgroundColor: Colors.backgroundColor,
  //       borderBottomWidth: 0,
  //     }}
  //   >
  //     <TouchableOpacity
  //       style={{ ...CommonStyles.headerLeftIconContainer }}
  //       onPress={() => {
  //         props.navigation.navigate('Home');
  //       }}
  //     >
  //       <View style={CommonStyles.headerLeftIconInnerContainer}>
  //         <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
  //       </View>
  //     </TouchableOpacity>
  //     <Text
  //       style={{
  //         color: Colors.blue,
  //         fontSize: RFValue(20),
  //         fontFamily: Fonts.FiraSansRegular,
  //         textAlign: 'center',
  //       }}
  //     >
  //       Accounts
  //     </Text>
  //     <TouchableOpacity
  //       style={{ height: 54, justifyContent: 'center' }}
  //       onPress={() => {}}
  //     >
  //       <View
  //         style={{
  //           ...CommonStyles.headerLeftIconInnerContainer,
  //           paddingRight: 30,
  //         }}
  //       >
  //         <ToggleSwitch
  //           activeOnImage={require('../../assets/images/icons/icon_bitcoin_light.png')}
  //           inactiveOnImage={require('../../assets/images/icons/icon_bitcoin_dark.png')}
  //           activeOffImage={require('../../assets/images/icons/icon_dollar_white.png')}
  //           inactiveOffImage={require('../../assets/images/icons/icon_dollar_dark.png')}
  //           toggleColor={Colors.lightBlue}
  //           toggleCircleColor={Colors.blue}
  //           onpress={() => {
  //             setSwitchOn(!switchOn);
  //           }}
  //           toggle={switchOn}
  //         />
  //       </View>
  //     </TouchableOpacity>
  //   </View>

  //   <ScrollView
  //     contentContainerStyle={{
  //       backgroundColor: Colors.backgroundColor,
  //     }}
  //     refreshControl={
  //       <RefreshControl
  //         refreshing={!is_initiated}
  //       />
  //     }
  //   />
  //   </View>

  //    )
  //   }
}

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
});
