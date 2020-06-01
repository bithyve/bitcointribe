import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';

export default function BitcoinAddressSendSuccess(props) {
  const [Contact, setContact] = useState(props.contact ? props.contact : {});
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    let contactName =
      Contact && Contact.firstName && Contact.lastName
        ? Contact.firstName + ' ' + Contact.lastName
        : Contact && Contact.firstName && !Contact.lastName
        ? Contact.firstName
        : Contact && !Contact.firstName && Contact.lastName
        ? Contact.lastName
        : '';
    setContactName(contactName);
  }, [Contact]);

  return (
    <View style={styles.modalContentContainer}>
      <View style={{ height: '100%' }}>
        <View
          style={{
            ...styles.successModalHeaderView,
            marginRight: wp('8%'),
            marginLeft: wp('8%'),
          }}
        >
          <Text style={styles.modalTitleText}>
            {'Bitcoin address &\ntrusted contact request sent'}
          </Text>
          <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
            Lorem ipsum dolor sit amet consetetur{'\n'}sadipscing elitr, sed
            diam nonumy eirmod
          </Text>
        </View>
        <View style={styles.box}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              style={styles.successModalAmountImage}
              source={require('../assets/images/icons/icon_wallet.png')}
            />
            <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue(11),
                      paddingTop: 5,
                      paddingBottom: 5,
                    }}
                  >
                   Request Sent to:
            </Text>
            <Text style={styles.successModalWalletNameText}>
              {contactName ? contactName : ''}
            </Text>
          </View>
        </View>
        <View>
          <View
            style={{
              marginLeft: wp('8%'),
              marginRight: wp('8%'),
            }}
          >
            <Text style={{ ...styles.modalInfoText }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,{'\n'}sed
              do eiusmod tempor incididunt ut labore et dolore
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'center',
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressAssociateContacts()}
            style={{ ...styles.successModalButtonView }}
          >
            <Text style={styles.proceedButtonText}>Associate Contact</Text>
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressSkip()}
            style={{
              height: wp('13%'),
              width: wp('35%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
              Skip
            </Text>
          </AppBottomSheetTouchableWrapper>
          <Image
            source={require('../assets/images/icons/accept.png')}
            style={styles.successModalImage}
          />
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
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp('5%'),
    marginLeft: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('2%'),
    marginBottom: hp('3%'),
    borderRadius: 10,
    justifyContent: 'center',
  },
  successModalHeaderView: {
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalAmountView: {
    marginRight: wp('10%'),
    marginLeft: wp('10%'),
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
  },
  successModalAmountImage: {
    width: wp('15%'),
    height: wp('15%'),
    marginRight: 15,
    marginLeft: 15,
    resizeMode: 'contain',
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(21),
    marginLeft: 5,
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
  },
  successModalAmountInfoView: {
    flex: 0.4,
    marginRight: wp('10%'),
    marginLeft: wp('10%'),
  },
  successModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp('8%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  successModalImage: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 'auto',
    resizeMode: 'contain',
  },
});
