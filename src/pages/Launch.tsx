import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
  AsyncStorage,
  Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import Video from 'react-native-video';
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

export default function Launch(props) {
  const dispatch = useDispatch();
  const [
    ErrorBottomSheet,
    setErrorBottomSheet,
  ] = useState(React.createRef());

  useEffect(() => {
    dispatch(initializeDB());
  }, []);

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
              const requester = splits[3];
              if (splits[4] === 'sss') {
                if (splits[5] === 'ek') {
                  const custodyRequest = {
                    requester,
                    ek: splits[6],
                    uploadedAt: splits[7],
                  };
                  props.navigation.replace('Login', { custodyRequest });
                } else if (splits[5] === 'rk') {
                  const recoveryRequest = { requester, rk: splits[6] };
                  props.navigation.replace('Login', { recoveryRequest });
                }
              }
            }
          else props.navigation.replace('PasscodeConfirm');
        }, 3500);
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
