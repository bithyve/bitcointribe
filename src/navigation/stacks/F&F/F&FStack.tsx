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
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      if ( navigation.state.index === 0 ) {
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
