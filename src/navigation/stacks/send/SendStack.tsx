import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import AccountSendContainerScreen from '../../../pages/Accounts/Send/AccountSendContainerScreen'
import SentAmountForContactFormScreen from '../../../pages/Accounts/Send/SentAmountForContactFormScreen'
import AccountSendConfirmationContainerScreen from '../../../pages/Accounts/Send/AccountSendConfirmationContainerScreen'
import OTPAuthenticationScreen from '../../../pages/Accounts/Send/OTPAuthentication'
import { translations } from '../../../common/content/LocContext'

const strings  = translations[ 'stackTitle' ]

const SendStack = createStackNavigator(
  {
    SendRoot: AccountSendContainerScreen,
    SentAmountForContactForm: {
      screen: SentAmountForContactFormScreen,
      navigationOptions: {
        title: 'Send To'
      },
    },
    SendConfirmation: {
      screen: AccountSendConfirmationContainerScreen,
      navigationOptions: {
        title: 'Send Confirmation',

      },
    },
    OTPAuthentication: {
      screen: OTPAuthenticationScreen,
      navigationOptions: {
        header: null,
      },
    }
  },
  {
    initialRouteName: 'SendRoot',
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

export default SendStack
