import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { translations } from '../../../common/content/LocContext'
import LNAccountDetails from '../../../pages/zeusLN/AccountDetails'
import ViewAllScreen from '../../../pages/zeusLN/ViewAllScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import ReceiveCoinScreen from '../../../pages/zeusLN/screens/ReceiveCoinScreen'

const AccountDetailsStack = createStackNavigator(
  {
    AccountDetailsRoot: LNAccountDetails,
    ViewAll: ViewAllScreen,
    ReceiveCoin:{
      screen: ReceiveCoinScreen,
      navigationOptions: {
        title: 'Receive'
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
