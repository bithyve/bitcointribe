import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import NavHeader from '../../../components/account-details/AccountDetailsNavHeader';
import AccountDetailsCard from '../../../components/account-details/AccountDetailsCard';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import TransactionsList from '../../../components/account-details/AccountDetailsTransactionsList';
import sampleTransactions from './SampleTransactions';
import SendAndReceiveButtonsFooter from './SendAndReceiveButtonsFooter';
import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import KnowMoreBottomSheet, { KnowMoreBottomSheetHandle } from '../../../components/account-details/AccountDetailsKnowMoreBottomSheet';
import { Easing } from 'react-native-reanimated';
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces';
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import useTransactionReassignmentCompletedEffect from '../../../utils/hooks/account-effects/UseTransactionReassignmentCompletedEffect';
import TransactionReassignmentSuccessBottomSheet from '../../../components/bottom-sheets/account-management/TransactionReassignmentSuccessBottomSheet';
import BottomSheetHandle from '../../../components/bottom-sheets/BottomSheetHandle';
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions';
import BottomSheetBackground from '../../../components/bottom-sheets/BottomSheetBackground';
import useAccountShellMergeCompletionEffect from '../../../utils/hooks/account-effects/UseAccountShellMergeCompletionEffect';
import AccountShellMergeSuccessBottomSheet from '../../../components/bottom-sheets/account-management/AccountShellMergeSuccessBottomSheet';
import AccountShell from '../../../common/data/models/AccountShell';
import { BottomSheetModalConfigs } from '@gorhom/bottom-sheet/lib/typescript/types';


export type Props = {
  navigation: any;
};

export type TransactionPreviewHeaderProps = {
  onViewMorePressed: () => void;
}

const TransactionPreviewHeader: React.FC<TransactionPreviewHeaderProps> = ({
  onViewMorePressed,
}: TransactionPreviewHeaderProps) => {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 42, justifyContent: 'space-between' }}>
      <Text style={styles.transactionPreviewHeaderDateText}>Today</Text>

      <TouchableOpacity
        style={{ marginLeft: 'auto', flex: 0 }}
        onPress={onViewMorePressed}
      >
        <Text style={styles.transactionPreviewHeaderTouchableText}>View More</Text>
      </TouchableOpacity>
    </View>
  );
};

const defaultBottomSheetConfigs = {
  initialSnapIndex: 1,
  animationDuration: 500,
  animationEasing: Easing.out(Easing.exp),
  handleComponent: BottomSheetHandle,
  dismissOnOverlayPress: true,
};

const AccountDetailsContainerScreen: React.FC<Props> = ({
  navigation,
}) => {
  const accountShellID = useMemo(() => {
    return navigation.getParam('accountShellID');
  }, [navigation]);

  const accountShell = useAccountShellFromNavigation(navigation);
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);

  // TODO: Implement a hook that fetches transactions for an account and use it here.
  // const [accountTransactions, isFetchingTransactions] = useTransactions(accountID);
  const accountTransactions = sampleTransactions;

  // const { top: topSafeArea, bottom: bottomSafeArea } = useSafeArea();
  const { present, dismiss } = useBottomSheetModal();

  function handleTransactionSelection(transaction: TransactionDescribing) {
    navigation.navigate('TransactionDetails', {
      txID: transaction.txID,
    });
  }

  function navigateToTransactionsList() {
    navigation.navigate('TransactionsList', {
      accountShellID,
    });
  }

  function navigateToAccountSettings() {
    navigation.navigate('AccountSettingsRoot', {
      accountShellID,
    });
  }

  const ConfirmationMessageBottomSheetBackground = () => {
    return (
      <BottomSheetBackground isVisible onPress={dismiss} />
    );
  };

  const showKnowMoreSheet = useCallback(() => {
    present(
      <KnowMoreBottomSheet accountKind={primarySubAccount.kind} onClose={dismiss} />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '95%'],
        handleComponent: KnowMoreBottomSheetHandle,
      },
    );
  }, [present]);

  const showReassignmentConfirmationBottomSheet = useCallback((destinationID) => {
    present(
      <TransactionReassignmentSuccessBottomSheet
        onViewAccountDetailsPressed={() => {
          dismiss();
          navigation.dispatch(resetStackToAccountDetails({
            accountShellID: destinationID,
          }));
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '40%'],
        overlayComponent: ConfirmationMessageBottomSheetBackground,
      },
    );
  }, [present, dismiss]);

  const showMergeConfirmationBottomSheet = useCallback(({
    source,
    destination,
  }) => {
    present(
      <AccountShellMergeSuccessBottomSheet
        sourceAccountShell={source}
        destinationAccountShell={destination}
        onViewAccountDetailsPressed={() => {
          dismiss();
          navigation.dispatch(resetStackToAccountDetails({
            accountShellID: destination.id,
          }));
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '67%'],
        overlayComponent: ConfirmationMessageBottomSheetBackground,
      },
    );
  }, [present, dismiss]);


  useTransactionReassignmentCompletedEffect({
    onSuccess: showReassignmentConfirmationBottomSheet,
    onError: () => {
      Alert.alert(
        "Transaction Reassignment Error",
        "An error occurred while attempting to reassign transactions",
      );
    }
  });

  useAccountShellMergeCompletionEffect({
    onSuccess: showMergeConfirmationBottomSheet,
    onError: () => {
      Alert.alert(
        "Account Merge Error",
        "An error occurred while attempting to merge accounts.",
      );
    }
  });

  return (
    <ScrollView style={styles.rootContainer}>
      <View style={{ paddingVertical: 20 }}>
        <AccountDetailsCard
          accountShell={accountShell}
          onKnowMorePressed={showKnowMoreSheet}
          onSettingsPressed={navigateToAccountSettings}
        />
      </View>

      <View style={{ paddingVertical: 20 }}>
        <TransactionPreviewHeader
          onViewMorePressed={navigateToTransactionsList}
        />
      </View>

      {/* <TransactionPreviewTabs  */}

      {/* /> */}

      <View style={{ marginBottom: 20 }}>
        <TransactionsList
          transactions={accountTransactions.slice(0, 3)}
          onTransactionSelected={handleTransactionSelection}
        />
      </View>

      <View style={styles.footerSection}>
        <SendAndReceiveButtonsFooter
          onSendPressed={() => {
            navigation.navigate('Send', {
              accountShellID,
              spendableBalance: AccountShell.getTotalBalance(accountShell),
            });
          }}
          onReceivePressed={() => {
            navigation.navigate('Receive', {
              accountShellID,
            });
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingHorizontal: 24,
  },

  transactionPreviewHeaderDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },

  transactionPreviewHeaderTouchableText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansItalic,
    textDecorationLine: 'underline',
    marginLeft: 'auto',
  },

  footerSection: {
    paddingVertical: 38,
  },
});

AccountDetailsContainerScreen.navigationOptions = ({ }) => {
  return {
    header: ({ navigation }) => {
      const { accountShellID } = navigation.state.params;

      return <NavHeader
        accountShellID={accountShellID}
        onBackPressed={() => navigation.goBack()}
      />;
    },
  };
};

export default AccountDetailsContainerScreen;
