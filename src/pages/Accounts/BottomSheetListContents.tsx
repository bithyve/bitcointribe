import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  FlatList
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

const renderSingleContact = ({ item, index }) => {
  return (
    <View style={{ flexDirection: 'column'}}>
      <TouchableOpacity>
        <View 
          style={{
            ...styles.textBoxView,
            flexDirection: 'row',
            marginTop: hp('1%'),
            justifyContent: 'center',
            backgroundColor: Colors.backgroundColor1
          }}>
          <Image style={{ ...styles.circleShapeView, margin: 10 }} source={require('../../assets/images/icons/icon_contact.png')} resizeMode="contain" />
          <View style={{ flex: 1, margin: 10, justifyContent: 'center' }}>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansRegular,
              }}>
              Sending to:
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(20),
                fontFamily: Fonts.FiraSansRegular,
              }}>
              {item.selectedContact.name || item.selectedContact.account_name || item.selectedContact.id}
            </Text>
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansRegular,
              }}>
                {`${item.bitcoinAmount} Sats`}
              {/* {switchOn ? `${item.bitcoinAmount} Sats` : '$'+`${currencyAmount}`} */}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', justifyContent: 'center', marginEnd: 20, marginStart: 20 }}>
            <Image style={{ width: 12, height: 12 }}
              source={require('../../assets/images/icons/icon_arrow_down.png')} resizeMode="contain"/>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default function BottomSheetListContents(props) {
  return (
    <View style={{ height: '100%', backgroundColor: Colors.white }}>
      <View
        style={{
          ...styles.successModalHeaderView,
          marginRight: wp('8%'),
          marginLeft: wp('8%'),
        }}
      >
        <Text style={styles.modalTitleText}>{props.title}</Text>
        <Text style={{ ...styles.modalInfoText, marginTop: wp('1%') }}>
          {props.info}
        </Text>
      </View>
      <View style={{ 
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: wp('8%'),
        marginLeft: wp('8%') }}>
        <FlatList
          nestedScrollEnabled={true}
          data={props.listData}
          renderItem={renderSingleContact}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 'auto',
          alignItems: 'center',
          marginBottom:
            Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp('1%') : 0,
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk()}
          style={{ ...styles.successModalButtonView }}
        >
          <Text style={styles.proceedButtonText}>{props.okButtonText}</Text>
        </AppBottomSheetTouchableWrapper>
        {props.isCancel && (
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressCancel()}
            style={{
              height: wp('13%'),
              width: wp('35%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ ...styles.proceedButtonText, color: Colors.blue }}>
              {props.cancelButtonText}
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}
        {(props.isSuccess || props.isUnSuccess) && (
          <Image
            style={{
              width: wp('25%'),
              height: hp('18%'),
              marginLeft: 'auto',
              resizeMode: 'cover',
            }}
            source={
              props.isSuccess
                ? require('../../assets/images/icons/sendSuccess.png')
                : require('../../assets/images/icons/sendError.png')
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.backgroundColor1,
    marginRight: wp('5%'),
    marginLeft: wp('5%'),
    marginBottom: hp('3%'),
    borderRadius: 10,
    justifyContent: 'center',
    padding: wp('5%'),
  },
  successModalHeaderView: {
    marginBottom: hp('1%'),
    marginTop: hp('1%'),
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
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  circleShapeView: {
    width: 62,
    height: 62,
    borderRadius: 62/2,
    borderColor: Colors.white,
    borderWidth: 2
  },
});
