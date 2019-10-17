import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { SvgIcon } from '@up-shared/components';
interface Props {
  title: string;
  style: any;
  disabled: Boolean;
  click_Done: Function;
  click_Option: Function;
}

export default class FullLinearGradientShareButton extends Component<
  Props,
  any
> {
  render = ({ children } = this.props) => {
    return (
      <LinearGradient
        colors={['#37A0DA', '#0071BC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btnDone, this.props.style]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Button
            transparent
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={this.props.disabled}
            onPress={() => this.props.click_Done(this.props.title)}
          >
            <Text style={styles.textWhite}>{'  ' + this.props.title}</Text>
          </Button>
          <View style={{ flex: 0.2, flexDirection: 'row' }}>
            <View
              style={{
                flex: 0.02,
                height: 40,
                width: 1,
                alignSelf: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
              }}
            />
            <Button
              transparent
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={this.props.disabled}
              onPress={() => this.props.click_Option(this.props.title)}
            >
              <SvgIcon name="more-icon" color="#ffffff" size={22} />
            </Button>
          </View>
        </View>
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
