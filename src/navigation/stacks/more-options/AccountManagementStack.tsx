import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { translations } from '../../../common/content/LocContext'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import AccountManagementContainerScreen from '../../../pages/MoreOptions/AccountManagement/AccountManagementContainerScreen'
import EnterPasscodeScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/EnterPasscodeScreen'
import PanAccountSettingsContainerScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/PanAccountSettingsContainerScreen'
import SecurityQuestionScreen from '../../../pages/MoreOptions/AccountManagement/PanAccountSettings/SecurityQuestionScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'

const strings  = translations[ 'stackTitle' ]

const PanAccountSettingsStack = createNativeStackNavigator()
function PanAccountSettings() {
  return (
    <PanAccountSettingsStack.Navigator
      screenOptions={{
        ...defaultStackScreenNavigationOptions,
      }}
    >
      <PanAccountSettingsStack.Screen name="PanAccountSettingsRoot" component={PanAccountSettingsContainerScreen}
        options={{
          headerShown: false,
        }}
      />
      <PanAccountSettingsStack.Screen name="EnterPasscode" component={EnterPasscodeScreen}
        options={{
          headerShown: false,
        }}
      />
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


