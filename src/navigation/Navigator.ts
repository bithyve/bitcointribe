import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import StartupScreen from "../dummy-screens/StartupScreen";
import HomeScreen from "../dummy-screens/HomeScreen";
import WalletNameScreen from "../dummy-screens/wallet-setup/WalletNameScreen";
import SecurityQuesScreen from "../dummy-screens/wallet-setup/SecurityQuesScreen";
import RegularAccountScreen from "../dummy-screens/accounts/RegularAccountScreen";

const WalletSetupNavigator = createStackNavigator({
  WalletName: WalletNameScreen,
  SecurityQues: SecurityQuesScreen
});

const HomeNavigator = createStackNavigator({
  Home: HomeScreen,
  Regular: RegularAccountScreen
});

const Navigator = createSwitchNavigator({
  Startup: StartupScreen,
  WalletSetup: WalletSetupNavigator,
  HomeNav: HomeNavigator
});

export default createAppContainer(Navigator);
