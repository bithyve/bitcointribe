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
import PayInvoiceScreen from '../../../pages/zeusLN/PayInvoiceScreen'
import PaymentsScreen from '../../../pages/zeusLN/PaymentsScreen'

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
    Payments: {
      screen: PaymentsScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    },
    PayInvoice: {
      screen: PayInvoiceScreen,
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
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    },

    ChannelsListScreen: {
      screen: ChannelsListScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    },

    ChannelInfoScreen: {
      screen: ChannelInfoScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    },

    ChannelOpenScreen: {
      screen: ChannelOpenScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
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
