import React from 'react'
import { View, Text } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import { createStackNavigator } from 'react-navigation-stack'
import NewRampAccountDetailsScreen from '../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import NewWyreAccountDetailsScreen from '../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import FriendsAndFamilyScreen from '../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import Home from '../pages/Home/Home'
import HomeContainer from '../pages/Home/HomeContainer'
import RampOrderFormScreen from '../pages/RampIntegration/RampOrderFormScreen'
import WyreOrderFormScreen from '../pages/WyreIntegration/WyreOrderFormScreen'
import AddNewAccountStack from './stacks/accounts/AddNewAccountStack'
import QRStack from './stacks/home/QRStack'
import MoreOptionsStack from './stacks/more-options/MoreOptionsStack'
import Colors from '../common/Colors'
import AllTransactionsStack from './stacks/transactions/AllTransactionsStack'

const HomeStack = createStackNavigator(
  {
    HomeRoot: {
      screen: HomeContainer,
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
        title: 'Setup Wyre Account'
      }
    },
    NewRampAccountDetails: {
      screen: NewRampAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Ramp Account'
      }
    },
    PlaceWyreOrder: {
      screen: WyreOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Wyre'
      }
    },
    PlaceRampOrder: {
      screen: RampOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Ramp'
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
      screen: QRStack,
      navigationOptions: {
        header: null,
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
    // mode: 'modal',
    initialRouteName: 'HomeRoot',
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
export default createAppContainer( createMaterialBottomTabNavigator(
  {
    Album: {
      screen: HomeStack
    },
    Library: {
      screen: FriendsAndFamilyScreen
    },
    History: {
      screen: HomeStack
    },
    Cart: {
      screen: HomeStack
    },
  },

  {
    initialRouteName: 'Album',
    activeColor: '#f0edf6',
    inactiveColor: '#3e2465',
    barStyle: {
      // backgroundColor: '#694fad',
      overflow:'hidden',
      // position: 'absolute',
      // left: 20,
      // right: 20,
      // bottom: 25,
      // elevation: 0,
      backgroundColor: Colors.blue,
      borderRadius: 45,
      margin: 15
    },
  }
) )
