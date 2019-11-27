import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";

export default function RadioButton(props) {

    return (<View>
        <Text style={CommonStyles.headerTitles} >
        {props.firstLineTitle}{props.secondLineTitle? "\n"+props.secondLineTitle:""}
        </Text>
        <Text style={CommonStyles.headerTitlesInfoText} >
        {props.infoTextNormal}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold' }}>{props.infoTextBold}</Text>
        </Text>
    </View>
    )
}