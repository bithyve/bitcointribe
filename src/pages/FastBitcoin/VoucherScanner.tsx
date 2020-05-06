import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ImageBackground,
} from 'react-native';
import Fonts from '../../common/Fonts';
import DeviceInfo from 'react-native-device-info';
import BackupStyles from '../ManageBackup/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNCamera } from 'react-native-camera';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import QuoteConfirmation from './QuoteConfirmation';
import VoucherRedeemSuccess from './VoucherRedeemSuccess';
import AccountVerification from './AccountVerification';

const VoucherScanner = (props) => {
  const [hideShow, setHideShow] = useState(false);
  const [openCameraFlag, setOpenCameraFlag] = useState(false);
  const barcodeRecognized = async (barcodes) => {
    if (barcodes.data) {
      setOpenCameraFlag(false);
    }
  };
  const [
    RegistrationSuccessBottomSheet,
    setRegistrationSuccessBottomSheet,
  ] = useState(React.createRef());
  const [QuoteBottomSheet, setQuoteBottomSheet] = useState(React.createRef());
  const [
    VoucherRedeemSuccessBottomSheet,
    setVoucherRedeemSuccessBottomSheet,
  ] = useState(React.createRef());
  const [
    AccountVerificationBottomSheet,
    setAccountVerificationBottomSheet,
  ] = useState(React.createRef());

  const accounts = [
    {
      accountType: REGULAR_ACCOUNT,
      accountName: 'Checking Account',
      amount: '5,000',
      image: require('../../assets/images/icons/icon_regular.png'),
    },
    {
      accountType: TEST_ACCOUNT,
      accountName: 'Test Account',
      amount: '2,000',
      image: require('../../assets/images/icons/icon_test.png'),
    },
    {
      accountType: SECURE_ACCOUNT,
      accountName: 'Saving Account',
      amount: '3,000',
      image: require('../../assets/images/icons/icon_secureaccount.png'),
    },
  ];
  const [selectedAccount, setSelectedAccount] = useState({
    accountType: REGULAR_ACCOUNT,
    accountName: 'Checking Account',
    amount: '5,000',
    image: require('../../assets/images/icons/icon_regular.png'),
  });

  const renderRegistrationSuccessModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={RegistrationSuccessBottomSheet}
        title={'Fast Bitcoin Account\nSuccessfully Registered'}
        info={'Lorem ipsum dolor sit amet, consectetur'}
        note={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore'
        }
        proceedButtonText={'Redeem Voucher'}
        onPressProceed={() => {
          (RegistrationSuccessBottomSheet as any).current.snapTo(0);
        }}
        isIgnoreButton={true}
        cancelButtonText={'Back'}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/illustration.png')}
      />
    );
  }, []);

  const renderRegistrationSuccessModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (RegistrationSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderQuoteModalContent = useCallback(() => {
    return (
      <QuoteConfirmation
        onPressRedeem={() => {}}
        onPressBack={() => {
          QuoteBottomSheet.current.snapTo(0);
        }}
        voucherNumber={'#123454567890'}
        purchasedFor={'17,000'}
        redeemAmount={'2,065,000'}
        bitcoinRate={'8,687.70'}
        loading={false}
      />
    );
  }, []);

  const renderQuoteModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (QuoteBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderVoucherRedeemSuccessModalContent = useCallback(() => {
    return (
      <VoucherRedeemSuccess
        onPressRedeem={() => {}}
        onPressBack={() => {
          VoucherRedeemSuccessBottomSheet.current.snapTo(0);
        }}
        accountName={selectedAccount.accountName}
        purchasedFor={'17,000'}
        redeemAmount={'2,065,000'}
        bitcoinRate={'8,687.70'}
        loading={false}
      />
    );
  }, []);

  const renderVoucherRedeemSuccessModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (VoucherRedeemSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderAccountVerificationModalContent = useCallback(() => {
    return (
      <AccountVerification link={'http://fastbitcoin/accountverificat…'} />
    );
  }, []);

  const renderAccountVerificationModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          AccountVerificationBottomSheet.current.snapTo(0);
        }}
      />
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={styles.backArrowView}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={BackupStyles.modalHeaderTitleText}>Voucher</Text>
        </View>
      </View>
      <View style={{ flex: 1, paddingTop: wp('5%'), position: 'relative' }}>
        {hideShow ? (
          <View style={styles.dropDownView}>
            {accounts.map((value) => {
              return (
                <TouchableOpacity
                  activeOpacity={10}
                  onPress={() => {
                    setHideShow(false);
                    setSelectedAccount(value);
                  }}
                  style={styles.dropDownElement}
                >
                  <Image
                    source={value.image}
                    style={{ width: wp('8%'), height: wp('8%') }}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.dropDownElementTitleText}>
                      {value.accountName}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                      }}
                    >
                      <Image
                        style={styles.cardBitCoinImage}
                        source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
                      />
                      <Text style={styles.cardAmountText}>{value.amount}</Text>
                      <Text style={styles.cardAmountUnitText}>sats</Text>
                    </View>
                  </View>
                  <View
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Entypo
                      name={'dots-three-horizontal'}
                      color={Colors.borderColor}
                      size={RFValue(13)}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
        {openCameraFlag ? (
          <View style={styles.cameraView}>
            <RNCamera
              ref={(ref) => {
                this.cameraRef = ref;
              }}
              style={styles.camera}
              onBarCodeRead={barcodeRecognized}
              captureAudio={false}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.topCornerView}>
                  <View style={styles.topLeftCornerView} />
                  <View style={styles.topRightCornerView} />
                </View>
                <View style={styles.bottomCornerView}>
                  <View style={styles.bottomLeftCornerView} />
                  <View style={styles.bottomRightCornerView} />
                </View>
              </View>
            </RNCamera>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setOpenCameraFlag(true)}>
            <ImageBackground
              source={require('../../assets/images/icons/iPhone-QR.png')}
              style={styles.cameraImage}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.topCornerView}>
                  <View style={styles.topLeftCornerView} />
                  <View style={styles.topRightCornerView} />
                </View>
                <View style={styles.bottomCornerView}>
                  <View style={styles.bottomLeftCornerView} />
                  <View style={styles.bottomRightCornerView} />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
        <View style={{ marginTop: 5 }}>
          <BottomInfoBox
            backgroundColor={Colors.white}
            title={'Note'}
            infoText={
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna'
            }
          />
        </View>
      </View>
      <View
        style={{
          marginBottom: wp('5%'),
        }}
      >
        <TouchableOpacity
          activeOpacity={10}
          onPress={() => {
            setHideShow(!hideShow);
          }}
          style={{ ...styles.dropDownElement, borderRadius: 10, margin: 20 }}
        >
          <Image
            source={selectedAccount.image}
            style={{ width: wp('8%'), height: wp('8%') }}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.dropDownElementTitleText}>
              {selectedAccount.accountName}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}
            >
              <Image
                style={styles.cardBitCoinImage}
                source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
              />
              <Text style={styles.cardAmountText}>
                {selectedAccount.amount}
              </Text>
              <Text style={styles.cardAmountUnitText}>sats</Text>
            </View>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Entypo
              name={'dots-three-horizontal'}
              color={Colors.borderColor}
              size={RFValue(13)}
            />
          </View>
        </TouchableOpacity>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={RegistrationSuccessBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderRegistrationSuccessModalContent}
        renderHeader={renderRegistrationSuccessModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={QuoteBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('55%') : hp('60%'),
        ]}
        renderContent={renderQuoteModalContent}
        renderHeader={renderQuoteModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={VoucherRedeemSuccessBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('55%') : hp('60%'),
        ]}
        renderContent={renderVoucherRedeemSuccessModalContent}
        renderHeader={renderVoucherRedeemSuccessModalHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={AccountVerificationBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderAccountVerificationModalContent}
        renderHeader={renderAccountVerificationModalHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  cameraView: {
    width: wp('100%'),
    height: wp('100%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  camera: {
    width: wp('100%'),
    height: wp('100%'),
  },
  topCornerView: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  bottomCornerView: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  topLeftCornerView: {
    borderLeftWidth: 1,
    borderTopColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderTopWidth: 1,
  },
  topRightCornerView: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderTopColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
  bottomLeftCornerView: {
    borderLeftWidth: 1,
    borderBottomColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderBottomWidth: 1,
  },
  bottomRightCornerView: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderBottomColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
  cameraImage: {
    width: wp('100%'),
    height: wp('100%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardBitCoinImage: {
    width: wp('4%'),
    height: wp('4%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('1%'),
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  dropDownElement: {
    backgroundColor: Colors.backgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: wp('5%'),
    paddingBottom: wp('5%'),
    paddingLeft: wp('3%'),
    paddingRight: wp('3%'),
    width: wp('90%'),
  },
  dropDownView: {
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    backgroundColor: Colors.white,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: 'hidden',
  },
  dropDownElementTitleText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginBottom: 5,
  },
});

export default VoucherScanner;
