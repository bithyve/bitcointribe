import React from 'react'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import {
  createStackNavigator,
  StackViewTransitionConfigs,
} from 'react-navigation-stack'
import Launch from '../pages/Launch'
import Login from '../pages/Login'
import SettingGetNewPin from '../pages/SettingGetNewPin'
import TwoFAValidation from '../pages/Accounts/TwoFAValidation'
import PasscodeConfirm from '../pages/PasscodeConfirm'
import WalletInitializationScreen from '../pages/WalletInitializationScreen'
import RestoreSelectedContactsList from '../pages/Recovery/RestoreSelectedContactsList'
import NewWalletName from '../pages/NewWalletName'
import AccountSelection from '../pages/AccountSelection'
import NewWalletQuestion from '../pages/NewWalletQuestion'
import RestoreWalletBySecondaryDevice from '../pages/Recovery/RestoreWalletBySecondaryDevice'
import RestoreWalletByContacts from '../pages/Recovery/RestoreWalletByContacts'
import ReLogin from '../pages/ReLogin'
import CustodianRequestOTP from '../pages/CustodianRequest/CustodianRequestOTP'
import CustodianRequestAccepted from '../pages/CustodianRequest/CustodianRequestAccepted'
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
import Intermediate from '../pages/Intermediate'

import RestoreWithICloud from '../pages/RestoreHexaWithKeeper/RestoreWithICloud'
import ScanRecoveryKey from '../pages/RestoreHexaWithKeeper/ScanRecoveryKey'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { Text, View, Image, StyleSheet } from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import Svg, { G, Path, Defs } from 'react-native-svg'
import HomeSVG from '../assets/images/tabs/home.svg'
import HomeInactiveSVG from '../assets/images/tabs/home_inactive.svg'
import SecurityInactive from '../assets/images/tabs/security.svg'
import Security from '../assets/images/tabs/security_active.svg'
import SettingsInactive from '../assets/images/tabs/settings.svg'
import Settings from '../assets/images/tabs/settings_active.svg'
import FnFInactive from '../assets/images/tabs/f&f.svg'
import FnF from '../assets/images/tabs/fnf_active.svg'
import MoreOptionsStack from './stacks/more-options/MoreOptionsStack'
import SecurityStack from './stacks/security/Security&Privacy'
import BuyStack from './stacks/buy/BuyStack'
import Header from './stacks/Header'
import IconWithBadge from './stacks/security/IconWithBadge'
import SmallNavHeaderBackButton from '../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from './options/DefaultStackScreenNavigationOptions'

const SetupNavigator = createStackNavigator(
  {
    Launch,
    Login,
    SettingGetNewPin: {
      screen: SettingGetNewPin,
      navigationOptions: ( { navigation } ) => {
        return {
          ...defaultStackScreenNavigationOptions,
          headerLeft: () => {
            return <SmallNavHeaderBackButton onPress={() => {
              navigation.popToTop() }} />
          },
          title: 'Manage Passcode',
          headerShown: true
        }
      },
    },
    PasscodeConfirm,
    NewWalletName,
    AccountSelection,
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
    // backgroundColor: Colors.white
  }
} )

const Bottomtab = createBottomTabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return (
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
              {/* <Svg height= '30'>
                <Image source={focused ? require( '../assets/images/tabs/fnf_active.svg' ) : require( '../assets/images/tabs/home_inactive.png' )} style={{
                  width: 30, height: 30, alignSelf: 'center'
                }} />
              </Svg> */}
            </View>
          )
        }
      }
    },
    Freiend: {
      screen: FriendsAndFamily,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return (
            <View style={{
              marginTop: hp( '1.3%' )
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
          )
        }
      },
    },
    // Buy: {
    //   screen: BuyStack,
    //   navigationOptions: {
    //     tabBarIcon: ( { focused } ) => {
    //       return (
    //         <View style={{
    //           // marginVertical: hp( '2%' )
    //         }}>
    //           {focused ?
    //             <Image source={require( '../assets/images/tabs/buy_active.png' )} style={{
    //               marginBottom: 'auto',
    //               width: 19, height: 23, alignSelf: 'center',
    //               resizeMode: 'contain'
    //               // backgroundColor: focused ? 'white': 'gray'
    //             }} />
    //             :
    //             <Image source={require( '../assets/images/tabs/buy.png' )} style={{
    //               marginBottom: 'auto',
    //               width: 19, height: 23, alignSelf: 'center',
    //               resizeMode: 'contain'
    //               // backgroundColor: focused ? 'white': 'gray'
    //             }} />
    //           }
    //           {/* {focused ?
    //             <Svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               width={18.824}
    //               height={23.21}
    //               viewBox="0 0 18.824 23.21"
    //             >
    //               <Defs></Defs>
    //               <Path
    //                 className="prefix__a"
    //                 d="M2.56 16.811c-.333.015-.668.011-1.018.007h-.51a.463.463 0 00-.456.384l-.467 2.681a.463.463 0 00.456.543h4.063v2.195a.463.463 0 00.463.463h2.221a.463.463 0 00.463-.463v-2.08h.84v2.109a.463.463 0 00.463.463h2.25a.463.463 0 00.463-.463v-2.122l1.267-.032a5.35 5.35 0 003.369-9.73 4.821 4.821 0 00-3.567-8.068h-.951V.584a.463.463 0 00-.463-.463H9.195a.463.463 0 00-.463.463v2h-.838V.563a.463.463 0 00-.466-.459H5.182a.463.463 0 00-.463.463v2.137H.709a.463.463 0 00-.463.463v2.337a.463.463 0 00.463.463h.845c.28.007.561.014.84.038.533.048.721.254.717.789q-.037 4.763-.086 9.526c-.004.414-.06.473-.465.491zM2.477 5.084c-.3-.027-.6-.034-.9-.042h-.4V3.633h4.01a.463.463 0 00.463-.463V1.026h1.318v2.021a.463.463 0 00.463.463h1.764a.463.463 0 00.463-.463v-2h1.33v2.118a.463.463 0 00.136.328.426.426 0 00.328.135h1.414a3.895 3.895 0 012.521 6.866.463.463 0 00.075.758 4.43 4.43 0 01-2.405 8.322h-.012l-1.724.044a.463.463 0 00-.451.463v2.103H9.543v-2.109a.463.463 0 00-.463-.463H7.313a.463.463 0 00-.463.463v2.08H5.555V19.96a.463.463 0 00-.463-.463H1.115l.305-1.753h.108c.368 0 .719.007 1.068-.008a1.252 1.252 0 001.351-1.4q.05-4.764.086-9.528a1.561 1.561 0 00-1.556-1.723z"
    //               />
    //               <Path
    //                 className="prefix__a"
    //                 d="M7.435 10.654h2.953a2.683 2.683 0 100-5.366H7.435a.463.463 0 00-.463.463v4.437a.463.463 0 00.463.466zm.463-4.439h2.49a1.757 1.757 0 110 3.513h-2.49zM7.435 17.807h3.691a2.928 2.928 0 100-5.855H7.435a.463.463 0 00-.463.463v4.929a.463.463 0 00.463.463zm.463-4.929h3.227a2 2 0 110 4H7.898z"
    //               />
    //             </Svg>
    //             :
    //             <Svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               width={18.824}
    //               height={23.21}
    //               viewBox="0 0 18.824 23.21"
    //             >
    //               <Defs></Defs>
    //               <Path
    //                 className="prefix__a"
    //                 d="M2.56 16.811c-.333.015-.668.011-1.018.007h-.51a.463.463 0 00-.456.384l-.467 2.681a.463.463 0 00.456.543h4.063v2.195a.463.463 0 00.463.463h2.221a.463.463 0 00.463-.463v-2.08h.84v2.109a.463.463 0 00.463.463h2.25a.463.463 0 00.463-.463v-2.122l1.267-.032a5.35 5.35 0 003.369-9.73 4.821 4.821 0 00-3.567-8.068h-.951V.584a.463.463 0 00-.463-.463H9.195a.463.463 0 00-.463.463v2h-.838V.563a.463.463 0 00-.466-.459H5.182a.463.463 0 00-.463.463v2.137H.709a.463.463 0 00-.463.463v2.337a.463.463 0 00.463.463h.845c.28.007.561.014.84.038.533.048.721.254.717.789q-.037 4.763-.086 9.526c-.004.414-.06.473-.465.491zM2.477 5.084c-.3-.027-.6-.034-.9-.042h-.4V3.633h4.01a.463.463 0 00.463-.463V1.026h1.318v2.021a.463.463 0 00.463.463h1.764a.463.463 0 00.463-.463v-2h1.33v2.118a.463.463 0 00.136.328.426.426 0 00.328.135h1.414a3.895 3.895 0 012.521 6.866.463.463 0 00.075.758 4.43 4.43 0 01-2.405 8.322h-.012l-1.724.044a.463.463 0 00-.451.463v2.103H9.543v-2.109a.463.463 0 00-.463-.463H7.313a.463.463 0 00-.463.463v2.08H5.555V19.96a.463.463 0 00-.463-.463H1.115l.305-1.753h.108c.368 0 .719.007 1.068-.008a1.252 1.252 0 001.351-1.4q.05-4.764.086-9.528a1.561 1.561 0 00-1.556-1.723z"
    //               />
    //               <Path
    //                 className="prefix__a"
    //                 d="M7.435 10.654h2.953a2.683 2.683 0 100-5.366H7.435a.463.463 0 00-.463.463v4.437a.463.463 0 00.463.466zm.463-4.439h2.49a1.757 1.757 0 110 3.513h-2.49zM7.435 17.807h3.691a2.928 2.928 0 100-5.855H7.435a.463.463 0 00-.463.463v4.929a.463.463 0 00.463.463zm.463-4.929h3.227a2 2 0 110 4H7.898z"
    //               />
    //             </Svg>
    //           } */}
    //           {focused &&
    //           <View style={styles.activeStyle}/>
    //           }
    //         </View>
    //       )
    //     }
    //   },
    // },
    Securiy: {
      screen: SecurityStack,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return (
            <View style={{marginTop: hp( '1.3%' )}}>
            <IconWithBadge focused={focused} />
            </View>
          )
        }
      },
    },

    Setting: {
      screen: MoreOptionsStack,
      navigationOptions: {
        tabBarIcon: ( { focused } ) => {
          return (
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

          )
        }
      },
    },
  },
  {
    initialRouteName: 'Home',
    // swipeEnabled: false,
    // animationEnabled: false,
    // lazy: false,
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
const HomeNavigator = createStackNavigator(
  {
    Landing: {
      screen: Bottomtab,
      // navigationOptions: {
      //   gesturesEnabled: false,
      // },

    },
    // Intermediate,
    // Login,
  }, {
    defaultNavigationOptions: ( { navigation } ) => {
      // if ( ( navigation.state.routes[ 0 ] && navigation.state.routes[ 0 ].routes.length == 1 ) &&
      // ( navigation.state.routes[ 1 ].routes.length == 1 ) &&
      // ( navigation.state.routes[ 2 ].routes.length == 1 ) &&
      // ( navigation.state.routes[ 3 ].routes.length == 1 )
      // ) {
      return {
        header: () => {
          return <Header showContent={( navigation.state.routes[ 0 ] && navigation.state.routes[ 0 ].routes.length == 1 ) &&
            ( navigation.state.routes[ 1 ].routes.length == 1 ) &&
            ( navigation.state.routes[ 2 ].routes.length == 1 ) &&
            ( navigation.state.routes[ 3 ].routes.length == 1 )
          }
          />
        },
      }
      // } else {
      //   return {
      //     header: null
      //   }
      // }
    },
  }
)

const Navigator = createSwitchNavigator( {
  SetupNav: SetupNavigator,
  HomeNav: HomeNavigator,
} )


export type BaseNavigationProp = {
  getParam: ( param: string ) => any;
  setParams: ( params: Record<string, unknown> ) => void;
  navigate: ( route: string, params?: Record<string, unknown> ) => void;
} & Record<string, unknown>;

export default createAppContainer( Navigator )
