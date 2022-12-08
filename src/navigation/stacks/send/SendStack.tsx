import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import AccountSendContainerScreen from '../../../pages/Accounts/Send/AccountSendContainerScreen'
import SentAmountForContactFormScreen from '../../../pages/Accounts/Send/SentAmountForContactFormScreen'
import AccountSendConfirmationContainerScreen from '../../../pages/Accounts/Send/AccountSendConfirmationContainerScreen'
import OTPAuthenticationScreen from '../../../pages/Accounts/Send/OTPAuthentication'
import { translations } from '../../../common/content/LocContext'
import NavHeaderNew from '../../../components/NavHeaderNew'

const strings  = translations[ 'stackTitle' ]

const name = {
  SendRoot: 'Send',
  SentAmountForContactForm: 'Send',
  SendConfirmation: 'Send',
  OTPAuthentication: 'Enter OTP to Authenticate'
}

const SendStack = createStackNavigator(
  {
    SendRoot:{
      screen: AccountSendContainerScreen,
      navigationOptions: {
        header: null,
      },
    },
    SentAmountForContactForm: {
      screen: SentAmountForContactFormScreen,
      navigationOptions: {
        header: null,
      },
    },
    SendConfirmation: {
      screen: AccountSendConfirmationContainerScreen,
      navigationOptions: {
        header: null,
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
        header: navigation.state.routeName === 'OTPAuthentication' ? null : () => {
          return <NavHeaderNew title={name[ navigation.state.routeName ]} onPress={() => { navigation.pop() }} />
        },
      }
    },
  },
)

export default SendStack
