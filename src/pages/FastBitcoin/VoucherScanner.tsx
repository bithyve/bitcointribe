import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ImageBackground,
  AsyncStorage,
  Linking,
} from 'react-native';
import Fonts from '../../common/Fonts';
import DeviceInfo from 'react-native-device-info';
import BackupStyles from '../ManageBackup/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  FAST_BITCOINS,
} from '../../common/constants/serviceTypes';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNCamera } from 'react-native-camera';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import QuoteConfirmation from './QuoteConfirmation';
import VoucherRedeemSuccess from './VoucherRedeemSuccess';
import AccountVerification from './AccountVerification';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { UsNumberFormat } from '../../common/utilities';
import {
  accountSync,
  getQuote,
  executeOrder,
  ClearAccountSyncData,
} from '../../store/actions/fbtc';
import { fetchDerivativeAccAddress } from '../../store/actions/accounts';

const VoucherScanner = (props) => {
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const QuoteDetails = useSelector((state) => state.fbtc.getQuoteDetails);
  const executeOrderDetails = useSelector(
    (state) => state.fbtc.executeOrderDetails,
  );
  const [hideShow, setHideShow] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [openCameraFlag, setOpenCameraFlag] = useState(false);
  const [voucherCode, setVoucherCode] = useState('FMB8M733U3EE');
  const [userKey, setUserKey] = useState(
    '17734b0c-6139-48fc-8f17-23fbb5df3287',
  );
  const accounts1 = useSelector((state) => state.accounts);
  const [exchangeRates, setExchangeRates] = useState(accounts1.exchangeRates);
  const dispatch = useDispatch();
  const accountSyncDetails = useSelector(
    (state) => state.fbtc.accountSyncDetails,
  );
  console.log('accountSyncDetails', accountSyncDetails);
  useEffect(() => {
    if (accounts1.exchangeRates) setExchangeRates(accounts1.exchangeRates);
  }, [accounts1.exchangeRates]);
  const [balances, setBalances] = useState({
    testBalance: 0,
    regularBalance: 0,
    secureBalance: 0,
    accumulativeBalance: 0,
  });
  const [
    RegistrationSuccessBottomSheet,
    setRegistrationSuccessBottomSheet,
  ] = useState(React.createRef<BottomSheet>());
  const [QuoteBottomSheet, setQuoteBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const [
    VoucherRedeemSuccessBottomSheet,
    setVoucherRedeemSuccessBottomSheet,
  ] = useState(React.createRef<BottomSheet>());
  const [
    AccountVerificationBottomSheet,
    setAccountVerificationBottomSheet,
  ] = useState(React.createRef<BottomSheet>());
  const [Quote, setQuote] = useState({});
  const accounts = [
    {
      accountType: REGULAR_ACCOUNT,
      accountName: 'Checking Account',
      amount: '5,000',
      image: require('../../assets/images/icons/icon_regular.png'),
    },
    {
      accountType: TEST_ACCOUNT,
      accountName: 'Test Account',
      amount: '2,000',
      image: require('../../assets/images/icons/icon_test.png'),
    },
    {
      accountType: SECURE_ACCOUNT,
      accountName: 'Saving Account',
      amount: '3,000',
      image: require('../../assets/images/icons/icon_secureaccount.png'),
    },
  ];
  const [selectedAccount, setSelectedAccount] = useState({
    accountType: REGULAR_ACCOUNT,
    accountName: 'Checking Account',
    amount: '5,000',
    image: require('../../assets/images/icons/icon_regular.png'),
  });
  const service = useSelector(
    (state) => state.accounts[selectedAccount.accountType].service,
  );

  useEffect(() => {
    (async () => {
      let FBTCAccountData = JSON.parse(
        await AsyncStorage.getItem('FBTCAccount'),
      );
      if (FBTCAccountData.user_key) {
        setIsUserRegistered(true);
      }
    })();
  }, []);

  useEffect(() => {
    const accountNumber = 0;
    const { derivativeAccounts } =
      selectedAccount.accountType === SECURE_ACCOUNT
        ? service.secureHDWallet
        : service.hdWallet;

    if (!derivativeAccounts[FAST_BITCOINS][accountNumber])
      dispatch(
        fetchDerivativeAccAddress(selectedAccount.accountType, FAST_BITCOINS),
      );
    else {
      if (derivativeAccounts[FAST_BITCOINS][accountNumber].receivingAddress) {
        setBitcoinAddress(
          derivativeAccounts[FAST_BITCOINS][accountNumber].receivingAddress,
        );
      }
      console.log({
        FBAddress:
          derivativeAccounts[FAST_BITCOINS][accountNumber].receivingAddress,
      });
    }
  }, [selectedAccount]);

  useEffect(() => {
    const testBalance = accounts1[TEST_ACCOUNT].service
      ? accounts1[TEST_ACCOUNT].service.hdWallet.balances.balance +
        accounts1[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    const regularBalance = accounts1[REGULAR_ACCOUNT].service
      ? accounts1[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
        accounts1[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    const secureBalance = accounts1[SECURE_ACCOUNT].service
      ? accounts1[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
        accounts1[SECURE_ACCOUNT].service.secureHDWallet.balances
          .unconfirmedBalance
      : 0;
    const accumulativeBalance = regularBalance + secureBalance;

    setBalances({
      testBalance,
      regularBalance,
      secureBalance,
      accumulativeBalance,
    });
  }, [accounts1]);

  useEffect(() => {
    (async () => {
      let voucherDataTemp = JSON.parse(
        await AsyncStorage.getItem('voucherData'),
      );
      console.log('voucherData', voucherDataTemp);
      if (voucherDataTemp) {
        voucherDataTemp = {};
      }
      voucherDataTemp = {
        voucher_code: voucherCode,
        selectedAccount: selectedAccount,
      };
      await AsyncStorage.setItem(
        'voucherData',
        JSON.stringify(voucherDataTemp),
      );
    })();
    if (isUserRegistered) createFBTCAccount();
  }, [selectedAccount, voucherCode]);

  const barcodeRecognized = async (barcodes) => {
    if (barcodes.data) {
      if (barcodes.data.includes('fastbitcoins.com')) {
        let tempData = barcodes.data.split('/');
        setVoucherCode(tempData[tempData.length - 1]);
        if (!isUserRegistered) {
          AccountVerificationBottomSheet.current.snapTo(1);
          //Linking.openURL('https://fb-web-dev.aao-tech.com/bithyve');
        }
      }
      setOpenCameraFlag(false);
    }
  };

  const saveVoucherCodeToAccount = async (selectedAccount, voucherCode) => {
    let fBTCAccount = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    let temp = true;
    for (let i = 0; i < fBTCAccount.test_account.voucher.length; i++) {
      const element = fBTCAccount.test_account.voucher[i];
      if (voucherCode == element.voucherCode && element.hasOwnProperty('quotes')) {
        temp = false;
        break;
      }
    }
    if (temp) {
      for (let i = 0; i < fBTCAccount.checking_account.voucher.length; i++) {
        const element = fBTCAccount.checking_account.voucher[i];
        if (voucherCode == element.voucherCode && element.hasOwnProperty('quotes')) {
          temp = false;
          break;
        }
      }
    }
    if (temp) {
      for (let i = 0; i < fBTCAccount.saving_account.voucher.length; i++) {
        const element = fBTCAccount.saving_account.voucher[i];
        if (voucherCode == element.voucherCode && element.hasOwnProperty('quotes')) {
          temp = false;
          break;
        }
      }
    }
    if (temp) {
      let accountType = 'saving_account';
      if (selectedAccount.accountType == TEST_ACCOUNT) {
        accountType = 'test_account';
      } else if (selectedAccount.accountType == REGULAR_ACCOUNT) {
        accountType = 'checking_account';
      }
      fBTCAccount[accountType].voucher.push({
        voucherCode: voucherCode,
      });
      await AsyncStorage.setItem('FBTCAccount', JSON.stringify(fBTCAccount));
    }
  };

  useEffect(() => {
    if (userKey) createFBTCAccount();
  }, [userKey]);

  const createFBTCAccount = async () => {
    let FBTCAccountData = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    let voucherData = JSON.parse(await AsyncStorage.getItem('voucherData'));
    let obj;
    if (!FBTCAccountData) {
      obj = {
        user_key: userKey,
        test_account: {
          voucher: [],
        },
        checking_account: {
          voucher: [],
        },
        saving_account: {
          voucher: [],
        },
      };
    } else {
      obj = FBTCAccountData;
    }
    await AsyncStorage.setItem('FBTCAccount', JSON.stringify(obj));
    saveVoucherCodeToAccount(
      voucherData.selectedAccount,
      voucherData.voucher_code,
    );
    if (
      obj.hasOwnProperty('redeem_vouchers') &&
      obj.hasOwnProperty('exchange_balances') &&
      obj.hasOwnProperty('sell_bitcoins')
    ) {
      if (obj.redeem_vouchers) getQuoteDetailsMethod();
    } else checkAuth();
  };

  const checkAuth = () => {
    let data = {
      userKey: userKey,
    };
    dispatch(accountSync(data));
  };

  useEffect(() => {
    if (accountSyncDetails) {
      console.log('accountSyncDetails in if', accountSyncDetails);
      (async () => {
        let FBTCAccountData = JSON.parse(
          await AsyncStorage.getItem('FBTCAccount'),
        );
        console.log('FBTCAccountData', FBTCAccountData);
        let obj;
        if (FBTCAccountData) {
          obj = {
            ...FBTCAccountData,
            redeem_vouchers: accountSyncDetails.redeem_vouchers,
            exchange_balances: accountSyncDetails.exchange_balances,
            sell_bitcoins: accountSyncDetails.sell_bitcoins,
          };
          await AsyncStorage.setItem('FBTCAccount', JSON.stringify(obj));
        }
        if (accountSyncDetails.redeem_vouchers) {
          (RegistrationSuccessBottomSheet as any).current.snapTo(1);
        }
        ClearAccountSyncData();
      })();
    }
  }, [accountSyncDetails]);

  const getQuoteDetailsMethod = async () => {
    let voucherData = JSON.parse(await AsyncStorage.getItem('voucherData'));
    let data = {
      user_key: '17734b0c-6139-48fc-8f17-23fbb5df3287',
      quote_type: 'voucher',
      currency: 'USD',
      amount: 100.0,
      voucher_code: voucherData ? voucherData.voucher_code : '',
    };
    dispatch(getQuote(data));
  };

  useEffect(() => {
    if (QuoteDetails) {
      console.log('QuoteDetails', QuoteDetails);
      QuoteBottomSheet.current.snapTo(1);
      setTimeout(() => {
        setQuote(QuoteDetails);
      }, 2);
    }
  }, [QuoteDetails]);

  const storeQuotesDetails = async () => {
    let voucherFromAsync = JSON.parse(
      await AsyncStorage.getItem('voucherData'),
    );
    let fBTCAccountData = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    if (voucherFromAsync.selectedAccount.accountType == TEST_ACCOUNT) {
      for (let i = 0; i < fBTCAccountData.test_account.voucher.length; i++) {
        const element = fBTCAccountData.test_account.voucher[i];
        if (element.voucherCode == voucherFromAsync.voucher_code) {
          fBTCAccountData.test_account.voucher[i].quotes = QuoteDetails;
        } else {
          fBTCAccountData.test_account.voucher[i].quotes = QuoteDetails;
          fBTCAccountData.test_account.voucher[i].voucherCode =
            voucherFromAsync.voucher_code;
        }
      }
    }
    if (voucherFromAsync.selectedAccount.accountType == SECURE_ACCOUNT) {
      for (let i = 0; i < fBTCAccountData.saving_account.voucher.length; i++) {
        const element = fBTCAccountData.saving_account.voucher[i];
        if (element.voucherCode == voucherFromAsync.voucher_code) {
          fBTCAccountData.saving_account.voucher[i].quotes = QuoteDetails;
        } else {
          fBTCAccountData.saving_account.voucher[i].quotes = QuoteDetails;
          fBTCAccountData.saving_account.voucher[i].voucherCode =
            voucherFromAsync.voucher_code;
        }
      }
    }
    if (voucherFromAsync.selectedAccount.accountType == REGULAR_ACCOUNT) {
      for (
        let i = 0;
        i < fBTCAccountData.checking_account.voucher.length;
        i++
      ) {
        const element = fBTCAccountData.checking_account.voucher[i];
        if (element.voucherCode == voucherFromAsync.voucher_code) {
          fBTCAccountData.checking_account.voucher[i].quotes = QuoteDetails;
        } else {
          fBTCAccountData.checking_account.voucher[i].quotes = QuoteDetails;
          fBTCAccountData.checking_account.voucher[i].voucherCode =
            voucherFromAsync.voucher_code;
        }
      }
    }
    await AsyncStorage.setItem('FBTCAccount', JSON.stringify(fBTCAccountData));
    executeOrderMethod();
  };

  const renderRegistrationSuccessModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={RegistrationSuccessBottomSheet}
        title={'Fast Bitcoin Account\nSuccessfully Registered'}
        info={'Lorem ipsum dolor sit amet, consectetur'}
        note={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore'
        }
        proceedButtonText={'Redeem Voucher'}
        onPressProceed={async () => {
          let FBTCAccountData = JSON.parse(
            await AsyncStorage.getItem('FBTCAccount'),
          );
          if (FBTCAccountData.redeem_vouchers) {
            getQuoteDetailsMethod();
            (RegistrationSuccessBottomSheet as any).current.snapTo(0);
          }
        }}
        isIgnoreButton={true}
        cancelButtonText={'Back'}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/illustration.png')}
      />
    );
  }, []);

  const renderRegistrationSuccessModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (RegistrationSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  useEffect(() => {
    if (executeOrderDetails) {
      storeOrderResponse();
    }
  }, [executeOrderDetails]);

  const storeOrderResponse = async () => {
    let fBTCAccountData = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    let voucherFromAsync = JSON.parse(
      await AsyncStorage.getItem('voucherData'),
    );
    if (fBTCAccountData) {
      if (voucherFromAsync.selectedAccount.accountType == TEST_ACCOUNT) {
        for (let i = 0; i < fBTCAccountData.test_account.voucher.length; i++) {
          const element = fBTCAccountData.test_account.voucher[i];
          if (element.quotes.quote_token == executeOrderDetails.quote_token) {
            fBTCAccountData.test_account.voucher[
              i
            ].orderData = executeOrderDetails;
            break;
          }
        }
      }
      if (voucherFromAsync.selectedAccount.accountType == SECURE_ACCOUNT) {
        for (
          let i = 0;
          i < fBTCAccountData.saving_account.voucher.length;
          i++
        ) {
          const element = fBTCAccountData.saving_account.voucher[i];
          if (element.quotes.quote_token == executeOrderDetails.quote_token) {
            fBTCAccountData.saving_account.voucher[
              i
            ].orderData = executeOrderDetails;
            break;
          }
        }
      }
      if (voucherFromAsync.selectedAccount.accountType == REGULAR_ACCOUNT) {
        for (
          let i = 0;
          i < fBTCAccountData.checking_account.voucher.length;
          i++
        ) {
          const element = fBTCAccountData.checking_account.voucher[i];
          if (element.quotes.quote_token == executeOrderDetails.quote_token) {
            fBTCAccountData.checking_account.voucher[
              i
            ].orderData = executeOrderDetails;
            break;
          }
        }
      }
      await AsyncStorage.setItem(
        'FBTCAccount',
        JSON.stringify(fBTCAccountData),
      );
    }
    VoucherRedeemSuccessBottomSheet.current.snapTo(1);
  };

  const executeOrderMethod = async () => {
    let fBTCAccountData = JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    let voucherFromAsync = JSON.parse(
      await AsyncStorage.getItem('voucherData'),
    );
    console.log('Quote.quote_token', Quote, fBTCAccountData);
    if (fBTCAccountData && fBTCAccountData.user_key) {
      let data = {
        user_key: fBTCAccountData.user_key,
        wallet_slug: 'bithyve',
        quote_type: 'voucher',
        quote_token: Quote.quote_token,
        voucher_code: voucherFromAsync.voucher_code,
        delivery_type: '1',
        delivery_destination: bitcoinAddress,
      };
      dispatch(executeOrder(data));
    }
  };

  const renderQuoteModalContent = useCallback(() => {
    return (
      <QuoteConfirmation
        onPressRedeem={() => {
          storeQuotesDetails();
        }}
        onPressBack={() => {
          QuoteBottomSheet.current.snapTo(0);
        }}
        voucherNumber={voucherCode ? voucherCode : '#123454567890'}
        purchasedFor={QuoteDetails ? QuoteDetails.amount : '17,000'}
        redeemAmount={QuoteDetails ? QuoteDetails.bitcoin_amount : '2,065,000'}
        bitcoinRate={QuoteDetails ? QuoteDetails.exchange_rate : '8,687.70'}
        loading={false}
      />
    );
  }, [QuoteDetails]);

  const renderQuoteModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (QuoteBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderVoucherRedeemSuccessModalContent = useCallback(() => {
    return (
      <VoucherRedeemSuccess
        onPressRedeem={() => {
          props.navigation.navigate("Account");
        }}
        onPressBack={() => {
          VoucherRedeemSuccessBottomSheet.current.snapTo(0);
        }}
        accountName={selectedAccount.accountName}
        redeemAmount={'17,000'}
        loading={false}
      />
    );
  }, []);

  const renderVoucherRedeemSuccessModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (VoucherRedeemSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderAccountVerificationModalContent = useCallback(() => {
    return (
      <AccountVerification link={'https://fb-web-dev.aao-tech.com/bithyve'} />
    );
  }, []);

  const renderAccountVerificationModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          AccountVerificationBottomSheet.current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={styles.backArrowView}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={BackupStyles.modalHeaderTitleText}>Voucher</Text>
        </View>
      </View>
      <ScrollView>
        <View style={{ flex: 1, paddingTop: wp('5%'), position: 'relative' }}>
          {hideShow ? (
            <View style={styles.dropDownView}>
              {accounts.map((value) => {
                return (
                  <TouchableOpacity
                    activeOpacity={10}
                    onPress={() => {
                      setHideShow(false);
                      setSelectedAccount(value);
                    }}
                    style={styles.dropDownElement}
                  >
                    <Image
                      source={value.image}
                      style={{ width: wp('8%'), height: wp('8%') }}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.dropDownElementTitleText}>
                        {value.accountName}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-end',
                        }}
                      >
                        <Image
                          style={styles.cardBitCoinImage}
                          source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                        />
                        <Text style={styles.cardAmountText}>
                          {value.accountType === TEST_ACCOUNT
                            ? UsNumberFormat(balances.testBalance)
                            : value.accountType === REGULAR_ACCOUNT
                            ? UsNumberFormat(balances.regularBalance)
                            : UsNumberFormat(balances.secureBalance)}
                        </Text>
                        <Text style={styles.cardAmountUnitText}>sats</Text>
                      </View>
                    </View>
                    <View
                      style={{ justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Entypo
                        name={'dots-three-horizontal'}
                        color={Colors.borderColor}
                        size={RFValue(13)}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          {openCameraFlag ? (
            <View style={styles.cameraView}>
              <RNCamera
                ref={(ref) => {
                  this.cameraRef = ref;
                }}
                style={styles.camera}
                onBarCodeRead={barcodeRecognized}
                captureAudio={false}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.topCornerView}>
                    <View style={styles.topLeftCornerView} />
                    <View style={styles.topRightCornerView} />
                  </View>
                  <View style={styles.bottomCornerView}>
                    <View style={styles.bottomLeftCornerView} />
                    <View style={styles.bottomRightCornerView} />
                  </View>
                </View>
              </RNCamera>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setOpenCameraFlag(true)}>
              <ImageBackground
                source={require('../../assets/images/icons/iPhone-QR.png')}
                style={styles.cameraImage}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.topCornerView}>
                    <View style={styles.topLeftCornerView} />
                    <View style={styles.topRightCornerView} />
                  </View>
                  <View style={styles.bottomCornerView}>
                    <View style={styles.bottomLeftCornerView} />
                    <View style={styles.bottomRightCornerView} />
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
          <View style={{ marginTop: 5 }}>
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={'Note'}
              infoText={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna'
              }
            />
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          marginBottom: hp('2%'),
        }}
      >
        <TouchableOpacity
          activeOpacity={10}
          onPress={() => {
            setHideShow(!hideShow);
          }}
          style={{ ...styles.dropDownElement, borderRadius: 10, margin: 20 }}
        >
          <Image
            source={selectedAccount.image}
            style={{ width: wp('8%'), height: wp('8%') }}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.dropDownElementTitleText}>
              {selectedAccount.accountName}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}
            >
              <Image
                style={styles.cardBitCoinImage}
                source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
              />
              <Text style={styles.cardAmountText}>
                {selectedAccount.accountType === TEST_ACCOUNT
                  ? UsNumberFormat(balances.testBalance)
                  : selectedAccount.accountType === REGULAR_ACCOUNT
                  ? UsNumberFormat(balances.regularBalance)
                  : UsNumberFormat(balances.secureBalance)}
              </Text>
              <Text style={styles.cardAmountUnitText}>sats</Text>
            </View>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Entypo
              name={'dots-three-horizontal'}
              color={Colors.borderColor}
              size={RFValue(13)}
            />
          </View>
        </TouchableOpacity>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={RegistrationSuccessBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderRegistrationSuccessModalContent}
        renderHeader={renderRegistrationSuccessModalHeader}
      />
      {QuoteDetails && (
        <BottomSheet
          enabledInnerScrolling={true}
          ref={QuoteBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('55%')
              : hp('60%'),
          ]}
          renderContent={renderQuoteModalContent}
          renderHeader={renderQuoteModalHeader}
        />
      )}
      <BottomSheet
        enabledInnerScrolling={true}
        ref={VoucherRedeemSuccessBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('55%') : hp('60%'),
        ]}
        renderContent={renderVoucherRedeemSuccessModalContent}
        renderHeader={renderVoucherRedeemSuccessModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={AccountVerificationBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderAccountVerificationModalContent}
        renderHeader={renderAccountVerificationModalHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  cameraView: {
    width: wp('100%'),
    height: wp('100%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  camera: {
    width: wp('100%'),
    height: wp('100%'),
  },
  topCornerView: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  bottomCornerView: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  topLeftCornerView: {
    borderLeftWidth: 1,
    borderTopColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderTopWidth: 1,
  },
  topRightCornerView: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderTopColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
  bottomLeftCornerView: {
    borderLeftWidth: 1,
    borderBottomColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderBottomWidth: 1,
  },
  bottomRightCornerView: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderBottomColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
  cameraImage: {
    width: wp('100%'),
    height: wp('100%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardBitCoinImage: {
    width: wp('4%'),
    height: wp('4%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('1%'),
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  dropDownElement: {
    backgroundColor: Colors.backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: wp('5%'),
    paddingBottom: wp('5%'),
    paddingLeft: wp('3%'),
    paddingRight: wp('3%'),
    width: wp('90%'),
  },
  dropDownView: {
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    backgroundColor: Colors.white,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: 'hidden',
  },
  dropDownElementTitleText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginBottom: 5,
  },
});

export default VoucherScanner;
