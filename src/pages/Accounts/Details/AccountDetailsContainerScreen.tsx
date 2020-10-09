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

const ConfirmationMessageBottomSheetBackground = () => {
  return (
    <BottomSheetBackground isVisible />
  );
}

const AccountDetailsContainerScreen: React.FC<Props> = ({
  navigation,
}) => {
  const accountID = useMemo(() => {
    return navigation.getParam('accountID');
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
      accountID,
    });
  }

  function navigateToAccountSettings() {
    navigation.navigate('AccountSettingsRoot', {
      accountID,
    });
  }

  const showKnowMoreSheet = useCallback(() => {
    present(
      <KnowMoreBottomSheet accountKind={primarySubAccount.kind} onClose={dismiss} />,
      {
        initialSnapIndex: 1,
        snapPoints: [0, '95%'],
        animationDuration: 500,
        animationEasing: Easing.out(Easing.exp),
        handleComponent: KnowMoreBottomSheetHandle,
      },
    );
  }, [present]);

  const showReassignmentConfirmationBottomSheet = useCallback((destinationID) => {
    present(
      <TransactionReassignmentSuccessBottomSheet
        destinationAccountID={destinationID}
        onViewAccountDetailsPressed={() => {
          dismiss();
          navigation.dispatch(resetStackToAccountDetails({
            accountID: destinationID,
          }));
        }}
      />,
      {
        initialSnapIndex: 1,
        snapPoints: [0, '40%'],
        animationDuration: 500,
        animationEasing: Easing.out(Easing.exp),
        overlayComponent: ConfirmationMessageBottomSheetBackground,
        handleComponent: BottomSheetHandle,
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
              accountID,
              spendableBalance: accountShell.totalBalance,
            });
          }}
          onReceivePressed={() => {
            navigation.navigate('Receive', {
              accountID,
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
      const { accountID } = navigation.state.params;

      return <NavHeader
        accountID={accountID}
        onBackPressed={() => navigation.goBack()}
      />;
    },
  };
};

export default AccountDetailsContainerScreen;
