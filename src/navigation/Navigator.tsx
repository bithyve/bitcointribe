import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import {
  createStackNavigator,
  StackViewTransitionConfigs,
} from 'react-navigation-stack';
import Launch from '../pages/Launch';
import Login from '../pages/Login';
import PasscodeConfirm from '../pages/PasscodeConfirm';
import WalletInitializationScreen from '../pages/WalletInitializationScreen';
import RestoreSelectedContactsList from '../pages/Recovery/RestoreSelectedContactsList';
import NewWalletName from '../pages/NewWalletName';
import NewWalletQuestion from '../pages/NewWalletQuestion';
import RestoreWalletBySecondaryDevice from '../pages/Recovery/RestoreWalletBySecondaryDevice';
import RestoreWalletByContacts from '../pages/Recovery/RestoreWalletByContacts';
import ReLogin from '../pages/ReLogin';
import ManageBackup from '../pages/ManageBackup';
import CustodianRequestOTP from '../pages/CustodianRequest/CustodianRequestOTP';
import CustodianRequestAccepted from '../pages/CustodianRequest/CustodianRequestAccepted';
import SecondaryDevice from '../pages/ManageBackup/SecondaryDevice';
import TrustedContacts from '../pages/ManageBackup/TrustedContacts';
import WalletNameRecovery from '../pages/Recovery/WalletNameRecovery';
import RecoveryQuestionScreen from '../pages/Recovery/RecoveryQuestionScreen';
import RecoveryCommunication from '../pages/Recovery/RecoveryCommunication';
import ReceivingAddress from '../pages/Accounts/ReceivingAddress';
import TwoFAToken from '../pages/Accounts/TwoFAToken';
import QRScannerScreen from '../pages/QRScannerScreen';
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
import TwoFASetup from '../pages/Accounts/TwoFASetup';
import SecondaryDeviceHistory from '../pages/ManageBackup/SecondaryDeviceHistory';
import TrustedContactHistory from '../pages/ManageBackup/TrustedContactHistory';
import PersonalCopyHistory from '../pages/ManageBackup/PersonalCopyHistory';
import SecurityQuestionHistory from '../pages/ManageBackup/SecurityQuestionHistory';
import SettingGetNewPin from '../pages/SettingGetNewPin';
import ContactsListForAssociateContact from '../pages/CustodianRequest/ContactsListForAssociateContact';
import PasscodeChangeSuccessPage from '../pages/PasscodeChangeSuccessPage';
import ResetTwoFAHelp from '../pages/Accounts/ResetTwoFAHelp';
import NewTwoFASecret from '../pages/Accounts/NewTwoFASecret';
import TwoFASweepFunds from '../pages/Accounts/TwoFASweepFunds';
import UpdateApp from '../pages/UpdateApp';
import SettingWalletNameChange from '../pages/SettingWalletNameChange';
import SettingNewWalletName from '../pages/SettingNewWalletName';
import SendRequest from '../pages/Contacts/SendRequest';
import VoucherScanner from '../pages/FastBitcoin/VoucherScanner';
import AddContactSendRequest from '../pages/Contacts/AddContactSendRequest';
import ContactDetails from '../pages/Contacts/ContactDetails';
import Receive from '../pages/Accounts/Receive';
import PairNewWallet from '../pages/FastBitcoin/PairNewWallet';
import Intermediate from '../pages/Intermediate';
import NewOwnQuestions from '../pages/NewOwnQuestions';
import NewRecoveryOwnQuestions from '../pages/Recovery/NewRecoveryOwnQuestions';
import NewAccountTypeSelectionList from '../pages/Accounts/AddNew/NewAccountTypeSelectionList';
import HomeStack from './stacks/home/HomeStack';
import AccountDetailsStack from './stacks/account-details/AccountDetailsStack';
import SendStack from './stacks/send/SendStack';
import AddNewHexaAccountDetails from '../pages/Accounts/AddNew/HexaAccount/AccountDetails';
import NavigationHeader from '../pages/Accounts/AddNew/NavigationHeader';


const SetupNavigator = createStackNavigator(
  {
    Launch,
    Login,
    PasscodeConfirm,
    NewWalletName,
    NewWalletQuestion,
    WalletInitialization: WalletInitializationScreen,
    WalletNameRecovery,
    RecoveryQuestion: RecoveryQuestionScreen,
    RestoreSelectedContactsList,
    RestoreWalletBySecondaryDevice,
    RestoreWalletByContacts,
    RecoveryCommunication,
    NewOwnQuestions,
    NewRecoveryOwnQuestions,
    QRScanner: QRScannerScreen,
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
    defaultNavigationOptions: () => ({
      header: null,
    }),
  },
);

const MODAL_ROUTES = [
  'SecondaryDevice',
  'TrustedContacts',
  'CustodianRequestOTP',
  'CustodianRequestAccepted',
  'TwoFAToken',
  'HealthCheckSecurityAnswer',
  'Intermediate',
];

const AddNewAccountStack = createStackNavigator(
  {
    AccountTypeSelectionList: {
      screen: NewAccountTypeSelectionList,
      navigationOptions: {
        header: ({ navigation }) => {
          return <NavigationHeader title="Add New" onBackPress={() => navigation.goBack()} />
        },
      },
    },
    AddNewHexaAccountDetails: {
      screen: AddNewHexaAccountDetails,
      navigationOptions: AddNewHexaAccountDetails.navigationOptions,
    },
  },
  {
    mode: 'modal',
  },
);

const HomeNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeStack,
      path: 'home',
    },
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
    ManageBackup,
    SecondaryDevice,
    TrustedContacts,
    CustodianRequestOTP,
    CustodianRequestAccepted,
    ReceivingAddress,
    AddNewAccount: {
      screen: AddNewAccountStack,
    },
    Send: {
      screen: SendStack,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    TwoFAToken,
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
    TwoFASetup,
    SecondaryDeviceHistory,
    TrustedContactHistory,
    PersonalCopyHistory,
    SecurityQuestionHistory,
    SettingGetNewPin,
    ContactsListForAssociateContact,
    ResetTwoFAHelp,
    NewTwoFASecret,
    TwoFASweepFunds,
    SettingWalletNameChange,
    SettingNewWalletName,
    SendRequest,
    VoucherScanner,
    AddContactSendRequest,
    ContactDetails,
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
    defaultNavigationOptions: ({ navigation }) => {
      return {
        header: null,
        headerTitleContainerStyle: {
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        },
      };
    },
    transitionConfig: (transitionProps, prevTransitionProps) => {

      // 📝 Override the default presentation mode for screens that we
      // want to present modally
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
