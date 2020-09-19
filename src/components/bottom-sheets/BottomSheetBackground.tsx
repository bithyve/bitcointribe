import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { Extrapolate, interpolate } from 'react-native-reanimated';

export interface Props {
  isVisible: boolean;
  onPress: () => void;
}

const BottomSheetBackground: React.FC<Props> = ({ isVisible, onPress }: Props) => {

  const overlayStyle = useMemo(() => {
    return {
      ...styles.modalOverlayBackground,
      opacity: isVisible ? 1.0 : 0.0,
      // opacity: interpolate(animatedPositionIndex, {
      // inputRange: [0, 2],
      // outputRange: [0, 1],
      // extrapolate: Extrapolate.CLAMP,
      // }),
    };
  }, [isVisible]
    // [animatedPositionIndex]
  );

  const overlayPointerEvents = useMemo(() => {
    return isVisible ? 'auto' : 'none';
  }, [isVisible]);

  return (
    <Animated.View pointerEvents={overlayPointerEvents} style={overlayStyle}>
      <TouchableOpacity style={{ ...StyleSheet.absoluteFillObject }} onPress={onPress} activeOpacity={1} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
});

export default BottomSheetBackground;
