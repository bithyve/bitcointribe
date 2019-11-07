import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomeScreen from '../screens/HomeScreen';
import SecureScreen from '../screens/SecureScreen';
import StoreScreen from '../screens/StoreScreen';
import WalletSetupScreen from '../screens/WalletSetupScreen';

const Navigator = createStackNavigator({
  Home: HomeScreen,
  Secure: SecureScreen,
  Store: StoreScreen,
  WSetup: WalletSetupScreen,
});

export default createAppContainer(Navigator);
