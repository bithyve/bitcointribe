import { TouchableOpacity, TouchableOpacityProps, Platform} from "react-native";
import { TouchableOpacity as TouchableOpacityGestureHandler } from "react-native-gesture-handler";
import React, { ReactNode } from "react";

export const AppBottomSheetTouchableWrapper = (
    props: { children: ReactNode } & Pick<TouchableOpacityProps,'onPress' | 'style' | 'activeOpacity' | 'disabled' | 'hitSlop'>,
  ) =>
    Platform.select({
      android: <TouchableOpacityGestureHandler {...props} />,
      ios: (
        <TouchableOpacity {...props}/>
      ),
    });