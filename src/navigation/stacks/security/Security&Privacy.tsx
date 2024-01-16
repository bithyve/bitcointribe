import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import Colors from '../../../common/Colors'
import RequestKeyFromContact from '../../../components/RequestKeyFromContact'
import GoogleAuthenticatorOTP from '../../../pages/Accounts/GoogleAuthenticatorOTP'
import NewTwoFASecret from '../../../pages/Accounts/NewTwoFASecret'
import Receive from '../../../pages/Accounts/Receive'
import SecureScan from '../../../pages/Accounts/SecureScan'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import TwoFASetup from '../../../pages/Accounts/TwoFASetup'
import TwoFASweepFunds from '../../../pages/Accounts/TwoFASweepFunds'
import TwoFAValidation from '../../../pages/Accounts/TwoFAValidation'
import AddContactAddressBook from '../../../pages/Contacts/AddContactAddressBook'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import SendRequest from '../../../pages/Contacts/SendRequest'
import ContactsListForAssociateContact from '../../../pages/CustodianRequest/ContactsListForAssociateContact'
import CustodianRequestAccepted from '../../../pages/CustodianRequest/CustodianRequestAccepted'
import CustodianRequestOTP from '../../../pages/CustodianRequest/CustodianRequestOTP'
import Intermediate from '../../../pages/Intermediate'
import Launch from '../../../pages/Launch'
import Login from '../../../pages/Login'
import BackupSeedWordsContent from '../../../pages/NewBHR/BackupSeedWordsContent'
import CloudBackupHistory from '../../../pages/NewBHR/CloudBackupHistory'
import FNFToKeeper from '../../../pages/NewBHR/FNFToKeeper'
import ManageBackupNewBHR from '../../../pages/NewBHR/ManageBackup'
import PersonalCopyHistoryNewBHR from '../../../pages/NewBHR/PersonalCopyHistory'
import QrAndLink from '../../../pages/NewBHR/QrAndLink'
import SecondaryDeviceHistoryNewBHR from '../../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import SecurityQuestionHistoryNewBHR from '../../../pages/NewBHR/SecurityQuestionHistory'
import SeedBackupHistory from '../../../pages/NewBHR/SeedBackupHistory'
import SetNewPassword from '../../../pages/NewBHR/SetNewPassword'
import TrustedContactHistoryNewBHR from '../../../pages/NewBHR/TrustedContactHistoryKeeper'
import TrustedContactNewBHR from '../../../pages/NewBHR/TrustedContacts'
import NewOwnQuestions from '../../../pages/NewOwnQuestions'
import NewWalletGenerationOTP from '../../../pages/RegenerateShare/NewWalletGenerationOTP'
import NewWalletNameRegenerateShare from '../../../pages/RegenerateShare/NewWalletNameRegenerateShare'
import NewWalletQuestionRegenerateShare from '../../../pages/RegenerateShare/NewWalletQuestionRegenerateShare'
import SweepFundsFromExistingAccount from '../../../pages/RegenerateShare/SweepFundsFromExistingAccount'
import WalletCreationSuccess from '../../../pages/RegenerateShare/WalletCreationSuccess'
import ReLogin from '../../../pages/ReLogin'
import RestoreSeedWordsContent from '../../../pages/RestoreHexaWithKeeper/RestoreSeedWordsContent'
import RestoreWithICloud from '../../../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import RestoreWithoutICloud from '../../../pages/RestoreHexaWithKeeper/RestoreWithoutICloud'
import ScanRecoveryKey from '../../../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import SettingGetNewPin from '../../../pages/SettingGetNewPin'
import SettingsContents from '../../../pages/SettingsContents'
import SweepConfirmation from '../../../pages/SweepFunds/SweepConfirmation'
import SweepFunds from '../../../pages/SweepFunds/SweepFunds'
import SweepFundsEnterAmount from '../../../pages/SweepFunds/SweepFundsEnterAmount'
import SweepFundUseExitKey from '../../../pages/SweepFunds/SweepFundUseExitKey'
import UpdateApp from '../../../pages/UpdateApp'
import ConfirmKeys from '../../../pages/UpgradeBackupWithKeeper/ConfirmKeys'
import UpgradeBackup from '../../../pages/UpgradeBackupWithKeeper/UpgradeBackup'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import QRStack from '../home/QRStack'

const Stack = createNativeStackNavigator()
const SecurityStack = ( { navigation, route } ) => {
  useLayoutEffect( () => {
    const routeName = getFocusedRouteNameFromRoute( route ) ?? 'ManageBackupNewBHR'
    if ( routeName === 'ManageBackupNewBHR' ){
      navigation.setOptions( {
        tabBarStyle: {
          display: 'flex', backgroundColor: Colors.darkBlue
        }
      } )
    }else {
      navigation.setOptions( {
        tabBarStyle: {
          display: 'none'
        }
      } )
    }
  }, [ navigation, route ] )
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, headerTitleAlign: 'center'
      }}
    >
      <Stack.Screen name="ManageBackupNewBHR" component={ManageBackupNewBHR} />
      <Stack.Screen name="Launch" component={Launch} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gestureEnabled: false
      }} />
      <Stack.Screen name="Intermediate" component={Intermediate} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsStack} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} />
      <Stack.Screen name="QRScanner" component={QRStack} />
      <Stack.Screen name="CustodianRequestOTP" component={CustodianRequestOTP} />
      <Stack.Screen name="CustodianRequestAccepted" component={CustodianRequestAccepted} />
      <Stack.Screen name="SweepFundsFromExistingAccount" component={SweepFundsFromExistingAccount} />
      <Stack.Screen name="NewWalletNameRegenerateShare" component={NewWalletNameRegenerateShare} />
      <Stack.Screen name="NewWalletQuestionRegenerateShare" component={NewWalletQuestionRegenerateShare} />
      <Stack.Screen name="NewWalletGenerationOTP" component={NewWalletGenerationOTP} />
      <Stack.Screen name="WalletCreationSuccess" component={WalletCreationSuccess} />
      <Stack.Screen name="SecureScan" component={SecureScan} />
      <Stack.Screen name="GoogleAuthenticatorOTP" component={GoogleAuthenticatorOTP} />
      <Stack.Screen name="SecondaryDeviceHistoryNewBHR" component={SecondaryDeviceHistoryNewBHR} />
      <Stack.Screen name="SettingGetNewPin" component={SettingGetNewPin} />
      <Stack.Screen name="ContactsListForAssociateContact" component={ContactsListForAssociateContact} />
      <Stack.Screen name="NewTwoFASecret" component={NewTwoFASecret} />
      <Stack.Screen name="TwoFASweepFunds" component={TwoFASweepFunds} />
      <Stack.Screen name="SendRequest" component={SendRequest} />
      <Stack.Screen name="AddContactSendRequest" component={AddContactSendRequest} />
      <Stack.Screen name="QrAndLink" component={QrAndLink} />
      <Stack.Screen name="ContactDetails" component={ContactDetails} />
      <Stack.Screen name="Receive" component={Receive} />
      <Stack.Screen name="ManageBackupNewBHR" component={ManageBackupNewBHR} />
      <Stack.Screen name="SecurityQuestionHistoryNewBHR" component={SecurityQuestionHistoryNewBHR} />
      <Stack.Screen name="TrustedContactHistoryNewBHR" component={TrustedContactHistoryNewBHR} />
      <Stack.Screen name="FNFToKeeper" component={FNFToKeeper} />
      <Stack.Screen name="AddContact" component={AddContactAddressBook} />
      <Stack.Screen name="PersonalCopyHistoryNewBHR" component={PersonalCopyHistoryNewBHR} />
      <Stack.Screen name="NewOwnQuestions" component={NewOwnQuestions} />
      <Stack.Screen name="RestoreWithICloud" component={RestoreWithICloud} />
      <Stack.Screen name="RestoreWithoutICloud" component={RestoreWithoutICloud} />
      <Stack.Screen name="SettingsContents" component={SettingsContents} />
      <Stack.Screen name="SweepFunds" component={SweepFunds} />
      <Stack.Screen name="SweepFundsEnterAmount" component={SweepFundsEnterAmount} />
      <Stack.Screen name="SweepFundUseExitKey" component={SweepFundUseExitKey} />
      <Stack.Screen name="SweepConfirmation" component={SweepConfirmation} />
      <Stack.Screen name="ScanRecoveryKey" component={ScanRecoveryKey} />
      <Stack.Screen name="UpgradeBackup" component={UpgradeBackup} />
      <Stack.Screen name="ConfirmKeys" component={ConfirmKeys} />
      <Stack.Screen name="TwoFAValidation" component={TwoFAValidation} />
      <Stack.Screen name="BackupSeedWordsContent" component={BackupSeedWordsContent} />
      <Stack.Screen name="RestoreSeedWordsContent" component={RestoreSeedWordsContent} />
      <Stack.Screen name="TwoFASetup" component={TwoFASetup} options={{
        gestureEnabled: false
      }} />
      <Stack.Screen name="UpdateApp" component={UpdateApp} options={{
        gestureEnabled: false
      }} />
      <Stack.Screen name="RequestKeyFromContact" component={RequestKeyFromContact} />
      <Stack.Screen name="TrustedContactNewBHR" component={TrustedContactNewBHR} />
      <Stack.Screen name="SetNewPassword" component={SetNewPassword} />
      <Stack.Screen name="CloudBackupHistory" component={CloudBackupHistory} />
      <Stack.Screen name="SeedBackupHistory" component={SeedBackupHistory} />
    </Stack.Navigator>
  )
}

export default SecurityStack
