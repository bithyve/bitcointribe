import React, { Component } from 'react';
import { Modal, View, StyleSheet, Dimensions, Image } from 'react-native';
import { Input, Button, Text } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';

import { SvgIcon } from '@up-shared/components';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { images, colors } from 'hexaConstants';
import { renderIf } from 'hexaValidation';

interface Props {
  data: [];
  closeModal: Function;
  click_Next: Function;
  pop: Function;
  click_Request: Function;
}

export default class ModelHealthCheckMnemonicFirstWord extends Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      number: '',
      word: '',
      enterWord: '',
      wordBorderColor: '#EFEFEF',
      flag_DisableBtnNext: true,
    };
  }

  componentWillReceiveProps(nextProps: any) {
    // console.log( { nextProps } );
    const data = nextProps.data[0];
    // console.log( { data } );
    if (data != null) {
      this.setState({
        number: data.number,
        word: data.word,
      });
    }
  }

  // TODO: func check_CorrectAnswer
  check_CorrectWordLength() {
    setTimeout(() => {
      const { enterWord } = this.state;
      if (enterWord.length >= 3) {
        this.setState({
          flag_DisableBtnNext: false,
        });
      } else {
        this.setState({
          flag_DisableBtnNext: true,
          wordBorderColor: '#EFEFEF',
        });
      }
    }, 100);
  }

  click_Next() {
    const { enterWord, word } = this.state;
    if (enterWord == word) {
      this.props.click_Next();
    } else {
      this.setState({
        flag_DisableBtnNext: true,
        wordBorderColor: '#E64545',
      });
    }
  }

  render() {
    const {
      number,
      enterWord,
      wordBorderColor,
      flag_DisableBtnNext,
    } = this.state;
    return (
      <Modal
        transparent
        animationType={'fade'}
        visible={
          this.props.data.length != 0 ? this.props.data[0].modalVisible : false
        }
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
              <View style={{ flexDirection: 'row', flex: 0.5 }}>
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
                      flex: 5,
                      textAlign: 'center',
                      marginTop: 10,
                    },
                  ]}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Image
                  source={images.backupSecureTwoFactorAuto.icon}
                  style={{
                    width: 80,
                    height: 80,
                    marginTop: -30,
                  }}
                />
                <Text style={[FontFamily.ffFiraSansMedium, { fontSize: 20 }]}>
                  Health Check
                </Text>
                <Text
                  note
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      fontSize: 14,
                      margin: 10,
                      marginBottom: 20,
                    },
                  ]}
                >
                  Mnemonic
                </Text>
                <View style={styles.viewCodeInput}>
                  <Text
                    note
                    style={{
                      textAlign: 'center',
                      margin: 20,
                    }}
                  >
                    Enter the <Text>{number}</Text> word from the mnemonic.
                  </Text>
                  <Input
                    keyboardType="default"
                    autoCapitalize="none"
                    value={enterWord}
                    placeholder="word"
                    style={[
                      FontFamily.ffFiraSansMedium,
                      wordBorderColor == '#E64545'
                        ? {
                            borderColor: wordBorderColor,
                            borderWidth: 1.5,
                            borderRadius: 8,
                          }
                        : {
                            borderWidth: 0.6,
                            borderRadius: 8,
                          },
                      {
                        width: Dimensions.get('screen').width - 80,
                        height: 40,
                      },
                    ]}
                    placeholderTextColor="#B7B7B7"
                    onChangeText={val => {
                      this.setState({
                        enterWord: val,
                      });
                    }}
                    onKeyPress={() => this.check_CorrectWordLength()}
                  />
                  {renderIf(wordBorderColor == '#E64545')(
                    <Text
                      style={{
                        color: 'red',
                        fontSize: 12,
                        alignSelf: 'flex-end',
                        margin: 8,
                      }}
                    >
                      Invalid Word!
                    </Text>,
                  )}
                </View>
              </View>
              <View
                style={{
                  flex: 0.1,
                  justifyContent: 'flex-end',
                }}
              >
                <Text
                  note
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      textAlign: 'center',
                      fontSize: 12,
                      marginBottom: 20,
                    },
                  ]}
                >
                  Refer to the 12-24 word mnemonic that you noted down while
                  backing up your wallet.
                </Text>
                <FullLinearGradientButton
                  click_Done={() => {
                    this.click_Next();
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
    flex: 0.7,
    margin: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  viewCodeInput: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
