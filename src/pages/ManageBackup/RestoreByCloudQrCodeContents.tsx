import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
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

export default function RestoreByCloudQrCodeContents(props) {
  const [qrData, setQrData] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [qrDataArray, setQrDataArray] = useState([]);
  let [counter, setCounter] = useState(1);

  const getQrCodeData = qrData => {
    let tempArray = qrDataArray;
    setQrData(qrData);
    for (let i = 0; i < qrDataArray.length; i++) {
      if (qrDataArray[i] == qrData) return;
    }
    if (qrDataArray.length <= 8) {
      tempArray.push(qrData);
      setQrDataArray(tempArray);
      counter++;
      setCounter(counter);
    }
    console.log('tempArray', tempArray);
    console.log('qrDataArray', qrDataArray);
  };

  return (
    <ScrollView style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {}}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View>
            <Text style={styles.modalHeaderTitleText}>
              Enter Recovery Secret{'\n'}from Cloud
            </Text>
            <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
              {props.pageInfo}These are the 8 QR codes saved in the{'\n'}PDF you
              stored in your cloud service
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
          backgroundColor: 'red',
        }}
      >
        <QrCodeModalContents
          flag={true}
          restoreQr={true}
          //modalRef={props.modalRef}
          isOpenedFlag={props.isOpenedFlag}
          onQrScan={qrData => getQrCodeData(qrData)}
          onPressQrScanner={() => {
            props.navigation.navigate('QrScanner', {
              scanedCode: getQrCodeData,
            });
          }}
        />
        {/* <QrScanner onScanQRCode={ async ( data ) => { setQrData( data ) } } /> */}
      </View>
      <View
        style={{ marginBottom: hp('3%'), marginTop: hp('1%'), marginRight: 20 }}
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
