import Config from "react-native-config";
import { Platform } from "react-native";


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
  },
  helperScreen: {
    "helper1": require( assetsImages + "helper/helper1.png" ),
    "helper2": require( assetsImages + "helper/helper2.png" ),
    "helper3": require( assetsImages + "helper/helper3.png" ),
    "helper4": require( assetsImages + "helper/helper4.png" ),
    "helper5": require( assetsImages + "helper/helper5.png" ),
    "helper6": require( assetsImages + "helper/helper6.png" ),
  }
};


const assetsSVG = "../../assets/svg/";
const svgIcon = {
  common: {
    //png       
    histroy_HexaPNG: require( assetsSVG + "common/image_hexa.png" ),
    //svg         
    histroy_HexaSVG: require( assetsSVG + "common/image_hexa.svg" ),
  },
  healthoftheapp: {
    //png     
    trustedcontactsPNG: require( assetsSVG + "healthoftheapp/trustedcontacts.png" ),
    selectcontactsPNG: require( assetsSVG + "healthoftheapp/selectcontacts.png" ),
    selfsharePNG: require( assetsSVG + "healthoftheapp/selfshare.png" ),
    walletPNG: require( assetsSVG + "healthoftheapp/wallet.png" ),
    emailPNG: require( assetsSVG + "healthoftheapp/email.png" ),
    cloudstoragePNG: require( assetsSVG + "healthoftheapp/cloudstorage.png" ),
    secretquestionsPNG: require( assetsSVG + "healthoftheapp/secretquestions.png" ),
    questionPNG: require( assetsSVG + "healthoftheapp/question.png" ),
    //svg   
    trustedcontactsSVG: require( assetsSVG + "healthoftheapp/trustedcontacts.svg" ),
    selectcontactsSVG: require( assetsSVG + "healthoftheapp/selectcontacts.svg" ),
    selfshareSVG: require( assetsSVG + "healthoftheapp/selfshare.svg" ),
    walletSVG: require( assetsSVG + "healthoftheapp/wallet.svg" ),
    emailSVG: require( assetsSVG + "healthoftheapp/email.svg" ),
    cloudstorageSVG: require( assetsSVG + "healthoftheapp/cloudstorage.svg" ),
    secretquestionsSVG: require( assetsSVG + "healthoftheapp/secretquestions.svg" ),
    questionSVG: require( assetsSVG + "healthoftheapp/question.svg" ),
  },
  walletScreen: {
    //png
    dailyAccountPNG: require( assetsSVG + "walletscreen/dailywallet.png" ),
    secureAccountPNG: require( assetsSVG + "walletscreen/icon_securewallet.png" ),
    addAccountsPNG: require( assetsSVG + "walletscreen/icon_add.png" ),
    testCoinsPNG: require( assetsSVG + "walletscreen/coins.png" ),
    secureAccount2FAPNG: require( assetsSVG + "walletscreen/2FA.png" ),
    //svg
    dailyAccountSVG: require( assetsSVG + "walletscreen/dailywallet.svg" ),
    secureAccountSVG: require( assetsSVG + "walletscreen/icon_securewallet.svg" ),
    addAccountsSVG: require( assetsSVG + "walletscreen/icon_add.svg" ),
    testCoinsSVG: require( assetsSVG + "walletscreen/coins.svg" ),
    secureAccount2FASVG: require( assetsSVG + "walletscreen/2FA.svg" ),
  },
  transactionScreen: {
    //png
    PNG1: require( assetsSVG + "transactionScreen/icon_shieldred_mark.png" ),
    PNG2: require( assetsSVG + "transactionScreen/icon_shieldred.png" ),
    PNG3: require( assetsSVG + "transactionScreen/icon_shieldyellow.png" ),
    PNG4: require( assetsSVG + "transactionScreen/icon_shieldgreen.png" ),
    PNG5: require( assetsSVG + "transactionScreen/icon_shieldgreen_tick.png" ),
    //svg   
    SVG1: require( assetsSVG + "transactionScreen/icon_shieldred_mark.svg" ),
    SVG2: require( assetsSVG + "transactionScreen/icon_shieldred.svg" ),
    SVG3: require( assetsSVG + "transactionScreen/icon_shieldyellow.svg" ),
    SVG4: require( assetsSVG + "transactionScreen/icon_shieldgreen.svg" ),
    SVG5: require( assetsSVG + "transactionScreen/icon_shieldgreen_tick.svg" ),
  },
  moreScreen: {
    //png  
    healthPNG: require( assetsSVG + "moreScreen/icon_health.png" ),
    backupMethodPNG: require( assetsSVG + "moreScreen/secretcontacts.png" ),
    addressBookPNG: require( assetsSVG + "moreScreen/icon_contacts.png" ),
    settingsPNG: require( assetsSVG + "moreScreen/icon_settings.png" ),
    //svg      
    healthSVG: require( assetsSVG + "moreScreen/icon_health.svg" ),
    backupMethodSVG: require( assetsSVG + "moreScreen/secretcontacts.svg" ),
    addressBookSVG: require( assetsSVG + "moreScreen/icon_contacts.svg" ),
    settingsSVG: require( assetsSVG + "moreScreen/icon_settings.svg" ),
  },
  bottomModel: {
    //png     
    recreatePNG: require( assetsSVG + "bottomModel/recreate.png" ),
    resharePNG: require( assetsSVG + "bottomModel/reshare.png" ),
    //svg                                              
    recreateSVG: require( assetsSVG + "bottomModel/recreate.svg" ),
    reshareSVG: require( assetsSVG + "bottomModel/reshare.svg" ),
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
  flag_BackgoundApp: "flag_BackgoundApp",

  //heperScreen
  flagHelperWalletScreen: "flagHelperWalletScreen",
  flagHealthOfTheAppScreen: "flagHealthOfTheAppScreen"
}

var expaire = {
  trustedContactScreen: {
    expaire_otptime: Config.EXPAIRE_OTPTIME
  }
}

var delayTime = {
  walletScreen: {
    delay_qrcodeimage: Platform.OS == "ios" ? 2000 : 4000, //Platform.OS === "ios" ? Config.Delay_WalletScreenQRCODECREATEIOS : Config.Delay_WalletScreenQRCODECREATEANDROID
  }
}

export {
  localDB,
  colors,
  images,
  svgIcon,
  notification,
  asyncStorageKeys,
  expaire,
  delayTime
};
