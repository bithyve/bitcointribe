import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import Colors from '../../../common/Colors'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import NewRampAccountDetailsScreen from '../../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import GoogleAuthenticatorOTP from '../../../pages/Accounts/GoogleAuthenticatorOTP'
import NewTwoFASecret from '../../../pages/Accounts/NewTwoFASecret'
import Receive from '../../../pages/Accounts/Receive'
import SecureScan from '../../../pages/Accounts/SecureScan'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import TwoFASetup from '../../../pages/Accounts/TwoFASetup'
import TwoFASweepFunds from '../../../pages/Accounts/TwoFASweepFunds'
import TwoFAValidation from '../../../pages/Accounts/TwoFAValidation'
import BorderWalletGridScreen from '../../../pages/borderwallet/BorderWalletGridScreen'
import ConfirmDownload from '../../../pages/borderwallet/ConfirmDownload'
import CreatePassPhrase from '../../../pages/borderwallet/CreatePassPhrase'
import CreateWithBorderWallet from '../../../pages/borderwallet/CreateWithBorderWallet'
import DownloadEncryptGrid from '../../../pages/borderwallet/DownloadEncryptGrid'
import ImportBorderWallet from '../../../pages/borderwallet/ImportBorderWallet'
import ImportBWGrid from '../../../pages/borderwallet/ImportBWGrid'
import ImportWalletPassphrase from '../../../pages/borderwallet/ImportWalletPassphrase'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'
import RecoverBorderWallet from '../../../pages/borderwallet/RecoverBorderWallet'
import SelectChecksumWord from '../../../pages/borderwallet/SelectChecksumWord'
import SelectEntropyGridType from '../../../pages/borderwallet/SelectEntropyGridType'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import SendRequest from '../../../pages/Contacts/SendRequest'
import ContactsListForAssociateContact from '../../../pages/CustodianRequest/ContactsListForAssociateContact'
import CustodianRequestAccepted from '../../../pages/CustodianRequest/CustodianRequestAccepted'
import CustodianRequestOTP from '../../../pages/CustodianRequest/CustodianRequestOTP'
import PairNewWallet from '../../../pages/FastBitcoin/PairNewWallet'
import VoucherScanner from '../../../pages/FastBitcoin/VoucherScanner'
import Home from '../../../pages/Home/Home'
import Intermediate from '../../../pages/Intermediate'
import Launch from '../../../pages/Launch'
import EnterNodeConfig from '../../../pages/lightningAccount/EnterNodeConfigScreen'
import ScanNodeConfig from '../../../pages/lightningAccount/ScanNodeConfigScreen'
import Login from '../../../pages/Login'
import WalletBackup from '../../../pages/MoreOptions/WalletBackup'
import BackupSeedWordsContent from '../../../pages/NewBHR/BackupSeedWordsContent'
import ManageBackupNewBHR from '../../../pages/NewBHR/ManageBackup'
import PersonalCopyHistoryNewBHR from '../../../pages/NewBHR/PersonalCopyHistory'
import QrAndLink from '../../../pages/NewBHR/QrAndLink'
import SecondaryDeviceHistoryNewBHR from '../../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import SecurityQuestionHistoryNewBHR from '../../../pages/NewBHR/SecurityQuestionHistory'
import SeedBackupHistory from '../../../pages/NewBHR/SeedBackupHistory'
import TrustedContactHistoryNewBHR from '../../../pages/NewBHR/TrustedContactHistoryKeeper'
import NewOwnQuestions from '../../../pages/NewOwnQuestions'
import RampOrderFormScreen from '../../../pages/RampIntegration/RampOrderFormScreen'
import NewWalletGenerationOTP from '../../../pages/RegenerateShare/NewWalletGenerationOTP'
import NewWalletNameRegenerateShare from '../../../pages/RegenerateShare/NewWalletNameRegenerateShare'
import NewWalletQuestionRegenerateShare from '../../../pages/RegenerateShare/NewWalletQuestionRegenerateShare'
import SweepFundsFromExistingAccount from '../../../pages/RegenerateShare/SweepFundsFromExistingAccount'
import WalletCreationSuccess from '../../../pages/RegenerateShare/WalletCreationSuccess'
import ReLogin from '../../../pages/ReLogin'
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
import WyreIntegrationScreen from '../../../pages/WyreIntegration/WyreIntegrationScreen'
import WyreOrderFormScreen from '../../../pages/WyreIntegration/WyreOrderFormScreen'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import AddNewAccountStack from '../accounts/AddNewAccountStack'
import LnAccountStack from '../accounts/LnAccountStack'
import QRStack from '../home/QRStack'

const Stack = createNativeStackNavigator()
const HomeStack = ( { navigation, route } ) => {
  useLayoutEffect( () => {
    const routeName = getFocusedRouteNameFromRoute( route ) ?? 'Home'
    if ( routeName === 'Home' ){
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
      initialRouteName='Home'
      screenOptions={( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
          },
        }
      }}
    >
      <Stack.Screen name="Home" component={Home} options={{
        headerShown: false
      }} />
      <Stack.Screen name="Launch" component={Launch} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="LNAccountDetails" component={LnAccountStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ReLogin" component={ReLogin} options={{
        gestureEnabled: false,
        headerShown: false
      }} />
      <Stack.Screen name="AddNewAccount" component={AddNewAccountStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ScanNodeConfig" component={ScanNodeConfig} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ImportBorderWallet" component={ImportBorderWallet} options={{
        headerShown: false
      }} />
      <Stack.Screen name="CreateWithBorderWalletAccount" component={CreateWithBorderWallet} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SelectEntropyGridTypeAccount" component={SelectEntropyGridType} options={{
        headerShown: false
      }} />
      <Stack.Screen name="DownloadEncryptGrid" component={DownloadEncryptGrid} options={{
        headerShown: false
      }} />
      <Stack.Screen name="BorderWalletGridScreen" component={BorderWalletGridScreen} options={{
        headerShown: false
      }} />
      <Stack.Screen name="SelectChecksumWordAccount" component={SelectChecksumWord} options={{
        headerShown: false
      }} />
      <Stack.Screen name="CreatePassPhraseAccount" component={CreatePassPhrase} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ImportWalletPassphrase" component={ImportWalletPassphrase} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ConfirmDownloadAccount" component={ConfirmDownload} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ConfirmDownload" component={ConfirmDownload} options={{
        headerShown: false
      }} />
      <Stack.Screen name="PreviewPattern" component={PreviewPattern} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RecoverBorderWallet" component={RecoverBorderWallet} options={{
        headerShown: false
      }} />
      <Stack.Screen name="ImportBWGrid" component={ImportBWGrid} options={{
        headerShown: false
      }} />
      <Stack.Screen name="EnterNodeConfig" component={EnterNodeConfig} options={{
        headerShown: false
      }} />
      <Stack.Screen name="NewWyreAccountDetails" component={NewWyreAccountDetailsScreen} options={{
        title: 'Setup Wyre Account'
      }} />
      <Stack.Screen name="NewRampAccountDetails" component={NewRampAccountDetailsScreen} options={{
        title: 'Setup Ramp Account'
      }} />
      <Stack.Screen name="PlaceWyreOrder" component={WyreOrderFormScreen} options={{
        title: 'Buy with Wyre'
      }} />
      <Stack.Screen name="PlaceRampOrder" component={RampOrderFormScreen} options={{
        title: 'Buy with Ramp'
      }} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsContainerScreen} options={{
        title: 'Transaction Details',
      }} />
      <Stack.Screen name="QRScanner" component={QRStack} options={{
        headerShown: false
      }} />
      <Stack.Screen name="Receive" component={Receive} options={{
        headerShown: false
      }} />
      <Stack.Screen name="WalletBackupAlert" component={WalletBackup} options={{
        headerShown: false
      }} />
      <Stack.Screen name="BackupSeedWordsContent" component={BackupSeedWordsContent} options={{
        headerShown: false
      }}/>
      <Stack.Screen name="SeedBackupHistory" component={SeedBackupHistory} options={{
        headerShown: false
      }} />
      <Stack.Screen name="TwoFASetup" component={TwoFASetup} options={{
        gestureEnabled: false,
      }} />
      <Stack.Screen name="UpdateApp" component={UpdateApp} options={{
        gestureEnabled: false,
      }} />
      <Stack.Screen name="WyreIntegrationScreen" component={WyreIntegrationScreen} options={{
        title: 'Wyre Home'
      }} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Intermediate" component={Intermediate} />
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
      <Stack.Screen name="ContactsListForAssociateContact" component={ContactsListForAssociateContact} options={{
        headerShown: false
      }} />
      <Stack.Screen name="NewTwoFASecret" component={NewTwoFASecret} />
      <Stack.Screen name="TwoFASweepFunds" component={TwoFASweepFunds} />
      <Stack.Screen name="SendRequest" component={SendRequest} />
      <Stack.Screen name="VoucherScanner" component={VoucherScanner} />
      <Stack.Screen name="AddContactSendRequest" component={AddContactSendRequest} />
      <Stack.Screen name="QrAndLink" component={QrAndLink} />
      <Stack.Screen name="ContactDetails" component={ContactDetails} />
      <Stack.Screen name="PairNewWallet" component={PairNewWallet} />
      <Stack.Screen name="ManageBackupNewBHR" component={ManageBackupNewBHR} />
      <Stack.Screen name="SecurityQuestionHistoryNewBHR" component={SecurityQuestionHistoryNewBHR} />
      <Stack.Screen name="TrustedContactHistoryNewBHR" component={TrustedContactHistoryNewBHR} />
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
    </Stack.Navigator>
  )
}

export default HomeStack
