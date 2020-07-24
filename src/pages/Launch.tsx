import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
  AsyncStorage,
  Platform,
  AppState,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Video from 'react-native-video';
import moment from 'moment';
import Colors from '../common/Colors';

import { initializeDB } from '../store/actions/storage';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ErrorModalContents from '../components/ErrorModalContents';
import ModalHeader from '../components/ModalHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import config from '../bitcoin/HexaConfig';
import { isCompatible } from './Home';
import { useSelector } from 'react-redux'
import { updatePreference } from '../store/actions/preferences';



export default function Launch(props) {
  const dispatch = useDispatch();
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const preferences = useSelector((state) => state.preferences)
  useEffect(() => {
    dispatch(initializeDB());
  }, []);


  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
  }, []);



  let isNavigate = false;
  let isContactOpen = false;
  let isCameraOpen = false;
  const handleAppStateChange = async (nextAppState) => {
    AsyncStorage.multiGet(['isContactOpen', 'isCameraOpen']).then(
      (response) => {
        isContactOpen = JSON.parse(response[0][1]);
        isCameraOpen = JSON.parse(response[1][1]);
      },
    );
    let keyArray = [
      ['isCameraOpen', JSON.stringify(true)],
      ['isContactOpen', JSON.stringify(true)],
    ];
    if (isCameraOpen) keyArray[0][1] = JSON.stringify(false);
    if (isContactOpen) keyArray[1][1] = JSON.stringify(false);
    if (isContactOpen || isContactOpen) {
      AsyncStorage.multiSet(keyArray, () => { });
      return;
    }
    var blockApp = setTimeout(() => {
      if (isNavigate) {
        props.navigation.navigate('ReLogin');
      }
    }, 1000);
    if (
      Platform.OS == 'android'
        ? nextAppState == 'active'
        : nextAppState == 'inactive' || nextAppState == 'background'
    ) {
      clearTimeout(blockApp);
      isNavigate = true; // producing a subtle delay to let deep link event listener make the first move
    } else {
      isNavigate = false;
    }
  };

  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={'Login error'}
        info={'Error while loging in, please try again'}
        proceedButtonText={'Open Setting'}
        isIgnoreButton={true}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        onPressIgnore={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../assets/images/icons/errorImage.png')}
      />
    );
  }, []);

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
    (async () => {
      try {
        const url = await Linking.getInitialURL();
        setTimeout(async () => {
          if (await AsyncStorage.getItem('hasCreds'))
            if (!url) props.navigation.replace('Login');
            else {
              const splits = url.split('/');
              if (splits[5] === 'sss') {
                const requester = splits[4];
                if (splits[6] === 'ek') {
                  const custodyRequest = {
                    requester,
                    ek: splits[7],
                    uploadedAt: splits[8],
                  };
                  props.navigation.replace('Login', { custodyRequest });
                } else if (splits[6] === 'rk') {
                  const recoveryRequest = { requester, rk: splits[7] };
                  props.navigation.replace('Login', { recoveryRequest });
                }
              } else if (
                splits[4] === 'tc' ||
                splits[4] === 'tcg' ||
                splits[4] === 'ptc'
              ) {
                if (splits[3] !== config.APP_STAGE) {
                  Alert.alert(
                    'Invalid deeplink',
                    `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
                    splits[3]
                    }`,
                  );
                } else {
                  const version = splits.pop().slice(1);
                  if (version) {
                    if (!(await isCompatible(splits[4], version))) return;
                  }

                  const trustedContactRequest = {
                    isGuardian: splits[4] === 'tcg' ? true : false,
                    isPaymentRequest: splits[4] === 'ptc' ? true : false,
                    requester: splits[5],
                    encryptedKey: splits[6],
                    hintType: splits[7],
                    hint: splits[8],
                    uploadedAt: splits[9],
                  };
                  props.navigation.replace('Login', {
                    trustedContactRequest,
                  });
                }
              } else if (splits[4] === 'rk') {
                const recoveryRequest = {
                  isRecovery: true,
                  requester: splits[5],
                  encryptedKey: splits[6],
                  hintType: splits[7],
                  hint: splits[8],
                };
                props.navigation.replace('Login', { recoveryRequest });
              } else if (splits[4] === 'rrk') {
                Alert.alert(
                  'Restoration link Identified',
                  'Restoration links only works during restoration mode',
                );
              } else if (url.includes('fastbitcoins')) {
                const userKey = url.substr(url.lastIndexOf('/') + 1);
                props.navigation.navigate('Login', { userKey });
              } else {
                const EmailToken = url.substr(url.lastIndexOf('/') + 1);
                console.log('EmailToken', EmailToken);
                props.navigation.navigate('SignUpDetails', { EmailToken });
              }
            }
          else props.navigation.replace('PasscodeConfirm');
        }, 4000);
      } catch (err) {
        (ErrorBottomSheet as any).current.snapTo(1);
        //Alert.alert('An err occured', err);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={require('./../assets/video/splash_animation.mp4')}
        style={{
          flex: 1,
        }}
        muted={true}
        repeat={false}
        resizeMode={'cover'}
        rate={1.0}
        ignoreSilentSwitch={'obey'}
      />
      <StatusBar
        backgroundColor={'white'}
        hidden={true}
        barStyle="dark-content"
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
