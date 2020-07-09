import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
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
  Alert,
} from 'react-native';
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
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import idx from 'idx';

interface SendConfirmationStateTypes {
  switchOn: boolean;
  CurrencyCode: string;
  totalAmount: any;
  sliderValue: any;
  sliderValueText: string;
  exchangeRates: any;
  SelectedContactId: any;
  transfer: {},
  loading: {}
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
}
class SendConfirmation_updated extends Component<SendConfirmationPropsTypes, SendConfirmationStateTypes> {
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
    this.serviceType = this.props.navigation.getParam('serviceType')
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
      loading: {}
    }
  }

  componentDidMount = () =>{
    this.onChangeInTransfer();
    let { accounts } = this.props;
    if (accounts[this.serviceType].transfer.details) {
      let totalAmount = 0;
      accounts[this.serviceType].transfer.details.map((item) => {
        totalAmount += parseInt(item.bitcoinAmount);
      });
      if (totalAmount) this.setState({totalAmount: totalAmount})
    }
    this.setState({transfer: accounts[this.serviceType].transfer, loading: accounts[this.serviceType].loading});
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.exchangeRates !== this.props.exchangeRates) {
      this.setState({exchangeRates: this.props.exchangeRates});
    }

    if (prevProps.accounts[this.serviceType].transfer !== this.props.accounts[this.serviceType].transfer) {
      this.setState({transfer: this.props.accounts[this.serviceType].transfer});
      this.onChangeInTransfer();
    }

    if (prevProps.accounts[this.serviceType].loading !== this.props.accounts[this.serviceType].loading) {
      this.setState({loading: this.props.accounts[this.serviceType].loading});
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
  }

  sendNotifications = () => {
    let {WALLET_SETUP, trustedContactsService} = this.props;
    let {transfer} = this.state;
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
        receivers.push({ walletId: recipient.walletID, FCMs: recipient.FCMs });
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
  }

  onChangeInTransfer = () =>{
    let {transfer} = this.state;
    if (transfer.details) {
      let totalAmount = 0;
      transfer.details.map((item) => {
        totalAmount += parseInt(item.bitcoinAmount);
      });
      if (totalAmount) this.setState({totalAmount: totalAmount})
    }
    if (transfer.stage2 && transfer.stage2.failed) {
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
          this.serviceType === REGULAR_ACCOUNT || this.serviceType === SECURE_ACCOUNT
              ? true
              : false,
      })
      setTimeout(() => {
        (this.refs.SendSuccessBottomSheet as any).snapTo(1);
      }, 2);
    } else if (!transfer.txid && transfer.executed === 'ST2') {
      this.props.navigation.navigate('TwoFAToken', {
        serviceType: this.serviceType,
        recipientAddress: '',
        onTransactionSuccess: this.onTransactionSuccess,
      });
    }
  }

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
    let {sliderValueText} = this.state;
    this.props.clearTransfer(this.serviceType, 'stage2');
    const txPriority =
      sliderValueText === 'Low Fee'
        ? 'low'
        : sliderValueText === 'In the middle'
        ? 'medium'
        : 'high';
    if (this.sweepSecure) {
      this.props.alternateTransferST2(this.serviceType, txPriority);
    } else {
      this.props.transferST2(this.serviceType, txPriority);
    }
  }

  tapSliderHandler = (evt) => {
    if (this.viewRef.current) {
      this.viewRef.current.measure((fx, fy, width, height, px) => {
        const location = (evt.nativeEvent.locationX - px) / width;
        if (location >= -0.1 && location <= 0.2) {
          this.setState({sliderValue: 0})
        } else if (location >= 0.3 && location <= 0.6) {
          this.setState({sliderValue: 5})
        } else if (location >= 0.7 && location <= 1) {
          this.setState({sliderValue: 10})
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
    if ((this.refs.SendSuccessBottomSheet as any))
      (this.refs.SendSuccessBottomSheet as any).snapTo(1);
  };

  render() {
    const {
      switchOn,
      CurrencyCode,
      totalAmount,
      sliderValue,
      sliderValueText,
      SelectedContactId,
      transfer,
      loading,
    } = this.state;
    const { navigation, exchangeRates } = this.props;
  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
              this.props.clearTransfer(this.serviceType, 'stage1');
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
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              {this.serviceType == TEST_ACCOUNT
                ? 'Test Account'
                : this.serviceType == REGULAR_ACCOUNT
                ? 'Checking Account'
                : 'Savings Account'}
            </Text>
          </View>
        </View>
      </View>
      <ScrollView>
        <View
          style={{
            paddingBottom: hp('1%'),
            paddingTop: hp('0.7%'),
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
            marginBottom: hp('1%'),
            marginTop: hp('1%'),
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansItalic,
            }}
          >
            {this.getServiceTypeAccount()}
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
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansItalic,
              }}
            >
              {this.serviceType == 'Test Account'
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
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(9),
                fontFamily: Fonts.FiraSansMediumItalic,
              }}
            >
              {this.serviceType == 'Test Account'
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
                      this.setState({SelectedContactId: 0});
                    else this.setState({SelectedContactId: item.selectedContact.id});
                  }
                }}
                item={item}
                SelectedContactId={SelectedContactId}
              />
            ))}
          </ScrollView>
        ) : null}

        <View
          style={{
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
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: 5,
            }}
          >
            Total Amount
          </Text>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <View style={styles.amountInputImage}>
                <Image
                  style={styles.textBoxImage}
                  source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                />
              </View>
              <View
                style={{
                  width: 1,
                  height: '60%',
                  backgroundColor: Colors.borderColor,
                  marginRight: 5,
                  marginLeft: 5,
                  alignSelf: 'center',
                }}
              />
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue(20),
                  fontFamily: Fonts.FiraSansRegular,
                  marginLeft: 10,
                }}
              >
                {totalAmount}
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                  marginRight: 5,
                }}
              >
                {' sats'}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
            marginTop: hp('2%'),
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: 5,
            }}
          >
            Transaction Priority
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(12),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: 5,
            }}
          >
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
                    this.setState({sliderValue:value});
                  }}
                  onSlidingComplete={(value) => {
                    value == 0
                      ? this.setState({sliderValueText: 'Low Fee'})
                      : value == 5
                      ? this.setState({sliderValueText: 'In the middle'})
                      :this.setState({sliderValueText: 'Fast Transaction'});
                  }}
                />
              </TouchableWithoutFeedback>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                  textAlign: 'center',
                  flex: 1,
                  flexWrap: 'wrap',
                  marginRight: 5,
                }}
              >
                {'Low Fee\n'} (
                {transfer.stage1 && transfer.stage1.txPrerequisites
                  ? transfer.stage1.txPrerequisites['low'].fee
                  : ''}
                {' sats'})
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                  textAlign: 'center',
                  flex: 1,
                  flexWrap: 'wrap',
                  marginRight: 5,
                }}
              >
                {'In the middle\n'} (
                {transfer.stage1 && transfer.stage1.txPrerequisites
                  ? transfer.stage1.txPrerequisites['medium'].fee
                  : ''}
                {' sats'})
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                  textAlign: 'center',
                  flex: 1,
                  flexWrap: 'wrap',
                }}
              >
                {'Fast Transaction\n'} (
                {transfer.stage1 && transfer.stage1.txPrerequisites
                  ? transfer.stage1.txPrerequisites['high'].fee
                  : ''}
                {' sats'})
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: hp('3%') }}>
          <BottomInfoBox
            title={'Note'}
            infoText={
              'When you want to send bitcoin, you need the address of the receiver. For this you can either scan a QR code from their wallet/ app or copy address into the address field'
            }
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginTop: hp('3%'),
            marginBottom: hp('5%'),
            marginLeft: wp('6%'),
            marginRight: wp('6%'),
          }}
        >
          <TouchableOpacity
            onPress={this.onConfirm}
            disabled={loading.transfer}
            style={{
              ...styles.confirmButtonView,
              backgroundColor: Colors.blue,
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
            }}
          >
            {loading.transfer ? (
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
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
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
              if ((this.refs.SendSuccessBottomSheet as any))
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
          />
        )}
        renderHeader={() => (
          <ModalHeader
            onPressHeader={() => {
              if ((this.refs.SendSuccessBottomSheet as any))
                (this.refs.SendSuccessBottomSheet as any).snapTo(0);
              navigation.navigate('Accounts');
            }}
          />
        )}
      />

      <BottomSheet
        onCloseStart={() => {
          (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
        }}
        enabledInnerScrolling={true}
        ref={'SendUnSuccessBottomSheet'}
        snapPoints={[-50, hp('65%')]}
        renderContent={() => (
          <SendConfirmationContent
            title={'Sent Unsuccessful'}
            info={'There seems to be a problem'}
            userInfo={transfer.details?transfer.details:[]}
            isFromContact={false}
            okButtonText={'Try Again'}
            cancelButtonText={'Back'}
            isCancel={true}
            onPressOk={() => {
              if ((this.refs.SendUnSuccessBottomSheet as any))
                (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
            }}
            onPressCancel={() => {
              this.props.clearTransfer(this.serviceType);
              if ((this.refs.SendUnSuccessBottomSheet as any))
                (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
              navigation.navigate('Accounts');
            }}
            isUnSuccess={true}
          />
        )}
        renderHeader={() => (
          <ModalHeader
            onPressHeader={() => {
              if ((this.refs.SendUnSuccessBottomSheet as any))
                (this.refs.SendUnSuccessBottomSheet as any).snapTo(0);
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
    exchangeRates: idx(state, (_) => _.accounts.exchangeRates),
    accounts: idx(state, (_) => _.accounts) || [],
    WALLET_SETUP: idx(state, (_) => _.storage.database.WALLET_SETUP.walletName) || '',
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
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
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
  inputBoxFocused: {
    borderWidth: 0.5,
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
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
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
  closemarkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  contactProfileView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
});
