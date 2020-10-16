import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Props = {
  title: string;
};

const SmallModalHeader: React.FC<Props> = ({

}: Props) => {
  return (
    <View style={styles.rootContainer}>
      <Text>SmallModalHeader</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  }
});

export default SmallModalHeader;
