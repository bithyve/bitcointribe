import { TouchableOpacity, TouchableOpacityProps, Platform } from 'react-native'
// import { TouchableOpacity as TouchableOpacityGestureHandler } from 'react-native-gesture-handler'
import React, { ReactNode } from 'react'

/**
 * This component uses TouchableOpacity from `react-native-gesture-handler` while on Android
 * to avoid gesture detection issues while being used inside of a Bottom Sheet from `reanimated-bottom-sheet`
 * (See: https://github.com/osdnk/react-native-reanimated-bottom-sheet/issues/16)
 *
 * We should be able to remove it after replacing `reanimated-bottom-sheet` with
 * `@gorhom/bottom-sheet` across the app.
 */
export const AppBottomSheetTouchableWrapper = (
  props: { children: ReactNode } & Pick<TouchableOpacityProps, 'onPress' | 'style' | 'activeOpacity' | 'disabled' | 'hitSlop' | 'delayPressIn'>,
) =>
  Platform.select( {
    android: <TouchableOpacity {...props} />,
    ios: (
      <TouchableOpacity {...props}/>
    ),
  } )
