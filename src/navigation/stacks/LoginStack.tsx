import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import AccountSelection from '../../pages/AccountSelection'
import BorderWalletGridScreen from '../../pages/borderwallet/BorderWalletGridScreen'
import ConfirmDownload from '../../pages/borderwallet/ConfirmDownload'
import CreatePassPhrase from '../../pages/borderwallet/CreatePassPhrase'
import CreateWithBorderWallet from '../../pages/borderwallet/CreateWithBorderWallet'
import DownloadEncryptGrid from '../../pages/borderwallet/DownloadEncryptGrid'
import ImportWalletPassphrase from '../../pages/borderwallet/ImportWalletPassphrase'
import PreviewPattern from '../../pages/borderwallet/PreviewPattern'
import RecoverBorderWallet from '../../pages/borderwallet/RecoverBorderWallet'
import RegenerateEntropyGrid from '../../pages/borderwallet/RegenerateEntropyGrid'
import SelectChecksumWord from '../../pages/borderwallet/SelectChecksumWord'
import SelectEntropyGridType from '../../pages/borderwallet/SelectEntropyGridType'
import CreateKeeperScreen from '../../pages/CreateKeeperScreen'
import Launch from '../../pages/Launch'
import Login from '../../pages/Login'
import NewOwnQuestions from '../../pages/NewOwnQuestions'
import NewWalletName from '../../pages/NewWalletName'
import NewWalletQuestion from '../../pages/NewWalletQuestion'
import PasscodeConfirm from '../../pages/PasscodeConfirm'
import QRScannerScreen from '../../pages/QRScannerScreen'
import NewRecoveryOwnQuestions from '../../pages/Recovery/NewRecoveryOwnQuestions'
import RecoveryCommunication from '../../pages/Recovery/RecoveryCommunication'
import RecoveryQuestionScreen from '../../pages/Recovery/RecoveryQuestionScreen'
import RestoreSelectedContactsList from '../../pages/Recovery/RestoreSelectedContactsList'
import RestoreWalletByContacts from '../../pages/Recovery/RestoreWalletByContacts'
import RestoreWalletBySecondaryDevice from '../../pages/Recovery/RestoreWalletBySecondaryDevice'
import WalletNameRecovery from '../../pages/Recovery/WalletNameRecovery'
import WalletCreationSuccess from '../../pages/RegenerateShare/WalletCreationSuccess'
import RestoreSeedWordsContent from '../../pages/RestoreHexaWithKeeper/RestoreSeedWordsContent'
import RestoreWithICloud from '../../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import ScanRecoveryKey from '../../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import SettingGetNewPin from '../../pages/SettingGetNewPin'
import UpdateApp from '../../pages/UpdateApp'
import WalletInitializationScreen from '../../pages/WalletInitializationScreen'
import defaultStackScreenNavigationOptions from '../options/DefaultStackScreenNavigationOptions'

function LoginStack() {
  const Stack = createNativeStackNavigator()
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      ...defaultStackScreenNavigationOptions,
    }}>
      <Stack.Screen name="Launch" component={Launch} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SettingGetNewPin" component={SettingGetNewPin}/>
      <Stack.Screen name="PasscodeConfirm" component={PasscodeConfirm} />
      <Stack.Screen name="NewWalletName" component={NewWalletName} />
      <Stack.Screen name="CreateKeeperScreen" component={CreateKeeperScreen} />
      <Stack.Screen name="CreateWithBorderWallet" component={CreateWithBorderWallet} />
      <Stack.Screen name="SelectEntropyGridType" component={SelectEntropyGridType} />
      <Stack.Screen name="DownloadEncryptGrid" component={DownloadEncryptGrid} />
      <Stack.Screen name="BorderWalletGridScreen" component={BorderWalletGridScreen} />
      <Stack.Screen name="SelectChecksumWord" component={SelectChecksumWord} />
      <Stack.Screen name="CreatePassPhrase" component={CreatePassPhrase} />
      <Stack.Screen name="ConfirmDownload" component={ConfirmDownload} />
      <Stack.Screen name="ImportWalletPassphrase" component={ImportWalletPassphrase} options={{
        headerShown: false
      }} />
      <Stack.Screen name="RecoverBorderWallet" component={RecoverBorderWallet} />
      <Stack.Screen name="RegenerateEntropyGrid" component={RegenerateEntropyGrid} />
      <Stack.Screen name="AccountSelection" component={AccountSelection} />
      <Stack.Screen name="NewWalletQuestion" component={NewWalletQuestion} />
      <Stack.Screen name="WalletInitialization" component={WalletInitializationScreen} />
      <Stack.Screen name="RestoreSeedWordsContent" component={RestoreSeedWordsContent} />
      <Stack.Screen name="PreviewPattern" component={PreviewPattern} />
      <Stack.Screen name="WalletNameRecovery" component={WalletNameRecovery} />
      <Stack.Screen name="RecoveryQuestion" component={RecoveryQuestionScreen} />
      <Stack.Screen name="RestoreSelectedContactsList" component={RestoreSelectedContactsList} />
      <Stack.Screen name="RestoreWalletBySecondaryDevice" component={RestoreWalletBySecondaryDevice} />
      <Stack.Screen name="RestoreWalletByContacts" component={RestoreWalletByContacts} />
      <Stack.Screen name="RecoveryCommunication" component={RecoveryCommunication} />
      <Stack.Screen name="NewOwnQuestions" component={NewOwnQuestions} />
      <Stack.Screen name="RecoveryQrScanner" component={QRScannerScreen} />
      <Stack.Screen name="NewRecoveryOwnQuestions" component={NewRecoveryOwnQuestions} />
      <Stack.Screen name="RestoreWithICloud" component={RestoreWithICloud} />
      <Stack.Screen name="ScanRecoveryKey" component={ScanRecoveryKey} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="UpdateApp" component={UpdateApp} options={{
        gestureEnabled: false
      }} />
      {//Do we need this?
      }
      <Stack.Screen name="WalletCreationSuccess" component={WalletCreationSuccess} />
    </Stack.Navigator>
  )
}

export default LoginStack
