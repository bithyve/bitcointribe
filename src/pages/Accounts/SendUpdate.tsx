import React, { Component } from 'react';
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
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  ImageBackground,
  FlatList,
  Alert,
  InteractionManager,
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
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import DeviceInfo from 'react-native-device-info';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
} from '../../common/constants/serviceTypes';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  TrustedContactDerivativeAccountElements,
  DonationDerivativeAccountElements,
} from '../../bitcoin/utilities/Interface';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import {
  addTransferDetails,
  clearTransfer,
  removeTwoFA,
  setAverageTxFee,
} from '../../store/actions/accounts';
import BottomInfoBox from '../../components/BottomInfoBox';
import SendHelpContents from '../../components/Helper/SendHelpContents';
import Toast from '../../components/Toast';
import config from '../../bitcoin/HexaConfig';
import Loader from '../../components/loader';
import QRCodeThumbnail from './QRCodeThumbnail';
import ContactListSend from './ContactListSend';
import AccountsListSend from './AccountsListSend';
import { connect } from 'react-redux';
import { withNavigationFocus } from 'react-navigation';
import idx from 'idx';
import { setSendHelper, setTwoFASetup } from '../../store/actions/preferences';

interface SendPropsTypes {
  navigation: any;
  addTransferDetails: any;
  removeTwoFA: any;
  clearTransfer: any;
  regularAccount: RegularAccount;
  trustedContactsService: TrustedContactsService;
  service: any;
  transfer: any;
  accounts: any;
  trustedContactsInfo: any;
  isSendHelperDoneValue: any;
  setSendHelper: any;
  isTwoFASetupDone: any;
  setTwoFASetup: any;
  averageTxFees: any;
  setAverageTxFee: any;
}

interface SendStateTypes {
  trustedContacts: any[];
  isLoading: boolean;
  openCameraFlag: boolean;
  serviceType: string;
  recipientAddress: string;
  isSendHelperDone: boolean;
  isInvalidAddress: boolean;
  balances: any;
  isEditable: boolean;
  accountData: any[];
  sweepSecure: any;
  spendableBalance: any;
  derivativeAccountDetails: { type: string; number: number };
  getServiceType: any;
  carouselIndex: number;
  averageTxFees: any;
}

class Send extends Component<SendPropsTypes, SendStateTypes> {
  constructor(props) {
    super(props);
    this.state = {
      trustedContacts: [],
      isLoading: true,
      openCameraFlag: false,
      serviceType: this.props.navigation.getParam('serviceType')
        ? this.props.navigation.getParam('serviceType')
        : REGULAR_ACCOUNT,
      sweepSecure: this.props.navigation.getParam('sweepSecure'),
      spendableBalance: this.props.navigation.getParam('spendableBalance'),
      averageTxFees: this.props.navigation.getParam('averageTxFees'),
      derivativeAccountDetails: this.props.navigation.getParam(
        'derivativeAccountDetails',
      ),
      recipientAddress: '',
      isSendHelperDone: true,
      isInvalidAddress: false,
      isEditable: true,
      balances: {
        testBalance: 0,
        regularBalance: 0,
        secureBalance: 0,
      },
      accountData: [
        {
          id: REGULAR_ACCOUNT,
          account_name: 'Checking Account',
          type: REGULAR_ACCOUNT,
          checked: false,
          image: require('../../assets/images/icons/icon_regular_account.png'),
        },
        {
          id: SECURE_ACCOUNT,
          account_name: 'Savings Account',
          type: SECURE_ACCOUNT,
          checked: false,
          image: require('../../assets/images/icons/icon_secureaccount_white.png'),
        },
      ],
      getServiceType: this.props.navigation.getParam('getServiceType')
        ? this.props.navigation.getParam('getServiceType')
        : null,
      carouselIndex: this.props.navigation.getParam('carouselIndex')
        ? this.props.navigation.getParam('carouselIndex')
        : null,
    };
  }

  componentDidMount = () => {
    this.updateAccountData();
    this.props.clearTransfer(this.state.serviceType);
    this.getAccountBalances();
    if (this.state.serviceType === SECURE_ACCOUNT) this.twoFASetupMethod();
    this.checkNShowHelperModal();
    this.setRecipientAddress();
    if (!this.state.averageTxFees) this.storeAverageTxFees();
    if (this.props.regularAccount.hdWallet.derivativeAccounts)
      this.updateAddressBook();

    if (this.state.isLoading) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          this.setState({ isLoading: false });
        }, 2000);
      });
      InteractionManager.setDeadline(3);
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.accounts !== this.props.accounts) {
      this.getAccountBalances();
    }

    if (
      prevProps.service[this.state.serviceType].service !==
      this.props.service[this.state.serviceType].service
    ) {
      this.storeAverageTxFees();
    }
    if (
      prevProps.regularAccount.hdWallet.derivativeAccounts !==
      this.props.regularAccount.hdWallet.derivativeAccounts
    ) {
      this.updateAddressBook();
    }

    if (prevState.recipientAddress !== this.state.recipientAddress) {
      this.setRecipientAddress();
    }
  };

  updateAccountData = () => {
    const defaultAccountData = [
      {
        id: REGULAR_ACCOUNT,
        account_name: 'Checking Account',
        type: REGULAR_ACCOUNT,
        checked: false,
        image: require('../../assets/images/icons/icon_regular_account.png'),
      },
      {
        id: SECURE_ACCOUNT,
        account_name: 'Savings Account',
        type: SECURE_ACCOUNT,
        checked: false,
        image: require('../../assets/images/icons/icon_secureaccount_white.png'),
      },
    ];

    const donationAccountData = [];
    for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {
      const derivativeAccounts = this.props.accounts[serviceType].service[
        serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet'
      ].derivativeAccounts;

      if (!derivativeAccounts[DONATION_ACCOUNT]) continue;

      for (
        let index = 1;
        index <= derivativeAccounts[DONATION_ACCOUNT].instance.using;
        index++
      ) {
        const donationInstance = {
          id: DONATION_ACCOUNT,
          account_number: index,
          account_name: 'Donation Account',
          type: serviceType,
          checked: false,
          image: require('../../assets/images/icons/icon_donation_account.png'),
        };
        donationAccountData.push(donationInstance);
      }
    }

    this.setState({
      accountData: [...defaultAccountData, ...donationAccountData],
    });
  };

  getAccountBalances = () => {
    const { accounts } = this.props;
    const { serviceType } = this.state;

    const testBalance = accounts[TEST_ACCOUNT].service
      ? accounts[TEST_ACCOUNT].service.hdWallet.balances.balance +
        accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    let regularBalance = accounts[REGULAR_ACCOUNT].service
      ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
        accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    let secureBalance = accounts[SECURE_ACCOUNT].service
      ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
        accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
          .unconfirmedBalance
      : 0;

    let derivativeBalance = 0;
    if (serviceType === REGULAR_ACCOUNT || serviceType === SECURE_ACCOUNT) {
      for (const dAccountType of config.DERIVATIVE_ACC_TO_SYNC) {
        let derivativeAccount;

        // calculating opposite accounts derivative balance for account tiles
        if (serviceType !== REGULAR_ACCOUNT) {
          derivativeAccount =
            accounts[REGULAR_ACCOUNT].service.hdWallet.derivativeAccounts[
              dAccountType
            ];
        } else if (serviceType !== SECURE_ACCOUNT) {
          derivativeAccount =
            accounts[SECURE_ACCOUNT].service.secureHDWallet.derivativeAccounts[
              dAccountType
            ];
        }

        if (
          serviceType !== SECURE_ACCOUNT &&
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
              derivativeBalance +=
                derivativeAccount[accountNumber].balances.balance +
                derivativeAccount[accountNumber].balances.unconfirmedBalance;
            }
          }
        }
      }
    }

    if (serviceType !== REGULAR_ACCOUNT) regularBalance += derivativeBalance;
    else if (serviceType !== SECURE_ACCOUNT) secureBalance += derivativeBalance;

    let donationsBalance = {};
    for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {
      const derivativeAccounts =
        accounts[serviceType].service[
          serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet'
        ].derivativeAccounts;

      if (!derivativeAccounts[DONATION_ACCOUNT]) continue;

      for (
        let index = 1;
        index <= derivativeAccounts[DONATION_ACCOUNT].instance.using;
        index++
      ) {
        const donAcc: DonationDerivativeAccountElements =
          derivativeAccounts[DONATION_ACCOUNT][index];
        donationsBalance[serviceType + index] =
          donAcc.balances.balance + donAcc.balances.unconfirmedBalance;
      }
    }

    this.setState({
      balances: {
        testBalance,
        regularBalance,
        secureBalance,
        donationsBalance,
      },
    });
  };

  checkNShowHelperModal = async () => {
    let isSendHelperDone = this.props.isSendHelperDoneValue;
    //let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
    if (!isSendHelperDone && this.state.serviceType == TEST_ACCOUNT) {
      this.props.setSendHelper(true);
      //await AsyncStorage.setItem('isSendHelperDone', 'true');
      this.setState({ isSendHelperDone: true });
      setTimeout(() => {
        if (this.refs.SendHelperBottomSheet)
          (this.refs.SendHelperBottomSheet as any).snapTo(1);
      }, 1000);
    } else {
      this.setState({ isSendHelperDone: false });
    }
  };

  setRecipientAddress = () => {
    const { service } = this.props;
    const {
      recipientAddress,
      serviceType,
      sweepSecure,
      spendableBalance,
      derivativeAccountDetails,
    } = this.state;
    // const instance = service[serviceType].service.hdWallet || service[serviceType].service.secureHDWallet;
    // // console.log("instance setRecipientAddress", instance);
    // let isAddressValid = instance.isValidAddress(recipientAddress);
    // //console.log("isAddressValid setRecipientAddress", isAddressValid, recipientAddress);
    // if (isAddressValid) {
    //   let item = {
    //     id: recipientAddress, // address serves as the id during manual addition
    //   };
    //   this.onSelectContact(item);
    // }
    const { type } = service[serviceType].service.addressDiff(
      recipientAddress.trim(),
    );
    if (type) {
      let item;
      switch (type) {
        case 'address':
          item = {
            id: recipientAddress.trim(), // address serves as the id during manual addition
          };
          this.onSelectContact(item);
          break;

        case 'paymentURI':
          let address, options;
          try {
            const res = service[serviceType].service.decodePaymentURI(
              recipientAddress.trim(),
            );
            address = res.address;
            options = res.options;
          } catch (err) {
            Alert.alert('Unable to decode payment URI');
            return;
          }

          item = {
            id: address,
          };

          this.props.addTransferDetails(serviceType, {
            selectedContact: item,
          });

          this.props.navigation.navigate('SendToContact', {
            selectedContact: item,
            serviceType,
            sweepSecure,
            spendableBalance,
            derivativeAccountDetails,
            bitcoinAmount: options.amount
              ? `${Math.round(options.amount * 1e8)}`
              : '',
          });
          break;
      }
    }
  };

  barcodeRecognized = async (barcodes) => {
    const { service } = this.props;
    const {
      serviceType,
      sweepSecure,
      spendableBalance,
      derivativeAccountDetails,
    } = this.state;
    //console.log('barcodes', barcodes);
    if (barcodes.data) {
      const { type } = service[serviceType].service.addressDiff(
        barcodes.data.trim(),
      );
      if (type) {
        let item;
        switch (type) {
          case 'address':
            const recipientAddress = barcodes.data;
            item = {
              id: recipientAddress,
            };
            this.onSelectContact(item);
            break;

          case 'paymentURI':
            let address, options;
            try {
              const res = service[serviceType].service.decodePaymentURI(
                barcodes.data,
              );
              address = res.address;
              options = res.options;
            } catch (err) {
              Alert.alert('Unable to decode payment URI');
              return;
            }
            item = {
              id: address,
            };

            this.props.addTransferDetails(serviceType, {
              selectedContact: item,
            });

            this.props.navigation.navigate('SendToContact', {
              selectedContact: item,
              serviceType,
              sweepSecure,
              spendableBalance,
              derivativeAccountDetails,
              bitcoinAmount: options.amount
                ? `${Math.round(options.amount * 1e8)}`
                : '',
            });
            break;

          default:
            Toast('Invalid QR');
            break;
        }

        this.setState({ openCameraFlag: false });
      } else {
        this.setState({ isInvalidAddress: true });
      }
    }
  };

  onSelectContact = (item, bitcoinAmount?) => {
    const { transfer } = this.props;
    const {
      serviceType,
      averageTxFees,
      sweepSecure,
      spendableBalance,
      derivativeAccountDetails,
    } = this.state;

    let isNavigate = true;
    // console.log({ details: transfer[serviceType].transfer.details });
    if (
      transfer[serviceType].transfer.details &&
      transfer[serviceType].transfer.details.length === 0
    ) {
      //  console.log('dispatching');
      this.props.addTransferDetails(serviceType, {
        selectedContact: item,
      });
      this.setState({ recipientAddress: '' });
      this.props.navigation.navigate('SendToContact', {
        selectedContact: item,
        serviceType,
        averageTxFees,
        sweepSecure,
        spendableBalance,
        derivativeAccountDetails,
        bitcoinAmount,
      });
    } else {
      transfer[serviceType].transfer.details.length &&
        transfer[serviceType].transfer.details.map((contact) => {
          if (contact.selectedContact.id === item.id) {
            return (isNavigate = false);
          }
        });
      if (isNavigate) {
        this.props.addTransferDetails(serviceType, {
          selectedContact: item,
        });
        this.setState({ recipientAddress: '' });
        this.props.navigation.navigate('SendToContact', {
          selectedContact: item,
          serviceType,
          averageTxFees,
          sweepSecure,
          spendableBalance,
          derivativeAccountDetails,
          bitcoinAmount,
        });
      }
    }
  };

  twoFASetupMethod = async () => {
    const { service, isTwoFASetupDone } = this.props; //(await AsyncStorage.getItem('twoFASetup')
    if (
      !isTwoFASetupDone &&
      service[this.state.serviceType].service.secureHDWallet.twoFASetup
    ) {
      this.props.navigation.navigate('TwoFASetup', {
        twoFASetup:
          service[this.state.serviceType].service.secureHDWallet.twoFASetup,
      });
      this.props.removeTwoFA();
      this.props.setSendHelper(true);
      //await AsyncStorage.setItem('twoFASetup', 'true');
    }
  };

  storeAverageTxFees = async () => {
    const { service } = this.props;
    const { serviceType } = this.state;
    const storedAverageTxFees = this.props.averageTxFees;
    const instance =
      service[serviceType].service.hdWallet ||
      service[serviceType].service.secureHDWallet;
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

  updateAddressBook = async () => {
    const { regularAccount, trustedContactsService } = this.props;
    const { serviceType } = this.state;
    let { trustedContactsInfo } = this.props;
    if (trustedContactsInfo) {
      if (trustedContactsInfo.length) {
        const sendableTrustedContacts = [];
        for (let index = 0; index < trustedContactsInfo.length; index++) {
          const contactInfo = trustedContactsInfo[index];
          if (!contactInfo) continue;
          const contactName = `${contactInfo.firstName} ${
            contactInfo.lastName ? contactInfo.lastName : ''
          }`;
          let connectedVia;
          if (contactInfo.phoneNumbers && contactInfo.phoneNumbers.length) {
            connectedVia = contactInfo.phoneNumbers[0].number;
          } else if (contactInfo.emails && contactInfo.emails.length) {
            connectedVia = contactInfo.emails[0].email;
          }

          let hasXpub = false;
          const {
            trustedContactToDA,
            derivativeAccounts,
          } = regularAccount.hdWallet;
          const accountNumber =
            trustedContactToDA[contactName.toLowerCase().trim()];
          if (accountNumber) {
            const trustedContact: TrustedContactDerivativeAccountElements =
              derivativeAccounts[TRUSTED_CONTACTS][accountNumber];
            if (serviceType === TEST_ACCOUNT) {
              if (
                trustedContact.contactDetails &&
                trustedContact.contactDetails.tpub
              ) {
                hasXpub = true;
              }
            } else {
              if (
                trustedContact.contactDetails &&
                trustedContact.contactDetails.xpub
              ) {
                hasXpub = true;
              }
            }
          }

          const {
            isWard,
            trustedAddress,
            trustedTestAddress,
          } = trustedContactsService.tc.trustedContacts[
            contactName.toLowerCase().trim()
          ];

          let hasTrustedAddress = false;
          if (serviceType === TEST_ACCOUNT)
            hasTrustedAddress = !!trustedTestAddress;
          else hasTrustedAddress = !!trustedAddress;

          const isGuardian = index < 3 ? true : false;
          if (hasXpub || hasTrustedAddress) {
            // sendable
            sendableTrustedContacts.push({
              contactName,
              connectedVia,
              hasXpub,
              hasTrustedAddress,
              isGuardian,
              isWard,
              ...contactInfo,
            });
          }
        }

        let sortedTrustedContacts = sendableTrustedContacts.sort(function (
          contactA,
          contactB,
        ) {
          if (contactA.contactName && contactB.contactName) {
            if (
              contactA.contactName.toLowerCase().trim() <
              contactB.contactName.toLowerCase().trim()
            )
              return -1;
            if (
              contactA.contactName.toLowerCase().trim() >
              contactB.contactName.toLowerCase().trim()
            )
              return 1;
          }
          return 0;
        });
        this.setState({ trustedContacts: sortedTrustedContacts });
      }
    }
  };

  render() {
    const {
      trustedContacts,
      isLoading,
      openCameraFlag,
      serviceType,
      recipientAddress,
      isSendHelperDone,
      isInvalidAddress,
      balances,
      isEditable,
      accountData,
      getServiceType,
      carouselIndex,
    } = this.state;
    const { clearTransfer, service, transfer, accounts } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalContentContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : ''}
            enabled
          >
            <ScrollView nestedScrollEnabled={true}>
              <View onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeaderTitleView}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => {
                        if (getServiceType) {
                          getServiceType(serviceType, carouselIndex);
                        }
                        clearTransfer(serviceType);
                        this.props.navigation.goBack();
                      }}
                      style={styles.backButton}
                    >
                      <FontAwesome
                        name="long-arrow-left"
                        color={Colors.blue}
                        size={17}
                      />
                    </TouchableOpacity>
                    <Image
                      source={
                        this.state.derivativeAccountDetails
                          ? require('../../assets/images/icons/icon_donation_account.png')
                          : serviceType == TEST_ACCOUNT
                          ? require('../../assets/images/icons/icon_test.png')
                          : serviceType == REGULAR_ACCOUNT
                          ? require('../../assets/images/icons/icon_regular.png')
                          : require('../../assets/images/icons/icon_secureaccount.png')
                      }
                      style={{ width: wp('10%'), height: wp('10%') }}
                    />
                    <View style={{ marginLeft: wp('2.5%') }}>
                      <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
                      <Text style={styles.accountText}>
                        Choose a recipient
                        {/* {this.state.derivativeAccountDetails
                          ? 'Donation Account'
                          : serviceType == TEST_ACCOUNT
                          ? 'Test Account'
                          : serviceType == REGULAR_ACCOUNT
                          ? 'Checking Account'
                          : 'Savings Account'} */}
                      </Text>
                    </View>
                    {serviceType == TEST_ACCOUNT ? (
                      <Text
                        onPress={() => {
                          this.props.setSendHelper(true);
                          //  AsyncStorage.setItem('isSendHelperDone', 'true');
                          if (this.refs.SendHelperBottomSheet)
                            (this.refs.SendHelperBottomSheet as any).snapTo(1);
                        }}
                        style={styles.knowmoreText}
                      >
                        Know more
                      </Text>
                    ) : null}
                  </View>
                </View>
                <QRCodeThumbnail
                  isOpenCameraFlag={openCameraFlag}
                  onQrScan={(qrData) => this.barcodeRecognized(qrData)}
                />
                <View style={styles.view1}>
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
                      onChangeText={(text) =>
                        this.setState({ recipientAddress: text })
                      }
                      placeholderTextColor={Colors.borderColor}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            this.setState({ isInvalidAddress: false });
                          }, 10);
                        }
                      }}
                      onBlur={() => {
                        const instance =
                          service[serviceType].service.hdWallet ||
                          service[serviceType].service.secureHDWallet;
                        let isAddressValid = instance.isValidAddress(
                          recipientAddress,
                        );
                        this.setState({ isInvalidAddress: !isAddressValid });
                      }}
                    />
                  </View>
                  {serviceType == TEST_ACCOUNT ? (
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          recipientAddress:
                            '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8',
                        });
                      }}
                      style={{ padding: wp('2%'), marginLeft: 'auto' }}
                    >
                      <Text style={styles.sampleText}>
                        Send it to a sample address !
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {isInvalidAddress ? (
                    <View style={{ marginLeft: 'auto' }}>
                      <Text style={styles.errorText}>
                        Enter correct address
                      </Text>
                    </View>
                  ) : null}
                  <View style={{ paddingTop: wp('3%') }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={styles.sendToContactText}>
                        Send to Contact
                      </Text>
                      <TouchableOpacity onPress={() => {}} style={styles.icon}>
                        <SimpleLineIcons
                          name="options-vertical"
                          color={Colors.blue}
                          size={RFValue(13)}
                        />
                      </TouchableOpacity>
                    </View>
                    {trustedContacts.length ? (
                      <View style={styles.trustedContactView}>
                        <View style={styles.modalHeader}>
                          <TouchableOpacity
                            style={{
                              ...styles.trustedContactForwardIcon,
                              marginRight: 15,
                            }}
                          >
                            <Ionicons
                              name={'ios-arrow-back'}
                              size={RFValue(20)}
                              color={Colors.borderColor}
                            />
                          </TouchableOpacity>
                          <FlatList
                            horizontal
                            nestedScrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            data={trustedContacts}
                            renderItem={(Items) => (
                              <ContactListSend
                                Items={Items.item}
                                transfer={transfer[serviceType].transfer}
                                onSelectContact={this.onSelectContact}
                              />
                            )}
                            extraData={transfer[serviceType].transfer.details}
                            keyExtractor={(item, index) => index.toString()}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.note}>
                        <BottomInfoBox
                          title={'You have not added any Contact'}
                          infoText={
                            'Add a Contact to send them sats without having to scan an address'
                          }
                        />
                      </View>
                    )}
                  </View>
                  {serviceType != TEST_ACCOUNT ? (
                    <View style={{ paddingTop: wp('3%') }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.sendToContactText}>
                          Send to Account
                        </Text>
                        <TouchableOpacity
                          onPress={() => {}}
                          style={styles.icon}
                        >
                          <SimpleLineIcons
                            name="options-vertical"
                            color={Colors.blue}
                            size={RFValue(13)}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.iconBackView}>
                        <TouchableOpacity
                          style={{ ...styles.trustedContactForwardIcon }}
                        >
                          <Ionicons
                            name={'ios-arrow-back'}
                            size={RFValue(20)}
                            color={Colors.borderColor}
                          />
                        </TouchableOpacity>
                        <FlatList
                          data={accountData}
                          horizontal
                          nestedScrollEnabled={true}
                          showsHorizontalScrollIndicator={false}
                          showsVerticalScrollIndicator={false}
                          renderItem={(Items) => {
                            let checked = false;
                            for (
                              let i = 0;
                              i < transfer[serviceType].transfer.details.length;
                              i++
                            ) {
                              const element =
                                transfer[serviceType].transfer.details[i]
                                  .selectedContact;
                              if (element.id == Items.item.id) {
                                checked = true;
                              }
                            }

                            const { derivativeAccountDetails } = this.state;
                            if (
                              Items.item.type != serviceType ||
                              Items.item.id === DONATION_ACCOUNT ||
                              derivativeAccountDetails
                            ) {
                              if (
                                derivativeAccountDetails &&
                                derivativeAccountDetails.type ===
                                  Items.item.id &&
                                serviceType === Items.item.type &&
                                derivativeAccountDetails.number ===
                                  Items.item.account_number
                              )
                                return;
                              return (
                                <AccountsListSend
                                  accounts={Items.item}
                                  balances={balances}
                                  checkedItem={checked}
                                  onSelectContact={this.onSelectContact}
                                />
                              );
                            }
                          }}
                          extraData={{
                            details: transfer[serviceType].transfer.details,
                            balances,
                          }}
                          //keyExtractor={(item, index) => index.toString()}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
        {isLoading ? <Loader /> : null}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'SendHelperBottomSheet'}
          snapPoints={[
            -50,
            hp('89%'),
            // Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
          ]}
          renderContent={() => (
            <SendHelpContents
              titleClicked={() => {
                if (this.refs.SendHelperBottomSheet)
                  (this.refs.SendHelperBottomSheet as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              borderColor={Colors.blue}
              backgroundColor={Colors.blue}
              onPressHeader={() => {
                if (isSendHelperDone) {
                  if (this.refs.SendHelperBottomSheet)
                    (this.refs.SendHelperBottomSheet as any).snapTo(1);
                  setTimeout(() => {
                    this.setState({ isSendHelperDone: false });
                  }, 10);
                } else {
                  if (this.refs.SendHelperBottomSheet)
                    (this.refs.SendHelperBottomSheet as any).snapTo(0);
                }
              }}
            />
          )}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  let trustedContactsInfo = idx(
    state,
    (_) => _.trustedContacts.trustedContactsInfo,
  );
  return {
    service: idx(state, (_) => _.accounts),
    transfer: idx(state, (_) => _.accounts),
    accounts: state.accounts || [],
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    trustedContactsService: idx(state, (_) => _.trustedContacts.service),
    trustedContactsInfo,
    isSendHelperDoneValue: idx(
      state,
      (_) => _.preferences.isSendHelperDoneValue,
    ),
    isTwoFASetupDone: idx(state, (_) => _.preferences.isTwoFASetupDone),
    averageTxFees: idx(state, (_) => _.accounts.averageTxFees),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    removeTwoFA,
    addTransferDetails,
    clearTransfer,
    setSendHelper,
    setTwoFASetup,
    setAverageTxFee,
  })(Send),
);

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    paddingBottom: wp('10%'),
  },
  modalHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  accountText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12),
  },
  view1: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: wp('5%'),
  },
  iconBackView: {
    flexDirection: 'row',
    borderRadius: 10,
    height: wp('40%'),
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  sampleText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansItalic,
  },
  sendToContactText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: wp('3%'),
  },
  icon: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  trustedContactView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    paddingTop: hp('1%'),
    paddingBottom: hp('1%'),
    height: hp('15%'),
    justifyContent: 'center',
    backgroundColor: Colors.backgroundColor,
    borderColor: Colors.backgroundColor,
  },
  trustedContactForwardIcon: {
    backgroundColor: Colors.white,
    height: wp('12%'),
    width: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 5,
    marginLeft: 10,
  },
  knowmoreText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    marginLeft: 'auto',
  },
  note: {
    marginBottom: -25,
    padding: -20,
    marginLeft: -20,
    marginRight: -20,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
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
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: wp('13%'),
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
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
  checkmarkStyle: {
    position: 'absolute',
    width: wp('5%'),
    height: wp('5%'),
    top: 0,
    right: 0,
    zIndex: 999,
    elevation: 10,
  },
  cameraView: {
    width: wp('90%'),
    height: wp('90%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  camera: {
    width: wp('90%'),
    height: wp('90%'),
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
});
