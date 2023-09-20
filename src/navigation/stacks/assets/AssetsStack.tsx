import React from 'react'
import { createStackNavigator, StackViewTransitionConfigs } from 'react-navigation-stack'
import AssetsScreen from '../../../pages/Assets/AssetsScreen'

// const strings  = translations[ 'stackTitle' ]

const AssetsStack = createStackNavigator(
  {
    Home: {
      screen: AssetsScreen,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    // ManageGifts,
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
  },
)

export default AssetsStack
