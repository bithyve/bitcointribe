import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import Colors from '../../../common/Colors'
import RequestKeyFromContact from '../../../components/RequestKeyFromContact'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import AddContactAddressBook from '../../../pages/Contacts/AddContactAddressBook'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import CreateGift from '../../../pages/FriendsAndFamily/CreateGift'
import EnterGiftDetails from '../../../pages/FriendsAndFamily/EnterGiftDetails'
import GiftDetails from '../../../pages/FriendsAndFamily/GiftDetails'
import ManageGifts from '../../../pages/FriendsAndFamily/ManageGifts'
import SendGift from '../../../pages/FriendsAndFamily/SendGift'
import SendViaLinkAndQR from '../../../pages/FriendsAndFamily/SendViaLinkAndQR'
import ClaimSatsScreen from '../../../pages/Gift/ClaimSatsScreen'
import GiftCreatedScreen from '../../../pages/Gift/GiftCreatedScreen'
import GiftScreen from '../../../pages/Gift/GiftScreen'
import SetUpSatCardScreen from '../../../pages/Gift/SetUpSatCardScreen'
import SetUpSatNextCardScreen from '../../../pages/Gift/SetUpSatNextCardScreen'
import GiftQRScannerScreen from '../../../pages/FriendsAndFamily/GiftQrScanner'
import Intermediate from '../../../pages/Intermediate'
import Launch from '../../../pages/Launch'
import Login from '../../../pages/Login'
import QrAndLink from '../../../pages/NewBHR/QrAndLink'
import ReLogin from '../../../pages/ReLogin'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import QRStack from '../home/QRStack'



const Stack = createNativeStackNavigator()
const GiftStack = ( { navigation, route } ) => {
  useLayoutEffect( () => {
    const routeName = getFocusedRouteNameFromRoute( route ) ?? 'GiftScreen'
    if ( routeName === 'GiftScreen' ){
      navigation.setOptions( {
        tabBarStyle: {
          display: 'flex', backgroundColor: Colors.darkBlue
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
      initialRouteName='GiftScreen'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="GiftScreen" component={GiftScreen}  />
      <Stack.Screen name="ManageGifts" component={ManageGifts} />
      <Stack.Screen name="EnterGiftDetails" component={EnterGiftDetails} />
      <Stack.Screen name="GiftDetails" component={GiftDetails} />
      <Stack.Screen name="SendViaLinkAndQR" component={SendViaLinkAndQR} />
      <Stack.Screen name="CreateGift" component={CreateGift} />
      <Stack.Screen name="SendGift" component={SendGift}/>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Launch" component={Launch} />
      <Stack.Screen name="Intermediate" component={Intermediate} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gestureEnabled:false
      }}/>
      <Stack.Screen name="ContactDetails" component={ContactDetails} />
      <Stack.Screen name="AddContactSendRequest" component={AddContactSendRequest} />
      <Stack.Screen name="QrAndLink" component={QrAndLink} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsStack} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} options={{
        title: 'TransactionDetails',
      }}/>
      <Stack.Screen name="QRScanner" component={QRStack} />
      <Stack.Screen name="AddContact" component={AddContactAddressBook} />
      <Stack.Screen name="RequestKeyFromContact" component={RequestKeyFromContact} />
      <Stack.Screen name="SetUpSatCard" component={SetUpSatCardScreen} />
      <Stack.Screen name="SetUpSatNextCard" component={SetUpSatNextCardScreen} />
      <Stack.Screen name="GiftCreated" component={GiftCreatedScreen} />
      <Stack.Screen name="ClaimSats" component={ClaimSatsScreen} />
      <Stack.Screen name="GiftQRScannerScreen" component={GiftQRScannerScreen}/>
    </Stack.Navigator>
  )
}

export default GiftStack
