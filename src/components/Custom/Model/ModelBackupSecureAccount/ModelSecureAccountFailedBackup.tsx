import React, { Component } from 'react';
import { Modal, View, StyleSheet, Image } from 'react-native';
import { Text } from 'native-base';

import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';

//TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

//TODO: Custome Object
import { images } from 'hexaConstants';
var utils = require('hexaUtils');

interface Props {
  data: [];
  closeModal: Function;
  click_Done: Function;
}

export default class ModelSecureAccountFailedBackup extends Component<
  Props,
  any
> {
  render() {
    let data = this.props.data.length != 0 ? this.props.data : [];
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
            { backgroundColor: `rgba(0,0,0,0.4)` },
          ]}
        >
          <View style={styles.viewModelBody}>
            <View
              style={{
                flexDirection: 'row',
                flex: 0.6,
                margin: 20,
              }}
            >
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
                Secure Wallet Unsuccessfully Backed Up.
              </Text>
            </View>
            <View
              style={{
                flex: 2,
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <Image
                style={styles.imgAppLogo}
                source={images.backupSecureAccount.failedBackup}
              />
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Text note style={{ textAlign: 'center' }}>
                We're sorry we were not able to Recover your wallet for some
                reason.
              </Text>
              <Text note style={[styles.txtNotes, { textAlign: 'center' }]}>
                Something went wrong with your secure account backed up.Please
                try agian
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <FullLinearGradientButton
                click_Done={() => this.props.click_Done()}
                title="Done"
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
  txtNotes: {
    margin: 20,
  },
  viewModelBody: {
    flex: utils.getIphoneSize() == 'iphone X' ? 0.6 : 0.8,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
