import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ToggleSwitch from './ToggleSwitch';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import Toast from './Toast';
import { updateDonationPreferences } from '../store/actions/accounts';
import { useDispatch } from 'react-redux';

export default function SettingDonationWebPageContents(props) {
  const [isDonationTotalEnable, setIsDonationTotalEnable] = useState(
    props.account.configuration.displayBalance,
  );
  const [
    isDonationTransactionEnable,
    setIsDonationTransactionEnable,
  ] = useState(props.account.configuration.displayTransactions);
  const [isTransactionDetailsEnable, setIsTransactionDetails] = useState(false);

  const [doneeName, setDoneeName] = useState(
    props.account.donee ? props.account.donee : '',
  );
  const [description, setDescription] = useState(
    props.account.description ? props.account.description : '',
  );
  const [cause, setCause] = useState(
    props.account.subject ? props.account.subject : '',
  );
  const [isDonationPause, setIsDonationPause] = useState(
    props.account.disableAccount ? props.account.disableAccount : false,
  );
  const dispatch = useDispatch();

  const updatePreferences = () => {
    let preferences;

    if (isDonationPause !== props.account.disableAccount) {
      preferences = preferences
        ? { ...preferences, disableAccount: isDonationPause }
        : { disableAccount: isDonationPause };
    }

    if (
      isDonationTotalEnable !== props.account.configuration.displayBalance ||
      isDonationTransactionEnable !==
        props.account.configuration.displayTransactions
    ) {
      const configuration = {
        displayBalance: isDonationTotalEnable,
        displayTransactions: isDonationTransactionEnable,
      };

      preferences = preferences
        ? { ...preferences, configuration }
        : { configuration };
    }

    if (
      doneeName !== props.account.donee ||
      description !== props.account.description ||
      cause !== props.account.subject
    ) {
      const accountDetails = {
        donee: doneeName,
        subject: cause,
        description,
      };
      preferences = preferences
        ? { ...preferences, accountDetails }
        : { accountDetails };
    }

    const { serviceType, accountNumber } = props;

    if (preferences) {
      Toast('Your preferences would be updated shortly');
      dispatch(
        updateDonationPreferences(serviceType, accountNumber, preferences),
      );
    }
  };

  return (
    <View style={styles.modalContentContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <ScrollView>
          <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppBottomSheetTouchableWrapper
                onPress={() => props.onPressBack()}
                style={{ height: 30, width: 30, justifyContent: 'center' }}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </AppBottomSheetTouchableWrapper>
              <View>
                <Text style={styles.modalHeaderTitleText}>
                  {'Change settings'}
                </Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp('1.5%'),
                    color: Colors.lightTextColor,
                  }}
                >
                  Settings for the Donation web view
                </Text>
              </View>
            </View>
            <AppBottomSheetTouchableWrapper
              onPress={() => {
                updatePreferences();
                props.onPressBack();
              }}
              style={{
                height: wp('8%'),
                width: wp('18%'),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.lightBlue,
                justifyContent: 'center',
                borderRadius: 8,
                alignSelf: 'center',
                marginLeft: 'auto',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Done
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
          <View style={{ paddingLeft: 20, paddingRight: 20 }}>
            <View style={styles.modalTextBoxView}>
              <TextInput
                style={styles.textBox}
                placeholder={'Enter cause'}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                value={cause}
                onChangeText={(text) => {
                  setCause(text);
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
              />
            </View>

            <View style={styles.modalTextBoxView}>
              <TextInput
                style={styles.textBox}
                placeholder={'Enter donee name'}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                value={doneeName}
                onChangeText={(text) => {
                  setDoneeName(text);
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
              />
            </View>
            <View style={{ ...styles.modalTextBoxView, height: wp('20%') }}>
              <TextInput
                style={{
                  ...styles.textBox,
                  paddingRight: 20,
                  marginTop: 10,
                  marginBottom: 10,
                }}
                placeholder={'Enter a description'}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                multiline={true}
                numberOfLines={4}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
              />
            </View>

            <View style={{ ...styles.rowContainer, marginTop: 10 }}>
              <Image
                style={styles.imageStyle}
                source={require('../assets/images/icons/icon_donation_total.png')}
              />
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Donation Total</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp('1.2%'),
                    color: Colors.lightTextColor,
                  }}
                >
                  Show the total funds received for the donation
                </Text>
              </View>
              <ToggleSwitch
                changeSettingToggle={true}
                toggleSize={wp('6%')}
                isNotImage={true}
                toggleColor={Colors.lightBlue}
                toggleCircleColor={
                  isDonationTotalEnable ? Colors.blue : Colors.white
                }
                onpress={() =>
                  setIsDonationTotalEnable((prevState) => !prevState)
                }
                toggle={isDonationTotalEnable}
              />
            </View>
            <View style={styles.rowContainer}>
              <Image
                style={styles.imageStyle}
                source={require('../assets/images/icons/icon_donation_transactions.png')}
              />
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Show Transactions</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp('1.2%'),
                    color: Colors.lightTextColor,
                  }}
                >
                  Show / hide transactions on web view
                </Text>
              </View>
              <ToggleSwitch
                changeSettingToggle={true}
                toggleSize={wp('6%')}
                isNotImage={true}
                toggleColor={Colors.lightBlue}
                toggleCircleColor={
                  isDonationTransactionEnable ? Colors.blue : Colors.white
                }
                onpress={() =>
                  setIsDonationTransactionEnable((prevState) => !prevState)
                }
                toggle={isDonationTransactionEnable}
              />
            </View>

            <View style={styles.rowContainer}>
              <View
                style={{
                  ...styles.circleShapeView,
                  backgroundColor: Colors.lightBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: RFValue(20),
                    color: Colors.white,
                    lineHeight: RFValue(20), //... One for top and one for bottom alignment
                  }}
                >
                  @
                </Text>
              </View>
              {/* <Image
                style={styles.imageStyle}
                source={require('../assets/images/icons/icon_donation_transactions.png')}
              /> */}
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Hide Transaction ID</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp('1.2%'),
                    color: Colors.lightTextColor,
                  }}
                >
                  Show / hide transaction ID on the web view
                </Text>
              </View>
              <ToggleSwitch
                changeSettingToggle={true}
                toggleSize={wp('6%')}
                isNotImage={true}
                toggleColor={Colors.lightBlue}
                toggleCircleColor={
                  isTransactionDetailsEnable ? Colors.blue : Colors.white
                }
                onpress={() =>
                  setIsTransactionDetails((prevState) => !prevState)
                }
                toggle={isTransactionDetailsEnable}
              />
            </View>

            <View style={styles.rowContainer}>
              <View
                style={{
                  ...styles.circleShapeView,
                  backgroundColor: Colors.lightBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  style={{
                    ...styles.imageStyle,
                    height: wp('7%'),
                    width: wp('7%'),
                  }}
                  source={require('../assets/images/icons/icon_donation_white.png')}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Pause Donation</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp('1.2%'),
                    color: Colors.lightTextColor,
                  }}
                >
                  Pause Donation
                </Text>
              </View>
              <ToggleSwitch
                changeSettingToggle={true}
                toggleSize={wp('6%')}
                isNotImage={true}
                toggleColor={Colors.lightBlue}
                toggleCircleColor={isDonationPause ? Colors.blue : Colors.white}
                onpress={() => setIsDonationPause((prevState) => !prevState)}
                toggle={isDonationPause}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  circleShapeView: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('8%') / 2,
    borderColor: Colors.lightBlue,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
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
  modalTextBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: wp('13%'),
    marginVertical: 10,
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
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  rowContainer: {
    flexDirection: 'row',
    height: 70,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  imageStyle: {
    width: wp('8%'),
    height: wp('8%'),
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: hp('1.2%'),
  },
  infoTextContainer: {
    marginTop: 20,
    marginHorizontal: hp('1.5%'),
  },
  titleTextStyle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
});
