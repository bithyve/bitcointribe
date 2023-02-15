import React, { useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import moment from 'moment'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { LocalizationContext } from '../../common/content/LocContext'

const ButtonGroupWithIcon = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]

  return(
    <View style={{
      backgroundColor: Colors.blue,
      //   padding: wp( 5 ),
      flexDirection: 'row',
      borderRadius: wp( 2 )
    }}>
      <TouchableOpacity
        onPress={() => props.onButtonPress( 'Link' )}
        style={{
          flexDirection:'row', alignItems: 'center',
          padding: wp( 4.5 ),
        }}>
        {props.buttonOneIcon}
        <Text style={{
          color: Colors.white,
          fontSize: RFValue( 12 ),
          fontFamily: Fonts.Regular,
          marginHorizontal: wp( 2 )
        }}>
          {props.buttonOneText}
        </Text>
      </TouchableOpacity>
      <View style={styles.line} />
      <TouchableOpacity
        onPress={() => props.onButtonPress( 'QR' )}
        style={{
          flexDirection:'row', alignItems: 'center',
          padding: wp( 4.5 ),
        }}>
        {props.buttonOneIcon}
        <Text style={{
          color: Colors.white,
          fontSize: RFValue( 12 ),
          fontFamily: Fonts.Regular,
          marginHorizontal: wp( 2 )
        }}>
          {props.buttonTwoText}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create( {
  line: {
    // height: hp( 9 ),
    width: wp( 0.09 ),
    backgroundColor: Colors.lightBlue,
    marginVertical: wp( 3 )
  },
} )

export default ButtonGroupWithIcon

