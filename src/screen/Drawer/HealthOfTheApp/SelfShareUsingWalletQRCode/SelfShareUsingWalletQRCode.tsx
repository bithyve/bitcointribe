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
//  import QRCode from "react-native-qrcode";
import QRCode from 'react-native-qrcode-svg';

// TODO: Custome Pages
import { StatusBar } from 'hexaComponent/StatusBar';
import { HeaderTitle } from 'hexaComponent/Header';

// TODO: Custome Pages
import { ModelLoader } from 'hexaComponent/Loader';

// TODO: Custome Alert
import { AlertSimple } from 'hexaComponent/Alert';
let alert = new AlertSimple();

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaComponent/Styles/FontFamily';

// TODO: Custome Object
import { colors, images, localDB } from 'hexaConstants';
var utils = require('hexaUtils');
var dbOpration = require('hexaDBOpration');

// TODO: Bitcoin class
var bitcoinClassState = require('hexaClassState');

// TODO: Common Funciton
var comFunDBRead = require('hexaCommonDBReadData');

export default class SelfShareUsingWalletQRCode extends React.Component<
  any,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      arrShareDetials: [],
      flag_Loading: true,
    };
  }

  async componentWillMount() {
    let data = this.props.navigation.getParam('data');
    // console.log( { data } );

    let walletDetails = utils.getWalletDetails();
    const sss = await bitcoinClassState.getS3ServiceClassState();
    var resGenerateEncryptedMetaShare = await sss.generateEncryptedMetaShare(
      JSON.parse(data.decryptedShare),
    );
    // console.log( { resGenerateEncryptedMetaShare } );
    if (resGenerateEncryptedMetaShare.status == 200) {
      resGenerateEncryptedMetaShare = resGenerateEncryptedMetaShare.data;
    } else {
      alert.simpleOk('Oops', resGenerateEncryptedMetaShare.err);
    }
    const resUploadShare = await sss.uploadShare(
      resGenerateEncryptedMetaShare.encryptedMetaShare,
      resGenerateEncryptedMetaShare.messageId,
    );
    //  console.log( { resUploadShare } );
    if (resUploadShare.status == 200) {
      await bitcoinClassState.setS3ServiceClassState(sss);
      let qrCodeData = {};
      qrCodeData.type = 'Self Share';
      qrCodeData.wn = walletDetails.walletType;
      qrCodeData.data = resGenerateEncryptedMetaShare.key;
      this.setState(
        {
          arrShareDetials: data,
          flag_Loading: false,
          data: JSON.stringify(qrCodeData).toString(),
        },
        () => {
          this.updateSharedDate();
        },
      );
    } else {
      alert.simpleOk('Oops', resUploadShare.err);
    }
  }

  updateSharedDate = async () => {
    let { arrShareDetials } = this.state;
    const dateTime = Date.now();
    await dbOpration.updateHistroyAndSharedDate(
      localDB.tableName.tblSSSDetails,
      'Shared',
      dateTime,
      arrShareDetials.id,
    );
  };

  goBack = async () => {
    await comFunDBRead.readTblSSSDetails();
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onSelect({ selected: true });
  };

  render() {
    // flag
    let { flag_Loading } = this.state;
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle title="Share via QR" pop={() => this.goBack()} />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={40}>
              <View style={{ flex: 0.1, margin: 20 }}>
                <Text
                  note
                  style={[FontFamily.ffFiraSansMedium, { textAlign: 'center' }]}
                >
                  Present this QR code to your secondary device to hold this
                  secret for safekeeping
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
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
                  Do not share this QR code with anyone other than the secoundry
                  device, whom you want to share the secret with
                </Text>
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <ModelLoader
          loading={flag_Loading}
          color={colors.appColor}
          size={30}
          message="Making QRCode"
        />
        <StatusBar
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
  },
});
