import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import AccountManagementContainerScreen from '../../../pages/MoreOptions/AccountManagement/AccountManagementContainerScreen'
import PanAccountSettingsContainerScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/PanAccountSettingsContainerScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import EnterPasscodeScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/EnterPasscodeScreen'
import SecurityQuestionScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/SecurityQuestionScreen'
import { translations } from '../../../common/content/LocContext'

const strings  = translations[ 'stackTitle' ]

const PanAccountSettingsStack = createNativeStackNavigator()
function PanAccountSettings() {
  return (
    <PanAccountSettingsStack.Navigator
      screenOptions={{
        ...defaultStackScreenNavigationOptions,
      }}
    >
      <PanAccountSettingsStack.Screen name="PanAccountSettingsRoot" component={PanAccountSettingsContainerScreen} options={( { navigation } ) => {
        return {
          title: strings[ 'AccountSettings' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
      <PanAccountSettingsStack.Screen name="EnterPasscode" component={EnterPasscodeScreen} options={( { navigation } ) => {
        return {
          title: strings[ 'ShowAllAccounts' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
      <PanAccountSettingsStack.Screen name="SecurityQuestion" component={SecurityQuestionScreen} options={( { navigation } ) => {
        return {
          title: strings[ 'ShowAllAccounts' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.goBack() }} />
          },
        }
      }} />
    </PanAccountSettingsStack.Navigator>
  )
}

const AccountManagementStack = createNativeStackNavigator()
export default function  AccountManagement() {
  return (
    <AccountManagementStack.Navigator
      initialRouteName='Home'
      screenOptions={{
        ...defaultStackScreenNavigationOptions,
      }}
    >
      <AccountManagementStack.Screen name="AccountManagementRoot" component={AccountManagementContainerScreen} options={{
        headerShown: false,
      }} />
      <AccountManagementStack.Screen name="PanAccountSettings" component={PanAccountSettings} options={{
        headerShown: false,
      }} />
    </AccountManagementStack.Navigator>
  )
}


