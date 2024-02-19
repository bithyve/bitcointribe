import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import AccountSendConfirmationContainerScreen from '../../../pages/Accounts/Send/AccountSendConfirmationContainerScreen'
import AccountSendContainerScreen from '../../../pages/Accounts/Send/AccountSendContainerScreen'
import OTPAuthenticationScreen from '../../../pages/Accounts/Send/OTPAuthentication'
import SentAmountForContactFormScreen from '../../../pages/Accounts/Send/SentAmountForContactFormScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'

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
      <Stack.Screen name="SendRoot" component={AccountSendContainerScreen}
        options={{
          title: 'Send'
        }}/>
      <Stack.Screen name="SentAmountForContactForm" component={SentAmountForContactFormScreen} options={{
        title: 'Send To'
      }} />
      <Stack.Screen name="SendConfirmation" component={AccountSendConfirmationContainerScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="OTPAuthentication" component={OTPAuthenticationScreen} options={{
        headerShown:false
      }} />
    </Stack.Navigator>
  )
}
