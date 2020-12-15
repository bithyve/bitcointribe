import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
// import SendToContactScreen from '../../../pages/Accounts/Send/_Old_SendToContact';
import SendConfirmationScreen from '../../../pages/Accounts/Send/_Old_SendConfirmation'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import SubAccountTFAHelpScreen from '../../../pages/Accounts/SubAccountTFAHelpScreen'
import AccountSendContainerScreen from '../../../pages/Accounts/Send/AccountSendContainerScreen'


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
    SendToContact: {
      screen: SendToContactScreen,
      navigationOptions: {
        header: null,
      },
    },
    SendConfirmation: {
      screen: SendConfirmationScreen,
      navigationOptions: {
        header: null,
      },
    },
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
