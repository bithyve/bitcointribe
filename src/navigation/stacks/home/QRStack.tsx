import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import HomeQRScannerScreen from '../../../pages/Home/HomeQRScannerScreen'
import ReceiveQrScreen from '../../../pages/Home/ReceiveQrScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'

const Stack = createNativeStackNavigator()
export default function QRStack() {
  return (
    <Stack.Navigator
      initialRouteName='QRRoot'
      screenOptions={( { navigation } ) => ( {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
        },
      } )}
    >
      <Stack.Screen name="QRRoot" component={HomeQRScannerScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ReceiveQR" component={ReceiveQrScreen} options={( { navigation } ) => {
        return {
          title: 'Receive',
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
    </Stack.Navigator>
  )
}
