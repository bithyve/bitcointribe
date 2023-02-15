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
import { ScrollView } from 'react-native-gesture-handler'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export default function PersonalCopyHelpContents( props ) {
  const scrollViewRef = useRef<ScrollView>()
  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={{
          justifyContent: 'center', alignItems: 'center'
        }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text
          style={{
            color: Colors.white,
            fontFamily: Fonts.Medium,
            fontSize: RFValue( 20 ),
            marginTop: hp( '1%' ),
            marginBottom: hp( '1%' ),
          }}
        >
          Personal Recovery Key
        </Text>
      </AppBottomSheetTouchableWrapper>
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
        snapToInterval={hp( '85%' )}
        decelerationRate="fast"
      >
        <View
          style={{
            height: hp( '85%' ),
            justifyContent: 'space-between',
            paddingBottom: hp( '6%' ),
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Regular,
              marginLeft: wp( '7%' ),
              marginRight: wp( '7%' ),
            }}
          >
            These Recovery Keys are stored in the form of a PDF. You can store the PDF itself anywhere you like - digitally, or even print it out and keep it in a safe or deposit box
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={require( '../../assets/images/icons/share_personal_copy.png' )}
              style={{
                width: wp( '90%' ),
                height: wp( '90%' ),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Regular,
              marginLeft: wp( '7%' ),
              marginRight: wp( '7%' ),
            }}
          >
           The PDF has QR Codes to help you recover your wallet.
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{
              alignItems: 'center'
            }}
            onPress={() => {
              scrollViewRef.current &&
                scrollViewRef.current.scrollTo( {
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
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp( '70%' ),
                height: 0,
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: hp( '85%' ),
            marginTop: hp( '2%' ),
            paddingBottom: hp( '6%' ),
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Regular,
              marginLeft: wp( '7%' ),
              marginRight: wp( '7%' ),
            }}
          >
             Make sure you delete these PDFs from your phone, once you have shared them via mail, messaging platforms, etc
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center', marginTop: hp( '6%' ),
            marginBottom: hp( '6%' ),
          }}>
            <Image
              source={require( '../../assets/images/icons/recovery_personal_copy.png' )}
              style={{
                width: wp( '80%' ),
                height: wp( '80%' ),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              marginLeft: wp( '7%' ),
              marginRight: wp( '7%' ),
              fontFamily: Fonts.Regular,
            }}
          >
            It's not a good idea to have multiple recovery keys on the same device as your device may get lost or stolen
          </Text>

          <AppBottomSheetTouchableWrapper
            style={{
              alignItems: 'center'
            }}
            onPress={() => {
              scrollViewRef.current &&
              scrollViewRef.current.scrollTo( {
                x: 0,
                y: hp( '170%' ),
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
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp( '70%' ),
                height: 0,
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: hp( '85%' ),
            justifyContent: 'space-between',
            marginTop: hp( '2%' ),
            paddingBottom: hp( '6%' ),
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Regular,
              marginLeft: wp( '7%' ),
              marginRight: wp( '7%' ),
            }}
          >
            To recover your wallet, you need to scan three of your five Recovery Keys. Having access to both Personal Recovery Keys ensures a faster recovery process, as you only need to use one key from a Keeper device or your friend/family member
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={require( '../../assets/images/icons/share_personal_copy.png' )}
              style={{
                width: wp( '90%' ),
                height: wp( '90%' ),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Regular,
              marginLeft: wp( '7%' ),
              marginRight: wp( '7%' ),
            }}
          >
           If you lose your Personal Keys, you would require all the other three Recovery Keys stored on the Keeper Device and saved with Friends/ Family members to recover your wallet
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
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 2
    },
  },
} )
