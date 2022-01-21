import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { translations } from '../../../common/content/LocContext'
import LNAccountDetails from '../../../pages/zeusLN/AccountDetails'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'

const AccountDetailsStack = createStackNavigator(
  {
    AccountDetailsRoot: LNAccountDetails,
  },
  {
    initialRouteName: 'AccountDetailsRoot',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
        },
      }
    },
  }, )

export default AccountDetailsStack
