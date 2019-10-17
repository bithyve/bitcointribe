import React, { Component } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, Text, Textarea } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';
import { SvgIcon } from '@up-shared/components';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
const utils = require('hexaUtils');

interface Props {
  data: [];
  closeModal: Function;
  click_Confirm: Function;
  pop: Function;
}

export default class ModelWalletName extends Component<Props, any> {
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
        <KeyboardAwareScrollView
          enableAutomaticScroll
          automaticallyAdjustContentInsets={true}
          keyboardOpeningTime={0}
          enableOnAndroid={true}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={[
              styles.modalBackground,
              { backgroundColor: `rgba(0,0,0,0.4)` },
            ]}
          >
            <View style={styles.viewModelBody}>
              <View style={{ flexDirection: 'row', flex: 0.6 }}>
                <Button
                  transparent
                  hitSlop={{
                    top: 5,
                    bottom: 8,
                    left: 10,
                    right: 15,
                  }}
                  onPress={() => this.props.pop()}
                >
                  <SvgIcon name="icon_back" size={25} color="gray" />
                </Button>
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
                  Restore Wallet using Passphrase
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Text
                  note
                  style={[FontFamily.ffFiraSansMedium, { textAlign: 'center' }]}
                >
                  Please put in the name that you used while setting up your
                  Hexa Wallet
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Textarea
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      borderRadius: 8,
                      justifyContent: 'center',
                    },
                  ]}
                  rowSpan={3}
                  bordered
                  value={this.state.walletName}
                  placeholder="Enter the name of the wallet"
                  placeholderTextColor="#B7B7B7"
                  keyboardType="default"
                  autoCapitalize="none"
                  onChangeText={val => {
                    this.setState({
                      walletName: val,
                    });
                    this.ckeckWalletName(val);
                  }}
                />
              </View>
              <View
                style={{
                  flex: 0.5,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <Text
                  note
                  style={[FontFamily.ffFiraSansMedium, { textAlign: 'center' }]}
                >
                  In case you do not remember the name , please enter a name of
                  your choice.
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <FullLinearGradientButton
                  click_Done={() =>
                    this.props.click_Confirm(this.state.walletName)
                  }
                  title="Next"
                  disabled={flag_DisableBtnNext}
                  style={[
                    flag_DisableBtnNext == true
                      ? { opacity: 0.4 }
                      : { opacity: 1 },
                    { borderRadius: 10 },
                  ]}
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  viewModelBody: {
    flex: utils.getIphoneSize() == 'iphone X' ? 0.6 : 0.8,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
