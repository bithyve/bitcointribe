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
const assetsGift = "../../assets/gif/";
var images = {
  appBackgound: require( assetsImages + "icon/mainBackgoundImage.png" ),
  appIcon: require( assetsImages + "appLogo.png" ),
  gif: {
    loader: require( assetsGift + "loader.gif" ),
  },
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
    onB3: require( assetsImages + "onBoardingScreen/illustration_share.png" ),
    simpleSecureSmart: require( assetsImages + "onBoardingScreen/illustration.png" ),
  },
  RestoreRecoverScreen: {
    restore: require( assetsImages + "RestoreAndRecoverScreen/restore.png" ),
  },
  RestoreWalletUsingMnemonic: {
    walletrestored: require( assetsImages + "walletRestoreUsingPassphrase/illustration_walletrestored.png" ),
  },
  RestoreWalletUsingTrustedContact: {
    contactPassbook: require( assetsImages + "RestoreWalletUsingTrustedContact/ContactsPassbook.png" ),
    share4and5SelfShareInfo: require( assetsImages + "RestoreWalletUsingTrustedContact/restore4and5sharebgimage.jpg" ),
    successImage: require( assetsImages + "RestoreWalletUsingTrustedContact/restoreWalletTrustedContactSuccess.png" ),
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
    "sheild_3": require( assetsImages + "WalletScreen/sheild_3.png" ),
    "sheild_4": require( assetsImages + "WalletScreen/sheild_4.png" ),
    "sheild_5": require( assetsImages + "WalletScreen/sheild_5.png" ),
  },
  backupSecureAccount: {
    "steps": require( assetsImages + "backupSecureAccount/backupsecureAccount.png" ),
    "failedBackup": require( assetsImages + "icon/illustration_unsucessful.png" ),
  },
  retoreSeecureAccount: {
    "steps": require( assetsImages + "icon/RestoreSecureAccount.png" ),
  },
  backupSecretQuestion: {
    "icon": require( assetsImages + "backupSecretQuestions/icon_shieldred.png" ),
  },
  backupSecureTwoFactorAuto: {
    "icon": require( assetsImages + "backupSecureTwoFactorAuto/icon_shieldyellow.png" ),
  }
};


const assetsSVG = "../../assets/svg/";
const svgIcon = {
  common: {
    histroy_Hexa: require( assetsSVG + "common/image_hexa.svg" ),
  },
  healthoftheapp: {
    trustedcontacts: require( assetsSVG + "healthoftheapp/trustedcontacts.svg" ),
    selectcontacts: require( assetsSVG + "healthoftheapp/selectcontacts.svg" ),
    selfshare: require( assetsSVG + "healthoftheapp/selfshare.svg" ),
    wallet: require( assetsSVG + "healthoftheapp/wallet.svg" ),
    email: require( assetsSVG + "healthoftheapp/email.svg" ),
    cloudstorage: require( assetsSVG + "healthoftheapp/cloudstorage.svg" ),
    secretquestions: require( assetsSVG + "healthoftheapp/secretquestions.svg" ),
    question: require( assetsSVG + "healthoftheapp/question.svg" ),
  },
  walletScreen: {
    dailyAccount: require( assetsSVG + "walletscreen/icon_dailywallet.svg" ),
    secureAccount: require( assetsSVG + "walletscreen/icon_securewallet.svg" ),
    addAccounts: require( assetsSVG + "walletscreen/icon_add.svg" ),
    testCoins: require( assetsSVG + "walletscreen/coins.svg" ),
    secureAccount2FA: require( assetsSVG + "walletscreen/2FA.svg" ),
  },
  transactionScreen: {
    1: require( assetsSVG + "transactionScreen/icon_shieldred_mark.svg" ),
    2: require( assetsSVG + "transactionScreen/icon_shieldred.svg" ),
    3: require( assetsSVG + "transactionScreen/icon_shieldyellow.svg" ),
    4: require( assetsSVG + "transactionScreen/icon_shieldgreen.svg" ),
    5: require( assetsSVG + "transactionScreen/icon_shieldred_mark.svg" )
  },
  moreScreen: {
    health: require( assetsSVG + "moreScreen/icon_health.svg" ),
    backupMethod: require( assetsSVG + "moreScreen/secretcontacts.svg" ),
    addressBook: require( assetsSVG + "moreScreen/icon_contacts.svg" ),
    settings: require( assetsSVG + "moreScreen/icon_settings.svg" ),
  },
  bottomModel: {
    recreate: require( assetsSVG + "bottomModel/recreate.svg" ),
    reshare: require( assetsSVG + "bottomModel/reshare.svg" ),
  }
}


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
  flag_PasscodeCreate: "flag_PasscodeCreate",
  regularClassObject: "regularClassObject",
  secureClassObject: "secureClassObject",
  s3ServiceClassObject: "s3ServiceClassObject",
  flag_BackgoundApp: "flag_BackgoundApp"
}

var expaire = {
  backup: {
    expaire_secretquestion: Config.EXPAIRE_SECRETQUESTION,
    expaire_otptime: Config.EXPAIRE_OTPTIME
  }
}

export {
  localDB,
  colors,
  images,
  svgIcon,
  notification,
  asyncStorageKeys,
  expaire
};
