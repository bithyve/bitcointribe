import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import NewAccountSelectionContainerScreen from '../../../pages/Accounts/AddNew/NewAccountSelectionContainerScreen'
import NewHexaAccountDetailsScreen from '../../../pages/Accounts/AddNew/HexaAccount/NewHexaAccountDetailsScreen'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import AddNewDonationAccountDetailsScreen from '../../../pages/Accounts/AddNew/DonationAccount/AddNewDonationAccountDetailsScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import NavStyles from '../../../common/Styles/NavStyles'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import NewSwanAccountDetailsScreen from '../../../pages/Accounts/AddNew/SwanAccount/NewSwanAccountDetailsScreen'
import NewRampAccountDetailsScreen from '../../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import { translations } from '../../../common/content/LocContext'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import EnterNodeConfig from '../../../pages/lightningAccount/EnterNodeConfigScreen'
import ScanNodeConfig from '../../../pages/lightningAccount/ScanNodeConfigScreen'

const strings  = translations[ 'stackTitle' ]

const AddNewAccountStack = createStackNavigator(
  {
    AccountSelectionList: {
      screen: NewAccountSelectionContainerScreen,
      navigationOptions: {
        header: null
      }
    },
    NewHexaAccountDetails: {
      screen: NewHexaAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup New Account'
      }
    },

    NewWyreAccountDetails: {
      screen: NewWyreAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Wyre Account'
      }
    },

    AccountDetails: {
      screen: AccountDetailsStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },

    NewRampAccountDetails: {
      screen: NewRampAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Ramp Account'
      }
    },


    NewSwanAccountDetails: {
      screen: NewSwanAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Swan Account'
      }
    },
    AddNewDonationAccountDetails: {
      screen: AddNewDonationAccountDetailsScreen,
      navigationOptions: {
        header: null,
        // title: 'Setup Donation Account'
      }
    },

    EnterNodeConfig: {
      screen: EnterNodeConfig,
      navigationOptions: {
        header: null
      }
    },

    ScanNodeConfig: {
      screen: ScanNodeConfig,
      navigationOptions: {
        header: null
      }
    },
  },
  {
    initialRouteName: 'AccountSelectionList',
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

export default AddNewAccountStack
