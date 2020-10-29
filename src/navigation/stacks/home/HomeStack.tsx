import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from '../../../pages/Home/Home';
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen';
import HomeQRScannerScreen from '../../../pages/Home/HomeQRScannerScreen';
import NavStyles from '../../../common/Styles/NavStyles';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import MoreOptionsStack from '../more-options/MoreOptionsStack';
import AllTransactionsStack from '../transactions/AllTransactionsStack';


const HomeStack = createStackNavigator(
  {
    HomeRoot: {
      screen: HomeScreen,
      navigationOptions: {
        header: null,
      },
    },
    AllTransactions: {
      screen: AllTransactionsStack,
      navigationOptions: {
        header: null,
      },
    },
    FriendsAndFamily: {
      screen: FriendsAndFamilyScreen,
      navigationOptions: {
        header: null,
      },
    },
    QRScanner: {
      screen: HomeQRScannerScreen,
      navigationOptions: {
        title: "QR",
      },
    },
    MoreOptions: {
      screen: MoreOptionsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'HomeRoot',
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerTitleStyle: NavStyles.modalHeaderTitleText,
        headerLeft: () => {
          return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />;
        },
      };
    },
  },
);

export default HomeStack;
