import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Linking,
  TextInput,
  Platform,
  ImageBackground,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import BottomInfoBox from './BottomInfoBox';
import { SECURE_ACCOUNT } from '../common/constants/serviceTypes';
import { useSelector } from 'react-redux';
import { RNCamera } from 'react-native-camera';

export default function SweepFundsQrScanner(props) {
  const [openCameraFlag, setOpenCameraFlag] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);
  const serviceType = SECURE_ACCOUNT;
  const service = useSelector((state) => state.accounts[serviceType].service);

  const barcodeRecognized = async (barcodes) => {
    if (barcodes.data) {
      setOpenCameraFlag(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              setOpenCameraFlag(false);
              props.ooBackPress();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <Text style={styles.modalHeaderTitleText}>{'Sweep Funds'}</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ height: '100%' }}>
          {openCameraFlag ? (
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
          ) : (
            <AppBottomSheetTouchableWrapper
              onPress={() => setOpenCameraFlag(true)}
              style={{ alignSelf: 'center' }}
            >
              <ImageBackground
                source={require('../assets/images/icons/iPhone-QR.png')}
                style={styles.cameraImage}
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
              </ImageBackground>
            </AppBottomSheetTouchableWrapper>
          )}

          <TextInput
            style={styles.textBox}
            placeholder={'or Enter Address Manually'}
            keyboardType={
              Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
            }
            value={recipientAddress}
            onChangeText={setRecipientAddress}
            placeholderTextColor={Colors.borderColor}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Backspace') {
                setTimeout(() => {
                  setIsInvalidAddress(false);
                }, 10);
              }
            }}
            onBlur={() => {
              const instance = service.hdWallet || service.secureHDWallet;
              let isAddressValid = instance.isValidAddress(recipientAddress);
              setIsInvalidAddress(!isAddressValid);
              if (isAddressValid && recipientAddress) {
                props.onProceed();
              }
            }}
          />

          {isInvalidAddress ? (
            <View style={{ marginLeft: 'auto' }}>
              <Text style={styles.errorText}
              onPress={props.onProceed}>Enter correct address</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <BottomInfoBox
        backgroundColor={Colors.white}
        title={'Note'}
        infoText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor1,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 10,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContentView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexView: {
    flex: 0.5,
    height: '100%',
    justifyContent: 'space-evenly',
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: wp('13%'),
  },
  infoText: {
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
  shareButtonView: {
    height: wp('8%'),
    width: wp('15%'),
    backgroundColor: Colors.backgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  textBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    height: 50,
    margin: 20,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansMedium,
  },
  cameraView: {
    width: wp('90%'),
    height: wp('90%'),
    overflow: 'hidden',
    borderRadius: 20,
    alignSelf: 'center',
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
  cameraImage: {
    width: wp('90%'),
    height: wp('90%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
    marginLeft: 30
  },
});
