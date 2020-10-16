import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import ChangeCurrencyScreen from '../../../pages/ChangeCurrencyScreen';
import MoreOptionsContainerScreen from "../../../pages/MoreOptions/MoreOptionsContainerScreen";
import ManagePasscodeScreen from '../../../pages/ManagePasscodeScreen';
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen';
import WalletSettingsContainerScreen from "../../../pages/MoreOptions/WalletSettings/WalletSettingsContainerScreen";
import FundingSourcesScreen from "../../../pages/FundingSources/FundingSourcesContainerScreen";
import FundingSourceDetailsScreen from "../../../pages/FundingSources/FundingSourceDetailsScreen";
import CommonStyles from '../../../common/Styles/Styles';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import { goHomeAction } from '../../actions/NavigationActions';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';


export const WalletSettingsStack = createStackNavigator(
  {
    WalletSettingsRoot: {
      screen: WalletSettingsContainerScreen,
      navigationOptions: {
        title: "Wallet Settings",
      },
    },
    ManagePasscode: {
      screen: ManagePasscodeScreen,
      navigationOptions: {
        title: "Manage Passcode",
      },
    },
    ChangeCurrency: {
      screen: ChangeCurrencyScreen,
      navigationOptions: {
        title: "Change Currency",
      },
    },
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerTitleStyle: CommonStyles.modalHeaderTitleText,
        headerLeft: () => {
          return (
            <SmallNavHeaderCloseButton
              onPress={() => { navigation.pop() }}
              containerStyle={{ paddingLeft: 16 }}
            />
          );
        },
      };
    },
    mode: 'modal',
  },
);


export const MoreOptionsStack = createStackNavigator(
  {
    MoreOptionsRoot: {
      screen: MoreOptionsContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "More",
          headerLeft: () => {
            return (
              <SmallNavHeaderBackButton
                onPress={() => { navigation.dispatch(goHomeAction) }}
                containerStyle={{ paddingLeft: 16 }}
              />
            );
          },
        };
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
        headerTitleStyle: CommonStyles.modalHeaderTitleText,
        headerLeft: () => {
          return (
            <SmallNavHeaderCloseButton
              onPress={() => { navigation.pop() }}
              containerStyle={{ paddingLeft: 16 }}
            />
          );
        },
      };
    },
  },
);

