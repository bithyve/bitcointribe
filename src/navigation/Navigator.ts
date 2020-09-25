import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import {
  createStackNavigator,
  StackViewTransitionConfigs,
} from 'react-navigation-stack';

import Launch from '../pages/Launch';
import Login from '../pages/Login';
import PasscodeConfirm from '../pages/PasscodeConfirm';
import RestoreAndRecoverWallet from '../pages/RestoreAndRecoverWallet';
import RestoreSelectedContactsList from '../pages/Recovery/RestoreSelectedContactsList';
import NewWalletName from '../pages/NewWalletName';
import NewWalletQuestion from '../pages/NewWalletQuestion';
import RestoreWalletBySecondaryDevice from '../pages/Recovery/RestoreWalletBySecondaryDevice';
import RestoreWalletUsingDocuments from '../pages/Recovery/RestoreWalletUsingDocuments';
import RestoreWalletByContacts from '../pages/Recovery/RestoreWalletByContacts';
import Home from '../pages/Home/Home';
import ReLogin from '../pages/ReLogin';
import Accounts from '../pages/Accounts/Index';
import ManageBackup from '../pages/ManageBackup';
import CustodianRequestOTP from '../pages/CustodianRequest/CustodianRequestOTP';
import CustodianRequestAccepted from '../pages/CustodianRequest/CustodianRequestAccepted';
import SecondaryDevice from '../pages/ManageBackup/SecondaryDevice';
import TrustedContacts from '../pages/ManageBackup/TrustedContacts';
import Cloud from '../pages/ManageBackup/Cloud';
import WalletNameRecovery from '../pages/Recovery/WalletNameRecovery';
import QuestionRecovery from '../pages/Recovery/QuestionRecovery';
import RecoveryCommunication from '../pages/Recovery/RecoveryCommunication';
import ReceivingAddress from '../pages/Accounts/ReceivingAddress';
//import TransactionDetails from '../pages/Accounts/TransactionDetails';
import Send from '../pages/Accounts/Send';
import TwoFAToken from '../pages/Accounts/TwoFAToken';
import RecoveryRequestOTP from '../pages/Recovery/RecoveryRequestOTP';
import SettingManagePin from '../pages/SettingManagePin';
import RestoreByCloudQrCodeContents from '../pages/Recovery/RestoreByCloudQrCodeContents';
import EmailModalContents from '../pages/EmailModalContents';
import Buy from '../pages/Accounts/Buy';
import Sell from '../pages/Accounts/Sell';
import QrScanner from '../components/QrScanner';
import HealthCheck from '../pages/HealthCheck';
import SecondaryDeviceHealthCheck from '../pages/HealthCheck/SecondaryDeviceHealthCheck';
import TrustedContactHealthCheck from '../pages/HealthCheck/TrustedContactHealthCheck';
import NoteHealthCheck from '../pages/HealthCheck/NoteHealthCheck';
import CloudHealthCheck from '../pages/HealthCheck/CloudHealthCheck';
import SweepFundsFromExistingAccount from '../pages/RegenerateShare/SweepFundsFromExistingAccount';
import NewWalletNameRegenerateShare from '../pages/RegenerateShare/NewWalletNameRegenerateShare';
import NewWalletQuestionRegenerateShare from '../pages/RegenerateShare/NewWalletQuestionRegenerateShare';
import NewWalletGenerationOTP from '../pages/RegenerateShare/NewWalletGenerationOTP';
import WalletCreationSuccess from '../pages/RegenerateShare/WalletCreationSuccess';
import SecureScan from '../pages/Accounts/SecureScan';
import GoogleAuthenticatorOTP from '../pages/Accounts/GoogleAuthenticatorOTP';
import Confirmation from '../pages/Accounts/Confirmation';
import TwoFASetup from '../pages/Accounts/TwoFASetup';
import ShareRecoveryOTP from '../pages/Recovery/ShareRecoveryOTP';
import SecondaryDeviceHistory from '../pages/ManageBackup/SecondaryDeviceHistory';
import TrustedContactHistory from '../pages/ManageBackup/TrustedContactHistory';
import PersonalCopyHistory from '../pages/ManageBackup/PersonalCopyHistory';
import SecurityQuestionHistory from '../pages/ManageBackup/SecurityQuestionHistory';
import SettingGetNewPin from '../pages/SettingGetNewPin';
import ContactsListForAssociateContact from '../pages/CustodianRequest/ContactsListForAssociateContact';
import LostTwoFA from '../pages/Accounts/LostTwoFA';
import PasscodeChangeSuccessPage from '../pages/PasscodeChangeSuccessPage';
import ExistingSavingMethods from '../pages/FastBitcoin/ExistingSavingMethods';
import ExistingSavingMethodDetails from '../pages/FastBitcoin/ExistingSavingMethodDetails';
import ResetTwoFAHelp from '../pages/Accounts/ResetTwoFAHelp';
import NewTwoFASecret from '../pages/Accounts/NewTwoFASecret';
import TwoFASweepFunds from '../pages/Accounts/TwoFASweepFunds';
import AddressBookContents from '../pages/AddressBookContents';
import ChangeCurrency from '../pages/ChangeCurrency';
import UpdateApp from '../pages/UpdateApp';
import SettingWalletNameChange from '../pages/SettingWalletNameChange';
import SettingNewWalletName from '../pages/SettingNewWalletName';
import SendRequest from '../pages/Contacts/SendRequest';
import VoucherScanner from '../pages/FastBitcoin/VoucherScanner';
import SendToContact from '../pages/Accounts/SendToContact';
import SendConfirmation from '../pages/Accounts/SendConfirmation';
import AddContactSendRequest from '../pages/Contacts/AddContactSendRequest';
import ContactDetails from '../pages/Contacts/ContactDetails';
import ContactDetailsNew from '../pages/Contacts/ContactDetailsNew';
import Receive from '../pages/Accounts/Receive';
import PairNewWallet from '../pages/FastBitcoin/PairNewWallet';
import Intermediate from '../pages/Intermediate';
import NewOwnQuestions from '../pages/NewOwnQuestions';
import NewRecoveryOwnQuestions from '../pages/Recovery/NewRecoveryOwnQuestions';
import NewAccountTypeSelectionList from '../pages/Accounts/AddNew/NewAccountTypeSelectionList';
import AddNewAccountDetails from '../pages/Accounts/AddNew/AccountDetails/AddNewAccountDetails';

const SetupNavigator = createStackNavigator(
  {
    Launch,
    Login,
    PasscodeConfirm,
    NewWalletName,
    NewWalletQuestion,
    RestoreAndRecoverWallet,
    WalletNameRecovery,
    QuestionRecovery,
    RestoreSelectedContactsList,
    RestoreWalletBySecondaryDevice,
    RestoreWalletUsingDocuments,
    RestoreWalletByContacts,
    RecoveryCommunication,
    ShareRecoveryOTP,
    RecoveryQrScanner: QrScanner,
    NewOwnQuestions,
    NewRecoveryOwnQuestions,
    UpdateApp: {
      screen: UpdateApp,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
  },
  {
    initialRouteName: 'Launch',
    headerLayoutPreset: 'center',
    defaultNavigationOptions: ({ navigation }) => ({
      header: null,
    }),
  },
);

const MODAL_ROUTES = [
  'SecondaryDevice',
  'TrustedContacts',
  'Cloud',
  'CustodianRequestOTP',
  'CustodianRequestAccepted',
  'TwoFAToken',
  'HealthCheckSecurityAnswer',
  'RecoveryRequestOTP',
  'Confirmation',
  'TransactionDetails',
  'Intermediate',
];

const AddNewAccountStack = createStackNavigator(
  {
    AccountTypeSelectionList: {
      screen: NewAccountTypeSelectionList,
      navigationOptions: {
        headerShown: false,
      },
    },
    AddNewAccountDetails: {
      screen: AddNewAccountDetails,
      navigationOptions: {
        headerShown: false
      },
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);

const HomeNavigator = createStackNavigator(
  {
    Home: {
      screen: Home,
      path: 'Home',
    },
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    Intermediate,
    Accounts,
    ManageBackup,
    SecondaryDevice,
    TrustedContacts,
    Cloud,
    CustodianRequestOTP,
    CustodianRequestAccepted,
    ReceivingAddress,
    AddNewAccount: {
      screen: AddNewAccountStack,
    },
    Send: {
      screen: Send,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    SendToContact: {
      screen: SendToContact,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    SendConfirmation,
    TwoFAToken,
    RecoveryRequestOTP,
    SettingManagePin,
    RestoreByCloudQrCodeContents,
    EmailModalContents,
    Buy,
    Sell,
    QrScanner,
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
    Confirmation,
    TwoFASetup,
    SecondaryDeviceHistory,
    TrustedContactHistory,
    PersonalCopyHistory,
    SecurityQuestionHistory,
    SettingGetNewPin,
    ContactsListForAssociateContact,
    LostTwoFA,
    ExistingSavingMethods,
    ExistingSavingMethodDetails,
    ResetTwoFAHelp,
    NewTwoFASecret,
    TwoFASweepFunds,
    AddressBookContents,
    ChangeCurrency,
    SettingWalletNameChange,
    SettingNewWalletName,
    SendRequest,
    VoucherScanner,
    AddContactSendRequest,
    ContactDetails,
    ContactDetailsNew,
    Receive,
    PairNewWallet,
    NewOwnQuestions,
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
  },
  {
    headerLayoutPreset: 'center',
    defaultNavigationOptions: ({ navigation }) => ({
      header: null,
    }),
    transitionConfig: (transitionProps, prevTransitionProps) => {
      const isModal = MODAL_ROUTES.some(
        (screenName) =>
          screenName === transitionProps.scene.route.routeName ||
          (prevTransitionProps &&
            screenName === prevTransitionProps.scene.route.routeName),
      );
      return StackViewTransitionConfigs.defaultTransitionConfig(
        transitionProps,
        prevTransitionProps,
        isModal,
      );
    },
  },
);

const Navigator = createSwitchNavigator({
  SetupNav: SetupNavigator,
  HomeNav: HomeNavigator,
});

export default createAppContainer(Navigator);
