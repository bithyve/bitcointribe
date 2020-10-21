import React from 'react';
import { createStackNavigator } from "react-navigation-stack";
import AllTransactionsContainerScreen from "../../../pages/Transactions/AllTransactionsContainerScreen";
import SmallNavHeaderBackButton from "../../../components/navigation/SmallNavHeaderBackButton";
import { goHomeAction } from "../../actions/NavigationActions";
import NavStyles from '../../../common/Styles/NavStyles';
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton';
import AllTransactionsDetailsContainerScreen from '../../../pages/Transactions/AllTransactionsDetailsContainerScreen';


const AllTransactionsStack = createStackNavigator(
  {
    AllTransactionsRoot: {
      screen: AllTransactionsContainerScreen,
      navigationOptions: ({ navigation }) => {
        return {
          title: "Transactions",
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.dispatch(goHomeAction) }} />;
          },
        };
      },
    },
    TransactionDetails: {
      screen: AllTransactionsDetailsContainerScreen,
      navigationOptions: {
        title: "Transaction Details",
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'AllTransactionsRoot',
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

export default AllTransactionsStack;
