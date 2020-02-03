import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from 'react-native-slider';
import { useDispatch, useSelector } from 'react-redux';
import {
  transferST1,
  clearTransfer,
  transferST2,
  fetchTransactions,
  transferST3,
} from '../../store/actions/accounts';
import SendStatusModalContents from '../../components/SendStatusModalContents';
import TransparentHeaderModal from '../../components/TransparentHeaderModal';
import BottomSheet from 'reanimated-bottom-sheet';
import CustodianRequestOtpModalContents from '../../components/CustodianRequestOtpModalContents';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';

export default function Sell(props) {
  const getServiceType = props.navigation.state.params.getServiceType
    ? props.navigation.state.params.getServiceType
    : null;
  const serviceType = props.navigation.getParam('serviceType');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState();
  const [token, setToken] = useState('');
  const [description, setDescription] = useState('');
  const [sliderValue, setSliderValue] = useState(4);
  const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
    React.createRef(),
  );
  const [SellHelperBottomSheet, setSellHelperBottomSheet] = useState(
    React.createRef(),
  );
  const checkNShowHelperModal = async () => {
    let isSellHelperDone = await AsyncStorage.getItem('isSellHelperDone');
    if (!isSellHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isSellHelperDone', 'true');
      setTimeout(() => {
      SellHelperBottomSheet.current.snapTo(1);
    }, 1000);
    }
  };

  useEffect(() => {
    checkNShowHelperModal();
  }, []);

  const renderSellHelperContents = () => {
    return (
      <TestAccountHelperModalContents
        topButtonText={`Selling Bitcoins`}
        helperInfo={`You can also sell bitcoins to an exchange or a similar service provider. 
          You will typically get your local currency like the dollar ($) or the pound (£) in your 
          bank account after processing As the Test Bitcoins have no market value, you don’t need to sell them`}
        continueButtonText={'Ok, got it'}
        onPressContinue={() => {
          (SellHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };
  const renderSellHelperHeader = () => {
    return (
      <SmallHeaderModal
      borderColor={Colors.blue}
      backgroundColor={Colors.blue}
      onPressHeader={() => {
          (SellHelperBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={() => {SellHelperBottomSheet.current.snapTo(0)}}>
     
      <View style={styles.modalContentContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <ScrollView>
            <View style={styles.modalHeaderTitleView}>
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
                  style={{ height: 30, width: 30, justifyContent: 'center' }}
                >
                  <FontAwesome
                    name="long-arrow-left"
                    color={Colors.blue}
                    size={17}
                  />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitleText}>{'Sell'}</Text>
                {serviceType == TEST_ACCOUNT ? (
                  <Text
                    onPress={() => {
                      AsyncStorage.setItem('isSellHelperDone', 'true');
                      SellHelperBottomSheet.current.snapTo(2);
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
                alignItems: 'center',
              }}
            >
              <Text>Coming Soon!</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={SellHelperBottomSheet}
          snapPoints={[-50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
            ? hp('15%')
            : Platform.OS == 'android'
            ? hp('16%')
            : hp('15%'),
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('65%') : hp('75%'),]}
          renderContent={renderSellHelperContents}
          renderHeader={renderSellHelperHeader}
        />
      </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  contactNameInputImageView: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  confirmButtonView: {
    width: wp('50%'),
    height: wp('13%'),
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
