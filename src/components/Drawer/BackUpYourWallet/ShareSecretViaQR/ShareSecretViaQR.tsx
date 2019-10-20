import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Container, Text } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import QRCode from "react-native-qrcode";
import QRCode from 'react-native-qrcode-svg';

// TODO: Custome Pages
import { CustomStatusBar } from 'hexaCustStatusBar';
import { HeaderTitle } from 'hexaCustHeader';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { colors, images } from 'hexaConstants';

const utils = require('hexaUtils');

export default class ShareSecretViaQR extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      flag_Loading: false,
      msg_Loading: 'Loading',
    };
  }

  async UNSAFE_componentWillMount() {
    const walletDetails = utils.getWalletDetails();
    const data = this.props.navigation.getParam('data');
    // console.log( { data } );
    const qrCodeData = {};
    qrCodeData.type = 'SSS Recovery QR';
    qrCodeData.wn = walletDetails.walletType;
    qrCodeData.data = data.key;
    // console.log( { qrCodeData } );
    this.setState({
      data: JSON.stringify(qrCodeData).toString(),
    });
  }

  // TODO: func click_Item
  click_Item = (item: any) => {
    this.props.navigation.push('TrustedContact', {
      data: item,
    });
  };

  goBack() {
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onSelect({ selected: true });
  }

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle title="Share Secret via QR" pop={() => this.goBack()} />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={40}>
              <View style={{ flex: 0.1, margin: 20 }}>
                <Text
                  note
                  style={[FontFamily.ffFiraSansMedium, { textAlign: 'center' }]}
                >
                  Present this QR code to trusted contact to hold this secret
                  for safekeeping{' '}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {/* <QRCode
                                    ref="qrcodeView"
                                    value={ this.state.data }
                                    size={ Dimensions.get( "screen" ).width - 70 }
                                    bgColor="black"
                                    fgColor="white"
                                    style={ { width: "100%", height: "100%" } }
                                /> */}
                <QRCode
                  value={this.state.data}
                  size={Dimensions.get('screen').width - 50}
                />
              </View>
              <View style={{ flex: 0.5, alignItems: 'center' }}>
                <Text
                  note
                  style={[
                    FontFamily.ffFiraSansMedium,
                    { textAlign: 'center', margin: 10 },
                  ]}
                >
                  Do not share this QR code with anyone other than the trusted
                  contact whom you want to share the secret with{' '}
                </Text>
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <CustomStatusBar
          backgroundColor={colors.white}
          hidden={false}
          barStyle="dark-content"
        />
      </Container>
    );
  }
}

const primaryColor = colors.appColor;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
});
