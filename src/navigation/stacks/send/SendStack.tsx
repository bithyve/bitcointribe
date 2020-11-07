import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';
import SendScreen from '../../../pages/Accounts/Send/Send';
import SendToContactScreen from '../../../pages/Accounts/Send/SendToContact';
import SendConfirmationScreen from '../../../pages/Accounts/Send/SendConfirmation';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';


const SendStack = createStackNavigator(
  {
    SendRoot: {
      screen: SendScreen,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    SendToContact: {
      screen: SendToContactScreen,
      navigationOptions: {
        gesturesEnabled: false,
        header: null,
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
