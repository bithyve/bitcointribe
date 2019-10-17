import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Clipboard,
  Alert,
} from 'react-native';
import {
  Container,
  Header,
  Title,
  Input,
  Button,
  Left,
  Right,
  Body,
  Text,
  Picker,
  Icon,
} from 'native-base';
import { SvgIcon } from '@up-shared/components';
import IconFontAwe from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import QRCode from 'react-native-qrcode-svg';
// import QRCode from 'react-native-qrcode';
import Share from 'react-native-share';

// TODO: Custome Pages
import { CustomStatusBar } from 'hexaCustStatusBar';
import { HeaderTitle } from 'hexaCustHeader';
import { ModelLoader } from 'hexaLoader';
import { FullLinearGradientIconWithLoadingButton } from 'hexaCustomeLinearGradientButton';

// TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { colors, images } from 'hexaConstants';

const alert = new AlertSimple();
const utils = require('hexaUtils');

// TODO: Common Funciton
const comFunDBRead = require('hexaCommonDBReadData');

// TODO: Bitcoin class
const bitcoinClassState = require('hexaClassState');

export default class ReceivePayment extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      arr_AccountList: [],
      accountName: '',
      accountAddress: '',
      amount: '',
      base64string1: '',
      qrcodeAddresWithAmount: 'hexa',
      flag_Loading: true,
      flag_LoadingShareBtn: false,
    };
  }

  async componentWillMount() {
    const selectedAccount = this.props.navigation.getParam('selectedAccount');
    const walletDetails = await utils.getWalletDetails();
    // console.log( { walletDetails } );
    const arr_AccountList = await comFunDBRead.readTblAccount();
    // console.log( { arr_AccountList } );
    const regularAccount = await bitcoinClassState.getRegularClassState();
    let address = await regularAccount.getAddress();
    if (address.status == 200) {
      address = address.data;
    } else {
      alert.simpleOk('Oops', address.err);
    }
    // var paymentQRCode = await this.getQrCode( address.address );
    // console.log( { arr_AccountList } );
    this.setState({
      flag_Loading: false,
      arr_AccountList,
      accountName: arr_AccountList[0].accountName,
      accountAddress: address.address,
      qrcodeAddresWithAmount: address.address.toString(),
    });
  }

  // Dropdown select account name
  onValueChange = async (value: string) => {
    this.setState({
      flag_Loading: true,
    });
    const regularAccount = await bitcoinClassState.getRegularClassState();
    const secureAccount = await bitcoinClassState.getSecureClassState();
    let address;
    if (value == 'Daily Wallet') {
      address = await regularAccount.getAddress();
      if (address.status == 200) {
        address = address.data;
      } else {
        alert.simpleOk('Oops', address.err);
      }
    } else {
      address = await secureAccount.getAddress();
      if (address.status == 200) {
        address = address.data;
      } else {
        alert.simpleOk('Oops', address.err);
      }
    }
    this.setState({
      flag_Loading: false,
      accountName: value,
      amount: '',
      accountAddress: address.address,
      qrcodeAddresWithAmount: address.address.toString(),
    });
  };

  // get only address qrcode string
  getQrCode = async (address: any, option?: any) => {
    const regularAccount = await bitcoinClassState.getRegularClassState();
    // console.log( regularAccount );
    let resPaymentURI = await regularAccount.getPaymentURI(address, option);
    if (resPaymentURI.status == 200) {
      await bitcoinClassState.setRegularClassState(regularAccount);
      resPaymentURI = resPaymentURI.data;
    } else {
      alert.simpleOk('Oops', resPaymentURI.err);
    }
    return resPaymentURI;
  };

  // amount change then get qrcode string
  getQrCodeWithAmount = async () => {
    const address = this.state.accountAddress;
    const { amount } = this.state;
    // console.log( { amount, address } );
    const options = {
      amount,
    };
    let getQRCodeString;
    if (amount != '') {
      getQRCodeString = await this.getQrCode(address, options);
    } else {
      getQRCodeString = await this.getQrCode(address);
    }
    // console.log( { getQRCodeString } );
    this.setState({
      qrcodeAddresWithAmount: getQRCodeString.paymentURI.toString(),
    });
  };

  base64string1 = (base64string1: any) => {
    this.setState({
      base64string1,
    });
  };

  // share qrcode image
  click_ShareAddress = async () => {
    const { qrcodeAddresWithAmount } = this.state;
    // this.setState( {
    //     flag_LoadingShareBtn: true
    // } )
    // this.svg1.toDataURL( this.base64string1 );
    // setTimeout( async () => {
    //     let qrcodeBase64 = this.state.base64string1;
    //     console.log( { qrcodeBase64 } );
    //     let accountName = this.state.accountName;
    //     var docsDir;
    //     if ( Platform.OS == "android" ) {
    //         docsDir = await RNFS.ExternalStorageDirectoryPath //;
    //     } else {
    //         docsDir = await RNFS.DocumentDirectoryPath;
    //     }
    //     console.log( { docsDir } );
    //     docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
    //     var path = `${ docsDir }/paymentRequestQRCode.png`;
    //     RNFS.writeFile( path, qrcodeBase64, "base64" )
    //         .then( ( success: any ) => {
    //             this.setState( {
    //                 flag_LoadingShareBtn: false
    //             } )
    //             const shareOptions = {
    //                 title: 'Hexa App',
    //                 message: "This is " + accountName + " qrcode",
    //                 url: path
    //             };
    //             Share.open( shareOptions );
    //         } )
    //         .catch( ( err: any ) => {
    //             alert.simpleOk( "Oops", err );
    //         } )
    // }, 2000 );

    const shareOptions = {
      title: 'Payment Address',
      message: qrcodeAddresWithAmount,
      url: 'https://hexawallet.io',
    };
    Share.open(shareOptions)
      .then((res: any) => {
        Alert.alert('address send');
      })
      .catch((err: any) => {
        err && console.log(err);
      });
  };

  render() {
    // array
    const { arr_AccountList } = this.state;
    // values
    const { accountName, qrcodeAddresWithAmount, amount } = this.state;
    // flag
    const { flag_Loading, flag_LoadingShareBtn } = this.state;
    const itemList = arr_AccountList.map((item: any, index: number) => (
      <Picker.Item label={item.accountName} value={item.accountName} />
    ));
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle
            title="Receive"
            pop={() => this.props.navigation.pop()}
          />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={true}
              keyboardOpeningTime={0}
              enableOnAndroid={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <View style={styles.itemQuestionPicker}>
                  <Picker
                    renderHeader={backAction => (
                      <Header
                        style={{
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <Left>
                          <Button transparent onPress={backAction}>
                            <Icon
                              name="arrow-back"
                              style={{
                                color: '#000',
                              }}
                            />
                          </Button>
                        </Left>
                        <Body style={{ flex: 3 }}>
                          <Title
                            style={[
                              FontFamily.ffFiraSansMedium,
                              { color: '#000' },
                            ]}
                          >
                            Select Account
                          </Title>
                        </Body>
                        <Right />
                      </Header>
                    )}
                    mode="dropdown"
                    style={[FontFamily.ffFiraSansMedium]}
                    iosIcon={
                      <Icon
                        name="arrow-down"
                        style={{
                          fontSize: 30,
                          marginLeft: -10,
                        }}
                      />
                    }
                    selectedValue={accountName}
                    onValueChange={(item: any) => this.onValueChange(item)}
                  >
                    {itemList}
                  </Picker>
                </View>
                <View style={styles.itemQuestionPicker}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <SvgIcon
                      name="icon_bitcoin"
                      color="#D0D0D0"
                      size={25}
                      style={{
                        flex: 0.1,
                        marginLeft: 10,
                      }}
                    />
                    <Input
                      value={amount}
                      keyboardType="numeric"
                      placeholder="Amount Sats"
                      placeholderTextColor="#D0D0D0"
                      returnKeyType="done"
                      onChangeText={val => {
                        this.setState({
                          amount: val,
                        });
                        setTimeout(() => {
                          this.getQrCodeWithAmount();
                        }, 100);
                      }}
                      style={[
                        FontFamily.ffOpenSansBold,
                        { flex: 1, fontSize: 18 },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <QRCode
                  value={qrcodeAddresWithAmount}
                  getRef={c => (this.svg1 = c)}
                  size={Dimensions.get('screen').width - 120}
                />
                <View style={{ flexDirection: 'row', margin: 10 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 0.9,
                      color: '#1378B7',
                      textAlign: 'center',
                      marginLeft: 10,
                    }}
                  >
                    {`${qrcodeAddresWithAmount}  `}{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Clipboard.setString(qrcodeAddresWithAmount);
                      Alert.alert('address copied');
                    }}
                  >
                    <IconFontAwe name="copy" size={20} color="#2F2F2F" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text note style={{ textAlign: 'center', margin: 5 }}>
                  Share this address to receive funds
                </Text>
                <FullLinearGradientIconWithLoadingButton
                  click_Done={() => this.click_ShareAddress()}
                  title="Share"
                  iconName="share"
                  iconColor={'#ffffff'}
                  iconSize={20}
                  disabled={flag_LoadingShareBtn}
                  animating={flag_LoadingShareBtn}
                  style={[{ borderRadius: 10, margin: 10 }]}
                />
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <ModelLoader loading={flag_Loading} color={colors.appColor} size={30} />
        <CustomStatusBar
          backgroundColor={colors.white}
          hidden={false}
          barStyle="dark-content"
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemQuestionPicker: {
    width: Dimensions.get('screen').width / 1.07,
    borderWidth: Platform.OS == 'ios' ? 0 : 0.1,
    borderRadius: 10,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    height: 60,
  },
});
