import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function TransactionHelperModalContents(props) {
  const openLink = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={{ justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>Transaction</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: Colors.blue,
          marginBottom: wp('5%'),
        }}
        snapToInterval={hp('75%')}
        decelerationRate="fast"
      >
        <View
          style={{
            height: hp('75%'),
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginTop: wp('10%'),
              marginLeft: wp('7%'),
              marginRight: wp('7%'),
            }}
          >
            A transaction is identified by an alphanumeric string called the
            transaction ID, which acts as a permanent reference to your payment
            on the Bitcoin blockchain
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/bitcoin_transaction_id.png')}
              style={{
                width: wp('80%'),
                height: wp('65%'),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp('7%'),
              marginRight: wp('7%'),
            }}
          >
            You can search for your transaction on Bitcoin using blockchain
            explorers, which provide detailed information on the status and
            information associated with your transaction
          </Text>
          <View
            style={{
              borderStyle: 'dotted',
              borderWidth: 1,
              borderRadius: 1,
              borderColor: Colors.white,
              width: wp('70%'),
              height: 0,
              alignSelf: 'center',
              marginBottom: wp('1%'),
            }}
          />
        </View>
        <View
          style={{
            height: hp('75%'),
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginTop: wp('10%'),
              marginLeft: wp('7%'),
              marginRight: wp('7%'),
            }}
          >
            A transaction requires some time to confirm, and this delay is
            called the confirmation time. The confirmation time depends on the
            fees paid for the transaction, and on the structure of the
            transaction. For most transactions, six confirmations is taken as
            reference
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/confirmation_time.png')}
              style={{
                width: wp('80%'),
                height: wp('65%'),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp('7%'),
              marginRight: wp('7%'),
            }}
          >
            The fee paid for a transaction depends only on the transaction size,
            not on the transaction amount. This fee increases as the complexity
            of the transaction increases, which is why the Checking Account has
            lower fees compared to the Savings Account
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp('70%'),
                height: 0,
                marginBottom: wp('1%'),
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: hp('75%'),
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginTop: wp('10%'),
              marginLeft: wp('7%'),
              marginRight: wp('7%'),
            }}
          >
            A transaction that is not confirmed stays in the pool of unconfirmed
            transactions, called the mempool. The mempool is used by bitcoin
            miners to include transactions in blocks, and get mining fees
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../../assets/images/icons/transaction_confirmation.png')}
              style={{
                width: wp('80%'),
                height: wp('65%'),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp('7%'),
              marginRight: wp('7%'),
            }}
          >
            On average, the mempool is cleared every three to six hours. This
            means the maximum amount of time you need to wait for a transaction
            to be confirmed is six hours on most days
          </Text>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                width: wp('70%'),
                height: 0,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    // paddingBottom: hp('4%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(20),
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: 1,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginTop: 10,
    marginBottom: hp('1%'),
  },
});
