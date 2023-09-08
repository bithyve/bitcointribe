import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { translations } from '../../../common/content/LocContext'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import WalletBackup from '../../../pages/MoreOptions/WalletBackup'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import SecondaryDeviceHistoryNewBHR from '../../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import TrustedContactHistoryNewBHR from '../../../pages/NewBHR/TrustedContactHistoryKeeper'
import PersonalCopyHistoryNewBHR from '../../../pages/NewBHR/PersonalCopyHistory'
import CloudBackupHistory from '../../../pages/NewBHR/CloudBackupHistory'
import SeedBackupHistory from '../../../pages/NewBHR/SeedBackupHistory'
import TrustedContactNewBHR from '../../../pages/NewBHR/TrustedContacts'
import BackupSeedWordsContent from '../../../pages/NewBHR/BackupSeedWordsContent'
import RestoreSeedWordsContent from '../../../pages/RestoreHexaWithKeeper/RestoreSeedWordsContent'
import SecurityQuestionHistoryNewBHR from '../../../pages/NewBHR/SecurityQuestionHistory'
import SetNewPassword from '../../../pages/NewBHR/SetNewPassword'
import AccountSendContainerScreen from '../../../pages/Accounts/Send/AccountSendContainerScreen'
import TwoFASetup from '../../../pages/Accounts/TwoFASetup'
import TwoFAValidation from '../../../pages/Accounts/TwoFAValidation'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import SentAmountForContactFormScreen from '../../../pages/Accounts/Send/SentAmountForContactFormScreen'
import AccountSendConfirmationContainerScreen from '../../../pages/Accounts/Send/AccountSendConfirmationContainerScreen'
import OTPAuthenticationScreen from '../../../pages/Accounts/Send/OTPAuthentication'
import CheckPasscodeComponent from '../../../pages/NewBHR/CheckPasscodeComponent'

const Stack = createNativeStackNavigator();
const WalletBackupStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='SeedBackupHistory'
      screenOptions={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.goBack() }} />
          },
        }
      }}
    >
      <Stack.Screen name="SeedBackupHistory" component={SeedBackupHistory} options={{ header: null }} />
    </Stack.Navigator>
  )
}

// TODO: 
// const WalletBackupStack = createStackNavigator(
//   {
//     SeedBackupHistory: {
//       screen: SeedBackupHistory,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     WalletBackup: {
//       screen: WalletBackup,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     SecondaryDeviceHistoryNewBHR,
//     TrustedContactHistoryNewBHR,
//     RestoreSeedWordsContent,
//     BackupSeedWordsContent: {
//       screen: BackupSeedWordsContent,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     TrustedContactNewBHR,
//     SetNewPassword: {
//       screen: SetNewPassword,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     CloudBackupHistory: {
//       screen: CloudBackupHistory,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     PersonalCopyHistoryNewBHR,
//     SecurityQuestionHistoryNewBHR,
//     AccountSend: {
//       screen: AccountSendContainerScreen,
//     },
//     TwoFAValidation,
//     TwoFASetup: {
//       screen: TwoFASetup,
//       navigationOptions: {
//         gesturesEnabled: false,
//         header: null
//       },
//     },
//     AccountDetails: {
//       screen: AccountDetailsStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     SentAmountForContactForm: {
//       screen: SentAmountForContactFormScreen,
//       navigationOptions: {
//         title: 'Send To'
//       },
//     },
//     SendConfirmation: {
//       screen: AccountSendConfirmationContainerScreen,
//       navigationOptions: {
//         title: 'Send Confirmation',

//       },
//     },
//     OTPAuthentication: {
//       screen: OTPAuthenticationScreen,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     CheckPasscode:{
//       screen: CheckPasscodeComponent,
//       navigationOptions:{
//         header:null
//       }
//     }
//   },
//   {
//     initialRouteName: 'SeedBackupHistory',
//     defaultNavigationOptions: ( { navigation } ) => {
//       return {
//         ...defaultStackScreenNavigationOptions,
//         headerLeft: () => {
//           return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
//         },
//       }
//     },
//   },
// )

export default WalletBackupStack
