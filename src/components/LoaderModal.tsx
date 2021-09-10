import React, { useState, useEffect } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'

export default function LoaderModal( props ) {
  return ( <View style={{
    maxHeight: hp( '72%' ), backgroundColor: 'rgba(0, 0, 0, 0.3)',
  }}>
    <View style={styles.modalContentContainer}>
      <View style={{
        marginTop: 'auto', right: 0, bottom: 0, position: 'absolute'
      }}>
        <Image source={require( '../assets/images/loader.gif' )} style={{
          width: wp( '30%' ), height: wp( '35%' ), marginLeft: 'auto', resizeMode: 'stretch',
        }} />
      </View>
      {
        // Removed the showGif condition from here as we are not using the animated gif loader anymore
        // The animated gif loader file size can impact performance
        <View style={{
          marginLeft: wp( '8%' ), marginRight:  props.subPoints ? wp( '12%' ) : wp( '30%' ), marginTop: wp( '8%' ),
        }}>
          <Text style={{
            color: Colors.blue, fontSize: RFValue( 18 ), fontFamily: Fonts.FiraSansRegular, letterSpacing: 0.54
            // letterSpacing: 0.54
          }}>{props.headerText}</Text>
          <Text style={{
            color: Colors.textColorGrey, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular, marginTop: wp( '3%' ), letterSpacing: 0.6
            // letterSpacing: 0.6
          }}>{props.messageText}</Text>
          {props.subPoints &&
          <View style={{
            marginVertical: hp( 4 )
          }}>
            {props.subPoints.map( ( item, index ) => {
              return(
                <View key={index} style={{
                  flexDirection: 'row', paddingVertical: hp( 1 ), alignItems: 'center',
                }}>
                  <View style={{
                    height: 6, width: 6, borderRadius: 3, backgroundColor: Colors.gray4, alignSelf: 'center'
                  }}/>
                  <Text style={{
                    color: Colors.textColorGrey, fontSize: RFValue( 12 ), letterSpacing: 0.6, fontFamily: Fonts.FiraSansRegular, marginLeft: wp( 2 )
                  }}>
                    {item}
                  </Text>
                </View>
              )
            } )}
          </View>
          }
          {props.bottomText &&
          <Text style={{
            color: Colors.textColorGrey, fontSize: RFValue( 12 ), letterSpacing: 0.6, fontFamily: Fonts.FiraSansRegular, marginTop: wp( '3%' ), width: '65%'
          }}>{props.bottomText}</Text>
          }
          <Text style={{
            marginRight: wp( '3%' ), color: Colors.textColorGrey, fontSize: RFValue( 12 ), fontFamily: Fonts.FiraSansRegular, marginTop: wp( '3%' ), letterSpacing: 0.6
          }}>{props.messageText2 ? props.messageText2 : ''}</Text>
        </View>
      }
    </View>
  </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.white,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.white,
    borderRightWidth: 1,
    borderTopColor: Colors.white,
    borderTopWidth: 1,
    // height: '100%',
    position: 'relative',
    minHeight: hp( 25 )
  },
  successModalImage: {
    width: wp( '80%' ),
    height: hp( '8%' ),
    resizeMode: 'contain',
    alignSelf: 'center'
  },
} )
