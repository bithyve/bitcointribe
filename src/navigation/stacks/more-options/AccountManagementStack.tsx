import React from 'react';
import NavStyles from '../../../common/Styles/NavStyles';
import { createStackNavigator } from 'react-navigation-stack';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import AccountManagementContainerScreen from '../../../pages/MoreOptions/AccountManagement/AccountManagementContainerScreen';
import PanAccountSettingsContainerScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/PanAccountSettingsContainerScreen';
import NavHeaderSettingsButton from '../../../components/navigation/NavHeaderSettingsButton';


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
        headerTitleStyle: NavStyles.modalHeaderTitleText,
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
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />;
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
    defaultNavigationOptions: () => {
      return {
        headerTitleStyle: NavStyles.modalHeaderTitleText,
      };
    },
  },
);

export default AccountManagementStack;
