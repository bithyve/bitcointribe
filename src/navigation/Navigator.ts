import { createAppContainer, createSwitchNavigator } from "react-navigation";
import {
  createStackNavigator,
  StackViewTransitionConfigs
} from "react-navigation-stack";

import Launch from "../pages/Launch";
import Login from "../pages/Login";
import PasscodeConfirm from "../pages/PasscodeConfirm";
import RestoreAndRecoverWallet from "../pages/RestoreAndRecoverWallet";
import RestoreSelectedContactsList from "../pages/Recovery/RestoreSelectedContactsList";
import NewWalletName from "../pages/NewWalletName";
import NewWalletQuestion from "../pages/NewWalletQuestion";
import RestoreWalletBySecondaryDevice from "../pages/Recovery/RestoreWalletBySecondaryDevice";
import RestoreWalletUsingDocuments from "../pages/Recovery/RestoreWalletUsingDocuments";
import RestoreWalletByContacts from "../pages/Recovery/RestoreWalletByContacts";
import Home from "../pages/Home";
import ReLogin from "../pages/ReLogin";
import Accounts from "../pages/Accounts";
import ManageBackup from "../pages/ManageBackup";
import CustodianRequestOTP from "../pages/CustodianRequest/CustodianRequestOTP";
import CustodianRequestAccepted from "../pages/CustodianRequest/CustodianRequestAccepted";
import SecondaryDevice from "../pages/ManageBackup/SecondaryDevice";
import CommunicationMode from "../pages/ManageBackup/CommunicationMode";
import TrustedContacts from "../pages/ManageBackup/TrustedContacts";
import Cloud from "../pages/ManageBackup/Cloud";
import WalletNameRecovery from "../pages/Recovery/WalletNameRecovery";
import QuestionRecovery from "../pages/Recovery/QuestionRecovery";
import RecoveryCommunication from "../pages/Recovery/RecoveryCommunication";
import ReceivingAddress from "../pages/Accounts/ReceivingAddress";
import TransactionDetails from "../pages/Accounts/TransactionDetails";
import Send from "../pages/Accounts/Send";

const SetupNavigator = createStackNavigator(
  {
    Launch,
    Login,
    PasscodeConfirm,
    NewWalletName,
    NewWalletQuestion,
    RestoreAndRecoverWallet,
    WalletNameRecovery,
    QuestionRecovery,
    RestoreSelectedContactsList,
    RestoreWalletBySecondaryDevice,
    RestoreWalletUsingDocuments,
    RestoreWalletByContacts,
    RecoveryCommunication
  },
  {
    initialRouteName: "Launch",
    headerLayoutPreset: "center",
    defaultNavigationOptions: ({ navigation }) => ({
      header: null
    })
  }
);

const MODAL_ROUTES = [
  "SecondaryDevice",
  "CommunicationMode",
  "TrustedContacts",
  "Cloud",
  "CustodianRequestOTP",
  "CustodianRequestAccepted",
  "ReceivingAddress",
  "TransactionDetails",
  "Send"
];
const HomeNavigator = createStackNavigator(
  {
    Home,
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false
      }
    },
    Accounts,
    ManageBackup,
    SecondaryDevice,
    CommunicationMode,
    TrustedContacts,
    Cloud,
    CustodianRequestOTP,
    CustodianRequestAccepted,
    ReceivingAddress,
    TransactionDetails,
    Send
  },
  {
    headerLayoutPreset: "center",
    defaultNavigationOptions: ({ navigation }) => ({
      header: null
    }),
    transitionConfig: (transitionProps, prevTransitionProps) => {
      const isModal = MODAL_ROUTES.some(
        screenName =>
          screenName === transitionProps.scene.route.routeName ||
          (prevTransitionProps &&
            screenName === prevTransitionProps.scene.route.routeName)
      );

      return StackViewTransitionConfigs.defaultTransitionConfig(
        transitionProps,
        prevTransitionProps,
        isModal
      );
    }
  }
);

const Navigator = createSwitchNavigator({
  SetupNav: SetupNavigator,
  HomeNav: HomeNavigator
});

export default createAppContainer(Navigator);
