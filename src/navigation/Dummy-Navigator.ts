import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import {
  StartupScreen,
  HomeScreen,
  WalletNameScreen,
  SecurityQuesScreen,
  AccountScreen,
  TransferScreen,
  S3Screen,
  S3UserScreen,
  S3GuardianScreen,
  RecoveryScreen
} from "../dummy-screens";
import TestLink from "../dummy-screens/sss/TestLink";

const WalletSetupNavigator = createStackNavigator({
  WalletName: WalletNameScreen,
  SecurityQues: SecurityQuesScreen
});

const HomeNavigator = createStackNavigator({
  Home: HomeScreen,
  Account: AccountScreen,
  Transfer: TransferScreen,
  SSS: S3Screen,
  S3User: S3UserScreen,
  S3Guardian: S3GuardianScreen,
  Recovery: RecoveryScreen,
  TestLink
});

const Navigator = createSwitchNavigator({
  Startup: StartupScreen,
  WalletSetup: WalletSetupNavigator,
  HomeNav: HomeNavigator
});

export default createAppContainer(Navigator);
