import React from 'react'
import {
  createStackNavigator,
} from 'react-navigation-stack'
import Intermediate from '../../../pages/Intermediate'
import BuyHome from '../../../pages/Buy/BuyHome'
import Login from '../../../pages/Login'
import ReLogin from '../../../pages/ReLogin'

const BuyStack = createStackNavigator(
  {
    Home: {
      screen: BuyHome,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },

    },
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    Login,
    Intermediate,
  },

  {
    headerLayoutPreset: 'center',
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: ( { navigation } ) => {

      let tabBarVisible = false

      if ( ( navigation.state.index === 0 || navigation.state.index === 1 ) && ( navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    },
  },
)

export default BuyStack
