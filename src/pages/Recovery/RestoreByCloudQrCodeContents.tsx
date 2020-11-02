import React, { useState, useCallback, useRef } from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  widthPercentageToDP, heightPercentageToDP,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import KnowMoreButton from '../../components/KnowMoreButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  restoreShareFromQR,
  UnableRecoverShareFromQR,
} from '../../store/actions/sss';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import Toast from '../../components/Toast';
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner';
import NavStyles from '../../common/Styles/NavStyles';

export default function RestoreByCloudQRCodeContents(props) {
  const [qrData, setQrData] = useState('');
  const [qrDataArray, setQrDataArray] = useState([]);
  let [counter, setCounter] = useState(1);
  let [startNumberCounter, setStartNumberCounter] = useState(1);
  const dispatch = useDispatch();
  const errorBottomSheetRef = useRef<BottomSheet>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [processButtonText, setProcessButtonText] = useState('Okay');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const unableRecoverShareFromQR = useSelector(
    (state) => state.sss.unableRecoverShareFromQR,
  );
  console.log('unableRecoverShareFromQR', unableRecoverShareFromQR);

  const getQrCodeData = (qrData) => {
    let tempArray = qrDataArray;
    let shareCode = qrData.substring(0, 2);
    if (shareCode !== 'e0' && shareCode !== 'c0') {
      console.log('shareCode', shareCode);
      setTimeout(() => {
        setErrorMessageHeader('Invalid QR');
        setErrorMessage('Please try again');
        setProcessButtonText('Try again');
      }, 2);
      errorBottomSheetRef.current.snapTo(1);
      console.log('shareCode1', shareCode);
      //Alert.alert('Invalid QR', 'Please try again');
      return;
    }
    let startNumber1 = qrData.substring(2, 3);
    console.log('startNumber', startNumber1);
    setQrData(qrData);
    let temp1 =
      startNumberCounter == 1
        ? startNumberCounter + 'st'
        : startNumberCounter == 2
        ? startNumberCounter + 'nd'
        : startNumberCounter == 3
        ? startNumberCounter + 'rd'
        : startNumberCounter == 9
        ? 8
        : startNumberCounter + 'th';
    for (let i = 0; i < 8; i++) {
      if (qrDataArray[i] == qrData) {
        setTimeout(() => {
          setErrorMessageHeader('Scan QR code');
          setErrorMessage('Please scan ' + temp1 + ' QR code');
          setProcessButtonText('Okay');
        }, 2);
        errorBottomSheetRef.current.snapTo(1);
        return;
      }
      if (startNumberCounter != startNumber1) {
        console.log('in if', startNumber1, startNumberCounter);
        setTimeout(() => {
          setErrorMessageHeader('Scan QR code');
          setErrorMessage('Please scan ' + temp1 + ' QR code');
          setProcessButtonText('Okay');
        }, 2);
        errorBottomSheetRef.current.snapTo(1);

        return;
      }
    }
    if (qrDataArray.length <= 8) {
      tempArray.push(qrData);
      setQrDataArray(tempArray);
      let temp =
        counter == 1
          ? counter + 'st'
          : counter == 2
          ? counter + 'nd'
          : counter == 3
          ? counter + 'rd'
          : counter == 9
          ? 8
          : counter + 'th';

      Toast(temp + ' QR code scanned, please scan the next one');

      counter++;
      setCounter(counter);
      startNumberCounter++;
      setStartNumberCounter(startNumberCounter);
    }
    if (qrDataArray.length === 8) {
      dispatch(restoreShareFromQR(qrDataArray));
      setQrDataArray([]);
      setCounter(1);
      setQrData('');
      setStartNumberCounter(1);

      props.onScanCompleted(shareCode);
    }
  };

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={processButtonText}
        onPressProceed={() => {
          errorBottomSheetRef.current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage, errorMessageHeader, processButtonText]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          errorBottomSheetRef.current.snapTo(0);
        }}
      />
    );
  }, []);

  if (unableRecoverShareFromQR) {
    setTimeout(() => {
      setErrorMessageHeader('Error receiving Recovery Key');
      setErrorMessage('Invalid QR or error while receiving, please try again');
      setProcessButtonText('Try again');
    }, 2);
    errorBottomSheetRef.current.snapTo(1);
    dispatch(UnableRecoverShareFromQR(null));
  }

  return (
    <View style={styles.rootContainer}>
      <ScrollView>
        <View style={NavStyles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View>
              <Text style={NavStyles.modalHeaderTitleText}>
                Enter Recovery Key
              </Text>
              <Text numberOfLines={2} style={NavStyles.modalHeaderInfoText}>
                {props.pageInfo}There are 8 QR codes in the {'\n'}PDF you have
                stored
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <KnowMoreButton
                onpress={() => {
                  alert(qrData);
                }}
                containerStyle={{}}
                textStyle={{}}
              />
              <Image
                source={require('../../assets/images/icons/icon_error_red.png')}
                style={{
                  width: widthPercentageToDP('5%'),
                  height: widthPercentageToDP('5%'),
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>
        </View>

        <View style={{ marginLeft: 30 }}>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(13, 812),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Step {counter == 9 ? 8 : counter} of 8
          </Text>
          <Text
            numberOfLines={2}
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(11, 812),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            {props.pageInfo}Please scan the{' '}
            {counter == 1
              ? counter + 'st'
              : counter == 2
              ? counter + 'nd'
              : counter == 3
              ? counter + 'rd'
              : counter == 9
              ? 8
              : counter + 'th'}{' '}
            QR code on the{'\n'}PDF you have
          </Text>
        </View>

        <View style={styles.qrScannerSection}>
          <Text style={{ ...NavStyles.modalHeaderSubheadingText, fontSize: RFValue(15) }}>
            Scan a Bitcoin address or any Hexa QR
          </Text>

          <CoveredQRCodeScanner
            containerStyle={styles.qrScannerContainer}
            onCodeScanned={getQrCodeData}
          />
        </View>

        <View
          style={{
            marginBottom: heightPercentageToDP('3%'),
            marginTop: heightPercentageToDP('1%'),
            marginRight: 20,
          }}
        >
          <View style={styles.statusIndicatorView}>
            {qrDataArray.length == 0 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
            {qrDataArray.length == 1 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
            {qrDataArray.length == 2 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
            {qrDataArray.length == 3 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
            {qrDataArray.length == 4 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
            {qrDataArray.length == 5 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
            {qrDataArray.length == 6 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
            {qrDataArray.length == 7 || qrDataArray.length == 8 ? (
              <View style={styles.statusIndicatorActiveView} />
            ) : (
              <View style={styles.statusIndicatorInactiveView} />
            )}
          </View>
        </View>
      </ScrollView>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={errorBottomSheetRef}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? heightPercentageToDP('35%') : heightPercentageToDP('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  rootContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
  },

  qrScannerSection: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },

  qrScannerContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    width: widthPercentageToDP(90),
    height: widthPercentageToDP(90),
  },

  qrModalImage: {
    width: widthPercentageToDP('100%'),
    height: widthPercentageToDP('100%'),
    borderRadius: 20,
    marginTop: heightPercentageToDP('5%'),
  },

  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },

  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 2,
    marginRight: 2,
  },

  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 2,
    marginRight: 2,
  },
});
