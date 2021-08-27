import React from 'react'
import { View, ImageSourcePropType, FlatList, Image, Platform, TouchableOpacity, Text, Linking, StyleSheet } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../common/Styles/ListStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../common/Fonts'

export type Props = {
  onMenuItemSelected: ( menuItem: BuyBitcoinBottomSheetMenuItem ) => void;
  onPress: () => void
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
  feesLink: string;
  supportedRegions: string;
}

const menuItems: BuyBitcoinBottomSheetMenuItem[] = [
  {
    title: Platform.OS == 'ios' ? 'Buy with Ramp' : 'Buy with Ramp',
    subtitle: 'Low fee for those big buys',
    kind: BuyMenuItemKind.RAMP,
    imageSource: require( '../../assets/images/accIcons/ramp.png' ),
    disabled: false,
    hasButton: true,
    feesLink: 'https://support.ramp.network/en/article/what-are-your-fees-1atf5lv/',
    supportedRegions: 'https://support.ramp.network/en/article/what-countries-do-you-support-1ua7sn1/'
  },
  {
    title: 'Buy with Wyre',
    subtitle: 'Buy any amount',
    kind: BuyMenuItemKind.WYRE,
    imageSource: require( '../../assets/images/accIcons/wyre.png' ),
    disabled: false,
    hasButton: false,
    feesLink: 'https://support.sendwyre.com/hc/en-us',
    supportedRegions: 'https://support.sendwyre.com/hc/en-us/articles/360055233754-Geographic-Restrictions-'
  },
  {
    title: Platform.OS == 'ios' ? 'Buy with FastBitcoins' : 'Buy with FastBitcoins',
    subtitle: 'Scan FastBitcoin vouchers',
    kind: BuyMenuItemKind.FAST_BITCOINS,
    imageSource: require( '../../assets/images/icons/fastbitcoins.png' ),
    disabled: false,
    hasButton: false,
    feesLink: 'https://fastbitcoins.com/help',
    supportedRegions: 'https://fastbitcoins.com/help'
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

const BuyBitcoinHomeBottomSheet: React.FC<Props> = ( { onMenuItemSelected, onPress }: Props ) => {

  const renderItem = ( { item: menuItem }: { item: BuyBitcoinBottomSheetMenuItem } ) => {
    return (
      <View
        style={styles.rootContainer}
      >
        <ListItem
          containerStyle={menuItem.disabled ? ListStyles.disabledContainer : [ ListStyles.container, styles.mainCardContainer ]}
        >
          <Image
            source={menuItem.imageSource}
            style={ImageStyles.thumbnailImageLarge}
            resizeMode="contain"
          />

          <ListItem.Content style={styles.cardMiddle}>
            <ListItem.Title style={menuItem.disabled ? ListStyles.disabledListItemTitle : [ ListStyles.listItemTitle, styles.CardText ]}>{menuItem.title}</ListItem.Title>
            <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuItem.subtitle}</ListItem.Subtitle>
          </ListItem.Content>


          <TouchableOpacity
            onPress={() => { onMenuItemSelected( menuItem ) }}
            disabled={menuItem.disabled}
            style={styles.buyContainer}>
            <Text style={styles.buyButton}>
              Buy Bitcoin
            </Text>
          </TouchableOpacity>
        </ListItem>
        <TouchableOpacity style={styles.linkContainer}
          onPress={() => {
            onPress()
            Linking.openURL( menuItem.feesLink )
          }
          }
        >
          <Text style={[ ListStyles.listItemSubtitle, styles.linkText ]}>
        Fees & Supported Regions
            <Text style={styles.learnMore}>
              {' Learn More  '}
            </Text>
          </Text>
          <Image
            style={styles.imageStyle}
            source={require( '../../assets/images/icons/openlink.png' )}
          />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{
      backgroundColor: Colors.bgColor
    }}>
      <View style={styles.modelHeight}>
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

const styles = StyleSheet.create( {
  CardText: {
    fontSize: RFValue( 12 ),
  },
  linkText:{
    paddingBottom: wp( 1 ),
    color: Colors.textColorGrey
  },
  imageStyle: {
    width: wp( 4 ), height: wp( 4 )
  },
  learnMore: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.blue
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp( 1 ),
    paddingBottom: hp( 2 ),
    paddingHorizontal: wp( 6 )
  },
  buyButton: {
    margin: hp( 0.5 ), color: Colors.white, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular
  },
  buyContainer: {
    backgroundColor: Colors.blue,
    borderRadius: wp( '2%' ),
    paddingHorizontal: wp( 2 ),
    paddingVertical: hp( 0.5 )
  },
  mainCardContainer: {
    marginTop: hp( 1.5 ),
    paddingHorizontal: 0
  },
  rootContainer: {
    backgroundColor: Colors.white,
    marginBottom: hp( 1.5 ),
    width: wp( 90 ),
    borderRadius: wp( 2 ),
    alignSelf: 'center',
    shadowColor: Colors.shadowColor,
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    elevation: 6
  },
  modelHeight: {
    height: hp( 60 )
  },
  cardMiddle: {
    paddingLeft: 0,
    paddingRight: wp( 1 )
  }
} )

export default BuyBitcoinHomeBottomSheet
