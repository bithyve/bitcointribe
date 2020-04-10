import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Platform,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { RNCamera } from 'react-native-camera';
import BottomInfoBox from '../../components/BottomInfoBox';
import { ScrollView } from 'react-native-gesture-handler';

export default function QrCodeModalContents(props) {
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
                onPress={() => setOpenCameraFlag(true)}
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
            backgroundColor={Colors.backgroundColor1}
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
    marginTop: hp('4%'),
  },
  qrModalImageNTextInputView: {
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalImage: {
    width: wp('72%'),
    height: wp('72%'),
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.backgroundColor,
  },
  qrModalTextInput: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    width: wp('72%'),
    height: 60,
    marginTop: 20,
    marginBottom: 20,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: RFValue(11, 812),
    fontFamily: Fonts.FiraSansMedium,
  },
  qrModalInfoView: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  qrModalInfoTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
  },
  qrModalInfoInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
  },
});
