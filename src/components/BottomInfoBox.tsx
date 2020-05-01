import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';

export default function BottomInfoBox(props) {
  return (
    <View
      style={{
        marginBottom: 25,
        padding: 20,
        backgroundColor: props.backgroundColor
          ? props.backgroundColor
          : Colors.backgroundColor,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 10,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: props.titleColor ? props.titleColor : Colors.blue,
          fontSize: RFValue(13),
          marginBottom: 2,
          fontFamily: Fonts.FiraSansRegular,
        }}
      >
        {props.title}
      </Text>
      <Text style={styles.bottomNoteInfoText}>
        {props.infoText}
        {props.linkText ? (
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(12),
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
              fontSize: RFValue(12),
            }}
          >
            {props.italicText}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
});
