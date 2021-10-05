import React from 'react'
import { createStackNavigator, StackViewTransitionConfigs } from 'react-navigation-stack'
import HomeScreen from '../../../pages/Home/Home'
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import HomeQRScannerScreen from '../../../pages/Home/HomeQRScannerScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import MoreOptionsStack from '../more-options/MoreOptionsStack'
import AllTransactionsStack from '../transactions/AllTransactionsStack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import AddNewAccountStack from '../accounts/AddNewAccountStack'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import WyreOrderFormScreen from '../../../pages/WyreIntegration/WyreOrderFormScreen'
import NewRampAccountDetailsScreen from '../../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import RampOrderFormScreen from '../../../pages/RampIntegration/RampOrderFormScreen'
import QRStack from '../home/QRStack'
import Home from '../../../pages/Home/Home'
import TabNavigator from '../../TabNavigator'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import Header from '../Header'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import QrAndLink from '../../../pages/NewBHR/QrAndLink'
import AddContactAddressBook from '../../../pages/Contacts/AddContactAddressBook'
import RequestKeyFromContact from '../../../components/RequestKeyFromContact'
import Launch from '../../../pages/Launch'
import Login from '../../../pages/Login'
import ReLogin from '../../../pages/ReLogin'
import Intermediate from '../../../pages/Intermediate'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import { translations } from '../../../common/content/LocContext'

const strings  = translations[ 'stackTitle' ]

const MODAL_ROUTES = [
  'AllTransactions',
  'QRScanner',
  'FriendsAndFamily',
  'MoreOptions',
  'PlaceWyreOrder',
  'PlaceRampOrder'
]

const FriendsAndFamily = createStackNavigator(
  {
    Home: {
      screen: FriendsAndFamilyScreen,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    Login,
    Launch,
    Intermediate,
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    ContactDetails: {
      screen: ContactDetails,
      navigationOptions: {
        header: null,
      },
    },
    AddContactSendRequest: {
      screen: AddContactSendRequest,
      navigationOptions: {
        header: null,
      },
    },
    QrAndLink: {
      screen: QrAndLink,
      navigationOptions: {
        header: null,
      },
    },
    AccountDetails: {
      screen: AccountDetailsStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
    AddContact: {
      screen: AddContactAddressBook,
      navigationOptions: {
        header: null,
      },
    },
    RequestKeyFromContact
  },
  {
    // mode: 'modal',
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    },
    // defaultNavigationOptions: ( { navigation } ) => {
    //   return {
    //     ...defaultStackScreenNavigationOptions,
    //     headerLeft: () => {
    //       return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
    //     },
    //   }
    // },
    // transitionConfig: ( transitionProps, prevTransitionProps ) => {
    //   const previousRouteName = prevTransitionProps?.scene.route.routeName
    //   const newRouteName = transitionProps.scene.route.routeName

    //   // 📝 Override the default presentation mode for screens that we
    //   // want to present modally
    //   const isModal = MODAL_ROUTES.some(
    //     ( screenName ) => [ previousRouteName, newRouteName ].includes( screenName )
    //   )

    //   return StackViewTransitionConfigs.defaultTransitionConfig(
    //     transitionProps,
    //     prevTransitionProps,
    //     isModal,
    //   )
    // },
  },
)

export default FriendsAndFamily
