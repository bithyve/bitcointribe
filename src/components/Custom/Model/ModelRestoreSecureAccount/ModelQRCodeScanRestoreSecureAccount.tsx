import React, { Component } from 'react';
import { Modal, View, StyleSheet, StatusBar } from 'react-native';
import { Button, Text } from 'native-base';
import IconFontAwe from 'react-native-vector-icons/FontAwesome';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Permissions from 'react-native-permissions';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

const utils = require('hexaUtils');

// TODO: Common Function
const comFunDBRead = require('hexaCommonDBReadData');

interface Props {
  data: [];
  pop: Function;
  closeModal: Function;
  click_Next: Function;
}

export default class ModelQRCodeScanRestoreSecureAccount extends Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      mnemonic: '',
      flag_NextBtnDisable: true,
    };
  }

  componentWillReceiveProps = async (nextProps: any) => {
    const resultWallet = await comFunDBRead.readTblWallet();
    // console.log( { mnumanic: resultWallet } );
    this.setState({
      mnemonic: resultWallet.mnemonic,
    });
  };

  componentDidMount() {
    Permissions.request('camera').then((response: any) => {
      // console.log( { response } );
    });
  }

  _renderTitleBar() {
    return <Text />;
  }

  _renderMenu() {
    return <Text />;
  }

  barcodeReceived = async (e: any) => {
    try {
      const result = e.data;
      const { mnemonic } = this.state;
      // console.log( { mnemonic } );
      const secureAccount = await utils.getSecureAccountObject();
      // const secureAccount = new SecureAccount( mnemonic );
      // console.log( { result } );
      if (result != '') {
        const resDecryptSecondaryXpub = await secureAccount.decryptSecondaryXpub(
          result,
        );
        // console.log( { resDecryptSecondaryXpub } );
        this.props.click_Next(resDecryptSecondaryXpub.secondaryXpub);
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const data = this.props.data.length != 0 ? this.props.data : [];
    return (
      <Modal
        transparent
        animationType={'fade'}
        visible={data.length != 0 ? data[0].modalVisible : false}
        onRequestClose={() => this.props.closeModal()}
        presentationStyle="fullScreen"
      >
        <StatusBar hidden={true} />
        <View
          style={[
            styles.modalBackground,
            { backgroundColor: 'rgba(0,0,0,0.7)' },
          ]}
        >
          <View style={styles.viewHeader}>
            <Button
              transparent
              onPress={() => this.props.closeModal()}
              style={{
                alignSelf: 'flex-end',
                alignItems: 'center',
                marginRight: 20,
                height: 40,
                width: 40,
              }}
            >
              <IconFontAwe
                name="close"
                size={25}
                color="gray"
                style={{ marginLeft: 10 }}
              />
            </Button>
          </View>
          <View style={{ flex: 0.8 }}>
            <Text
              style={[
                FontFamily.ffFiraSansMedium,
                {
                  fontSize: 24,
                  color: '#ffffff',
                  textAlign: 'center',
                  margin: 20,
                },
              ]}
            >
              Restore {'\n'} Secure Account
            </Text>
            <Text
              style={{
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 14,
              }}
            >
              Step 1
            </Text>
          </View>
          <View style={{ flex: 2 }}>
            <QRCodeScanner
              onRead={this.barcodeReceived}
              topContent={this._renderTitleBar()}
              bottomContent={this._renderMenu()}
              cameraType="back"
              showMarker={true}
              vibrate={true}
            />
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 18,
              }}
            >
              Scan Secondary xPub
            </Text>
            <Text
              style={{
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 12,
                margin: 20,
              }}
            >
              Open the PDF and scan the secoundary {'\n'} xPub QR Code
            </Text>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
  },
  viewHeader: {
    flex: 0.1,
    marginTop: 20,
  },
});
