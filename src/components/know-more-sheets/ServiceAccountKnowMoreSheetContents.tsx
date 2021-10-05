import React, { useRef } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import { ScrollView } from 'react-native-gesture-handler'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import openLink from '../../utils/OpenLink'

export default function ServiceAccountKnowMoreSheetContents( props ) {
  const scrollViewRef = useRef<ScrollView>()

  const headerText = () => {
    switch ( props.serviceKind ) {
        case ServiceAccountKind.WYRE : return 'Wyre'
        case ServiceAccountKind.RAMP: return 'Ramp'
        case ServiceAccountKind.SWAN: return 'Swan Bitcoin'

        default:
          return props.serviceKind
    }
  }

  const firstPara = () => {
    switch ( props.serviceKind ) {
        case ServiceAccountKind.WYRE : return 'Have queries while purchasing Sats from Wyre? The company has an exhaustive FAQ section'
        case ServiceAccountKind.RAMP: return 'Have queries while purchasing Sats from Ramp? The company has an exhaustive FAQ section'
        case ServiceAccountKind.SWAN: return 'Have queries while purchasing Sats from Swan? The company has an exhaustive FAQ section'

        default:
          return props.serviceKind
    }
  }

  const firstParaUrl = () => {
    switch ( props.serviceKind ) {
        case ServiceAccountKind.WYRE : return 'https://support.sendwyre.com/hc/en-us/'
        case ServiceAccountKind.RAMP: return 'https://support.ramp.network/en/'
        case ServiceAccountKind.SWAN: return 'https://help.swanbitcoin.com/hc/en-us'

        default:
          return props.serviceKind
    }
  }

  const images = () => {
    switch ( props.serviceKind ) {
        case ServiceAccountKind.WYRE : return require( '../../assets/images/icons/wyre_bottomsheet.png' )
        case ServiceAccountKind.RAMP: return require( '../../assets/images/icons/ramp_bottomsheet.png' )
        case ServiceAccountKind.SWAN: return require( '../../assets/images/icons/swan_bottomsheet.png' )

        default:
          return props.serviceKind
    }
  }

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <AppBottomSheetTouchableWrapper
        style={{
          justifyContent: 'center', alignItems: 'center',
          paddingBottom: wp( '4%' ),
          paddingTop: wp( '4%' )
        }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>{headerText()}</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
        ref={scrollViewRef}
        style={{
          flex: 1,
          backgroundColor: Colors.blue,
        }}
        snapToInterval={hp( '75%' )}
        decelerationRate="fast"
      >
        <View style={styles.ElementView}>

          <Text
            style={{
              ...styles.infoText,
              marginTop: wp( '15%' ),
              marginBottom: wp( '3%' ),
            }}
          >
            {firstPara()}
            <AppBottomSheetTouchableWrapper
              style={{
                marginLeft: 5,
              }}
              onPress={() =>
                openLink( firstParaUrl() )
              }
            >
              <Text style={ styles.boldItalicText }>{firstParaUrl()}</Text>
            </AppBottomSheetTouchableWrapper>
          </Text>

          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={images()}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
              // marginBottom: wp('15%'),
            }}
          >
            In case you did not find what you were looking for, please find <Text style={ styles.boldItalicText }>Community</Text> under <Text style={ styles.boldItalicText }>More</Text> and drop us a line on Telegram
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
  },
  headerText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 20 ),
    marginTop: hp( '1%' ),
    marginBottom: hp( '1%' ),
  },
  boldItalicText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: Colors.white,
    fontSize: RFValue( 13 ),
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: wp( '1.5%' ),
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( '1%' ),
    borderRadius: 5
  },
  infoText: {
    textAlign: 'center',
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
  },
  clickHereText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  toKnowMoreText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  linkView: {
    flexDirection: 'row',
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ElementView: {
    height: hp( '70%' ),
    justifyContent: 'space-between',
  },
  separatorView: {
    width: wp( '70%' ),
    height: 0,
    alignSelf: 'center',
    marginBottom: wp( '1%' ),
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: Colors.white,
  },
  helperImage: {
    width: wp( '80%' ),
    height: wp( '65%' ),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    marginBottom: wp( '15%' ),
  },
} )
