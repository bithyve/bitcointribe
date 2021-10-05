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
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import XPubDetailsScreen from '../../../pages/Accounts/AccountSettings/XPubDetailsScreen'
import { translations } from '../../../common/content/LocContext'

const strings  = translations[ 'stackTitle' ]

const SubAccountSettingsStack = createStackNavigator(
  {
    AccountSettingsMain: {
      screen: AccountSettingsMainScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: strings[ 'AccountSettings' ],
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      },
    },
    EditDisplayProperties: {
      screen: AccountSettingsEditDisplayPropertiesScreen,
      navigationOptions: {
        title: strings[ 'NameDescription' ],
      },
    },
    ReassignTransactionsMainOptions: {
      screen: ReassignTransactionsMainOptionsScreen,
      navigationOptions: {
        title: strings[ 'ReassignTransactions' ],
      },
    },
    SelectReassignableTransactions: {
      screen: SelectReassignableTransactionsScreen,
      navigationOptions: {
        title: strings[ 'ReassignTransactions' ],
      },
    },
    ReassignSubAccountSourcesSelectSources: {
      screen: ReassignSubAccountSourcesSelectSourcesScreen,
      navigationOptions: {
        title: strings[ 'ReassignSources' ],
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
    ShowXPub: {
      screen: XPubDetailsScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
          },
        }
      },
    },
    MergeAccounts: {
      screen: AccountSettingsMergeAccountShellsScreen,
      navigationOptions: {
        title: strings[ 'MergeAccounts' ],
      },
    },
    TransactionDetails: {
      screen: TransactionDetailsContainerScreen,
      navigationOptions: {
        title: strings[ 'TransactionDetails' ],
      },
    }
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
