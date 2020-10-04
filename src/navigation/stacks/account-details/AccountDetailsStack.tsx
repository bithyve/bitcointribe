import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import AccountDetailsContainerScreen from '../../../pages/Accounts/Details/AccountDetailsContainer';
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import SendStack from '../send/SendStack';
import TransactionsListScreen from '../../../pages/Accounts/Transactions/TransactionsListScreenContainer';
import TransactionDetailsScreen from '../../../pages/Accounts/Transactions/TransactionDetailsScreenContainer';
import AccountSettingsMainScreen from '../../../pages/Accounts/AccountSettings/AccountSettingsMainScreen';


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
      screen: TransactionsListScreen,
      navigationOptions: {
        title: "All Transactions",
      },
    },
    TransactionDetails: {
      screen: TransactionDetailsScreen,
      // navigationOptions: TransactionDetails.navigationOptions,
      navigationOptions: {
        title: "Transaction Details",
      },
    },
    AccountSettingsMain: {
      screen: AccountSettingsMainScreen,
      // navigationOptions: AccountSettings.navigationOptions,
      navigationOptions: {
        title: "Account Settings",
      },
    },
  },
  {
    // TODO: Refactor to present screens here modally post https://github.com/bithyve/hexa/issues/1915
    // mode: 'modal',
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
