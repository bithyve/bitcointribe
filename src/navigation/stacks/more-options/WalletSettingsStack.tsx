import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import ChangeCurrencyScreen from '../../../pages/ChangeCurrencyScreen'
import ManagePasscodeScreen from '../../../pages/ManagePasscodeScreen'
import WalletSettingsContainerScreen from '../../../pages/MoreOptions/WalletSettings/WalletSettingsContainerScreen'
import ReLogin from '../../../pages/ReLogin'
import SettingGetNewPin from '../../../pages/SettingGetNewPin'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'

const Stack = createNativeStackNavigator()
export default function WalletSettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={( { navigation } ) => ( {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => {
            navigation.popToTop() }} />
        },
      } )}
    >
      <Stack.Screen name="WalletSettingsRoot" component={WalletSettingsContainerScreen} options={{
        title: 'Wallet Settings'
      }} />
      <Stack.Screen name="ManagePasscode" component={ManagePasscodeScreen} options={{
        title: 'Manage Passcode'
      }} />
      <Stack.Screen name="ChangeCurrency" component={ChangeCurrencyScreen} options={{
        title: ''
      }} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gestureEnabled: false
      }} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} options={{
        title: 'Transaction Details'
      }} />
      <Stack.Screen name="SettingGetNewPin" component={SettingGetNewPin} options={{
        title: 'Manage Passcode'
      }} />
    </Stack.Navigator>
  )
}
