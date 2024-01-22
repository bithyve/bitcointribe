import { StyleSheet, View } from 'react-native'
import React from 'react'
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Wallet_activeSVG from '../../assets/images/tabs/wallet_active.svg'
import Wallet_InactiveSVG from '../../assets/images/tabs/wallet_inactive.svg'
import SettingsInactive from '../../assets/images/tabs/settings.svg'
import Settings from '../../assets/images/tabs/settings_active.svg'
import Filled_gift_tab from '../../assets/images/satCards/filled_gift_tab.svg'
import RGBActive from '../../assets/images/tabs/rgb_active.svg'
import RGBInactive from '../../assets/images/tabs/rgb_inactive.svg'
import Gift_tab from '../../assets/images/satCards/gift_tab.svg'
import { useNavigationState } from '@react-navigation/native'
import FnFInactive from '../../assets/images/tabs/f&f.svg'
import FnF from '../../assets/images/tabs/fnf_active.svg'
import Header from '../stacks/Header'
import Colors from '../../common/Colors'
import Home from '../../pages/Home/Home'
import AssetsScreen from '../../pages/Assets/AssetsScreen'
import GiftScreen from '../../pages/Gift/GiftScreen'
import MoreOptionsContainerScreen from '../../pages/MoreOptions/MoreOptionsContainerScreen'
import FriendsAndFamilyScreen from '../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP
} from 'react-native-responsive-screen'
import LinearGradient from 'react-native-linear-gradient'

const Tab = createBottomTabNavigator()

function HomeScreen( { navigation } ) {
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

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={GradientTab}
      backBehavior='none'
      screenOptions={( { route, navigation } ) => {
        return ( {
          header: () => {
            return <Header showContent={true} route={route} navigation={navigation}/>
          },
          tabBarShowLabel: false,
          tabBarStyle:{
            backgroundColor: Colors.darkBlue
          }
        } )}}
    >
      <Tab.Screen name="HomeTab" component={Home}
        options={{
          tabBarIcon: ( { focused } ) => (
            <View style={{
              marginTop: hp( '1.3%' )
            }}>
              {focused ?
                <Wallet_activeSVG/>
                :
                <Wallet_InactiveSVG/>
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
      <Tab.Screen name="Assets" component={AssetsScreen}
        options={{
          tabBarIcon: ( { focused } ) => (
            <View style={{
              marginTop: hp( '1.3%' )
            }}>
              {focused ?
                <RGBActive/>
                :
                <RGBInactive/>
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
      <Tab.Screen name="FriendsAndFamily" component={FriendsAndFamilyScreen}
        options={{
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
      <Tab.Screen name="GiftStack" component={GiftScreen}
        options={{
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
      <Tab.Screen name="MoreOptionsStack" component={MoreOptionsContainerScreen}
        options={{
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

export default HomeScreen

const getStyles = ( colorMode ) =>
  StyleSheet.create( {
    container: {
      backgroundColor: colorMode === 'light' ? '#FDF7F0' : '#48514F',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 27,
      paddingVertical: 15,
    },
    tabContainer: {
      backgroundColor: colorMode === 'light' ? '#F2EDE6' : '#323C3A',
    },
    label: {
      marginLeft: 10,
      fontSize: 14,
    },
  } )
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
