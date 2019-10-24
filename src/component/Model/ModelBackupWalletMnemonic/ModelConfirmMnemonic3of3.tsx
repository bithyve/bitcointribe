import React, { Component } from 'react';
import { Modal, View, StyleSheet, TextInput } from 'react-native';
import { Button, Text } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { FullLinearGradientButton } from 'hexaComponent/LinearGradient/Buttons';
import { SvgIcon } from 'hexaComponent/Icons';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaComponent/Styles/FontFamily';
import { renderIf } from 'hexaValidation';

// TODO: Custome Object
var utils = require('hexaUtils');

interface Props {
  data: [];
  closeModal: Function;
  click_Next: Function;
  pop: Function;
}

export default class ModelConfirmMnemonic3of3 extends Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      enterWrod: null,
      flag_DisableBtnNext: true,
      textBorderColor: '#EFEFEF',
    };
  }

  // TODO: Wallet Name
  ckeckWalletName(val: string) {
    if (val.length >= 3) {
      this.setState({
        flag_DisableBtnNext: false,
      });
    } else if (val.length < 1) {
      this.setState({
        flag_DisableBtnNext: true,
        textBorderColor: '#EFEFEF',
      });
    } else {
      this.setState({
        flag_DisableBtnNext: true,
      });
    }
  }

  render() {
    let data = this.props.data.length != 0 ? this.props.data : [];
    let number = this.props.data.length != 0 ? this.props.data[0].number : '';
    let word = this.props.data.length != 0 ? this.props.data[0].word : '';
    let textBorderColor = this.state.textBorderColor;
    let flag_DisableBtnNext = this.state.flag_DisableBtnNext;
    let enterWrod = this.state.enterWrod;
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
                  hitSlop={{ top: 5, bottom: 8, left: 10, right: 15 }}
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
                  Confirm Mnemonic
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                  }}
                >
                  <Text note style={{ fontSize: 32 }}>
                    {' '}
                    3{' '}
                  </Text>
                  <Text note style={{ fontSize: 24 }}>
                    {' '}
                    of{' '}
                  </Text>
                  <Text note style={{ fontSize: 32 }}>
                    {' '}
                    3{' '}
                  </Text>
                </View>
                <Text
                  note
                  style={[
                    FontFamily.ffFiraSansMedium,
                    { textAlign: 'center', marginTop: 20 },
                  ]}
                >
                  Enter the <Text>{number}</Text> word from the mnemonic
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <TextInput
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      borderRadius: 8,
                      justifyContent: 'center',
                      borderColor: textBorderColor,
                      borderWidth: 1,
                      height: 60,
                      textAlign: 'center',
                    },
                  ]}
                  value={this.state.enterWrod}
                  placeholder="Enter word"
                  placeholderTextColor="#B7B7B7"
                  keyboardType="default"
                  autoCapitalize="none"
                  onChangeText={val => {
                    this.setState({
                      enterWrod: val,
                    });
                    this.ckeckWalletName(val);
                  }}
                />
                {renderIf(textBorderColor == 'red')(
                  <Text note style={{ color: 'red', alignSelf: 'flex-end' }}>
                    Invalid word!
                  </Text>,
                )}
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
                  Refer to the mnemonic you wrote down in the previous steps
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <FullLinearGradientButton
                  click_Done={() => {
                    if (enterWrod == word) {
                      this.props.click_Next();
                    } else {
                      this.setState({
                        textBorderColor: 'red',
                      });
                    }
                  }}
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
    flex: utils.getIphoneSize() == 'iphone X' ? 0.5 : 0.7,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
});
