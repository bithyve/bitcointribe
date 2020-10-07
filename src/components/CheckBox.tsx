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

export default function CheckBox(props) {
  if (props.isOnModal) {
    return (<AppBottomSheetTouchableWrapper activeOpacity={10} onPress={() => props.onpress()} style={{ borderColor: props.borderColor, borderWidth: 1, borderRadius: props.borderRadius, height: props.size, width: props.size, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
      {props.isChecked &&
        // <View style={{ backgroundColor: props.color, borderRadius: props.borderRadius, height: props.size - 5, width: props.size - 5 }}></View>
        <Image style={{ width: props.imageSize, height: props.imageSize, alignSelf: 'center', resizeMode: 'contain' }} source={require('../assets/images/icons/icon_check.png')} />
      }
    </AppBottomSheetTouchableWrapper>
    )
  }
  else {
    return (<TouchableOpacity activeOpacity={10} onPress={() => props.onpress()} style={{ borderColor: props.borderColor, borderWidth: 1, borderRadius: props.borderRadius, height: props.size, width: props.size, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
      {props.isChecked &&
        // <View style={{ backgroundColor: props.color, borderRadius: props.borderRadius, height: props.size - 5, width: props.size - 5 }}></View>
        <Image style={{ width: props.imageSize, height: props.imageSize, alignSelf: 'center', resizeMode: 'contain' }} source={require('../assets/images/icons/icon_check.png')} />
      }
    </TouchableOpacity>
    )
  }
}