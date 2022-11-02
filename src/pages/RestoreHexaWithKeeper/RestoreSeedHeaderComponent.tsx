import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { translations } from '../../common/content/LocContext'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const RestoreSeedHeaderComponent = ( props ) => {
  const strings  = translations[ 'bhr' ]

  return (
    <View style={styles.modalHeaderTitleView}>
      <TouchableOpacity
        onPress={() => props.onPressBack()}
        style={{
          height: wp( '10%' ), width: wp( '10%' ), alignItems: 'center'
        }}
      >
        <FontAwesome name="chevron-left" color={"#4286F5"} size={20} />
      </TouchableOpacity>
      <Text style={styles.titleText}>{props.selectedTitle}</Text>
    </View>
  )
}

export default RestoreSeedHeaderComponent

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    // borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    // alignItems: 'center',
    // flexDirection: 'row',
    paddingBottom: hp( '2%' ),
    marginTop: 20,
    marginBottom: 15,
    marginLeft: wp( '4%' ),
    marginRight: wp( '4%' ),
  },
  infoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.lightTextColor,
    fontSize: RFValue( 11 ),
  },
  titleText: {
    marginLeft: wp( '4%' ),
    color: '#4286F5',
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.RobotoSlabRegular,
  },
  headerImage: {
    width: wp( '9%' ),
    height: wp( '9%' ),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  headerInfoView: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: wp( '4%' ),
  },
} )
