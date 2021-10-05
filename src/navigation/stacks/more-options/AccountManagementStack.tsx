import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import AccountManagementContainerScreen from '../../../pages/MoreOptions/AccountManagement/AccountManagementContainerScreen'
import PanAccountSettingsContainerScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/PanAccountSettingsContainerScreen'
import NavHeaderSettingsButton from '../../../components/navigation/NavHeaderSettingsButton'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import EnterPasscodeScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/EnterPasscodeScreen'
import SecurityQuestionScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/SecurityQuestionScreen'
import { translations } from '../../../common/content/LocContext'

const strings  = translations[ 'stackTitle' ]

const PanAccountSettingsStack = createStackNavigator(
  {
    PanAccountSettingsRoot: {
      screen: PanAccountSettingsContainerScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: strings[ 'AccountSettings' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      },
    },
    EnterPasscode: {
      screen: EnterPasscodeScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: strings[ 'ShowAllAccounts' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      },
    },
    SecurityQuestion: {
      screen: SecurityQuestionScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: strings[ 'ShowAllAccounts' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      },
    },
  },
  {
    defaultNavigationOptions: () => {
      return {
        ...defaultStackScreenNavigationOptions,
      }
    },
  },
)


const AccountManagementStack = createStackNavigator(
  {
    AccountManagementRoot: {
      screen: AccountManagementContainerScreen,
      navigationOptions: {
        header: null,
      },
      // navigationOptions: ( { navigation } ) => {
      //   return {
      //     title: 'Account Management',
      //     headerLeft: () => {
      //       return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
      //     },
      //     headerRight: () => {
      //       //
      //       // 📝 Hiding this button for now until we have supporting functionality.
      //       // (See: https://github.com/bithyve/hexa/issues/2454)
      //       //

      //       return (
      //         <NavHeaderSettingsButton
      //           onPress={() => { navigation.navigate( 'PanAccountSettings' ) }}
      //         />
      //       )
      //     },
      //   }
      // },
    },
    PanAccountSettings: {
      screen: PanAccountSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    // mode: 'modal',
    defaultNavigationOptions: () => {
      return {
        ...defaultStackScreenNavigationOptions,
      }
    },
  },
)

export default AccountManagementStack
