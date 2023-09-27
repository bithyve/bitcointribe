import React, { memo } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'

function AccountComponent( props ) {
  return (
    <TouchableOpacity
      activeOpacity={10}
      style={{
        marginRight: wp( '6%' ),
        marginLeft: wp( '6%' ),
        borderRadius: 10,
        marginTop: hp( '1.7%' ),
        height: wp( '25%' ),
        backgroundColor: Colors.backgroundColor1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: wp( '25%' ),
        }}
      >
        <View style={{
          marginLeft: 10
        }}>
          <Image
            source={props.item.image}
            style={styles.circleShapeView}
          />
        </View>
        <View style={{
          marginLeft: 10, marginRight: 20
        }}>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.Regular,
              fontSize: RFValue( 11 ),
              paddingTop: 5,
              paddingBottom: 3,
            }}
          >
            {props.textHeading ? props.textHeading : 'Sending to: '}
          </Text>
          <Text style={styles.contactNameText} numberOfLines={1}>
            {props.item.account_name}
          </Text>
          {props.item.hasOwnProperty( 'balance' ) ? (
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.MediumItalic,
                fontSize: RFValue( 10 ),
                paddingTop: 3,
              }}
            >
              {props.item.balance + ' sats'}
            </Text>
          ) : null}
        </View>

      </View>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  circleShapeView: {
    width: wp( '20%' ),
    height: wp( '20%' ),
    borderRadius: wp( '20%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
    width: wp( '50%' ),
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
} )
export default memo( AccountComponent )
