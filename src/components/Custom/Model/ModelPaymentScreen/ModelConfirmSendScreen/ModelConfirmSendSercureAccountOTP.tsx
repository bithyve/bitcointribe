import React, { Component } from 'react';
import { Modal, View, StyleSheet, Platform } from 'react-native';
import { Button, Text, Icon } from 'native-base';
import CodeInput from 'react-native-confirmation-code-input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { FullLinearGradientLoadingButton } from 'hexaCustomeLinearGradientButton';

//TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

//TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';
let alert = new AlertSimple();

//TODO: Custome Object
import { colors } from 'hexaConstants';
import { renderIf } from 'hexaValidation';

//TODO: Bitcoin class
var bitcoinClassState = require('hexaClassState');

interface Props {
  data: [];
  closeModal: Function;
  click_Next: Function;
  pop: Function;
  click_Request: Function;
}

export default class ModelConfirmSendSercureAccountOTP extends Component<
  Props,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      resTransferST: [],
      secret: '',
      enterSecret: '',
      token: '',
      message: 'First three letter your secure account secret for the PDF',
      passcodeStyle: [
        {
          activeColor: colors.black,
          inactiveColor: colors.black,
          cellBorderWidth: 0,
        },
      ],
      success: 'Secret does not match!',
      flag_DisableBtnNext: true,
      flag_NextBtnAnimation: false,
    };
  }

  componentWillReceiveProps(nextProps: any) {
    var data = nextProps.data[0];
    //console.log( { data } );
    if (data != undefined) {
      if (Array.isArray(data.data)) {
        data = data.data[0];
        this.setState({
          data: data.data,
          resTransferST: data.resTransferST,
        });
      }
    }
  }

  //TODO: Otp enter after
  _onFinishCheckingCode = async (code: any) => {
    this.setState({
      token: code,
      flag_DisableBtnNext: false,
    });

    // this.setState( {
    //     passcodeStyle: [
    //         {
    //             activeColor: "red",
    //             inactiveColor: "red",
    //             cellBorderWidth: 1
    //         }
    //     ],
    //     flag_DisableBtnNext: true
    // } );
  };

  click_StopLoader = () => {
    this.setState({
      flag_NextBtnAnimation: false,
      flag_DisableBtnNext: false,
    });
  };

  click_Next = async () => {
    this.setState({
      flag_NextBtnAnimation: true,
      flag_DisableBtnNext: true,
    });
    let { data, token, resTransferST } = this.state;
    let secureAccount = await bitcoinClassState.getSecureClassState();
    //console.log( { token, txHex: resTransferST.data.txHex } );
    var resultTransferST = await secureAccount.transferST3(
      token,
      resTransferST.data.txHex,
      resTransferST.data.childIndexArray,
    );
    //console.log( { resultTransferST } );
    if (resultTransferST.status == 200) {
      resultTransferST = resultTransferST.data;
      this.click_StopLoader();
      this.props.click_Next(resultTransferST);
    } else {
      alert.simpleOkAction('Oops', resultTransferST.err, this.click_StopLoader);
    }
  };

  render() {
    let { passcodeStyle, flag_DisableBtnNext, message, otp } = this.state;
    //flag
    let { flag_NextBtnAnimation } = this.state;
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
              <View style={{ flexDirection: 'row', flex: 0.4 }}>
                <Text
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      fontSize: 20,
                      color: '#2F2F2F',
                      flex: 6,
                      textAlign: 'center',
                      marginTop: 10,
                    },
                  ]}
                >
                  Enter 6 digit code
                </Text>
                <Button
                  light
                  iconLeft
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                  onPress={() => this.props.closeModal()}
                >
                  <Icon name="close" style={{ alignSelf: 'center' }} />
                </Button>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Text note style={{ textAlign: 'center' }}>
                  Scan the 2FA QR code in Google Authenticator App and enter the
                  generated code for your Hexa Wallet
                </Text>
                <View style={styles.viewCodeInput}>
                  <CodeInput
                    ref="codeInputRef1"
                    secureTextEntry
                    keyboardType="numeric"
                    autoCapitalize="sentences"
                    codeLength={6}
                    activeColor={passcodeStyle[0].activeColor}
                    inactiveColor={passcodeStyle[0].inactiveColor}
                    className="border-box"
                    cellBorderWidth={passcodeStyle[0].cellBorderWidth}
                    autoFocus={false}
                    inputPosition="center"
                    space={5}
                    size={47}
                    codeInputStyle={{
                      borderRadius: 5,
                      backgroundColor: '#F1F1F1',
                    }}
                    containerStyle={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: Platform.OS == 'ios' ? 0 : 40,
                    }}
                    onFulfill={(code: any) => this._onFinishCheckingCode(code)}
                    type="numeric"
                  />
                  {renderIf(passcodeStyle[0].activeColor == 'red')(
                    <Text
                      style={[
                        FontFamily.ffFiraSansBookItalic,
                        { color: 'red', marginTop: 5 },
                      ]}
                    >
                      {this.state.success}
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
                  For security reasons please setup the Google Authenticator on
                  another device.
                </Text>
                <FullLinearGradientLoadingButton
                  click_Done={() => {
                    this.click_Next();
                  }}
                  title=" Next"
                  disabled={flag_DisableBtnNext}
                  animating={flag_NextBtnAnimation}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
