import React, { useState, useRef } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import openLink from '../../utils/OpenLink'
import { ScrollView } from 'react-native-gesture-handler'
import { translations } from '../../common/content/LocContext'

export default function CheckingAccountKnowMoreSheetContents( props ) {
  const scrollViewRef = useRef<ScrollView>()
  const strings  = translations[ 'accounts' ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: hp( 81 )
      }}>
        <AppBottomSheetTouchableWrapper
          style={{
            justifyContent: 'center', alignItems: 'center'
          }}
          activeOpacity={10}
          onPress={() => props.titleClicked && props.titleClicked()}
        >
          <Text style={styles.headerText}>Checking Account</Text>
        </AppBottomSheetTouchableWrapper>
        <View style={styles.headerSeparator} />
        <ScrollView
          ref={scrollViewRef}
          style={{
          // flex: 1,
            backgroundColor: Colors.blue,
          }}
          snapToInterval={hp( '85%' )}
          decelerationRate="fast"
        >
          <View style={styles.ElementView}>
            <Text
              style={{
                ...styles.infoText,
                // marginTop: wp( '5%' ),
              }}
            >
              {strings.checking1}
            </Text>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Image
                source={require( '../../assets/images/icons/checking_account_info_1.png' )}
                style={styles.helperImage}
              />
            </View>
            <Text
              style={{
                ...styles.infoText,
                marginBottom: wp( '5%' ),
              }}
            >
              {strings.checking2}
            </Text>
            <AppBottomSheetTouchableWrapper
              style={{
                alignItems: 'center'
              }}
              onPress={() => {
                scrollViewRef.current &&
                scrollViewRef.current.scrollTo( {
                  x: 0,
                  y: hp( '75%' ),
                  animated: true,
                } )
              }}
            >
              <FontAwesome
                name="angle-double-down"
                color={Colors.white}
                size={40}
              />
            </AppBottomSheetTouchableWrapper>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
            </View>
          </View>

          <View style={styles.ElementView}>
            <Text
              style={{
                ...styles.infoText,
                // marginTop: wp( '5%' ),
              }}
            >
              {strings.checking3}
            </Text>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Image
                source={require( '../../assets/images/icons/checking_account_info_1.png' )}
                style={styles.helperImage}
              />
            </View>
            <Text
              style={{
                ...styles.infoText,
                marginBottom: wp( '5%' ),
              }}
            >
              {strings.checking4}
            </Text>
            <AppBottomSheetTouchableWrapper
              style={{
                alignItems: 'center'
              }}
              onPress={() => {
                scrollViewRef.current &&
                scrollViewRef.current.scrollTo( {
                  x: 0,
                  y: hp( '80%' ),
                  animated: true,
                } )
              }}
            >
              <FontAwesome
                name="angle-double-down"
                color={Colors.white}
                size={40}
              />
            </AppBottomSheetTouchableWrapper>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
            </View>
          </View>

          <View style={styles.ElementView}>
            <Text
              style={{
                ...styles.infoText,
                marginTop: wp( '5%' ),
              }}
            >
              {strings.checking5}
            </Text>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Image
                source={require( '../../assets/images/icons/test_account_info_2.png' )}
                style={styles.helperImage}
              />
            </View>
            <Text
              style={{
                ...styles.infoText,
                marginTop: wp( '5%' ),
                paddingBottom: hp( '6%' ),
              }}
            >
              {strings.checking6}
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    // height: '80%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 2
    },
  },
  headerText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 20 ),
    marginTop: hp( '2%' ),
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
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp( '8%' ),
    marginRight: wp( '8%' ),
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
    height: hp( '75%' ),
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
