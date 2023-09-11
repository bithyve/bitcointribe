import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Launch from '../pages/Launch'
import Login from '../pages/Login'
import SettingGetNewPin from '../pages/SettingGetNewPin'
import PasscodeConfirm from '../pages/PasscodeConfirm'
import WalletInitializationScreen from '../pages/WalletInitializationScreen'
import RestoreSelectedContactsList from '../pages/Recovery/RestoreSelectedContactsList'
import NewWalletName from '../pages/NewWalletName'
import CreateWithBorderWallet from '../pages/borderwallet/CreateWithBorderWallet'
import BorderWalletGridScreen from '../pages/borderwallet/BorderWalletGridScreen'
import SelectEntropyGridType from '../pages/borderwallet/SelectEntropyGridType'
import DownloadEncryptGrid from '../pages/borderwallet/DownloadEncryptGrid'
import SelectChecksumWord from '../pages/borderwallet/SelectChecksumWord'
import CreatePassPhrase from '../pages/borderwallet/CreatePassPhrase'
import ConfirmDownload from '../pages/borderwallet/ConfirmDownload'
import PreviewPattern from '../pages/borderwallet/PreviewPattern'
import RecoverBorderWallet from '../pages/borderwallet/RecoverBorderWallet'
import RegenerateEntropyGrid from '../pages/borderwallet/RegenerateEntropyGrid'
import AccountSelection from '../pages/AccountSelection'
import NewWalletQuestion from '../pages/NewWalletQuestion'
import RestoreWalletBySecondaryDevice from '../pages/Recovery/RestoreWalletBySecondaryDevice'
import RestoreWalletByContacts from '../pages/Recovery/RestoreWalletByContacts'
import WalletNameRecovery from '../pages/Recovery/WalletNameRecovery'
import RecoveryQuestionScreen from '../pages/Recovery/RecoveryQuestionScreen'
import RecoveryCommunication from '../pages/Recovery/RecoveryCommunication'
import QRScannerScreen from '../pages/QRScannerScreen'
import UpdateApp from '../pages/UpdateApp'
import NewOwnQuestions from '../pages/NewOwnQuestions'
import NewRecoveryOwnQuestions from '../pages/Recovery/NewRecoveryOwnQuestions'
import HomeStack from './stacks/home/HomeStack'
import FriendsAndFamily from './stacks/F&F/F&FStack'
import Colors from '../common/Colors'
import CreateKeeperScreen from '../pages/CreateKeeperScreen'

import RestoreWithICloud from '../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import ScanRecoveryKey from '../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, StyleSheet } from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import HomeSVG from '../assets/images/tabs/home.svg'
import HomeInactiveSVG from '../assets/images/tabs/home_inactive.svg'
import SettingsInactive from '../assets/images/tabs/settings.svg'
import Settings from '../assets/images/tabs/settings_active.svg'
import FnFInactive from '../assets/images/tabs/f&f.svg'
import FnF from '../assets/images/tabs/fnf_active.svg'
import MoreOptionsStack from './stacks/more-options/MoreOptionsStack'
import Header from './stacks/Header'
import SmallNavHeaderBackButton from '../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from './options/DefaultStackScreenNavigationOptions'
import RestoreSeedWordsContent from '../pages/RestoreHexaWithKeeper/RestoreSeedWordsContent'
import GiftStack from './stacks/gift/GiftStack'
import Filled_gift_tab from '../assets/images/satCards/filled_gift_tab.svg'
import Gift_tab from '../assets/images/satCards/gift_tab.svg'
import LinearGradient from 'react-native-linear-gradient'

const SetupStack = createNativeStackNavigator()
function SetupNavigator() {
  return (
    <SetupStack.Navigator initialRouteName='Launch' screenOptions={{
      headerShown: false, headerTitleAlign: 'center'
    }}>
      <SetupStack.Screen name="Launch" component={Launch} />
      <SetupStack.Screen name="Login" component={Login} />
      <SetupStack.Screen name="PasscodeConfirm" component={PasscodeConfirm} />
      <SetupStack.Screen name="WalletInitialization" component={WalletInitializationScreen} />
      <SetupStack.Screen name="NewWalletName" component={NewWalletName} />
    </SetupStack.Navigator>
  )
}
//TODO: add all below screens to setupnavigator
// const SetupNavigator = createStackNavigator(
//   {
//     Launch,
//     Login,
//     SettingGetNewPin: {
//       screen: SettingGetNewPin,
//       navigationOptions: ( { navigation } ) => {
//         return {
//           ...defaultStackScreenNavigationOptions,
//           headerLeft: () => {
//             return <SmallNavHeaderBackButton onPress={() => {
//               navigation.popToTop() }} />
//           },
//           title: 'Manage Passcode',
//           headerShown: true
//         }
//       },
//     },
//     PasscodeConfirm,
//     NewWalletName,
//     CreateKeeperScreen,
//     CreateWithBorderWallet,
//     SelectEntropyGridType,
//     DownloadEncryptGrid,
//     BorderWalletGridScreen,
//     SelectChecksumWord,
//     CreatePassPhrase,
//     ConfirmDownload,
//     PreviewPattern,
//     RecoverBorderWallet,
//     RegenerateEntropyGrid,
//     AccountSelection,
//     NewWalletQuestion,
//     WalletInitialization: WalletInitializationScreen,
//     RestoreSeedWordsContent,
//     WalletNameRecovery,
//     RecoveryQuestion: RecoveryQuestionScreen,
//     RestoreSelectedContactsList,
//     RestoreWalletBySecondaryDevice,
//     RestoreWalletByContacts,
//     RecoveryCommunication,
//     NewOwnQuestions,
//     RecoveryQrScanner: QRScannerScreen,
//     NewRecoveryOwnQuestions,
//     RestoreWithICloud,
//     ScanRecoveryKey,
//     QRScanner: QRScannerScreen,
//     UpdateApp: {
//       screen: UpdateApp,
//       navigationOptions: {
//         gesturesEnabled: false,
//       },
//     },
//   },
//   {
//     initialRouteName: 'Launch',
//     headerLayoutPreset: 'center',
//     defaultNavigationOptions: () => ( {
//       header: null,
//     } ),
//   },
// )

const styles= StyleSheet.create( {
  activeStyle:{
    alignSelf: 'center',
    marginTop: 5,
    width: widthPercentageToDP( 1 ),
    height: widthPercentageToDP( 1 ),
    borderRadius: widthPercentageToDP( 0.5 ),
    backgroundColor: Colors.white
  },
  inactiveStyle: {
    alignSelf: 'center',
    marginTop: 2,
    width: widthPercentageToDP( 1 ),
    height: widthPercentageToDP( 1 ),
    borderRadius: widthPercentageToDP( 0.5 ),
  }
} )

const GradientTab = props => {
  return (
    <View style={{
      backgroundColor: 'transparent'
    }}>
      <LinearGradient
        colors={[ Colors.darkBlue, Colors.darkBlue ]}
        start={{
          x:0, y:0
        }}
        end={{
          x:0.01, y:0.1
        }}
      >
        <BottomTabBar {...props} />
      </LinearGradient>
    </View >
  )
}

const Tab = createBottomTabNavigator()
function BottomTab() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle:{
          backgroundColor: Colors.THEAM_TEXT_COLOR

        }
      }}

    >
      <Tab.Screen name="Home" component={HomeStack}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ( { focused } ) => (
            <View style={{
              marginTop: hp( '1.3%' )
            }}>
              {focused ?
                <HomeSVG/>
                :
                <HomeInactiveSVG/>
              }

              {focused ?
                <View style={styles.activeStyle}/>
                :
                <View style={styles.inactiveStyle}/>
              }
            </View>
          ),
        }}
      />
      <Tab.Screen name="FriendsAndFamily" component={FriendsAndFamily}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ( { focused } ) => (
            <View style={{
              marginTop: hp( '1.3%' ),
            }}>
              {focused ?
                <FnF /> : <FnFInactive />
              }
              {focused ?
                <View style={styles.activeStyle}/>
                :
                <View style={styles.inactiveStyle}/>
              }
            </View>
          ),
        }}
      />
      <Tab.Screen name="GiftStack" component={GiftStack}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ( { focused } ) => (
            <View style={{
              marginTop: hp( '0.85%' ),

            }}>
              {/* <IconWithBadge focused={focused} /> */}
              {focused ?
                <Filled_gift_tab /> : <Gift_tab />
              }
            </View>
          ),
        }}
      />
      <Tab.Screen name="MoreOptionsStack" component={MoreOptionsStack}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ( { focused } ) => (
            <View style={{
              marginTop: hp( '1.3%' )
            }}>
              {focused ?
                <Settings />
                :
                <SettingsInactive />
              }
              {focused ?
                <View style={styles.activeStyle}/>
                :
                <View style={styles.inactiveStyle}/>
              }
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  )
}
//TODO: add all below bottom tabs
// const BottomTab = createBottomTabNavigator(
//   {
//     Home: {
//       screen: HomeStack,
//       navigationOptions: {
//         tabBarIcon: ( { focused } ) => {
//           return (
//             <View style={{
//               marginTop: hp( '1.3%' )
//             }}>
//               {focused ?
//                 <HomeSVG/>
//                 :
//                 <HomeInactiveSVG/>
//               }

//               {focused ?
//                 <View style={styles.activeStyle}/>
//                 :
//                 <View style={styles.inactiveStyle}/>
//               }
//             </View>
//           )
//         }
//       }
//     },
//     Freiend: {
//       screen: FriendsAndFamily,
//       navigationOptions: {
//         tabBarIcon: ( { focused } ) => {
//           return (
//             <View style={{
//               marginTop: hp( '1.3%' )
//             }}>
//               {focused ?
//                 <FnF /> : <FnFInactive />
//               }
//               {focused ?
//                 <View style={styles.activeStyle}/>
//                 :
//                 <View style={styles.inactiveStyle}/>
//               }
//             </View>
//           )
//         }
//       },
//     },
//     Securiy: {
//       screen: GiftStack,
//       navigationOptions: {
//         tabBarIcon: ( { focused } ) => {
//           return (
//             <View style={{
//               marginTop: hp( '0.85%' )
//             }}>
//               {/* <IconWithBadge focused={focused} /> */}
//               {focused ?
//                 <Filled_gift_tab /> : <Gift_tab />
//               }
//             </View>
//           )
//         }
//       },
//     },

//     Setting: {
//       screen: MoreOptionsStack,
//       navigationOptions: {
//         tabBarIcon: ( { focused } ) => {
//           return (
//             <View style={{
//               marginTop: hp( '1.3%' )
//             }}>
//               {focused ?
//                 <Settings />
//                 :
//                 <SettingsInactive />
//               }
//               {focused ?
//                 <View style={styles.activeStyle}/>
//                 :
//                 <View style={styles.inactiveStyle}/>
//               }
//             </View>

//           )
//         }
//       },
//     },
//   },
//   {
//     initialRouteName: 'Home',
//     tabBarComponent: GradientTab,
//     tabBarOptions: {
//       showLabel: false,
//       style: {
//         backgroundColor: 'transparent',
//       },
//     }
//   },
// )

const HomeStackInit = createNativeStackNavigator()
function HomeNavigator() {
  return (
    <HomeStackInit.Navigator>
      <HomeStackInit.Screen name="Landing" component={BottomTab} options={{
        headerShown: false
      }}/>
    </HomeStackInit.Navigator>
  )
}

//TODO: add below default navigation options to navigator
// const HomeNavigator = createStackNavigator(
//   {
//     Landing: {
//       screen: Bottomtab
//     },
//   }, {
//     defaultNavigationOptions: ( { navigation } ) => {
//       return {
//         header: () => {
//           return <Header showContent={( navigation.state.routes[ 0 ] && navigation.state.routes[ 0 ].routes.length == 1 ) &&
//             ( navigation.state.routes[ 1 ].routes.length == 1 ) &&
//             ( navigation.state.routes[ 2 ].routes.length == 1 ) &&
//             ( navigation.state.routes[ 3 ].routes.length == 1 )
//           }
//           />
//         },
//       }
//     },
//   }
// )


const SwitchStack = createNativeStackNavigator()
//TODO: conditionally add below screens as createSwitchNavigator is removed
function Navigator() {
  return (
    <NavigationContainer>
      <SwitchStack.Navigator>
        <SwitchStack.Screen name="SetupNav" component={SetupNavigator} options={{
          headerShown: false
        }} />
        <SwitchStack.Screen name="HomeNav" component={HomeNavigator} options={{
          headerShown: false
        }}/>
      </SwitchStack.Navigator>
    </NavigationContainer>
  )
}
// const Navigator = createSwitchNavigator( {
//   SetupNav: SetupNavigator,
//   HomeNav: HomeNavigator,
// } )


export type BaseNavigationProp = {
  getParam: ( param: string ) => any;
  setParams: ( params: Record<string, unknown> ) => void;
  navigate: ( route: string, params?: Record<string, unknown> ) => void;
} & Record<string, unknown>;

export default Navigator
