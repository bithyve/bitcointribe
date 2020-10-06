import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from "react-navigation-stack";
import AccountSettingsDisplayPropertiesScreen from "../../pages/Accounts/AccountSettings/DisplayPropertiesScreen";
import AccountSettingsMainScreen from "../../pages/Accounts/AccountSettings/MainScreen";
import ReassignTransactionsMainOptionsScreen from "../../pages/Accounts/AccountSettings/ReassignTransactions/MainOptionsScreen";
import ReassignAllTransactionsSelectTransactionsScreen from '../../pages/Accounts/AccountSettings/ReassignTransactions/SelectTransactionsScreen';
import AccountDetailsContainerScreen from "../../pages/Accounts/Details/AccountDetailsContainer";
import TransactionDetailsContainerScreen from "../../pages/Accounts/Transactions/TransactionDetailsScreenContainer";
import TransactionsListContainerScreen from "../../pages/Accounts/Transactions/TransactionsListScreenContainer";


export const AccountSettingsStack = createStackNavigator(
  {
    AccountSettingsMain: {
      screen: AccountSettingsMainScreen,
      navigationOptions: {
        title: "Account Settings",
      },
    },
    EditDisplayProperties: {
      screen: AccountSettingsDisplayPropertiesScreen,
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
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      return {
        // headerLeft: () => {
        //   return (
        //     <TouchableOpacity onPress={() => { navigation.goBack() }}>
        //       <Text>Back</Text>
        //     </TouchableOpacity>
        //   );
        // },
      };
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
