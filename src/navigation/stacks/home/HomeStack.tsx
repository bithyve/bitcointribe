import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from '../../../pages/Home/Home';
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen';


const HomeStack = createStackNavigator(
  {
    HomeRoot: {
      screen: HomeScreen,
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
  },
  {
    mode: 'modal',
    initialRouteName: 'HomeRoot',
  },
);

export default HomeStack;
