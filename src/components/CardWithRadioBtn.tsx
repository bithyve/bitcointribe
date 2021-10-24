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
import CheckMark from '../assets/images/svgs/checkmark.svg'

export default function CardWithRadioBtn( { setActiveIndex, geticon=undefined, mainText, subText, italicText, isSelected, index, changeBgColor } ) {
  return (
    <TouchableOpacity
      onPress={() => setActiveIndex( index )}
      style={{
        width: '90%', height: hp( '11%' ), backgroundColor: isSelected && changeBgColor ? Colors.lightBlue : Colors.backgroundColor1,
        alignSelf: 'center', justifyContent: 'center',
        borderRadius: wp( '4' ),
        marginVertical: hp( '1%' ),

      }}>
      <View style={{
        flexDirection:'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginHorizontal: wp( '5%' ),
        flex: 1,
        marginVertical: hp( '1.8%' )
      }}>
        <View style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          // borderWidth: 0.3,
          // borderColor: Colors.borderColor,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 6,
          // shadowColor: Colors.gray,
          shadowOpacity: 0.1,
          shadowOffset: {
            width: 1, height: 1
          },
        }}>
          {isSelected &&
          <CheckMark style={{
            marginLeft: 6,
            marginTop: 6
          }} />
          }
        </View>
        {geticon !== '' &&
        <View style={{
          marginLeft: wp( '3%' )
        }} >
          {geticon()}
        </View>
        }
        <View style={{
          marginLeft: wp( '4%' )
        }}>
          <Text style={{
            fontSize: RFValue( 13 ),
            fontFamily: isSelected && changeBgColor ? Fonts.FiraSansMedium : Fonts.FiraSansRegular,
            color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.blue,
            marginBottom: hp( 0.5 ), letterSpacing: 0.01
          }}>
            {mainText}
          </Text>
          {subText !== '' &&
          <Text style={{
            fontSize: RFValue( 11 ),
            fontFamily: Fonts.FiraSansRegular,
            color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.textColorGrey,
            width: wp( 65 )
          }}>
            {subText}
          </Text>
          }
          {italicText !== '' &&
          <Text style={{
            fontSize: RFValue( 11 ),
            fontFamily: Fonts.FiraSansItalic,
            color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.textColorGrey,
            width: wp( 65 ),
            fontWeight: '600'
          }}>
            {italicText}
          </Text>
          }
        </View>
      </View>
      {/* {isSelected && ( */}


      {/* )} */}
    </TouchableOpacity>
  )
}
