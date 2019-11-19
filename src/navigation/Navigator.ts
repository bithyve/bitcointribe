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
  SecureAccountScreen,
  RecoveryScreen
} from "../dummy-screens";

const WalletSetupNavigator = createStackNavigator({
  WalletName: WalletNameScreen,
  SecurityQues: SecurityQuesScreen
});

const HomeNavigator = createStackNavigator({
  Home: HomeScreen,
  Account: AccountScreen,
  Transfer: TransferScreen,
  SecureAccount: SecureAccountScreen,
  SSS: S3Screen,
  S3User: S3UserScreen,
  S3Guardian: S3GuardianScreen,
  Recovery: RecoveryScreen
});

const Navigator = createSwitchNavigator({
  Startup: StartupScreen,
  WalletSetup: WalletSetupNavigator,
  HomeNav: HomeNavigator
});

export default createAppContainer(Navigator);
