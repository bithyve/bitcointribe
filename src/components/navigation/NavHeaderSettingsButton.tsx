import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';


export type Props = {
  onPress: () => void;
  containerStyle?: Record<string, unknown>;
};

const NavHeaderSettingsButton: React.FC<Props> = ({
  onPress,
  containerStyle,
}: Props) => {
  return (
    <TouchableOpacity
      style={{ ...styles.rootContainer, ...containerStyle }}
      onPress={onPress}
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
    >
      <Image
        source={require('../../assets/images/icons/settings.png')}
        style={{width: 22, height: 22}}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    paddingRight: 16,
  },
});

export default NavHeaderSettingsButton;
