import React from 'react'
import {
  createStackNavigator,
} from 'react-navigation-stack'
import Intermediate from '../../../pages/Intermediate'
import BuyHome from '../../../pages/Buy/BuyHome'

const BuyStack = createStackNavigator(
  {
    Home: {
      screen: BuyHome,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },

    },
    Intermediate,
  },

  {
    headerLayoutPreset: 'center',
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: ( { navigation } ) => {

      let tabBarVisible = false

      if ( navigation.state.index === 0 && navigation.state.routes[ 0 ].routeName == 'Home' ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    },
  },
)

export default BuyStack
