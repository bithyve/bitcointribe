import React from "react";
import { StyleSheet, Alert, AsyncStorage } from "react-native";
import { Container, Content } from "native-base";
import BarcodeScanner from "react-native-barcode-scanners";

export default class QrcodeScannerScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      address: ""
    };
  }

  //TODO: Page life Cycle
  async componentWillUnmount() {
    try {
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
    } catch (error) {
      console.log(error);
    }
  }

  onReadBarCodeByGalleryFailure() {
    Alert.alert("Note", "Not found barcode!");
  }

  onBarCodeRead(res: any) {
    try {
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
      const { navigation } = this.props;
      navigation.goBack();
      navigation.state.params.onSelect({ barcode: res.data });
    } catch (error) {
      console.log(error);
    }
  }

  onBarCodeReadByGalleryStart(res: any) {
    console.log("read data from gallery");
    console.log({ res });
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.container}>
          <BarcodeScanner
            Title={"QRCode Scanner"}
            styles={styles.barcodeScanner}
            cameraProps={{ captureAudio: false }}
            onBack={() => this.props.navigation.goBack()}
            onBarCodeReadByGalleryStart={data =>
              this.onBarCodeReadByGalleryStart.call(this, data)
            }
            onReadBarCodeByGalleryFailure={() =>
              this.onReadBarCodeByGalleryFailure.call(this)
            }
            onBarCodeRead={data => this.onBarCodeRead.call(this, data)}
          />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20
  },
  barcodeScanner: {}
});
