import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import XPubSourceKind from '../../../common/data/enums/XPubSourceKind';
import AccountSettingsEditDisplayPropertiesScreen from "../../../pages/Accounts/AccountSettings/EditDisplayPropertiesScreen";
import AccountSettingsMainScreen from "../../../pages/Accounts/AccountSettings/AccountSettingsMainScreen";
import ReassignTransactionsMainOptionsScreen from "../../../pages/Accounts/AccountSettings/ReassignTransactions/MainOptionsScreen";
import ReassignAllTransactionsSelectTransactionsScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectTransactionsScreen';
import AccountDetailsContainerScreen from "../../../pages/Accounts/Details/AccountDetailsContainerScreen";
import TransactionDetailsContainerScreen from "../../../pages/Accounts/Transactions/TransactionDetailsScreenContainer";
import TransactionsListContainerScreen from "../../../pages/Accounts/Transactions/TransactionsListScreenContainer";
import ReassignTransactionsSelectDestinationScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectDestinationAccountScreen';
import ReassignSubAccountSourcesSelectSourcesScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectSubAccountSourcesScreen';
import AccountSettingsEditVisibilityScreen from '../../../pages/Accounts/AccountSettings/EditVisibilityScreen';
import AccountSettingsMergeAccountShellsScreen from '../../../pages/Accounts/AccountSettings/MergeAccountShellsScreen';

export const AccountSettingsStack = createStackNavigator(
  {
    AccountSettingsMain: {
      screen: AccountSettingsMainScreen,
      navigationOptions: {
        title: "Account Settings",
      },
    },
    EditDisplayProperties: {
      screen: AccountSettingsEditDisplayPropertiesScreen,
      navigationOptions: {
        title: "Name & Description",
      },
    },
    ReassignTransactionsMainOptions: {
      screen: ReassignTransactionsMainOptionsScreen,
      navigationOptions: {
        title: "Reassign Transactions",
      },
    },
    ReassignAllTransactionsSelectTransactions: {
      screen: ReassignAllTransactionsSelectTransactionsScreen,
      navigationOptions: {
        title: "Reassign Transactions",
      },
    },
    ReassignSubAccountSourcesSelectSources: {
      screen: ReassignSubAccountSourcesSelectSourcesScreen,
      navigationOptions: {
        title: "Reassign Sources",
      },
    },
    ReassignTransactionsSelectDestination: {
      screen: ReassignTransactionsSelectDestinationScreen,
      navigationOptions: ({ navigation }) => {
        const reassignmentKind = navigation.getParam('reassignmentKind');
        const nameText = reassignmentKind === XPubSourceKind.DESIGNATED ? 'Sources' : 'Transactions';

        return {
          title: `Reassign ${nameText}`,
        };
      },
    },
    EditVisibility: {
      screen: AccountSettingsEditVisibilityScreen,
      navigationOptions: {
        title: "Account Visibility",
      },
    },
    MergeAccounts: {
      screen: AccountSettingsMergeAccountShellsScreen,
      navigationOptions: {
        title: "Merge Accounts",
      },
    },
  },
);


export const AccountDetailsStack = createStackNavigator(
  {
    AccountDetailsRoot: {
      screen: AccountDetailsContainerScreen,
      navigationOptions: AccountDetailsContainerScreen.navigationOptions,
    },
    TransactionsList: {
      screen: TransactionsListContainerScreen,
      navigationOptions: {
        title: "All Transactions",
      },
    },
    TransactionDetails: {
      screen: TransactionDetailsContainerScreen,
      navigationOptions: {
        title: "Transaction Details",
      },
    },
    AccountSettingsRoot: {
      screen: AccountSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'AccountDetailsRoot',
  },
);
