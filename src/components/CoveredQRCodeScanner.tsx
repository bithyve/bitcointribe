import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { RNCamera } from 'react-native-camera';

export type Props = {
  containerStyle?: Record<string, unknown>;
  coverImageSource?: NodeRequire;
  onCodeScanned: (scanEvent) => void;
};

// TODO: Make the styling here a bit more readable 🙂.
const CameraFrameIndicators: React.FC = () => {
  return (
    <>
      <View
        style={{ flexDirection: 'row', paddingTop: 12, paddingRight: 12, paddingLeft: 12, width: '100%' }}
      >
        <View style={{ borderLeftWidth: 1, borderTopColor: 'white', borderLeftColor: 'white', height: heightPercentageToDP('5%'), width: heightPercentageToDP('5%'), borderTopWidth: 1 }} />

        <View style={{ borderTopWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderTopColor: 'white', height: heightPercentageToDP('5%'), width: heightPercentageToDP('5%'), marginLeft: 'auto' }} />
      </View>

      <View style={{ marginTop: 'auto', flexDirection: 'row', paddingBottom: 12, paddingRight: 12, paddingLeft: 12, width: '100%', }}>

        <View style={{ borderLeftWidth: 1, borderBottomColor: 'white', borderLeftColor: 'white', height: heightPercentageToDP('5%'), width: heightPercentageToDP('5%'), borderBottomWidth: 1 }} />

        <View style={{ borderBottomWidth: 1, borderRightWidth: 1, borderRightColor: 'white', borderBottomColor: 'white', height: heightPercentageToDP('5%'), width: heightPercentageToDP('5%'), marginLeft: 'auto' }} />
      </View>
    </>
  );
};

const CoveredQRCodeScanner: React.FC<Props> = ({
  containerStyle = {},
  coverImageSource = require('../assets/images/icons/iPhone-QR.png'),
  onCodeScanned,
}: Props) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const CameraCover: React.FC = () => {
    return (
      <TouchableOpacity onPress={() => setIsCameraOpen(true)} >
        <ImageBackground
          source={coverImageSource}
          style={{ ...styles.rootContainer, ...containerStyle }}
        >
          <CameraFrameIndicators />
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const Scanner: React.FC = () => {
    const cameraRef = useRef<RNCamera>();

    return (
      <View style={{ ...styles.rootContainer, ...containerStyle }}>
        <RNCamera
          ref={cameraRef}
          style={{
            flex: 1,
          }}
          onBarCodeRead={onCodeScanned}
          captureAudio={false}
        >
          <CameraFrameIndicators />
        </RNCamera>
      </View>
    );
  };

  if (isCameraOpen) {
    return <Scanner />;
  } else {
    return <CameraCover />;
  }
};

const styles = StyleSheet.create({
  rootContainer: {
    overflow: 'hidden',
    borderRadius: 20,
  },
});

export default CoveredQRCodeScanner;
