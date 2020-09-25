import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../../common/Colors';
import HeadingStyles from '../../../common/Styles/HeadingStyles';


export interface Props {
  title: string;
  titleStyle?: Record<string, unknown>;
  onBackPress: () => void;
}

const NavigationHeader: React.FC<Props> = ({
  title,
  titleStyle,
  onBackPress,
}: Props) => {
  const headingTextStyle = useMemo(() => {
    return {
      ...styles.headingText,
      ...titleStyle,
    }
  }, [titleStyle]);

  return (
    <View style={styles.rootContainer}>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={{ marginRight: 12, padding: 10 }}
          onPress={onBackPress}
        >
          <FontAwesome
            name="long-arrow-left"
            color={Colors.blue}
            size={17}
          />
        </TouchableOpacity>

        <Text style={headingTextStyle}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    ...Platform.select({
      android: {
        marginTop: StatusBar.currentHeight,
      },
      ios: {
        marginTop: 44,
      },
      'default': {
        marginTop: 44,
      },
    }),
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 10,
    minHeight: 88,
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headingText: {
    ...HeadingStyles.screenHeadingLarge,
    flex: 0.75,
  },
});

export default NavigationHeader;
