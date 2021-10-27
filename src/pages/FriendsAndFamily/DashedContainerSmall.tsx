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

const DashedContainerSmall = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]

  return(
    <View
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
        borderColor: props.theme ? props.theme.color : Colors.darkBlue,
        borderWidth: 0.63,
      }}>
      <View style={{
        backgroundColor: Colors.gray7,
        borderRadius: wp( 2 ),
        paddingVertical: hp( 2 ),
        paddingHorizontal: wp( 4 ),
        borderColor: props.theme ? props.theme.color : Colors.lightBlue,
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: wp( 3 )
      }}>
        <View style={{
          flexDirection: 'row',
        }}>
          {props.theme ? props.theme?.avatar : props.image}
          {/* <View> */}
          <Text style={{
            color: Colors.gray4,
            fontSize: RFValue( 12 ),
            fontFamily: Fonts.FiraSansRegular,
            alignSelf: 'center',
            marginHorizontal: wp( 1 )
          }}>
            Accepted Gift Card
          </Text>
          <Text style={{
            color: Colors.blue,
            fontSize: RFValue( 24 ),
            fontFamily: Fonts.FiraSansRegular,
            alignSelf: 'center',
            marginLeft: 'auto',
            width: 'auto'
          }}>
            {props.amt}
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.FiraSansRegular
            }}> sats
            </Text>
          </Text>
          {/* </View> */}
        </View>
      </View>
    </View>
  )
}

export default DashedContainerSmall

