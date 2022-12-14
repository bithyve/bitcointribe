import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import moment from 'moment'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'

const styles = StyleSheet.create( {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 4,
  },
  text: {
    fontFamily: Fonts.RobotoSlabMedium,
    fontSize: RFValue( 10 ),
    color: '#505050'
  },
} )

const DateSeperator = ( props ) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{moment( props.date ).format( 'DD MMM \'YY' )}</Text>
    </View>
  )
}

export default DateSeperator

