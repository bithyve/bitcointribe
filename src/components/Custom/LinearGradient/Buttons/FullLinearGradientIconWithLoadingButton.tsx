import React, { Component } from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Button } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import IconFontAwe from 'react-native-vector-icons/FontAwesome';

interface Props {
  title: string;
  style: any;
  disabled: Boolean;
  click_Done: Function;
}

export default class FullLinearGradientIconWithLoadingButton extends Component<
  Props,
  any
> {
  render = ({ children } = this.props) => {
    return (
      <LinearGradient
        colors={['#37A0DA', '#0071BC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.btnDone,
          this.props.style,
          { flexDirection: 'row', justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator
          animating={this.props.animating}
          size="small"
          color="#ffffff"
          style={{ marginRight: 5 }}
        />
        <Button
          transparent
          full
          disabled={this.props.disabled}
          onPress={() => this.props.click_Done()}
        >
          <IconFontAwe
            name={this.props.iconName}
            color={this.props.iconColor}
            size={this.props.iconSize}
          />
          <Text style={styles.textWhite}>{'  ' + this.props.title}</Text>
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
    height: 50,
    justifyContent: 'center',
  },
});
