import React, { Component } from 'react';
import { Modal, View, Alert, StyleSheet } from 'react-native';
import { Button, Text, Textarea } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { SvgIcon } from '@up-shared/components';

// TODO: Custome Compontes
import { FullLinearGradientLoadingButton } from 'hexaCustomeLinearGradientButton';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { renderIf } from 'hexaValidation';

const utils = require('hexaUtils');

interface Props {
  data: [];
  closeModal: Function;
  click_Confirm: Function;
  pop: Function;
  loadingFlag: Function;
}

export default class ModelEnterAndConfirmMnemonic extends Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      mnemonic: null,
      style_TextAreaBorderColor: '#EFEFEF',
      flag_DisableBtnConfirm: true,
      flag_ConfirmBtnAnimating: false,
      flag_Loading: false,
    };
  }

  mnemonicCheck(val: any) {
    const words = val.trim();
    const lengthString = this.WordCount(words);
    if (lengthString.length >= 12 && lengthString.length <= 24) {
      this.setState({
        flag_DisableBtnConfirm: false,
        mnemonic: val,
      });
    } else {
      this.setState({
        flag_DisableBtnConfirm: true,
        mnemonic: val,
      });
    }
  }

  WordCount(str: string) {
    return str.split(' ');
  }

  // TODO: Confirm Button  click
  click_Confirm = async () => {
    try {
      this.props.loadingFlag(true);
      this.setState({
        flag_DisableBtnConfirm: true,
        flag_ConfirmBtnAnimating: true,
      });
      const { mnemonic } = this.state;
      const regularAccount = await utils.getRegularAccountObject();
      const getBal = await regularAccount.getBalance();
      // console.log( { getBal } );

      if (getBal.status == 200) {
        const bal = getBal.data.balance;
        this.props.click_Confirm(mnemonic, bal);
        this.props.loadingFlag(false);
        this.setState({
          flag_DisableBtnConfirm: true,
          flag_ConfirmBtnAnimating: false,
        });
      } else {
        Alert.alert('GetBalance and mnemonic wrong.');
      }
      // console.log( { getBal } );
    } catch (error) {
      this.setState({
        style_TextAreaBorderColor: 'red',
        flag_DisableBtnConfirm: false,
        flag_ConfirmBtnAnimating: false,
      });
      // console.log( { error } );
    }
  };

  render() {
    const data = this.props.data.length != 0 ? this.props.data : [];
    const { flag_DisableBtnConfirm } = this.state;
    const { flag_ConfirmBtnAnimating } = this.state;

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
                  Enter the Passphrase
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
                  Enter the mnemonic in the order that you noted at the time of
                  setting up your wallet. In case of any typo the wallet
                  restoration will fail
                </Text>
              </View>
              <View
                style={{
                  flex: 2,
                }}
              >
                <Textarea
                  value={this.state.mnemonic}
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      borderRadius: 8,
                      justifyContent: 'center',
                      borderColor: this.state.style_TextAreaBorderColor,
                    },
                  ]}
                  rowSpan={8}
                  bordered
                  placeholder="Enter the words of passphrase in order"
                  placeholderTextColor="#B7B7B7"
                  keyboardType="default"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoCorrect={false}
                  onChangeText={val => {
                    this.mnemonicCheck(val);
                  }}
                />
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    note
                    style={{
                      alignSelf: 'flex-start',
                      flex: 3,
                    }}
                  >
                    e.g:q w e r t y u i o p a s
                  </Text>
                  {renderIf(this.state.style_TextAreaBorderColor == 'red')(
                    <Text
                      note
                      style={{
                        color: 'red',
                        alignSelf: 'flex-end',
                      }}
                    >
                      Invalid Passphrase
                    </Text>,
                  )}
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <FullLinearGradientLoadingButton
                  click_Done={() => this.click_Confirm()}
                  title="  Confirm & Proceed"
                  disabled={flag_DisableBtnConfirm}
                  animating={flag_ConfirmBtnAnimating}
                  style={[
                    flag_DisableBtnConfirm == true
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
