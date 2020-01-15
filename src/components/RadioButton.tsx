import React, { Component } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';

export default function RadioButton(props) {
    if(props.isOnModal){
        return (<AppBottomSheetTouchableWrapper activeOpacity={10} onPress={() => props.onpress()} style={{ borderColor: props.borderColor, borderWidth: 1, borderRadius: props.size / 2, height: props.size, width: props.size, justifyContent: 'center', alignItems: 'center' }}>
        {props.isChecked &&
            <View style={{ backgroundColor: props.color, borderRadius: props.size / 2, height: props.size - 5, width: props.size - 5 }}></View>
        }
    </AppBottomSheetTouchableWrapper>
    )
    }
    else{
    return (<TouchableOpacity activeOpacity={10} onPress={() => props.onpress()} style={{ borderColor: props.borderColor, borderWidth: 1, borderRadius: props.size / 2, height: props.size, width: props.size, justifyContent: 'center', alignItems: 'center' }}>
        {props.isChecked &&
            <View style={{ backgroundColor: props.color, borderRadius: props.size / 2, height: props.size - 5, width: props.size - 5 }}></View>
        }
    </TouchableOpacity>
    )
    }
}