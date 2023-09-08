import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TwoFAValidation from '../../../pages/Accounts/TwoFAValidation'
import ReLogin from '../../../pages/ReLogin'
import CustodianRequestOTP from '../../../pages/CustodianRequest/CustodianRequestOTP'
import CustodianRequestAccepted from '../../../pages/CustodianRequest/CustodianRequestAccepted'
import SweepFundsFromExistingAccount from '../../../pages/RegenerateShare/SweepFundsFromExistingAccount'
import NewWalletNameRegenerateShare from '../../../pages/RegenerateShare/NewWalletNameRegenerateShare'
import NewWalletQuestionRegenerateShare from '../../../pages/RegenerateShare/NewWalletQuestionRegenerateShare'
import NewWalletGenerationOTP from '../../../pages/RegenerateShare/NewWalletGenerationOTP'
import WalletCreationSuccess from '../../../pages/RegenerateShare/WalletCreationSuccess'
import SecureScan from '../../../pages/Accounts/SecureScan'
import GoogleAuthenticatorOTP from '../../../pages/Accounts/GoogleAuthenticatorOTP'
import TwoFASetup from '../../../pages/Accounts/TwoFASetup'
import SecondaryDeviceHistoryNewBHR from '../../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import SettingGetNewPin from '../../../pages/SettingGetNewPin'
import ContactsListForAssociateContact from '../../../pages/CustodianRequest/ContactsListForAssociateContact'
import NewTwoFASecret from '../../../pages/Accounts/NewTwoFASecret'
import TwoFASweepFunds from '../../../pages/Accounts/TwoFASweepFunds'
import UpdateApp from '../../../pages/UpdateApp'
import SendRequest from '../../../pages/Contacts/SendRequest'
import VoucherScanner from '../../../pages/FastBitcoin/VoucherScanner'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import QrAndLink from '../../../pages/NewBHR/QrAndLink'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import Receive from '../../../pages/Accounts/Receive'
import PairNewWallet from '../../../pages/FastBitcoin/PairNewWallet'
import Intermediate from '../../../pages/Intermediate'
import NewOwnQuestions from '../../../pages/NewOwnQuestions'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import WyreIntegrationScreen from '../../../pages/WyreIntegration/WyreIntegrationScreen'
import Launch from '../../../pages/Launch'
import EnterNodeConfig from '../../../pages/lightningAccount/EnterNodeConfigScreen'
import ScanNodeConfig from '../../../pages/lightningAccount/ScanNodeConfigScreen'
import RestoreWithICloud from '../../../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import RestoreWithoutICloud from '../../../pages/RestoreHexaWithKeeper/RestoreWithoutICloud'
import SettingsContents from '../../../pages/SettingsContents'
import SweepFunds from '../../../pages/SweepFunds/SweepFunds'
import SweepFundsEnterAmount from '../../../pages/SweepFunds/SweepFundsEnterAmount'
import SweepFundUseExitKey from '../../../pages/SweepFunds/SweepFundUseExitKey'
import SweepConfirmation from '../../../pages/SweepFunds/SweepConfirmation'
import ScanRecoveryKey from '../../../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import UpgradeBackup from '../../../pages/UpgradeBackupWithKeeper/UpgradeBackup'
import ConfirmKeys from '../../../pages/UpgradeBackupWithKeeper/ConfirmKeys'
import ManageBackupNewBHR from '../../../pages/NewBHR/ManageBackup'
import SecurityQuestionHistoryNewBHR from '../../../pages/NewBHR/SecurityQuestionHistory'
import TrustedContactHistoryNewBHR from '../../../pages/NewBHR/TrustedContactHistoryKeeper'
import PersonalCopyHistoryNewBHR from '../../../pages/NewBHR/PersonalCopyHistory'
import AddNewAccountStack from '../accounts/AddNewAccountStack'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import WyreOrderFormScreen from '../../../pages/WyreIntegration/WyreOrderFormScreen'
import NewRampAccountDetailsScreen from '../../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import RampOrderFormScreen from '../../../pages/RampIntegration/RampOrderFormScreen'
import QRStack from '../home/QRStack'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import LnAccountStack from '../accounts/LnAccountStack'
import Home from '../../../pages/Home/Home'
import Login from '../../../pages/Login'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import WalletBackup from '../../../pages/MoreOptions/WalletBackup'
import CreateWithBorderWallet from '../../../pages/borderwallet/CreateWithBorderWallet'
import SelectEntropyGridType from '../../../pages/borderwallet/SelectEntropyGridType'
import DownloadEncryptGrid from '../../../pages/borderwallet/DownloadEncryptGrid'
import BorderWalletGridScreen from '../../../pages/borderwallet/BorderWalletGridScreen'
import SelectChecksumWord from '../../../pages/borderwallet/SelectChecksumWord'
import CreatePassPhrase from '../../../pages/borderwallet/CreatePassPhrase'
import ConfirmDownload from '../../../pages/borderwallet/ConfirmDownload'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'
import ImportBorderWallet from '../../../pages/borderwallet/ImportBorderWallet'
import RecoverBorderWallet from '../../../pages/borderwallet/RecoverBorderWallet'
import ImportBWGrid from '../../../pages/borderwallet/ImportBWGrid'

const Stack = createNativeStackNavigator();
const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName='Home'
    >
      <Stack.Screen name="Home" component={Home} options={{ header: null }} />
    </Stack.Navigator>
  )
}
// TODO: add below screens to the stack
// const HomeStack = createStackNavigator(
//   {
//     Home: {
//       screen: Home,
//       navigationOptions: {
//         header: null,
//         // tabBarVisibl
//       },
//     },
//     Launch: {
//       screen: Launch,
//     },
//     ReLogin: {
//       screen: ReLogin,
//       navigationOptions: {
//         gesturesEnabled: false,
//         header: null,
//       },
//     },
//     Login,
//     AddNewAccount: {
//       screen: AddNewAccountStack,
//       navigationOptions: {
//         header: null,
//         // tabBarVisibl
//       },
//     },
//     ScanNodeConfig: {
//       screen: ScanNodeConfig,
//       navigationOptions: {
//         header: null
//       }
//     },
//     ImportBorderWallet: {
//       screen: ImportBorderWallet,
//       navigationOptions: {
//         header: null
//       }
//     },
//     CreateWithBorderWalletAccount: {
//       screen: CreateWithBorderWallet,
//       navigationOptions: {
//         header: null
//       }
//     },
//     SelectEntropyGridTypeAccount: {
//       screen: SelectEntropyGridType,
//       navigationOptions: {
//         header: null
//       }
//     },
//     DownloadEncryptGrid: {
//       screen: DownloadEncryptGrid,
//       navigationOptions: {
//         header: null
//       }
//     },
//     BorderWalletGridScreen: {
//       screen: BorderWalletGridScreen,
//       navigationOptions: {
//         header: null
//       }
//     },
//     SelectChecksumWordAccount: {
//       screen: SelectChecksumWord,
//       navigationOptions: {
//         header: null
//       }
//     },
//     CreatePassPhraseAccount: {
//       screen: CreatePassPhrase,
//       navigationOptions: {
//         header: null
//       }
//     },
//     ConfirmDownloadAccount: {
//       screen: ConfirmDownload,
//       navigationOptions: {
//         header: null
//       }
//     },
//     ConfirmDownload: {
//       screen: ConfirmDownload,
//       navigationOptions: {
//         header: null
//       }
//     },
//     PreviewPattern: {
//       screen: PreviewPattern,
//       navigationOptions: {
//         header: null
//       }
//     },
//     RecoverBorderWallet:{
//       screen: RecoverBorderWallet,
//       navigationOptions: {
//         header: null
//       }
//     },
//     ImportBWGrid: {
//       screen: ImportBWGrid,
//       navigationOptions: {
//         header: null
//       }
//     },
//     EnterNodeConfig: {
//       screen: EnterNodeConfig,
//       navigationOptions: {
//         header: null
//       }
//     },
//     AccountDetails: {
//       screen: AccountDetailsStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     LNAccountDetails: {
//       screen: LnAccountStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     NewWyreAccountDetails: {
//       screen: NewWyreAccountDetailsScreen,
//       navigationOptions: {
//         title: 'Setup Wyre Account'
//       }
//     },
//     NewRampAccountDetails: {
//       screen: NewRampAccountDetailsScreen,
//       navigationOptions: {
//         title: 'Setup Ramp Account'
//       }
//     },
//     PlaceWyreOrder: {
//       screen: WyreOrderFormScreen,
//       navigationOptions: {
//         title: 'Buy with Wyre'
//       }
//     },
//     PlaceRampOrder: {
//       screen: RampOrderFormScreen,
//       navigationOptions: {
//         title: 'Buy with Ramp'
//       }
//     },
//     TransactionDetails: {
//       screen: TransactionDetailsContainerScreen,
//       navigationOptions: {
//         title: 'Transaction Details',
//       },
//     },
//     QRScanner: {
//       screen: QRStack,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     Intermediate,
//     CustodianRequestOTP,
//     CustodianRequestAccepted,
//     SweepFundsFromExistingAccount,
//     NewWalletNameRegenerateShare,
//     NewWalletQuestionRegenerateShare,
//     NewWalletGenerationOTP,
//     WalletCreationSuccess,
//     SecureScan,
//     GoogleAuthenticatorOTP,
//     SecondaryDeviceHistoryNewBHR,
//     SettingGetNewPin,
//     ContactsListForAssociateContact,
//     NewTwoFASecret,
//     TwoFASweepFunds,
//     SendRequest,
//     VoucherScanner,
//     AddContactSendRequest,
//     QrAndLink,
//     ContactDetails,
//     Receive: {
//       screen: Receive,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     WalletBackupAlert: {
//       screen: WalletBackup,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     PairNewWallet,
//     ManageBackupNewBHR,
//     SecurityQuestionHistoryNewBHR,
//     TrustedContactHistoryNewBHR,
//     PersonalCopyHistoryNewBHR,
//     NewOwnQuestions,
//     RestoreWithICloud,
//     RestoreWithoutICloud,
//     SettingsContents,
//     SweepFunds,
//     SweepFundsEnterAmount,
//     SweepFundUseExitKey,
//     SweepConfirmation,
//     ScanRecoveryKey,
//     UpgradeBackup,
//     ConfirmKeys,
//     TwoFAValidation,
//     TwoFASetup: {
//       screen: TwoFASetup,
//       navigationOptions: {
//         gesturesEnabled: false,
//       },
//     },
//     UpdateApp: {
//       screen: UpdateApp,
//       navigationOptions: {
//         gesturesEnabled: false,
//       },
//     },
//     WyreIntegrationScreen: {
//       screen: WyreIntegrationScreen,
//       navigationOptions: {
//         title: 'Wyre Home'
//       }
//     },
//   },
//   {
//     initialRouteName: 'Home',
//     defaultNavigationOptions: ( { navigation } ) => {
//       return {
//         ...defaultStackScreenNavigationOptions,
//         headerLeft: () => {
//           return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
//         },
//       }
//     },
//     navigationOptions: ( { navigation } ) => {
//       let tabBarVisible = false
//       if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
//         tabBarVisible = true
//       }

//       return {
//         tabBarVisible,
//       }
//     },
//   },
// )

export default HomeStack
