import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import QRStack from '../home/QRStack'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import QrAndLink from '../../../pages/NewBHR/QrAndLink'
import AddContactAddressBook from '../../../pages/Contacts/AddContactAddressBook'
import ManageGifts from '../../../pages/FriendsAndFamily/ManageGifts'
import CreateGift from '../../../pages/FriendsAndFamily/CreateGift'
import RequestKeyFromContact from '../../../components/RequestKeyFromContact'
import Launch from '../../../pages/Launch'
import Login from '../../../pages/Login'
import ReLogin from '../../../pages/ReLogin'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import Intermediate from '../../../pages/Intermediate'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import SendGift from '../../../pages/FriendsAndFamily/SendGift'
import GiftDetails from '../../../pages/FriendsAndFamily/GiftDetails'
import EnterGiftDetails from '../../../pages/FriendsAndFamily/EnterGiftDetails'
import SendViaLinkAndQR from '../../../pages/FriendsAndFamily/SendViaLinkAndQR'
import { useLayoutEffect } from 'react'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'

const Stack = createNativeStackNavigator()
const FriendsAndFamily = ( { navigation, route } ) => {
  useLayoutEffect( () => {
    const routeName = getFocusedRouteNameFromRoute( route ) ?? 'FriendsAndFamilyScreen'
    if ( routeName === 'FriendsAndFamilyScreen' ){
      navigation.setOptions( {
        tabBarStyle: {
          display: 'flex', backgroundColor: 'transparent'
        }
      } )
    }else {
      navigation.setOptions( {
        tabBarStyle: {
          display: 'none'
        }
      } )
    }
  }, [ navigation, route ] )
  return (
    <Stack.Navigator
      initialRouteName='FriendsAndFamilyScreen'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="FriendsAndFamilyScreen" component={FriendsAndFamilyScreen} />
      <Stack.Screen name="ManageGifts" component={ManageGifts} />
      <Stack.Screen name="EnterGiftDetails" component={EnterGiftDetails} />
      <Stack.Screen name="GiftDetails" component={GiftDetails} />
      <Stack.Screen name="SendViaLinkAndQR" component={SendViaLinkAndQR} />
      <Stack.Screen name="CreateGift" component={CreateGift} />
      <Stack.Screen name="SendGift" component={SendGift} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Launch" component={Launch} />
      <Stack.Screen name="Intermediate" component={Intermediate} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gestureEnabled: false
      }} />
      <Stack.Screen name="ContactDetails" component={ContactDetails} />
      <Stack.Screen name="AddContactSendRequest" component={AddContactSendRequest} />
      <Stack.Screen name="QrAndLink" component={QrAndLink} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsStack} />
      <Stack.Screen name="QRScanner" component={QRStack} />
      <Stack.Screen name="AddContact" component={AddContactAddressBook} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} options={{
        title: 'TransactionDetails'
      }} />
      <Stack.Screen name="RequestKeyFromContact" component={RequestKeyFromContact} />
    </Stack.Navigator>
  )
}

export default FriendsAndFamily
