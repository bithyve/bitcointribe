import React from 'react'
import { View, ImageSourcePropType, FlatList, Image, Platform, TouchableOpacity, Text } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../common/Styles/ListStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import Colors from '../../common/Colors'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'

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
  hasButton: boolean;
}

const menuItems: BuyBitcoinBottomSheetMenuItem[] = [
  {
    title: Platform.OS == 'ios' ? 'Ramp Bitcoin' : 'Ramp Bitcoin',
    subtitle: 'Low fee for those big buys',
    kind: BuyMenuItemKind.RAMP,
    imageSource: require( '../../assets/images/icons/ramp_logo_notext.png' ),
    disabled: false,
    hasButton: true,
  },
  {
    title: 'Wyre Bitcoin',
    subtitle: 'Buy any amount',
    kind: BuyMenuItemKind.WYRE,
    imageSource: require( '../../assets/images/icons/wyre_notext_small.png' ),
    disabled: false,
    hasButton: false,
  },
  {
    title: 'Swan Bitcoin',
    subtitle: 'Stack sats with Swan Bitcoin',
    kind: BuyMenuItemKind.SWAN,
    imageSource: require( '../../assets/images/icons/swan.png' ),
    disabled: false,
    hasButton: false,
  }
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
          {menuItem.hasButton &&
          <TouchableOpacity style={{
            backgroundColor: Colors.lightBlue, borderRadius: widthPercentageToDP( '1%' )
          }}>
            <Text style={{
              margin: heightPercentageToDP( 0.5 ), color: Colors.white, fontSize: RFValue( 12 ),
            }}>
              Sats Back
            </Text>
          </TouchableOpacity>
          }
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
