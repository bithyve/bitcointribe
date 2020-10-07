import React, { useState, useCallback, useRef } from 'react';
import { View, Image, Text, StyleSheet, Alert, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KnowMoreButton from '../../components/KnowMoreButton';
import QrScanner from '../../components/QrScanner';
import QrCodeModalContents from '../../components/QrCodeModalContents';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
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

export default function RestoreByCloudQrCodeContents(props) {
  const [qrData, setQrData] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
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
        // Alert.alert('Please scan ' + temp1 + ' QR code');
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
      // setTimeout(() => {
      //   setErrorMessageHeader('Scan QR code');
      //   setErrorMessage(
      //     temp + ' QR code scanned, please scan the next one'
      //   );
      //   setProcessButtonText('Okay')
      // }, 2);
      // (ErrorBottomSheet as any).current.snapTo(1);
      //Alert.alert(temp + ' QR code scanned, please scan the next one');
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
      props.onPressBack();
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
    <View style={styles.modalContainer}>
      <ScrollView>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {/* <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper> */}
            <View>
              <Text style={styles.modalHeaderTitleText}>
                Enter Recovery Key
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
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
                  width: wp('5%'),
                  height: wp('5%'),
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
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'red',
          }}
        >
          <QrCodeModalContents
            onClose={() => {}}
            flag={true}
            onQrScan={(qrData) => getQrCodeData(qrData)}
            onPressQrScanner={() => {
              props.navigation.navigate('QrScanner', {
                scanedCode: getQrCodeData,
              });
            }}
          />
          {/* <QrScanner onScanQRCode={ async ( data ) => { setQrData( data ) } } /> */}
        </View>
        <View
          style={{
            marginBottom: hp('3%'),
            marginTop: hp('1%'),
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
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    width: '100%',
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: hp('1.5%'),
    paddingTop: hp('2%'),
    marginLeft: 20,
    marginRight: 20,
    marginBottom: hp('1.5%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11, 812),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp('0.7%'),
    flexWrap: 'wrap',
  },
  qrModalImage: {
    width: wp('100%'),
    height: wp('100%'),
    borderRadius: 20,
    marginTop: hp('5%'),
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
