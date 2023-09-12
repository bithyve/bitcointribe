import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
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
import GiftScreen from '../../../pages/Gift/GiftScreen'
import SetUpSatCardScreen from '../../../pages/Gift/SetUpSatCardScreen'
import SetUpSatNextCardScreen from '../../../pages/Gift/SetUpSatNextCardScreen'
import GiftCreatedScreen from '../../../pages/Gift/GiftCreatedScreen'
import ClaimSatsScreen from '../../../pages/Gift/ClaimSatsScreen'

const Stack = createNativeStackNavigator()
const GiftStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='GiftScreen'
    >
      <Stack.Screen name="GiftScreen" component={GiftScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ManageGifts" component={ManageGifts} options={{
        headerShown:false
      }}/>
      <Stack.Screen name="EnterGiftDetails" component={EnterGiftDetails} />
      <Stack.Screen name="GiftDetails" component={GiftDetails} />
      <Stack.Screen name="SendViaLinkAndQR" component={SendViaLinkAndQR} />
      <Stack.Screen name="CreateGift" component={CreateGift} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="SendGift" component={SendGift}/>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Launch" component={Launch} />
      <Stack.Screen name="Intermediate" component={Intermediate} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gestureEnabled:false
      }}/>
      <Stack.Screen name="ContactDetails" component={ContactDetails} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="AddContactSendRequest" component={AddContactSendRequest} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="QrAndLink" component={QrAndLink} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="AccountDetails" component={AccountDetailsStack} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} options={{
        title: 'TransactionDetails',
      }}/>

      <Stack.Screen name="QRScanner" component={QRStack} options={{
        headerShown: false
      }}/>

      <Stack.Screen name="AddContact" component={AddContactAddressBook} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="RequestKeyFromContact" component={RequestKeyFromContact} />
      <Stack.Screen name="SetUpSatNextCard" component={SetUpSatNextCardScreen} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="GiftCreated" component={GiftCreatedScreen} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="ClaimSats" component={ClaimSatsScreen} options={{
        headerShown: false
      }}/>
    </Stack.Navigator>
  )
}
// TODO: add all below screens to above stack
// const GiftStack = createStackNavigator(
//   {
//     Home: {
//       screen: GiftScreen,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     ManageGifts,
//     EnterGiftDetails,
//     GiftDetails,
//     SendViaLinkAndQR,
//     CreateGift,
//     SendGift,
//     Login,
//     Launch,
//     Intermediate,
//     ReLogin: {
//       screen: ReLogin,
//       navigationOptions: {
//         gesturesEnabled: false,
//       },
//     },
//     ContactDetails: {
//       screen: ContactDetails,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     AddContactSendRequest: {
//       screen: AddContactSendRequest,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     QrAndLink: {
//       screen: QrAndLink,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     AccountDetails: {
//       screen: AccountDetailsStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     TransactionDetails: {
//       screen: TransactionDetailsContainerScreen,
//       navigationOptions: {
//         title: 'TransactionDetails',
//       },
//     },
//     QRScanner: {
//       screen: QRStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     AddContact: {
//       screen: AddContactAddressBook,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     RequestKeyFromContact,
//     SetUpSatCard: {
//       screen: SetUpSatCardScreen,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     SetUpSatNextCard:{
//       screen:SetUpSatNextCardScreen,
//       navigationOptions: {
//         header:null
//       }
//     },
//     GiftCreated:{
//       screen:GiftCreatedScreen,
//       navigationOptions: {
//         header:null
//       }
//     },
//     ClaimSats :{
//       screen: ClaimSatsScreen,
//       navigationOptions: {
//         header:null
//       }
//     }
//   },
//   {
//     initialRouteName: 'Home',
//     defaultNavigationOptions: {
//       header: null
//     },
//     navigationOptions: ( { navigation } ) => {
//       let tabBarVisible = false
//       if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
//         tabBarVisible = true
//       }

//       return {
//         tabBarVisible,
//       }
//     },
//   },
// )

export default GiftStack
