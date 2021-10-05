import React, { Component } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'

export default function BottomInfoBox( props ) {
  return (
    <View
      style={{
        marginBottom: 10,
        padding: 20,
        backgroundColor: props.backgroundColor
          ? props.backgroundColor
          : Colors.backgroundColor,
        marginLeft: 12,
        marginRight: 20,
        borderRadius: 10,
        // justifyContent: 'center',
        ...props.containerStyle,
        flexDirection: 'row'
      }}
    >
      <View>
        {props.title !== '' &&
        <Text
          style={{
            color: props.titleColor ? props.titleColor : Colors.blue,
            fontSize: RFValue( 13 ),
            marginBottom: 2,
            fontFamily: Fonts.FiraSansRegular,
          }}
        >
          {props.title}
        </Text>
        }
        <Text style={props.icon ? [ styles.bottomNoteInfoText, styles.extraPadding ] : styles.bottomNoteInfoText}>
          {props.infoText}
          {props.linkText ? (
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.FiraSansRegular,
                textDecorationLine: 'underline',
              }}
              onPress={props.onPress ? props.onPress : () => {}}
            >
              {props.linkText}
            </Text>
          ) : null}
          {props.italicText ? (
            <Text
              style={{
                fontFamily: Fonts.FiraSansMediumItalic,
                fontWeight: 'bold',
                fontStyle: 'italic',
                fontSize: RFValue( 12 ),
              }}
            >
              {props.italicText}
            </Text>
          ) : null}
        </Text>
      </View>
      {props.icon &&
      <Image source={require( '../assets/images/icons/icon_arrow.png' )}
        style={{
          width: widthPercentageToDP( '3.6%' ),
          height: widthPercentageToDP( '3.6%' ),
          alignSelf: 'center',
          marginLeft: 'auto',
          resizeMode: 'contain'
        }}
      />
      }
    </View>
  )
}
const styles = StyleSheet.create( {
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  extraPadding:{
    paddingRight: widthPercentageToDP( 4.5 )
  }
} )
