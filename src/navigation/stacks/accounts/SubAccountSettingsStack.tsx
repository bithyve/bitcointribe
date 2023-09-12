import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AccountSettingsEditDisplayPropertiesScreen from '../../../pages/Accounts/AccountSettings/AccountSettingsEditDisplayPropertiesScreen'
import AccountSettingsMainScreen from '../../../pages/Accounts/AccountSettings/AccountSettingsMainScreen'
import AccountSettingsEditVisibilityScreen from '../../../pages/Accounts/AccountSettings/EditVisibilityScreen'
import AccountSettingsMergeAccountShellsScreen from '../../../pages/Accounts/AccountSettings/MergeAccountShellsScreen'
import SelectReassignableTransactionsScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectReassignableTransactionsScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import ReassignTransactionsSelectDestinationScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectDestinationAccountScreen'
import ReassignSubAccountSourcesSelectSourcesScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectSubAccountSourcesScreen'
import ReassignTransactionsMainOptionsScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/MainOptionsScreen'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import XPubDetailsScreen from '../../../pages/Accounts/AccountSettings/XPubDetailsScreen'
import { translations } from '../../../common/content/LocContext'
import CheckPasscodeComponent from '../../../pages/NewBHR/CheckPasscodeComponent'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'
import ValidateBorderWalletPattern from '../../../pages/borderwallet/ValidateBorderWalletPattern'
import ValidateBorderWalletChecksum from '../../../pages/borderwallet/ValidateBorderWalletChecksum'
import BackupGridMnemonic from '../../../pages/borderwallet/BackupGridMnemonic'

const strings  = translations[ 'stackTitle' ]

const Stack = createNativeStackNavigator();
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
        options={
          ({navigation}) => ({
              title: strings[ 'AccountSettings' ],
              headerLeft: () => {
                return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
              }
            })
        }
      />
      <Stack.Screen 
        name="EditDisplayProperties"
        component={AccountSettingsEditDisplayPropertiesScreen}
        options={{
          title: strings[ 'NameDescription' ],
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
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ValidateBorderWalletChecksum"
        component={ValidateBorderWalletChecksum}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ValidateBorderWalletPattern"
        component={ValidateBorderWalletPattern}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PreviewPattern"
        component={PreviewPattern}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CheckPasscode"
        component={CheckPasscodeComponent}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ReassignTransactionsSelectDestination"
        component={ReassignTransactionsSelectDestinationScreen}
      />
      <Stack.Screen 
        name="EditVisibility"
        component={AccountSettingsEditVisibilityScreen}
        options={{ title: 'Account Visibility' }}
      />
      <Stack.Screen 
        name="ShowXPub"
        component={XPubDetailsScreen}
        options={( { navigation } ) => {
          return {
            ...defaultStackScreenNavigationOptions,
            headerLeft: () => {
              return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
            },
          }
        }}
      />
    </Stack.Navigator>
  )
}

export default SubAccountSettingsStack
