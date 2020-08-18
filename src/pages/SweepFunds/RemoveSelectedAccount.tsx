import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import AccountComponent from './AccountComponent';
import { ScrollView } from 'react-native-gesture-handler';

export default function RemoveSelectedAccount(props) {
  const [SelectedContactId, setSelectedContactId] = useState(0);
  const accountInfo = props.selectedAccount ? props.selectedAccount : {};
  console.log("props.accountInfo", props.accountInfo);
  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View
          style={{
            ...styles.successModalHeaderView,
            marginRight: wp('6%'),
            marginLeft: wp('6%'),
          }}
        >
          <Text style={styles.modalTitleText}>Remove Recipient</Text>
          <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
          This will remove the recipient form Send
          </Text>
        </View>
        <ScrollView>
        <AccountComponent 
          item={accountInfo}
          
          SelectedContactId={SelectedContactId}
        />
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'center',
            marginBottom: hp('2%'),
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
  circleShapeView: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('20%') / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  contactNameText: {
    color: Colors.black,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
});
