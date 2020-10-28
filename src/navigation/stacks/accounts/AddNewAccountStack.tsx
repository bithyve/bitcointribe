import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import NewAccountSelectionList from "../../../pages/Accounts/AddNew/NewAccountSelectionList";
import AddNewHexaAccountDetailsScreen from "../../../pages/Accounts/AddNew/HexaAccount/AddNewHexaAccountDetailsScreen";
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import NavStyles from '../../../common/Styles/NavStyles';
import { goHomeAction } from '../../actions/NavigationActions';
import AddNewDonationAccountDetailsScreen from '../../../pages/Accounts/AddNew/DonationAccount/AddNewDonationAccountDetailsScreen';


const AddNewAccountStack = createStackNavigator(
  {
    AccountSelectionList: {
      screen: NewAccountSelectionList,
      navigationOptions: ({ navigation }) => {
        return {
          title: "Add New Account",
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.dispatch(goHomeAction) }} />;
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
        headerTitleStyle: NavStyles.modalHeaderTitleText,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />;
        },
      };
    },
  },
);

export default AddNewAccountStack;
