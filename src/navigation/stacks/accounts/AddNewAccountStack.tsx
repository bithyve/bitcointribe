import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import NewAccountSelectionContainerScreen from '../../../pages/Accounts/AddNew/NewAccountSelectionContainerScreen'
import NewHexaAccountDetailsScreen from '../../../pages/Accounts/AddNew/HexaAccount/NewHexaAccountDetailsScreen'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import AddNewDonationAccountDetailsScreen from '../../../pages/Accounts/AddNew/DonationAccount/AddNewDonationAccountDetailsScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import { View, Text } from 'react-native'
import NavStyles from '../../../common/Styles/NavStyles'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import WyreOrderFormScreen from '../../../pages/WyreIntegration/WyreOrderFormScreen'


const AddNewAccountStack = createStackNavigator(
  {
    AccountSelectionList: {
      screen: NewAccountSelectionContainerScreen,
      navigationOptions: ( ) => {
        return {
          headerStyle: {
            borderBottomWidth: 0,
          },
          headerTitle: () => {
            return <View style={{
              width: 1000, // Sort of a hack to get the subtitle all on one line (See: https://github.com/bithyve/hexa/issues/2391)
            }}>
              <Text style={NavStyles.modalHeaderTitleText}>Add New Account</Text>
              <Text style={NavStyles.modalHeaderSubtitleText}>Add an account, add a service, or import a wallet</Text>
            </View>
          },
          headerRight: null,
          headerRightContainerStyle: {
            backgroundColor: 'red',
          }
        }
      },
    },
    NewHexaAccountDetails: {
      screen: NewHexaAccountDetailsScreen,
      navigationOptions: {
        title: 'Account Details'
      }
    },
    NewWyreAccountDetails: {
      screen: NewWyreAccountDetailsScreen,
      navigationOptions: {
        title: 'Account Details'
      }
    },

    AddNewDonationAccountDetails: {
      screen: AddNewDonationAccountDetailsScreen,
      navigationOptions: {
        title: 'Account Details'
      }
    },
  },
  {
    initialRouteName: 'AccountSelectionList',
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

export default AddNewAccountStack
