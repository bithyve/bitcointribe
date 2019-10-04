import React from "react";
import { colors } from "../constants/Constants";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";

// import { SvgIcon } from "@up-shared/components";
// //localization
// import { localization } from "HexaWallet/src/app/manage/Localization/i18n";

//TODO: RestoreAndWalletSetupScreen
//import { OnBoarding } from "hexaCompLanch";
import { OnBoarding } from "hexaCompLanch";

import { PasscodeConfirm, Passcode } from "hexaCompPasscode";


//  Restore And Wallet Setup
import {
  RestoreAndReoverWallet, WalletSetup,
  PermissionAndroid
} from "hexaCompRestoreAndWalletSetup";



//  Restore Wallet using Mnemonic
import { RestoreWalletUsingMnemonic } from "hexaCompRestoreWalletUsingMnemonic";

//  Restore Wallet using Trusted Contact
import {
  RestoreWalletUsingTrustedContact, RestoreAllContactList,
  RestoreSelectedContactsList, RestoreWalletUsingTrustedContactQueAndAnw,
  RestoreTrustedContactsShare, RestoreTrustedContactsQRCodeScanScreen,
  Restore3SelfShare, Restore3SelfSahreQRCodeScanner, Restore4And5SelfShare,
  Restore4And5SelfShareQRCodeScanner
} from "hexaCompRestoreWalletUsingTrustedContact";

//  More
import { More, ContactSharedSecretList, TrustedPartySelfShareQRCode, TrsutedPartyQRCode } from "hexaCompTabbarMore";

// TODO: QrcodeScan  
import { QrCodeScanner } from "hexaCompTabbarQrCodeScanner";

//  TODO: Wallet  
//import { Wallet } from "hexaCompTabbarWallet";

//  TODO: All Transaction     
import { AllTransaction } from "hexaCompTabbarAllTransaction";

// TODO: Backup your Wallet 
import {
  AllContactList, SecretSharing, TrustedContact, ShareSecretViaQR,
  SelectContactListAssociatePerson, TrustedContactAcceptOtp
} from "hexaCompBackUpYourWallet";

// TODO: Settings    
import { Settings, AdvancedSettings, MnemonicDisplay } from "hexaCompSettings";

// TODO: Backup Wallet Mnemonic Screen
import { BackupWalletMnemonic, BackupWalletMnemonicConfirmMnemonic } from "hexaCompBackupWalletMnemonic";

// TODO: Common Screen   
import { QRCode, OTP, QRCodeScan, OTPBackupShareStore } from "hexaCompCommon";

// TODO: Backup Secure Account
import { BackupSecureAccount } from "hexaCompBackupSecureAccount";



// TODO: Health of the App
import {
  HealthOfTheApp, BackupSecretQuestions, BackupSecureTwoFactorAuto,
  HealthCheckMnemonic, SelfShareUsingWalletQRCode, SelfShareSharing, ConfirmSelfShareQRScanner
} from "hexaCompHealthOfTheApp";


// TODO: Payment Screen
import { ReceivePayment, SendPayment, ConfirmAndSendPayment, SendPaymentAddressScan } from "hexaCompPayment";


// TODO: Account Transaction Screen
import { Transaction } from "hexaCompTransaction";



//TODO: StackNavigator:ONBoarding
const OnBoardingStackNavigator = createStackNavigator(
  {
    OnBoarding: {
      screen: OnBoarding,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "OnBoarding"
  }
);

const RestoreAndWalletSetupStackNavigator = createStackNavigator(
  {
    RestoreAndReoverWallet: {
      screen: RestoreAndReoverWallet,
      navigationOptions: { header: null }
    },
    WalletSetup: {
      screen: WalletSetup,
      navigationOptions: { header: null }
    },
    PermissionAndroid: {
      screen: PermissionAndroid,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "RestoreAndReoverWallet"
  }
);



// const RestoreWalletUsingMnemonicStackNavigator = createStackNavigator(
//   {
//     RestoreWalletUsingMnemonic: {
//       screen: RestoreWalletUsingMnemonic,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "RestoreWalletUsingMnemonic"
//   }
// );

// const RestoreWalletUsingTrustedContactStackNavigator = createStackNavigator(
//   {
//     RestoreWalletUsingTrustedContact: {
//       screen: RestoreWalletUsingTrustedContact,
//       navigationOptions: { header: null }
//     },
//     RestoreSelectedContactsList: {
//       screen: RestoreSelectedContactsList,
//       navigationOptions: { header: null }
//     },
//     RestoreAllContactList: {
//       screen: RestoreAllContactList,
//       navigationOptions: { header: null }
//     },
//     RestoreTrustedContactsShare: {
//       screen: RestoreTrustedContactsShare,
//       navigationOptions: { header: null }
//     },
//     RestoreTrustedContactsQRCodeScan: {
//       screen: RestoreTrustedContactsQRCodeScanScreen,
//       navigationOptions: { header: null }
//     },
//     Restore3SelfShare: {
//       screen: Restore3SelfShare,
//       navigationOptions: { header: null }
//     },
//     Restore3SelfSahreQRCodeScanner: {
//       screen: Restore3SelfSahreQRCodeScanner,
//       navigationOptions: { header: null }
//     },
//     Restore4And5SelfShare: {
//       screen: Restore4And5SelfShare,
//       navigationOptions: { header: null }
//     },
//     Restore4And5SelfShareQRCodeScanner: {
//       screen: Restore4And5SelfShareQRCodeScanner,
//       navigationOptions: { header: null }
//     },
//     RestoreWalletUsingTrustedContactQueAndAnw: {
//       screen: RestoreWalletUsingTrustedContactQueAndAnw,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "RestoreSelectedContactsList"
//   }
// );


// const RestoreWalletUsingTrustedContactAndroidStackNavigator = createStackNavigator(
//   {
//     PermissionAndroid: {
//       screen: PermissionAndroid,
//       navigationOptions: { header: null }
//     },
//     RestoreWalletUsingTrustedContact: {
//       screen: RestoreWalletUsingTrustedContact,
//       navigationOptions: { header: null }
//     },
//     RestoreSelectedContactsList: {
//       screen: RestoreSelectedContactsList,
//       navigationOptions: { header: null }
//     },
//     RestoreAllContactList: {
//       screen: RestoreAllContactList,
//       navigationOptions: { header: null }
//     },
//     RestoreTrustedContactsShare: {
//       screen: RestoreTrustedContactsShare,
//       navigationOptions: { header: null }
//     },
//     RestoreTrustedContactsQRCodeScan: {
//       screen: RestoreTrustedContactsQRCodeScanScreen,
//       navigationOptions: { header: null }
//     },
//     Restore3SelfShare: {
//       screen: Restore3SelfShare,
//       navigationOptions: { header: null }
//     },
//     Restore3SelfSahreQRCodeScanner: {
//       screen: Restore3SelfSahreQRCodeScanner,
//       navigationOptions: { header: null }
//     },
//     Restore4And5SelfShare: {
//       screen: Restore4And5SelfShare,
//       navigationOptions: { header: null }
//     },
//     Restore4And5SelfShareQRCodeScanner: {
//       screen: Restore4And5SelfShareQRCodeScanner,
//       navigationOptions: { header: null }
//     },
//     RestoreWalletUsingTrustedContactQueAndAnw: {
//       screen: RestoreWalletUsingTrustedContactQueAndAnw,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "PermissionAndroid"
//   }
// );




// const TrustedPartyShareSecretStackNavigator = createStackNavigator(
//   {
//     ContactSharedSecretList: {
//       screen: ContactSharedSecretList,
//       navigationOptions: {
//         header: null,
//         tabBarVisible: false
//       }
//     },
//     TrustedPartySelfShareQRCode: {
//       screen: TrustedPartySelfShareQRCode,
//       navigationOptions: { header: null }
//     },
//     TrsutedPartyQRCode: {
//       screen: TrsutedPartyQRCode,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "ContactSharedSecretList"
//   }
// );

// //TODO: FirstTimeWalletSetupStackNavigatorRouter
// const BackUpYourWalletStackNavigatorRouter = createStackNavigator(
//   {
//     AllContactListScreen: {
//       screen: AllContactList,
//       navigationOptions: { header: null }
//     },
//     SecretSharingScreen: {
//       screen: SecretSharing,
//       navigationOptions: { header: null }
//     },
//     TrustedContactScreen: {
//       screen: TrustedContact,
//       navigationOptions: { header: null }
//     },
//     ShareSecretViaQRScreen: {
//       screen: ShareSecretViaQR,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "AllContactListScreen"
//   }
// );

// const BackUpYourWalletSecoundTimeStackNavigatorRouter = createStackNavigator(
//   {
//     SecretSharingScreen: {
//       screen: SecretSharing,
//       navigationOptions: { header: null }
//     },
//     TrustedContactScreen: {
//       screen: TrustedContact,
//       navigationOptions: { header: null }
//     },
//     ShareSecretViaQRScreen: {
//       screen: ShareSecretViaQR,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "SecretSharingScreen"
//   }
// );

// const TrustedContactStackNavigator = createStackNavigator(
//   {
//     TrustedContactScreen: {
//       screen: TrustedContact,
//       navigationOptions: { header: null }
//     },
//     ShareSecretViaQRScreen: {
//       screen: ShareSecretViaQR,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "TrustedContactScreen"
//   }
// );

// const BackupTrustedPartrySecretStoreStackNavigator = createStackNavigator(
//   {
//     SelectContactListAssociatePerson: {
//       screen: SelectContactListAssociatePerson,
//       navigationOptions: { header: null }
//     },
//     TrustedContactAcceptOtpScreen: {
//       screen: TrustedContactAcceptOtp,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "SelectContactListAssociatePerson"
//   }
// );

// //TODO: SettingsScreen
// const SettingsStackNavigator = createStackNavigator(
//   {
//     SettingsScreen: {
//       screen: Settings,
//       navigationOptions: { header: null }
//     },
//     BackupWalletMnemonicScreen: {
//       screen: BackupWalletMnemonic,
//       navigationOptions: { header: null }
//     },
//     BackupWalletMnemonicConfirmMnemonicScreen: {
//       screen: BackupWalletMnemonicConfirmMnemonic,
//       navigationOptions: { header: null }
//     },
//     AdvancedSettingsScreen: {
//       screen: AdvancedSettings,
//       navigationOptions: { header: null }
//     },
//     MnemonicDisplayScreen: {
//       screen: MnemonicDisplay,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "AdvancedSettingsScreen"
//   }
// );

// //TODO: HealthOfTheScreen Stack Navigator
// const HealthOfTheAppStackNavigator = createStackNavigator(
//   {
//     HealthOfTheAppScreen: {
//       screen: HealthOfTheApp,
//       navigationOptions: { header: null }
//     },
//     BackupSecretQuestionsScreen: {
//       screen: BackupSecretQuestions,
//       navigationOptions: { header: null }
//     },
//     BackupSecureTwoFactorAutoScreen: {
//       screen: BackupSecureTwoFactorAuto,
//       navigationOptions: { header: null }
//     },
//     HealthCheckMnemonicScreen: {
//       screen: HealthCheckMnemonic,
//       navigationOptions: { header: null }
//     },
//     SelfShareUsingWalletQRCode: {
//       screen: SelfShareUsingWalletQRCode,
//       navigationOptions: { header: null }
//     },
//     SelfShareSharingScreen: {
//       screen: SelfShareSharing,
//       navigationOptions: { header: null }
//     },
//     ConfirmSelfShareQRScannerScreen: {
//       screen: ConfirmSelfShareQRScanner,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "HealthOfTheAppScreen"
//   }
// );

// //TODO: Backup Secure Account Stack Navigator

// const BackupSecureAccountWithPdfStackNavigator = createStackNavigator(
//   {
//     BackupSecureAccountScreen: {
//       screen: BackupSecureAccount,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "BackupSecureAccountScreen"
//   }
// );

// //TODO: Restore Secure Account Stack Navigator
// const ResotreSecureAccountStackNavigator = createStackNavigator(
//   {
//     RestoreSecureAccountScreen: {
//       screen: RestoreSecureAccount,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "RestoreSecureAccountScreen"
//   }
// );

// //TODO: Payment Navigation
// //Receive Payment Stack Navigator
// const ReceivePaymentStackNavigator = createStackNavigator(
//   {
//     ReceivePaymentScreen: {
//       screen: ReceivePayment,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "ReceivePaymentScreen"
//   }
// );

// //Send Payment Stack Navigator
// const SendPaymentStackNavigator = createStackNavigator(
//   {
//     SendPaymentScreen: {
//       screen: SendPayment,
//       navigationOptions: { header: null }
//     },
//     ConfirmAndSendPaymentScreen: {
//       screen: ConfirmAndSendPayment,
//       navigationOptions: { header: null }
//     },
//     SendPaymentAddressScanScreen: {
//       screen: SendPaymentAddressScan,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "SendPaymentScreen"
//   }
// );

// //TODO: Account Transaction StackNavigator
// const AccountTransactionStackNavigator = createStackNavigator(
//   {
//     TransactionScreen: {
//       screen: Transaction,
//       navigationOptions: { header: null }
//     },
//     RecieveNavigation: {
//       screen: ReceivePaymentStackNavigator,
//       navigationOptions: { header: null }
//     },
//     SendPaymentNavigation: {
//       screen: SendPaymentStackNavigator,
//       navigationOptions: { header: null }
//     }
//   },
//   {
//     initialRouteName: "TransactionScreen"
//   }
// );

//TODO: TabNavigator
//TODO: TabNavigator:TabNavigator
const TabNavigator = createBottomTabNavigator(
  {
    Wallet: {
      screen: AllTransaction, //Wallet,
      navigationOptions: {
        tabBarLabel: "Wallet", //localization("TabBarItem.Payment"),
        drawerLockMode: "locked-open",
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="wallet" color={ tintColor } size={ 22 } />
        )
      }
    },
    AllTransaction: {
      screen: AllTransaction,
      navigationOptions: {
        tabBarLabel: "Transaction", //localization("TabBarItem.Analytics"),
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="icon_transactions" color={ tintColor } size={ 22 } />
        )
      }
    },
    QrCodeScanner: {
      screen: QrCodeScanner,
      navigationOptions: {
        tabBarLabel: "QR", //localization("TabBarItem.Accounts"),
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="qr-codes" color={ tintColor } size={ 22 } />
        )
      }
    },

    More: {
      screen: More,
      navigationOptions: {
        tabBarLabel: "More", //localization("TabBarItem.More"),
        tabBarIcon: ( { tintColor } ) => (
          <SvgIcon name="more-icon" color={ tintColor } size={ 22 } />
        )
      }
    }
  },
  {
    initialRouteName: "Wallet",
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
      OnBoardingNavigator: {
        screen: OnBoardingStackNavigator,
        navigationOptions: { header: null }
      },
      PasscodeConfirmScreen: {
        screen: PasscodeConfirm,
        navigationOptions: { header: null }
      },
      PasscodeScreen: {
        screen: Passcode,
        navigationOptions: { header: null }
      },
      RestoreAndWalletSetupNavigator: {
        screen: RestoreAndWalletSetupStackNavigator,
        navigationOptions: { header: null }
      },
      TabbarBottom: {
        screen: TabNavigator,
        navigationOptions: { header: null }
      },
      // RestoreWalletUsingMnemonicNavigator: {
      //   screen: RestoreWalletUsingMnemonicStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // RestoreWalletUsingTrustedContactNavigator: {
      //   screen: RestoreWalletUsingTrustedContactStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // RestoreWalletUsingTrustedContactAndroidNavigator: {
      //   screen: RestoreWalletUsingTrustedContactAndroidStackNavigator,
      //   navigationOptions: { header: null }
      // },

      // BackUpYourWalletNavigator: {
      //   screen: BackUpYourWalletStackNavigatorRouter,
      //   navigationOptions: { header: null }
      // },
      // BackUpYourWalletSecoundTimeNavigator: {
      //   screen: BackUpYourWalletSecoundTimeStackNavigatorRouter,
      //   navigationOptions: { header: null }
      // },
      // BackupTrustedPartrySecretNavigator: {
      //   screen: BackupTrustedPartrySecretStoreStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //also use deepling url navigaton
      // TrustedPartyShareSecretNavigator: {
      //   screen: TrustedPartyShareSecretStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //TODO: Common Screens
      // OTPScreenNavigator: {
      //   screen: OTP,
      //   navigationOptions: { header: null }
      // },
      // OTPBackupShareStoreNavigator: {
      //   screen: OTPBackupShareStore,
      //   navigationOptions: { header: null }
      // },
      // //TODO: Settings
      // SettingsNavigator: {
      //   screen: SettingsStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //TODO: HealthOfTheApp
      // HealthOfTheAppNavigator: {
      //   screen: HealthOfTheAppStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // TrustedContactNavigator: {
      //   screen: TrustedContactStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //TODO: Backup Secure Account
      // BackupSecureAccountWithPdfNavigator: {
      //   screen: BackupSecureAccountWithPdfStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //TODO: Restore Secure Account
      // ResotreSecureAccountNavigator: {
      //   screen: ResotreSecureAccountStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //TODO: Payment Navigation
      // //ReceivePayment
      // ReceivePaymentNavigator: {
      //   screen: ReceivePaymentStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //SentPayment
      // SendPaymentNavigator: {
      //   screen: SendPaymentStackNavigator,
      //   navigationOptions: { header: null }
      // },
      // //TODO: Transaction Navigation
      // AccountTransactionNavigator: {
      //   screen: AccountTransactionStackNavigator,
      //   navigationOptions: { header: null }
      // }
    },
    {
      //initialRouteName: signedIn ? "OnBoardingNavigator" : PasscodeConfirmScreen
      initialRouteName: signedIn ? "OnBoardingNavigator" : screenName //"TabbarBottom" //
    }
  );
};
