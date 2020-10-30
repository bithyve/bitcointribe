import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';
import SendScreen from '../../../pages/Accounts/Send';
import SendToContactScreen from '../../../pages/Accounts/SendToContact';
import SendConfirmationScreen from '../../../pages/Accounts/SendConfirmation';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';


const SendStack = createStackNavigator(
  {
    SendRoot: {
      screen: SendScreen,
      navigationOptions: {
        header: null,
        gesturesEnabled: false,
      },
    },
    SendToContact: {
      screen: SendToContactScreen,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    SendConfirmation: {
      screen: SendConfirmationScreen,
    },
  },
  {
    initialRouteName: 'SendRoot',
    defaultNavigationOptions: ({ navigation }) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.goBack(); }} />;
        },
      };
    },
  },
);

export default SendStack;
