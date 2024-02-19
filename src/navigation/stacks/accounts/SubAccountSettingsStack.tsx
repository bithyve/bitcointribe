import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { translations } from '../../../common/content/LocContext'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import AccountSettingsEditDisplayPropertiesScreen from '../../../pages/Accounts/AccountSettings/AccountSettingsEditDisplayPropertiesScreen'
import AccountSettingsMainScreen from '../../../pages/Accounts/AccountSettings/AccountSettingsMainScreen'
import AccountSettingsEditVisibilityScreen from '../../../pages/Accounts/AccountSettings/EditVisibilityScreen'
import AccountSettingsMergeAccountShellsScreen from '../../../pages/Accounts/AccountSettings/MergeAccountShellsScreen'
import ReassignTransactionsMainOptionsScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/MainOptionsScreen'
import ReassignTransactionsSelectDestinationScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectDestinationAccountScreen'
import SelectReassignableTransactionsScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectReassignableTransactionsScreen'
import ReassignSubAccountSourcesSelectSourcesScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectSubAccountSourcesScreen'
import XPubDetailsScreen from '../../../pages/Accounts/AccountSettings/XPubDetailsScreen'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import BackupGridMnemonic from '../../../pages/borderwallet/BackupGridMnemonic'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'
import ValidateBorderWalletChecksum from '../../../pages/borderwallet/ValidateBorderWalletChecksum'
import ValidateBorderWalletPattern from '../../../pages/borderwallet/ValidateBorderWalletPattern'
import CheckPasscodeComponent from '../../../pages/NewBHR/CheckPasscodeComponent'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'

const strings  = translations[ 'stackTitle' ]

const Stack = createNativeStackNavigator()
const SubAccountSettingsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName= 'AccountSettingsMain'
      screenOptions={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
          },
        }
      }}
    >
      <Stack.Screen
        name="AccountSettingsMain"
        component={AccountSettingsMainScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="EditDisplayProperties"
        component={AccountSettingsEditDisplayPropertiesScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ReassignTransactionsMainOptions"
        component={ReassignTransactionsMainOptionsScreen}
        options={{
          title: strings[ 'ReassignTransactions' ],
        }}
      />
      <Stack.Screen
        name="SelectReassignableTransactions"
        component={SelectReassignableTransactionsScreen}
        options={{
          title: strings[ 'ReassignTransactions' ],
        }}
      />
      <Stack.Screen
        name="ReassignSubAccountSourcesSelectSources"
        component={ReassignSubAccountSourcesSelectSourcesScreen}
        options={{
          title: strings[ 'ReassignSources' ],
        }}
      />
      <Stack.Screen
        name="MergeAccounts"
        component={AccountSettingsMergeAccountShellsScreen}
        options={{
          title: strings[ 'MergeAccounts' ],
        }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsContainerScreen}
        options={{
          title: strings[ 'TransactionDetails' ],
        }}
      />
      <Stack.Screen
        name="BackupGridMnemonic"
        component={BackupGridMnemonic}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ValidateBorderWalletChecksum"
        component={ValidateBorderWalletChecksum}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ValidateBorderWalletPattern"
        component={ValidateBorderWalletPattern}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="PreviewPattern"
        component={PreviewPattern}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="CheckPasscode"
        component={CheckPasscodeComponent}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ReassignTransactionsSelectDestination"
        component={ReassignTransactionsSelectDestinationScreen}
      />
      <Stack.Screen
        name="EditVisibility"
        component={AccountSettingsEditVisibilityScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ShowXPub"
        component={XPubDetailsScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  )
}

export default SubAccountSettingsStack
