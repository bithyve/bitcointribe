import React from 'react'
import { View, ImageSourcePropType, FlatList, Image, Platform, TouchableOpacity, Text } from 'react-native'
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
  kind: BuyMenuItemKind | '';
  imageSource: ImageSourcePropType;
  disabled: boolean;
  hasButton: boolean;
}

const menuItems: BuyBitcoinBottomSheetMenuItem[] = [
  {
    title: Platform.OS == 'ios' ? 'Buy with Ramp' : 'Buy with Ramp',
    subtitle: 'Low fee for those big buys',
    kind: BuyMenuItemKind.RAMP,
    imageSource: require( '../../assets/images/accIcons/ramp.png' ),
    disabled: false,
    hasButton: true,
  },
  {
    title: 'Buy with Wyre',
    subtitle: 'Buy any amount',
    kind: BuyMenuItemKind.WYRE,
    imageSource: require( '../../assets/images/accIcons/wyre.png' ),
    disabled: false,
    hasButton: false,
  },
  {
    title: Platform.OS == 'ios' ? 'Buy with FastBitcoins' : 'Buy with FastBitcoins',
    subtitle: 'Scan FastBitcoin vouchers',
    kind: BuyMenuItemKind.FAST_BITCOINS,
    imageSource: require( '../../assets/images/icons/fastbitcoins.png' ),
    disabled: false,
    hasButton: false,
  },
  // {
  //   title: 'GetBittr',
  //   subtitle: 'Buy any amount',
  //   kind: '',
  //   imageSource: require( '../../assets/images/icons/icon_getbitter.png' ),
  //   disabled: false,
  //   hasButton: false,
  // },
  // {
  //   title: 'Swan Bitcoin',
  //   subtitle: 'Stack sats with Swan Bitcoin',
  //   kind: BuyMenuItemKind.SWAN,
  //   imageSource: require( '../../assets/images/icons/swan.png' ),
  //   disabled: false,
  //   hasButton: false,
  // }
  // {
  //   title: 'Set up automatic buys',
  //   subtitle: 'Stack sats with Swan Bitcoin',
  //   kind: BuyMenuItemKind.SWAN,
  //   imageSource: require( '../../assets/images/icons/swan.png' ),
  //   disabled: false
  // },
  // {
  //   title: 'Scan a Voucher',
  //   subtitle: 'From select retail stores with FastBitcoins',
  //   kind: BuyMenuItemKind.FAST_BITCOINS,
  //   imageSource: require( '../../assets/images/icons/icon_fastbitcoins_light_blue.png' ),
  //   disabled: false
  // }
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
          containerStyle={menuItem.disabled ? ListStyles.disabledContainer : [ ListStyles.container, {
            // marginHorizontal: 10,
            // shadowOpacity: 0.1,
            // shadowOffset: {
            //   width: 3, height: 5
            // },
            // shadowRadius: 5,
            // elevation: 2,
            width: widthPercentageToDP( 90 ),
            marginTop: heightPercentageToDP( 1.5 ),
            // marginBottom: heightPercentageToDP( 3 ),
            borderRadius: widthPercentageToDP( 2 ),
            height: heightPercentageToDP( 11 ),

          } ]}
        // bottomDivider
        >
          <Image
            source={menuItem.imageSource}
            style={ImageStyles.thumbnailImageLarge}
            resizeMode="contain"
          />

          <ListItem.Content style={ListStyles.listItemContentContainer}>
            <ListItem.Title style={menuItem.disabled ? ListStyles.disabledListItemTitle : ListStyles.listItemTitle}>{menuItem.title}</ListItem.Title>
            <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuItem.subtitle}</ListItem.Subtitle>
          </ListItem.Content>
          {/* {menuItem.hasButton &&
          <TouchableOpacity style={{
            backgroundColor: Colors.lightBlue, borderRadius: widthPercentageToDP( '1%' )
          }}>
            <Text style={{
              margin: heightPercentageToDP( 0.5 ), color: Colors.white, fontSize: RFValue( 12 ),
            }}>
              Sats Back
            </Text>
          </TouchableOpacity>
          } */}
          <ListItem.Chevron />
        </ListItem>


      </TouchableOpacity>
    )
  }

  return (
    <View style={{
      backgroundColor: Colors.backgroundColor
    }}>
      <View style={{
        height: heightPercentageToDP( 63 )
      }}>
        <FlatList
          // style={styles.rootContainer}
          data={menuItems}
          keyExtractor={listItemKeyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View></View>

  )
}

// const styles = StyleSheet.create( {
//   rootContainer: {
//     // flex: 1,
//     // backgroundColor: Colors.blue,
//   },
// } )

export default BuyBitcoinHomeBottomSheet
