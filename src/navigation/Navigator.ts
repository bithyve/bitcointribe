import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from "../dummy-screens/HomeScreen";
import SecureScreen from "../dummy-screens/SecureScreen";
import StoreScreen from "../dummy-screens/StoreScreen";
import WalletSetupScreen from "../dummy-screens/WalletSetupScreen";

const Navigator = createStackNavigator({
  Home: HomeScreen,
  Secure: SecureScreen,
  Store: StoreScreen,
  WSetup: WalletSetupScreen
});

export default createAppContainer(Navigator);
