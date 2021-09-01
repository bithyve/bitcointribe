import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Text
} from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import RightArrow from '../assets/images/svgs/icon_arrow.svg'
import Associate from '../assets/images/svgs/associate.svg'
import Edit from '../assets/images/svgs/edit.svg'
import Remove from '../assets/images/svgs/remove.svg'

export default function CardWithArrow( { onPress, icon, mainText, subText } ) {

  const findImage = ( name ) => {
    switch ( name ){
        case 'Associate':
          return ( <Associate width={27} height={32}/> )
        case 'Edit':
          return ( <Edit width={27} height={32} /> )
        case 'Remove':
          return ( <Remove width={32} height={29} /> )
        case 'App Info':
          return ( <Remove /> )
        default:
          return null //You might want to return something else here//
    }
  }
  return (
    <TouchableOpacity
      onPress={() => onPress()}
      style={{
        backgroundColor: Colors.bgColor,
        alignItems: 'center',
        paddingHorizontal: wp( '8%' ),
        flexDirection:'row',
        marginBottom: hp( 3 )
      }}>
      {/* <View style={{
        flexDirection:'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginHorizontal: wp( '5%' ),
        flex: 1,
        marginVertical: hp( '1.8%' )
      }}> */}
      {icon !== '' &&
        findImage( icon )
      }
      <View style={{
        marginLeft: wp( '5%' )
      }}>
        <Text style={{
          fontSize: RFValue( 13 ),
          fontFamily: Fonts.FiraSansRegular,
          color: Colors.blue,
          marginBottom: hp( 0.5 ), letterSpacing: 0.01
        }}>
          {mainText}
        </Text>
        <Text style={{
          fontSize: RFValue( 11 ),
          fontFamily: Fonts.FiraSansRegular,
          color: Colors.textColorGrey,
          width: wp( 65 )
        }}>
          {subText}
        </Text>

      </View>
      <RightArrow />
      {/* </View> */}
      {/* {isSelected && ( */}


      {/* )} */}
    </TouchableOpacity>
  )
}
