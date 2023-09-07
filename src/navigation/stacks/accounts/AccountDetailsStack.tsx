import React from 'react'
import { NativeStackNavigationOptions, createNativeStackNavigator } from '@react-navigation/native-stack'
import AccountDetailsContainerScreen from '../../../pages/Accounts/Details/AccountDetailsContainerScreen'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import TransactionsListContainerScreen from '../../../pages/Accounts/Transactions/TransactionsListContainerScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import SubAccountSettingsStack from './SubAccountSettingsStack'
import DonationAccountWebViewSettingsScreen from '../../../pages/Accounts/AccountSettings/DonationAccountWebViewSettingsScreen'
import SendStack from '../send/SendStack'
import SubAccountTFAHelpScreen from '../../../pages/Accounts/SubAccountTFAHelpScreen'

const Stack = createNativeStackNavigator();
export default function AccountDetailsStack() {
  return (
    <Stack.Navigator
      initialRouteName='AccountDetailsRoot'
      screenOptions={({navigation}): NativeStackNavigationOptions => ({
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
      })}
    >
      <Stack.Screen name="AccountDetailsRoot" component={AccountDetailsContainerScreen} />
      <Stack.Screen name="Send" component={SendStack} options={{ header: null }} />
      <Stack.Screen name="TransactionsList" component={TransactionsListContainerScreen} options={{ title: 'All Transactions' }} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} options={{ title: 'TransactionDetails' }} />
      <Stack.Screen name="DonationAccountWebViewSettings" component={DonationAccountWebViewSettingsScreen} options={{ header: null }} />
      <Stack.Screen name="SubAccountSettings" component={SubAccountSettingsStack} options={{ header: null }} />
      <Stack.Screen name="SubAccountTFAHelp" component={SubAccountTFAHelpScreen} options={{ header: null }} />
    </Stack.Navigator>
  )
}

