import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import Colors from '../../../common/Colors'
import AssetsScreen from '../../../pages/Assets/AssetsScreen'

// const strings  = translations[ 'stackTitle' ]
const Stack = createNativeStackNavigator()

const AssetsStack = ( { navigation, route } ) => {
  useLayoutEffect( () => {
    const routeName = getFocusedRouteNameFromRoute( route ) ?? 'AssetsScreen'
    if ( routeName === 'AssetsScreen' ){
      navigation.setOptions( {
        tabBarStyle: {
          display: 'flex', backgroundColor: Colors.darkBlue
        }
      } )
    }else {
      navigation.setOptions( {
        tabBarStyle: {
          display: 'none'
        }
      } )
    }
  }, [ navigation, route ] )
  return (
    <Stack.Navigator
      initialRouteName='AssetsScreen'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="AssetsScreen" component={AssetsScreen} />
    </Stack.Navigator>
  )
}

export default AssetsStack
