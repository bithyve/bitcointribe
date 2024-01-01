import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AllTransactionsContainerScreen from '../../../pages/Transactions/AllTransactionsContainerScreen'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import AllTransactionsDetailsContainerScreen from '../../../pages/Transactions/AllTransactionsDetailsContainerScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'

const Stack = createNativeStackNavigator();
export default function AllTransactionsStack() {
  return (
    <Stack.Navigator
      initialRouteName='AllTransactionsRoot'
      screenOptions={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
          },
        }
      }}
    >
      <Stack.Screen name="AllTransactionsRoot" component={AllTransactionsContainerScreen} options={( { navigation } ) => {
        return {
          title: 'Transactions',
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }} />
      <Stack.Screen name="TransactionDetails" component={AllTransactionsDetailsContainerScreen} options={{ title: 'Transaction Details' }} />
    </Stack.Navigator>
  )
}
