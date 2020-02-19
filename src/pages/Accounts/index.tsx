import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Alert,
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
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import SendModalContents from '../../components/SendModalContents';
import CustodianRequestOtpModalContents from '../../components/CustodianRequestOtpModalContents';
import SendStatusModalContents from '../../components/SendStatusModalContents';
import { useDispatch, useSelector } from 'react-redux';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';
import CopyThisText from '../../components/CopyThisText';
import BottomInfoBox from '../../components/BottomInfoBox';
import {
  fetchBalance,
  fetchTransactions,
  getTestcoins,
  fetchBalanceTx,
} from '../../store/actions/accounts';
import { ScrollView } from 'react-native-gesture-handler';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';

// import { copilot, walkthroughable, CopilotStep } from 'react-native-copilot';
// import TooltipComponent from '../../components/Copilot/CopilotTooltip';
import moment from 'moment';
import axios from 'axios';

// const WalkthroughableText = walkthroughable(Text);
// const WalkthroughableImage = walkthroughable(Image);
// const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);
// const WalkthroughableView = walkthroughable(View);
import { UsNumberFormat } from '../../common/utilities';
import { keyFetched } from '../../store/actions/storage';

export default function Accounts(props) {
  const [serviceType, setServiceType] = useState(
    props.navigation.state.params
      ? props.navigation.getParam('serviceType')
      : TEST_ACCOUNT,
  );
  const sliderWidth = Dimensions.get('window').width;
  const [SendIsActive, setSendIsActive] = useState(true);
  const [ReceiveIsActive, setReceiveIsActive] = useState(true);
  const [BuyIsActive, setBuyIsActive] = useState(true);
  const [SellIsActive, setSellIsActive] = useState(true);
  const [TransactionIsActive, setTransactionIsActive] = useState(true);
  const [TransactionDetailsIsActive, setTransactionDetailsIsActive] = useState(
    true,
  );

  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const [SendBottomSheet, setSendBottomSheet] = useState(React.createRef());
  const [ReceiveBottomSheet, setReceiveBottomSheet] = useState(
    React.createRef(),
  );
  const [
    CustodianRequestOtpBottomSheet,
    setCustodianRequestOtpBottomSheet,
  ] = useState(React.createRef());
  const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
    React.createRef(),
  );
  const [SendErrorBottomSheet, setSendErrorBottomSheet] = useState(
    React.createRef(),
  );

  const [ReceiveHelperBottomSheet, setReceiveHelperBottomSheet] = useState(
    React.createRef(),
  );
  const [BuyHelperBottomSheet, setBuyHelperBottomSheet] = useState(
    React.createRef(),
  );
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

  const [carouselData, setCarouselData] = useState([
    {
      accountType: 'Test Account',
      accountInfo: 'Learn Bitcoin',
      backgroundImage: require('../../assets/images/carouselImages/test_account_background.png'),
      accountTypeImage: require('../../assets/images/icons/icon_test_white.png'),
    },
    {
      accountType: 'Regular Account',
      accountInfo: 'Fast and easy',
      backgroundImage: require('../../assets/images/carouselImages/regular_account_background.png'),
      accountTypeImage: require('../../assets/images/icons/icon_regular_account.png'),
    },
    {
      accountType: 'Savings Account',
      accountInfo: 'Multi-factor security',
      backgroundImage: require('../../assets/images/carouselImages/savings_account_background.png'),
      accountTypeImage: require('../../assets/images/icons/icon_secureaccount_white.png'),
    },
  ]);

  let [carouselInitIndex, setCarouselInitIndex] = useState(
    props.navigation.state.params ? props.navigation.getParam('index') : 1,
  );
  const [switchOn, setSwitchOn] = useState(true);
  let [carousel, setCarousel] = useState(React.createRef());

  const handleIndexChange = (index: number) => {
    //setTimeout(() => {
    setCarouselInitIndex(index);
    //}, 2000);
  };
  const [isTestHelperDone, setIsTestHelperDone] = useState(true);
  const [isRegularAccountHelperDone, setIsRegularAccountHelperDone] = useState(
    true,
  );
  const [isSecureAccountHelperDone, setIsSecureAccountHelperDone] = useState(
    true,
  );
  const service = useSelector(state => state.accounts[serviceType].service);
  const loader = useSelector(
    state => state.accounts[serviceType].loading.balances,
  );
  const wallet =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
  const [netBalance, setNetBalance] = useState(
    wallet.balances.balance + wallet.balances.unconfirmedBalance,
  );
  const [transactions, setTransactions] = useState(wallet.transactions);
  const [staticFees, setStaticFees] = useState(0);
  const [exchangeRates, setExchangeRates] = useState();

  const checkNHighlight = async () => {
    let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
    let isReceiveHelperDone = await AsyncStorage.getItem('isReceiveHelperDone');
    let isBuyHelperDone = await AsyncStorage.getItem('isBuyHelperDone');
    let isSellHelperDone = await AsyncStorage.getItem('isSellHelperDone');
    let isTransactionHelperDone = await AsyncStorage.getItem(
      'isTransactionHelperDone',
    );
    let isTransactionDetailsHelperDone = await AsyncStorage.getItem(
      'isTransactionDetailsHelperDone',
    );
    let isTestAccountHelperDone = await AsyncStorage.getItem(
      'isTestAccountHelperDone',
    );

    if (isSendHelperDone == 'true') {
      setSendIsActive(false);
    }
    if (isReceiveHelperDone == 'true') {
      setReceiveIsActive(false);
    }
    if (isBuyHelperDone == 'true') {
      setBuyIsActive(false);
    }
    if (isSellHelperDone == 'true') {
      setSellIsActive(false);
      props.stop();
    }
    if (isTransactionHelperDone == 'true') {
      setTransactionIsActive(false);
    }
    if (isTransactionDetailsHelperDone == 'true') {
      setTransactionDetailsIsActive(false);
    }
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
          TestAccountHelperBottomSheet.current.snapTo(1);
        }
      }, 1000);
    } else {
      setTimeout(() => {
        setIsTestHelperDone(false);
      }, 10);
      // props.copilotEvents.on('stepChange', handleStepChange);
      // setTimeout(()=>{
      //   props.start();
      // }, 300);
    }
  };

  const handleStepChange = step => {
    console.log(`Current step is: ${step.name}`);
  };

  const getServiceType = serviceType => {
    if (!serviceType) return;
    setTimeout(() => {
      setServiceType(serviceType);
    }, 10);
    console.log('Service type in getServiceType', serviceType);
    if (serviceType == TEST_ACCOUNT) checkNHighlight();
  };

  const renderSendContents = () => {
    return (
      <SendModalContents
        onPressBack={() => {
          if (SendBottomSheet.current)
            (SendBottomSheet as any).current.snapTo(0);
        }}
        onPressContinue={() => {
          if (SendBottomSheet.current)
            (SendBottomSheet as any).current.snapTo(0);
          if (CustodianRequestOtpBottomSheet.current)
            (CustodianRequestOtpBottomSheet as any).current.snapTo(1);
        }}
        modalRef={SendBottomSheet}
      />
    );
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
              {item.accountType == 'Regular Account'
                ? 'Checking Account'
                : item.accountType}
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
                  marginRight: 10,
                  fontFamily: Fonts.FiraSansMedium,
                  fontSize: RFValue(15),
                  color: Colors.white,
                  alignSelf: 'center',
                  padding: 10,
                }}
                onPress={() => {
                  console.log('item.accountType', item.accountType);
                  if (item.accountType == 'Test Account') {
                    if (TestAccountHelperBottomSheet.current)
                      TestAccountHelperBottomSheet.current.snapTo(1);
                  } else if (item.accountType == 'Savings Account') {
                    if (SecureAccountHelperBottomSheet.current)
                      SecureAccountHelperBottomSheet.current.snapTo(1);
                  } else if (item.accountType == 'Regular Account') {
                    if (RegularAccountHelperBottomSheet.current)
                      RegularAccountHelperBottomSheet.current.snapTo(1);
                  }
                }}
              >
                Know more
              </Text>
            }
            <Image
              style={{
                marginLeft: 'auto',
                width: wp('5%'),
                height: wp('5%'),
                resizeMode: 'contain',
                padding: 10,
              }}
              source={require('../../assets/images/icons/icon_settings.png')}
            />
          </View>
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
                  props.navigation.navigate('SecureScan', {
                    serviceType,
                    getServiceType: getServiceType,
                  });
                }}
              >
                2FA
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ flexDirection: 'row' }}>
            {item.accountType == 'Test Account' || switchOn ? (
              <Image
                style={styles.cardBitCoinImage}
                source={require('../../assets/images/icons/icon_bitcoin_light.png')}
              />
            ) : (
              <Image
                style={styles.cardBitCoinImage}
                source={require('../../assets/images/icons/icon_dollar_white.png')}
              />
            )}
            <Text style={styles.cardAmountText}>
              {item.accountType == 'Test Account'
                ? UsNumberFormat(netBalance)
                : switchOn
                ? UsNumberFormat(netBalance)
                : exchangeRates
                ? ((netBalance / 1e8) * exchangeRates['USD'].last).toFixed(2)
                : null}
            </Text>
            <Text style={styles.cardAmountUnitText}>
              {item.accountType == 'Test Account'
                ? 't-sats'
                : switchOn
                ? 'sats'
                : 'usd'}
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

  const renderTransactionsContent = () => {
    return transactions.transactionDetails.length ? (
      <View style={styles.modalContentContainer}>
        <View style={{ marginLeft: 20, marginTop: 20 }}>
          <Text style={styles.modalHeaderTitleText}>{'Transactions'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ height: 'auto' }}>
            <FlatList
              data={transactions.transactionDetails}
              ItemSeparatorComponent={() => (
                <View style={{ backgroundColor: Colors.white }}>
                  <View style={styles.separatorView} />
                </View>
              )}
              renderItem={({ item }) => {
                return (
                  <AppBottomSheetTouchableWrapper
                    onPress={() =>
                      props.navigation.navigate('TransactionDetails', {
                        item,
                        serviceType,
                        getServiceType: getServiceType,
                      })
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
                      <View
                        style={{ justifyContent: 'center', marginLeft: 10 }}
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
                    />
                    {item.time} */}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionModalAmountView}>
                      <Image
                        source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
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
                        {/* {switchOn
                      ? item.amount
                      : (
                          (item.amount / 1e8) *
                          exchangeRates['USD'].last
                        ).toFixed(2)} */}
                        {item.amount}
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
                );
              }}
            />
          </View>
          {transactions.transactionDetails.length <= 1 ? (
            <View
              style={{
                flex: 1,
                marginTop: hp('15%'),
                alignItems: 'center',
                padding: wp('10%'),
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
                All your recent transactions across all accounts will appear
                here
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
            All your recent transactions across all accounts will appear here
          </Text>
        </View>
      </View>
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
      // <TransparentHeaderModal
      //   onPressheader={() => {
      //     (bottomSheet as any).current.snapTo(0);
      //   }}
      // />
    );
  };
  const renderSendModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          if (SendBottomSheet.current)
            (SendBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSendOtpModalContents = () => {
    return (
      <CustodianRequestOtpModalContents
        title1stLine={'Enter OTP to'}
        title2ndLine={'authenticate'}
        info1stLine={'Lorem ipsum dolor sit amet, consectetur'}
        info2ndLine={'adipiscing elit, sed do eiusmod tempor'}
        subInfo1stLine={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'
        }
        subInfo2ndLine={'sed do eiusmod tempor incididunt ut labore et dolore'}
        modalRef={CustodianRequestOtpBottomSheet}
        onPressConfirm={() => {
          if (CustodianRequestOtpBottomSheet.current)
            (CustodianRequestOtpBottomSheet as any).current.snapTo(0);
          if (SendSuccessBottomSheet.current)
            (SendSuccessBottomSheet as any).current.snapTo(1);
        }}
      />
    );
  };
  const renderSendOTPModalHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          if (CustodianRequestOtpBottomSheet.current)
            (CustodianRequestOtpBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSuccessStatusContents = () => {
    return (
      <SendStatusModalContents
        title1stLine={'Sent Successfully'}
        title2ndLine={'to Contact'}
        info1stLine={'Bitcoins successfully sent to Contact'}
        info2ndLine={''}
        userName={'Arpan Jain'}
        modalRef={SendSuccessBottomSheet}
        isSuccess={true}
        onPressViewAccount={() => {
          if (SendSuccessBottomSheet.current)
            (SendSuccessBottomSheet as any).current.snapTo(0);
        }}
        transactionId={'38123819421304'}
        transactionDateTime={'11:00am, 19 June 2019'}
      />
    );
  };
  const renderSendSuccessHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          if (SendSuccessBottomSheet.current)
            (SendSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderSendErrorContents = () => {
    return (
      <SendStatusModalContents
        title1stLine={'Could not Send '}
        title2ndLine={'Amount to Contact'}
        info1stLine={'There seems to be a problem'}
        info2ndLine={''}
        subInfo1stLine={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
        }
        subInfo2ndLine={'sed do eiusmod tempor incididunt ut labore et dolore'}
        userName={'Arpan Jain'}
        modalRef={SendErrorBottomSheet}
        isSuccess={false}
        onPressTryAgain={() => {
          if (SendErrorBottomSheet.current)
            (SendErrorBottomSheet as any).current.snapTo(0);
        }}
        onPressSkip={() => {
          if (SendErrorBottomSheet.current)
            (SendErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderSendErrorHeader = () => {
    return (
      <TransparentHeaderModal
        onPressheader={() => {
          if (SendErrorBottomSheet.current)
            (SendErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderBuyHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={'Buying Bitcoins from the Test Account'}
        helperInfo={
          'Lorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\nLorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\nLorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\nLorem ipsum dolor sit amet, consetetur\nsadipscing elitr, sed diam nonumy eirmod\ntempor invidunt ut labore et dolore magna\n\n'
        }
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          (BuyHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderBuyHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          (BuyHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderTestAccountsHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={`Test Account`}
        image={require('../../assets/images/icons/icon_test_white.png')}
        boldPara={``}
        helperInfo={`If you are new to Bitcoin, this account is designed for you. It comes pre-loaded with some test bitcoins\n\nYou can even send and receive test bitcoins from other Hexa wallet test accounts`}
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          if (TestAccountHelperBottomSheet.current)
            (TestAccountHelperBottomSheet as any).current.snapTo(0);
          // props.copilotEvents.on('stepChange', handleStepChange);
          // props.start();
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
          console.log('isTestHelperDone', isTestHelperDone);
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
      <TestAccountHelperModalContents
        topButtonText={'Savings Account'}
        image={require('../../assets/images/icons/secure.png')}
        boldPara={''}
        helperInfo={
          'The funds in this account are secured by two factor authentication which is set up on your secondary device\n\nUse this account to store most of your funds. Something you will not need on an ongoing basis'
        }
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
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
          //(SecureAccountHelperBottomSheet as any).current.snapTo(0);
          console.log('isSecureAccountHelperDone', isSecureAccountHelperDone);
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
      <TestAccountHelperModalContents
        topButtonText={'Checking Account'}
        image={require('../../assets/images/icons/regular.png')}
        boldPara={''}
        helperInfo={
          'These are the funds that you have easy access to for your transactional needs\n\nTransfers from this account are typically cheaper and faster'
        }
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          if (RegularAccountHelperBottomSheet.current)
            (RegularAccountHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderRegularAccountsHelperHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          console.log('isRegularAccountHelperDone', isRegularAccountHelperDone);
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
      const currentBalance =
        wallet.balances.balance + wallet.balances.unconfirmedBalance;
      if (netBalance !== currentBalance) {
        setNetBalance(currentBalance);
      }
      if (transactions !== wallet.transactions)
        setTransactions(wallet.transactions);
    }
  }, [service]);

  const dispatch = useDispatch();
  useEffect(() => {
    // if (!netBalance) {
    //   // if (serviceType === TEST_ACCOUNT) dispatch(getTestcoins(serviceType));
    //   dispatch(fetchBalance(serviceType, { fetchTransactionsSync: true })); // TODO: do periodic auto search
    //   // dispatch(fetchTransactions(serviceType));
    // }
    if (serviceType === SECURE_ACCOUNT) {
      AsyncStorage.getItem('isSecureAccountHelperDone').then(done => {
        if (!done) {
          AsyncStorage.setItem('isSecureAccountHelperDone', 'true');
          setTimeout(() => {
            setIsSecureAccountHelperDone(true);
          }, 10);
          setTimeout(() => {
            if (SecureAccountHelperBottomSheet.current) {
              SecureAccountHelperBottomSheet.current.snapTo(1);
            }
          }, 1000);
        } else {
          setTimeout(() => {
            setIsSecureAccountHelperDone(false);
          }, 10);
        }
      });
    }
    if (serviceType === REGULAR_ACCOUNT) {
      AsyncStorage.getItem('isRegularAccountHelperDone').then(done => {
        if (!done) {
          AsyncStorage.setItem('isRegularAccountHelperDone', 'true');
          setTimeout(() => {
            setIsRegularAccountHelperDone(true);
          }, 10);
          setTimeout(() => {
            if (RegularAccountHelperBottomSheet.current) {
              (RegularAccountHelperBottomSheet as any).current.snapTo(1);
            }
          }, 1000);
        } else {
          setTimeout(() => {
            setIsRegularAccountHelperDone(false);
          }, 10);
        }
      });
    }
    console.log('IN useEffect1');
  }, [serviceType]);

  useEffect(() => {
    setTimeout(() => {
      if (carousel.current) {
        if (props.navigation.state.params) {
          carousel.current.snapToItem(
            props.navigation.getParam('index'),
            true,
            true,
          );
        } else {
          carousel.current.snapToItem(1, true, true);
        }
      }
    }, 2000);
    getServiceType(serviceType);
    (async () => {
      const storedStaticFees = await AsyncStorage.getItem('storedStaticFees');
      if (storedStaticFees) {
        const { staticFees, lastFetched } = JSON.parse(storedStaticFees);
        if (Date.now() - lastFetched < 1800000) {
          setStaticFees(staticFees);
          return;
        } // maintaining a half an hour difference b/w fetches
      }

      const instance = service.hdWallet || service.secureHDWallet;
      const staticFees = await instance.getStaticFee();
      setStaticFees(staticFees);
      await AsyncStorage.setItem(
        'storedStaticFees',
        JSON.stringify({ staticFees, lastFetched: Date.now() }),
      );

      const storedExchangeRates = await AsyncStorage.getItem('exchangeRates');
      if (storedExchangeRates) {
        const exchangeRates = JSON.parse(storedExchangeRates);
        setExchangeRates(exchangeRates);
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
              activeOnImage={require('../../assets/images/icons/icon_bitcoin_light.png')}
              inactiveOnImage={require('../../assets/images/icons/icon_bitcoin_dark.png')}
              activeOffImage={require('../../assets/images/icons/icon_dollar_white.png')}
              inactiveOffImage={require('../../assets/images/icons/icon_dollar_dark.png')}
              toggleColor={Colors.lightBlue}
              toggleCircleColor={Colors.blue}
              onpress={() => {
                setSwitchOn(!switchOn);
              }}
              toggle={switchOn}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          backgroundColor: Colors.backgroundColor,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loader}
            onRefresh={() => {
              // dispatch(fetchTransactions(serviceType));
              dispatch(
                fetchBalanceTx(serviceType, {
                  loader: true,
                }),
              );
            }}
          />
        }
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (TestAccountHelperBottomSheet.current)
              TestAccountHelperBottomSheet.current.snapTo(0);
          }}
        >
          <View style={{ paddingTop: hp('3%'), paddingBottom: hp('3%') }}>
            <Carousel
              ref={carousel}
              data={carouselData}
              firstItem={carouselInitIndex}
              onBeforeSnapToItem={index => {
                console.log(
                  'INDEX onBeforeSnapToItem',
                  index,
                  carouselInitIndex,
                );
                index === 0
                  ? getServiceType(TEST_ACCOUNT)
                  : index === 1
                  ? getServiceType(REGULAR_ACCOUNT)
                  : getServiceType(SECURE_ACCOUNT);
                handleIndexChange(index);
              }}
              renderItem={renderItem}
              sliderWidth={sliderWidth}
              itemWidth={sliderWidth * 0.95}
              onSnapToItem={index => {
                console.log('INDEX', index, carouselInitIndex);
                setTimeout(() => {
                  setCarouselInitIndex(index);
                }, 2000);
              }}
              style={{ activeSlideAlignment: 'center' }}
              scrollInterpolator={scrollInterpolator}
              slideInterpolatedStyle={slideInterpolatedStyle}
              useScrollView={true}
              extraData={carouselInitIndex}
            />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => {
            if (TestAccountHelperBottomSheet.current)
              TestAccountHelperBottomSheet.current.snapTo(0);
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
                data={transactions.transactionDetails.slice(0, 3)}
                ItemSeparatorComponent={() => (
                  <View style={{ backgroundColor: Colors.backgroundColor }}>
                    <View style={styles.separatorView} />
                  </View>
                )}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate('TransactionDetails', {
                          item,
                          serviceType,
                          getServiceType: getServiceType,
                        })
                      }
                      style={styles.transactionModalElementView}
                    >
                      {index == 0 ? (
                        // <CopilotStep
                        //   item={item}
                        //   active={TransactionIsActive}
                        //   text="Here are your transactions"
                        //   order={3}
                        //   name="transaction"
                        // >
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
                            style={{ justifyContent: 'center', marginLeft: 10 }}
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
                        // </CopilotStep>
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
                            style={{ justifyContent: 'center', marginLeft: 10 }}
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
                          }}
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
                        {index == 0 ? (
                          // <CopilotStep
                          //   active={TransactionDetailsIsActive}
                          //   text="You can get more details here"
                          //   order={4}
                          //   name="transactionDetails"
                          // >
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
                          // </CopilotStep>
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
              TestAccountHelperBottomSheet.current.snapTo(0);
          }}
        >
          <View style={{ marginTop: hp('2%') }}>
            <View
              style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10 }}
            >
              {/* <CopilotStep
              active={SendIsActive}
              text="Try Sending"
              order={1}
              name="sendTransaction"
              > */}
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('Send', {
                    serviceType,
                    getServiceType: getServiceType,
                    staticFees,
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
                    source={require('../../assets/images/icons/icon_send.png')}
                    style={styles.bottomCardSendReceiveImage}
                  />
                </View>
                <View style={{ flex: 3, marginLeft: wp('3%') }}>
                  <Text style={styles.bottomCardTitleText}>Send</Text>
                  <Text style={styles.bottomCardInfoText}>
                    Tran Fee : {staticFees['high']} (
                    {serviceType === TEST_ACCOUNT ? 't-sats' : 'sats'})
                  </Text>
                </View>
              </TouchableOpacity>
              {/* </CopilotStep>
            <CopilotStep
              active={ReceiveIsActive}
              text="Try Receiving"
              order={2}
              name="receiveTransaction"
            > */}
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate('ReceivingAddress', {
                    serviceType,
                    getServiceType: getServiceType,
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
                  <Text style={styles.bottomCardInfoText}>
                    Tran Fee : {staticFees['high']} (
                    {serviceType === TEST_ACCOUNT ? 't-sats' : 'sats'})
                  </Text>
                </View>
              </TouchableOpacity>
              {/* </CopilotStep> */}
            </View>
            <View
              style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10 }}
            >
              {/* <CopilotStep
              active={BuyIsActive}
              text="Buy your bitcoins here"
              order={5}
              name="Buy"
            > */}
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
                    Ex Rate : {exchangeRates ? exchangeRates['USD'].last : 0}{' '}
                    (usd)
                  </Text>
                </View>
              </TouchableOpacity> */}
              {/* </CopilotStep>
            <CopilotStep
              active={SellIsActive}
              text="Sell your bitcoins here"
              order={6}
              name="Sell"
            > */}
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
                    Ex Rate : {exchangeRates ? exchangeRates['USD'].last : 0}{' '}
                    (usd)
                  </Text>
                </View>
              </TouchableOpacity> */}
              {/* </CopilotStep> */}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <BottomSheet
        enabledInnerScrolling={true}
        ref={bottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('60%') : hp('60%'),
        ]}
        renderContent={renderTransactionsContent}
        renderHeader={renderTransactionsHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendBottomSheet}
        snapPoints={[
          -50,
          hp('90%'),
          Platform.OS == 'android' ? hp('50%') : hp('90%'),
        ]}
        renderContent={renderSendContents}
        renderHeader={renderSendModalHeader}
      />
      {/* <BottomSheet
        enabledInnerScrolling={true}
        ref={ReceiveBottomSheet}
        snapPoints={[-50, hp("90%")]}
        renderContent={renderReceivingAddrContents}
        renderHeader={renderReceivingAddrHeader}
      /> */}

      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={CustodianRequestOtpBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('67%') : hp('60%'),
          Platform.OS == 'ios' ? hp('80%') : hp('70%'),
        ]}
        renderContent={renderSendOtpModalContents}
        renderHeader={renderSendOTPModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendSuccessBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderSuccessStatusContents}
        renderHeader={renderSendSuccessHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendErrorBottomSheet}
        snapPoints={[-50, hp('60%')]}
        renderContent={renderSendErrorContents}
        renderHeader={renderSendErrorHeader}
      />

      {/* helper modals */}
      <BottomSheet
        enabledInnerScrolling={true}
        ref={BuyHelperBottomSheet}
        snapPoints={[
          -50,
          hp('90%'),
          Platform.OS == 'android' ? hp('50%') : hp('90%'),
        ]}
        renderContent={renderBuyHelperContents}
        renderHeader={renderBuyHelperHeader}
      />
      <BottomSheet
        onCloseStart={async () => {
          let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
          let isReceiveHelperDone = await AsyncStorage.getItem(
            'isReceiveHelperDone',
          );
          let isBuyHelperDone = await AsyncStorage.getItem('isBuyHelperDone');
          let isSellHelperDone = await AsyncStorage.getItem('isSellHelperDone');
          let isTransactionHelperDone = await AsyncStorage.getItem(
            'isTransactionHelperDone',
          );
          let isTransactionDetailsHelperDone = await AsyncStorage.getItem(
            'isTransactionDetailsHelperDone',
          );
          // if (
          //   !isSendHelperDone ||
          //   !isReceiveHelperDone ||
          //   !isBuyHelperDone ||
          //   !isSellHelperDone ||
          //   !isTransactionHelperDone ||
          //   !isTransactionDetailsHelperDone
          // ) {
          //   props.copilotEvents.on('stepChange', handleStepChange);
          //   props.start();
          // }
        }}
        enabledInnerScrolling={true}
        ref={TestAccountHelperBottomSheet}
        snapPoints={[
          -50,

          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
          //Platform.OS == 'android' ? hp('50%') : hp('90%'),
        ]}
        renderContent={renderTestAccountsHelperContents}
        renderHeader={renderTestAccountsHelperHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SecureAccountHelperBottomSheet}
        snapPoints={[
          -50,

          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderSecureAccountsHelperContents}
        renderHeader={renderSecureAccountsHelperHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={RegularAccountHelperBottomSheet}
        snapPoints={[
          -50,

          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderRegularAccountsHelperContents}
        renderHeader={renderRegularAccountsHelperHeader}
      />
    </View>
  );
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
const circleSvgPath = ({ position, canvasSize }): string =>
  `M0,0H${canvasSize.x}V${canvasSize.y}H0V0ZM${position.x._value},${position.y._value}Za50 50 0 1 0 100 0 50 50 0 1 0-100 0`;

const StepNumber = ({ currentStepNumber }) => (
  <View>
    <Text>{''}</Text>
  </View>
);

// export default copilot({
//   animated: true, // Can be true or false
//   overlay: 'svg', // Can be either view or svg
//   tooltipComponent: TooltipComponent,
//   tooltipStyle: styles.copilotTooltip,
//   stepNumberComponent: StepNumber,
//   backdropColor: 'rgba(0, 0, 0, 0.8)',
//   androidStatusBarVisible: Platform.OS === 'ios' ? false : true,
//   //verticalOffset: hp('2%'),
//   // svgMaskPath: circleSvgPath, // Circle
// })(Accounts);
