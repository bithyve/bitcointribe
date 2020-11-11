import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import XPubSourceKind from '../../../common/data/enums/XPubSourceKind';
import AccountSettingsEditDisplayPropertiesScreen from "../../../pages/Accounts/AccountSettings/AccountSettingsEditDisplayPropertiesScreen";
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
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import SendStack from '../send/SendStack';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';


const SubAccountSettingsStack = createStackNavigator(
  {
    AccountSettingsMain: {
      screen: AccountSettingsMainScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "Account Settings",
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />;
          },
        };
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
  {
    initialRouteName: 'AccountSettingsMain',
    defaultNavigationOptions: ({ navigation }) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop(); }} />;
        },
      };
    },
  },
);


const AccountDetailsStack = createStackNavigator(
  {
    AccountDetailsRoot: {
      screen: AccountDetailsContainerScreen,
      navigationOptions: AccountDetailsContainerScreen.navigationOptions,
    },
    Send: {
      screen: SendStack,
      navigationOptions: {
        header: null,
      },
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
    SubAccountSettings: {
      screen: SubAccountSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'AccountDetailsRoot',
    defaultNavigationOptions: ({ navigation }) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderCloseButton onPress={() => { navigation.pop(); }} />;
        },
      };
    },
  },
);

export default AccountDetailsStack;
