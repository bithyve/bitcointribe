import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import NewAccountSelectionList from "../../../pages/Accounts/AddNew/NewAccountSelectionList";
import AddNewHexaAccountDetails from "../../../pages/Accounts/AddNew/HexaAccount/AddNewHexaAccountDetails";
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton';
import NavStyles from '../../../common/Styles/NavStyles';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import { goHomeAction } from '../../actions/NavigationActions';


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
      screen: AddNewHexaAccountDetails,
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
