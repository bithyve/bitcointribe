import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';

export type Props = {
  onPress: () => void;
  containerStyle?: Record<string, unknown>;
};

const SmallNavHeaderBackButton: React.FC<Props> = ({
  onPress,
  containerStyle = {},
}: Props) => {
  return (
    <TouchableOpacity
      style={{ ...styles.rootContainer, ...containerStyle }}
      onPress={onPress}
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
    >
      <FontAwesome
        name="long-arrow-left"
        color={Colors.homepageButtonColor}
        size={20}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingHorizontal: 20,
  },
});

export default SmallNavHeaderBackButton;
