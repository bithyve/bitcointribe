import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
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

const Stack = createNativeStackNavigator()
const AccountDetailsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='AccountDetailsRoot'
      screenOptions={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      }}
    >
      <Stack.Screen name="AccountDetailsRoot" component={LNAccountDetails}/>
      <Stack.Screen name="ViewAll" component={ViewAllScreen}/>
      <Stack.Screen name="ReceiveCoin" component={ReceiveCoinScreen} options={{
        title: '',
        headerShadowVisible: false
      }}/>
      <Stack.Screen name="ScanOpenChannel" component={ScanOpenChannel} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="NodeInfoScreen" component={NodeInfoScreen} options={{
        title: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.offWhite
        }
      }}/>
      <Stack.Screen name="Payments" component={PaymentsScreen} options={{
        title: '',
        headerShadowVisible: false
      }} />
      <Stack.Screen name="AccountSettings" component={SubAccountSettingsStack} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="OnChainSend" component={OnChainSendScreen} options={{
        title: 'Send To',
        headerShadowVisible: false
      }}/>
      <Stack.Screen name="PaymentDetailsScreen" component={PaymentDetailsScreen} options={{
        title: '',
        headerShadowVisible: false
      }}/>
      <Stack.Screen name="PayInvoice" component={PayInvoiceScreen} options={{
        title: '',
        headerShadowVisible: false
      }}/>
      <Stack.Screen name="SendScreen" component={SendScreen} options={{
        title: '',
        headerShadowVisible: false
      }}/>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{
        title: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.offWhite
        }
      }}/>
      <Stack.Screen name="ChannelsListScreen" component={ChannelsListScreen} options={{
        title: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.backgroundColor
        }
      }}/>
      <Stack.Screen name="ChannelInfoScreen" component={ChannelInfoScreen} options={{
        title: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.backgroundColor
        }
      }}/>
      <Stack.Screen name="InvoiceDetailsScreen" component={InvoiceDetailsScreen} options={{
        title: '',
        headerShadowVisible: false
      }}/>
      <Stack.Screen name="TransactionDetailsScreen" component={TransactionDetailsScreen} options={{
        title: '',
        headerShadowVisible: false
      }}/>
      <Stack.Screen name="ChannelOpenScreen" component={ChannelOpenScreen} options={{
        headerShown: false
      }}/>
    </Stack.Navigator>
  )
}

export default AccountDetailsStack
