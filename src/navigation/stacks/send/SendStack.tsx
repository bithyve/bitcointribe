import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import SubAccountTFAHelpScreen from '../../../pages/Accounts/SubAccountTFAHelpScreen'
import AccountSendContainerScreen from '../../../pages/Accounts/Send/AccountSendContainerScreen'
import SentAmountForContactFormScreen from '../../../pages/Accounts/Send/SentAmountForContactFormScreen'


const SubAccountTFAHelpStack = createStackNavigator( {
  SubAccountTFAHelpRoot: {
    screen: SubAccountTFAHelpScreen,
    navigationOptions: {
      title: '2FA Help'
    },
  },
} )


const SendStack = createStackNavigator(
  {
    SendRoot: AccountSendContainerScreen,
    SentAmountForContactForm: {
      screen: SentAmountForContactFormScreen,
      navigationOptions: {
        title: 'Send To Contact'
      },
    },
    // SendConfirmation: {
    //   screen: SendConfirmationScreen,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    SubAccountTFAHelp: {
      screen: SubAccountTFAHelpStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'SendRoot',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
        },
      }
    },
  },
)

export default SendStack
