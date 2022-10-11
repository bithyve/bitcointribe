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
import CrossButton from '../../assets/images/svgs/icons_close.svg'

export default function SavingsAccountKnowMoreSheetContents( props ) {
  const scrollViewRef = useRef<ScrollView>()
  const strings  = translations[ 'accounts' ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: hp( 81 )
      }}>
        <View
          style={{flexDirection: 'row',
            justifyContent: 'center', alignItems: 'center'
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontFamily: Fonts.FiraSansMedium,
              fontSize: RFValue( 20 ),
              marginTop: hp( '1%' ),
              marginBottom: hp( '1%' ),
              textAlign: 'center',
              flex: 1
            }}
          >
          Savings Account
          </Text>
          <AppBottomSheetTouchableWrapper style={{
            width: wp(8),
            height: wp(8),
            borderRadius: wp(4),
            backgroundColor: Colors.lightBlue,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: wp(2),
            marginLeft: -wp(10)
          }}
          onPress={() => props.titleClicked && props.titleClicked()}>
            <CrossButton />
          </AppBottomSheetTouchableWrapper>
        </View>
        <View
          style={{
            backgroundColor: Colors.homepageButtonColor,
            height: 1,
            marginLeft: wp( '5%' ),
            marginRight: wp( '5%' ),
            marginBottom: hp( '1%' ),
          }}
        />
        <ScrollView
          ref={scrollViewRef}
          style={styles.modalContainer}
          snapToInterval={hp( '70%' )}
          decelerationRate="fast"
        >
          <View
            style={{
              height: hp( '75%' ),
              paddingBottom: hp( '6%' ),
              marginTop: hp( '2%' ),
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={styles.infoText}
            >
              {strings.saving3}
            </Text>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp( '5%' ),
                marginBottom: hp( '5%' ),
              }}
            >
              <Image
                source={require( '../../assets/images/icons/savings_account_info_1.png' )}
                style={{
                  width: wp( '90%' ),
                  height: wp( '70%' ),
                  resizeMode: 'contain',
                }}
              />
            </View>
            <Text
              style={{
                ...styles.infoText, marginBottom: hp( '8%' ),
              }}
            >
              {strings.saving4}
            </Text>
            <AppBottomSheetTouchableWrapper
              style={{
                alignItems: 'center',
              }}
              onPress={() => {
                scrollViewRef.current?.scrollTo( {
                  x: 0,
                  y: hp( '85%' ),
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
              {/* <View style={styles.separatorView}/> */}
            </View>
          </View>
          <View
            style={{
              height: hp( '75%' ),
              // paddingTop: hp('2%'),
              paddingBottom: hp( '2%' ),
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={styles.infoText}
            >
              {strings.saving5}
            </Text>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
              <Image
                source={require( '../../assets/images/icons/savings_account_info_1.png' )}
                style={{
                  width: wp( '90%' ),
                  height: wp( '70%' ),
                  resizeMode: 'contain',
                }}
              />
            </View>
            <Text
              style={styles.infoText}
            >
              {strings.saving6}
            </Text>
            <AppBottomSheetTouchableWrapper
              style={{
                alignItems: 'center'
              }}
              onPress={() => {
                scrollViewRef.current?.scrollTo( {
                  x: 0,
                  y: hp( '120%' ),
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
              {/* <View style={styles.separatorView}/> */}
            </View>
          </View>
          <View
            style={{
              height: hp( '75%' ),
              // marginTop: hp( '2%' ),
            }}
          >
            <Text
              style={styles.infoText}
            >
              {strings.saving7}
            </Text>
            <View style={{
              justifyContent: 'center', alignItems: 'center', marginTop: hp( '6%' ), marginBottom: hp( '6%' )
            }}>
              <Image
                source={require( '../../assets/images/icons/savings_account_info_2.png' )}
                style={{
                  width: wp( '80%' ),
                  height: wp( '60%' ),
                  resizeMode: 'contain',
                }}
              />
            </View>
            <Text
              style={styles.infoText}
            >
              {strings.saving8}
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
    paddingBottom: hp( '3%' ),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 2
    },
  },
  infoText:{
    textAlign: 'center',
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: wp( '8%' ),
    marginRight: wp( '8%' ),
  },
  separatorView: {
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: Colors.white,
    width: wp( '70%' ),
    height: 0,
    marginBottom: wp( '1%' ),
    marginTop: wp( '1%' ),
  }
} )
