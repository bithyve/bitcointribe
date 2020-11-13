import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colorForLastSeenActive } from './send/LastSeenActiveUtils';
import { Milliseconds } from '../common/data/typealiases/UnitAliases';

export type Props = {
  timeSinceActive: Milliseconds;
  size?: number;
  style?: Record<string, unknown>;
};

const LastSeenActiveIndicator: React.FC<Props> = ({
  timeSinceActive,
  size = 12,
  style = {},
}: Props) => {
  const viewStyle = useMemo(() => {
    return {
      width: size,
      height: size,
      borderRadius: 9999,
      backgroundColor: colorForLastSeenActive(timeSinceActive),
      ...style,
    };
  }, [timeSinceActive, size, style]);

  return (
    <View style={viewStyle} />
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default LastSeenActiveIndicator;
