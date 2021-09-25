import React from 'react'
import {
  createStackNavigator,
  StackViewTransitionConfigs,
} from 'react-navigation-stack'
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
import RequestKeyFromContact from '../../../components/RequestKeyFromContact'
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
import CloudBackupHistory from '../../../pages/NewBHR/CloudBackupHistory'
import TrustedContactNewBHR from '../../../pages/NewBHR/TrustedContacts'
import Launch from '../../../pages/Launch'
import Login from '../../../pages/Login'
import Header from '../Header'
import QRStack from '../home/QRStack'
import SetNewPassword from '../../../pages/NewBHR/SetNewPassword'
import  FNFToKeeper from '../../../pages/NewBHR/FNFToKeeper'
import AddContactAddressBook from '../../../pages/Contacts/AddContactAddressBook'

const MODAL_ROUTES = [
  'SecondaryDevice',
  'TrustedContacts',
  'CustodianRequestOTP',
  'CustodianRequestAccepted',
  'HealthCheckSecurityAnswer',
  'Intermediate',
]

const SecurityStack = createStackNavigator(
  {
    Home: {
      screen: ManageBackupNewBHR,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },

    },
    Launch,
    Login,
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    Intermediate,
    AccountDetails: {
      screen: AccountDetailsStack,
    },
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
    CustodianRequestOTP,
    CustodianRequestAccepted,
    SweepFundsFromExistingAccount,
    NewWalletNameRegenerateShare,
    NewWalletQuestionRegenerateShare,
    NewWalletGenerationOTP,
    WalletCreationSuccess,
    SecureScan,
    GoogleAuthenticatorOTP,
    SecondaryDeviceHistoryNewBHR,
    SettingGetNewPin,
    ContactsListForAssociateContact,
    NewTwoFASecret,
    TwoFASweepFunds,
    SendRequest,
    VoucherScanner,
    AddContactSendRequest,
    QrAndLink,
    ContactDetails,
    Receive,
    PairNewWallet,
    // ManageBackupKeeper,
    ManageBackupNewBHR,
    // SecurityQuestionHistoryKeeper,
    SecurityQuestionHistoryNewBHR,
    // KeeperFeatures,
    // TrustedContactHistoryKeeper,
    TrustedContactHistoryNewBHR,
    // KeeperDeviceHistory,
    // PersonalCopyHistoryKeeper,
    FNFToKeeper,
    AddContact: {
      screen: AddContactAddressBook,
      navigationOptions: {
        header: null,
      },
    },
    PersonalCopyHistoryNewBHR,
    CloudBackupHistory,
    NewOwnQuestions,
    RestoreWithICloud,
    RestoreWithoutICloud,
    SettingsContents,
    SweepFunds,
    SweepFundsEnterAmount,
    SweepFundUseExitKey,
    SweepConfirmation,
    ScanRecoveryKey,
    UpgradeBackup,
    ConfirmKeys,
    TwoFAValidation,
    TwoFASetup: {
      screen: TwoFASetup,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    UpdateApp: {
      screen: UpdateApp,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    WyreIntegrationScreen: {
      screen: WyreIntegrationScreen,
      navigationOptions: {
        title: 'Wyre Home'
      }
    },
    RequestKeyFromContact,
    TrustedContactNewBHR,
    SetNewPassword
  },
  {
    headerLayoutPreset: 'center',
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    },
    // transitionConfig: ( transitionProps, prevTransitionProps ) => {

    //   // 📝 Override the default presentation mode for screens that we
    //   // want to present modally
    //   const isModal = MODAL_ROUTES.some(
    //     ( screenName ) =>
    //       screenName === transitionProps.scene.route.routeName ||
    //       ( prevTransitionProps &&
    //         screenName === prevTransitionProps.scene.route.routeName ),
    //   )

    //   return StackViewTransitionConfigs.defaultTransitionConfig(
    //     transitionProps,
    //     prevTransitionProps,
    //     isModal,
    //   )
    // },
  },
)

export default SecurityStack
