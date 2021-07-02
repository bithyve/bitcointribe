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

export default function CardWithRadioBtn( { setActiveIndex, icon, mainText, subText, isSelected, index } ) {
  return (
    <TouchableOpacity
      onPress={() => setActiveIndex( index )}
      style={{
        width: '90%', height: hp( '12%' ), backgroundColor: isSelected ? Colors.lightBlue : Colors.backgroundColor1,
        alignSelf: 'center', justifyContent: 'center',
        borderRadius: wp( '4' ),
        marginVertical: hp( '1%' ),

      }}>
      <View style={{
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
          elevation: 10,
          // shadowColor: Colors.gray,
          shadowOpacity: 0.1,
          shadowOffset: {
            width: 1, height: 1
          },
        }}>
          {isSelected &&
          <Image
            style={{
              width: '100%', height: '100%'
            }}
            source={require( '../assets/images/icons/checkmark.png' )}
          />
          }
        </View>
        {icon !== '' &&
        <Image
          style={{
            width: 27, height: 27, resizeMode: 'contain', marginLeft: wp( '3%' )
          }}
          source={icon}
        />
        }
        <View style={{
          flex: 1, marginLeft: wp( '4%' )
        }}>
          <Text style={{
            fontSize: RFValue( 13 ), fontFamily: isSelected ? Fonts.FiraSansMedium : Fonts.FiraSansRegular, color: isSelected ? Colors.white : Colors.blue
          }}>
            {mainText}
          </Text>
          <Text style={{
            fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: isSelected ? Colors.white : Colors.textColorGrey
          }}>
            {subText}
          </Text>
        </View>
      </View>
      {/* {isSelected && ( */}


      {/* )} */}
    </TouchableOpacity>
  )
}
