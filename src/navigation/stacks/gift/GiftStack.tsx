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

const Stack = createNativeStackNavigator();
const GiftStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='Home'
    >
      <Stack.Screen name="Home" component={GiftScreen} options={{ header: null }} />
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
