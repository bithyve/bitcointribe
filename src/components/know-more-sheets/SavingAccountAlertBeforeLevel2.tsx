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

export default function SavingAccountAlertBeforeLevel2( props ) {
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
          <Text
            style={{
              color: Colors.white,
              fontFamily: Fonts.FiraSansMedium,
              fontSize: RFValue( 20 ),
              marginTop: hp( '1%' ),
              marginBottom: hp( '1%' ),
            }}
          >
          Savings Account
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
              {strings.saving1}
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
              {strings.saving2}
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
