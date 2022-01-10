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
import Arrow from '../assets/images/svgs/icon_arrow.svg'

export default function CardWithRadioBtn( { setActiveIndex, geticon=undefined, mainText, subText, italicText, isSelected, index, changeBgColor, boldText, hideRadioBtn = false, tag = '' } ) {
  return (
    <TouchableOpacity
      onPress={() => setActiveIndex( index )}
      style={{
        width: '95%', height: hp( '11%' ),
        backgroundColor: isSelected && changeBgColor ? Colors.lightBlue : Colors.white,
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
        {
          !hideRadioBtn && (
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
          )
        }
        {geticon !== '' &&
        <View style={{
          marginLeft: wp( '3%' )
        }} >
          {geticon()}
        </View>
        }
        <View style={{
          marginLeft: wp( '2%' ),
          flex: 1
        }}>

          <View style={{
            flexDirection: 'row'
          }}>
            <Text style={{
              fontSize: RFValue( 13 ),
              fontFamily: isSelected && changeBgColor ? Fonts.FiraSansMedium : Fonts.FiraSansRegular,
              color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.blue,
              marginBottom: hp( 0.5 ),
            }}>
              {mainText}
            </Text>
            {
              tag !== '' && (
                <View style={{
                  alignItems: 'center',
                  borderRadius: wp( '1%' ),
                  backgroundColor: isSelected ? Colors.white : Colors.lightBlue,
                  justifyContent: 'center',
                  marginLeft: wp( '2%' ),
                  paddingHorizontal: wp( '1.5%' ),
                }}>
                  <Text
                    style={{
                      fontSize: RFValue( 11 ),
                      fontFamily: Fonts.FiraSansRegular,
                      color: isSelected ? Colors.lightBlue : Colors.white,
                    }}
                  >{tag}</Text>
                </View>
              )
            }

          </View>



          {subText !== '' &&
          <Text style={{
            fontSize: RFValue( 11 ),
            fontFamily: Fonts.FiraSansRegular,
            color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.textColorGrey,
            width: wp( 65 )
          }}>
            {subText}
            {
              boldText !== '' &&
              <Text style={{
                fontWeight: '600'
              }}>
                {boldText}
              </Text>
            }
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
        <Arrow color="red" height={15} width={15} style={{
          marginLeft: 6,
          marginTop: 6,
        }} />
      </View>
      {/* {isSelected && ( */}


      {/* )} */}
    </TouchableOpacity>
  )
}
