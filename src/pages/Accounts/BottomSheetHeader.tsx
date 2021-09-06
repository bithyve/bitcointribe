import React, { useContext } from 'react'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { heightPercentageToDP, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import ListStyles from '../../common/Styles/ListStyles'
import { LocalizationContext } from '../../common/content/LocContext'

const BottomSheetHeader = ( { title, onPress } ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ].manyWays
  if ( !title )  { return null }
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19} style={{
        // marginTop: hp( 0.5 )
        }} />
      </TouchableOpacity>
      <Text style={ListStyles.modalTitle}>{title}</Text>
      <Text style={styles.modalInfoText}>
        {strings}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create( {
  headerContainer: {
    backgroundColor: Colors.bgColor,
    paddingBottom: heightPercentageToDP( 4 )
  },
  modalInfoText: {
    marginLeft: wp( '7%' ),
    color: Colors.lightTextColor,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    letterSpacing: RFValue( 0.6 ),
    lineHeight: RFValue( 18 )
  },
} )


export default BottomSheetHeader
