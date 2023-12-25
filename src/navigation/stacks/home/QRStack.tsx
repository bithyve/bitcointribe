import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import HomeQRScannerScreen from '../../../pages/Home/HomeQRScannerScreen'
import ReceiveQrScreen from '../../../pages/Home/ReceiveQrScreen'
import NavHeaderSettingsButton from '../../../components/navigation/NavHeaderSettingsButton'


const QRStack = createStackNavigator(
  {
    QRRoot: {
      screen: HomeQRScannerScreen,
      // navigationOptions: ( { navigation } ) => {
      //   return {
      //     title: 'QR',
      //     headerLeft: () => {
      //       return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
      //     },
      //   }
      // },
      navigationOptions:{
        header: null
      }
    },

    ReceiveQR: {
      screen: ReceiveQrScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: 'Receive',
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
          }
        }
      },
    },

  },
  {
    initialRouteName: 'QRRoot',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
        },
      }
    },
  },
)


export default QRStack
