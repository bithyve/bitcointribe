import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { translations } from '../../../common/content/LocContext'
import LNAccountDetails from '../../../pages/lightningAccount/AccountDetails'
import ViewAllScreen from '../../../pages/lightningAccount/ViewAllScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import ReceiveCoinScreen from '../../../pages/lightningAccount/screens/ReceiveCoinScreen'
import SendScreen from '../../../pages/lightningAccount/SendScreen'
import SettingsScreen from '../../../pages/lightningAccount/screens/SettingsScreen'
import ChannelsListScreen from '../../../pages/lightningAccount/screens/ChannelsListScreen'
import ChannelInfoScreen from '../../../pages/lightningAccount/screens/ChannelInfoScreen'
import ChannelOpenScreen from '../../../pages/lightningAccount/screens/ChannelOpenScreen'
import PayInvoiceScreen from '../../../pages/lightningAccount/PayInvoiceScreen'
import PaymentsScreen from '../../../pages/lightningAccount/PaymentsScreen'
import InvoiceDetailsScreen from '../../../pages/lightningAccount/screens/InvoiceDetailsScreen'
import TransactionDetailsScreen from '../../../pages/lightningAccount/screens/TransactionDetailsScreen'
import SubAccountSettingsStack from './SubAccountSettingsStack'

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
    AccountSettings: {
      screen: SubAccountSettingsStack,
      navigationOptions: {
        header: null,
      },
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

    InvoiceDetailsScreen: {
      screen: InvoiceDetailsScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    },

    TransactionDetailsScreen: {
      screen: TransactionDetailsScreen,
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
