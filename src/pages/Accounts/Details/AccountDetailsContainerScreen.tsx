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
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces';
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell';
import useTransactionReassignmentCompletedEffect from '../../../utils/hooks/account-effects/UseTransactionReassignmentCompletedEffect';
import TransactionReassignmentSuccessBottomSheet from '../../../components/bottom-sheets/account-management/TransactionReassignmentSuccessBottomSheet';
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions';
import useAccountShellMergeCompletionEffect from '../../../utils/hooks/account-effects/UseAccountShellMergeCompletionEffect';
import AccountShellMergeSuccessBottomSheet from '../../../components/bottom-sheets/account-management/AccountShellMergeSuccessBottomSheet';
import AccountShell from '../../../common/data/models/AccountShell';
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs';
import { NavigationScreenConfig } from 'react-navigation';
import { NavigationStackOptions } from 'react-navigation-stack';

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

  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal();

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
    navigation.navigate('SubAccountSettings', {
      accountShellID,
    });
  }

  const showKnowMoreSheet = useCallback(() => {
    presentBottomSheet(
      <KnowMoreBottomSheet accountKind={primarySubAccount.kind} onClose={dismissBottomSheet} />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '95%'],
        handleComponent: KnowMoreBottomSheetHandle,
      },
    );
  }, [presentBottomSheet, dismissBottomSheet]);

  const showReassignmentConfirmationBottomSheet = useCallback((destinationID) => {
    presentBottomSheet(
      <TransactionReassignmentSuccessBottomSheet
        onViewAccountDetailsPressed={() => {
          dismissBottomSheet();
          navigation.dispatch(resetStackToAccountDetails({
            accountShellID: destinationID,
          }));
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '40%'],
      },
    );
  }, [presentBottomSheet, dismissBottomSheet]);

  const showMergeConfirmationBottomSheet = useCallback(({
    source,
    destination,
  }) => {
    presentBottomSheet(
      <AccountShellMergeSuccessBottomSheet
        sourceAccountShell={source}
        destinationAccountShell={destination}
        onViewAccountDetailsPressed={() => {
          dismissBottomSheet();
          navigation.dispatch(resetStackToAccountDetails({
            accountShellID: destination.id,
          }));
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '67%'],
      },
    );
  }, [presentBottomSheet, dismissBottomSheet]);


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


AccountDetailsContainerScreen.navigationOptions = ({ navigation }): NavigationScreenConfig<NavigationStackOptions, any> => {
  return {
    header() {
      const { accountShellID } = navigation.state.params;

      return <NavHeader
        accountShellID={accountShellID}
        onBackPressed={() => navigation.pop() }
      />;
    },
  };
};

export default AccountDetailsContainerScreen;
