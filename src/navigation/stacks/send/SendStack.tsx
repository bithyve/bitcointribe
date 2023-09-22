import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import AccountSendContainerScreen from '../../../pages/Accounts/Send/AccountSendContainerScreen'
import SentAmountForContactFormScreen from '../../../pages/Accounts/Send/SentAmountForContactFormScreen'
import AccountSendConfirmationContainerScreen from '../../../pages/Accounts/Send/AccountSendConfirmationContainerScreen'
import OTPAuthenticationScreen from '../../../pages/Accounts/Send/OTPAuthentication'

const Stack = createNativeStackNavigator()
export default function SendStack() {
  return (
    <Stack.Navigator
      initialRouteName='SendRoot'
      screenOptions={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
          },
        }
      }}
    >
      <Stack.Screen name="SendRoot" component={AccountSendContainerScreen} />
      <Stack.Screen name="SentAmountForContactForm" component={SentAmountForContactFormScreen} options={{
        title: 'Send To'
      }} />
      <Stack.Screen name="SendConfirmation" component={AccountSendConfirmationContainerScreen} options={{
        title: 'Send Confirmation'
      }} />
      <Stack.Screen name="OTPAuthentication" component={OTPAuthenticationScreen} options={{
        headerShown:false
      }} />
    </Stack.Navigator>
  )
}
