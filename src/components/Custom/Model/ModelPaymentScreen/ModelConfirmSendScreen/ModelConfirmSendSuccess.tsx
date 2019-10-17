import React, { Component } from 'react';
import { Modal, View, StyleSheet, Image } from 'react-native';
import { Text } from 'native-base';

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
  click_GoToDailyAccount: Function;
}

export default class ModelConfirmSendSuccess extends Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      details: [],
    };
  }

  componentWillReceiveProps = (nextProps: any) => {
    const { data } = nextProps;
    if (data.length != 0) {
      this.setState({
        details: data[0].data[0],
      });
    }
  };

  render() {
    const data = this.props.data.length != 0 ? this.props.data : [];
    // array
    const { details } = this.state;
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
            <View style={{ flex: 0.4, alignItems: 'center' }}>
              <Text
                style={[
                  FontFamily.ffFiraSansMedium,
                  {
                    fontSize: 20,
                    color: '#2F2F2F',
                  },
                ]}
              >
                Send Successful
              </Text>
            </View>
            <View
              style={{
                flex: 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                style={styles.imgAppLogo}
                source={images.RestoreWalletUsingMnemonic.walletrestored}
              />
            </View>
            <View style={{ flex: 0.9, alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  margin: 5,
                }}
              >
                <SvgIcon name="icon_bitcoin" color="#D0D0D0" size={25} />
                <Text
                  style={{
                    fontSize: 22,
                    marginLeft: 4,
                    fontWeight: 'bold',
                  }}
                >
                  {details != undefined ? details.amount : ''}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text note style={[{ fontSize: 12 }]}>
                  Transaction Fee
                </Text>
                <SvgIcon name="icon_bitcoin" color="#D0D0D0" size={15} />
                <Text note style={{ fontSize: 12, marginLeft: -0.01 }}>
                  {details != undefined ? details.tranFee : ''}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text note>Transferred Successfully to</Text>
              <Text>{details != undefined ? details.accountName : ''}</Text>
            </View>
            <View style={{ flex: 2, alignItems: 'center' }}>
              <Text note>Wallet Transactions id</Text>
              <Text style={{ textAlign: 'center' }}>
                {' '}
                {details != undefined ? details.txid : ''}
              </Text>
              <Text note>{details != undefined ? details.date : ''}</Text>
            </View>
            <View style={{ flex: 0.4, justifyContent: 'flex-end' }}>
              <FullLinearGradientButton
                click_Done={() => this.props.click_GoToDailyAccount()}
                title="Go to wallet"
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
    flex: utils.getIphoneSize() == 'iphone X' ? 0.7 : 0.9,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
