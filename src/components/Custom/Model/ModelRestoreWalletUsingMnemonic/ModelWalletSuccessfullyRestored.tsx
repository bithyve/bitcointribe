import React, { Component } from 'react';
import { Modal, View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'native-base';

import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';
import { SvgIcon } from '@up-shared/components';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { images } from 'hexaConstants';

const utils = require('hexaUtils');

interface Props {
  data: [];
  closeModal: Function;
  click_Confirm: Function;
  click_RestoreSecureAccount: Function;
  click_Skip: Function;
}

export default class ModelWalletSuccessfullyRestored extends Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      walletName: null,
      flag_DisableBtnNext: true,
    };
  }

  // TODO: Wallet Name
  ckeckWalletName(val: string) {
    if (val.length >= 3) {
      this.setState({
        flag_DisableBtnNext: false,
      });
    } else {
      this.setState({
        flag_DisableBtnNext: true,
      });
    }
  }

  render() {
    const data = this.props.data.length != 0 ? this.props.data : [];
    const { flag_DisableBtnNext } = this.state;
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
                Wallet Successfully Restored
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
                source={images.RestoreWalletUsingMnemonic.walletrestored}
              />
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Text note style={styles.txtNotes}>
                Congratulations! Wallet successfully restored
              </Text>
              <Text note>
                {data.length != 0 ? data[0].walletName : 'Hexa Wallet'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 10,
                }}
              >
                <SvgIcon name="icon_bitcoin" color="#D0D0D0" size={20} />
                <Text style={[FontFamily.ffOpenSansBold, { fontSize: 20 }]}>
                  {data.length != 0 ? data[0].bal : 0}
                </Text>
              </View>
              <Text note style={[styles.txtNotes, { textAlign: 'center' }]} />
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <FullLinearGradientButton
                click_Done={() => this.props.click_RestoreSecureAccount()}
                title="Restore Secure Account"
                disabled={false}
                style={[{ opacity: 1 }, { borderRadius: 10 }]}
              />
              <Button
                onPress={() => this.props.click_Skip()}
                style={[
                  FontFamily.ffFiraSansSemiBold,
                  {
                    backgroundColor: '#838383',
                    borderRadius: 10,
                    margin: 5,
                    height: 50,
                  },
                ]}
                full
              >
                <Text>Skip</Text>
              </Button>
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
    flex: utils.getIphoneSize() == 'iphone X' ? 0.7 : 0.9,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
