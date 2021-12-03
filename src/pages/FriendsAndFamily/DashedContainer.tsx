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

const DashedContainer = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]

  return(
    <TouchableOpacity
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
        borderColor: Colors.darkBlue,
        borderWidth: 0.63,
      }}>
      <View style={{
        backgroundColor: Colors.gray7,
        borderRadius: wp( 2 ),
        paddingVertical: hp( 2 ),
        paddingHorizontal: wp( 4 ),
        borderColor: Colors.lightBlue,
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: wp( 3 )
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <View>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.FiraSansRegular,
              fontWeight: '700',
              letterSpacing: 0.8,

            }}>
              {props.titleText}
            </Text>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.FiraSansRegular,
              width: wp( '45%' )
            }}>
              {props.subText}
            </Text>
          </View>
          {props.date &&
          <Text style={{
            color: Colors.lightTextColor,
            fontSize: RFValue( 10 ),
            fontFamily: Fonts.FiraSansRegular,

          }}>
            {moment( props.date ).format( 'lll' )}
          </Text>
          }
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: hp( 1 )
        }}>
          <Text style={{
            color: Colors.black,
            fontSize: RFValue( 24 ),
            fontFamily: Fonts.FiraSansRegular
          }}>
            {props.amt}
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.FiraSansRegular
            }}> {props.currencyCode? props.currencyCode: 'sats'}
            </Text>
          </Text>
          {props.image}
        </View>

      </View>
    </TouchableOpacity>
  )
}

export default DashedContainer

