import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';

import { images } from 'hexaConstants';

export default class ViewShieldIcons extends Component<any, any> {
  render = ({ children } = this.props) => {
    return (
      <TouchableOpacity onPress={() => this.props.click_Image()}>
        <Animated.Image
          source={
            images.walletScreen[
              this.props.data.length != 0
                ? this.props.data[0].image
                : images.walletScreen.shield
            ]
          }
          style={[
            {
              height:
                this.props.data.length != 0
                  ? this.props.data[0].imageHeight
                  : 100,
              width:
                this.props.data.length != 0
                  ? this.props.data[0].imageWidth
                  : 100,
            },
          ]}
        />
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({});
