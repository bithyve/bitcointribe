import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import Launch from "../pages/Launch";
import PasscodeConfirm from "../pages/PasscodeConfirm";
import RestoreAndReoverWallet from "../pages/RestoreAndReoverWallet";
import RestoreSelectedContactsList from "../pages/RestoreSelectedContactsList";
import Home from "../pages/Home";
import NewWalletName from "../pages/NewWalletName";
import NewWalletQuestion from "../pages/NewWalletQuestion";
import RestoreWalletBySecondaryDevice from "../pages/RestoreWalletBySecondaryDevice";
import RestoreWalletUsingDocuments from "../pages/RestoreWalletUsingDocuments";

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
  RecoveryScreen,
  GAScreen,
  SecureTransferScreen
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
  Recovery: RecoveryScreen,
  GAToken:GAScreen,
  SecureTransfer:SecureTransferScreen
});

const Navigator = createSwitchNavigator({
  Startup: StartupScreen,
  WalletSetup: WalletSetupNavigator,
  HomeNav: HomeNavigator
});


export default createAppContainer(Navigator);
