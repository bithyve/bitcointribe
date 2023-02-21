import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'

const HealthStatusMessage = ( { health } ) => {
  if ( health >= 0 && health < 100 ) {
    return (
      <Text numberOfLines={1} style={{
        ...styles.headerInfoText
      }}>
        The wallet backup is <Text style={styles.infoEmphasisText}>not secured!</Text>
      </Text>
    )
  } else {
    return (
      <Text numberOfLines={1} style={styles.headerInfoText}>
          Great! Your wallet is <Text style={styles.infoEmphasisText}>secure!</Text>
      </Text>
    )
  }
}

const styles = StyleSheet.create( {
  headerInfoText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
    color: Colors.white,
  },

  infoEmphasisText: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
} )

export default memo( HealthStatusMessage )
