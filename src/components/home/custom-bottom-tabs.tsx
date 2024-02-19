import React, { useMemo } from 'react'
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'

export enum BottomTab {
  Home,
  FriendsAndFamily,
  SecurityAndPrivacy,
  Settings,
}

export interface Props {
  // isEnabled: boolean;
  tabBarZIndex?: number;
  selectedTab?: BottomTab | null;
  onSelect: ( tab: BottomTab ) => void;
}

type TabItem = {
  tab: BottomTab;
  activeImageSource: ImageSourcePropType;
  inactiveImageSource: ImageSourcePropType;
};

const tabItems: TabItem[] = [
  {
    tab: BottomTab.Home,
    activeImageSource: require( '../../assets/images/HomePageIcons/icon_transactions_active.png' ),
    inactiveImageSource: require( '../../assets/images/HomePageIcons/icon_transactions.png' ),
  },
  {
    tab: BottomTab.FriendsAndFamily,
    activeImageSource: require( '../../assets/images/icons/icon_contact.png' ),
    inactiveImageSource: require( '../../assets/images/icons/icon_contact.png' ),
  },
  {
    tab: BottomTab.SecurityAndPrivacy,
    activeImageSource: require( '../../assets/images/HomePageIcons/icon_qr_active.png' ),
    inactiveImageSource: require( '../../assets/images/HomePageIcons/icon_qr.png' ),
  },
  {
    tab: BottomTab.Settings,
    activeImageSource: require( '../../assets/images/HomePageIcons/icon_more.png' ),
    inactiveImageSource: require( '../../assets/images/HomePageIcons/icon_more.png' ),
  },
]


type TabViewProps = {
  tabItem: TabItem;
  isActive: boolean;
  onPress: () => void;
}

const Tab: React.FC<TabViewProps> = ( {
  tabItem,
  isActive,
  onPress,
}: TabViewProps ) => {

  const imageSource = useMemo( () => {
    return isActive ? tabItem.activeImageSource : tabItem.inactiveImageSource
  }, [ tabItem.activeImageSource, tabItem.inactiveImageSource, isActive ] )

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabBarTabView}
    >
      <View style={styles.tab}>
        <Image
          source={imageSource}
          style={styles.tabBarImage}
        />
      </View>
    </TouchableOpacity>
  )
}

const CustomBottomTabs: React.FC<Props> = ( {
  // isEnabled,
  tabBarZIndex = 1,
  onSelect,
  selectedTab,
}: Props ) => {
  return (
    <View style={styles.bottomTabBarMainView}>
      <View style={{
        ...styles.bottomTabBarContainer, zIndex: tabBarZIndex
      }}>
        {tabItems.map( ( tabItem, index ) => {
          return (
            <Tab
              key={index}
              tabItem={tabItem}
              isActive={selectedTab == tabItem.tab}
              onPress={() => {
              // if ( isEnabled ) {
                onSelect( tabItem.tab )
              // }
              }}
            />
          )
        } )}
      </View>
    </View>
  )
}

export const TAB_BAR_HEIGHT = hp( '9%' )

const styles = StyleSheet.create( {
  bottomTabBarMainView: {
    backgroundColor: Colors.white,
    paddingBottom: DeviceInfo.hasNotch() ? hp( '4%' ) : hp( '1%' ),
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomTabBarContainer: {
    backgroundColor: Colors.blue,
    borderRadius: wp ( 10 ),
    justifyContent: 'space-evenly',
    display: 'flex',
    marginTop: 'auto',
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    width: wp ( '98%' ),
    alignItems: 'center',
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    // paddingBottom: DeviceInfo.hasNotch() ? hp( '4%' ) : 0,
  },

  tabBarTabView: {
    padding: wp( '5%' ),
  },

  tab: {
    padding: 7,
  },

  tabBarImage: {
    width: 21,
    height: 21,
    resizeMode: 'contain',
  },
} )

export default CustomBottomTabs
