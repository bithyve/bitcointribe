import Config from "react-native-config";

//Error Messages
var errorMessage = {
  cancel: Config.MES_ERROR_CANCEL,
  ok: Config.MES_ERROR_OK,
  thanks: Config.MES_ERROR_THANKS,
  logout_Title: Config.MES_ERROR_LOGOUT,
  logout_message: Config.MES_ERROR_LOGOUT_MESSAGE,
  aLERT_Title: Config.MES_ERROR_ALERT_TITLE,
  aPI_FAILED: Config.MES_ERROR_API_FAILED,
  internet_ErrorTitle: Config.MES_ERROR_INTERNET_ERROR_TITLE,
  fAILED_INTERNET: Config.MES_ERROR_FAILED_INTERNET,
  offline: Config.MES_ERROR_OFFLINE,
  initiatorSamePublicKUse: Config.MES_INITIATORSAME_PUBLIC_KUSE,
  invalidToken: Config.MES_INVALID_TOKEN,
  transactionFailed: Config.MES_TRAN_FAILED,
  addressNotFound: Config.MES_ADDRESS_NOTFOUND
};

//Messages
var msg = {
  secretKeyMsg: Config.MES_SECRET_KEY,
  onBoarding: {
    title1: Config.MES_ONBOARDING_TITLE1,
    subTitle1: Config.MES_ONBOARDING_SUBTITLE1,
    title2: Config.MES_ONBOARDING_TITLE2,
    subTitle2: Config.MES_ONBOARDING_SUBTITLE2,
    title3: Config.MES_ONBOARDING_TITLE3,
    subTitle3: Config.MES_ONBOARDING_SUBTITLE3
  },
  createJoinAccount: Config.MES_CREATEJOINACCOUNT,
  jointAccountImport: Config.MES_JOINTACCOUNTIMPORT,
  successSecureAccount: Config.MES_SUCCESS_SECURE_ACCOUNT,
  createVaultAccount: Config.MES_CREATEVAULTACCOUNT,
  accountDetails: {
    secure: {
      title1: Config.MES_ACCOUNTDETAILS_SECURE_TITLE1,
      subTitle1: Config.MES_ACCOUNTDETAILS_SECURE_SUBTITLE1,
      title2: Config.MES_ACCOUNTDETAILS_SECURE_TITLE2,
      subTitle2: Config.MES_ACCOUNTDETAILS_SECURE_SUBTITLE2,
      title3: Config.MES_ACCOUNTDETAILS_SECURE_TITLE3,
      subTitle3: Config.MES_ACCOUNTDETAILS_SECURE_SUBTITLE3
    },
    joint: {
      title1: Config.MES_ACCOUNTDETAILS_JOINT_TITLE1,
      subTitle1: Config.MES_ACCOUNTDETAILS_JOINT_SUBTITLE1,
      title2: Config.MES_ACCOUNTDETAILS_JOINT_TITLE2,
      subTitle2: Config.MES_ACCOUNTDETAILS_JOINT_SUBTITLE2,
      title3: Config.MES_ACCOUNTDETAILS_JOINT_TITLE3,
      subTitle3: Config.MES_ACCOUNTDETAILS_JOINT_SUBTITLE3
    },
    vault: {
      title1: Config.MES_ACCOUNTDETAILS_VAULT_TITLE1,
      subTitle1: Config.MES_ACCOUNTDETAILS_VAULT_SUBTITLE1,
      title2: Config.MES_ACCOUNTDETAILS_VAULT_TITLE2,
      subTitle2: Config.MES_ACCOUNTDETAILS_VAULT_SUBTITLE2
    }
  },
  transactionSccuess: Config.MES_TRAS_SUCCESS,
  amountTranSuccess: Config.MES_AMOUNT_TRNS_SUCCESS
};

//Validation Messages
var errorValidMsg = {
  enterCode: Config.MES_ENTER_CODE,
  confirmPincode: Config.MES_VALID_CONFIRMPINCODE,
  correctPassword: Config.MES_VALID_CORRECTPASSWORD,
  correctCode: Config.MES_VALID_CORRECTCODE,
  enterToken: Config.MES_VALID_ENTERTOKEN,
  logoutConfirm: Config.MES_VALID_LOGOUTCONFIRM
};

//Colors
var colors = {
  appColor: Config.COLOR_APP,
  tabbarActiveColor: "#2D71B6",
  black: Config.COLOR_BLACK,
  white: "#ffffff",
  Saving: Config.COLOR_SAVING,
  Secure: Config.COLOR_SECURE,
  Vault: Config.COLOR_VAULT,
  Joint: Config.COLOR_VAULT,
  placeholder: Config.COLOR_PLACEHOLDER
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
    "shield": require( assetsImages + "WalletScreen/red_icon_sheild_background.png" )
  },
  svgImages: {
    back_Icon: require( assetsImages + "svg/global/icon_back.svg" ),
    tabBarWalletScreen: {
      walletIcon: require( assetsImages +
        "svg/TabBarWalletScreen/icon_wallet_selected.svg" ),
      transactionIcon: require( assetsImages +
        "svg/TabBarWalletScreen/icon_transactions.svg" ),
      qrscanIcon: require( assetsImages +
        "svg/TabBarWalletScreen/icon_qrscan.svg" ),
      settingIcon: require( assetsImages +
        "svg/TabBarWalletScreen/icon_settings.svg" )
    },
    walletScreen: {
      accountLogo: require( assetsImages +
        "svg/WalletScreen/icon_regularaccount.svg" ),
      plusButtonBottom: require( assetsImages + "svg/WalletScreen/plus.svg" ),
      walletIcon: require( assetsImages + "svg/WalletScreen/ShieldIcon.svg" )
    },
    viewRecentTransaction: {
      sentIcon: require( assetsImages + "svg/WalletScreen/icon_paid.svg" ),
      receivedIcon: require( assetsImages + "svg/WalletScreen/icon_deposit.svg" )
    },
    accountDetailsScreen: {
      accountSettingsIcon: require( assetsImages +
        "svg/AccountDetailsScreen/icon_settings.svg" ),
      sentIcon: require( assetsImages +
        "svg/AccountDetailsScreen/icon_paid.svg" ),
      receivedIcon: require( assetsImages +
        "svg/AccountDetailsScreen/icon_deposit.svg" ),
      addAccount: require( assetsImages +
        "svg/AccountDetailsScreen/icon_add.svg" )
    }
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
    tblTransaction: Config.DB_TBL_TRANSACTION
  }
};

var notification = {
  notifi_UserDetialsChange: "notifi_UserDetialsChange"
};

export {
  errorMessage,
  errorValidMsg,
  msg,
  localDB,
  colors,
  images,
  notification
};
