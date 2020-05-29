import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { nameToInitials } from '../../common/CommonFunctions';

export default function RemoveSelectedTrasaction(props) {
  const contact = props.selectedContact;
  const [Contact, setContact] = useState(contact ? contact.selectedContact : {});

  console.log("Contact", Contact)
  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View>
        <View
          style={{
            ...styles.successModalHeaderView,
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
          }}
        >
          <Text style={styles.modalTitleText}>Remove Transaction</Text>
          <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
            Lorem ipsum dolor sit amet, consectetur
          </Text>
        </View>
        <View style={styles.contactProfileView}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                backgroundColor: Colors.backgroundColor1,
                height: 90,
                position: 'relative',
                borderRadius: 10,
              }}
            >
              <View style={{ marginLeft: 70 }}>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                    fontSize: RFValue(11),
                    marginLeft: 25,
                    paddingTop: 5,
                    paddingBottom: 3,
                  }}
                >
                  Sending to:
                </Text>
                <Text style={styles.contactNameText}>
                {Contact.name ||
            Contact.account_name ||
            Contact.id}
                </Text>
                {contact.hasOwnProperty("bitcoinAmount") || contact.hasOwnProperty("currencyAmount") ? (
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontFamily: Fonts.FiraSansRegular,
                      fontSize: RFValue(10),
                      marginLeft: 25,
                      paddingTop: 3,
                    }}
                  >
                    {contact.bitcoinAmount ? contact.bitcoinAmount + ' Sats' : '$ ' + contact.currencyAmount ? contact.currencyAmount : ''}
                  </Text>
                ) : null}
              </View>
            </View>
            {Contact.imageAvailable ? (
              <View
                style={{
                  position: 'absolute',
                  marginLeft: 15,
                  marginRight: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowOpacity: 1,
                  shadowOffset: { width: 2, height: 2 },
                }}
              >
                <Image
                  source={Contact.image}
                  style={{ ...styles.contactProfileImage }}
                />
              </View>
            ) : (<View
                style={{
                  position: 'absolute',
                  marginLeft: 15,
                  marginRight: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.backgroundColor,
                  width: 70,
                  height: 70,
                  borderRadius: 70 / 2,
                  shadowColor: Colors.shadowBlue,
                  shadowOpacity: 1,
                  shadowOffset: { width: 2, height: 2 },
                }}
              > 
              {Contact && Contact.name ? (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: RFValue(20),
                    lineHeight: RFValue(20), //... One for top and one for bottom alignment
                  }}
                >
                  {nameToInitials(
                    Contact.firstName && Contact.lastName
                      ? Contact.firstName + ' ' + Contact.lastName
                      : Contact.firstName && !Contact.lastName
                      ? Contact.firstName
                      : !Contact.firstName && Contact.lastName
                      ? Contact.lastName
                      : '',
                  )}
                </Text>) : (<Image
                source={require('../../assets/images/icons/icon_user.png')}
                style={styles.contactProfileImage}
              />)}
            </View> 
            )}
          </View>
        </View>

        <View
          style={{
            marginTop: hp('3%'),
            marginBottom: hp('3%'),
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
          }}
        >
          <Text style={{ ...styles.modalInfoText }}>
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore'
            }
          </Text>
        </View>

        
        <View
          style={{
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'center',
            marginBottom: hp('2%')
          }}
        >
          <AppBottomSheetTouchableWrapper
            disabled={props.loading}
            onPress={() => {
              props.onPressDone();
            }}
            style={{ ...styles.successModalButtonView }}
          >
            {props.loading && props.loading == true ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.proceedButtonText}>Remove</Text>
            )}
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            disabled={props.loading}
            onPress={() => props.onPressBack()}
            style={{
              height: wp('13%'),
              width: wp('35%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
            Back
            </Text>
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
      alignSelf: 'center',
      width: '100%',
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
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
  },
  successModalAmountImage: {
    width: wp('15%'),
    height: wp('15%'),
    marginRight: 15,
    marginLeft: 10,
    marginBottom: wp('1%'),
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
  separator: {
    height: 2,
    marginLeft: wp('2%'),
    marginRight: wp('2%'),
    backgroundColor: Colors.borderColor,
  },
  contactProfileView: {
    flexDirection: 'row',
    marginRight: wp('6%'),
    marginLeft: wp('6%'),
    alignItems: 'center',
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
});
