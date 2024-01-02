import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import MoreOptionsContainerScreen from '../../../pages/MoreOptions/MoreOptionsContainerScreen'
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import FundingSourcesScreen from '../../../pages/FundingSources/FundingSourcesContainerScreen'
import FundingSourceDetailsScreen from '../../../pages/FundingSources/FundingSourceDetailsScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import WalletSettingsStack from './WalletSettingsStack'
import AccountManagementStack from './AccountManagementStack'
import NodeSettingsContainerScreen from '../../../pages/MoreOptions/NodeSettings/NodeSettingsContainerScreen'
import Header from '../Header'
import QRStack from '../home/QRStack'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import Launch from '../../../pages/Launch'
import ReLogin from '../../../pages/ReLogin'
import Login from '../../../pages/Login'
import Intermediate from '../../../pages/Intermediate'
import PasscodeChangeSuccessPage from '../../../pages/PasscodeChangeSuccessPage'
import AppInfo from '../../../pages/MoreOptions/AppInfo/Appinfo'
import VersionHistoryScreen from '../../../pages/VersionHistoryScreen'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import { translations } from '../../../common/content/LocContext'
import TransactionDetailsContainerScreen from '../../../pages/Accounts/Transactions/TransactionDetailsContainerScreen'
import WalletBackup from '../../../pages/MoreOptions/WalletBackup'
import WalletBackupStack from './WalletBackupStack'
import WalletOption from '../../../pages/MoreOptions/WalletOption/WalletOption'
import BackupWithKeeper from '../../../pages/NewBHR/BackupWithKeeper'
import BackupMethods from '../../../pages/NewBHR/BackupMethods'
import ValidateBorderWalletPattern from '../../../pages/borderwallet/ValidateBorderWalletPattern'
import ValidateBorderWalletChecksum from '../../../pages/borderwallet/ValidateBorderWalletChecksum'
import PreviewPattern from '../../../pages/borderwallet/PreviewPattern'
import BackupGridMnemonic from '../../../pages/borderwallet/BackupGridMnemonic'
import CheckPasscodeComponent from '../../../pages/NewBHR/CheckPasscodeComponent'

const strings  = translations[ 'stackTitle' ]

const MoreOptionsStack = createStackNavigator(
  {
    Home: {
      screen: MoreOptionsContainerScreen,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    Launch,
    Login:{
      screen: Login,
      navigationOptions: {
        header: null
      }
    },
    Intermediate,
    ReLogin: {
      screen: ReLogin,
      navigationOptions: {
        gesturesEnabled: false,
        header: null,
      },
    },
    AccountManagement: {
      screen: AccountManagementStack,
      navigationOptions: {
        header: null,
      },
    },
    TransactionDetails: {
      screen: TransactionDetailsContainerScreen,
    },
    PasscodeChangeSuccessPage: {
      screen: PasscodeChangeSuccessPage,
      navigationOptions: {
        gesturesEnabled: false,
        header: null,
      },
    },
    FriendsAndFamily: {
      screen: FriendsAndFamilyScreen,
      navigationOptions: {
        title: 'Friends & Family',
      },
    },
    BackupWithKeeper: {
      screen: BackupWithKeeper,
      navigationOptions: {
        header: null,
      },
    },
    BackupGridMnemonic: {
      screen: BackupGridMnemonic,
      navigationOptions: {
        header: null,
      },
    },
    ValidateBorderWalletChecksum: {
      screen: ValidateBorderWalletChecksum,
      navigationOptions: {
        header: null,
      },
    },
    ValidateBorderWalletPattern: {
      screen: ValidateBorderWalletPattern,
      navigationOptions: {
        header: null,
      },
    },
    PreviewPattern: {
      screen: PreviewPattern,
      navigationOptions: {
        header: null,
      },
    },
    CheckPasscode:{
      screen: CheckPasscodeComponent,
      navigationOptions:{
        header:null
      }
    },
    BackupMethods: {
      screen: BackupMethods,
      navigationOptions: {
        header: null,
      },
    },
    NodeSettings: {
      screen: NodeSettingsContainerScreen,
      navigationOptions: {
        header: null
      },
    },
    FundingSources: {
      screen: FundingSourcesScreen,
      navigationOptions: {
        header: null,
      },
    },
    FundingSourceDetails: {
      screen: FundingSourceDetailsScreen,
    },
    WalletSettings: {
      screen: WalletSettingsStack,
      navigationOptions: {
        header: null,
      },
    },
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
    AppInfo: {
      screen: AppInfo,
      navigationOptions: {
        header: null,
      },
    },
    VersionHistory: {
      screen: VersionHistoryScreen,
      navigationOptions: {
        title: 'Version History',
      },
    },
    AccountDetails: {
      screen: AccountDetailsStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    SeedBackup: {
      screen: WalletBackupStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'Home',
    // defaultNavigationOptions: {
    //   header: null
    // },
    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      if ( ( navigation.state.index === 0  && navigation.state.routes[ 0 ].routeName === 'Home' || navigation.state.index === 1 && navigation.state.routes[ 1 ]?.routeName === 'Home' ) ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    },
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        ...defaultStackScreenNavigationOptions,
        headerLeft: () => {
          return <SmallNavHeaderBackButton onPress={() => { navigation.pop() }} />
        },
      }
    },
  },
)


export default MoreOptionsStack
