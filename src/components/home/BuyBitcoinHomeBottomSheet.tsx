import React from 'react'
import { StyleSheet, ImageSourcePropType, FlatList, Image, Platform } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../common/Styles/ListStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import Colors from '../../common/Colors'
import { TouchableOpacity } from '@gorhom/bottom-sheet'

export type Props = {
  onMenuItemSelected: ( menuItem: BuyBitcoinBottomSheetMenuItem ) => void;
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
    title: 'Buy with Wyre',
    subtitle: 'Buy any amount',
    kind: BuyMenuItemKind.WYRE,
    imageSource: require( '../../assets/images/icons/wyre_notext_small.png' ),
    disabled: false
  },
  {
    title: Platform.OS == 'ios' ? 'Buy with Ramp' : 'Buy with Ramp',
    subtitle: 'Low fee for those big buys',
    kind: BuyMenuItemKind.RAMP,
    imageSource: require( '../../assets/images/icons/ramp_logo_notext.png' ),
    disabled: false
  },
  {
    title: 'Scan a Voucher',
    subtitle: 'From select retail stores with FastBitcoins',
    kind: BuyMenuItemKind.FAST_BITCOINS,
    imageSource: require( '../../assets/images/icons/icon_fastbitcoins_light_blue.png' ),
    disabled: false
  },
  {
    title: 'Set up automatic buys',
    subtitle: 'Stack sats with Swan Bitcoin',
    kind: BuyMenuItemKind.SWAN,
    imageSource: require( '../../assets/images/icons/swan.png' ),
    disabled: false
  }
]

const listItemKeyExtractor = ( item: BuyBitcoinBottomSheetMenuItem ) => item.title

const BuyBitcoinHomeBottomSheet: React.FC<Props> = ( { onMenuItemSelected, }: Props ) => {

  const renderItem = ( { item: menuItem }: { item: BuyBitcoinBottomSheetMenuItem } ) => {
    return (
      <TouchableOpacity
        onPress={() => { onMenuItemSelected( menuItem ) }}
        disabled={menuItem.disabled}
      >
        <ListItem
          containerStyle={menuItem.disabled ? ListStyles.disabledContainer : ListStyles.container}
          bottomDivider
        >
          <Image
            source={menuItem.imageSource}
            style={ImageStyles.thumbnailImageSmall}
            resizeMode="contain"
          />

          <ListItem.Content style={ListStyles.listItemContentContainer}>
            <ListItem.Title style={menuItem.disabled ? ListStyles.disabledListItemTitle : ListStyles.listItemTitle }>{menuItem.title}</ListItem.Title>
            <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuItem.subtitle}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      style={styles.rootContainer}
      data={menuItems}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
} )

export default BuyBitcoinHomeBottomSheet
