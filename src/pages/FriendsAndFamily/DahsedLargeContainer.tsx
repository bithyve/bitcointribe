import React, { useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity
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

const DashedLargeContainer = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]

  return(
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => props.onPress ? props.onPress() : () => {}}
      key={props.key}
      style={{
        width: '90%',
        backgroundColor: Colors.gray7,
        // shadowOpacity: 0.06,
        // shadowOffset: {
        //   width: 10, height: 10
        // },
        // shadowRadius: 10,
        // elevation: 2,
        alignSelf: 'center',
        borderRadius: wp( 2 ),
        marginTop: hp( 1 ),
        marginBottom: hp( 1 ),
        paddingVertical: wp( 1 ),
        paddingHorizontal: wp( 1 ),
        borderColor: props.theme ? props.theme?.color : Colors.lightBlue,
        borderWidth: 1,
      }}>
      <View style={{
        backgroundColor: Colors.gray7,
        borderRadius: wp( 2 ),
        paddingVertical: hp( 2 ),
        paddingHorizontal: wp( 4 ),
        borderColor: props.theme ? props.theme?.color : Colors.lightBlue,
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: wp( 3 )
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <View>
            <Text style={{
              color: Colors.black,
              fontSize: RFValue( 14 ),
              fontFamily: Fonts.FiraSansRegular,
              // fontWeight: '700',
              letterSpacing: 0.01,
              lineHeight: 18
            }}>
              {props.titleText}
            </Text>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 11 ),
              letterSpacing: 0.55,
              lineHeight: RFValue( 15 ),
              fontFamily: Fonts.FiraSansRegular,
              marginRight: wp( 9 )
            }}>
              {'You have recieved gift from '}
              <Text style={{
                color: Colors.blue,
                fontSize: RFValue( 11 ),
                fontFamily: Fonts.FiraSansItalic,
              }}>
                {props.subText}
              </Text>
              {'\nThe gift would be valid for 30 days and the sats would revert to '}
              <Text style={{
                color: Colors.blue,
                fontSize: RFValue( 11 ),
                fontFamily: Fonts.FiraSansItalic,
              }}>
                {props.subText}
              </Text>
              {' if unclaimed'}
            </Text>
          </View>
          {props.date &&
          <Text style={{
            color: Colors.lightTextColor,
            fontSize: RFValue( 10 ),
            letterSpacing: 0.12,
            lineHeight: RFValue( 18 ),
            fontFamily: Fonts.FiraSansRegular,

          }}>
            {moment( props.date ).format( 'lll' )}
          </Text>
          }
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: hp( 1 )
        }}>

          <View>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 12 ),
              letterSpacing: 0.12,
              lineHeight: 18,
              fontFamily: Fonts.FiraSansRegular,
              width: wp( '63%' )
            }}>
              {props.extraText}
            </Text>
            <Text style={{
              color: Colors.blue,
              fontSize: RFValue( 24 ),
              fontFamily: Fonts.FiraSansRegular,
              marginVertical: hp( 1 )
            }}>
              {props.amt}
              <Text style={{
                color: Colors.lightTextColor,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansRegular
              }}> sats
              </Text>
            </Text>
          </View>
          <View style={{
            alignSelf: 'flex-end'
          }}>
            {props.theme ? props.theme?.avatar : props.image}
          </View>

        </View>
        {props.renderQrOrLink &&
        <View style={{
          height: 2, borderWidth: 1, borderColor: Colors.lightBlue, borderStyle: 'dotted', marginTop: hp( 2 )
        }}/>
        }
        {props.renderQrOrLink && props.renderQrOrLink()}

      </View>
    </TouchableOpacity>
  )
}

export default DashedLargeContainer

