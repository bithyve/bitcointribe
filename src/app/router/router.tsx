import React from "react";
import { colors } from "../constants/Constants";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import { SvgIcon } from "@up-shared/components";

//localization
import { localization } from "HexaWallet/src/app/manage/Localization/i18n";

//TODO: RestoreAndWalletSetupScreen
import OnBoardingScreen from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/OnBoardingScreen/OnBoardingScreen";
import PasscodeScreen from "HexaWallet/src/screens/PasscodeScreen/PasscodeScreen";
import PasscodeConfirmScreen from "HexaWallet/src/screens/PasscodeScreen/PasscodeConfirmScreen";
import RestoreAndReoverWalletScreen from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/RestoreAndReoverWalletScreen/RestoreAndReoverWalletScreen";

import RestoreWalletUsingMnemonicScrren from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingMnemonicScreen/RestoreWalletUsingMnemonicScrren";

// Restore Wallet using Trusted Contact
import RestoreWalletUsingTrustedContactScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreWalletUsingTrustedContactScreen";
import RestoreAllContactListScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreAllContactListScreen";
import RestoreSelectedContactsListScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreSelectedContactsListScreen";
import RestoreWalletUsingTrustedContactQueAndAnwScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreWalletUsingTrustedContactQueAndAnwScreen";

import RestoreTrustedContactsShareScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreTrustedContactsShareScreen/RestoreTrustedContactsShareScreen";
import RestoreTrustedContactsQRCodeScanScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreTrustedContactsShareScreen/RestoreTrustedContactsQRCodeScanScreen";

import Restore3SelfShareScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreSelfShareScreen/Restore3SelfShareScreen";
import Restore3SelfSahreQRCodeScannerScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreSelfShareScreen/Restore3SelfSahreQRCodeScannerScreen";
import Restore4And5SelfShareScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreSelfShareScreen/Restore4And5SelfShareScreen";
import Restore4And5SelfShareQRCodeScanner from "../../screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreSelfShareScreen/Restore4And5SelfShareQRCodeScanner";

import WalletSetupScreens from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/WalletSetupScreens/WalletSetupScreens";
import PermissionAndroidScreen from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/PermissionAndroidScreen/PermissionAndroidScreen";
import SecretQuestionAndAnswerScreen from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/WalletSetupScreens/SecretQuestionAndAnswerScreen/SecretQuestionAndAnswerScreen";


import MoreScreen from "HexaWallet/src/screens/TabBarScreen/MoreScreen/MoreScreen";
import ContactSharedSecretList from "HexaWallet/src/screens/TabBarScreen/MoreScreen/ContactsSharedSecredYouScreen/ContactSharedSecretList";
import TrustedPartySelfShareQRCode from "HexaWallet/src/screens/TabBarScreen/MoreScreen/ContactsSharedSecredYouScreen/TrustedPartySelfShareQRCode";
import TrsutedPartyQRCodeScreen from "HexaWallet/src/screens/TabBarScreen/MoreScreen/ContactsSharedSecredYouScreen/TrsutedPartyQRCodeScreen";

//Tabbar screen
import QrCodeScannerScreen from "HexaWallet/src/screens/TabBarScreen/QrCodeScannerScreen/QrCodeScannerScreen";

//TODO: New Screen Hexa Wallet
import WalletScreen from "HexaWallet/src/screens/TabBarScreen/WalletScreen/WalletScreen";

//TODO: All Transaction Screen
import AllTransactionScreen from "HexaWallet/src/screens/TabBarScreen/AllTransactionScreen/AllTransactionScreen";

//TODO: Backup your Walleet Screen
import AllContactListScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/AllContactListScreen/AllContactListScreen";
import SecretSharingScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/SecretSharingScreen/SecretSharingScreen";
import TrustedContactScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/TrustedContactScreen/TrustedContactScreen";
import ShareSecretViaQRScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/ShareSecretViaQRScreen/ShareSecretViaQRScreen";

import SelectContactListAssociatePerson from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/BackUpTrustedPartySecretStoreScreen/SelectContactListAssociatePerson";
import TrustedContactAcceptOtpScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/BackUpTrustedPartySecretStoreScreen/TrustedContactAcceptOtpScreen";

//TODO: Settings  
import SettingsScreen from "HexaWallet/src/screens/DrawerScreen/SettingsScreen/SettingsScreen";

//TODO: Backup Wallet Mnemonic Screen
import BackupWalletMnemonicScreen from "HexaWallet/src/screens/DrawerScreen/BackupWalletMnemonicScreen/BackupWalletMnemonicScreen";
import BackupWalletMnemonicConfirmMnemonicScreen from "HexaWallet/src/screens/DrawerScreen/BackupWalletMnemonicScreen/BackupWalletMnemonicConfirmMnemonicScreen";

//TODO: Advanced Settings
import AdvancedSettingsScreen from "HexaWallet/src/screens/DrawerScreen/SettingsScreen/AdvancedSettingsScreen/AdvancedSettingsScreen";
import MnemonicDisplayScreen from "HexaWallet/src/screens/DrawerScreen/SettingsScreen/AdvancedSettingsScreen/MnemonicDisplayScreen/MnemonicDisplayScreen";


//TODO: Common Screen
import QRCodeScreen from "HexaWallet/src/screens/DrawerScreen/CommonScreens/QRCodeScreen";
import OTPScreen from "HexaWallet/src/screens/DrawerScreen/CommonScreens/OTPScreen";
import QRCodeScanScreen from "HexaWallet/src/screens/DrawerScreen/CommonScreens/QRCodeScanScreen";
import OTPBackupShareStore from "HexaWallet/src/screens/DrawerScreen/CommonScreens/OTPBackupShareStore";

//TODO: Backup Secure Account
import BackupSecureAccountScreen from "HexaWallet/src/screens/DrawerScreen/BackupSecureAccountScreen/BackupSecureAccountScreen";

//TODO: Restore Secure Account
import RestoreSecureAccountScreen from "HexaWallet/src/screens/DrawerScreen/RestoreSecureAccountScreen/RestoreSecureAccountScreen";

//TODO: Health of the App
import HealthOfTheAppScreen from "HexaWallet/src/screens/DrawerScreen/HealthOfTheAppScreen/HealthOfTheAppScreen";
import BackupSecretQuestionsScreen from "HexaWallet/src/screens/DrawerScreen/HealthOfTheAppScreen/BackupSecretQuestionsScreen/BackupSecretQuestionsScreen";
import BackupSecureTwoFactorAutoScreen from "HexaWallet/src/screens/DrawerScreen/HealthOfTheAppScreen/BackupSecureTwoFactorAutoScreen/BackupSecureTwoFactorAutoScreen";
import HealthCheckMnemonicScreen from "HexaWallet/src/screens/DrawerScreen/HealthOfTheAppScreen/HealthCheckMnemonicScreen/HealthCheckMnemonicScreen";
import SelfShareUsingWalletQRCode from "HexaWallet/src/screens/DrawerScreen/HealthOfTheAppScreen/SelfShareUsingWalletQRCode/SelfShareUsingWalletQRCode";
import SelfShareSharingScreen from "HexaWallet/src/screens/DrawerScreen/HealthOfTheAppScreen/SelfShareSharingScreen/SelfShareSharingScreen";
import ConfirmSelfShareQRScannerScreen from "HexaWallet/src/screens/DrawerScreen/HealthOfTheAppScreen/ConfirmSelfShareQRScannerScreen/ConfirmSelfShareQRScannerScreen";

//TODO: Payment Screen
import ReceivePaymentScreen from "HexaWallet/src/screens/DrawerScreen/PaymentScreen/ReceivePaymentScreen/ReceivePaymentScreen";
import SendPaymentScreen from "HexaWallet/src/screens/DrawerScreen/PaymentScreen/SendPaymentScreen/SendPaymentScreen";
import ConfirmAndSendPaymentScreen from "HexaWallet/src/screens/DrawerScreen/PaymentScreen/SendPaymentScreen/ConfirmAndSendPaymentScreen";
import SendPaymentAddressScanScreen from "HexaWallet/src/screens/DrawerScreen/PaymentScreen/SendPaymentScreen/SendPaymentAddressScanScreen";

//TODO: Account Transaction Screen
import TransactionScreen from "HexaWallet/src/screens/DrawerScreen/TransactionScreen/TransactionScreen";

// Static Screens
import AccountSS1 from "HexaWallet/src/screens/TabBarScreen/StaticScreen/Account/AccountSS1";
import AccountSS2 from "HexaWallet/src/screens/TabBarScreen/StaticScreen/Account/AccountSS2";
import ContactSS1 from "HexaWallet/src/screens/TabBarScreen/StaticScreen/Contact/ContactSS1";
import ContactSS2 from "HexaWallet/src/screens/TabBarScreen/StaticScreen/Contact/ContactSS2";
import ContactSS3 from "HexaWallet/src/screens/TabBarScreen/StaticScreen/Contact/ContactSS3";


//TODO: StackNavigator
const AccountSSNavigator = createStackNavigator(
  {
    AccountSS1: {
      screen: AccountSS1,
      navigationOptions: { header: null }
    },
    AccountSS2: {
      screen: AccountSS2,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "AccountSS1"
  }
);

const ContactSSNavigator = createStackNavigator(
  {
    ContactSS1: {
      screen: ContactSS1,
      navigationOptions: { header: null }
    },
    ContactSS2: {
      screen: ContactSS2,
      navigationOptions: { header: null }
    },
    ContactSS3: {
      screen: ContactSS3,
      navigationOptions: { header: null }
    }
  },
  { initialRouteName: "ContactSS1" }
);


//TODO: StackNavigator:ONBoarding
const OnBoardingStackNavigator = createStackNavigator(
  {
    OnBoarding: {
      screen: OnBoardingScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "OnBoarding"
  }
);

const RestoreWalletUsingMnemonicStackNavigator = createStackNavigator(
  {
    RestoreWalletUsingMnemonicScrren: {
      screen: RestoreWalletUsingMnemonicScrren,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "RestoreWalletUsingMnemonicScrren"
  }
);

const RestoreWalletUsingTrustedContactStackNavigator = createStackNavigator(
  {
    RestoreWalletUsingTrustedContactScreen: {
      screen: RestoreWalletUsingTrustedContactScreen,
      navigationOptions: { header: null }
    },
    RestoreSelectedContactsListScreen: {
      screen: RestoreSelectedContactsListScreen,
      navigationOptions: { header: null }
    },
    RestoreAllContactListScreen: {
      screen: RestoreAllContactListScreen,
      navigationOptions: { header: null }
    },
    RestoreTrustedContactsShareScreen: {
      screen: RestoreTrustedContactsShareScreen,
      navigationOptions: { header: null }
    },
    RestoreTrustedContactsQRCodeScanScreen: {
      screen: RestoreTrustedContactsQRCodeScanScreen,
      navigationOptions: { header: null }
    },
    Restore3SelfShareScreen: {
      screen: Restore3SelfShareScreen,
      navigationOptions: { header: null }
    },
    Restore3SelfSahreQRCodeScannerScreen: {
      screen: Restore3SelfSahreQRCodeScannerScreen,
      navigationOptions: { header: null }
    },
    Restore4And5SelfShareScreen: {
      screen: Restore4And5SelfShareScreen,
      navigationOptions: { header: null }
    },
    Restore4And5SelfShareQRCodeScanner: {
      screen: Restore4And5SelfShareQRCodeScanner,
      navigationOptions: { header: null }
    },
    RestoreWalletUsingTrustedContactQueAndAnwScreen: {
      screen: RestoreWalletUsingTrustedContactQueAndAnwScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "RestoreSelectedContactsListScreen"
  }
);


const RestoreWalletUsingTrustedContactAndroidStackNavigator = createStackNavigator(
  {
    PermissionAndroidScreen: {
      screen: PermissionAndroidScreen,
      navigationOptions: { header: null }
    },
    RestoreWalletUsingTrustedContactScreen: {
      screen: RestoreWalletUsingTrustedContactScreen,
      navigationOptions: { header: null }
    },
    RestoreSelectedContactsListScreen: {
      screen: RestoreSelectedContactsListScreen,
      navigationOptions: { header: null }
    },
    RestoreAllContactListScreen: {
      screen: RestoreAllContactListScreen,
      navigationOptions: { header: null }
    },
    RestoreTrustedContactsShareScreen: {
      screen: RestoreTrustedContactsShareScreen,
      navigationOptions: { header: null }
    },
    RestoreTrustedContactsQRCodeScanScreen: {
      screen: RestoreTrustedContactsQRCodeScanScreen,
      navigationOptions: { header: null }
    },
    Restore3SelfShareScreen: {
      screen: Restore3SelfShareScreen,
      navigationOptions: { header: null }
    },
    Restore3SelfSahreQRCodeScannerScreen: {
      screen: Restore3SelfSahreQRCodeScannerScreen,
      navigationOptions: { header: null }
    },
    Restore4And5SelfShareScreen: {
      screen: Restore4And5SelfShareScreen,
      navigationOptions: { header: null }
    },
    Restore4And5SelfShareQRCodeScanner: {
      screen: Restore4And5SelfShareQRCodeScanner,
      navigationOptions: { header: null }
    },
    RestoreWalletUsingTrustedContactQueAndAnwScreen: {
      screen: RestoreWalletUsingTrustedContactQueAndAnwScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "PermissionAndroidScreen"
  }
);


const RestoreAndWalletSetupStackNavigator = createStackNavigator(
  {
    RestoreAndReoverWalletScreen: {
      screen: RestoreAndReoverWalletScreen,
      navigationOptions: { header: null }
    },
    WalletSetupScreens: {
      screen: WalletSetupScreens,
      navigationOptions: { header: null }
    },
    PermissionAndroidScreen: {
      screen: PermissionAndroidScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "RestoreAndReoverWalletScreen"
  }
);

const TrustedPartyShareSecretStackNavigator = createStackNavigator(
  {
    ContactSharedSecretList: {
      screen: ContactSharedSecretList,
      navigationOptions: {
        header: null,
        tabBarVisible: false
      }
    },
    TrustedPartySelfShareQRCode: {
      screen: TrustedPartySelfShareQRCode,
      navigationOptions: { header: null }
    },
    TrsutedPartyQRCodeScreen: {
      screen: TrsutedPartyQRCodeScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "ContactSharedSecretList"
  }
);

//TODO: FirstTimeWalletSetupStackNavigatorRouter
const BackUpYourWalletStackNavigatorRouter = createStackNavigator(
  {
    AllContactListScreen: {
      screen: AllContactListScreen,
      navigationOptions: { header: null }
    },
    SecretSharingScreen: {
      screen: SecretSharingScreen,
      navigationOptions: { header: null }
    },
    TrustedContactScreen: {
      screen: TrustedContactScreen,
      navigationOptions: { header: null }
    },
    ShareSecretViaQRScreen: {
      screen: ShareSecretViaQRScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "AllContactListScreen"
  }
);

const BackUpYourWalletSecoundTimeStackNavigatorRouter = createStackNavigator(
  {
    SecretSharingScreen: {
      screen: SecretSharingScreen,
      navigationOptions: { header: null }
    },
    TrustedContactScreen: {
      screen: TrustedContactScreen,
      navigationOptions: { header: null }
    },
    ShareSecretViaQRScreen: {
      screen: ShareSecretViaQRScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "SecretSharingScreen"
  }
);

const TrustedContactStackNavigator = createStackNavigator(
  {
    TrustedContactScreen: {
      screen: TrustedContactScreen,
      navigationOptions: { header: null }
    },
    ShareSecretViaQRScreen: {
      screen: ShareSecretViaQRScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "TrustedContactScreen"
  }
);

const BackupTrustedPartrySecretStoreStackNavigator = createStackNavigator(
  {
    SelectContactListAssociatePerson: {
      screen: SelectContactListAssociatePerson,
      navigationOptions: { header: null }
    },
    TrustedContactAcceptOtpScreen: {
      screen: TrustedContactAcceptOtpScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "SelectContactListAssociatePerson"
  }
);

//TODO: SettingsScreen
const SettingsStackNavigator = createStackNavigator(
  {
    SettingsScreen: {
      screen: SettingsScreen,
      navigationOptions: { header: null }
    },
    BackupWalletMnemonicScreen: {
      screen: BackupWalletMnemonicScreen,
      navigationOptions: { header: null }
    },
    BackupWalletMnemonicConfirmMnemonicScreen: {
      screen: BackupWalletMnemonicConfirmMnemonicScreen,
      navigationOptions: { header: null }
    },
    AdvancedSettingsScreen: {
      screen: AdvancedSettingsScreen,
      navigationOptions: { header: null }
    },
    MnemonicDisplayScreen: {
      screen: MnemonicDisplayScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "AdvancedSettingsScreen"
  }
);

//TODO: HealthOfTheScreen Stack Navigator
const HealthOfTheAppStackNavigator = createStackNavigator(
  {
    HealthOfTheAppScreen: {
      screen: HealthOfTheAppScreen,
      navigationOptions: { header: null }
    },
    BackupSecretQuestionsScreen: {
      screen: BackupSecretQuestionsScreen,
      navigationOptions: { header: null }
    },
    BackupSecureTwoFactorAutoScreen: {
      screen: BackupSecureTwoFactorAutoScreen,
      navigationOptions: { header: null }
    },
    HealthCheckMnemonicScreen: {
      screen: HealthCheckMnemonicScreen,
      navigationOptions: { header: null }
    },
    SelfShareUsingWalletQRCode: {
      screen: SelfShareUsingWalletQRCode,
      navigationOptions: { header: null }
    },
    SelfShareSharingScreen: {
      screen: SelfShareSharingScreen,
      navigationOptions: { header: null }
    },
    ConfirmSelfShareQRScannerScreen: {
      screen: ConfirmSelfShareQRScannerScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "HealthOfTheAppScreen"
  }
);

//TODO: Backup Secure Account Stack Navigator

const BackupSecureAccountWithPdfStackNavigator = createStackNavigator(
  {
    BackupSecureAccountScreen: {
      screen: BackupSecureAccountScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "BackupSecureAccountScreen"
  }
);

//TODO: Restore Secure Account Stack Navigator
const ResotreSecureAccountStackNavigator = createStackNavigator(
  {
    RestoreSecureAccountScreen: {
      screen: RestoreSecureAccountScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "RestoreSecureAccountScreen"
  }
);

//TODO: Payment Navigation
//Receive Payment Stack Navigator
const ReceivePaymentStackNavigator = createStackNavigator(
  {
    ReceivePaymentScreen: {
      screen: ReceivePaymentScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "ReceivePaymentScreen"
  }
);

//Send Payment Stack Navigator
const SendPaymentStackNavigator = createStackNavigator(
  {
    SendPaymentScreen: {
      screen: SendPaymentScreen,
      navigationOptions: { header: null }
    },
    ConfirmAndSendPaymentScreen: {
      screen: ConfirmAndSendPaymentScreen,
      navigationOptions: { header: null }
    },
    SendPaymentAddressScanScreen: {
      screen: SendPaymentAddressScanScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "SendPaymentScreen"
  }
);

//TODO: Account Transaction StackNavigator
const AccountTransactionStackNavigator = createStackNavigator(
  {
    TransactionScreen: {
      screen: TransactionScreen,
      navigationOptions: { header: null }
    },
    RecieveNavigation: {
      screen: ReceivePaymentStackNavigator,
      navigationOptions: { header: null }
    },
    SendPaymentNavigation: {
      screen: SendPaymentStackNavigator,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "TransactionScreen"
  }
);

//TODO: TabNavigator
//TODO: TabNavigator:TabNavigator
const TabNavigator = createBottomTabNavigator(
  {
    WalletScreen: {
      screen: WalletScreen, //PaymentScreen,
      navigationOptions: {
        tabBarLabel: "Wallet", //localization("TabBarItem.Payment"),
        drawerLockMode: "locked-open",
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="wallet" color={ tintColor } size={ 22 } />
        )
      }
    },
    AllTransactionScreen: {
      screen: AllTransactionScreen,
      navigationOptions: {
        tabBarLabel: "Transaction", //localization("TabBarItem.Analytics"),
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="icon_transactions" color={ tintColor } size={ 22 } />
        )
      }
    },
    QrCodeScannerScreen: {
      screen: QrCodeScannerScreen,
      navigationOptions: {
        tabBarLabel: "QR", //localization("TabBarItem.Accounts"),
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="qr-codes" color={ tintColor } size={ 22 } />
        )
      }
    },

    More: {
      screen: MoreScreen,
      navigationOptions: {
        tabBarLabel: "More", //localization("TabBarItem.More"),
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="more-icon" color={ tintColor } size={ 22 } />
        )
      }
    }
  },
  {
    initialRouteName: "WalletScreen",
    tabBarOptions: {
      showLabel: true,
      //swipeEnabled: true,
      showIcon: true,
      activeTintColor: colors.appColor,
      labelStyle: {
        fontSize: 11,
        fontFamily: "FiraSans-Medium"
      },
      style: {
        backgroundColor: "#ffffff"
      },
      tabStyle: {}
    }
  }
);

//TODO: RootNavigator
//TODO: RootNavigator:createRootNavigator
export const createRootNavigator = (
  signedIn = false,
  screenName = "PasscodeScreen"
) => {
  return createStackNavigator(
    {
      PasscodeScreen: {
        screen: PasscodeScreen,
        navigationOptions: { header: null }
      },
      AccountSSNavigator: {
        screen: AccountSSNavigator,
        navigationOptions: { header: null }
      },
      ContactSSNavigator: {
        screen: ContactSSNavigator,
        navigationOptions: { header: null }
      },
      OnBoardingNavigator: {
        screen: OnBoardingStackNavigator,
        navigationOptions: { header: null }
      },
      PasscodeConfirmScreen: {
        screen: PasscodeConfirmScreen,
        navigationOptions: { header: null }
      },
      RestoreAndWalletSetupNavigator: {
        screen: RestoreAndWalletSetupStackNavigator,
        navigationOptions: { header: null }
      },
      RestoreWalletUsingMnemonicNavigator: {
        screen: RestoreWalletUsingMnemonicStackNavigator,
        navigationOptions: { header: null }
      },
      RestoreWalletUsingTrustedContactNavigator: {
        screen: RestoreWalletUsingTrustedContactStackNavigator,
        navigationOptions: { header: null }
      },
      RestoreWalletUsingTrustedContactAndroidNavigator: {
        screen: RestoreWalletUsingTrustedContactAndroidStackNavigator,
        navigationOptions: { header: null }
      },
      TabbarBottom: {
        screen: TabNavigator,
        navigationOptions: { header: null }
      },
      BackUpYourWalletNavigator: {
        screen: BackUpYourWalletStackNavigatorRouter,
        navigationOptions: { header: null }
      },
      BackUpYourWalletSecoundTimeNavigator: {
        screen: BackUpYourWalletSecoundTimeStackNavigatorRouter,
        navigationOptions: { header: null }
      },
      BackupTrustedPartrySecretNavigator: {
        screen: BackupTrustedPartrySecretStoreStackNavigator,
        navigationOptions: { header: null }
      },
      //also use deepling url navigaton
      TrustedPartyShareSecretNavigator: {
        screen: TrustedPartyShareSecretStackNavigator,
        navigationOptions: { header: null }
      },
      //TODO: Common Screens
      OTPScreenNavigator: {
        screen: OTPScreen,
        navigationOptions: { header: null }
      },
      OTPBackupShareStoreNavigator: {
        screen: OTPBackupShareStore,
        navigationOptions: { header: null }
      },
      //TODO: Settings
      SettingsNavigator: {
        screen: SettingsStackNavigator,
        navigationOptions: { header: null }
      },
      //TODO: HealthOfTheApp
      HealthOfTheAppNavigator: {
        screen: HealthOfTheAppStackNavigator,
        navigationOptions: { header: null }
      },
      TrustedContactNavigator: {
        screen: TrustedContactStackNavigator,
        navigationOptions: { header: null }
      },
      //TODO: Backup Secure Account
      BackupSecureAccountWithPdfNavigator: {
        screen: BackupSecureAccountWithPdfStackNavigator,
        navigationOptions: { header: null }
      },
      //TODO: Restore Secure Account
      ResotreSecureAccountNavigator: {
        screen: ResotreSecureAccountStackNavigator,
        navigationOptions: { header: null }
      },
      //TODO: Payment Navigation
      //ReceivePayment
      ReceivePaymentNavigator: {
        screen: ReceivePaymentStackNavigator,
        navigationOptions: { header: null }
      },
      //SentPayment
      SendPaymentNavigator: {
        screen: SendPaymentStackNavigator,
        navigationOptions: { header: null }
      },
      //TODO: Transaction Navigation
      AccountTransactionNavigator: {
        screen: AccountTransactionStackNavigator,
        navigationOptions: { header: null }
      }
      //Drwaer Navigation
      // SecurityScreen: {
      //   screen: SecurityScreen,
      //   navigationOptions: { header: null }
      // },
      // HelpScreen: {
      //   screen: HelpScreen,
      //   navigationOptions: { header: null }
      // },
      // InviteScreen: {
      //   screen: InviteScreen,
      //   navigationOptions: { header: null }
      // },
      // BankAccountScreen: {
      //   screen: BankAccountScreen,
      //   navigationOptions: { header: null }
      // },
      // LogoutScreen: {
      //   screen: LogoutScreen,
      //   navigationOptions: { header: null }
      // },
      // NotificationScreen: {
      //   screen: NotificationScreen,
      //   navigationOptions: { header: null }
      // },
      // //SentMoney And Receive Money
      // SentAndReceiveeScreen: {
      //   screen: SentAndReceiveeScreen,
      //   navigationOptions: {
      //     header: null
      //   }
      // },
      // SentMoneyScreen: {
      //   screen: SentMoneyScreen,
      //   navigationOptions: { header: null }
      // },
      // ReceiveMoneyScreen: {
      //   screen: ReceiveMoneyScreen,
      //   navigationOptions: { header: null }
      // },
      // QrcodeScannerScreen: {
      //   screen: QrcodeScannerScreen,
      //   navigationOptions: { header: null }
      // },
      // //Backup Phrase
      // BackupPhraseScreen: {
      //   screen: BackupPhraseScreen,
      //   navigationOptions: { header: null }
      // },
      // VerifyBackupPhraseScreen: {
      //   screen: VerifyBackupPhraseScreen,
      //   navigationOptions: { header: null }
      // },
      // //AccountDetailsScrenn
      // AccountsDetailsScreen: {
      //   screen: AccountsDetailsScreen,
      //   navigationOptions: { header: null }
      // },
      // //AccountDetailsOnboardingRouter
      // AccountDetailsOnboardingRouter: {
      //   screen: AccountDetailsOnboardingRouter,
      //   navigationOptions: { header: null }
      // },
      // //For DeepLinking
      // MergeConfirmJointAccountScreen: {
      //   screen: MergeConfirmJointAccountScreen,
      //   navigationOptions: { header: null }
      // },
      // CreateJointAccountScreen: {
      //   screen: CreateJointAccountScreen,
      //   navigationOptions: { header: null }
      // }
    },
    {
      //initialRouteName: signedIn ? "OnBoardingNavigator" : PasscodeConfirmScreen
      initialRouteName: signedIn ? "OnBoardingNavigator" : screenName //"TabbarBottom" //
      // initialRouteName: signedIn ? "OnBoardingNavigator" : "PermissionNavigator" //"TabbarBottom" //
      // initialRouteName: signedIn ? "OnBoardingNavigator" : "OnBoardingNavigator"
      // initialRouteName: signedIn ? "TabbarBottom" : "TabbarBottom"
    }
  );
};
