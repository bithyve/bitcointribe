import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import DeviceInfo from 'react-native-device-info';

export default function NotificationListContent(props) {

  return (
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
      <ScrollView style={{ height: 'auto'}}>
        <View style={{ flex: 1 }}>
          {props.notificationLoading
            ? [1, 2, 3, 4, 5].map((value) => {
                return (
                  <View key={value} style={styles.EmptyListLoaderView}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View style={styles.EmptyListLoaderCircle} />
                      <View>
                        <View style={styles.EmptyListLoaderSmallText} />
                        <View style={styles.EmptyListLoaderLargeText} />
                      </View>
                    </View>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View style={styles.EmptyListLoaderInfoText} />
                      <View style={styles.EmptyListLoaderLargeCircle} />
                    </View>
                  </View>
                );
              })
            : props.NotificationData.map((value, index) => {
                return (
                  <AppBottomSheetTouchableWrapper
                    key={index}
                    onPress={() => props.onNotificationClicked(value)}
                    style={{
                      ...styles.notificationElement,
                      backgroundColor: value.read
                        ? Colors.white
                        : Colors.shadowBlue,
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
                              : require('../assets/images/icons/icon_receive.png')
                          }
                          style={styles.notificationElementImage}
                        />
                        <Text style={styles.notificationElementTitle}>
                          {value.title}
                        </Text>
                      </View>
                      <View style={styles.notificationElementInfoView}>
                        <Text style={styles.notificationElementTimeText}>
                          {value.time}
                        </Text>
                        {value.isMandatory ? (
                          <FontAwesome
                            name="star"
                            color={Colors.yellow}
                            size={17}
                          />
                        ) : (
                          <View style={{ width: 17 }} />
                        )}
                      </View>
                    </View>
                    <Text style={styles.notificationElementInfoText}>
                      {value.info}
                    </Text>
                  </AppBottomSheetTouchableWrapper>
                );
              })}
        </View>
      </ScrollView>
      {props.NotificationData.length <= 1 ? (
            <View style={{ backgroundColor: Colors.white, marginTop: 'auto' }}>
              <View style={styles.waterMarkInfoBoxView}>
                <Text style={styles.waterMarkInfoBoxTitle}>
                  No notification yet
                </Text>
                <Text style={styles.waterMarkInfoBoxInfo}>
                  All your recent notifications will be visible here
                </Text>
              </View>
            </View>
          ) : null}
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
  notificationElement: {
    paddingLeft: wp('7%'),
    paddingRight: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    paddingBottom: wp('4%'),
    paddingTop: wp('4%'),
  },
  notificationElementImage: {
    width: wp('8%'),
    height: wp('8%'),
    marginRight: wp('2%'),
  },
  notificationElementTitle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  notificationElementInfoView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
  },
  notificationElementTimeText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: wp('5%'),
  },
  notificationElementInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    paddingTop: wp('2%'),
    marginLeft: 3,
  },
  waterMarkInfoBoxView: {
    margin: 15,
    backgroundColor: Colors.backgroundColor,
    marginBottom: Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 7,
  },
  waterMarkInfoBoxTitle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  waterMarkInfoBoxInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
  EmptyListLoaderView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: wp('5%'),
    paddingBottom: wp('5%'),
    borderBottomWidth: 0.5,
    marginBottom: Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
    borderColor: Colors.borderColor,
  },
  EmptyListLoaderCircle: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('5%'),
    borderRadius: wp('5%') / 2,
    marginLeft: 10,
    marginRight: 10,
  },
  EmptyListLoaderSmallText: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('25%'),
    borderRadius: 10,
  },
  EmptyListLoaderLargeText: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('35%'),
    marginTop: 5,
    borderRadius: 10,
  },
  EmptyListLoaderInfoText: {
    backgroundColor: Colors.backgroundColor,
    height: wp('7%'),
    width: wp('20%'),
    borderRadius: 10,
  },
  EmptyListLoaderLargeCircle: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('5%'),
    borderRadius: wp('5%') / 2,
    marginLeft: 10,
    marginRight: 10,
  },
  infoBoxView: {
    margin: 15,
    backgroundColor: Colors.backgroundColor,
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
    borderRadius: 7,
  },
  infoBoxTitle: {
    color: Colors.black,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  infoBoxInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
});
