import React from 'react'
import { View, ImageSourcePropType, FlatList, Image, Platform, TouchableOpacity } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../common/Styles/ListStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import Colors from '../../common/Colors'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'

export type Props = {
  onMenuItemSelected: (menuItem: BuyBitcoinBottomSheetMenuItem) => void;
}

export enum BuyMenuItemKind {
  FAST_BITCOINS = 'FAST_BITCOINS',
  SWAN = 'SWAN',
  WYRE = 'WYRE',
  RAMP = 'RAMP'
}

export type BuyBitcoinBottomSheetMenuItem = {
  title: string;
  subtitle: string;
  kind: BuyMenuItemKind;
  imageSource: ImageSourcePropType;
  disabled: boolean;
}

const menuItems: BuyBitcoinBottomSheetMenuItem[] = [
  {
    title: Platform.OS == 'ios' ? 'Ramp Bitcoin' : 'Ramp Bitcoin',
    subtitle: 'Low fee for those big buys',
    kind: BuyMenuItemKind.RAMP,
    imageSource: require('../../assets/images/icons/ramp_logo_notext.png'),
    disabled: false
  },
  {
    title: 'Wyre Bitcoin',
    subtitle: 'Buy any amount',
    kind: BuyMenuItemKind.WYRE,
    imageSource: require('../../assets/images/icons/wyre_notext_small.png'),
    disabled: false
  },
  {
    title: 'Set up automatic buys',
    subtitle: 'Stack sats with Swan Bitcoin',
    kind: BuyMenuItemKind.SWAN,
    imageSource: require('../../assets/images/icons/swan.png'),
    disabled: false
  },
  {
    title: 'Scan a Voucher',
    subtitle: 'From select retail stores with FastBitcoins',
    kind: BuyMenuItemKind.FAST_BITCOINS,
    imageSource: require('../../assets/images/icons/icon_fastbitcoins_light_blue.png'),
    disabled: false
  }
]

const listItemKeyExtractor = (item: BuyBitcoinBottomSheetMenuItem) => item.title

const BuyBitcoinHomeBottomSheet: React.FC<Props> = ({ onMenuItemSelected, }: Props) => {

  const renderItem = ({ item: menuItem }: { item: BuyBitcoinBottomSheetMenuItem }) => {
    return (
      <TouchableOpacity
        onPress={() => { onMenuItemSelected(menuItem) }}
        disabled={menuItem.disabled}
      >
        <ListItem
          containerStyle={menuItem.disabled ? ListStyles.disabledContainer : [ListStyles.container, {
            marginHorizontal: 0,
            shadowOpacity: 0.16,
            shadowOffset: {
              width: 30, height: 30
            },
            shadowRadius: 9,
            elevation: 2,
            width: widthPercentageToDP(95),
            marginBottom: heightPercentageToDP(1),
            borderTopRightRadius: widthPercentageToDP(2),
            borderBottomRightRadius: widthPercentageToDP(2)
          }]}
        // bottomDivider
        >
          <View style={{
            width: widthPercentageToDP(12), height: widthPercentageToDP(12), borderRadius: widthPercentageToDP(6),
            shadowOpacity: 0.16,
            shadowOffset: {
              width: 30, height: 30
            },
            shadowRadius: 15,
            elevation: widthPercentageToDP(12),
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Image
              source={menuItem.imageSource}
              style={ImageStyles.thumbnailImageSmall}
              resizeMode="contain"
            />
          </View>


          <ListItem.Content style={ListStyles.listItemContentContainer}>
            <ListItem.Title style={menuItem.disabled ? ListStyles.disabledListItemTitle : ListStyles.listItemTitle}>{menuItem.title}</ListItem.Title>
            <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuItem.subtitle}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>


      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      // style={styles.rootContainer}
      data={menuItems}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  )
}

// const styles = StyleSheet.create( {
//   rootContainer: {
//     // flex: 1,
//     // backgroundColor: Colors.blue,
//   },
// } )

export default BuyBitcoinHomeBottomSheet
