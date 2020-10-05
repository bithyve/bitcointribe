import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Colors from '../../common/Colors';

export const HANDLE_CONTAINER_HEIGHT = 12;

export type Props = {
  containerStyle?: Record<string, unknown>;
  handleIndicatorStyle?: Record<string, unknown>;
};

const BottomSheetHandle: React.FC<Props> = ({
  containerStyle,
  handleIndicatorStyle,
}: Props) => {
  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>
      <View style={{ ...styles.handleIndicator, ...handleIndicatorStyle }}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
  },

  handleIndicator: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    marginTop: 7,
  },
});

export default BottomSheetHandle;
