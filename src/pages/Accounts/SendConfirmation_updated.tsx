import React, { Component } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  AsyncStorage,
  Platform,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  transferST2,
  clearTransfer,
  fetchBalanceTx,
  alternateTransferST2,
} from '../../store/actions/accounts';
import { UsNumberFormat } from '../../common/utilities';
import BottomSheet from 'reanimated-bottom-sheet';
import Slider from 'react-native-slider';
import BottomInfoBox from '../../components/BottomInfoBox';
import ModalHeader from '../../components/ModalHeader';
import SendConfirmationContent from './SendConfirmationContent';
import RecipientComponent from './RecipientComponent';
import { createRandomString } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/serviceTypes';
import RelayServices from '../../bitcoin/services/RelayService';
import {
  INotification,
  notificationTag,
  notificationType,
} from '../../bitcoin/utilities/Interface';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import idx from 'idx';
import DeviceInfo from 'react-native-device-info';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';

interface SendConfirmationStateTypes {
  switchOn: boolean;
  CurrencyCode: string;
  totalAmount: any;
  sliderValue: any;
  sliderValueText: string;
  exchangeRates: any;
  SelectedContactId: any;
  transfer: any;
  loading: any;
  isConfirmDisabled: boolean;
}

interface SendConfirmationPropsTypes {
  navigation: any;
  accounts: any[];
  WALLET_SETUP: any;
  trustedContactsService: any;
  exchangeRates: any;
  fetchBalanceTx: any;
  clearTransfer: any;
  alternateTransferST2: any;
  transferST2: any;
  currencyCode: any;
  currencyToggleValue: any;
}
class SendConfirmation_updated extends Component<
  SendConfirmationPropsTypes,
  SendConfirmationStateTypes
> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;
  serviceType: any;
  sweepSecure: any;
  spendableBalance: any;
  transfer: any;
  loading: any;
  viewRef: any;

  constructor(props) {
    super(props);
    this.serviceType = this.props.navigation.getParam('serviceType');
    this.sweepSecure = props.navigation.getParam('sweepSecure');
    this.spendableBalance = props.navigation.getParam('spendableBalance');
    this.viewRef = React.createRef();
    this.state = {
      switchOn: true,
      CurrencyCode: 'USD',
      totalAmount: 0,
      sliderValue: 0,
      sliderValueText: 'Low Fee',
      exchangeRates: this.props.exchangeRates,
      SelectedContactId: 0,
      transfer: {},
      loading: {},
      isConfirmDisabled: false,
    };
  }

  componentDidMount = () => {
    let { accounts } = this.props;
    if (accounts[this.serviceType].transfer.details) {
      let totalAmount = 0;
      accounts[this.serviceType].transfer.details.map((item) => {
        totalAmount += parseInt(item.bitcoinAmount);
      });
      if (totalAmount) this.setState({ totalAmount: totalAmount });
    }
    this.setState({
      transfer: accounts[this.serviceType].transfer,
      loading: accounts[this.serviceType].loading,
    });
    this.onChangeInTransfer();
    this.setCurrencyCodeFromAsync();
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.exchangeRates !== this.props.exchangeRates) {
      this.setState({ exchangeRates: this.props.exchangeRates });
    }

    if (
      prevProps.accounts[this.serviceType].transfer !==
      this.props.accounts[this.serviceType].transfer
    ) {
      this.setState({
        transfer: this.props.accounts[this.serviceType].transfer,
      });
      setTimeout(() => {
        this.onChangeInTransfer();
      }, 10);
    }

    if (
      prevProps.accounts[this.serviceType].loading !==
      this.props.accounts[this.serviceType].loading
    ) {
      this.setState({ loading: this.props.accounts[this.serviceType].loading });
    }
  };

  updateDescription = async (txid, description) => {
    let descriptionHistory = {};
    let storedHistory = await AsyncStorage.getItem('descriptionHistory');

    if (storedHistory) descriptionHistory = JSON.parse(storedHistory);
    descriptionHistory[txid] = description;

    await AsyncStorage.setItem(
      'descriptionHistory',
      JSON.stringify(descriptionHistory),
    );
  };

  sendNotifications = () => {
    let { WALLET_SETUP, trustedContactsService } = this.props;
    let { transfer } = this.state;
    const receivers = [];
    transfer.details.forEach((details) => {
      if (details.selectedContact && details.selectedContact.firstName) {
        const contactName = `${details.selectedContact.firstName} ${
          details.selectedContact.lastName
            ? details.selectedContact.lastName
            : ''
        }`
          .toLowerCase()
          .trim();
        const recipient =
          trustedContactsService.tc.trustedContacts[contactName];
        if (recipient.walletID && recipient.FCMs.length)
          receivers.push({
            walletId: recipient.walletID,
            FCMs: recipient.FCMs,
          });
      }
    });
    const notification: INotification = {
      notificationType: notificationType.contact,
      title: 'Friends and Family notification',
      body: `You have a new transaction from ${WALLET_SETUP.walletName}`,
      data: {},
      tag: notificationTag.IMP,
    };
    RelayServices.sendNotifications(receivers, notification).then(console.log);
  };

  onChangeInTransfer = () => {
    let { transfer } = this.state;
    if (transfer.details) {
      let totalAmount = 0;
      transfer.details.map((item) => {
        totalAmount += parseInt(item.bitcoinAmount);
      });
      if (totalAmount) this.setState({ totalAmount: totalAmount });
    }

    if (transfer.stage2 && transfer.stage2.failed) {
      this.setState({ isConfirmDisabled: false });
      setTimeout(() => {
        (this.refs.SendUnSuccessBottomSheet as any).snapTo(1);
      }, 2);
    } else if (transfer.txid) {
      this.sendNotifications();
      if (transfer.details[0].note) {
        this.updateDescription(transfer.txid, transfer.details[0].note);
      }
      this.storeTrustedContactsHistory(transfer.details);
      this.props.fetchBalanceTx(this.serviceType, {
        loader: true,
        syncTrustedDerivative:
          this.serviceType === REGULAR_ACCOUNT ||
          this.serviceType === SECURE_ACCOUNT
            ? true
            : false,
      });
      setTimeout(() => {
        (this.refs.SendSuccessBottomSheet as any).snapTo(1);
      }, 10);
    } else if (!transfer.txid && transfer.executed === 'ST2') {
      this.props.navigation.navigate('TwoFAToken', {
        serviceType: this.serviceType,
        recipientAddress: '',
        onTransactionSuccess: this.onTransactionSuccess,
      });
    }
  };

  storeTrustedContactsHistory = async (details) => {
    if (details && details.length > 0) {
      let IMKeeperOfHistory = JSON.parse(
        await AsyncStorage.getItem('IMKeeperOfHistory'),
      );
      let OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem('OtherTrustedContactsHistory'),
      );
      for (let i = 0; i < details.length; i++) {
        const element = details[i];
        if (element.selectedContact.contactName) {
          let obj = {
            id: createRandomString(36),
            title: 'Sent Amount',
            date: moment(Date.now()).valueOf(),
            info: '',
            // 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
            selectedContactInfo: element,
          };
          if (element.selectedContact.isWard) {
            if (!IMKeeperOfHistory) IMKeeperOfHistory = [];
            IMKeeperOfHistory.push(obj);
            await AsyncStorage.setItem(
              'IMKeeperOfHistory',
              JSON.stringify(IMKeeperOfHistory),
            );
          }
          if (
            !element.selectedContact.isWard &&
            !element.selectedContact.isGuardian
          ) {
            if (!OtherTrustedContactsHistory) OtherTrustedContactsHistory = [];
            OtherTrustedContactsHistory.push(obj);
            await AsyncStorage.setItem(
              'OtherTrustedContactsHistory',
              JSON.stringify(OtherTrustedContactsHistory),
            );
          }
        }
      }
    }
  };

  onConfirm = () => {
    let { sliderValueText } = this.state;
    this.props.clearTransfer(this.serviceType, 'stage2');
    const txPriority =
      sliderValueText === 'Low Fee'
        ? 'low'
        : sliderValueText === 'In the middle'
        ? 'medium'
        : 'high';

    if (
      this.serviceType === SECURE_ACCOUNT &&
      this.props.accounts[this.serviceType].service.secureHDWallet
        .secondaryXpriv
    ) {
      this.props.alternateTransferST2(this.serviceType, txPriority);
    } else {
      this.props.transferST2(this.serviceType, txPriority);
    }
  };

  tapSliderHandler = (evt) => {
    if (this.viewRef.current) {
      this.viewRef.current.measure((fx, fy, width, height, px) => {
        const location = (evt.nativeEvent.locationX - px) / width;
        if (location >= -0.1 && location <= 0.2) {
          this.setState({ sliderValue: 0 });
        } else if (location >= 0.3 && location <= 0.6) {
          this.setState({ sliderValue: 5 });
        } else if (location >= 0.7 && location <= 1) {
          this.setState({ sliderValue: 10 });
        }
      });
    }
  };

  getServiceTypeAccount = () => {
    if (this.serviceType == 'TEST_ACCOUNT') {
      return 'Test Account';
    } else if (this.serviceType == 'SECURE_ACCOUNT') {
      return 'Savings Account';
    } else if (this.serviceType == 'REGULAR_ACCOUNT') {
      return 'Checking Account';
    } else if (this.serviceType == 'S3_SERVICE') {
      return 'S3 Service';
    }
  };

  onTransactionSuccess = () => {
    if (this.refs.SendSuccessBottomSheet as any)
      (this.refs.SendSuccessBottomSheet as any).snapTo(1);
  };

  setCurrencyCodeFromAsync = async () => {
    let currencyToggleValueTmp = this.props.currencyToggleValue;
    let currencyCodeTmp = this.props.currencyCode;
    this.setState({
      switchOn: currencyToggleValueTmp ? true : false,
      CurrencyCode: currencyCodeTmp ? currencyCodeTmp : 'USD',
    });
  };

  convertBitCoinToCurrency = (value) => {
    const { switchOn, exchangeRates, CurrencyCode } = this.state;
    return this.serviceType == TEST_ACCOUNT
      ? UsNumberFormat(value)
      : switchOn
      ? UsNumberFormat(value)
      : exchangeRates
      ? ((value / 1e8) * exchangeRates[CurrencyCode].last).toFixed(2)
      : null;
  };

  getCorrectCurrencySymbol = () => {
    const { switchOn, CurrencyCode } = this.state;
    return this.serviceType == TEST_ACCOUNT
      ? 't-sats'
      : switchOn
      ? 'sats'
      : CurrencyCode.toLocaleLowerCase();
  };

  render() {
    const {
      switchOn,
      CurrencyCode,
      totalAmount,
      sliderValue,
      isConfirmDisabled,
      SelectedContactId,
      transfer,
      loading,
    } = this.state;
    const { navigation, exchangeRates } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
                this.props.clearTransfer(this.serviceType, 'stage1');
              }}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Image
              source={
                this.serviceType == TEST_ACCOUNT
                  ? require('../../assets/images/icons/icon_test.png')
                  : this.serviceType == REGULAR_ACCOUNT
                  ? require('../../assets/images/icons/icon_regular.png')
                  : require('../../assets/images/icons/icon_secureaccount.png')
              }
              style={{ width: wp('10%'), height: wp('10%') }}
            />
            <View style={{ marginLeft: wp('2.5%') }}>
              <Text style={styles.modalHeaderTitleText}>
                {'Send Confirmation'}
              </Text>
              <Text style={styles.headerText}>
                {this.serviceType == TEST_ACCOUNT
                  ? 'Test Account'
                  : this.serviceType == REGULAR_ACCOUNT
                  ? 'Checking Account'
                  : 'Savings Account'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                (this.refs.KnowMoreBottomSheet as any).snapTo(1);
              }}
              style={{ marginLeft: 'auto' }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  // marginLeft: 'auto',
                }}
              >
                Know more
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          <View style={styles.availableBalanceView}>
            <Text style={styles.accountTypeTextBalanceView}>
              {this.getServiceTypeAccount()}
            </Text>
            <Text style={styles.availableToSpendText}>
              {' (Available to spend '}
              <Text style={styles.availableBalanceText}>
                {this.serviceType == TEST_ACCOUNT
                  ? UsNumberFormat(this.spendableBalance)
                  : switchOn
                  ? UsNumberFormat(this.spendableBalance)
                  : exchangeRates
                  ? (
                      (this.spendableBalance / 1e8) *
                      exchangeRates[CurrencyCode].last
                    ).toFixed(2)
                  : null}
              </Text>
              <Text style={styles.availableBalanceUnitText}>
                {this.serviceType == TEST_ACCOUNT
                  ? ' t-sats )'
                  : switchOn
                  ? ' sats )'
                  : ' ' + CurrencyCode.toLocaleLowerCase() + ' )'}
              </Text>
            </Text>
          </View>
          {transfer.details && transfer.details.length > 0 ? (
            <ScrollView>
              {transfer.details.map((item) => (
                <RecipientComponent
                  onPressElement={() => {
                    if (item.note) {
                      if (SelectedContactId == item.selectedContact.id)
                        this.setState({ SelectedContactId: 0 });
                      else
                        this.setState({
                          SelectedContactId: item.selectedContact.id,
                        });
                    }
                  }}
                  item={item}
                  SelectedContactId={SelectedContactId}
                  serviceType={this.serviceType}
                />
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.totalMountView}>
            <Text style={styles.totalAmountText}>Total Amount</Text>
            <View style={styles.totalAmountOuterView}>
              <View style={styles.totalAmountInnerView}>
                <View style={styles.amountInputImage}>
                  <Image
                    style={styles.textBoxImage}
                    source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                  />
                </View>
                <View style={styles.totalAmountView} />
                <Text style={styles.amountText}>
                  {this.serviceType == TEST_ACCOUNT
                    ? UsNumberFormat(totalAmount)
                    : switchOn
                    ? UsNumberFormat(totalAmount)
                    : exchangeRates
                    ? (
                        (totalAmount / 1e8) *
                        exchangeRates[CurrencyCode].last
                      ).toFixed(2)
                    : null}
                  {/* {totalAmount} */}
                </Text>
                <Text style={styles.amountUnitText}>
                  {/* {this.serviceType == TEST_ACCOUNT ? ' t-sats' : ' sats'} */}
                  {this.serviceType == TEST_ACCOUNT
                    ? ' t-sats'
                    : switchOn
                    ? ' sats'
                    : ' ' + CurrencyCode.toLocaleLowerCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.transactionPriorityView}>
            <Text style={styles.transactionPriorityText}>
              Transaction Priority
            </Text>
            <Text style={styles.transactionPriorityInfoText}>
              Set priority for your transaction
            </Text>

            <View
              style={{
                ...styles.textBoxView,
                flexDirection: 'column',
                height: 'auto',
                marginTop: hp('2%'),
                alignItems: 'center',
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              <View
                style={{ flexDirection: 'row' }}
                ref={this.viewRef}
                collapsable={false}
              >
                <TouchableWithoutFeedback onPressIn={this.tapSliderHandler}>
                  <Slider
                    style={{ flex: 1 }}
                    minimumValue={0}
                    maximumValue={10}
                    step={5}
                    minimumTrackTintColor={Colors.blue}
                    maximumTrackTintColor={Colors.borderColor}
                    thumbStyle={{
                      borderWidth: 5,
                      borderColor: Colors.white,
                      backgroundColor: Colors.blue,
                      height: 30,
                      width: 30,
                      borderRadius: 15,
                    }}
                    trackStyle={{ height: 8, borderRadius: 10 }}
                    thumbTouchSize={{
                      width: 30,
                      height: 30,
                      backgroundColor: 'blue',
                    }}
                    value={sliderValue}
                    onValueChange={(value) => {
                      this.setState({ sliderValue: value });
                    }}
                    onSlidingComplete={(value) => {
                      value == 0
                        ? this.setState({ sliderValueText: 'Low Fee' })
                        : value == 5
                        ? this.setState({ sliderValueText: 'In the middle' })
                        : this.setState({
                            sliderValueText: 'Fast Transaction',
                          });
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>
              <View style={styles.sliderTextView}>
                <Text style={styles.sliderText}>
                  {'Low Fee\n'} (
                  {this.convertBitCoinToCurrency(
                    transfer.stage1 && transfer.stage1.txPrerequisites
                      ? transfer.stage1.txPrerequisites['low'].fee
                      : '',
                  )}
                  {/* {this.serviceType == TEST_ACCOUNT ? ' t-sats' : ' sats'} */}
                  {' ' + this.getCorrectCurrencySymbol()})
                </Text>
                <Text style={styles.sliderText}>
                  {'In the middle\n'} (
                  {this.convertBitCoinToCurrency(
                    transfer.stage1 && transfer.stage1.txPrerequisites
                      ? transfer.stage1.txPrerequisites['medium'].fee
                      : '',
                  )}
                  {/* {' sats'} */}
                  {' ' + this.getCorrectCurrencySymbol()})
                </Text>
                <Text
                  style={{
                    ...styles.sliderText,
                    marginRight: 0,
                  }}
                >
                  {'Fast Transaction\n'} (
                  {this.convertBitCoinToCurrency(
                    transfer.stage1 && transfer.stage1.txPrerequisites
                      ? transfer.stage1.txPrerequisites['high'].fee
                      : '',
                  )}
                  {/* {' sats'} */}
                  {' ' + this.getCorrectCurrencySymbol()})
                </Text>
              </View>
            </View>
          </View>
          {/* <View style={{ marginTop: hp('3%') }}>
            <BottomInfoBox
              title={'Note'}
              infoText={
                'When you want to send bitcoin, you need the address of the receiver. For this you can either scan a QR code from their wallet/app or copy their address into the address field'
              }
            />
          </View> */}

          <View style={styles.bottomButtonView}>
            <TouchableOpacity
              onPress={() => {
                this.setState({ isConfirmDisabled: true });
                this.onConfirm();
              }}
              disabled={isConfirmDisabled}
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
                this.props.accounts[this.serviceType].loading.transfer) ||
              (isConfirmDisabled &&
                this.props.accounts[this.serviceType].loading.transfer) ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.buttonText}>{'Confirm & Send'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...styles.confirmButtonView,
                width: wp('30%'),
              }}
              onPress={() => {
                this.props.clearTransfer(this.serviceType, 'stage1');
                navigation.goBack();
              }}
            >
              <Text style={{ ...styles.buttonText, color: Colors.blue }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomSheet
          onCloseStart={() => {
            if (this.refs.SendSuccessBottomSheet as any)
              (this.refs.SendSuccessBottomSheet as any).snapTo(0);

            this.props.clearTransfer(this.serviceType);
            navigation.navigate('Accounts', {
              serviceType: this.serviceType,
              index:
                this.serviceType === TEST_ACCOUNT
                  ? 0
                  : this.serviceType === REGULAR_ACCOUNT
                  ? 1
                  : 2,
              spendableBalance: this.spendableBalance - totalAmount,
            });
          }}
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'SendSuccessBottomSheet'}
          snapPoints={[-50, hp('65%')]}
          renderContent={() => (
            <SendConfirmationContent
              title={'Sent Successfully'}
              info={'Transaction(s) successfully submitted'}
              infoText={
                'The transaction has been submitted to the Bitcoin network. View transactions on the account screen for details'
              }
              userInfo={transfer.details ? transfer.details : []}
              isFromContact={false}
              okButtonText={'View Account'}
              cancelButtonText={'Back'}
              isCancel={false}
              onPressOk={() => {
                if (this.refs.SendSuccessBottomSheet as any)
                  (this.refs.SendSuccessBottomSheet as any).snapTo(0);

                this.props.clearTransfer(this.serviceType);
                // this.props.fetchTransactions(serviceType);
                // this.props.fetchBalanceTx(serviceType, {
                //     loader: true,
                //     syncTrustedDerivative:
                //       serviceType === REGULAR_ACCOUNT ||
                //       serviceType === SECURE_ACCOUNT
                //         ? true
                //         : false,
                //   })

                navigation.navigate('Accounts', {
                  serviceType: this.serviceType,
                  index:
                    this.serviceType === TEST_ACCOUNT
                      ? 0
                      : this.serviceType === REGULAR_ACCOUNT
                      ? 1
                      : 2,
                  spendableBalance: this.spendableBalance - totalAmount,
                });
              }}
              isSuccess={true}
              serviceType={this.serviceType}
            />
          )}
          renderHeader={() => (
            <ModalHeader
            // onPressHeader={() => {
            //   if (this.refs.SendSuccessBottomSheet as any)
            //     (this.refs.SendSuccessBottomSheet as any).snapTo(0);
            //   navigation.navigate('Accounts');
            // }}
            />
          )}
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
              title={'Sent Unsuccessful'}
              info={'Something went wrong, please try again'}
              userInfo={transfer.details ? transfer.details : []}
              isFromContact={false}
              okButtonText={'Try Again'}
              cancelButtonText={'Back'}
              isCancel={true}
              onPressOk={() => {
                if (this.refs.SendUnSuccessBottomSheet as any)
                  (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
              }}
              onPressCancel={() => {
                this.props.clearTransfer(this.serviceType);
                if (this.refs.SendUnSuccessBottomSheet as any)
                  (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
                navigation.navigate('Accounts');
              }}
              isUnSuccess={true}
            />
          )}
          renderHeader={() => (
            <ModalHeader
            // onPressHeader={() => {
            //   if (this.refs.SendUnSuccessBottomSheet as any)
            //     (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
            // }}
            />
          )}
        />

        <BottomSheet
          onCloseStart={() => {
            (this.refs.KnowMoreBottomSheet as any).snapTo(0);
          }}
          enabledInnerScrolling={false}
          ref={'KnowMoreBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('20%')
              : Platform.OS == 'android'
              ? hp('21%')
              : hp('20%'),
          ]}
          renderContent={() => (
            <TestAccountHelperModalContents
              topButtonText={'Note'}
              // image={require('../../assets/images/icons/regular.png')}
              boldPara={''}
              helperInfo={
                'When you want to send bitcoin, you need the address of the receiver. For this you can either scan a QR code from their wallet/app or copy their address into the address field'
              }
              // continueButtonText={'Ok, got it'}
              // onPressContinue={() => {
              //   if (KnowMoreBottomSheet.current)
              //     (KnowMoreBottomSheet as any).current.snapTo(0);
              // }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              borderColor={Colors.blue}
              backgroundColor={Colors.blue}
              onPressHeader={() => {
                (this.refs.KnowMoreBottomSheet as any).snapTo(0);
              }}
            />
          )}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    trustedContactsService: idx(state, (_) => _.trustedContacts.service),
    exchangeRates: idx(state, (_) => _.accounts.exchangeRates),
    accounts: idx(state, (_) => _.accounts) || [],
    WALLET_SETUP: idx(state, (_) => _.storage.database.WALLET_SETUP) || '',
    currencyCode: idx(state, (_) => _.preferences.currencyCode),
    currencyToggleValue: idx(state, (_) => _.preferences.currencyToggleValue),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchBalanceTx,
    clearTransfer,
    alternateTransferST2,
    transferST2,
  })(SendConfirmation_updated),
);

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
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
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderColor,
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
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
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
  headerText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  availableBalanceView: {
    paddingBottom: hp('1%'),
    paddingTop: hp('0.7%'),
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
    marginBottom: hp('1%'),
    marginTop: hp('1%'),
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  accountTypeTextBalanceView: {
    color: Colors.blue,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansItalic,
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
    textAlign: 'center',
  },
  availableBalanceText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
  },
  availableBalanceUnitText: {
    color: Colors.blue,
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansMediumItalic,
  },
  totalMountView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1.5%'),
  },
  totalAmountText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  totalAmountOuterView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  totalAmountInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  totalAmountView: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  amountText: {
    color: Colors.black,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  amountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: 5,
  },
  transactionPriorityView: {
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
    marginTop: hp('2%'),
  },
  transactionPriorityText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  transactionPriorityInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  sliderTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 5,
  },
  bottomButtonView: {
    flexDirection: 'row',
    marginTop: hp('3%'),
    marginBottom: hp('5%'),
    marginLeft: wp('6%'),
    marginRight: wp('6%'),
  },
});
