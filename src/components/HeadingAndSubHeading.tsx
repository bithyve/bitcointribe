import React from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import HeadingStyles from '../common/Styles/HeadingStyles'

export default function HeadingAndSubHeading( props ) {

  return ( <View>
    <Text style={{
      ...HeadingStyles.listSectionHeading,
      paddingHorizontal: wp( 5 ),
      marginTop: wp( 1 )
    }}>
      {props.heading}
    </Text>
    <Text style={{
      ...styles.modalInfoText,
    }}>{props.subHeading}</Text>
  </View>
  )
}

const styles = StyleSheet.create( {
  modalInfoText: {
    width: wp( 90 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    lineHeight: 18,
    marginLeft: wp( 5 ),
    paddingVertical: hp( 0.5 )
  },
  rootContainer: {
    flex: 1,
  },

} )
