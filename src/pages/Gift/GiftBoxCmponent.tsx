import React from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

const { height } = Dimensions.get( 'window' )

const GiftBoxComponent = ( props ) => {

  return (
    <TouchableOpacity onPress={props.onPress} style={styles.container}>
      {/* <Gift /> */}
      <View style={styles.wrapper}>
        <View style={{
        }}>
          <View
            style={{
              height: RFValue( 26 ),
              width: RFValue( 26 ),
            }}
          >
            {props.image}
            {/* <CheckingAcc /> */}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginTop: height > 720 ? 6 : wp( 2 ),
            }}
          >
            <Text style={[ styles.pageTitle ]}>{props.titleText}</Text>
            {props.scTitleText
          && (
            <Text style={styles.extraSubText}>{props.scTitleText}</Text>
          )
            }
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Text numberOfLines={3} style={styles.subText}>
              {props.subTitleText} {props.pendingSubText}
            </Text>
            {/* {props.scSubText && (
            <Text style={styles.scSubText}>{props.scSubText}</Text>
          )} */}
            {/* {props.pendingSubText && (
            <Text style={styles.subText}>{props.pendingSubText}</Text>
          )} */}
          </View>
        </View>
        <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
          style={{
            width: RFValue( 14 ),
            height: RFValue( 14 ),
            resizeMode: 'contain',
            // marginBottom: hp( 0.7 ),
            // marginLeft: wp( 3 )
            marginStart:RFValue( 15 )
          }}
        />
      </View>
    </TouchableOpacity>
  )
}

export default GiftBoxComponent


const styles = StyleSheet.create( {
  container:{
    width: '100%',
    height: hp( 18 ),
    backgroundColor: Colors.gray7,
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 10,
    elevation: 2,
    alignSelf: 'center',
    borderRadius: wp( 2 ),
    marginTop: hp( 3 ),
    paddingHorizontal: wp( 5 ),
    paddingVertical: wp( 2.5 ),
    justifyContent:'center',
  },
  wrapper:{
    flex:1,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    paddingHorizontal:5
  },
  pageTitle: {
    color: Colors.THEAM_TEXT_COLOR,
    letterSpacing: 0.7,
    fontFamily: Fonts.Medium,
    alignItems: 'center',
    fontSize: RFValue( 13 ),
    marginVertical:3,
  },
  subText:{
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    // marginTop: RFValue( 4 ),
    letterSpacing: .75,
    lineHeight: RFValue( 11 )
  },
  scSubText:{
    color: Colors.textColorGrey,
    fontSize: RFValue( 6 ),
    fontFamily: Fonts.Light,
    //marginTop: RFValue( 2 ),
    letterSpacing: 0.5,
    lineHeight: 8,
  },
  extraSubText:{
    fontSize: RFValue( 8 ),
    lineHeight: 12,
    color: Colors.blue,
    letterSpacing: 0.7,
    fontFamily: Fonts.Medium,
  }
} )
