import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import AccountDetailsScreen from '../../../pages/Accounts/Index';
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import SendScreen from '../../../pages/Accounts/Send';
import SendToContactScreen from '../../../pages/Accounts/SendToContact';
import SendConfirmationScreen from '../../../pages/Accounts/SendConfirmation';
import SendStack from '../send/SendStack';


const AccountDetailsStack = createStackNavigator(
  {
    AccountDetailsRoot: {
      screen: AccountDetailsScreen,
      navigationOptions: {
        header: null,
      },
    },
    Send: {
      screen: SendStack,
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
