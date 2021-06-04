import React from 'react'
import { createStackNavigator, StackViewTransitionConfigs } from 'react-navigation-stack'
import TwoFAValidation from '../../../pages/Accounts/TwoFAValidation'
import ReLogin from '../../../pages/ReLogin'
import ManageBackup from '../../../pages/ManageBackup'
import CustodianRequestOTP from '../../../pages/CustodianRequest/CustodianRequestOTP'
import CustodianRequestAccepted from '../../../pages/CustodianRequest/CustodianRequestAccepted'
import SecondaryDevice from '../../../pages/ManageBackup/SecondaryDevice'
import TrustedContacts from '../../../pages/ManageBackup/TrustedContacts'
import HealthCheck from '../../../pages/HealthCheck'
import SecondaryDeviceHealthCheck from '../../../pages/HealthCheck/SecondaryDeviceHealthCheck'
import TrustedContactHealthCheck from '../../../pages/HealthCheck/TrustedContactHealthCheck'
import NoteHealthCheck from '../../../pages/HealthCheck/NoteHealthCheck'
import CloudHealthCheck from '../../../pages/HealthCheck/CloudHealthCheck'
import SweepFundsFromExistingAccount from '../../../pages/RegenerateShare/SweepFundsFromExistingAccount'
import NewWalletNameRegenerateShare from '../../../pages/RegenerateShare/NewWalletNameRegenerateShare'
import NewWalletQuestionRegenerateShare from '../../../pages/RegenerateShare/NewWalletQuestionRegenerateShare'
import NewWalletGenerationOTP from '../../../pages/RegenerateShare/NewWalletGenerationOTP'
import WalletCreationSuccess from '../../../pages/RegenerateShare/WalletCreationSuccess'
import SecureScan from '../../../pages/Accounts/SecureScan'
import GoogleAuthenticatorOTP from '../../../pages/Accounts/GoogleAuthenticatorOTP'
import TwoFASetup from '../../../pages/Accounts/TwoFASetup'
import SecondaryDeviceHistory from '../../../pages/ManageBackup/SecondaryDeviceHistory'
import SecondaryDeviceHistoryNewBHR from '../../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import TrustedContactHistory from '../../../pages/ManageBackup/TrustedContactHistory'
import PersonalCopyHistory from '../../../pages/ManageBackup/PersonalCopyHistory'
import SecurityQuestionHistory from '../../../pages/ManageBackup/SecurityQuestionHistory'
import SettingGetNewPin from '../../../pages/SettingGetNewPin'
import ContactsListForAssociateContact from '../../../pages/CustodianRequest/ContactsListForAssociateContact'
import PasscodeChangeSuccessPage from '../../../pages/PasscodeChangeSuccessPage'
import NewTwoFASecret from '../../../pages/Accounts/NewTwoFASecret'
import TwoFASweepFunds from '../../../pages/Accounts/TwoFASweepFunds'
import UpdateApp from '../../../pages/UpdateApp'
import SendRequest from '../../../pages/Contacts/SendRequest'
import VoucherScanner from '../../../pages/FastBitcoin/VoucherScanner'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import Receive from '../../../pages/Accounts/Receive'
import PairNewWallet from '../../../pages/FastBitcoin/PairNewWallet'
import Intermediate from '../../../pages/Intermediate'
import NewOwnQuestions from '../../../pages/NewOwnQuestions'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import WyreIntegrationScreen from '../../../pages/WyreIntegration/WyreIntegrationScreen'
import Launch from '../../../pages/Launch'

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
import ManageBackupUpgradeSecurity from '../../../pages/UpgradeBackupWithKeeper/ManageBackupUpgradeSecurity'
// import ManageBackupKeeper from '../../../pages/Keeper/ManageBackup';
import ManageBackupNewBHR from '../../../pages/NewBHR/ManageBackupNewBHR'
// import SecurityQuestionHistoryKeeper from '../../../pages/Keeper/SecurityQuestionHistory';
import SecurityQuestionHistoryNewBHR from '../../../pages/NewBHR/SecurityQuestionHistory'
// import KeeperFeatures from "../../../pages/Keeper/KeeperFeatures";
// import TrustedContactHistoryKeeper from '../../../pages/Keeper/TrustedContactHistoryKeeper';
import TrustedContactHistoryNewBHR from '../../../pages/NewBHR/TrustedContactHistoryKeeper'
// import KeeperDeviceHistory from '../../../pages/Keeper/KeeperDeviceHistory';
// import PersonalCopyHistoryKeeper from '../../../pages/Keeper/PersonalCopyHistory';
import PersonalCopyHistoryNewBHR from '../../../pages/NewBHR/PersonalCopyHistory'
import CloudBackupHistory from '../../../pages/NewBHR/CloudBackupHistory'
import AddNewAccountStack from '../accounts/AddNewAccountStack'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import WyreOrderFormScreen from '../../../pages/WyreIntegration/WyreOrderFormScreen'
import NewRampAccountDetailsScreen from '../../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import RampOrderFormScreen from '../../../pages/RampIntegration/RampOrderFormScreen'
import QRStack from '../home/QRStack'
import Home from '../../../pages/Home/Home'
import TabNavigator from '../../TabNavigator'
import Header from '../Header'

const MODAL_ROUTES = [
  'AllTransactions',
  'QRScanner',
  'FriendsAndFamily',
  'MoreOptions',
  'PlaceWyreOrder',
  'PlaceRampOrder'
]


const HomeStack = createStackNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    Launch,
    AddNewAccount: {
      screen: AddNewAccountStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    AccountDetails: {
      screen: AccountDetailsStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    NewWyreAccountDetails: {
      screen: NewWyreAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Wyre Account'
      }
    },
    NewRampAccountDetails: {
      screen: NewRampAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Ramp Account'
      }
    },
    PlaceWyreOrder: {
      screen: WyreOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Wyre'
      }
    },
    PlaceRampOrder: {
      screen: RampOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Ramp'
      }
    },
    // AllTransactions: {
    //   screen: AllTransactionsStack,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    // FriendsAndFamily: FriendsAndFamilyScreen,
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
    // MoreOptions: {
    //   screen: MoreOptionsStack,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    Intermediate,
    ManageBackup,
    SecondaryDevice,
    TrustedContacts,
    CustodianRequestOTP,
    CustodianRequestAccepted,
    HealthCheck,
    SecondaryDeviceHealthCheck,
    TrustedContactHealthCheck,
    NoteHealthCheck,
    CloudHealthCheck,
    SweepFundsFromExistingAccount,
    NewWalletNameRegenerateShare,
    NewWalletQuestionRegenerateShare,
    NewWalletGenerationOTP,
    WalletCreationSuccess,
    SecureScan,
    GoogleAuthenticatorOTP,
    SecondaryDeviceHistory,
    SecondaryDeviceHistoryNewBHR,
    TrustedContactHistory,
    PersonalCopyHistory,
    SecurityQuestionHistory,
    SettingGetNewPin,
    ContactsListForAssociateContact,
    NewTwoFASecret,
    TwoFASweepFunds,
    SendRequest,
    VoucherScanner,
    AddContactSendRequest,
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
    ManageBackupUpgradeSecurity,
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
    PasscodeChangeSuccessPage: {
      screen: PasscodeChangeSuccessPage,
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
  },
  {
    mode: 'modal',
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      header: null
    },
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      console.log( 'navigation.state.index>>>>>>>>', navigation.state.index )

      if ( navigation.state.index === 0 ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    //   return {
    //     ...defaultStackScreenNavigationOptions,
    //     headerLeft: () => {
    //       return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
    //     },
    //   }
    },
    transitionConfig: ( transitionProps, prevTransitionProps ) => {
      const previousRouteName = prevTransitionProps?.scene.route.routeName
      const newRouteName = transitionProps.scene.route.routeName

      // 📝 Override the default presentation mode for screens that we
      // want to present modally
      const isModal = MODAL_ROUTES.some(
        ( screenName ) => [ previousRouteName, newRouteName ].includes( screenName )
      )

      return StackViewTransitionConfigs.defaultTransitionConfig(
        transitionProps,
        prevTransitionProps,
        isModal,
      )
    },
  },
)

// HomeStack.navigationOptions = ( { navigation } ) => {
//   let tabBarVisible = true
//   console.log( 'navigation.state.index', navigation.state.index )

//   if ( navigation.state.index > 0 ) {
//     tabBarVisible = false
//   }

//   return {
//     tabBarVisible,
//   }
// }

export default HomeStack
