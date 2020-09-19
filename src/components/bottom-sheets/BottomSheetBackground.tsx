import React, { useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { Easing, useValue } from 'react-native-reanimated';

export interface Props {
  isVisible: boolean;
  onPress: () => void;
}

const BottomSheetBackground: React.FC<Props> = ({ isVisible, onPress }: Props) => {
  const opacity = useValue(0);

  useEffect(() => {
    animateOpacity();
  }, [isVisible]);

  const overlayStyle = useMemo(() => {
    return {
      ...styles.modalOverlayBackground,
      opacity,
    };
  }, [isVisible]
  );

  const overlayPointerEvents = useMemo(() => {
    return isVisible ? 'auto' : 'none';
  }, [isVisible]);


  function animateOpacity() {
    Animated.timing(opacity, {
      toValue: isVisible ? 1.0 : 0.0,
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
    }).start();
  }

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
