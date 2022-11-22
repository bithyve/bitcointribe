import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../common/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export type Props = {
  isChecked: boolean;
  size?: number;
  color?: string;
  borderColor?: string;
  ignoresTouch?: boolean;
  onpress?: () => void;
};

const RadioButton: React.FC<Props> = ({
  isChecked = false,
  size = 20,
  color = Colors.appPrimary,
  borderColor = Colors.appPrimary,
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
      height: size,
      width: size,
    };
  }, [color, size]);

  return (
    <TouchableOpacity
      style={containerStyle}
      activeOpacity={1}
      disabled={ignoresTouch}
      onPress={onpress}
    >
      {isChecked && (
        <View style={{ borderRadius: size / 2, height: size, width: size, justifyContent: 'center', alignItems: 'center' }}>
          <FontAwesome name="check" color={Colors.white} size={11} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RadioButton;
