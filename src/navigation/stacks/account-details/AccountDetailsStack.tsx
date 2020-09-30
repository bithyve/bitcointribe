import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import AccountDetailsContainerScreen from '../../../pages/Accounts/Details/AccountDetailsContainer';
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import SendStack from '../send/SendStack';


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
