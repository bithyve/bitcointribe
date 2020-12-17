import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Color from '../../common/Colors';
const Loader = ({ backgroundColor, indicatorColor, isLoading }) => (
  <View style={[styles.container, { backgroundColor }]}>
    {isLoading ? <ActivityIndicator size="large" animating color={indicatorColor} /> : null}
  </View>
);

export default Loader;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Loader.propTypes = {
  backgroundColor: PropTypes.string,
  indicatorColor: PropTypes.string,
  isLoading: PropTypes.bool,
};

Loader.defaultProps = {
  backgroundColor: 'rgba(1,1,1,0.05)',
  indicatorColor: Color.backgroundColor1,
};
