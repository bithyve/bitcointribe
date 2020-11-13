import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import AccountManagementContainerScreen from '../../../pages/MoreOptions/AccountManagement/AccountManagementContainerScreen';
import PanAccountSettingsContainerScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/PanAccountSettingsContainerScreen';
import NavHeaderSettingsButton from '../../../components/navigation/NavHeaderSettingsButton';
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';


const PanAccountSettingsStack = createStackNavigator(
  {
    PanAccountSettingsRoot: {
      screen: PanAccountSettingsContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "Account Settings",
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />;
          },
        };
      },
    },
  },
  {
    defaultNavigationOptions: () => {
      return {
        ...defaultStackScreenNavigationOptions,
      };
    },
  },
);


const AccountManagementStack = createStackNavigator(
  {
    AccountManagementRoot: {
      screen: AccountManagementContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "Account Management",
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />;
          },
          headerRight: () => {
            return (
              <NavHeaderSettingsButton
                onPress={() => { navigation.navigate('PanAccountSettings'); }}
              />
            );
          },
        };
      },
    },
    PanAccountSettings: {
      screen: PanAccountSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    defaultNavigationOptions: () => {
      return {
        ...defaultStackScreenNavigationOptions,
      };
    },
  },
);

export default AccountManagementStack;
