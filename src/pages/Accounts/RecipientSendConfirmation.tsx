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
import { useSelector } from 'react-redux';
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
  const currencyCode = useSelector((state) => state.preferences.currencyCode);
  const currencyToggleValue = useSelector(
    (state) => state.preferences.currencyToggleValue,
  );

  const getCorrectAmountCurrency = () => {
    const switchOn = currencyToggleValue ? true : false;
    if (!switchOn) {
      return (
        props.item.currencyAmount &&
        props.item.currencyAmount + ' ' + currencyCode.toLocaleLowerCase()
      );
    } else {
      return (
        props.item.bitcoinAmount &&
        props.item.bitcoinAmount +
        (props.serviceType == TEST_ACCOUNT ? ' t-sats' : ' sats')
      );
    }
  };
  const { item } = props;
  return (
    <TouchableOpacity
      // onPress={() => props.onPressElement()}
      activeOpacity={10}
    >
      <View
        style={{
          marginRight: 20,
          justifyContent: 'center',
          alignItems: 'center',
          width: wp('15%'),
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {item.selectedContact && item.selectedContact.account_name ? (
            <Image
              source={
                item.selectedContact.account_name === 'Checking Account'
                  ? require('../../assets/images/icons/icon_regular.png')
                  : item.selectedContact.account_name === 'Savings Account'
                    ? require('../../assets/images/icons/icon_secureaccount.png')
                    : item.selectedContact.account_name === 'Test Account'
                      ? require('../../assets/images/icons/icon_test_white.png')
                      : item.selectedContact.account_name === 'Donation Account'
                        ? require('../../assets/images/icons/icon_donation_account.png')
                        : require('../../assets/images/icons/icon_user.png')
              }
              style={styles.circleShapeView}
            />
          ) : item.selectedContact.image ? (
            <Image
              source={item.selectedContact.image}
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
                  {item.selectedContact &&
                    item.selectedContact.firstName ? (
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 13,
                          lineHeight: 13, //... One for top and one for bottom alignment
                        }}
                      >
                        {item && item.selectedContact
                          ? nameToInitials(
                            item.selectedContact.firstName === 'F&F request' && item.selectedContact.contactsWalletName !== undefined && item.selectedContact.contactsWalletName !== ""
                              ? `${item.selectedContact.contactsWalletName}'s wallet`
                              : item.selectedContact.firstName &&
                                item.selectedContact.lastName
                                ? item.selectedContact.firstName +
                                ' ' +
                                item.selectedContact.lastName
                                : item.selectedContact.firstName &&
                                  !item.selectedContact.lastName
                                  ? item.selectedContact.firstName
                                  : !item.selectedContact.firstName &&
                                    item.selectedContact.lastName
                                    ? item.selectedContact.lastName
                                    : '',
                          )
                          : ''}
                      </Text>
                    ) : item &&
                      item.selectedContact &&
                      item.selectedContact.id ? (
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: 18,
                            lineHeight: 18, //... One for top and one for bottom alignment
                          }}
                        >
                          @
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
        <Text style={styles.name} numberOfLines={1}>
          {item.selectedContact.firstName === 'F&F request' && item.selectedContact.contactsWalletName !== undefined && item.selectedContact.contactsWalletName !== ""
            ? `${item.selectedContact.contactsWalletName}'s wallet`
            : item.selectedContact.name ||
            item.selectedContact.account_name ||
            item.selectedContact.id}
        </Text>
        <Text style={styles.amountText}>{getCorrectAmountCurrency()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circleShapeView: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('14%') / 2,
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
  name: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    marginTop: 5,
    width: wp('15%'),
  },
  amountText: {
    color: Colors.blue,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
});
export default memo(RecipientSendConfirmation);
