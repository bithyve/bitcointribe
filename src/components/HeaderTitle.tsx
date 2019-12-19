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
import KnowMoreButton from './KnowMoreButton';
import { RFValue } from "react-native-responsive-fontsize";

export default function HeaderTitle(props) {

    return (<View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={CommonStyles.headerTitles} >
                {props.firstLineTitle}{props.secondLineTitle ? "\n" + props.secondLineTitle : ""}
            </Text>
            {props.isKnowMoreButton &&
                <KnowMoreButton onpress={() => props.onPressKnowMore} containerStyle={{ marginLeft: 'auto', marginRight: 20 }} />
            }
        </View>
        <Text style={CommonStyles.headerTitlesInfoText} >
            {props.infoTextNormal}<Text style={{ fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', fontStyle:"italic", fontSize: RFValue(12, 812), }}>{props.infoTextBold}</Text>
        </Text>
    </View>
    )
}