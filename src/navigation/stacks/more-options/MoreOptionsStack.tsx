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
import NodeSettingsContainerScreen from '../../../pages/MoreOptions/NodeSettings/NodeSettingsContainerScreen'
import Header from '../Header'
import QRStack from '../home/QRStack'


const MoreOptionsStack = createStackNavigator(
  {
    MoreOptionsRoot: {
      screen: MoreOptionsContainerScreen,
      navigationOptions: {
        header: null,
        // tabBarVisibl
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
    NodeSettings: {
      screen: NodeSettingsContainerScreen,
      navigationOptions: {
        title: 'Node Settings',
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
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'MoreOptionsRoot',
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      console.log( 'navigation.state.index>>>>>>>>', navigation.state.index )

      if ( navigation.state.index === 0 ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    },
    // defaultNavigationOptions: ( { navigation } ) => {
    //   return {
    //     ...defaultStackScreenNavigationOptions,
    //     headerLeft: () => {
    //       return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
    //     },
    //   }
    // },
  },
)


export default MoreOptionsStack
