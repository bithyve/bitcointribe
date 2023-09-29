import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import HomeQRScannerScreen from '../../../pages/Home/HomeQRScannerScreen'
import ReceiveQrScreen from '../../../pages/Home/ReceiveQrScreen'

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
      <Stack.Screen name="QRRoot" component={HomeQRScannerScreen} options={( { navigation } ) => {
        return {
          title: 'QR',
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.goBack() }} />
          },
        }
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
