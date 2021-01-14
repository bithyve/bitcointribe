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


const MODAL_ROUTES = [
  'AllTransactions',
  'QRScanner',
  'FriendsAndFamily',
  'MoreOptions',
]

const HomeStack = createStackNavigator(
  {
    HomeRoot: {
      screen: HomeScreen,
      navigationOptions: {
        header: null,
      },
    },
    AddNewAccount: {
      screen: AddNewAccountStack,
      navigationOptions: {
        header: null,
      },
    },
    NewWyreAccountDetails: {
      screen: NewWyreAccountDetailsScreen,
      navigationOptions: {
        title: 'Account Details'
      }
    },
    PlaceWyreOrder: {
      screen: WyreOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Wyre'
      }
    },
    AllTransactions: {
      screen: AllTransactionsStack,
      navigationOptions: {
        header: null,
      },
    },
    FriendsAndFamily: FriendsAndFamilyScreen,
    QRScanner: {
      screen: HomeQRScannerScreen,
      navigationOptions: {
        title: 'QR',
      },
    },
    MoreOptions: {
      screen: MoreOptionsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'HomeRoot',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
        },
      }
    },
    transitionConfig: ( transitionProps, prevTransitionProps ) => {
      const previousRouteName = prevTransitionProps?.scene.route.routeName
      const newRouteName = transitionProps.scene.route.routeName

      // 📝 Override the default presentation mode for screens that we
      // want to present modally
      const isModal = MODAL_ROUTES.some(
        ( screenName ) => [ previousRouteName, newRouteName ].includes( screenName )
      )

      return StackViewTransitionConfigs.defaultTransitionConfig(
        transitionProps,
        prevTransitionProps,
        isModal,
      )
    },
  },
)

export default HomeStack
