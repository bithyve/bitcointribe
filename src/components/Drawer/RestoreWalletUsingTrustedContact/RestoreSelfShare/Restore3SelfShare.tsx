import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  SafeAreaView,
  Image,
} from 'react-native';
import { Container, Text } from 'native-base';

// TODO: Custome Pages
import { CustomStatusBar } from 'hexaCustStatusBar';
import { HeaderTitle } from 'hexaCustHeader';
import { ModelLoader } from 'hexaLoader';
import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { colors, images } from 'hexaConstants';
import { renderIf } from 'hexaValidation';

export default class Restore3SelfShare extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      title: 'Share',
      arr_History: [],
      flag_ScanBtnDisable: true,
    };
  }

  async componentWillMount() {
    const data = this.props.navigation.getParam('data');
    const title = this.props.navigation.getParam('title');
    const flag_ScanBtnDisable = true;
    console.log({ data });
    this.setState({
      title,
      flag_ScanBtnDisable,
      data,
    });
  }

  // TODO: Sharing
  click_QRCode(data: any) {
    this.props.navigation.push('Restore3SelfSahreQRCodeScanner');
  }

  // TODO: Re-Share Share

  render() {
    // array
    const { data, arr_History } = this.state;
    // Value
    const { title } = this.state;
    // flag
    const { flag_ScanBtnDisable } = this.state;
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle title={title} pop={() => this.props.navigation.pop()} />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <View style={{ flex: 0.1, padding: 20 }}>
              <Text
                numberOfLines={2}
                note
                style={[FontFamily.ffFiraSansMedium, { textAlign: 'center' }]}
              >
                Please sacn self share.
              </Text>
            </View>
            <View
              style={{
                flex: 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                style={[styles.imgAppLogo, { borderRadius: 10 }]}
                source={
                  images.RestoreWalletUsingTrustedContact
                    .share4and5SelfShareInfo
                }
              />
            </View>
            {renderIf(flag_ScanBtnDisable == true)(
              <View style={{ flex: 0.3 }}>
                <FullLinearGradientButton
                  click_Done={() => {
                    this.click_QRCode(data);
                  }}
                  title="Scan QRCode"
                  disabled={false}
                  style={[{ borderRadius: 10 }]}
                />
              </View>,
            )}
          </SafeAreaView>
        </ImageBackground>
        <ModelLoader
          loading={this.state.flag_Loading}
          color={colors.appColor}
          size={30}
          message={this.state.msg_Loading}
        />
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
  // botom model
  modal: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modal4: {
    height: 180,
  },
  imgAppLogo: {
    width: '90%',
    height: '95%',
  },
});
