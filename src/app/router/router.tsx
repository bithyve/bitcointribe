import React from "react";
import { colors, images } from "../constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import {
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator
} from "react-navigation";
import { StyleSheet, Platform } from "react-native";
import { SvgIcon } from "@up-shared/components";



//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

//TODO: RestoreAndWalletSetupScreen  
import OnBoardingScreen from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/OnBoardingScreen/OnBoardingScreen";
import PasscodeScreen from "HexaWallet/src/screens/PasscodeScreen/PasscodeScreen";
import PasscodeConfirmScreen from "HexaWallet/src/screens/PasscodeScreen/PasscodeConfirmScreen";
import RestoreAndReoverWalletScreen from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/RestoreAndReoverWalletScreen/RestoreAndReoverWalletScreen";

import RestoreWalletUsingMnemonicScrren from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingMnemonicScreen/RestoreWalletUsingMnemonicScrren";

import RestoreWalletUsingTrustedContactScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreWalletUsingTrustedContactScreen";
import RestoreAllContactListScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreAllContactListScreen";
import RestoreSelectedContactsListScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreSelectedContactsListScreen";
import RestoreWalletUsingTrustedContactQueAndAnwScreen from "HexaWallet/src/screens/DrawerScreen/RestoreWalletUsingTrustedContactScreen/RestoreWalletUsingTrustedContactQueAndAnwScreen";



import WalletSetupScreens from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/WalletSetupScreens/WalletSetupScreens";
import PermissionScreen from "HexaWallet/src/screens/RestoreAndWalletSetupScreen/PermissionScreen/PermissionScreen";

// import BackupPhraseScreen from "bithyve/src/screens/WalletScreen/BackupPhraseScreen/BackupPhraseScreen";
// import VerifyBackupPhraseScreen from "bithyve/src/screens/WalletScreen/VerifyBackupPhraseScreen/VerifyBackupPhraseScreen";

// //Tabbar Bottom
// import PaymentScreen from "bithyve/src/screens/TabBarScreen/PaymentScreen/PaymentScreen";
// import AnalyticsScreen from "bithyve/src/screens/TabBarScreen/AnalyticsScreen/AnalyticsScreen";
// import AccountsScreen from "bithyve/src/screens/TabBarScreen/AccountsScreen/AccountsScreen";
// import CardsScreen from "bithyve/src/screens/TabBarScreen/CardsScreen/CardsScreen";
import SettingScreen from "HexaWallet/src/screens/TabBarScreen/SettingScreen/SettingScreen";
import ContactSharedSecretList from "HexaWallet/src/screens/TabBarScreen/SettingScreen/ContactsSharedSecredYouScreen/ContactSharedSecretList";
//
// //Left DrawerScreen
// import SecurityScreen from "bithyve/src/screens/DrawerScreen/SecurityScreen/SecurityScreen";
// import HelpScreen from "bithyve/src/screens/DrawerScreen/HelpScreen/HelpScreen";
// import InviteScreen from "bithyve/src/screens/DrawerScreen/InviteScreen/InviteScreen";
// import BankAccountScreen from "bithyve/src/screens/DrawerScreen/BankAccountScreen/BankAccountScreen";
// import LogoutScreen from "bithyve/src/screens/DrawerScreen/LogoutScreen/LogoutScreen";
// import DrawerScreen from "bithyve/src/screens/DrawerScreen/DrawerScreen/DrawerScreen";
// import SentAndReceiveeScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/SentAndReceiveeScreen";
// import SentMoneyScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/SentMoneyScreen/SentMoneyScreen";
// import ReceiveMoneyScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/ReceiveMoneyScreen/ReceiveMoneyScreen";
// import QrcodeScannerScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/QrcodeScannerScreen/QrcodeScannerScreen";
//
// import AccountsDetailsScreen from "bithyve/src/screens/DrawerScreen/AccountsDetailsScreen/AccountsDetailsScreen";
// import RecentTransactionsScreen from "bithyve/src/screens/TabBarScreen/AccountsScreen/RecentTransactionsScreen/RecentTransactionsScreen";
// import TransactionDetailsWebViewScreen from "bithyve/src/screens/TabBarScreen/AccountsScreen/RecentTransactionsScreen/TransactionDetailsWebViewScreen/TransactionDetailsWebViewScreen";
//
// //TODO:  Account
// import AccountDetailsOnboardingScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/AccountDetailsOnboardingScreen";
// import SecureAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/SecureAccountScreen/SecureAccountScreen";
// import SecureSecretKeyScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/SecureAccountScreen/SecureSecretKeyScreen/SecureSecretKeyScreen";
// import ValidateSecureAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/SecureAccountScreen/ValidateSecureAccountScreen/ValidateSecureAccountScreen";
// import CreateJointAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/JointAccountScreen/CreateJointAccountScreen";
// import MergeConfirmJointAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/JointAccountScreen/MergeConfirmJointAccountScreen";
//
// import VaultAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/VaultAccountScreen/VaultAccountScreen";
// //Right DrawerScreen
// import NotificationScreen from "bithyve/src/screens/DrawerScreen/NotificationScreen/NotificationScreen";

//Tabbar screen
import QrCodeScannerScreen from "HexaWallet/src/screens/TabBarScreen/QrCodeScannerScreen/QrCodeScannerScreen";


//TODO: New Screen Hexa Wallet
import WalletScreen from "HexaWallet/src/screens/TabBarScreen/WalletScreen/WalletScreen";

//TODO: Backup your Walleet Screen
import AllContactListScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/AllContactListScreen/AllContactListScreen";
import SecretSharingScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/SecretSharingScreen/SecretSharingScreen";
import TrustedContactScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/TrustedContactScreen/TrustedContactScreen";
import ShareSecretViaQRScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/ShareSecretViaQRScreen/ShareSecretViaQRScreen";

import SelectContactListAssociatePerson from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/BackUpTrustedPartySecretStoreScreen/SelectContactListAssociatePerson";
import TrustedContactAcceptOtpScreen from "HexaWallet/src/screens/DrawerScreen/BackUpYourWalletScreen/BackUpTrustedPartySecretStoreScreen/TrustedContactAcceptOtpScreen";

//TODO: Settings 
import MnemonicShowScreen from "HexaWallet/src/screens/TabBarScreen/SettingScreen/MnemonicShowScreen/MnemonicShowScreen";


//TODO: Backup Wallet Mnemonic Screen      
import BackupWalletMnemonicScreen from "HexaWallet/src/screens/DrawerScreen/BackupWalletMnemonicScreen/BackupWalletMnemonicScreen";
import BackupWalletMnemonicConfirmMnemonicScreen from "HexaWallet/src/screens/DrawerScreen/BackupWalletMnemonicScreen/BackupWalletMnemonicConfirmMnemonicScreen";


//TODO: Common Screen  
import QRCodeScreen from "HexaWallet/src/screens/DrawerScreen/CommonScreens/QRCodeScreen";
import OTPScreen from "HexaWallet/src/screens/DrawerScreen/CommonScreens/OTPScreen";
import QRCodeScanScreen from "HexaWallet/src/screens/DrawerScreen/CommonScreens/QRCodeScanScreen";
import OTPBackupShareStore from "HexaWallet/src/screens/DrawerScreen/CommonScreens/OTPBackupShareStore";













//TODO: StackNavigator

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
    RestoreAllContactListScreen: {
      screen: RestoreAllContactListScreen,
      navigationOptions: { header: null }
    },
    RestoreSelectedContactsListScreen: {
      screen: RestoreSelectedContactsListScreen,
      navigationOptions: { header: null }
    },
    QRCodeScreen: {
      screen: QRCodeScreen,
      navigationOptions: { header: null }
    },
    QRCodeScanScreen: {
      screen: QRCodeScanScreen,
      navigationOptions: { header: null }
    },
    RestoreWalletUsingTrustedContactQueAndAnwScreen: {
      screen: RestoreWalletUsingTrustedContactQueAndAnwScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "RestoreWalletUsingTrustedContactScreen"
  }
);



const RestoreWalletUsingTrustedContactStackNavigator1 = createStackNavigator(
  {
    RestoreWalletUsingTrustedContactScreen: {
      screen: RestoreWalletUsingTrustedContactScreen,
      navigationOptions: { header: null }
    },
    RestoreAllContactListScreen: {
      screen: RestoreAllContactListScreen,
      navigationOptions: { header: null }
    },
    RestoreSelectedContactsListScreen: {
      screen: RestoreSelectedContactsListScreen,
      navigationOptions: { header: null }
    },
    QRCodeScreen: {
      screen: QRCodeScreen,
      navigationOptions: { header: null }
    },
    QRCodeScanScreen: {
      screen: QRCodeScanScreen,
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



const RestoreAndWalletSetupStackNavigator = createStackNavigator(
  {
    RestoreAndReoverWalletScreen: {
      screen: RestoreAndReoverWalletScreen,
      navigationOptions: { header: null }
    },
    WalletSetupScreens: {
      screen: WalletSetupScreens,
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
    QRCodeScreen: {
      screen: QRCodeScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "ContactSharedSecretList"
  }
);

//TODO: StackNavigator: JointAccountStackRouter
// const JointAccountStackRouter = createStackNavigator(
//   {
//     CreateJointAccountScreen: {
//       screen: CreateJointAccountScreen,
//       navigationOptions: { header: null }
//     },
//     ReceiveMoneyScreen: {
//       screen: ReceiveMoneyScreen,
//       navigationOptions: { header: null }
//     },
//     QrcodeScannerScreen: {
//       screen: QrcodeScannerScreen,
//       navigationOptions: { header: null }
//     },
//     MergeConfirmJointAccountScreen: {
//       screen: MergeConfirmJointAccountScreen,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "CreateJointAccountScreen"
//   }
// );

//TODO: StackNavigator:AccountDetailsOnboardingRouter

// const AccountDetailsOnboardingRouter = createStackNavigator(
//   {
//     AccountDetailsOnboardingScreen: {
//       screen: AccountDetailsOnboardingScreen,
//       navigationOptions: { header: null }
//     },
//     SecureAccountScreen: {
//       screen: SecureAccountScreen,
//       navigationOptions: { header: null }
//     },
//     SecureSecretKeyScreen: {
//       screen: SecureSecretKeyScreen,
//       navigationOptions: { header: null }
//     },
//     ValidateSecureAccountScreen: {
//       screen: ValidateSecureAccountScreen,
//       navigationOptions: { header: null }
//     },
//     CreateJointAccountScreen: {
//       screen: JointAccountStackRouter,
//       navigationOptions: { header: null }
//     },
//     VaultAccountScreen: {
//       screen: VaultAccountScreen,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "AccountDetailsOnboardingScreen"
//   }
// );

//TODO: StackNavigator:AccountStackNavigatorRouter
// const AccountStackNavigatorRouter = createStackNavigator(
//   {
//     AccountsScreen: {
//       screen: AccountsScreen,
//       navigationOptions: { header: null }
//     },
//     RecentTransactionsScreen: {
//       screen: RecentTransactionsScreen,
//       navigationOptions: { header: null }
//     },
//     TransactionDetailsWebViewScreen: {
//       screen: TransactionDetailsWebViewScreen,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "AccountsScreen"
//   }
// );


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
    MnemonicShowScreen: {
      screen: MnemonicShowScreen,
      navigationOptions: { header: null }
    },
    BackupWalletMnemonicScreen: {
      screen: BackupWalletMnemonicScreen,
      navigationOptions: { header: null }
    },
    BackupWalletMnemonicConfirmMnemonicScreen: {
      screen: BackupWalletMnemonicConfirmMnemonicScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "MnemonicShowScreen"
  } );


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
    Analytics: {
      screen: WalletScreen,
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

    Settings: {
      screen: SettingScreen,
      navigationOptions: {
        tabBarLabel: "Settings", //localization("TabBarItem.More"),
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="more-icon" color={ tintColor } size={ 22 } />
        ),
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

//TODO: DrawerNavigator
//TODO: DrawerNavigator:LeftDrawerNavigator
// const LeftDrawerNavigator = createDrawerNavigator(
//   {
//     Home: {
//       screen: TabNavigator,
//       navigationOptions: {
//         drawerLabel: "Home",
//         drawerIcon: ( { tintColor } ) => <Icon name="home" size={ 17 } />
//       }
//     }
//   },

//   {
//     initialRouteName: "Home",
//     //  contentComponent: DrawerScreen,
//     drawerPosition: "left",
//     drawerOpenRoute: "DrawerOpen",
//     drawerCloseRoute: "DrawerClose",
//     drawerToggleRoute: "DrawerToggle",
//     contentOptions: {
//       activeTintColor: "#e91e63",
//       style: {
//         flex: 1,
//         paddingTop: 15
//       }
//     }
//   }
// );

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
      RestoreWalletUsingTrustedContactNavigator1: {
        screen: RestoreWalletUsingTrustedContactStackNavigator1,
        navigationOptions: { header: null }
      },
      PermissionNavigator: {
        screen: PermissionScreen,
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

