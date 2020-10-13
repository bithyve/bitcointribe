import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import ChangeCurrencyScreen from '../../pages/ChangeCurrencyScreen';
import MoreOptionsContainerScreen from "../../pages/MoreOptions/MoreOptionsContainerScreen";
import ManagePasscodeScreen from '../../pages/ManagePasscodeScreen';
import FriendsAndFamilyScreen from '../../pages/FriendsAndFamily/FriendsAndFamilyScreen';
import WalletSettingsContainerScreen from "../../pages/MoreOptions/WalletSettings/WalletSettingsContainerScreen";
import ExistingSavingMethodsScreen from "../../pages/FundingSources/ExistingSavingMethods";
import ExistingSavingMethodDetailsScreen from "../../pages/FundingSources/ExistingSavingMethodDetails";
import KnowMoreButton from '../../components/KnowMoreButton';
import Styles from '../../common/Styles';

export const WalletSettingsStack = createStackNavigator(
  {
    WalletSettingsRoot: {
      screen: WalletSettingsContainerScreen,
      navigationOptions: {
        title: "Wallet Settings",
      },
    },
    ManagePasscode: {
      screen: ManagePasscodeScreen,
      navigationOptions: {
        title: "Manage Passcode",
      },
    },
    ChangeCurrency: {
      screen: ChangeCurrencyScreen,
      navigationOptions: {
        title: "Change Currency",
      },
    },
  },
  {
    defaultNavigationOptions: {
      headerTitleStyle: Styles.modalHeaderTitleText,
    },
  },
);


export const MoreOptionsStack = createStackNavigator(
  {
    MoreOptionsRoot: {
      screen: MoreOptionsContainerScreen,
      navigationOptions: {
        title: "More",
      },
    },
    ExistingSavingMethods: {
      screen: ExistingSavingMethodsScreen,
      navigationOptions: {
        header: null,
      },
    },
    ExistingSavingMethodDetails: {
      screen: ExistingSavingMethodDetailsScreen,
    },
    FriendsAndFamily: {
      screen: FriendsAndFamilyScreen,
      navigationOptions: {
        header: null,
      },
    },
    WalletSettings: {
      screen: WalletSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'MoreOptionsRoot',
    defaultNavigationOptions: {
      headerTitleStyle: Styles.modalHeaderTitleText,
    }
  },
);

