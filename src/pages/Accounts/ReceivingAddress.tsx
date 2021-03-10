import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Fonts from '../../common/Fonts';
import DeviceInfo from 'react-native-device-info';
import NavStyles from '../../common/Styles/NavStyles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import CopyThisText from '../../components/CopyThisText';
import { useDispatch, useSelector } from 'react-redux';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
} from '../../common/constants/wallet-service-types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import QRCode from 'react-native-qrcode-svg';
import { setReceiveHelper, setSavingWarning } from '../../store/actions/preferences';
import idx from 'idx';

const ReceivingAddress = (props) => {
  const [AsTrustedContact, setAsTrustedContact] = useState(false);
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const serviceType = props.navigation.getParam('serviceType');
  const [ReceiveHelperBottomSheet] = useState(
    React.createRef(),
  );
  const [
    SecureReceiveWarningBottomSheet,
  ] = useState(React.createRef());
  const dispatch = useDispatch();

  const { service } = useSelector(
    (state) => state.accounts[serviceType],
  );
  const { receivingAddress } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;
  const [isReceiveHelperDone, setIsReceiveHelperDone] = useState(true);
  const isReceiveHelperDoneValue =  useSelector((state) => idx(state, (_) => _.preferences.isReceiveHelperDoneValue));
  const savingWarning =  useSelector((state) => idx(state, (_) => _.preferences.savingWarning));

  const checkNShowHelperModal = async () => {
    let isReceiveHelperDone1 = isReceiveHelperDoneValue;

    if (!isReceiveHelperDone1 && serviceType == TEST_ACCOUNT) {
      dispatch(setReceiveHelper(true));
      setTimeout(() => {
        setIsReceiveHelperDone(true);
      }, 10);
      setTimeout(() => {
        if (ReceiveHelperBottomSheet.current)
          (ReceiveHelperBottomSheet.current as any).snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsReceiveHelperDone(false);
      }, 10);
    }
  };

  useEffect(() => {
    checkNShowHelperModal();
   // (async () => {
      if (serviceType === SECURE_ACCOUNT) {
        if (!savingWarning) { //(await AsyncStorage.getItem('savingsWarning'))
          // TODO: integrate w/ any of the PDF's health (if it's good then we don't require the warning modal)
          if (SecureReceiveWarningBottomSheet.current)
            (SecureReceiveWarningBottomSheet.current as any).snapTo(1);
            dispatch(setSavingWarning(true));
          //await AsyncStorage.setItem('savingsWarning', 'true');
        }
      }
  //  })();
  }, []);
  const renderReceiveHelperContents = useCallback(() => {
    return (
      <TestAccountHelperModalContents
        topButtonText={'Receiving bitcoin'}
        image={require('../../assets/images/icons/receive.png')}
        helperInfo={
          'For receiving bitcoin, you need to give an address to the sender. Mostly in form of a QR code. This is pretty much like an email address but your app generates a new one for you every time you want to do a transaction\n\nThe sender will scan this address or copy a long sequence of letters and numbers to send you the bitcoin or sats (a very small fraction of a bitcoin)\n\nNote that if you want to receive bitcoin/ sats from  "Friends and Family”, the app does all this for you and you don’t need to send a new address every time'
        }
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          if (props.navigation.getParam('serviceType') == TEST_ACCOUNT) {
            if (ReceiveHelperBottomSheet.current)
              (ReceiveHelperBottomSheet as any).current.snapTo(0);
            props.navigation.navigate('ReceivingAddress', {
              serviceType,
              getServiceType,
            });
          }
        }}
      />
    );
  }, [serviceType]);

  const renderReceiveHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          //console.log('isReceiveHelperDone', isReceiveHelperDone);
          if (isReceiveHelperDone) {
            if (ReceiveHelperBottomSheet.current)
              (ReceiveHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsReceiveHelperDone(false);
            }, 10);
          } else {
            if (ReceiveHelperBottomSheet.current)
              (ReceiveHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  const renderSecureReceiveWarningContents = useCallback(() => {
    return (
      <View style={styles.modalContainer}>
        <ScrollView>
          <View
            style={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('2%'),
            }}
          >
            <BottomInfoBox
              title={'Note'}
              infoText={
                "Please ensure that you have 2FA set up (preferably on your Keeper device). A 2FA code will be required to send bitcoin from the Savings Account."
              }
            />

            <View
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                flexDirection: 'row',
                marginTop: hp('1%'),
                marginBottom: hp('1%'),
              }}
            >
              <AppBottomSheetTouchableWrapper
                onPress={() => {
                  if (SecureReceiveWarningBottomSheet.current)
                    (SecureReceiveWarningBottomSheet as any).current.snapTo(0);
                }}
                style={{
                  ...styles.confirmButtonView,
                  backgroundColor: Colors.blue,
                  elevation: 10,
                  shadowColor: Colors.shadowBlue,
                  shadowOpacity: 1,
                  marginRight: 5,
                  shadowOffset: { width: 15, height: 15 },
                }}
              >
                <Text
                  style={{
                    color: Colors.white,
                    fontSize: RFValue(13),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  Ok, I understand
                </Text>
              </AppBottomSheetTouchableWrapper>
              <AppBottomSheetTouchableWrapper
                onPress={() => props.navigation.replace('ManageBackup')}
                style={{
                  ...styles.confirmButtonView,
                  width: wp('30%'),
                  marginLeft: 5,
                }}
              >
                <Text
                  style={{
                    color: Colors.blue,
                    fontSize: RFValue(13),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  Manage Backup
                </Text>
              </AppBottomSheetTouchableWrapper>
            </View>
            {/* <View style={{ flexDirection: 'row' }}>
              <Button
                title="Ok, I understand"
                onPress={() =>{
                  if(SecureReceiveWarningBottomSheet.current)
                  (SecureReceiveWarningBottomSheet as any).current.snapTo(0)
                }

                }
              />
              <Button
                title="Manage Backup"
                onPress={() => props.navigation.replace('ManageBackup')}
              />
            </View> */}
          </View>
        </ScrollView>
      </View>
    );
  }, [serviceType]);

  const renderSecureReceiveWarningHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.borderColor}
        backgroundColor={Colors.white}
        onPressHeader={() => {
          if (SecureReceiveWarningBottomSheet.current)
            (SecureReceiveWarningBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  // const dispatch = useDispatch();
  // useEffect(() => {
  //   if (!receivingAddress) dispatch(fetchAddress(serviceType));
  // }, [serviceType]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <TouchableWithoutFeedback
        onPress={() => {
          if (ReceiveHelperBottomSheet.current)
            (ReceiveHelperBottomSheet.current as any).snapTo(0);
        }}
      >
        <View style={NavStyles.modalContainer}>
          <View style={NavStyles.modalHeaderTitleView}>
            <View
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (getServiceType) {
                    getServiceType(serviceType);
                  }
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
              <Text style={NavStyles.modalHeaderTitleText}>
                Receiving Address
              </Text>
              {serviceType == TEST_ACCOUNT ? (
                <Text
                  onPress={() => {
                    dispatch(setReceiveHelper(true));
                    //AsyncStorage.setItem('isReceiveHelperDone', 'true');
                    if (ReceiveHelperBottomSheet.current)
                      (ReceiveHelperBottomSheet.current as any).snapTo(1);
                  }}
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(12),
                    marginLeft: 'auto',
                  }}
                >
                  Know more
                </Text>
              ) : null}
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
            <TouchableOpacity
              activeOpacity={10}
              onPress={() => {
                setAsTrustedContact(!AsTrustedContact);
              }}
              style={{
                flexDirection: 'row',
                borderRadius: 8,
                backgroundColor: Colors.backgroundColor,
                alignItems: 'center',
                marginLeft: 15,
                marginRight: 15,
                paddingLeft: 20,
                paddingRight: 15,
                marginTop: 30,
                width: wp('86%'),
                height: wp('13%'),
              }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Add sender to Friends and Family
              </Text>
              <View
                style={{
                  width: wp('7%'),
                  height: wp('7%'),
                  borderRadius: 7,
                  backgroundColor: Colors.white,
                  borderColor: Colors.borderColor,
                  borderWidth: 1,
                  marginLeft: 'auto',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {AsTrustedContact && (
                  <Entypo
                    name="check"
                    size={RFValue(17)}
                    color={Colors.green}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginBottom: hp('5%'),
            }}
          >
            <BottomInfoBox
              title={'Note'}
              infoText={
                'The QR code is your bitcoin address. The payer will scan it to send bitcoin. Alternatively copy the address displayed below it and send it to the payer'
              }
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ReceiveHelperBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('37%') : hp('42%'),
        ]}
        renderContent={renderReceiveHelperContents}
        renderHeader={renderReceiveHelperHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SecureReceiveWarningBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderSecureReceiveWarningContents}
        renderHeader={renderSecureReceiveWarningHeader}
      />
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
  confirmButtonView: {
    width: wp('40%'),
    height: wp('13%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default ReceivingAddress;
