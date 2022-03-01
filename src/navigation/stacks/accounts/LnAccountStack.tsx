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
import PaymentDetailsScreen from '../../../pages/lightningAccount/screens/PaymentDetailsScreen'
import OnChainSendScreen from '../../../pages/lightningAccount/OnChainSendScreen'
import NodeInfoScreen from '../../../pages/lightningAccount/screens/NodeInfoScreen'
import ScanOpenChannel from '../../../pages/lightningAccount/screens/ScanOpenChannel'
import Colors from '../../../common/Colors.js'

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
    ScanOpenChannel: {
      screen: ScanOpenChannel,
      navigationOptions: {
        header: null,
      },
    },
    NodeInfoScreen: {
      screen: NodeInfoScreen,
      navigationOptions: {
        title: '',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          backgroundColor:Colors.offWhite
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
    OnChainSend: {
      screen: OnChainSendScreen,
      navigationOptions: {
        title: 'Send To',
        headerStyle:{
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }
    },
    PaymentDetailsScreen: {
      screen: PaymentDetailsScreen,
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
          backgroundColor:Colors.offWhite
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
          backgroundColor:Colors.backgroundColor
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
          backgroundColor:Colors.backgroundColor
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
