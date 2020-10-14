import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import CommonStyles from '../common/Styles/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottomInfoBox from '../components/BottomInfoBox';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../components/ModalHeader';
import WalletNameChangeSuccessModalContents from '../components/WalletNameChangeSuccessModalContents';

export default function SettingNewWalletName(props) {

  const [answerInputStyle, setAnswerInputStyle] = useState(styles.inputBox);
  const [
    WalletNameChangeSuccessBottomSheet,
    setWalletNameChangeSuccessBottomSheet,
  ] = useState(React.createRef());
  const [walletName, setNewWalletName] = useState('');

  const onPressProceed = () =>{
    props.navigation.replace('Home');
  }

  const renderWalletNameChangeSuccessContent = useCallback(() => {
    return (
      <WalletNameChangeSuccessModalContents
        modalRef={WalletNameChangeSuccessBottomSheet}
        title={`Wallet Name Changed Successfully`}
        info={""
          // 'Lorem ipsum dolor sit amet, consectetur\n\nsed do eiusmod tempor incididunt ut labore et'
        }
        proceedButtonText={'View Wallet'}
        onPressProceed={() => onPressProceed()}
        isIgnoreButton={false}
        isBottomImage={true}
        bottomImage={require('../assets/images/icons/illustration.png')}
      />
    );
  }, []);

  const renderWalletNameChangeSuccessHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
         // (WalletNameChangeSuccessBottomSheet as any).current.snapTo(0);
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
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitleText}>
              {'Change Wallet Name'}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerInfoText}>
            Please enter Wallet Name
          </Text>
          <View style={{ marginTop: 15 }}>
            <View
              style={{
                ...answerInputStyle,
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 15,
                borderColor: Colors.borderColor,
              }}
            >
              <TextInput
                style={styles.modalInputBox}
                placeholder={'Enter new wallet name'}
                placeholderTextColor={Colors.borderColor}
                value={walletName}
                autoCompleteType="off"
                textContentType="none"
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                onChangeText={(text) => {
                  text = text.replace(/[^a-z]/g, '');
                  setNewWalletName(text);
                }}
              />
            </View>
          </View>
        </View>
        <View>
          {/* <BottomInfoBox
            backgroundColor={Colors.white}
            title={'Note'}
            infoText={
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
            }
          /> */}
          <TouchableOpacity
            onPress={() => {
              (WalletNameChangeSuccessBottomSheet as any).current.snapTo(1);
            }}
            style={{
              backgroundColor: Colors.blue,
              width: wp('35%'),
              height: wp('13%'),
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 30,
              marginRight: 20,
              marginBottom: hp('3%'),
            }}
          >
            <Text
              style={{
                fontSize: RFValue(13),
                color: Colors.white,
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Confirm & Proceed
            </Text>
          </TouchableOpacity>
        </View>
        <BottomSheet
        enabledInnerScrolling={true}
        enabledGestureInteraction={false}
        ref={WalletNameChangeSuccessBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('35%'),
        ]}
        renderContent={renderWalletNameChangeSuccessContent}
        renderHeader={renderWalletNameChangeSuccessHeader}
      />
      </View>

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    width: '100%',
  },
  headerInfoText: {
    marginTop: hp('1.5%'),
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    marginLeft: 20,
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalContentView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
  },
});
