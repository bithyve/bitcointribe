import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, ReactElement, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs';
import SubAccountKind from '../../../common/data/enums/SubAccountKind';
import SendHelpContents from '../../../components/Helper/SendHelpContents';
import { removeTwoFA, clearTransfer } from '../../../store/actions/accounts';
import { initialKnowMoreSendSheetShown } from '../../../store/actions/preferences';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import usePreferencesState from '../../../utils/hooks/state-selectors/preferences/UsePreferencesState';
import useTrustedContactRecipients from '../../../utils/hooks/state-selectors/trusted-contacts/UseTrustedContactRecipients';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';
import Colors from '../../../common/Colors';
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner';
import RecipientAddressTextInputSection from '../../../components/send/RecipientAddressTextInputSection';
import RecipientSelectionStrip from '../../../components/send/RecipientSelectionStrip';
import BottomInfoBox from '../../../components/BottomInfoBox';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { NavigationScreenComponent } from 'react-navigation';
import HeadingStyles from '../../../common/Styles/HeadingStyles';
import defaultStackScreenNavigationOptions, { NavigationOptions } from '../../../navigation/options/DefaultStackScreenNavigationOptions';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import KnowMoreButton from '../../../components/KnowMoreButton';
import { BarCodeReadEvent } from 'react-native-camera';
import useWalletServiceForSubAccountKind from '../../../utils/hooks/state-selectors/accounts/UseWalletServiceForSubAccountKind';
import { ScannedAddressKind } from '../../../bitcoin/utilities/Interface';
import Toast from '../../../components/Toast';
import useCompatibleAccountShells from '../../../utils/hooks/state-selectors/accounts/UseCompatibleAccountShells';
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing';
import { makeAddressRecipientDescription, makeAccountRecipientDescription } from '../../../utils/sending/RecipientFactories';
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState';
import { addRecipientForSending, recipientSelectedForAmountSetting } from '../../../store/actions/sending';
import RecipientKind from '../../../common/data/enums/RecipientKind';

export type Props = {
  navigation: any;
};

export type NavigationParams = {
  accountShellID: string;
};

export enum SectionKind {
  SCAN_QR,
  ENTER_ADDRESS,
  SELECT_CONTACTS,
  SELECT_ACCOUNT_SHELLS,
}

const sectionListItemKeyExtractor = (index) => String(index);

function renderSectionHeader(
  sectionKind: SectionKind,
  subAccountKind: SubAccountKind,
): ReactElement | null {
  switch (sectionKind) {
    case SectionKind.SELECT_CONTACTS:
      return <Text style={styles.listSectionHeading}>Send To Contacts</Text>;
    case SectionKind.SELECT_ACCOUNT_SHELLS:
      if (subAccountKind != SubAccountKind.TEST) {
        return <Text style={styles.listSectionHeading}>Send To Accounts</Text>;
      }
  }
}

const AccountSendContainerScreen: NavigationScreenComponent<
  NavigationOptions,
  NavigationParams
> = ({
  navigation,
}: Props) => {
    const dispatch = useDispatch();
    const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal();

    const accountShell = useAccountShellFromNavigation(navigation);
    const primarySubAccount = usePrimarySubAccountForShell(accountShell);
    const sendableAccountShells = useCompatibleAccountShells(accountShell);
    const sendableContacts = useTrustedContactRecipients();
    const walletService = useWalletServiceForSubAccountKind(primarySubAccount.kind);

    const sendingState = useSendingState();

    const {
      hasCompletedTFASetup,
      hasShownInitialKnowMoreSendSheet,
    } = usePreferencesState();

    const accountRecipients = useMemo(() => {
      return sendableAccountShells.map(makeAccountRecipientDescription);
    }, [sendableAccountShells]);

    const isShowingSelectableAccountsSection = useMemo(() => {
      return primarySubAccount.kind != SubAccountKind.TEST && sendableAccountShells.length;
    }, [sendableAccountShells, primarySubAccount.kind]);


    const selectedContactRecipients = useMemo(() => {
      return sendingState
        .selectedRecipients
        .filter(recipient => recipient.kind == RecipientKind.CONTACT);
    }, [sendingState]);


    const selectedAccountRecipients = useMemo(() => {
      return sendingState
        .selectedRecipients
        .filter(recipient => recipient.kind == RecipientKind.ACCOUNT_SHELL);
    }, [sendingState]);


    const isRecipientSelectedForSending = useCallback((recipient: RecipientDescribing) => {
      return (
        sendingState
          .selectedRecipients
          .some(recipient => recipient.id == recipient.id)
      );
    }, [sendingState]);


    function handleRecipientSelection(recipient: RecipientDescribing) {
      dispatch(addRecipientForSending(recipient));
      dispatch(recipientSelectedForAmountSetting(recipient));

      navigateToSendDetails();
    }

    function navigateToSendDetails() {
      navigation.navigate('SendToContact', {
        accountShellID: accountShell.id,
      });
    }


    function handlePaymentURIScan(uri: string) {
      let address: string;
      let donationID: string | null = null;

      try {
        const decodingResult = walletService.decodePaymentURI(uri);

        address = decodingResult.address;
        const options = decodingResult.options;

        // checking for donationId to send note
        if (options?.message) {
          const rawMessage = options.message;
          donationID = rawMessage.split(':').pop().trim();
        }
      } catch (err) {
        Alert.alert('Unable to decode payment URI');
        return;
      }

      const newRecipient = makeAddressRecipientDescription({
        address,
        donationID,
      });

      handleRecipientSelection(newRecipient);
    }


    function handleManualAddressSubmit(address: string) {
      const {
        type: scannedAddressKind
      }: { type: ScannedAddressKind } = walletService.addressDiff(address.trim());

      switch (scannedAddressKind) {
        case ScannedAddressKind.ADDRESS:
          const addressRecipient = makeAddressRecipientDescription({ address });

          if (isRecipientSelectedForSending(addressRecipient) == false) {
            handleRecipientSelection(addressRecipient);
          }

          break;
        case ScannedAddressKind.PAYMENT_URI:
          handlePaymentURIScan(address);
          break;
      }
    }


    function handleQRScan({ data: barcodeDataString }: BarCodeReadEvent) {
      const {
        type: scannedAddressKind
      }: { type: ScannedAddressKind } = walletService.addressDiff(barcodeDataString.trim());

      switch (scannedAddressKind) {
        case ScannedAddressKind.ADDRESS:
          const recipientAddress = barcodeDataString;
          const addressRecipient = makeAddressRecipientDescription({ address: recipientAddress });

          if (isRecipientSelectedForSending(addressRecipient) == false) {
            handleRecipientSelection(addressRecipient);
          }

          break;
        case ScannedAddressKind.PAYMENT_URI:
          handlePaymentURIScan(barcodeDataString);
          break;
        default:
          Toast('Invalid QR');
      }
    }

    const sections = useMemo(() => {
      return [
        ...[
          {
            kind: SectionKind.SCAN_QR,
            data: [null],
            renderItem: () => {
              return (
                <View style={styles.viewSectionContainer}>
                  <CoveredQRCodeScanner
                    onCodeScanned={handleQRScan}
                    containerStyle={styles.qrScannerContainer}
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
                    subAccountKind={primarySubAccount.kind}
                    onAddressSubmitted={(address) => {
                      handleManualAddressSubmit(address);
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
                  <View style={styles.viewSectionContentContainer}>
                    {(sendableContacts.length && (
                      <RecipientSelectionStrip
                        accountKind={primarySubAccount.kind}
                        recipients={sendableContacts}
                        selectedRecipients={selectedContactRecipients}
                        onRecipientSelected={handleRecipientSelection}
                      />
                    )) || (
                        <BottomInfoBox
                          containerStyle={styles.infoBoxContainer}
                          title="You have not added any Contacts"
                          infoText="Add a Contact to send them sats without having to scan an address"
                        />
                      )}
                  </View>
                </View>
              );
            },
          },
        ],
        ...(isShowingSelectableAccountsSection ? [{
          kind: SectionKind.SELECT_ACCOUNT_SHELLS,
          data: [null],
          renderItem: () => {
            return (
              <View style={styles.viewSectionContainer}>
                <View style={styles.viewSectionContentContainer}>
                  <RecipientSelectionStrip
                    accountKind={primarySubAccount.kind}
                    recipients={accountRecipients}
                    selectedRecipients={selectedAccountRecipients}
                    onRecipientSelected={handleRecipientSelection}
                  />
                </View>
              </View>
            );
          },
        }] : []),
      ];
    }, []);

    const showKnowMoreBottomSheet = useCallback(() => {
      presentBottomSheet(
        <SendHelpContents titleClicked={dismissBottomSheet} />,
        {
          ...defaultBottomSheetConfigs,
          snapPoints: [0, '89%'],
          onChange: (newIndex) => {
            if (newIndex < 1) {
              dispatch(initialKnowMoreSendSheetShown());
            }
          }
        },
      );
    }, [presentBottomSheet, dismissBottomSheet]);


    useEffect(() => {
      if (hasCompletedTFASetup == false && primarySubAccount.isTFAEnabled) {
        dispatch(removeTwoFA());
        navigation.navigate('TwoFASetup', {
          // TODO: Figure out how `service.secureHDWallet.twoFASetup` fits in on this screen 👇.
          // twoFASetup: accountsState[this.state.serviceType].service.secureHDWallet.twoFASetup,
        });
      }
    }, [hasCompletedTFASetup, primarySubAccount]);

    useEffect(() => {
      if (primarySubAccount.kind == SubAccountKind.TEST && hasShownInitialKnowMoreSendSheet == false) {
        showKnowMoreBottomSheet();
      }
    }, [hasShownInitialKnowMoreSendSheet, primarySubAccount.kind]);


    return (
      <View style={styles.rootContainer}>
        <KeyboardAwareSectionList
          extraData={[
            sendableContacts,
            sendableAccountShells,
          ]}
          showsVerticalScrollIndicator={false}
          sections={sections}
          keyExtractor={sectionListItemKeyExtractor}
          renderSectionHeader={({ section }) => {
            return renderSectionHeader(section.kind, primarySubAccount.kind);
          }}
          stickySectionHeadersEnabled={false}
        />
      </View>
    );
  };


const qrScannerHeight = heightPercentageToDP(35);

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'white',
  },

  navHeaderTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewSectionContainer: {
    marginBottom: 16,
  },

  viewSectionContentContainer: {
    paddingHorizontal: 22,
  },

  listSectionHeading: {
    ...HeadingStyles.listSectionHeading,
    marginBottom: 9,
    paddingHorizontal: 28,
    fontSize: RFValue(13),
  },

  qrScannerContainer: {
    width: '100%',
    maxWidth: qrScannerHeight * (1.31),
    height: qrScannerHeight,
    marginBottom: 9,
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
});


AccountSendContainerScreen.navigationOptions = ({ navigation }): NavigationOptions => {
  const subAccountKind = navigation.getParam('subAccountKind');

  return {
    ...defaultStackScreenNavigationOptions,

    headerLeft: () => {
      return (
        <SmallNavHeaderBackButton
          onPress={() => {
            clearTransfer(subAccountKind);
            navigation.popToTop();
          }}
        />
      );
    },

    title: 'Send',

    headerRight: () => {
      if (subAccountKind != SubAccountKind.TEST) {
        return null;
      } else {
        return (
          <KnowMoreButton onpress={navigation.getParam('toggleKnowMoreSheet')} />
        );
      }
    },
  };
}

export default AccountSendContainerScreen;
