import React from "react";
import { colors } from "../constants/Constants";
import {
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator
} from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome";
import { MultiBar, MultiBarToggle } from "react-native-multibar";
import { FluidNavigator, Transition } from "react-navigation-fluid-transitions";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";
//OnBoarding
import OnBoardingScreen from "bithyve/src/screens/WalletScreen/OnBoardingScreen/OnBoardingScreen";
import BackupPhraseScreen from "bithyve/src/screens/WalletScreen/BackupPhraseScreen/BackupPhraseScreen";
import VerifyBackupPhraseScreen from "bithyve/src/screens/WalletScreen/VerifyBackupPhraseScreen/VerifyBackupPhraseScreen";
//Passcode
import PasscodeScreen from "bithyve/src/screens/PasscodeScreen/PasscodeScreen";
import PasscodeConfirmScreen from "bithyve/src/screens/PasscodeScreen/PasscodeConfirmScreen";

//Tabbar Bottom
import PaymentScreen from "bithyve/src/screens/TabBarScreen/PaymentScreen/PaymentScreen";
import AnalyticsScreen from "bithyve/src/screens/TabBarScreen/AnalyticsScreen/AnalyticsScreen";
import AccountsScreen from "bithyve/src/screens/TabBarScreen/AccountsScreen/AccountsScreen";
import CardsScreen from "bithyve/src/screens/TabBarScreen/CardsScreen/CardsScreen";
import MoreScreen from "bithyve/src/screens/TabBarScreen/MoreScreen/MoreScreen";

//Left DrawerScreen
import SecurityScreen from "bithyve/src/screens/DrawerScreen/SecurityScreen/SecurityScreen";
import HelpScreen from "bithyve/src/screens/DrawerScreen/HelpScreen/HelpScreen";
import InviteScreen from "bithyve/src/screens/DrawerScreen/InviteScreen/InviteScreen";
import BankAccountScreen from "bithyve/src/screens/DrawerScreen/BankAccountScreen/BankAccountScreen";
import LogoutScreen from "bithyve/src/screens/DrawerScreen/LogoutScreen/LogoutScreen";
import DrawerScreen from "bithyve/src/screens/DrawerScreen/DrawerScreen/DrawerScreen";
import SentAndReceiveeScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/SentAndReceiveeScreen";
import SentMoneyScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/SentMoneyScreen/SentMoneyScreen";
import ReceiveMoneyScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/ReceiveMoneyScreen/ReceiveMoneyScreen";
import QrcodeScannerScreen from "bithyve/src/screens/DrawerScreen/SentAndReceiveeScreen/QrcodeScannerScreen/QrcodeScannerScreen";

import AccountsDetailsScreen from "bithyve/src/screens/DrawerScreen/AccountsDetailsScreen/AccountsDetailsScreen";
import RecentTransactionsScreen from "bithyve/src/screens/TabBarScreen/AccountsScreen/RecentTransactionsScreen/RecentTransactionsScreen";
import TransactionDetailsWebViewScreen from "bithyve/src/screens/TabBarScreen/AccountsScreen/RecentTransactionsScreen/TransactionDetailsWebViewScreen/TransactionDetailsWebViewScreen";

//TODO:  Account
import AccountDetailsOnboardingScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/AccountDetailsOnboardingScreen";
import SecureAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/SecureAccountScreen/SecureAccountScreen";
import SecureSecretKeyScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/SecureAccountScreen/SecureSecretKeyScreen/SecureSecretKeyScreen";
import ValidateSecureAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/SecureAccountScreen/ValidateSecureAccountScreen/ValidateSecureAccountScreen";
import CreateJointAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/JointAccountScreen/CreateJointAccountScreen";
import MergeConfirmJointAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/JointAccountScreen/MergeConfirmJointAccountScreen";

import VaultAccountScreen from "bithyve/src/screens/DrawerScreen/AccountDetailsOnboardingScreen/VaultAccountScreen/VaultAccountScreen";
//Right DrawerScreen
import NotificationScreen from "bithyve/src/screens/DrawerScreen/NotificationScreen/NotificationScreen";

//TODO: New Screen Hexa Wallet
import WalletScreen from "bithyve/src/screens/TabBarScreen/WalletScreen/WalletScreen";

//TODO: StackNavigator

//TODO: StackNavigator:ONBoarding
const OnBoardingRouter = createStackNavigator(
  {
    OnBoarding: {
      screen: OnBoardingScreen,
      navigationOptions: { header: null }
    },
    BackupPhrase: {
      screen: BackupPhraseScreen,
      navigationOptions: { header: null }
    },
    VerifyBackupPhrase: {
      screen: VerifyBackupPhraseScreen,
      navigationOptions: () => ({
        title: "Verify Backup Phrase",
        headerStyle: {
          backgroundColor: "#F5951D"
        }
      })
    }
  },
  {
    initialRouteName: "OnBoarding"
  }
);

//TODO: StackNavigator: JointAccountStackRouter

const JointAccountStackRouter = createStackNavigator(
  {
    CreateJointAccountScreen: {
      screen: CreateJointAccountScreen,
      navigationOptions: { header: null }
    },
    ReceiveMoneyScreen: {
      screen: ReceiveMoneyScreen,
      navigationOptions: { header: null }
    },
    QrcodeScannerScreen: {
      screen: QrcodeScannerScreen,
      navigationOptions: { header: null }
    },
    MergeConfirmJointAccountScreen: {
      screen: MergeConfirmJointAccountScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "CreateJointAccountScreen"
  }
);

//TODO: StackNavigator:AccountDetailsOnboardingRouter
const AccountDetailsOnboardingRouter = createStackNavigator(
  {
    AccountDetailsOnboardingScreen: {
      screen: AccountDetailsOnboardingScreen,
      navigationOptions: { header: null }
    },
    SecureAccountScreen: {
      screen: SecureAccountScreen,
      navigationOptions: { header: null }
    },
    SecureSecretKeyScreen: {
      screen: SecureSecretKeyScreen,
      navigationOptions: { header: null }
    },
    ValidateSecureAccountScreen: {
      screen: ValidateSecureAccountScreen,
      navigationOptions: { header: null }
    },
    CreateJointAccountScreen: {
      screen: JointAccountStackRouter,
      navigationOptions: { header: null }
    },
    VaultAccountScreen: {
      screen: VaultAccountScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "AccountDetailsOnboardingScreen"
  }
);

//TODO: StackNavigator:AccountStackNavigatorRouter
const AccountStackNavigatorRouter = createStackNavigator(
  {
    AccountsScreen: {
      screen: AccountsScreen,
      navigationOptions: { header: null }
    },
    RecentTransactionsScreen: {
      screen: RecentTransactionsScreen,
      navigationOptions: { header: null }
    },
    TransactionDetailsWebViewScreen: {
      screen: TransactionDetailsWebViewScreen,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "AccountsScreen"
  }
);

//TODO: TabNavigator
//TODO: TabNavigator:TabNavigator
const TabNavigator = createBottomTabNavigator(
  {
    Payment: {
      screen: WalletScreen, //PaymentScreen,
      navigationOptions: {
        tabBarLabel: "Wallet", //localization("TabBarItem.Payment"),
        drawerLockMode: "locked-open",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="credit-card" size={24} color={tintColor} />
        )
      }
    },
    Analytics: {
      screen: AnalyticsScreen,
      navigationOptions: {
        tabBarLabel: localization("TabBarItem.Analytics"),
        tabBarIcon: ({ tintColor }) => (
          <Icon name="signal" size={24} color={tintColor} />
        )
      }
    },
    MultiBar: {
      screen: () => null,
      navigationOptions: ({ navigation }) => ({
        tabBarIcon: () => (
          <MultiBarToggle
            navigation={navigation}
            actionSize={20}
            routes={[
              {
                routeName: AccountStackNavigatorRouter,
                color: "#FF8360",
                icon: <Icon name="rocket" color="#333333" size={15} />
              },
              {
                routeName: AccountStackNavigatorRouter,
                color: "#E8E288",
                icon: <Icon name="dashboard" color="#333333" size={15} />
              },
              {
                routeName: AccountStackNavigatorRouter,
                color: "#7DCE82",
                icon: <Icon name="gears" color="#333333" size={15} />
              }
            ]}
            actionSize={45}
            toggleSize={80}
            icon={<Icon name="plus" color="#FFFFFF" size={24} />}
          />
        )
      }),
      params: {
        navigationDisabled: true
      }
    },
    Accounts: {
      screen: AccountStackNavigatorRouter,
      navigationOptions: {
        tabBarLabel: localization("TabBarItem.Accounts"),
        tabBarIcon: ({ tintColor }) => (
          <Icon name="dollar" size={24} color={tintColor} />
        )
      }
    },

    More: {
      screen: MoreScreen,
      navigationOptions: {
        tabBarLabel: localization("TabBarItem.More"),
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ellipsis-v" size={24} color={tintColor} />
        )
      }
    }
  },
  {
    tabBarComponent: MultiBar,
    initialRouteName: "Payment",
    tabBarOptions: {
      showLabel: false,
      activeTintColor: colors.appColor,
      labelStyle: {
        fontSize: 12
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
const LeftDrawerNavigator = createDrawerNavigator(
  {
    Home: {
      screen: TabNavigator,
      navigationOptions: {
        drawerLabel: "Home",
        drawerIcon: ({ tintColor }) => <Icon name="home" size={17} />
      }
    }
  },

  {
    initialRouteName: "Home",
    contentComponent: DrawerScreen,
    drawerPosition: "left",
    drawerOpenRoute: "DrawerOpen",
    drawerCloseRoute: "DrawerClose",
    drawerToggleRoute: "DrawerToggle",
    contentOptions: {
      activeTintColor: "#e91e63",
      style: {
        flex: 1,
        paddingTop: 15
      }
    }
  }
);

const Navigator = FluidNavigator({
  screen1: { screen: WalletScreen },
  screen2: { screen: AccountsDetailsScreen }
});

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
        screen: OnBoardingRouter,
        navigationOptions: { header: null }
      },
      PasscodeConfirmScreen: {
        screen: PasscodeConfirmScreen,
        navigationOptions: { header: null }
      },
      TabbarBottom: {
        screen: Navigator,
        navigationOptions: { header: null }
      },
      //Drwaer Navigation
      SecurityScreen: {
        screen: SecurityScreen,
        navigationOptions: { header: null }
      },
      HelpScreen: {
        screen: HelpScreen,
        navigationOptions: { header: null }
      },
      InviteScreen: {
        screen: InviteScreen,
        navigationOptions: { header: null }
      },
      BankAccountScreen: {
        screen: BankAccountScreen,
        navigationOptions: { header: null }
      },
      LogoutScreen: {
        screen: LogoutScreen,
        navigationOptions: { header: null }
      },
      NotificationScreen: {
        screen: NotificationScreen,
        navigationOptions: { header: null }
      },
      //SentMoney And Receive Money
      SentAndReceiveeScreen: {
        screen: SentAndReceiveeScreen,
        navigationOptions: {
          header: null
        }
      },
      SentMoneyScreen: {
        screen: SentMoneyScreen,
        navigationOptions: { header: null }
      },
      ReceiveMoneyScreen: {
        screen: ReceiveMoneyScreen,
        navigationOptions: { header: null }
      },
      QrcodeScannerScreen: {
        screen: QrcodeScannerScreen,
        navigationOptions: { header: null }
      },
      //Backup Phrase
      BackupPhraseScreen: {
        screen: BackupPhraseScreen,
        navigationOptions: { header: null }
      },
      VerifyBackupPhraseScreen: {
        screen: VerifyBackupPhraseScreen,
        navigationOptions: { header: null }
      },
      //AccountDetailsScrenn
      AccountsDetailsScreen: {
        screen: AccountsDetailsScreen,
        navigationOptions: { header: null }
      },
      //AccountDetailsOnboardingRouter
      AccountDetailsOnboardingRouter: {
        screen: AccountDetailsOnboardingRouter,
        navigationOptions: { header: null }
      },
      //For DeepLinking
      MergeConfirmJointAccountScreen: {
        screen: MergeConfirmJointAccountScreen,
        navigationOptions: { header: null }
      },
      CreateJointAccountScreen: {
        screen: CreateJointAccountScreen,
        navigationOptions: { header: null }
      }
    },
    {
      initialRouteName: signedIn ? "OnBoardingNavigator" : screenName // "TabbarBottom" //screenName
      // initialRouteName: signedIn ? "OnBoardingNavigator" : "OnBoardingNavigator"
      // initialRouteName: signedIn ? "TabbarBottom" : "TabbarBottom"
    }
  );
};
