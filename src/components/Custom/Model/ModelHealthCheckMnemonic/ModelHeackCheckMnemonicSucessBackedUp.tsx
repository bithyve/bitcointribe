import React, { Component } from 'react';
import { Modal, View, StyleSheet, Image } from 'react-native';
import { Text } from 'native-base';

import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { images } from 'hexaConstants';

interface Props {
  data: [];
  closeModal: Function;
  click_GoToWallet: Function;
}

export default class ModelHeackCheckMnemonicSucessBackedUp extends Component<
  Props,
  any
> {
  render() {
    const data = this.props.data.length != 0 ? this.props.data : [];
    return (
      <Modal
        transparent
        animationType="fade"
        visible={data.length != 0 ? data[0].modalVisible : false}
        onRequestClose={() => this.props.closeModal()}
      >
        <View
          style={[
            styles.modalBackground,
            { backgroundColor: 'rgba(0,0,0,0.4)' },
          ]}
        >
          <View style={styles.viewModelBody}>
            <View style={{ flexDirection: 'row', flex: 0.6 }}>
              <Text
                style={[
                  FontFamily.ffFiraSansMedium,
                  {
                    fontSize: 20,
                    color: '#2F2F2F',
                    flex: 6,
                    textAlign: 'center',
                    marginTop: 10,
                    marginLeft: 20,
                    marginRight: 20,
                  },
                ]}
              >
                Mnemonic Successfully Backed Up
              </Text>
            </View>
            <View
              style={{
                flex: 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                style={styles.imgAppLogo}
                source={images.RestoreWalletUsingMnemonic.walletrestored}
              />
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Text note style={{ margin: 20, textAlign: 'center' }}>
                Hexa at regular intervals will remind you to refer and safeguard
                your mnemonic.
              </Text>
              <FullLinearGradientButton
                click_Done={() => this.props.click_GoToWallet()}
                title="Go To Wallet"
                disabled={false}
                style={[{ opacity: 1 }, { borderRadius: 10 }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  imgAppLogo: {
    width: 150,
    height: 170,
  },
  viewModelBody: {
    flex: 0.7,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
