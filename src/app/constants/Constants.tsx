import Config from "react-native-config";

//Colors  
var colors = {
  appColor: "#2595D6",
  tabbarActiveColor: "#2D71B6",
  black: "#000000",
  white: "#FFFFFF",
  Saving: "#E6A620",
  Secure: "#30A2F3",
  Vault: "#679F37",
  Joint: "#660000",
  placeholder: "#5F5F5F"
};

const assetsImages = "../../assets/images/";
var images = {
  appBackgound: require( assetsImages + "icon/mainBackgoundImage.png" ),
  appIcon: require( assetsImages + "appLogo.png" ),
  slideMenuIcon: require( assetsImages + "icon/slideMenuImage.jpg" ),
  LaunchScreen: {
    img1: require( assetsImages + "LaunchScrenn/screenbackground.png" ),
    img2: require( assetsImages + "LaunchScrenn/screenbackground1.png" ),
    img3: require( assetsImages + "LaunchScrenn/screenbackground2.png" ),
    hexaBaseCard: require( assetsImages + "LaunchScrenn/hexa_basecard.png" ),
    hexaLogo: require( assetsImages + "LaunchScrenn/hexalogo.png" )
  },
  onBoardingScreen: {
    onB1: require( assetsImages +
      "onBoardingScreen/illustration_multipleaccounts.png" ),
    onB2: require( assetsImages + "onBoardingScreen/illustration_security.png" ),
    onB3: require( assetsImages + "onBoardingScreen/illustration_share.png" )
  },
  RestoreRecoverScreen: {
    restore: require( assetsImages + "RestoreAndRecoverScreen/restore.png" ),
  },
  WalletRestoreUsingPassphrase: {
    walletrestored: require( assetsImages + "walletRestoreUsingPassphrase/illustration_walletrestored.png" ),
  },
  WalletSetupScreen: {
    WalletScreen: {
      backgoundImage: require( assetsImages + "SetUpWallet/background.png" )
    }
  },
  loginScreen: {
    backgoundImage: require( assetsImages + "loginscreen/loginBackgound.jpg" ),
    faceIdImage: require( assetsImages + "loginscreen/faceid.png" )
  },
  backupPhraseScreen: {
    backupPhraseLogo: require( assetsImages +
      "backupPhraseScreen/backupPhraseLogo.png" )
  },
  verifyBackupPhraseScreen: {
    verifyBackupPhraseLogo: require( assetsImages +
      "verifyBackupPhraseScreen/correctOrder.png" )
  },
  paymentScreen: {
    cardSideBitcon: require( assetsImages + "paymentScreen/bitcoin1.jpg" ),
    cardSideBitcon1: require( assetsImages + "paymentScreen/bitcoin2.png" )
  },
  accounts: {
    Savings: require( assetsImages + "accountTypesCard/Savings.png" ),
    Secure: require( assetsImages + "accountTypesCard/Secure.png" ),
    Vault: require( assetsImages + "accountTypesCard/Savings.png" ),
    Joint: require( assetsImages + "accountTypesCard/Secure.png" ),
    unknown: require( assetsImages + "accountTypesCard/Savings.png" )
  },
  accountDetailsOnBoarding: {
    secureAccount: {
      img1: require( assetsImages +
        "accountDetailsOnBoarding/secureAccount/sec01.jpg" ),
      img2: require( assetsImages +
        "accountDetailsOnBoarding/secureAccount/sec02.png" ),
      img3: require( assetsImages +
        "accountDetailsOnBoarding/secureAccount/sec03.png" )
    },
    jointAccount: {
      img1: require( assetsImages +
        "accountDetailsOnBoarding/jointAccount/joint01.jpg" ),
      img2: require( assetsImages +
        "accountDetailsOnBoarding/secureAccount/sec02.png" ),
      img3: require( assetsImages +
        "accountDetailsOnBoarding/jointAccount/joint03.jpg" )
    },
    vaultAccount: {
      img1: require( assetsImages +
        "accountDetailsOnBoarding/vaultAccount/vault001.png" ),
      img2: require( assetsImages +
        "accountDetailsOnBoarding/vaultAccount/vault02.png" )
    }
  },
  secureAccount: {
    secureLogo: require( assetsImages + "secureAccount/secureAccountLogo.png" ),
    validationKey: require( assetsImages + "secureAccount/validationKey.png" )
  },
  walletScreen: {
    "sheild_1": require( assetsImages + "WalletScreen/sheild_1.png" ),
    "sheild_2": require( assetsImages + "WalletScreen/sheild_2.png" ),
  }
};

//Local Database
var localDB = {
  dbName: Config.DB_NAME,
  tableName: {
    tblUser: Config.DB_TBL_USER,
    tblWallet: Config.DB_TBL_WALLET,
    tblAccountType: Config.DB_TBL_ACCOUNTTYPE,
    tblAccount: Config.DB_TBL_ACCOUNT,
    tblTransaction: Config.DB_TBL_TRANSACTION,
    tblSSSDetails: Config.DB_TBL_SSSDETAILS,
    tblTrustedPartySSSDetails: Config.DB_TBL_TBLTRUSTEDPARTYSSSDETAILS
  }
};

var notification = {
  notifi_UserDetialsChange: "notifi_UserDetialsChange"
};

var asyncStorageKeys = {
  rootViewController: "rootViewController",
  flag_PasscodeCreate: "flag_PasscodeCreate"
}

export {
  localDB,
  colors,
  images,
  notification,
  asyncStorageKeys
};
