import React, { useRef } from 'react'
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { ScrollView } from 'react-native-gesture-handler'
import { translations } from '../../common/content/LocContext'
import GiftIllustration from '../../assets/images/svgs/gift_illustration.svg'

export default function TestAccountKnowMoreSheetContents( props ) {
  const scrollViewRef = useRef<ScrollView>()
  const strings  = translations[ 'accounts' ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: hp( 78 )
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.closeModal()
          }}
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
          // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <AppBottomSheetTouchableWrapper
          style={{
            justifyContent: 'center', alignItems: 'center'
          }}
          activeOpacity={10}
          onPress={() => props.titleClicked && props.titleClicked()}
        >
          <Text style={styles.headerText}>Gift Sats</Text>
        </AppBottomSheetTouchableWrapper>
        <ScrollView
          ref={scrollViewRef}
          style={{
            flex: 1,
            backgroundColor: Colors.blue,
          }}
          snapToInterval={hp( '70%' )}
          decelerationRate="fast"
        >
          <View style={styles.ElementView}>
            <Text
              style={{
                ...styles.infoText,
                marginTop: wp( '5%' ),
                marginBottom: wp( '1%' ),
              }}
            >
              Hexa creates a link or QR code for you that allows you to send bitcoin as gifts to anyone using Hexa wallet.
            </Text>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
              <GiftIllustration />
            </View>
            <Text
              style={{
                ...styles.infoText,
                marginBottom: wp( '15%' ),
              }}
            >
              {/* {strings.test2} */}
              You can manage these Gifts from here. Send them when you want to and even retrive them back if not claimed. The recipient will only need a Hexa wallet to claim the Gift
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    // height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
  },
  headerText: {
    color: Colors.backgroundColor1,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 18 ),
    letterSpacing: 0.54,
    marginTop: hp( '1%' ),
    marginBottom: hp( '1%' ),
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: 1,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( '1%' ),
  },
  infoText: {
    textAlign: 'center',
    color: Colors.backgroundColor1,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.6,
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
  },
  clickHereText: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  toKnowMoreText: {
    color: Colors.backgroundColor1,
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
    height: wp( '60%' ),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    marginBottom: wp( '15%' ),
  },
} )
