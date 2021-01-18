import React from 'react'
import { StyleSheet, ImageSourcePropType, FlatList, Image } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../common/Styles/ListStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import Colors from '../../common/Colors'

export type Props = {
  onMenuItemSelected: ( menuItem: BuyBitcoinBottomSheetMenuItem ) => void;
}

export enum BuyMenuItemKind {
  FAST_BITCOINS = 'FAST_BITCOINS',
  SWAN = 'SWAN',
  WYRE = 'WYRE',
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
    title: 'Scan a Voucher',
    subtitle: 'From select retail stores with FastBitcoins',
    kind: BuyMenuItemKind.FAST_BITCOINS,
    imageSource: require( '../../assets/images/icons/icon_fastbitcoins_light_blue.png' ),
    disabled: false
  },
  {
    title: 'Set up automatic buys',
    subtitle: 'Stack sats with SwanBitcoin',
    kind: BuyMenuItemKind.SWAN,
    imageSource: require( '../../assets/images/icons/swan_temp.png' ),
    disabled: true
  },
  {
    title: 'Buy using ApplePay or Debit Card',
    subtitle: 'Powered by Wyre',
    kind: BuyMenuItemKind.WYRE,
    imageSource: require( '../../assets/images/icons/wyre_notext_small.png' ),
    disabled: false
  },
]

const listItemKeyExtractor = ( item: BuyBitcoinBottomSheetMenuItem ) => item.title


const BuyBitcoinHomeBottomSheet: React.FC<Props> = ( { onMenuItemSelected, }: Props ) => {

  const renderItem = ( { item: menuItem }: { item: BuyBitcoinBottomSheetMenuItem } ) => {
    return (
      <ListItem
        containerStyle={{
          paddingHorizontal: 16,
        }}
        bottomDivider
        onPress={() => { onMenuItemSelected( menuItem ) }}
        disabled={menuItem.disabled}
      >
        <Image
          source={menuItem.imageSource}
          style={ImageStyles.thumbnailImageMedium}
          resizeMode="contain"
        />

        <ListItem.Content style={ListStyles.listItemContentContainer}>
          <ListItem.Title style={ListStyles.listItemTitle}>{menuItem.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuItem.subtitle}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
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
