import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../../components/ModalHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRModal from './QRModal';
import ResetTwoFASuccess from './ResetTwoFASuccess';
import ServerErrorModal from './ServerErrorModal';
import {
  resetTwoFA,
  generateSecondaryXpriv,
  clearTransfer,
  twoFAResetted,
  secondaryXprivGenerated,
} from '../../store/actions/accounts';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';

export type Props = {
  navigation: any;
};

const SubAccountTFAHelpScreen = ({
  navigation,
}: Props) => {
  const [QrBottomSheet] = useState(React.createRef());
  const [QrBottomSheetsFlag, setQrBottomSheetsFlag] = useState(false);
  const [QRModalHeader, setQRModalHeader] = useState('');
  const [
    ResetTwoFASuccessBottomSheet,
  ] = useState(React.createRef());
  const [successMessage, setSuccessMessage] = useState('');
  const [successMessageHeader, setSuccessMessageHeader] = useState('');
  const [
    ServerNotRespondingBottomSheet,
  ] = useState(React.createRef());

  const additional = useSelector((state) => state.accounts.additional);
  const service = useSelector(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  let generatedSecureXPriv;
  let resettedTwoFA;

  if (additional && additional.secure) {
    generatedSecureXPriv = additional.secure.xprivGenerated;
    resettedTwoFA = additional.secure.twoFAResetted;
  }
  const dispatch = useDispatch();

  useEffect(() => {
    if (resettedTwoFA) {
      props.navigation.navigate('TwoFASetup', {
        twoFASetup: service.secureHDWallet.twoFASetup,
        onPressBack: () => {
          dispatch(clearTransfer(SECURE_ACCOUNT));
          props.navigation.navigate('AccountDetails', {
            serviceType: SECURE_ACCOUNT,
            index: 2,
          });
        },
      });
      dispatch(twoFAResetted(null)); //resetting to monitor consecutive change
    } else if (resettedTwoFA === false) {
      setTimeout(() => {
        setSuccessMessageHeader('Failed to reset 2FA');
        setSuccessMessage(
          'The QR you have scanned seems to be invalid, pls try again',
        );
      }, 2);
      (ResetTwoFASuccessBottomSheet as any).current.snapTo(1);
      dispatch(twoFAResetted(null));
    }
  }, [resettedTwoFA]);

  useEffect(() => {
    (async () => {
      if (generatedSecureXPriv) {
        dispatch(clearTransfer(SECURE_ACCOUNT));

        props.navigation.navigate('Send', {
          serviceType: SECURE_ACCOUNT,
          sweepSecure: true,
          netBalance:
            service.secureHDWallet.balances.balance +
            service.secureHDWallet.balances.unconfirmedBalance,
        });
        dispatch(secondaryXprivGenerated(null));

      } else if (generatedSecureXPriv === false) {
        setTimeout(() => {
          setSuccessMessageHeader('Invalid Exit Key');
          setSuccessMessage('Invalid Exit Key, please try again');
        }, 2);
        (ResetTwoFASuccessBottomSheet as any).current.snapTo(1);
        dispatch(secondaryXprivGenerated(null));
      }
    })();
  }, [generatedSecureXPriv]);

  const getQrCodeData = (qrData) => {
    setTimeout(() => {
      setQrBottomSheetsFlag(false);
    }, 2);

    if (QRModalHeader === 'Reset 2FA') {
      dispatch(resetTwoFA(qrData));
    } else if (QRModalHeader === 'Sweep Funds') {
      dispatch(generateSecondaryXpriv(SECURE_ACCOUNT, qrData));
    }
  };

  const renderQrContent = useCallback(() => {
    return (
      <QRModal
        QRModalHeader={QRModalHeader}
        title={'Scan the Regenerate/Exit Key'}
        infoText={
          'This can be found on the last page of your PDF personal copy'
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={(qrData) => {
          if (QRModalHeader == 'Sweep Funds') {
            QrBottomSheet.current?.snapTo(0);
          }
          getQrCodeData(qrData);
        }}
        onBackPress={() => {
          (QrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [QRModalHeader, QrBottomSheetsFlag]);

  const renderQrHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setTimeout(() => {
            setQrBottomSheetsFlag(false);
          }, 2);
          (QrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderErrorModalContent = useCallback(() => {
    return (
      <ResetTwoFASuccess
        modalRef={ResetTwoFASuccessBottomSheet}
        title={successMessageHeader}
        note={""
          // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore'
        }
        info={successMessage}
        proceedButtonText={'Proceed'}
        onPressProceed={() => {
          (ResetTwoFASuccessBottomSheet as any).current.snapTo(0);
          props.navigation.navigate('NewTwoFASecret');
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/icon_twoFASuccess.png')}
      />
    );
  }, [successMessage, successMessageHeader]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ResetTwoFASuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderServerNotRespondingContent = useCallback(() => {
    return (
      <ServerErrorModal
        modalRef={ServerNotRespondingBottomSheet}
        title={'The server is not responding?'}
        info={
          'This may be due to network issues. Please try again. If it still does not work you can sweep the funds from Hexa using the Exit Key.'
        }
        proceedButtonText={'Try Again'}
        onPressProceed={() => {
          (ServerNotRespondingBottomSheet as any).current.snapTo(0);
        }}
        isIgnoreButton={true}
        cancelButtonText={'Sweep Funds'}
        onPressIgnore={() => {
          setTimeout(() => {
            setQRModalHeader('Sweep Funds');
          }, 2);
          if (QrBottomSheet.current) (QrBottomSheet as any).current.snapTo(1);
          (ServerNotRespondingBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderServerNotRespondingHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ServerNotRespondingBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppBottomSheetTouchableWrapper
              onPress={() => props.navigation.goBack()}
              hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
              style={{ height: 30, width: 30 }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </AppBottomSheetTouchableWrapper>
            <View>
              <Text style={styles.modalHeaderTitleText}>
                {'Having trouble with your 2FA'}
              </Text>
              <Text style={styles.modalHeaderInfoText}>
                If your 2FA is not working follow one of the below steps
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              setTimeout(() => {
                setQRModalHeader('Reset 2FA');
              }, 2);
              if (QrBottomSheet.current) {
                (QrBottomSheet as any).current.snapTo(1);
              }
            }}
            style={{ ...styles.selectedContactsView, marginBottom: hp('3%') }}
          >
            <Image
              source={require('../../assets/images/icons/icon_power.png')}
              style={{
                width: wp('7%'),
                height: wp('7%'),
                resizeMode: 'contain',
                marginLeft: 0,
                marginRight: 10,
              }}
            />
            <View>
              <Text style={styles.titleText}>Reset 2FA</Text>
              <Text style={styles.infoText}>
                In case you've forgotten your 2FA
              </Text>
            </View>
            <View
              style={{
                width: wp('17%'),
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  marginLeft: 'auto',
                  alignSelf: 'center',
                  marginRight: 20,
                }}
              />
            </View>
          </AppBottomSheetTouchableWrapper>

          <AppBottomSheetTouchableWrapper
            onPress={() => {
              (ServerNotRespondingBottomSheet as any).current.snapTo(1);
            }}
            style={{ ...styles.selectedContactsView, marginBottom: hp('3%') }}
          >
            <Image
              source={require('../../assets/images/icons/icon_gear.png')}
              style={{
                width: wp('7%'),
                height: wp('7%'),
                resizeMode: 'contain',
                marginLeft: 0,
                marginRight: 10,
              }}
            />
            <View>
              <Text style={styles.titleText}>Server is not responding</Text>
              <Text style={styles.infoText}>
                The 2FA you are entering is invalid
              </Text>
            </View>
            <View
              style={{
                width: wp('17%'),
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={15}
                style={{
                  marginLeft: 'auto',
                  alignSelf: 'center',
                  marginRight: 20,
                }}
              />
            </View>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <View
        style={{
          marginRight: 30,
          marginLeft: 30,
          marginTop: 'auto',
          marginBottom: hp('5%'),
        }}
      >
        {/* <Text style={{ ...styles.modalHeaderInfoText }}>
          Lorem ipsum dolor sit amet, consectetur{'\n'}adipiscing elit, sed do
          eiusmod tempor
        </Text> */}
      </View>
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag(true);
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag(false);
          (QrBottomSheet as any).current.snapTo(0);
        }}
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
        ref={QrBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('92%') : hp('91%'),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ResetTwoFASuccessBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={ServerNotRespondingBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderServerNotRespondingContent}
        renderHeader={renderServerNotRespondingHeader}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
    marginTop: 10,
    borderBottomColor: Colors.white,
    borderBottomWidth: 0.5,
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 10,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContentView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  modalHeaderContainer: {
    marginTop: 'auto',
    flex: 1,
    height: 20,
    borderTopLeftRadius: 10,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightWidth: 1,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  infoText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
});

export default SubAccountTFAHelpScreen;
