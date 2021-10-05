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

export default function KnowMoreButton( props ) {
  const strings  = translations[ 'common' ]
  return (
    <TouchableOpacity
      style={{
        ...styles.knowMoreButton, ...props.containerStyle
      }}
      onPress={props.onpress}
    >
      <Text style={{
        ...styles.knowMoreButtonText, ...props.textStyle
      }}>{strings.knowMore}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  knowMoreButton: {
    height: wp( '6%' ),
    width: wp( '20%' ),
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  knowMoreButtonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
  },
} )
