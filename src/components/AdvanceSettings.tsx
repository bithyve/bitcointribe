import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Linking } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import BottomInfoBox from './BottomInfoBox';

export default function AdvanceSettings(props) {
  const [PageData, setPageData] = useState([
    {
      title: 'Use Exit key',
      info: 'Lorem ipsum dolor sit amet, consectetur ',
      image: require('../assets/images/icons/icon_key.png'),
      type: 'UseExitKey',
    },
  ]);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.ooBackPress()}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View style={{ marginRight: 30}}>
            <Text style={styles.modalHeaderTitleText}>
              {'Advanced Settings'}
            </Text>
            <Text style={{ ...styles.infoText, marginRight: 20}}>
              {
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
              }
            </Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {PageData.map((item) => {
          return (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressAdvanceSetting(item.type)}
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
                <Text style={styles.infoText}>{item.info}</Text>
              </View>
              <View style={{ marginLeft: 'auto' }}>
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
              </View>
            </AppBottomSheetTouchableWrapper>
          );
        })}
      </ScrollView>
      <BottomInfoBox
        backgroundColor={Colors.white}
        title={'Note'}
        infoText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor1,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeaderTitleView: {
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
