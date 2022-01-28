import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { translations } from '../../../common/content/LocContext'
import LNAccountDetails from '../../../pages/zeusLN/AccountDetails'
import ViewAllScreen from '../../../pages/zeusLN/ViewAllScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import ReceiveCoinScreen from '../../../pages/zeusLN/screens/ReceiveCoinScreen'
import SendScreen from '../../../pages/zeusLN/SendScreen'
import SettingsScreen from '../../../pages/zeusLN/screens/SettingsScreen'
import ChannelsListScreen from '../../../pages/zeusLN/screens/ChannelsListScreen'
import ChannelInfoScreen from '../../../pages/zeusLN/screens/ChannelInfoScreen'
import ChannelOpenScreen from '../../../pages/zeusLN/screens/ChannelOpenScreen'

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
    },

    SettingsScreen: {
      screen: SettingsScreen,
      navigationOptions: {
        header: null
      }
    },

    ChannelsListScreen: {
      screen: ChannelsListScreen,
      navigationOptions: {
        header: null
      }
    },

    ChannelInfoScreen: {
      screen: ChannelInfoScreen,
      navigationOptions: {
        header: null
      }
    },

    ChannelOpenScreen: {
      screen: ChannelOpenScreen,
      navigationOptions: {
        header: null
      }
    },
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
