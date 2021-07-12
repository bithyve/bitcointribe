import React from 'react'
import { View, ImageSourcePropType, FlatList, Image, Platform, TouchableOpacity } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../common/Styles/ListStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import Colors from '../../common/Colors'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'

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
    title: Platform.OS == 'ios' ? 'FastBitcoins' : 'FastBitcoins',
    subtitle: 'Scan FastBitcoin vouchers',
    kind: BuyMenuItemKind.RAMP,
    imageSource: require( '../../assets/images/icons/fastbitcoin.png' ),
    disabled: false
  },
  {
    title: 'GetBittr',
    subtitle: 'Buy any amount',
    kind: BuyMenuItemKind.WYRE,
    imageSource: require( '../../assets/images/icons/icon_getbitter.png' ),
    disabled: false
  },
//   {
//     title: 'Set up automatic buys',
//     subtitle: 'Stack sats with Swan Bitcoin',
//     kind: BuyMenuItemKind.SWAN,
//     imageSource: require( '../../assets/images/icons/swan.png' ),
//     disabled: false
//   },
//   {
//     title: 'Scan a Voucher',
//     subtitle: 'From select retail stores with FastBitcoins',
//     kind: BuyMenuItemKind.FAST_BITCOINS,
//     imageSource: require( '../../assets/images/icons/icon_fastbitcoins_light_blue.png' ),
//     disabled: false
//   }
]

const listItemKeyExtractor = ( item: BuyBitcoinBottomSheetMenuItem ) => item.title

const NewBuyBitcoinBottomSheet: React.FC<Props> = ( { onMenuItemSelected, }: Props ) => {

  const renderItem = ( { item: menuItem }: { item: BuyBitcoinBottomSheetMenuItem } ) => {
    return (
      <TouchableOpacity
        onPress={() => { onMenuItemSelected( menuItem ) }}
        disabled={menuItem.disabled}
      >
        <ListItem
          containerStyle={menuItem.disabled ? ListStyles.disabledContainer : [ ListStyles.container, {
            marginHorizontal: 0,
            shadowOpacity: 0.1,
            shadowOffset: {
              width: 3, height: 5
            },
            shadowRadius: 5,
            elevation: 2,
            width: widthPercentageToDP( 95 ),
            marginBottom: heightPercentageToDP( 1 ),
            borderTopRightRadius: widthPercentageToDP( 1 ),
            borderBottomRightRadius: widthPercentageToDP( 1 )
          } ]}
        // bottomDivider
        >
          <View style={{
            width: widthPercentageToDP( '13%' ),
            height: widthPercentageToDP( '13%' ),
            borderColor: 'red',
            elevation: 10,
            shadowColor: Colors.borderColor,
            shadowOpacity: 10,
            shadowOffset: {
              width: 2, height: 2
            },
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: widthPercentageToDP( '13%' ) / 2,
            margin: 5
          }}>


            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.backgroundColor,
              width: widthPercentageToDP( '11%' ),
              height: widthPercentageToDP( '11%' ),
              borderRadius: widthPercentageToDP( '11%' ) / 2,
            }}>
              <Image
                source={menuItem.imageSource}
                style={ImageStyles.thumbnailImageSmall}
                resizeMode="contain"
              />
            </View>
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

export default NewBuyBitcoinBottomSheet
