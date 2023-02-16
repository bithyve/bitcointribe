import React, { Component } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import ArrowRight from '../assets/images/svgs/icon_arrow_right.svg'

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
            color: props.titleColor ? props.titleColor : Colors.THEAM_TEXT_COLOR,
            fontSize: RFValue( 12 ),
            marginBottom: 2,
            fontFamily: Fonts.SemiBold,
          }}
        >
          {props.title}
        </Text>
        }
        <Text style={props.icon ? [ styles.bottomNoteInfoText, styles.extraPadding ] : {
          ...styles.bottomNoteInfoText, width : props?.width
        }}>
          {props.infoText}
          {props.linkText ? (
            <Text
              style={{
                color: Colors.THEAM_INFO_TEXT_COLOR,
                fontSize: RFValue( 12 ),
                fontFamily: Fonts.SemiBold,
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
                fontFamily: Fonts.MediumItalic,
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
      <ArrowRight />
      }
    </View>
  )
}
const styles = StyleSheet.create( {
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    letterSpacing: 0.6,
    lineHeight: 18
  },
  extraPadding:{
    paddingRight: widthPercentageToDP( 4.5 )
  }
} )
