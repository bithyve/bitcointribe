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

function RecipientComponent(props) {
  return (
    <TouchableOpacity
      onPress={() => props.onPressElement()}
      activeOpacity={10}
      style={{
        marginRight: wp('6%'),
        marginLeft: wp('6%'),
        borderRadius: 10,
        marginTop: hp('1.7%'),
        height:
          props.SelectedContactId == props.item.selectedContact.id
            ? wp('50%')
            : wp('25%'),
        backgroundColor: Colors.backgroundColor1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: wp('25%'),
        }}
      >
        <View style={{ marginLeft: 10 }}>
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
                    fontSize: RFValue(20),
                    lineHeight: RFValue(20), //... One for top and one for bottom alignment
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
                <Image
                  source={require('../../assets/images/icons/icon_user.png')}
                  style={styles.circleShapeView}
                />
              )}
            </View>
          )}
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(11),
              paddingTop: 5,
              paddingBottom: 3,
            }}
          >
            Sending to:
          </Text>
          <Text style={styles.contactNameText}>
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
                fontSize: RFValue(10),
                paddingTop: 3,
              }}
            >
              {props.item.bitcoinAmount
                ? props.item.bitcoinAmount + ' Sats'
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
          color={Colors.borderColor}
        />
      </View>
      {props.SelectedContactId == props.item.selectedContact.id && (
        <View
          style={{
            height: wp('25%'),
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              height: wp('17%'),
              width: wp('78%'),
              padding: wp('4%'),
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
    color: Colors.textColorGrey,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
});
export default memo(RecipientComponent);
