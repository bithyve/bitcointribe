import React, { Component } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { translations } from '../common/content/LocContext'
import LinearGradient from 'react-native-linear-gradient'

export default function KnowMoreButton( props ) {
  const strings  = translations[ 'common' ]
  return (
    <TouchableOpacity
      onPress={props.onpress}
    >
      <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
        start={{
          x: 0, y: 0
        }} end={{
          x: 1, y: 0
        }}
        locations={[ 0.2, 1 ]}
        style={{
          ...styles.knowMoreButton, ...props.containerStyle
        }}
      >
        <Text style={{
          ...styles.knowMoreButtonText, ...props.textStyle
        }}>{strings.knowMore}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  knowMoreButton: {
    // height: wp( '6%' ),
    // width: wp( '20%' ),
    paddingHorizontal: wp( 2 ),
    paddingVertical: wp( 1.5 ),
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  knowMoreButtonText: {
    color: Colors.white,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
  },
} )
