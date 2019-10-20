/* eslint-disable class-methods-use-this */
import React from 'react';
import { ImageBackground, StyleSheet, SafeAreaView } from 'react-native';
import { Container, Text } from 'native-base';
// import BarcodeScanner from "react-native-barcode-scanners";
import QRCodeScanner from 'react-native-qrcode-scanner';

import { CustomStatusBar } from 'hexaCustStatusBar';
import { HeaderTitle } from 'hexaCustHeader';

// TODO: Custome object
import { colors, images } from 'hexaConstants';

// TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';

const alert = new AlertSimple();

let flag_ReadQRCode = true;

export default class ConfirmSelfShareQRScanner extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      data: '',
    };
  }

  async UNSAFE_componentWillMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        flag_ReadQRCode = true;
        const data = this.props.navigation.getParam('data');
        // console.log( { data } );
        this.setState({
          data,
        });
      },
    );
  }

  _renderTitleBar() {
    return <Text />;
  }

  _renderMenu() {
    return <Text />;
  }

  click_resetFlag = () => {
    flag_ReadQRCode = true;
  };

  barcodeReceived = async (e: any) => {
    try {
      let result = e.data;
      result = result.split('Doublequote').join('"');
      result = result.split('Leftbrace').join('{');
      result = result.split('Rightbrace').join('}');
      result = result.split('Slash').join('/');
      result = result.split('Comma').join(',');
      result = result.split('Space').join(' ');
      const { data } = this.state;
      // console.log( { result, data } );
      if (result == data) {
        if (flag_ReadQRCode) {
          flag_ReadQRCode = false;
          const { navigation } = this.props;
          navigation.goBack();
          navigation.state.params.onSelect({
            selected: true,
            result,
            data,
          });
        }
      } else if (flag_ReadQRCode) {
        flag_ReadQRCode = false;
        alert.simpleOkAction(
          'Oops',
          'Invalid qrcode please scan first share qrcode.',
          this.click_resetFlag,
        );
      }
    } catch (error) {
      // console.log( error );
    }
  };

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle
            title="Scan 1st Share"
            pop={() => this.props.navigation.pop()}
          />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <QRCodeScanner
              onRead={this.barcodeReceived}
              topContent={this._renderTitleBar()}
              bottomContent={this._renderMenu()}
              cameraType="back"
              showMarker={true}
              vibrate={true}
            />
          </SafeAreaView>
        </ImageBackground>
        <CustomStatusBar
          backgroundColor={colors.white}
          hidden={false}
          barStyle="dark-content"
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
