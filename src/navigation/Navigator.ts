import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import StartupScreen from "../dummy-screens/StartupScreen";
import HomeScreen from "../dummy-screens/HomeScreen";
import WalletNameScreen from "../dummy-screens/wallet-setup/WalletNameScreen";
import SecurityQuesScreen from "../dummy-screens/wallet-setup/SecurityQuesScreen";
import AccountScreen from "../dummy-screens/accounts/AccountScreen";

const WalletSetupNavigator = createStackNavigator({
  WalletName: WalletNameScreen,
  SecurityQues: SecurityQuesScreen
});

const HomeNavigator = createStackNavigator({
  Home: HomeScreen,
  Account: AccountScreen
});

const Navigator = createSwitchNavigator({
  Startup: StartupScreen,
  WalletSetup: WalletSetupNavigator,
  HomeNav: HomeNavigator
});

export default createAppContainer(Navigator);
