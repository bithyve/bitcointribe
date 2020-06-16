import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import CommonStyles from '../../common/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import HeaderTitle from '../../components/HeaderTitle';
import BottomInfoBox from '../../components/BottomInfoBox';
import CopyThisText from '../../components/CopyThisText';
import KnowMoreButton from '../../components/KnowMoreButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  requestShare,
  downloadMShare,
  ErrorReceiving,
} from '../../store/actions/sss';
import Toast from '../../components/Toast';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import QRCodeWrapper from '../../components/qr-hoc';

export default function RestoreWalletBySecondaryDevice(props) {
  const [secondaryQR, setSecondaryQR] = useState('');
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorReceivingFailed = useSelector(
    (state) => state.sss.errorReceiving,
  );
  const { WALLET_SETUP, DECENTRALIZED_BACKUP } = useSelector(
    (state) => state.storage.database,
  );
  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

  const { REQUEST_DETAILS, META_SHARE } = RECOVERY_SHARES[0]
    ? RECOVERY_SHARES[0]
    : { REQUEST_DETAILS: null, META_SHARE: null };

  REQUEST_DETAILS && !secondaryQR
    ? setSecondaryQR(
        JSON.stringify({
          ...REQUEST_DETAILS,
          requester: WALLET_SETUP.walletName,
          type: 'recoveryQR',
          ver: DeviceInfo.getVersion(),
        }),
      )
    : null;
  secondaryQR ? console.log(secondaryQR) : null;
  // REQUEST_DETAILS ? Alert.alert('OTP', REQUEST_DETAILS.OTP) : null;

  // const deepLink = REQUEST_DETAILS
  //   ? `https://hexawallet.io/app/${WALLET_SETUP.walletName}/sss/rk/` +
  //     REQUEST_DETAILS.ENCRYPTED_KEY
  //   : '';

  const dispatch = useDispatch();
  useEffect(() => {
    if (!REQUEST_DETAILS) dispatch(requestShare(0));
  }, []);

  if (META_SHARE) {
    Toast('Received');
  }
  if (isErrorReceivingFailed) {
    setTimeout(() => {
      setErrorMessageHeader('Error receiving Recovery key');
      setErrorMessage(
        'There was an error while receiving your Recovery Key, please try again',
      );
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorReceiving(null));
  }

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.goBack();
              // props.navigation.navigate('RestoreSelectedContactsList');
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <View style={{ flex: 2 }}>
            <HeaderTitle
              isKnowMoreButton={true}
              onPressKnowMore={() => { }}
              firstLineTitle={'Restore wallet using'}
              secondLineTitle={'Keeper Device'}
              infoTextNormal={
                'Use the Recover Secret stored in your Keeper device. '
              }
              infoTextBold={'you will need to have the other device with you'}
            />
          </View>
          <View
            style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}
          >
            {!secondaryQR ? (
              <ActivityIndicator size="large" />
            ) : (
                <QRCodeWrapper value={secondaryQR} size={hp('27%')} />
              )}
            {/* {deepLink ? <CopyThisText text={deepLink} /> : null} */}
          </View>

          {REQUEST_DETAILS ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: hp('3%'),
                marginBottom: hp('3%'),
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    downloadMShare(REQUEST_DETAILS.KEY, null, 'recovery'),
                  );
                }}
                disabled={!!META_SHARE}
                style={{
                  backgroundColor: Colors.blue,
                  borderRadius: 10,
                  width: wp('50%'),
                  height: wp('13%'),
                  justifyContent: 'center',
                  alignItems: 'center',
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
              </TouchableOpacity>
              {/* <Button
                title={META_SHARE ? 'Downloaded' : 'Download'}
                disabled={!!META_SHARE}
                onPress={() =>
                  dispatch(
                    downloadMShare(
                      REQUEST_DETAILS.KEY,
                      'recovery',
                    ),
                  )
                }
              /> */}
            </View>
          ) : null}

          <View style={{ flex: 2, justifyContent: 'flex-end' }}></View>
        </KeyboardAvoidingView>
        <BottomInfoBox
          title={'Note'}
          infoText={
            'Once you have scanned and accepted the request, press continue button'
          }
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={ErrorBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('35%')
              : hp('40%'),
          ]}
          renderContent={renderErrorModalContent}
          renderHeader={renderErrorModalHeader}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    color: Colors.blue,
    fontSize: RFValue(25),
    marginLeft: 15,
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  labelStyle: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    marginLeft: 15,
    fontFamily: Fonts.FiraSansRegular,
  },
  bottomNoteText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    marginBottom: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  bottomNoteInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
  buttonView: {
    height: wp('13%'),
    width: wp('30%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    paddingTop: 30,
    alignItems: 'center',
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
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  addressView: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: RFValue(13),
    color: Colors.lightBlue,
  },
  copyIconView: {
    width: 48,
    height: 50,
    backgroundColor: Colors.borderColor,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
