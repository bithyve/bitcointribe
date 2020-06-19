import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Fonts from '../../common/Fonts';
import DeviceInfo from 'react-native-device-info';
import BackupStyles from '../ManageBackup/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import QRCode from 'react-native-qrcode-svg';
import CopyThisText from '../../components/CopyThisText';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

const NewTwoFASecret = props => {
  const [receivingAddress, setReceivingAddress] = useState('2N6ubBgDNrs9NnJGSF3gQBUwM7SwQtGQs2g');
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <View style={{ ...BackupStyles.modalContainer, backgroundColor: Colors.white, marginTop: 10 }}>
        <ScrollView style={styles.qrModalScrollView}>
          <View style={BackupStyles.modalHeaderTitleView}>
            <View
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            >
              {/* <TouchableOpacity
                onPress={() => {
                  props.navigation.goBack();
                }}
                style={{ height: 30, width: 30, justifyContent: 'center' }}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </TouchableOpacity> */}
              <Text style={BackupStyles.modalHeaderTitleText}>
                2FA secret
              </Text>
              <AppBottomSheetTouchableWrapper
                style={{
                  backgroundColor: '#77B9EB',
                  marginLeft: 'auto',
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 5,
                  paddingBottom: 5
                }}
                onPress={() => {
                  props.navigation.pop(1);
                }}
              >
                <Text
                  onPress={() => {
                    props.navigation.pop(1);
                  }}
                  style={{
                    color: Colors.white,
                    fontSize: RFValue(12),
                    marginLeft: 'auto',
                  }}
                >
                  Done
                </Text>
              </AppBottomSheetTouchableWrapper>
            </View>
          </View>
          <View style={BackupStyles.modalContentView}>
            {!receivingAddress ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" />
              </View>
            ) : (
                <QRCode value={receivingAddress} size={hp('27%')} />
              )}
            {receivingAddress ? <CopyThisText text={receivingAddress} /> : null}
          </View>
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
              Scan in Authenticator
              </Text>
            <Text style={styles.bottomNoteInfoText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              </Text>
          </View>

        </ScrollView>
        <View
          style={{
            marginTop: 'auto',
            marginBottom: hp('0.2%'),
          }}
        >
          <BottomInfoBox
            title={'Note'}
            infoText={
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna'
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: { height: hp('27%'), justifyContent: 'center' },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: hp('2%'),
    elevation: 10,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  confirmButtonView: {
    width: wp('40%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  qrModalScrollView: {
    display: 'flex',
    backgroundColor: Colors.white,
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
});

export default NewTwoFASecret;