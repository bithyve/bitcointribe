import React, { useContext } from 'react'
import { View, ImageSourcePropType, FlatList, Image, Platform, TouchableOpacity, Text, Linking, StyleSheet } from 'react-native'
import { ListItem } from 'react-native-elements'
import * as RNLocalize from 'react-native-localize'
import ListStyles from '../../common/Styles/ListStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../common/Fonts'
import { LocalizationContext } from '../../common/content/LocContext'
import BottomInfoBox from '../BottomInfoBox'

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
  link: string;
}


const listItemKeyExtractor = ( item: BuyBitcoinBottomSheetMenuItem ) => item.title

const BuyBitcoinHomeBottomSheet: React.FC<Props> = ( { onMenuItemSelected, onPress }: Props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ]

  const menuItems: BuyBitcoinBottomSheetMenuItem[] = [
    {
      title: Platform.OS == 'ios' ? strings.ramp : strings.ramp,
      subtitle: strings.rampSub,
      kind: BuyMenuItemKind.RAMP,
      imageSource: require( '../../assets/images/accIcons/ramp.png' ),
      disabled: false,
      hasButton: true,
      link: 'https://support.ramp.network/en/',
    },
    {
      title: strings.wyre,
      subtitle: strings.wyreSub,
      kind: BuyMenuItemKind.WYRE,
      imageSource: require( '../../assets/images/accIcons/wyre.png' ),
      disabled: false,
      hasButton: false,
      link: 'https://support.sendwyre.com/hc/en-us',
    },
    // {
    //   title: Platform.OS == 'ios' ? 'Buy with FastBitcoins' : 'Buy with FastBitcoins',
    //   subtitle: 'Scan FastBitcoin vouchers',
    //   kind: BuyMenuItemKind.FAST_BITCOINS,
    //   imageSource: require( '../../assets/images/icons/fastbitcoins.png' ),
    //   disabled: false,
    //   hasButton: false,
    //   link: 'https://fastbitcoins.com/help',
    // },
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
              {strings.buyBitCoin}
            </Text>
          </TouchableOpacity>
        </ListItem>
        <TouchableOpacity style={styles.linkContainer}
          onPress={() => {
            onPress()
            Linking.openURL( menuItem.link )
          }
          }
        >
          <Text style={[ ListStyles.listItemSubtitle, styles.linkText ]}>
            {strings.fees}
            <Text style={styles.learnMore}>
              {` ${strings.learnMore} `}
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
      backgroundColor: Colors.bgColor,

    }}>
      <View style={styles.modelHeight}>
        <FlatList
          // style={styles.rootContainer}
          data={menuItems}
          keyExtractor={listItemKeyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
        />
        {RNLocalize.getCountry() == 'US' &&
        <BottomInfoBox
          backgroundColor={Colors.backgroundColor}
          containerStyle={{
            marginRight: wp( 3 )
          }}
          title={''}
          infoText={
            '* Some methods may not be available in the US states of Hawaii, Nebraska, New York and Texas'
          }
        />
        }
      </View>

    </View>

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
    paddingHorizontal: 0,
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
    height: 'auto',
    marginBottom: hp( 3 )
  },
  cardMiddle: {
    // paddingLeft: 0,
    marginRight: wp( -2 ),
    marginLeft: wp( -1 ),
  }
} )

export default BuyBitcoinHomeBottomSheet
