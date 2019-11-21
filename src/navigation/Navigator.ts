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

const Navigator = createStackNavigator(
  {
    Launch,
    PasscodeConfirm,
    RestoreAndReoverWallet,
    RestoreSelectedContactsList,
    Home,
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

export default createAppContainer(Navigator);
