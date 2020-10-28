import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';

export default function RadioButton(props) {
  if (props.isOnModal) {
    return (
      <AppBottomSheetTouchableWrapper
        disabled={props.disabled ? props.disabled : false}
        activeOpacity={10}
        onPress={() => props.onpress()}
        style={{
          borderColor: props.borderColor,
          borderWidth: 1,
          borderRadius: props.size / 2,
          height: props.size,
          width: props.size,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {props.isChecked && (
          <View
            style={{
              backgroundColor: props.color,
              borderRadius: props.size / 2,
              height: props.size - 5,
              width: props.size - 5,
            }}
          ></View>
        )}
      </AppBottomSheetTouchableWrapper>
    );
  } else {
    return (
      <TouchableOpacity
        disabled={props.disabled ? props.disabled : false}
        activeOpacity={10}
        onPress={() => props.onpress()}
        style={{
          borderColor: props.borderColor,
          borderWidth: 1,
          borderRadius: props.size / 2,
          height: props.size,
          width: props.size,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {props.isChecked && (
          <View
            style={{
              backgroundColor: props.color,
              borderRadius: props.size / 2,
              height: props.size - 5,
              width: props.size - 5,
            }}
          ></View>
        )}
      </TouchableOpacity>
    );
  }
}
