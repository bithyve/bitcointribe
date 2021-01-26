import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import WalletSettingsContainerScreen from '../../../pages/MoreOptions/WalletSettings/WalletSettingsContainerScreen'
import ManagePasscodeScreen from '../../../pages/ManagePasscodeScreen'
import ChangeCurrencyScreen from '../../../pages/ChangeCurrencyScreen'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import VersionHistoryScreen from '../../../pages/VersionHistoryScreen'


const WalletSettingsStack = createStackNavigator(
  {
    WalletSettingsRoot: {
      screen: WalletSettingsContainerScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: 'Wallet Settings',
        }
      },
    },
    ManagePasscode: {
      screen: ManagePasscodeScreen,
      navigationOptions: {
        title: 'Manage Passcode',
      },
    },
    ChangeCurrency: {
      screen: ChangeCurrencyScreen,
      navigationOptions: {
        title: 'Change Currency',
      },
    },
    VersionHistory: {
      screen: VersionHistoryScreen,
      navigationOptions: {
        title: 'Version History',
      },
    },
  },
  {
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

export default WalletSettingsStack
