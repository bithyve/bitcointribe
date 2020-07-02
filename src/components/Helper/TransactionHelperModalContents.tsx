import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
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
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.log("Don't know how to open URI: " + url);
          }
        })
    }

  return (
    <ScrollView
        style={styles.modalContainer}
        snapToInterval={hp('89%')}
        decelerationRate='fast'
    >
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingBottom: hp('6%')}}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    style={{
                        color: Colors.white,
                        fontFamily: Fonts.FiraSansMedium,
                        fontSize: RFValue(20),
                        marginTop: hp('1%'),
                        marginBottom: hp('1%'),
                    }}
                >
                    Transaction
                </Text>
            </View>
            <View
                style={{
                backgroundColor: Colors.homepageButtonColor,
                height: 1,
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                marginTop: 10,
                marginBottom: hp('1%'),
                }}
            />
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                A transaction is identified by an alphanumeric{'\n'}string called the transaction ID, which acts as a{'\n'}permanent reference to your payment on the{'\n'}Bitcoin blockchain
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/bitcoin_transaction_id.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                You can search for your transaction on Bitcoin{'\n'}using blockchain explorers, which provide{'\n'}detailed information on the status and{'\n'}information associated with your transaction
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View
                    style={{
                        borderStyle: 'dotted',
                        borderWidth: 1,
                        borderRadius: 1,
                        borderColor: Colors.white,
                        width: wp('70%'),
                        height: 0,
                    }}
                />
            </View>
        </View>
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('6%')}}>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                A transaction requires some time to confirm,{'\n'}and this delay is called the confirmation time.{'\n'}The confirmation time depends on the fees{'\n'}paid for the transaction, and on the structure{'\n'}of the transaction. For most transactions, six{'\n'}confirmations is taken as reference
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/confirmation_time.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                The fee paid for a transaction depends only on{'\n'}the transaction size, not on the transaction{'\n'}amount. This fee increases as the complexity{'\n'}of the transaction increases, which is why the{'\n'}Checking Account has lower fees compared to{'\n'}the Savings Account
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View
                    style={{
                        borderStyle: 'dotted',
                        borderWidth: 1,
                        borderRadius: 1,
                        borderColor: Colors.white,
                        width: wp('70%'),
                        height: 0,
                    }}
                />
            </View>
        </View>
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('6%')}}>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                A transaction that is not confirmed stays in the{'\n'}pool of unconfirmed transactions, called the{'\n'}mempool. The mempool is used by bitcoin{'\n'}miners to include transactions in blocks, and{'\n'}get mining fees
                {/* How quickly the miners pick up your{'\n'}transaction from the mempool depends on the{'\n'}fee associated with it */}
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/transaction_confirmation.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                On average, the mempool is cleared every{'\n'}three to six hours. This means the maximum{'\n'}amount of time you need to wait for a{'\n'}transaction to be confirmed is six hours on most{'\n'}days
                {/* How quickly the miners pick up your{'\n'}transaction from the mempool depends on the{'\n'}fee associated with it */}
            </Text>
            {/* <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                If the transaction takes time to confirm, you{'\n'}may increase the fee paid by RBF or Replace-{'\n'}By-Fee. This provides additional incentive for{'\n'}the miner to mine your transaction
                {How quickly the miners pick up your{'\n'}transaction from the mempool depends on the{'\n'}fee associated with it}
            </Text> */}
        </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: hp('5%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});