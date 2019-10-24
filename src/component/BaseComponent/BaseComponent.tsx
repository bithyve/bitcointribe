import React, { Component } from 'react';
import { Alert, View, Text } from 'react-native';

import { ModelLoader } from 'hexaComponent/Loader';
// TODO: Custome Object
import { colors } from 'hexaConstants';

class BaseComponent extends Component {
  constructor(props: any) {
    super(props);
    // this.spinnerRef = React.createRef();
    console.log('base comp');
  }

  //  handleBackPress = () => {
  //      DeviceEventEmitter.emit( 'showTabBar' );
  //  };

  //  dispatchAction = ( {
  //      action = () => null,
  //      args = {},
  //      promptError = true,
  //      onSuccess = s => null,
  //      onErrorOk = e => null
  //  } ) => {
  //      action( {
  //          errorhandler: e => {
  //              this.hideSpinner();
  //              promptError ? this.errorhandler( e, onErrorOk ) : onErrorOk( e );
  //          },
  //          successhandler: s => this.successhandler( s, onSuccess ),
  //          ...args
  //      } );
  //  };

  //  errorhandler = ( e, onErrorOk ) => {
  //      if ( e && e.data && e.data.message ) {
  //          const message = e.data.message;
  //          Alert.alert( "Oops", message, [
  //              {
  //                  text: "Ok",
  //                  onPress: () => onErrorOk( e )
  //              }
  //          ] );
  //      } else {
  //          onErrorOk( e );
  //      }
  //  };

  //  successhandler = ( s, onSuccess ) => {
  //      onSuccess( s );
  //  };

  //  showSpinner() {
  //      if ( !!this.spinnerRef.current ) {
  //          this.spinnerRef.current.show();
  //      }
  //  }

  //  hideSpinner() {
  //      if ( !!this.spinnerRef.current ) {
  //          this.spinnerRef.current.hide();
  //      }
  //  }

  //  renderSpinner() {
  //      return null;
  //  }

  render() {
    return (
      <View>
        <ModelLoader loading={true} color={colors.appColor} size={30} />
      </View>
    );
  }
}

export default BaseComponent;
