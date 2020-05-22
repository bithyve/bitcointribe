import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import CommonStyles from '../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import ContactList from '../components/ContactList';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomInfoBox from './BottomInfoBox';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import DeviceInfo from 'react-native-device-info';

export default function NotificationListContent(props) {
  return props.NotificationData.length ? (
    <ScrollView style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row' }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View style={{ justifyContent: 'center' }}>
            <Text style={styles.modalHeaderTitleText}>{'Notifications'}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {props.NotificationData.map((value, index) => {
          return (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onNotificationClicked(value)}
              style={{
                paddingLeft: wp('7%'),
                paddingRight: wp('4%'),
                borderBottomWidth: 1,
                borderBottomColor: Colors.borderColor,
                paddingBottom: wp('4%'),
                paddingTop: wp('4%'),
                backgroundColor: value.read
                  ? Colors.white
                  : Colors.lightBlue,
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Image
                    source={
                      value.type == 'release'
                        ? require('../assets/images/icons/icon_hexa.png')
                        : require('../assets/images/icons/recieve.png')
                    }
                    style={{
                      width: wp('8%'),
                      height: wp('8%'),
                      marginRight: wp('2%'),
                    }}
                  />
                  <Text
                    style={{
                      color: Colors.blue,
                      fontSize: RFValue(13),
                      fontFamily: Fonts.FiraSansRegular,
                    }}
                  >
                    {value.title}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: 'auto',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: Colors.textColorGrey,
                      fontSize: RFValue(11),
                      fontFamily: Fonts.FiraSansRegular,
                      marginRight: wp('5%'),
                    }}
                  >
                    {value.time}
                  </Text>
                  {value.isMandatory ? (
                    <FontAwesome
                      name="star"
                      color={Colors.blue}
                      size={17}
                    />
                  ) : (
                      <View style={{ width: 17 }} />
                    )}
                </View>
              </View>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(11),
                  fontFamily: Fonts.FiraSansRegular,
                  paddingTop: wp('2%'),
                  marginLeft: 3,
                }}
              >
                {value.info}
              </Text>
            </AppBottomSheetTouchableWrapper>
          );
        })}
        {props.NotificationData.length <= 1 ? (
          <View
            style={{ backgroundColor: Colors.white, marginTop: 'auto' }}
          >
            <View
              style={{
                margin: 15,
                backgroundColor: Colors.backgroundColor,
                marginBottom:
                  Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
                padding: 10,
                paddingTop: 20,
                paddingBottom: 20,
                borderRadius: 7,
              }}
            >
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Notification Drawer
                  </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                All your recent notifications are visible here
                  </Text>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  ) : (
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row' }}>
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
            </AppBottomSheetTouchableWrapper>
            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.modalHeaderTitleText}>{'Notifications'}</Text>
            </View>
          </View>
        </View>
        {[1, 2, 3, 4,].map((value) => {
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: wp('5%'),
                paddingBottom: wp('5%'),
                borderBottomWidth: 0.5,
                marginBottom:
                  Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
                borderColor: Colors.borderColor,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: Colors.backgroundColor,
                    height: wp('5%'),
                    width: wp('5%'),
                    borderRadius: wp('5%') / 2,
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                />
                <View>
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColor,
                      height: wp('5%'),
                      width: wp('25%'),
                      borderRadius: 10,
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: Colors.backgroundColor,
                      height: wp('5%'),
                      width: wp('35%'),
                      marginTop: 5,
                      borderRadius: 10,
                    }}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: Colors.backgroundColor,
                    height: wp('7%'),
                    width: wp('20%'),
                    borderRadius: 10,
                  }}
                />
                <View
                  style={{
                    backgroundColor: Colors.backgroundColor,
                    height: wp('5%'),
                    width: wp('5%'),
                    borderRadius: wp('5%') / 2,
                    marginLeft: 10,
                    marginRight: 10,
                  }}
                />
              </View>
            </View>
          );
        })}

        <View style={{ backgroundColor: Colors.white, marginTop: 'auto' }}>
          <View
            style={{
              margin: 15,
              backgroundColor: Colors.backgroundColor,
              padding: 10,
              paddingTop: 20,
              paddingBottom: 20,
              marginBottom:
                Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
              borderRadius: 7,
            }}
          >
            <Text
              style={{
                color: Colors.black,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Notification Drawer
              </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              All your recent notifications are visible here
              </Text>
          </View>
        </View>
      </View>
    );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('2%'),
    paddingTop: hp('2%'),
    marginLeft: wp('4%'),
    marginRight: wp('4%'),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
});