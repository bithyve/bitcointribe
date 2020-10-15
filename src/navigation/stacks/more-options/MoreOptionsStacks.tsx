import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import MoreOptionsContainerScreen from "../../../pages/MoreOptions/MoreOptionsContainerScreen";
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen';
import FundingSourcesScreen from "../../../pages/FundingSources/FundingSourcesContainerScreen";
import FundingSourceDetailsScreen from "../../../pages/FundingSources/FundingSourceDetailsScreen";
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import { goHomeAction } from '../../actions/NavigationActions';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import NavStyles from '../../../common/Styles/NavStyles';
import WalletSettingsStack from './WalletSettingsStack';
import AccountManagementStack from './AccountManagementStack';


const MoreOptionsStack = createStackNavigator(
  {
    MoreOptionsRoot: {
      screen: MoreOptionsContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "More",
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.dispatch(goHomeAction) }} />;
          },
        };
      },
    },
    AccountManagement: {
      screen: AccountManagementStack,
      navigationOptions: {
        header: null,
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
    FriendsAndFamily: {
      screen: FriendsAndFamilyScreen,
      navigationOptions: {
        header: null,
      },
    },
    WalletSettings: {
      screen: WalletSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'MoreOptionsRoot',
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


export default MoreOptionsStack;
