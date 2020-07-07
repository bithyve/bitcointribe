import React, { memo, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RNCamera } from 'react-native-camera';

function QRCodeThumbnail(props) {
  const [openCameraFlag, setOpenCameraFlag] = useState(false);
  console.log('QRCodeThumbnail', props.isOpenCameraFlag);
  const barcodeRecognized = async (barcodes) => {
    if (barcodes.data) {
      setTimeout(() => {
        setOpenCameraFlag(false);
      }, 2);
      props.onQrScan(barcodes);
    }
  };

  return (
    <View style={styles.modalContentContainer}>
    {openCameraFlag ?  
      (<View style={{ justifyContent: 'center', alignItems: 'center' }}>
    <View style={styles.cameraView}>
      <RNCamera
        ref={(ref) => {
          this.cameraRef = ref;
        }}
        style={styles.camera}
        onBarCodeRead={barcodeRecognized}
        captureAudio={false}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.topCornerView}>
            <View style={styles.topLeftCornerView} />
            <View style={styles.topRightCornerView} />
          </View>
          <View style={styles.bottomCornerView}>
            <View style={styles.bottomLeftCornerView} />
            <View style={styles.bottomRightCornerView} />
          </View>
        </View>
      </RNCamera>
    </View>
  </View>) : 
    (<TouchableOpacity
      style={{ justifyContent: 'center', alignItems: 'center' }}
      onPress={() => setOpenCameraFlag(true)}
    >
      <ImageBackground
        source={require('../../assets/images/icons/iPhone-QR.png')}
        style={{
          width: wp('90%'),
          height: wp('70%'),
          overflow: 'hidden',
          borderRadius: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 12,
            paddingRight: 12,
            paddingLeft: 12,
            width: '100%',
          }}
        >
          <View
            style={{
              borderLeftWidth: 1,
              borderTopColor: 'white',
              borderLeftColor: 'white',
              height: hp('5%'),
              width: hp('5%'),
              borderTopWidth: 1,
            }}
          />
          <View
            style={{
              borderTopWidth: 1,
              borderRightWidth: 1,
              borderRightColor: 'white',
              borderTopColor: 'white',
              height: hp('5%'),
              width: hp('5%'),
              marginLeft: 'auto',
            }}
          />
        </View>
        <View
          style={{
            marginTop: 'auto',
            flexDirection: 'row',
            paddingBottom: 12,
            paddingRight: 12,
            paddingLeft: 12,
            width: '100%',
          }}
        >
          <View
            style={{
              borderLeftWidth: 1,
              borderBottomColor: 'white',
              borderLeftColor: 'white',
              height: hp('5%'),
              width: hp('5%'),
              borderBottomWidth: 1,
            }}
          />
          <View
            style={{
              borderBottomWidth: 1,
              borderRightWidth: 1,
              borderRightColor: 'white',
              borderBottomColor: 'white',
              height: hp('5%'),
              width: hp('5%'),
              marginLeft: 'auto',
            }}
          />
        </View>
      </ImageBackground>
    </TouchableOpacity>) } 
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
		backgroundColor: 'white',
	},
  cameraView: {
    width: wp('90%'),
    height: wp('90%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  camera: {
    width: wp('90%'),
    height: wp('90%'),
  },
  topCornerView: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  bottomCornerView: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  topLeftCornerView: {
    borderLeftWidth: 1,
    borderTopColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderTopWidth: 1,
  },
  topRightCornerView: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderTopColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
  bottomLeftCornerView: {
    borderLeftWidth: 1,
    borderBottomColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderBottomWidth: 1,
  },
  bottomRightCornerView: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderBottomColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
});
export default memo(QRCodeThumbnail);
