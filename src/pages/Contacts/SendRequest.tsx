import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import BackupStyles from '../ManageBackup/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import CopyThisText from '../../components/CopyThisText';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import QRCode from 'react-native-qrcode-svg';


const SendRequest = (props) => {
  const [receivingAddress, setReceivingAddress] = useState('test');
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalContainer}>
        <View style={BackupStyles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
              hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={BackupStyles.modalHeaderTitleText}>
                Send Request
              </Text>
              {/* <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansMedium,
                }}
              >
                Lorem ipsum dolor sit amet, consec
              </Text> */}
            </View>
            <TouchableOpacity
              onPress={() => { }}
              style={{
                height: wp('8%'),
                width: wp('22%'),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.blue,
                justifyContent: 'center',
                borderRadius: 8,
                alignSelf: 'center',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Done
                </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}
        >
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
            marginBottom: hp('5%'),
          }}
        >
          {/* <BottomInfoBox
            title={'Note'}
            infoText={
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna'
            }
          /> */}
        </View>
      </View>
    </View>
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
});

export default SendRequest;
