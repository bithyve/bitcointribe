import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";

export default function BottomInfoBox(props) {

    return (<View style={styles.container}>
    <Text style={styles.bottomNoteText}>{props.title}</Text>
    <Text style={styles.bottomNoteInfoText}>{props.infoText}
    {props.linkText ? <Text style={{color: Colors.textColorGrey,
        fontSize: RFValue(12),
        fontFamily: Fonts.FiraSansRegular,textDecorationLine: 'underline'}}
        onPress={props.onPress ? props.onPress : ()=>{}}
        >{props.linkText}
        </Text> : null}
        {props.italicText ? <Text style={{fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', fontStyle:"italic", fontSize: RFValue(12),}}
        >{props.italicText}
        </Text> : null}
    </Text>
</View>
    )
}
const styles = StyleSheet.create({
    container:{ 
        marginBottom: 25, 
        padding: 20, 
        backgroundColor: Colors.backgroundColor, 
        marginLeft: 20, 
        marginRight: 20, 
        borderRadius: 10, 
        justifyContent: 'center' 
    },
    bottomNoteText: {
        color: Colors.blue,
        fontSize: RFValue(13),
        marginBottom: 2,
        fontFamily: Fonts.FiraSansRegular
    },
    bottomNoteInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(12),
        fontFamily: Fonts.FiraSansRegular
    },
})