import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  FlatList,
  Platform,
  AsyncStorage,
  ActivityIndicator,
} from 'react-native';
import BackupStyles from '../../pages/ManageBackup/Styles';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { uploadEncMShare } from '../../store/actions/sss';
import QRCode from 'react-native-qrcode-svg';
import CopyThisText from '../../components/CopyThisText';
import BottomInfoBox from '../../components/BottomInfoBox';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

export default function SecondaryDeviceModelContents(props) {
  const [selectedStatus, setSelectedStatus] = useState('Ugly'); // for preserving health of this entity
  const [secondaryQR, setSecondaryQR] = useState('');
  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = useSelector(
    state => state.storage.database,
  );
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP;
  const { loading } = useSelector(state => state.sss);

  // const deepLink = SHARES_TRANSFER_DETAILS[0]
  //   ? `https://hexawallet.io/${WALLET_SETUP.walletName}/sss/ek/` +
  //     SHARES_TRANSFER_DETAILS[0].ENCRYPTED_KEY
  //   : '';

  const dispatch = useDispatch();
  useEffect(() => {
    if (SHARES_TRANSFER_DETAILS[0]) {
      if (Date.now() - SHARES_TRANSFER_DETAILS[0].UPLOADED_AT < 600000) {
        // do nothing
      } else {
        dispatch(uploadEncMShare(0));
      }
      setSecondaryQR(
        JSON.stringify({
          requester: WALLET_SETUP.walletName,
          ...SHARES_TRANSFER_DETAILS[0],
          type: 'secondaryDeviceQR',
        }),
      );
    } else {
      dispatch(uploadEncMShare(0));
    }
  }, [SHARES_TRANSFER_DETAILS[0]]);

  const getIconByStatus = status => {
    if (status == 'Ugly') {
      return require('../../assets/images/icons/icon_error_red.png');
    } else if (status == 'Bad') {
      return require('../../assets/images/icons/icon_error_yellow.png');
    } else if (status == 'Good') {
      return require('../../assets/images/icons/icon_check.png');
    }
  };

  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          ...BackupStyles.modalHeaderTitleView,
          marginLeft: 10,
          marginRight: 10,
          marginTop: 5,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => {
              props.onPressBack();
            }}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View
            style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
          >
            <Text style={BackupStyles.modalHeaderTitleText}>
              Secondary Device
            </Text>
            {/* <Text style={BackupStyles.modalHeaderInfoText}>
              Last backup{' '}
              <Text
                style={{
                  fontFamily: Fonts.FiraSansMediumItalic,
                  fontWeight: 'bold',
                }}
              >
                {' '}
                {'3 months ago'}
              </Text>
            </Text> */}
          </View>
        </View>
        <Image
          style={BackupStyles.cardIconImage}
          source={getIconByStatus(selectedStatus)}
        />
      </View>
      <View style={BackupStyles.modalContentView}>
        {loading.uploadMetaShare || !secondaryQR ? (
          <View style={{ height: hp('27%'), justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <QRCode value={secondaryQR} size={hp('27%')} />
        )}
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk()}
          style={{
            backgroundColor: Colors.blue,
            borderRadius: 10,
            width: wp('50%'),
            height: wp('13%'),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp('3%'),
            marginBottom: hp('3%'),
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Yes, I have shared
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      <BottomInfoBox
        title={'Note'}
        infoText={
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna'
        }
      />
    </View>
  );
}
