import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import NewRampAccountDetailsScreen from '../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import NewWyreAccountDetailsScreen from '../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import FriendsAndFamilyScreen from '../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import HomeContainer from '../pages/Home/HomeContainer'
import RampOrderFormScreen from '../pages/RampIntegration/RampOrderFormScreen'
import WyreOrderFormScreen from '../pages/WyreIntegration/WyreOrderFormScreen'
import AddNewAccountStack from './stacks/accounts/AddNewAccountStack'
import QRStack from './stacks/home/QRStack'
import MoreOptionsStack from './stacks/more-options/MoreOptionsStack'
import Colors from '../common/Colors'
import AllTransactionsStack from './stacks/transactions/AllTransactionsStack'

const Stack = createNativeStackNavigator()
function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName='HomeRoot'
    >
      <Stack.Screen name="HomeRoot" component={HomeContainer} options={{
        headerShown: false
      }} />
      <Stack.Screen name="AddNewAccount" component={AddNewAccountStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="NewWyreAccountDetails" component={NewWyreAccountDetailsScreen} options={{
        title: 'Setup Wyre Account'
      }} />
      <Stack.Screen name="NewRampAccountDetails" component={NewRampAccountDetailsScreen} options={{
        title: 'Setup Ramp Account'
      }} />
      <Stack.Screen name="PlaceWyreOrder" component={WyreOrderFormScreen} options={{
        title: 'Buy with Wyre'
      }} />
      <Stack.Screen name="PlaceRampOrder" component={RampOrderFormScreen} options={{
        title: 'Buy with Ramp'
      }} />
      <Stack.Screen name="AllTransactions" component={AllTransactionsStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="FriendsAndFamily" component={FriendsAndFamilyScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="QRScanner" component={QRStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="MoreOptions" component={MoreOptionsStack} options={{
        headerShown: false
      }} />
    </Stack.Navigator>
  )
}

const Tab = createBottomTabNavigator()
export default function AppContainer() {
  return (
    <Tab.Navigator
      initialRouteName='Album'
      screenOptions={{
        tabBarActiveTintColor: '#f0edf6',
        tabBarInactiveTintColor: '#3e2465',
        tabBarStyle: {
          overflow:'hidden',
          backgroundColor: Colors.blue,
          borderRadius: 45,
          margin: 15
        }
      }}
    >
      <Tab.Screen name="Album" component={HomeStack} />
      <Tab.Screen name="Library" component={FriendsAndFamilyScreen} />
      <Tab.Screen name="History" component={HomeStack} />
      <Tab.Screen name="Cart" component={HomeStack} />
    </Tab.Navigator>
  )
}
