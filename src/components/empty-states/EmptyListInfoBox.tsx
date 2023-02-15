import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';

export type Props = {
  headingText: string;
  infoText: string;
  containerStyle?: Record<string, unknown>;
};

const EmptyListInfoBox: React.FC<Props> = ({
  headingText,
  infoText,
  containerStyle = {},
}: Props) => {
  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>
      <Text style={styles.headingText}>{headingText}</Text>
      <Text style={styles.bodyText}>{infoText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: Colors.backgroundColor,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 7,
  },

  bodyText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.Regular,
  },

  headingText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.Regular,
  },
});

export default EmptyListInfoBox;
