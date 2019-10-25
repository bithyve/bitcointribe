import React from 'react';
import { colors } from '../constants/Constants';
import {
  createStackNavigator,
  createBottomTabNavigator,
} from 'react-navigation';

import { SvgIcon } from 'hexaComponent/Icons';
//  // localization
// import { localization } from "HexaWallet/src/app/manage/Localization/i18n";

// TODO: RestoreAndWalletSetupScreen
import { OnBoarding } from 'hexaScreen/Launch';

import { PasscodeConfirm, Passcode } from 'hexaScreen/Passcode';

//   Restore And Wallet Setup
import {
  RestoreAndReoverWallet,
  WalletSetup,
  PermissionAndroid,
} from 'hexaScreen/RestoreAndWalletSetup';

//   Restore Wallet using Mnemonic
import { RestoreWalletUsingMnemonic } from 'hexaScreen/Drawer/RestoreWalletUsingMnemonic';

//   Restore Wallet using Trusted Contact
import {
  RestoreWalletUsingTrustedContact,
  RestoreAllContactList,
  RestoreSelectedContactsList,
  RestoreWalletUsingTrustedContactQueAndAnw,
  RestoreTrustedContactsShare,
  RestoreTrustedContactsQRCodeScanScreen,
  Restore3SelfShare,
  Restore3SelfSahreQRCodeScanner,
  Restore4And5SelfShare,
  Restore4And5SelfShareQRCodeScanner,
} from 'hexaScreen/Drawer/RestoreWalletUsingTrustedContact';

//   More
import {
  More,
  ContactSharedSecretList,
  TrustedPartySelfShareQRCode,
  TrsutedPartyQRCode,
} from 'hexaScreen/TabBar/More';

//  TODO: QrcodeScan
import { QrCodeScanner } from 'hexaScreen/TabBar/QrCodeScanner';

TODO: Wallet;
import { Wallet } from 'hexaScreen/TabBar/Wallet';

//   TODO: All Transaction
import { AllTransaction } from 'hexaScreen/TabBar/AllTransaction';

//  TODO: Backup your Wallet
import {
  AllContactList,
  TrustedContact,
  ShareSecretViaQR,
  SelectContactListAssociatePerson,
  TrustedContactAcceptOtp,
} from 'hexaScreen/Drawer/BackUpYourWallet';

//  TODO: Settings
import {
  Settings,
  AdvancedSettings,
  MnemonicDisplay,
} from 'hexaScreen/Drawer/Settings';

//  TODO: Backup Wallet Mnemonic Screen
import {
  BackupWalletMnemonic,
  BackupWalletMnemonicConfirmMnemonic,
} from 'hexaScreen/Drawer/BackupWalletMnemonic';

//  TODO: Common Screen
import {
  QRCodeDisplay,
  OTP,
  QRCodeScan,
  OTPBackupShareStore,
} from 'hexaScreen/Drawer/Common';

//  TODO: Backup Secure Account
import { BackupSecureAccount } from 'hexaScreen/Drawer/BackupSecureAccount';

//  TODO: Health of the App
import {
  HealthOfTheApp,
  BackupSecretQuestions,
  BackupSecureTwoFactorAuto,
  HealthCheckMnemonic,
  SelfShareUsingWalletQRCode,
  SelfShareSharing,
  ConfirmSelfShareQRScanner,
} from 'hexaScreen/Drawer/HealthOfTheApp';

//  TODO: Payment Screen
import {
  ReceivePayment,
  SendPayment,
  ConfirmAndSendPayment,
  SendPaymentAddressScan,
} from 'hexaScreen/Drawer/Payment';

//  TODO: Account Transaction Screen
import { Transaction } from 'hexaScreen/Drawer/Transaction';

// TODO: StackNavigator:ONBoarding
const OnBoardingStackNavigator = createStackNavigator(
  {
    OnBoarding: {
      screen: OnBoarding,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'OnBoarding',
  },
);

const RestoreAndWalletSetupStackNavigator = createStackNavigator(
  {
    RestoreAndReoverWallet: {
      screen: RestoreAndReoverWallet,
      navigationOptions: { header: null },
    },
    WalletSetup: {
      screen: WalletSetup,
      navigationOptions: { header: null },
    },
    PermissionAndroid: {
      screen: PermissionAndroid,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'RestoreAndReoverWallet',
  },
);

const RestoreWalletUsingMnemonicStackNavigator = createStackNavigator(
  {
    RestoreWalletUsingMnemonic: {
      screen: RestoreWalletUsingMnemonic,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'RestoreWalletUsingMnemonic',
  },
);

const RestoreWalletUsingTrustedContactStackNavigator = createStackNavigator(
  {
    RestoreWalletUsingTrustedContact: {
      screen: RestoreWalletUsingTrustedContact,
      navigationOptions: { header: null },
    },
    RestoreSelectedContactsList: {
      screen: RestoreSelectedContactsList,
      navigationOptions: { header: null },
    },
    RestoreAllContactList: {
      screen: RestoreAllContactList,
      navigationOptions: { header: null },
    },
    RestoreTrustedContactsShare: {
      screen: RestoreTrustedContactsShare,
      navigationOptions: { header: null },
    },
    RestoreTrustedContactsQRCodeScan: {
      screen: RestoreTrustedContactsQRCodeScanScreen,
      navigationOptions: { header: null },
    },
    Restore3SelfShare: {
      screen: Restore3SelfShare,
      navigationOptions: { header: null },
    },
    Restore3SelfSahreQRCodeScanner: {
      screen: Restore3SelfSahreQRCodeScanner,
      navigationOptions: { header: null },
    },
    Restore4And5SelfShare: {
      screen: Restore4And5SelfShare,
      navigationOptions: { header: null },
    },
    Restore4And5SelfShareQRCodeScanner: {
      screen: Restore4And5SelfShareQRCodeScanner,
      navigationOptions: { header: null },
    },
    RestoreWalletUsingTrustedContactQueAndAnw: {
      screen: RestoreWalletUsingTrustedContactQueAndAnw,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'RestoreSelectedContactsList',
  },
);

const RestoreWalletUsingTrustedContactAndroidStackNavigator = createStackNavigator(
  {
    PermissionAndroid: {
      screen: PermissionAndroid,
      navigationOptions: { header: null },
    },
    RestoreWalletUsingTrustedContact: {
      screen: RestoreWalletUsingTrustedContact,
      navigationOptions: { header: null },
    },
    RestoreSelectedContactsList: {
      screen: RestoreSelectedContactsList,
      navigationOptions: { header: null },
    },
    RestoreAllContactList: {
      screen: RestoreAllContactList,
      navigationOptions: { header: null },
    },
    RestoreTrustedContactsShare: {
      screen: RestoreTrustedContactsShare,
      navigationOptions: { header: null },
    },
    RestoreTrustedContactsQRCodeScan: {
      screen: RestoreTrustedContactsQRCodeScanScreen,
      navigationOptions: { header: null },
    },
    Restore3SelfShare: {
      screen: Restore3SelfShare,
      navigationOptions: { header: null },
    },
    Restore3SelfSahreQRCodeScanner: {
      screen: Restore3SelfSahreQRCodeScanner,
      navigationOptions: { header: null },
    },
    Restore4And5SelfShare: {
      screen: Restore4And5SelfShare,
      navigationOptions: { header: null },
    },
    Restore4And5SelfShareQRCodeScanner: {
      screen: Restore4And5SelfShareQRCodeScanner,
      navigationOptions: { header: null },
    },
    RestoreWalletUsingTrustedContactQueAndAnw: {
      screen: RestoreWalletUsingTrustedContactQueAndAnw,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'PermissionAndroid',
  },
);

const TrustedPartyShareSecretStackNavigator = createStackNavigator(
  {
    ContactSharedSecretList: {
      screen: ContactSharedSecretList,
      navigationOptions: {
        header: null,
        tabBarVisible: false,
      },
    },
    TrustedPartySelfShareQRCode: {
      screen: TrustedPartySelfShareQRCode,
      navigationOptions: { header: null },
    },
    TrsutedPartyQRCode: {
      screen: TrsutedPartyQRCode,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'ContactSharedSecretList',
  },
);

// TODO: FirstTimeWalletSetupStackNavigatorRouter
const BackUpYourWalletStackNavigatorRouter = createStackNavigator(
  {
    AllContactList: {
      screen: AllContactList,
      navigationOptions: { header: null },
    },
    TrustedContact: {
      screen: TrustedContact,
      navigationOptions: { header: null },
    },
    ShareSecretViaQR: {
      screen: ShareSecretViaQR,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'AllContactList',
  },
);

const BackUpYourWalletSecoundTimeStackNavigatorRouter = createStackNavigator(
  {
    TrustedContact: {
      screen: TrustedContact,
      navigationOptions: { header: null },
    },
    ShareSecretViaQR: {
      screen: ShareSecretViaQR,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'TrustedContact',
  },
);

const TrustedContactStackNavigator = createStackNavigator(
  {
    TrustedContact: {
      screen: TrustedContact,
      navigationOptions: { header: null },
    },
    ShareSecretViaQR: {
      screen: ShareSecretViaQR,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'TrustedContact',
  },
);

const BackupTrustedPartrySecretStoreStackNavigator = createStackNavigator(
  {
    SelectContactListAssociatePerson: {
      screen: SelectContactListAssociatePerson,
      navigationOptions: { header: null },
    },
    TrustedContactAcceptOtp: {
      screen: TrustedContactAcceptOtp,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'SelectContactListAssociatePerson',
  },
);

// TODO: SettingsScreen
const SettingsStackNavigator = createStackNavigator(
  {
    Settings: {
      screen: Settings,
      navigationOptions: { header: null },
    },
    BackupWalletMnemonic: {
      screen: BackupWalletMnemonic,
      navigationOptions: { header: null },
    },
    BackupWalletMnemonicConfirmMnemonic: {
      screen: BackupWalletMnemonicConfirmMnemonic,
      navigationOptions: { header: null },
    },
    AdvancedSettings: {
      screen: AdvancedSettings,
      navigationOptions: { header: null },
    },
    MnemonicDisplay: {
      screen: MnemonicDisplay,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'AdvancedSettings',
  },
);

// TODO: HealthOfTheScreen Stack Navigator
const HealthOfTheAppStackNavigator = createStackNavigator(
  {
    HealthOfTheApp: {
      screen: HealthOfTheApp,
      navigationOptions: { header: null },
    },
    BackupSecretQuestions: {
      screen: BackupSecretQuestions,
      navigationOptions: { header: null },
    },
    BackupSecureTwoFactorAuto: {
      screen: BackupSecureTwoFactorAuto,
      navigationOptions: { header: null },
    },
    HealthCheckMnemonic: {
      screen: HealthCheckMnemonic,
      navigationOptions: { header: null },
    },
    SelfShareUsingWalletQRCode: {
      screen: SelfShareUsingWalletQRCode,
      navigationOptions: { header: null },
    },
    SelfShareSharing: {
      screen: SelfShareSharing,
      navigationOptions: { header: null },
    },
    ConfirmSelfShareQRScanner: {
      screen: ConfirmSelfShareQRScanner,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'HealthOfTheApp',
  },
);

// TODO: Backup Secure Account Stack Navigator

const BackupSecureAccountWithPdfStackNavigator = createStackNavigator(
  {
    BackupSecureAccount: {
      screen: BackupSecureAccount,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'BackupSecureAccount',
  },
);

// TODO: Payment Navigation
// Receive Payment Stack Navigator
const ReceivePaymentStackNavigator = createStackNavigator(
  {
    ReceivePayment: {
      screen: ReceivePayment,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'ReceivePayment',
  },
);

// Send Payment Stack Navigator
const SendPaymentStackNavigator = createStackNavigator(
  {
    SendPayment: {
      screen: SendPayment,
      navigationOptions: { header: null },
    },
    ConfirmAndSendPayment: {
      screen: ConfirmAndSendPayment,
      navigationOptions: { header: null },
    },
    SendPaymentAddressScan: {
      screen: SendPaymentAddressScan,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'SendPayment',
  },
);

// TODO: Account Transaction StackNavigator
const AccountTransactionStackNavigator = createStackNavigator(
  {
    Transaction: {
      screen: Transaction,
      navigationOptions: { header: null },
    },
    RecieveNavigation: {
      screen: ReceivePaymentStackNavigator,
      navigationOptions: { header: null },
    },
    SendPaymentNavigation: {
      screen: SendPaymentStackNavigator,
      navigationOptions: { header: null },
    },
  },
  {
    initialRouteName: 'Transaction',
  },
);

// TODO: TabNavigator
// TODO: TabNavigator:TabNavigator
const TabNavigator = createBottomTabNavigator(
  {
    Wallet: {
      screen: Wallet,
      navigationOptions: {
        tabBarLabel: 'Wallet', // localization("TabBarItem.Payment"),
        drawerLockMode: 'locked-open',
        tabBarIcon: ({ tintColor }) => (
          <SvgIcon name="wallet" color={tintColor} size={22} />
        ),
      },
    },
    AllTransaction: {
      screen: AllTransaction,
      navigationOptions: {
        tabBarLabel: 'Transaction', // localization("TabBarItem.Analytics"),
        tabBarIcon: ({ tintColor }) => (
          <SvgIcon name="icon_transactions" color={tintColor} size={22} />
        ),
      },
    },
    QrCodeScanner: {
      screen: QrCodeScanner,
      navigationOptions: {
        tabBarLabel: 'QR', // localization("TabBarItem.Accounts"),
        tabBarIcon: ({ tintColor }) => (
          <SvgIcon name="qr-codes" color={tintColor} size={22} />
        ),
      },
    },

    More: {
      screen: More,
      navigationOptions: {
        tabBarLabel: 'More', // localization("TabBarItem.More"),
        tabBarIcon: ({ tintColor }) => (
          <SvgIcon name="more-icon" color={tintColor} size={22} />
        ),
      },
    },
  },
  {
    initialRouteName: 'Wallet',
    tabBarOptions: {
      showLabel: true,
      // swipeEnabled: true,
      showIcon: true,
      activeTintColor: colors.appColor,
      labelStyle: {
        fontSize: 11,
        fontFamily: 'FiraSans-Medium',
      },
      style: {
        backgroundColor: '#ffffff',
      },
      tabStyle: {},
    },
  },
);

// TODO: RootNavigator
// TODO: RootNavigator:createRootNavigator
export const createRootNavigator = (
  signedIn = false,
  screenName = 'Passcode',
) => {
  return createStackNavigator(
    {
      OnBoardingNavigator: {
        screen: OnBoardingStackNavigator,
        navigationOptions: { header: null },
      },
      PasscodeConfirm: {
        screen: PasscodeConfirm,
        navigationOptions: { header: null },
      },
      Passcode: {
        screen: Passcode,
        navigationOptions: { header: null },
      },
      RestoreAndWalletSetupNavigator: {
        screen: RestoreAndWalletSetupStackNavigator,
        navigationOptions: { header: null },
      },
      TabbarBottom: {
        screen: TabNavigator,
        navigationOptions: { header: null },
      },
      RestoreWalletUsingMnemonicNavigator: {
        screen: RestoreWalletUsingMnemonicStackNavigator,
        navigationOptions: { header: null },
      },
      RestoreWalletUsingTrustedContactNavigator: {
        screen: RestoreWalletUsingTrustedContactStackNavigator,
        navigationOptions: { header: null },
      },
      RestoreWalletUsingTrustedContactAndroidNavigator: {
        screen: RestoreWalletUsingTrustedContactAndroidStackNavigator,
        navigationOptions: { header: null },
      },

      BackUpYourWalletNavigator: {
        screen: BackUpYourWalletStackNavigatorRouter,
        navigationOptions: { header: null },
      },
      BackUpYourWalletSecoundTimeNavigator: {
        screen: BackUpYourWalletSecoundTimeStackNavigatorRouter,
        navigationOptions: { header: null },
      },
      BackupTrustedPartrySecretNavigator: {
        screen: BackupTrustedPartrySecretStoreStackNavigator,
        navigationOptions: { header: null },
      },
      // also use deepling url navigaton
      TrustedPartyShareSecretNavigator: {
        screen: TrustedPartyShareSecretStackNavigator,
        navigationOptions: { header: null },
      },
      // TODO: Common Screens
      OTPScreenNavigator: {
        screen: OTP,
        navigationOptions: { header: null },
      },
      OTPBackupShareStoreNavigator: {
        screen: OTPBackupShareStore,
        navigationOptions: { header: null },
      },
      // TODO: Settings
      SettingsNavigator: {
        screen: SettingsStackNavigator,
        navigationOptions: { header: null },
      },
      // TODO: HealthOfTheApp
      HealthOfTheAppNavigator: {
        screen: HealthOfTheAppStackNavigator,
        navigationOptions: { header: null },
      },
      TrustedContactNavigator: {
        screen: TrustedContactStackNavigator,
        navigationOptions: { header: null },
      },
      // TODO: Backup Secure Account
      BackupSecureAccountWithPdfNavigator: {
        screen: BackupSecureAccountWithPdfStackNavigator,
        navigationOptions: { header: null },
      },

      // TODO: Payment Navigation
      // ReceivePayment
      ReceivePaymentNavigator: {
        screen: ReceivePaymentStackNavigator,
        navigationOptions: { header: null },
      },
      // SentPayment
      SendPaymentNavigator: {
        screen: SendPaymentStackNavigator,
        navigationOptions: { header: null },
      },
      // TODO: Transaction Navigation
      AccountTransactionNavigator: {
        screen: AccountTransactionStackNavigator,
        navigationOptions: { header: null },
      },
    },
    {
      // initialRouteName: signedIn ? "OnBoardingNavigator" : PasscodeConfirm
      initialRouteName: signedIn ? 'OnBoardingNavigator' : screenName, // "TabbarBottom" //
    },
  );
};
