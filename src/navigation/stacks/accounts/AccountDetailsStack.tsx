import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import AccountDetailsContainerScreen from '../../../pages/Accounts/Details/AccountDetailsContainerScreen'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import TransactionsListContainerScreen from '../../../pages/Accounts/Transactions/TransactionsListContainerScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import SubAccountSettingsStack from './SubAccountSettingsStack'
import DonationAccountWebViewSettingsScreen from '../../../pages/Accounts/AccountSettings/DonationAccountWebViewSettingsScreen'
// import SendStack from '../send/_Old_SendStack';
import SendStack from '../send/SendStack'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import SubAccountTFAHelpScreen from '../../../pages/Accounts/SubAccountTFAHelpScreen'


const AccountDetailsStack = createStackNavigator(
  {
    AccountDetailsRoot: AccountDetailsContainerScreen,
    Send: {
      screen: SendStack,
      navigationOptions: {
        header: null,
      },
    },
    TransactionsList: {
      screen: TransactionsListContainerScreen,
      navigationOptions: {
        title: 'All Transactions',
      },
    },
    TransactionDetails: {
      screen: TransactionDetailsContainerScreen,
      navigationOptions: {
        title: 'Transaction Details',
      },
    },
    DonationAccountWebViewSettings: {
      screen: DonationAccountWebViewSettingsScreen,
      navigationOptions: {
        header: null,
      },
    },
    SubAccountSettings: {
      screen: SubAccountSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'AccountDetailsRoot',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
        },
      }
    },
  },
)

export default AccountDetailsStack
