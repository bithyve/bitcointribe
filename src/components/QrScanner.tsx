import React, { useState, useEffect } from 'react';
import {
  View,
  AsyncStorage,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RNCamera } from 'react-native-camera';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';

export default function QrScanner(props) {
  const title = props.navigation.getParam('title');
  const [cameraRef, setcameraRef] = useState(React.createRef());
  const [openCameraFlag, setOpenCameraFlag] = useState(true)
  const [scanQRFlag, setScanQRFlag] = useState([RNCamera.Constants.BarCodeType.qr])
  const barcodeRecognized = async barcodes => {
    if (barcodes.data) {
      setScanQRFlag([]);
      setOpenCameraFlag(false);
      props.navigation.state.params.scanedCode(
        getFormattedString(barcodes.data),
      );
      props.navigation.goBack();
    }
  };

  useEffect(() => {
    (async () => {
      let isCameraOpen;
      AsyncStorage.getItem('isCameraOpen', (err, value) => {
        if (err) {
          console.log(err);
        } else {
          isCameraOpen = JSON.parse(value); // boolean false
        }
      });
      console.log('isCameraOpen in QR Scanner', isCameraOpen);
      if (!isCameraOpen) {
        await AsyncStorage.setItem('isCameraOpen', JSON.stringify(true));
      }
    })();
  }, []);

  const getFormattedString = (qrString: string) => {
    qrString = qrString.split('Dquote').join('"');
    qrString = qrString.split('Qutation').join(':');
    qrString = qrString.split('Lbrace').join('{');
    qrString = qrString.split('Rbrace').join('}');
    qrString = qrString.split('Slash').join('/');
    qrString = qrString.split('Comma').join(',');
    qrString = qrString.split('Squote').join("'");
    qrString = qrString.split('Space').join(' ');
    return qrString;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: Colors.borderColor,
          alignItems: 'center',
          flexDirection: 'row',
          paddingRight: 10,
          paddingBottom: 15,
          paddingTop: 10,
          marginLeft: 20,
          marginBottom: 15,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(18),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            {title ? title : 'Scan QR code'}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: wp('100%'),
          height: wp('100%'),
          overflow: 'hidden',
          borderRadius: 20,
          marginTop: hp('3%'),
        }}
      >
        { openCameraFlag ?
        <RNCamera
          ref={ref => {
            this.cameraRef = ref;
          }}
          barCodeTypes={scanQRFlag}
          style={{
            width: wp('100%'),
            height: wp('100%'),
          }}
          onBarCodeRead={barcode => barcodeRecognized(barcode)}
          captureAudio={false}
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
        </RNCamera> :  null }
      </View>
    </SafeAreaView>
  );
}
