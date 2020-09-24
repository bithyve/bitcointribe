import React, { Component } from 'react';
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
import config from '../bitcoin/HexaConfig';
<<<<<<< HEAD
import { isCompatible } from './Home';
import { connect } from 'react-redux';
=======
import { isCompatible } from './Home/Home';
import { connect } from 'react-redux'
>>>>>>> 71bb8e47... Move `Home.tsx` into directory and separate out `TrustedContactRequestContent`

interface HomePropsTypes {
  initializeDB: any;
  navigation: any;
  lastSeen: any;
}

interface HomeStateTypes {}

class Launch extends Component<HomePropsTypes, HomeStateTypes> {
  errorBottomSheet: any;
  constructor(props) {
    super(props);
    this.errorBottomSheet = React.createRef();
  }

  componentDidMount = () => {
    this.props.initializeDB();
    // AppState.addEventListener("change", this.handleAppStateChange);
    this.handleDeeplink();
  };

  handleAppStateChange = async (nextAppState) => {
    // no need to trigger login screen if accounts are not synced yet
    // which means user hasn't logged in yet
    let walletExists = await AsyncStorage.getItem('walletExists');
    let lastSeen = await AsyncStorage.getItem('lastSeen');
    if (!walletExists) {
      return;
    }

    if (Platform.OS === 'android' && nextAppState === 'background') {
      // if no last seen don't do anything
      if (lastSeen) {
        this.props.navigation.navigate('Intermediate');
        return;
      }
      return;
    }

    if (
      Platform.OS === 'ios' &&
      (nextAppState === 'inactive' || nextAppState == 'background')
    ) {
      // if no last seen don't do anything
      if (lastSeen) {
        this.props.navigation.navigate('Intermediate');
        return;
      }

      return;
    }
  };

  handleDeeplink = async () => {
    try {
      const url = await Linking.getInitialURL();
      setTimeout(async () => {
        if (await AsyncStorage.getItem('hasCreds'))
          if (!url) this.props.navigation.replace('Login');
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
                this.props.navigation.replace('Login', { custodyRequest });
              } else if (splits[6] === 'rk') {
                const recoveryRequest = { requester, rk: splits[7] };
                this.props.navigation.replace('Login', { recoveryRequest });
              }
            } else if (['tc', 'tcg', 'atcg', 'ptc'].includes(splits[4])) {
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
                  isGuardian: ['tcg', 'atcg'].includes(splits[4]),
                  approvedTC: splits[4] === 'atcg' ? true : false,
                  isPaymentRequest: splits[4] === 'ptc' ? true : false,
                  requester: splits[5],
                  encryptedKey: splits[6],
                  hintType: splits[7],
                  hint: splits[8],
                  uploadedAt: splits[9],
                  version,
                };

                this.props.navigation.replace('Login', {
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
              this.props.navigation.replace('Login', { recoveryRequest });
            } else if (splits[4] === 'rrk') {
              Alert.alert(
                'Restoration link Identified',
                'Restoration links only works during restoration mode',
              );
            } else if (url.includes('fastbitcoins')) {
              const userKey = url.substr(url.lastIndexOf('/') + 1);
              this.props.navigation.navigate('Login', { userKey });
            } else {
              const EmailToken = url.substr(url.lastIndexOf('/') + 1);
              console.log('EmailToken', EmailToken);
              this.props.navigation.navigate('SignUpDetails', { EmailToken });
            }
          }
        else this.props.navigation.replace('PasscodeConfirm');
      }, 4000);
    } catch (err) {
      (this.errorBottomSheet as any).current.snapTo(1);
    }
  };

  render() {
    console.log('lastSeen', this.props.lastSeen);
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
          ref={this.errorBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('35%')
              : hp('40%'),
          ]}
          renderContent={() => (
            <ErrorModalContents
              modalRef={this.errorBottomSheet}
              title={'Login error'}
              info={'Error while loging in, please try again'}
              proceedButtonText={'Open Setting'}
              isIgnoreButton={true}
              onPressProceed={() => {
                (this.errorBottomSheet as any).current.snapTo(0);
              }}
              onPressIgnore={() => {
                (this.errorBottomSheet as any).current.snapTo(0);
              }}
              isBottomImage={true}
              bottomImage={require('../assets/images/icons/errorImage.png')}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                (this.errorBottomSheet as any).current.snapTo(0);
              }}
            />
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});

<<<<<<< HEAD
export default connect(null, { initializeDB })(Launch);
=======



export default connect(null, { initializeDB })(Launch)
>>>>>>> 71bb8e47... Move `Home.tsx` into directory and separate out `TrustedContactRequestContent`
