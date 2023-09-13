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

const Stack = createNativeStackNavigator()
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
      <Stack.Screen name="SeedBackupHistory" component={SeedBackupHistory} options={{
        headerShown: false
      }} />
      <Stack.Screen name="WalletBackup" component={WalletBackup} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SecondaryDeviceHistoryNewBHR" component={SecondaryDeviceHistoryNewBHR} />
      <Stack.Screen name="TrustedContactHistoryNewBHR" component={TrustedContactHistoryNewBHR} />
      <Stack.Screen name="RestoreSeedWordsContent" component={RestoreSeedWordsContent} />
      <Stack.Screen name="BackupSeedWordsContent" component={BackupSeedWordsContent} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="TrustedContactNewBHR" component={TrustedContactNewBHR} />
      <Stack.Screen name="SetNewPassword" component={SetNewPassword} options={{
        headerShown: false
      }} />
      <Stack.Screen name="CloudBackupHistory" component={CloudBackupHistory} options={{
        headerShown: false
      }} />
      <Stack.Screen name="PersonalCopyHistoryNewBHR" component={PersonalCopyHistoryNewBHR}  />
      <Stack.Screen name="SecurityQuestionHistoryNewBHR" component={SecurityQuestionHistoryNewBHR}  />
      <Stack.Screen name="AccountSend" component={AccountSendContainerScreen}  />
      <Stack.Screen name="TwoFAValidation" component={TwoFAValidation}  />
      <Stack.Screen name="TwoFASetup" component={TwoFASetup} options={{
        headerShown: false,
        gestureEnabled:false
      }} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsStack} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="SentAmountForContactForm" component={SentAmountForContactFormScreen} options={{
        title: 'Send To'
      }} />
      <Stack.Screen name="SendConfirmation" component={AccountSendConfirmationContainerScreen} options={{
        title: 'Send Confirmation',
      }} />
      <Stack.Screen name="OTPAuthentication" component={OTPAuthenticationScreen} options={{
        headerShown: false,
      }} />
      <Stack.Screen name="CheckPasscode" component={CheckPasscodeComponent} options={{
        headerShown: false,
      }} />
    </Stack.Navigator>
  )
}

export default WalletBackupStack
