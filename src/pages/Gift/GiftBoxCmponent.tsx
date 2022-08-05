import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

const GiftBoxComponent = ( props ) => {

  return(
    <TouchableOpacity
      onPress={props.onPress}
      style={styles.container}>
      {/* <Gift /> */}
      <View style={{
        height:RFValue( 26 ), width:RFValue( 26 ),
      }} >
        {props.image}
        {/* <CheckingAcc /> */}
      </View>
      <View>
        <Text style={[ styles.pageTitle ]}>
          {props.titleText}<Text style={styles.extraSubText}>
            {/* {'TM'} */}
          </Text>
        </Text>
        <Text style={styles.subText}>
          {props.subTitleText}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default GiftBoxComponent


const styles = StyleSheet.create( {
  container:{
    width: '100%',
    height: RFValue( 111 ),
    backgroundColor: Colors.gray7,
    // backgroundColor: 'yellow',
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 10,
    elevation: 2,
    alignSelf: 'center',
    borderRadius: wp( 2 ),
    marginTop: hp( 3 ),
    // marginBottom: hp( 1 ),
    // paddingVertical: hp( 4 ),
    paddingHorizontal: wp( 4.5 ),
    justifyContent:'center',
  },
  pageTitle: {
    color: Colors.blue,
    letterSpacing: 0.7,
    fontFamily: Fonts.FiraSansMedium,
    alignItems: 'center',
    fontSize: RFValue( 14 ),
    marginTop: RFValue( 11 )
  },
  subText:{
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansLight,
    marginTop: RFValue( 4 ),
    letterSpacing: 0.5,
    // paddingTop: RFValue( 40 ),

    // width: '85%',
  },
  extraSubText:{
    color: Colors.textColorGrey,
    fontSize: RFValue( 6 ),
    fontFamily: Fonts.FiraSansLight,
    // marginTop: RFValue( 40 ),
    letterSpacing: 0.5,
    margin:15,
    // backgroundColor: 'red',
    // alignContent:''
    top: -20,
    alignItems: 'flex-start'
    // alignSelf: 'flex-start',\
    // textAlign: 'justify'
    // width: '85%',
  }
} )
