import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import MoreOptionsContainerScreen from "../../../pages/MoreOptions/MoreOptionsContainerScreen";
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen';
import FundingSourcesScreen from "../../../pages/FundingSources/FundingSourcesContainerScreen";
import FundingSourceDetailsScreen from "../../../pages/FundingSources/FundingSourceDetailsScreen";
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import NavStyles from '../../../common/Styles/NavStyles';
import WalletSettingsStack from './WalletSettingsStack';
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';


const MoreOptionsStack = createStackNavigator(
  {
    MoreOptionsRoot: {
      screen: MoreOptionsContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "More",
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />;
          },
        };
      },
    },
    FriendsAndFamily: {
      screen: FriendsAndFamilyScreen,
      navigationOptions: {
        title: "Friends and Family",
      },
    },
    FundingSources: {
      screen: FundingSourcesScreen,
      navigationOptions: {
        header: null,
      },
    },
    FundingSourceDetails: {
      screen: FundingSourceDetailsScreen,
    },
    WalletSettings: {
      screen: WalletSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'MoreOptionsRoot',
    defaultNavigationOptions: ({ navigation }) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />;
        },
      };
    },
  },
);


export default MoreOptionsStack;
