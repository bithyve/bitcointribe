import React, { Component } from 'react';
import { Image, Platform, View } from 'react-native';
import SVG from 'react-native-remote-svg';

import { renderIf } from 'hexaValidation';

export default class ImageSVG extends Component<any, any> {
  render() {
    return (
      <View>
        {renderIf(Platform.OS === 'ios')(
          <SVG
            style={{
              width: this.props.size,
              height: this.props.size,
            }}
            source={this.props.source}
          />,
        )}
        {renderIf(Platform.OS === 'android')(
          <Image
            source={this.props.source}
            style={{
              height: this.props.size,
              width: this.props.size,
            }}
            resizeMode="contain"
          />,
        )}
      </View>
    );
  }
}
