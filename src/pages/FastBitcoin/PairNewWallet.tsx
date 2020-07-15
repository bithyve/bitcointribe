import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ImageBackground,
  AsyncStorage,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  BackHandler,
} from 'react-native';
import Fonts from '../../common/Fonts';
import DeviceInfo from 'react-native-device-info';
import BackupStyles from '../ManageBackup/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNCamera } from 'react-native-camera';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import {
  accountSync,
  ClearAccountSyncData,
  accountSyncFail,
} from '../../store/actions/fbtc';
import Loader from '../../components/loader';
import moment from 'moment';
import BottomInfoBox from '../../components/BottomInfoBox';
import {
  storeFbtcData
} from '../../store/actions/fbtc';

import {isEmpty} from '../../common/CommonFunctions/index';

const PairNewWallet = (props) => {
  const FBTCAccountData = useSelector((state) => state.fbtc.FBTCAccountData);
  const [FBTCAccount_Data, setFBTCAccount_Data] = useState({});
  const userKey1 = props.navigation.state.params
    ? props.navigation.state.params.userKey
    : '';
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [openCameraFlag, setOpenCameraFlag] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [userKey, setUserKey] = useState(userKey1);
  const accountsSyncFail = useSelector((state) => state.fbtc.accountSyncFail);
  const accountSyncFailMessage = useSelector(
    (state) => state.fbtc.accountSyncFailMessage,
  );
   const dispatch = useDispatch();
  const accountSyncDetails = useSelector(
    (state) => state.fbtc.accountSyncDetails,
  );
  const [errorTitle, setErrorTitle] = useState('');
  const [errorInfo, setErrorInfo] = useState('');
  const [errorNote, setErrorNote] = useState('');
  const [errorProccedButtonText, setErrorProccedButtonText] = useState('');
  const [showLoader, setShowLoader] = useState(false);

  
  const [ErrorModalBottomSheet, setErrorModalBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const [
    RegistrationSuccessBottomSheet,
    setRegistrationSuccessBottomSheet,
  ] = useState(React.createRef<BottomSheet>());

  const [selectedAccount, setSelectedAccount] = useState({});

  useEffect(() => {
    if(FBTCAccountData){
      //console.log("FBTCAccountData------- in useEffect", FBTCAccountData)
      setFBTCAccount_Data(FBTCAccountData);
    }
  }, [FBTCAccountData]);

  useEffect(() => {
    (async () => {
      let FBTCAccountData = FBTCAccount_Data;
      // JSON.parse(
      //   await AsyncStorage.getItem('FBTCAccount'),
      // );
      if (FBTCAccountData && FBTCAccountData.user_key) {
        setIsUserRegistered(true);
      }
      if (!userKey && FBTCAccountData) {
        setUserKey(FBTCAccountData.user_key);
      }
      if(userKey1 && !isUserRegistered){
        setUserKey(userKey1);
      }
    })();
    BackHandler.addEventListener('hardwareBackPress', hardwareBackHandler);
        return () =>
          BackHandler.removeEventListener(
            'hardwareBackPress',
            hardwareBackHandler,
          );
  }, []);

  const hardwareBackHandler = () => {
    props.navigation.pop(2);
  }; 

  useEffect(() => {
    if (voucherCode) {
        if (isUserRegistered) return;
        else {
          if (voucherCode.length == 36 && !isUserRegistered)
            setUserKey(voucherCode);
            else return;
        }
    }
  }, [voucherCode]);

  const barcodeRecognized = async (barcodes) => {
      if (barcodes.data && barcodes.data.length == 36) {
      setVoucherCode(barcodes.data);
      }
      setOpenCameraFlag(false);
  };

  useEffect(() => {
    if (userKey) createFBTCAccount();
  }, [userKey]);

  const createFBTCAccount = async () => {
    let FBTCAccountData = FBTCAccount_Data; 
    //console.log('FBTCAccountData', FBTCAccountData);

    //JSON.parse(await AsyncStorage.getItem('FBTCAccount'));
    let obj;
    if (isEmpty(FBTCAccountData)) {
      obj = {
        user_key: userKey,
        registrationDate: moment(new Date()).valueOf(),
        test_account: {
          voucher: [],
        },
        checking_account: {
          voucher: [],
        },
        saving_account: {
          voucher: [],
        },
      };
    } else {
      //console.log('FBTCAccountData in else', FBTCAccountData);
      obj = FBTCAccountData;
    }
    //console.log('obj', obj);
    dispatch(storeFbtcData(obj));
    await AsyncStorage.setItem('FBTCAccount', JSON.stringify(obj));
    if (
      !obj.hasOwnProperty('redeem_vouchers') &&
      !obj.hasOwnProperty('exchange_balances') &&
      !obj.hasOwnProperty('sell_bitcoins')
    )
      checkAuth();
  };

  const checkAuth = () => {
    let data = {
      userKey: userKey,
    };
    setShowLoader(true);
    dispatch(accountSync(data));
  };

  useEffect(() => {
    if (accountSyncDetails) {
      //console.log("FBTCAccount_Data accountSync", FBTCAccount_Data);
      (async () => {
        let FBTCAccountData = FBTCAccount_Data;
        // JSON.parse(
        //   await AsyncStorage.getItem('FBTCAccount'),
        // );
        let obj;
        if (FBTCAccountData) {
          obj = {
            ...FBTCAccountData,
            redeem_vouchers: accountSyncDetails.redeem_vouchers,
            exchange_balances: accountSyncDetails.exchange_balances,
            sell_bitcoins: accountSyncDetails.sell_bitcoins,
          };
          dispatch(storeFbtcData(obj));
          await AsyncStorage.setItem('FBTCAccount', JSON.stringify(obj));
        }
        if (accountSyncDetails.redeem_vouchers) {
          setTimeout(() => {
            (RegistrationSuccessBottomSheet as any).current.snapTo(1);
          }, 2);
          setShowLoader(false);
          dispatch(ClearAccountSyncData());
        }
      })();
    }
  }, [accountSyncDetails, FBTCAccount_Data]);

  const renderRegistrationSuccessModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={RegistrationSuccessBottomSheet}
        title={'Fast Bitcoin Account\nSuccessfully Registered'}
        info={'FastBitcoins successfully registered'}
        note={
          'Congratulations, your wallet has been successfully linked to your FastBitcoins account. Now you can proceed to redeem your vouchers'
        }
        proceedButtonText={'Redeem Voucher'}
        onPressProceed={async () => {
          let FBTCAccountData = FBTCAccount_Data;
          // JSON.parse(
          //   await AsyncStorage.getItem('FBTCAccount'),
          // );
          if (FBTCAccountData && FBTCAccountData.redeem_vouchers) {
            (RegistrationSuccessBottomSheet as any).current.snapTo(0);
            props.navigation.replace("VoucherScanner");
          }
        }}
        isIgnoreButton={true}
        cancelButtonText={'Back'}
        onPressIgnore={() => {}}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/illustration.png')}
      />
    );
  }, [FBTCAccount_Data]);

  const renderRegistrationSuccessModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (RegistrationSuccessBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  useEffect(() => {
    if (accountsSyncFail && accountSyncFailMessage) {
      setTimeout(() => {
        setErrorTitle(accountSyncFailMessage);
        setErrorProccedButtonText('Done');
      }, 2);
      (ErrorModalBottomSheet as any).current.snapTo(1);
      let data = {
        accountSyncFail: false,
        accountSyncFailMessage: '',
      };
      dispatch(accountSyncFail(data));
    }
  }, [accountsSyncFail, accountSyncFailMessage]);

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorModalBottomSheet}
        title={errorTitle}
        info={errorInfo}
        note={errorNote}
        proceedButtonText={errorProccedButtonText}
        onPressProceed={() => {
          (ErrorModalBottomSheet as any).current.snapTo(0);
        }}
        isIgnoreButton={true}
        cancelButtonText={'Back'}
        onPressIgnore={() => {
          (ErrorModalBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../assets/images/icons/reject.png')}
      />
    );
  }, [errorTitle, errorInfo, errorNote, errorProccedButtonText]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorModalBottomSheet as any).current.snapTo(0);
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
              props.navigation.pop(2);
            }}
            style={styles.backArrowView}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={BackupStyles.modalHeaderTitleText}>
          Pair a new wallet
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: wp('5%'), position: 'relative' }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={{ height: '100%' }}>
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
              <TouchableOpacity
                onPress={() => setOpenCameraFlag(true)}
                style={{ alignSelf: 'center' }}
              >
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
            <TextInput
              placeholder={'Enter the code'}
              placeholderTextColor={Colors.borderColor}
              style={styles.qrModalTextInput}
              autoCorrect={false}
              onChangeText={(text) => {
                setVoucherCode(text);
              }}
              value={voucherCode}
            />
          </View>
        </ScrollView>
        {showLoader ? <Loader /> : null}
        <BottomInfoBox
          title={'Pair Hexa with FastBitcoins'}
          infoText={
            'Scan the QR provided on your FastBitcoins account to pair your Hexa wallet'
          }
        />
        
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
        ref={ErrorModalBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
      </KeyboardAvoidingView>
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
    width: wp('90%'),
    height: wp('90%'),
    overflow: 'hidden',
    borderRadius: 20,
    alignSelf: 'center',
  },
  camera: {
    width: wp('90%'),
    height: wp('90%'),
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
    width: wp('90%'),
    height: wp('90%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
 
  qrModalTextInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    height: 50,
    margin: 20,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansMedium,
    marginTop: wp('10%'),
  },
});

export default PairNewWallet;
