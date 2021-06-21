import React from 'react'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import {
  createStackNavigator,
  StackViewTransitionConfigs,
} from 'react-navigation-stack'
import Launch from '../pages/Launch'
import Login from '../pages/Login'
import TwoFAValidation from '../pages/Accounts/TwoFAValidation'
import PasscodeConfirm from '../pages/PasscodeConfirm'
import WalletInitializationScreen from '../pages/WalletInitializationScreen'
import RestoreSelectedContactsList from '../pages/Recovery/RestoreSelectedContactsList'
import NewWalletName from '../pages/NewWalletName'
import NewWalletQuestion from '../pages/NewWalletQuestion'
import RestoreWalletBySecondaryDevice from '../pages/Recovery/RestoreWalletBySecondaryDevice'
import RestoreWalletByContacts from '../pages/Recovery/RestoreWalletByContacts'
import ReLogin from '../pages/ReLogin'
import ManageBackup from '../pages/ManageBackup'
import CustodianRequestOTP from '../pages/CustodianRequest/CustodianRequestOTP'
import CustodianRequestAccepted from '../pages/CustodianRequest/CustodianRequestAccepted'
import SecondaryDevice from '../pages/ManageBackup/SecondaryDevice'
import TrustedContacts from '../pages/ManageBackup/TrustedContacts'
import WalletNameRecovery from '../pages/Recovery/WalletNameRecovery'
import RecoveryQuestionScreen from '../pages/Recovery/RecoveryQuestionScreen'
import RecoveryCommunication from '../pages/Recovery/RecoveryCommunication'
import ReceivingAddress from '../pages/Accounts/ReceivingAddress'
import QRScannerScreen from '../pages/QRScannerScreen'
import HealthCheck from '../pages/HealthCheck'
import SecondaryDeviceHealthCheck from '../pages/HealthCheck/SecondaryDeviceHealthCheck'
import TrustedContactHealthCheck from '../pages/HealthCheck/TrustedContactHealthCheck'
import NoteHealthCheck from '../pages/HealthCheck/NoteHealthCheck'
import CloudHealthCheck from '../pages/HealthCheck/CloudHealthCheck'
import SweepFundsFromExistingAccount from '../pages/RegenerateShare/SweepFundsFromExistingAccount'
import NewWalletNameRegenerateShare from '../pages/RegenerateShare/NewWalletNameRegenerateShare'
import NewWalletQuestionRegenerateShare from '../pages/RegenerateShare/NewWalletQuestionRegenerateShare'
import NewWalletGenerationOTP from '../pages/RegenerateShare/NewWalletGenerationOTP'
import WalletCreationSuccess from '../pages/RegenerateShare/WalletCreationSuccess'
import SecureScan from '../pages/Accounts/SecureScan'
import GoogleAuthenticatorOTP from '../pages/Accounts/GoogleAuthenticatorOTP'
import TwoFASetup from '../pages/Accounts/TwoFASetup'
import SecondaryDeviceHistory from '../pages/ManageBackup/SecondaryDeviceHistory'
import SecondaryDeviceHistoryNewBHR from '../pages/NewBHR/SecondaryDeviceHistoryNewBHR'
import TrustedContactHistory from '../pages/ManageBackup/TrustedContactHistory'
import PersonalCopyHistory from '../pages/ManageBackup/PersonalCopyHistory'
import SecurityQuestionHistory from '../pages/ManageBackup/SecurityQuestionHistory'
import SettingGetNewPin from '../pages/SettingGetNewPin'
import ContactsListForAssociateContact from '../pages/CustodianRequest/ContactsListForAssociateContact'
import NewTwoFASecret from '../pages/Accounts/NewTwoFASecret'
import TwoFASweepFunds from '../pages/Accounts/TwoFASweepFunds'
import UpdateApp from '../pages/UpdateApp'
import SendRequest from '../pages/Contacts/SendRequest'
import VoucherScanner from '../pages/FastBitcoin/VoucherScanner'
import AddContactSendRequest from '../pages/Contacts/AddContactSendRequest'
import ContactDetails from '../pages/Contacts/ContactDetails'
import Receive from '../pages/Accounts/Receive'
import PairNewWallet from '../pages/FastBitcoin/PairNewWallet'
import Intermediate from '../pages/Intermediate'
import NewOwnQuestions from '../pages/NewOwnQuestions'
import NewRecoveryOwnQuestions from '../pages/Recovery/NewRecoveryOwnQuestions'
import HomeStack from './stacks/home/HomeStack'
import FriendsAndFamily from './stacks/F&F/F&FStack'
import SendStack from './stacks/send/SendStack'
import Colors from '../common/Colors'
import AccountDetailsStack from './stacks/accounts/AccountDetailsStack'
import WyreIntegrationScreen from '../pages/WyreIntegration/WyreIntegrationScreen'


import RestoreWithICloud from '../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import RestoreWithoutICloud from '../pages/RestoreHexaWithKeeper/RestoreWithoutICloud'
import SettingsContents from '../pages/SettingsContents'
import SweepFunds from '../pages/SweepFunds/SweepFunds'
import SweepFundsEnterAmount from '../pages/SweepFunds/SweepFundsEnterAmount'
import SweepFundUseExitKey from '../pages/SweepFunds/SweepFundUseExitKey'
import SweepConfirmation from '../pages/SweepFunds/SweepConfirmation'
import ScanRecoveryKey from '../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import UpgradeBackup from '../pages/UpgradeBackupWithKeeper/UpgradeBackup'
import ConfirmKeys from '../pages/UpgradeBackupWithKeeper/ConfirmKeys'
import ManageBackupUpgradeSecurity from '../pages/UpgradeBackupWithKeeper/ManageBackupUpgradeSecurity'
// import ManageBackupKeeper from '../pages/Keeper/ManageBackup';
import ManageBackupNewBHR from '../pages/NewBHR/ManageBackupNewBHR'
// import SecurityQuestionHistoryKeeper from '../pages/Keeper/SecurityQuestionHistory';
import SecurityQuestionHistoryNewBHR from '../pages/NewBHR/SecurityQuestionHistory'
// import KeeperFeatures from "../pages/Keeper/KeeperFeatures";
// import TrustedContactHistoryKeeper from '../pages/Keeper/TrustedContactHistoryKeeper';
import TrustedContactHistoryNewBHR from '../pages/NewBHR/TrustedContactHistoryKeeper'
// import KeeperDeviceHistory from '../pages/Keeper/KeeperDeviceHistory';
// import PersonalCopyHistoryKeeper from '../pages/Keeper/PersonalCopyHistory';
import PersonalCopyHistoryNewBHR from '../pages/NewBHR/PersonalCopyHistory'
import CloudBackupHistory from '../pages/NewBHR/CloudBackupHistory'
import { createBottomTabNavigator } from 'react-navigation-tabs'
// import Bottomtab from './Bottomtab'
// import FriendsAndFamilyScreen from '../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
// import TabNavigator from './TabNavigator'
// import { BottomTab } from '../components/home/custom-bottom-tabs'
import Boottomtab from './Bottomtab'
import { Text, View, Image } from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as dp,
} from 'react-native-responsive-screen'
import Svg, { G, Path, Defs } from 'react-native-svg'

import MoreOptionsStack from './stacks/more-options/MoreOptionsStack'
import SecurityStack from './stacks/security/Security&Privacy'

const SetupNavigator = createStackNavigator(
  {
    Launch,
    Login,
    PasscodeConfirm,
    NewWalletName,
    NewWalletQuestion,
    WalletInitialization: WalletInitializationScreen,
    WalletNameRecovery,
    RecoveryQuestion: RecoveryQuestionScreen,
    RestoreSelectedContactsList,
    RestoreWalletBySecondaryDevice,
    RestoreWalletByContacts,
    RecoveryCommunication,
    NewOwnQuestions,
    RecoveryQrScanner: QRScannerScreen,
    NewRecoveryOwnQuestions,
    RestoreWithICloud,
    ScanRecoveryKey,
    QRScanner: QRScannerScreen,
    UpdateApp: {
      screen: UpdateApp,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
  },
  {
    initialRouteName: 'Launch',
    headerLayoutPreset: 'center',
    defaultNavigationOptions: () => ( {
      header: null,
    } ),
  },
)

const MODAL_ROUTES = [
  'SecondaryDevice',
  'TrustedContacts',
  'CustodianRequestOTP',
  'CustodianRequestAccepted',
  'HealthCheckSecurityAnswer',
  'Intermediate',
]

const HomeNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeStack,
      path: 'home',
    },
    // ReLogin: {
    //   screen: ReLogin,
    //   navigationOptions: {
    //     gesturesEnabled: false,
    //   },
    // },
    // Intermediate,
    // AccountDetails: {
    //   screen: AccountDetailsStack,
    // },
    // ManageBackup,
    // SecondaryDevice,
    // TrustedContacts,
    // CustodianRequestOTP,
    // CustodianRequestAccepted,
    // HealthCheck,
    // SecondaryDeviceHealthCheck,
    // TrustedContactHealthCheck,
    // NoteHealthCheck,
    // CloudHealthCheck,
    // SweepFundsFromExistingAccount,
    // NewWalletNameRegenerateShare,
    // NewWalletQuestionRegenerateShare,
    // NewWalletGenerationOTP,
    // WalletCreationSuccess,
    // SecureScan,
    // GoogleAuthenticatorOTP,
    // SecondaryDeviceHistory,
    // SecondaryDeviceHistoryNewBHR,
    // TrustedContactHistory,
    // PersonalCopyHistory,
    // SecurityQuestionHistory,
    // SettingGetNewPin,
    // ContactsListForAssociateContact,
    // NewTwoFASecret,
    // TwoFASweepFunds,
    // SendRequest,
    // VoucherScanner,
    // AddContactSendRequest,
    // ContactDetails,
    // Receive,
    // PairNewWallet,
    // // ManageBackupKeeper,
    // ManageBackupNewBHR,
    // // SecurityQuestionHistoryKeeper,
    // SecurityQuestionHistoryNewBHR,
    // // KeeperFeatures,
    // // TrustedContactHistoryKeeper,
    // TrustedContactHistoryNewBHR,
    // // KeeperDeviceHistory,
    // // PersonalCopyHistoryKeeper,
    // PersonalCopyHistoryNewBHR,
    // CloudBackupHistory,
    // NewOwnQuestions,
    // RestoreWithICloud,
    // RestoreWithoutICloud,
    // SettingsContents,
    // SweepFunds,
    // SweepFundsEnterAmount,
    // SweepFundUseExitKey,
    // SweepConfirmation,
    // ScanRecoveryKey,
    // UpgradeBackup,
    // ConfirmKeys,
    // ManageBackupUpgradeSecurity,
    // TwoFAValidation,
    // TwoFASetup: {
    //   screen: TwoFASetup,
    //   navigationOptions: {
    //     gesturesEnabled: false,
    //   },
    // },
    // UpdateApp: {
    //   screen: UpdateApp,
    //   navigationOptions: {
    //     gesturesEnabled: false,
    //   },
    // },
    // WyreIntegrationScreen: {
    //   screen: WyreIntegrationScreen,
    //   navigationOptions: {
    //     title: 'Wyre Home'
    //   }
    // },
  },
  {
    headerLayoutPreset: 'center',
    defaultNavigationOptions: ( { navigation } ) => {
      return {
        header: null,
        headerTitleContainerStyle: {
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        },
      }
    },
    // transitionConfig: ( transitionProps, prevTransitionProps ) => {

    //   // 📝 Override the default presentation mode for screens that we
    //   // want to present modally
    //   const isModal = MODAL_ROUTES.some(
    //     ( screenName ) =>
    //       screenName === transitionProps.scene.route.routeName ||
    //       ( prevTransitionProps &&
    //         screenName === prevTransitionProps.scene.route.routeName ),
    //   )

    //   return StackViewTransitionConfigs.defaultTransitionConfig(
    //     transitionProps,
    //     prevTransitionProps,
    //     isModal,
    //   )
    // },
  },
)
// const TabNavigator = createBottomTabNavigator( {
//   Home: HomeNavigator,
//   Settings: AccountDetailsStack,
// } )

const Bottomtab = createBottomTabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return(
            <View style={{
              // marginVertical: hp( '2%' )
            }}>
              {focused ?
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={22.765}
                  height={21.588}
                  viewBox="0 0 22.765 21.588"
                >
                  <Path
                    d="M22.2 9.185L13.321.773a2.822 2.822 0 00-3.879 0L.58 9.166A1.7 1.7 0 001.7 12.14h.58v8.347a.759.759 0 00.759.759h16.69a.759.759 0 00.759-.759V12.14h.58A1.7 1.7 0 0022.2 9.185z"
                    fill="#fff"
                  />
                  <Path
                    d="M15.176 21.588v-5.794a3.794 3.794 0 00-7.588 0v5.794z"
                    fill="#006db4"
                  />
                </Svg>
                :
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={22.77}
                  height={21.25}
                  viewBox="0 0 22.77 21.25"
                >
                  <Path
                    d="M22.21 9.187L13.325.773a2.822 2.822 0 00-3.88 0L.581 9.168a1.7 1.7 0 001.12 2.975h.581v8.349a.759.759 0 00.759.759h16.7a.759.759 0 00.759-.759v-8.349h.58a1.7 1.7 0 001.138-2.956zm-1.138 1.438h-1.338a.759.759 0 00-.759.759v8.349H15.18v-3.795a3.795 3.795 0 10-7.59 0v3.795H3.796v-8.349a.759.759 0 00-.759-.759H1.701a.181.181 0 01-.095-.335l8.887-8.415a1.3 1.3 0 011.793 0l8.908 8.435a.18.18 0 01-.121.315z"
                    fill="#fafafa"
                    opacity={0.7}
                  />
                </Svg>
              }


              {/* <Svg height= '30'>
                <Image source={focused ? require( '../assets/images/tabs/fnf_active.svg' ) : require( '../assets/images/tabs/home_inactive.png' )} style={{
                  width: 30, height: 30, alignSelf: 'center'
                }} />
              </Svg> */}
            </View>
          )}
      }
    },
    Freiend: {
      screen: FriendsAndFamily,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return(
            <View style={{
              // marginVertical: hp( '2%' )
            }}>
              {focused ?
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={25.25}
                  height={23}
                  viewBox="0 0 25.25 23"
                >
                  <G fill="#fafafa" strokeLinecap="round" strokeLinejoin="round">
                    <Path
                      d="M5.052 11.336A4 4 0 017.252 4a.5.5 0 01.5.5 7.491 7.491 0 010 7c0 .162-2.083 1.561-3.1 3.436A9.187 9.187 0 003.684 19H.753a.5.5 0 01-.5-.5v-.955a6.61 6.61 0 014.799-6.209z"
                      stroke="#fafafa"
                      strokeWidth={0.5}
                    />
                    <Path d="M22.75 22h-17c-.827 0-1.5-.673-1.5-1.5v-1.228c0-2.069.722-4.026 2.088-5.66a9.993 9.993 0 013.453-2.629A5.965 5.965 0 018.25 7c0-3.308 2.692-6 6-6s6 2.692 6 6a5.965 5.965 0 01-1.541 3.983 9.996 9.996 0 013.454 2.629c1.365 1.634 2.087 3.591 2.087 5.66V20.5c0 .827-.673 1.5-1.5 1.5z" />
                    <Path
                      d="M14.25 2c-2.757 0-5 2.243-5 5 0 1.856 1.029 3.461 2.535 4.323-3.767.988-6.535 4.174-6.535 7.949V20.5a.5.5 0 00.5.5h17a.5.5 0 00.5-.5v-1.228c0-3.775-2.768-6.96-6.535-7.949C18.221 10.461 19.25 8.856 19.25 7c0-2.757-2.243-5-5-5m-4 5.637V6.363v1.274m4-7.637c3.86 0 7 3.14 7 7a6.929 6.929 0 01-1.045 3.648 10.848 10.848 0 012.725 2.322c1.518 1.817 2.32 3.996 2.32 6.302V20.5c0 1.379-1.121 2.5-2.5 2.5h-17a2.503 2.503 0 01-2.5-2.5v-1.228c0-2.306.802-4.485 2.32-6.302a10.847 10.847 0 012.725-2.322A6.929 6.929 0 017.25 7c0-3.86 3.14-7 7-7z"
                      fill="#006db4"
                    />
                  </G>
                </Svg> :
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={25.25}
                  height={23}
                  viewBox="0 0 25.25 23"
                >
                  <G fill="#fafafa" strokeLinecap="round" strokeLinejoin="round">
                    <Path
                      d="M5.052 11.336A4 4 0 017.252 4a.5.5 0 01.5.5 7.491 7.491 0 010 7c0 .162-2.083 1.561-3.1 3.436A9.187 9.187 0 003.684 19H.753a.5.5 0 01-.5-.5v-.955a6.61 6.61 0 014.799-6.209z"
                      stroke="#fafafa"
                      strokeWidth={0.5}
                    />
                    <Path d="M22.75 22h-17c-.827 0-1.5-.673-1.5-1.5v-1.228c0-2.069.722-4.026 2.088-5.66a9.993 9.993 0 013.453-2.629A5.965 5.965 0 018.25 7c0-3.308 2.692-6 6-6s6 2.692 6 6a5.965 5.965 0 01-1.541 3.983 9.996 9.996 0 013.454 2.629c1.365 1.634 2.087 3.591 2.087 5.66V20.5c0 .827-.673 1.5-1.5 1.5z" />
                    <Path
                      d="M14.25 2c-2.757 0-5 2.243-5 5 0 1.856 1.029 3.461 2.535 4.323-3.767.988-6.535 4.174-6.535 7.949V20.5a.5.5 0 00.5.5h17a.5.5 0 00.5-.5v-1.228c0-3.775-2.768-6.96-6.535-7.949C18.221 10.461 19.25 8.856 19.25 7c0-2.757-2.243-5-5-5m-4 5.637V6.363v1.274m4-7.637c3.86 0 7 3.14 7 7a6.929 6.929 0 01-1.045 3.648 10.848 10.848 0 012.725 2.322c1.518 1.817 2.32 3.996 2.32 6.302V20.5c0 1.379-1.121 2.5-2.5 2.5h-17a2.503 2.503 0 01-2.5-2.5v-1.228c0-2.306.802-4.485 2.32-6.302a10.847 10.847 0 012.725-2.322A6.929 6.929 0 017.25 7c0-3.86 3.14-7 7-7z"
                      fill="#006db4"
                    />
                  </G>
                </Svg>
              }
            </View>
          )}
      },
    },
    Securiy: {
      screen: SecurityStack,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return(
            <View style={{
              // marginVertical: hp( '2%' )
            }}>
              {focused ?
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={21.471}
                  height={23.731}
                  viewBox="0 0 21.471 23.731"
                >
                  <Path
                    d="M10.734 22.75a.767.767 0 01-.44-.14c-8.15-5.67-7.94-6.67-9.52-15.56a.752.752 0 01.37-.79l9.19-5.39c.04-.03.067-.016.077-.045l.075-.045.028-.03h.22a.06.06 0 01.04.01.663.663 0 01.36.11l9.2 5.39a.768.768 0 01.37.79c-1.58 8.89-1.38 9.89-9.52 15.56a.8.8 0 01-.45.14l-.015.006"
                    opacity={0.7}
                    fill="none"
                    stroke="#fafafa"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  />
                  <Path
                    d="M13.194 9.357l-3.348 3.344-1.286-1.29a.79.79 0 00-1.116 1.116l1.842 1.846a.781.781 0 001.112 0l3.9-3.9a.785.785 0 10-1.108-1.112z"
                    fill="#fafafa"
                    opacity={0.7}
                  />
                </Svg>
                :
                <Svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={21.471}
                  height={23.731}
                  viewBox="0 0 21.471 23.731"
                >
                  <Path
                    d="M10.734 22.75a.767.767 0 01-.44-.14c-8.15-5.67-7.94-6.67-9.52-15.56a.752.752 0 01.37-.79l9.19-5.39c.04-.03.067-.016.077-.045l.075-.045.028-.03h.22a.06.06 0 01.04.01.663.663 0 01.36.11l9.2 5.39a.768.768 0 01.37.79c-1.58 8.89-1.38 9.89-9.52 15.56a.8.8 0 01-.45.14l-.015.006"
                    opacity={0.7}
                    fill="none"
                    stroke="#fafafa"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  />
                  <Path
                    d="M13.194 9.357l-3.348 3.344-1.286-1.29a.79.79 0 00-1.116 1.116l1.842 1.846a.781.781 0 001.112 0l3.9-3.9a.785.785 0 10-1.108-1.112z"
                    fill="#fafafa"
                    opacity={0.7}
                  />
                </Svg>
              }
            </View>
          )}
      },
    },
    Setting: {
      screen: MoreOptionsStack,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return(
            <View style={{
            }}>

              <Image source={require( '../assets/images/tabs/settings.png' )} style={{
                marginBottom: 'auto',
                width: 30, height: 30, alignSelf: 'center',
                // backgroundColor: focused ? 'white': 'gray'
              }} />
            </View>

          )}
      },
    },
  },
  {
    initialRouteName: 'Home',
    // swipeEnabled: false,
    // animationEnabled: false,
    lazy: false,
    tabBarOptions: {
      showLabel: false,
      style: {
        backgroundColor: Colors.blue
      },
      // barStyle: {
      //   // flex: 1,
      //   overflow:'hidden',
      //   backgroundColor: Colors.blue,
      //   borderRadius: 45,
      //   margin: 15,
      //   alignItems: 'center',
      //   height: 70
      // },
      //   // flex: 1,
      //   width: '90%',
      //   // height: '20%',
      //   borderRadius: 45,
      //   overflow:'hidden',
      //   // marginVertical: 9,
      //   // marginHorizontal: 9,
      //   // height: 45,
      //   // marginBottom: hp( '1' ),
      //   alignContent:'center',
      //   alignSelf: 'center',
      //   alignItems: 'center'
      // },
      // tabStyle:{
      //   // margin: 15
      //   // flex: 1,
      //   padding: hp( 1 ),
      //   backgroundColor: Colors.blue,
      //   alignSelf: 'center'
      // }
    }
    // transitionConfig: () => ( {
    //   transitionSpec: {
    //     duration: 0,
    //   },
    // } ),
    // lazy: false,
    // labeled: false,
    // activeColor: 'red',
    // inactiveColor: 'white',

  },
)

const Navigator = createSwitchNavigator( {
  SetupNav: SetupNavigator,
  HomeNav: Bottomtab,
} )


export type BaseNavigationProp = {
  getParam: ( param: string ) => any;
  setParams: ( params: Record<string, unknown> ) => void;
  navigate: ( route: string, params?: Record<string, unknown> ) => void;
} & Record<string, unknown>;

export default createAppContainer( Navigator )
