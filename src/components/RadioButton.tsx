import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../common/Colors';

export type Props = {
  isChecked: boolean;
  size?: number;
  color? : string;
  borderColor? : string;
  ignoresTouch?: boolean;
  onpress?: () => void;
};

const RadioButton: React.FC<Props> = ({
  isChecked = false,
  size = 20,
  color = Colors.primaryAccentLighter1,
  borderColor = Colors.borderColor,
  ignoresTouch = false,
  onpress = () => {},
}: Props) => {
  const containerStyle = useMemo(() => {
    return {
      ...styles.rootContainer,
      borderColor,
      borderRadius: size / 2,
      height: size,
      width: size,
    };
  }, [borderColor, size]);

  const innerCircleStyle = useMemo(() => {
    return {
      backgroundColor: color,
      borderRadius: size / 2,
      height: size - 5,
      width: size - 5,
    };
  }, [color, size]);

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={1}
      disabled={ignoresTouch}
      onPress={onpress}
    >
      {isChecked &&
        <View style={innerCircleStyle} />
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RadioButton;
