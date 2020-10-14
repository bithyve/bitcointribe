import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';


export type Props = {
  onPress: () => void;
  containerStyle?: Record<string, unknown>;
};

const SmallNavHeaderCloseButton: React.FC<Props> = ({
  onPress,
  containerStyle,
}: Props) => {
  return (
    <TouchableOpacity
      style={{ ...containerStyle }}
      onPress={onPress}
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
    >
      <FontAwesome
        name="close"
        color={Colors.blue}
        size={20}
      />
    </TouchableOpacity>
  );
};

export default SmallNavHeaderCloseButton;
