import { createAppContainer, createSwitchNavigator } from "react-navigation";
import {
  createStackNavigator,
  StackViewTransitionConfigs
} from "react-navigation-stack";

import Launch from "../pages/Launch";
import Login from "../pages/Login";
import PasscodeConfirm from "../pages/PasscodeConfirm";
import RestoreAndReoverWallet from "../pages/RestoreAndReoverWallet";
import RestoreSelectedContactsList from "../pages/RestoreSelectedContactsList";
import NewWalletName from "../pages/NewWalletName";
import NewWalletQuestion from "../pages/NewWalletQuestion";
import RestoreWalletBySecondaryDevice from "../pages/RestoreWalletBySecondaryDevice";
import RestoreWalletUsingDocuments from "../pages/RestoreWalletUsingDocuments";
import RestoreWalletByContacts from "../pages/RestoreWalletByContacts";
import Home from "../pages/Home";
import ReLogin from "../pages/ReLogin";
import Accounts from "../pages/Accounts";
import ManageBackup from "../pages/ManageBackup";
import CustodianRequestOTP from "../pages/CustodianRequest/CustodianRequestOTP";
import CustodianRequestAccepted from "../pages/CustodianRequest/CustodianRequestAccepted";
import SecondaryDevice from "../pages/ManageBackup/SecondaryDevice";
import TrustedContacts from "../pages/ManageBackup/TrustedContacts";
import Cloud from "../pages/ManageBackup/Cloud";

const SetupNavigator = createStackNavigator(
  {
    Launch,
    Login,
    PasscodeConfirm,
    NewWalletName,
    NewWalletQuestion,
    RestoreAndReoverWallet,
    RestoreSelectedContactsList,
    RestoreWalletBySecondaryDevice,
    RestoreWalletUsingDocuments,
    RestoreWalletByContacts
  },
  {
    initialRouteName: "Launch",
    headerLayoutPreset: "center",
    defaultNavigationOptions: ({ navigation }) => ({
      header: null
    })
  }
);

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
    TrustedContacts,
    Cloud,
    CustodianRequestOTP,
    CustodianRequestAccepted
  },
  {
    headerLayoutPreset: "center",
    defaultNavigationOptions: ({ navigation }) => ({
      header: null
    }),
    transitionConfig: (transitionProps, prevTransitionProps) => {
      if (
        transitionProps.scene.route.routeName === "CustodianRequestOTP" ||
        (prevTransitionProps &&
          "CustodianRequestOTP" === prevTransitionProps.scene.route.routeName)
      )
        return StackViewTransitionConfigs.defaultTransitionConfig(
          transitionProps,
          prevTransitionProps,
          true
        );
      return StackViewTransitionConfigs.defaultTransitionConfig(
        transitionProps,
        prevTransitionProps
      );
    }
  }
);

const Navigator = createSwitchNavigator({
  SetupNav: SetupNavigator,
  HomeNav: HomeNavigator
});

export default createAppContainer(Navigator);
