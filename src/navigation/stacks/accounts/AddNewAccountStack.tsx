import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import NewAccountSelectionContainerScreen from "../../../pages/Accounts/AddNew/NewAccountSelectionContainerScreen";
import AddNewHexaAccountDetailsScreen from "../../../pages/Accounts/AddNew/HexaAccount/AddNewHexaAccountDetailsScreen";
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import AddNewDonationAccountDetailsScreen from '../../../pages/Accounts/AddNew/DonationAccount/AddNewDonationAccountDetailsScreen';
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';


const AddNewAccountStack = createStackNavigator(
  {
    AccountSelectionList: {
      screen: NewAccountSelectionContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "Add New Account",
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop(); }} />;
          },
        };
      },
    },
    AddNewHexaAccountDetails: {
      screen: AddNewHexaAccountDetailsScreen,
      navigationOptions: {
        title: "Account Details"
      }
    },
    AddNewDonationAccountDetails: {
      screen: AddNewDonationAccountDetailsScreen,
      navigationOptions: {
        title: "Account Details"
      }
    },
  },
  {
    initialRouteName: 'AccountSelectionList',
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

export default AddNewAccountStack;
