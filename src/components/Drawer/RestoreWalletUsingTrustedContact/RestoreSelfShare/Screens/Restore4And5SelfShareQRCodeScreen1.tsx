import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Container, Button, Text } from 'native-base';
//import BarcodeScanner from "react-native-barcode-scanners";
import QRCodeScanner from 'react-native-qrcode-scanner';

//TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';
let alert = new AlertSimple();

//TODO: Custome object
import { renderIf } from 'hexaValidation';

interface Props {
  click_Next: Function;
}

let flag_ReadQRCode = true;

export default class Restore4And5SelfShareQRCodeScreen1 extends React.Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);

    this.state = {
      flag_qrcode: false,
    };
  }

  componentWillUnmount() {
    flag_ReadQRCode = true;
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
      var result = e.data;
      result = result.split('Doublequote').join('"');
      result = result.split('Leftbrace').join('{');
      result = result.split('Rightbrace').join('}');
      result = result.split('Slash').join('/');
      result = result.split('Comma').join(',');
      result = result.split('Space').join(' ');
      let type = this.props.type;
      console.log({ type });

      var firstChar = result.slice(0, 3);
      console.log({ firstChar });
      if (type == 'iCloud') {
        if (firstChar == 'c01') {
          if (flag_ReadQRCode) {
            console.log({ result });
            this.props.click_Next(1, [result]);
            flag_ReadQRCode = false;
          }
        } else {
          if (flag_ReadQRCode) {
            alert.simpleOkAction(
              'Oops',
              'Please scan share 1 qrcode.',
              this.click_resetFlag,
            );
            flag_ReadQRCode = false;
          }
        }
      } else {
        if (firstChar == 'e01') {
          if (flag_ReadQRCode) {
            this.props.click_Next(1, [result]);
            flag_ReadQRCode = false;
          }
        } else {
          if (flag_ReadQRCode) {
            alert.simpleOkAction(
              'Oops',
              'Please scan share 1 qrcode.',
              this.click_resetFlag,
            );
            flag_ReadQRCode = false;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    //flag
    let { flag_qrcode } = this.state;
    return (
      <Container>
        <View style={styles.container}>
          {renderIf(flag_qrcode == false)(
            <Button
              full
              style={{
                flex: 1,
                margin: 20,
                borderRadius: 10,
                backgroundColor: 'gray',
              }}
              onPress={() => this.setState({ flag_qrcode: !flag_qrcode })}
            >
              <Text style={{ color: '#000000' }}>Tab To Scan share 1</Text>
            </Button>,
          )}
          {renderIf(flag_qrcode == true)(
            <QRCodeScanner
              onRead={this.barcodeReceived}
              topContent={this._renderTitleBar()}
              bottomContent={this._renderMenu()}
              cameraType="back"
              showMarker={true}
              vibrate={true}
            />,
          )}
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
