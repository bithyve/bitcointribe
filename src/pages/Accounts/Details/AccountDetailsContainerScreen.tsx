import React, { useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import NavHeader from "../../../components/account-details/AccountDetailsNavHeader";
import AccountDetailsCard from "../../../components/account-details/AccountDetailsCard";
import TransactionsList from "../../../components/account-details/AccountDetailsTransactionsList";
import SendAndReceiveButtonsFooter from "./SendAndReceiveButtonsFooter";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import KnowMoreBottomSheet, {
  KnowMoreBottomSheetHandle,
} from '../../../components/account-details/AccountDetailsKnowMoreBottomSheet'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useTransactionReassignmentCompletedEffect from '../../../utils/hooks/account-effects/UseTransactionReassignmentCompletedEffect'
import TransactionReassignmentSuccessBottomSheet from '../../../components/bottom-sheets/account-management/TransactionReassignmentSuccessBottomSheet'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useAccountShellMergeCompletionEffect from '../../../utils/hooks/account-effects/UseAccountShellMergeCompletionEffect'
import AccountShellMergeSuccessBottomSheet from '../../../components/bottom-sheets/account-management/AccountShellMergeSuccessBottomSheet'
import AccountShell from '../../../common/data/models/AccountShell'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import ButtonStyles from '../../../common/Styles/ButtonStyles';
import { refreshAccountShell } from '../../../store/actions/accounts'
import SourceAccountKind from '../../../common/data/enums/SourceAccountKind'
import NetworkKind from '../../../common/data/enums/NetworkKind'
import config from '../../../bitcoin/HexaConfig'
import { DerivativeAccountTypes } from '../../../bitcoin/utilities/Interface'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import useTransactionsForAccountShell from '../../../utils/hooks/state-selectors/accounts/UseTransactionsForAccountShell'
import TransactionPreviewHeader from './TransactionPreviewHeader'
import useSpendableBalanceForAccountShell from '../../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import { Button } from 'react-native-elements'
import DonationWebPageModalContents from '../../../components/DonationWebPageModalContents'
import SettingDonationWebPageContents from '../../../components/SettingDonationWebpageContents'

export type Props = {
  navigation: any;
};

const AccountDetailsContainerScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch()

  const accountShellID = useMemo(() => {
    return navigation.getParam('accountShellID')
  }, [navigation])

  const accountShell = useAccountShellFromNavigation(navigation)
  const accountsState = useAccountsState()
  const primarySubAccount = usePrimarySubAccountForShell(accountShell)
  const accountTransactions = AccountShell.getAllTransactions(accountShell)
  const spendableBalance = useSpendableBalanceForAccountShell(accountShell)
  const averageTxFees = accountsState.averageTxFees
  let derivativeAccountKind: any = primarySubAccount.kind

  if (
    primarySubAccount.kind === SubAccountKind.REGULAR_ACCOUNT ||
    primarySubAccount.kind === SubAccountKind.SECURE_ACCOUNT
  ) {
    if (primarySubAccount.instanceNumber) {
      derivativeAccountKind = DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT
    }
  }

  const derivativeAccountDetails: {
    type: string;
    number: number;
  } = config.EJECTED_ACCOUNTS.includes(derivativeAccountKind) ?
      {
        type: derivativeAccountKind,
        number: primarySubAccount.instanceNumber,
      }
      : null


  const isRefreshing = useMemo(() => {
    return accountShell.isSyncInProgress
  }, [accountShell.isSyncInProgress])

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal();

  function handleTransactionSelection(transaction: TransactionDescribing) {
    navigation.navigate('TransactionDetails', {
      transaction,
      accountShellID: accountShell.id,
    })
  }

  function navigateToTransactionsList() {
    navigation.navigate('TransactionsList', {
      accountShellID,
    })
  }

  function navigateToAccountSettings() {
    navigation.navigate('SubAccountSettings', {
      accountShellID,
    })
  }

  function performRefreshOnPullDown() {
    dispatch(refreshAccountShell(accountShell, {
      autoSync: false
    }))
  }

  const showKnowMoreSheet = useCallback(() => {
    presentBottomSheet(
      <KnowMoreBottomSheet
        accountKind={primarySubAccount.kind}
        onClose={dismissBottomSheet}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '95%'],
        handleComponent: KnowMoreBottomSheetHandle,
      },
    )
  }, [presentBottomSheet, dismissBottomSheet])

  const showReassignmentConfirmationBottomSheet = useCallback(
    (destinationID) => {
      presentBottomSheet(
        <TransactionReassignmentSuccessBottomSheet
          onViewAccountDetailsPressed={() => {
            dismissBottomSheet();
            navigation.dispatch(
              resetStackToAccountDetails({
                accountShellID: destinationID,
              }),
            )
          }}
        />,
        {
          ...defaultBottomSheetConfigs,
          snapPoints: [0, '40%'],
        },
      )
    },
    [presentBottomSheet, dismissBottomSheet],
  )

  const showMergeConfirmationBottomSheet = useCallback(
    ({ source, destination }) => {
      presentBottomSheet(
        <AccountShellMergeSuccessBottomSheet
          sourceAccountShell={source}
          destinationAccountShell={destination}
          onViewAccountDetailsPressed={() => {
            dismissBottomSheet();
            navigation.dispatch(
              resetStackToAccountDetails({
                accountShellID: destination.id,
              }),
            )
          }}
        />,
        {
          ...defaultBottomSheetConfigs,
          snapPoints: [0, '67%'],
        },
      )
    },
    [presentBottomSheet, dismissBottomSheet],
  )

  useTransactionReassignmentCompletedEffect({
    onSuccess: showReassignmentConfirmationBottomSheet,
    onError: () => {
      Alert.alert(
        "Transaction Reassignment Error",
        "An error occurred while attempting to reassign transactions"
      );
    },
  })

  useAccountShellMergeCompletionEffect({
    onSuccess: showMergeConfirmationBottomSheet,
    onError: () => {
      Alert.alert(
        "Account Merge Error",
        "An error occurred while attempting to merge accounts."
      );
    },
  })

  const showDonationWebViewSheet = useCallback(() => {
    presentBottomSheet(
      <DonationWebPageModalContents
        account={primarySubAccount}
        onClickSetting={()=>{
          dismissBottomSheet();
          showDonationWebViewSettingSheet()}}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '65%'],
      },
    )
  }, [presentBottomSheet, dismissBottomSheet])

  const showDonationWebViewSettingSheet = useCallback(() => {
    presentBottomSheet(
      <SettingDonationWebPageContents
        account={primarySubAccount}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [0, '65%'],
      },
    )
  }, [presentBottomSheet, dismissBottomSheet])

  useEffect(() => {
    dispatch(refreshAccountShell(accountShell, {
      autoSync: true
    }))
  }, [])

  return (

    <View style={styles.rootContainer}>
      <ScrollView
        style={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl
            onRefresh={performRefreshOnPullDown}
            refreshing={isRefreshing}
          />
        }
      >
        <AccountDetailsCard
          accountShell={accountShell}
          onKnowMorePressed={showKnowMoreSheet}
          onSettingsPressed={navigateToAccountSettings}
        />


        <View
          style={{
            paddingVertical: 20,
          }}
        >
          <TransactionPreviewHeader
            availableBalance={spendableBalance}
            bitcoinUnit={accountShell.unit}
            isTestAccount={
              primarySubAccount.kind === SubAccountKind.TEST_ACCOUNT
            }
            onViewMorePressed={navigateToTransactionsList}
          />

        </View>
        {primarySubAccount.kind === SubAccountKind.DONATION_ACCOUNT &&
          <View style={{ alignItems: 'center', }}>
            <Button
              raised
              buttonStyle={ButtonStyles.primaryActionButton}
              title="Donation Webpage"
              titleStyle={ButtonStyles.actionButtonText}
            onPress={showDonationWebViewSheet}
            />
          </View>}
        {/* <TransactionPreviewTabs  */}

        {/* /> */}


        <View
          style={{
            marginBottom: 20,
          }}
        >
          <TransactionsList
            transactions={accountTransactions.slice(0, 3)}
            onTransactionSelected={handleTransactionSelection}
          />
        </View>

        <View style={styles.footerSection}>
          <SendAndReceiveButtonsFooter
            onSendPressed={() => {
              navigation.navigate('Send', {
                serviceType: primarySubAccount.sourceKind,
                averageTxFees,
                spendableBalance: AccountShell.getSpendableBalance(accountShell),
                derivativeAccountDetails,
                accountShellID,
              })
            }}
            onReceivePressed={() => {
              navigation.navigate('Receive', {
                serviceType: primarySubAccount.sourceKind,
                derivativeAccountDetails,
              })
            }}
            averageTxFees={averageTxFees}
            network={
              config.APP_STAGE === 'dev' ||
                primarySubAccount.sourceKind === SourceAccountKind.TEST_ACCOUNT
                ? NetworkKind.TESTNET
                : NetworkKind.MAINNET
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingTop: 20,
    flex: 1,
  },

  scrollViewContainer: {
    paddingHorizontal: 24,
  },

  footerSection: {
    paddingVertical: 38,
  },
})

AccountDetailsContainerScreen.navigationOptions = ({ navigation, }): NavigationScreenConfig<NavigationStackOptions, any> => {
  return {
    header() {
      const { accountShellID } = navigation.state.params;
      return (
        <NavHeader
          accountShellID={accountShellID}
          onBackPressed={() => navigation.pop()}
        />
      );
    },
  };
};

export default AccountDetailsContainerScreen;
