import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import WalletSettingsContainerScreen from "../../../pages/MoreOptions/WalletSettings/WalletSettingsContainerScreen";
import ManagePasscodeScreen from "../../../pages/ManagePasscodeScreen";
import ChangeCurrencyScreen from "../../../pages/ChangeCurrencyScreen";
import SmallNavHeaderCloseButton from "../../../components/navigation/SmallNavHeaderCloseButton";
import NavStyles from '../../../common/Styles/NavStyles';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';


const WalletSettingsStack = createStackNavigator(
  {
    WalletSettingsRoot: {
      screen: WalletSettingsContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "Wallet Settings",
        };
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
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerTitleStyle: NavStyles.modalHeaderTitleText,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />;
        },
      };
    },
  },
);

export default WalletSettingsStack;
