import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Intermediate from '../../../pages/Intermediate'
import BuyHome from '../../../pages/Buy/BuyHome'
import Login from '../../../pages/Login'
import ReLogin from '../../../pages/ReLogin'

const Stack = createNativeStackNavigator()
const BuyStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='Home'
      headerLayoutPreset="center"
      defaultNavigationOptions={{
        header: null
      }}
      screenOptions={( { navigation } ) => {
        let tabBarVisible = false
        if ( ( navigation.state.index === 0 || navigation.state.index === 1 ) && ( navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
          tabBarVisible = true
        }
        return {
          tabBarVisible
        }
      }}
    >
      <Stack.Screen name="Home" component={BuyHome} options={{
        header: null
      }} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gesturesEnabled: false
      }} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Intermediate" component={Intermediate} />
    </Stack.Navigator>
  )
}

export default BuyStack
