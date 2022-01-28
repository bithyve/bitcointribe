import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { translations } from '../../../common/content/LocContext'
import LNAccountDetails from '../../../pages/zeusLN/AccountDetails'
import ViewAllScreen from '../../../pages/zeusLN/ViewAllScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import ReceiveCoinScreen from '../../../pages/zeusLN/screens/ReceiveCoinScreen'
import SendScreen from '../../../pages/zeusLN/SendScreen'

const AccountDetailsStack = createStackNavigator(
  {
    AccountDetailsRoot: LNAccountDetails,
    ViewAll: ViewAllScreen,
    ReceiveCoin:{
      screen: ReceiveCoinScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    },
    SendScreen: {
      screen: SendScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    }
  },
  {
    initialRouteName: 'AccountDetailsRoot',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
        },
      }
    },
  }, )

export default AccountDetailsStack
