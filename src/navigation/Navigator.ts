import { createAppContainer, createSwitchNavigator } from "react-navigation";
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

const HomeNavigator = createStackNavigator(
  {
    Home
  },
  {
    headerLayoutPreset: "center",
    defaultNavigationOptions: ({ navigation }) => ({
      header: null
    })
  }
);

const SetupNavigator = createStackNavigator(
  {
    Launch,
    PasscodeConfirm,
    RestoreAndReoverWallet,
    RestoreSelectedContactsList,
    NewWalletName,
    NewWalletQuestion,
    RestoreWalletBySecondaryDevice,
    RestoreWalletUsingDocuments
  },
  {
    initialRouteName: "Launch",
    headerLayoutPreset: "center",
    defaultNavigationOptions: ({ navigation }) => ({
      header: null
    })
  }
);

const Navigator = createSwitchNavigator({
  SetupNav: SetupNavigator,
  HomeNav: HomeNavigator
});

export default createAppContainer(Navigator);
