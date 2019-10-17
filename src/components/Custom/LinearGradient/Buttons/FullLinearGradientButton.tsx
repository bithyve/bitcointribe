import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  title: string;
  style: any;
  disabled: Boolean;
  click_Done: Function;
}

export default class FullLinearGradientButton extends Component<Props, any> {
  render = ({ children } = this.props) => {
    return (
      <LinearGradient
        colors={['#37A0DA', '#0071BC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btnDone, this.props.style]}
      >
        <Button
          transparent
          full
          disabled={this.props.disabled}
          onPress={() => this.props.click_Done()}
        >
          <Text style={styles.textWhite}>{this.props.title}</Text>
        </Button>
      </LinearGradient>
    );
  };
}

const styles = StyleSheet.create({
  textWhite: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'FiraSans-SemiBold',
    alignSelf: 'center',
  },
  btnDone: {
    margin: 5,
    height: 50,
    justifyContent: 'center',
  },
});
