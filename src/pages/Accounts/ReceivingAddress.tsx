import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Button,
  ScrollView,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from '../ManageBackup/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import QRCode from 'react-native-qrcode-svg';
import CopyThisText from '../../components/CopyThisText';
import { useDispatch, useSelector } from 'react-redux';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import { fetchAddress } from '../../store/actions/accounts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import BottomSheet from 'reanimated-bottom-sheet';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { RFValue } from 'react-native-responsive-fontsize';

const ReceivingAddress = props => {
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const serviceType = props.navigation.getParam('serviceType');
  const [ReceiveHelperBottomSheet, setReceiveHelperBottomSheet] = useState(
    React.createRef(),
  );
  const [
    SecureReceiveWarningBottomSheet,
    setSecureReceiveWarningBottomSheet,
  ] = useState(React.createRef());

  const { loading, service } = useSelector(
    state => state.accounts[serviceType],
  );
  const { receivingAddress } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;

  const checkNShowHelperModal = async () => {
    let isReceiveHelperDone = await AsyncStorage.getItem('isReceiveHelperDone');
    if (!isReceiveHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isReceiveHelperDone', 'true');
      setTimeout(() => {
        ReceiveHelperBottomSheet.current.snapTo(1);
      }, 1000);
    }
  };

  const renderReceiveHelperContents = useCallback(() => {
    return (
      <TestAccountHelperModalContents
        topButtonText={'Receiving Through the Test Account'}
        helperInfo={
          'For receiving bitcoins, you need to give an\naddress to the sender. Mostly in form of a QR\ncode.\n\nThis is pretty much like an email address but\nyour app generates a new one for you every time\nyou want to do a transaction.\n\nThe sender will scan this address or copy a long\nsequence of letters and numbers to send you the\nbitcoins or sats (a very small fraction of a\nbitcoin)\n\nNote that if you want to receive bitcoins/ sats\nfrom a “Trusted Contact”, the app does all this\nfor you and you don’t need to send a new\naddress every time.\n'
        }
        continueButtonText={'Continue'}
        quitButtonText={'Quit'}
        onPressContinue={() => {
          if (props.navigation.getParam('serviceType') == TEST_ACCOUNT) {
            (ReceiveHelperBottomSheet as any).current.snapTo(0);
            props.navigation.navigate('ReceivingAddress', {
              serviceType,
              getServiceType,
            });
          }
        }}
        onPressQuit={() => {
          (ReceiveHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, [serviceType]);

  const renderReceiveHelperHeader = useCallback(() => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          (ReceiveHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  const renderSecureReceiveWarningContents = useCallback(() => {
    return (
      <View style={styles.modalContainer}>
        <ScrollView>
          <View
            style={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('2%')
            }}
          >
            <BottomInfoBox
              title={'Note'}
              infoText={
                "Please ensure that you have 2FA setted up (preferably on your secondary device), you'll require the 2FA token in order to send bitcoins from the savings account."
              }
            />
            <View style={{ flexDirection: 'row' }}>
              <Button
                title="Ok, I understand"
                onPress={() =>
                  (SecureReceiveWarningBottomSheet as any).current.snapTo(0)
                }
              />
              <Button
                title="Manage Backup"
                onPress={() => props.navigation.replace('ManageBackup')}
              />
            </View>
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
          (SecureReceiveWarningBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  useEffect(() => {
    checkNShowHelperModal();
  }, []);

  const dispatch = useDispatch();
  useEffect(() => {
    if (!receivingAddress) dispatch(fetchAddress(serviceType));
  }, [serviceType]);

  useEffect(() => {
    (async () => {
      if (serviceType === SECURE_ACCOUNT) {
        if (!(await AsyncStorage.getItem('savingsWarning'))) {
        // TODO: integrate w/ any of the PDF's health (if it's good then we don't require the warning modal)
        SecureReceiveWarningBottomSheet.current.snapTo(1);
        await AsyncStorage.setItem('savingsWarning', 'true');
         }
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.modalContainer}>
        <View style={BackupStyles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                if (getServiceType) {
                  getServiceType(serviceType);
                }
                props.navigation.goBack();
              }}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Text style={BackupStyles.modalHeaderTitleText}>
              Receiving Address
            </Text>
            {serviceType == TEST_ACCOUNT ? (
              <Text
                onPress={() => {
                  AsyncStorage.setItem('isReceiveHelperDone', 'true');
                  ReceiveHelperBottomSheet.current.snapTo(1);
                }}
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  marginLeft: 'auto',
                }}
              >
                Know More
              </Text>
            ) : null}
          </View>
        </View>
        <View style={BackupStyles.modalContentView}>
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
          <BottomInfoBox
            title={'Note'}
            infoText={
              'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna'
            }
          />
        </View>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={ReceiveHelperBottomSheet}
          snapPoints={[-50, hp('95%')]}
          renderContent={renderReceiveHelperContents}
          renderHeader={renderReceiveHelperHeader}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SecureReceiveWarningBottomSheet}
          snapPoints={[-50, hp('50%')]}
          renderContent={renderSecureReceiveWarningContents}
          renderHeader={renderSecureReceiveWarningHeader}
        />
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
    paddingBottom: hp('5%'),
    elevation: 10,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default ReceivingAddress;
