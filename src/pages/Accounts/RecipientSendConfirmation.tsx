import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { nameToInitials } from '../../common/CommonFunctions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TEST_ACCOUNT } from '../../common/constants/serviceTypes';

function RecipientSendConfirmation(props) {
  return (
    <TouchableOpacity
      onPress={() => props.onPressElement()}
      activeOpacity={10}
      style={{
        flex: 1,
        marginRight: wp('6%'),
        marginLeft: wp('6%'),
        borderRadius: 10,
        marginTop: hp('1.2%'),
        // height:
        //   props.SelectedContactId == props.item.selectedContact.id
        //     ? wp('50%')
        //     : wp('25%'),
        backgroundColor: Colors.shadowBlue,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 5,
          // height: wp('25%'),
        }}
      >
        <View style={{ marginLeft: 10, marginRight: 10 }}>
          {props.item.selectedContact.imageAvailable ? (
            <Image
              source={props.item.selectedContact.image}
              style={styles.circleShapeView}
            />
          ) : (
            <View
              style={{
                ...styles.circleShapeView,
                backgroundColor: Colors.shadowBlue,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {props.item.selectedContact && props.item.selectedContact.name ? (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: RFValue(12),
                    lineHeight: RFValue(12), //... One for top and one for bottom alignment
                  }}
                >
                  {nameToInitials(
                    props.item.selectedContact.firstName &&
                      props.item.selectedContact.lastName
                      ? props.item.selectedContact.firstName +
                          ' ' +
                          props.item.selectedContact.lastName
                      : props.item.selectedContact.firstName &&
                        !props.item.selectedContact.lastName
                      ? props.item.selectedContact.firstName
                      : !props.item.selectedContact.firstName &&
                        props.item.selectedContact.lastName
                      ? props.item.selectedContact.lastName
                      : '',
                  )}
                </Text>
              ) : (
                props.item && props.item.selectedContact.id ? 
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: RFValue(12),
                  lineHeight: RFValue(12), //... One for top and one for bottom alignment
                }}
              >@</Text> :
                <Image
                  source={require('../../assets/images/icons/icon_user.png')}
                  style={styles.circleShapeView}
                />
              )}
            </View>
          )}
        </View>
        <View style={{ marginRight: 20, flexDirection: 'row' }}>
          {/* <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(11),
              paddingTop: 5,
              paddingBottom: 3,
            }}
          >
            Sending to:
          </Text> */}
          <Text style={styles.contactNameText} numberOfLines={1}>
            {props.item.selectedContact.name ||
              props.item.selectedContact.account_name ||
              props.item.selectedContact.id}
          </Text>
          {props.item.hasOwnProperty('bitcoinAmount') ||
          props.item.hasOwnProperty('currencyAmount') ? (
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansMediumItalic,
                fontSize: RFValue(12),
                textAlign: 'center',
                // paddingTop: 3,
              }}
            >
              {props.item.bitcoinAmount
                ? `${props.item.bitcoinAmount}` + `${props.serviceType == TEST_ACCOUNT ? ' t-sats' : ' sats'}`
                : '$ ' + props.item.currencyAmount
                ? props.item.currencyAmount
                : ''}
            </Text>
          ) : null}
        </View>
        <Ionicons
          style={{ marginLeft: 'auto', marginRight: 10 }}
          name={
            props.SelectedContactId == props.item.selectedContact.id
              ? 'ios-arrow-up'
              : 'ios-arrow-down'
          }
          size={20}
          color={Colors.blue}
        />
      </View>
      {props.SelectedContactId == props.item.selectedContact.id && (
        <View
          style={{
            height: wp('20%'),
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: wp('15%'),
              width: wp('78%'),
              paddingHorizontal: wp('4%'),
              paddingVertical: wp('2%'),
              alignSelf: 'center',
              backgroundColor: Colors.white,
            }}
          >
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
              }}
            >
              Note
            </Text>
            <Text
              numberOfLines={1}
              style={{
                width: wp('70%'),
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12),
                marginTop: 5,
              }}
            >
              {props.item.note}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circleShapeView: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('8%') / 2,
    borderColor: Colors.white,
    borderWidth: 1,
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
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    width: wp('45%'),
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
});
export default memo(RecipientSendConfirmation);
