import React, { Component, createRef, ReactElement } from 'react';
import { View, Image, Text, StyleSheet, FlatList, Alert } from 'react-native';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
  DONATION_ACCOUNT,
} from '../../../common/constants/serviceTypes';
import SmallHeaderModal from '../../../components/SmallHeaderModal';
import { TrustedContactDerivativeAccountElements } from '../../../bitcoin/utilities/Interface';
import RegularAccount from '../../../bitcoin/services/accounts/RegularAccount';
import TrustedContactsService from '../../../bitcoin/services/TrustedContactsService';
import {
  addTransferDetails,
  clearTransfer,
  removeTwoFA,
  setAverageTxFee,
} from '../../../store/actions/accounts';
import BottomInfoBox from '../../../components/BottomInfoBox';
import SendHelpContents from '../../../components/Helper/SendHelpContents';
import Toast from '../../../components/Toast';
import config from '../../../bitcoin/HexaConfig';
import AccountsListSend from '../AccountsListSend';
import { connect } from 'react-redux';
import { withNavigationFocus, NavigationScreenConfig } from 'react-navigation';
import idx from 'idx';
import {
  setTwoFASetup,
  initialKnowMoreSendSheetShown,
} from '../../../store/actions/preferences';
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner';
import { NavigationStackOptions } from 'react-navigation-stack';
import defaultStackScreenNavigationOptions from '../../../navigation/options/DefaultStackScreenNavigationOptions';
import KnowMoreButton from '../../../components/KnowMoreButton';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import NavStyles from '../../../common/Styles/NavStyles';
import HeadingStyles from '../../../common/Styles/HeadingStyles';
import RecipientSelectionStrip from '../../../components/send/RecipientSelectionStrip';
import RecipientAddressTextInputSection from '../../../components/send/RecipientAddressTextInputSection';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';
import {
  ContactRecipientDescribing,
  AccountRecipientDescribing,
  makeContactRecipientDescription,
} from '../../../common/data/models/interfaces/RecipientDescribing';

export enum SectionKind {
  SCAN_QR,
  ENTER_ADDRESS,
  SELECT_CONTACTS,
  SELECT_SUB_ACCOUNTS,
}

const sectionListItemKeyExtractor = (index) => String(index);

function renderSectionHeader(
  sectionKind: SectionKind,
  accountKind: string,
): ReactElement | null {
  switch (sectionKind) {
    case SectionKind.SELECT_CONTACTS:
      return <Text style={styles.listSectionHeading}>Send To Contacts</Text>;
    case SectionKind.SELECT_SUB_ACCOUNTS:
      if (accountKind != TEST_ACCOUNT) {
        return <Text style={styles.listSectionHeading}>Send To Accounts</Text>;
      }
  }
}

interface SendPropsTypes {
  navigation: any;
  addTransferDetails: any;
  removeTwoFA: any;
  clearTransfer: any;
  regularAccount: RegularAccount;
  trustedContactsService: TrustedContactsService;
  accountsState: any; // TODO: Strongly type this
  trustedContactsInfo: any;
  isTwoFASetupDone: boolean;
  hasShownInitialKnowMoreSendSheet: boolean;
  setTwoFASetup: any;
  setAverageTxFee: any;
  initialKnowMoreSendSheetShown: Function;
}

interface SendStateTypes {
  trustedContacts: any[];
  isShowingKnowMoreSheet: boolean;
  serviceType: string;
  recipientAddress: string;
  balances: any;
  isEditable: boolean;
  accountData: any[];
  sweepSecure: any;
  spendableBalance: any;
  derivativeAccountDetails: { type: string; number: number };
  getServiceType: any;
  carouselIndex: number;
  averageTxFees: any;
  selectedContacts: ContactRecipientDescribing[];
  selectedSubAccounts: AccountRecipientDescribing[];
}

class Send extends Component<SendPropsTypes, SendStateTypes> {
  static navigationOptions = makeNavigationOptions;

  knowMoreBottomSheetRef = createRef<BottomSheet>();

  constructor(props) {
    super(props);

    this.state = {
      trustedContacts: [],
      isShowingKnowMoreSheet: false,
      serviceType:
        this.props.navigation.getParam('serviceType') || REGULAR_ACCOUNT,
      sweepSecure: this.props.navigation.getParam('sweepSecure'),
      spendableBalance: this.props.navigation.getParam('spendableBalance'),
      averageTxFees: this.props.navigation.getParam('averageTxFees'),
      derivativeAccountDetails: this.props.navigation.getParam(
        'derivativeAccountDetails',
      ),
      recipientAddress: '',
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
          image: require('../../../assets/images/icons/icon_regular_account.png'),
        },
        {
          id: SECURE_ACCOUNT,
          account_name: 'Savings Account',
          type: SECURE_ACCOUNT,
          checked: false,
          image: require('../../../assets/images/icons/icon_secureaccount_white.png'),
        },
      ],
      getServiceType: this.props.navigation.getParam('getServiceType') || null,
      carouselIndex: this.props.navigation.getParam('carouselIndex') || null,
      selectedContacts: [],
      selectedSubAccounts: [],
    };
  }

  componentDidMount = () => {
    this.props.navigation.setParams({
      toggleKnowMoreSheet: this.toggleKnowMoreSheet,
    });
    this.updateAccountData();
    this.props.clearTransfer(this.state.serviceType);
    this.getAccountBalances();
    console.log({ avgTxFee: this.state.averageTxFees });
    if (this.state.serviceType === SECURE_ACCOUNT) {
      this.twoFASetupMethod();
    }

    if (
      this.state.serviceType === TEST_ACCOUNT &&
      !this.props.hasShownInitialKnowMoreSendSheet
    ) {
      this.knowMoreBottomSheetRef.current?.snapTo(1);
    }

    this.setRecipientAddress();

    if (this.props.regularAccount.hdWallet.derivativeAccounts) {
      this.updateAddressBook();
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.accountsState !== this.props.accountsState) {
      this.getAccountBalances();
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

  toggleKnowMoreSheet = () => {
    const shouldShow = !this.state.isShowingKnowMoreSheet;

    this.setState({ isShowingKnowMoreSheet: shouldShow }, () => {
      if (shouldShow) {
        this.knowMoreBottomSheetRef.current?.snapTo(1);
      } else {
        this.knowMoreBottomSheetRef.current?.snapTo(0);
      }
    });
  };

  updateAccountData = () => {
    const defaultAccountData = [
      {
        id: REGULAR_ACCOUNT,
        account_name: 'Checking Account',
        type: REGULAR_ACCOUNT,
        checked: false,
        image: require('../../../assets/images/icons/icon_regular_account.png'),
      },
      {
        id: SECURE_ACCOUNT,
        account_name: 'Savings Account',
        type: SECURE_ACCOUNT,
        checked: false,
        image: require('../../../assets/images/icons/icon_secureaccount_white.png'),
      },
    ];

    const additionalAccountData = [];
    for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {
      const derivativeAccounts = this.props.accountsState[serviceType].service[
        serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet'
      ].derivativeAccounts;

      for (const accType of config.EJECTED_ACCOUNTS) {
        if (!derivativeAccounts[accType]) continue;

        for (
          let index = 1;
          index <= derivativeAccounts[accType].instance.using;
          index++
        ) {
          const accInstance = {
            id: accType,
            account_number: index,
            account_name:
              accType === DONATION_ACCOUNT
                ? 'Donation Account'
                : serviceType === REGULAR_ACCOUNT
                ? 'Checking Account'
                : 'Savings Account',
            type: serviceType,
            checked: false,
            image:
              accType === DONATION_ACCOUNT
                ? require('../../../assets/images/icons/icon_donation_account.png')
                : serviceType === REGULAR_ACCOUNT
                ? require('../../../assets/images/icons/icon_regular_account.png')
                : require('../../../assets/images/icons/icon_secureaccount_white.png'),
          };
          additionalAccountData.push(accInstance);
        }
      }
    }

    this.setState({
      accountData: [...defaultAccountData, ...additionalAccountData],
    });
  };

  getAccountBalances = () => {
    const { accountsState } = this.props;
    const { serviceType } = this.state;

    const testBalance = accountsState[TEST_ACCOUNT].service
      ? accountsState[TEST_ACCOUNT].service.hdWallet.balances.balance +
        accountsState[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    let regularBalance = accountsState[REGULAR_ACCOUNT].service
      ? accountsState[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
        accountsState[REGULAR_ACCOUNT].service.hdWallet.balances
          .unconfirmedBalance
      : 0;
    let secureBalance = accountsState[SECURE_ACCOUNT].service
      ? accountsState[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
        accountsState[SECURE_ACCOUNT].service.secureHDWallet.balances
          .unconfirmedBalance
      : 0;

    let derivativeBalance = 0;
    if (serviceType === REGULAR_ACCOUNT || serviceType === SECURE_ACCOUNT) {
      for (const dAccountType of config.DERIVATIVE_ACC_TO_SYNC) {
        let derivativeAccount;

        // calculating opposite accounts derivative balance for account tiles
        if (serviceType !== REGULAR_ACCOUNT) {
          derivativeAccount =
            accountsState[REGULAR_ACCOUNT].service.hdWallet.derivativeAccounts[
              dAccountType
            ];
        } else if (serviceType !== SECURE_ACCOUNT) {
          derivativeAccount =
            accountsState[SECURE_ACCOUNT].service.secureHDWallet
              .derivativeAccounts[dAccountType];
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

    let additionalBalances = {};
    for (const serviceType of [REGULAR_ACCOUNT, SECURE_ACCOUNT]) {
      const derivativeAccounts =
        accountsState[serviceType].service[
          serviceType === SECURE_ACCOUNT ? 'secureHDWallet' : 'hdWallet'
        ].derivativeAccounts;

      for (const ejectedAcc of config.EJECTED_ACCOUNTS) {
        if (!derivativeAccounts[ejectedAcc]) continue;

        for (
          let index = 1;
          index <= derivativeAccounts[ejectedAcc].instance.using;
          index++
        ) {
          const acc = derivativeAccounts[ejectedAcc][index];
          additionalBalances[serviceType + ejectedAcc + index] = acc.balances
            ? acc.balances.balance + acc.balances.unconfirmedBalance
            : 0;
        }
      }
    }

    this.setState({
      balances: {
        testBalance,
        regularBalance,
        secureBalance,
        additionalBalances,
      },
    });
  };

  setRecipientAddress = () => {
    const { accountsState } = this.props;
    const {
      recipientAddress,
      serviceType,
      sweepSecure,
      spendableBalance,
      derivativeAccountDetails,
    } = this.state;

    const { type } = accountsState[serviceType].service.addressDiff(
      recipientAddress.trim(),
    );

    if (type) {
      let item;
      switch (type) {
        case 'address':
          item = {
            id: recipientAddress.trim(), // address serves as the id during manual addition
          };
          this.onRecipientSelected(item);
          break;

        case 'paymentURI':
          let address, options, donationId;
          try {
            const res = accountsState[serviceType].service.decodePaymentURI(
              recipientAddress.trim(),
            );
            address = res.address;
            options = res.options;

            // checking for donationId to send note
            if (options && options.message) {
              const rawMessage = options.message;
              donationId = rawMessage.split(':').pop().trim();
            }
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
            donationId,
          });
          break;
      }
    }
  };

  barcodeRecognized = async (barcodes) => {
    const { accountsState } = this.props;

    const {
      serviceType,
      sweepSecure,
      spendableBalance,
      derivativeAccountDetails,
    } = this.state;

    if (barcodes.data) {
      const { type } = accountsState[serviceType].service.addressDiff(
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
            this.onRecipientSelected(item);
            break;

          case 'paymentURI':
            let address, options, donationId;
            try {
              const res = accountsState[serviceType].service.decodePaymentURI(
                barcodes.data,
              );
              address = res.address;
              options = res.options;

              // checking for donationId to send note
              if (options && options.message) {
                const rawMessage = options.message;
                donationId = rawMessage.split(':').pop().trim();
              }
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
              donationId,
            });
            break;

          default:
            Toast('Invalid QR');
            break;
        }
      }
    }
  };

  onRecipientSelected = (recipient, bitcoinAmount?) => {
    const { accountsState } = this.props;

    const {
      serviceType,
      averageTxFees,
      sweepSecure,
      spendableBalance,
      derivativeAccountDetails,
    } = this.state;

    let isNavigate = true;

    if (
      accountsState[serviceType].transfer.details &&
      accountsState[serviceType].transfer.details.length === 0
    ) {
      this.props.addTransferDetails(serviceType, {
        selectedContact: recipient,
      });
      this.setState({ recipientAddress: '' });

      this.props.navigation.navigate('SendToContact', {
        selectedContact: recipient,
        serviceType,
        averageTxFees,
        sweepSecure,
        spendableBalance,
        derivativeAccountDetails,
        bitcoinAmount,
      });
    } else {
      accountsState[serviceType].transfer.details.length &&
        accountsState[serviceType].transfer.details.map((contact) => {
          if (contact.selectedContact.id === recipient.id) {
            if (config.EJECTED_ACCOUNTS.includes(recipient.id)) {
              if (
                recipient.account_number ===
                  contact.selectedContact.account_number &&
                recipient.type === contact.selectedContact.type
              ) {
                return (isNavigate = false);
              }
            } else {
              return (isNavigate = false);
            }
          }
        });
      if (isNavigate) {
        this.props.addTransferDetails(serviceType, {
          selectedContact: recipient,
        });
        this.setState({ recipientAddress: '' });
        this.props.navigation.navigate('SendToContact', {
          selectedContact: recipient,
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
    const { accountsState, isTwoFASetupDone } = this.props;

    if (
      !isTwoFASetupDone &&
      accountsState[this.state.serviceType].service.secureHDWallet.twoFASetup
    ) {
      this.props.navigation.navigate('TwoFASetup', {
        twoFASetup:
          accountsState[this.state.serviceType].service.secureHDWallet
            .twoFASetup,
      });
      this.props.removeTwoFA();
    }
  };

  updateAddressBook = async () => {
    const {
      regularAccount,
      trustedContactsService,
      trustedContactsInfo,
    } = this.props;
    const { serviceType } = this.state;

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
            contactsWalletName,
            lastSeen,
          } = trustedContactsService.tc.trustedContacts[
            contactName.toLowerCase().trim()
          ];

          const hasTrustedAddress = Boolean(
            serviceType === TEST_ACCOUNT ? trustedTestAddress : trustedAddress,
          );

          const isGuardian = index < 3 ? true : false;

          if (hasXpub || hasTrustedAddress) {
            // sendable
            sendableTrustedContacts.push({
              contactName:
                contactInfo.firstName === 'F&F request' && contactsWalletName
                  ? contactsWalletName
                  : contactName,
              connectedVia,
              hasXpub,
              hasTrustedAddress,
              isGuardian,
              isWard,
              lastSeen,
              contactsWalletName,
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
      serviceType,
      balances,
      accountData,
      trustedContacts,
      selectedContacts,
      selectedSubAccounts,
    } = this.state;

    const { accountsState } = this.props;

    return (
      <View style={styles.rootContainer}>
        <KeyboardAwareSectionList
          extraData={[
            accountData,
            trustedContacts,
            selectedContacts,
            selectedSubAccounts,
          ]}
          showsVerticalScrollIndicator={false}
          sections={[
            {
              kind: SectionKind.SCAN_QR,
              data: [null],
              renderItem: () => {
                return (
                  <View style={styles.viewSectionContainer}>
                    <CoveredQRCodeScanner
                      onCodeScanned={this.barcodeRecognized}
                    />
                  </View>
                );
              },
            },
            {
              kind: SectionKind.ENTER_ADDRESS,
              data: [null],
              renderItem: () => {
                return (
                  <View style={styles.viewSectionContainer}>
                    <RecipientAddressTextInputSection
                      containerStyle={{ margin: 0, padding: 0 }}
                      placeholder="Enter Address Manually"
                      accountKind={serviceType}
                      onAddressSubmitted={(address) => {
                        this.setState({ recipientAddress: address });
                      }}
                    />
                  </View>
                );
              },
            },
            {
              kind: SectionKind.SELECT_CONTACTS,
              data: [null],
              renderItem: () => {
                return (
                  <View style={styles.viewSectionContainer}>
                    {(trustedContacts.length && (
                      <RecipientSelectionStrip
                        accountKind={serviceType}
                        recipients={trustedContacts.map(
                          makeContactRecipientDescription,
                        )}
                        selectedRecipients={selectedContacts}
                        onRecipientSelected={this.onRecipientSelected}
                      />
                    )) || (
                      <BottomInfoBox
                        containerStyle={styles.infoBoxContainer}
                        title={'You have not added any Contacts'}
                        infoText={
                          'Add a Contact to send them sats without having to scan an address'
                        }
                      />
                    )}
                  </View>
                );
              },
            },
            {
              kind: SectionKind.SELECT_SUB_ACCOUNTS,
              data: [null],
              renderItem: () => {
                return (
                  <View style={styles.viewSectionContainer}>
                    {serviceType != TEST_ACCOUNT && (
                      // TODO: Refactor this screen so we can use the `RecipientSelectionStrip`
                      // component here and just pass in a dynamic list of sub-accounts, alongside
                      // the list of `selectedSubAccounts`.
                      <View style={styles.iconBackView}>
                        <FlatList
                          horizontal
                          data={accountData}
                          alwaysBounceHorizontal
                          showsHorizontalScrollIndicator={false}
                          showsVerticalScrollIndicator={false}
                          renderItem={(Items) => {
                            let checked = false;
                            for (
                              let i = 0;
                              i <
                              accountsState[serviceType].transfer.details
                                .length;
                              i++
                            ) {
                              const element =
                                accountsState[serviceType].transfer.details[i]
                                  .selectedContact;

                              if (element.id == Items.item.id) {
                                if (
                                  config.EJECTED_ACCOUNTS.includes(element.id)
                                ) {
                                  if (
                                    element.account_number ===
                                      Items.item.account_number &&
                                    element.type === Items.item.type
                                  ) {
                                    checked = true;
                                  }
                                } else {
                                  checked = true;
                                }
                              }
                            }

                            const { derivativeAccountDetails } = this.state;

                            if (
                              Items.item.type != serviceType ||
                              config.EJECTED_ACCOUNTS.includes(Items.item.id) ||
                              derivativeAccountDetails
                            ) {
                              if (
                                derivativeAccountDetails &&
                                derivativeAccountDetails.type ===
                                  Items.item.id &&
                                serviceType === Items.item.type &&
                                derivativeAccountDetails.number ===
                                  Items.item.account_number
                              ) {
                                return;
                              } else {
                                return (
                                  <AccountsListSend
                                    fromAddNewAccount={false}
                                    accounts={Items.item}
                                    balances={balances}
                                    checkedItem={checked}
                                    onSelectContact={this.onRecipientSelected}
                                  />
                                );
                              }
                            }
                          }}
                          extraData={{
                            details:
                              accountsState[serviceType].transfer.details,
                            balances,
                            selectedSubAccounts,
                          }}
                          //keyExtractor={(item, index) => index.toString()}
                        />
                      </View>
                    )}
                  </View>
                );
              },
            },
          ]}
          keyExtractor={sectionListItemKeyExtractor}
          renderSectionHeader={({ section }) => {
            return renderSectionHeader(section.kind, serviceType);
          }}
          stickySectionHeadersEnabled={false}
        />

        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.knowMoreBottomSheetRef}
          snapPoints={[-50, hp('89%')]}
          onCloseEnd={() => {
            this.setState({ isShowingKnowMoreSheet: false }, () => {
              this.props.initialKnowMoreSendSheetShown();
            });
          }}
          renderContent={() => (
            <SendHelpContents
              titleClicked={() => {
                this.knowMoreBottomSheetRef.current?.snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              borderColor={Colors.blue}
              backgroundColor={Colors.blue}
              onPressHeader={() => {
                this.knowMoreBottomSheetRef.current?.snapTo(0);
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
    accountsState: state.accounts,
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    trustedContactsService: idx(state, (_) => _.trustedContacts.service),
    trustedContactsInfo: idx(
      state,
      (_) => _.trustedContacts.trustedContactsInfo,
    ),
    isTwoFASetupDone: idx(state, (_) => _.preferences.isTwoFASetupDone),
    hasShownInitialKnowMoreSendSheet: idx(
      state,
      (_) => _.preferences.hasShownInitialKnowMoreSendSheet,
    ),
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    removeTwoFA,
    addTransferDetails,
    clearTransfer,
    setTwoFASetup,
    setAverageTxFee,
    initialKnowMoreSendSheetShown,
  })(Send),
);

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },

  navHeaderTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewSectionContainer: {
    paddingHorizontal: 20,
    marginVertical: 24,
  },

  // Undo the info box component's coupling to margin
  infoBoxContainer: {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  },

  iconBackView: {
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
  },

  icon: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    marginLeft: 'auto',
  },

  listSectionHeading: {
    ...HeadingStyles.listSectionHeading,
    fontSize: RFValue(13),
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
});

function makeNavigationOptions({
  navigation,
}): NavigationScreenConfig<NavigationStackOptions, any> {
  const accountKind = navigation.getParam('serviceType') || REGULAR_ACCOUNT;
  const carouselIndex = navigation.getParam('carouselIndex');
  const getServiceType = navigation.getParam('getServiceType');
  const derivativeAccountDetails = navigation.getParam(
    'derivativeAccountDetails',
  );

  return {
    ...defaultStackScreenNavigationOptions,

    headerStyle: {
      height: 54,
      paddingVertical: 10,
    },

    headerLeft: () => {
      return (
        <SmallNavHeaderBackButton
          onPress={() => {
            if (getServiceType) {
              getServiceType(accountKind, carouselIndex);
            }

            clearTransfer(accountKind);
            navigation.popToTop();
          }}
        />
      );
    },

    headerTitle: () => {
      return (
        <View style={styles.navHeaderTitleContainer}>
          <Image
            source={
              derivativeAccountDetails &&
              derivativeAccountDetails.type === DONATION_ACCOUNT
                ? require('../../../assets/images/icons/icon_donation_hexa.png')
                : accountKind == TEST_ACCOUNT
                ? require('../../../assets/images/icons/icon_test.png')
                : accountKind == REGULAR_ACCOUNT
                ? require('../../../assets/images/icons/icon_regular.png')
                : require('../../../assets/images/icons/icon_secureaccount.png')
            }
            style={{ width: 40, height: 40 }}
          />

          <View style={{ marginLeft: 16 }}>
            <Text style={NavStyles.modalHeaderTitleText}>Send</Text>
            <Text style={NavStyles.modalHeaderSubtitleText}>
              Choose a recipient
            </Text>
          </View>
        </View>
      );
    },

    headerRight: () => {
      if (accountKind != TEST_ACCOUNT) {
        return null;
      }

      return (
        <KnowMoreButton onpress={navigation.getParam('toggleKnowMoreSheet')} />
      );
    },
  };
}
