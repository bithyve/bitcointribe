import React from 'react'
import {
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import { translations } from '../common/content/LocContext'
import Fonts from '../common/Fonts'

export default function KnowMoreButton( props ) {
  const strings  = translations[ 'common' ]
  return (
    <TouchableOpacity
      onPress={props.onpress}
    >
      <View
        style={{
          ...styles.knowMoreButton, ...props.containerStyle
        }}
      >
        <Text style={{
          ...styles.knowMoreButtonText, ...props.textStyle
        }}>{strings.knowMore}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  knowMoreButton: {
    // height: wp( '6%' ),
    // width: wp( '20%' ),
    paddingHorizontal: wp( 2 ),
    paddingVertical: wp( 1.5 ),
    backgroundColor: Colors.blue,
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
