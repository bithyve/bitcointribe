import React from 'react'
import { createStackNavigator, StackViewTransitionConfigs } from 'react-navigation-stack'
import TwoFAValidation from '../../../pages/Accounts/TwoFAValidation'
import ReLogin from '../../../pages/ReLogin'
import CustodianRequestOTP from '../../../pages/CustodianRequest/CustodianRequestOTP'
import CustodianRequestAccepted from '../../../pages/CustodianRequest/CustodianRequestAccepted'
import SweepFundsFromExistingAccount from '../../../pages/RegenerateShare/SweepFundsFromExistingAccount'
import NewWalletNameRegenerateShare from '../../../pages/RegenerateShare/NewWalletNameRegenerateShare'
import NewWalletQuestionRegenerateShare from '../../../pages/RegenerateShare/NewWalletQuestionRegenerateShare'
import NewWalletGenerationOTP from '../../../pages/RegenerateShare/NewWalletGenerationOTP'
import WalletCreationSuccess from '../../../pages/RegenerateShare/WalletCreationSuccess'
import SecureScan from '../../../pages/Accounts/SecureScan'
import GoogleAuthenticatorOTP from '../../../pages/Accounts/GoogleAuthenticatorOTP'
import TwoFASetup from '../../../pages/Accounts/TwoFASetup'
import SecondaryDeviceHistoryNewBHR from '../../../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import SettingGetNewPin from '../../../pages/SettingGetNewPin'
import ContactsListForAssociateContact from '../../../pages/CustodianRequest/ContactsListForAssociateContact'
import NewTwoFASecret from '../../../pages/Accounts/NewTwoFASecret'
import TwoFASweepFunds from '../../../pages/Accounts/TwoFASweepFunds'
import UpdateApp from '../../../pages/UpdateApp'
import SendRequest from '../../../pages/Contacts/SendRequest'
import VoucherScanner from '../../../pages/FastBitcoin/VoucherScanner'
import AddContactSendRequest from '../../../pages/Contacts/AddContactSendRequest'
import QrAndLink from '../../../pages/NewBHR/QrAndLink'
import ContactDetails from '../../../pages/Contacts/ContactDetails'
import Receive from '../../../pages/Accounts/Receive'
import PairNewWallet from '../../../pages/FastBitcoin/PairNewWallet'
import Intermediate from '../../../pages/Intermediate'
import NewOwnQuestions from '../../../pages/NewOwnQuestions'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import WyreIntegrationScreen from '../../../pages/WyreIntegration/WyreIntegrationScreen'
import Launch from '../../../pages/Launch'
import EnterNodeConfig from '../../../pages/lightningAccount/EnterNodeConfigScreen'
import ScanNodeConfig from '../../../pages/lightningAccount/ScanNodeConfigScreen'
import RestoreWithICloud from '../../../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import RestoreWithoutICloud from '../../../pages/RestoreHexaWithKeeper/RestoreWithoutICloud'
import SettingsContents from '../../../pages/SettingsContents'
import SweepFunds from '../../../pages/SweepFunds/SweepFunds'
import SweepFundsEnterAmount from '../../../pages/SweepFunds/SweepFundsEnterAmount'
import SweepFundUseExitKey from '../../../pages/SweepFunds/SweepFundUseExitKey'
import SweepConfirmation from '../../../pages/SweepFunds/SweepConfirmation'
import ScanRecoveryKey from '../../../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import UpgradeBackup from '../../../pages/UpgradeBackupWithKeeper/UpgradeBackup'
import ConfirmKeys from '../../../pages/UpgradeBackupWithKeeper/ConfirmKeys'
import ManageBackupNewBHR from '../../../pages/NewBHR/ManageBackup'
import SecurityQuestionHistoryNewBHR from '../../../pages/NewBHR/SecurityQuestionHistory'
import TrustedContactHistoryNewBHR from '../../../pages/NewBHR/TrustedContactHistoryKeeper'
import PersonalCopyHistoryNewBHR from '../../../pages/NewBHR/PersonalCopyHistory'
import CloudBackupHistory from '../../../pages/NewBHR/CloudBackupHistory'
import SeedBackupHistory from '../../../pages/NewBHR/SeedBackupHistory'
import BackupSeedWordsContent from '../../../pages/NewBHR/BackupSeedWordsContent'
import RestoreSeedWordsContent from '../../../pages/RestoreHexaWithKeeper/RestoreSeedWordsContent'
import AddNewAccountStack from '../accounts/AddNewAccountStack'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import WyreOrderFormScreen from '../../../pages/WyreIntegration/WyreOrderFormScreen'
import NewRampAccountDetailsScreen from '../../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import RampOrderFormScreen from '../../../pages/RampIntegration/RampOrderFormScreen'
import QRStack from '../home/QRStack'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import LnAccountStack from '../accounts/LnAccountStack'
import Home from '../../../pages/Home/Home'
import Header from '../Header'
import Login from '../../../pages/Login'
import { translations } from '../../../common/content/LocContext'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import WalletBackup from '../../../pages/MoreOptions/WalletBackup'
import CreateWithBorderWallet from '../../../pages/borderwallet/CreateWithBorderWallet'
import SelectEntropyGridType from '../../../pages/borderwallet/SelectEntropyGridType'
import DownloadEncryptGrid from '../../../pages/borderwallet/DownloadEncryptGrid'
import BorderWalletGridScreen from '../../../pages/borderwallet/BorderWalletGridScreen'
import SelectChecksumWord from '../../../pages/borderwallet/SelectChecksumWord'
import CreatePassPhrase from '../../../pages/borderwallet/CreatePassPhrase'
import ConfirmDownload from '../../../pages/borderwallet/ConfirmDownload'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'

const strings  = translations[ 'stackTitle' ]

const MODAL_ROUTES = [
  'AllTransactions',
  'QRScanner',
  'FriendsAndFamily',
  'MoreOptions',
  'PlaceWyreOrder',
  'PlaceRampOrder'
]


const HomeStack = createStackNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    Launch: {
      screen: Launch,
    },
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    Login,
    AddNewAccount: {
      screen: AddNewAccountStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    ScanNodeConfig: {
      screen: ScanNodeConfig,
      navigationOptions: {
        header: null
      }
    },
    CreateWithBorderWalletAccount: {
      screen: CreateWithBorderWallet,
      navigationOptions: {
        header: null
      }
    },
    SelectEntropyGridTypeAccount: {
      screen: SelectEntropyGridType,
      navigationOptions: {
        header: null
      }
    },
    DownloadEncryptGrid: {
      screen: DownloadEncryptGrid,
      navigationOptions: {
        header: null
      }
    },
    BorderWalletGridScreen: {
      screen: BorderWalletGridScreen,
      navigationOptions: {
        header: null
      }
    },
    SelectChecksumWordAccount: {
      screen: SelectChecksumWord,
      navigationOptions: {
        header: null
      }
    },
    CreatePassPhraseAccount: {
      screen: CreatePassPhrase,
      navigationOptions: {
        header: null
      }
    },
    ConfirmDownloadAccount: {
      screen: ConfirmDownload,
      navigationOptions: {
        header: null
      }
    },
    ConfirmDownload: {
      screen: ConfirmDownload,
      navigationOptions: {
        header: null
      }
    },
    PreviewPattern: {
      screen: PreviewPattern,
      navigationOptions: {
        header: null
      }
    },
    EnterNodeConfig: {
      screen: EnterNodeConfig,
      navigationOptions: {
        header: null
      }
    },
    AccountDetails: {
      screen: AccountDetailsStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    LNAccountDetails: {
      screen: LnAccountStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    NewWyreAccountDetails: {
      screen: NewWyreAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Wyre Account'
      }
    },
    NewRampAccountDetails: {
      screen: NewRampAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Ramp Account'
      }
    },
    PlaceWyreOrder: {
      screen: WyreOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Wyre'
      }
    },
    PlaceRampOrder: {
      screen: RampOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Ramp'
      }
    },
    TransactionDetails: {
      screen: TransactionDetailsContainerScreen,
      navigationOptions: {
        title: 'Transaction Details',
      },
    },
    // AllTransactions: {
    //   screen: AllTransactionsStack,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    // FriendsAndFamily: FriendsAndFamilyScreen,
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
    // MoreOptions: {
    //   screen: MoreOptionsStack,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    // ReLogin: {
    //   screen: ReLogin,
    //   navigationOptions: {
    //     gesturesEnabled: false,
    //   },
    // },
    Intermediate,
    CustodianRequestOTP,
    CustodianRequestAccepted,
    SweepFundsFromExistingAccount,
    NewWalletNameRegenerateShare,
    NewWalletQuestionRegenerateShare,
    NewWalletGenerationOTP,
    WalletCreationSuccess,
    SecureScan,
    GoogleAuthenticatorOTP,
    SecondaryDeviceHistoryNewBHR,
    SettingGetNewPin,
    ContactsListForAssociateContact,
    NewTwoFASecret,
    TwoFASweepFunds,
    SendRequest,
    VoucherScanner,
    AddContactSendRequest,
    QrAndLink,
    ContactDetails,
    Receive: {
      screen: Receive,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    WalletBackupAlert: {
      screen: WalletBackup,
      navigationOptions: {
        header: null,
      },
    },
    PairNewWallet,
    // ManageBackupKeeper,
    ManageBackupNewBHR,
    // SecurityQuestionHistoryKeeper,
    SecurityQuestionHistoryNewBHR,
    // KeeperFeatures,
    // TrustedContactHistoryKeeper,
    TrustedContactHistoryNewBHR,
    // KeeperDeviceHistory,
    // PersonalCopyHistoryKeeper,
    PersonalCopyHistoryNewBHR,
    // CloudBackupHistory: {
    //   screen: CloudBackupHistory,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    // SeedBackupHistory: {
    //   screen: SeedBackupHistory,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    NewOwnQuestions,
    RestoreWithICloud,
    RestoreWithoutICloud,
    SettingsContents,
    SweepFunds,
    SweepFundsEnterAmount,
    SweepFundUseExitKey,
    SweepConfirmation,
    ScanRecoveryKey,
    UpgradeBackup,
    ConfirmKeys,
    TwoFAValidation,
    // BackupSeedWordsContent: {
    //   screen: BackupSeedWordsContent,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    // RestoreSeedWordsContent,
    TwoFASetup: {
      screen: TwoFASetup,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    UpdateApp: {
      screen: UpdateApp,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    WyreIntegrationScreen: {
      screen: WyreIntegrationScreen,
      navigationOptions: {
        title: 'Wyre Home'
      }
    },
  },
  {
    // mode: 'modal',
    initialRouteName: 'Home',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
        },
      }
    },
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    //   return {
    //     ...defaultStackScreenNavigationOptions,
    //     headerLeft: () => {
    //       return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
    //     },
    //   }
    },
    // transitionConfig: ( transitionProps, prevTransitionProps ) => {
    //   const previousRouteName = prevTransitionProps?.scene.route.routeName
    //   const newRouteName = transitionProps.scene.route.routeName

    //   // 📝 Override the default presentation mode for screens that we
    //   // want to present modally
    //   const isModal = MODAL_ROUTES.some(
    //     ( screenName ) => [ previousRouteName, newRouteName ].includes( screenName )
    //   )

    //   return StackViewTransitionConfigs.defaultTransitionConfig(
    //     transitionProps,
    //     prevTransitionProps,
    //     isModal,
    //   )
    // },
  },
)

// HomeStack.navigationOptions = ( { navigation } ) => {
//   let tabBarVisible = true
//   console.log( 'navigation.state.index', navigation.state.index )

//   if ( navigation.state.index > 0 ) {
//     tabBarVisible = false
//   }

//   return {
//     tabBarVisible,
//   }
// }

export default HomeStack
