import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, AsyncStorage } from 'react-native';
import BackupStyles from '../../pages/ManageBackup/Styles';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import QRCode from 'react-native-qrcode-svg';
import BottomInfoBox from '../../components/BottomInfoBox';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { uploadEncMShare } from '../../store/actions/sss';
import { EphemeralData } from '../../bitcoin/utilities/Interface';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import Toast from '../../components/Toast';

export default function SecondaryDeviceModelContents(props) {
  const [secondaryQR, setSecondaryQR] = useState('');

  const SHARES_TRANSFER_DETAILS = useSelector(
    (state) =>
      state.storage.database.DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  );

  const WALLET_SETUP = useSelector(
    (state) => state.storage.database.WALLET_SETUP,
  );

  const uploadMetaShare = useSelector(
    (state) => state.sss.loading.uploadMetaShare,
  );

  const dispatch = useDispatch();
  const [changeContact, setChangeContact] = useState(false);

  useEffect(() => {
    if (props.changeContact) setChangeContact(true);
  }, [props.changeContact]);

  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );

  const updateTrustedContactsInfo = useCallback(async (contact) => {
    let trustedContactsInfo: any = await AsyncStorage.getItem(
      'TrustedContactsInfo',
    );
    console.log({ trustedContactsInfo });

    if (trustedContactsInfo) {
      trustedContactsInfo = JSON.parse(trustedContactsInfo);
      trustedContactsInfo[0] = contact;
    } else {
      trustedContactsInfo = [];
      trustedContactsInfo[2] = undefined; // securing initial 3 positions for Guardians
      trustedContactsInfo[0] = contact;
    }
    await AsyncStorage.setItem(
      'TrustedContactsInfo',
      JSON.stringify(trustedContactsInfo),
    );
  }, []);

  useEffect(() => {
    (async () => {
      const walletID = await AsyncStorage.getItem('walletID');
      const FCM = await AsyncStorage.getItem('fcmToken');

      const firstName = 'Secondary';
      const lastName = 'Device';
      const contactName = `${firstName} ${
        lastName ? lastName : ''
      }`.toLowerCase();

      const data: EphemeralData = {
        walletID,
        FCM,
      };

      if (changeContact) {
        dispatch(uploadEncMShare(0, contactName, data, true));
        updateTrustedContactsInfo({ firstName, lastName });
        setChangeContact(false);
      } else {
        if (SHARES_TRANSFER_DETAILS[0]) {
          if (Date.now() - SHARES_TRANSFER_DETAILS[0].UPLOADED_AT > 600000) {
            dispatch(uploadEncMShare(0, contactName, data));
            updateTrustedContactsInfo({ firstName, lastName });
          }
          // setSecondaryQR(
          //   JSON.stringify({
          //     requester: WALLET_SETUP.walletName,
          //     ...SHARES_TRANSFER_DETAILS[0],
          //     type: 'secondaryDeviceQR',
          //   }),
          // );

          if (trustedContacts.tc.trustedContacts[contactName]) {
            const publicKey =
              trustedContacts.tc.trustedContacts[contactName].publicKey;

            setSecondaryQR(
              JSON.stringify({
                isGuardian: true,
                requester: WALLET_SETUP.walletName,
                publicKey,
                uploadedAt: SHARES_TRANSFER_DETAILS[0].UPLOADED_AT,
                type: 'secondaryDeviceGuardian',
              }),
            );
          }
        } else {
          dispatch(uploadEncMShare(0, contactName, data));
          updateTrustedContactsInfo({ firstName, lastName });
        }
      }
    })();
  }, [SHARES_TRANSFER_DETAILS, changeContact, trustedContacts]);

  console.log(secondaryQR);
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
          paddingTop: hp('0.5%'),
          alignItems: 'center',
          marginLeft: 20,
        }}
      >
        <Text style={BackupStyles.modalHeaderTitleText}>Scan QR Code</Text>
      </View>
      <View style={BackupStyles.modalContentView}>
        {uploadMetaShare || !secondaryQR ? (
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
            Yes, I have scanned
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      <BottomInfoBox
        title={'Share your Recovery Key'}
        infoText={
          'Open the QR scanner at the bottom of the Home screen on your Keeper Device and scan this QR'
        }
      />
    </View>
  );
}
