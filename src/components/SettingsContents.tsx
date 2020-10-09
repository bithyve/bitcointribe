import React, { useState, useMemo } from 'react';
import { View, Image, Text, StyleSheet, Linking } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import CurrencyKindToggleSwitch from './CurrencyKindToggleSwitch';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import DeviceInfo from 'react-native-device-info';
import useCurrencyKind from '../utils/hooks/state-selectors/UseCurrencyKind';
import { useDispatch } from 'react-redux';
import { currencyKindSet } from '../store/actions/preferences';
import CurrencyKind from '../common/data/enums/CurrencyKind';
import useCurrencyCode from '../utils/hooks/state-selectors/UseCurrencyCode';


export default function SettingsContents(props) {
  const dispatch = useDispatch();
  const currencyCode = useCurrencyCode();
  const currencyKind: CurrencyKind = useCurrencyKind();

  const prefersBitcoin = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);


  const [PageData, setPageData] = useState([
    {
      title: 'Manage Passcode',
      info: 'Change your passcode',
      image: require('../assets/images/icons/managepin.png'),
      type: 'ManagePin',
    },
    {
      title: 'Change Currency',
      info: 'Choose your currency',
      image: require('../assets/images/icons/country.png'),
      type: 'ChangeCurrency',
    },
    {
      title: 'Hexa Release',
      info: 'Version ',
      image: require('../assets/images/icons/settings.png'),
      type: 'AboutApp',
    },
  ]);

  const openLink = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.modalHeaderTitleText}>{'Settings'}</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {PageData.map((item) => {
          return (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressManagePin(item.type, currencyCode)}
              style={styles.selectedContactsView}
            >
              <Image
                source={item.image}
                style={{
                  width: wp('7%'),
                  height: wp('7%'),
                  resizeMode: 'contain',
                  marginLeft: wp('3%'),
                  marginRight: wp('3%'),
                }}
              />
              <View
                style={{ justifyContent: 'center', marginRight: 10, flex: 1 }}
              >
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.infoText}>
                  {item.type == 'AboutApp'
                    ? item.info +
                      DeviceInfo.getVersion() +
                      ' (' +
                      DeviceInfo.getBuildNumber() +
                      ') '
                    : item.info}
                </Text>
              </View>
              <View style={{ marginLeft: 'auto' }}>
                {item.type == 'JumbleKeyboard' ? (
                  <CurrencyKindToggleSwitch
                    isNotImage={true}
                    trackColor={Colors.lightBlue}
                    thumbColor={Colors.blue}
                    onpress={() => {
                      dispatch(currencyKindSet(
                        prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
                      ));
                    }}
                    isOn={prefersBitcoin}
                  />
                ) : item.type != 'AboutApp' ? (
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{
                      marginLeft: wp('3%'),
                      marginRight: wp('3%'),
                      alignSelf: 'center',
                    }}
                  />
                ) : null}
              </View>
            </AppBottomSheetTouchableWrapper>
          );
        })}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          elevation: 10,
          shadowColor: Colors.borderColor,
          shadowOpacity: 10,
          shadowOffset: { width: 2, height: 2 },
          backgroundColor: Colors.white,
          justifyContent: 'space-around',
          height: 45,
          alignItems: 'center',
          marginLeft: 10,
          marginRight: 10,
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: hp('1%'),
          marginBottom: hp('6%'),
          borderRadius: 10,
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => openLink('http://hexawallet.io/faq')}
        >
          <Text style={styles.addModalTitleText}>FAQs</Text>
        </AppBottomSheetTouchableWrapper>

        <View
          style={{ height: 20, width: 1, backgroundColor: Colors.borderColor }}
        />
        <AppBottomSheetTouchableWrapper
          onPress={() => openLink('https://hexawallet.io/terms-of-service/')}
        >
          <Text style={styles.addModalTitleText}>Terms of Service</Text>
        </AppBottomSheetTouchableWrapper>
        <View
          style={{ height: 20, width: 1, backgroundColor: Colors.borderColor }}
        />
        <AppBottomSheetTouchableWrapper
          onPress={() => openLink('http://hexawallet.io/privacy-policy')}
        >
          <Text style={styles.addModalTitleText}>Privacy Policy</Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
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
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexView: {
    flex: 0.5,
    height: '100%',
    justifyContent: 'space-evenly',
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  infoText: {
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
  shareButtonView: {
    height: wp('8%'),
    width: wp('15%'),
    backgroundColor: Colors.backgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  pageTitle: {
    marginLeft: 30,
    color: Colors.blue,
    fontSize: RFValue(14),
    fontFamily: Fonts.FiraSansRegular,
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(14),
  },
});
