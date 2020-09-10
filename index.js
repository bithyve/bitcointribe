import './shim';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// import './src/wdyr';

AppRegistry.registerComponent(appName, () => App);
