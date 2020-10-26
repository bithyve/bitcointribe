import React, { useMemo } from 'react'
import { View, Image, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native'
import Colors from '../../common/Colors';
import DeviceInfo from 'react-native-device-info';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export enum BottomTab {
  Transactions,
  Add,
  QR,
  More,
}

export interface Props {
  tabBarZIndex?: number;
  onSelect: (tab: BottomTab) => void;
  selectedTab: BottomTab | null;
}

type TabItem = {
  tab: BottomTab;
  activeImageSource: ImageSourcePropType;
  inactiveImageSource: ImageSourcePropType;
};

const tabItems: TabItem[] = [
  {
    tab: BottomTab.Transactions,
    activeImageSource: require('../../assets/images/HomePageIcons/icon_transactions_active.png'),
    inactiveImageSource: require('../../assets/images/HomePageIcons/icon_transactions.png'),
  },
  {
    tab: BottomTab.Add,
    activeImageSource: require('../../assets/images/HomePageIcons/icon_add_active.png'),
    inactiveImageSource: require('../../assets/images/HomePageIcons/icon_add.png'),
  },
  {
    tab: BottomTab.QR,
    activeImageSource: require('../../assets/images/HomePageIcons/icon_qr_active.png'),
    inactiveImageSource: require('../../assets/images/HomePageIcons/icon_qr.png'),
  },
  {
    tab: BottomTab.More,
    activeImageSource: require('../../assets/images/HomePageIcons/icon_more.png'),
    inactiveImageSource: require('../../assets/images/HomePageIcons/icon_more.png'),
  },
];


type TabViewProps = {
  tabItem: TabItem;
  isActive: boolean;
  onPress: () => void;
}

const Tab: React.FC<TabViewProps> = ({
  tabItem,
  isActive,
  onPress,
}: TabViewProps) => {

  const imageSource = useMemo(() => {
    return isActive ? tabItem.activeImageSource : tabItem.inactiveImageSource;
  }, [tabItem.activeImageSource, tabItem.inactiveImageSource, isActive]);

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
  );
}

const CustomBottomTabs: React.FC<Props> = ({
  tabBarZIndex = 1,
  onSelect,
  selectedTab,
}: Props) => {
  return (
    <View style={{ ...styles.bottomTabBarContainer, zIndex: tabBarZIndex }}>
      {tabItems.map((tabItem, index) => {
        return (
          <Tab
            key={index}
            tabItem={tabItem}
            isActive={selectedTab == tabItem.tab}
            onPress={() => onSelect(tabItem.tab)}
          />
        );
      })}
    </View>
  )
}

export const TAB_BAR_HEIGHT = hp('12%');

const styles = StyleSheet.create({

  bottomTabBarContainer: {
    backgroundColor: Colors.white,
    justifyContent: 'space-evenly',
    display: 'flex',
    marginTop: 'auto',
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    paddingBottom: DeviceInfo.hasNotch() ? hp('4%') : 0,
  },

  tabBarTabView: {
    padding: wp('5%'),
  },

  tab: {
    padding: 7,
  },

  tabBarImage: {
    width: 21,
    height: 21,
    resizeMode: 'contain',
  },
})

export default CustomBottomTabs
