import React, { useMemo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../common/Colors';

export type Props = {
  isChecked: boolean;
  size?: number;
  color? : string;
  borderColor? : string;
  onpress?: () => void;
};

const RadioButton: React.FC<Props> = ({
  isChecked,
  size,
  color,
  borderColor,
  onpress,
}) => {
  const containerSize = useMemo(() => {
    return size || 20;
  }, [size]);

  const containerStyle = useMemo(() => {
    return {
      borderColor: borderColor || 'none',
      borderWidth: 1,
      borderRadius: containerSize / 2,
      height: containerSize,
      width: containerSize,
      justifyContent: 'center',
      alignItems: 'center',
    };
  }, [borderColor, containerSize]);

  const innerCircleStyle = useMemo(() => {
    return {
      backgroundColor: color || Colors.blue,
      borderRadius: containerSize / 2,
      height: containerSize - 5,
      width: containerSize - 5,
    };
  }, [color, containerSize]);

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={1}
      onPress={() => {
        if (onpress) { onpress(); }
      }}
    >
      {isChecked &&
        <View style={innerCircleStyle} />
      }
    </TouchableOpacity>
  );
}

export default RadioButton;
