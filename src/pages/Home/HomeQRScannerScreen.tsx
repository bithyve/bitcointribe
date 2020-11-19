import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomInfoBox from '../../components/BottomInfoBox';
import getFormattedStringFromQRString from '../../utils/qr-codes/GetFormattedStringFromQRData';
import ListStyles from '../../common/Styles/ListStyles';
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner';

// TODO: The patterns here are meant to be the starting point for the way other
// other screens that render QRCode scanners should lay out their components and
// handle actions from the scanning.

export type Props = {
  navigation: any;
};

const HeaderSection: React.FC = () => {
  return (
    <View style={ListStyles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderText}>
        Scan a Bitcoin address or any Hexa QR
      </Text>
    </View>
  );
}

const HomeQRScannerScreen: React.FC<Props> = ({
  navigation,
}: Props) => {

  function handleBarcodeRecognized({ data: dataString }: { data: string }) {
    const onCodeScanned = navigation.getParam('onCodeScanned');
    if (typeof onCodeScanned === 'function') {
      let data = getFormattedStringFromQRString(dataString);
      onCodeScanned(data);
    }

    navigation.goBack();
  }

  return (
    <View style={styles.rootContainer}>
      <HeaderSection />

      <CoveredQRCodeScanner onCodeScanned={handleBarcodeRecognized} />

      <BottomInfoBox
        style
        title="What can you scan?"
        infoText="
          Scan a bitcoin address, a Hexa Friends and Family request, a Hexa Keeper request, or a restore request
        "
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },

  // scannerContainer: {
  //   alignSelf: 'center',
  //   marginBottom: 16,
  //   width: widthPercentageToDP(90),
  //   height: widthPercentageToDP(90),
  // },
});

export default HomeQRScannerScreen;
