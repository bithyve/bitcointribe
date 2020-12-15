import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import XPubSourceKind from '../../../common/data/enums/XPubSourceKind'
import AccountSettingsEditDisplayPropertiesScreen from '../../../pages/Accounts/AccountSettings/AccountSettingsEditDisplayPropertiesScreen'
import AccountSettingsMainScreen from '../../../pages/Accounts/AccountSettings/AccountSettingsMainScreen'
import AccountSettingsEditVisibilityScreen from '../../../pages/Accounts/AccountSettings/EditVisibilityScreen'
import AccountSettingsMergeAccountShellsScreen from '../../../pages/Accounts/AccountSettings/MergeAccountShellsScreen'
import SelectReassignableTransactionsScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectReassignableTransactionsScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import ReassignTransactionsSelectDestinationScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectDestinationAccountScreen'
import ReassignSubAccountSourcesSelectSourcesScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/SelectSubAccountSourcesScreen'
import ReassignTransactionsMainOptionsScreen from '../../../pages/Accounts/AccountSettings/ReassignTransactions/MainOptionsScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'

const SubAccountSettingsStack = createStackNavigator(
  {
    AccountSettingsMain: {
      screen: AccountSettingsMainScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: 'Account Settings',
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      },
    },
    EditDisplayProperties: {
      screen: AccountSettingsEditDisplayPropertiesScreen,
      navigationOptions: {
        title: 'Name & Description',
      },
    },
    ReassignTransactionsMainOptions: {
      screen: ReassignTransactionsMainOptionsScreen,
      navigationOptions: {
        title: 'Reassign Transactions',
      },
    },
    SelectReassignableTransactions: {
      screen: SelectReassignableTransactionsScreen,
      navigationOptions: {
        title: 'Reassign Transactions',
      },
    },
    ReassignSubAccountSourcesSelectSources: {
      screen: ReassignSubAccountSourcesSelectSourcesScreen,
      navigationOptions: {
        title: 'Reassign Sources',
      },
    },
    ReassignTransactionsSelectDestination: {
      screen: ReassignTransactionsSelectDestinationScreen,
      navigationOptions: ( { navigation } ) => {
        const reassignmentKind = navigation.getParam( 'reassignmentKind' )
        const nameText = reassignmentKind === XPubSourceKind.DESIGNATED ? 'Sources' : 'Transactions'

        return {
          title: `Reassign ${nameText}`,
        }
      },
    },
    EditVisibility: {
      screen: AccountSettingsEditVisibilityScreen,
      navigationOptions: {
        title: 'Account Visibility',
      },
    },
    MergeAccounts: {
      screen: AccountSettingsMergeAccountShellsScreen,
      navigationOptions: {
        title: 'Merge Accounts',
      },
    },
  },
  {
    initialRouteName: 'AccountSettingsMain',
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

export default SubAccountSettingsStack
