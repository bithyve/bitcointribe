import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';
import { useSelector, useDispatch } from 'react-redux';
import {
  generateSecondaryXpriv,
  resetTwoFA,
  twoFAResetted,
  secondaryXprivGenerated,
  clearTransfer,
} from '../../store/actions/accounts';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ErrorModalContents from '../../components/ErrorModalContents';
import ModalHeader from '../../components/ModalHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const LostTwoFA = props => {
  const additional = useSelector(state => state.accounts.additional);
  let generatedSecureXPriv;
  let resettedTwoFA;
  if (additional && additional.secure) {
    generatedSecureXPriv = additional.secure.xprivGenerated;
    resettedTwoFA = additional.secure.twoFAResetted;
  }
  const dispatch = useDispatch();
  const service = useSelector(state => state.accounts[SECURE_ACCOUNT].service);
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');

  useEffect(() => {
    if (generatedSecureXPriv) {
      dispatch(clearTransfer(SECURE_ACCOUNT));

      setTimeout(() => {
        props.navigation.navigate('Send', {
          serviceType: SECURE_ACCOUNT,
          netBalance:
            service.secureHDWallet.balances.balance +
            service.secureHDWallet.balances.unconfirmedBalance,
          sweepSecure: true,
        });
        dispatch(secondaryXprivGenerated(null));
      }, 1500);
    } else if (generatedSecureXPriv === false) {
      setTimeout(() => {
        setErrorMessageHeader('Invalid Secondary Mnemonic');
        setErrorMessage('Invalid Secondary Mnemonic, please try again');
      }, 2);
      (ErrorBottomSheet as any).current.snapTo(1);
      dispatch(secondaryXprivGenerated(null));
    }
  }, [generatedSecureXPriv]);

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
  }, [errorMessage,errorMessageHeader]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  useEffect(() => {
    if (resettedTwoFA) {
      props.navigation.navigate('TwoFASetup', {
        twoFASetup: service.secureHDWallet.twoFASetup,
        onPressBack: () => {
          dispatch(clearTransfer(SECURE_ACCOUNT));
          props.navigation.navigate('Accounts', {
            serviceType: SECURE_ACCOUNT,
            index: 2,
          });
        },
      });
      dispatch(twoFAResetted(null)); //resetting to monitor consecutive change
    } else if (resettedTwoFA === false) {
      setTimeout(() => {
        setErrorMessageHeader('Failed to reset 2FA');
        setErrorMessage(
          'The QR you have scanned seems to be invalid, pls try again',
        );
      }, 2);
      (ErrorBottomSheet as any).current.snapTo(1);
      dispatch(twoFAResetted(null));
    }
  }, [resettedTwoFA]);

  return (
    <View style={styles.screen}>
      <View
        style={{
          alignItems: 'center',
          margin: 40,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate('QrScanner', {
              title: 'Scan Secondary Mnemonic',
              scanedCode: qrData => {
                dispatch(resetTwoFA(qrData));
              },
            });
          }}
        >
          <Text>Reset 2FA</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          alignItems: 'center',
          margin: 40,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate('QrScanner', {
              title: 'Scan Secondary Mnemonic',
              scanedCode: qrData => {
                dispatch(generateSecondaryXpriv(SECURE_ACCOUNT, qrData));
              },
            });
          }}
        >
          <Text>Sweep Savings</Text>
        </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LostTwoFA;
