import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { RNCamera } from 'react-native-camera';
import BottomInfoBox from '../../components/BottomInfoBox';
import { ScrollView } from 'react-native-gesture-handler';

export default function QRModal(props) {
  const [openCameraFlag, setOpenCameraFlag] = useState(false);
  const barcodeRecognized = async (barcodes) => {
    if (barcodes.data) {
      setOpenCameraFlag(false);
      props.modalRef ? props.modalRef.current.snapTo(1) : ''; // closes modal
      props.onQrScan(getFormattedString(barcodes.data));
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
    <View style={styles.modalContentContainer}>
        <ScrollView style={styles.qrModalScrollView}>
          <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems:'center'}}>
              <Text style={styles.modalHeaderTitleText}>{props.QRModalHeader}</Text>
            </View>
          </View>
          <View style={styles.qrModalImageNTextInputView}>
            {props.isOpenedFlag && openCameraFlag ? (
              <View
                style={{
                  width: wp('100%'),
                  height: wp('100%'),
                  overflow: 'hidden',
                  borderRadius: 20,
                }}
              >
                <RNCamera
                  ref={(ref) => {
                    this.cameraRef = ref;
                  }}
                  style={{
                    width: wp('100%'),
                    height: wp('100%'),
                  }}
                  onBarCodeRead={barcodeRecognized}
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
                </RNCamera>
              </View>
            ) : (
              <AppBottomSheetTouchableWrapper
                onPress={() => {
                  setTimeout(() => {
                    setOpenCameraFlag(true); 
                  }, 2);
                  }}
              >
                <ImageBackground
                  source={require('../../assets/images/icons/iPhone-QR.png')}
                  style={{
                    width: wp('100%'),
                    height: wp('100%'),
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
              </AppBottomSheetTouchableWrapper>
            )}
            <View
              style={{
                marginBottom: 30,
                padding: 20,
                marginLeft: 15,
                marginRight: 15,
                borderRadius: 10,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(13),
                  marginBottom: 2,
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {props.title}
              </Text>
              <Text style={styles.bottomNoteInfoText}>
                {props.infoText}
                {/* {props.linkText ? (
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(12),
                      fontFamily: Fonts.FiraSansRegular,
                      textDecorationLine: 'underline',
                    }}
                    onPress={props.onPress ? props.onPress : () => {}}
                  >
                    {props.linkText}
                  </Text>
                ) : null} 
                {props.italicText ? (
                  <Text
                    style={{
                      fontFamily: Fonts.FiraSansMediumItalic,
                      fontWeight: 'bold',
                      fontStyle: 'italic',
                      fontSize: RFValue(12),
                    }}
                  >
                    {props.italicText}
                  </Text>
                ) : null}*/}
              </Text>
            </View>
          </View>
          <View style={{marginTop: 'auto'}}>
          <BottomInfoBox
            title={'Note'}
              infoText={
                props.noteText
              }
            />
            </View>
        </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  qrModalScrollView: {
    display: 'flex',
    backgroundColor: Colors.white,
  },
  qrModalImageNTextInputView: {
    marginTop: hp('2%'),
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('2%'),
    paddingTop: hp('2%'),
    marginLeft: wp('4%'),
    marginRight: wp('4%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular
  },
});
