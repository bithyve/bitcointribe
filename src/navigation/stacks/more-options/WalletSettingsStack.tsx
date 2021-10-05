import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import WalletSettingsContainerScreen from '../../../pages/MoreOptions/WalletSettings/WalletSettingsContainerScreen'
import ManagePasscodeScreen from '../../../pages/ManagePasscodeScreen'
import ChangeCurrencyScreen from '../../../pages/ChangeCurrencyScreen'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import VersionHistoryScreen from '../../../pages/VersionHistoryScreen'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import ReLogin from '../../../pages/ReLogin'
import SettingGetNewPin from '../../../pages/SettingGetNewPin'
import { translations } from '../../../common/content/LocContext'

const strings  = translations[ 'stackTitle' ]

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
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    // VersionHistory: {
    //   screen: VersionHistoryScreen,
    //   navigationOptions: {
    //     title: 'Version History',
    //   },
    // },
    TransactionDetails: {
      screen: TransactionDetailsContainerScreen,
      navigationOptions: {
        title: 'Transaction Details',
      },
    },
    SettingGetNewPin: {
      screen: SettingGetNewPin,
      navigationOptions: {
        title: 'Manage Passcode',
      },
    },
  },
  {
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => {
            navigation.popToTop() }} />
        },
      }
    },
  },
)

export default WalletSettingsStack
