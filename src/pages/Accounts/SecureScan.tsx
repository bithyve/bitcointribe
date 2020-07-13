import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CopyThisText from '../../components/CopyThisText';
import Colors from '../../common/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import { uploadEncMShare, ErrorSending } from '../../store/actions/sss';
import DeviceInfo from 'react-native-device-info';
import BottomSheet from 'reanimated-bottom-sheet';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import QRCode from 'react-native-qrcode-svg';


const SecureScan = props => {
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector(state => state.sss.errorSending);
 // console.log('isErrorSendingFailed', isErrorSendingFailed);
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const serviceType = props.navigation.getParam('serviceType');
  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = useSelector(
    state => state.storage.database,
  );
  const { loading } = useSelector(state => state.sss);
  const [selectedStatus, setSelectedStatus] = useState('Ugly'); // for preserving health of this entity
  const [secondaryQR, setSecondaryQR] = useState('');
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP;
  SHARES_TRANSFER_DETAILS[0] && !secondaryQR
    ? setSecondaryQR(
      JSON.stringify({
        ...SHARES_TRANSFER_DETAILS[0],
        type: 'secondaryDeviceQR',
      }),
    )
    : null;

  const deepLink = SHARES_TRANSFER_DETAILS[0]
    ? `https://hexawallet.io/app/${WALLET_SETUP.walletName}/sss/ek/` +
    SHARES_TRANSFER_DETAILS[0].ENCRYPTED_KEY
    : '';
  const dispatch = useDispatch();

  useEffect(() => {
    if (!secondaryQR) {
      dispatch(uploadEncMShare(0));
    }
  }, []);

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage, errorMessageHeader]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  if (isErrorSendingFailed) {
    setTimeout(() => {
      setErrorMessageHeader('Error sending Recovery Key');
      setErrorMessage(
        'There was an error while sending your Recovery Key, please try again in a little while',
      );
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorSending(null));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.headerContainer}>
        <TouchableOpacity
          style={BackupStyles.headerLeftIconContainer}
          onPress={() => {
            if (getServiceType) {
              getServiceType(serviceType);
            }
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
            Activate Secure Account
          </Text>
          <Text style={BackupStyles.modalHeaderInfoText}>
            Please scan the following QR on your authenticator app like Google
            Authenticator
          </Text>
          <Text style={BackupStyles.modalHeaderInfoText}>
            The authenticator app should be{'\n'}installed on another device
            like your Keeper Device
          </Text>
        </View>
      </View>
      <View style={BackupStyles.modalContentView}>
        {loading.uploadMetaShare || !secondaryQR ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
            <QRCode value={secondaryQR} size={hp('27%')} />
          )}
        {deepLink ? <CopyThisText text={deepLink} /> : null}
      </View>
      <View style={{ margin: 20 }}>
        <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('GoogleAuthenticatorOTP');
            }}
            style={{
              height: wp('13%'),
              width: wp('40%'),
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={{
              height: wp('13%'),
              width: wp('30%'),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Activate Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: { height: hp('27%'), justifyContent: 'center' },
});

export default SecureScan;
