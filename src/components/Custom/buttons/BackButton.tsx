import React, { Component } from 'react';
import { Button } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Props {
  clickDone: Function;
}
export default class BackButton extends Component<Props, any> {
  render() {
    return (
      <Button
        transparent
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ width: 50 }}
        onPress={() => this.props.clickDone()}
      >
        <Icon name="chevron-left" size={25} color="#ffffff" />
      </Button>
    );
  }
}
