import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import MoreOptionsContainerScreen from '../../../pages/MoreOptions/MoreOptionsContainerScreen'
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import FundingSourcesScreen from '../../../pages/FundingSources/FundingSourcesContainerScreen'
import FundingSourceDetailsScreen from '../../../pages/FundingSources/FundingSourceDetailsScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import WalletSettingsStack from './WalletSettingsStack'
import AccountManagementStack from './AccountManagementStack'


const MoreOptionsStack = createStackNavigator(
  {
    MoreOptionsRoot: {
      screen: MoreOptionsContainerScreen,
      navigationOptions: ( { navigation } ) => {
        return {
          title: 'More',
          headerLeft: () => {
            return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
          },
        }
      },
    },
    AccountManagement: {
      screen: AccountManagementStack,
      navigationOptions: {
        header: null,
      },
    },
    FriendsAndFamily: {
      screen: FriendsAndFamilyScreen,
      navigationOptions: {
        title: 'Friends and Family',
      },
    },
    FundingSources: {
      screen: FundingSourcesScreen,
      navigationOptions: {
        header: null,
      },
    },
    FundingSourceDetails: {
      screen: FundingSourceDetailsScreen,
    },
    WalletSettings: {
      screen: WalletSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'MoreOptionsRoot',
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


export default MoreOptionsStack
