import React, { Component } from 'react';
import { DeviceEventEmitter, Alert, View } from 'react-native';

class BaseComponent extends Component {
  constructor(props) {
    super(props);
    this.spinnerRef = React.createRef();
  }

  handleBackPress = () => {
    DeviceEventEmitter.emit('showTabBar');
  };

  dispatchAction = ({
    action = () => null,
    args = {},
    promptError = true,
    onSuccess = s => null,
    onErrorOk = e => null,
  }) => {
    action({
      errorhandler: e => {
        this.hideSpinner();
        promptError ? this.errorhandler(e, onErrorOk) : onErrorOk(e);
      },
      successhandler: s => this.successhandler(s, onSuccess),
      ...args,
    });
  };

  errorhandler = (e, onErrorOk) => {
    if (e && e.data && e.data.message) {
      const { message } = e.data;
      Alert.alert('Oops', message, [
        {
          text: 'Ok',
          onPress: () => onErrorOk(e),
        },
      ]);
    } else {
      onErrorOk(e);
    }
  };

  successhandler = (s, onSuccess) => {
    onSuccess(s);
  };

  showSpinner() {
    if (this.spinnerRef.current) {
      this.spinnerRef.current.show();
    }
  }

  hideSpinner() {
    if (this.spinnerRef.current) {
      this.spinnerRef.current.hide();
    }
  }

  renderSpinner() {
    return <div ref={this.spinnerRef} />;
  }

  render() {
    return <View>{this.renderSpinner()}</View>;
  }
}

export default BaseComponent;
