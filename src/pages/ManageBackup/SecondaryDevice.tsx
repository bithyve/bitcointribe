import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import QRCode from 'react-native-qrcode-svg';
import CopyThisText from '../../components/CopyThisText';
import { useDispatch, useSelector } from 'react-redux';
import { uploadEncMShare } from '../../store/actions/sss';
import { getIconByStatus } from './utils';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const SecondaryDevice = props => {
  const [selectedStatus, setSelectedStatus] = useState('error'); // for preserving health of this entity
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
    } else {
      dispatch(uploadEncMShare(0));
    }
  }, [SHARES_TRANSFER_DETAILS[0]]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.headerContainer}>
        <TouchableOpacity
          style={BackupStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <View style={BackupStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ marginTop: hp('1%') }}>
          <Text style={BackupStyles.modalHeaderTitleText}>
            Secondary Device
          </Text>
          <Text style={BackupStyles.modalHeaderInfoText}>
            Last backup{' '}
            <Text
              style={{
                fontFamily: Fonts.FiraSansMediumItalic,
                fontWeight: 'bold',
              }}
            >
              {'3 months ago'}
            </Text>
          </Text>
        </View>
        <Image
          style={BackupStyles.cardIconImage}
          source={getIconByStatus(selectedStatus)}
        />
      </View>
      <View style={BackupStyles.modalContentView}>
        {loading.uploadMetaShare || !secondaryQR ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <QRCode value={secondaryQR} size={hp('27%')} />
        )}
        {/* {deepLink ? <CopyThisText text={deepLink} /> : null} */}
      </View>
      <BottomInfoBox
        title={'Note'}
        infoText={
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna'
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: { height: hp('27%'), justifyContent: 'center' },
});

export default SecondaryDevice;
