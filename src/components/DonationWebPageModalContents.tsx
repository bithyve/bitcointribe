import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import ToggleSwitch from './ToggleSwitch';
import Toast from '../components/Toast';
import { updateDonationPreferences } from '../store/actions/accounts';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
import config from '../bitcoin/HexaConfig';

export default function DonationWebPageModalContents(props) {
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [isDonationTotalEnable, setIsDonationTotalEnable] = useState(false);
  const [
    isDonationTransactionEnable,
    setIsDonationTransactionEnable,
  ] = useState(props.account.configuration.displayTransactions);
  const dispatch = useDispatch();
  useEffect(() => {
    setIsDonationTotalEnable(props.account.configuration.displayBalance);
    setIsDonationTransactionEnable(
      props.account.configuration.displayTransactions,
    );
  }, [props.account]);

  function writeToClipboard(link) {
    Clipboard.setString(link);
    Toast('Copied Successfully');
  }

  useEffect(() => {
    if (
      isDonationTotalEnable !== props.account.configuration.displayBalance ||
      isDonationTransactionEnable !==
        props.account.configuration.displayTransactions
    )
      setSaveEnabled(true);
    else setSaveEnabled(false);
  }, [
    isDonationTotalEnable,
    isDonationTransactionEnable,
    props.account.configuration,
  ]);

  const updatePreferences = useCallback(() => {
    const configuration = {
      displayBalance: isDonationTotalEnable,
      displayTransactions: isDonationTransactionEnable,
    };
    const { serviceType, accountNumber } = props;
    console.log({ serviceType, accountNumber });
    Toast('Your preferences would be updated shortly');
    dispatch(
      updateDonationPreferences(serviceType, accountNumber, configuration),
    );
  }, [
    isDonationTotalEnable,
    isDonationTransactionEnable,
    props.account.configuration,
  ]);

  return (
    <View style={styles.modalContentContainer}>
      <View style={{ height: '100%', marginHorizontal: wp('8%') }}>
        <View style={styles.successModalHeaderView}>
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(18),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Donation Webpage
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
        <View style={{ ...styles.rowContainer, marginTop: 10 }}>
          <Image
            style={styles.imageStyle}
            resizeMode="center"
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
            isNotImage={true}
            toggleColor={Colors.lightBlue}
            toggleCircleColor={
              isDonationTotalEnable ? Colors.blue : Colors.white
            }
            onpress={() => setIsDonationTotalEnable((prevState) => !prevState)}
            toggle={isDonationTotalEnable}
          />
        </View>
        <View style={styles.rowContainer}>
          <Image
            style={styles.imageStyle}
            resizeMode="center"
            source={require('../assets/images/icons/icon_donation_transactions.png')}
          />
          <View style={styles.textContainer}>
            <Text style={styles.titleTextStyle}>Donation Transactions</Text>
            <Text
              style={{
                ...styles.modalInfoText,
                marginTop: wp('1.2%'),
                color: Colors.lightTextColor,
              }}
            >
              Show the transactions set to the donation account
            </Text>
          </View>
          <ToggleSwitch
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
        <View style={styles.infoTextContainer}>
          <Text style={styles.titleTextStyle}>Donation Link</Text>
          <Text style={styles.modalInfoText}>
            When someone wants to donate, they can simply click on this link
            which will serve up the donation page
          </Text>
        </View>
        <View style={styles.deeplinkContainerStyle}>
          <Text
            style={{
              color: Colors.lightBlue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              paddingTop: 5,
            }}
            numberOfLines={1}
          >
            {`https://hexawallet.io/${
              config.APP_STAGE === 'app'
                ? 'donate'
                : config.APP_STAGE === 'sta'
                ? 'donate-stage'
                : 'donate-test'
            }/?donationid=` + props.account.id}
          </Text>
          <TouchableOpacity
            style={styles.copylinkContainerStyle}
            onPress={() =>
              writeToClipboard(
                `https://hexawallet.io/${
                  config.APP_STAGE === 'app'
                    ? 'donate'
                    : config.APP_STAGE === 'sta'
                    ? 'donate-stage'
                    : 'donate-test'
                }/?donationid=` + props.account.id,
              )
            }
          >
            <Image
              source={require('../assets/images/icons/icon_copy.png')}
              style={{ width: wp('10%'), height: wp('10%') }}
              resizeMode="center"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.titleTextStyle}>Embed Code</Text>
          <Text style={styles.modalInfoText}>
            If you have a website, simply copy this code on your site to start
            receiving donations
          </Text>
        </View>
        <View style={styles.deeplinkContainerStyle}>
          <Text
            style={{
              color: Colors.lightBlue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              paddingTop: 5,
            }}
            numberOfLines={1}
          >
            {`<iframe src="https://hexawallet.io/${
              config.APP_STAGE === 'app'
                ? 'donate'
                : config.APP_STAGE === 'sta'
                ? 'donate-stage'
                : 'donate-test'
            }/?donationid=${
              props.account.id
            }" width="400" height="600"></iframe>`}
          </Text>
          <TouchableOpacity
            style={styles.copylinkContainerStyle}
            onPress={() =>
              writeToClipboard(
                `<iframe src="https://hexawallet.io/${
                  config.APP_STAGE === 'app'
                    ? 'donate'
                    : config.APP_STAGE === 'sta'
                    ? 'donate-stage'
                    : 'donate-test'
                }/?donationid=${
                  props.account.id
                }" width="400" height="600"></iframe>`,
              )
            }
          >
            <Image
              source={require('../assets/images/icons/icon_copy.png')}
              style={{ width: wp('10%'), height: wp('10%') }}
              resizeMode="center"
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 30 }}>
          <AppBottomSheetTouchableWrapper
            style={{ ...styles.buttonStyle, opacity: !saveEnabled ? 0.5 : 1 }}
            disabled={!saveEnabled}
            onPress={() => {
              updatePreferences();
              props.close();
            }}
          >
            <Text style={styles.buttonText}>Save</Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginTop: wp('6%'),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  titleTextStyle: {
    color: Colors.blue,
    fontSize: RFValue(14),
    fontFamily: Fonts.FiraSansRegular,
  },
  rowContainer: {
    flexDirection: 'row',
    height: 70,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  imageStyle: {
    width: wp('12%'),
    height: wp('12%'),
    resizeMode: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: hp('1.2%'),
  },
  infoTextContainer: {
    marginTop: 20,
    marginHorizontal: hp('1.5%'),
  },
  buttonStyle: {
    height: 50,
    width: wp('40%'),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  deeplinkContainerStyle: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundColor,
    height: 50,
    borderRadius: 10,
    padding: 10,
  },
  copylinkContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    backgroundColor: '#E3E3E3',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    position: 'absolute',
    right: 0,
  },
});
